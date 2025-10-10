/**
 * Domain Layer - Permission Repository Interface
 * Defines the contract for permission data persistence
 */

import {
  Permission,
  PermissionAction,
  PermissionResource,
} from '../entities/permission.entity';

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByResourceAndAction(
    resource: PermissionResource,
    action: PermissionAction,
  ): Promise<Permission | null>;
  findByResource(resource: PermissionResource): Promise<Permission[]>;
  findAll(): Promise<Permission[]>;
  create(permission: Permission): Promise<Permission>;
  update(permission: Permission): Promise<Permission>;
  delete(id: string): Promise<void>;
}

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');
