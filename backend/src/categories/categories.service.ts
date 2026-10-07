import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId, deletedAt: null, isArchived: false },
      include: {
        subcategories: {
          where: { deletedAt: null, isArchived: false },
          orderBy: { order: 'asc' },
        },
        _count: { select: { tasks: { where: { deletedAt: null } } } },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const cat = await this.prisma.category.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        subcategories: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const slug = dto.slug ?? this.slugify(dto.name);
    const exists = await this.prisma.category.findUnique({
      where: { userId_slug: { userId, slug } },
    });
    if (exists)
      throw new ConflictException('Ya tienes una categoría con ese slug');

    const count = await this.prisma.category.count({ where: { userId } });

    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name,
        slug,
        description: dto.description,
        icon: dto.icon ?? '🌸',
        color: dto.color ?? '#FFB7C5',
        coverUrl: dto.coverUrl,
        order: dto.order ?? count,
      },
      include: { subcategories: true },
    });
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOne(userId, id);
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addSubcategory(
    userId: string,
    categoryId: string,
    dto: CreateSubcategoryDto,
  ) {
    await this.findOne(userId, categoryId);
    const slug = dto.slug ?? this.slugify(dto.name);
    const count = await this.prisma.subcategory.count({
      where: { categoryId },
    });

    return this.prisma.subcategory.create({
      data: {
        userId,
        categoryId,
        name: dto.name,
        slug,
        description: dto.description,
        icon: dto.icon ?? '✨',
        color: dto.color,
        order: count,
      },
    });
  }

  async removeSubcategory(userId: string, subId: string) {
    const sub = await this.prisma.subcategory.findFirst({
      where: { id: subId, userId, deletedAt: null },
    });
    if (!sub) throw new NotFoundException('Subcategoría no encontrada');

    return this.prisma.subcategory.update({
      where: { id: subId },
      data: { deletedAt: new Date() },
    });
  }
}
