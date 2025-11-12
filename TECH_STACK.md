# Librarium - Technical Stack Documentation

**Version:** 1.0
**Date:** November 12, 2025
**Status:** Approved

---

## Overview

This document defines the complete technical stack for **Librarium (Library Nexus)** - a comprehensive, dual-interface library management system consisting of an Admin Portal and a Member-Facing App.

---

## Core Technology Stack

### Frontend & Backend Framework

**Next.js 14+ (App Router)**
- **Why:**
  - Full-stack React framework with server and client components
  - Built-in API routes for backend logic
  - Server-side rendering (SSR) and static generation (SSG)
  - Excellent developer experience with TypeScript
  - Built-in image optimization
  - File-based routing
  - Middleware support for authentication

- **Usage:**
  - `/app` directory for App Router
  - Server Components for data fetching
  - Client Components for interactive UI
  - API Routes for backend endpoints
  - Route handlers for REST API

---

### Database

**PostgreSQL** (via **Neon** or **Vercel Postgres**)

- **Why PostgreSQL:**
  - Robust relational database perfect for complex data relationships
  - ACID compliance (critical for financial transactions like fines/payments)
  - Excellent support for complex queries and joins
  - Strong data integrity and foreign key constraints
  - Handles concurrent transactions efficiently
  - JSON/JSONB support for flexible metadata storage

- **Why Neon/Vercel Postgres:**
  - Serverless PostgreSQL with autoscaling
  - Built-in connection pooling
  - Excellent Next.js integration
  - Generous free tier for development
  - Automatic backups
  - Branch database support (great for development/staging)
  - Low latency with edge deployment

- **Database Structure:**
  ```
  Tables:
  - users (members + admin staff)
  - books
  - authors
  - categories
  - book_copies (individual physical copies)
  - transactions (checkouts/returns)
  - reservations
  - fines
  - payments
  - custom_shelves
  - shelf_books (many-to-many)
  - activity_log
  ```

---

### ORM (Object-Relational Mapping)

**Drizzle ORM**

- **Why Drizzle:**
  - TypeScript-first with superior type inference
  - Lightweight and performant (~7kb core)
  - SQL-like syntax - easier to understand and debug
  - Better performance than Prisma for complex queries
  - Direct control over queries (no magic abstraction)
  - Excellent PostgreSQL support
  - Built-in migration system
  - Works seamlessly with serverless environments
  - Great DX with Drizzle Studio for database management

- **Features We'll Use:**
  - Schema definition with `drizzle-orm/pg-core`
  - Type-safe queries
  - Relations and joins
  - Transactions for complex operations
  - Prepared statements for performance
  - Drizzle Kit for migrations

---

### Authentication

**NextAuth.js v5 (Auth.js)**

- **Why:**
  - Industry-standard authentication for Next.js
  - Built-in OAuth provider support
  - Session management
  - Type-safe with TypeScript
  - Middleware support for route protection
  - JWT and database session strategies

- **Authentication Strategy:**
  - **Google OAuth** (Single Sign-On)
    - For both members and admin users
    - Streamlined registration process
    - Secure, no password management needed
    - User-friendly experience

  - **Email/Password** (fallback/optional)
    - For users without Google accounts
    - Bcrypt password hashing

  - **Role-Based Access Control (RBAC):**
    - Roles: `member`, `staff`, `admin`, `director`
    - Route protection via middleware
    - Component-level permission checks

- **Implementation:**
  ```typescript
  // Providers
  - Google OAuth 2.0
  - Credentials (email/password with bcrypt)

  // Session Storage
  - Database sessions (via Drizzle adapter)
  - JWT for API routes

  // Protected Routes
  - /admin/* - requires admin/staff role
  - /member/* - requires authenticated member
  - /api/* - JWT validation
  ```

---

### UI Component Library

**shadcn/ui**

- **Why:**
  - Not an npm package - copy/paste components you own
  - Built on Radix UI primitives (accessibility-first)
  - Fully customizable with Tailwind CSS
  - TypeScript support out of the box
  - Excellent documentation
  - No runtime overhead
  - Perfect for design system implementation

- **Components We'll Use:**
  - `Button`, `Input`, `Select`, `Textarea` - Forms
  - `Table`, `DataTable` - Admin data grids
  - `Dialog`, `Sheet` - Modals and side panels
  - `Card` - Content containers
  - `Tabs` - Quick Actions UI
  - `Dropdown`, `Popover` - Menus
  - `Toast` - Notifications
  - `Calendar`, `DatePicker` - Date selection
  - `Badge` - Tags and labels
  - `Avatar` - User profiles
  - `Command` - Search palettes

---

### Styling

**Tailwind CSS**

- **Why:**
  - Utility-first CSS framework
  - Perfect match with shadcn/ui
  - Rapid UI development
  - Built-in responsive design
  - Easy theming and customization
  - Excellent performance (PurgeCSS built-in)
  - Consistent design system

- **Configuration:**
  ```javascript
  // Custom theme based on "Illumination" design system
  colors: {
    primary: {
      teal: '#00798C',  // Brand Core
      gold: '#E8A24C',  // Discovery/Member Accent
    },
    neutral: {
      100: '#F7F7F7',   // Background
      800: '#1F2937',   // Admin Sidebar
    },
    admin: {
      dark: '#1F2937',  // Admin UI
    }
  },
  fontFamily: {
    sans: ['Inter', 'sans-serif'],      // Body/Admin
    display: ['Poppins', 'sans-serif'], // Member Headers
  }
  ```

---

### Form Handling & Validation

**React Hook Form + Zod**

- **React Hook Form:**
  - Performant, flexible forms with minimal re-renders
  - Easy integration with shadcn/ui components
  - Built-in validation
  - TypeScript support

- **Zod:**
  - TypeScript-first schema validation
  - Runtime type checking
  - Reusable schemas for forms and API validation
  - Error messages out of the box

- **Usage:**
  ```typescript
  // Example: Book registration schema
  const bookSchema = z.object({
    title: z.string().min(1, "Title is required"),
    isbn: z.string().regex(/^[\d-]{10,17}$/, "Invalid ISBN"),
    category: z.string(),
    quantity: z.number().int().positive(),
  })
  ```

---

### State Management

**React Context + Zustand (for complex state)**

- **React Context:**
  - For auth state, theme, user preferences
  - Server Components reduce need for global state

- **Zustand (if needed):**
  - Lightweight (~1kb)
  - Simple API
  - TypeScript support
  - DevTools integration
  - For complex UI state (e.g., multi-step forms, cart-like behavior)

---

### Data Fetching & Caching

**Next.js Built-in + React Query (TanStack Query)**

- **Next.js Server Components:**
  - For initial data loading
  - Direct database queries in Server Components
  - Automatic request deduplication

- **React Query:**
  - Client-side data fetching and caching
  - Real-time updates (polling for activity feed)
  - Optimistic updates
  - Infinite scrolling for book lists
  - Mutation handling

---

### File Upload & Storage

**Uploadthing** or **Cloudinary**

- **Uploadthing (Recommended):**
  - Built for Next.js
  - Type-safe file uploads
  - Free tier: 2GB storage
  - Image optimization
  - Easy to use

- **Alternative: Cloudinary:**
  - Advanced image transformations
  - Free tier: 25GB storage
  - CDN delivery
  - Book cover optimization

- **Use Cases:**
  - Book cover images
  - Member profile pictures
  - Document uploads (e.g., membership forms)

---

### Charts & Analytics

**Recharts** or **Chart.js with react-chartjs-2**

- **Recharts (Recommended):**
  - Built for React
  - Declarative API
  - Responsive charts
  - TypeScript support

- **Charts Needed:**
  - Pie/Donut chart - Book categories distribution
  - Bar chart - Circulation trends
  - Line chart - Member growth over time
  - Heatmap - Borrowing patterns by time/day

---

### Search & Filtering

**Custom Implementation + PostgreSQL Full-Text Search**

- **PostgreSQL Full-Text Search:**
  - Built-in, no external service needed
  - Fast for medium-sized datasets
  - Support for ranked results

- **Future Enhancement:**
  - Algolia or Meilisearch for advanced search
  - Autocomplete suggestions
  - Typo tolerance
  - Faceted search

---

### Email Service

**Resend** or **SendGrid**

- **Resend (Recommended):**
  - Modern email API
  - Built for developers
  - React Email templates
  - Free tier: 3,000 emails/month

- **Use Cases:**
  - New member welcome emails
  - Overdue book notifications
  - Password reset
  - Receipt for fine payments
  - Hold availability notifications

---

### Background Jobs & Scheduling

**Vercel Cron Jobs** or **Inngest**

- **Vercel Cron Jobs:**
  - Simple scheduled tasks
  - Free on Vercel

- **Inngest (for complex workflows):**
  - Event-driven background jobs
  - Reliable execution
  - Retries and error handling

- **Scheduled Tasks:**
  - Daily overdue book checks
  - Fine calculations
  - Automated email reminders
  - Report generation
  - Data cleanup

---

### Testing

**Jest + React Testing Library + Playwright**

- **Unit & Integration Tests:**
  - Jest for business logic
  - React Testing Library for components

- **E2E Tests:**
  - Playwright for critical user flows
  - Test book checkout process
  - Test fine payment flow
  - Test admin operations

---

### Code Quality

**TypeScript + ESLint + Prettier**

- **TypeScript:**
  - Strict mode enabled
  - Type safety across the stack
  - Better IDE support

- **ESLint:**
  - Next.js recommended config
  - Custom rules for code quality

- **Prettier:**
  - Consistent code formatting
  - Auto-format on save

---

### Deployment & Hosting

**Vercel** (Recommended)

- **Why:**
  - Made by the Next.js team
  - Zero-config deployment
  - Edge Functions
  - Automatic HTTPS
  - Preview deployments for PRs
  - Built-in analytics
  - Generous free tier

- **CI/CD:**
  - Automatic deployments from GitHub
  - Preview URLs for each branch
  - Production deployment from main branch

---

### Monitoring & Error Tracking

**Sentry** + **Vercel Analytics**

- **Sentry:**
  - Real-time error tracking
  - Performance monitoring
  - User session replay
  - Free tier available

- **Vercel Analytics:**
  - Web Vitals tracking
  - Page view analytics
  - Performance insights

---

## Development Tools

### Package Manager
- **pnpm** (fast, disk-efficient)

### Database Management
- **Drizzle Studio** - GUI for database
- **TablePlus** or **Postico** - PostgreSQL clients

### API Testing
- **Postman** or **Thunder Client** (VS Code)

### Version Control
- **Git** + **GitHub**
- Feature branch workflow
- Pull request reviews
- Semantic commit messages

---

## Project Structure

```
librarium/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (login, register)
│   ├── (member)/            # Member-facing app routes
│   │   ├── discover/
│   │   ├── category/
│   │   ├── library/
│   │   └── favorites/
│   ├── (admin)/             # Admin portal routes
│   │   ├── dashboard/
│   │   ├── books/
│   │   ├── members/
│   │   └── reports/
│   ├── api/                 # API routes
│   └── layout.tsx
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── admin/               # Admin-specific components
│   ├── member/              # Member-specific components
│   └── shared/              # Shared components
├── lib/                     # Utility functions
│   ├── db/                  # Drizzle schema & client
│   ├── auth/                # NextAuth config
│   ├── validations/         # Zod schemas
│   └── utils.ts
├── public/                  # Static assets
├── styles/                  # Global styles
├── types/                   # TypeScript types
├── hooks/                   # Custom React hooks
├── drizzle/                 # Database migrations
└── tests/                   # Test files
```

---

## Security Considerations

1. **Authentication:**
   - JWT token validation
   - Secure session storage
   - CSRF protection (NextAuth built-in)

2. **Database:**
   - Prepared statements (SQL injection prevention)
   - Role-based access control
   - Encrypted connections

3. **API Routes:**
   - Rate limiting (middleware)
   - Input validation (Zod)
   - API key authentication for internal services

4. **Environment Variables:**
   - `.env.local` for secrets
   - Never commit secrets to git
   - Use Vercel environment variables for production

---

## Performance Targets

- **Time to Interactive (TTI):** < 3s
- **First Contentful Paint (FCP):** < 1.5s
- **Lighthouse Score:** > 90
- **Database Query Time:** < 100ms (avg)
- **API Response Time:** < 200ms (avg)

---

## Browser Support

- **Desktop:** Last 2 versions of Chrome, Firefox, Safari, Edge
- **Mobile:** iOS Safari 14+, Chrome Android latest
- **Responsive Breakpoints:**
  - Mobile: 320px - 640px
  - Tablet: 641px - 1024px
  - Desktop: 1025px+

---

## Tech Stack Summary

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | Next.js 14+ | Full-stack React framework |
| Database | PostgreSQL (Neon) | Relational database |
| ORM | Drizzle | Type-safe database queries |
| Auth | NextAuth.js v5 | Authentication & authorization |
| UI Library | shadcn/ui | Component library |
| Styling | Tailwind CSS | Utility-first CSS |
| Forms | React Hook Form + Zod | Form handling & validation |
| State | React Context + Zustand | State management |
| Data Fetching | React Query | Client-side caching |
| File Upload | Uploadthing | Image/file uploads |
| Charts | Recharts | Data visualization |
| Email | Resend | Transactional emails |
| Jobs | Vercel Cron | Scheduled tasks |
| Testing | Jest + Playwright | Unit & E2E testing |
| Deployment | Vercel | Hosting & CI/CD |
| Monitoring | Sentry | Error tracking |

---

## Next Steps

1. Initialize Next.js project with TypeScript
2. Set up Drizzle ORM and database schema
3. Configure NextAuth.js with Google OAuth
4. Install and configure shadcn/ui components
5. Implement design system with Tailwind
6. Build core features incrementally
7. Set up testing infrastructure
8. Deploy to Vercel

---

**Document Owner:** Development Team
**Last Updated:** November 12, 2025
**Next Review:** After MVP completion
