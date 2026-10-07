import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MascotService } from './mascot.service';

@ApiTags('Mascot')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('mascot')
export class MascotController {
  constructor(private service: MascotService) {}

  @Get()
  @ApiOperation({ summary: 'Ver mi mascota' })
  get(@CurrentUser('id') userId: string) {
    return this.service.get(userId);
  }

  @Post('feed')
  @ApiOperation({ summary: 'Alimentar (cuesta 5 monedas)' })
  feed(@CurrentUser('id') userId: string) {
    return this.service.feed(userId);
  }

  @Post('play')
  @ApiOperation({ summary: 'Jugar con la mascota' })
  play(@CurrentUser('id') userId: string) {
    return this.service.play(userId);
  }

  @Post('rest')
  @ApiOperation({ summary: 'Dejar descansar' })
  rest(@CurrentUser('id') userId: string) {
    return this.service.rest(userId);
  }

  @Patch('name')
  @ApiOperation({ summary: 'Renombrar mascota' })
  rename(@CurrentUser('id') userId: string, @Body('name') name: string) {
    return this.service.rename(userId, name);
  }
}
