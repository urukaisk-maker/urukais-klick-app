import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MissionsService } from './missions.service';

@ApiTags('Missions')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('missions')
export class MissionsController {
  constructor(private service: MissionsService) {}

  @Get('today')
  @ApiOperation({ summary: 'Misiones del día' })
  today(@CurrentUser('id') userId: string) {
    return this.service.getToday(userId);
  }
}