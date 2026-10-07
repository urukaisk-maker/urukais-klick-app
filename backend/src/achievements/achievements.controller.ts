import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AchievementsService } from './achievements.service';

@ApiTags('Achievements')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('achievements')
export class AchievementsController {
  constructor(private service: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: 'Todos los logros con mi progreso' })
  findAll(@CurrentUser('id') userId: string) {
    return this.service.findAllForUser(userId);
  }

  @Get('unlocked')
  @ApiOperation({ summary: 'Logros desbloqueados' })
  findUnlocked(@CurrentUser('id') userId: string) {
    return this.service.findUnlocked(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas de logros' })
  stats(@CurrentUser('id') userId: string) {
    return this.service.stats(userId);
  }
}
