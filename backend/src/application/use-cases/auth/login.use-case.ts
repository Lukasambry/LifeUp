/**
 * Application Layer - Login Use Case
 * Handles user authentication
 */

import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '@domain/repositories/user.repository.interface';
import { LoginDto } from '@application/dtos/auth/login.dto';
import { AuthResponseDto } from '@application/dtos/auth/auth-response.dto';
import { CryptoService } from '@infrastructure/services/crypto.service';
import { JwtService } from '@infrastructure/services/jwt.service';
import { SanitizationService } from '@infrastructure/services/sanitization.service';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly sanitizationService: SanitizationService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    // Normalize email
    const normalizedEmail = this.sanitizationService.normalizeEmail(dto.email);

    // Find user with role
    const result = await this.userRepository.findByEmailWithRole(
      normalizedEmail,
    );
    if (!result) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { user, role } = result;

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await this.cryptoService.comparePassword(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair({
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleType: role.type,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: {
          id: role.id,
          name: role.name,
          type: role.type,
        },
        isPremium: user.isPremium,
        isActive: user.isActive,
      },
    };
  }
}
