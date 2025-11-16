# E2E Testing Quick Start Guide

This guide will help you get started with end-to-end testing for Librarium using Playwright.

## 📋 Prerequisites

- Node.js 20+ installed
- PostgreSQL installed (for test database)
- Docker (optional, for test database container)

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Install Playwright Browsers

```bash
npm run test:install
```

This will install Chromium, Firefox, and WebKit browsers needed for testing.

### 3. Set Up Test Database

#### Option A: Using Docker (Recommended)

```bash
docker run --name librarium-test-db \
  -e POSTGRES_PASSWORD=testpass \
  -e POSTGRES_DB=librarium_test \
  -p 5433:5432 \
  -d postgres:16
```

#### Option B: Using Local PostgreSQL

```bash
createdb librarium_test
```

### 4. Configure Test Environment

Copy the example environment file and fill in the values:

```bash
cp .env.test.example .env.test
```

Edit `.env.test` with your database credentials:

```env
DATABASE_URL=postgresql://postgres:testpass@localhost:5433/librarium_test
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=test-secret-key-must-be-at-least-32-characters-long
```

### 5. Run Your First Test

```bash
npm run test:e2e
```

That's it! Your tests should now be running. 🎉

---

## 📖 Available Test Commands

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run all tests in headless mode |
| `npm run test:e2e:ui` | Open Playwright UI for interactive testing |
| `npm run test:e2e:headed` | Run tests with browser visible |
| `npm run test:e2e:debug` | Run tests in debug mode |
| `npm run test:e2e:report` | View the last test report |
| `npm run test:e2e:chromium` | Run tests only in Chromium |
| `npm run test:e2e:firefox` | Run tests only in Firefox |
| `npm run test:e2e:webkit` | Run tests only in Safari/WebKit |

---

## 🧪 Test Structure

```
tests/
├── e2e/                      # End-to-end tests
│   ├── auth/                 # Authentication tests
│   │   └── login.spec.ts
│   ├── member/               # Member flow tests
│   │   └── borrowing.spec.ts
│   └── admin/                # Admin flow tests
│       └── dashboard.spec.ts
├── fixtures/                 # Test data fixtures
│   ├── users.ts
│   ├── books.ts
│   └── index.ts
└── helpers/                  # Test utilities
    ├── db-setup.ts           # Database helpers
    ├── global-setup.ts       # Global test setup
    ├── global-teardown.ts    # Global test cleanup
    └── page-objects/         # Page Object Models
        ├── LoginPage.ts
        └── MemberDashboard.ts
```

---

## ✍️ Writing Your First Test

Here's a simple example:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../helpers/page-objects/LoginPage';
import { TEST_USERS } from '../../fixtures';

test('member can login', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // Act
  await loginPage.loginWithEmail(
    TEST_USERS.member.email,
    TEST_USERS.member.password
  );

  // Assert
  await expect(page).toHaveURL(/\/member\/dashboard/);
});
```

---

## 🎯 Running Specific Tests

```bash
# Run a specific test file
npx playwright test tests/e2e/auth/login.spec.ts

# Run tests matching a pattern
npx playwright test --grep "login"

# Run a specific test by name
npx playwright test --grep "should successfully login"

# Run tests in a specific directory
npx playwright test tests/e2e/member/
```

---

## 🐛 Debugging Tests

### Method 1: Playwright UI (Recommended)

```bash
npm run test:e2e:ui
```

This opens an interactive UI where you can:
- See all your tests
- Run tests one by one
- Watch tests execute in real-time
- Inspect the DOM
- View network requests

### Method 2: Debug Mode

```bash
npm run test:e2e:debug
```

This opens the Playwright Inspector for step-by-step debugging.

### Method 3: VS Code

1. Install the "Playwright Test for VSCode" extension
2. Click the testing icon in the sidebar
3. Run/debug tests directly from VS Code

---

## 📊 Viewing Test Reports

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

The report includes:
- Test results and duration
- Screenshots of failures
- Videos of failed tests
- Detailed error traces

---

## 🔄 Test Database Management

The test database is automatically:
- ✅ Reset before all tests run
- ✅ Seeded with test data
- ✅ Cleaned up after tests (optional)

### Manual Database Reset

```bash
# Reset and seed test database
NODE_ENV=test npm run db:push
```

### Debugging Database Issues

```bash
# View test database in Drizzle Studio
DATABASE_URL=postgresql://postgres:testpass@localhost:5433/librarium_test npm run db:studio
```

---

## 📚 Test Data

Test users are available in `tests/fixtures/users.ts`:

```typescript
import { TEST_USERS } from '../../fixtures';

// Available test users:
TEST_USERS.member      // Standard member
TEST_USERS.premium     // Premium member
TEST_USERS.student     // Student member
TEST_USERS.admin       // Admin user
TEST_USERS.staff       // Staff user
TEST_USERS.director    // Director user
```

All test users have the password: `TestPassword123!`

Test books are available in `tests/fixtures/books.ts`:

```typescript
import { TEST_BOOKS } from '../../fixtures';

TEST_BOOKS.nineteenEightyFour  // "1984" by George Orwell
TEST_BOOKS.harryPotter         // "Harry Potter..."
// ... and more
```

---

## 🚨 Common Issues & Solutions

### Issue: "Browser not found"

**Solution:**
```bash
npm run test:install
```

### Issue: "Cannot connect to database"

**Solution:**
1. Check if PostgreSQL is running
2. Verify `.env.test` has correct DATABASE_URL
3. Ensure test database exists

### Issue: "Tests are flaky"

**Solution:**
1. Use proper waits: `await expect(locator).toBeVisible()`
2. Avoid `page.waitForTimeout()` - use specific conditions
3. Check test isolation - ensure tests don't depend on each other

### Issue: "Port 3001 already in use"

**Solution:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in playwright.config.ts
```

---

## 🎓 Next Steps

1. **Read the full plan**: See `E2E_TESTING_PLAN.md` for comprehensive testing strategy
2. **Write tests**: Start with critical user flows (login, borrowing, fines)
3. **Create Page Objects**: Add new page objects as you test new pages
4. **Set up CI/CD**: Add tests to your GitHub Actions workflow

---

## 📞 Getting Help

- **Playwright Docs**: https://playwright.dev
- **Best Practices**: https://playwright.dev/docs/best-practices
- **Discord**: https://aka.ms/playwright/discord

---

## 📝 Test Writing Tips

### ✅ Do:
- Use Page Object Models for maintainability
- Write descriptive test names
- Test one thing per test
- Use proper waits (`toBeVisible()`, etc.)
- Clean up test data

### ❌ Don't:
- Use arbitrary timeouts (`waitForTimeout`)
- Share state between tests
- Test implementation details
- Couple tests together
- Hardcode selectors in tests (use Page Objects)

---

## 🎯 Coverage Goals

Our testing targets:
- ✅ 95% of critical user journeys
- ✅ 100% of authentication flows
- ✅ 90% of admin features
- ✅ 85% overall feature coverage

---

Happy Testing! 🧪✨
