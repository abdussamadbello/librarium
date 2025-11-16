# Authentication & Session Persistence Guide

## Overview

This guide explains how authentication and session persistence work in the E2E test suite, addressing the session persistence issues and providing best practices for writing authenticated tests.

## How It Works

### 1. Global Setup - Pre-Authentication

During test suite initialization (`global-setup.ts`), we:

1. **Reset and seed the test database** with test users
2. **Pre-authenticate each test user** by logging them in via the UI
3. **Save authentication state** to JSON files in `tests/.auth/`

These saved states include:
- Session cookies
- Local storage
- Session storage
- Authentication tokens

**Auth state files created:**
- `tests/.auth/admin.json` - Admin user session
- `tests/.auth/staff.json` - Staff user session
- `tests/.auth/director.json` - Director user session
- `tests/.auth/member.json` - Standard member session
- `tests/.auth/premium.json` - Premium member session
- `tests/.auth/student.json` - Student member session

### 2. Test Execution - Reusing Auth States

Tests can reuse these saved authentication states, avoiding the need to log in for every test. This provides:

✅ **Faster test execution** - No login overhead  
✅ **More reliable tests** - Fewer authentication-related timeouts  
✅ **Better session persistence** - Cookies and tokens properly maintained  
✅ **Isolated test runs** - Each test starts with a clean authenticated session

## Usage Patterns

### Pattern 1: Using Storage State (Recommended)

**Best for:** Most authenticated tests

Use the `test.use()` API to specify which auth state to use:

```typescript
import { test, expect } from '@playwright/test';

// Use admin authentication for all tests in this file
test.use({ storageState: 'tests/.auth/admin.json' });

test.describe('Admin Dashboard Tests', () => {
  test('should display dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // Already authenticated as admin - no login needed!
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('should show admin features', async ({ page }) => {
    await page.goto('/admin/books');
    // Still authenticated from saved state
  });
});
```

### Pattern 2: Using Auth Fixtures

**Best for:** Tests that need to switch between different user roles

```typescript
import { test, expect, AUTH_STATES } from '../helpers/auth-fixtures';

test.describe('Multi-User Tests', () => {
  test('admin can view all data', async ({ page }) => {
    test.use({ storageState: AUTH_STATES.admin });
    await page.goto('/admin/reports');
    // Test admin-specific features
  });

  test('member has limited access', async ({ page }) => {
    test.use({ storageState: AUTH_STATES.member });
    await page.goto('/member/dashboard');
    // Test member-specific features
  });
});
```

### Pattern 3: Fresh Login (Use Sparingly)

**Best for:** Testing the login flow itself or when you need to verify authentication behavior

```typescript
import { test, expect } from '../helpers/auth-fixtures';
import { LoginPage } from '../helpers/page-objects/LoginPage';
import { TEST_USERS } from '../fixtures';

test.describe('Login Flow Tests', () => {
  test('should successfully login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithEmail(
      TEST_USERS.admin.email,
      TEST_USERS.admin.password
    );
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });
});
```

### Pattern 4: Per-Test Authentication

**Best for:** Tests that need different users in the same file

```typescript
import { test, expect } from '@playwright/test';

test.describe('User-Specific Tests', () => {
  test('admin test', async ({ page }) => {
    await test.use({ storageState: 'tests/.auth/admin.json' });
    await page.goto('/admin/dashboard');
  });

  test('member test', async ({ page }) => {
    await test.use({ storageState: 'tests/.auth/member.json' });
    await page.goto('/member/dashboard');
  });
});
```

## Available Auth States

| Auth State | Role | Use Case |
|------------|------|----------|
| `admin.json` | Admin | Full system administration |
| `staff.json` | Staff | Book management, transactions |
| `director.json` | Director | Full admin access + special features |
| `member.json` | Member (Standard) | Standard membership tier |
| `premium.json` | Member (Premium) | Premium membership tier |
| `student.json` | Member (Student) | Student membership tier |

## Playwright Projects with Auth

The `playwright.config.ts` defines dedicated projects for authenticated tests:

```typescript
// Run admin tests with admin auth automatically
{
  name: 'admin-chromium',
  use: {
    ...devices['Desktop Chrome'],
    storageState: 'tests/.auth/admin.json',
  },
  testMatch: /.*admin.*.spec\.ts/,
}
```

This means:
- Tests in files matching `*admin*.spec.ts` automatically use admin auth
- Tests in files matching `*member*.spec.ts` automatically use member auth
- No need to specify `test.use()` in these files

## Session Persistence Best Practices

### ✅ DO:

1. **Use pre-authenticated states** for most tests
   ```typescript
   test.use({ storageState: 'tests/.auth/admin.json' });
   ```

2. **Group tests by user role** in separate files
   ```
   tests/e2e/admin/dashboard.spec.ts  // Uses admin.json
   tests/e2e/member/profile.spec.ts   // Uses member.json
   ```

3. **Let Playwright handle cookies** - don't manually manage them

4. **Use page objects** for consistent navigation
   ```typescript
   await page.goto('/admin/dashboard');  // Not page.goto('http://localhost:3001/admin/dashboard')
   ```

### ❌ DON'T:

1. **Don't login manually in beforeEach** unless testing login itself
   ```typescript
   // ❌ Slow and unreliable
   test.beforeEach(async ({ page }) => {
     await page.goto('/login');
     await page.fill('#email', 'admin@test.com');
     // ... login process
   });
   ```

2. **Don't mix auth methods** in the same test file

3. **Don't manually clear cookies** unless testing logout

4. **Don't rely on timing** for authentication
   ```typescript
   // ❌ Bad
   await page.waitForTimeout(5000); // Waiting for auth
   
   // ✅ Good
   await expect(page).toHaveURL(/\/dashboard/);
   ```

## Troubleshooting

### Auth State Not Working

**Problem:** Test fails with "not authenticated" error despite using storage state

**Solutions:**
1. Verify the auth state file exists: `ls tests/.auth/`
2. Check that global-setup ran successfully
3. Ensure the auth state matches the expected user role
4. Try regenerating auth states:
   ```bash
   rm -rf tests/.auth/
   npm run test:e2e
   ```

### Session Expires During Tests

**Problem:** Authentication works initially but fails partway through

**Solutions:**
1. Check `NEXTAUTH_SECRET` is set correctly in `.env.test`
2. Verify session timeout settings in your auth configuration
3. Ensure test database isn't being reset mid-run

### Tests Work Individually But Fail Together

**Problem:** Tests pass when run in isolation but fail when run as suite

**Solutions:**
1. Ensure each test properly uses `storageState`
2. Check for shared state pollution between tests
3. Verify `test.use()` is called before the test runs
4. Use `test.describe.serial()` if tests must run in order

### Auth State Missing Cookies

**Problem:** Auth state file exists but doesn't contain expected cookies

**Solutions:**
1. Check that the login flow in `global-setup.ts` completes successfully
2. Verify the `waitForURL` in global-setup actually waits for navigation
3. Ensure cookies are being set with correct domain/path
4. Check browser console for auth errors during setup

## Migration Guide

### Updating Existing Tests

**Before:**
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../helpers/page-objects/LoginPage';

test.describe('Admin Tests', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithEmail('admin@test.com', 'password');
  });

  test('test feature', async ({ page }) => {
    await page.goto('/admin/feature');
    // test code
  });
});
```

**After:**
```typescript
import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/.auth/admin.json' });

test.describe('Admin Tests', () => {
  test('test feature', async ({ page }) => {
    await page.goto('/admin/feature');
    // test code - already authenticated!
  });
});
```

## Performance Impact

Using pre-authenticated storage states provides significant performance improvements:

| Approach | Time per Test | 100 Tests |
|----------|--------------|-----------|
| Manual login each test | ~5-10s overhead | +500-1000s |
| Storage state reuse | ~0.1s overhead | +10s |

**Savings:** 490-990 seconds (8-16 minutes) for 100 tests!

## Configuration Reference

### Environment Variables

Required in `.env.test`:
```bash
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=test-secret-key-must-be-at-least-32-characters-long
DATABASE_URL=******localhost:5433/librarium_test
```

### Playwright Config

```typescript
export default defineConfig({
  use: {
    baseURL: 'http://localhost:3001',
    // Storage state handled per-project
  },
  globalSetup: require.resolve('./tests/helpers/global-setup.ts'),
  globalTeardown: require.resolve('./tests/helpers/global-teardown.ts'),
});
```

## See Also

- [Playwright Authentication Guide](https://playwright.dev/docs/auth)
- [Playwright Storage State API](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)
- [TESTING_QUICKSTART.md](../TESTING_QUICKSTART.md) - Setup instructions
- [TEST_EXECUTION_SUMMARY.md](../TEST_EXECUTION_SUMMARY.md) - Test results
