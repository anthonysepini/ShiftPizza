import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { DemoService } from './demo.service';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('test-hash'),
}));

describe('DemoService', () => {
  it('serializes the destructive reset before touching application tables', async () => {
    const transactionClient = {
      $queryRaw: jest.fn().mockResolvedValue([{ pg_advisory_xact_lock: null }]),
      auditLog: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      scheduleDay: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      weeklyScheduleRule: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      user: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      employee: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({ id: 'employee-1' }),
      },
    };
    const prisma = {
      $transaction: jest.fn(
        async (callback: (tx: typeof transactionClient) => Promise<unknown>) =>
          callback(transactionClient),
      ),
    };
    const service = new DemoService(prisma as unknown as PrismaService);

    await service.reset();

    expect(argon2.hash).toHaveBeenCalledTimes(3);
    expect(transactionClient.$queryRaw).toHaveBeenCalledTimes(1);
    expect(
      transactionClient.$queryRaw.mock.invocationCallOrder[0],
    ).toBeLessThan(
      transactionClient.auditLog.deleteMany.mock.invocationCallOrder[0],
    );
  });
});
