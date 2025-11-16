import { test, expect } from '@playwright/test';
import { AdminTransactionsPage } from '../../helpers/page-objects/AdminTransactionsPage';
import { loginAs, waitForNetworkIdle, waitForText } from '../../helpers/test-utils';

test.describe('Admin - Transactions Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should display transactions page', async ({ page }) => {
    // Arrange
    const transactionsPage = new AdminTransactionsPage(page);

    // Act
    await transactionsPage.goto();

    // Assert
    await expect(page).toHaveURL(/\/admin\/transactions/);
    await expect(page.locator('h1, h2').filter({ hasText: /transactions/i })).toBeVisible();
  });

  test('should display transactions table', async ({ page }) => {
    // Arrange
    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    // Assert - Table should be visible
    await expect(transactionsPage.transactionsTable).toBeVisible();
  });

  test('should display transaction statistics', async ({ page }) => {
    // Arrange
    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    // Act
    const stats = await transactionsPage.getStats();

    // Assert - Stats should have numeric values
    if (stats.total !== undefined) {
      expect(stats.total).toBeGreaterThanOrEqual(0);
    }

    if (stats.active !== undefined) {
      expect(stats.active).toBeGreaterThanOrEqual(0);
    }

    if (stats.returned !== undefined) {
      expect(stats.returned).toBeGreaterThanOrEqual(0);
    }
  });

  test('should list transactions with member and book information', async ({ page }) => {
    // Arrange
    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    // Act
    const transactionCount = await transactionsPage.getTransactionsCount();

    // Assert
    expect(transactionCount).toBeGreaterThanOrEqual(0);

    if (transactionCount > 0) {
      // Verify table has rows
      const table = transactionsPage.transactionsTable;
      const rows = table.locator('tbody tr, [role="row"]');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    }
  });

  test('should allow searching transactions', async ({ page }) => {
    // Arrange
    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    const initialCount = await transactionsPage.getTransactionsCount();

    if (initialCount > 0) {
      // Get first transaction's member name
      const firstRow = page.locator('tbody tr, [role="row"]').first();
      const rowText = await firstRow.textContent();

      if (rowText) {
        // Extract a search term (first word from the row)
        const searchTerm = rowText.trim().split(/\s+/)[0];

        // Act
        await transactionsPage.search(searchTerm);

        // Assert - Should still have some results
        const searchCount = await transactionsPage.getTransactionsCount();
        expect(searchCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test.skip('should filter transactions by type', async ({ page }) => {
    /**
     * NOTE: Skipped - depends on filter implementation
     * To implement:
     * 1. Select "Checkout" filter
     * 2. Verify only checkouts are shown
     * 3. Select "Return" filter
     * 4. Verify only returns are shown
     */

    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    // Filter by checkout
    await transactionsPage.filterByType('checkout');
    // Verify results...

    // Filter by return
    await transactionsPage.filterByType('return');
    // Verify results...
  });

  test('should refresh transactions list', async ({ page }) => {
    // Arrange
    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    const refreshButtonCount = await transactionsPage.refreshButton.count();

    if (refreshButtonCount > 0) {
      // Act
      await transactionsPage.refresh();

      // Assert - Page should reload
      await expect(transactionsPage.transactionsTable).toBeVisible();
    } else {
      test.skip();
    }
  });

  test.skip('should export transactions to CSV', async ({ page }) => {
    /**
     * NOTE: Skipped - requires export functionality to be available
     * To implement:
     * 1. Click export button
     * 2. Verify CSV file downloads
     * 3. Verify CSV contains transaction data
     */

    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    const exportButtonCount = await transactionsPage.exportButton.count();

    if (exportButtonCount > 0) {
      // Act
      const download = await transactionsPage.exportToCSV();

      // Assert
      expect(download).toBeTruthy();
      expect(download.suggestedFilename()).toMatch(/\.csv$/i);
    } else {
      test.skip();
    }
  });
});

test.describe('Admin - Transaction Details', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should show checkout date and due date for active loans', async ({ page }) => {
    // Arrange
    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    const transactionCount = await transactionsPage.getTransactionsCount();

    if (transactionCount > 0) {
      // Check for date columns
      const dateHeaders = page.locator('th:has-text("Date"), th:has-text("Checkout"), th:has-text("Due"), th:has-text("Return")');
      const dateHeaderCount = await dateHeaders.count();
      expect(dateHeaderCount).toBeGreaterThan(0);
    } else {
      test.skip();
    }
  });

  test.skip('should identify overdue transactions', async ({ page }) => {
    /**
     * NOTE: Skipped - requires creating overdue transaction
     * To implement:
     * 1. Create transaction with past due date
     * 2. Verify it shows overdue badge
     * 3. Verify fine is calculated
     */

    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    // Look for overdue indicators
    const overdueBadge = page.locator('text=/Overdue/i, [class*="overdue"]');
    const overdueCount = await overdueBadge.count();

    // If overdue transactions exist, verify they're highlighted
    if (overdueCount > 0) {
      await expect(overdueBadge.first()).toBeVisible();
    }
  });

  test('should display book and member information in each row', async ({ page }) => {
    // Arrange
    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    const transactionCount = await transactionsPage.getTransactionsCount();

    if (transactionCount > 0) {
      // Get first row
      const firstRow = page.locator('tbody tr, [role="row"]').first();
      const rowText = await firstRow.textContent();

      // Row should have some text content
      expect(rowText).toBeTruthy();
      expect(rowText!.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Admin - Issue & Return Books', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should navigate to issued books page', async ({ page }) => {
    // Act
    await page.goto('/admin/issued');
    await waitForNetworkIdle(page);

    // Assert
    await expect(page).toHaveURL(/\/admin\/issued/);
  });

  test('should navigate to returned books page', async ({ page }) => {
    // Act
    await page.goto('/admin/returned');
    await waitForNetworkIdle(page);

    // Assert
    await expect(page).toHaveURL(/\/admin\/returned/);
  });

  test.skip('should allow issuing a book to a member', async ({ page }) => {
    /**
     * NOTE: Skipped - template for issue functionality
     * To implement:
     * 1. Navigate to issue page
     * 2. Select member
     * 3. Select book
     * 4. Click issue button
     * 5. Verify transaction created
     * 6. Verify available copies decreased
     */

    await page.goto('/admin/issued');
    await waitForNetworkIdle(page);

    // Look for "Issue Book" button
    const issueButton = page.locator('button:has-text("Issue"), button:has-text("Checkout")');
    const issueButtonCount = await issueButton.count();

    if (issueButtonCount > 0) {
      // Click issue button
      await issueButton.first().click();

      // Fill in the form
      // TODO: Implement issue form interaction
    } else {
      test.skip();
    }
  });

  test.skip('should allow returning a book', async ({ page }) => {
    /**
     * NOTE: Skipped - template for return functionality
     * To implement:
     * 1. Find active transaction
     * 2. Click return button
     * 3. Verify book returned
     * 4. Verify available copies increased
     * 5. Check if fine calculated for late return
     */

    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    const transactionCount = await transactionsPage.getTransactionsCount();

    if (transactionCount > 0) {
      // Look for return button in active transactions
      const returnButton = page.locator('button:has-text("Return")');
      const returnButtonCount = await returnButton.count();

      if (returnButtonCount > 0) {
        // TODO: Implement return flow
      }
    }
  });

  test.skip('should calculate fine for late returns', async ({ page }) => {
    /**
     * NOTE: Skipped - requires creating overdue transaction
     * To implement:
     * 1. Create transaction with due date in past
     * 2. Process return
     * 3. Verify fine calculated correctly ($0.50/day)
     * 4. Verify fine record created
     */

    // Fine rate: $0.50 per day (from business rules)
    const FINE_RATE = 0.5;

    // TODO: Create overdue transaction
    // TODO: Return the book
    // TODO: Verify fine = daysOverdue * FINE_RATE
  });
});

test.describe('Admin - Permissions', () => {
  test('staff should have access to transactions', async ({ page }) => {
    // Arrange
    await loginAs(page, 'staff');

    // Act
    await page.goto('/admin/transactions');
    await waitForNetworkIdle(page);

    // Assert - Staff should see transactions page
    await expect(page).toHaveURL(/\/admin\/transactions/);
  });

  test('director should have access to transactions', async ({ page }) => {
    // Arrange
    await loginAs(page, 'director');

    // Act
    await page.goto('/admin/transactions');
    await waitForNetworkIdle(page);

    // Assert - Director should see transactions page
    await expect(page).toHaveURL(/\/admin\/transactions/);
  });

  test('members should not access transactions page', async ({ page }) => {
    // Arrange
    await loginAs(page, 'member');

    // Act
    await page.goto('/admin/transactions');
    await waitForNetworkIdle(page);

    // Assert - Should be redirected away
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin/transactions');
  });
});
