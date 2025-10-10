/**
 * Infrastructure Layer - Auth Module
 * Wires authentication dependencies
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '@presentation/controllers/auth.controller';
import { RegisterUseCase } from '@application/use-cases/auth/register.use-case';
import { LoginUseCase } from '@application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/auth/refresh-token.use-case';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { PermissionRepository } from '../repositories/permission.repository';
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface';
import { ROLE_REPOSITORY } from '@domain/repositories/role.repository.interface';
import { PERMISSION_REPOSITORY } from '@domain/repositories/permission.repository.interface';
import { CryptoService } from '../services/crypto.service';
import { JwtService as CustomJwtService } from '../services/jwt.service';
import { SanitizationService } from '../services/sanitization.service';
import { JwtStrategy } from '@presentation/strategies/jwt.strategy';
import { JwtAuthGuard } from '@presentation/guards/jwt-auth.guard';
import { RolesGuard } from '@presentation/guards/roles.guard';
import { DatabaseModule } from '../config/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: (() => {
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET environment variable is required but not set.');
        }
        return process.env.JWT_SECRET;
      })(),
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Repositories
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: ROLE_REPOSITORY, useClass: RoleRepository },
    { provide: PERMISSION_REPOSITORY, useClass: PermissionRepository },

    // Services
    CryptoService,
    CustomJwtService,
    SanitizationService,

    // Use Cases
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,

    // Strategy & Guards
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [JwtAuthGuard, RolesGuard, CustomJwtService],
})
export class AuthModule {}
