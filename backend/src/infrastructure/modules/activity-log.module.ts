/**
 * Infrastructure Layer - Activity Log Module
 * Wires activity logging dependencies
 */

import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CreateActivityLogUseCase } from '@application/use-cases/activity-log/create-activity-log.use-case';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { ACTIVITY_LOG_REPOSITORY } from '@domain/repositories/activity-log.repository.interface';
import { ActivityLogInterceptor } from '@presentation/interceptors/activity-log.interceptor';
import { DatabaseModule } from '../config/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: ACTIVITY_LOG_REPOSITORY,
      useClass: ActivityLogRepository,
    },
    CreateActivityLogUseCase,
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLogInterceptor,
    },
  ],
  exports: [CreateActivityLogUseCase],
})
export class ActivityLogModule {}
