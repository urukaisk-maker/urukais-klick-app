import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, filters: { isDiary?: boolean }) {
    return this.prisma.note.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(filters.isDiary !== undefined && { isDiary: filters.isDiary }),
      },
      orderBy: [{ isPinned: 'desc' }, { date: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!note) throw new NotFoundException('Nota no encontrada');
    return note;
  }

  async create(userId: string, dto: CreateNoteDto) {
    return this.prisma.note.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content,
        mood: dto.mood,
        moodEmoji: dto.moodEmoji,
        coverUrl: dto.coverUrl,
        isPinned: dto.isPinned ?? false,
        isDiary: dto.isDiary ?? false,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    await this.findOne(userId, id);
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    return this.prisma.note.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
