import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RecipesService } from './recipes.service';

@ApiTags('Recetas (Cocina)')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('recipes')
export class RecipesController {
  constructor(private service: RecipesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Buscar recetas por nombre' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') query: string) {
    return this.service.searchRecipes(query);
  }

  @Get('area/:area')
  @ApiOperation({ summary: 'Recetas por país/cultura (ej: Spanish)' })
  byArea(@Param('area') area: string) {
    return this.service.getByArea(area);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Recetas por categoría (ej: Seafood)' })
  byCategory(@Param('category') category: string) {
    return this.service.getByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver receta detallada por ID' })
  getOne(@Param('id') id: string) {
    return this.service.getRecipe(id);
  }
}