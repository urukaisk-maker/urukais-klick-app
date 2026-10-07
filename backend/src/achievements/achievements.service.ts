import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    const [achievements, userAchievements] = await Promise.all([
      this.prisma.achievement.findMany({
        orderBy: [{ rarity: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.userAchievement.findMany({ where: { userId } }),
    ]);

    const map = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

    return achievements.map((ach) => {
      const ua = map.get(ach.id);
      return {
        ...ach,
        progress: ua?.progress ?? 0,
        isUnlocked: ua?.isUnlocked ?? false,
        unlockedAt: ua?.unlockedAt ?? null,
      };
    });
  }

  async findUnlocked(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId, isUnlocked: true },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  async stats(userId: string) {
    const [total, unlocked] = await Promise.all([
      this.prisma.achievement.count(),
      this.prisma.userAchievement.count({
        where: { userId, isUnlocked: true },
      }),
    ]);

    const byRarity = await this.prisma.achievement.groupBy({
      by: ['rarity'],
      _count: true,
    });

    const unlockedByRarity = await this.prisma.userAchievement.findMany({
      where: { userId, isUnlocked: true },
      include: { achievement: { select: { rarity: true } } },
    });

    const unlockedMap: Record<string, number> = {};
    for (const ua of unlockedByRarity) {
      const r = ua.achievement.rarity;
      unlockedMap[r] = (unlockedMap[r] ?? 0) + 1;
    }

    return {
      total,
      unlocked,
      progress: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      byRarity: byRarity.map((g) => ({
        rarity: g.rarity,
        total: g._count,
        unlocked: unlockedMap[g.rarity] ?? 0,
      })),
    };
  }
}
