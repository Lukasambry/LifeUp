/**
 * Presentation Layer - Current User Decorator
 * Extracts current user from request
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@infrastructure/services/jwt.service';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    return data ? user?.[data] : user;
  },
);
