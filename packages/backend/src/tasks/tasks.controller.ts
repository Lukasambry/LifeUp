import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { CreateCustomTaskDto } from './dto/create-custom-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  listTasks(@Query() query: ListTasksQueryDto) {
    return this.tasks.listTasks(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyTasks(@CurrentUser('id') userId: string) {
    return this.tasks.getMyTasks(userId);
  }

  @Post('custom')
  @UseGuards(JwtAuthGuard)
  createCustomTask(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCustomTaskDto,
  ) {
    return this.tasks.createCustomTask(userId, dto);
  }

  @Post('my')
  @UseGuards(JwtAuthGuard)
  assignTask(@CurrentUser('id') userId: string, @Body() dto: AssignTaskDto) {
    return this.tasks.assignTask(userId, dto);
  }

  @Delete('my/:userTaskId')
  @UseGuards(JwtAuthGuard)
  deactivateTask(
    @CurrentUser('id') userId: string,
    @Param('userTaskId') userTaskId: string,
  ) {
    return this.tasks.deactivateTask(userId, userTaskId);
  }

  @Post('my/:userTaskId/complete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  completeTask(
    @CurrentUser('id') userId: string,
    @Param('userTaskId') userTaskId: string,
    @Body() dto: CompleteTaskDto,
    @Req() req: Request,
  ) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]) ??
      req.ip;
    return this.tasks.completeTask(userId, userTaskId, dto, ip);
  }

  @Get(':id')
  getTask(@Param('id') id: string) {
    return this.tasks.getTask(id);
  }

  // TODO: restrict to admin role when roles are added)
  @Post()
  @UseGuards(JwtAuthGuard)
  createTask(@Body() dto: CreateTaskDto) {
    return this.tasks.createTask(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.updateTask(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteTask(@Param('id') id: string) {
    return this.tasks.deleteTask(id);
  }
}
