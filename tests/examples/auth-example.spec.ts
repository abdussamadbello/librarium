import { test, expect } from '@playwright/test';

/**
 * Example: Using Pre-Authenticated Sessions
 * 
 * This test file demonstrates the proper way to write authenticated tests
 * using storage states for better performance and reliability.
 */

// Apply admin authentication to all tests in this file
test.use({ storageState: 'tests/.auth/admin.json' });

test.describe('Admin Dashboard - With Pre-Authentication', () => {
  test('should access admin dashboard without manual login', async ({ page }) => {
    // Navigate directly to admin dashboard
    // No login needed - we're already authenticated via storage state!
    await page.goto('/admin/dashboard');
    
    // Verify we're on the dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    
    // Verify admin-specific content is visible
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard/i })).toBeVisible();
  });

  test('should maintain session across multiple page navigations', async ({ page }) => {
    // Session persists across navigations
    await page.goto('/admin/books');
    await expect(page).toHaveURL(/\/admin\/books/);
    
    await page.goto('/admin/members');
    await expect(page).toHaveURL(/\/admin\/members/);
    
    // Still authenticated - no login prompts
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('should have access to admin-only features', async ({ page }) => {
    await page.goto('/admin/settings');
    
    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/);
    
    // Should show admin features
    await expect(page).toHaveURL(/\/admin/);
  });
});

// Example: Different user roles in the same file
test.describe('User Role Comparison', () => {
  test('admin has full access', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'tests/.auth/admin.json'
    });
    const page = await context.newPage();
    
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    
    await context.close();
  });

  test('member has limited access', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'tests/.auth/member.json'
    });
    const page = await context.newPage();
    
    await page.goto('/member/dashboard');
    await expect(page).toHaveURL(/\/member\/dashboard/);
    
    // Verify member cannot access admin routes
    await page.goto('/admin/dashboard');
    // Should redirect to login or show access denied
    await expect(page).not.toHaveURL(/\/admin\/dashboard/);
    
    await context.close();
  });
});

/**
 * Example: Testing logout (needs fresh session)
 * 
 * For logout tests, we need to verify session cleanup,
 * so we start with an authenticated state and test the logout flow.
 */
test.describe('Session Management', () => {
  test('should successfully logout and clear session', async ({ page }) => {
    test.use({ storageState: 'tests/.auth/admin.json' });
    
    // Start authenticated
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    
    // Logout
    await page.click('button:has-text("Logout"), a:has-text("Logout"), [aria-label="Logout"]');
    
    // Verify redirected to login/home
    await expect(page).toHaveURL(/\/(login|home)?$/);
    
    // Verify cannot access protected route
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
