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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';

@ApiTags('Categories')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas mis categorías' })
  findAll(@CurrentUser('id') userId: string) {
    return this.service.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver una categoría' })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.findOne(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear categoría' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateCategoryDto) {
    return this.service.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Borrar categoría (soft delete)' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id);
  }

  @Post(':id/subcategories')
  @ApiOperation({ summary: 'Añadir subcategoría' })
  addSub(
    @CurrentUser('id') userId: string,
    @Param('id') categoryId: string,
    @Body() dto: CreateSubcategoryDto,
  ) {
    return this.service.addSubcategory(userId, categoryId, dto);
  }

  @Delete('subcategories/:subId')
  @ApiOperation({ summary: 'Borrar subcategoría' })
  removeSub(@CurrentUser('id') userId: string, @Param('subId') subId: string) {
    return this.service.removeSubcategory(userId, subId);
  }
}
