import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@ApiTags('Habits')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private service: HabitsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar mis hábitos' })
  findAll(@CurrentUser('id') userId: string) {
    return this.service.findAll(userId);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.findOne(userId, id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Historial del hábito' })
  logs(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Query('days') days?: string,
  ) {
    return this.service.getLogs(userId, id, days ? Number(days) : 30);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateHabitDto) {
    return this.service.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
  ) {
    return this.service.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id);
  }

  @Post(':id/check')
  @ApiOperation({ summary: 'Marcar hábito como hecho hoy' })
  check(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.check(userId, id);
  }

  @Post(':id/uncheck')
  @ApiOperation({ summary: 'Desmarcar el hábito de hoy' })
  uncheck(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.uncheck(userId, id);
  }
}
