import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Task, TaskType, UserTask } from '@prisma/client';
import { PrismaService } from '../prisma';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { CreateCustomTaskDto } from './dto/create-custom-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { XpService } from './xp.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async listTasks(query: ListTasksQueryDto) {
    return this.prisma.task.findMany({
      where: {
        isPredefined: true,
        ...(query.category && { category: query.category }),
        ...(query.type && { type: query.type }),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getTask(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async createTask(dto: CreateTaskDto) {
    try {
      return await this.prisma.task.create({
        data: {
          ...dto,
          isPredefined: true,
          requiresProof: dto.requiresProof ?? false,
          maxDailyCompletions: dto.maxDailyCompletions ?? 1,
        },
      });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError)) throw e;
      if (e.code === 'P2002')
        throw new ConflictException('Task with this name already exists');
      throw e;
    }
  }

  async updateTask(id: string, dto: UpdateTaskDto) {
    await this.getTask(id);
    try {
      return await this.prisma.task.update({ where: { id }, data: dto });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError)) throw e;
      if (e.code === 'P2002')
        throw new ConflictException('Task name already exists');
      throw e;
    }
  }

  async deleteTask(id: string) {
    await this.getTask(id);
    try {
      await this.prisma.task.delete({ where: { id } });
      return { message: 'Task deleted' };
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError)) throw e;
      if (e.code === 'P2003') {
        throw new ConflictException(
          'Task has existing completions or assignments and cannot be deleted',
        );
      }
      throw e;
    }
  }

  async getMyTasks(userId: string) {
    return this.prisma.userTask.findMany({
      where: { userId, isActive: true },
      include: { task: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async assignTask(userId: string, dto: AssignTaskDto) {
    await this.getTask(dto.taskId);

    const existing = await this.prisma.userTask.findFirst({
      where: { userId, taskId: dto.taskId },
    });

    if (existing) {
      if (existing.isActive)
        throw new ConflictException('Task already assigned and active');
      return this.prisma.userTask.update({
        where: { id: existing.id },
        data: { isActive: true },
        include: { task: true },
      });
    }

    return this.prisma.userTask.create({
      data: { userId, taskId: dto.taskId, isActive: true },
      include: { task: true },
    });
  }

  async deactivateTask(userId: string, userTaskId: string) {
    const userTask = await this.prisma.userTask.findUnique({
      where: { id: userTaskId },
    });
    if (!userTask) throw new NotFoundException('UserTask not found');
    if (userTask.userId !== userId)
      throw new ForbiddenException('Not your task');
    if (!userTask.isActive)
      throw new BadRequestException('Task is already inactive');

    return this.prisma.userTask.update({
      where: { id: userTaskId },
      data: { isActive: false },
    });
  }

  async completeTask(
    userId: string,
    userTaskId: string,
    dto: CompleteTaskDto,
    ipAddress?: string,
  ) {
    const userTask = await this.prisma.userTask.findUnique({
      where: { id: userTaskId },
      include: { task: true },
    });
    if (!userTask) throw new NotFoundException('UserTask not found');
    if (userTask.userId !== userId)
      throw new ForbiddenException('Not your task');
    if (!userTask.isActive) throw new BadRequestException('Task is not active');

    await this.validateCompletion(userTask, userId, dto);

    const multiplier = 1.0;
    const xpEarned = this.xp.calculateXp(userTask.task.baseXp, multiplier);
    const now = new Date();
    const statField = this.xp.getStatField(userTask.task.category);

    const userBefore = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, totalXp: true },
    });
    const levelBefore = userBefore!.level;

    const streakData = this.computeStreak(userTask, userTask.task, now);

    let completionRecord!: Prisma.TaskCompletionGetPayload<object>;
    await this.prisma.$transaction(async (tx) => {
      completionRecord = await tx.taskCompletion.create({
        data: {
          userId,
          taskId: userTask.taskId,
          xpEarned,
          multiplier,
          proofUrl: dto.proofUrl,
          gpsLat: dto.gpsLat,
          gpsLng: dto.gpsLng,
          nfcTagId: dto.nfcTagId ?? null,
          completedAt: now,
          ipAddress: ipAddress ?? null,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { totalXp: { increment: BigInt(xpEarned) } },
      });

      await tx.userStats.upsert({
        where: { userId },
        create: { userId, [statField]: xpEarned },
        update: { [statField]: { increment: xpEarned } },
      });

      await tx.userTask.update({
        where: { id: userTaskId },
        data: {
          lastCompletedAt: now,
          currentStreak: streakData.currentStreak,
          bestStreak: streakData.bestStreak,
        },
      });
    });

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true, level: true },
    });
    const newTotalXp = updatedUser!.totalXp;
    const levelAfter = this.xp.computeLevel(newTotalXp);
    const leveledUp = levelAfter > levelBefore;

    if (leveledUp) {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: { level: levelAfter },
        }),
        this.prisma.notification.create({
          data: {
            userId,
            type: 'LEVEL_UP',
            title: 'Level Up!',
            body: `Congratulations! You reached level ${levelAfter}!`,
            data: { levelBefore, levelAfter },
          },
        }),
      ]);
    }

    return {
      taskCompletion: completionRecord,
      xpEarned,
      totalXp: newTotalXp,
      levelBefore,
      levelAfter,
      leveledUp,
    };
  }

  async createCustomTask(userId: string, dto: CreateCustomTaskDto) {
    if (dto.baseXp > 150) {
      throw new BadRequestException('Custom tasks cannot exceed 150 XP');
    }

    if (dto.type === TaskType.ONESHOT && dto.cooldownMinutes) {
      throw new BadRequestException('ONESHOT tasks cannot have a cooldown');
    }
    const existing = await this.prisma.task.findFirst({
      where: { name: dto.name, isPredefined: false, createdBy: userId },
    });
    if (existing)
      throw new ConflictException(
        'You already have a custom task with this name',
      );

    try {
      return await this.prisma.task.create({
        data: {
          ...dto,
          isPredefined: false,
          createdBy: userId,
          requiresProof: dto.requiresProof ?? false,
          maxDailyCompletions: 1,
        },
      });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError)) throw e;
      if (e.code === 'P2002')
        throw new ConflictException(
          'A custom task with this name already exists',
        );
      throw e;
    }
  }

  private async validateCompletion(
    userTask: UserTask & { task: Task },
    userId: string,
    dto: CompleteTaskDto,
  ): Promise<void> {
    const { task, lastCompletedAt } = userTask;
    const now = new Date();

    if (task.requiresProof && !dto.proofUrl) {
      throw new BadRequestException('Proof URL is required for this task');
    }

    if (task.type === TaskType.ONESHOT) {
      const prior = await this.prisma.taskCompletion.findFirst({
        where: { userId, taskId: task.id },
      });
      if (prior)
        throw new BadRequestException('One-shot task already completed');
      return;
    }

    if (
      task.type === TaskType.REPEATABLE &&
      task.cooldownMinutes &&
      lastCompletedAt
    ) {
      const cooldownEnd = new Date(
        lastCompletedAt.getTime() + task.cooldownMinutes * 60 * 1000,
      );
      if (now < cooldownEnd) {
        const remainingMin = Math.ceil(
          (cooldownEnd.getTime() - now.getTime()) / 60000,
        );
        throw new BadRequestException(
          `Cooldown active. Try again in ${remainingMin} minute(s)`,
        );
      }
    }

    if (task.type === TaskType.DAILY) {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const count = await this.prisma.taskCompletion.count({
        where: { userId, taskId: task.id, completedAt: { gte: startOfDay } },
      });
      if (count >= task.maxDailyCompletions) {
        throw new BadRequestException('Daily completion limit reached');
      }
    }

    if (task.type === TaskType.WEEKLY) {
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      startOfWeek.setDate(startOfWeek.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);
      const count = await this.prisma.taskCompletion.count({
        where: { userId, taskId: task.id, completedAt: { gte: startOfWeek } },
      });
      if (count >= task.maxDailyCompletions) {
        throw new BadRequestException('Weekly completion limit reached');
      }
    }

    if (task.type === TaskType.MONTHLY) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const count = await this.prisma.taskCompletion.count({
        where: { userId, taskId: task.id, completedAt: { gte: startOfMonth } },
      });
      if (count >= task.maxDailyCompletions) {
        throw new BadRequestException('Monthly completion limit reached');
      }
    }
  }

  private computeStreak(
    userTask: UserTask,
    task: Task,
    now: Date,
  ): { currentStreak: number; bestStreak: number } {
    const { lastCompletedAt, currentStreak, bestStreak } = userTask;

    if (!lastCompletedAt) {
      return { currentStreak: 1, bestStreak: Math.max(1, bestStreak) };
    }

    if (task.type === TaskType.DAILY) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const lastDay = new Date(lastCompletedAt);
      lastDay.setHours(0, 0, 0, 0);

      const newStreak =
        lastDay.getTime() === yesterday.getTime() ? currentStreak + 1 : 1;
      return {
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, bestStreak),
      };
    }

    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      bestStreak: Math.max(newStreak, bestStreak),
    };
  }
}
