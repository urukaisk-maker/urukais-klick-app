import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const BASE_XP = 20;
const BASE_COINS = 10;

@Injectable()
export class DailyRewardService {
  constructor(private prisma: PrismaService) {}

  async check(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reward = await this.prisma.dailyReward.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    // Bonus por streak: +5 XP y +3 coins por día consecutivo (máx 10 días)
    const streakBonus = Math.min(10, user.currentStreak);
    const nextXp = BASE_XP + streakBonus * 5;
    const nextCoins = BASE_COINS + streakBonus * 3;

    return {
      claimed: !!reward,
      claimedAt: reward?.claimedAt ?? null,
      streak: user.currentStreak,
      nextReward: {
        xp: nextXp,
        coins: nextCoins,
      },
    };
  }

  async claim(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.dailyReward.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (existing) {
      throw new BadRequestException('Ya has reclamado la recompensa de hoy');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    // Actualizar streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastDate = user.lastStreakDate
      ? new Date(user.lastStreakDate)
      : null;

    let newStreak = 1;
    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
      if (lastDate.getTime() === yesterday.getTime()) {
        newStreak = user.currentStreak + 1;
      } else if (lastDate.getTime() === today.getTime()) {
        newStreak = user.currentStreak;
      }
    }

    const longest = Math.max(user.longestStreak, newStreak);

    const streakBonus = Math.min(10, newStreak);
    const xpGain = BASE_XP + streakBonus * 5;
    const coinGain = BASE_COINS + streakBonus * 3;

    const newXp = user.xp + xpGain;
    const newCoins = user.coins + coinGain;

    await this.prisma.$transaction([
      this.prisma.dailyReward.create({
        data: {
          userId,
          date: today,
          xpClaimed: xpGain,
          coinsClaimed: coinGain,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          xp: newXp,
          coins: newCoins,
          currentStreak: newStreak,
          longestStreak: longest,
          lastStreakDate: today,
        },
      }),
      this.prisma.xpLog.create({
        data: {
          userId,
          amount: xpGain,
          balanceAfter: newXp,
          reason: 'DAILY_STREAK',
          metadata: { streak: newStreak },
        },
      }),
    ]);

    return {
      xpGained: xpGain,
      coinsGained: coinGain,
      streak: newStreak,
      longestStreak: longest,
      newBalance: { xp: newXp, coins: newCoins },
    };
  }
}
