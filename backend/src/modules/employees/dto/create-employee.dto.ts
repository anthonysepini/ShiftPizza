import { Transform, type TransformFnParams } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CpfValidator } from '../dto/validators/cpfvalidator';

function trimText({ value }: TransformFnParams): unknown {
  const input: unknown = value;
  return typeof input === 'string' ? input.trim() : input;
}

export class CreateEmployeeDto {
  @ApiProperty({ example: 'João Silva' })
  @Transform(trimText)
  @IsString({ message: 'O nome completo é obrigatório.' })
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  @MaxLength(120, {
    message: 'O nome completo deve ter no máximo 120 caracteres.',
  })
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
  @Transform(trimText)
  @IsString({ message: 'O telefone deve ser um texto válido.' })
  @MaxLength(30, {
    message: 'O telefone deve ter no máximo 30 caracteres.',
  })
  phone?: string;

  @ApiProperty({ example: 'Atendente' })
  @Transform(trimText)
  @IsString({ message: 'O cargo é obrigatório.' })
  @IsNotEmpty({ message: 'O cargo é obrigatório.' })
  @MaxLength(80, { message: 'O cargo deve ter no máximo 80 caracteres.' })
  position!: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString({ message: 'A senha é obrigatória.' })
  @MinLength(6, { message: 'A senha deve conter no mínimo 6 caracteres.' })
  @MaxLength(128, { message: 'A senha deve ter no máximo 128 caracteres.' })
  password!: string;

  @ApiProperty({
    example: [3, 4, 5, 6, 0],
    description: '0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sab',
  })
  @IsArray({ message: 'Os dias de trabalho devem ser uma lista.' })
  @ArrayMinSize(1, { message: 'Selecione ao menos um dia de trabalho.' })
  @ArrayUnique({ message: 'Os dias de trabalho não podem se repetir.' })
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
