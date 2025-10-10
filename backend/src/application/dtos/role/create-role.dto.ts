/**
 * Application Layer - Create Role DTO
 * Data structure and validation for role creation
 */

import { z } from 'zod';

export const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  type: z.enum(['SUPER_ADMIN', 'ADMIN_LIFEUP', 'CLIENT']),
  description: z.string().max(500, 'Description is too long').optional(),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
