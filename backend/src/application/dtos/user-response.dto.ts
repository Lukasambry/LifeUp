/**
 * Application Layer - Response DTOs
 */

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  roleId: string;
  isPremium: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithRoleResponseDto {
  id: string;
  email: string;
  name: string;
  role: {
    id: string;
    name: string;
    type: string;
  };
  isPremium: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
