import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(10, {
    message: 'La contraseña debe tener al menos 10 caracteres',
  })
  @MaxLength(64)
  @Matches(/[A-Z]/, { message: 'Debe tener al menos una MAYÚSCULA' })
  @Matches(/[a-z]/, { message: 'Debe tener al menos una minúscula' })
  @Matches(/[0-9]/, { message: 'Debe tener al menos un número' })
  @Matches(/[!@#$%^&*(),.?":{}|<>_\-\[\]\/\\+=~`;]/, {
    message: 'Debe tener al menos un carácter especial',
  })
  newPassword: string;
}
