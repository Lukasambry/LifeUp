/**
 * Infrastructure Layer - Repository Implementation
 * Implements domain repository interface using Prisma
 */

import { Injectable } from '@nestjs/common';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.toDomain(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(this.toDomain);
  }

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        isActive: user.isActive,
      },
    });
    return this.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
        isActive: user.isActive,
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private toDomain(prismaUser: any): User {
    return User.create({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      password: prismaUser.password,
      isActive: prismaUser.isActive,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
