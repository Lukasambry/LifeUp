/**
 * Infrastructure Layer - Role Repository Implementation
 * Implements role repository interface using Prisma
 */

import { Injectable } from '@nestjs/common';
import { IRoleRepository } from '@domain/repositories/role.repository.interface';
import { Role, RoleType } from '@domain/entities/role.entity';
import { Permission } from '@domain/entities/permission.entity';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) return null;
    return this.toDomain(role);
  }

  async findByType(type: RoleType): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({ where: { type } });
    if (!role) return null;
    return this.toDomain(role);
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) return null;
    return this.toDomain(role);
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany();
    return roles.map((r) => this.toDomain(r));
  }

  async create(role: Role): Promise<Role> {
    const created = await this.prisma.role.create({
      data: {
        id: role.id,
        name: role.name,
        type: role.type,
        description: role.description,
      },
    });
    return this.toDomain(created);
  }

  async update(role: Role): Promise<Role> {
    const updated = await this.prisma.role.update({
      where: { id: role.id },
      data: {
        description: role.description,
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({ where: { id } });
  }

  async getPermissions(roleId: string): Promise<Permission[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
    return rolePermissions.map((rp) => this.permissionToDomain(rp.permission));
  }

  async assignPermission(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    await this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  async removePermission(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId,
      },
    });
  }

  async hasPermission(
    roleId: string,
    permissionId: string,
  ): Promise<boolean> {
    const count = await this.prisma.rolePermission.count({
      where: {
        roleId,
        permissionId,
      },
    });
    return count > 0;
  }

  private toDomain(prismaRole: any): Role {
    return Role.create({
      id: prismaRole.id,
      name: prismaRole.name,
      type: prismaRole.type as RoleType,
      description: prismaRole.description,
      createdAt: prismaRole.createdAt,
      updatedAt: prismaRole.updatedAt,
    });
  }

  private permissionToDomain(prismaPermission: any): Permission {
    return Permission.create({
      id: prismaPermission.id,
      resource: prismaPermission.resource,
      action: prismaPermission.action,
      description: prismaPermission.description,
      createdAt: prismaPermission.createdAt,
      updatedAt: prismaPermission.updatedAt,
    });
  }
}
