import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma';
import { RedisService } from '../redis';
import { MailService } from '../mail';

jest.mock('bcrypt');

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockJwt = {
  signAsync: jest.fn(),
  verify: jest.fn(),
};

const mockConfig = {
  get: jest.fn((key: string) => {
    const map: Record<string, string> = {
      JWT_SECRET: 'test-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      NODE_ENV: 'test',
    };
    return map[key];
  }),
};

const mockMail = {
  sendPasswordReset: jest.fn().mockResolvedValue(undefined),
  sendMagicLink: jest.fn().mockResolvedValue(undefined),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: MailService, useValue: mockMail },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto = { email: 'test@example.com', username: 'testuser', password: 'MyP@ssw0rd123' };

    it('should register a new user and return tokens', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'uuid-1',
        email: dto.email,
        username: dto.username,
        level: 1,
        createdAt: new Date(),
      });
      mockJwt.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
      mockRedis.set.mockResolvedValue(undefined);

      const result = await service.register(dto);

      expect(result.user.email).toBe(dto.email);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ email: dto.email, username: 'other' });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if username already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ email: 'other@test.com', username: dto.username });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });


  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'MyP@ssw0rd123' };
    const mockUser = {
      id: 'uuid-1',
      email: dto.email,
      username: 'testuser',
      passwordHash: 'hashed_password',
      level: 1,
      class: null,
      deletedAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    };

    it('should login and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwt.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
      mockRedis.set.mockResolvedValue(undefined);

      const result = await service.login(dto);

      expect(result.user.email).toBe(dto.email);
      expect(result.accessToken).toBe('access-token');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockPrisma.user.update.mockResolvedValue({});

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if account is locked', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        lockedUntil: new Date(Date.now() + 600_000),
      });

      await expect(service.login(dto)).rejects.toThrow(/Account locked/);
    });

    it('should lock account after 5 failed attempts', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        failedLoginAttempts: 4,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockPrisma.user.update.mockResolvedValue({});

      await expect(service.login(dto)).rejects.toThrow(/Account locked/);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 5,
            lockedUntil: expect.any(Date),
          }),
        }),
      );
    });

    it('should reset failed attempts on successful login', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        failedLoginAttempts: 3,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.user.update.mockResolvedValue({});
      mockJwt.signAsync.mockResolvedValueOnce('at').mockResolvedValueOnce('rt');
      mockRedis.set.mockResolvedValue(undefined);

      await service.login(dto);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { failedLoginAttempts: 0, lockedUntil: null },
        }),
      );
    });
  });

  describe('logout', () => {
    it('should delete refresh token from Redis', async () => {
      mockRedis.del.mockResolvedValue(undefined);

      const result = await service.logout('uuid-1', 'some-refresh-token');

      expect(mockRedis.del).toHaveBeenCalledWith('refresh:uuid-1:some-refresh-token');
      expect(result.message).toBe('Logged out successfully');
    });
  });


  describe('refresh', () => {
    it('should rotate tokens when refresh token is valid', async () => {
      const payload = { sub: 'uuid-1', email: 'test@example.com', username: 'testuser' };
      mockJwt.verify.mockReturnValue(payload);
      mockRedis.get.mockResolvedValue('valid');
      mockRedis.del.mockResolvedValue(undefined);
      mockRedis.set.mockResolvedValue(undefined);
      mockJwt.signAsync.mockResolvedValueOnce('new-access').mockResolvedValueOnce('new-refresh');

      const result = await service.refresh('old-refresh-token');

      expect(result.accessToken).toBe('new-access');
      expect(result.refreshToken).toBe('new-refresh');
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('should throw if refresh token is revoked', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'uuid-1', email: 'a@b.com', username: 'u' });
      mockRedis.get.mockResolvedValue(null);

      await expect(service.refresh('revoked-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should return success even if email does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result.message).toContain('If the email exists');
    });

    it('should create a reset token in Redis and send email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uuid-1', deletedAt: null });
      mockRedis.set.mockResolvedValue(undefined);

      await service.forgotPassword('test@example.com');

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('reset:'),
        'uuid-1',
        900,
      );
      expect(mockMail.sendPasswordReset).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String),
      );
    });

    it('should NOT send email if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await service.forgotPassword('ghost@example.com');

      expect(mockMail.sendPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      mockRedis.get.mockResolvedValue('uuid-1');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      mockPrisma.user.update.mockResolvedValue({});
      mockRedis.del.mockResolvedValue(undefined);

      const result = await service.resetPassword('valid-token', 'NewP@ssw0rd123');

      expect(result.message).toBe('Password reset successfully');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: 'new_hashed_password',
            failedLoginAttempts: 0,
            lockedUntil: null,
          }),
        }),
      );
      expect(mockRedis.del).toHaveBeenCalledWith('reset:valid-token');
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(service.resetPassword('invalid-token', 'NewP@ssw0rd123'))
        .rejects.toThrow(BadRequestException);
    });
  });
});
