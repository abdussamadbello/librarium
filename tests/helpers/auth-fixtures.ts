import { test as base, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { TEST_USERS } from '../fixtures';

/**
 * Custom fixtures for authenticated test sessions
 * 
 * This module provides custom Playwright test fixtures that simplify
 * authentication in tests by providing pre-configured authenticated
 * contexts and pages.
 * 
 * Usage:
 * 
 * Option 1: Use pre-authenticated storage state (fastest, recommended for most tests)
 * ```ts
 * import { test } from '../helpers/auth-fixtures';
 * 
 * test.use({ storageState: 'tests/.auth/admin.json' });
 * test('admin test', async ({ page }) => {
 *   await page.goto('/admin/dashboard');
 *   // Already authenticated as admin
 * });
 * ```
 * 
 * Option 2: Use authenticatedPage fixture (for tests that need fresh login)
 * ```ts
 * import { test } from '../helpers/auth-fixtures';
 * 
 * test('test with fresh login', async ({ authenticatedPage }) => {
 *   const page = await authenticatedPage('admin');
 *   // Page is now logged in as admin
 * });
 * ```
 */

type AuthRole = 'admin' | 'staff' | 'member' | 'premium' | 'student' | 'director';

interface AuthFixtures {
  /**
   * Provides a page that is authenticated as the specified role.
   * This performs a fresh login, so use sparingly.
   * For better performance, use `test.use({ storageState: 'tests/.auth/role.json' })`
   */
  authenticatedPage: (role: AuthRole) => Promise<typeof base.prototype.page>;
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page, context }, use) => {
    const loginAsRole = async (role: AuthRole) => {
      const user = TEST_USERS[role];
      if (!user) {
        throw new Error(`Unknown role: ${role}`);
      }

      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.loginWithEmail(user.email, user.password);

      // Wait for successful navigation
      const expectedPaths: Record<AuthRole, RegExp> = {
        admin: /\/admin\//,
        staff: /\/admin\//,
        director: /\/admin\//,
        member: /\/member\//,
        premium: /\/member\//,
        student: /\/member\//,
      };

      await expect(page).toHaveURL(expectedPaths[role]);
      return page;
    };

    await use(loginAsRole);
  },
});

export { expect };

/**
 * Helper function to get storage state path for a role
 */
export function getStorageStatePath(role: AuthRole): string {
  return `tests/.auth/${role}.json`;
}

/**
 * Auth state constants for easy import
 */
export const AUTH_STATES = {
  admin: 'tests/.auth/admin.json',
  staff: 'tests/.auth/staff.json',
  member: 'tests/.auth/member.json',
  premium: 'tests/.auth/premium.json',
  student: 'tests/.auth/student.json',
  director: 'tests/.auth/director.json',
} as const;
