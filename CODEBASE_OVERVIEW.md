# Librarium - Codebase Overview

**Last Updated:** November 16, 2025
**Version:** 2.0 - Post Literary Modernism Design System Implementation
**Status:** Active Development with Strategic Prioritization

---

## Executive Summary

Librarium is a sophisticated, dual-interface library management system combining enterprise-grade admin tools with a beautiful member experience. Recent updates include a distinctive **Literary Modernism** design system and a **Jobs-to-be-Done prioritization framework** for strategic feature development.

### System Architecture
- **Dual Interfaces:** Admin Portal (precision, control) + Member App (discovery, engagement)
- **Modern Stack:** Next.js 16 + React 19 + TypeScript + PostgreSQL (Neon)
- **Enterprise-Ready:** Role-based access control, 40+ API endpoints, comprehensive audit trail
- **Design Philosophy:** "Literary Modernism" - refined, editorial, memorable

---

## 🎨 Design System: Literary Modernism

### Core Philosophy
Librarium bridges the timeless elegance of classical libraries with modern digital precision. The interface feels like browsing **a high-end literary magazine**, not a generic database.

### Visual Identity

**Typography:**
- **Display:** Crimson Pro (serif) - literary, classical, refined
- **UI:** Archivo (sans-serif) - modern, geometric, precise
- **Metadata:** JetBrains Mono - technical clarity

**Color Palette:**
- **Primary:** Deep Teal `#00798C` - trust, depth, sophistication
- **Accent:** Warm Amber `#E8A24C` - invitation, discovery
- **Foundation:** Warm Parchment backgrounds, Deep Ink text

**Signature UI Moments:**
1. **Hero Search** - Gradient drama with decorative blur elements
2. **Book Card Hover** - Shimmer effect + lift animation (-12px)
3. **Staggered Page Loads** - Cascading fade-in-up (0.1s delays)
4. **Stats Cards** - Gradient overlays on hover
5. **Ornamental Borders** - Gradient accent lines for section headers

**Motion Design:**
- **Purposeful animations** - every animation serves UX
- **Staggered reveals** - create rhythm and delight
- **Elastic easing** - `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Duration hierarchy:** Micro (150-250ms), Standard (300-500ms), Macro (600-800ms)

**Design Documentation:**
- Full spec: `DESIGN_AESTHETIC.md`
- Developer quick reference: `DESIGN_QUICK_REFERENCE.md`

---

## 📊 Feature Prioritization Framework

### Jobs-to-be-Done (JTBD) Impact Matrix

Librarium uses a data-driven prioritization model:

**Formula:** `Priority Score = Impact (1-10) / Effort (1-10)`

**Priority Tiers:**
- **Tier 1 (>2.5):** Quick wins - ship in 2-4 weeks
- **Tier 2 (1.5-2.5):** High value - ship in 4-8 weeks
- **Tier 3 (1.0-1.5):** Strategic - ship in 8-12 weeks
- **Tier 4 (<1.0):** Backlog

**Framework Documentation:** `JTBD_IMPACT_MATRIX.md`

---

## 🛠️ Technology Stack

### Core Framework
- **Next.js 16.0.2** - Full-stack React framework with App Router
- **React 19.2.0** - UI library with React Compiler
- **TypeScript 5** - Type-safe development

### Database & ORM
- **PostgreSQL** (Neon serverless) - Production database
- **Drizzle ORM 0.44.7** - Type-safe queries with excellent DX
- **Drizzle Kit 0.31.6** - Schema management and migrations

### Authentication
- **NextAuth.js 5.0.0-beta.30** - Authentication framework
- **Google OAuth 2.0** - Social sign-in
- **Bcryptjs** - Password hashing

### UI & Design
- **shadcn/ui** - Headless component system
- **Tailwind CSS 3.4.1** - Utility-first CSS
- **Lucide React 0.553.0** - Icon system
- **Custom CSS Variables** - Dark mode ready

### Forms & Validation
- **React Hook Form 7.66.0** - Form state management
- **Zod 4.1.12** - Runtime validation

### Additional Libraries
- **React Query 5.90.7** - Client caching and data fetching
- **date-fns 4.1.0** - Date manipulation
- **qrcode 1.5.4** - QR code generation
- **html5-qrcode 2.3.8** - QR code scanning

---

## 📁 Project Structure

```
librarium/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth routes (login, register)
│   ├── admin/                   # Admin Portal (protected)
│   │   ├── dashboard/           # Stats, activity, quick actions
│   │   ├── books/              # Book CRUD
│   │   ├── members/            # Member management
│   │   ├── analytics/          # Analytics & reports
│   │   ├── qr-checkout/        # QR-based checkout
│   │   └── settings/           # Categories, system settings
│   │
│   ├── member/                  # Member App (protected)
│   │   ├── dashboard/          # Personal dashboard (Literary design)
│   │   ├── discover/           # Book discovery (Literary design)
│   │   ├── books/[id]/         # Book detail pages
│   │   ├── fines/              # Fine management
│   │   ├── history/            # Borrowing history + export
│   │   ├── membership/         # Membership plans
│   │   └── profile/            # User settings
│   │
│   ├── api/                     # 40+ API endpoints
│   │   ├── admin/              # Admin endpoints
│   │   ├── member/             # Member endpoints
│   │   │   ├── history/export/ # NEW: CSV/JSON export ✅
│   │   │   └── renew/          # NEW: Book renewals ✅
│   │   ├── books/              # Public book endpoints
│   │   ├── search/             # Full-text search
│   │   └── qr/                 # QR code generation/scanning
│   │
│   ├── discover/               # Public discover page
│   ├── books/[id]/            # Public book details
│   └── page.tsx               # Landing page (Literary design)
│
├── components/
│   ├── admin/                  # Admin components
│   ├── ui/                     # shadcn/ui components
│   ├── qr/                     # QR code components
│   ├── shared/                 # Shared components
│   │   └── theme-toggle.tsx   # NEW: Dark mode toggle ⚠️
│   └── layouts/                # Layout components
│
├── lib/
│   ├── db/                     # Database layer
│   │   ├── schema.ts          # 17 tables, full schema
│   │   ├── seed.ts            # Seed data
│   │   └── migrate.ts         # Migration runner
│   │
│   ├── auth/                   # Authentication
│   │   ├── config.ts          # NextAuth config
│   │   └── roles.ts           # RBAC system
│   │
│   ├── validations/            # Zod schemas
│   ├── services/               # Business logic
│   │   └── transactions.ts    # Issue/return logic
│   └── constants/              # Design system constants
│
├── scripts/
│   └── import-books-from-api.ts # Book import utility
│
├── DESIGN_AESTHETIC.md          # NEW: Full design system spec ✅
├── DESIGN_QUICK_REFERENCE.md    # NEW: Developer quick reference ✅
├── JTBD_IMPACT_MATRIX.md        # NEW: Prioritization framework ✅
├── CODEBASE_OVERVIEW.md         # This file
├── FEATURE_IMPLEMENTATION_PLAN.md # Feature roadmap
│
├── tailwind.config.ts           # UPDATED: Literary Modernism theme ✅
├── globals.css                  # UPDATED: Custom animations, utilities ✅
└── vercel.json                 # Deployment config
```

---

## 🗄️ Database Schema (17 Tables)

### Authentication (NextAuth.js)
1. **users** - User accounts with roles, membership info
2. **accounts** - OAuth provider accounts
3. **sessions** - Session tokens
4. **verification_tokens** - Email verification

### Library Core
5. **books** - Book catalog (title, ISBN, author, category)
6. **authors** - Author information
7. **categories** - Hierarchical categories (parent-child)
8. **book_copies** - Physical copies with status tracking
9. **transactions** - Checkouts/returns with due dates, renewal count

### Financial
10. **fines** - Overdue fines ($0.50/day)
11. **payments** - Fine payment records

### Engagement Features
12. **reservations** - Book holds/waitlist (FIFO queue)
13. **favorites** - User favorite books
14. **custom_shelves** - User-created reading lists
15. **shelf_books** - Many-to-many junction table

### System
16. **activity_log** - Complete audit trail
17. **notifications** - User notifications (due soon, overdue, etc.)

### Key Features
- **Relational integrity** with foreign keys and cascading
- **Copy-level tracking** for individual book status
- **Automatic fine calculation** on overdue returns
- **Full audit trail** via activity log
- **Notification system** with read/unread states

---

## ✅ Implemented Features (TIER 1 Achievements)

### Recently Shipped ✅

1. **Enhanced UI/UX Design** (Priority 3.0) ✅
   - Literary Modernism design system implemented
   - Updated: Homepage, Discover, Dashboard, Book cards
   - Files: `app/page.tsx`, `app/discover/page.tsx`, `app/member/dashboard/page.tsx`, `tailwind.config.ts`, `globals.css`

2. **QR Code Member Card** (Priority 5.0) ✅
   - Instant library card access on phone
   - QR code scanning for quick checkout
   - Status: Fully operational

3. **Reading History Export** (Priority 3.5) ✅
   - CSV and JSON export formats
   - Complete borrowing history with citations
   - API: `GET /api/member/history/export?format=csv|json`
   - Location: `app/api/member/history/export/route.ts`

4. **Book Renewals** (Priority 2.7) ✅
   - 14-day renewal period
   - Renewal limits by membership type (2-5 renewals)
   - Prevents renewing overdue books
   - API: `POST /api/member/renew`
   - Location: `app/api/member/renew/route.ts`

### Admin Portal - Core Features ✅

- ✅ **Dashboard** - Stats cards, activity feed, overdue tracking
- ✅ **Book Management** - Full CRUD, copy tracking, QR generation
- ✅ **Member Management** - CRUD, status tracking, borrowing history view
- ✅ **Transaction Processing** - Issue/return with automatic fine calculation
- ✅ **QR Checkout** - Scan-based quick checkout
- ✅ **Search & Analytics** - Advanced search, category distribution
- ✅ **Activity Logging** - Complete audit trail

### Member App - Core Features ✅

- ✅ **Book Discovery** - Hero search, category filtering, carousels (Literary design)
- ✅ **Book Detail Pages** - Availability, metadata, elegant layout
- ✅ **Currently Borrowed** - Active loans, due dates, renewal buttons
- ✅ **Reading History** - Searchable transaction history + CSV/JSON export
- ✅ **Fine Management** - Pending fines, payment history
- ✅ **Membership Plans** - Subscription management
- ✅ **QR Member Card** - Digital library card
- ✅ **Advanced Search** - Multi-filter search with sorting

### Authentication & Authorization ✅

- ✅ **Google OAuth** + Email/Password authentication
- ✅ **RBAC System** - 4 roles (member, staff, admin, director)
- ✅ **Fine-grained permissions** - Component and route-level protection
- ✅ **Session management** - Database-persisted sessions

---

## ⚠️ Partially Implemented Features

### TIER 1 - In Progress

1. **Dark Mode** (Priority 2.5)
   - Status: CSS variables configured, toggle component created
   - Missing: Integration with theme provider, user preference storage
   - File: `components/shared/theme-toggle.tsx`

2. **Advanced Search Filters** (Priority 2.7)
   - Status: Basic search works
   - Missing: Genre + year + availability multi-filter UI

3. **Borrowing Limits Warning** (Priority 3.0)
   - Status: Not started
   - Effort: 1 day
   - Implementation: UI banner when member near borrowing limit

### TIER 2 & 3 - In Progress

4. **Custom Shelves** (TIER 3 - Priority 1.2)
   - Status: Database schema complete
   - Missing: CRUD endpoints, UI for creating/managing shelves

5. **Favorites** (estimated 2 days)
   - Status: Database schema complete
   - Missing: API endpoints, UI components

6. **Reservations/Holds** (TIER 2 - Priority 1.8)
   - Status: Database schema complete
   - Missing: Queue management logic, endpoints, UI

7. **Payment Processing** (TIER 2 - Priority 1.5)
   - Status: Database schema + basic endpoints
   - Missing: Stripe integration, payment UI

8. **Accessibility** (TIER 2 - Priority 1.6)
   - Status: Semantic HTML implemented
   - Missing: Screen reader enhancements, ARIA labels, keyboard nav improvements

---

## ❌ Not Started - Prioritized Features

### TIER 1 - Quick Wins (2-4 weeks)

| Feature | Priority | Effort | Impact | Status |
|---------|----------|--------|--------|--------|
| **Due Date Notifications** | 3.0 | 3 days | Prevents 80% of fines | ❌ |
| **Borrowing Limits Warning** | 3.0 | 1 day | Prevents frustration | ❌ |

### TIER 2 - High Value (4-8 weeks)

| Feature | Priority | Effort | Impact | Status |
|---------|----------|--------|--------|--------|
| **Availability Notifications** | 2.0 | 4 days | Completes reservation flow | ❌ |
| **Book Reservations/Holds** | 1.8 | 1 week | Critical for busy libraries | ⚠️ Schema done |
| **Calendar Integration** | 1.8 | 4 days | Syncs with user workflows | ❌ |
| **Reading Analytics** | 1.5 | 4 days | Engagement & gamification | ❌ |
| **Online Fine Payment** | 1.5 | 1 week | Revenue enabler | ⚠️ Partial |

### TIER 3 - Strategic (8-12 weeks)

| Feature | Priority | Effort | Impact | Status |
|---------|----------|--------|--------|--------|
| **Mobile App (PWA)** | 1.3 | 1.5 weeks | Offline features | ❌ |
| **Book Reviews/Ratings** | 1.2 | 1 week | Community building | ❌ |
| **Custom Shelves** | 1.2 | 1.5 weeks | Power user feature | ⚠️ Schema done |
| **AI Recommendations** | 1.1 | 2 weeks | Competitive differentiator | ❌ |
| **Family Account Linking** | 1.0 | 1.5 weeks | Parent feature | ❌ |
| **Public Shelf Sharing** | 1.0 | 1 week | Social/viral potential | ❌ |

---

## 🔌 API Endpoints (40+ Implemented)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth handler

### Books
- `GET /api/books` - List books with pagination
- `GET /api/books/[id]` - Get book details
- `POST /api/admin/books` - Create book
- `PUT /api/admin/books/[id]` - Update book
- `DELETE /api/admin/books/[id]` - Delete book
- `POST /api/admin/books/[id]/copies` - Add physical copy

### Members
- `GET /api/admin/members` - List members with filters
- `GET /api/admin/members/[id]` - Member details + history
- `POST /api/admin/members` - Create member
- `PUT /api/admin/members/[id]` - Update member
- `DELETE /api/admin/members/[id]` - Delete member

### Transactions
- `POST /api/admin/transactions/issue` - Checkout book
- `POST /api/admin/transactions/return` - Return book (calculates fines)
- `GET /api/member/borrowed` - Active borrowed books
- `GET /api/member/history` - Complete borrowing history
- `GET /api/member/history/export` - ✅ NEW: Export history (CSV/JSON)
- `POST /api/member/renew` - ✅ NEW: Renew book (14-day extension)

### Fines & Payments
- `GET /api/member/fines` - User's fines summary
- `POST /api/admin/fines` - Create fine
- `POST /api/admin/fines/[id]/waive` - Waive fine
- `POST /api/admin/payments` - Process payment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/[id]` - Mark as read
- `PUT /api/notifications/mark-all-read` - Bulk mark read

### Search & Discovery
- `GET /api/search` - Advanced search
  - Filters: text, category, author, year range, availability
  - Sorting: title, year, author (asc/desc)
  - Pagination support

### Admin Analytics
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/analytics` - ✅ UPDATED: Enhanced analytics
- `GET /api/admin/activity` - Activity log feed
- `GET /api/admin/overdue` - Overdue books list

### Categories & Authors
- `GET /api/admin/categories` - List categories
- `POST /api/admin/categories` - Create category
- `GET /api/admin/authors` - List authors
- `POST /api/admin/authors` - Create author

### QR Codes
- `POST /api/qr/generate-book/[id]` - Generate book QR
- `POST /api/qr/generate-user/[id]` - Generate user QR
- `POST /api/qr/scan` - Process QR scan

### Membership
- `POST /api/member/subscribe` - Subscribe to plan

---

## 🎯 Key Business Logic

### Fine Calculation
- **Rate:** $0.50 per day overdue
- **Trigger:** Automatic on book return
- **Statuses:** pending, paid, waived
- **Location:** `lib/services/transactions.ts`

### Book Issuance Rules
1. Check copy availability
2. Verify active membership
3. Block if member has overdue books
4. Create transaction record
5. Update copy status → "borrowed"
6. Decrement available_copies count
7. Log activity in audit trail

### Book Return Process
1. Calculate overdue days (if any)
2. Create fine if overdue ($0.50/day)
3. Update copy status → "available"
4. Increment available_copies count
5. Set return date on transaction
6. Log activity
7. **All operations in atomic database transaction**

### Book Renewal Rules (NEW) ✅
1. Check renewal count vs. membership limit
   - Standard: 2 renewals max
   - Premium: 5 renewals max
   - Student: 3 renewals max
2. Block if book is overdue
3. Extend due date by 14 days
4. Increment renewal count
5. Return updated transaction

---

## 🔧 Infrastructure & Services

### Current Deployment
- **Hosting:** Vercel
- **Database:** Neon Serverless PostgreSQL
- **Authentication:** NextAuth.js with database sessions
- **Asset Storage:** Public folder (book covers TBD)

### Services Needed (Not Integrated)
- ❌ **Email Service** - Resend recommended for notifications
- ❌ **SMS Service** - Twilio (optional) for SMS notifications
- ❌ **Payment Gateway** - Stripe for fine payments and subscriptions
- ❌ **Image Upload** - Uploadthing or Cloudinary for book covers
- ❌ **Background Jobs** - Vercel Cron for scheduled tasks (reminders, expiry checks)

---

## 📚 Recent Major Updates

### Commit History (Recent)
1. `4a844ac` - **feat: Add Quick Reference for Literary Modernism Design System**
   - Added `DESIGN_QUICK_REFERENCE.md` for developer onboarding
   - Added `DESIGN_AESTHETIC.md` for complete design spec
   - Added `JTBD_IMPACT_MATRIX.md` for strategic prioritization

2. `8ff61d3` - **feat: add debug logging for member route requests**

3. `b3d0413` - **Remove redundant middleware.ts in favor of proxy.ts**

4. `f914eca` - **Merge pull request #2 - Docker + Postgres pragma setup**

5. `66860a5` - **chore: Remove Docker files and redundant deployment guides**

6. `12e7af9` - **feat: Configure for Vercel + Neon deployment**

---

## 🛠️ Development Commands

```bash
# Development
pnpm dev              # Start dev server (localhost:3000)

# Database
pnpm db:generate      # Generate migration files
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:push          # Push schema changes
pnpm db:studio        # Open Drizzle Studio GUI
pnpm db:setup         # Migrate + Seed
pnpm db:full-setup    # Migrate + Seed + Import 200 books
pnpm db:import:200    # Import books from external API

# Building
pnpm build            # Production build
pnpm start            # Start production server

# Linting
pnpm lint             # Run ESLint
```

---

## 📝 Key Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `DESIGN_AESTHETIC.md` | Complete design system specification | ✅ Current |
| `DESIGN_QUICK_REFERENCE.md` | Developer quick reference | ✅ Current |
| `JTBD_IMPACT_MATRIX.md` | Feature prioritization framework | ✅ Current |
| `FEATURE_IMPLEMENTATION_PLAN.md` | Detailed feature roadmap | 🔄 Needs update |
| `lib/db/schema.ts` | Complete database schema (17 tables) | ✅ Current |
| `lib/auth/config.ts` | NextAuth configuration | ✅ Current |
| `lib/auth/roles.ts` | RBAC definitions | ✅ Current |
| `lib/services/transactions.ts` | Core business logic | ✅ Current |
| `app/api/member/history/export/route.ts` | NEW: History export | ✅ Implemented |
| `app/api/member/renew/route.ts` | NEW: Book renewals | ✅ Implemented |
| `components/shared/theme-toggle.tsx` | NEW: Dark mode toggle | ⚠️ Not integrated |
| `tailwind.config.ts` | Literary Modernism theme | ✅ Updated |
| `app/globals.css` | Custom animations, utilities | ✅ Updated |

---

## 🚀 Recommended Next Steps

### Immediate Actions (This Sprint)
Based on JTBD matrix TIER 1:

1. **Complete Dark Mode Implementation** (1-2 days)
   - Integrate theme toggle component
   - Add user preference storage
   - Test across all pages

2. **Implement Due Date Notifications** (3 days) - Priority 3.0
   - Set up Resend email service
   - Create email templates
   - Implement cron job for daily reminders

3. **Add Borrowing Limits Warning** (1 day) - Priority 3.0
   - Dashboard banner when near limit
   - Real-time validation on checkout

### Next Sprint (TIER 2 Features)

4. **Complete Reservation System** (1 week) - Priority 1.8
   - FIFO queue management logic
   - API endpoints for create/cancel/fulfill
   - Member UI + Admin UI

5. **Availability Notifications** (4 days) - Priority 2.0
   - Email notifications when reserved book ready
   - In-app notifications
   - 48-hour pickup window

6. **Calendar Integration** (4 days) - Priority 1.8
   - iCal feed generation
   - Google Calendar OAuth (optional)
   - Auto-add due dates and pickup reminders

---

## 📊 Current Status Summary

**Completion:** ~80% of core features implemented

**Active Branch:** `claude/plan-feature-prioritization-01FKyRwKwMwcxzLV3dUvj2LS`

**Last Major Update:** November 15, 2025 (Literary Modernism design system)

**Production-Ready Features:**
- ✅ Admin Portal (complete)
- ✅ Member App core (complete)
- ✅ Authentication & RBAC (complete)
- ✅ Transaction management (complete)
- ✅ QR code system (complete)
- ✅ Literary Modernism UI (complete)
- ✅ History export (complete)
- ✅ Book renewals (complete)

**In Development:**
- ⚠️ Dark mode (90% done)
- ⚠️ Reservation system (schema done)
- ⚠️ Custom shelves (schema done)
- ⚠️ Payment gateway (partial)

**Priority Queue:**
- 🔜 Due date notifications
- 🔜 Borrowing limits warning
- 🔜 Availability notifications
- 🔜 Calendar integration

---

**For detailed feature planning, see:** `FEATURE_IMPLEMENTATION_PLAN.md`
**For design implementation, see:** `DESIGN_QUICK_REFERENCE.md`
**For prioritization logic, see:** `JTBD_IMPACT_MATRIX.md`
