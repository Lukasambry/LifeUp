/**
 * Infrastructure Layer - User Module
 * Wires together all layers for the user feature
 */

import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface';
import { ROLE_REPOSITORY } from '@domain/repositories/role.repository.interface';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { CreateUserUseCase } from '@application/use-cases/create-user.use-case';
import { GetUserUseCase } from '@application/use-cases/get-user.use-case';
import { ListUsersUseCase } from '@application/use-cases/list-users.use-case';
import { UserController } from '@presentation/controllers/user.controller';
import { CryptoService } from '../services/crypto.service';
import { SanitizationService } from '../services/sanitization.service';
import { DatabaseModule } from '../config/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
    CryptoService,
    SanitizationService,
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
