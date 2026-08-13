import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const config = new ConfigService({
    JWT_SECRET: 'a-secure-test-secret-with-32-characters',
  });

  it('rejects a malformed subject before querying the database', async () => {
    const findUnique = jest.fn();
    const strategy = new JwtStrategy({ user: { findUnique } } as never, config);

    await expect(
      strategy.validate({ sub: '', role: 'EMPLOYEE' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('rejects a token whose employee is inactive', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          employeeId: 'employee-1',
          role: 'EMPLOYEE',
          employee: { fullName: 'Joao', isActive: false },
        }),
      },
    };
    const strategy = new JwtStrategy(prisma as never, config);

    await expect(
      strategy.validate({ sub: 'user-1', role: 'EMPLOYEE' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns identity from the database instead of trusting the JWT role', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          employeeId: 'employee-1',
          role: 'EMPLOYEE',
          employee: { fullName: 'Joao', isActive: true },
        }),
      },
    };
    const strategy = new JwtStrategy(prisma as never, config);

    await expect(
      strategy.validate({ sub: 'user-1', role: 'ADMIN' }),
    ).resolves.toEqual({
      id: 'user-1',
      employeeId: 'employee-1',
      role: 'EMPLOYEE',
      fullName: 'Joao',
    });
  });
});
