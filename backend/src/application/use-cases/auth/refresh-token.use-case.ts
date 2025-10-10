/**
 * Application Layer - Refresh Token Use Case
 * Handles token refresh
 */

import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  IUserRepository,
} from '@domain/repositories/user.repository.interface';
import { RefreshTokenDto } from '@application/dtos/auth/refresh-token.dto';
import { AuthResponseDto } from '@application/dtos/auth/auth-response.dto';
import { JwtService } from '@infrastructure/services/jwt.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verifyRefreshToken(dto.refreshToken);

      // Get user with role
      const result = await this.userRepository.findByIdWithRole(payload.sub);
      if (!result) {
        throw new UnauthorizedException('User not found');
      }

      const { user, role } = result;

      // Check if user is still active
      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Generate new tokens
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
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
