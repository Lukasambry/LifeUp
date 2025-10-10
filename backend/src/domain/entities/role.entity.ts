/**
 * Domain Layer - Role Entity
 * Pure business logic, framework-agnostic
 */

import { BaseEntity } from './base.entity';

export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_LIFEUP = 'ADMIN_LIFEUP',
  CLIENT = 'CLIENT',
}

export interface RoleProps {
  id: string;
  name: string;
  type: RoleType;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Role extends BaseEntity<string> {
  private _name: string;
  private _type: RoleType;
  private _description?: string;

  private constructor(props: RoleProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._name = props.name;
    this._type = props.type;
    this._description = props.description;
  }

  public static create(props: RoleProps): Role {
    return new Role(props);
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get type(): RoleType {
    return this._type;
  }

  get description(): string | undefined {
    return this._description;
  }

  // Business logic methods
  public updateDescription(description: string): void {
    this._description = description;
    this.touch();
  }

  public isSuperAdmin(): boolean {
    return this._type === RoleType.SUPER_ADMIN;
  }

  public isAdmin(): boolean {
    return this._type === RoleType.ADMIN_LIFEUP;
  }

  public isClient(): boolean {
    return this._type === RoleType.CLIENT;
  }

  public hasAdminPrivileges(): boolean {
    return this.isSuperAdmin() || this.isAdmin();
  }
}
