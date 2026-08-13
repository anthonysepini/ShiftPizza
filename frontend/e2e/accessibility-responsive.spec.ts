import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  employeeFixture,
  installApiMock,
  scheduleFixture,
  seedSession,
} from './support/mock-api';

async function expectNoSeriousAxeViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.filter(
    ({ impact }) => impact === 'serious' || impact === 'critical',
  );
  expect(
    violations.map(({ id, impact, nodes }) => ({
      id,
      impact,
      nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    })),
  ).toEqual([]);
}

async function installHealthyApiMock(page: import('@playwright/test').Page) {
  const now = new Date();
  await installApiMock(page, (request) => {
    const path = new URL(request.url()).pathname;
    if (path === '/employees') return { body: [employeeFixture] };
    if (path.startsWith('/employees/')) return { body: employeeFixture };
    if (path === '/schedules/month' || path.startsWith('/schedules/my/')) {
      return { body: [scheduleFixture(now.getFullYear(), now.getMonth() + 1)] };
    }
    if (path === '/demo/status') return { body: { resetEnabled: false } };
    return { body: [] };
  });
}

test('mobile shell gives content the viewport and exposes keyboard navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedSession(page, 'ADMIN');
  await installApiMock(page, () => ({ body: [] }));

  await page.goto('/admin');
  const main = page.getByRole('main');
  const width = await main.evaluate((element) => element.getBoundingClientRect().width);
  expect(width).toBeGreaterThan(350);

  const openMenu = page.getByRole('button', { name: 'Abrir menu' });
  await openMenu.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeHidden();
  await expect(openMenu).toBeFocused();
});

test('modal is labelled, traps focus, and restores focus to its trigger', async ({
  page,
}) => {
  await seedSession(page, 'ADMIN');
  await installApiMock(page, (request) => {
    const path = new URL(request.url()).pathname;
    return { body: path === '/employees' ? [employeeFixture] : [] };
  });

  await page.goto('/admin/employees');
  const trigger = page.getByRole('button', { name: 'Novo funcionário' }).first();
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Novo funcionário' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Nome completo')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Fechar modal' })).toBeFocused();

  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))),
    ).toBe(true);
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('modal keeps focus in an edited field when its parent rerenders', async ({
  page,
}) => {
  await seedSession(page, 'ADMIN');
  await installApiMock(page, (request) => {
    const path = new URL(request.url()).pathname;
    return { body: path === '/employees' ? [employeeFixture] : [] };
  });

  await page.goto('/admin/employees');
  await page.getByRole('button', { name: 'Novo funcionário' }).first().click();

  const nameInput = page.getByRole('dialog', { name: 'Novo funcionário' })
    .getByLabel('Nome completo');
  await nameInput.pressSequentially('Ana', { delay: 30 });

  await expect(nameInput).toHaveValue('Ana');
  await expect(nameInput).toBeFocused();
});

test('employee photo upload rejects non-images with announced feedback', async ({
  page,
}) => {
  await seedSession(page, 'ADMIN');
  await installApiMock(page, (request) => {
    const path = new URL(request.url()).pathname;
    return { body: path === '/employees' ? [employeeFixture] : [] };
  });

  await page.goto('/admin/employees');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'not-a-photo.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not an image'),
  });

  await expect(page.getByRole('alert')).toContainText(
    'Selecione um arquivo de imagem.',
  );
});

test('principal pages have no serious or critical automated violations', async ({
  page,
}) => {
  await installHealthyApiMock(page);

  await page.goto('/login');
  const continueButton = page.getByRole('button', { name: 'Continuar' });
  if (await continueButton.isVisible()) await continueButton.click();
  await expectNoSeriousAxeViolations(page);

  await seedSession(page, 'ADMIN');
  for (const path of [
    '/admin',
    '/admin/employees',
    '/admin/schedule',
    '/admin/audit',
  ]) {
    await page.goto(path);
    await expectNoSeriousAxeViolations(page);
  }

});

test('employee pages remain accessible on a mobile viewport', async ({ page }) => {
  await installHealthyApiMock(page);
  await seedSession(page, 'EMPLOYEE');
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    '/employee',
    '/employee/calendar',
    '/employee/profile',
  ]) {
    await page.goto(path);
    await expectNoSeriousAxeViolations(page);
  }
});

test('responsive shell has no clipping at the required viewports', async ({ page }) => {
  const outputDirectory = join(tmpdir(), 'shiftpizza-final-responsive');
  await mkdir(outputDirectory, { recursive: true });
  await installHealthyApiMock(page);
  await seedSession(page, 'ADMIN');
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/admin/employees');
    await expect(page.getByRole('heading', { name: 'Funcionários', level: 1 })).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      mainWidth: document.querySelector('main')?.getBoundingClientRect().width ?? 0,
      contentPadding: Number.parseFloat(
        getComputedStyle(document.querySelector('main > div') as HTMLElement)
          .paddingLeft,
      ),
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    expect(dimensions.mainWidth).toBeGreaterThan(viewport.width * 0.8);
    expect(dimensions.contentPadding).toBeGreaterThanOrEqual(16);

    await page.screenshot({
      path: join(
        outputDirectory,
        `admin-employees-${viewport.width}x${viewport.height}.png`,
      ),
      fullPage: true,
    });
  }
});

test('demo reset is fail-closed when status cannot be verified', async ({ page }) => {
  await page.route('http://127.0.0.1:3000/demo/status', (route) =>
    route.fulfill({ status: 503, body: '{}' }),
  );
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Resetar demo' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /admin/i })).toBeVisible();
});

test('demo reset is shown only when the server explicitly enables it', async ({ page }) => {
  await page.route('http://127.0.0.1:3000/demo/status', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ resetEnabled: true }),
    }),
  );
  await page.goto('/login');
  await expect(page.getByRole('dialog', { name: /antes de iniciar/i })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('button', { name: 'Resetar demo' })).toBeVisible();
});
