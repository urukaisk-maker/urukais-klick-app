import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StatsService } from './stats.service';

@ApiTags('Stats')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private service: StatsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Estadísticas generales del usuario' })
  overview(@CurrentUser('id') userId: string) {
    return this.service.overview(userId);
  }
}