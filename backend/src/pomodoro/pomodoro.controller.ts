import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PomodoroService } from './pomodoro.service';

@ApiTags('Pomodoro')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('pomodoro')
export class PomodoroController {
  constructor(private service: PomodoroService) {}

  @Post('start')
  @ApiOperation({ summary: 'Iniciar sesión Pomodoro' })
  start(
    @CurrentUser('id') userId: string,
    @Body('taskId') taskId?: string,
    @Body('durationMin') durationMin?: number,
  ) {
    return this.service.start(userId, taskId, durationMin);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Completar Pomodoro (+15 XP, +3 coins)' })
  complete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.complete(userId, id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Historial de pomodoros' })
  history(
    @CurrentUser('id') userId: string,
    @Query('days') days?: string,
  ) {
    return this.service.history(userId, days ? Number(days) : 7);
  }
}
