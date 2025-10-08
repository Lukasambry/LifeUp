/**
 * Application Layer - Use Case
 * Orchestrates business logic, depends only on domain layer
 */

import { Inject, Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@domain/repositories/user.repository.interface';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create domain entity
    const user = User.create({
      id: this.generateId(),
      email: dto.email,
      name: dto.name,
      password: await this.hashPassword(dto.password),
      isActive: true,
    });

    // Persist
    const savedUser = await this.userRepository.create(user);

    // Return DTO
    return this.toDto(savedUser);
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt or argon2
    return `hashed_${password}`;
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
