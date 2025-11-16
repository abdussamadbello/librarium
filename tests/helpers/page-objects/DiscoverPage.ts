import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Discover Page (Book Catalog)
 * Path: /discover
 */
export class DiscoverPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly bookCards: Locator;
  readonly availableBadge: Locator;
  readonly outBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    this.categoryFilter = page.locator('select, button:has-text("Category")').first();
    this.bookCards = page.locator('a[href^="/books/"]');
    this.availableBadge = page.locator('text=Available');
    this.outBadge = page.locator('text=Out');
  }

  /**
   * Navigate to the discover page
   */
  async goto() {
    await this.page.goto('/discover');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for books by title or author
   */
  async searchBooks(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Filter books by category
   */
  async filterByCategory(category: string) {
    await this.categoryFilter.click();
    await this.page.locator(`text=${category}`).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get all book cards
   */
  async getBookCards() {
    return await this.bookCards.all();
  }

  /**
   * Get count of visible books
   */
  async getBookCount(): Promise<number> {
    return await this.bookCards.count();
  }

  /**
   * Click on a book by title
   */
  async clickBook(title: string) {
    const bookCard = this.page.locator(`a[href^="/books/"]:has-text("${title}")`).first();
    await bookCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if a book is available
   */
  async isBookAvailable(title: string): Promise<boolean> {
    const bookCard = this.page.locator(`a[href^="/books/"]:has-text("${title}")`).first();
    const availableBadge = bookCard.locator('text=Available');
    return await availableBadge.isVisible().catch(() => false);
  }

  /**
   * Get available books count
   */
  async getAvailableBooksCount(): Promise<number> {
    return await this.availableBadge.count();
  }

  /**
   * Get unavailable books count
   */
  async getUnavailableBooksCount(): Promise<number> {
    return await this.outBadge.count();
  }

  /**
   * Get books by category name
   */
  async getBooksByCategory(categoryName: string) {
    return await this.page.locator(`a[href^="/books/"]:has(text="${categoryName}")`).all();
  }
}
