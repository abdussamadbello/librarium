import { Page, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { TEST_USERS } from '../fixtures';

/**
 * Common test utilities and helper functions
 */

/**
 * Login as a specific user type
 */
export async function loginAs(
  page: Page,
  userType: 'admin' | 'staff' | 'director' | 'member' | 'premium' | 'student'
) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  const user = TEST_USERS[userType];
  await loginPage.loginWithEmail(user.email, user.password);

  // Wait for redirect
  await page.waitForLoadState('networkidle');

  // Verify login based on role
  if (userType === 'member' || userType === 'premium' || userType === 'student') {
    await expect(page).toHaveURL(/\/member/);
  } else {
    await expect(page).toHaveURL(/\/admin/);
  }

  return user;
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(page: Page, urlPattern: string | RegExp, timeout = 5000) {
  return await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Check if element exists (doesn't throw if not found)
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).count().then((count) => count > 0);
}

/**
 * Get text content safely (returns empty string if not found)
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  const element = page.locator(selector).first();
  return await element.textContent().catch(() => '') || '';
}

/**
 * Wait for toast/notification message
 */
export async function waitForToast(page: Page, message?: string, timeout = 5000) {
  const toast = page.locator('[role="alert"], .toast, [class*="toast"]').first();

  if (message) {
    await expect(toast).toContainText(message, { timeout });
  } else {
    await expect(toast).toBeVisible({ timeout });
  }

  return toast;
}

/**
 * Fill form field by label
 */
export async function fillFieldByLabel(page: Page, label: string, value: string) {
  const field = page.locator(`label:has-text("${label}")`).locator('..').locator('input, textarea, select');
  await field.fill(value);
}

/**
 * Click button by text
 */
export async function clickButtonByText(page: Page, text: string) {
  const button = page.locator(`button:has-text("${text}")`).first();
  await button.click();
}

/**
 * Navigate and wait
 */
export async function navigateAndWait(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  const element = page.locator(selector).first();
  await element.scrollIntoViewIfNeeded();
}

/**
 * Get table row by text
 */
export async function getTableRow(page: Page, text: string) {
  return page.locator(`tr:has-text("${text}"), [role="row"]:has-text("${text}")`).first();
}

/**
 * Wait for specific text to appear
 */
export async function waitForText(page: Page, text: string, timeout = 5000) {
  await page.locator(`text=${text}`).first().waitFor({ state: 'visible', timeout });
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check for common logged-in indicators
  const hasUserMenu = await elementExists(page, '[data-testid="user-menu"], button:has-text("Profile"), button:has-text("Logout")');
  const hasAuthenticatedRoute = page.url().includes('/member/') || page.url().includes('/admin/');

  return hasUserMenu || hasAuthenticatedRoute;
}

/**
 * Logout user
 */
export async function logout(page: Page) {
  // Try to find and click logout button
  const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout"), a:has-text("Sign Out")').first();

  if (await logoutButton.isVisible().catch(() => false)) {
    await logoutButton.click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Select from dropdown
 */
export async function selectFromDropdown(page: Page, selector: string, value: string) {
  const dropdown = page.locator(selector);
  await dropdown.click();
  await page.locator(`text="${value}"`).click();
}

/**
 * Upload file
 */
export async function uploadFile(page: Page, inputSelector: string, filePath: string) {
  const fileInput = page.locator(inputSelector);
  await fileInput.setInputFiles(filePath);
}

/**
 * Clear all cookies and storage
 */
export async function clearSession(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Get current date as string
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get date in the future
 */
export function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

/**
 * Get date in the past
 */
export function getPastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Calculate fine amount
 */
export function calculateFine(daysOverdue: number, ratePerDay: number = 0.5): number {
  return daysOverdue * ratePerDay;
}

/**
 * Generate random email
 */
export function generateRandomEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Generate random ISBN
 */
export function generateRandomISBN(): string {
  const randomDigits = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return `978${randomDigits}`;
}

/**
 * Wait for element to be stable (not animating)
 */
export async function waitForElementStable(page: Page, selector: string) {
  const element = page.locator(selector).first();
  await element.waitFor({ state: 'visible' });
  await page.waitForTimeout(300); // Wait for animations to complete
}

/**
 * Retry action with exponential backoff
 */
export async function retryWithBackoff<T>(
  action: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
