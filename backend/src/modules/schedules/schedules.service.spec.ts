import { ScheduleSource, ScheduleStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SchedulesService } from './schedules.service';

describe('SchedulesService', () => {
  function createService() {
    const transactionClient = {
      $queryRaw: jest.fn().mockResolvedValue([{ pg_advisory_xact_lock: null }]),
      employee: { findMany: jest.fn() },
      scheduleDay: {
        createMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    const prisma = {
      scheduleDay: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(
        async (callback: (tx: typeof transactionClient) => Promise<unknown>) =>
          callback(transactionClient),
      ),
    };
    const audit = { log: jest.fn() };

    return {
      audit,
      prisma,
      service: new SchedulesService(
        prisma as unknown as PrismaService,
        audit as unknown as AuditService,
      ),
      transactionClient,
    };
  }

  it('uses a half-open UTC range for a month read', async () => {
    const { prisma, service } = createService();
    prisma.scheduleDay.findMany.mockResolvedValue([]);

    await service.getMonthSchedule(2026, 3);

    expect(prisma.scheduleDay.findMany).toHaveBeenCalledWith({
      where: {
        date: {
          gte: new Date('2026-03-01T00:00:00.000Z'),
          lt: new Date('2026-04-01T00:00:00.000Z'),
        },
        status: { not: ScheduleStatus.REMOVED_SHIFT },
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
  });

  it('generates candidate rows once and audits the inserted count in the same transaction', async () => {
    const { audit, prisma, service, transactionClient } = createService();
    transactionClient.employee.findMany.mockResolvedValue([
      {
        id: 'employee-1',
        weeklyRules: [{ shouldWork: true, weekday: 0 }],
      },
    ]);
    transactionClient.scheduleDay.createMany.mockResolvedValue({ count: 4 });
    audit.log.mockResolvedValue(undefined);

    const result = await service.generateMonth(
      { year: 2026, month: 3 },
      'actor-1',
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transactionClient.$queryRaw).toHaveBeenCalledTimes(1);
    expect(
      transactionClient.$queryRaw.mock.invocationCallOrder[0],
    ).toBeLessThan(
      transactionClient.employee.findMany.mock.invocationCallOrder[0],
    );
    expect(transactionClient.scheduleDay.createMany).toHaveBeenCalledTimes(1);
    expect(transactionClient.scheduleDay.createMany).toHaveBeenCalledWith({
      data: [1, 8, 15, 22, 29].map((day) => ({
        employeeId: 'employee-1',
        date: new Date(Date.UTC(2026, 2, day)),
        status: ScheduleStatus.SCHEDULED,
        source: ScheduleSource.AUTO,
      })),
      skipDuplicates: true,
    });
    expect(prisma.scheduleDay.findUnique).not.toHaveBeenCalled();
    expect(prisma.scheduleDay.create).not.toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith(
      {
        actorUserId: 'actor-1',
        action: 'GENERATE_MONTH',
        entity: 'ScheduleDay',
        entityId: '2026-03',
        metadata: { year: 2026, month: 3, created: 4 },
      },
      transactionClient,
    );
    expect(result.created).toBe(4);
  });

  it('audits zero candidates without issuing an empty createMany', async () => {
    const { audit, service, transactionClient } = createService();
    transactionClient.employee.findMany.mockResolvedValue([]);
    audit.log.mockResolvedValue(undefined);

    await expect(
      service.generateMonth({ year: 2026, month: 3 }, 'actor-1'),
    ).resolves.toEqual({
      message: 'Escala gerada com sucesso',
      year: 2026,
      month: 3,
      created: 0,
    });

    expect(transactionClient.scheduleDay.createMany).not.toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { year: 2026, month: 3, created: 0 },
      }),
      transactionClient,
    );
  });

  it('updates a day and writes its audit through one transaction client', async () => {
    const { audit, prisma, service, transactionClient } = createService();
    transactionClient.scheduleDay.findUnique.mockResolvedValue({
      id: 'day-1',
      status: ScheduleStatus.SCHEDULED,
    });
    transactionClient.scheduleDay.update.mockResolvedValue({
      id: 'day-1',
      status: ScheduleStatus.ABSENT,
    });
    audit.log.mockResolvedValue(undefined);

    const result = await service.updateDay(
      'day-1',
      { status: ScheduleStatus.ABSENT, note: 'Atestado' },
      'actor-1',
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transactionClient.$queryRaw).toHaveBeenCalledTimes(1);
    expect(
      transactionClient.$queryRaw.mock.invocationCallOrder[0],
    ).toBeLessThan(
      transactionClient.scheduleDay.findUnique.mock.invocationCallOrder[0],
    );
    expect(prisma.scheduleDay.findUnique).not.toHaveBeenCalled();
    expect(prisma.scheduleDay.update).not.toHaveBeenCalled();
    expect(transactionClient.scheduleDay.update).toHaveBeenCalledWith({
      where: { id: 'day-1' },
      data: {
        status: ScheduleStatus.ABSENT,
        note: 'Atestado',
        source: ScheduleSource.MANUAL,
        changedByUserId: 'actor-1',
      },
    });
    expect(audit.log).toHaveBeenCalledWith(
      {
        actorUserId: 'actor-1',
        action: 'UPDATE_DAY',
        entity: 'ScheduleDay',
        entityId: 'day-1',
        metadata: {
          from: ScheduleStatus.SCHEDULED,
          to: ScheduleStatus.ABSENT,
          note: 'Atestado',
        },
      },
      transactionClient,
    );
    expect(result).toEqual({ id: 'day-1', status: ScheduleStatus.ABSENT });
  });
});
