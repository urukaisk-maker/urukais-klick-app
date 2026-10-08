import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { DailyRewardService } from './daily-reward.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Users')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private users: UsersService,
    private daily: DailyRewardService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Perfil del usuario actual' })
  getMe(@CurrentUser('id') userId: string) {
    return this.users.findMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil' })
  updateMe(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.users.updateMe(userId, data);
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Cambiar contraseña' })
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.users.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Get('daily-reward')
  @ApiOperation({ summary: 'Estado de la recompensa diaria' })
  checkDaily(@CurrentUser('id') userId: string) {
    return this.daily.check(userId);
  }

  @Post('daily-reward/claim')
  @ApiOperation({ summary: 'Reclamar recompensa diaria' })
  claimDaily(@CurrentUser('id') userId: string) {
    return this.daily.claim(userId);
  }
}
