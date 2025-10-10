/**
 * Application Layer - Assign Permission DTO
 * Data structure and validation for assigning permissions to roles
 */

import { z } from 'zod';

export const AssignPermissionSchema = z.object({
  roleId: z.string().min(1, 'Role ID is required'),
  permissionId: z.string().min(1, 'Permission ID is required'),
});

export type AssignPermissionDto = z.infer<typeof AssignPermissionSchema>;
