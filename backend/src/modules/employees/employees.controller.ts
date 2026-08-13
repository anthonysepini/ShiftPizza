import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ToggleActiveDto } from './dto/toggle-active.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Funcionário criado' })
  @ApiOperation({ summary: 'Cadastrar funcionário (Admin)' })
  create(
    @Body() dto: CreateEmployeeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.create(dto, user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar todos os funcionários (Admin)' })
  @ApiOkResponse({ description: 'Lista de funcionários' })
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar funcionário por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    if (user.role !== Role.ADMIN && user.employeeId !== id) {
      throw new ForbiddenException('Acesso ao perfil não permitido');
    }
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar dados do funcionário (Admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeesService.update(id, dto, user.id);
  }

  @Patch(':id/active')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Ativar ou desativar funcionário (Admin)' })
  toggleActive(
    @Param('id') id: string,
    @Body() dto: ToggleActiveDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isActive: boolean = dto.isActive;
    return this.employeesService.toggleActive(id, isActive, user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover funcionário permanentemente (Admin)' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.employeesService.remove(id, user.id);
  }
}
