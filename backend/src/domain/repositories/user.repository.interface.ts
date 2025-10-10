/**
 * Domain Layer - User Repository Interface
 * Defines the contract for data persistence without implementation details
 */

import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByIdWithRole(id: string): Promise<{ user: User; role: Role } | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithRole(
    email: string,
  ): Promise<{ user: User; role: Role } | null>;
  findAll(): Promise<User[]>;
  findByRole(roleId: string): Promise<User[]>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
