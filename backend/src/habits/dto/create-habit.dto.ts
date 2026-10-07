import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateHabitDto {
  @ApiProperty({ example: 'Beber 2L de agua' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '🔥', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: '#FFB7C5', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 'daily', required: false })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiProperty({
    example: [1, 2, 3, 4, 5],
    description: 'Días de la semana (0=Dom, 6=Sáb)',
    required: false,
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  targetDays?: number[];

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  targetCount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
