# AuditFlow — Claude Code Project Guide

This file is the authoritative context document for Claude Code working on this project. Read it fully at the start of every session before touching any code.

---

## What This Project Is

**AuditFlow** is a B2B SaaS web application that automatically generates WCAG accessibility audit reports for websites. Users enter a URL, the backend crawls the site with Puppeteer + axe-core, scans every page against WCAG 2.1 guidelines, then Claude AI generates plain-English explanations and step-by-step fix instructions for each violation. Results appear as an interactive dashboard report and downloadable PDF.

**Business model:** Pay-as-you-go credit packs (no subscription). Each scan = 1 credit.

| Pack | Price | Credits | Max pages/scan |
|------|-------|---------|----------------|
| Basic | $149 | 1 | 5 |
| Pro | $299 | 5 | 10 |
| Enterprise | $499 | 15 | Unlimited |

**GitHub repo:** https://github.com/vladun13/auditflow

---

## Current State (as of 2026-03-17)

### What is DONE (built and styled)
- Landing page: `Navbar`, `Hero`, `Features`, `HowItWorks`, `Footer` — fully redesigned to Figma light theme
- Auth pages: `Login`, `SignUp`, `ForgotPassword` — redesigned and working
- `DashboardNew.tsx` — functional with real API data, uses `DashboardLayout`
- `NewScan.tsx` — functional, basic styling (not yet redesigned to Figma)
- `AuditDetail.tsx` — functional with polling, basic styling (not yet redesigned to Figma)
- `Pricing.tsx` — functional with LemonSqueezy, basic styling (not yet redesigned to Figma)
- `Reports.tsx` — extracted reports route with status filtering and delete
- `src/types/index.ts` — centralized type definitions
- `src/layouts/DashboardLayout.tsx` — shared sidebar + header + `<Outlet/>` for all auth pages ✓
- `src/layouts/SettingsLayout.tsx` — left nav tabs for settings sub-pages ✓
- `src/hooks/useAudits.ts`, `useAudit.ts`, `useCredits.ts`, `usePayments.ts` — all created ✓
- `src/pages/settings/Account.tsx`, `Security.tsx`, `Notifications.tsx` ✓
- `src/pages/settings/PlansAndCredits.tsx`, `PaymentHistory.tsx`, `CreditHistory.tsx` ✓
- `App.tsx` — restructured with nested routes under `DashboardLayout` and `SettingsLayout` ✓
- `src/lib/api.ts` — expanded with `userApi.getProfile/updateProfile/updatePassword/getCreditHistory`, `paymentApi.getHistory/getSubscription` ✓
- Full backend: scanning service, AI service, payment routes, auth middleware
- `backend/src/utils/validateUrl.ts` — SSRF protection utility ✓
- Backend security hardened: `helmet`, rate limiting, timing-safe webhook, IDOR fix, TOCTOU fix, error sanitization ✓
- Test suite: 18 test files, 133 tests passing (Vitest + React Testing Library + happy-dom) ✓
- Supabase database schema deployed
- PRD.md created

### What is NOT YET DONE (pending implementation)
- Figma redesigns: `NewScan`, `AuditDetail`, `Pricing`, `DashboardNew` (Figma designs not yet fetched)
- All modals: `BuyCreditsModal`, `CancelSubscriptionModal`, `UpgradeModal`, `ReactivateModal`, `ShareReportModal`
- Backend endpoints not yet implemented: `/api/user/profile` (GET/PUT), `/api/user/password` (PUT), `/api/payments/history`, `/api/payments/subscription`, `/api/user/credit-history`
- PDF report generation (`PdfReport` component + `pdf.ts` lib)
- Onboarding + tutorial flows
- Delete dead code: mock-data view components (`dashboard-view.tsx`, `scan-view.tsx`, etc.), `Dashboard.tsx`
- `HowItWorks` + `Footer` Figma redesign (node `220:44843`)

---

## Repository Layout

```
/
├── src/                              # Frontend (Vite + React)
│   ├── App.tsx                       # Route definitions — CRITICAL FILE
│   ├── index.css                     # Design tokens (CSS variables)
│   ├── main.tsx                      # React entry point
│   ├── types/
│   │   └── index.ts                  # Centralized interfaces (Audit, Violation, etc.)
│   ├── contexts/
│   │   └── AuthContext.tsx           # Supabase auth state, signIn/signUp/signOut
│   ├── lib/
│   │   ├── api.ts                    # All API calls (apiCall helper + auditApi/userApi/paymentApi)
│   │   ├── supabase.ts               # Supabase client initialization
│   │   └── utils.ts                  # cn() classname helper
│   ├── layouts/
│   │   ├── DashboardLayout.tsx       # Sidebar + header + <Outlet/> ✓
│   │   └── SettingsLayout.tsx        # Settings left nav + <Outlet/> ✓
│   ├── hooks/
│   │   ├── useAudits.ts              # wraps auditApi.list() ✓
│   │   ├── useAudit.ts               # wraps auditApi.get() with polling ✓
│   │   ├── useCredits.ts             # wraps userApi.getCredits() ✓
│   │   └── usePayments.ts            # wraps payment/credit history ✓
│   ├── test/
│   │   ├── setup.ts                  # Vitest global setup (jest-dom matchers)
│   │   └── helpers.tsx               # makeAudit() factory, renderWithRouter()
│   ├── pages/
│   │   ├── Landing.tsx               # Public landing page
│   │   ├── Login.tsx                 # Auth — redesigned ✓
│   │   ├── SignUp.tsx                # Auth — redesigned ✓
│   │   ├── ForgotPassword.tsx        # Auth — redesigned ✓
│   │   ├── Pricing.tsx               # Pricing — functional, needs Figma redesign
│   │   ├── Dashboard.tsx             # OLD — delete (superseded by DashboardNew)
│   │   ├── DashboardNew.tsx          # Active dashboard — uses DashboardLayout ✓
│   │   ├── NewScan.tsx               # Scan form — functional, needs Figma redesign
│   │   ├── Reports.tsx               # Reports list with filtering ✓
│   │   ├── AuditDetail.tsx           # Results — functional, needs Figma redesign
│   │   └── settings/
│   │       ├── Account.tsx           # Profile info, danger zone ✓
│   │       ├── Security.tsx          # Password change, 2FA placeholder ✓
│   │       ├── Notifications.tsx     # Email notification prefs ✓
│   │       ├── PlansAndCredits.tsx   # Credit balance, upgrade ✓
│   │       ├── PaymentHistory.tsx    # Past payments list ✓
│   │       └── CreditHistory.tsx     # Credit usage log ✓
│   ├── components/
│   │   ├── Navbar.tsx                # Landing navbar — redesigned ✓
│   │   ├── Hero.tsx                  # Landing hero — redesigned ✓
│   │   ├── Features.tsx              # Landing features — redesigned ✓
│   │   ├── HowItWorks.tsx            # Landing how-it-works
│   │   ├── Footer.tsx                # Landing footer
│   │   ├── sidebar.tsx               # Dashboard sidebar
│   │   ├── modals/                   # (pending — Phase 4A)
│   │   │   ├── BuyCreditsModal.tsx
│   │   │   ├── CancelSubscriptionModal.tsx
│   │   │   ├── UpgradeModal.tsx
│   │   │   ├── ReactivateModal.tsx
│   │   │   └── ShareReportModal.tsx
│   │   └── ui/                       # shadcn/ui components (Radix UI based)
│   │       └── [65+ components]
│
├── backend/                          # Node.js Express API
│   └── src/
│       ├── server.ts                 # Express app, helmet, rate limiting, route mounts
│       ├── config/
│       │   └── supabase.ts           # Supabase admin client (service_role key)
│       ├── middleware/
│       │   └── auth.ts               # JWT verification middleware
│       ├── routes/
│       │   ├── auth.ts               # GET /auth/me
│       │   ├── audits.ts             # CRUD + scan + PDF (SSRF + TOCTOU fixed)
│       │   ├── payments.ts           # LemonSqueezy checkout + webhook (IDOR + timing fixed)
│       │   └── user.ts               # Credits
│       ├── services/
│       │   ├── scanService.ts        # Puppeteer crawl + axe-core scan + DB save
│       │   ├── aiService.ts          # Claude API — generates explanations + fix steps
│       │   └── pdfService.ts         # PDF generation (placeholder)
│       └── utils/
│           └── validateUrl.ts        # SSRF protection — blocks private IPs, cloud metadata
│
├── supabase-schema.sql               # Full DB schema — run in Supabase SQL Editor
├── PRD.md                            # Product Requirements Document
├── SETUP_GUIDE.md                    # Step-by-step local setup
└── LEMONSQUEEZY_SETUP.md             # Payment setup guide
```

---

## Technology Stack

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| React | 19.2.0 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 7.x | Build tool, dev server (port 5173) |
| React Router | 7.9.6 | Client-side routing |
| Tailwind CSS | 4.1.17 | Utility-first styling |
| shadcn/ui + Radix UI | latest | Accessible headless UI components |
| Lucide React | 0.555.0 | Icons |
| Framer Motion | 12.23.24 | Animations |
| Sonner | 2.0.7 | Toast notifications |
| React Hook Form | 7.67.0 | Form state management |
| Zod | 4.1.13 | Schema validation |
| Recharts | 2.15.4 | Charts |
| jsPDF + html2pdf.js | 3.0.4 / 0.12.1 | PDF export |
| @supabase/supabase-js | 2.86.0 | Auth client |
| @lemonsqueezy/lemonsqueezy.js | 4.0.0 | Payments |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.19+ | Runtime |
| Express | 4.x | HTTP framework |
| TypeScript | 5.x | Type safety |
| Puppeteer | latest | Headless Chrome crawling |
| @axe-core/puppeteer | latest | WCAG accessibility testing |
| @anthropic-ai/sdk | latest | Claude AI (explanations + fixes) |
| @supabase/supabase-js | latest | DB access (service_role key) |
| @lemonsqueezy/lemonsqueezy.js | latest | Payment processing |
| SendGrid | optional | Email notifications |
| helmet | latest | Security headers |
| express-rate-limit | latest | Rate limiting (scans: 20/hr, payments: 10/hr, global: 200/15min) |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL database + auth + RLS |
| LemonSqueezy | Payment processing + webhooks |
| Anthropic Claude API | AI-generated fix recommendations |
| Vercel | Frontend hosting (deploy target) |
| Render.com / Railway | Backend hosting (deploy target) |

---

## Design System

### Theme
- **Style:** Light, clean, minimal — white background with indigo primary
- **Primary color:** `#4F46E5` (indigo) — used in buttons, badges, active states, links
- **Background:** `#FFFFFF` (white)
- **Foreground:** Near-black (`222.2 84% 4.9%`)
- **Border:** Light gray (`214.3 31.8% 91.4%`)
- **Muted text:** `215.4 16.3% 46.9%`

### CSS Variables (defined in `src/index.css`)
```css
--primary:            239 84% 67%    /* #4F46E5 indigo */
--background:         0 0% 100%      /* white */
--foreground:         222.2 84% 4.9%
--secondary:          210 40% 96.1%  /* light blue-gray */
--muted-foreground:   215.4 16.3% 46.9%
--border:             214.3 31.8% 91.4%
--destructive:        0 84.2% 60.2%  /* red */
--radius:             0.625rem        /* 10px */
--card:               0 0% 100%
```

Sidebar has its own variables: `--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, etc.

### Score Color Convention (used throughout audit UI)
```
WCAG score ≥ 80  →  text-green-600 / bg-green-50  (Passing)
WCAG score ≥ 60  →  text-yellow-600 / bg-yellow-50 (Needs Work)
WCAG score < 60  →  text-red-600 / bg-red-50       (Failing)
```

### Violation Severity Colors
```
critical  →  red    (bg-red-100 / text-red-800)
serious   →  orange (bg-orange-100 / text-orange-800)
moderate  →  yellow (bg-yellow-100 / text-yellow-800)
minor     →  blue   (bg-blue-100 / text-blue-800)
```

### Component Conventions
- All UI primitives are in `src/components/ui/` (shadcn/ui based)
- Use `cn()` from `src/lib/utils.ts` for conditional classNames
- Buttons: use `<Button>` from `ui/button` — variants: `default`, `outline`, `ghost`, `destructive`
- Cards: `<Card>` + `<CardContent>` — always `border-border bg-card`
- Badges: `<Badge>` — variant `default`, `secondary`, `outline`
- No hardcoded hex colors in components — use Tailwind tokens or CSS variables
- Do NOT add `"use client"` directives — this is Vite/React, not Next.js

### Responsive Breakpoints
- `< 768px` — mobile: sidebar becomes hamburger drawer
- `768–1279px` — tablet: sidebar collapses to icon-only
- `≥ 1280px` — desktop: full sidebar expanded

---

## Architecture

### Frontend Architecture
- **Single Page Application** (SPA) — Vite + React
- **Routing:** React Router v7, client-side only
- **Auth:** Supabase JWT, persisted via Supabase SDK, injected via `AuthContext`
- **API calls:** All go through `apiCall()` in `src/lib/api.ts` which auto-injects the Bearer token
- **State:** Local component state (`useState`) + custom hooks. No Redux/Zustand.
- **Forms:** React Hook Form + Zod validation

### Routing Structure (target state)
```
/                         → Landing (public)
/login                    → Login (public)
/signup                   → SignUp (public)
/forgot-password          → ForgotPassword (public)
/pricing                  → Pricing (public)

Protected (under DashboardLayout):
  /dashboard              → DashboardNew
  /scan                   → NewScan
  /reports                → Reports
  /audits/:id             → AuditDetail
  /settings               → SettingsLayout
    /settings/account     → Account
    /settings/security    → Security
    /settings/notifications → Notifications
    /settings/plans       → PlansAndCredits
    /settings/payments    → PaymentHistory
    /settings/credits     → CreditHistory
```

### Backend Architecture
- **Express REST API** running on port 3001
- **Auth middleware** (`backend/src/middleware/auth.ts`) verifies Supabase JWT on every protected route
- **Scan flow (async):** `POST /api/audits/:id/scan` starts scanning in background; frontend polls `GET /api/audits/:id` every 3s until `status === 'completed'`
- **AI enrichment:** After scanning, `aiService.ts` calls Claude API to generate `ai_explanation` and `ai_fix_steps` for each violation
- **WCAG score formula:** `100 - (critical×10) - (serious×5) - (moderate×2) - (minor×1)`, minimum 0
- **WCAG level thresholds:** AAA ≥ 95, AA ≥ 85, A ≥ 70, null < 70

### Database Schema (Supabase PostgreSQL)
```sql
users          id, email, credits (default 1), created_at, updated_at
audits         id, user_id, website_url, status, pages_scanned,
               total_violations, critical_count, serious_count,
               moderate_count, minor_count, wcag_score, wcag_level,
               created_at, completed_at
violations     id, audit_id, page_url, violation_type, impact,
               wcag_criterion, description, ai_explanation,
               ai_fix_steps, affected_elements, estimated_fix_hours
payments       id, user_id, stripe_session_id, amount, credits_added,
               status, created_at
```
Row Level Security is enabled on all tables — users only see their own data.

---

## API Reference

### Frontend → Backend (`src/lib/api.ts`)
All calls use `apiCall()` which adds `Authorization: Bearer {jwt}` automatically.

```
GET    /api/audits                     List user's audits
POST   /api/audits/create              Create audit {website_url, crawl_depth}
POST   /api/audits/:id/scan            Start scan (async)
GET    /api/audits/:id                 Get audit + violations
DELETE /api/audits/:id                 Delete audit
GET    /api/audits/:id/report/pdf      Download PDF

GET    /api/user/credits               Get credit balance {credits}

POST   /api/payments/checkout          Create LemonSqueezy checkout {plan}
GET    /api/payments/success/:id       Confirm payment
POST   /api/payments/webhook           LemonSqueezy webhook (no auth)

GET    /auth/me                        Get current user info
GET    /health                         Health check
```

### Planned endpoints (not yet in `api.ts`)
```
GET    /api/user/profile               Get user profile
PUT    /api/user/profile               Update profile
PUT    /api/user/password              Change password
GET    /api/payments/history           Payment history list
GET    /api/payments/subscription      Subscription info
GET    /api/user/credit-history        Credit usage log
POST   /api/audits/:id/rescan          Re-run scan
POST   /api/audits/:id/share           Generate shareable link
```

---

## Environment Variables

### Frontend (`.env` in project root)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:3001
```

### Backend (`backend/.env`)
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Never expose to frontend
SUPABASE_ANON_KEY=eyJ...               # Public anon key — used for current-password verification
ANTHROPIC_API_KEY=sk-ant-...
LEMONSQUEEZY_API_KEY=eyJ0...
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_VARIANT_ID_BASIC=...
LEMONSQUEEZY_VARIANT_ID_PRO=...
LEMONSQUEEZY_VARIANT_ID_ENTERPRISE=...
LEMONSQUEEZY_WEBHOOK_SECRET=...
SENDGRID_API_KEY=                       # Optional
SENDGRID_FROM_EMAIL=
FRONTEND_URL=http://localhost:5173
```

---

## Running the Project Locally

```bash
# Terminal 1 — Frontend (http://localhost:5173)
npm run dev

# Terminal 2 — Backend (http://localhost:3001)
cd backend && npm run dev
```

Both must be running for scanning to work. The frontend calls the backend API; the backend calls Supabase + Anthropic + LemonSqueezy.

---

## Known Issues & Gotchas

### Pre-existing TypeScript errors in scanService.ts
`backend/src/services/scanService.ts` has 3 pre-existing TS errors (missing `baseDomain` type annotation and `document`/`HTMLAnchorElement` DOM types in a Node.js context). These don't affect runtime since Puppeteer provides DOM APIs. Do not fix unless refactoring the scan service.

### `full_name` stored in Supabase auth user_metadata
Profile name is stored via `supabase.auth.admin.updateUserById()` user_metadata (not a DB column). This avoids a schema migration. The `GET /api/user/profile` endpoint reads it back via `admin.getUserById()`.

### Password change requires `SUPABASE_ANON_KEY` in backend `.env`
`PUT /api/user/password` verifies the current password by signing in via the anon client. Without this key the verification step falls back to service_role (which skips the check).

### Dead code deleted (Phase 3B complete)
All mock-data view files and the stray `@/` root directory have been removed.

### No "use client" directives
This is a Vite app, not Next.js. Never add `"use client"`. Remove it from any file that has it.

### Polling pattern
`AuditDetail.tsx` polls every 3s but uses `[id]` as the dependency array, not `[id, audit?.status]`. This means the interval runs continuously even after completion. When refactoring, check that the interval clears correctly when `status !== 'scanning'`.

### LemonSqueezy vs Stripe
The README and Pricing page say "Stripe" but the actual integration uses LemonSqueezy. Don't confuse the two. `LEMONSQUEEZY_VARIANT_ID_*` env vars control which products are available.

### Credits start at 1
New users get 1 free credit when they sign up (set in `supabase-schema.sql` via a trigger). This enables the "Get Free Scan" CTA on the landing page.

---

## Figma Design Reference

All screens are in the same Figma file. Node IDs for screens not yet implemented:

| Screen | Node ID | Status |
|--------|---------|--------|
| Audit Dashboard | `172:20570` | Pending fetch |
| Pricing | `263:59336` | Pending fetch |
| Scanning website | `105:16689` | Pending fetch |
| Landing (HowItWorks+Footer) | `220:44843` | Pending fetch |
| Audit results | `105:15858` | Pending fetch |
| Issues | `250:47714` | Pending fetch |
| Settings | `185:35236` | Pending fetch |
| Account | `263:63544` | Pending fetch |
| Notifications | `263:65079` | Pending fetch |
| Security | `263:65080` | Pending fetch |
| Plans & Credits | `185:35493` | Pending fetch |
| Payment History | `185:35736` | Pending fetch |
| Credit History | `185:35958` | Pending fetch |
| Buy Credits modal | `185:35553` | Pending fetch |
| Cancel Sub modal | `185:36009` | Pending fetch |
| Upgrade modal | `185:36220` | Pending fetch |
| Reactivate modal | `185:36490` | Pending fetch |
| Share Report modal | `105:15673` | Pending fetch |
| PDF Report | `105:16115` | Pending fetch |
| Onboarding | `210:58803` | Pending fetch |
| Tutorial | `210:58819` | Pending fetch |

**Important:** The Figma MCP has a daily call limit on the starter plan. Spread fetches across sessions (max ~4 screens per session). Always check which screens have already been fetched before requesting new ones.

---

## Implementation Plan Phases

Refer to `PRD.md` for full details. Summary:

| Phase | What | Status |
|-------|------|--------|
| 1A | Shared types, DashboardLayout, fix sidebar, restructure App.tsx routes | **Done** ✓ |
| 1B | Dashboard redesign (Figma `172:20570`) | Pending |
| 1C | NewScan redesign (Figma `105:16689`) | Pending |
| 1D | AuditDetail redesign (Figma `105:15858`, `250:47714`) | Pending |
| 1E | Pricing redesign (Figma `263:59336`) | Pending |
| 1F | HowItWorks + Footer redesign (Figma `220:44843`) | Pending |
| 2A | Settings pages (Account, Security, Notifications) | **Done** ✓ |
| 2B | Billing pages (PlansAndCredits, PaymentHistory, CreditHistory) | **Done** ✓ |
| 2C | API expansion — backend routes for profile, password, history | **Done** ✓ |
| 3A | Custom hooks (useAudits, useAudit, useCredits, usePayments) | **Done** ✓ |
| 3B | Remove mock data components | **Done** ✓ |
| Security | Helmet, rate limiting, SSRF, IDOR, TOCTOU, timing attack, error sanitization | **Done** ✓ |
| Tests | 18 test files, 133 tests — all pages, hooks, layouts | **Done** ✓ |
| 4A | Modals (BuyCredits, CancelSub, Upgrade, Reactivate, ShareReport) | Pending |
| 4B | PDF report (PdfReport component + pdf.ts lib) | Pending |
| 4C | Onboarding + Tutorial flows | Pending |
| 4D | Animations, skeletons, toasts | Pending |
| 5 | Cleanup: delete dead code, design consistency, responsive, E2E testing | Pending |

---

## Key User Flows (for testing)

1. **Unauthenticated:** `/` → `/pricing` → `/signup` → OTP → `/dashboard`
2. **Core flow:** `/dashboard` → `/scan` → scanning → `/audits/:id` → PDF download
3. **Settings:** `/settings` → `/settings/account` → `/settings/security`
4. **Billing:** `/settings/plans` → Buy Credits modal → LemonSqueezy → credit/payment history
5. **Reports:** `/reports` → filter → view → share

---

## Deployment Targets

| Layer | Platform |
|-------|----------|
| Frontend | Vercel — connect `vladun13/auditflow`, set env vars, auto-deploy on push to `main` |
| Backend | Render.com or Railway — build: `cd backend && npm install && npm run build`, start: `cd backend && npm start` |
| Database | Supabase (already hosted, production-ready) |
