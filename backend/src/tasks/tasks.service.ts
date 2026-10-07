import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  Difficulty,
  TaskStatus,
  XpReason,
  Achievement,
} from '@prisma/client';

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  EASY: 1,
  NORMAL: 1.5,
  HARD: 2,
  BOSS: 3,
};

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    filters: {
      status?: TaskStatus;
      categoryId?: string;
      from?: string;
      to?: string;
    },
  ) {
    return this.prisma.task.findMany({
      where: {
        userId,
        deletedAt: null,
        isArchived: false,
        ...(filters.status && { status: filters.status }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.from || filters.to
          ? {
              dueDate: {
                ...(filters.from && { gte: new Date(filters.from) }),
                ...(filters.to && { lte: new Date(filters.to) }),
              },
            }
          : {}),
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        subcategory: { select: { id: true, name: true, icon: true } },
        subtasks: { orderBy: { order: 'asc' } },
        tags: { include: { tag: true } },
        _count: { select: { subtasks: true } },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        category: true,
        subcategory: true,
        subtasks: { orderBy: { order: 'asc' } },
        tags: { include: { tag: true } },
        attachments: true,
      },
    });
    if (!task) throw new NotFoundException('Tarea no encontrada');
    return task;
  }

  async create(userId: string, dto: CreateTaskDto) {
    const baseXp = 10;
    const multiplier = dto.difficulty
      ? DIFFICULTY_MULTIPLIER[dto.difficulty]
      : 1.5;
    const xpReward = Math.round(baseXp * multiplier);

    return this.prisma.task.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId,
        priority: dto.priority,
        difficulty: dto.difficulty,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        reminderAt: dto.reminderAt ? new Date(dto.reminderAt) : null,
        sticker: dto.sticker,
        moodTag: dto.moodTag,
        estimatedPomodoros: dto.estimatedPomodoros ?? 1,
        xpReward,
        coinReward: Math.max(1, Math.round(xpReward / 10)),
      },
      include: { category: true, subcategory: true, subtasks: true },
    });
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    await this.findOne(userId, id);

    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.reminderAt) data.reminderAt = new Date(dto.reminderAt);

    return this.prisma.task.update({
      where: { id },
      data,
      include: { category: true, subcategory: true, subtasks: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async complete(userId: string, id: string) {
    const task = await this.findOne(userId, id);
    if (task.status === TaskStatus.COMPLETED) {
      return { task, xpEarned: 0, coinsEarned: 0, levelUp: false };
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const updated = await this.prisma.task.update({
      where: { id },
      data: { status: TaskStatus.COMPLETED, completedAt: new Date() },
      include: { category: true, subcategory: true, subtasks: true },
    });

    const newXp = user.xp + task.xpReward;
    const newCoins = user.coins + task.coinReward;

    const nextLevel = await this.prisma.levelConfig.findFirst({
      where: { xpRequired: { lte: newXp } },
      orderBy: { level: 'desc' },
    });
    const newLevel = nextLevel?.level ?? user.level;
    const newRank = nextLevel?.rank ?? user.rank;

    await this.prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, coins: newCoins, level: newLevel, rank: newRank },
    });

    await this.prisma.xpLog.create({
      data: {
        userId,
        amount: task.xpReward,
        balanceAfter: newXp,
        reason: XpReason.TASK_COMPLETED,
        refId: task.id,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.prisma.dailyStat.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        tasksCompleted: { increment: 1 },
        xpEarned: { increment: task.xpReward },
        coinsEarned: { increment: task.coinReward },
      },
      create: {
        userId,
        date: today,
        tasksCompleted: 1,
        xpEarned: task.xpReward,
        coinsEarned: task.coinReward,
      },
    });

    await this.checkAchievements(userId);

    return {
      task: updated,
      xpEarned: task.xpReward,
      coinsEarned: task.coinReward,
      levelUp: newLevel > user.level,
    };
  }

  async addSubtask(userId: string, taskId: string, title: string) {
    await this.findOne(userId, taskId);
    const count = await this.prisma.subtask.count({ where: { taskId } });
    return this.prisma.subtask.create({
      data: { userId, taskId, title, order: count },
    });
  }

  async toggleSubtask(userId: string, subId: string) {
    const sub = await this.prisma.subtask.findFirst({
      where: { id: subId, userId },
    });
    if (!sub) throw new NotFoundException('Subtarea no encontrada');

    return this.prisma.subtask.update({
      where: { id: subId },
      data: {
        isDone: !sub.isDone,
        completedAt: !sub.isDone ? new Date() : null,
      },
    });
  }

  private async checkAchievements(userId: string) {
    const count = await this.prisma.task.count({
      where: { userId, status: TaskStatus.COMPLETED, deletedAt: null },
    });

    const achievements = await this.prisma.achievement.findMany();
    for (const ach of achievements) {
      const req = ach.requirement as any;
      if (req.type === 'TASKS_COMPLETED' && count >= req.count) {
        await this.unlockIfNeeded(userId, ach, count);
      }
    }
  }

  private async unlockIfNeeded(
    userId: string,
    ach: Achievement,
    progress: number,
  ) {
    const existing = await this.prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: ach.id } },
    });

    if (existing?.isUnlocked) return;

    await this.prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId: ach.id } },
      update: { progress, isUnlocked: true, unlockedAt: new Date() },
      create: {
        userId,
        achievementId: ach.id,
        progress,
        isUnlocked: true,
        unlockedAt: new Date(),
      },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const newXp = user.xp + ach.xpReward;
    await this.prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, coins: user.coins + ach.coinReward },
    });
    await this.prisma.xpLog.create({
      data: {
        userId,
        amount: ach.xpReward,
        balanceAfter: newXp,
        reason: XpReason.ACHIEVEMENT_UNLOCKED,
        refId: ach.id,
      },
    });
  }
}
