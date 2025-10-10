/**
 * Presentation Layer - Activity Log Interceptor
 * Automatically logs admin actions
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CreateActivityLogUseCase } from '@application/use-cases/activity-log/create-activity-log.use-case';
import { RoleType } from '@domain/entities/role.entity';

export const LOG_ACTIVITY_KEY = 'logActivity';
export const LogActivity = (action: string, resource: string) =>
  Reflect.metadata(LOG_ACTIVITY_KEY, { action, resource });

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly createActivityLogUseCase: CreateActivityLogUseCase,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get(
      LOG_ACTIVITY_KEY,
      context.getHandler(),
    );

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only log for admin users
    if (
      !user ||
      (user.roleType !== RoleType.SUPER_ADMIN &&
        user.roleType !== RoleType.ADMIN_LIFEUP)
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async () => {
        try {
          await this.createActivityLogUseCase.execute({
            userId: user.sub,
            action: metadata.action,
            resource: metadata.resource,
            details: JSON.stringify({
              method: request.method,
              url: request.url,
              body: request.body,
            }),
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          });
        } catch (error) {
          // Silently fail - don't break the request
          console.error('Failed to log activity:', error);
        }
      }),
    );
  }
}
