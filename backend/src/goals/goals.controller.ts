import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@ApiTags('Goals')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private service: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar mis metas' })
  findAll(@CurrentUser('id') userId: string) {
    return this.service.findAll(userId);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.findOne(userId, id);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateGoalDto) {
    return this.service.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.service.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id);
  }

  @Post(':id/milestones')
  @ApiOperation({ summary: 'Añadir hito a la meta' })
  addMilestone(
    @CurrentUser('id') userId: string,
    @Param('id') goalId: string,
    @Body('title') title: string,
  ) {
    return this.service.addMilestone(userId, goalId, title);
  }

  @Patch('milestones/:milestoneId/toggle')
  @ApiOperation({ summary: 'Marcar hito como hecho' })
  toggleMilestone(
    @CurrentUser('id') userId: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    return this.service.toggleMilestone(userId, milestoneId);
  }

  @Delete('milestones/:milestoneId')
  removeMilestone(
    @CurrentUser('id') userId: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    return this.service.removeMilestone(userId, milestoneId);
  }
}
