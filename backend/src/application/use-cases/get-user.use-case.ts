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
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return this.toDto(user);
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
