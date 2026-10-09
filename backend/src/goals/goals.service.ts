import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalStatus, XpReason } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId, deletedAt: null },
      include: {
        milestones: { orderBy: { order: 'asc' } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId, deletedAt: null },
      include: { milestones: { orderBy: { order: 'asc' } } },
    });
    if (!goal) throw new NotFoundException('Meta no encontrada');
    return goal;
  }

  async create(userId: string, dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        coverUrl: dto.coverUrl,
        type: dto.type,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
      },
      include: { milestones: true },
    });
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    await this.findOne(userId, id);
    const data: any = { ...dto };
    if (dto.targetDate) data.targetDate = new Date(dto.targetDate);

    return this.prisma.goal.update({
      where: { id },
      data,
      include: { milestones: { orderBy: { order: 'asc' } } },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.goal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // --- MILESTONES ---

  async addMilestone(userId: string, goalId: string, title: string) {
    await this.findOne(userId, goalId);
    const count = await this.prisma.milestone.count({ where: { goalId } });
    return this.prisma.milestone.create({
      data: { goalId, title, order: count },
    });
  }

  async toggleMilestone(userId: string, milestoneId: string) {
    const milestone = await this.prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        goal: { userId, deletedAt: null },
      },
    });
    if (!milestone) throw new NotFoundException('Hito no encontrado');

    const updated = await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        isDone: !milestone.isDone,
        completedAt: !milestone.isDone ? new Date() : null,
      },
    });

    // Recalcular progreso de la meta
    await this.recalculateProgress(milestone.goalId);

    return updated;
  }

  async removeMilestone(userId: string, milestoneId: string) {
    const milestone = await this.prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        goal: { userId, deletedAt: null },
      },
    });
    if (!milestone) throw new NotFoundException('Hito no encontrado');

    await this.prisma.milestone.delete({ where: { id: milestoneId } });
    await this.recalculateProgress(milestone.goalId);
    return { message: 'Hito borrado' };
  }

  private async recalculateProgress(goalId: string) {
    const milestones = await this.prisma.milestone.findMany({
      where: { goalId },
    });
    const total = milestones.length;
    const done = milestones.filter((m) => m.isDone).length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    const goal = await this.prisma.goal.update({
      where: { id: goalId },
      data: { progress },
    });

    // Si acaba de completarse (progress 100), dar recompensa
    if (progress === 100 && goal.status !== GoalStatus.COMPLETED) {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: goal.userId },
      });
      const newXp = user.xp + goal.xpReward;

      await this.prisma.$transaction([
        this.prisma.goal.update({
          where: { id: goalId },
          data: {
            status: GoalStatus.COMPLETED,
            completedAt: new Date(),
          },
        }),
        this.prisma.user.update({
          where: { id: goal.userId },
          data: {
            xp: newXp,
            coins: user.coins + goal.coinReward,
          },
        }),
        this.prisma.xpLog.create({
          data: {
            userId: goal.userId,
            amount: goal.xpReward,
            balanceAfter: newXp,
            reason: XpReason.GOAL_COMPLETED,
            refId: goal.id,
          },
        }),
      ]);
    }
  }
}
