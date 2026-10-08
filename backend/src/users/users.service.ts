import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

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

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Cerrar todas las sesiones por seguridad
    await this.prisma.session.deleteMany({ where: { userId } });

    return { message: 'Contraseña actualizada. Inicia sesión de nuevo.' };
  }
}
