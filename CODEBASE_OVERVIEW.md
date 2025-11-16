# Librarium - Comprehensive Codebase Overview
**Status:** Project in Active Development
**Generated:** November 16, 2025

---

## 1. PROJECT OVERVIEW

Librarium (Library Nexus) is a comprehensive, dual-interface library management system consisting of:
- **Admin Portal:** For library staff and administrators to manage the catalog, members, transactions, and analytics
- **Member-Facing App:** For library patrons to discover books, manage borrowings, track fines, and engage with the collection

**Key Philosophy:** "Illumination & Discovery" - The admin interface emphasizes clarity and precision, while the member app emphasizes warmth, curiosity, and engagement.

---

## 2. TECHNOLOGY STACK

### Core Framework
- **Next.js 16.0.2** - Full-stack React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type-safe development

### Database
- **PostgreSQL** (via Neon or Vercel Postgres) - Relational database
- **Drizzle ORM 0.44.7** - Type-safe database queries
- **Drizzle Kit 0.31.6** - Schema management and migrations

### Authentication & Authorization
- **NextAuth.js 5.0.0-beta.30** - Authentication framework
- **Google OAuth 2.0** - Social sign-in
- **Credentials Provider** - Email/password with bcryptjs
- **Role-Based Access Control (RBAC)** - 4 roles: member, staff, admin, director

### UI & Styling
- **shadcn/ui** - Headless component library
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Lucide React 0.553.0** - Icons
- **class-variance-authority** - Component variants

### Forms & Validation
- **React Hook Form 7.66.0** - Form state management
- **Zod 4.1.12** - TypeScript-first schema validation

### Data Fetching & State Management
- **React Query/TanStack Query 5.90.7** - Client-side caching and fetching
- **React Context** - Global state management

### Additional Tools
- **date-fns 4.1.0** - Date manipulation
- **qrcode 1.5.4** - QR code generation
- **html5-qrcode 2.3.8** - QR code scanning
- **@neondatabase/serverless 1.0.2** - Serverless Postgres client

---

## 3. PROJECT STRUCTURE

```
librarium/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Public auth routes (login, register, error)
│   ├── admin/                   # Admin portal routes (protected)
│   │   ├── dashboard/           # Dashboard with stats and quick actions
│   │   ├── books/              # Book management
│   │   ├── members/            # Member management
│   │   ├── analytics/          # Analytics & reports
│   │   ├── reports/            # Detailed reports
│   │   ├── qr-checkout/        # QR-based book checkout
│   │   ├── book-qr-codes/      # QR code generation for books
│   │   ├── settings/           # Admin settings (categories, etc.)
│   │   └── layout.tsx          # Admin layout with sidebar & header
│   │
│   ├── member/                  # Member app routes (protected)
│   │   ├── dashboard/          # Member dashboard
│   │   ├── discover/           # Book discovery page
│   │   ├── books/[id]/         # Book detail page
│   │   ├── fines/              # Fine management
│   │   ├── history/            # Borrowing history
│   │   ├── membership/         # Membership management
│   │   ├── profile/            # User profile & settings
│   │   ├── search/             # Advanced search page
│   │   └── layout.tsx          # Member layout
│   │
│   ├── api/                     # API routes (36+ endpoints)
│   │   ├── admin/              # Admin endpoints
│   │   │   ├── books/          # Book CRUD operations
│   │   │   ├── members/        # Member CRUD operations
│   │   │   ├── transactions/   # Issue/return book logic
│   │   │   ├── stats/          # Dashboard statistics
│   │   │   ├── analytics/      # Analytics data
│   │   │   ├── activity/       # Activity log
│   │   │   ├── categories/     # Category management
│   │   │   ├── authors/        # Author management
│   │   │   └── overdue/        # Overdue books
│   │   │
│   │   ├── member/             # Member endpoints
│   │   │   ├── borrowed/       # Get borrowed books
│   │   │   ├── fines/          # Get fines summary
│   │   │   ├── history/        # Get borrowing history
│   │   │   └── subscribe/      # Membership subscription
│   │   │
│   │   ├── books/              # Public book endpoints
│   │   ├── search/             # Full-text search
│   │   ├── notifications/      # Notification management
│   │   ├── qr/                 # QR code generation/scanning
│   │   ├── auth/               # Authentication endpoints
│   │   └── health/             # Health check
│   │
│   ├── discover/               # Public discover page (guest)
│   ├── books/[id]/            # Public book detail page
│   └── layout.tsx             # Root layout
│
├── components/                  # React components
│   ├── admin/                  # Admin-specific components
│   │   └── dashboard/          # Dashboard components (stats, tables, feeds)
│   ├── ui/                     # shadcn/ui components (button, input, card, etc.)
│   ├── qr/                     # QR code components (scanner, display, library card)
│   ├── notifications/          # Notification components
│   ├── shared/                 # Shared components (user button, spinner, etc.)
│   ├── layouts/                # Layout components (sidebars, headers)
│   └── providers/              # Context providers (session provider)
│
├── lib/                        # Utility functions & core logic
│   ├── db/                     # Database layer
│   │   ├── schema.ts          # Drizzle ORM schema with 12+ tables
│   │   ├── index.ts           # Database client
│   │   ├── seed.ts            # Database seed data
│   │   └── migrate.ts         # Migration runner
│   │
│   ├── auth/                   # Authentication logic
│   │   ├── config.ts          # NextAuth configuration
│   │   ├── roles.ts           # RBAC definitions & helpers
│   │   └── utils.ts           # Auth utilities
│   │
│   ├── validations/            # Zod validation schemas
│   │   ├── book.ts            # Book form schemas
│   │   ├── member.ts          # Member form schemas
│   │   ├── transaction.ts     # Transaction schemas
│   │   └── category.ts        # Category schemas
│   │
│   ├── services/               # Business logic services
│   │   └── transactions.ts    # Issue/return book logic, fine calculation
│   │
│   ├── utils/                  # Utility functions
│   │   └── env.ts             # Environment variables helper
│   │
│   ├── constants/              # Constants
│   │   └── design-system.ts   # Design system constants
│   │
│   └── utils.ts                # General utilities (cn, formatting, etc.)
│
├── hooks/                       # Custom React hooks
├── drizzle/                     # Database migrations (auto-generated)
├── scripts/                     # Utility scripts
├── public/                      # Static assets
├── styles/                      # Global styles
├── types/                       # TypeScript type definitions
│
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── drizzle.config.ts           # Drizzle ORM configuration
├── next.config.ts              # Next.js configuration
└── proxy.ts                    # Proxy server configuration

```

---

## 4. DATABASE SCHEMA & DATA MODELS

### Tables (12+)

**Authentication Tables (NextAuth):**
1. `users` - User accounts with roles and membership info
2. `accounts` - OAuth provider accounts
3. `sessions` - Session tokens
4. `verification_tokens` - Email verification tokens

**Library Management Tables:**
5. `books` - Book catalog
6. `authors` - Book authors
7. `categories` - Book categories (hierarchical)
8. `book_copies` - Individual physical book copies (tracks status: available, borrowed, in_repair, lost)
9. `transactions` - Checkouts and returns with due dates
10. `fines` - Overdue fines
11. `payments` - Fine payments
12. `reservations` - Book holds/reservations
13. `favorites` - User favorite books
14. `custom_shelves` - User-created reading lists
15. `shelf_books` - Many-to-many junction for shelves
16. `activity_log` - Audit trail of all operations
17. `notifications` - User notifications (due soon, overdue, fine added, reservation ready)

### Key Features:
- **Relational integrity** with foreign keys
- **Hierarchical categories** (parent-child relationships)
- **Fine calculation** based on overdue days ($0.50/day default)
- **Copy-level tracking** for individual book status
- **Full audit trail** via activity log
- **Notification system** with read/unread tracking

---

## 5. IMPLEMENTED FEATURES

### ADMIN PORTAL

#### Dashboard (ADM-1)
- **Statistics Cards:** Total books, borrowed, overdue, total members, pending fines
- **Category Distribution:** Interactive chart of books by category
- **Quick Actions Tabs:** Integrated action hub
- **Overdue Books Table:** Sortable list of overdue items
- **Recent Activity Feed:** Live transaction log
- Status: ✅ **FULLY IMPLEMENTED**

#### Book Management (ADM-4)
- Full CRUD operations for books
- Bulk edit/delete capabilities
- Book copy status tracking (available, borrowed, in_repair, lost)
- ISBN validation and duplicate prevention
- Real-time validation
- Coverage: **PARTIALLY IMPLEMENTED** (Core CRUD done, bulk operations need completion)

#### Member Management (ADM-5)
- Member CRUD operations
- Member status tracking (active, expired, frozen)
- Borrowing history view
- Fine and payment ledger
- Membership type and expiry management
- Status: ✅ **CORE FEATURES IMPLEMENTED**

#### Transactions (ADM-6, ADM-7)
- **Issue Book:** Two-column form with member & book search, live validation, preview
- **Return Book:** Auto-calculates overdue fines ($0.50/day rate)
- Database transactions for atomicity
- Copy status updates
- Activity logging
- Status: ✅ **FULLY IMPLEMENTED**

#### Fines & Payments (ADM-8)
- Fine tracking and management
- Payment processing (cash, card, online)
- Payment ledger
- Fine waiver capability
- Status: **PARTIALLY IMPLEMENTED** (Payment endpoints exist, UI completion needed)

#### Reports & Analytics (Director view)
- Category distribution
- Circulation trends
- Member demographics
- Collection weeding reports
- Status: **IN PROGRESS**

#### QR Code Features
- Book QR code generation
- User library card QR generation
- QR code scanning for quick checkout
- Unique QR codes per book copy
- Status: ✅ **IMPLEMENTED**

### MEMBER APP

#### Discover Page (PAT-1)
- Hero search section with teal gradient
- Full-text search, ISBN, author search
- Category filtering with "All Categories" button (gold accent)
- Available now carousel
- Book grid display (responsive)
- Category browsing section
- Call-to-action cards
- Status: ✅ **FULLY IMPLEMENTED**

#### Book Detail Page
- Book information display
- Availability status
- Copy count display
- Author and category information
- Status: ✅ **IMPLEMENTED**

#### My Library / Currently Borrowed (PAT-4)
- List of actively borrowed books
- Due date countdown with visual indicators
- Overdue status highlighting
- Renew button for eligible items
- Days remaining calculation
- Status: ✅ **FULLY IMPLEMENTED**

#### Fines Management
- Pending fines display
- Fine summary (total pending, total paid)
- Payment history
- Status: ✅ **IMPLEMENTED**

#### Borrowing History (PAT-4)
- Full searchable/sortable transaction history
- Filter by date range
- Historical data for research
- Status: ✅ **IMPLEMENTED**

#### Membership Management
- Current membership type display
- Membership expiry date
- Subscription plans (monthly, quarterly, annual)
- Plan upgrade capability
- Status: ✅ **IMPLEMENTED**

#### User Profile
- Profile settings
- Account information
- Password management
- Status: **IN PROGRESS**

#### Search Page
- Advanced search with filters
- Category, author filtering
- Year range filtering
- Availability filtering
- Sort by title/year/author
- Pagination support
- Status: ✅ **IMPLEMENTED**

### AUTHENTICATION & AUTHORIZATION

#### Authentication Methods
- **Google OAuth 2.0** - SSO via Google accounts
- **Email/Password** - Traditional credentials with bcrypt hashing
- Session management with JWT tokens
- Database session persistence
- Status: ✅ **FULLY IMPLEMENTED**

#### Role-Based Access Control (RBAC)
- 4 roles: **member**, **staff**, **admin**, **director**
- Fine-grained permissions system
- Middleware-based route protection
- Component-level permission checks

**Role Permissions:**
- **Member:** Read books, manage own data, create favorites/shelves
- **Staff:** All member permissions + manage transactions, members, books
- **Admin:** All staff permissions + delete, manage categories/authors, process payments, waive fines
- **Director:** All admin permissions + analytics, reports, exports, settings

Status: ✅ **FULLY IMPLEMENTED**

### NOTIFICATION SYSTEM

- **Notification Table** with types: due_soon, overdue, fine_added, reservation_ready, general
- Read/unread tracking
- Metadata storage for rich notifications
- Notification fetch with filtering
- Mark all as read functionality
- Status: ✅ **DATABASE & API IMPLEMENTED**, UI pending

### RESERVATION SYSTEM

- Database schema for reservations
- Status tracking: active, fulfilled, cancelled
- Reservation expiry dates
- Status: **SCHEMA CREATED**, API endpoints pending

---

## 6. API ENDPOINTS (36+ Implemented)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth handler

### Books
- `GET /api/books` - List books with pagination
- `GET /api/books/[id]` - Get book details
- `POST /api/admin/books` - Create book
- `PUT /api/admin/books/[id]` - Update book
- `DELETE /api/admin/books/[id]` - Delete book
- `POST /api/admin/books/[id]/copies` - Add book copy

### Members
- `GET /api/admin/members` - List members
- `GET /api/admin/members/[id]` - Get member details
- `POST /api/admin/members` - Create member
- `PUT /api/admin/members/[id]` - Update member
- `DELETE /api/admin/members/[id]` - Delete member

### Transactions
- `POST /api/admin/transactions/issue` - Issue/checkout book
- `POST /api/admin/transactions/return` - Return book (calculates fines)
- `GET /api/member/borrowed` - Get user's borrowed books
- `GET /api/member/history` - Get borrowing history

### Fines & Payments
- `GET /api/member/fines` - Get user's fines summary
- `POST /api/admin/fines` - Create fine
- `POST /api/admin/fines/[id]/waive` - Waive fine
- `POST /api/admin/payments` - Process payment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/[id]` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

### Admin Dashboard
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/activity` - Activity log feed
- `GET /api/admin/overdue` - Overdue books list
- `GET /api/admin/analytics` - Analytics data

### Search & Discovery
- `GET /api/search` - Advanced book search with filters
  - Supports: text query, category, author, year range, availability
  - Sorting: title, year, author (asc/desc)

### Categories & Authors
- `GET /api/admin/categories` - List categories
- `POST /api/admin/categories` - Create category
- `GET /api/admin/authors` - List authors
- `POST /api/admin/authors` - Create author

### QR Codes
- `POST /api/qr/generate-book/[id]` - Generate book QR code
- `POST /api/qr/generate-user/[id]` - Generate user QR code
- `POST /api/qr/scan` - Process QR scan

### Member
- `POST /api/member/subscribe` - Subscribe to membership plan
- `GET /api/health` - Health check endpoint

---

## 7. VALIDATION SCHEMAS (Zod)

### Books
- `bookSchema` - Full book creation schema with ISBN regex validation
- `updateBookSchema` - Partial book update
- `addBookCopySchema` - Add physical copy with condition tracking
- `updateBookCopySchema` - Update copy status/condition

### Members
- `memberSchema` - Member creation with role and membership fields
- `updateMemberSchema` - Partial member update (password excluded)
- `updateMemberStatusSchema` - Update membership type/expiry

### Transactions
- `issueBookSchema` - Checkout validation
- `returnBookSchema` - Return validation
- `createFineSchema` - Fine creation
- `paymentSchema` - Payment processing

### Categories
- Category validation schemas

---

## 8. KEY BUSINESS LOGIC

### Fine Calculation
- **Rate:** $0.50 per day overdue
- **Trigger:** Automatically calculated on book return
- **Status Tracking:** pending, paid, waived
- **Location:** `/lib/services/transactions.ts`

### Book Issuance
- Check copy availability
- Verify member eligibility (active membership, no overdue books)
- Create transaction record
- Update copy status to "borrowed"
- Update available_copies count
- Log activity

### Book Return
- Calculate overdue days
- Apply fine if overdue
- Update copy status to "available"
- Update available_copies count
- Log activity
- All in atomic database transaction

### Member Eligibility
- Active membership required
- Cannot borrow if overdue books exist
- Membership expiry date validation

---

## 9. FEATURES IN PROGRESS / NOT YET IMPLEMENTED

### Features Partially Implemented:
1. **Custom Shelves** - Schema exists, UI creation needed
2. **Favorites** - Schema exists, endpoints needed
3. **Reservations** - Schema exists, endpoints/UI needed
4. **Advanced Analytics** - Basic framework exists, detailed reports needed
5. **Member Profile Management** - Basic page exists, edit functionality needed
6. **Bulk Book Operations** - CRUD works, bulk edit/delete UI needed
7. **Fine Payment Processing** - Basic structure, payment gateway integration pending
8. **Email Notifications** - No email service integrated yet (Resend recommended)

### Features Not Yet Implemented:
1. **Book Cover Image Upload** - Schema field exists (coverImageUrl), upload service not integrated
2. **Book Import from External APIs** - Script exists (`db/import-books-from-api.ts`) but needs completion
3. **Advanced Reporting** - Export to CSV/PDF functionality
4. **Member Demographics Reports** - Filtering/aggregation logic needed
5. **Overdue Reminders** - Notification triggering on scheduled tasks
6. **Subscription Payment Processing** - No payment gateway integrated (Stripe/PayPal)
7. **Background Jobs** - No scheduler (Vercel Cron Jobs recommended)
8. **Email Templates** - Resend integration pending
9. **Image Optimization** - Uploadthing/Cloudinary integration pending
10. **Collection Weeding Reports** - Analytics query needed
11. **Circulation Heatmaps** - Time-based analytics pending
12. **Custom Shelf Sharing** - Public shelf feature schema exists, UI pending

---

## 10. DESIGN SYSTEM: "ILLUMINATION"

### Color Palette
- **Primary Teal:** #00798C - Brand core, trust, admin active states
- **Discovery Gold:** #E8A24C - Member accent, engagement, fun
- **Soft Neutral:** #F7F7F7 - Backgrounds
- **Card White:** #FFFFFF - Content containers
- **Admin Dark:** #1F2937 (slate-800) - Admin sidebar
- **Deep Text:** #212529 - Body text

### Typography
- **Primary Font:** Inter (body text, admin labels)
- **Display Font:** Poppins (member app headers h1-h3)

### Visual Principles
- **Admin Interface:** Minimal, data-forward, high-contrast, professional
- **Member App:** Warm, personalized, engaging carousels, "lift" effects on hover
- **Book Cards:** Multi-layered shadows, -translate-y-1 on hover
- **Responsive:** Mobile (320-640px), Tablet (641-1024px), Desktop (1025px+)

---

## 11. RECENT COMMITS

1. **feat: add debug logging for member route requests** (8ff61d3)
2. **Remove redundant middleware.ts in favor of proxy.ts** (b3d0413)
3. **Merge pull request #2 - Docker + Postgres pragma setup** (f914eca)
4. **Remove Docker files and redundant deployment guides** (66860a5)
5. **feat: Configure for Vercel + Neon deployment** (12e7af9)

---

## 12. DEVELOPMENT COMMANDS

```bash
# Development
pnpm dev              # Start dev server

# Database
pnpm db:generate      # Generate migration files
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio GUI
pnpm db:setup         # Migrate + Seed
pnpm db:full-setup    # Migrate + Seed + Import 200 books
pnpm db:import        # Import books from external API
pnpm db:import:200    # Import 200 books

# Building
pnpm build            # Production build
pnpm start            # Start production server

# Linting
pnpm lint             # Run ESLint
```

---

## 13. DEPLOYMENT & INFRASTRUCTURE

- **Hosting:** Vercel (recommended)
- **Database:** Neon or Vercel Postgres
- **Environment:** 
  - Development: `.env.local`
  - Vercel: Environment variables in Vercel dashboard
  - Example: `.env.vercel.example` for reference
- **CI/CD:** Git-based automatic deployments
- **Configuration:** `vercel.json` for Vercel-specific settings

---

## 14. CURRENT BRANCH & STATUS

- **Current Branch:** `claude/plan-feature-prioritization-01FKyRwKwMwcxzLV3dUvj2LS`
- **Repository Status:** Clean (no uncommitted changes)
- **Last Update:** November 16, 2025

---

## 15. KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `/lib/db/schema.ts` | Complete database schema (12+ tables) |
| `/lib/auth/config.ts` | NextAuth configuration with OAuth & credentials |
| `/lib/auth/roles.ts` | RBAC definitions and permission helpers |
| `/lib/services/transactions.ts` | Core business logic for checkouts/returns |
| `/lib/validations/*.ts` | Zod validation schemas |
| `/app/api/admin/transactions/*.ts` | Issue/return book endpoints |
| `/app/discover/page.tsx` | Public discover page |
| `/app/member/dashboard/page.tsx` | Member dashboard |
| `/app/admin/dashboard/page.tsx` | Admin dashboard |
| `/components/admin/dashboard/*.tsx` | Admin dashboard components |

---

## 16. RECOMMENDATIONS FOR FEATURE PRIORITIZATION

### High Priority (Quick Wins)
1. Complete member profile edit functionality
2. Implement custom shelves UI and endpoints
3. Implement favorites endpoints
4. Complete fine payment UI and gateway integration
5. Add book cover image upload

### Medium Priority (Core Features)
1. Implement reservations/holds system
2. Add email notification service (Resend)
3. Background jobs for overdue reminders
4. Advanced analytics and reports
5. Bulk book operations UI

### Lower Priority (Polish & Enhancement)
1. Collection weeding reports
2. Circulation heatmaps
3. Member demographics reports
4. Public shelf sharing
5. Book import from external APIs completion

