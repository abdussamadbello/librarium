# Librarium Feature Implementation Plan

## Overview

This document outlines the implementation plan for 6 major features, prioritized by impact score and strategic dependencies.

## Priority Matrix

| Feature | Score | Rationale |
|---------|-------|-----------|
| **Availability Notifications** | 2.0 | Completes reservation flow, high engagement driver |
| **Book Reservations/Holds** | 1.8 | Critical for busy libraries, prevents member frustration |
| **Calendar Integration** | 1.8 | Syncs with user habits, reduces cognitive load |
| **Book Reviews/Ratings** | 1.2 | Community building, discovery enhancement |
| **AI Recommendations** | 1.1 | Competitive differentiator, complex to implement |
| **Public Shelf Sharing** | 1.0 | Social features, viral potential |

## Implementation Phases

### Phase 1: Book Reservations/Holds (Priority: 1.8)
**Strategic Note:** Building this first enables Phase 2 (Notifications)

#### Current State
- ✅ Database schema exists (`reservations` table)
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
- Create indexes for performance (`book_id`, `user_id`, `status`)

**1.2 API Endpoints** (6-8 hours)
```typescript
POST   /api/reservations              // Create reservation
GET    /api/reservations              // List user's reservations
GET    /api/reservations/:id          // Get single reservation
DELETE /api/reservations/:id          // Cancel reservation
POST   /api/reservations/:id/fulfill  // Admin: Mark as ready for pickup
GET    /api/books/:id/availability    // Check if book is available or reserved
```

**1.3 Queue Management Logic** (8-10 hours)
- Implement FIFO queue system
- Auto-assign book to next in queue when returned
- Set 48-hour hold period when book becomes available
- Auto-cancel if not picked up within hold period
- Update queue positions automatically

**1.4 Member App UI** (6-8 hours)
- Book detail page: "Reserve This Book" button
- Reservations page: Active holds, queue position, estimated availability
- Cancel reservation functionality
- Visual indicators for ready-to-pickup vs. in-queue

**1.5 Admin Portal UI** (4-6 hours)
- View all active reservations
- Manual assignment/fulfillment
- Override queue order if needed
- Reservation analytics (most reserved books)

**Total Estimated Effort:** 25-34 hours
**Dependencies:** None
**Risk Level:** Low - straightforward CRUD with business logic

---

### Phase 2: Availability Notifications (Priority: 2.0)
**Strategic Note:** Completes the reservation user experience

#### Current State
- ❌ No email service integration
- ✅ Notifications table exists in database
- ❌ No notification preferences system
- ❌ No background job scheduling

#### Implementation Tasks

**2.1 Email Service Setup** (3-4 hours)
- Install and configure Resend
- Create email templates:
  - Book available for pickup
  - Reservation about to expire (24hr reminder)
  - Fine payment reminder
  - Due date approaching (2 days before)
- Set up email branding (logo, colors, footer)

**2.2 Notification Preferences** (4-6 hours)
- Create `notification_preferences` table:
  - `user_id`, `email_enabled`, `in_app_enabled`
  - Granular preferences (availability, due_dates, fines, etc.)
- Build API endpoints for preferences management
- Add preferences UI to Member App settings

**2.3 Email Notification Implementation** (6-8 hours)
- Integrate with reservation system
- Send email when:
  - Book becomes available
  - 24 hours before hold expires
  - Book is due in 2 days
  - Fine is assessed
- Implement email delivery tracking

**2.4 In-App Notifications** (8-10 hours)
- Create real-time notification system
- Add notification bell icon to header
- Build notification center UI
- Mark as read functionality
- Link notifications to relevant pages

**2.5 Background Jobs** (6-8 hours)
- Set up Vercel Cron jobs:
  - Check expired reservations (hourly)
  - Send due date reminders (daily at 9 AM)
  - Process hold expirations (every 6 hours)
- Implement job logging and error handling

**2.6 Notification Center UI** (4-6 hours)
- Notification dropdown component
- Notification history page
- Filter by type (reservations, due dates, fines)
- Delete/clear all functionality

**Total Estimated Effort:** 31-42 hours
**Dependencies:** Requires Phase 1 (Reservations)
**Risk Level:** Medium - external service dependencies, cron job reliability

---

### Phase 3: Calendar Integration (Priority: 1.8)
**Strategic Note:** Reduces friction, syncs with user workflows

#### Current State
- ❌ No calendar integration exists
- ❌ No iCal feed generation
- ❌ No Google Calendar OAuth setup

#### Implementation Tasks

**3.1 Research & Planning** (2-3 hours)
- Evaluate options:
  - **iCal feeds:** Simple, works with all calendar apps, read-only
  - **Google Calendar API:** Rich integration, requires OAuth, bi-directional
  - **Both:** Best user experience
- Choose approach: **Recommendation: Both**

**3.2 iCal Feed Generation** (6-8 hours)
- Install `ical-generator` package
- Create endpoint: `GET /api/calendar/feed/:token`
- Generate unique, secure tokens per user
- Include events:
  - Book due dates
  - Reservation pickup dates
  - Fine due dates
- Auto-update when events change

**3.3 Google Calendar Integration** (10-12 hours)
- Set up Google OAuth in NextAuth
- Request Calendar API permissions
- Implement event creation on:
  - Book checkout → Due date event
  - Reservation ready → Pickup reminder
- Implement event updates/deletions
- Handle sync failures gracefully

**3.4 Calendar Preferences UI** (4-6 hours)
- Settings page section for calendar
- Enable/disable calendar sync
- Choose sync method (iCal, Google, both)
- Display iCal feed URL with copy button
- "Connect Google Calendar" button
- Preview upcoming calendar events

**3.5 Event Management** (4-6 hours)
- Auto-create calendar events on checkout
- Auto-update events when book returned
- Auto-delete events on return
- Handle edge cases (renewals, lost books)

**Total Estimated Effort:** 26-35 hours
**Dependencies:** None (can run parallel with other phases)
**Risk Level:** Medium - OAuth complexity, third-party API reliability

---

### Phase 4: Book Reviews/Ratings (Priority: 1.2)
**Strategic Note:** Community engagement, discovery enhancement

#### Current State
- ❌ No review system exists
- ❌ No moderation system
- ❌ No database schema

#### Implementation Tasks

**4.1 Database Schema Design** (3-4 hours)
```sql
-- Reviews table
CREATE TABLE reviews (
  id, book_id, user_id, rating (1-5), review_text,
  is_approved, created_at, updated_at
)

-- Review helpful votes
CREATE TABLE review_votes (
  id, review_id, user_id, vote_type (helpful/not_helpful)
)
```

**4.2 API Endpoints** (8-10 hours)
```typescript
POST   /api/reviews                  // Create review
PUT    /api/reviews/:id              // Edit own review
DELETE /api/reviews/:id              // Delete own review
GET    /api/books/:id/reviews        // Get book reviews
POST   /api/reviews/:id/vote         // Vote helpful/not helpful

// Admin endpoints
PUT    /api/admin/reviews/:id/approve
PUT    /api/admin/reviews/:id/flag
DELETE /api/admin/reviews/:id
```

**4.3 Moderation System** (6-8 hours)
- Admin dashboard for review moderation
- Approve/reject pending reviews
- Flag inappropriate content
- Ban users from reviewing (abuse prevention)
- View flagged reviews queue

**4.4 Review UI Components** (10-12 hours)
- Book detail page:
  - Average rating display (stars)
  - Review submission form
  - Review list with pagination
  - Sort by: Most helpful, Newest, Highest/Lowest rating
- Member profile:
  - My reviews section
  - Edit/delete own reviews
- Rating filter on book search

**4.5 Helpful Votes & Sorting** (4-6 hours)
- Implement helpful/not helpful voting
- Calculate helpfulness score
- Sort reviews by helpfulness
- Prevent double-voting
- Display vote counts

**Total Estimated Effort:** 31-40 hours
**Dependencies:** None
**Risk Level:** Low-Medium - moderation policy needed, spam prevention

---

### Phase 5: AI Recommendations (Priority: 1.1)
**Strategic Note:** Competitive differentiator, personalization engine

#### Current State
- ✅ Borrowing history exists (transactions table)
- ✅ Favorites schema exists
- ❌ No recommendation engine
- ❌ No AI integration

#### Implementation Tasks

**5.1 Research & Planning** (4-6 hours)
- Evaluate approaches:
  - **Collaborative filtering:** "Users like you also borrowed..."
  - **Content-based:** Genre, author, category similarity
  - **LLM-based:** Use Claude API for contextual recommendations
- **Recommendation: Hybrid approach**
  - Start with content-based + collaborative
  - Add Claude API for "Why we recommend this"

**5.2 Interaction Tracking** (6-8 hours)
- Enhance tracking of:
  - Books browsed (view count)
  - Search queries
  - Favorite additions
  - Shelf additions
  - Completed borrows
- Create `user_interactions` table
- Build tracking middleware

**5.3 Recommendation Engine** (12-16 hours)
- **Algorithm 1: Content-based**
  - Match by category, author, genre
  - Weight by user's borrowing history
- **Algorithm 2: Collaborative filtering**
  - "Users who borrowed X also borrowed Y"
  - Use cosine similarity on user-book matrix
- **Algorithm 3: Claude API enhancement**
  - Generate personalized explanations
  - Context-aware suggestions based on reading patterns

**5.4 API Endpoints** (4-6 hours)
```typescript
GET /api/recommendations/for-you        // Personalized recommendations
GET /api/recommendations/similar/:id    // Similar to this book
GET /api/recommendations/trending       // Popular this week
POST /api/recommendations/:id/feedback  // Track clicks/borrows
```

**5.5 Recommendation Widgets** (8-10 hours)
- Member App homepage:
  - "Recommended for You" carousel
  - "Because you borrowed..." section
- Book detail page:
  - "Similar Books" section
- Search results:
  - "You might also like..." suggestions

**5.6 Feedback Loop** (4-6 hours)
- Track recommendation impressions
- Track recommendation clicks
- Track recommendation → borrow conversion
- Use data to improve algorithm weights
- A/B test different recommendation strategies

**Total Estimated Effort:** 38-52 hours
**Dependencies:** Reviews (optional, for better recommendations)
**Risk Level:** High - algorithm complexity, AI costs, performance optimization needed

---

### Phase 6: Public Shelf Sharing (Priority: 1.0)
**Strategic Note:** Social features, viral growth potential

#### Current State
- ✅ `custom_shelves` table exists
- ✅ `shelf_books` junction table exists
- ❌ No endpoints implemented
- ❌ No privacy settings
- ❌ No UI components

#### Implementation Tasks

**6.1 Complete CRUD Endpoints** (6-8 hours)
```typescript
POST   /api/shelves              // Create shelf
GET    /api/shelves              // List user's shelves
GET    /api/shelves/:id          // Get shelf details
PUT    /api/shelves/:id          // Update shelf
DELETE /api/shelves/:id          // Delete shelf
POST   /api/shelves/:id/books    // Add book to shelf
DELETE /api/shelves/:id/books/:bookId  // Remove book
```

**6.2 Privacy Settings** (4-6 hours)
- Add `visibility` field to `custom_shelves`:
  - `private` - Only owner can see
  - `unlisted` - Anyone with link can see
  - `public` - Discoverable in explore page
- Implement permission checks in API
- Add privacy toggle in UI

**6.3 Public Shelf Discovery** (10-12 hours)
- Create `/explore/shelves` page
- Features:
  - Browse public shelves
  - Search by name, description, creator
  - Filter by category/genre
  - Sort by: Popular, Recent, Most books
- Shelf preview cards with cover grid

**6.4 Following & Engagement** (6-8 hours)
- Create `shelf_follows` table
- Create `shelf_likes` table
- Implement follow/unfollow endpoints
- Implement like/unlike endpoints
- Display follower/like counts
- "Shelves You Follow" feed

**6.5 Shelf Management UI** (8-10 hours)
- My Shelves page:
  - Create new shelf modal
  - Edit shelf (name, description, privacy)
  - Delete shelf
  - Drag-and-drop book reordering
- Book detail page:
  - "Add to Shelf" dropdown
- Shelf detail page:
  - Public view of shelf
  - Book grid with covers
  - Shelf description and stats

**6.6 Sharing Features** (6-8 hours)
- Generate shareable URLs (`/shelf/:id/:slug`)
- Open Graph meta tags for social previews
- Copy link button
- Share to Twitter/Facebook buttons
- Embed code for external sites (optional)
- QR code for shelf (for library events)

**Total Estimated Effort:** 40-52 hours
**Dependencies:** None
**Risk Level:** Low-Medium - moderation for public content, spam prevention

---

## Implementation Timeline

### Recommended Sequence

**Sprint 1 (Week 1-2): Foundation**
- Phase 1: Book Reservations/Holds
- Estimated: 25-34 hours

**Sprint 2 (Week 3-4): Engagement**
- Phase 2: Availability Notifications
- Estimated: 31-42 hours

**Sprint 3 (Week 5-6): Convenience**
- Phase 3: Calendar Integration
- Estimated: 26-35 hours

**Sprint 4 (Week 7-8): Community**
- Phase 4: Book Reviews/Ratings
- Estimated: 31-40 hours

**Sprint 5 (Week 9-11): Intelligence**
- Phase 5: AI Recommendations
- Estimated: 38-52 hours

**Sprint 6 (Week 12-14): Social**
- Phase 6: Public Shelf Sharing
- Estimated: 40-52 hours

**Total Estimated Effort:** 191-255 hours (5-6 months at 40hrs/week)

### Parallel Execution Opportunities

These phases can run in parallel to accelerate delivery:
- Phase 3 (Calendar) can run parallel with Phase 1-2
- Phase 4 (Reviews) can run parallel with Phase 3
- Phase 6 (Shelves) can run parallel with Phase 4-5

**Aggressive Timeline:** 3-4 months with parallel development

---

## Risk Assessment

### High Risk Items
1. **AI Recommendations** - Algorithm complexity, API costs
2. **Google Calendar OAuth** - Third-party dependency
3. **Email Delivery** - Spam filters, deliverability

### Mitigation Strategies
1. Start with simple collaborative filtering, iterate
2. Provide iCal fallback if Google fails
3. Use reputable service (Resend), warm up domain
4. Implement comprehensive error logging
5. Feature flags for gradual rollout

---

## Success Metrics

### Phase 1-2: Reservations + Notifications
- Reservation conversion rate (reserved → borrowed)
- Average wait time in queue
- Email open rates
- Notification click-through rates

### Phase 3: Calendar Integration
- Adoption rate (% users with calendar sync)
- Reduction in overdue returns

### Phase 4: Reviews
- Review submission rate
- Average reviews per book
- Review helpfulness ratio

### Phase 5: AI Recommendations
- Click-through rate on recommendations
- Borrow conversion from recommendations
- User satisfaction (survey)

### Phase 6: Shelf Sharing
- Public shelf creation rate
- Shelf follows/likes
- Social sharing clicks

---

## Technical Considerations

### Performance
- Index all foreign keys in new tables
- Implement pagination for all list endpoints
- Use React Query for caching
- Consider Redis for recommendation caching

### Security
- Rate limiting on all public endpoints
- Input validation with Zod
- Sanitize user-generated content (reviews, shelf descriptions)
- CSRF protection on all mutations
- Email verification for notifications

### Testing
- Unit tests for business logic (queue management, recommendations)
- Integration tests for API endpoints
- E2E tests for critical flows (reserve → notify → pickup)
- Load testing for recommendation engine

### Monitoring
- Track API response times
- Monitor email delivery rates
- Alert on background job failures
- Track recommendation accuracy metrics

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Approve budget** and timeline
3. **Set up project tracking** (GitHub Projects, Linear, etc.)
4. **Begin Phase 1** implementation
5. **Weekly progress reviews** and adjustments

---

## Questions for Stakeholder Review

1. Is the 3-6 month timeline acceptable?
2. Should any features be descoped to accelerate delivery?
3. What's the budget for external services (Resend, Claude API)?
4. Do we need beta testing phases between features?
5. Should we implement feature flags for gradual rollout?
6. What are the KPIs for measuring success?

---

**Document Version:** 1.0
**Last Updated:** 2025-11-16
**Status:** Ready for Review
