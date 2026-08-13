import { expect, test } from '@playwright/test';
import {
  employeeFixture,
  installApiMock,
  scheduleFixture,
  seedSession,
} from './support/mock-api';

test('failed schedule load is an error, never an empty generated state', async ({
  page,
}) => {
  await seedSession(page, 'ADMIN');
  await installApiMock(page, (request) => {
    const path = new URL(request.url()).pathname;
    return path === '/schedules/month'
      ? { status: 500, body: { message: 'failure' } }
      : { body: [] };
  });

  await page.goto('/admin/schedule');

  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível carregar a escala',
  );
  await expect(
    page.getByText('Escala não gerada para este período'),
  ).toHaveCount(0);
  await expect(page.getByRole('button', { name: /tentar novamente/i })).toBeVisible();
});

test('failed dashboard load never presents fabricated zero metrics', async ({
  page,
}) => {
  await seedSession(page, 'ADMIN');
  await installApiMock(page, () => ({
    status: 503,
    body: { message: 'temporarily unavailable' },
  }));

  await page.goto('/admin');

  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível carregar o dashboard',
  );
  await expect(page.getByText('Funcionários ativos')).toHaveCount(0);
});

test('child mutation feedback is announced by the page toast region', async ({
  page,
}) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  await seedSession(page, 'ADMIN');
  await installApiMock(page, (request) => {
    const url = new URL(request.url());
    if (url.pathname === '/employees') return { body: [employeeFixture] };
    if (url.pathname === '/schedules/month') {
      return {
        body: [
          {
            ...scheduleFixture(year, month),
            date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          },
        ],
      };
    }
    if (url.pathname.startsWith('/schedules/day/')) {
      return { body: scheduleFixture(year, month) };
    }
    return { body: employeeFixture };
  });

  await page.goto('/admin/employees');
  await page.getByRole('button', { name: 'Marcar falta' }).click();
  const dialog = page.getByRole('dialog', { name: 'Marcar falta' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Registrar falta' }).click();

  await expect(page.getByRole('status')).toContainText(
    'Falta registrada para Maria Operadora',
  );
});

test('a failed schedule sync never reports a successful synchronization', async ({
  page,
}) => {
  await seedSession(page, 'ADMIN');
  await installApiMock(page, (request) => {
    const url = new URL(request.url());
    if (url.pathname === '/employees' && request.method() === 'GET') {
      return { body: [employeeFixture] };
    }
    if (url.pathname.startsWith('/employees/') && request.method() === 'PATCH') {
      return { body: employeeFixture };
    }
    if (url.pathname === '/schedules/generate') {
      return { status: 500, body: { message: 'sync failed' } };
    }
    return { body: [] };
  });

  await page.goto('/admin/employees');
  await page.getByRole('button', { name: 'Editar Maria Operadora' }).click();
  await page.getByRole('button', { name: 'Salvar alterações' }).click();

  await expect(page.getByRole('alert')).toContainText(
    'não foi possível sincronizar a escala',
  );
  await expect(page.getByText('Escala do mês sincronizada.')).toHaveCount(0);
});

test('an older schedule response cannot overwrite the selected month', async ({
  page,
}) => {
  const now = new Date();
  const initialYear = now.getFullYear();
  const initialMonth = now.getMonth() + 1;
  const nextYear = initialMonth === 12 ? initialYear + 1 : initialYear;
  const nextMonth = initialMonth === 12 ? 1 : initialMonth + 1;

  await seedSession(page, 'ADMIN');
  await installApiMock(page, (request) => {
    const url = new URL(request.url());
    if (url.pathname === '/employees') return { body: [employeeFixture] };
    if (url.pathname !== '/schedules/month') return { body: [] };

    const requestedMonth = Number(url.searchParams.get('month'));
    return requestedMonth === initialMonth
      ? {
          body: [scheduleFixture(initialYear, initialMonth, 'Resposta antiga')],
          delayMs: 350,
        }
      : {
          body: [scheduleFixture(nextYear, nextMonth, 'Resposta nova')],
          delayMs: 10,
        };
  });

  await page.goto('/admin/schedule');
  await page.getByRole('button', { name: 'Próximo mês' }).click();

  await expect(page.getByText('Resposta nova')).toBeVisible();
  await page.waitForTimeout(450);
  await expect(page.getByText('Resposta nova')).toBeVisible();
  await expect(page.getByText('Resposta antiga')).toHaveCount(0);
});
