# End-to-End Testing Plan for Librarium

## Table of Contents
1. [Overview](#overview)
2. [Testing Strategy](#testing-strategy)
3. [Tool Selection](#tool-selection)
4. [Test Environment Setup](#test-environment-setup)
5. [Key User Flows](#key-user-flows)
6. [Test Scenarios by Feature](#test-scenarios-by-feature)
7. [Test Data Management](#test-data-management)
8. [Test Organization Structure](#test-organization-structure)
9. [CI/CD Integration](#cicd-integration)
10. [Implementation Roadmap](#implementation-roadmap)

---

## Overview

### Application Summary
**Librarium** is a full-stack library management system with:
- **Tech Stack**: Next.js 16, React 19, TypeScript, PostgreSQL, NextAuth.js
- **User Roles**: Member, Staff, Admin, Director
- **Key Features**: Book management, borrowing/returns, fine management, analytics, AI chatbot
- **Current Testing Status**: No existing tests ❌

### Testing Objectives
1. **Verify critical user journeys** work end-to-end
2. **Ensure business logic** (fines, borrowing limits, renewals) functions correctly
3. **Validate authentication & authorization** across all roles
4. **Test data integrity** across the full stack (UI → API → Database)
5. **Prevent regressions** as new features are added
6. **Build confidence** for production deployments

---

## Testing Strategy

### Approach: Risk-Based Testing Pyramid
```
              ┌─────────────┐
              │  E2E Tests  │  ← 20% coverage (critical paths)
              │   (Slow)    │
              └─────────────┘
            ┌───────────────────┐
            │ Integration Tests │  ← 30% (API + DB)
            │    (Moderate)     │
            └───────────────────┘
       ┌──────────────────────────────┐
       │      Unit Tests              │  ← 50% (business logic)
       │        (Fast)                │
       └──────────────────────────────┘
```

### E2E Testing Scope

**In Scope:**
- ✅ Critical user journeys (login → borrow → return → pay fine)
- ✅ Multi-page workflows requiring database state
- ✅ Authentication flows (Google OAuth, email/password)
- ✅ Role-based access control verification
- ✅ Business-critical calculations (fines, inventory)
- ✅ Data export/import flows (CSV)
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari)

**Out of Scope (Unit/Integration Tests):**
- ❌ Individual utility functions
- ❌ React component rendering in isolation
- ❌ Database query logic (Drizzle ORM)
- ❌ Individual API endpoints without UI interaction

---

## Tool Selection

### Recommended: **Playwright**

#### Why Playwright?
| Feature | Playwright | Cypress | Selenium |
|---------|-----------|---------|----------|
| **Multi-browser** | ✅ Chrome, Firefox, Safari, Edge | ⚠️ Limited Safari | ✅ All browsers |
| **TypeScript Support** | ✅ First-class | ✅ Good | ⚠️ Moderate |
| **Parallel Execution** | ✅ Built-in | ⚠️ Paid tier | ⚠️ Manual setup |
| **Network Interception** | ✅ Powerful | ✅ Good | ❌ Limited |
| **Auto-wait** | ✅ Smart waiting | ✅ Yes | ❌ Manual waits |
| **Debugging** | ✅ Excellent (trace viewer) | ✅ Good | ⚠️ Basic |
| **Speed** | ⚠️ Fast | ⚠️ Fast | ❌ Slow |
| **Learning Curve** | ⚠️ Moderate | ✅ Easy | ❌ Steep |

**Verdict**: Playwright offers the best balance of power, speed, and developer experience for Next.js apps.

#### Alternative: Cypress
- Better for teams new to testing
- Easier debugging with time-travel
- Consider if team prefers simplicity over power

---

## Test Environment Setup

### 1. Infrastructure Requirements

#### Test Database
```bash
# Separate PostgreSQL database for tests
DATABASE_URL=postgresql://user:pass@localhost:5432/librarium_test

# Option 1: Docker container (recommended)
docker run --name librarium-test-db \
  -e POSTGRES_PASSWORD=testpass \
  -e POSTGRES_DB=librarium_test \
  -p 5433:5432 \
  -d postgres:16

# Option 2: Local PostgreSQL instance
createdb librarium_test
```

#### Test Environment Variables
```bash
# .env.test
DATABASE_URL=postgresql://user:pass@localhost:5433/librarium_test
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=test-secret-key-min-32-chars
GOOGLE_CLIENT_ID=test-google-client-id
GOOGLE_CLIENT_SECRET=test-google-secret
OPENAI_API_KEY=sk-test-key-for-chatbot
```

### 2. Test Data Strategy

#### Approach: **Database Seeding + Test Fixtures**

**Before Each Test Suite:**
1. Reset database to clean state
2. Run migrations (`drizzle-kit push`)
3. Seed with base data (test users, books, categories)
4. Tests create additional data as needed

**Seed Data Structure:**
```typescript
// Test users for each role
const testUsers = {
  admin: { email: 'admin@test.com', password: 'TestAdmin123!' },
  staff: { email: 'staff@test.com', password: 'TestStaff123!' },
  member: { email: 'member@test.com', password: 'TestMember123!' },
  premium: { email: 'premium@test.com', password: 'TestPremium123!' },
};

// Sample books with varied states
const testBooks = [
  { isbn: '9780001', title: 'Available Book', quantity: 5, available: 5 },
  { isbn: '9780002', title: 'Popular Book', quantity: 1, available: 0 },
  { isbn: '9780003', title: 'Reserved Book', quantity: 3, available: 2 },
];
```

### 3. Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['github'], // For GitHub Actions
  ],

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],

  webServer: {
    command: 'npm run dev -- --port 3001',
    port: 3001,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test',
    },
  },
});
```

---

## Key User Flows

### Priority 1: Critical Paths (Must Test)

#### 1. **Member Borrowing Journey**
```
[Login] → [Browse Books] → [Borrow Book] → [View Active Loans]
→ [Renew Loan] → [Return Book] → [View History]
```

**Business Rules:**
- Standard members: max 5 books
- Premium members: max 15 books
- Student members: max 10 books
- Loan period: 30 days
- Renewals: 2-5 times (14-day extensions)

#### 2. **Fine Management Flow**
```
[Book Overdue] → [Auto-calculate Fine] → [Member Views Fine]
→ [Admin Waives/Adjusts] → [Member Pays] → [Fine Cleared]
```

**Business Rules:**
- Fine rate: $0.50 per day
- Calculation: (current_date - due_date) * 0.50
- Admin can waive up to $50 without director approval

#### 3. **Admin Book Management**
```
[Login as Admin] → [Add New Book] → [Upload Cover] → [Set QR Code]
→ [Manage Inventory] → [Mark Lost/Damaged] → [Generate Reports]
```

#### 4. **Authentication & Authorization**
```
[Google OAuth Login] → [Role Check] → [Access Dashboard]
[Email Login] → [Session Persistence] → [Logout] → [Session Cleared]
```

**Role Permissions:**
- Director > Admin > Staff > Member
- Staff cannot waive fines
- Members cannot access admin routes

### Priority 2: Important Paths

5. **Member Registration & Profile**
6. **QR Code Scanning (Books + Member Cards)**
7. **Search & Filtering**
8. **CSV Import/Export**
9. **Analytics Dashboard**
10. **AI Chatbot Interaction**

### Priority 3: Edge Cases

11. **Concurrent Borrowing** (same book, multiple users)
12. **Renewal Limits** (exceed max renewals)
13. **Fine Accumulation** (multiple overdue books)
14. **Invalid Data Handling** (malformed ISBNs, etc.)

---

## Test Scenarios by Feature

### 📚 Authentication & Authorization

#### Scenario 1: Email/Password Login
```gherkin
Given I am on the login page
When I enter valid credentials for "member@test.com"
And I click "Sign In"
Then I should be redirected to "/member/dashboard"
And I should see "Welcome back" message
And my session cookie should be set
```

#### Scenario 2: Google OAuth Login
```gherkin
Given I am on the login page
When I click "Sign in with Google"
And I authorize the app with Google
Then I should be redirected to the appropriate dashboard based on my role
And my profile should be created if first-time login
```

#### Scenario 3: Role-Based Access Control
```gherkin
Given I am logged in as "member"
When I attempt to navigate to "/admin/dashboard"
Then I should be redirected to "/unauthorized" or "/member/dashboard"
And I should see an error message
```

#### Scenario 4: Session Persistence
```gherkin
Given I am logged in as "admin"
When I refresh the page
Then I should remain logged in
And I should stay on the current page

When I close and reopen the browser
And I return to the site within 30 days
Then I should still be logged in (if "Remember Me" was checked)
```

---

### 📖 Book Borrowing & Returns

#### Scenario 5: Successful Book Borrowing
```gherkin
Given I am logged in as "member" with 0 active loans
And there is a book "The Great Gatsby" with available quantity > 0
When I navigate to the book details page
And I click "Borrow This Book"
Then I should see a success message
And the book should appear in my "Active Loans"
And the available quantity should decrease by 1
And the due date should be 30 days from today
```

#### Scenario 6: Borrowing Limit Enforcement
```gherkin
Given I am logged in as "member" (standard tier, limit: 5 books)
And I already have 5 active loans
When I attempt to borrow another book
Then I should see an error "You've reached your borrowing limit"
And the borrowing should be blocked
And no transaction should be created
```

#### Scenario 7: Book Renewal
```gherkin
Given I have an active loan for "1984" due in 5 days
And I have not exceeded my renewal limit (2 renewals for standard)
When I navigate to "Active Loans"
And I click "Renew" next to "1984"
Then the due date should be extended by 14 days
And my renewal count should increment
And I should see a confirmation message
```

#### Scenario 8: Exceeded Renewal Limit
```gherkin
Given I have renewed "Animal Farm" 2 times already (max for standard tier)
When I attempt to renew it again
Then I should see an error "Maximum renewals reached"
And the due date should not change
```

#### Scenario 9: Book Return
```gherkin
Given I have borrowed "Brave New World" 10 days ago
When an admin processes my return from "/admin/transactions"
Then the book should be removed from my active loans
And it should appear in my borrowing history
And the available quantity should increase by 1
And the status should be "Returned"
```

---

### 💰 Fine Management

#### Scenario 10: Automatic Fine Calculation
```gherkin
Given I borrowed "To Kill a Mockingbird" 45 days ago (due date: 15 days overdue)
When I view my account details
Then I should see a fine of $7.50 (15 days * $0.50)
And the fine status should be "Unpaid"
And I should see "Overdue" badge on my active loans
```

#### Scenario 11: Fine Waiver (Admin)
```gherkin
Given a member has a fine of $25.00
And I am logged in as "admin"
When I navigate to the member's fine details
And I click "Waive Fine"
And I enter reason "First-time offender"
And I confirm the waiver
Then the fine amount should be reduced to $0.00
And the status should be "Waived"
And an audit log entry should be created
```

#### Scenario 12: Fine Waiver Limit (Staff)
```gherkin
Given a member has a fine of $60.00
And I am logged in as "staff" (waiver limit: $50)
When I attempt to waive the full fine
Then I should see an error "Requires director approval for fines > $50"
And the waiver should be blocked
```

#### Scenario 13: Fine Payment
```gherkin
Given I am a member with $12.50 in unpaid fines
When I navigate to "My Account" → "Fines"
And I click "Pay Fine"
And I complete the payment process
Then my fine balance should be $0.00
And the payment should be recorded with timestamp
And I should receive a payment confirmation
```

---

### 👤 Member Management (Admin)

#### Scenario 14: Add New Member
```gherkin
Given I am logged in as "admin"
When I navigate to "/admin/members" → "Add Member"
And I fill in:
  | Field          | Value                  |
  | Name           | John Doe               |
  | Email          | john@example.com       |
  | Membership Type| Premium                |
  | Phone          | +1234567890            |
And I submit the form
Then the member should be created
And a QR code should be generated
And I should see the member in the members list
```

#### Scenario 15: Upgrade Membership
```gherkin
Given a member "Jane Smith" has a "Standard" membership
And I am logged in as "admin"
When I navigate to Jane's profile
And I click "Edit Membership"
And I change tier to "Premium"
And I save changes
Then her borrowing limit should increase from 5 to 15
And her renewal limit should increase from 2 to 5
And an audit log entry should be created
```

---

### 📊 Admin Analytics & Reports

#### Scenario 16: View Dashboard Metrics
```gherkin
Given I am logged in as "admin"
When I navigate to "/admin/dashboard"
Then I should see accurate statistics:
  - Total Books (from books.quantity sum)
  - Active Members (from members where status = active)
  - Books Borrowed Today (from transactions where date = today)
  - Outstanding Fines (from fines where status = unpaid)
```

#### Scenario 17: Export Transaction History (CSV)
```gherkin
Given there are 50 transactions in the database
When I navigate to "/admin/transactions"
And I click "Export CSV"
Then a CSV file should download
And it should contain all 50 transactions
And columns should include: ID, Member, Book, Borrow Date, Return Date, Status
```

---

### 🔍 Search & Discovery

#### Scenario 18: Search Books by Title
```gherkin
Given there are 100 books in the database
And 3 books have "Harry Potter" in the title
When I enter "Harry Potter" in the search bar
And I press Enter
Then I should see 3 results
And they should be ranked by relevance
And each result should show: title, author, availability
```

#### Scenario 19: Filter Books by Category
```gherkin
Given there are books in categories: Fiction (30), Non-Fiction (20), Science (15)
When I select "Science" from the category filter
Then I should see exactly 15 books
And all should have category "Science"
```

---

### 📱 QR Code Functionality

#### Scenario 20: Scan Book QR Code
```gherkin
Given a book has QR code data: "BOOK-9780140449136"
When an admin scans the QR code from "/admin/scan"
Then the book details should be displayed
And the admin should see quick actions: [Borrow, Return, View History]
```

#### Scenario 21: Scan Member Card
```gherkin
Given a member has QR code: "MEMBER-12345"
When staff scans the member card
Then the member profile should be displayed
And staff should see: active loans, fines, membership status
```

---

### 🤖 AI Chatbot

#### Scenario 22: Ask About Book Availability
```gherkin
Given I am logged in as "member"
When I open the AI chatbot
And I type "Do you have 1984 by George Orwell?"
Then the chatbot should respond with:
  - Book availability status
  - Number of copies available
  - Option to borrow if available
```

#### Scenario 23: RAG-Powered Book Recommendations
```gherkin
Given the RAG embeddings are indexed
When I ask "Recommend books similar to The Alchemist"
Then the chatbot should use vector similarity search
And return 3-5 relevant recommendations
And include brief descriptions
```

---

### 🔄 Data Import/Export

#### Scenario 24: Import Books from CSV
```gherkin
Given I have a CSV file with 20 books
And I am logged in as "admin"
When I navigate to "/admin/books/import"
And I upload the CSV file
And I click "Import"
Then all 20 books should be created
And duplicate ISBNs should be skipped with warnings
And I should see an import summary report
```

#### Scenario 25: Export Member History
```gherkin
Given a member has 30 completed transactions
When the member clicks "Export My History" from their profile
Then a CSV file should download
And it should contain all 30 transactions
And sensitive data (admin notes) should be excluded
```

---

## Test Data Management

### Database Reset Strategy

```typescript
// tests/helpers/db-setup.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-kit';
import { seed } from './seed-data';

export async function resetDatabase() {
  const db = drizzle(process.env.DATABASE_URL);

  // 1. Drop all tables
  await db.execute('DROP SCHEMA public CASCADE');
  await db.execute('CREATE SCHEMA public');

  // 2. Run migrations
  await migrate(db, { migrationsFolder: './drizzle' });

  // 3. Seed base data
  await seed(db);
}

export async function cleanupDatabase() {
  // Called after each test to remove test-specific data
  const db = drizzle(process.env.DATABASE_URL);

  await db.delete(transactions).where(/* test data conditions */);
  await db.delete(fines).where(/* test data conditions */);
  // Keep base seed data intact
}
```

### Fixture Data Patterns

```typescript
// tests/fixtures/users.ts
export const TEST_USERS = {
  admin: {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'admin',
    password: 'TestAdmin123!',
  },
  member: {
    id: 'member-1',
    email: 'member@test.com',
    name: 'Test Member',
    role: 'member',
    membershipTier: 'standard',
    borrowingLimit: 5,
    password: 'TestMember123!',
  },
  premium: {
    id: 'member-2',
    email: 'premium@test.com',
    name: 'Premium Member',
    role: 'member',
    membershipTier: 'premium',
    borrowingLimit: 15,
    password: 'TestPremium123!',
  },
};

// tests/fixtures/books.ts
export const TEST_BOOKS = [
  {
    id: 'book-1',
    isbn: '9780140449136',
    title: '1984',
    author: 'George Orwell',
    quantity: 5,
    available: 5,
    category: 'Fiction',
  },
  {
    id: 'book-2',
    isbn: '9780061120084',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    quantity: 3,
    available: 0, // All borrowed
    category: 'Fiction',
  },
];
```

---

## Test Organization Structure

### Recommended Directory Structure

```
librarium/
├── tests/
│   ├── e2e/                         # End-to-end tests
│   │   ├── auth/
│   │   │   ├── login.spec.ts
│   │   │   ├── logout.spec.ts
│   │   │   ├── oauth.spec.ts
│   │   │   └── permissions.spec.ts
│   │   ├── member/
│   │   │   ├── borrowing.spec.ts
│   │   │   ├── renewals.spec.ts
│   │   │   ├── returns.spec.ts
│   │   │   ├── fines.spec.ts
│   │   │   └── history.spec.ts
│   │   ├── admin/
│   │   │   ├── books.spec.ts
│   │   │   ├── members.spec.ts
│   │   │   ├── transactions.spec.ts
│   │   │   ├── fines.spec.ts
│   │   │   └── analytics.spec.ts
│   │   ├── search/
│   │   │   ├── book-search.spec.ts
│   │   │   └── filters.spec.ts
│   │   ├── qr/
│   │   │   ├── scan-book.spec.ts
│   │   │   └── scan-member.spec.ts
│   │   └── chatbot/
│   │       ├── basic-queries.spec.ts
│   │       └── rag-search.spec.ts
│   ├── integration/                 # API + DB tests (future)
│   ├── unit/                        # Unit tests (future)
│   ├── fixtures/
│   │   ├── users.ts
│   │   ├── books.ts
│   │   ├── transactions.ts
│   │   └── index.ts
│   ├── helpers/
│   │   ├── db-setup.ts
│   │   ├── auth-helpers.ts
│   │   ├── page-objects.ts          # Page Object Model
│   │   └── test-utils.ts
│   └── playwright.config.ts
├── playwright.config.ts              # Root config
└── package.json
```

---

## Page Object Model (POM)

### Why Use POM?
- **Maintainability**: UI changes only require updates in one place
- **Reusability**: Share common actions across tests
- **Readability**: Tests read like user stories

### Example Implementation

```typescript
// tests/helpers/page-objects/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly googleSignInButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.signInButton = page.locator('button[type="submit"]');
    this.googleSignInButton = page.locator('button:has-text("Sign in with Google")');
    this.errorMessage = page.locator('[role="alert"]');
  }

  async goto() {
    await this.page.goto('/sign-in');
  }

  async loginWithEmail(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async loginWithGoogle() {
    await this.googleSignInButton.click();
    // Handle OAuth flow
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }
}

// tests/helpers/page-objects/MemberDashboard.ts
export class MemberDashboard {
  readonly page: Page;
  readonly activeLoansSection: Locator;
  readonly finesSection: Locator;
  readonly searchBar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.activeLoansSection = page.locator('[data-testid="active-loans"]');
    this.finesSection = page.locator('[data-testid="fines-summary"]');
    this.searchBar = page.locator('input[placeholder*="Search"]');
  }

  async goto() {
    await this.page.goto('/member/dashboard');
  }

  async getActiveLoansCount(): Promise<number> {
    const loans = await this.activeLoansSection.locator('.loan-item').count();
    return loans;
  }

  async getTotalFines(): Promise<number> {
    const text = await this.finesSection.textContent();
    const match = text?.match(/\$(\d+\.\d{2})/);
    return match ? parseFloat(match[1]) : 0;
  }

  async searchBooks(query: string) {
    await this.searchBar.fill(query);
    await this.page.keyboard.press('Enter');
  }
}
```

### Usage in Tests

```typescript
// tests/e2e/member/borrowing.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../helpers/page-objects/LoginPage';
import { MemberDashboard } from '../../helpers/page-objects/MemberDashboard';
import { BookDetailsPage } from '../../helpers/page-objects/BookDetailsPage';
import { TEST_USERS } from '../../fixtures/users';

test.describe('Book Borrowing', () => {
  test('member can borrow an available book', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithEmail(TEST_USERS.member.email, TEST_USERS.member.password);

    // Navigate to dashboard
    const dashboard = new MemberDashboard(page);
    await expect(page).toHaveURL('/member/dashboard');

    const initialLoans = await dashboard.getActiveLoansCount();

    // Search and borrow a book
    await dashboard.searchBooks('1984');

    const bookDetails = new BookDetailsPage(page);
    await bookDetails.clickFirstResult();
    await expect(bookDetails.borrowButton).toBeVisible();
    await bookDetails.borrowBook();

    // Verify success
    await expect(bookDetails.successMessage).toContainText('Successfully borrowed');

    // Check active loans increased
    await dashboard.goto();
    const newLoans = await dashboard.getActiveLoansCount();
    expect(newLoans).toBe(initialLoans + 1);
  });
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 20
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: librarium_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Setup test database
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/librarium_test
        run: |
          npm run db:push
          npm run db:seed:test

      - name: Run E2E tests
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/librarium_test
          NEXTAUTH_URL: http://localhost:3001
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET_TEST }}
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload test videos
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-videos
          path: test-results/
          retention-days: 7
```

### Pre-deployment Testing

```yaml
# .github/workflows/staging-deploy.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      # ... run E2E tests ...

      - name: Deploy to Vercel Staging
        if: success()
        run: vercel deploy --env=staging

      - name: Run smoke tests on staging
        if: success()
        env:
          BASE_URL: https://librarium-staging.vercel.app
        run: npm run test:e2e:smoke
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
**Goal**: Set up testing infrastructure

- [ ] Install Playwright and dependencies
- [ ] Create `playwright.config.ts`
- [ ] Set up test database (Docker container)
- [ ] Create `.env.test` with environment variables
- [ ] Implement database reset/seed scripts
- [ ] Create fixture files (users, books, transactions)
- [ ] Set up GitHub Actions workflow
- [ ] Write first smoke test (login)

**Deliverables**:
- Working test environment
- 1 passing smoke test
- CI/CD pipeline running

---

### Phase 2: Critical Paths (Week 2-3)
**Goal**: Cover P1 user journeys

- [ ] **Authentication** (4 tests)
  - Email/password login
  - Google OAuth
  - Role-based access control
  - Session persistence

- [ ] **Member Borrowing** (6 tests)
  - Successful borrowing
  - Borrowing limit enforcement
  - Book renewal
  - Renewal limit enforcement
  - Book return
  - View history

- [ ] **Fine Management** (4 tests)
  - Automatic fine calculation
  - Fine waiver (admin)
  - Fine waiver limits (staff)
  - Fine payment

**Deliverables**:
- 14 passing tests
- Page Object Models for key pages
- 70% coverage of critical flows

---

### Phase 3: Admin Features (Week 4)
**Goal**: Validate admin workflows

- [ ] **Book Management** (5 tests)
  - Add new book
  - Edit book details
  - Upload cover image
  - Adjust inventory
  - Mark book as lost/damaged

- [ ] **Member Management** (4 tests)
  - Add new member
  - Edit member profile
  - Upgrade/downgrade membership
  - Deactivate member

- [ ] **Analytics** (3 tests)
  - Dashboard metrics accuracy
  - Export CSV reports
  - Filter/search functionality

**Deliverables**:
- 12 additional tests (26 total)
- Admin Page Objects
- 85% critical path coverage

---

### Phase 4: Advanced Features (Week 5)
**Goal**: Test complex interactions

- [ ] **Search & Discovery** (4 tests)
- [ ] **QR Code Scanning** (2 tests)
- [ ] **Data Import/Export** (3 tests)
- [ ] **AI Chatbot** (2 tests)

**Deliverables**:
- 11 additional tests (37 total)
- 95% critical path coverage

---

### Phase 5: Edge Cases & Cross-Browser (Week 6)
**Goal**: Harden test suite

- [ ] Concurrent operations (2 tests)
- [ ] Error handling (3 tests)
- [ ] Mobile responsive tests (3 tests)
- [ ] Cross-browser validation (Firefox, Safari)
- [ ] Performance benchmarks (Lighthouse CI)

**Deliverables**:
- 45+ total tests
- Multi-browser coverage
- Production-ready test suite

---

### Phase 6: Optimization & Maintenance (Ongoing)
**Goal**: Maintain test health

- [ ] Reduce test flakiness (retries, waits)
- [ ] Optimize test execution time (parallelization)
- [ ] Add visual regression testing (Percy/Chromatic)
- [ ] Monitor test metrics (pass rate, duration)
- [ ] Update tests as features evolve

---

## Success Metrics

### Test Coverage Goals
- ✅ **95%** of critical user journeys covered
- ✅ **100%** of authentication flows tested
- ✅ **90%** of admin features validated
- ✅ **85%** overall feature coverage

### Test Quality Metrics
- ✅ **< 2%** flaky test rate
- ✅ **< 15 min** full suite execution time
- ✅ **> 98%** test pass rate in CI/CD
- ✅ **0** critical bugs in production post-launch

### Developer Experience
- ✅ Easy to write new tests (Page Object Models)
- ✅ Fast feedback loop (< 5 min for critical tests)
- ✅ Clear error messages and debugging tools
- ✅ Automated in CI/CD pipeline

---

## Best Practices & Tips

### 1. Test Isolation
```typescript
// ✅ Good: Each test is independent
test('borrow book', async ({ page }) => {
  await resetDatabase(); // Fresh state
  await loginAsMember(page);
  // ... test logic
});

// ❌ Bad: Tests depend on each other
test.describe.serial('borrowing flow', () => {
  test('step 1: login', ...);
  test('step 2: borrow', ...); // Fails if step 1 fails
});
```

### 2. Smart Waits (Avoid Flakiness)
```typescript
// ✅ Good: Wait for specific condition
await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

// ❌ Bad: Arbitrary timeout
await page.waitForTimeout(3000); // Brittle!
```

### 3. Test Data Independence
```typescript
// ✅ Good: Create test data per test
const book = await createTestBook({ isbn: '9780001' });

// ❌ Bad: Rely on shared fixtures
const book = TEST_BOOKS[0]; // May be modified by other tests
```

### 4. Readable Assertions
```typescript
// ✅ Good: Clear error messages
await expect(page.locator('.fine-amount')).toHaveText('$7.50', {
  message: 'Fine should be calculated as 15 days * $0.50'
});

// ❌ Bad: Vague assertions
expect(await page.textContent('.fine')).toBe('$7.50');
```

### 5. Use Data Test IDs
```tsx
// ✅ Good: Stable selectors
<button data-testid="borrow-button">Borrow</button>

// ❌ Bad: Fragile selectors
<button className="btn-primary-lg hover:bg-blue-600">Borrow</button>
// Test: page.locator('.btn-primary-lg') // Breaks if CSS changes
```

---

## Appendix: Quick Reference

### Essential Commands
```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/auth/login.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run tests with UI
npx playwright test --ui

# Generate test report
npx playwright show-report

# Record a new test
npx playwright codegen http://localhost:3000
```

### Database Commands
```bash
# Reset test database
npm run db:reset:test

# Seed test data
npm run db:seed:test

# Run migrations
npm run db:push
```

### Useful Playwright APIs
```typescript
// Navigation
await page.goto('/path');
await page.goBack();
await page.reload();

// Locators
page.locator('button')
page.getByRole('button', { name: 'Submit' })
page.getByText('Hello World')
page.getByTestId('submit-button')

// Actions
await button.click();
await input.fill('text');
await select.selectOption('value');
await checkbox.check();
await page.screenshot({ path: 'screenshot.png' });

// Assertions
await expect(locator).toBeVisible();
await expect(locator).toHaveText('text');
await expect(locator).toHaveCount(5);
await expect(page).toHaveURL('/dashboard');
```

---

## Next Steps

1. **Review this plan** with your team
2. **Adjust priorities** based on your release timeline
3. **Start with Phase 1** (foundation setup)
4. **Write your first test** (login smoke test)
5. **Iterate** and expand coverage weekly

**Questions?** Refer to:
- [Playwright Documentation](https://playwright.dev)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Example Projects](https://github.com/microsoft/playwright/tree/main/examples)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-16
**Status**: Ready for Implementation ✅
