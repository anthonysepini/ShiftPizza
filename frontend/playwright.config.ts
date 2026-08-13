import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from '@playwright/test';

const appUrl = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  outputDir:
    process.env.PLAYWRIGHT_OUTPUT_DIR ??
    join(tmpdir(), 'shiftpizza-playwright-results'),
  use: {
    baseURL: appUrl,
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
    url: `${appUrl}/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_API_URL: 'http://127.0.0.1:3000',
    },
  },
});
