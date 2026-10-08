import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'urukais@example.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'urukais_chan' })
  @IsString()
  @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El usuario no puede pasar de 20 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El usuario solo puede tener letras, números y _',
  })
  username: string;

  @ApiProperty({ example: 'MiSuperPassword123!' })
  @IsString()
  @MinLength(10, {
    message: 'La contraseña debe tener al menos 10 caracteres',
  })
  @MaxLength(64, {
    message: 'La contraseña no puede pasar de 64 caracteres',
  })
  @Matches(/[A-Z]/, {
    message: 'La contraseña debe tener al menos una MAYÚSCULA',
  })
  @Matches(/[a-z]/, {
    message: 'La contraseña debe tener al menos una minúscula',
  })
  @Matches(/[0-9]/, {
    message: 'La contraseña debe tener al menos un número',
  })
  @Matches(/[!@#$%^&*(),.?":{}|<>_\-\[\]\/\\+=~`;]/, {
    message: 'La contraseña debe tener al menos un carácter especial',
  })
  password: string;

  @ApiProperty({ example: 'Urukais', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  displayName?: string;
}