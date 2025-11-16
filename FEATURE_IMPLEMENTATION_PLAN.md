# Librarium Feature Implementation Plan

**Version:** 2.0
**Last Updated:** November 16, 2025
**Status:** Aligned with Literary Modernism Design System & JTBD Framework

---

## Overview

This document outlines the implementation plan for 6 major features, prioritized using the **Jobs-to-be-Done (JTBD) Impact Matrix** (Priority = Impact / Effort).

### Strategic Context

**Design System:** All UI implementations must conform to the **Literary Modernism** design system - refined, editorial, memorable. See `DESIGN_QUICK_REFERENCE.md` for component patterns.

**Prioritization Framework:** Features are prioritized using the JTBD matrix in `JTBD_IMPACT_MATRIX.md`. This plan focuses on TIER 2 and TIER 3 features, as several TIER 1 features are already implemented:

**TIER 1 Achievements** (Quick Wins - Priority >2.5):
- ✅ QR Code Member Card (Priority 5.0) - Implemented
- ✅ Reading History Export (Priority 3.5) - Implemented
- ✅ Enhanced UI/UX Design (Priority 3.0) - Literary Modernism system complete
- ✅ Book Renewals (Priority 2.7) - Implemented
- ⚠️ Dark Mode (Priority 2.5) - 90% complete, needs integration
- ❌ Due Date Notifications (Priority 3.0) - Not started (recommended prerequisite)
- ❌ Borrowing Limits Warning (Priority 3.0) - Not started (quick win)

---

## Priority Matrix

| Feature | JTBD Priority | JTBD Tier | Rationale |
|---------|---------------|-----------|-----------|
| **Availability Notifications** | 2.0 | TIER 2 | Completes reservation flow, high engagement driver |
| **Book Reservations/Holds** | 1.8 | TIER 2 | Critical for busy libraries, prevents member frustration |
| **Calendar Integration** | 1.8 | TIER 2 | Syncs with user habits, reduces cognitive load |
| **Book Reviews/Ratings** | 1.2 | TIER 3 | Community building, discovery enhancement |
| **AI Recommendations** | 1.1 | TIER 3 | Competitive differentiator, complex to implement |
| **Public Shelf Sharing** | 1.0 | TIER 3 | Social features, viral potential |

**Note:** Before starting Phase 1, consider implementing **Due Date Notifications** (Priority 3.0, TIER 1) as it shares infrastructure with Phase 2 and delivers immediate value.

---

## Design System Requirements

### All UI Components Must Follow Literary Modernism Guidelines

**Typography:**
- Display headings: Crimson Pro (serif) - `font-serif`
- UI elements: Archivo (sans-serif) - `font-sans`
- Metadata: JetBrains Mono - `font-mono`

**Visual Elements:**
- Shadows: `shadow-soft` (rest), `shadow-lift` (hover)
- Animations: `fade-in-up` with stagger delays (0.1s increments)
- Cards: Gradient accents, ornamental borders for sections
- Buttons: Gradient backgrounds with Literary style
- Book cards: Shimmer effect on hover, -12px lift

**Color Usage:**
- Primary actions: `bg-primary` (Deep Teal)
- Accents: `bg-accent` (Warm Amber)
- Success states: `bg-chart-5/90`
- Error states: `bg-destructive`

**Reference:** `DESIGN_QUICK_REFERENCE.md` for copy-paste patterns

---

## Implementation Phases

### Phase 1: Book Reservations/Holds (TIER 2 - Priority: 1.8)

**Strategic Note:** Building this first enables Phase 2 (Notifications). Consider implementing Due Date Notifications first for quick win.

#### Current State
- ✅ Database schema exists (`reservations` table in `lib/db/schema.ts`)
- ❌ API endpoints not implemented
- ❌ UI components missing
- ❌ Queue management logic needed

#### Implementation Tasks

**1.1 Database Schema Review** (1-2 hours)
- Review existing `reservations` table structure
- Add missing fields if needed:
  - `queue_position` (integer) - Position in hold queue
  - `expires_at` (timestamp) - When ready book reservation expires
  - `notified_at` (timestamp) - When member was notified
- Create database indexes for performance:
  - `CREATE INDEX idx_reservations_book_id ON reservations(book_id)`
  - `CREATE INDEX idx_reservations_user_id ON reservations(user_id)`
  - `CREATE INDEX idx_reservations_status ON reservations(status)`

**1.2 API Endpoints** (6-8 hours)

Create in `app/api/reservations/`:

```typescript
// Member endpoints
POST   /api/reservations              // Create reservation
GET    /api/reservations              // List user's reservations
GET    /api/reservations/:id          // Get single reservation
DELETE /api/reservations/:id          // Cancel reservation

// Admin endpoints
POST   /api/admin/reservations/:id/fulfill  // Mark as ready for pickup
GET    /api/admin/reservations              // List all reservations (filtered)

// Shared
GET    /api/books/:id/availability    // Check if book is available or reserved
```

**Validation Schemas** (Zod):
- Create `lib/validations/reservation.ts`
- Schemas: `createReservationSchema`, `cancelReservationSchema`

**1.3 Queue Management Logic** (8-10 hours)

Location: `lib/services/reservations.ts`

**Business Rules:**
- FIFO queue system (first in, first out)
- Auto-assign book to next in queue when returned
- 48-hour pickup window when book becomes available
- Auto-cancel if not picked up within window
- Update all queue positions when member picks up or cancels

**Key Functions:**
```typescript
async function addToQueue(bookId, userId)
async function assignNextInQueue(bookId)
async function cancelReservation(reservationId)
async function checkExpiredReservations() // For cron job
```

**Integration:**
- Hook into `lib/services/transactions.ts` return logic
- Trigger queue check when book status → "available"

**1.4 Member App UI** (6-8 hours)

**DESIGN SYSTEM COMPLIANCE REQUIRED**

**File Locations:**
- `app/member/books/[id]/page.tsx` - Add reservation button
- `app/member/reservations/page.tsx` - NEW: Reservations management page

**Book Detail Page Updates:**
```tsx
// Add "Reserve This Book" button when unavailable
<Button className="bg-gradient-to-r from-primary to-primary/80
                   hover:from-primary/90 hover:to-primary/70
                   shadow-lg hover:shadow-xl transition-all">
  <BookmarkPlus className="mr-2 h-4 w-4" />
  Reserve This Book
</Button>

// Show queue position badge if already reserved
<Badge className="bg-accent/90 backdrop-blur-sm shadow-lg border-0 font-mono text-xs">
  Position #{queuePosition} in queue
</Badge>
```

**Reservations Page (NEW):**
- **Hero section:** Ornamental border header "My Reservations"
- **Active holds section:**
  - Card grid with Literary design (shadow-soft, gradient accents)
  - Book title: `font-serif text-lg font-semibold`
  - Queue position indicator with visual progress
  - Estimated availability date
  - "Cancel Reservation" button (destructive variant)
- **Ready for pickup section:**
  - Visual distinction (success color `bg-chart-5/90`)
  - Countdown timer to expiration (48 hours)
  - "Confirm Pickup" button
- **Empty state:** Literary magazine style empty state with ornamental icon

**1.5 Admin Portal UI** (4-6 hours)

**File:** `app/admin/reservations/page.tsx` (NEW)

**Features:**
- Reservations table (sortable, filterable)
- Columns: Member, Book, Queue Position, Status, Reserved Date, Actions
- Filter by status: active, fulfilled, cancelled
- Search by member name or book title
- Manual fulfillment action (override queue)
- Analytics card: Most reserved books (top 10)

**Design:** Admin interface uses clean, data-forward design (less gradient, more contrast)

**Total Estimated Effort:** 25-34 hours
**Dependencies:** None
**Risk Level:** Low - straightforward CRUD with business logic

---

### Phase 2: Availability Notifications (TIER 2 - Priority: 2.0)

**Strategic Note:** Completes the reservation user experience. Also implements Due Date Notifications (TIER 1 - Priority 3.0) for immediate value.

#### Current State
- ❌ No email service integration
- ✅ Notifications table exists in database (`lib/db/schema.ts`)
- ❌ No notification preferences system
- ❌ No background job scheduling

#### Implementation Tasks

**2.1 Email Service Setup** (3-4 hours)

**Service:** Resend (recommended for deliverability)

```bash
pnpm add resend
```

**Setup:**
- Create account at resend.com
- Verify domain (or use resend.dev for testing)
- Add `RESEND_API_KEY` to environment variables
- Create `lib/email/client.ts` - Resend client wrapper

**Email Templates** (`lib/email/templates/`):

Create with Literary Modernism branding:
- `book-available.tsx` - Book ready for pickup (reservation)
- `reservation-expiring.tsx` - 24-hour reminder before hold expires
- `due-soon.tsx` - Book due in 2 days (TIER 1 feature)
- `overdue.tsx` - Book is overdue
- `fine-added.tsx` - Fine assessment notification

**Design:** Use Crimson Pro for headings, warm colors, elegant layout

**2.2 Notification Preferences** (4-6 hours)

**Database Migration:**
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  availability_notifications BOOLEAN DEFAULT true,
  due_date_notifications BOOLEAN DEFAULT true,
  fine_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**API Endpoints:** `app/api/notifications/preferences/`
```typescript
GET    /api/notifications/preferences       // Get user preferences
PUT    /api/notifications/preferences       // Update preferences
```

**UI:** Add to `app/member/profile/page.tsx` settings section

**Design:** Toggle switches with Literary styling, section headers with ornamental borders

**2.3 Email Notification Implementation** (6-8 hours)

**Service Layer:** `lib/services/notifications.ts`

```typescript
async function sendBookAvailableEmail(reservation)
async function sendReservationExpiringEmail(reservation)
async function sendDueSoonEmail(transaction)
async function sendOverdueEmail(transaction)
async function sendFineAddedEmail(fine)
```

**Integration Points:**
- Reservation system: Trigger when book assigned to member
- Transaction return: Trigger reservation queue check
- Daily cron: Check due dates (2 days before)
- Hourly cron: Check reservation expirations

**Logging:**
- Track all email sends in `activity_log` table
- Store email delivery status (sent, failed, bounced)

**2.4 In-App Notifications** (8-10 hours)

**DESIGN SYSTEM COMPLIANCE REQUIRED**

**Backend:** Already exists (`app/api/notifications/`)

**UI Components:**

**Notification Bell** (`components/shared/notification-bell.tsx`):
```tsx
// Add to member layout header
<Button variant="ghost" className="relative">
  <Bell className="h-5 w-5" />
  {unreadCount > 0 && (
    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center
                      bg-destructive text-white text-xs p-0 rounded-full">
      {unreadCount}
    </Badge>
  )}
</Button>
```

**Notification Dropdown:**
- Popover component with shadow-dramatic
- List of recent notifications (last 10)
- "View All" link to notification center
- Mark as read on click
- Literary typography: `font-serif` for titles, `font-mono` for timestamps

**2.5 Background Jobs** (6-8 hours)

**Setup Vercel Cron:**

Create `app/api/cron/` directory:

```typescript
// app/api/cron/check-reservations/route.ts
// Runs every hour
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  await checkExpiredReservations()
  await sendReservationExpiringReminders()

  return Response.json({ success: true })
}
```

```typescript
// app/api/cron/due-date-reminders/route.ts
// Runs daily at 9 AM
export async function GET(request: Request) {
  // Auth check
  await sendDueDateReminders() // 2 days before
  await sendOverdueReminders() // Past due
  return Response.json({ success: true })
}
```

**vercel.json update:**
```json
{
  "crons": [
    {
      "path": "/api/cron/check-reservations",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/due-date-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Error Handling:**
- Log all cron job executions
- Send admin alerts on failures (email or Slack)
- Retry logic for transient failures

**2.6 Notification Center UI** (4-6 hours)

**File:** `app/member/notifications/page.tsx` (NEW)

**DESIGN SYSTEM COMPLIANCE REQUIRED**

**Features:**
- **Hero:** Ornamental border header "Notifications"
- **Filter tabs:** All, Reservations, Due Dates, Fines (Literary tab design)
- **Notification list:**
  - Card per notification (shadow-soft)
  - Icon badge (color-coded by type)
  - Title: `font-serif text-base font-semibold`
  - Timestamp: `font-mono text-xs text-muted-foreground`
  - Message: `font-sans text-sm`
  - Read/unread visual distinction (opacity)
- **Actions:**
  - Mark all as read button
  - Individual delete (trash icon)
  - Link to relevant page (reservation, book, fine)
- **Empty state:** Literary design with decorative icon

**Total Estimated Effort:** 31-42 hours
**Dependencies:** Requires Phase 1 (Reservations) for full functionality, but can implement Due Date notifications independently
**Risk Level:** Medium - external service dependencies, cron job reliability

**TIER 1 Bonus:** This phase also delivers Due Date Notifications (Priority 3.0), a quick win that prevents 80% of fines!

---

### Phase 3: Calendar Integration (TIER 2 - Priority: 1.8)

**Strategic Note:** Reduces friction, syncs with user workflows. Can run in parallel with Phase 1-2.

#### Current State
- ❌ No calendar integration exists
- ❌ No iCal feed generation
- ❌ No Google Calendar OAuth setup

#### Implementation Tasks

**3.1 Research & Planning** (2-3 hours)

**Evaluation:**

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **iCal Feeds** | Universal compatibility, simple, no OAuth | Read-only, requires manual setup | ✅ Implement |
| **Google Calendar API** | Bi-directional, auto-sync, rich features | OAuth complexity, Google-only | ✅ Implement |
| **Both** | Best UX, maximum compatibility | More development time | ✅ **Recommended** |

**Decision:** Implement both for maximum user flexibility.

**3.2 iCal Feed Generation** (6-8 hours)

**Package:**
```bash
pnpm add ical-generator
```

**Implementation:**

**File:** `lib/services/calendar.ts`
```typescript
import ical from 'ical-generator'

export async function generateUserCalendarFeed(userId: string) {
  const calendar = ical({ name: 'Librarium - My Books' })

  // Fetch user's active transactions
  const borrowed = await getBorrowedBooks(userId)

  // Add due date events
  borrowed.forEach(transaction => {
    calendar.createEvent({
      start: new Date(transaction.dueDate),
      end: new Date(transaction.dueDate),
      summary: `Return: ${transaction.book.title}`,
      description: `Book due at library`,
      location: 'Library',
      url: `${BASE_URL}/member/books/${transaction.bookId}`
    })
  })

  // Add reservation pickup events
  const reservations = await getActiveReservations(userId)
  reservations.filter(r => r.status === 'ready').forEach(res => {
    calendar.createEvent({
      start: new Date(res.expiresAt),
      end: new Date(res.expiresAt),
      summary: `Pick up: ${res.book.title}`,
      description: `Reserved book ready for pickup (expires in 48hrs)`,
      location: 'Library',
      url: `${BASE_URL}/member/reservations`
    })
  })

  return calendar.toString()
}
```

**API Endpoint:** `app/api/calendar/feed/[token]/route.ts`
```typescript
GET /api/calendar/feed/:token  // Public endpoint with secure token
```

**Security:**
- Generate unique, secure token per user (UUID)
- Store in `users` table: `calendar_feed_token`
- Allow token regeneration (revoke old access)

**3.3 Google Calendar Integration** (10-12 hours)

**Setup Google OAuth:**

**1. Add Calendar scope to NextAuth** (`lib/auth/config.ts`):
```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authorization: {
    params: {
      scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
      access_type: 'offline',
      prompt: 'consent'
    }
  }
})
```

**2. Store refresh token** in `accounts` table (already supported by NextAuth)

**3. Calendar Service** (`lib/services/google-calendar.ts`):
```typescript
import { google } from 'googleapis'

export async function createDueDateEvent(userId, transaction) {
  const auth = await getGoogleAuth(userId)
  const calendar = google.calendar({ version: 'v3', auth })

  const event = {
    summary: `Return: ${transaction.book.title}`,
    description: 'Library book due date',
    start: { date: transaction.dueDate },
    end: { date: transaction.dueDate },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 48 * 60 }, // 2 days before
        { method: 'popup', minutes: 24 * 60 }  // 1 day before
      ]
    }
  }

  return await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event
  })
}
```

**Integration Points:**
- On book checkout: Create event
- On book return: Delete event
- On renewal: Update event
- On reservation ready: Create pickup reminder event

**Error Handling:**
- Handle token expiration (refresh)
- Handle revoked permissions (graceful degradation)
- Store Google Calendar event IDs for updates/deletes

**3.4 Calendar Preferences UI** (4-6 hours)

**DESIGN SYSTEM COMPLIANCE REQUIRED**

**File:** `app/member/profile/page.tsx` - Add calendar section

**Features:**
- **Enable/Disable calendar sync** (toggle switch)
- **Choose method:**
  - iCal feed (show URL with copy button, regenerate token)
  - Google Calendar (Connect/Disconnect button)
- **Preview upcoming events** (card list)
- **Sync status indicator** (last synced timestamp)

**Design:**
- Section header with ornamental border
- Cards with shadow-soft
- Copy button with success state animation
- Literary typography throughout

**3.5 Event Management** (4-6 hours)

**Automatic Event Creation:**

**Hook into transaction service** (`lib/services/transactions.ts`):
```typescript
// After successful checkout
if (user.calendar_google_enabled) {
  await createDueDateEvent(userId, transaction)
}

// After successful return
if (user.calendar_google_enabled && transaction.google_calendar_event_id) {
  await deleteCalendarEvent(userId, transaction.google_calendar_event_id)
}

// After renewal
if (user.calendar_google_enabled && transaction.google_calendar_event_id) {
  await updateCalendarEvent(userId, transaction.google_calendar_event_id, newDueDate)
}
```

**iCal Feed Auto-Update:**
- iCal feeds are stateless - they regenerate on each fetch
- Ensure feed endpoint is performant (consider caching)

**Total Estimated Effort:** 26-35 hours
**Dependencies:** None (can run parallel with other phases)
**Risk Level:** Medium - OAuth complexity, third-party API reliability

**Fallback Strategy:** If Google Calendar fails, users can always use iCal feed with any calendar app (Apple Calendar, Outlook, etc.)

---

### Phase 4: Book Reviews/Ratings (TIER 3 - Priority: 1.2)

**Strategic Note:** Community engagement, discovery enhancement. Can run parallel with Phase 3.

#### Current State
- ❌ No review system exists
- ❌ No moderation system
- ❌ No database schema

#### Implementation Tasks

**4.1 Database Schema Design** (3-4 hours)

**Create migration for reviews tables:**

```sql
-- Main reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(book_id, user_id) -- One review per book per user
);

-- Review helpful votes
CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(review_id, user_id) -- One vote per review per user
);

-- Indexes for performance
CREATE INDEX idx_reviews_book_id ON reviews(book_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);
```

**Drizzle Schema:** Update `lib/db/schema.ts`

**4.2 API Endpoints** (8-10 hours)

**Create:** `app/api/reviews/`

**Member Endpoints:**
```typescript
POST   /api/reviews                  // Create review (auto-approve if no moderation)
PUT    /api/reviews/:id              // Edit own review
DELETE /api/reviews/:id              // Delete own review
GET    /api/books/:id/reviews        // Get book reviews (approved only)
POST   /api/reviews/:id/vote         // Vote helpful/not helpful
GET    /api/member/reviews           // Get user's reviews
```

**Admin Endpoints:** `app/api/admin/reviews/`
```typescript
GET    /api/admin/reviews            // List all reviews (with filters)
PUT    /api/admin/reviews/:id/approve
PUT    /api/admin/reviews/:id/flag
DELETE /api/admin/reviews/:id
POST   /api/admin/reviews/:id/ban-user  // Ban user from reviewing
```

**Validation:** `lib/validations/review.ts`
```typescript
const createReviewSchema = z.object({
  bookId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  reviewText: z.string().max(2000).optional()
})
```

**Business Rules:**
- Users can only review books they've borrowed (check transaction history)
- One review per book per user
- Reviews require approval if moderation is enabled (admin setting)
- Flagged reviews hidden from public view

**4.3 Moderation System** (6-8 hours)

**File:** `app/admin/reviews/page.tsx` (NEW)

**Features:**
- **Pending reviews queue** (requires approval)
- **Flagged reviews queue** (user-reported)
- **All reviews list** (filterable, searchable)
- **Filters:** Status (pending, approved, flagged), Rating, Date
- **Actions:**
  - Approve/Reject (bulk operations supported)
  - Flag/Unflag
  - Delete (with reason logged)
  - Ban user from reviewing (soft ban)
- **Analytics:**
  - Total reviews
  - Average rating across all books
  - Most reviewed books
  - Flagged review count

**Design:** Clean admin interface (data tables, minimal decorative elements)

**4.4 Review UI Components** (10-12 hours)

**DESIGN SYSTEM COMPLIANCE REQUIRED**

**Book Detail Page** (`app/member/books/[id]/page.tsx` and `app/books/[id]/page.tsx`):

**Average Rating Display:**
```tsx
// At top of book detail card
<div className="flex items-center gap-2 mb-4">
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map(star => (
      <Star
        key={star}
        className={cn(
          "w-5 h-5",
          star <= averageRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
        )}
      />
    ))}
  </div>
  <span className="text-lg font-serif font-semibold">{averageRating.toFixed(1)}</span>
  <span className="text-sm text-muted-foreground font-mono">
    ({reviewCount} reviews)
  </span>
</div>
```

**Review Submission Form:**
- Only show if user has borrowed the book
- Star rating selector (interactive)
- Textarea for review text (max 2000 chars)
- Submit button (Literary gradient style)
- Success message with fade-in animation

**Review List:**
```tsx
<div className="space-y-4 mt-8">
  <div className="ornamental-border pb-4 mb-6">
    <h3 className="text-2xl font-serif font-bold">Community Reviews</h3>
  </div>

  {/* Sort controls */}
  <div className="flex gap-2">
    <Button variant="outline" className="font-mono text-xs">Most Helpful</Button>
    <Button variant="outline" className="font-mono text-xs">Newest</Button>
    <Button variant="outline" className="font-mono text-xs">Highest Rating</Button>
    <Button variant="outline" className="font-mono text-xs">Lowest Rating</Button>
  </div>

  {/* Review cards */}
  {reviews.map(review => (
    <Card className="shadow-soft hover:shadow-lift transition-all duration-500 border-0 fade-in-up">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-serif font-semibold text-base">{review.user.name}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {formatDate(review.createdAt)}
            </p>
          </div>
          <div className="flex items-center">
            {/* Star display */}
          </div>
        </div>
        <p className="text-sm font-sans text-foreground leading-relaxed mb-4">
          {review.reviewText}
        </p>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-xs font-mono">
            <ThumbsUp className="w-3 h-3 mr-1" />
            Helpful ({review.helpfulVotes})
          </Button>
          {user?.id === review.userId && (
            <>
              <Button variant="ghost" size="sm" className="text-xs font-mono">Edit</Button>
              <Button variant="ghost" size="sm" className="text-xs font-mono text-destructive">
                Delete
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

**Member Profile** (`app/member/profile/page.tsx`):
- Add "My Reviews" section
- List of user's reviews with edit/delete actions
- Same Literary card design

**Search/Discovery Integration:**
- Add rating filter to search page (1+ stars, 3+ stars, 4+ stars)
- Show average rating on book cards

**4.5 Helpful Votes & Sorting** (4-6 hours)

**Voting Logic:**
- Prevent users from voting on their own reviews
- Prevent double-voting (track in `review_votes` table)
- Calculate helpfulness score: `helpful_votes - not_helpful_votes`

**Sorting Queries:**
```sql
-- Most helpful
SELECT * FROM reviews
WHERE is_approved = true
ORDER BY (SELECT COUNT(*) FROM review_votes WHERE review_id = reviews.id AND vote_type = 'helpful') DESC

-- Newest
ORDER BY created_at DESC

-- Highest/Lowest rating
ORDER BY rating DESC/ASC
```

**Pagination:** Implement cursor-based pagination (better performance for large datasets)

**Total Estimated Effort:** 31-40 hours
**Dependencies:** None
**Risk Level:** Low-Medium - moderation policy needed, spam prevention

**Content Moderation Considerations:**
- Define clear community guidelines
- Implement profanity filter (optional)
- Consider manual approval for first-time reviewers
- Ban repeat offenders

---

### Phase 5: AI Recommendations (TIER 3 - Priority: 1.1)

**Strategic Note:** Competitive differentiator, personalization engine. Complex implementation.

#### Current State
- ✅ Borrowing history exists (transactions table)
- ✅ Favorites schema exists
- ⚠️ Reviews will enhance recommendations (implement Phase 4 first for better results)
- ❌ No recommendation engine
- ❌ No AI integration

#### Implementation Tasks

**5.1 Research & Planning** (4-6 hours)

**Evaluation of Approaches:**

| Approach | Pros | Cons | Complexity |
|----------|------|------|------------|
| **Collaborative Filtering** | Proven, no external API costs | Cold start problem, needs user data | Medium |
| **Content-Based** | Simple, works with sparse data | Limited discovery, obvious suggestions | Low |
| **LLM-Based (Claude API)** | Contextual, natural language explanations | API costs, rate limits | Medium |
| **Hybrid** | Best results, covers weaknesses | More complex to implement | High |

**Recommendation: Hybrid Approach**

**Phase 1:** Content-based + Collaborative filtering (no API costs)
**Phase 2:** Add Claude API for personalized explanations

**5.2 Interaction Tracking** (6-8 hours)

**Database Schema:**
```sql
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL CHECK (
    interaction_type IN ('view', 'search', 'favorite', 'shelf_add', 'borrow', 'review')
  ),
  metadata JSONB, -- Store search query, shelf name, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_book_id ON user_interactions(book_id);
CREATE INDEX idx_user_interactions_type ON user_interactions(interaction_type);
```

**Tracking Middleware:**
```typescript
// lib/tracking/middleware.ts
export async function trackBookView(userId: string, bookId: string) {
  await db.insert(userInteractions).values({
    userId,
    bookId,
    interactionType: 'view'
  })
}
```

**Integration Points:**
- Book detail page view
- Search queries
- Favorite additions
- Shelf additions
- Transaction completions
- Review submissions

**Privacy:** Allow users to opt-out of tracking in preferences

**5.3 Recommendation Engine** (12-16 hours)

**File:** `lib/services/recommendations.ts`

**Algorithm 1: Content-Based Filtering**
```typescript
async function getContentBasedRecommendations(userId: string, limit = 10) {
  // Get user's borrowing history
  const history = await getUserBorrowHistory(userId)

  // Extract favorite categories and authors
  const categoryScores = calculateCategoryPreferences(history)
  const authorScores = calculateAuthorPreferences(history)

  // Find similar books user hasn't borrowed
  const recommendations = await db.query.books.findMany({
    where: and(
      notInArray(books.id, history.map(h => h.bookId)),
      or(
        inArray(books.categoryId, topCategories),
        inArray(books.authorId, topAuthors)
      )
    ),
    limit
  })

  // Score and rank
  return recommendations.map(book => ({
    book,
    score: calculateContentScore(book, categoryScores, authorScores),
    reason: generateContentReason(book, categoryScores, authorScores)
  })).sort((a, b) => b.score - a.score)
}
```

**Algorithm 2: Collaborative Filtering**
```typescript
async function getCollaborativeRecommendations(userId: string, limit = 10) {
  // Find similar users (users who borrowed similar books)
  const similarUsers = await findSimilarUsers(userId)

  // Get books borrowed by similar users that this user hasn't borrowed
  const recommendations = await db.query.transactions.findMany({
    where: and(
      inArray(transactions.userId, similarUsers.map(u => u.id)),
      notInArray(transactions.bookId, userBorrowedBookIds)
    ),
    with: { book: true },
    orderBy: desc(sql`COUNT(*)`), // Most popular among similar users
    limit
  })

  return recommendations.map(rec => ({
    book: rec.book,
    score: rec.count / similarUsers.length,
    reason: `Popular with readers who enjoyed books you've borrowed`
  }))
}

// Cosine similarity for finding similar users
function calculateUserSimilarity(user1History, user2History) {
  // Implementation: cosine similarity on user-book matrix
}
```

**Algorithm 3: Claude API Enhancement (Optional)**
```typescript
async function getAIRecommendationExplanations(userId: string, recommendations: Book[]) {
  const userProfile = await buildUserProfile(userId) // Reading history, preferences

  const prompt = `Given a library member with the following reading history:
${userProfile.recentBooks.map(b => `- ${b.title} by ${b.author} (${b.category})`).join('\n')}

Why would you recommend these books to them?
${recommendations.map((b, i) => `${i+1}. ${b.title} by ${b.author}`).join('\n')}

Provide a brief, engaging reason for each recommendation (1-2 sentences).`

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  })

  return parseRecommendationExplanations(response.content)
}
```

**Hybrid Strategy:**
```typescript
export async function getPersonalizedRecommendations(userId: string, limit = 10) {
  // Get recommendations from both algorithms
  const contentBased = await getContentBasedRecommendations(userId, limit)
  const collaborative = await getCollaborativeRecommendations(userId, limit)

  // Merge and deduplicate
  const merged = mergeRecommendations(contentBased, collaborative)

  // Optionally enhance with AI explanations (if API key configured)
  if (process.env.ANTHROPIC_API_KEY) {
    const enhanced = await getAIRecommendationExplanations(userId, merged.slice(0, 5))
    return enhanced
  }

  return merged.slice(0, limit)
}
```

**5.4 API Endpoints** (4-6 hours)

**Create:** `app/api/recommendations/`

```typescript
GET /api/recommendations/for-you        // Personalized recommendations (hybrid)
GET /api/recommendations/similar/:id    // Similar to a specific book (content-based)
GET /api/recommendations/trending       // Most borrowed this week (simple query)
POST /api/recommendations/:id/feedback  // Track click/borrow from recommendation
```

**Caching:**
- Cache recommendations per user (24-hour TTL)
- Invalidate on new borrow or review
- Use Redis for production (or in-memory for MVP)

**5.5 Recommendation Widgets** (8-10 hours)

**DESIGN SYSTEM COMPLIANCE REQUIRED**

**Member Dashboard** (`app/member/dashboard/page.tsx`):

```tsx
<section className="mt-12 fade-in-up stagger-3">
  <div className="ornamental-border pb-4 mb-6">
    <h2 className="text-3xl font-serif font-bold">Recommended for You</h2>
    <p className="text-muted-foreground mt-1 font-mono text-sm">
      Based on your reading history
    </p>
  </div>

  <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
    {recommendations.map((rec, index) => (
      <div key={rec.book.id} className="flex-shrink-0 w-56 fade-in-up"
           style={{ animationDelay: `${index * 0.1}s` }}>
        <BookCard book={rec.book} />
        <p className="mt-2 text-xs text-muted-foreground italic font-sans px-1">
          {rec.reason}
        </p>
      </div>
    ))}
  </div>
</section>
```

**Book Detail Page** (`app/member/books/[id]/page.tsx`):

```tsx
<section className="mt-12">
  <div className="ornamental-border pb-4 mb-6">
    <h3 className="text-2xl font-serif font-bold">Similar Books</h3>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {similarBooks.map(book => (
      <BookCard key={book.id} book={book} />
    ))}
  </div>
</section>
```

**Discover Page** (`app/member/discover/page.tsx`):

```tsx
// Add "Trending This Week" section
<section>
  <h3 className="text-xl font-serif font-semibold mb-4">Trending This Week</h3>
  <div className="flex space-x-6 overflow-x-auto pb-6">
    {trendingBooks.map(book => (
      <BookCard key={book.id} book={book} />
    ))}
  </div>
</section>
```

**5.6 Feedback Loop** (4-6 hours)

**Tracking:**
```typescript
// Track when user clicks a recommendation
await trackInteraction(userId, bookId, 'recommendation_click', {
  recommendationType: 'for-you',
  position: index,
  reason: rec.reason
})

// Track when recommendation leads to borrow
if (transaction.source === 'recommendation') {
  await trackInteraction(userId, bookId, 'recommendation_borrow', {
    recommendationType: transaction.recommendationType
  })
}
```

**Analytics Dashboard (Admin):**
- Recommendation click-through rate
- Recommendation → borrow conversion rate
- Most successful recommendation types
- A/B test results

**Continuous Improvement:**
- Adjust algorithm weights based on performance
- Retrain collaborative filtering model weekly
- Monitor cold start problem (new users/books)

**Total Estimated Effort:** 38-52 hours
**Dependencies:** Reviews (optional, for better recommendations)
**Risk Level:** High - algorithm complexity, AI costs, performance optimization needed

**Cost Considerations:**
- Claude API: ~$0.25 per 1000 explanations (Haiku model)
- Budget: Set monthly cap ($50-100/month for small library)
- Fallback: Use non-AI recommendations if budget exceeded

---

### Phase 6: Public Shelf Sharing (TIER 3 - Priority: 1.0)

**Strategic Note:** Social features, viral growth potential. Can run parallel with Phase 4-5.

#### Current State
- ✅ `custom_shelves` table exists (`lib/db/schema.ts`)
- ✅ `shelf_books` junction table exists
- ❌ No CRUD endpoints implemented
- ❌ No privacy settings
- ❌ No UI components

#### Implementation Tasks

**6.1 Complete CRUD Endpoints** (6-8 hours)

**Create:** `app/api/shelves/`

**Member Endpoints:**
```typescript
POST   /api/shelves              // Create shelf
GET    /api/shelves              // List user's shelves
GET    /api/shelves/:id          // Get shelf details (respects privacy)
PUT    /api/shelves/:id          // Update shelf (name, description, privacy)
DELETE /api/shelves/:id          // Delete shelf
POST   /api/shelves/:id/books    // Add book to shelf
DELETE /api/shelves/:id/books/:bookId  // Remove book from shelf
POST   /api/shelves/:id/reorder  // Reorder books (drag-and-drop)
```

**Public/Discovery Endpoints:**
```typescript
GET    /api/shelves/public       // List public shelves (paginated, filterable)
GET    /api/shelves/:id/follow   // Follow a shelf
DELETE /api/shelves/:id/follow   // Unfollow
POST   /api/shelves/:id/like     // Like a shelf
DELETE /api/shelves/:id/like     // Unlike
GET    /api/shelves/following    // Shelves user follows
```

**Validation:** `lib/validations/shelf.ts`
```typescript
const createShelfSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  visibility: z.enum(['private', 'unlisted', 'public']).default('private')
})
```

**6.2 Privacy Settings** (4-6 hours)

**Database Migration:**
```sql
ALTER TABLE custom_shelves
ADD COLUMN visibility VARCHAR(20) DEFAULT 'private'
CHECK (visibility IN ('private', 'unlisted', 'public'));

CREATE INDEX idx_custom_shelves_visibility ON custom_shelves(visibility);
```

**Privacy Logic:**
- **Private:** Only owner can see
- **Unlisted:** Anyone with link can see (not in public discovery)
- **Public:** Discoverable in explore page, search engines

**Permission Middleware:**
```typescript
async function canViewShelf(shelf, userId) {
  if (shelf.visibility === 'public') return true
  if (shelf.visibility === 'unlisted') return true // Anyone with link
  if (shelf.userId === userId) return true // Owner
  return false
}
```

**6.3 Public Shelf Discovery** (10-12 hours)

**DESIGN SYSTEM COMPLIANCE REQUIRED**

**File:** `app/explore/shelves/page.tsx` (NEW)

**Features:**

**Hero Section:**
```tsx
<section className="p-12 bg-gradient-to-br from-primary via-primary/90 to-primary/80
                    rounded-2xl shadow-dramatic relative overflow-hidden mb-8 fade-in-up">
  {/* Decorative blur elements */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

  <div className="relative z-10">
    <h1 className="text-display-md font-display text-white mb-4">
      Discover Reading Lists
    </h1>
    <p className="text-lg text-white/90 font-sans max-w-2xl">
      Explore curated book collections from our community
    </p>

    {/* Search bar */}
    <div className="mt-6 flex gap-3">
      <Input placeholder="Search shelves..." className="bg-white/20 backdrop-blur-sm" />
      <Button className="bg-accent hover:bg-accent/90">Search</Button>
    </div>
  </div>
</section>
```

**Filter Section:**
```tsx
<div className="flex gap-3 mb-6 flex-wrap">
  <Button variant={filter === 'popular' ? 'default' : 'outline'}
          className="font-mono text-xs">
    Popular
  </Button>
  <Button variant={filter === 'recent' ? 'default' : 'outline'}
          className="font-mono text-xs">
    Recent
  </Button>
  <Button variant={filter === 'most_books' ? 'default' : 'outline'}
          className="font-mono text-xs">
    Largest
  </Button>

  {/* Category filters */}
  <Select>
    <SelectTrigger className="w-40 font-mono text-xs">
      <SelectValue placeholder="Category" />
    </SelectTrigger>
    <SelectContent>
      {categories.map(cat => (
        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

**Shelf Preview Cards:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {shelves.map((shelf, index) => (
    <Link href={`/shelves/${shelf.id}`} key={shelf.id}>
      <Card className="shadow-soft hover:shadow-lift transition-all duration-500
                       border-0 group overflow-hidden relative cursor-pointer fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}>

        {/* Book cover grid (first 4 books) */}
        <div className="grid grid-cols-2 gap-2 p-4 bg-gradient-to-br from-muted/20 to-transparent">
          {shelf.books.slice(0, 4).map(book => (
            <div key={book.id} className="aspect-[3/4] bg-gradient-to-br from-primary/10
                                           via-accent/20 to-primary/5 rounded-lg
                                           flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary/40" />
            </div>
          ))}
        </div>

        <CardContent className="p-6">
          <h3 className="text-lg font-serif font-semibold group-hover:text-primary
                         transition-colors line-clamp-2 mb-2">
            {shelf.name}
          </h3>
          <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-4">
            {shelf.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>{shelf.bookCount} books</span>
            <div className="flex gap-3">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" /> {shelf.likeCount}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {shelf.followerCount}
              </span>
            </div>
          </div>

          {/* Creator */}
          <div className="mt-4 pt-4 border-t flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs font-sans">{shelf.user.name}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  ))}
</div>
```

**Pagination:**
- Infinite scroll or traditional pagination
- Load 12 shelves per page

**6.4 Following & Engagement** (6-8 hours)

**Database Schema:**
```sql
CREATE TABLE shelf_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelf_id UUID NOT NULL REFERENCES custom_shelves(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(shelf_id, user_id)
);

CREATE TABLE shelf_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelf_id UUID NOT NULL REFERENCES custom_shelves(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(shelf_id, user_id)
);

CREATE INDEX idx_shelf_follows_user_id ON shelf_follows(user_id);
CREATE INDEX idx_shelf_likes_shelf_id ON shelf_likes(shelf_id);
```

**UI Integration:**
- Follow/Unfollow button on shelf detail page
- Like button with heart icon (animate on click)
- Display follower and like counts
- "Shelves You Follow" feed on member dashboard

**6.5 Shelf Management UI** (8-10 hours)

**DESIGN SYSTEM COMPLIANCE REQUIRED**

**My Shelves Page** (`app/member/shelves/page.tsx` - NEW):

**Features:**
- **Create New Shelf button** (gradient style, prominent)
- **Grid of user's shelves:**
  - Same card design as discovery page
  - Edit and Delete buttons visible on hover
  - Privacy indicator badge
  - Drag handle for reordering
- **Empty state:** Literary design encouraging first shelf creation

**Create/Edit Shelf Modal:**
```tsx
<Dialog>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="font-serif text-2xl">
        {mode === 'create' ? 'Create New Shelf' : 'Edit Shelf'}
      </DialogTitle>
    </DialogHeader>

    <form className="space-y-4">
      <div>
        <Label className="font-sans text-sm">Shelf Name</Label>
        <Input placeholder="e.g., Summer Reading 2025" className="font-serif" />
      </div>

      <div>
        <Label className="font-sans text-sm">Description (optional)</Label>
        <Textarea placeholder="What's this shelf about?" className="font-sans" />
      </div>

      <div>
        <Label className="font-sans text-sm mb-2 block">Privacy</Label>
        <RadioGroup value={visibility} onValueChange={setVisibility}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="private" id="private" />
            <Label htmlFor="private" className="font-sans cursor-pointer">
              <div className="font-semibold">Private</div>
              <div className="text-xs text-muted-foreground">Only you can see</div>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unlisted" id="unlisted" />
            <Label htmlFor="unlisted" className="font-sans cursor-pointer">
              <div className="font-semibold">Unlisted</div>
              <div className="text-xs text-muted-foreground">Anyone with link</div>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="public" id="public" />
            <Label htmlFor="public" className="font-sans cursor-pointer">
              <div className="font-semibold">Public</div>
              <div className="text-xs text-muted-foreground">Discoverable by everyone</div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <DialogFooter>
        <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80">
          {mode === 'create' ? 'Create Shelf' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

**Book Detail Page Integration:**
- Add "Add to Shelf" dropdown button
- List user's shelves
- Create new shelf option (inline)
- Check mark for shelves that already contain this book

**Shelf Detail Page** (`app/shelves/[id]/page.tsx` - NEW):

**Public View:**
```tsx
<div className="max-w-4xl mx-auto">
  {/* Header */}
  <div className="ornamental-border pb-6 mb-8">
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-4xl font-serif font-bold mb-2">{shelf.name}</h1>
        <p className="text-muted-foreground font-sans">{shelf.description}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleFollow}>
          {isFollowing ? (
            <><Check className="mr-2 h-4 w-4" /> Following</>
          ) : (
            <><Plus className="mr-2 h-4 w-4" /> Follow</>
          )}
        </Button>
        <Button variant="outline" onClick={handleLike}>
          <Heart className={cn("mr-2 h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
          {shelf.likeCount}
        </Button>
      </div>
    </div>

    {/* Creator info */}
    <div className="mt-4 flex items-center gap-2">
      <User className="w-5 h-5 text-muted-foreground" />
      <span className="text-sm font-sans">
        Created by <Link href={`/users/${shelf.user.id}`} className="text-primary hover:underline">
          {shelf.user.name}
        </Link>
      </span>
      <span className="text-xs text-muted-foreground font-mono">
        • {shelf.bookCount} books • {shelf.followerCount} followers
      </span>
    </div>
  </div>

  {/* Book grid */}
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
    {shelf.books.map((book, index) => (
      <div key={book.id} className="fade-in-up"
           style={{ animationDelay: `${index * 0.05}s` }}>
        <BookCard book={book} compact />
      </div>
    ))}
  </div>
</div>
```

**Owner View (additional features):**
- Drag-and-drop to reorder books
- Remove book button on each card
- Edit shelf button
- Delete shelf button (with confirmation)

**6.6 Sharing Features** (6-8 hours)

**Shareable URLs:**
- Format: `/shelves/:id/:slug`
- Slug generated from shelf name (SEO-friendly)
- Example: `/shelves/abc123/summer-reading-2025`

**Open Graph Meta Tags:**
```tsx
// app/shelves/[id]/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const shelf = await getShelf(params.id)

  return {
    title: `${shelf.name} - Reading List`,
    description: shelf.description || `A curated reading list by ${shelf.user.name}`,
    openGraph: {
      title: shelf.name,
      description: shelf.description,
      images: [
        {
          url: `/api/og/shelf/${shelf.id}`, // Generate OG image
          width: 1200,
          height: 630
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: shelf.name,
      description: shelf.description
    }
  }
}
```

**Share Buttons:**
```tsx
<div className="flex gap-2 mt-6">
  <Button variant="outline" size="sm" onClick={copyLink} className="font-mono text-xs">
    {copied ? (
      <><Check className="mr-2 h-3 w-3" /> Copied!</>
    ) : (
      <><Link2 className="mr-2 h-3 w-3" /> Copy Link</>
    )}
  </Button>

  <Button variant="outline" size="sm" asChild className="font-mono text-xs">
    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`}
       target="_blank" rel="noopener noreferrer">
      <Twitter className="mr-2 h-3 w-3" /> Tweet
    </a>
  </Button>

  <Button variant="outline" size="sm" asChild className="font-mono text-xs">
    <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
       target="_blank" rel="noopener noreferrer">
      <Facebook className="mr-2 h-3 w-3" /> Share
    </a>
  </Button>

  <Button variant="outline" size="sm" onClick={generateQR} className="font-mono text-xs">
    <QrCode className="mr-2 h-3 w-3" /> QR Code
  </Button>
</div>
```

**QR Code for Library Events:**
- Generate QR code for shelf URL
- Print for library displays, book clubs, etc.
- Scan → instant access to curated list

**Total Estimated Effort:** 40-52 hours
**Dependencies:** None
**Risk Level:** Low-Medium - moderation for public content, spam prevention

**Content Moderation:**
- Flag inappropriate shelf names/descriptions
- Admin review queue for flagged content
- Ban repeat offenders

---

## Implementation Timeline

### Recommended Sequence (Updated)

**Recommended: Complete TIER 1 Quick Wins First** (2-4 weeks)
Before starting this plan, consider implementing:
- ✅ Dark Mode (1-2 days) - 90% complete
- Due Date Notifications (3 days) - Shares infrastructure with Phase 2
- Borrowing Limits Warning (1 day) - Quick win
- Advanced Search Filters (2-3 days) - Enhance existing search

**Sprint 1-2 (Week 1-4): Reservation Flow** (TIER 2)
- Phase 1: Book Reservations/Holds (25-34 hours)
- Phase 2: Availability Notifications (31-42 hours)
- **Combined:** 56-76 hours (1.5-2 months at 40hrs/week)
- **Deliverable:** Complete self-service reservation system with notifications

**Sprint 3 (Week 5-6): Calendar Integration** (TIER 2)
- Phase 3: Calendar Integration (26-35 hours)
- **Can run in parallel with Sprint 1-2**
- **Deliverable:** iCal feeds + Google Calendar sync for due dates

**Sprint 4 (Week 7-9): Community Features** (TIER 3)
- Phase 4: Book Reviews/Ratings (31-40 hours)
- **Deliverable:** Community-driven book discovery

**Sprint 5 (Week 10-13): Intelligence Layer** (TIER 3)
- Phase 5: AI Recommendations (38-52 hours)
- **Deliverable:** Personalized book recommendations

**Sprint 6 (Week 14-16): Social Features** (TIER 3)
- Phase 6: Public Shelf Sharing (40-52 hours)
- **Can run in parallel with Sprint 5**
- **Deliverable:** Public reading lists, viral growth potential

**Total Estimated Effort (This Plan):** 191-255 hours
**With TIER 1 Quick Wins:** 215-285 hours total
**Timeline:** 5-7 months at 40hrs/week (or 3-4 months with parallel development + team)

### Parallel Execution Opportunities

To accelerate delivery:
- **Phase 3** (Calendar) can run parallel with Phase 1-2
- **Phase 4** (Reviews) can run parallel with Phase 3
- **Phase 6** (Shelves) can run parallel with Phase 4-5

**Aggressive Timeline:** 3-4 months with 2 developers working in parallel

---

## Risk Assessment

### High Risk Items
1. **AI Recommendations** (Phase 5)
   - Risk: Algorithm complexity, Claude API costs
   - Mitigation: Start with non-AI algorithms, add Claude for explanations only, set monthly budget cap

2. **Google Calendar OAuth** (Phase 3)
   - Risk: OAuth complexity, token management, user confusion
   - Mitigation: Provide iCal fallback, clear documentation, graceful error handling

3. **Email Deliverability** (Phase 2)
   - Risk: Spam filters, bounce rates, unsubscribes
   - Mitigation: Use Resend (high reputation), verify domain, respect notification preferences

4. **Background Job Reliability** (Phase 2)
   - Risk: Vercel Cron failures, missed notifications
   - Mitigation: Comprehensive logging, admin alerts, retry logic, idempotency

### Medium Risk Items
1. **Content Moderation** (Phases 4 & 6)
   - Risk: Spam, inappropriate content
   - Mitigation: Manual approval queue, profanity filters, user reporting, ban system

2. **Performance** (Phase 5)
   - Risk: Slow recommendation queries, database load
   - Mitigation: Caching, database indexes, pagination, query optimization

### Mitigation Strategies
1. **Feature Flags:** Implement all features behind flags for gradual rollout
2. **Monitoring:** Set up error tracking (Sentry), performance monitoring (Vercel Analytics)
3. **Testing:** E2E tests for critical flows, load testing for high-traffic features
4. **Rollback Plan:** Ability to disable features quickly if issues arise
5. **Beta Testing:** Soft launch with subset of users before public release

---

## Success Metrics

### Phase 1-2: Reservations + Notifications
- **Reservation adoption:** % of searches resulting in holds (target: 15-20%)
- **Reservation conversion:** % of holds leading to borrows (target: 70%+)
- **Average wait time:** Days in queue (benchmark and reduce)
- **Email engagement:** Open rate (target: 40%+), click-through rate (target: 20%+)
- **Fine reduction:** % decrease in overdue books (target: 50% reduction)

### Phase 3: Calendar Integration
- **Adoption rate:** % of users enabling calendar sync (target: 25-30%)
- **Method preference:** iCal vs. Google Calendar usage split
- **Impact:** Reduction in overdue returns (target: 30% reduction)

### Phase 4: Reviews
- **Submission rate:** % of borrowers leaving reviews (target: 10-15%)
- **Average reviews per book:** Benchmark and grow
- **Helpfulness ratio:** % of reviews marked helpful (quality indicator)
- **Discovery impact:** % of borrows influenced by reviews

### Phase 5: AI Recommendations
- **Click-through rate:** % of users clicking recommendations (target: 30%+)
- **Conversion rate:** % of clicks leading to borrows (target: 15-20%)
- **User satisfaction:** Survey rating (target: 4+/5)
- **Algorithm performance:** Precision @ 10 (target: 20%+)

### Phase 6: Shelf Sharing
- **Creation rate:** Public shelves created per week
- **Engagement:** Average followers/likes per shelf
- **Viral coefficient:** Shares leading to new user signups
- **Community activity:** % of members creating shelves

---

## Technical Considerations

### Performance Optimization
- **Database Indexes:** Create indexes for all foreign keys, frequently queried fields
- **Query Optimization:** Use `explain analyze` to optimize slow queries
- **Pagination:** Cursor-based pagination for large datasets
- **Caching Strategy:**
  - React Query for client-side caching (5-minute stale time)
  - Redis for server-side caching (recommendations, feed data)
  - CDN caching for public pages (shelves, discover)
- **Image Optimization:** Next.js Image component, WebP format, lazy loading

### Security Best Practices
- **Rate Limiting:** Implement on all public endpoints (100 req/min per IP)
- **Input Validation:** Zod schemas for all API endpoints
- **Output Sanitization:** DOMPurify for user-generated content (reviews, shelf descriptions)
- **CSRF Protection:** Built-in with Next.js form actions
- **Email Verification:** Prevent spam signups, verify before sending notifications
- **SQL Injection:** Drizzle ORM provides protection, but validate all dynamic queries

### Testing Strategy
- **Unit Tests:** Business logic (queue management, fine calculation, recommendations)
- **Integration Tests:** API endpoints (Jest + Supertest)
- **E2E Tests:** Critical flows (Playwright or Cypress)
  - Reserve → Notify → Pickup flow
  - Book checkout → Renewal → Return
  - Review submission → Moderation → Display
- **Load Testing:** Recommendation engine, email sending (Artillery or k6)
- **Manual Testing:** UI/UX, accessibility, mobile responsiveness

### Monitoring & Observability
- **Error Tracking:** Sentry for runtime errors
- **Performance Monitoring:** Vercel Analytics for page load times
- **API Monitoring:** Track response times, error rates per endpoint
- **Email Deliverability:** Monitor bounce rates, spam reports, unsubscribes
- **Background Jobs:** Log all executions, alert on failures
- **Recommendation Quality:** Track precision, recall, diversity metrics

### Accessibility Compliance
All UI implementations must meet **WCAG AA** standards:
- Minimum 4.5:1 color contrast ratio
- Keyboard navigation support (tab order, focus states)
- Screen reader compatibility (semantic HTML, ARIA labels)
- Touch target size: minimum 48x48px
- Form validation: clear error messages
- Skip links for navigation

**Testing:** Use axe DevTools during development

---

## Design System Compliance Checklist

Before marking any UI task as complete, verify:

- [ ] **Typography:** Correct font families (Crimson Pro, Archivo, JetBrains Mono)
- [ ] **Shadows:** Using `shadow-soft` and `shadow-lift` (not Tailwind defaults)
- [ ] **Animations:** `fade-in-up` with stagger delays for lists
- [ ] **Colors:** Using CSS variables (`bg-primary`, `bg-accent`, etc.)
- [ ] **Cards:** Gradient accents, proper padding (p-6 or p-8)
- [ ] **Buttons:** Gradient backgrounds for primary actions
- [ ] **Spacing:** Generous padding and breathing room
- [ ] **Icons:** Consistent sizing, Literary style
- [ ] **Empty States:** Decorative design with ornamental elements
- [ ] **Loading States:** Spinner with Literary aesthetics
- [ ] **Responsive:** Mobile-first, breakpoints tested
- [ ] **Accessibility:** WCAG AA compliant

**Reference:** Copy-paste patterns from `DESIGN_QUICK_REFERENCE.md`

---

## Next Steps

### Before Starting Implementation

1. **Stakeholder Review**
   - Review this plan with library director and key stakeholders
   - Validate feature priorities against user feedback
   - Approve budget for external services (Resend, Claude API)
   - Set timeline expectations

2. **Service Setup**
   - Create Resend account, verify domain
   - (Optional) Create Anthropic account for AI recommendations
   - Set up error tracking (Sentry)
   - Configure environment variables

3. **Project Management**
   - Create GitHub Project board or Linear workspace
   - Break down phases into tickets
   - Assign sprint milestones
   - Set up weekly progress reviews

4. **Quick Wins First (Recommended)**
   - Complete TIER 1 features before starting this plan
   - Builds momentum, delivers immediate value
   - Shares infrastructure (notifications) with Phase 2

### During Implementation

- **Weekly Reviews:** Track progress, adjust estimates
- **Design Reviews:** Ensure Literary Modernism compliance
- **Code Reviews:** Peer review for quality, security
- **User Testing:** Beta test with subset of members
- **Iterate:** Gather feedback, refine features

### After Completion

- **Analytics Review:** Measure success metrics monthly
- **User Feedback:** Surveys, interviews, support tickets
- **Performance Optimization:** Address bottlenecks
- **Documentation:** Update user guides, API docs
- **Celebrate:** Recognize team achievements!

---

## Questions for Stakeholder Review

1. **Timeline:** Is the 5-7 month timeline acceptable? Should we prioritize differently?
2. **Budget:** What's the monthly budget for external services?
   - Resend (email): ~$20-50/month
   - Claude API (recommendations): ~$50-100/month (optional)
   - Total: ~$70-150/month
3. **Scope:** Should any TIER 3 features be deferred to focus on TIER 1 & 2?
4. **Resources:** Do we have development capacity? Consider hiring or outsourcing?
5. **Beta Testing:** Do we want soft launches with selected members before public release?
6. **Feature Flags:** Should we implement all features behind flags for gradual rollout?
7. **Content Moderation:** What's our policy for reviews and public shelves? Manual approval or trust-based?
8. **Data Privacy:** Are users comfortable with interaction tracking for recommendations? Need opt-out?
9. **Success Metrics:** What KPIs matter most? Fine reduction? User engagement? Borrow rates?
10. **Long-Term Vision:** After these 6 features, what's next? Mobile app? AI chatbot? Book clubs?

---

**Document Version:** 2.0
**Last Updated:** November 16, 2025
**Status:** Aligned with Literary Modernism & JTBD Framework

**Cross-References:**
- Design implementation: `DESIGN_QUICK_REFERENCE.md`
- Prioritization logic: `JTBD_IMPACT_MATRIX.md`
- Current codebase state: `CODEBASE_OVERVIEW.md`
- Design system spec: `DESIGN_AESTHETIC.md`
