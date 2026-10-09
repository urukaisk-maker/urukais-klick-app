import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(private prisma: PrismaService) {}

  // 🕕 Se ejecuta cada 6 horas
  @Cron(CronExpression.EVERY_6_HOURS)
  async cleanupExpiredSessions() {
    const result = await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (result.count > 0) {
      this.logger.log(`🧹 ${result.count} sesiones caducadas eliminadas`);
    }
  }

  // 📧 Se ejecuta cada 12 horas — limpia tokens de verificación caducados
  @Cron('0 0 */12 * * *')
  async cleanupExpiredVerifications() {
    const result = await this.prisma.emailVerification.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { usedAt: { not: null } },
        ],
      },
    });
    if (result.count > 0) {
      this.logger.log(`🧹 ${result.count} verificaciones caducadas eliminadas`);
    }
  }
}
