  @ApiProperty({ example: 'Urukais', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  displayName?: string;

  import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';