import {
  Body,
  Controller,
  Get,
  Param,
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
import { ParseBoundedIntPipe } from '../../common/pipes/parse-bounded-int.pipe';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

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
    @CurrentUser() user: AuthenticatedUser,
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
    @Query('year', new ParseBoundedIntPipe(2020, 2100, 'year')) year: number,
    @Query('month', new ParseBoundedIntPipe(1, 12, 'month')) month: number,
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
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.schedulesService.updateDay(id, dto, user.id);
  }

  @Get('my/:year/:month')
  @ApiOperation({ summary: 'Ver minha escala do mês (Funcionário)' })
  getMySchedule(
    @Param('year', new ParseBoundedIntPipe(2020, 2100, 'year')) year: number,
    @Param('month', new ParseBoundedIntPipe(1, 12, 'month')) month: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.schedulesService.getEmployeeSchedule(
      user.employeeId,
      year,
      month,
    );
  }
}
