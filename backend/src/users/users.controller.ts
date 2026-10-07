import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

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
}