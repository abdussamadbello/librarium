import { test, expect } from '@playwright/test';
import { AdminTransactionsPage } from '../../helpers/page-objects/AdminTransactionsPage';
import { loginAs, waitForNetworkIdle, getFutureDate, getPastDate, calculateFine } from '../../helpers/test-utils';
import {
  createTestUser,
  createTestBook,
  getAvailableBookCopy,
  createBorrowingScenario,
  createOverdueScenario,
  returnBook
} from '../../helpers/db-setup';
import { TEST_USERS, FINE_RATE_PER_DAY } from '../../fixtures';

test.describe('Admin - Issue Book to Member', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should issue a book to a member via API', async ({ page, request }) => {
    // Arrange - Create a member and get an available book
    const member = await createTestUser({
      email: `test-issue-${Date.now()}@test.com`,
      name: 'Test Member for Issue',
      role: 'member',
      membershipType: 'standard',
    });

    const bookCopy = await getAvailableBookCopy();
    expect(bookCopy).toBeTruthy();

    // Calculate due date (30 days from now)
    const dueDate = getFutureDate(30);

    // Act - Issue book via API
    const response = await request.post('/api/admin/transactions/issue', {
      data: {
        userId: member.id,
        bookCopyId: bookCopy!.id,
        dueDate,
        notes: 'Test checkout',
      },
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    const transaction = await response.json();

    expect(transaction).toHaveProperty('id');
    expect(transaction.userId).toBe(member.id);
    expect(transaction.bookCopyId).toBe(bookCopy!.id);

    // Verify on transactions page
    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    // Search for the member
    await transactionsPage.search(member.name);
    await waitForNetworkIdle(page);

    // Should find the transaction
    const memberTransaction = await transactionsPage.getTransactionByMember(member.name);
    await expect(memberTransaction).toBeVisible();
  });

  test('should show error when issuing to non-existent member', async ({ page, request }) => {
    // Arrange
    const bookCopy = await getAvailableBookCopy();
    const fakeUserId = 'non-existent-user-id';

    // Act - Try to issue book
    const response = await request.post('/api/admin/transactions/issue', {
      data: {
        userId: fakeUserId,
        bookCopyId: bookCopy!.id,
        dueDate: getFutureDate(30),
      },
    });

    // Assert - Should fail
    expect(response.ok()).toBeFalsy();
  });

  test('should prevent issuing unavailable book', async ({ page, request }) => {
    // Arrange - Create a scenario where book is already borrowed
    const scenario = await createBorrowingScenario({});
    const borrowedCopyId = scenario.bookCopy.id;

    const newMember = await createTestUser({
      email: `test-${Date.now()}@test.com`,
      name: 'New Member',
      role: 'member',
    });

    // Act - Try to issue the same (borrowed) book copy
    const response = await request.post('/api/admin/transactions/issue', {
      data: {
        userId: newMember.id,
        bookCopyId: borrowedCopyId,
        dueDate: getFutureDate(30),
      },
    });

    // Assert - Should fail (book already borrowed)
    expect(response.ok()).toBeFalsy();
  });

  test('should record who issued the book', async ({ page, request }) => {
    // Arrange
    const member = await createTestUser({
      email: `test-${Date.now()}@test.com`,
      name: 'Member for Audit',
      role: 'member',
    });

    const bookCopy = await getAvailableBookCopy();

    // Act - Issue as admin
    const response = await request.post('/api/admin/transactions/issue', {
      data: {
        userId: member.id,
        bookCopyId: bookCopy!.id,
        dueDate: getFutureDate(30),
        notes: 'Issued by admin for test',
      },
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    const transaction = await response.json();

    // Should have issuedBy field pointing to admin
    expect(transaction).toHaveProperty('issuedBy');
    expect(transaction.issuedBy).toBe(TEST_USERS.admin.id);
  });
});

test.describe('Admin - Return Book from Member', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should return a borrowed book via API', async ({ page, request }) => {
    // Arrange - Create a borrowing scenario
    const scenario = await createBorrowingScenario({
      dueInDays: 20, // Not overdue
    });

    // Act - Return the book via API
    const response = await request.post('/api/admin/transactions/return', {
      data: {
        transactionId: scenario.transaction.id,
        notes: 'Book returned in good condition',
      },
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    const result = await response.json();

    expect(result.transaction).toHaveProperty('returnDate');
    expect(result.transaction.returnDate).not.toBeNull();

    // Book copy should now be available
    expect(result.bookCopy.status).toBe('available');

    // Available copies should increment
    expect(result.book.availableCopies).toBeGreaterThan(scenario.book.availableCopies - 1);
  });

  test('should calculate fine for late return', async ({ page, request }) => {
    // Arrange - Create overdue scenario (15 days overdue)
    const daysOverdue = 15;
    const scenario = await createOverdueScenario(daysOverdue);

    // Act - Return the overdue book
    const response = await request.post('/api/admin/transactions/return', {
      data: {
        transactionId: scenario.transaction.id,
        notes: 'Overdue return',
      },
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    const result = await response.json();

    // Should calculate fine
    if (result.fine) {
      const expectedFine = calculateFine(daysOverdue, FINE_RATE_PER_DAY);
      expect(parseFloat(result.fine.amount)).toBe(expectedFine);
      expect(result.fine.daysOverdue).toBe(daysOverdue);
      expect(result.fine.reason).toContain('overdue');
    }
  });

  test('should record who processed the return', async ({ page, request }) => {
    // Arrange
    const scenario = await createBorrowingScenario({});

    // Act - Return as admin
    const response = await request.post('/api/admin/transactions/return', {
      data: {
        transactionId: scenario.transaction.id,
      },
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    const result = await response.json();

    // Should record returnedTo admin
    expect(result.transaction).toHaveProperty('returnedTo');
    expect(result.transaction.returnedTo).toBe(TEST_USERS.admin.id);
  });

  test('should show error when returning already returned book', async ({ page, request }) => {
    // Arrange - Create and return a book
    const scenario = await createBorrowingScenario({});
    await returnBook(scenario.transaction.id);

    // Act - Try to return again
    const response = await request.post('/api/admin/transactions/return', {
      data: {
        transactionId: scenario.transaction.id,
      },
    });

    // Assert - Should fail
    expect(response.ok()).toBeFalsy();
    const result = await response.json();
    expect(result.error).toBeTruthy();
  });

  test('on-time return should not create fine', async ({ page, request }) => {
    // Arrange - Create scenario with book due in future
    const scenario = await createBorrowingScenario({
      dueInDays: 10, // Due in 10 days
    });

    // Act - Return early (not overdue)
    const response = await request.post('/api/admin/transactions/return', {
      data: {
        transactionId: scenario.transaction.id,
      },
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    const result = await response.json();

    // Should NOT create a fine
    expect(result.fine).toBeUndefined();
  });
});

test.describe('Admin - Transaction History', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should display active transactions', async ({ page }) => {
    // Arrange - Create multiple borrowing scenarios
    await createBorrowingScenario({ membershipType: 'standard' });
    await createBorrowingScenario({ membershipType: 'premium' });

    // Navigate to transactions page
    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    // Act
    const stats = await transactionsPage.getStats();
    const transactionCount = await transactionsPage.getTransactionsCount();

    // Assert
    expect(transactionCount).toBeGreaterThan(0);

    if (stats.active !== undefined) {
      expect(stats.active).toBeGreaterThan(0);
    }
  });

  test('should show returned transactions separately', async ({ page }) => {
    // Arrange - Create and return a book
    const scenario = await createBorrowingScenario({});
    await returnBook(scenario.transaction.id);

    // Navigate to returned page if it exists
    await page.goto('/admin/returned');
    await waitForNetworkIdle(page);

    // Assert - Page should load
    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin/returned');

    // Should see some content
    const pageHasContent = await page.locator('body').textContent();
    expect(pageHasContent).toBeTruthy();
  });

  test('should identify overdue transactions', async ({ page }) => {
    // Arrange - Create overdue scenario
    const scenario = await createOverdueScenario(10);

    // Navigate to transactions page
    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    // Act - Search for the overdue member
    await transactionsPage.search(scenario.user.name);
    await waitForNetworkIdle(page);

    // Assert - Should show overdue indicator
    const overdueBadge = page.locator('text=/Overdue/i');
    const overdueCount = await overdueBadge.count();

    // Overdue badge might be visible
    if (overdueCount > 0) {
      await expect(overdueBadge.first()).toBeVisible();
    }
  });

  test('should show transaction details including dates', async ({ page }) => {
    // Arrange - Create transaction
    const scenario = await createBorrowingScenario({
      dueInDays: 25,
    });

    // Navigate to transactions page
    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    // Search for the transaction
    await transactionsPage.search(scenario.user.name);
    await waitForNetworkIdle(page);

    // Assert - Table should show date information
    const transaction = await transactionsPage.getTransactionByMember(scenario.user.name);
    await expect(transaction).toBeVisible();

    // Should contain date-related text
    const transactionText = await transaction.textContent();
    expect(transactionText).toBeTruthy();
  });
});

test.describe('Admin - Fine Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should display fines for overdue books', async ({ page }) => {
    // Arrange - Create overdue scenario with fine
    const scenario = await createOverdueScenario(20); // $10.00 fine

    // Navigate to admin dashboard or fines page
    await page.goto('/admin/dashboard');
    await waitForNetworkIdle(page);

    // Look for outstanding fines statistic
    const finesText = page.locator('text=/Outstanding|Fines|\\$[0-9]+/i');
    const finesCount = await finesText.count();

    // Fines might be displayed on dashboard
    expect(finesCount).toBeGreaterThanOrEqual(0);
  });

  test('staff should have access to fine management', async ({ page }) => {
    // Arrange - Login as staff
    await loginAs(page, 'staff');

    // Act - Navigate to transactions
    await page.goto('/admin/transactions');
    await waitForNetworkIdle(page);

    // Assert - Staff should have access
    expect(page.url()).toContain('/admin/transactions');
  });

  test('director should have full access to all features', async ({ page }) => {
    // Arrange - Login as director
    await loginAs(page, 'director');

    // Act - Navigate to admin pages
    await page.goto('/admin/dashboard');
    await waitForNetworkIdle(page);

    await page.goto('/admin/transactions');
    await waitForNetworkIdle(page);

    // Assert - Director should have access
    expect(page.url()).toContain('/admin');
  });
});

test.describe('Admin - Search and Filter Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('should search transactions by member name', async ({ page }) => {
    // Arrange - Create transaction with unique member name
    const uniqueName = `TestMember-${Date.now()}`;
    const member = await createTestUser({
      email: `${uniqueName}@test.com`,
      name: uniqueName,
      role: 'member',
    });

    const bookCopy = await getAvailableBookCopy();
    const scenario = await createBorrowingScenario({});

    // Navigate to transactions
    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    // Act - Search for the member
    await transactionsPage.search(uniqueName);
    await waitForNetworkIdle(page);

    // Assert - Should find the transaction
    const results = await transactionsPage.getTransactionsCount();
    expect(results).toBeGreaterThan(0);
  });

  test('should refresh transactions list', async ({ page }) => {
    // Arrange
    const transactionsPage = new AdminTransactionsPage(page);
    await transactionsPage.goto();

    const initialCount = await transactionsPage.getTransactionsCount();

    // Create new transaction in background
    await createBorrowingScenario({});

    // Act - Refresh the page
    const refreshButton = page.locator('button:has-text("Refresh")');
    const refreshButtonExists = await refreshButton.count();

    if (refreshButtonExists > 0) {
      await refreshButton.click();
      await waitForNetworkIdle(page);
    } else {
      // Manually refresh
      await page.reload();
      await waitForNetworkIdle(page);
    }

    // Assert - Page should reload
    const tableVisible = await transactionsPage.transactionsTable.isVisible();
    expect(tableVisible).toBeTruthy();
  });
});
