import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private service: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar en tareas, notas, eventos, categorías...' })
  @ApiQuery({ name: 'q', required: true })
  search(@CurrentUser('id') userId: string, @Query('q') q: string) {
    return this.service.search(userId, q);
  }
}