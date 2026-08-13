import { ScheduleSource, ScheduleStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmployeesService } from './employees.service';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';

const config = new ConfigService({
  BUSINESS_TIME_ZONE: 'America/Sao_Paulo',
});
const audit = { log: jest.fn().mockResolvedValue(undefined) };

describe('EmployeesService schedule synchronization', () => {
  beforeEach(() => {
    audit.log.mockClear();
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse('2026-03-01T01:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('removes only obsolete automatic scheduled days and generates dates in UTC', async () => {
    const transactionClient = {
      $queryRaw: jest.fn().mockResolvedValue([{ pg_advisory_xact_lock: null }]),
      weeklyScheduleRule: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      scheduleDay: {
        findMany: jest
          .fn()
          .mockResolvedValueOnce([
            {
              id: 'auto-scheduled',
              date: new Date('2026-03-01'),
              source: ScheduleSource.AUTO,
              status: ScheduleStatus.SCHEDULED,
            },
            {
              id: 'manual-scheduled',
              date: new Date('2026-03-01'),
              source: ScheduleSource.MANUAL,
              status: ScheduleStatus.SCHEDULED,
            },
            {
              id: 'auto-absent',
              date: new Date('2026-03-01'),
              source: ScheduleSource.AUTO,
              status: ScheduleStatus.ABSENT,
            },
          ])
          .mockResolvedValueOnce([{ date: new Date('2026-03-01') }])
          .mockResolvedValueOnce([{ date: new Date('2026-03-01') }]),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 5 }),
      },
      employee: {
        update: jest.fn().mockResolvedValue({ id: 'employee-1' }),
      },
    };
    const prisma = {
      employee: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'employee-1',
          user: null,
          weeklyRules: [],
        }),
      },
      $transaction: jest.fn(
        async (callback: (tx: typeof transactionClient) => Promise<unknown>) =>
          callback(transactionClient),
      ),
    };
    const service = new EmployeesService(
      prisma as unknown as PrismaService,
      config,
      audit as unknown as AuditService,
    );

    await service.update('employee-1', { workDays: [1] }, 'admin-1');

    expect(transactionClient.$queryRaw).toHaveBeenCalledTimes(1);
    expect(
      transactionClient.$queryRaw.mock.invocationCallOrder[0],
    ).toBeLessThan(
      transactionClient.weeklyScheduleRule.deleteMany.mock
        .invocationCallOrder[0],
    );
    expect(transactionClient.scheduleDay.findMany).toHaveBeenNthCalledWith(1, {
      where: {
        employeeId: 'employee-1',
        date: { gte: new Date('2026-02-28T00:00:00.000Z') },
      },
      select: {
        id: true,
        date: true,
        source: true,
        status: true,
      },
      orderBy: { date: 'asc' },
    });
    expect(transactionClient.scheduleDay.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['auto-scheduled'] },
        source: ScheduleSource.AUTO,
        status: ScheduleStatus.SCHEDULED,
      },
    });
    expect(transactionClient.scheduleDay.createMany).toHaveBeenCalledWith({
      data: [2, 9, 16, 23, 30].map((day) => ({
        employeeId: 'employee-1',
        date: new Date(Date.UTC(2026, 2, day)),
        status: ScheduleStatus.SCHEDULED,
        source: ScheduleSource.AUTO,
      })),
      skipDuplicates: true,
    });
  });

  it('preserves audit rows when removing the actor user', async () => {
    const transactionClient = {
      $queryRaw: jest.fn().mockResolvedValue([{ pg_advisory_xact_lock: null }]),
      scheduleDay: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      auditLog: {
        deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      user: {
        delete: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
      weeklyScheduleRule: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      employee: {
        delete: jest.fn().mockResolvedValue({ id: 'employee-1' }),
      },
    };
    const prisma = {
      employee: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'employee-1',
          fullName: 'Funcionário Removido',
          user: { id: 'user-1' },
        }),
      },
      $transaction: jest.fn(
        async (callback: (tx: typeof transactionClient) => Promise<unknown>) =>
          callback(transactionClient),
      ),
    };
    const service = new EmployeesService(
      prisma as unknown as PrismaService,
      config,
      audit as unknown as AuditService,
    );

    await service.remove('employee-1', 'admin-1');

    expect(transactionClient.$queryRaw).toHaveBeenCalledTimes(1);
    expect(
      transactionClient.$queryRaw.mock.invocationCallOrder[0],
    ).toBeLessThan(
      transactionClient.scheduleDay.deleteMany.mock.invocationCallOrder[0],
    );
    expect(transactionClient.auditLog.deleteMany).not.toHaveBeenCalled();
    expect(transactionClient.user.delete).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: 'admin-1',
        action: 'DELETE_EMPLOYEE',
        entityId: 'employee-1',
      }),
      transactionClient,
    );
    expect(audit.log.mock.invocationCallOrder[0]).toBeLessThan(
      transactionClient.user.delete.mock.invocationCallOrder[0],
    );
  });

  it('serializes active-state changes before updating the employee', async () => {
    const transactionClient = {
      $queryRaw: jest.fn().mockResolvedValue([{ pg_advisory_xact_lock: null }]),
      employee: {
        update: jest.fn().mockResolvedValue({
          id: 'employee-1',
          fullName: 'Maria Oliveira',
          isActive: false,
        }),
      },
    };
    const prisma = {
      employee: {
        findUnique: jest.fn().mockResolvedValue({ id: 'employee-1' }),
      },
      $transaction: jest.fn(
        async (callback: (tx: typeof transactionClient) => Promise<unknown>) =>
          callback(transactionClient),
      ),
    };
    const service = new EmployeesService(
      prisma as unknown as PrismaService,
      config,
      audit as unknown as AuditService,
    );

    await service.toggleActive('employee-1', false, 'admin-1');

    expect(transactionClient.$queryRaw).toHaveBeenCalledTimes(1);
    expect(
      transactionClient.$queryRaw.mock.invocationCallOrder[0],
    ).toBeLessThan(
      transactionClient.employee.update.mock.invocationCallOrder[0],
    );
  });
});

describe('EmployeesService audit boundaries', () => {
  beforeEach(() => {
    audit.log.mockClear();
  });

  it('creates an employee and its non-sensitive audit entry atomically', async () => {
    const transactionClient = {
      employee: {
        create: jest.fn().mockResolvedValue({
          id: 'employee-1',
          fullName: 'Maria Oliveira',
          position: 'Atendente',
        }),
      },
    };
    const prisma = {
      employee: { findUnique: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn(
        async (callback: (tx: typeof transactionClient) => Promise<unknown>) =>
          callback(transactionClient),
      ),
    };
    const service = new EmployeesService(
      prisma as unknown as PrismaService,
      config,
      audit as unknown as AuditService,
    );

    await service.create(
      {
        fullName: 'Maria Oliveira',
        cpf: '52998224725',
        phone: '(35) 99999-0000',
        position: 'Atendente',
        password: 'secret1',
        workDays: [1, 2, 3],
      },
      'admin-1',
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(audit.log).toHaveBeenCalledWith(
      {
        actorUserId: 'admin-1',
        action: 'CREATE_EMPLOYEE',
        entity: 'Employee',
        entityId: 'employee-1',
        metadata: {
          fullName: 'Maria Oliveira',
          position: 'Atendente',
        },
      },
      transactionClient,
    );
    expect(JSON.stringify(audit.log.mock.calls)).not.toContain('52998224725');
    expect(JSON.stringify(audit.log.mock.calls)).not.toContain('secret1');
  });
});
