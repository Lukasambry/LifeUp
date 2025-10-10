/**
 * Application Layer - Role Response DTO
 * Data structure for returning role information
 */

export interface RoleResponseDto {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleWithPermissionsResponseDto extends RoleResponseDto {
  permissions: Array<{
    id: string;
    resource: string;
    action: string;
  }>;
}
