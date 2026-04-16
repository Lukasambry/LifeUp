import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TaskCategory, TaskType } from '@prisma/client';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(TaskCategory)
  category?: TaskCategory;

  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  baseXp?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  cooldownMinutes?: number;

  @IsOptional()
  @IsBoolean()
  requiresProof?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxDailyCompletions?: number;
}
