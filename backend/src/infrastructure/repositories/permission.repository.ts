/**
 * Infrastructure Layer - Permission Repository Implementation
 * Implements permission repository interface using Prisma
 */

import { Injectable } from '@nestjs/common';
import { IPermissionRepository } from '@domain/repositories/permission.repository.interface';
import {
  Permission,
  PermissionAction,
  PermissionResource,
} from '@domain/entities/permission.entity';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) return null;
    return this.toDomain(permission);
  }

  async findByResourceAndAction(
    resource: PermissionResource,
    action: PermissionAction,
  ): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({
      where: {
        resource_action: {
          resource,
          action,
        },
      },
    });
    if (!permission) return null;
    return this.toDomain(permission);
  }

  async findByResource(resource: PermissionResource): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      where: { resource },
    });
    return permissions.map((p) => this.toDomain(p));
  }

  async findAll(): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany();
    return permissions.map((p) => this.toDomain(p));
  }

  async create(permission: Permission): Promise<Permission> {
    const created = await this.prisma.permission.create({
      data: {
        id: permission.id,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
      },
    });
    return this.toDomain(created);
  }

  async update(permission: Permission): Promise<Permission> {
    const updated = await this.prisma.permission.update({
      where: { id: permission.id },
      data: {
        description: permission.description,
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.permission.delete({ where: { id } });
  }

  private toDomain(prismaPermission: any): Permission {
    return Permission.create({
      id: prismaPermission.id,
      resource: prismaPermission.resource as PermissionResource,
      action: prismaPermission.action as PermissionAction,
      description: prismaPermission.description,
      createdAt: prismaPermission.createdAt,
      updatedAt: prismaPermission.updatedAt,
    });
  }
}
