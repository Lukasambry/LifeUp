/**
 * Domain Layer - Role Repository Interface
 * Defines the contract for role data persistence
 */

import { Role, RoleType } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByType(type: RoleType): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  create(role: Role): Promise<Role>;
  update(role: Role): Promise<Role>;
  delete(id: string): Promise<void>;
  getPermissions(roleId: string): Promise<Permission[]>;
  assignPermission(roleId: string, permissionId: string): Promise<void>;
  removePermission(roleId: string, permissionId: string): Promise<void>;
  hasPermission(roleId: string, permissionId: string): Promise<boolean>;
}

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');
