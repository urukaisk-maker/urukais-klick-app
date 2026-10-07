import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ShopService } from './shop.service';

@ApiTags('Shop')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('shop')
export class ShopController {
  constructor(private service: ShopService) {}

  @Get('items')
  @ApiOperation({ summary: 'Ver items de la tienda' })
  list(@CurrentUser('id') userId: string) {
    return this.service.listItems(userId);
  }

  @Get('purchases')
  @ApiOperation({ summary: 'Mis compras' })
  purchases(@CurrentUser('id') userId: string) {
    return this.service.listPurchases(userId);
  }

  @Post('buy/:itemId')
  @ApiOperation({ summary: 'Comprar un item con monedas' })
  buy(@CurrentUser('id') userId: string, @Param('itemId') itemId: string) {
    return this.service.buy(userId, itemId);
  }
}
