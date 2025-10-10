/**
 * Presentation Layer - Role-Based Throttler Guard
 * Applies different rate limits based on user role
 */

import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RoleType } from '@domain/entities/role.entity';

@Injectable()
export class RoleThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.sub || req.ip;
  }

  protected async getLimit(context: ExecutionContext): Promise<number> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      // Anonymous users: 10 requests per minute
      return 10;
    }

    // Different limits based on role type
    switch (user.roleType) {
      case RoleType.SUPER_ADMIN:
        return 1000; // Super admins: 1000 requests per minute
      case RoleType.ADMIN_LIFEUP:
        return 500; // Admin LifeUp: 500 requests per minute
      case RoleType.CLIENT:
        return user.isPremium ? 200 : 100; // Premium clients: 200, Regular: 100
      default:
        return 60; // Default: 60 requests per minute
    }
  }

  protected async getTtl(context: ExecutionContext): Promise<number> {
    // Time window: 60 seconds
    return 60;
  }
}
