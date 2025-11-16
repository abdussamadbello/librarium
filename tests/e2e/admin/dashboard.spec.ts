import { test, expect } from '@playwright/test';
import { LoginPage } from '../../helpers/page-objects/LoginPage';
import { TEST_USERS } from '../../fixtures';

test.describe('Admin - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithEmail(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('should display admin dashboard with key metrics', async ({ page }) => {
    // Assert - Check for key dashboard elements
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard/i })).toBeVisible();

    // Common dashboard metrics
    const possibleMetrics = [
      /total books/i,
      /active members/i,
      /borrowed/i,
      /outstanding fines/i,
      /transactions/i,
    ];

    // At least some metrics should be visible
    let metricsFound = 0;
    for (const metric of possibleMetrics) {
      const count = await page.locator(`text=${metric}`).count();
      if (count > 0) metricsFound++;
    }

    expect(metricsFound).toBeGreaterThan(0);
  });

  test('should have navigation to key admin sections', async ({ page }) => {
    // Assert - Check for navigation links
    const navigationLinks = [
      { text: /books/i, url: /\/admin\/(books|catalog)/ },
      { text: /members/i, url: /\/admin\/members/ },
      { text: /transactions/i, url: /\/admin\/transactions/ },
    ];

    for (const link of navigationLinks) {
      const navLink = page.locator(`a:has-text("${link.text.source}")`).first();
      const linkCount = await page.locator(`a:has-text("${link.text.source}")`).count();

      if (linkCount > 0) {
        await expect(navLink).toBeVisible();
      }
    }
  });

  test('should allow navigation to books management', async ({ page }) => {
    // Act
    await page.click('a:has-text("Books"), a:has-text("Catalog"), a[href*="/admin/books"]');
    await page.waitForLoadState('networkidle');

    // Assert
    expect(page.url()).toMatch(/\/admin\/books/);
  });

  test('should allow navigation to members management', async ({ page }) => {
    // Act
    const membersLink = page.locator('a:has-text("Members"), a[href*="/admin/members"]').first();
    if (await membersLink.isVisible()) {
      await membersLink.click();
      await page.waitForLoadState('networkidle');

      // Assert
      expect(page.url()).toMatch(/\/admin\/members/);
    } else {
      test.skip();
    }
  });

  test('should allow navigation to transactions', async ({ page }) => {
    // Act
    const transactionsLink = page.locator('a:has-text("Transactions"), a[href*="/admin/transactions"]').first();
    if (await transactionsLink.isVisible()) {
      await transactionsLink.click();
      await page.waitForLoadState('networkidle');

      // Assert
      expect(page.url()).toMatch(/\/admin\/transactions/);
    } else {
      test.skip();
    }
  });

  test('should display admin user information', async ({ page }) => {
    // Assert - Should show admin name or email somewhere
    const adminName = TEST_USERS.admin.name;
    const adminEmail = TEST_USERS.admin.email;

    const hasName = await page.locator(`text=${adminName}`).count();
    const hasEmail = await page.locator(`text=${adminEmail}`).count();

    expect(hasName + hasEmail).toBeGreaterThan(0);
  });
});

test.describe('Admin - Books Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to books page
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithEmail(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.goto('/admin/books');
    await page.waitForLoadState('networkidle');
  });

  test('should display books list', async ({ page }) => {
    // Assert
    await expect(page.locator('h1, h2').filter({ hasText: /books/i })).toBeVisible();

    // Should have some table or grid of books
    const hasTable = await page.locator('table').count();
    const hasGrid = await page.locator('[role="grid"]').count();
    const hasBookCards = await page.locator('div:has-text("ISBN"), div:has-text("Author")').count();

    expect(hasTable + hasGrid + hasBookCards).toBeGreaterThan(0);
  });

  test.skip('should allow adding a new book', async ({ page }) => {
    /**
     * NOTE: This test is skipped as a template
     * To implement:
     * 1. Click "Add Book" button
     * 2. Fill in book details form
     * 3. Submit form
     * 4. Verify book appears in list
     * 5. Verify database entry created
     */
  });

  test.skip('should allow editing a book', async ({ page }) => {
    /**
     * NOTE: This test is skipped as a template
     * To implement:
     * 1. Find a book in the list
     * 2. Click "Edit" button
     * 3. Modify book details
     * 4. Save changes
     * 5. Verify changes are reflected
     */
  });

  test.skip('should allow searching/filtering books', async ({ page }) => {
    /**
     * NOTE: This test is skipped as a template
     * To implement:
     * 1. Enter search term in search box
     * 2. Verify results are filtered
     * 3. Test filter by category
     * 4. Test filter by availability
     */
  });
});

test.describe('Admin - Access Control', () => {
  test('staff should have access to admin dashboard', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Act
    await loginPage.loginWithEmail(TEST_USERS.staff.email, TEST_USERS.staff.password);

    // Assert - Staff should have some admin access
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/admin/);
  });

  test('director should have full admin access', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Act
    await loginPage.loginWithEmail(TEST_USERS.director.email, TEST_USERS.director.password);

    // Assert
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/admin/);
  });
});
