import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AudiusService } from './audius.service';

@ApiTags('Audius (Música)')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('audius')
export class AudiusController {
  constructor(private service: AudiusService) {}

  @Get('search')
  @ApiOperation({ summary: 'Buscar canciones en Audius' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') query: string) {
    return this.service.searchTracks(query);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Canciones populares de Audius' })
  @ApiQuery({ name: 'genre', required: false })
  trending(@Query('genre') genre?: string) {
    return this.service.getTrendingTracks(genre);
  }

  @Get('stream/:id')
  @ApiOperation({ summary: 'URL del stream de una canción' })
  stream(@Param('id') id: string) {
    return this.service.getTrackStream(id);
  }
}
