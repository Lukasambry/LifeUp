/**
 * Domain Layer - Permission Entity
 * Pure business logic, framework-agnostic
 */

import { BaseEntity } from './base.entity';

export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MANAGE = 'MANAGE',
}

export enum PermissionResource {
  USERS = 'USERS',
  ROLES = 'ROLES',
  TASKS = 'TASKS',
  QUESTS = 'QUESTS',
  REWARDS = 'REWARDS',
  CHALLENGES = 'CHALLENGES',
  MODULES = 'MODULES',
  SETTINGS = 'SETTINGS',
  ANALYTICS = 'ANALYTICS',
  LOGS = 'LOGS',
}

export interface PermissionProps {
  id: string;
  resource: PermissionResource;
  action: PermissionAction;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Permission extends BaseEntity<string> {
  private _resource: PermissionResource;
  private _action: PermissionAction;
  private _description?: string;

  private constructor(props: PermissionProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._resource = props.resource;
    this._action = props.action;
    this._description = props.description;
  }

  public static create(props: PermissionProps): Permission {
    return new Permission(props);
  }

  // Getters
  get resource(): PermissionResource {
    return this._resource;
  }

  get action(): PermissionAction {
    return this._action;
  }

  get description(): string | undefined {
    return this._description;
  }

  // Business logic methods
  public updateDescription(description: string): void {
    this._description = description;
    this.touch();
  }

  public getPermissionString(): string {
    return `${this._resource}:${this._action}`;
  }

  public isManagePermission(): boolean {
    return this._action === PermissionAction.MANAGE;
  }

  public isReadPermission(): boolean {
    return this._action === PermissionAction.READ;
  }

  public isWritePermission(): boolean {
    return (
      this._action === PermissionAction.CREATE ||
      this._action === PermissionAction.UPDATE ||
      this._action === PermissionAction.DELETE
    );
  }
}
