import type { Page, Request } from '@playwright/test';

export type TestRole = 'ADMIN' | 'EMPLOYEE';

export type MockResponse = {
  body?: unknown;
  delayMs?: number;
  status?: number;
};

export const API_URL = 'http://127.0.0.1:3000';

export async function seedSession(page: Page, role: TestRole) {
  await page.addInitScript((storedRole: TestRole) => {
    localStorage.setItem('sp_token', 'e2e-token');
    localStorage.setItem(
      'sp_user',
      JSON.stringify({
        id: `user-${storedRole.toLowerCase()}`,
        employeeId: `employee-${storedRole.toLowerCase()}`,
        fullName: storedRole === 'ADMIN' ? 'Admin E2E' : 'Funcionário E2E',
        role: storedRole,
      }),
    );
  }, role);
}

export async function installApiMock(
  page: Page,
  respond: (request: Request) => MockResponse | Promise<MockResponse>,
) {
  await page.route(`${API_URL}/**`, async (route) => {
    const request = route.request();
    const corsHeaders = {
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Origin': '*',
    };

    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    const response = await respond(request);
    if (response.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, response.delayMs));
    }

    await route.fulfill({
      status: response.status ?? 200,
      contentType: 'application/json',
      headers: corsHeaders,
      body: JSON.stringify(response.body ?? []),
    });
  });
}

export const employeeFixture = {
  id: 'employee-admin-target',
  fullName: 'Maria Operadora',
  cpf: '00000000003',
  phone: '11999999999',
  position: 'Pizzaiola',
  isActive: true,
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
  user: { id: 'user-target', role: 'EMPLOYEE' },
  weeklyRules: [
    {
      id: 'rule-1',
      employeeId: 'employee-admin-target',
      weekday: 1,
      shouldWork: true,
    },
  ],
} as const;

export function civilDate(year: number, month: number, day = 1) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function scheduleFixture(
  year: number,
  month: number,
  employeeName = employeeFixture.fullName,
) {
  return {
    id: `schedule-${year}-${month}-${employeeName}`,
    employeeId: employeeFixture.id,
    date: civilDate(year, month),
    status: 'SCHEDULED',
    source: 'AUTO',
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
    employee: { fullName: employeeName, position: 'Pizzaiola' },
  } as const;
}
