import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Member Dashboard
 * Path: /member/dashboard
 */
export class MemberDashboard {
  readonly page: Page;
  readonly activeLoansSection: Locator;
  readonly finesSection: Locator;
  readonly borrowingLimitCard: Locator;
  readonly searchButton: Locator;
  readonly profileLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.activeLoansSection = page.locator('section:has-text("Active Loans"), div:has-text("Borrowed Books")').first();
    this.finesSection = page.locator('section:has-text("Fines"), div:has-text("Outstanding")').first();
    this.borrowingLimitCard = page.locator('div:has-text("Borrowing Capacity"), div:has-text("Books Borrowed")').first();
    this.searchButton = page.locator('button:has-text("Search"), a:has-text("Discover")').first();
    this.profileLink = page.locator('a[href*="/member/profile"]');
  }

  /**
   * Navigate to the member dashboard
   */
  async goto() {
    await this.page.goto('/member/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the count of active loans
   */
  async getActiveLoansCount(): Promise<number> {
    const loanItems = await this.page.locator('[data-testid="loan-item"], .loan-item, div:has-text("Due")').count();
    return loanItems;
  }

  /**
   * Get total fines amount
   */
  async getTotalFines(): Promise<number> {
    const finesText = await this.finesSection.textContent();
    const match = finesText?.match(/\$(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get borrowing limit information
   */
  async getBorrowingInfo(): Promise<{ current: number; limit: number; remaining: number }> {
    const text = await this.borrowingLimitCard.textContent() || '';

    const currentMatch = text.match(/(\d+)\s*\/\s*(\d+)/);
    if (currentMatch) {
      const current = parseInt(currentMatch[1]);
      const limit = parseInt(currentMatch[2]);
      return {
        current,
        limit,
        remaining: limit - current,
      };
    }

    return { current: 0, limit: 0, remaining: 0 };
  }

  /**
   * Click on a book to view details
   */
  async clickBook(title: string) {
    await this.page.locator(`a:has-text("${title}"), div:has-text("${title}")`).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Renew a book by title
   */
  async renewBook(title: string) {
    const bookSection = this.page.locator(`div:has-text("${title}")`).first();
    const renewButton = bookSection.locator('button:has-text("Renew")');
    await renewButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if a book is overdue
   */
  async isBookOverdue(title: string): Promise<boolean> {
    const bookSection = this.page.locator(`div:has-text("${title}")`).first();
    const overdueBadge = bookSection.locator('[data-testid="overdue"], .badge:has-text("Overdue")');
    return await overdueBadge.isVisible().catch(() => false);
  }

  /**
   * Navigate to discover/search page
   */
  async goToDiscover() {
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to profile page
   */
  async goToProfile() {
    await this.profileLink.click();
    await this.page.waitForLoadState('networkidle');
  }
}
