import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'urukais@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'urukais_chan' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Solo letras, números y _' })
  username: string;

  @ApiProperty({ example: 'MiSuperPassword123' })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;

  @ApiProperty({ example: 'Urukais', required: false })
  @IsString()
  @MaxLength(40)
  displayName?: string;
}