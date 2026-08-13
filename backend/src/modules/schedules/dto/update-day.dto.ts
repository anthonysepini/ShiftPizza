import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleStatus } from '@prisma/client';

export class UpdateDayDto {
  @ApiProperty({ enum: ScheduleStatus, example: 'ABSENT' })
  @IsEnum(ScheduleStatus)
  status!: ScheduleStatus;

  @ApiPropertyOptional({ example: 'Falta justificada por atestado' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
