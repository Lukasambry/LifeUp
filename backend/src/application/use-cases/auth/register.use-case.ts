/**
 * Application Layer - Register Use Case
 * Handles user registration with role assignment
 */

import { Injectable, Inject, ConflictException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '@domain/repositories/user.repository.interface';
import {
  ROLE_REPOSITORY,
  IRoleRepository,
} from '@domain/repositories/role.repository.interface';
import { User } from '@domain/entities/user.entity';
import { RoleType } from '@domain/entities/role.entity';
import { RegisterDto } from '@application/dtos/auth/register.dto';
import { AuthResponseDto } from '@application/dtos/auth/auth-response.dto';
import { CryptoService } from '@infrastructure/services/crypto.service';
import { JwtService } from '@infrastructure/services/jwt.service';
import { SanitizationService } from '@infrastructure/services/sanitization.service';
import { randomBytes } from 'crypto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly sanitizationService: SanitizationService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResponseDto> {
    // Sanitize and normalize inputs
    const sanitizedName = this.sanitizationService.sanitizeString(dto.name);
    const normalizedEmail = this.sanitizationService.normalizeEmail(dto.email);

    // Check if user already exists
    const existingUser = await this.userRepository.existsByEmail(
      normalizedEmail,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Get CLIENT role (default for new registrations)
    const clientRole = await this.roleRepository.findByType(RoleType.CLIENT);
    if (!clientRole) {
      throw new Error('CLIENT role not found in database');
    }

    // Hash password
    const hashedPassword = await this.cryptoService.hashPassword(dto.password);

    // Create user entity
    const user = User.create({
      id: this.generateId(),
      email: normalizedEmail,
      name: sanitizedName,
      password: hashedPassword,
      roleId: clientRole.id,
      isPremium: false,
      isActive: true,
    });

    // Save user
    const savedUser = await this.userRepository.create(user);

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair({
      sub: savedUser.id,
      email: savedUser.email,
      roleId: savedUser.roleId,
      roleType: clientRole.type,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: {
          id: clientRole.id,
          name: clientRole.name,
          type: clientRole.type,
        },
        isPremium: savedUser.isPremium,
        isActive: savedUser.isActive,
      },
    };
  }

  private generateId(): string {
    return randomBytes(16).toString('hex');
  }
}
