import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleSource, ScheduleStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { GenerateMonthDto } from './dto/generate-month.dto';
import { UpdateDayDto } from './dto/update-day.dto';
import { createCivilDate, getCivilWeekday } from '../../common/date/civil-date';
import { acquireScheduleMutationLock } from '../../common/database/schedule-mutation-lock';

@Injectable()
export class SchedulesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  private getMonthRange(year: number, month: number) {
    return {
      start: createCivilDate(year, month, 1),
      nextMonth: createCivilDate(year, month + 1, 1),
    };
  }

  async generateMonth(dto: GenerateMonthDto, actorUserId: string) {
    const { year, month } = dto;

    return this.prisma.$transaction(async (tx) => {
      await acquireScheduleMutationLock(tx);

      const employees = await tx.employee.findMany({
        where: { isActive: true },
        include: { weeklyRules: true },
      });
      const daysInMonth = createCivilDate(year, month + 1, 0).getUTCDate();
      const rowsToCreate: Array<{
        employeeId: string;
        date: Date;
        status: ScheduleStatus;
        source: ScheduleSource;
      }> = [];

      for (const employee of employees) {
        const workingWeekdays = employee.weeklyRules
          .filter((rule) => rule.shouldWork)
          .map((rule) => rule.weekday);

        for (let day = 1; day <= daysInMonth; day += 1) {
          const date = createCivilDate(year, month, day);
          if (!workingWeekdays.includes(getCivilWeekday(date))) continue;

          rowsToCreate.push({
            employeeId: employee.id,
            date,
            status: ScheduleStatus.SCHEDULED,
            source: ScheduleSource.AUTO,
          });
        }
      }

      let created = 0;
      if (rowsToCreate.length > 0) {
        const result = await tx.scheduleDay.createMany({
          data: rowsToCreate,
          skipDuplicates: true,
        });
        created = result.count;
      }

      await this.audit.log(
        {
          actorUserId,
          action: 'GENERATE_MONTH',
          entity: 'ScheduleDay',
          entityId: `${year}-${String(month).padStart(2, '0')}`,
          metadata: { year, month, created },
        },
        tx,
      );

      return {
        message: 'Escala gerada com sucesso',
        year,
        month,
        created,
      };
    });
  }

  async getMonthSchedule(year: number, month: number, employeeId?: string) {
    const { start, nextMonth } = this.getMonthRange(year, month);

    return this.prisma.scheduleDay.findMany({
      where: {
        date: { gte: start, lt: nextMonth },
        status: { not: ScheduleStatus.REMOVED_SHIFT },
        ...(employeeId ? { employeeId } : {}),
      },
      include: {
        employee: {
          select: {
            fullName: true,
            position: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { employee: { fullName: 'asc' } }],
    });
  }

  async updateDay(id: string, dto: UpdateDayDto, actorUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      await acquireScheduleMutationLock(tx);

      const existing = await tx.scheduleDay.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Dia não encontrado na escala');
      }

      const updated = await tx.scheduleDay.update({
        where: { id },
        data: {
          status: dto.status,
          note: dto.note ?? null,
          source: ScheduleSource.MANUAL,
          changedByUserId: actorUserId,
        },
      });

      await this.audit.log(
        {
          actorUserId,
          action: 'UPDATE_DAY',
          entity: 'ScheduleDay',
          entityId: id,
          metadata: {
            from: existing.status as string,
            to: dto.status as string,
            note: dto.note ?? null,
          },
        },
        tx,
      );

      return updated;
    });
  }

  async getEmployeeSchedule(employeeId: string, year: number, month: number) {
    const { start, nextMonth } = this.getMonthRange(year, month);

    return this.prisma.scheduleDay.findMany({
      where: {
        employeeId,
        date: { gte: start, lt: nextMonth },
        status: { not: ScheduleStatus.REMOVED_SHIFT },
      },
      orderBy: { date: 'asc' },
    });
  }
}
