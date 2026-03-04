import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/index';
import { RedisService } from '../redis/index';
import { RegisterDto, LoginDto } from './dto/index';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const RESET_TOKEN_EXPIRY_SECONDS = 15 * 60;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

interface TokenPayload {
  sub: string;
  email: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existing) {
      const field = existing.email === dto.email ? 'email' : 'username';
      throw new ConflictException(`${field} already in use`);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        passwordChangedAt: new Date(),
        stats: { create: {} },
        wallet: { create: {} },
      },
      select: {
        id: true,
        email: true,
        username: true,
        level: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60_000,
      );
      throw new UnauthorizedException(
        `Account locked. Try again in ${minutesLeft} minute(s).`,
      );
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      const attempts = user.failedLoginAttempts + 1;
      const updateData: Record<string, unknown> = {
        failedLoginAttempts: attempts,
      };

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60_000,
        );
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      const remaining = MAX_FAILED_ATTEMPTS - attempts;
      if (remaining > 0) {
        throw new UnauthorizedException(
          `Invalid credentials. ${remaining} attempt(s) remaining.`,
        );
      }
      throw new UnauthorizedException(
        `Account locked for ${LOCKOUT_DURATION_MINUTES} minutes after ${MAX_FAILED_ATTEMPTS} failed attempts.`,
      );
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        level: user.level,
        class: user.class,
      },
      ...tokens,
    };
  }

  async logout(userId: string, refreshToken: string) {
    await this.redis.del(`refresh:${userId}:${refreshToken}`);
    return { message: 'Logged out successfully' };
  }

  async refresh(refreshToken: string) {
    let payload: TokenPayload;
    try {
      payload = this.jwt.verify<TokenPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const stored = await this.redis.get(
      `refresh:${payload.sub}:${refreshToken}`,
    );
    if (!stored) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    await this.redis.del(`refresh:${payload.sub}:${refreshToken}`);

    return this.generateTokens({
      sub: payload.sub,
      email: payload.email,
      username: payload.username,
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || user.deletedAt) {
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const token = randomBytes(32).toString('hex');
    await this.redis.set(
      `reset:${token}`,
      user.id,
      RESET_TOKEN_EXPIRY_SECONDS,
    );

    if (this.config.get('NODE_ENV') === 'development') {
      console.log(`[DEV] Password reset token for ${email}: ${token}`);
    }

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const userId = await this.redis.get(`reset:${token}`);
    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await this.redis.del(`reset:${token}`);

    return { message: 'Password reset successfully' };
  }


  private async generateTokens(payload: TokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: ACCESS_TOKEN_EXPIRY,
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: REFRESH_TOKEN_EXPIRY,
      }),
    ]);

    await this.redis.set(
      `refresh:${payload.sub}:${refreshToken}`,
      'valid',
      7 * 24 * 60 * 60,
    );

    return { accessToken, refreshToken };
  }
}
