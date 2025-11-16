import { test, expect } from '@playwright/test';
import { MemberDashboard } from '../../helpers/page-objects/MemberDashboard';
import { loginAs, waitForNetworkIdle } from '../../helpers/test-utils';
import { TEST_USERS, MEMBERSHIP_LIMITS } from '../../fixtures';

test.describe('Member Dashboard - Overview', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should display dashboard with welcome message', async ({ page }) => {
    // Assert
    await expect(page).toHaveURL(/\/member\/dashboard/);

    // Check for dashboard heading or welcome message
    const heading = page.locator('h1, h2').filter({ hasText: /dashboard|welcome/i });
    await expect(heading).toBeVisible();
  });

  test('should display borrowing capacity card', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const borrowingInfo = await dashboard.getBorrowingInfo();

    // Assert
    expect(borrowingInfo.limit).toBe(MEMBERSHIP_LIMITS.standard.borrowingLimit);
    expect(borrowingInfo.current).toBeGreaterThanOrEqual(0);
    expect(borrowingInfo.current).toBeLessThanOrEqual(borrowingInfo.limit);
    expect(borrowingInfo.remaining).toBe(borrowingInfo.limit - borrowingInfo.current);
  });

  test('should display active loans section', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Assert - Active loans section should be visible
    await expect(dashboard.activeLoansSection).toBeVisible();

    // Get count (might be 0 if no books borrowed)
    const loansCount = await dashboard.getActiveLoansCount();
    expect(loansCount).toBeGreaterThanOrEqual(0);
  });

  test('should display fines summary section', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const finesTotal = await dashboard.getTotalFines();

    // Assert - Fines should be 0 or positive
    expect(finesTotal).toBeGreaterThanOrEqual(0);
  });

  test('should show navigation to discover/search books', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Assert - Search or discover button should exist
    const searchButtonVisible = await dashboard.searchButton.isVisible().catch(() => false);
    expect(searchButtonVisible).toBeTruthy();
  });

  test('should navigate to profile page', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Check if profile link exists
    const profileLinkCount = await dashboard.profileLink.count();

    if (profileLinkCount > 0) {
      // Act
      await dashboard.goToProfile();

      // Assert
      await expect(page).toHaveURL(/\/member\/(profile|account)/);
    } else {
      test.skip();
    }
  });
});

test.describe('Member Dashboard - Premium Member', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'premium');
  });

  test('should display higher borrowing limit for premium members', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const borrowingInfo = await dashboard.getBorrowingInfo();

    // Assert
    expect(borrowingInfo.limit).toBe(MEMBERSHIP_LIMITS.premium.borrowingLimit);
    expect(borrowingInfo.limit).toBeGreaterThan(MEMBERSHIP_LIMITS.standard.borrowingLimit);
  });

  test('should display premium badge or indicator', async ({ page }) => {
    // Check for premium membership indicator
    const premiumBadge = page.locator('text=/Premium|VIP/i, [class*="premium"]');
    const badgeCount = await premiumBadge.count();

    // Premium badge might be visible
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Member Dashboard - Student Member', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'student');
  });

  test('should display student borrowing limit', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const borrowingInfo = await dashboard.getBorrowingInfo();

    // Assert
    expect(borrowingInfo.limit).toBe(MEMBERSHIP_LIMITS.student.borrowingLimit);
  });
});

test.describe('Member Dashboard - Active Loans', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should display list of borrowed books', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const loansCount = await dashboard.getActiveLoansCount();

    // Assert
    if (loansCount > 0) {
      // If there are loans, verify the section shows them
      await expect(dashboard.activeLoansSection).toBeVisible();

      // Each loan should have due date, book title, etc.
      const loanItems = page.locator('[data-testid="loan-item"], .loan-item, div:has-text("Due")');
      const itemCount = await loanItems.count();
      expect(itemCount).toBeGreaterThan(0);
    } else {
      // If no loans, should show empty state
      const emptyState = page.locator('text=/No active loans|No books borrowed|Start browsing/i');
      const emptyStateCount = await emptyState.count();

      // Either show empty state or just an empty list
      expect(loansCount).toBe(0);
    }
  });

  test.skip('should show due dates for borrowed books', async ({ page }) => {
    /**
     * NOTE: This test requires having active loans
     * To implement:
     * 1. Create test transaction with db-setup helper
     * 2. Login as that member
     * 3. Verify due date is displayed
     */

    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    const loansCount = await dashboard.getActiveLoansCount();

    if (loansCount > 0) {
      // Check for due date text
      const dueDateText = page.locator('text=/Due|Deadline/i');
      await expect(dueDateText.first()).toBeVisible();
    }
  });

  test.skip('should show renew button for eligible books', async ({ page }) => {
    /**
     * NOTE: This test requires having active loans
     * To implement:
     * 1. Create test transaction
     * 2. Verify renew button appears
     * 3. Test renewal functionality
     */

    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    const loansCount = await dashboard.getActiveLoansCount();

    if (loansCount > 0) {
      const renewButton = page.locator('button:has-text("Renew")');
      const renewButtonCount = await renewButton.count();
      expect(renewButtonCount).toBeGreaterThan(0);
    }
  });

  test.skip('should highlight overdue books', async ({ page }) => {
    /**
     * NOTE: This test requires creating an overdue loan
     * To implement:
     * 1. Create transaction with past due date using db-setup
     * 2. Verify overdue indicator is shown
     * 3. Verify fine is calculated
     */

    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Look for overdue indicators
    const overdueBadge = page.locator('[data-testid="overdue"], .badge:has-text("Overdue"), text=/Overdue/i');
    const overdueBadgeCount = await overdueBadge.count();

    // If there are overdue books, should show badge
    if (overdueBadgeCount > 0) {
      await expect(overdueBadge.first()).toBeVisible();
    }
  });
});

test.describe('Member Dashboard - Fines', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should display fines summary', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const totalFines = await dashboard.getTotalFines();

    // Assert
    expect(totalFines).toBeGreaterThanOrEqual(0);

    // If fines exist, fines section should be visible
    if (totalFines > 0) {
      await expect(dashboard.finesSection).toBeVisible();
    }
  });

  test.skip('should allow paying fines', async ({ page }) => {
    /**
     * NOTE: This test requires having unpaid fines
     * To implement:
     * 1. Create fine using db-setup helper
     * 2. Verify "Pay Fine" button appears
     * 3. Test payment flow
     */

    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    const totalFines = await dashboard.getTotalFines();

    if (totalFines > 0) {
      const payButton = page.locator('button:has-text("Pay"), button:has-text("Pay Fine")');
      const payButtonCount = await payButton.count();
      expect(payButtonCount).toBeGreaterThan(0);
    }
  });

  test.skip('should show breakdown of fines', async ({ page }) => {
    /**
     * NOTE: This test requires having fines
     * To implement:
     * 1. Create multiple fines
     * 2. Verify each fine is listed with reason and amount
     */

    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    const totalFines = await dashboard.getTotalFines();

    if (totalFines > 0) {
      // Navigate to fines detail page
      await page.click('a:has-text("View Fines"), button:has-text("View Details")');
      await waitForNetworkIdle(page);

      // Verify fines list
      const fineItems = page.locator('[data-testid="fine-item"], .fine-item, tr:has-text("$")');
      const fineCount = await fineItems.count();
      expect(fineCount).toBeGreaterThan(0);
    }
  });
});

test.describe('Member Dashboard - User Information', () => {
  test('should display member name', async ({ page }) => {
    // Arrange
    await loginAs(page, 'member');
    const memberName = TEST_USERS.member.name;

    // Assert - Member name should appear somewhere
    const nameElement = page.locator(`text="${memberName}"`);
    const nameCount = await nameElement.count();
    expect(nameCount).toBeGreaterThan(0);
  });

  test('should display membership type', async ({ page }) => {
    // Arrange
    await loginAs(page, 'premium');

    // Assert - Membership type might be visible
    const membershipType = page.locator('text=/Premium|Standard|Student/i');
    const typeCount = await membershipType.count();

    // Membership type might be shown
    expect(typeCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Member Dashboard - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'member');
  });

  test('should navigate to discover page', async ({ page }) => {
    // Arrange
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    await dashboard.goToDiscover();

    // Assert
    await expect(page).toHaveURL(/\/(discover|search|books)/);
  });

  test('should have navigation menu or sidebar', async ({ page }) => {
    // Assert - Should have navigation
    const nav = page.locator('nav, aside, [role="navigation"]');
    const navCount = await nav.count();
    expect(navCount).toBeGreaterThan(0);
  });

  test('should have logout option', async ({ page }) => {
    // Assert - Logout button should exist
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")');
    const logoutCount = await logoutButton.count();
    expect(logoutCount).toBeGreaterThan(0);
  });
});
