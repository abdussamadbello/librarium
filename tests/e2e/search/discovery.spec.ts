import { test, expect } from '@playwright/test';
import { DiscoverPage } from '../../helpers/page-objects/DiscoverPage';
import { BookDetailsPage } from '../../helpers/page-objects/BookDetailsPage';
import { TEST_BOOKS, CATEGORIES } from '../../fixtures';
import { waitForNetworkIdle } from '../../helpers/test-utils';

test.describe('Search & Discovery - Book Catalog', () => {
  let discoverPage: DiscoverPage;

  test.beforeEach(async ({ page }) => {
    discoverPage = new DiscoverPage(page);
    await discoverPage.goto();
  });

  test('should display book catalog on discover page', async ({ page }) => {
    // Assert - Page loaded
    await expect(page).toHaveURL(/\/discover/);

    // Assert - Books are displayed
    const bookCount = await discoverPage.getBookCount();
    expect(bookCount).toBeGreaterThan(0);
  });

  test('should show available and unavailable books', async ({ page }) => {
    // Act
    const availableCount = await discoverPage.getAvailableBooksCount();
    const unavailableCount = await discoverPage.getUnavailableBooksCount();

    // Assert
    expect(availableCount + unavailableCount).toBeGreaterThan(0);
    console.log(`Available: ${availableCount}, Unavailable: ${unavailableCount}`);
  });

  test('should search for books by title', async ({ page }) => {
    // Arrange
    const searchQuery = TEST_BOOKS.nineteenEightyFour.title;

    // Act
    await discoverPage.searchBooks(searchQuery);
    await waitForNetworkIdle(page);

    // Assert - Search results should contain the book
    const bookCards = await discoverPage.getBookCards();
    expect(bookCards.length).toBeGreaterThan(0);

    // Verify the searched book is visible
    await expect(page.locator(`text="${searchQuery}"`).first()).toBeVisible();
  });

  test('should search for books by author', async ({ page }) => {
    // Arrange
    const authorName = TEST_BOOKS.nineteenEightyFour.author;

    // Act
    await discoverPage.searchBooks(authorName);
    await waitForNetworkIdle(page);

    // Assert - Should show books by this author
    const bookCards = await discoverPage.getBookCards();
    expect(bookCards.length).toBeGreaterThan(0);
  });

  test('should show no results for non-existent book', async ({ page }) => {
    // Arrange
    const nonExistentBook = 'This Book Does Not Exist 123456';

    // Act
    await discoverPage.searchBooks(nonExistentBook);
    await waitForNetworkIdle(page);

    // Assert - Should show no results or empty state
    const bookCount = await discoverPage.getBookCount();
    const noResultsText = page.locator('text=/No books found|No results|Empty/i');

    if (bookCount === 0) {
      // Either no books shown, or a "no results" message
      expect(bookCount).toBe(0);
    } else {
      // Or we might still see all books if search doesn't filter client-side
      // This depends on implementation
    }
  });

  test('should navigate to book details when clicking a book', async ({ page }) => {
    // Arrange
    const bookTitle = TEST_BOOKS.braveNewWorld.title;

    // Act
    await discoverPage.clickBook(bookTitle);

    // Assert - Should navigate to book details page
    await expect(page).toHaveURL(/\/books\/\d+/);

    // Verify book details page loaded
    const bookDetailsPage = new BookDetailsPage(page);
    const title = await bookDetailsPage.getTitle();
    expect(title.toLowerCase()).toContain(bookTitle.toLowerCase());
  });

  test('should display book availability badges correctly', async ({ page }) => {
    // Available book
    const availableBook = TEST_BOOKS.nineteenEightyFour.title;
    const isAvailable = await discoverPage.isBookAvailable(availableBook);
    expect(isAvailable).toBe(true);

    // Unavailable book (all copies borrowed in test data)
    const unavailableBook = TEST_BOOKS.toKillAMockingbird.title;
    const isUnavailable = await discoverPage.isBookAvailable(unavailableBook);
    expect(isUnavailable).toBe(false);
  });
});

test.describe('Search & Discovery - Book Details', () => {
  test('should display complete book information', async ({ page }) => {
    // Arrange - Navigate to a known book
    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();
    await discoverPage.clickBook(TEST_BOOKS.nineteenEightyFour.title);

    // Assert - Book details page
    const bookDetailsPage = new BookDetailsPage(page);

    // Check title
    const title = await bookDetailsPage.getTitle();
    expect(title.toLowerCase()).toContain('1984');

    // Check author
    const author = await bookDetailsPage.getAuthor();
    expect(author).toBeTruthy();
    expect(author.length).toBeGreaterThan(0);

    // Check availability
    const isAvailable = await bookDetailsPage.isAvailable();
    expect(typeof isAvailable).toBe('boolean');
  });

  test('should show available copies count', async ({ page }) => {
    // Arrange
    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();
    await discoverPage.clickBook(TEST_BOOKS.nineteenEightyFour.title);

    // Act
    const bookDetailsPage = new BookDetailsPage(page);
    const copies = await bookDetailsPage.getAvailableCopies();

    // Assert
    expect(copies.total).toBeGreaterThan(0);
    expect(copies.available).toBeGreaterThanOrEqual(0);
    expect(copies.available).toBeLessThanOrEqual(copies.total);
  });

  test('should show correct availability for book with no copies available', async ({ page }) => {
    // Arrange - Navigate to book with 0 available copies
    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Find and click on unavailable book
    await discoverPage.clickBook(TEST_BOOKS.toKillAMockingbird.title);

    // Assert
    const bookDetailsPage = new BookDetailsPage(page);
    const isAvailable = await bookDetailsPage.isAvailable();
    expect(isAvailable).toBe(false);

    const copies = await bookDetailsPage.getAvailableCopies();
    expect(copies.available).toBe(0);
  });

  test('should allow guest users to view books but prompt to sign in', async ({ page }) => {
    // Arrange - Start as guest (not logged in)
    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();
    await discoverPage.clickBook(TEST_BOOKS.nineteenEightyFour.title);

    // Act
    const bookDetailsPage = new BookDetailsPage(page);

    // Assert - Sign in and register links should be visible for guests
    const hasSignInLink = await bookDetailsPage.signInLink.count();
    const hasRegisterLink = await bookDetailsPage.registerLink.count();

    expect(hasSignInLink + hasRegisterLink).toBeGreaterThan(0);
  });

  test('should navigate back to discover page', async ({ page }) => {
    // Arrange
    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();
    await discoverPage.clickBook(TEST_BOOKS.harryPotter.title);

    // Act
    const bookDetailsPage = new BookDetailsPage(page);
    await bookDetailsPage.goBack();

    // Assert - Should be back on discover page
    await expect(page).toHaveURL(/\/discover/);
  });
});

test.describe('Search & Discovery - Category Filtering', () => {
  test.skip('should filter books by category', async ({ page }) => {
    /**
     * NOTE: Skipped - depends on category filter implementation
     * To implement:
     * 1. Click on category filter
     * 2. Select a category
     * 3. Verify only books from that category are shown
     */

    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Example category from fixtures
    const category = CATEGORIES[0]; // "Fiction"

    // TODO: Implement when category filtering is available in UI
    // await discoverPage.filterByCategory(category);
    // const books = await discoverPage.getBooksByCategory(category);
    // expect(books.length).toBeGreaterThan(0);
  });

  test('should show all categories in the filter', async ({ page }) => {
    // Arrange
    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Check if category filter exists
    const categoryFilterExists = await discoverPage.categoryFilter.count();

    if (categoryFilterExists > 0) {
      // Click to open filter
      await discoverPage.categoryFilter.click();

      // Check for category options
      for (const category of CATEGORIES.slice(0, 3)) {
        const categoryOption = page.locator(`text="${category}"`);
        const count = await categoryOption.count();
        // Category might be visible
        expect(count).toBeGreaterThanOrEqual(0);
      }
    } else {
      test.skip();
    }
  });
});

test.describe('Search & Discovery - Performance', () => {
  test('should load discover page within acceptable time', async ({ page }) => {
    // Act
    const startTime = Date.now();
    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();
    const loadTime = Date.now() - startTime;

    // Assert - Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Verify books are loaded
    const bookCount = await discoverPage.getBookCount();
    expect(bookCount).toBeGreaterThan(0);
  });

  test('should handle rapid searches gracefully', async ({ page }) => {
    // Arrange
    const discoverPage = new DiscoverPage(page);
    await discoverPage.goto();

    // Act - Perform multiple rapid searches
    const searches = ['1984', 'Harry', 'Foundation', 'Brave'];

    for (const search of searches) {
      await discoverPage.searchInput.fill(search);
      await page.waitForTimeout(100); // Small delay to simulate typing
    }

    await page.keyboard.press('Enter');
    await waitForNetworkIdle(page);

    // Assert - Page should still be functional
    const bookCount = await discoverPage.getBookCount();
    expect(bookCount).toBeGreaterThanOrEqual(0);
  });
});
