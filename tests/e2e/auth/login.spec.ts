import { test, expect } from '@playwright/test';
import { LoginPage } from '../../helpers/page-objects/LoginPage';
import { MemberDashboard } from '../../helpers/page-objects/MemberDashboard';
import { TEST_USERS } from '../../fixtures';

test.describe('Authentication - Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should successfully login with valid member credentials', async ({ page }) => {
    // Arrange
    const { email, password } = TEST_USERS.member;

    // Act
    await loginPage.loginWithEmail(email, password);

    // Assert
    await expect(page).toHaveURL(/\/member\/dashboard/);

    // Verify dashboard is loaded
    const dashboard = new MemberDashboard(page);
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard|welcome/i })).toBeVisible();
  });

  test('should successfully login with valid admin credentials', async ({ page }) => {
    // Arrange
    const { email, password } = TEST_USERS.admin;

    // Act
    await loginPage.loginWithEmail(email, password);

    // Assert
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Arrange
    const invalidEmail = 'invalid@test.com';
    const invalidPassword = 'wrongpassword';

    // Act
    await loginPage.loginWithEmail(invalidEmail, invalidPassword);

    // Assert
    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText.toLowerCase()).toContain('invalid');
  });

  test('should show error with empty email', async ({ page }) => {
    // Arrange
    const emptyEmail = '';
    const validPassword = 'TestPassword123!';

    // Act
    await loginPage.emailInput.fill(emptyEmail);
    await loginPage.passwordInput.fill(validPassword);
    await loginPage.signInButton.click();

    // Assert
    // HTML5 validation should prevent submission
    const emailValidity = await loginPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(emailValidity).toBe(false);
  });

  test('should navigate to register page when clicking register link', async ({ page }) => {
    // Act
    await loginPage.goToRegister();

    // Assert
    await expect(page).toHaveURL(/\/register/);
  });

  test('should persist session after page refresh', async ({ page }) => {
    // Arrange
    const { email, password } = TEST_USERS.member;

    // Act - Login
    await loginPage.loginWithEmail(email, password);
    await expect(page).toHaveURL(/\/member\/dashboard/);

    // Act - Refresh page
    await page.reload();

    // Assert - Should still be logged in
    await expect(page).toHaveURL(/\/member\/dashboard/);
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard|welcome/i })).toBeVisible();
  });

  test('should have Google sign-in button', async ({ page }) => {
    // Assert
    await expect(loginPage.googleSignInButton).toBeVisible();
    await expect(loginPage.googleSignInButton).toHaveText(/Google/i);
  });
});

test.describe('Authentication - Role-Based Access Control', () => {
  test('should redirect member away from admin routes', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const { email, password } = TEST_USERS.member;

    // Act - Login as member
    await loginPage.loginWithEmail(email, password);
    await expect(page).toHaveURL(/\/member\/dashboard/);

    // Act - Try to access admin route
    await page.goto('/admin/dashboard');

    // Assert - Should be redirected away from admin page
    // (Either to member dashboard, unauthorized page, or login)
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin/dashboard');
  });

  test('should allow admin to access admin routes', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const { email, password } = TEST_USERS.admin;

    // Act
    await loginPage.loginWithEmail(email, password);

    // Assert
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.locator('h1, h2').filter({ hasText: /admin|dashboard/i })).toBeVisible();
  });
});
