/**
 * Infrastructure Layer - ActivityLog Repository Implementation
 * Implements activity log repository interface using Prisma
 */

import { Injectable } from '@nestjs/common';
import { IActivityLogRepository } from '@domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '@domain/entities/activity-log.entity';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ActivityLogRepository implements IActivityLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ActivityLog | null> {
    const log = await this.prisma.activityLog.findUnique({ where: { id } });
    if (!log) return null;
    return this.toDomain(log);
  }

  async findByUserId(userId: string, limit = 100): Promise<ActivityLog[]> {
    const logs = await this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return logs.map((l) => this.toDomain(l));
  }

  async findByAction(action: string, limit = 100): Promise<ActivityLog[]> {
    const logs = await this.prisma.activityLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return logs.map((l) => this.toDomain(l));
  }

  async findByResource(
    resource: string,
    limit = 100,
  ): Promise<ActivityLog[]> {
    const logs = await this.prisma.activityLog.findMany({
      where: { resource },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return logs.map((l) => this.toDomain(l));
  }

  async findRecent(limit = 100): Promise<ActivityLog[]> {
    const logs = await this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return logs.map((l) => this.toDomain(l));
  }

  async create(activityLog: ActivityLog): Promise<ActivityLog> {
    const created = await this.prisma.activityLog.create({
      data: {
        id: activityLog.id,
        userId: activityLog.userId,
        action: activityLog.action,
        resource: activityLog.resource,
        details: activityLog.details,
        ipAddress: activityLog.ipAddress,
        userAgent: activityLog.userAgent,
      },
    });
    return this.toDomain(created);
  }

  async deleteOlderThan(date: Date): Promise<void> {
    await this.prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: date,
        },
      },
    });
  }

  private toDomain(prismaLog: any): ActivityLog {
    return ActivityLog.create({
      id: prismaLog.id,
      userId: prismaLog.userId,
      action: prismaLog.action,
      resource: prismaLog.resource,
      details: prismaLog.details,
      ipAddress: prismaLog.ipAddress,
      userAgent: prismaLog.userAgent,
      createdAt: prismaLog.createdAt,
    });
  }
}
