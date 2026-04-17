import { IsEnum, IsOptional } from 'class-validator';
import { TaskCategory, TaskType } from '@prisma/client';

export class ListTasksQueryDto {
  @IsOptional()
  @IsEnum(TaskCategory)
  category?: TaskCategory;

  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;
}
