import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(userId: string, query: string) {
    if (!query || query.trim().length < 2) {
      return {
        tasks: [],
        notes: [],
        events: [],
        categories: [],
        habits: [],
      };
    }

    const q = query.trim();
    const like = { contains: q, mode: 'insensitive' as const };

    const [tasks, notes, events, categories, habits] = await Promise.all([
      // Tareas
      this.prisma.task.findMany({
        where: {
          userId,
          deletedAt: null,
          OR: [
            { title: like },
            { description: like },
          ],
        },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          category: { select: { icon: true, color: true } },
        },
        take: 8,
        orderBy: { updatedAt: 'desc' },
      }),

      // Notas
      this.prisma.note.findMany({
        where: {
          userId,
          deletedAt: null,
          OR: [
            { title: like },
            { content: like },
          ],
        },
        select: {
          id: true,
          title: true,
          content: true,
          moodEmoji: true,
          date: true,
        },
        take: 5,
        orderBy: { date: 'desc' },
      }),

      // Eventos
      this.prisma.event.findMany({
        where: {
          userId,
          deletedAt: null,
          OR: [
            { title: like },
            { description: like },
            { location: like },
          ],
        },
        select: {
          id: true,
          title: true,
          startAt: true,
          color: true,
          location: true,
        },
        take: 5,
        orderBy: { startAt: 'asc' },
      }),

      // Categorías
      this.prisma.category.findMany({
        where: {
          userId,
          deletedAt: null,
          name: like,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          color: true,
        },
        take: 5,
      }),

      // Hábitos
      this.prisma.habit.findMany({
        where: {
          userId,
          deletedAt: null,
          name: like,
        },
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
        take: 5,
      }),
    ]);

    return { tasks, notes, events, categories, habits };
  }
}