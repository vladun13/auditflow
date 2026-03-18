# AuditFlow — Product Requirements Document

**Version:** 1.0
**Date:** 2026-03-17
**Status:** Active

---

## Executive Summary

### Problem Statement
Web accessibility is a legal requirement (ADA, Section 508, EN 301 549) and a moral imperative, yet most development teams lack the tooling to identify and fix accessibility violations before they ship. Manual audits are expensive and slow; existing tools like Lighthouse and axe produce raw violation lists with no guidance on how to fix them. Teams waste hours deciphering cryptic WCAG references instead of writing fixes.

### Solution Overview
AuditFlow is an AI-powered web accessibility audit platform. Users enter a URL, AuditFlow crawls the site and scans every page against WCAG 2.1 guidelines, then uses AI to generate a plain-English explanation of each violation *and* step-by-step fix instructions. Results are available as an interactive report in the dashboard and as a downloadable PDF.

### Success Metrics
| Metric | Target (6 months) |
|--------|------------------|
| Registered users | 1,000 |
| Paid transactions | 200 |
| Monthly recurring scans | 500 |
| Avg. report NPS | ≥ 40 |
| Churn rate (credits unused 60 days) | < 20% |

### Timeline
| Milestone | Target Date |
|-----------|------------|
| Phase 1 — Core redesign complete | 2026-04-07 |
| Phase 2 — Settings & Billing pages | 2026-04-21 |
| Phase 3 — Data hooks & API wiring | 2026-04-28 |
| Phase 4 — Modals, PDF, Onboarding | 2026-05-12 |
| Phase 5 — Cleanup & Testing | 2026-05-19 |
| Public launch | 2026-06-01 |

---

## 1. Background & Context

### Product Overview
AuditFlow is a SaaS web application built on:
- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Radix UI
- **Auth:** Supabase (email/password + OTP)
- **Backend:** Node.js REST API (`localhost:3001` / `VITE_API_URL`)
- **Payments:** LemonSqueezy (credit packs, no subscriptions)
- **Reports:** jsPDF + html2pdf.js

### Current State
Auth pages (Login, SignUp, ForgotPassword) and the Landing page (Navbar, Hero, Features) have been redesigned to match Figma wireframes using a light theme with indigo `#4F46E5` primary. The core authenticated experience (Dashboard, Scan, Audit Results, Pricing) retains old basic styling and several components contain broken imports (`@/app/page`) and mock data.

### Business Model
Pay-as-you-go credit packs. Each scan consumes 1 credit. No monthly subscription.

| Pack | Price | Credits | Max Pages/Scan |
|------|-------|---------|----------------|
| Basic | $149 | 1 | 5 |
| Pro | $299 | 5 | 10 |
| Enterprise | $499 | 15 | Unlimited |

---

## 2. Goals & Objectives

### Business Goals
1. Monetize accessibility expertise through a self-serve SaaS product
2. Achieve product-market fit with developer/QA teams at SMBs
3. Build a repeatable acquisition funnel: Landing → Free Scan CTA → SignUp → First Paid Scan

### Product Goals
1. Deliver a polished, consistent UI across all authenticated pages
2. Provide actionable AI fix recommendations that reduce time-to-fix by 50%
3. Support all user journeys end-to-end: sign up, scan, view report, download PDF, buy more credits

### Non-Goals (v1.0)
- Custom branding / white-label reports
- Team/organization accounts (multi-user)
- CI/CD integrations (GitHub Actions, etc.)
- Scheduled / recurring scans
- Browser extension

---

## 3. User Personas

### Persona 1 — Frontend Developer "Dev Dana"
- **Role:** Mid-level frontend developer at a digital agency
- **Goal:** Quickly identify and fix a11y regressions before QA sign-off
- **Pain:** Runs Lighthouse, gets a list of violations, spends 2 hours looking up WCAG docs to understand fixes
- **Value from AuditFlow:** AI fix steps eliminate lookup time; PDF report for client handoff

### Persona 2 — QA Engineer "QA Quinn"
- **Role:** QA lead at a product company
- **Goal:** Audit new features each sprint for accessibility compliance
- **Pain:** No automated a11y gate in CI; manual testing is inconsistent
- **Value from AuditFlow:** Repeatable, consistent scan output; severity-bucketed violations with estimated fix hours

### Persona 3 — Product Manager "PM Parker"
- **Role:** PM at an e-commerce company facing ADA lawsuit risk
- **Goal:** Demonstrate WCAG compliance to legal/compliance team
- **Pain:** Can't quantify accessibility debt or track improvement over time
- **Value from AuditFlow:** WCAG score, compliance level badge, PDF report for legal team

---

## 4. User Stories & Acceptance Criteria

### 4.0 Landing Page

**US-000 — View Landing Page**
```
As a first-time visitor,
I want to understand what AuditFlow does and how to get started,
So that I can decide whether to create an account.

Acceptance Criteria:
- Given I visit /
- When the page loads
- Then I see a hero section with a clear headline, subheadline, and a URL input CTA
- And I see a features section explaining the product's key capabilities
- And I see a "How It Works" section with 3 steps
- And I see a pricing CTA or link to /pricing
- And I see a footer with Product / Resources / Legal links

Definition of Done:
- [x] Hero URL input navigates to /scan?url= when submitted
- [x] "Start Free Trial" CTA in navbar navigates to /signup
- [x] "Log In" CTA navigates to /login
- [x] All nav links scroll to correct sections or navigate to correct routes
- [x] Page is fully responsive at 375px, 768px, 1280px
- [x] All text meets 4.5:1 contrast ratio
- [x] Plus Jakarta Sans font loaded via Google Fonts
```

**US-000b — Hero URL Submission**
```
As a visitor who wants to try the product,
I want to enter a URL in the hero and be taken directly to the scan page,
So that I can experience the product immediately without signing up first.

Acceptance Criteria:
- Given I am on /
- When I type a URL into the hero input and press "Start Scanning"
- Then I am navigated to /scan?url=<entered_url>
- When I am not authenticated and reach /scan
- Then I am redirected to /login with a return redirect to /scan?url=
- When I submit an invalid URL
- Then I see an inline validation error under the input

Definition of Done:
- [x] URL pre-filled in /scan page from query param
- [ ] Unauthenticated redirect preserves the ?url= param through login
```

**US-000c — Social Proof & Trust**
```
As a skeptical visitor,
I want to see evidence that AuditFlow is credible and trusted,
So that I feel confident enough to sign up.

Acceptance Criteria:
- Given I scroll through the landing page
- Then I see a "Trusted by" logo strip or testimonial section
- And I see the WCAG compliance badge or audit count stat

Definition of Done:
- [x] SocialProof.tsx — "Trusted by developers at..." logo strip after hero
- [x] StatsBar.tsx — 4 headline stats (pages scanned, violations detected, AI fix rate, avg scan time)
- [x] Testimonials.tsx — 3 testimonial cards with name/role/company
- [x] ComplianceBadges.tsx — 6 compliance standards pill badges (WCAG 2.1 AA/AAA, Section 508, ADA, EN 301 549, AODA)
- [x] CtaBanner.tsx — Indigo full-width CTA banner above footer
```

---

### 4.1 Authentication

**US-001 — Sign Up**
```
As a new visitor,
I want to create an account with my email and password,
So that I can save my audit history and buy credits.

Acceptance Criteria:
- Given I visit /signup
- When I enter a valid email + password (min 8 chars) and submit
- Then Supabase creates my account and sends a confirmation email
- And I am redirected to /dashboard

Definition of Done:
- [x] Form validates email format and password length
- [x] Supabase signUp() called on submit
- [x] Error messages displayed inline (not alert())
- [x] Loading state on submit button
```

**US-002 — Log In**
```
As a returning user,
I want to log in with email and password,
So that I can access my dashboard and audit history.

Acceptance Criteria:
- Given I visit /login
- When I enter correct credentials and submit
- Then I am redirected to /dashboard
- When I enter wrong credentials
- Then I see an inline error message

Definition of Done:
- [x] Supabase signInWithPassword() called
- [x] ProtectedRoute redirects unauthenticated users to /login
- [x] Session persisted across page refreshes
```

**US-003 — Forgot Password**
```
As a user who forgot their password,
I want to request a password reset email,
So that I can regain access to my account.

Acceptance Criteria:
- Given I visit /forgot-password
- When I enter my email and submit
- Then Supabase sends a reset email
- And I see a confirmation message
```

---

### 4.2 Dashboard

**US-010 — View Dashboard**
```
As an authenticated user,
I want to see my audit stats and recent audits on login,
So that I can quickly understand my accessibility compliance status.

Acceptance Criteria:
- Given I am logged in
- When I visit /dashboard
- Then I see: Total Audits, Avg WCAG Score, Critical Issues count, Compliant Sites count
- And I see up to 5 most recent audits with URL, score, status
- And I see my current credit balance

Definition of Done:
- [ ] Stats derived from real API data (auditApi.list())
- [ ] Credits fetched from userApi.getCredits()
- [ ] Loading skeleton shown while fetching
- [ ] Empty state shown when no audits exist
```

**US-011 — View All Reports**
```
As an authenticated user,
I want to browse all my past audits in a filterable list,
So that I can find and review specific scans.

Acceptance Criteria:
- Given I navigate to /reports
- When the page loads
- Then I see all my audits sorted by most recent
- And I can filter by status (completed, scanning, failed)
- And clicking a row navigates to /audits/:id
```

---

### 4.3 New Scan

**US-020 — Start a Scan**
```
As an authenticated user,
I want to enter a URL and configure scan depth, then start a scan,
So that I can get an accessibility report for a website.

Acceptance Criteria:
- Given I visit /scan (optionally with ?url= pre-filled from Hero)
- When I enter a valid URL and click Start Scan
- Then auditApi.create() is called with URL and crawl_depth
- And auditApi.startScan() is called with the returned audit_id
- And I am navigated to /audits/:id to see scan progress
- When I enter an invalid URL
- Then I see an inline validation error
- When I have 0 credits
- Then I see an upgrade prompt instead of the scan button

Definition of Done:
- [ ] URL pre-filled from ?url= query param
- [ ] Crawl depth selector (1–5 pages with labels)
- [ ] Credit check before allowing scan initiation
- [ ] 2-column layout: form left, scan checklist / scan progress right
- [ ] Loading animation while API calls are in flight
```

---

### 4.4 Audit Results

**US-030 — View Audit Results**
```
As an authenticated user,
I want to see the full results of a completed audit,
So that I can understand my site's accessibility issues and how to fix them.

Acceptance Criteria:
- Given an audit is completed
- When I visit /audits/:id
- Then I see a circular WCAG score ring (color: green ≥80, yellow ≥60, red <60)
- And I see violation counts by severity (critical, serious, moderate, minor)
- And I see a filterable list of violations, each showing:
  - Violation type + WCAG criterion
  - Impact badge (color-coded)
  - AI "Why This Matters" explanation
  - AI "How to Fix" step-by-step instructions
  - Affected element count + estimated fix hours

Definition of Done:
- [ ] Polling every 3s while status === 'scanning'
- [ ] Scanning state shows animated progress card
- [ ] Completed state shows full results
- [ ] Filter buttons update displayed violation list
- [ ] PDF download button triggers auditApi.downloadPdf()
```

**US-031 — Download PDF Report**
```
As an authenticated user,
I want to download a PDF version of my audit report,
So that I can share it with clients or my legal/compliance team.

Acceptance Criteria:
- Given a completed audit
- When I click Download PDF
- Then a PDF file is downloaded named auditflow-report-{id}.pdf
- The PDF includes: site URL, scan date, WCAG score, violation list with AI fixes

Definition of Done:
- [ ] PDF generation either server-side (preferred) or client-side fallback
- [ ] Authentication header sent with PDF request
- [ ] Error state if PDF generation fails
```

---

### 4.5 Pricing & Payments

**US-040 — View Pricing**
```
As a visitor or authenticated user,
I want to see pricing options,
So that I can choose a credit pack that fits my needs.

Acceptance Criteria:
- Given I visit /pricing
- When the page loads
- Then I see Basic, Pro, Enterprise plans with prices, credits, and features
- When I click "Buy [Plan]" as an unauthenticated user
- Then I am redirected to /signup
- When I click "Buy [Plan]" as an authenticated user
- Then paymentApi.createCheckout() is called and I'm redirected to LemonSqueezy
```

**US-041 — Payment Confirmation**
```
As a user who completed payment,
I want my credits to be added to my account immediately,
So that I can start scanning.

Acceptance Criteria:
- Given I complete a LemonSqueezy checkout
- When I'm redirected back to AuditFlow
- Then my credit balance is updated in the header
- And I see a success notification
```

---

### 4.6 Settings

**US-050 — Edit Profile**
```
As an authenticated user,
I want to update my name and email,
So that my account information stays current.

Acceptance Criteria:
- Given I visit /settings/account
- When I update my name and click Save
- Then userApi.updateProfile() is called
- And I see a success toast notification
```

**US-051 — Change Password**
```
As an authenticated user,
I want to change my password from settings,
So that I can keep my account secure.

Acceptance Criteria:
- Given I visit /settings/security
- When I enter current + new password and confirm
- Then userApi.updatePassword() is called
- When the current password is wrong
- Then I see an error message
```

**US-052 — Manage Notification Preferences**
```
As an authenticated user,
I want to control which emails I receive,
So that I only get notifications that are useful to me.

Acceptance Criteria:
- Given I visit /settings/notifications
- I can toggle: scan complete email, weekly summary, promotional emails
- Changes are saved via userApi.updateProfile()
```

---

### 4.7 Billing

**US-060 — View Payment History**
```
As an authenticated user,
I want to see all my past payments,
So that I can track my spending and get receipts.

Acceptance Criteria:
- Given I visit /settings/payments
- Then I see a list of payments with: date, plan, amount, status
```

**US-061 — View Credit History**
```
As an authenticated user,
I want to see how my credits were used,
So that I can understand my usage patterns.

Acceptance Criteria:
- Given I visit /settings/credits
- Then I see a log of: date, event (purchase/usage), credit amount, running balance
```

**US-062 — Buy Additional Credits**
```
As an authenticated user with low credits,
I want to buy more credits from within the app,
So that I don't have to navigate away to the pricing page.

Acceptance Criteria:
- Given I visit /settings/plans or see the credit balance in the header
- When I click "Buy Credits"
- Then a modal opens showing credit pack options
- When I select a pack and confirm
- Then I'm redirected to LemonSqueezy checkout
```

---

## 5. Functional Requirements

### 5.0 Landing Page

| Priority | Section | Requirement |
|----------|---------|-------------|
| Must | Navbar | Logo + nav links (Product ▾, Solutions ▾, Pricing, Resources ▾) + "Log In" text link + "Start Free Trial" filled button |
| Must | Navbar | Sticky/fixed at top; transparent on scroll start, white on scroll |
| Must | Hero | Headline: "Automated Accessibility Audits, Powered by AI" (or equivalent) |
| Must | Hero | Subheadline explaining WCAG scanning + AI fix recommendations |
| Must | Hero | URL input field with "Start Scanning" CTA that navigates to /scan?url= |
| Must | Hero | Decorative gradient blobs (indigo/blue/pink) for visual depth |
| Must | Features | 4-card grid explaining: AI Fix Recommendations, WCAG 2.1 Compliance, Multi-Page Scanning, PDF Reports |
| Must | How It Works | 3-step numbered flow: Input URL → Run Audit → Get Fixes |
| Must | Pricing CTA | Link or button directing to /pricing |
| Must | Footer | 3 link groups: Product (Features, Pricing, API), Resources (Docs, Blog, Community), Legal (Privacy, Terms) |
| Must | Footer | AuditFlow logo + tagline + copyright |
| Should | Social Proof | Testimonials section (2–3 quotes) or "Trusted by" logo strip | ✓ Done |
| Should | Stats bar | 3 headline stats (e.g. "10,000+ pages scanned", "WCAG 2.1 AA", "< 60s per scan") | ✓ Done |
| Should | Hero | Animated browser mockup or dashboard screenshot | Pending |
| Could | Navbar | Dropdown menus for Product ▾, Solutions ▾, Resources ▾ | Pending |
| Could | CTA section | Mid-page "Start Free Trial" CTA banner above footer | ✓ Done |

**Content per section:**

**Hero**
- Primary headline: `Fix Accessibility Issues Before They Cost You`
- Subheadline: `AuditFlow scans your website against WCAG 2.1 guidelines and gives you AI-generated fix instructions for every violation.`
- CTA label: `Start Scanning →`
- Secondary CTA: `View Sample Report`

**Features (4 cards)**
1. AI Fix Recommendations — Plain-English explanations + step-by-step code fixes
2. WCAG 2.1 Compliance Scoring — Instant score with AA/AAA level badge
3. Multi-Page Scanning — Crawl up to unlimited pages in one scan
4. PDF Report Export — Shareable reports for clients and legal teams

**How It Works (3 steps)**
1. Input URL — Enter the URL you want to audit
2. Run Audit — Engine scans against WCAG 2.1 guidelines in seconds
3. Get Fixes — AI-generated code snippets for every violation

**Figma reference:** Landing page node `220:44843` (HowItWorks + Footer confirmed); full landing `220:44874`

---

### 5.1 Navigation & Routing

| Priority | Requirement |
|----------|------------|
| Must | Authenticated routes require valid Supabase session; redirect to /login if not |
| Must | Sidebar renders on all authenticated pages via DashboardLayout |
| Must | Sidebar links use React Router `<Link>` (not callback-based navigation) |
| Must | Active sidebar item highlighted based on current route |
| Must | Settings sub-pages accessible via /settings/* nested routes |
| Should | Sidebar collapses to icon-only mode on narrow screens |
| Should | Mobile: sidebar becomes a hamburger drawer overlay |

**Route Map:**
```
/                        → Landing (public)
/login                   → Login (public)
/signup                  → SignUp (public)
/forgot-password         → ForgotPassword (public)
/pricing                 → Pricing (public)

/dashboard               → Dashboard (protected)
/scan                    → NewScan (protected)
/reports                 → Reports (protected)
/audits/:id              → AuditDetail (protected)

/settings                → Settings (protected, settings layout)
/settings/account        → Account
/settings/security       → Security
/settings/notifications  → Notifications
/settings/plans          → PlansAndCredits
/settings/payments       → PaymentHistory
/settings/credits        → CreditHistory
```

### 5.2 Dashboard

| Priority | Requirement |
|----------|------------|
| Must | Show 4 stat cards: Total Audits, Avg Score, Critical Issues, Compliant Sites |
| Must | Show recent audits list (last 5) with score, URL, time ago, status badge |
| Must | Show credit balance in header |
| Must | "Start New Audit" quick action card navigates to /scan |
| Must | "View All Reports" quick action card navigates to /reports |
| Should | Loading skeleton displayed while API data is fetched |
| Should | Empty state with CTA when user has no audits |

### 5.3 New Scan Page

| Priority | Requirement |
|----------|------------|
| Must | URL input with format validation |
| Must | Read `?url=` query param and pre-fill URL input |
| Must | Crawl depth selector (1–5 pages) |
| Must | Create audit + start scan on submit |
| Must | Navigate to /audits/:id after scan started |
| Must | Display credit cost and current balance |
| Should | Block scan initiation if credits = 0 (show upgrade prompt) |
| Should | 2-column layout: form + "What We'll Check" panel |

### 5.4 Audit Detail Page

| Priority | Requirement |
|----------|------------|
| Must | Poll /api/audits/:id every 3s while status === 'scanning' |
| Must | Show scanning animation state |
| Must | Show WCAG score, pages scanned, total violations, status |
| Must | Show violation breakdown by severity (critical/serious/moderate/minor) |
| Must | Show filterable violation list |
| Must | Each violation: type, WCAG criterion, impact badge, AI explanation, AI fix steps, element count, fix hours |
| Must | Download PDF button |
| Should | Circular score ring with color coding |
| Should | "Back to Dashboard" breadcrumb |

### 5.5 Settings Pages

| Priority | Requirement |
|----------|------------|
| Must | SettingsLayout with left nav tabs linking to sub-pages |
| Must | Account: display name, email; save via API |
| Must | Security: change password form |
| Must | Notifications: toggle checkboxes for email prefs |
| Must | Plans & Credits: current plan, credit balance, upgrade CTA |
| Must | Payment History: table of past payments |
| Must | Credit History: table of credit events |

### 5.6 API Layer

| Priority | Endpoint | Description |
|----------|----------|-------------|
| Must | `GET /api/audits` | List user audits |
| Must | `POST /api/audits/create` | Create audit |
| Must | `POST /api/audits/:id/scan` | Start scan |
| Must | `GET /api/audits/:id` | Get audit (with violations) |
| Must | `DELETE /api/audits/:id` | Delete audit |
| Must | `GET /api/audits/:id/report/pdf` | Download PDF |
| Must | `GET /api/user/credits` | Get credit balance |
| Should | `GET /api/user/profile` | Get user profile |
| Should | `PUT /api/user/profile` | Update profile |
| Should | `PUT /api/user/password` | Change password |
| Should | `GET /api/payments/history` | Payment history |
| Should | `GET /api/payments/subscription` | Subscription info |
| Should | `GET /api/user/credit-history` | Credit usage log |
| Could | `POST /api/audits/:id/rescan` | Re-run scan on same URL |
| Could | `POST /api/audits/:id/share` | Generate shareable link |
| Must | `POST /api/payments/checkout` | Create LemonSqueezy checkout |
| Must | `GET /api/payments/success/:sessionId` | Confirm payment |

---

## 6. Non-Functional Requirements

### Performance
| Requirement | Target |
|-------------|--------|
| Dashboard initial load (API + render) | < 2 seconds |
| Audit results page load | < 1.5 seconds |
| Scan initiation (create + start API calls) | < 3 seconds |
| PDF download trigger | < 500ms to start download |
| Bundle size (gzipped) | < 500 KB |

### Security
| Requirement | Implementation |
|-------------|---------------|
| Authentication | Supabase JWT (RS256) |
| API authorization | Bearer token on every request |
| Session management | Supabase session refresh + persisted in localStorage |
| No secrets in client | All API keys via environment variables |
| Input sanitization | URL validation before API calls |

### Accessibility (meta)
As an accessibility product, AuditFlow itself must be accessible:
- All interactive elements keyboard navigable
- Minimum contrast ratio 4.5:1 for normal text
- All images have meaningful alt text
- Form fields have associated labels
- Focus indicators visible
- ARIA roles/labels on custom components

### Browser Support
- Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- No IE11 support required

### Responsive Breakpoints
| Breakpoint | Behavior |
|------------|---------|
| ≥ 1280px | Full sidebar expanded + all columns |
| 768–1279px | Sidebar collapsed to icon-only |
| < 768px | Sidebar replaced with hamburger drawer |

---

## 7. Technical Considerations

### Frontend Architecture
```
src/
├── types/index.ts          ← Centralized interfaces (Audit, Violation, Payment, etc.)
├── layouts/
│   ├── DashboardLayout.tsx ← Sidebar + header + <Outlet/> for auth pages
│   └── SettingsLayout.tsx  ← Left nav tabs + <Outlet/> for settings sub-pages
├── hooks/
│   ├── useAudits.ts        ← auditApi.list() with loading/error state
│   ├── useAudit.ts         ← auditApi.get(id) with scan-status polling
│   ├── useCredits.ts       ← userApi.getCredits()
│   └── usePayments.ts      ← payment/credit history
├── pages/
│   ├── DashboardNew.tsx    ← Strip inline layout; use DashboardLayout
│   ├── NewScan.tsx         ← 2-column form + progress panel
│   ├── AuditDetail.tsx     ← Circular score ring + severity tabs
│   ├── Reports.tsx         ← Full audits list (extracted from Dashboard)
│   ├── Pricing.tsx         ← Redesigned from Figma
│   └── settings/
│       ├── Settings.tsx
│       ├── Account.tsx
│       ├── Security.tsx
│       ├── Notifications.tsx
│       ├── PlansAndCredits.tsx
│       ├── PaymentHistory.tsx
│       └── CreditHistory.tsx
├── components/
│   ├── sidebar.tsx         ← Fix broken import; use <Link> routing
│   ├── modals/
│   │   ├── BuyCreditsModal.tsx
│   │   ├── CancelSubscriptionModal.tsx
│   │   ├── UpgradeModal.tsx
│   │   ├── ReactivateModal.tsx
│   │   └── ShareReportModal.tsx
│   └── PdfReport.tsx
└── lib/
    ├── api.ts              ← Expanded with all new endpoints
    └── pdf.ts              ← PDF generation utilities
```

### State Management
- Local component state with `useState` / `useReducer`
- Custom hooks abstract API calls and loading/error state
- No global state library (Redux/Zustand) needed for v1.0
- Auth state via existing AuthContext

### Routing (React Router v7)
```tsx
// Nested routes for DashboardLayout
<Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/scan" element={<NewScan />} />
  <Route path="/reports" element={<Reports />} />
  <Route path="/audits/:id" element={<AuditDetail />} />
  <Route path="/settings" element={<SettingsLayout />}>
    <Route index element={<Settings />} />
    <Route path="account" element={<Account />} />
    <Route path="security" element={<Security />} />
    <Route path="notifications" element={<Notifications />} />
    <Route path="plans" element={<PlansAndCredits />} />
    <Route path="payments" element={<PaymentHistory />} />
    <Route path="credits" element={<CreditHistory />} />
  </Route>
</Route>
```

### Design Tokens (from `index.css`)
```css
--primary:            239 84% 67%   /* Indigo #4F46E5 */
--background:         0 0% 100%     /* White */
--foreground:         222.2 84% 4.9%
--secondary:          210 40% 96.1%
--muted-foreground:   215.4 16.3% 46.9%
--border:             214.3 31.8% 91.4%
--destructive:        0 84.2% 60.2% /* Red */
```

Score color conventions:
- ≥ 80: `text-green-600` / `bg-green-50`
- ≥ 60: `text-yellow-600` / `bg-yellow-50`
- < 60: `text-red-600` / `bg-red-50`

### Removed / Dead Code
Files to delete after Phase 1–2:
- `src/pages/Dashboard.tsx` (superseded by DashboardNew)
- `src/components/dashboard-view.tsx` (mock data, broken imports)
- `src/components/scan-view.tsx` (mock data, broken imports)
- `src/components/reports-view.tsx` (mock data, broken imports)
- `src/components/audit-results-view.tsx` (mock data, broken imports)
- All `"use client"` directives (Next.js artifact, not valid in Vite)

---

## 8. Dependencies & Assumptions

### External Dependencies
| Dependency | Version | Purpose |
|------------|---------|---------|
| react | 19.2.0 | UI framework |
| react-router-dom | 7.9.6 | Client-side routing |
| @supabase/supabase-js | 2.86.0 | Auth + session management |
| tailwindcss | 4.1.17 | Utility-first CSS |
| @radix-ui/* | latest | Headless accessible UI primitives |
| lucide-react | 0.555.0 | Icons |
| framer-motion | 12.23.24 | Animations |
| sonner | 2.0.7 | Toast notifications |
| @lemonsqueezy/lemonsqueezy.js | 4.0.0 | Payments |
| jspdf + html2pdf.js | 3.0.4 / 0.12.1 | PDF export |
| recharts | 2.15.4 | Charts (for future analytics) |
| zod | 4.1.13 | Schema validation |

### Backend Assumptions
- Node.js REST API running at `VITE_API_URL` (default: `http://localhost:3001`)
- All endpoints secured with Supabase JWT verification
- Audit scanning is asynchronous; polling required (`status` field)
- LemonSqueezy webhook updates credits server-side
- PDF generation handled server-side; fallback to client-side generation

### Figma Design Assumptions
- Primary design system: light theme, `#4F46E5` indigo, white background
- Figma node IDs referenced in implementation plan are accessible via Figma MCP
- Daily fetch limit on Figma MCP starter plan requires spreading screen fetches across sessions

---

## 9. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Backend API unavailable during frontend dev | High | Medium | Use mock data in `isDev` mode with env flag |
| Figma MCP daily limit blocks UI implementation | Medium | High | Schedule fetches (4 sessions as planned); use screenshots as fallback |
| LemonSqueezy webhook delays credit update | High | Low | Optimistic UI update + polling on return from checkout |
| `react-router-dom` v7 breaking changes vs v6 | Medium | Low | Already installed and partially working; test routing changes incrementally |
| PDF generation blocked by CORS on server | Medium | Medium | Implement client-side fallback with jsPDF |
| Supabase session expiry mid-session | Medium | Low | Supabase auto-refresh; handle 401 by redirecting to /login |
| Over-engineering: too many new abstractions at once | Low | Medium | Follow plan phases strictly; don't add features outside scope |

---

## 10. Success Metrics & KPIs

### Acquisition
- **Visitor-to-signup rate:** > 5% (landing page → /signup completion)
- **Hero CTA click-through:** > 15% of visitors click "Start Scanning"
- **Bounce rate:** < 60% on landing page
- **Pricing page visit rate:** > 30% of landing page visitors navigate to /pricing
- **Average time on landing page:** > 90 seconds (indicates content engagement)
- **Free trial signup rate from hero CTA:** > 8% of visitors who use the hero URL input complete signup

### Activation
- **Time to first scan:** < 5 minutes from signup
- **First-scan completion rate:** > 80% of users who start a scan see a completed report

### Revenue
- **Credit pack conversion:** > 10% of registered users make a purchase within 14 days
- **Average revenue per user (ARPU):** > $50 in first 30 days
- **Credit utilization rate:** > 70% of purchased credits used within 60 days

### Retention
- **30-day return rate:** > 40% of users run a second scan within 30 days
- **PDF download rate:** > 60% of completed audits result in a PDF download

### Quality
- **API error rate:** < 1% of scan requests fail
- **Support ticket rate:** < 5% of paying users open a support ticket per month

---

## Appendix A: Figma Screen Reference

| Screen | Node ID | Phase |
|--------|---------|-------|
| Audit Dashboard | `172:20570` | 1B |
| Pricing | `263:59336` | 1E |
| Scanning Website | `105:16689` | 1C |
| Landing Page (full — HowItWorks + Footer) | `220:44843` | 1F |
| Landing Page (responsive variants) | `220:44874` | 1F |
| Audit Results | `105:15858` | 1D |
| Issues | `250:47714` | 1D |
| Settings | `185:35236` | 2A |
| Account | `263:63544` | 2A |
| Notifications | `263:65079` | 2A |
| Security | `263:65080` | 2A |
| Plans & Credits | `185:35493` | 2B |
| Payment History | `185:35736` | 2B |
| Credit History | `185:35958` | 2B |
| Buy Credits Modal | `185:35553` | 4A |
| Cancel Subscription Modal | `185:36009` | 4A |
| Upgrade Modal | `185:36220` | 4A |
| Reactivate Modal | `185:36490` | 4A |
| Share Report Modal | `105:15673` | 4A |
| PDF Report | `105:16115` | 4B |
| Onboarding | `210:58803` | 4C |
| Tutorial | `210:58819` | 4C |

---

## Appendix B: Environment Variables

```env
VITE_API_URL=http://localhost:3001          # Backend API base URL
VITE_SUPABASE_URL=https://xxx.supabase.co   # Supabase project URL
VITE_SUPABASE_ANON_KEY=eyJ...              # Supabase anon key
```
