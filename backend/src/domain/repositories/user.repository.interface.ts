/**
 * Domain Layer - Repository Interface
 * Defines the contract for data persistence without implementation details
 */

import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
