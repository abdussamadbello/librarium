import { chromium, FullConfig } from '@playwright/test';
import { resetDatabase, seedTestData } from './db-setup';

/**
 * Global setup runs once before all tests
 * Use this to:
 * - Reset and seed the test database
 * - Perform any one-time setup
 * - Create shared authentication states
 */
async function globalSetup(config: FullConfig) {
  console.log('\n🚀 Starting global test setup...\n');

  try {
    // 1. Reset and seed test database
    console.log('📦 Resetting test database...');
    await resetDatabase();
    console.log('✅ Database reset complete');

    console.log('🌱 Seeding test data...');
    await seedTestData();
    console.log('✅ Test data seeded');

    // 2. Pre-authenticate users and save auth states
    // This speeds up tests by reusing authentication
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3001';
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('🔐 Creating auth states for test users...');

    // Admin auth state
    await page.goto(`${baseURL}/login`);
    await page.fill('#email', 'admin@test.com');
    await page.fill('#password', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${baseURL}/admin/dashboard`);
    await context.storageState({ path: 'tests/.auth/admin.json' });
    console.log('  ✓ Admin auth state saved');

    // Member auth state
    await context.clearCookies();
    await page.goto(`${baseURL}/login`);
    await page.fill('#email', 'member@test.com');
    await page.fill('#password', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${baseURL}/member/dashboard`);
    await context.storageState({ path: 'tests/.auth/member.json' });
    console.log('  ✓ Member auth state saved');

    // Premium member auth state
    await context.clearCookies();
    await page.goto(`${baseURL}/login`);
    await page.fill('#email', 'premium@test.com');
    await page.fill('#password', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${baseURL}/member/dashboard`);
    await context.storageState({ path: 'tests/.auth/premium.json' });
    console.log('  ✓ Premium member auth state saved');

    // Staff auth state
    await context.clearCookies();
    await page.goto(`${baseURL}/login`);
    await page.fill('#email', 'staff@test.com');
    await page.fill('#password', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${baseURL}/admin/dashboard`);
    await context.storageState({ path: 'tests/.auth/staff.json' });
    console.log('  ✓ Staff auth state saved');

    await browser.close();

    console.log('\n✅ Global setup complete!\n');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;
