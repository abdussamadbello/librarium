import { test, expect } from '@playwright/test';
import { LoginPage } from '../../helpers/page-objects/LoginPage';
import { MemberDashboard } from '../../helpers/page-objects/MemberDashboard';
import { TEST_USERS, TEST_BOOKS, MEMBERSHIP_LIMITS } from '../../fixtures';

test.describe('Member - Book Borrowing', () => {
  test.beforeEach(async ({ page }) => {
    // Login as standard member before each test
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithEmail(TEST_USERS.member.email, TEST_USERS.member.password);
    await expect(page).toHaveURL(/\/member\/dashboard/);
  });

  test('should display borrowing capacity correctly', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const borrowingInfo = await dashboard.getBorrowingInfo();

    // Assert
    expect(borrowingInfo.limit).toBe(MEMBERSHIP_LIMITS.standard.borrowingLimit);
    expect(borrowingInfo.current).toBeLessThanOrEqual(borrowingInfo.limit);
    expect(borrowingInfo.remaining).toBe(borrowingInfo.limit - borrowingInfo.current);
  });

  test('should show active loans on dashboard', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const loansCount = await dashboard.getActiveLoansCount();

    // Assert
    expect(loansCount).toBeGreaterThanOrEqual(0);
    expect(loansCount).toBeLessThanOrEqual(MEMBERSHIP_LIMITS.standard.borrowingLimit);
  });

  test('should be able to search and view book details', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act - Navigate to discover page
    await dashboard.goToDiscover();

    // Assert - Should be on discover/search page
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(discover|search|books)/);
  });

  test.skip('should successfully borrow an available book', async ({ page }) => {
    /**
     * NOTE: This test is skipped as a template
     * To implement, you need to:
     * 1. Navigate to discover/book catalog
     * 2. Find an available book
     * 3. Click "Borrow" button
     * 4. Verify book appears in active loans
     * 5. Verify available copies decreased
     */

    // Arrange
    const dashboard = new MemberDashboard(page);
    const initialLoansCount = await dashboard.getActiveLoansCount();

    // Act
    // TODO: Implement book borrowing flow
    // 1. Go to discover page
    // 2. Search for TEST_BOOKS.nineteenEightyFour.title
    // 3. Click on book
    // 4. Click "Borrow" button
    // 5. Confirm borrowing

    // Assert
    // await dashboard.goto();
    // const newLoansCount = await dashboard.getActiveLoansCount();
    // expect(newLoansCount).toBe(initialLoansCount + 1);
  });

  test.skip('should prevent borrowing when limit is reached', async ({ page }) => {
    /**
     * NOTE: This test is skipped as a template
     * To implement, you need to:
     * 1. Create test data with member at borrowing limit
     * 2. Attempt to borrow another book
     * 3. Verify error message appears
     * 4. Verify borrowing is blocked
     */

    // This test requires setting up a member with max borrowed books
    // You can use the createTestTransaction helper in db-setup.ts
  });

  test('should display fines summary if any fines exist', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const totalFines = await dashboard.getTotalFines();

    // Assert
    expect(totalFines).toBeGreaterThanOrEqual(0);

    // If fines exist, verify fines section is visible
    if (totalFines > 0) {
      await expect(dashboard.finesSection).toBeVisible();
    }
  });
});

test.describe('Member - Book Borrowing (Premium)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as premium member before each test
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithEmail(TEST_USERS.premium.email, TEST_USERS.premium.password);
    await expect(page).toHaveURL(/\/member\/dashboard/);
  });

  test('should have higher borrowing limit for premium members', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const borrowingInfo = await dashboard.getBorrowingInfo();

    // Assert
    expect(borrowingInfo.limit).toBe(MEMBERSHIP_LIMITS.premium.borrowingLimit);
    expect(borrowingInfo.limit).toBeGreaterThan(MEMBERSHIP_LIMITS.standard.borrowingLimit);
  });
});

test.describe('Member - Book Renewals', () => {
  test.beforeEach(async ({ page }) => {
    // Login as standard member
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithEmail(TEST_USERS.member.email, TEST_USERS.member.password);
    await expect(page).toHaveURL(/\/member\/dashboard/);
  });

  test.skip('should successfully renew a borrowed book', async ({ page }) => {
    /**
     * NOTE: This test is skipped as a template
     * To implement, you need to:
     * 1. Ensure member has an active loan
     * 2. Click "Renew" button
     * 3. Verify new due date is 14 days later
     * 4. Verify renewal count incremented
     */

    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // This test requires having an active loan
    // You can use the createTestTransaction helper in db-setup.ts
  });

  test.skip('should prevent renewal when limit is reached', async ({ page }) => {
    /**
     * NOTE: This test is skipped as a template
     * To implement, you need to:
     * 1. Create loan with max renewals reached
     * 2. Attempt to renew
     * 3. Verify error message
     * 4. Verify renewal is blocked
     */
  });

  test.skip('should show overdue badge for overdue books', async ({ page }) => {
    /**
     * NOTE: This test is skipped as a template
     * To implement, you need to:
     * 1. Create an overdue loan (due date in the past)
     * 2. Verify "Overdue" badge is displayed
     * 3. Verify fine amount is calculated correctly
     */
  });
});
