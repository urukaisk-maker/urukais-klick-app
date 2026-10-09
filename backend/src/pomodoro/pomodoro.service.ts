import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { XpReason } from '@prisma/client';

const POMODORO_XP = 15;
const POMODORO_COINS = 3;

@Injectable()
export class PomodoroService {
  constructor(private prisma: PrismaService) {}

  async start(userId: string, taskId?: string, durationMin = 25) {
    // Verificar tarea si se pasa
    if (taskId) {
      const task = await this.prisma.task.findFirst({
        where: { id: taskId, userId, deletedAt: null },
      });
      if (!task) throw new NotFoundException('Tarea no encontrada');
    }

    return this.prisma.pomodoroSession.create({
      data: {
        userId,
        taskId,
        durationMin,
        breakMin: 5,
        completed: false,
      },
      include: {
        task: {
          select: { id: true, title: true, category: { select: { icon: true, color: true } } },
        },
      },
    });
  }

  async complete(userId: string, id: string) {
    const session = await this.prisma.pomodoroSession.findFirst({
      where: { id, userId },
    });
    if (!session) throw new NotFoundException('Sesión Pomodoro no encontrada');

    if (session.completed) {
      return { session, xpEarned: 0, coinsEarned: 0, alreadyCompleted: true };
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const newXp = user.xp + POMODORO_XP;
    const newCoins = user.coins + POMODORO_COINS;

    const [updated] = await this.prisma.$transaction([
      this.prisma.pomodoroSession.update({
        where: { id },
        data: {
          completed: true,
          xpEarned: POMODORO_XP,
          endedAt: new Date(),
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              category: { select: { icon: true, color: true } },
            },
          },
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { xp: newXp, coins: newCoins },
      }),
      this.prisma.xpLog.create({
        data: {
          userId,
          amount: POMODORO_XP,
          balanceAfter: newXp,
          reason: XpReason.POMODORO_FINISHED,
          refId: id,
        },
      }),
    ]);

    // Actualizar DailyStat
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.prisma.dailyStat.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        pomodorosDone: { increment: 1 },
        xpEarned: { increment: POMODORO_XP },
        coinsEarned: { increment: POMODORO_COINS },
      },
      create: {
        userId,
        date: today,
        pomodorosDone: 1,
        xpEarned: POMODORO_XP,
        coinsEarned: POMODORO_COINS,
      },
    });

    return {
      session: updated,
      xpEarned: POMODORO_XP,
      coinsEarned: POMODORO_COINS,
      alreadyCompleted: false,
    };
  }

  async history(userId: string, days = 7) {
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);

    const sessions = await this.prisma.pomodoroSession.findMany({
      where: { userId, startedAt: { gte: from } },
      include: {
        task: { select: { id: true, title: true } },
      },
      orderBy: { startedAt: 'desc' },
    });

    const completed = sessions.filter((s) => s.completed);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = completed.filter(
      (s) => new Date(s.startedAt).getTime() >= today.getTime(),
    );

    const totalMinutes = completed.reduce(
      (sum, s) => sum + s.durationMin,
      0,
    );

    return {
      sessions,
      stats: {
        total: completed.length,
        today: todaySessions.length,
        totalMinutes,
        totalXp: completed.reduce((sum, s) => sum + s.xpEarned, 0),
      },
    };
  }
}
