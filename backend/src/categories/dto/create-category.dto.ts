import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsHexColor,
  MaxLength,
  MinLength,
  IsInt,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Vida Diaria' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name: string;

  @ApiProperty({ example: 'vida-diaria', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ example: '🌸', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: '#FFB7C5', required: false })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  order?: number;
}
