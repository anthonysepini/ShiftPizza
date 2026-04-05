import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CpfValidator } from '../dto/validators/cpfvalidator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString({ message: 'O nome completo é obrigatório.' })
  fullName!: string;

  @ApiProperty({
    example: '12345678900',
    description: 'CPF sem formatação',
  })
  @Transform(({ value }) => String(value ?? '').replace(/\D/g, ''))
  @IsString({ message: 'O CPF é obrigatório.' })
  @Length(11, 11, { message: 'O CPF deve conter exatamente 11 dígitos.' })
  @Validate(CpfValidator)
  cpf!: string;

  @ApiPropertyOptional({ example: '(35) 99999-0000' })
  @IsOptional()
  @IsString({ message: 'O telefone deve ser um texto válido.' })
  phone?: string;

  @ApiProperty({ example: 'Atendente' })
  @IsString({ message: 'O cargo é obrigatório.' })
  position!: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString({ message: 'A senha é obrigatória.' })
  @MinLength(6, { message: 'A senha deve conter no mínimo 6 caracteres.' })
  password!: string;

  @ApiProperty({
    example: [3, 4, 5, 6, 0],
    description: '0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sab',
  })
  @IsArray({ message: 'Os dias de trabalho devem ser uma lista.' })
  @ArrayMinSize(1, { message: 'Selecione ao menos um dia de trabalho.' })
  @IsInt({
    each: true,
    message: 'Cada dia de trabalho deve ser um número inteiro.',
  })
  @Min(0, {
    each: true,
    message: 'Os dias de trabalho devem estar entre 0 e 6.',
  })
  @Max(6, {
    each: true,
    message: 'Os dias de trabalho devem estar entre 0 e 6.',
  })
  workDays!: number[];
}
