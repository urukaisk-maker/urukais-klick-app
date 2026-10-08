import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async overview(userId: string) {
    const [user, dailyStats, tasksByCategory, habitsProgress] =
      await Promise.all([
        this.prisma.user.findUniqueOrThrow({
          where: { id: userId },
          select: {
            xp: true,
            level: true,
            coins: true,
            currentStreak: true,
            longestStreak: true,
            createdAt: true,
          },
        }),
        this.prisma.dailyStat.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 180,
        }),
        this.prisma.task.groupBy({
          by: ['categoryId'],
          where: { userId, deletedAt: null },
          _count: { _all: true },
        }),
        this.prisma.habitLog.findMany({
          where: {
            userId,
            date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
          orderBy: { date: 'asc' },
        }),
      ]);

    // Cargar las categorías para el gráfico
    const categoryIds = tasksByCategory
      .map((t) => t.categoryId)
      .filter((id): id is string => !!id);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, icon: true, color: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return {
      user,
      dailyStats: dailyStats.map((d) => ({
        date: d.date,
        tasksCompleted: d.tasksCompleted,
        xpEarned: d.xpEarned,
        coinsEarned: d.coinsEarned,
        habitsCompleted: d.habitsCompleted,
        notesCreated: d.notesCreated,
        pomodorosDone: d.pomodorosDone,
      })),
      tasksByCategory: tasksByCategory
        .filter((t) => t.categoryId)
        .map((t) => ({
          categoryId: t.categoryId!,
          name: categoryMap.get(t.categoryId!)?.name ?? 'Sin nombre',
          icon: categoryMap.get(t.categoryId!)?.icon ?? '📁',
          color: categoryMap.get(t.categoryId!)?.color ?? '#A855F7',
          count: t._count._all,
        })),
      habitsProgress: habitsProgress.map((h) => ({
        date: h.date,
        count: h.count,
        completed: h.completed,
      })),
    };
  }
}