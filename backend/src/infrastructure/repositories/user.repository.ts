/**
 * Infrastructure Layer - Repository Implementation
 * Implements domain repository interface using Prisma
 */

import { Injectable } from '@nestjs/common';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { Role } from '@domain/entities/role.entity';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.toDomain(user);
  }

  async findByIdWithRole(
    id: string,
  ): Promise<{ user: User; role: Role } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) return null;
    return {
      user: this.toDomain(user),
      role: this.roleToDomain(user.role),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.toDomain(user);
  }

  async findByEmailWithRole(
    email: string,
  ): Promise<{ user: User; role: Role } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user) return null;
    return {
      user: this.toDomain(user),
      role: this.roleToDomain(user.role),
    };
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((u) => this.toDomain(u));
  }

  async findByRole(roleId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { roleId },
    });
    return users.map((u) => this.toDomain(u));
  }

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        roleId: user.roleId,
        isPremium: user.isPremium,
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
        roleId: user.roleId,
        isPremium: user.isPremium,
        isActive: user.isActive,
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  private toDomain(prismaUser: any): User {
    return User.create({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      password: prismaUser.password,
      roleId: prismaUser.roleId,
      isPremium: prismaUser.isPremium,
      isActive: prismaUser.isActive,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  private roleToDomain(prismaRole: any): Role {
    return Role.create({
      id: prismaRole.id,
      name: prismaRole.name,
      type: prismaRole.type,
      description: prismaRole.description,
      createdAt: prismaRole.createdAt,
      updatedAt: prismaRole.updatedAt,
    });
  }
}
