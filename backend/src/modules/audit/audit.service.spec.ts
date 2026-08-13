import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  it('writes through a supplied transaction client', async () => {
    const prisma = {
      auditLog: { create: jest.fn() },
    };
    const transactionClient = {
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };
    const service = new AuditService(prisma as unknown as PrismaService);

    await service.log(
      {
        actorUserId: 'actor-1',
        action: 'UPDATE_DAY',
        entity: 'ScheduleDay',
        entityId: 'day-1',
      },
      transactionClient as unknown as Pick<
        Prisma.TransactionClient,
        'auditLog'
      >,
    );

    expect(transactionClient.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorUserId: 'actor-1',
        action: 'UPDATE_DAY',
        entity: 'ScheduleDay',
        entityId: 'day-1',
        metadata: {},
      },
    });
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
  });

  it('selects only public actor fields for HTTP audit rows', async () => {
    const publicRows = [
      {
        id: 'audit-1',
        actorUserId: 'actor-1',
        action: 'UPDATE_DAY',
        entity: 'ScheduleDay',
        entityId: 'day-1',
        metadata: {},
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        actor: {
          id: 'actor-1',
          role: Role.ADMIN,
          employee: { fullName: 'Administrador' },
        },
      },
    ];
    const prisma = {
      auditLog: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue(publicRows),
      },
    };
    const service = new AuditService(prisma as unknown as PrismaService);

    const result = await service.findAll(25);

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      take: 25,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        actorUserId: true,
        action: true,
        entity: true,
        entityId: true,
        metadata: true,
        createdAt: true,
        actor: {
          select: {
            id: true,
            role: true,
            employee: { select: { fullName: true } },
          },
        },
      },
    });
    expect(result).toEqual(publicRows);
    expect(result[0]?.actor).not.toHaveProperty('passwordHash');
  });
});
