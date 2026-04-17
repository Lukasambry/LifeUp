import { Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { XpService } from './xp.service';

@Module({
  imports: [AuthModule],
  controllers: [TasksController],
  providers: [TasksService, XpService],
  exports: [TasksService, XpService],
})
export class TasksModule {}
