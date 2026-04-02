import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';

// Configura o adapter igual ao PrismaService
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  // ─── Admin ───────────────────────────────────────────
  await prisma.employee.upsert({
    where: { cpf: '00000000001' },
    update: {},
    create: {
      fullName: 'Administrador',
      cpf: '00000000001',
      phone: '(35) 99999-0001',
      position: 'Gerente',
      user: {
        create: {
          passwordHash: await argon2.hash('admin123'),
          role: 'ADMIN',
        },
      },
      weeklyRules: {
        create: [1, 2, 3, 4, 5].map((weekday) => ({
          weekday,
          shouldWork: true,
        })),
      },
    },
  });

  // ─── Funcionário 1 ───────────────────────────────────
  await prisma.employee.upsert({
    where: { cpf: '00000000002' },
    update: {},
    create: {
      fullName: 'João Silva',
      cpf: '00000000002',
      phone: '(35) 98888-0001',
      position: 'Atendente',
      user: {
        create: {
          passwordHash: await argon2.hash('joao123'),
          role: 'EMPLOYEE',
        },
      },
      weeklyRules: {
        // Qua, Qui, Sex, Sáb, Dom
        create: [3, 4, 5, 6, 0].map((weekday) => ({
          weekday,
          shouldWork: true,
        })),
      },
    },
  });

  // ─── Funcionário 2 ───────────────────────────────────
  await prisma.employee.upsert({
    where: { cpf: '00000000003' },
    update: {},
    create: {
      fullName: 'Maria Souza',
      cpf: '00000000003',
      phone: '(35) 97777-0001',
      position: 'Caixa',
      user: {
        create: {
          passwordHash: await argon2.hash('maria123'),
          role: 'EMPLOYEE',
        },
      },
      weeklyRules: {
        // Seg, Ter, Qua
        create: [1, 2, 3].map((weekday) => ({
          weekday,
          shouldWork: true,
        })),
      },
    },
  });

  console.log('✅ Seed concluído!\n');
  console.log('📋 Usuários de demo:');
  console.log('  Admin  → CPF: 000.000.000-01 | senha: admin123');
  console.log('  João   → CPF: 000.000.000-02 | senha: joao123');
  console.log('  Maria  → CPF: 000.000.000-03 | senha: maria123');
}

main()
  .catch(console.error)
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
