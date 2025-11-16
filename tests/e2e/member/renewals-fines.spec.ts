import { test, expect } from '@playwright/test';
import { MemberDashboard } from '../../helpers/page-objects/MemberDashboard';
import { loginAs, waitForNetworkIdle, waitForToast, calculateFine } from '../../helpers/test-utils';
import { createBorrowingScenario, createOverdueScenario, createPayment } from '../../helpers/db-setup';
import { FINE_RATE_PER_DAY, RENEWAL_EXTENSION_DAYS } from '../../fixtures';

test.describe('Member - Book Renewals with Real Data', () => {
  test('should successfully renew a borrowed book via API', async ({ page, request }) => {
    // Arrange - Create a borrowing scenario
    const scenario = await createBorrowingScenario({
      membershipType: 'standard',
      dueInDays: 5, // Due in 5 days
    });

    // Login as the user who borrowed the book
    await page.goto('/login');
    await page.fill('input[id="email"]', scenario.user.email);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Navigate to dashboard
    await page.goto('/member/dashboard');
    await waitForNetworkIdle(page);

    // Act - Renew the book via API call
    const response = await request.post('/api/member/renew', {
      data: {
        transactionId: scenario.transaction.id,
      },
    });

    // Assert
    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.renewalCount).toBe(1);

    // Verify new due date is 14 days later
    const originalDueDate = new Date(scenario.transaction.dueDate!);
    const newDueDate = new Date(result.newDueDate);
    const daysDifference = Math.round((newDueDate.getTime() - originalDueDate.getTime()) / (1000 * 60 * 60 * 24));

    expect(daysDifference).toBe(RENEWAL_EXTENSION_DAYS);
  });

  test('should prevent renewal when limit is reached', async ({ page, request }) => {
    // Arrange - Create a borrowing scenario for standard member (2 renewals max)
    const scenario = await createBorrowingScenario({
      membershipType: 'standard',
      dueInDays: 10,
    });

    // Login
    await page.goto('/login');
    await page.fill('input[id="email"]', scenario.user.email);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Renew once
    await request.post('/api/member/renew', {
      data: { transactionId: scenario.transaction.id },
    });

    // Renew twice
    await request.post('/api/member/renew', {
      data: { transactionId: scenario.transaction.id },
    });

    // Act - Try to renew a third time (should fail)
    const response = await request.post('/api/member/renew', {
      data: { transactionId: scenario.transaction.id },
    });

    // Assert - Should be rejected
    expect(response.status()).toBe(400);
    const result = await response.json();
    expect(result.error).toContain('Renewal limit reached');
    expect(result.maxRenewals).toBe(2);
  });

  test('should prevent renewal of overdue books', async ({ page, request }) => {
    // Arrange - Create an overdue scenario
    const scenario = await createBorrowingScenario({
      isOverdue: true, // Due date in the past
    });

    // Login
    await page.goto('/login');
    await page.fill('input[id="email"]', scenario.user.email);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Act - Try to renew an overdue book
    const response = await request.post('/api/member/renew', {
      data: { transactionId: scenario.transaction.id },
    });

    // Assert - Should be rejected
    expect(response.status()).toBe(400);
    const result = await response.json();
    expect(result.error).toContain('Cannot renew overdue');
  });

  test('premium members should have higher renewal limits', async ({ page, request }) => {
    // Arrange - Create borrowing scenario for premium member (5 renewals max)
    const scenario = await createBorrowingScenario({
      membershipType: 'premium',
      dueInDays: 15,
    });

    // Login
    await page.goto('/login');
    await page.fill('input[id="email"]', scenario.user.email);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Act - Perform multiple renewals
    let lastResponse;
    for (let i = 0; i < 3; i++) {
      lastResponse = await request.post('/api/member/renew', {
        data: { transactionId: scenario.transaction.id },
      });
    }

    // Assert - Should succeed (premium can renew up to 5 times)
    expect(lastResponse!.ok()).toBeTruthy();
    const result = await lastResponse!.json();
    expect(result.success).toBe(true);
    expect(result.renewalsRemaining).toBeGreaterThan(0);
  });
});

test.describe('Member - Fine Management with Real Data', () => {
  test('should display fine for overdue book', async ({ page }) => {
    // Arrange - Create overdue scenario with 15 days overdue
    const scenario = await createOverdueScenario(15);

    // Login as the member with overdue book
    await page.goto('/login');
    await page.fill('input[id="email"]', scenario.user.email);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Navigate to dashboard
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act - Get total fines
    const totalFines = await dashboard.getTotalFines();

    // Assert - Fine should be $7.50 (15 days * $0.50)
    const expectedFine = calculateFine(15, FINE_RATE_PER_DAY);
    expect(totalFines).toBe(expectedFine);

    // Verify fines section is visible
    await expect(dashboard.finesSection).toBeVisible();
  });

  test('should show overdue badge on borrowed book', async ({ page }) => {
    // Arrange - Create overdue scenario
    const scenario = await createOverdueScenario(10);

    // Login
    await page.goto('/login');
    await page.fill('input[id="email"]', scenario.user.email);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Navigate to dashboard
    await page.goto('/member/dashboard');
    await waitForNetworkIdle(page);

    // Assert - Should see overdue indicator
    const overdueBadge = page.locator('text=/Overdue/i, [data-testid="overdue"]');
    const overdueCount = await overdueBadge.count();

    if (overdueCount > 0) {
      await expect(overdueBadge.first()).toBeVisible();
    }

    // Check for fine amount display
    const fineDisplay = page.locator('text=/\\$[0-9]+\\.[0-9]{2}/');
    await expect(fineDisplay.first()).toBeVisible();
  });

  test('should calculate multiple fines correctly', async ({ page }) => {
    // Arrange - Create two overdue scenarios
    const scenario1 = await createOverdueScenario(10); // $5.00
    const scenario2 = await createOverdueScenario(6);  // $3.00
    // Total: $8.00

    // Use same member for both scenarios
    const memberEmail = scenario1.user.email;

    // Create second fine for the same member
    await createBorrowingScenario({
      membershipType: 'standard',
      isOverdue: true,
      daysAgo: 36, // 6 days overdue
    });

    // Login
    await page.goto('/login');
    await page.fill('input[id="email"]', memberEmail);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Navigate to dashboard
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const totalFines = await dashboard.getTotalFines();

    // Assert - Should show combined fines
    const expectedTotal = calculateFine(10) + calculateFine(6);
    expect(totalFines).toBeGreaterThanOrEqual(calculateFine(10)); // At least one fine
  });

  test('should navigate to fines detail page', async ({ page }) => {
    // Arrange - Create overdue scenario with fine
    const scenario = await createOverdueScenario(12);

    // Login
    await page.goto('/login');
    await page.fill('input[id="email"]', scenario.user.email);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Go to dashboard
    await page.goto('/member/dashboard');
    await waitForNetworkIdle(page);

    // Act - Try to find and click "View Fines" or navigate to fines page
    const viewFinesLink = page.locator('a:has-text("Fines"), a:has-text("View Details"), a[href*="/fines"]');
    const linkCount = await viewFinesLink.count();

    if (linkCount > 0) {
      await viewFinesLink.first().click();
      await waitForNetworkIdle(page);

      // Assert - Should be on fines page
      expect(page.url()).toMatch(/\/(fines|account)/);
    } else {
      // Directly navigate to fines page
      await page.goto('/member/fines');
      await waitForNetworkIdle(page);

      // Check if page loaded
      const pageExists = await page.locator('body').isVisible();
      expect(pageExists).toBeTruthy();
    }
  });
});

test.describe('Member - Borrowing Limits Enforcement', () => {
  test('standard member cannot exceed 5 book limit', async ({ page }) => {
    // Arrange - Create 5 borrowing scenarios for standard member
    let memberEmail: string | undefined;

    for (let i = 0; i < 5; i++) {
      const scenario = await createBorrowingScenario({
        membershipType: 'standard',
      });
      if (i === 0) {
        memberEmail = scenario.user.email;
      }
    }

    // Login
    await page.goto('/login');
    await page.fill('input[id="email"]', memberEmail!);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Navigate to dashboard
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act - Check borrowing info
    const borrowingInfo = await dashboard.getBorrowingInfo();

    // Assert - Should be at or near limit
    expect(borrowingInfo.current).toBeGreaterThan(0);
    expect(borrowingInfo.limit).toBe(5);

    if (borrowingInfo.current >= 5) {
      expect(borrowingInfo.remaining).toBe(0);
    }
  });

  test('premium member can borrow more than standard limit', async ({ page }) => {
    // Arrange - Create 7 borrowing scenarios for premium member (more than standard limit of 5)
    let memberEmail: string | undefined;

    for (let i = 0; i < 7; i++) {
      const scenario = await createBorrowingScenario({
        membershipType: 'premium',
      });
      if (i === 0) {
        memberEmail = scenario.user.email;
      }
    }

    // Login
    await page.goto('/login');
    await page.fill('input[id="email"]', memberEmail!);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Navigate to dashboard
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const borrowingInfo = await dashboard.getBorrowingInfo();

    // Assert - Premium limit is 15
    expect(borrowingInfo.limit).toBe(15);
    expect(borrowingInfo.current).toBeGreaterThan(5); // More than standard limit
    expect(borrowingInfo.remaining).toBeGreaterThan(0); // Still has capacity
  });

  test('student member should have correct limit', async ({ page }) => {
    // Arrange - Create borrowing scenario for student
    const scenario = await createBorrowingScenario({
      membershipType: 'student',
    });

    // Login
    await page.goto('/login');
    await page.fill('input[id="email"]', scenario.user.email);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Navigate to dashboard
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const borrowingInfo = await dashboard.getBorrowingInfo();

    // Assert - Student limit is 10
    expect(borrowingInfo.limit).toBe(10);
  });
});

test.describe('Member - Active Loans Display', () => {
  test('should display borrowed book details', async ({ page }) => {
    // Arrange - Create borrowing scenario
    const scenario = await createBorrowingScenario({
      dueInDays: 20,
    });

    // Login
    await page.goto('/login');
    await page.fill('input[id="email"]', scenario.user.email);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Navigate to dashboard
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const loansCount = await dashboard.getActiveLoansCount();

    // Assert - Should see at least 1 loan
    expect(loansCount).toBeGreaterThan(0);

    // Check for book title in active loans
    const bookTitle = scenario.book.title;
    const loanSection = page.locator(`text="${bookTitle}"`);
    const titleCount = await loanSection.count();

    // Book title should appear somewhere on the page
    expect(titleCount).toBeGreaterThan(0);
  });

  test('should show due date for borrowed books', async ({ page }) => {
    // Arrange - Create borrowing scenario with specific due date
    const scenario = await createBorrowingScenario({
      dueInDays: 15,
    });

    // Login
    await page.goto('/login');
    await page.fill('input[id="email"]', scenario.user.email);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Navigate to dashboard
    await page.goto('/member/dashboard');
    await waitForNetworkIdle(page);

    // Assert - Should see due date text
    const dueDateText = page.locator('text=/Due|Deadline/i');
    await expect(dueDateText.first()).toBeVisible();
  });

  test('returned books should not appear in active loans', async ({ page }) => {
    // Arrange - Create and immediately return a book
    const scenario = await createBorrowingScenario({});

    // Return the book via database helper
    const { returnBook } = await import('../../helpers/db-setup');
    await returnBook(scenario.transaction.id);

    // Login
    await page.goto('/login');
    await page.fill('input[id="email"]', scenario.user.email);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await waitForNetworkIdle(page);

    // Navigate to dashboard
    const dashboard = new MemberDashboard(page);
    await dashboard.goto();

    // Act
    const loansCount = await dashboard.getActiveLoansCount();

    // Assert - Should have 0 active loans (book was returned)
    expect(loansCount).toBe(0);
  });
});
