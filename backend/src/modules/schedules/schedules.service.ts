import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleSource, ScheduleStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { GenerateMonthDto } from './dto/generate-month.dto';
import { UpdateDayDto } from './dto/update-day.dto';

@Injectable()
export class SchedulesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  private getMonthRange(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  async generateMonth(dto: GenerateMonthDto, actorUserId: string) {
    const { year, month } = dto;

    const employees = await this.prisma.employee.findMany({
      where: { isActive: true },
      include: { weeklyRules: true },
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    let created = 0;

    for (const employee of employees) {
      const workingWeekdays = employee.weeklyRules
        .filter((r) => r.shouldWork)
        .map((r) => r.weekday);

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const weekday = date.getDay();

        if (!workingWeekdays.includes(weekday)) continue;

        const exists = await this.prisma.scheduleDay.findUnique({
          where: {
            employeeId_date: {
              employeeId: employee.id,
              date,
            },
          },
        });

        if (!exists) {
          await this.prisma.scheduleDay.create({
            data: {
              employeeId: employee.id,
              date,
              status: ScheduleStatus.SCHEDULED,
              source: ScheduleSource.AUTO,
            },
          });
          created++;
        }
      }
    }

    await this.audit.log({
      actorUserId,
      action: 'GENERATE_MONTH',
      entity: 'ScheduleDay',
      entityId: `${year}-${String(month).padStart(2, '0')}`,
      metadata: { year, month, created },
    });

    return {
      message: 'Escala gerada com sucesso',
      year,
      month,
      created,
    };
  }

  async getMonthSchedule(year: number, month: number, employeeId?: string) {
    const { start, end } = this.getMonthRange(year, month);

    return this.prisma.scheduleDay.findMany({
      where: {
        date: { gte: start, lte: end },
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
    const existing = await this.prisma.scheduleDay.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Dia não encontrado na escala');
    }

    const updated = await this.prisma.scheduleDay.update({
      where: { id },
      data: {
        status: dto.status,
        note: dto.note ?? null,
        source: ScheduleSource.MANUAL,
        changedByUserId: actorUserId,
      },
    });

    await this.audit.log({
      actorUserId,
      action: 'UPDATE_DAY',
      entity: 'ScheduleDay',
      entityId: id,
      metadata: {
        from: existing.status as string,
        to: dto.status as string,
        note: dto.note ?? null,
      },
    });

    return updated;
  }

  async getEmployeeSchedule(employeeId: string, year: number, month: number) {
    const { start, end } = this.getMonthRange(year, month);

    return this.prisma.scheduleDay.findMany({
      where: {
        employeeId,
        date: { gte: start, lte: end },
        status: { not: ScheduleStatus.REMOVED_SHIFT },
      },
      orderBy: { date: 'asc' },
    });
  }
}
