import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SchedulesService } from './schedules.service';
import { GenerateMonthDto } from './dto/generate-month.dto';
import { UpdateDayDto } from './dto/update-day.dto';

@ApiTags('schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post('generate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Gerar escala do mês (Admin)' })
  generateMonth(
    @Body() dto: GenerateMonthDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.schedulesService.generateMonth(dto, user.id);
  }

  @Get('month')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Ver escala completa do mês (Admin)' })
  @ApiQuery({ name: 'year', type: Number })
  @ApiQuery({ name: 'month', type: Number })
  @ApiQuery({ name: 'employeeId', required: false })
  getMonthSchedule(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.schedulesService.getMonthSchedule(year, month, employeeId);
  }

  @Patch('day/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Alterar status de um dia (Admin)' })
  updateDay(
    @Param('id') id: string,
    @Body() dto: UpdateDayDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.schedulesService.updateDay(id, dto, user.id);
  }

  @Get('my/:year/:month')
  @ApiOperation({ summary: 'Ver minha escala do mês (Funcionário)' })
  getMySchedule(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @CurrentUser() user: { employeeId: string },
  ) {
    return this.schedulesService.getEmployeeSchedule(
      user.employeeId,
      year,
      month,
    );
  }
}
//```
