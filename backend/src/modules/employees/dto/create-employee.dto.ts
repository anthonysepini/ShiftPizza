import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: '12345678900', description: 'CPF sem formatação' })
  @IsString()
  cpf!: string;

  @ApiPropertyOptional({ example: '(35) 99999-0000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Atendente' })
  @IsString()
  position!: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: [3, 4, 5, 6, 0],
    description: '0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sab',
  })
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  workDays!: number[];
}
