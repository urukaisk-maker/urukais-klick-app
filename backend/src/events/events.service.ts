import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, from?: string, to?: string) {
    return this.prisma.event.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(from || to
          ? {
              startAt: {
                ...(from && { gte: new Date(from) }),
                ...(to && { lte: new Date(to) }),
              },
            }
          : {}),
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      orderBy: { startAt: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, userId, deletedAt: null },
      include: { category: true },
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  async create(userId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        color: dto.color ?? '#A855F7',
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        allDay: dto.allDay ?? false,
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
  }

  async update(userId: string, id: string, dto: UpdateEventDto) {
    await this.findOne(userId, id);
    const data: any = { ...dto };
    if (dto.startAt) data.startAt = new Date(dto.startAt);
    if (dto.endAt) data.endAt = new Date(dto.endAt);

    return this.prisma.event.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
