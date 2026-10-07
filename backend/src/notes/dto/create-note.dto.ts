import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
  IsDateString,
} from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ example: 'Mi primer día con Urukais' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Hoy empezó todo...' })
  @IsString()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mood?: string;

  @ApiProperty({ example: '😊', required: false })
  @IsOptional()
  @IsString()
  moodEmoji?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDiary?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  date?: string;
}
