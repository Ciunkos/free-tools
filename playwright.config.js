// @ts-check
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests', testMatch: /.*\.spec\.js/, timeout: 60000, retries: 0,
  use: { baseURL: 'http://127.0.0.1:8798' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } }
  ],
  webServer: { command: 'npx wrangler dev --port 8798', url: 'http://127.0.0.1:8798/free-tools/api/health', reuseExistingServer: true, timeout: 60000 }
});
