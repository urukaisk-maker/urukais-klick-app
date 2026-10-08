import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const TEMPLATES = [
  {
    type: 'TASKS_COMPLETED' as const,
    target: 3,
    xpReward: 50,
    coinReward: 30,
  },
  {
    type: 'HABITS_MARKED' as const,
    target: 2,
    xpReward: 30,
    coinReward: 15,
  },
  {
    type: 'NOTES_CREATED' as const,
    target: 1,
    xpReward: 20,
    coinReward: 10,
  },
  {
    type: 'BONUS_ALL' as const,
    target: 3,
    xpReward: 100,
    coinReward: 50,
  },
];

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

@Injectable()
export class MissionsService {
  private readonly logger = new Logger(MissionsService.name);

  constructor(private prisma: PrismaService) {}

  async getToday(userId: string) {
    const today = startOfToday();

    let missions = await this.prisma.dailyMission.findMany({
      where: { userId, date: today },
    });

    if (missions.length === 0) {
      missions = await this.generateForToday(userId, today);
    }

    await this.refreshBonus(userId, today);

    return this.prisma.dailyMission.findMany({
      where: { userId, date: today },
      orderBy: { createdAt: 'asc' },
    });
  }

  async incrementProgress(
    userId: string,
    type: 'TASKS_COMPLETED' | 'HABITS_MARKED' | 'NOTES_CREATED',
  ) {
    try {
      const today = startOfToday();

      let mission = await this.prisma.dailyMission.findUnique({
        where: { userId_date_type: { userId, date: today, type } },
      });

      if (!mission) {
        await this.generateForToday(userId, today);
        mission = await this.prisma.dailyMission.findUnique({
          where: { userId_date_type: { userId, date: today, type } },
        });
      }

      if (!mission || mission.completed) return;

      const newProgress = mission.progress + 1;
      const isNowCompleted = newProgress >= mission.target;

      await this.prisma.dailyMission.update({
        where: { id: mission.id },
        data: {
          progress: newProgress,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date() : null,
        },
      });

      if (isNowCompleted && !mission.claimed) {
        await this.awardMission(userId, mission);
      }

      await this.refreshBonus(userId, today);
    } catch (err: any) {
      this.logger.error(`Error incrementando misión: ${err?.message ?? err}`);
    }
  }

  private async generateForToday(userId: string, date: Date) {
    await this.prisma.dailyMission.createMany({
      data: TEMPLATES.map((t) => ({
        userId,
        date,
        type: t.type,
        target: t.target,
        xpReward: t.xpReward,
        coinReward: t.coinReward,
      })),
      skipDuplicates: true,
    });

    return this.prisma.dailyMission.findMany({
      where: { userId, date },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async refreshBonus(userId: string, date: Date) {
    const all = await this.prisma.dailyMission.findMany({
      where: { userId, date },
    });

    const bonus = all.find((m) => m.type === 'BONUS_ALL');
    if (!bonus || bonus.completed) return;

    const completedRegular = all.filter(
      (m) => m.type !== 'BONUS_ALL' && m.completed,
    ).length;

    if (completedRegular !== bonus.progress) {
      const isNowCompleted = completedRegular >= bonus.target;
      await this.prisma.dailyMission.update({
        where: { id: bonus.id },
        data: {
          progress: completedRegular,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date() : null,
        },
      });

      if (isNowCompleted && !bonus.claimed) {
        await this.awardMission(userId, bonus);
      }
    }
  }

  private async awardMission(userId: string, mission: any) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const newXp = user.xp + mission.xpReward;
    const newCoins = user.coins + mission.coinReward;

    await this.prisma.$transaction([
      this.prisma.dailyMission.update({
        where: { id: mission.id },
        data: { claimed: true, claimedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { xp: newXp, coins: newCoins },
      }),
      this.prisma.xpLog.create({
        data: {
          userId,
          amount: mission.xpReward,
          balanceAfter: newXp,
          reason: 'DAILY_STREAK',
          refId: mission.id,
          metadata: { missionType: mission.type },
        },
      }),
    ]);

    this.logger.log(
      `Misión ${mission.type} completada → +${mission.xpReward} XP, +${mission.coinReward} 🪙`,
    );
  }
}