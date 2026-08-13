import { expect, test, type Page } from '@playwright/test';

type TestRole = 'ADMIN' | 'EMPLOYEE';

const apiUrl = 'http://127.0.0.1:3000';
const adminPaths = ['/employees', '/audit', '/schedules/month'];

async function seedSession(page: Page, role: TestRole) {
  await page.addInitScript((storedRole: TestRole) => {
    localStorage.setItem('sp_token', 'e2e-token');
    localStorage.setItem(
      'sp_user',
      JSON.stringify({
        id: `user-${storedRole.toLowerCase()}`,
        employeeId: `employee-${storedRole.toLowerCase()}`,
        fullName: storedRole === 'ADMIN' ? 'Admin E2E' : 'Employee E2E',
        role: storedRole,
      }),
    );
  }, role);
}

async function mockApi(page: Page): Promise<string[]> {
  const requestedPaths: string[] = [];

  await page.route(`${apiUrl}/**`, async (route) => {
    const request = route.request();
    requestedPaths.push(new URL(request.url()).pathname);

    const corsHeaders = {
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Origin': '*',
    };

    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: corsHeaders,
      body: '[]',
    });
  });

  return requestedPaths;
}

test('redirects an employee before admin pages can request data', async ({
  page,
}) => {
  const requestedPaths = await mockApi(page);
  await seedSession(page, 'EMPLOYEE');

  await page.goto('/admin');

  await expect(page).toHaveURL(/\/employee$/);
  await expect
    .poll(() => requestedPaths.some((path) => path.startsWith('/schedules/my/')))
    .toBe(true);
  expect(requestedPaths.filter((path) => adminPaths.includes(path))).toEqual(
    [],
  );
});

test('redirects an admin before employee pages can request data', async ({
  page,
}) => {
  const requestedPaths = await mockApi(page);
  await seedSession(page, 'ADMIN');

  await page.goto('/employee');

  await expect(page).toHaveURL(/\/admin$/);
  await expect
    .poll(() => requestedPaths.some((path) => adminPaths.includes(path)))
    .toBe(true);
  expect(
    requestedPaths.filter((path) => path.startsWith('/schedules/my/')),
  ).toEqual([]);
});
