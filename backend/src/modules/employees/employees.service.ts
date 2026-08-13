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
import {
  createCivilDate,
  getCivilDateInTimeZone,
  getCivilDateKey,
  getCivilWeekday,
} from '../../common/date/civil-date';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';
import { acquireScheduleMutationLock } from '../../common/database/schedule-mutation-lock';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  private getTodayStart() {
    const businessTimeZone =
      this.config.getOrThrow<string>('BUSINESS_TIME_ZONE');
    return getCivilDateInTimeZone(new Date(), businessTimeZone);
  }

  private getMonthKey(date: Date) {
    return getCivilDateKey(date).slice(0, 7);
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
        source: true,
        status: true,
      },
      orderBy: { date: 'asc' },
    });

    // 2) Remove da agenda os dias que não pertencem mais às regras novas
    const idsToDelete = existingFutureDays
      .filter(
        (day) =>
          day.source === ScheduleSource.AUTO &&
          day.status === ScheduleStatus.SCHEDULED &&
          !workDays.includes(getCivilWeekday(day.date)),
      )
      .map((day) => day.id);

    if (idsToDelete.length > 0) {
      await tx.scheduleDay.deleteMany({
        where: {
          id: { in: idsToDelete },
          source: ScheduleSource.AUTO,
          status: ScheduleStatus.SCHEDULED,
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
      remainingFutureDays.map((item) => getCivilDateKey(item.date)),
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

      const daysInMonth = createCivilDate(year, month + 1, 0).getUTCDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = createCivilDate(year, month, day);

        if (date < today) continue;

        const weekday = getCivilWeekday(date);
        if (!workDays.includes(weekday)) continue;

        const dateKey = getCivilDateKey(date);
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

  async create(dto: CreateEmployeeDto, actorUserId: string) {
    const cpfClean = dto.cpf.replace(/\D/g, '');

    const exists = await this.prisma.employee.findUnique({
      where: { cpf: cpfClean },
    });
    if (exists) throw new ConflictException('CPF já cadastrado');

    const passwordHash = await argon2.hash(dto.password);

    return this.prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
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

      await this.audit.log(
        {
          actorUserId,
          action: 'CREATE_EMPLOYEE',
          entity: 'Employee',
          entityId: employee.id,
          metadata: {
            fullName: dto.fullName,
            position: dto.position,
          },
        },
        tx,
      );

      return employee;
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

  async update(id: string, dto: UpdateEmployeeDto, actorUserId: string) {
    await this.findOne(id);
    const { workDays, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (workDays !== undefined) {
        await acquireScheduleMutationLock(tx);

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

      const employee = await tx.employee.update({
        where: { id },
        data: rest,
        include: {
          weeklyRules: { orderBy: { weekday: 'asc' } },
        },
      });

      await this.audit.log(
        {
          actorUserId,
          action: 'UPDATE_EMPLOYEE',
          entity: 'Employee',
          entityId: id,
          metadata: {
            changedFields: Object.keys(dto),
          },
        },
        tx,
      );

      return employee;
    });
  }

  async toggleActive(id: string, isActive: boolean, actorUserId: string) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      await acquireScheduleMutationLock(tx);

      const employee = await tx.employee.update({
        where: { id },
        data: { isActive },
        select: { id: true, fullName: true, isActive: true },
      });

      await this.audit.log(
        {
          actorUserId,
          action: 'TOGGLE_EMPLOYEE_ACTIVE',
          entity: 'Employee',
          entityId: id,
          metadata: { isActive },
        },
        tx,
      );

      return employee;
    });
  }

  async remove(id: string, actorUserId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) throw new NotFoundException('Funcionário não encontrado');

    await this.prisma.$transaction(async (tx) => {
      await acquireScheduleMutationLock(tx);

      await tx.scheduleDay.deleteMany({ where: { employeeId: id } });

      await this.audit.log(
        {
          actorUserId,
          action: 'DELETE_EMPLOYEE',
          entity: 'Employee',
          entityId: id,
          metadata: { fullName: employee.fullName },
        },
        tx,
      );

      if (employee.user) {
        await tx.scheduleDay.updateMany({
          where: { changedByUserId: employee.user.id },
          data: { changedByUserId: null },
        });

        await tx.user.delete({ where: { id: employee.user.id } });
      }

      await tx.weeklyScheduleRule.deleteMany({ where: { employeeId: id } });

      await tx.employee.delete({ where: { id } });
    });

    return { message: `Funcionário ${employee.fullName} removido com sucesso` };
  }
}
