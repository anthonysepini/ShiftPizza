import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ScheduleSource, ScheduleStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as argon2 from 'argon2';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  private getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private getMonthKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private async syncEmployeeFutureSchedule(
    tx: Prisma.TransactionClient,
    employeeId: string,
    workDays: number[],
  ) {
    const today = this.getTodayStart();

    // 1) Busca todos os dias atuais do funcionário de hoje em diante
    const existingFutureDays = await tx.scheduleDay.findMany({
      where: {
        employeeId,
        date: { gte: today },
      },
      select: {
        id: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });

    // 2) Remove da agenda os dias que não pertencem mais às regras novas
    const idsToDelete = existingFutureDays
      .filter((day) => !workDays.includes(day.date.getDay()))
      .map((day) => day.id);

    if (idsToDelete.length > 0) {
      await tx.scheduleDay.deleteMany({
        where: {
          id: { in: idsToDelete },
        },
      });
    }

    // 3) Descobre quais meses já existem gerados no sistema de hoje em diante
    // para também conseguir ADICIONAR dias novos quando um weekday for incluído
    const generatedDates = await tx.scheduleDay.findMany({
      where: {
        date: { gte: today },
      },
      select: {
        date: true,
      },
      distinct: ['date'],
      orderBy: {
        date: 'asc',
      },
    });

    const generatedMonthKeys = new Set(
      generatedDates.map((item) => this.getMonthKey(item.date)),
    );

    if (generatedMonthKeys.size === 0) {
      return;
    }

    // 4) Rebusca os dias restantes após as remoções para evitar duplicidade
    const remainingFutureDays = await tx.scheduleDay.findMany({
      where: {
        employeeId,
        date: { gte: today },
      },
      select: {
        date: true,
      },
    });

    const existingDateKeys = new Set(
      remainingFutureDays.map((item) => item.date.toISOString().split('T')[0]),
    );

    // 5) Cria os dias faltantes nos meses já gerados, respeitando as novas regras
    const rowsToCreate: Array<{
      employeeId: string;
      date: Date;
      status: ScheduleStatus;
      source: ScheduleSource;
    }> = [];

    for (const monthKey of generatedMonthKeys) {
      const [yearStr, monthStr] = monthKey.split('-');
      const year = Number(yearStr);
      const month = Number(monthStr);

      const daysInMonth = new Date(year, month, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);

        if (date < today) continue;

        const weekday = date.getDay();
        if (!workDays.includes(weekday)) continue;

        const dateKey = date.toISOString().split('T')[0];
        if (existingDateKeys.has(dateKey)) continue;

        rowsToCreate.push({
          employeeId,
          date,
          status: ScheduleStatus.SCHEDULED,
          source: ScheduleSource.AUTO,
        });

        existingDateKeys.add(dateKey);
      }
    }

    if (rowsToCreate.length > 0) {
      await tx.scheduleDay.createMany({
        data: rowsToCreate,
        skipDuplicates: true,
      });
    }
  }

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
        await tx.weeklyScheduleRule.deleteMany({
          where: { employeeId: id },
        });

        if (workDays.length > 0) {
          await tx.weeklyScheduleRule.createMany({
            data: workDays.map((weekday) => ({
              employeeId: id,
              weekday,
              shouldWork: true,
            })),
          });
        }

        // SINCRONIZA A AGENDA JÁ GERADA
        await this.syncEmployeeFutureSchedule(tx, id, workDays);
      }

      return tx.employee.update({
        where: { id },
        data: rest,
        include: {
          weeklyRules: { orderBy: { weekday: 'asc' } },
        },
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
      await tx.scheduleDay.deleteMany({ where: { employeeId: id } });

      if (employee.user) {
        await tx.scheduleDay.updateMany({
          where: { changedByUserId: employee.user.id },
          data: { changedByUserId: null },
        });

        await tx.auditLog.deleteMany({
          where: { actorUserId: employee.user.id },
        });

        await tx.user.delete({ where: { id: employee.user.id } });
      }

      await tx.weeklyScheduleRule.deleteMany({ where: { employeeId: id } });
      await tx.employee.delete({ where: { id } });
    });

    return { message: `Funcionário ${employee.fullName} removido com sucesso` };
  }
}
