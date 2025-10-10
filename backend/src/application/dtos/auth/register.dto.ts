/**
 * Application Layer - Register DTO
 * Defines the data structure and validation for user registration
 */

import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
