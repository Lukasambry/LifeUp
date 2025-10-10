/**
 * Application Layer - Create Activity Log Use Case
 * Logs user actions for audit trail
 */

import { Injectable, Inject } from '@nestjs/common';
import {
  ACTIVITY_LOG_REPOSITORY,
  IActivityLogRepository,
} from '@domain/repositories/activity-log.repository.interface';
import { ActivityLog } from '@domain/entities/activity-log.entity';
import { randomBytes } from 'crypto';

export interface CreateActivityLogDto {
  userId: string;
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class CreateActivityLogUseCase {
  constructor(
    @Inject(ACTIVITY_LOG_REPOSITORY)
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  async execute(dto: CreateActivityLogDto): Promise<void> {
    const activityLog = ActivityLog.create({
      id: this.generateId(),
      userId: dto.userId,
      action: dto.action,
      resource: dto.resource,
      details: dto.details,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
    });

    await this.activityLogRepository.create(activityLog);
  }

  private generateId(): string {
    return randomBytes(16).toString('hex');
  }
}
