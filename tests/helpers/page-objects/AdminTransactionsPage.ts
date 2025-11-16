import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Admin Transactions Page
 * Path: /admin/transactions
 */
export class AdminTransactionsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly typeFilter: Locator;
  readonly transactionsTable: Locator;
  readonly exportButton: Locator;
  readonly refreshButton: Locator;
  readonly statsCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    this.typeFilter = page.locator('select, button:has-text("Type")').first();
    this.transactionsTable = page.locator('table, [role="table"]');
    this.exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');
    this.refreshButton = page.locator('button:has-text("Refresh")');
    this.statsCards = page.locator('[class*="card"], .card').filter({ has: page.locator('text=/Total|Active|Returned/i') });
  }

  /**
   * Navigate to the transactions page
   */
  async goto() {
    await this.page.goto('/admin/transactions');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search transactions
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Filter by transaction type
   */
  async filterByType(type: 'all' | 'checkout' | 'return') {
    await this.typeFilter.click();
    await this.page.locator(`text=${type}`).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get total transactions count
   */
  async getTransactionsCount(): Promise<number> {
    const rows = await this.transactionsTable.locator('tbody tr, [role="row"]').count();
    return rows;
  }

  /**
   * Get transaction by member name
   */
  async getTransactionByMember(memberName: string) {
    return this.page.locator(`tr:has-text("${memberName}"), [role="row"]:has-text("${memberName}")`).first();
  }

  /**
   * Get transaction by book title
   */
  async getTransactionByBook(bookTitle: string) {
    return this.page.locator(`tr:has-text("${bookTitle}"), [role="row"]:has-text("${bookTitle}")`).first();
  }

  /**
   * Check if transaction is overdue
   */
  async isTransactionOverdue(transactionRow: Locator): Promise<boolean> {
    const overdueBadge = transactionRow.locator('text=/Overdue/i');
    return await overdueBadge.isVisible().catch(() => false);
  }

  /**
   * Export transactions to CSV
   */
  async exportToCSV() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    const download = await downloadPromise;
    return download;
  }

  /**
   * Refresh transactions list
   */
  async refresh() {
    await this.refreshButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    total?: number;
    active?: number;
    returned?: number;
  }> {
    const stats: any = {};

    const totalCard = this.page.locator('text=/Total/i').locator('..').first();
    const activeCard = this.page.locator('text=/Active/i').locator('..').first();
    const returnedCard = this.page.locator('text=/Returned/i').locator('..').first();

    if (await totalCard.isVisible().catch(() => false)) {
      const text = await totalCard.textContent();
      const match = text?.match(/(\d+)/);
      if (match) stats.total = parseInt(match[1]);
    }

    if (await activeCard.isVisible().catch(() => false)) {
      const text = await activeCard.textContent();
      const match = text?.match(/(\d+)/);
      if (match) stats.active = parseInt(match[1]);
    }

    if (await returnedCard.isVisible().catch(() => false)) {
      const text = await returnedCard.textContent();
      const match = text?.match(/(\d+)/);
      if (match) stats.returned = parseInt(match[1]);
    }

    return stats;
  }
}
