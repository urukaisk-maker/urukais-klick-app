import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        mascot: true,
        _count: {
          select: {
            tasks: true,
            notes: true,
            habits: true,
            goals: true,
            achievements: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const { passwordHash, twoFactorSecret, backupCodes, ...safe } = user;
    return safe;
  }

  async updateMe(userId: string, data: any) {
    const allowed = [
      'displayName',
      'bio',
      'avatarUrl',
      'theme',
      'mascotName',
      'soundEnabled',
      'language',
      'timezone',
    ];
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k)),
    );

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: filtered,
    });
    const { passwordHash, twoFactorSecret, backupCodes, ...safe } = user;
    return safe;
  }
}