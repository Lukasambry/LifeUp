/**
 * Application Layer - Activity Log Response DTO
 * Data structure for returning activity log information
 */

export interface ActivityLogResponseDto {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
