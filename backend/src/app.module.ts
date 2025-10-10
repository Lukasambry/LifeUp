/**
 * Root Application Module
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '@infrastructure/config/database.module';
import { UserModule } from '@infrastructure/modules/user.module';
import { AuthModule } from '@infrastructure/modules/auth.module';
import { ActivityLogModule } from '@infrastructure/modules/activity-log.module';
import { JwtAuthGuard } from '@presentation/guards/jwt-auth.guard';
import { RolesGuard } from '@presentation/guards/roles.guard';
import { RoleThrottlerGuard } from '@presentation/guards/role-throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // Default limit (overridden by RoleThrottlerGuard)
      },
    ]),
    DatabaseModule,
    AuthModule,
    ActivityLogModule,
    UserModule,
  ],
  providers: [
    // Global JWT Authentication Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Roles Guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: RoleThrottlerGuard,
    },
  ],
})
export class AppModule {}
