import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../../../prisma/prisma.service';
import { LoginUseCase } from './login.use-case';

jest.mock('argon2', () => ({
  verify: jest.fn(),
}));

describe('LoginUseCase', () => {
  const findUnique = jest.fn();
  const sign = jest.fn().mockReturnValue('signed-token');
  const verify = argon2.verify as jest.MockedFunction<typeof argon2.verify>;
  const useCase = new LoginUseCase(
    {
      employee: { findUnique },
    } as unknown as PrismaService,
    { sign } as unknown as JwtService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('performs a password verification for an unknown CPF', async () => {
    findUnique.mockResolvedValue(null);
    verify.mockResolvedValue(false);

    await expect(
      useCase.execute({ cpf: '52998224725', password: 'secret1' }),
    ).rejects.toEqual(
      expect.objectContaining({
        message: 'CPF ou senha incorretos',
      }),
    );

    expect(verify).toHaveBeenCalledTimes(1);
  });

  it('does not reveal that a valid account is inactive', async () => {
    findUnique.mockResolvedValue({
      id: 'employee-1',
      fullName: 'Maria Oliveira',
      isActive: false,
      user: {
        id: 'user-1',
        role: Role.EMPLOYEE,
        passwordHash: 'stored-hash',
      },
    });
    verify.mockResolvedValue(true);

    await expect(
      useCase.execute({ cpf: '52998224725', password: 'secret1' }),
    ).rejects.toEqual(
      expect.objectContaining({
        message: 'CPF ou senha incorretos',
      }),
    );

    expect(verify).toHaveBeenCalledWith('stored-hash', 'secret1');
  });

  it('returns the existing successful login contract', async () => {
    findUnique.mockResolvedValue({
      id: 'employee-1',
      fullName: 'Maria Oliveira',
      isActive: true,
      user: {
        id: 'user-1',
        role: Role.EMPLOYEE,
        passwordHash: 'stored-hash',
      },
    });
    verify.mockResolvedValue(true);

    await expect(
      useCase.execute({ cpf: '52998224725', password: 'secret1' }),
    ).resolves.toEqual({
      accessToken: 'signed-token',
      user: {
        id: 'user-1',
        employeeId: 'employee-1',
        fullName: 'Maria Oliveira',
        role: Role.EMPLOYEE,
      },
    });
    expect(sign).toHaveBeenCalledWith({
      sub: 'user-1',
      role: Role.EMPLOYEE,
    });
  });

  it('rejects an invalid password', async () => {
    findUnique.mockResolvedValue({
      id: 'employee-1',
      fullName: 'Maria Oliveira',
      isActive: true,
      user: {
        id: 'user-1',
        role: Role.EMPLOYEE,
        passwordHash: 'stored-hash',
      },
    });
    verify.mockResolvedValue(false);

    await expect(
      useCase.execute({ cpf: '52998224725', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
