/**
 * Application Layer - Refresh Token DTO
 * Defines the data structure and validation for token refresh
 */

import { z } from 'zod';

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
