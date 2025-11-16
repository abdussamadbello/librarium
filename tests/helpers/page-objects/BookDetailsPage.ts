import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Book Details Page
 * Path: /books/[id]
 */
export class BookDetailsPage {
  readonly page: Page;
  readonly bookTitle: Locator;
  readonly authorName: Locator;
  readonly bookDescription: Locator;
  readonly availabilityBadge: Locator;
  readonly categoryBadge: Locator;
  readonly isbn: Locator;
  readonly publicationYear: Locator;
  readonly copiesInfo: Locator;
  readonly backButton: Locator;
  readonly signInLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.bookTitle = page.locator('h1, h2').filter({ hasText: /.+/ }).first();
    this.authorName = page.locator('text=/Author:|by/i').locator('..').locator('text=/[A-Z]/).first();
    this.bookDescription = page.locator('p:has-text("Description"), div:has-text("About")').first();
    this.availabilityBadge = page.locator('text=/Available|Out/').first();
    this.categoryBadge = page.locator('[class*="badge"], .badge').first();
    this.isbn = page.locator('text=/ISBN/').locator('..').first();
    this.publicationYear = page.locator('text=/Publication|Published/').locator('..').first();
    this.copiesInfo = page.locator('text=/copies|copy/i').first();
    this.backButton = page.locator('button:has-text("Back"), a:has-text("Back")').first();
    this.signInLink = page.locator('a[href="/login"], a[href*="sign-in"]');
    this.registerLink = page.locator('a[href="/register"], a[href*="sign-up"]');
  }

  /**
   * Navigate to a book details page by ID
   */
  async goto(bookId: number) {
    await this.page.goto(`/books/${bookId}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the book title
   */
  async getTitle(): Promise<string> {
    return await this.bookTitle.textContent() || '';
  }

  /**
   * Get the author name
   */
  async getAuthor(): Promise<string> {
    return await this.authorName.textContent() || '';
  }

  /**
   * Check if book is available
   */
  async isAvailable(): Promise<boolean> {
    const badgeText = await this.availabilityBadge.textContent();
    return badgeText?.toLowerCase().includes('available') || false;
  }

  /**
   * Get ISBN
   */
  async getISBN(): Promise<string> {
    const text = await this.isbn.textContent();
    return text?.replace(/ISBN:?\s*/i, '') || '';
  }

  /**
   * Get available copies count
   */
  async getAvailableCopies(): Promise<{ available: number; total: number }> {
    const text = await this.copiesInfo.textContent() || '';
    const match = text.match(/(\d+)\/(\d+)/);

    if (match) {
      return {
        available: parseInt(match[1]),
        total: parseInt(match[2]),
      };
    }

    return { available: 0, total: 0 };
  }

  /**
   * Click back button
   */
  async goBack() {
    await this.backButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click sign in link (for guest users)
   */
  async goToSignIn() {
    await this.signInLink.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click register link (for guest users)
   */
  async goToRegister() {
    await this.registerLink.first().click();
    await this.page.waitForLoadState('networkidle');
  }
}
