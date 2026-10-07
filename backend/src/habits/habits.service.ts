import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { XpReason } from '@prisma/client';

@Injectable()
export class HabitsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const habits = await this.prisma.habit.findMany({
      where: { userId, deletedAt: null, isArchived: false },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        logs: {
          where: { date: { gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) } },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return habits.map((h) => {
      const todayLog = h.logs.find(
        (l) => l.date.getTime() === today.getTime(),
      );
      return {
        ...h,
        todayDone: !!todayLog?.completed,
        todayCount: todayLog?.count ?? 0,
        streak: this.calculateStreak(h.logs),
      };
    });
  }

  async findOne(userId: string, id: string) {
    const habit = await this.prisma.habit.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        category: true,
        logs: { orderBy: { date: 'desc' }, take: 90 },
      },
    });
    if (!habit) throw new NotFoundException('Hábito no encontrado');
    return {
      ...habit,
      streak: this.calculateStreak(habit.logs),
    };
  }

  async create(userId: string, dto: CreateHabitDto) {
    return this.prisma.habit.create({
      data: {
        userId,
        name: dto.name,
        icon: dto.icon ?? '🔥',
        color: dto.color ?? '#FFB7C5',
        frequency: dto.frequency ?? 'daily',
        targetDays: dto.targetDays ?? [0, 1, 2, 3, 4, 5, 6],
        targetCount: dto.targetCount ?? 1,
        categoryId: dto.categoryId,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateHabitDto) {
    await this.findOne(userId, id);
    return this.prisma.habit.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.habit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async check(userId: string, id: string) {
    const habit = await this.findOne(userId, id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: id, date: today } },
    });

    let log;
    if (existing) {
      log = await this.prisma.habitLog.update({
        where: { id: existing.id },
        data: {
          count: existing.count + 1,
          completed: true,
        },
      });
    } else {
      log = await this.prisma.habitLog.create({
        data: {
          habitId: id,
          userId,
          date: today,
          count: 1,
          completed: true,
        },
      });

      // Dar XP solo la primera vez al día
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });
      const newXp = user.xp + habit.xpReward;
      await this.prisma.user.update({
        where: { id: userId },
        data: { xp: newXp },
      });
      await this.prisma.xpLog.create({
        data: {
          userId,
          amount: habit.xpReward,
          balanceAfter: newXp,
          reason: XpReason.HABIT_COMPLETED,
          refId: habit.id,
        },
      });
    }

    return { log, streak: await this.getStreak(userId, id) };
  }

  async uncheck(userId: string, id: string) {
    await this.findOne(userId, id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: id, date: today } },
    });
    if (!existing) return { deleted: false };

    if (existing.count > 1) {
      return this.prisma.habitLog.update({
        where: { id: existing.id },
        data: { count: existing.count - 1 },
      });
    }

    return this.prisma.habitLog.delete({ where: { id: existing.id } });
  }

  async getLogs(userId: string, id: string, days = 30) {
    await this.findOne(userId, id);
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.prisma.habitLog.findMany({
      where: { habitId: id, date: { gte: from } },
      orderBy: { date: 'asc' },
    });
  }

  private async getStreak(userId: string, habitId: string): Promise<number> {
    const logs = await this.prisma.habitLog.findMany({
      where: { habitId, userId, completed: true },
      orderBy: { date: 'desc' },
    });
    return this.calculateStreak(logs);
  }

  private calculateStreak(logs: { date: Date; completed: boolean }[]): number {
    if (!logs.length) return 0;

    const dates = logs
      .filter((l) => l.completed)
      .map((l) => {
        const d = new Date(l.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

    const unique = [...new Set(dates)].sort((a, b) => b - a);
    if (!unique.length) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    // Permitir que empiece hoy o ayer
    if (unique[0] !== todayMs && unique[0] !== todayMs - oneDay) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < unique.length; i++) {
      if (unique[i - 1] - unique[i] === oneDay) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
}
