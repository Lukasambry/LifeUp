/**
 * Application Layer - Response DTOs
 */

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
