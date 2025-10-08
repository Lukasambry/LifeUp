/**
 * Application Layer - Use Case
 */

import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface';
import { UserResponseDto } from '../dtos/user-response.dto';
import { User } from '@domain/entities/user.entity';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map(this.toDto);
  }

  private toDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
