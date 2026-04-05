import { IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateMonthDto {
  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2020)
  year!: number;

  @ApiProperty({ example: 6, description: 'Mês de 1 a 12' })
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;
}
