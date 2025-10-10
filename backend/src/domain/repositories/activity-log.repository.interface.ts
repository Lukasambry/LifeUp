/**
 * Domain Layer - ActivityLog Repository Interface
 * Defines the contract for activity log data persistence
 */

import { ActivityLog } from '../entities/activity-log.entity';

export interface IActivityLogRepository {
  findById(id: string): Promise<ActivityLog | null>;
  findByUserId(userId: string, limit?: number): Promise<ActivityLog[]>;
  findByAction(action: string, limit?: number): Promise<ActivityLog[]>;
  findByResource(resource: string, limit?: number): Promise<ActivityLog[]>;
  findRecent(limit?: number): Promise<ActivityLog[]>;
  create(activityLog: ActivityLog): Promise<ActivityLog>;
  deleteOlderThan(date: Date): Promise<void>;
}

export const ACTIVITY_LOG_REPOSITORY = Symbol('ACTIVITY_LOG_REPOSITORY');
