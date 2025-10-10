/**
 * Domain Layer - User Entity
 * Pure business logic, framework-agnostic
 */

import { BaseEntity } from './base.entity';

export interface UserProps {
  id: string;
  email: string;
  name: string;
  password: string;
  roleId: string;
  isPremium: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends BaseEntity<string> {
  private _email: string;
  private _name: string;
  private _password: string;
  private _roleId: string;
  private _isPremium: boolean;
  private _isActive: boolean;

  private constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._email = props.email;
    this._name = props.name;
    this._password = props.password;
    this._roleId = props.roleId;
    this._isPremium = props.isPremium;
    this._isActive = props.isActive;
  }

  public static create(props: UserProps): User {
    return new User(props);
  }

  // Getters
  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get password(): string {
    return this._password;
  }

  get roleId(): string {
    return this._roleId;
  }

  get isPremium(): boolean {
    return this._isPremium;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  // Business logic methods
  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    this._name = name;
    this.touch();
  }

  public updateEmail(email: string): void {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    this._email = email;
    this.touch();
  }

  public updatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    this._password = password;
    this.touch();
  }

  public upgradeToPremium(): void {
    this._isPremium = true;
    this.touch();
  }

  public downgradeFromPremium(): void {
    this._isPremium = false;
    this.touch();
  }

  public activate(): void {
    this._isActive = true;
    this.touch();
  }

  public deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  public validatePassword(minLength: number = 8): boolean {
    return this._password && this._password.length >= minLength;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
