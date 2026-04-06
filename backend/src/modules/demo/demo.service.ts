import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class DemoService {
  constructor(private readonly prisma: PrismaService) {}

  async reset() {
    const seed = [
      {
        fullName: 'Administrador',
        cpf: '00000000001',
        phone: '(35) 99999-0001',
        position: 'Gerente',
        password: 'admin123',
        role: 'ADMIN' as const,
        workDays: [1, 2, 3, 4, 5],
      },
      {
        fullName: 'João Silva',
        cpf: '00000000002',
        phone: '(35) 98888-0001',
        position: 'Atendente',
        password: 'joao123',
        role: 'EMPLOYEE' as const,
        workDays: [3, 4, 5, 6, 0],
      },
      {
        fullName: 'Maria Souza',
        cpf: '00000000003',
        phone: '(35) 97777-0001',
        position: 'Caixa',
        password: 'maria123',
        role: 'EMPLOYEE' as const,
        workDays: [1, 2, 3],
      },
    ];

    // Gera os hashes FORA da transação
    const preparedSeed = await Promise.all(
      seed.map(async (item) => ({
        ...item,
        passwordHash: await argon2.hash(item.password),
      })),
    );

    await this.prisma.$transaction(
      async (tx) => {
        await tx.auditLog.deleteMany();
        await tx.scheduleDay.deleteMany();
        await tx.weeklyScheduleRule.deleteMany();
        await tx.user.deleteMany();
        await tx.employee.deleteMany();

        for (const item of preparedSeed) {
          await tx.employee.create({
            data: {
              fullName: item.fullName,
              cpf: item.cpf,
              phone: item.phone,
              position: item.position,
              isActive: true,
              user: {
                create: {
                  passwordHash: item.passwordHash,
                  role: item.role,
                },
              },
              weeklyRules: {
                create: item.workDays.map((weekday) => ({
                  weekday,
                  shouldWork: true,
                })),
              },
            },
          });
        }
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );

    return {
      message: 'Sistema resetado com sucesso.',
      restored: seed.map((item) => item.fullName),
    };
  }
}
