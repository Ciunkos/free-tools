// @ts-check
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests', testMatch: /.*\.spec\.js/, timeout: 60000, retries: 0,
  use: { baseURL: 'http://127.0.0.1:8842' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testMatch: /pages\.spec\.js/ },
    { name: 'mobile', use: { ...devices['iPhone 13'] }, testMatch: /pages\.spec\.js/ },
    /* Real conversions need H.264 and AAC, which Playwright's own Chromium lacks: installed Google Chrome runs them. */
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome', acceptDownloads: true }, testMatch: /converter\.spec\.js/ }
  ],
  webServer: { command: 'npx wrangler dev --port 8842', url: 'http://127.0.0.1:8842/free-tools/health', reuseExistingServer: true, timeout: 60000 }
});
