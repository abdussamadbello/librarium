import { FullConfig } from '@playwright/test';
import { cleanupDatabase } from './db-setup';
import fs from 'fs/promises';
import path from 'path';

/**
 * Global teardown runs once after all tests complete
 * Use this to:
 * - Clean up test database
 * - Remove temporary files
 * - Close connections
 */
async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 Starting global test teardown...\n');

  try {
    // 1. Clean up test database (optional - keep for debugging)
    if (process.env.CLEANUP_DB === 'true') {
      console.log('🗑️  Cleaning up test database...');
      await cleanupDatabase();
      console.log('✅ Database cleanup complete');
    } else {
      console.log('ℹ️  Skipping database cleanup (set CLEANUP_DB=true to enable)');
    }

    // 2. Remove auth state files
    const authDir = path.join(__dirname, '..', '.auth');
    try {
      await fs.rm(authDir, { recursive: true, force: true });
      console.log('✅ Auth state files removed');
    } catch (error) {
      console.log('ℹ️  No auth state files to remove');
    }

    console.log('\n✅ Global teardown complete!\n');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw - teardown failures shouldn't fail the test suite
  }
}

export default globalTeardown;
