import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from '@playwright/test';

const appUrl = 'http://127.0.0.1:4173';
const outputDir = process.env.CI
  ? 'test-results'
  : join(tmpdir(), 'shiftpizza-playwright-results');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? outputDir,
  use: {
    baseURL: appUrl,
    browserName: 'chromium',
    screenshot: 'only-on-failure',
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
