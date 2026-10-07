import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { XpReason } from '@prisma/client';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  async listItems(userId: string) {
    const [items, purchases] = await Promise.all([
      this.prisma.shopItem.findMany({
        where: { isActive: true },
        orderBy: [{ type: 'asc' }, { price: 'asc' }],
      }),
      this.prisma.purchase.findMany({ where: { userId } }),
    ]);

    const ownedIds = new Set(purchases.map((p) => p.itemId));

    return items.map((item) => ({
      ...item,
      owned: ownedIds.has(item.id),
    }));
  }

  async listPurchases(userId: string) {
    return this.prisma.purchase.findMany({
      where: { userId },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async buy(userId: string, itemId: string) {
    const item = await this.prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!item || !item.isActive) {
      throw new NotFoundException('Item no encontrado');
    }

    const existing = await this.prisma.purchase.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });
    if (existing) {
      throw new BadRequestException('Ya tienes este item');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (user.coins < item.price) {
      throw new BadRequestException(
        `Necesitas ${item.price - user.coins} monedas más`,
      );
    }

    const [purchase, updatedUser] = await this.prisma.$transaction([
      this.prisma.purchase.create({
        data: { userId, itemId, pricePaid: item.price },
        include: { item: true },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { coins: user.coins - item.price },
      }),
    ]);

    // Aplicar efecto del item (payload)
    await this.applyItemEffect(userId, item);

    return {
      purchase,
      coinsLeft: updatedUser.coins,
      item: purchase.item,
    };
  }

  private async applyItemEffect(userId: string, item: any) {
    const payload = item.payload as any;
    if (!payload) return;

    // Temas y cosméticos: guardar en AppConfig por usuario (no implementado aquí)
    // Skins de mascota: cambiar skinCode
    if (item.type === 'MASCOT_SKIN' && payload.skin) {
      await this.prisma.mascot.update({
        where: { userId },
        data: { skinCode: payload.skin },
      });
    }

    // Skins/temas se aplican desde el frontend consultando Purchase
  }
}
