import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { GoalType } from '@prisma/client';

export class CreateGoalDto {
  @ApiProperty({ example: 'Aprender japonés N5' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiProperty({ enum: GoalType, required: false })
  @IsOptional()
  @IsEnum(GoalType)
  type?: GoalType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  targetDate?: string;
}
