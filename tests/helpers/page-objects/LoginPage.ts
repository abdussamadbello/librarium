import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Login Page
 * Path: /login
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly googleSignInButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[id="email"]');
    this.passwordInput = page.locator('input[id="password"]');
    this.signInButton = page.locator('button[type="submit"]:has-text("Sign In")');
    this.googleSignInButton = page.locator('button:has-text("Continue with Google")');
    this.errorMessage = page.locator('.bg-red-50.border-red-200');
    this.registerLink = page.locator('a[href="/register"]');
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login with email and password
   */
  async loginWithEmail(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();

    // Wait for navigation or error
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login with Google OAuth
   * Note: This requires mocking or test Google account
   */
  async loginWithGoogle() {
    await this.googleSignInButton.click();
    // OAuth flow would be handled here
  }

  /**
   * Check if error message is displayed
   */
  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Click register link
   */
  async goToRegister() {
    await this.registerLink.click();
    await this.page.waitForURL('**/register');
  }
}
