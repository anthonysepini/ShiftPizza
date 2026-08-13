import {
  IsString,
  MinLength,
  IsNotEmpty,
  Length,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ example: '000.000.000-01', description: 'CPF do funcionário' })
  @Transform(({ value }) => String(value ?? '').replace(/\D/g, ''))
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  cpf!: string;

  @ApiProperty({ example: 'admin123', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  @IsNotEmpty()
  password!: string;
}
