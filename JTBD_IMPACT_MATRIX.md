# JTBD Impact Matrix - Librarium Member Features

**Date:** November 15, 2025  
**Purpose:** Prioritize feature development based on Jobs-to-be-Done framework  
**Methodology:** Impact (user value) × Effort (dev complexity) = Priority Score

---

## Scoring System

### Impact Score (1-10)
- **1-3:** Nice to have, minimal user value
- **4-6:** Moderate value, improves specific workflows
- **7-8:** High value, solves major pain points
- **9-10:** Critical, transforms user experience

### Effort Score (1-10)
- **1-2:** < 1 day (simple UI, basic API)
- **3-4:** 2-3 days (moderate logic, database changes)
- **5-6:** 1 week (complex features, integrations)
- **7-8:** 2-3 weeks (major systems, third-party APIs)
- **9-10:** 1+ month (platform changes, infrastructure)

### Priority Score
**Formula:** `Priority = Impact / Effort`
- **High Priority:** > 2.0 (quick wins, high ROI)
- **Medium Priority:** 1.0 - 2.0 (balanced value)
- **Low Priority:** < 1.0 (expensive features)

---

## Feature Prioritization Matrix

| # | Feature | JTBD | Persona | Impact | Effort | Priority | Status |
|---|---------|------|---------|--------|--------|----------|--------|
| 1 | **Due Date Notifications** | "Remind me before books are overdue so I avoid fines" | All | 9 | 3 | **3.0** | ❌ Not Started |
| 2 | **Book Reservations/Holds** | "Let me reserve books that are checked out" | Student, Casual | 9 | 5 | **1.8** | ❌ Not Started |
| 3 | **Reading History Export** | "Let me export my borrowing history for citations" | Student | 7 | 2 | **3.5** | ❌ Not Started |
| 4 | **Renew Books** | "Extend my borrowing period without visiting the library" | All | 8 | 3 | **2.7** | ⚠️ UI exists, API missing |
| 5 | **Custom Shelves** | "Organize books for different purposes (research, fun, etc.)" | All | 7 | 6 | **1.2** | ❌ Not Started |
| 6 | **Advanced Search Filters** | "Find books by multiple criteria (genre + year + author)" | Student, Researcher | 8 | 3 | **2.7** | ⚠️ Basic search exists |
| 7 | **Availability Notifications** | "Notify me when a reserved book becomes available" | All | 8 | 4 | **2.0** | ❌ Not Started |
| 8 | **Reading Analytics** | "Show me my reading patterns and achievements" | Casual, Parent | 6 | 4 | **1.5** | ❌ Not Started |
| 9 | **Book Recommendations (AI)** | "Suggest books based on my history and preferences" | Casual | 9 | 8 | **1.1** | ❌ Not Started |
| 9a | **AI Book Chat Assistant** | "Chat with an AI to discover books based on my interests" | All | 9 | 8 | **1.1** | ✅ Implemented |
| 10 | **QR Code Member Card** | "Access my library card instantly on my phone" | All | 10 | 2 | **5.0** | ✅ Implemented |
| 11 | **Family Account Linking** | "Manage multiple family member cards in one view" | Parent | 7 | 7 | **1.0** | ❌ Not Started |
| 12 | **Public Shelf Sharing** | "Share my reading lists with friends/community" | Casual | 5 | 5 | **1.0** | ❌ Not Started |
| 13 | **Mobile App (PWA)** | "Access the library on my phone like a native app" | All | 8 | 6 | **1.3** | ⚠️ Web responsive exists |
| 14 | **Online Fine Payment** | "Pay fines without visiting the library" | All | 9 | 6 | **1.5** | ❌ Not Started |
| 15 | **Book Reviews/Ratings** | "See what others think before borrowing" | Casual | 6 | 5 | **1.2** | ❌ Not Started |
| 16 | **Calendar Integration** | "Add due dates to my Google/Apple calendar" | Student, Parent | 7 | 4 | **1.8** | ❌ Not Started |
| 17 | **Dark Mode** | "Read comfortably at night without eye strain" | All | 5 | 2 | **2.5** | ⚠️ CSS vars ready, toggle needed |
| 18 | **Accessibility (Screen Reader)** | "Navigate the app with assistive technology" | All | 8 | 5 | **1.6** | ⚠️ Partial (semantic HTML) |
| 19 | **Borrowing Limits Warning** | "Warn me when I'm near my borrowing limit" | All | 6 | 2 | **3.0** | ❌ Not Started |
| 20 | **Multi-language Support** | "Use the app in my preferred language" | All | 6 | 8 | **0.8** | ❌ Not Started |
| 21 | **Enhanced UI/UX Design** | "Use a beautiful, memorable app that feels premium" | All | 9 | 3 | **3.0** | ✅ Implemented (Literary Modernism) |

---

## Priority Tiers & Recommended Roadmap

### 🔥 **TIER 1: Quick Wins (Priority > 2.5)**
*High impact, low effort - Ship in next 2-4 weeks*

| Feature | Priority | Reasoning |
|---------|----------|-----------|
| **QR Code Member Card** | 5.0 | ✅ Already implemented - maintain & optimize |
| **Reading History Export** | 3.5 | Simple CSV/PDF export, huge value for students |
| **Due Date Notifications** | 3.0 | Email/SMS service integration, prevents 80% of fines |
| **Enhanced UI/UX Design** | 3.0 | ✅ Implemented - Literary Modernism aesthetic complete |
| **Borrowing Limits Warning** | 3.0 | Simple UI banner, prevents frustration |
| **Renew Books** | 2.7 | Complete existing feature, reduces library traffic |
| **Advanced Search Filters** | 2.7 | Enhance existing search, improves findability |
| **Dark Mode** | 2.5 | CSS vars ready, add toggle switch |

**Impact:** Reduces fines by ~70%, increases member satisfaction, positions app as modern & user-friendly, creates **memorable brand experience** with distinctive visual identity

---

### ⚡ **TIER 2: High Value (Priority 1.5-2.5)**
*Balanced impact & effort - Ship in 4-8 weeks*

| Feature | Priority | Reasoning |
|---------|----------|-----------|
| **Availability Notifications** | 2.0 | Completes reservation flow, high engagement driver |
| **Book Reservations/Holds** | 1.8 | Critical for busy libraries, prevents member frustration |
| **Calendar Integration** | 1.8 | Syncs with user habits, reduces cognitive load |
| **Accessibility Enhancements** | 1.6 | Legal compliance, expands user base |
| **Reading Analytics** | 1.5 | Gamification driver, increases engagement |
| **Online Fine Payment** | 1.5 | Revenue enabler, reduces admin burden |

**Impact:** Completes core member experience, enables self-service, drives repeat usage

---

### 📋 **TIER 3: Strategic (Priority 1.0-1.5)**
*Long-term value - Ship in 8-12 weeks*

| Feature | Priority | Reasoning |
|---------|----------|-----------|
| **Mobile App (PWA)** | 1.3 | Improves mobile UX, enables offline features |
| **Book Reviews/Ratings** | 1.2 | Community building, discovery enhancement |
| **Custom Shelves** | 1.2 | Power user feature, increases stickiness |
| **AI Recommendations** | 1.1 | Competitive differentiator, complex to implement |
| **AI Book Chat Assistant** | 1.1 | ✅ Implemented - RAG chatbot for book discovery |
| **Family Account Linking** | 1.0 | Niche but high value for parents |
| **Public Shelf Sharing** | 1.0 | Social features, viral potential |

**Impact:** Differentiates from competitors, builds community, enables advanced use cases

---

### ⏸️ **TIER 4: Backlog (Priority < 1.0)**
*Defer or reconsider*

| Feature | Priority | Reasoning |
|---------|----------|-----------|
| **Multi-language Support** | 0.8 | High effort, only valuable if serving multilingual community |

---

## Recommended Development Sequence

### **Sprint 1-2 (Weeks 1-4): Foundation & Quick Wins**
```
Week 1-2:
✅ Reading History Export (CSV/JSON)
✅ Due Date Notifications (Email)
✅ Borrowing Limits Warning

Week 3-4:
✅ Complete Renew Books Feature
✅ Advanced Search Filters (Genre + Year + Availability)
✅ Dark Mode Implementation
```

**Outcome:** Members can avoid fines, export data, and search effectively

---

### **Sprint 3-4 (Weeks 5-8): Reservation System**
```
Week 5-6:
✅ Book Reservation/Hold Queue System
✅ Database schema for holds
✅ Admin interface for managing holds

Week 7-8:
✅ Availability Notifications (Email/SMS)
✅ Calendar Integration (Google Calendar, iCal)
✅ Reservation limits & business rules
```

**Outcome:** Complete self-service borrowing experience, reduced library desk traffic

---

### **Sprint 5-6 (Weeks 9-12): Engagement & Payments**
```
Week 9-10:
✅ Online Fine Payment (Stripe/PayPal integration)
✅ Payment history & receipts
✅ Reading Analytics Dashboard

Week 11-12:
✅ Custom Shelves (Create, Edit, Delete)
✅ PWA Enhancements (offline mode, app install)
✅ Accessibility Audit & Fixes
```

**Outcome:** Revenue generation, increased engagement, broader accessibility

---

### **Sprint 7+ (Weeks 13+): Advanced Features**
```
Future Sprints:
- AI-powered book recommendations
- Book reviews & ratings system
- Family account linking
- Public shelf sharing & social features
- Multi-language support (if needed)
```

---

## Impact Analysis by Persona

### **Casual Reader**
**Top Priority Jobs:**
1. Discovery (Recommendations, Browsing) - **TIER 3** (AI Recs)
2. Avoiding Fines (Notifications, Renewals) - **TIER 1** ✅
3. Engagement (Shelves, Analytics) - **TIER 2-3**

**Impact Score:** 8/10 - Core needs met in Tier 1-2

---

### **Student/Researcher**
**Top Priority Jobs:**
1. Precision Search (Filters, ISBN) - **TIER 1** ✅
2. History Export (Citations) - **TIER 1** ✅
3. Reservations (Hold unavailable books) - **TIER 2** ✅
4. Calendar Integration (Due date tracking) - **TIER 2** ✅

**Impact Score:** 9/10 - Excellent support across all tiers

---

### **Parent/Guardian**
**Top Priority Jobs:**
1. Managing Multiple Cards (Family linking) - **TIER 3**
2. Avoiding Fines (Notifications) - **TIER 1** ✅
3. Finding Age-appropriate Content - **Not prioritized** ⚠️
4. Tracking All Due Dates (Calendar) - **TIER 2** ✅

**Impact Score:** 6/10 - Core needs met, but family linking delayed

**Recommendation:** Consider adding "Age-appropriate filters" to Tier 2 if parents are key persona

---

## Risk & Dependencies

### **Technical Dependencies**
| Feature | Dependency | Risk Level |
|---------|-----------|------------|
| Notifications | Email/SMS service (SendGrid, Twilio) | Low |
| Online Payments | Payment gateway (Stripe) | Medium |
| Calendar Integration | Google/Apple Calendar APIs | Medium |
| AI Recommendations | ML infrastructure, data volume | High |
| PWA | Service workers, HTTPS | Low |

### **Business Rules to Define**
- Maximum reservation queue length
- Renewal limits (how many times?)
- Fine payment gateway fees (who pays?)
- Family account verification process
- Custom shelf limits (storage costs)

---

## Success Metrics by Feature

| Feature | Key Metric | Target |
|---------|-----------|--------|
| Due Date Notifications | Reduction in overdue books | -50% in 3 months |
| Renewals | % of renewals done online vs in-person | 70% online |
| Reservations | % of searches resulting in holds | 15-20% |
| Reading History Export | Monthly exports | 100+ users |
| Online Payments | Fine collection rate | +30% |
| Dark Mode | % of users enabling it | 25-30% |
| Advanced Search | Search success rate | 85%+ |
| Reading Analytics | Return user rate | +20% |

---

## Resource Allocation Estimate

### **Tier 1 (Quick Wins)**
- **Development Time:** 3-4 weeks
- **Developer Hours:** ~120 hours
- **Cost Estimate:** $6,000 - $8,000 (at $50/hr)

### **Tier 2 (High Value)**
- **Development Time:** 4-6 weeks
- **Developer Hours:** ~180 hours
- **Cost Estimate:** $9,000 - $12,000

### **Tier 3 (Strategic)**
- **Development Time:** 6-8 weeks
- **Developer Hours:** ~240 hours
- **Cost Estimate:** $12,000 - $16,000

**Total Investment (All Tiers):** ~$27,000 - $36,000 over 3-4 months

---

## Recommendations

### **Immediate Actions (This Week)**
1. ✅ Implement **Reading History Export** (highest priority/effort ratio)
2. ✅ Set up **notification infrastructure** (SendGrid/Resend)
3. ✅ Complete **Renew Books** API endpoint
4. ✅ Add **borrowing limit warnings** to dashboard

### **Month 1 Goals**
- Ship all Tier 1 features
- Reduce overdue books by 30%
- Increase member app weekly active users by 25%

### **Month 2-3 Goals**
- Complete reservation system
- Launch online payment
- Achieve 70% self-service transaction rate

### **Pivot Considerations**
- If **parents** become primary persona → move "Family Linking" to Tier 1
- If **fine collection** is critical → move "Online Payments" to Tier 1
- If **library has waitlists** → move "Reservations" to Tier 1
- If **competitive pressure** exists → prioritize "AI Recommendations" earlier

---

## Appendix: Feature Effort Breakdown

### **Reading History Export** (Effort: 2)
- Backend: Query transactions with joins (4 hrs)
- Export logic: CSV/JSON generation (3 hrs)
- Frontend: Download button + UI (2 hrs)
- Testing: Edge cases (2 hrs)
**Total:** ~11 hours = 1.5 days

### **Due Date Notifications** (Effort: 3)
- Email service setup (SendGrid/Resend) (4 hrs)
- Cron job/scheduled task (6 hrs)
- Email templates (4 hrs)
- Notification preferences UI (6 hrs)
- Testing & delivery tracking (4 hrs)
**Total:** ~24 hours = 3 days

### **Book Reservations** (Effort: 5)
- Database schema (holds table) (4 hrs)
- Queue management logic (12 hrs)
- Member UI (reserve button, queue position) (8 hrs)
- Admin UI (manage holds) (8 hrs)
- Business rules (limits, expirations) (6 hrs)
- Testing (6 hrs)
**Total:** ~44 hours = 5.5 days

---

**Next Steps:** Review this matrix with stakeholders, validate effort estimates, and lock in Sprint 1-2 scope.
