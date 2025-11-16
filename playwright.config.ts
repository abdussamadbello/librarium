import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

/**
 * Playwright Configuration for Librarium E2E Tests
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
    ...(process.env.CI ? [['github' as const]] : []),
  ],

  // Shared settings for all tests
  use: {
    // Base URL for navigation
    baseURL: process.env.BASE_URL || 'http://localhost:3001',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Action timeout
    actionTimeout: 10 * 1000,

    // Navigation timeout
    navigationTimeout: 15 * 1000,
  },

  // Configure projects for major browsers
  projects: [
    // Unauthenticated tests (login, public pages)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },

    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
    },

    // Tablet viewports
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
      },
    },

    // Authenticated projects using stored auth states
    // These projects reuse authentication state for faster test execution
    {
      name: 'admin-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/admin.json',
      },
      testMatch: /.*admin.*.spec\.ts/,
    },

    {
      name: 'member-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/member.json',
      },
      testMatch: /.*member.*.spec\.ts/,
    },

    {
      name: 'staff-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/staff.json',
      },
      testMatch: /.*staff.*.spec\.ts/,
    },

    {
      name: 'premium-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/premium.json',
      },
      testMatch: /.*premium.*.spec\.ts/,
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.DATABASE_URL || '',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3001',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
    },
  },

  // Global setup/teardown
  globalSetup: require.resolve('./tests/helpers/global-setup.ts'),
  globalTeardown: require.resolve('./tests/helpers/global-teardown.ts'),
});
