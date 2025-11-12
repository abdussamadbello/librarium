# Librarium - Detailed Implementation Plan

**Version:** 1.0
**Date:** November 12, 2025
**Estimated Timeline:** 8-10 weeks
**Team Size:** 1-3 developers

---

## Table of Contents

1. [Project Phases](#project-phases)
2. [Phase 0: Project Setup](#phase-0-project-setup-week-1)
3. [Phase 1: Core Infrastructure](#phase-1-core-infrastructure-week-1-2)
4. [Phase 2: Authentication & Authorization](#phase-2-authentication--authorization-week-2)
5. [Phase 3: Database Schema & Models](#phase-3-database-schema--models-week-2-3)
6. [Phase 4: Admin Portal - Core Features](#phase-4-admin-portal---core-features-week-3-5)
7. [Phase 5: Member App - Core Features](#phase-5-member-app---core-features-week-5-7)
8. [Phase 6: Advanced Features](#phase-6-advanced-features-week-7-8)
9. [Phase 7: Testing & Quality Assurance](#phase-7-testing--quality-assurance-week-8-9)
10. [Phase 8: Deployment & Launch](#phase-8-deployment--launch-week-9-10)
11. [Development Guidelines](#development-guidelines)
12. [Risk Mitigation](#risk-mitigation)

---

## Project Phases

```
┌─────────────────────────────────────────────────────────────────┐
│ Week 1-2  │ Setup & Infrastructure                              │
├─────────────────────────────────────────────────────────────────┤
│ Week 2-3  │ Database Schema & Authentication                    │
├─────────────────────────────────────────────────────────────────┤
│ Week 3-5  │ Admin Portal Development                            │
├─────────────────────────────────────────────────────────────────┤
│ Week 5-7  │ Member App Development                              │
├─────────────────────────────────────────────────────────────────┤
│ Week 7-8  │ Advanced Features & Integrations                    │
├─────────────────────────────────────────────────────────────────┤
│ Week 8-9  │ Testing, Bug Fixes & Optimization                   │
├─────────────────────────────────────────────────────────────────┤
│ Week 9-10 │ Deployment, Documentation & Launch                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Project Setup (Week 1)

### 0.1 Initialize Next.js Project

**Tasks:**
- [ ] Create new Next.js 14+ project with TypeScript and App Router
- [ ] Configure `pnpm` as package manager
- [ ] Set up project folder structure
- [ ] Initialize Git repository and connect to GitHub
- [ ] Create `.gitignore` and `.env.example` files

**Commands:**
```bash
# Create Next.js project
npx create-next-app@latest librarium --typescript --tailwind --app --src-dir

# Install dependencies
pnpm install

# Initialize Git
git init
git add .
git commit -m "Initial commit: Next.js project setup"
```

**Files to Create:**
```
.env.example
.env.local (add to .gitignore)
README.md
```

---

### 0.2 Install Core Dependencies

**Tasks:**
- [ ] Install and configure Tailwind CSS
- [ ] Install shadcn/ui and initialize
- [ ] Install Drizzle ORM and dependencies
- [ ] Install NextAuth.js v5
- [ ] Install form libraries (React Hook Form + Zod)
- [ ] Install utility libraries

**Commands:**
```bash
# shadcn/ui initialization
pnpm dlx shadcn-ui@latest init

# Install Drizzle ORM
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit

# Install NextAuth
pnpm add next-auth@beta
pnpm add @auth/drizzle-adapter

# Install form libraries
pnpm add react-hook-form @hookform/resolvers zod

# Install utility libraries
pnpm add clsx tailwind-merge
pnpm add date-fns
pnpm add lucide-react
pnpm add @tanstack/react-query
pnpm add zustand (optional)
```

---

### 0.3 Configure Development Environment

**Tasks:**
- [ ] Set up ESLint and Prettier
- [ ] Configure TypeScript strict mode
- [ ] Set up VS Code workspace settings
- [ ] Configure Tailwind with custom theme
- [ ] Create base layout components

**Files to Configure:**
```typescript
// tsconfig.json - Enable strict mode
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}

// tailwind.config.ts - Custom theme
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          teal: '#00798C',
          gold: '#E8A24C',
        },
        // ... rest of design system
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      }
    }
  }
}
```

---

### 0.4 Set Up Database Connection

**Tasks:**
- [ ] Create Neon/Vercel Postgres database
- [ ] Configure database connection
- [ ] Set up Drizzle configuration
- [ ] Test database connection

**Files to Create:**
```typescript
// lib/db/index.ts - Database client
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)
export const db = drizzle(client)

// drizzle.config.ts - Drizzle configuration
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  }
} satisfies Config
```

**Environment Variables:**
```env
DATABASE_URL=postgresql://user:password@host/database
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

---

## Phase 1: Core Infrastructure (Week 1-2)

### 1.1 Design System Implementation

**Tasks:**
- [ ] Create color palette constants
- [ ] Set up typography system
- [ ] Create spacing and sizing utilities
- [ ] Build base UI component library with shadcn/ui

**Components to Install:**
```bash
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add select
pnpm dlx shadcn-ui@latest add textarea
pnpm dlx shadcn-ui@latest add card
pnpm dlx shadcn-ui@latest add table
pnpm dlx shadcn-ui@latest add dialog
pnpm dlx shadcn-ui@latest add dropdown-menu
pnpm dlx shadcn-ui@latest add toast
pnpm dlx shadcn-ui@latest add tabs
pnpm dlx shadcn-ui@latest add badge
pnpm dlx shadcn-ui@latest add avatar
pnpm dlx shadcn-ui@latest add calendar
pnpm dlx shadcn-ui@latest add command
```

**Files to Create:**
```typescript
// lib/constants/design-system.ts
export const COLORS = {
  primary: {
    teal: '#00798C',
    gold: '#E8A24C',
  },
  // ... rest
}

// lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

### 1.2 Layout Components

**Tasks:**
- [ ] Create Admin Portal layout
- [ ] Create Member App layout
- [ ] Build responsive sidebar navigation
- [ ] Create header components
- [ ] Implement loading states and error boundaries

**Components to Build:**
```typescript
// components/layouts/admin-layout.tsx
// components/layouts/member-layout.tsx
// components/navigation/admin-sidebar.tsx
// components/navigation/member-sidebar.tsx
// components/shared/header.tsx
// components/shared/loading-spinner.tsx
// components/shared/error-boundary.tsx
```

---

### 1.3 Routing Structure

**Tasks:**
- [ ] Set up route groups for admin and member
- [ ] Create protected route middleware
- [ ] Implement dynamic routing for resources
- [ ] Set up API route structure

**Route Structure:**
```
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── (member)/
│   ├── discover/
│   ├── category/
│   ├── library/
│   ├── favorites/
│   ├── history/
│   └── layout.tsx
├── (admin)/
│   ├── dashboard/
│   ├── books/
│   ├── members/
│   ├── transactions/
│   ├── fines/
│   ├── reports/
│   └── layout.tsx
└── api/
    ├── auth/
    ├── books/
    ├── members/
    ├── transactions/
    └── admin/
```

---

## Phase 2: Authentication & Authorization (Week 2)

### 2.1 NextAuth.js Configuration

**Tasks:**
- [ ] Configure NextAuth.js v5
- [ ] Set up Google OAuth provider
- [ ] Implement email/password authentication
- [ ] Create Drizzle adapter for sessions
- [ ] Set up JWT configuration

**Files to Create:**
```typescript
// lib/auth/config.ts
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      // Email/password logic
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add role to session
      session.user.role = user.role
      return session
    },
  },
})

// app/api/auth/[...nextauth]/route.ts
export { handlers as GET, handlers as POST }
```

**Environment Variables:**
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

### 2.2 Role-Based Access Control (RBAC)

**Tasks:**
- [ ] Define user roles (member, staff, admin, director)
- [ ] Create permission system
- [ ] Implement route protection middleware
- [ ] Build authorization utilities

**Files to Create:**
```typescript
// lib/auth/roles.ts
export enum UserRole {
  MEMBER = 'member',
  STAFF = 'staff',
  ADMIN = 'admin',
  DIRECTOR = 'director',
}

export const PERMISSIONS = {
  [UserRole.MEMBER]: ['read:books', 'read:own_data'],
  [UserRole.STAFF]: ['read:books', 'write:transactions'],
  [UserRole.ADMIN]: ['*'],
  [UserRole.DIRECTOR]: ['*', 'read:analytics'],
}

// middleware.ts - Route protection
export async function middleware(request: NextRequest) {
  const session = await auth()

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session || session.user.role === 'member') {
      return NextResponse.redirect('/login')
    }
  }

  return NextResponse.next()
}
```

---

### 2.3 Authentication UI

**Tasks:**
- [ ] Create login page with Google OAuth
- [ ] Build registration form
- [ ] Implement password reset flow
- [ ] Create user profile management
- [ ] Add session management UI

**Components to Build:**
```typescript
// app/(auth)/login/page.tsx
// app/(auth)/register/page.tsx
// components/auth/google-signin-button.tsx
// components/auth/login-form.tsx
// components/auth/register-form.tsx
```

---

## Phase 3: Database Schema & Models (Week 2-3)

### 3.1 Define Database Schema

**Tasks:**
- [ ] Create users table schema
- [ ] Create books and authors tables
- [ ] Create categories and genres hierarchy
- [ ] Create transactions table
- [ ] Create fines and payments tables
- [ ] Define relationships and foreign keys

**File to Create:**
```typescript
// lib/db/schema.ts
import { pgTable, serial, text, timestamp, integer, boolean, decimal, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  role: text('role').notNull().default('member'), // member, staff, admin, director
  membershipType: text('membership_type'), // standard, premium, student
  membershipStart: timestamp('membership_start'),
  membershipExpiry: timestamp('membership_expiry'),
  phone: text('phone'),
  address: text('address'),
  dateOfBirth: timestamp('date_of_birth'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Authors table
export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  bio: text('bio'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  parentId: integer('parent_id').references(() => categories.id), // For sub-categories
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Books table
export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  isbn: text('isbn').unique(),
  authorId: integer('author_id').references(() => authors.id),
  categoryId: integer('category_id').references(() => categories.id),
  publisher: text('publisher'),
  publicationYear: integer('publication_year'),
  language: text('language'),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  totalCopies: integer('total_copies').notNull().default(1),
  availableCopies: integer('available_copies').notNull().default(1),
  shelfLocation: text('shelf_location'),
  tags: jsonb('tags').$type<string[]>(), // ['Finance', 'Self-Help']
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Book Copies table (individual physical copies)
export const bookCopies = pgTable('book_copies', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').references(() => books.id),
  copyNumber: integer('copy_number').notNull(),
  status: text('status').notNull().default('available'), // available, borrowed, in_repair, lost
  condition: text('condition'), // new, good, fair, poor
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Transactions table (checkouts & returns)
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  bookCopyId: integer('book_copy_id').references(() => bookCopies.id),
  type: text('type').notNull(), // checkout, return
  checkoutDate: timestamp('checkout_date'),
  dueDate: timestamp('due_date'),
  returnDate: timestamp('return_date'),
  issuedBy: text('issued_by').references(() => users.id), // Staff member who issued
  returnedTo: text('returned_to').references(() => users.id), // Staff member who processed return
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Fines table
export const fines = pgTable('fines', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  transactionId: integer('transaction_id').references(() => transactions.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason'), // overdue, damage, loss
  daysOverdue: integer('days_overdue'),
  status: text('status').notNull().default('pending'), // pending, paid, waived
  createdAt: timestamp('created_at').defaultNow(),
})

// Payments table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  fineId: integer('fine_id').references(() => fines.id),
  userId: text('user_id').references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method'), // cash, card, online
  processedBy: text('processed_by').references(() => users.id), // Staff member
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Custom Shelves table
export const customShelves = pgTable('custom_shelves', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

// Shelf Books (many-to-many)
export const shelfBooks = pgTable('shelf_books', {
  id: serial('id').primaryKey(),
  shelfId: integer('shelf_id').references(() => customShelves.id),
  bookId: integer('book_id').references(() => books.id),
  addedAt: timestamp('added_at').defaultNow(),
})

// Favorites table
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  bookId: integer('book_id').references(() => books.id),
  createdAt: timestamp('created_at').defaultNow(),
})

// Reservations/Holds table
export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  bookId: integer('book_id').references(() => books.id),
  status: text('status').notNull().default('active'), // active, fulfilled, cancelled
  reservedAt: timestamp('reserved_at').defaultNow(),
  fulfilledAt: timestamp('fulfilled_at'),
  expiresAt: timestamp('expires_at'),
})

// Activity Log table
export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(), // 'borrowed', 'returned', 'added_book', etc.
  entityType: text('entity_type'), // 'book', 'member', etc.
  entityId: integer('entity_id'),
  metadata: jsonb('metadata'), // Additional context
  createdAt: timestamp('created_at').defaultNow(),
})

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  fines: many(fines),
  customShelves: many(customShelves),
  favorites: many(favorites),
}))

export const booksRelations = relations(books, ({ one, many }) => ({
  author: one(authors, {
    fields: [books.authorId],
    references: [authors.id],
  }),
  category: one(categories, {
    fields: [books.categoryId],
    references: [categories.id],
  }),
  copies: many(bookCopies),
  favorites: many(favorites),
}))

// ... more relations
```

---

### 3.2 Run Database Migrations

**Tasks:**
- [ ] Generate initial migration
- [ ] Review migration SQL
- [ ] Run migration on development database
- [ ] Seed database with sample data

**Commands:**
```bash
# Generate migration
pnpm drizzle-kit generate:pg

# Push to database
pnpm drizzle-kit push:pg

# Open Drizzle Studio (GUI)
pnpm drizzle-kit studio
```

---

### 3.3 Create Database Queries & Mutations

**Tasks:**
- [ ] Create reusable query functions
- [ ] Build type-safe mutations
- [ ] Implement transaction wrappers
- [ ] Create database utilities

**Files to Create:**
```typescript
// lib/db/queries/books.ts
export async function getAllBooks() {
  return await db.select().from(books).orderBy(books.createdAt)
}

export async function getBookById(id: number) {
  return await db.select().from(books).where(eq(books.id, id)).limit(1)
}

// lib/db/mutations/books.ts
export async function createBook(data: InsertBook) {
  return await db.insert(books).values(data).returning()
}

// lib/db/queries/members.ts
// lib/db/mutations/members.ts
// ... etc
```

---

## Phase 4: Admin Portal - Core Features (Week 3-5)

### 4.1 Dashboard Overview

**Tasks:**
- [ ] Build stat cards (Total Books, Borrowed, Overdue, Members)
- [ ] Create Quick Actions tabbed interface
- [ ] Implement Overdue Books table
- [ ] Build Recent Activity feed
- [ ] Add Book Categories Distribution chart

**Components to Build:**
```typescript
// app/(admin)/dashboard/page.tsx
// components/admin/dashboard/stat-cards.tsx
// components/admin/dashboard/quick-actions.tsx
// components/admin/dashboard/overdue-table.tsx
// components/admin/dashboard/activity-feed.tsx
// components/admin/dashboard/category-chart.tsx
```

**API Routes:**
```typescript
// app/api/admin/stats/route.ts - Dashboard statistics
// app/api/admin/activity/route.ts - Recent activity
// app/api/admin/overdue/route.ts - Overdue books
```

---

### 4.2 Book Management

**Tasks:**
- [ ] Create "Add New Book" form with validation
- [ ] Build book catalog data grid (with search, filter, sort)
- [ ] Implement bulk operations (edit, delete, export)
- [ ] Add individual copy tracking
- [ ] Build book detail view/edit modal

**Components to Build:**
```typescript
// app/(admin)/books/page.tsx
// components/admin/books/add-book-form.tsx
// components/admin/books/books-data-table.tsx
// components/admin/books/book-filters.tsx
// components/admin/books/bulk-actions.tsx
// components/admin/books/copy-status-manager.tsx
```

**Form Validation:**
```typescript
// lib/validations/book.ts
export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  isbn: z.string().regex(/^[\d-]{10,17}$/, 'Invalid ISBN format'),
  authorId: z.number().positive(),
  categoryId: z.number().positive(),
  publicationYear: z.number().min(1000).max(new Date().getFullYear()),
  totalCopies: z.number().positive(),
  // ... rest
})
```

**API Routes:**
```typescript
// app/api/admin/books/route.ts - GET (list), POST (create)
// app/api/admin/books/[id]/route.ts - GET (detail), PATCH (update), DELETE
// app/api/admin/books/bulk/route.ts - Bulk operations
```

---

### 4.3 Member Management

**Tasks:**
- [ ] Create "Register New Member" form
- [ ] Build member directory with search/filter
- [ ] Implement member detail view (history, fines, stats)
- [ ] Add member status management (active, expired, suspended)
- [ ] Build family account linking

**Components to Build:**
```typescript
// app/(admin)/members/page.tsx
// components/admin/members/register-member-form.tsx
// components/admin/members/members-data-table.tsx
// components/admin/members/member-detail-modal.tsx
// components/admin/members/member-status-badge.tsx
```

**API Routes:**
```typescript
// app/api/admin/members/route.ts
// app/api/admin/members/[id]/route.ts
// app/api/admin/members/[id]/history/route.ts
```

---

### 4.4 Transaction Management

**Tasks:**
- [ ] Build "Issue Book" form with live search
- [ ] Create "Return Book" form with fine calculation
- [ ] Implement transaction history table
- [ ] Add barcode scanner support (future)
- [ ] Build transaction preview component

**Components to Build:**
```typescript
// app/(admin)/dashboard/page.tsx (Quick Actions tabs)
// components/admin/transactions/issue-book-form.tsx
// components/admin/transactions/return-book-form.tsx
// components/admin/transactions/transaction-preview.tsx
// components/admin/transactions/member-search.tsx
// components/admin/transactions/book-search.tsx
```

**Business Logic:**
```typescript
// lib/services/transactions.ts
export async function issueBook({
  userId,
  bookCopyId,
  dueDate,
  issuedBy,
}: IssueBookParams) {
  // 1. Check if book copy is available
  // 2. Check member eligibility (no overdue books, active membership)
  // 3. Create transaction record
  // 4. Update book copy status
  // 5. Log activity
  // Use database transaction for atomicity
}

export async function returnBook({
  transactionId,
  returnedTo,
}: ReturnBookParams) {
  // 1. Find transaction
  // 2. Calculate overdue days
  // 3. Create fine if overdue
  // 4. Update transaction with return date
  // 5. Update book copy status to available
  // 6. Log activity
}
```

**API Routes:**
```typescript
// app/api/admin/transactions/issue/route.ts
// app/api/admin/transactions/return/route.ts
// app/api/admin/transactions/route.ts - History
```

---

### 4.5 Fines & Payments

**Tasks:**
- [ ] Create fines management table
- [ ] Build payment processing form
- [ ] Implement fine calculation logic
- [ ] Add payment ledger view
- [ ] Build waive fine functionality

**Components to Build:**
```typescript
// app/(admin)/fines/page.tsx
// components/admin/fines/fines-table.tsx
// components/admin/fines/payment-form.tsx
// components/admin/fines/payment-ledger.tsx
// components/admin/fines/waive-fine-dialog.tsx
```

**Business Logic:**
```typescript
// lib/services/fines.ts
export function calculateFine(daysOverdue: number): number {
  // Example: LKR 5 per day for first 7 days, LKR 10/day after
  if (daysOverdue <= 0) return 0
  if (daysOverdue <= 7) return daysOverdue * 5
  return (7 * 5) + ((daysOverdue - 7) * 10)
}

export async function processFinePayment({
  fineId,
  amount,
  paymentMethod,
  processedBy,
}: PaymentParams) {
  // 1. Create payment record
  // 2. Update fine status
  // 3. Log activity
}
```

**API Routes:**
```typescript
// app/api/admin/fines/route.ts
// app/api/admin/fines/[id]/pay/route.ts
// app/api/admin/fines/[id]/waive/route.ts
```

---

### 4.6 Reports & Analytics

**Tasks:**
- [ ] Build analytics dashboard for directors
- [ ] Create pre-built reports (popular books, circulation trends)
- [ ] Implement date range filtering
- [ ] Add data export (CSV, PDF)
- [ ] Build member demographics report

**Components to Build:**
```typescript
// app/(admin)/reports/page.tsx
// components/admin/reports/circulation-report.tsx
// components/admin/reports/popular-books-chart.tsx
// components/admin/reports/member-demographics.tsx
// components/admin/reports/collection-weeding.tsx
// components/admin/reports/export-button.tsx
```

**Charts to Implement:**
```typescript
// Using Recharts
- Bar Chart: Books borrowed per month
- Pie Chart: Book categories distribution
- Line Chart: Member growth over time
- Heatmap: Borrowing patterns by day/time
```

**API Routes:**
```typescript
// app/api/admin/reports/circulation/route.ts
// app/api/admin/reports/popular-books/route.ts
// app/api/admin/reports/demographics/route.ts
// app/api/admin/reports/export/route.ts
```

---

## Phase 5: Member App - Core Features (Week 5-7)

### 5.1 Discover Page

**Tasks:**
- [ ] Build hero search section with teal gradient
- [ ] Implement search with autocomplete
- [ ] Create book recommendation carousel
- [ ] Add "Recently Added" carousel
- [ ] Build book category grid
- [ ] Implement book card with hover effects

**Components to Build:**
```typescript
// app/(member)/discover/page.tsx
// components/member/discover/hero-search.tsx
// components/member/discover/book-carousel.tsx
// components/member/discover/book-card.tsx
// components/member/discover/category-grid.tsx
```

**Search Implementation:**
```typescript
// lib/services/search.ts
export async function searchBooks(query: string) {
  // PostgreSQL full-text search
  return await db
    .select()
    .from(books)
    .where(
      or(
        sql`to_tsvector('english', ${books.title}) @@ plainto_tsquery('english', ${query})`,
        sql`to_tsvector('english', ${books.description}) @@ plainto_tsquery('english', ${query})`,
        ilike(books.isbn, `%${query}%`)
      )
    )
    .limit(20)
}
```

**API Routes:**
```typescript
// app/api/books/search/route.ts
// app/api/books/recommendations/route.ts
// app/api/books/recent/route.ts
```

---

### 5.2 Category & Browse

**Tasks:**
- [ ] Build category hub page
- [ ] Implement category drill-down (Fiction → Sci-Fi → Space Opera)
- [ ] Add "Trending in Category" carousel
- [ ] Create filtering and sorting
- [ ] Build infinite scroll for book grid

**Components to Build:**
```typescript
// app/(member)/category/page.tsx
// app/(member)/category/[id]/page.tsx
// components/member/category/category-hero.tsx
// components/member/category/subcategory-nav.tsx
// components/member/category/book-grid-infinite.tsx
```

**Infinite Scroll with React Query:**
```typescript
// hooks/use-infinite-books.ts
export function useInfiniteBooks(categoryId: number) {
  return useInfiniteQuery({
    queryKey: ['books', 'category', categoryId],
    queryFn: ({ pageParam = 0 }) => fetchBooksByCategory(categoryId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
```

---

### 5.3 My Library Page

**Tasks:**
- [ ] Display currently borrowed books
- [ ] Show "Days Left" countdown
- [ ] Add renew book functionality
- [ ] Display borrowing history
- [ ] Show active fines/holds

**Components to Build:**
```typescript
// app/(member)/library/page.tsx
// components/member/library/borrowed-books-list.tsx
// components/member/library/book-item-card.tsx
// components/member/library/countdown-timer.tsx
// components/member/library/renew-button.tsx
```

**API Routes:**
```typescript
// app/api/member/library/route.ts - Current books
// app/api/member/library/renew/route.ts
// app/api/member/history/route.ts
```

---

### 5.4 Favorites & Custom Shelves

**Tasks:**
- [ ] Build favorites grid
- [ ] Create "Add to Favorites" button
- [ ] Implement custom shelf creation
- [ ] Add books to shelves
- [ ] Build shelf management (public/private)

**Components to Build:**
```typescript
// app/(member)/favorites/page.tsx
// app/(member)/shelves/page.tsx
// app/(member)/shelves/[id]/page.tsx
// components/member/favorites/favorites-grid.tsx
// components/member/shelves/create-shelf-dialog.tsx
// components/member/shelves/shelf-card.tsx
// components/member/shelves/add-to-shelf-dropdown.tsx
```

**API Routes:**
```typescript
// app/api/member/favorites/route.ts
// app/api/member/shelves/route.ts
// app/api/member/shelves/[id]/route.ts
// app/api/member/shelves/[id]/books/route.ts
```

---

### 5.5 Book Detail Page

**Tasks:**
- [ ] Create comprehensive book detail view
- [ ] Show availability status
- [ ] Add "Place Hold" button
- [ ] Display reviews/ratings (future)
- [ ] Show "Similar Books" recommendations

**Components to Build:**
```typescript
// app/(member)/books/[id]/page.tsx
// components/member/books/book-detail-hero.tsx
// components/member/books/availability-status.tsx
// components/member/books/place-hold-button.tsx
// components/member/books/similar-books.tsx
```

---

### 5.6 User Profile & Settings

**Tasks:**
- [ ] Build user profile page
- [ ] Add edit profile form
- [ ] Show membership status and expiry
- [ ] Display account statistics
- [ ] Implement notification preferences

**Components to Build:**
```typescript
// app/(member)/profile/page.tsx
// components/member/profile/profile-header.tsx
// components/member/profile/edit-profile-form.tsx
// components/member/profile/membership-card.tsx
// components/member/profile/account-stats.tsx
```

---

## Phase 6: Advanced Features (Week 7-8)

### 6.1 Real-Time Notifications

**Tasks:**
- [ ] Set up email service (Resend)
- [ ] Create email templates
- [ ] Implement overdue notifications
- [ ] Add hold availability emails
- [ ] Build notification preferences

**Email Templates:**
```typescript
// lib/email/templates/overdue-notice.tsx (React Email)
// lib/email/templates/hold-available.tsx
// lib/email/templates/welcome.tsx
// lib/email/templates/receipt.tsx
```

**Scheduled Jobs:**
```typescript
// app/api/cron/overdue-notifications/route.ts
export async function GET(req: NextRequest) {
  // Runs daily via Vercel Cron
  // Find overdue books
  // Send email notifications
  // Log activity
}
```

---

### 6.2 File Upload Integration

**Tasks:**
- [ ] Set up Uploadthing
- [ ] Create upload endpoints
- [ ] Implement image optimization
- [ ] Add drag-and-drop upload UI

**Setup:**
```typescript
// app/api/uploadthing/core.ts
import { createUploadthing } from 'uploadthing/next'

const f = createUploadthing()

export const uploadRouter = {
  bookCoverUploader: f({ image: { maxFileSize: '4MB' } })
    .middleware(async ({ req }) => {
      // Auth check
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Save to database
    }),
}
```

---

### 6.3 Advanced Search & Filters

**Tasks:**
- [ ] Implement faceted search
- [ ] Add advanced filters (year, language, availability)
- [ ] Build search history
- [ ] Create saved searches

**Components to Build:**
```typescript
// components/member/search/advanced-filters.tsx
// components/member/search/search-results.tsx
// components/member/search/faceted-filter.tsx
```

---

### 6.4 Analytics & Tracking

**Tasks:**
- [ ] Set up Sentry for error tracking
- [ ] Add Vercel Analytics
- [ ] Implement custom event tracking
- [ ] Create admin analytics dashboard

---

## Phase 7: Testing & Quality Assurance (Week 8-9)

### 7.1 Unit & Integration Tests

**Tasks:**
- [ ] Write tests for database queries
- [ ] Test API routes
- [ ] Test form validations
- [ ] Test business logic (fine calculation, etc.)

**Example Tests:**
```typescript
// __tests__/lib/services/fines.test.ts
describe('Fine Calculation', () => {
  it('should calculate correct fine for 5 days overdue', () => {
    expect(calculateFine(5)).toBe(25)
  })
})

// __tests__/api/books.test.ts
describe('Books API', () => {
  it('should create a new book', async () => {
    const response = await POST('/api/admin/books', bookData)
    expect(response.status).toBe(201)
  })
})
```

---

### 7.2 End-to-End Tests

**Tasks:**
- [ ] Test complete checkout flow
- [ ] Test complete return flow with fine
- [ ] Test member registration
- [ ] Test search and browse

**Example E2E Test:**
```typescript
// e2e/checkout-flow.spec.ts
test('admin can issue a book to member', async ({ page }) => {
  await page.goto('/admin/dashboard')
  await page.click('text=Issue Book(s)')
  await page.fill('input[name="member"]', 'John Doe')
  await page.fill('input[name="book"]', '978-1-4028-9461-1')
  await page.click('button:has-text("Confirm Issue")')
  await expect(page.locator('text=Book issued successfully')).toBeVisible()
})
```

---

### 7.3 Accessibility & Performance

**Tasks:**
- [ ] Run Lighthouse audits
- [ ] Test keyboard navigation
- [ ] Verify screen reader compatibility
- [ ] Optimize images and fonts
- [ ] Implement lazy loading
- [ ] Add loading states

---

## Phase 8: Deployment & Launch (Week 9-10)

### 8.1 Production Setup

**Tasks:**
- [ ] Create production database (Neon)
- [ ] Set up production environment variables
- [ ] Configure domain and SSL
- [ ] Set up monitoring (Sentry)

---

### 8.2 Deployment

**Tasks:**
- [ ] Deploy to Vercel
- [ ] Run production migrations
- [ ] Seed production data
- [ ] Test production environment
- [ ] Set up automatic deployments

**Deployment Checklist:**
```bash
# 1. Build locally
pnpm build

# 2. Run production build
pnpm start

# 3. Deploy to Vercel
vercel --prod

# 4. Run migrations on production
pnpm drizzle-kit push:pg --config=drizzle.config.prod.ts
```

---

### 8.3 Documentation

**Tasks:**
- [ ] Write API documentation
- [ ] Create user guides (admin + member)
- [ ] Document deployment process
- [ ] Create troubleshooting guide

**Documentation Files:**
```
docs/
├── API.md - API reference
├── ADMIN_GUIDE.md - Admin user manual
├── MEMBER_GUIDE.md - Member user manual
├── DEPLOYMENT.md - Deployment instructions
└── TROUBLESHOOTING.md
```

---

### 8.4 Launch

**Tasks:**
- [ ] Perform final testing
- [ ] Create backup strategy
- [ ] Launch to production
- [ ] Monitor errors and performance
- [ ] Gather user feedback

---

## Development Guidelines

### Git Workflow

**Branch Strategy:**
```
main (production)
├── develop (staging)
    ├── feature/admin-dashboard
    ├── feature/member-app
    └── fix/transaction-bug
```

**Commit Convention:**
```
feat: Add book checkout functionality
fix: Resolve fine calculation bug
docs: Update API documentation
test: Add tests for transaction service
refactor: Improve database query performance
```

---

### Code Quality

**Pre-commit Checklist:**
- [ ] TypeScript strict mode passes
- [ ] ESLint shows no errors
- [ ] Prettier formatting applied
- [ ] Unit tests pass
- [ ] No console.logs in production code

---

### API Design Principles

1. **RESTful conventions**
   - GET /api/books - List
   - GET /api/books/:id - Detail
   - POST /api/books - Create
   - PATCH /api/books/:id - Update
   - DELETE /api/books/:id - Delete

2. **Consistent response format**
```typescript
// Success
{ data: {...}, message: 'Book created successfully' }

// Error
{ error: 'Validation failed', details: [...] }
```

3. **Input validation** - Always validate with Zod schemas

---

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|-----------|
| Database connection issues | Use connection pooling (Neon), implement retry logic |
| Performance degradation | Implement caching (React Query), optimize queries, use indexes |
| Authentication vulnerabilities | Use NextAuth.js best practices, secure session storage |
| Data loss | Regular automated backups, transaction rollbacks |

### Timeline Risks

| Risk | Mitigation |
|------|-----------|
| Scope creep | Strict MVP definition, feature prioritization |
| Underestimated complexity | Buffer time (2 weeks), incremental delivery |
| Dependency delays | Early integration testing, fallback options |

---

## Success Criteria

### MVP Launch Criteria

- [ ] Admin can add/manage books
- [ ] Admin can register/manage members
- [ ] Admin can issue/return books
- [ ] Fines are calculated automatically
- [ ] Members can browse and search books
- [ ] Members can view their borrowed books
- [ ] Authentication works (Google OAuth)
- [ ] Responsive design works on mobile/desktop
- [ ] No critical bugs
- [ ] Performance targets met (Lighthouse > 90)

---

## Post-Launch Roadmap

### Phase 9: Enhancements (Week 11+)

**Features to Add:**
- [ ] Barcode scanner integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics with ML recommendations
- [ ] Book reviews and ratings
- [ ] Social features (public shelves, reading challenges)
- [ ] Integration with library catalog APIs
- [ ] Multi-library support
- [ ] Offline mode for admin portal

---

**Document Owner:** Development Team
**Last Updated:** November 12, 2025
**Next Review:** After Phase 3 completion
