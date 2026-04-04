import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as argon2 from 'argon2';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto) {
    const cpfClean = dto.cpf.replace(/\D/g, '');

    const exists = await this.prisma.employee.findUnique({
      where: { cpf: cpfClean },
    });
    if (exists) throw new ConflictException('CPF já cadastrado');

    const passwordHash = await argon2.hash(dto.password);

    return this.prisma.employee.create({
      data: {
        fullName: dto.fullName,
        cpf: cpfClean,
        phone: dto.phone,
        position: dto.position,
        user: {
          create: { passwordHash, role: Role.EMPLOYEE },
        },
        weeklyRules: {
          create: dto.workDays.map((weekday) => ({
            weekday,
            shouldWork: true,
          })),
        },
      },
      include: {
        user: { select: { id: true, role: true } },
        weeklyRules: { orderBy: { weekday: 'asc' } },
      },
    });
  }

  async findAll() {
    return this.prisma.employee.findMany({
      include: {
        user: { select: { id: true, role: true } },
        weeklyRules: { orderBy: { weekday: 'asc' } },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, role: true } },
        weeklyRules: { orderBy: { weekday: 'asc' } },
      },
    });
    if (!employee) throw new NotFoundException('Funcionário não encontrado');
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id);
    const { workDays, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (workDays !== undefined) {
        await tx.weeklyScheduleRule.deleteMany({ where: { employeeId: id } });
        await tx.weeklyScheduleRule.createMany({
          data: workDays.map((weekday) => ({
            employeeId: id,
            weekday,
            shouldWork: true,
          })),
        });
      }

      return tx.employee.update({
        where: { id },
        data: rest,
        include: { weeklyRules: { orderBy: { weekday: 'asc' } } },
      });
    });
  }

  async toggleActive(id: string, isActive: boolean) {
    await this.findOne(id);
    return this.prisma.employee.update({
      where: { id },
      data: { isActive },
      select: { id: true, fullName: true, isActive: true },
    });
  }

  async remove(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) throw new NotFoundException('Funcionário não encontrado');

    await this.prisma.$transaction(async (tx) => {
      // 1. Remove dias de escala vinculados ao funcionário
      await tx.scheduleDay.deleteMany({ where: { employeeId: id } });

      // 2. Remove registros de escala alterados por este usuário (nullable)
      if (employee.user) {
        await tx.scheduleDay.updateMany({
          where: { changedByUserId: employee.user.id },
          data: { changedByUserId: null },
        });

        // 3. Remove logs de auditoria gerados por este usuário
        await tx.auditLog.deleteMany({
          where: { actorUserId: employee.user.id },
        });

        // 4. Remove o usuário de autenticação
        await tx.user.delete({ where: { id: employee.user.id } });
      }

      // 5. Remove regras semanais
      await tx.weeklyScheduleRule.deleteMany({ where: { employeeId: id } });

      // 6. Remove o funcionário
      await tx.employee.delete({ where: { id } });
    });

    return { message: `Funcionário ${employee.fullName} removido com sucesso` };
  }
}
