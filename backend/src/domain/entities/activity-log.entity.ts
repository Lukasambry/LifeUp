/**
 * Domain Layer - ActivityLog Entity
 * Pure business logic, framework-agnostic
 */

import { BaseEntity } from './base.entity';

export interface ActivityLogProps {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

export class ActivityLog extends BaseEntity<string> {
  private _userId: string;
  private _action: string;
  private _resource: string;
  private _details?: string;
  private _ipAddress?: string;
  private _userAgent?: string;

  private constructor(props: ActivityLogProps) {
    super(props.id, props.createdAt, undefined);
    this._userId = props.userId;
    this._action = props.action;
    this._resource = props.resource;
    this._details = props.details;
    this._ipAddress = props.ipAddress;
    this._userAgent = props.userAgent;
  }

  public static create(props: ActivityLogProps): ActivityLog {
    return new ActivityLog(props);
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get action(): string {
    return this._action;
  }

  get resource(): string {
    return this._resource;
  }

  get details(): string | undefined {
    return this._details;
  }

  get ipAddress(): string | undefined {
    return this._ipAddress;
  }

  get userAgent(): string | undefined {
    return this._userAgent;
  }

  // Business logic methods
  public getActivitySummary(): string {
    return `${this._action} on ${this._resource}`;
  }

  public hasDetails(): boolean {
    return !!this._details && this._details.trim().length > 0;
  }

  public isAdminAction(): boolean {
    const adminActions = ['CREATE', 'UPDATE', 'DELETE', 'MANAGE'];
    return adminActions.some((action) =>
      this._action.toUpperCase().includes(action),
    );
  }
}
