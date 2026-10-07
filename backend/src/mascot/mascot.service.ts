import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const FEED_COST = 5;
const FEED_HUNGER = 25;
const FEED_HAPPINESS = 10;

@Injectable()
export class MascotService {
  constructor(private prisma: PrismaService) {}

  async get(userId: string) {
    let mascot = await this.prisma.mascot.findUnique({ where: { userId } });
    if (!mascot) {
      mascot = await this.prisma.mascot.create({
        data: { userId, name: 'Uru-chan', species: 'kitsune' },
      });
    }
    return this.recalculate(mascot);
  }

  private recalculate(mascot: any) {
    // Decaimiento pasivo según tiempo desde última actualización
    const now = Date.now();
    const lastUpdate = new Date(mascot.updatedAt).getTime();
    const hoursPassed = (now - lastUpdate) / (1000 * 60 * 60);

    if (hoursPassed < 1) return mascot;

    const hungerDecay = Math.min(100, Math.floor(hoursPassed * 3));
    const happinessDecay = Math.min(100, Math.floor(hoursPassed * 2));
    const energyDecay = Math.min(100, Math.floor(hoursPassed * 1));

    return {
      ...mascot,
      hunger: Math.max(0, mascot.hunger - hungerDecay),
      happiness: Math.max(0, mascot.happiness - happinessDecay),
      energy: Math.max(0, mascot.energy - energyDecay),
    };
  }

  async feed(userId: string) {
    const mascot = await this.get(userId);
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (user.coins < FEED_COST) {
      throw new BadRequestException('Necesitas 5 monedas para alimentar a Uru-chan');
    }

    const updated = await this.prisma.mascot.update({
      where: { userId },
      data: {
        hunger: Math.min(100, mascot.hunger + FEED_HUNGER),
        happiness: Math.min(100, mascot.happiness + FEED_HAPPINESS),
        xp: mascot.xp + 5,
        lastFedAt: new Date(),
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { coins: user.coins - FEED_COST },
    });

    const level = Math.floor(updated.xp / 100) + 1;
    if (level > updated.level) {
      return this.prisma.mascot.update({
        where: { userId },
        data: { level },
      });
    }

    return updated;
  }

  async play(userId: string) {
    const mascot = await this.get(userId);
    if (mascot.energy < 10) {
      throw new BadRequestException('Uru-chan está muy cansada, déjala descansar');
    }
    return this.prisma.mascot.update({
      where: { userId },
      data: {
        happiness: Math.min(100, mascot.happiness + 15),
        energy: Math.max(0, mascot.energy - 10),
        xp: mascot.xp + 3,
      },
    });
  }

  async rest(userId: string) {
    const mascot = await this.get(userId);
    return this.prisma.mascot.update({
      where: { userId },
      data: {
        energy: Math.min(100, mascot.energy + 25),
        happiness: Math.max(0, mascot.happiness - 5),
      },
    });
  }

  async rename(userId: string, name: string) {
    const mascot = await this.get(userId);
    return this.prisma.mascot.update({
      where: { userId },
      data: { name },
    });
  }
}
