import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class DemoService {
  constructor(private prisma: PrismaService) {}

  async reset() {
    // ── 1. Apaga tudo na ordem correta (respeita FK) ──────────
    await this.prisma.auditLog.deleteMany();
    await this.prisma.scheduleDay.deleteMany();
    await this.prisma.weeklyScheduleRule.deleteMany();
    await this.prisma.user.deleteMany();
    await this.prisma.employee.deleteMany();

    // ── 2. Reseed ─────────────────────────────────────────────
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

    for (const s of seed) {
      const passwordHash = await argon2.hash(s.password);
      await this.prisma.employee.create({
        data: {
          fullName: s.fullName,
          cpf: s.cpf,
          phone: s.phone,
          position: s.position,
          isActive: true,
          user: {
            create: { passwordHash, role: s.role },
          },
          weeklyRules: {
            create: s.workDays.map((weekday) => ({
              weekday,
              shouldWork: true,
            })),
          },
        },
      });
    }

    return {
      message: 'Sistema resetado com sucesso.',
      restored: seed.map((s) => s.fullName),
    };
  }
}
