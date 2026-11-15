import { defineConfig } from '@playwright/test'
import { testBaseUrl, testDatabaseUrl, testSecret } from './tests/config'

export default defineConfig({
  testDir: './tests',
  workers: 1,
  fullyParallel: false,
  use: { baseURL: testBaseUrl, browserName: 'chromium', launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined } },
  webServer: {
    command: 'node_modules/.bin/next dev --hostname 127.0.0.1 --port 3100',
    url: testBaseUrl,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { BOARD_TEST_MODE: '1', DATABASE_URL: testDatabaseUrl, BETTER_AUTH_SECRET: testSecret, BETTER_AUTH_URL: testBaseUrl, NEXT_PUBLIC_API_URL: testBaseUrl, GITHUB_CLIENT_ID: 'test', GITHUB_CLIENT_SECRET: 'test' },
  },
})
