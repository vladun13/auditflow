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

## Current State (as of 2026-03-25)

### What is DONE (built and styled)
- Landing page: `Navbar`, `Hero`, `Features`, `HowItWorks`, `Footer` — fully redesigned to Figma light theme ✓
- Landing page new sections: `SocialProof`, `StatsBar`, `ComplianceBadges`, `Testimonials`, `CtaBanner` — added based on accessibilitycloud.com reference ✓
- Auth pages: `Login`, `SignUp`, `ForgotPassword` — redesigned and working ✓
- Google Sign-In button on `Login` and `SignUp` via Supabase OAuth (`signInWithGoogle()` in AuthContext) ✓
- `DashboardNew.tsx` — functional with real API data, uses `DashboardLayout`; dashboard redesigned to Figma with interactive elements ✓
- `NewScan.tsx` — functional, Crawl Depth dropdown redesigned to card-row layout ✓
- `AuditDetail.tsx` — redesigned to Figma: compliant state, issues sidebar, overview section, violation details, how-to-fix panel ✓
- `Pricing.tsx` — functional with LemonSqueezy, redesigned to light theme ✓
- `Reports.tsx` — extracted reports route with status filtering and delete ✓
- `src/types/index.ts` — centralized type definitions ✓
- `src/layouts/DashboardLayout.tsx` — shared sidebar + header + `<Outlet/>` for all auth pages ✓
- `src/layouts/SettingsLayout.tsx` — left nav tabs for settings sub-pages ✓
- `src/hooks/useAudits.ts`, `useAudit.ts`, `useCredits.ts`, `usePayments.ts` — all created ✓
- `src/pages/settings/Account.tsx` — profile info + danger zone (deactivate/delete account) ✓
- `src/pages/settings/Security.tsx`, `Notifications.tsx` ✓
- `src/pages/settings/PlansAndCredits.tsx` — full redesign: Plan Management tab, Payment History tab, Credit History tab ✓
- `App.tsx` — restructured with nested routes under `DashboardLayout` and `SettingsLayout` ✓
- `src/lib/api.ts` — expanded with `userApi.getProfile/updateProfile/updatePassword/getCreditHistory`, `paymentApi.getHistory/getSubscription` ✓
- Full backend: scanning service, AI service, payment routes, auth middleware ✓
- `backend/src/utils/validateUrl.ts` — SSRF protection utility ✓
- Backend security hardened: `helmet`, rate limiting, timing-safe webhook, IDOR fix, TOCTOU fix, error sanitization ✓
- Backend new routes: `GET/PUT /api/user/profile`, `PUT /api/user/password`, `GET /api/user/credit-history`, `GET /api/payments/history`, `GET /api/payments/subscription` ✓
- Test suite: 18 test files, 133 tests passing (Vitest + React Testing Library + happy-dom) ✓
- Plus Jakarta Sans font loaded globally (Google Fonts + Tailwind config + `index.css`) ✓
- `vercel.json` — SPA rewrite config for Vercel deployment ✓
- `tsconfig.app.json` — test files excluded from `tsc -b` (prevents Vercel build failures) ✓
- Frontend deployed to Vercel ✓
- Supabase database schema deployed ✓
- `Login.tsx` — redesigned: Google OAuth button restored, icon-only logo, new right-panel illustration ✓
- `SignUp.tsx` — same illustration as Login (shared design), `h-screen overflow-hidden` full-height layout ✓
- `Hero.tsx` — Crawl Depth dropdown redesigned: card-row list (1–5 pages with icon + label + description) ✓
- `DashboardLayout.tsx` — FREE badge + Upgrade button shown for free-tier users (`credits <= 1`) ✓
- `src/pages/PaymentSuccess.tsx` — payment success page ✓
- `src/pages/NotFound.tsx` — 404 page ✓
- **Modals — all implemented ✓**
  - `BuyCreditsModal.tsx` — 3-step: amount selection (presets + custom) → purchase confirmation → success screen ✓
  - `CancelSubscriptionModal.tsx` — 2-step: radio reason list + comments textarea → cancellation confirmed screen ✓
  - `ReactivateModal.tsx` — confirm reactivation with next billing date + success toast ✓
  - `ShareReportModal.tsx` — share report link flow ✓
  - `RescanModal.tsx` — rescan confirmation flow ✓
  - `PreviewModal.tsx` — report preview ✓
- **PDF report** — `PdfReport.tsx` component + `pdf.ts` lib redesigned to Figma ✓
- **Payment History tab** — full redesign: searchable/filterable table (Date, Invoice number, Amount, Status, Actions), status badges (Pending/Succeeded/Completed), Eye + Download icons with tooltips, Invoice Details modal, pagination with page-size selector ✓
- **Credit History tab** — full redesign: same table pattern with Amount (+N green / −N red) and Balance columns, always-active action icons, shared Invoice Details modal, pagination ✓
- **Cancel Subscription flow** — reasons modal → success screen → post-cancellation state: "Restore Plan" button, credits expiry warning banner, "Reactivate Subscription" link ✓
- **Reactivate Subscription flow** — confirmation modal with billing amount + date → success toast → page returns to active state ✓
- `DashboardNew.tsx` — dashboard redesigned with status badges, filters, scan cards, interactive elements ✓
- `StatusBadge` component in `src/components/dashboard/StatusBadge.tsx` ✓
- `render.yaml` — Render.com Blueprint config for backend deployment ✓
- Backend deployed to Render.com at `https://auditflow-zi2m.onrender.com` ✓
- `backend/tsconfig.json` — added `"dom"` to `lib` so Puppeteer `page.evaluate()` DOM types compile ✓
- `backend/src/server.ts` — `app.set('trust proxy', 1)` added for Render's reverse proxy (fixes rate-limiter X-Forwarded-For warning) ✓
- `VITE_API_URL` set on Vercel → `https://auditflow-zi2m.onrender.com` ✓
- Vercel env vars all set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` ✓

### What is NOT YET DONE (pending implementation)
- Figma redesigns: `NewScan` (needs Figma fetch for `105:16689`)
- Unauthenticated redirect preserving `?url=` param through login flow
- Replace placeholder stats in `StatsBar.tsx` with real API data when available
- Replace placeholder company names in `SocialProof.tsx` with real customer logos
- Enable Google OAuth provider in Supabase dashboard (Authentication → Providers → Google)
- Puppeteer Chrome cache on Render: must set `PUPPETEER_CACHE_DIR=/opt/render/project/src/backend/.cache/puppeteer` as Render env var, and Render build command must be `cd backend && npm install && npx puppeteer browsers install chrome && npm run build`
- Backend endpoints for rescan and share: `POST /api/audits/:id/rescan`, `POST /api/audits/:id/share`
- Onboarding + Tutorial flows (Figma `210:58803`, `210:58819`)
- Animations, loading skeletons, micro-interactions (Phase 4D)
- E2E testing suite (Phase 5)

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
│   │   ├── Landing.tsx               # Public landing page (all sections assembled) ✓
│   │   ├── Login.tsx                 # Auth — redesigned + Google OAuth ✓
│   │   ├── SignUp.tsx                # Auth — redesigned + Google OAuth ✓
│   │   ├── ForgotPassword.tsx        # Auth — redesigned ✓
│   │   ├── Pricing.tsx               # Pricing — redesigned to light theme ✓
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
│   │   ├── HowItWorks.tsx            # Landing how-it-works — redesigned ✓
│   │   ├── Footer.tsx                # Landing footer — redesigned ✓
│   │   ├── SocialProof.tsx           # "Trusted by..." company strip ✓
│   │   ├── StatsBar.tsx              # 4 headline stats (pages/violations/AI fix rate/speed) ✓
│   │   ├── ComplianceBadges.tsx      # WCAG/Section 508/ADA/EN 301 549/AODA pills ✓
│   │   ├── Testimonials.tsx          # 3 testimonial cards (Dev/QA/PM personas) ✓
│   │   ├── CtaBanner.tsx             # Indigo full-width CTA banner above footer ✓
│   │   ├── sidebar.tsx               # Dashboard sidebar
│   │   ├── modals/                   # All implemented ✓
│   │   │   ├── BuyCreditsModal.tsx       # 3-step: amount → confirm → success ✓
│   │   │   ├── CancelSubscriptionModal.tsx  # reasons → cancelled screen ✓
│   │   │   ├── ReactivateModal.tsx       # confirm reactivation ✓
│   │   │   ├── ShareReportModal.tsx      # share report link ✓
│   │   │   ├── RescanModal.tsx           # rescan confirmation ✓
│   │   │   └── PreviewModal.tsx          # report preview ✓
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
| Vercel | Frontend hosting — deployed at `https://auditflow-two.vercel.app` |
| Render.com | Backend hosting — deployed at `https://auditflow-zi2m.onrender.com` (free tier, spins down after 15min inactivity) |

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

### Implemented endpoints (added 2026-03-18)
```
GET    /api/user/profile               Get user profile (full_name from user_metadata)
PUT    /api/user/profile               Update profile
PUT    /api/user/password              Change password (verifies current via authClient)
GET    /api/payments/history           Payment history list
GET    /api/payments/subscription      Subscription info
GET    /api/user/credit-history        Credit usage log (synthesized from payments + audits)
```

### Planned endpoints (not yet implemented)
```
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

### Render.com backend deployment
Render build command: `cd backend && npm install && npx puppeteer browsers install chrome && npm run build`
Start command: `cd backend && npm start`
Root Directory: leave blank (use `cd backend &&` in commands instead — the Root Directory field has a space-injection bug in Render's UI).
Required env var: `PUPPETEER_CACHE_DIR=/opt/render/project/src/backend/.cache/puppeteer` — without this, Chrome installs during build but can't be found at runtime (different filesystem context on free tier).
`FRONTEND_URL` must have no trailing slash or CORS preflight will fail.

### Pre-existing TypeScript errors in scanService.ts
`backend/src/services/scanService.ts` has 3 pre-existing TS errors (missing `baseDomain` type annotation and `document`/`HTMLAnchorElement` DOM types in a Node.js context). These don't affect runtime since Puppeteer provides DOM APIs. Do not fix unless refactoring the scan service.

### `full_name` stored in Supabase auth user_metadata
Profile name is stored via `supabase.auth.admin.updateUserById()` user_metadata (not a DB column). This avoids a schema migration. The `GET /api/user/profile` endpoint reads it back via `admin.getUserById()`.

### Password change requires `SUPABASE_ANON_KEY` in backend `.env`
`PUT /api/user/password` verifies the current password by signing in via the anon client. Without this key the verification step falls back to service_role (which skips the check).

### Dead code deleted (Phase 3B complete)
All mock-data view files (`dashboard-view.tsx`, `scan-view.tsx`, `reports-view.tsx`, `audit-results-view.tsx`), the stray `@/` root directory, and deprecated `Dashboard.tsx` have been removed.

### Google OAuth requires Supabase dashboard setup
`signInWithGoogle()` in `AuthContext` calls `supabase.auth.signInWithOAuth({ provider: 'google' })`. This will 400 until Google is enabled in the Supabase project: Authentication → Providers → Google → enable + add Client ID/Secret.

### Vercel deployment
Frontend is deployed. Build command: `npm run build` (`tsc -b && vite build`). Test files are excluded from `tsconfig.app.json` so they don't break the production build. `vercel.json` handles SPA rewrites. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` in Vercel project settings.

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
| Audit Dashboard | `172:20570` | **Implemented** ✓ |
| Pricing | `263:59336` | **Implemented** ✓ |
| Scanning website | `105:16689` | Pending fetch |
| Landing (HowItWorks+Footer) | `220:44843` | **Implemented** ✓ |
| Audit results | `105:15858` | **Implemented** ✓ |
| Issues | `250:47714` | **Implemented** ✓ |
| Settings | `185:35236` | **Implemented** ✓ |
| Account | `263:63544` | **Implemented** ✓ |
| Notifications | `263:65079` | **Implemented** ✓ |
| Security | `263:65080` | **Implemented** ✓ |
| Plans & Credits | `185:35493` | **Implemented** ✓ |
| Payment History | `185:35736` | **Implemented** ✓ |
| Credit History | `185:35958` | **Implemented** ✓ |
| Buy Credits modal | `185:35553` | **Implemented** ✓ |
| Cancel Sub modal | `185:36009` | **Implemented** ✓ |
| Upgrade modal | `185:36220` | **Implemented** ✓ |
| Reactivate modal | `185:36490` | **Implemented** ✓ |
| Share Report modal | `105:15673` | **Implemented** ✓ |
| PDF Report | `105:16115` | **Implemented** ✓ |
| Onboarding | `210:58803` | Pending |
| Tutorial | `210:58819` | Pending |

**Important:** The Figma MCP has a daily call limit on the starter plan. Spread fetches across sessions (max ~4 screens per session). Always check which screens have already been fetched before requesting new ones.

---

## Implementation Plan Phases

Refer to `PRD.md` for full details. Summary:

| Phase | What | Status |
|-------|------|--------|
| 1A | Shared types, DashboardLayout, fix sidebar, restructure App.tsx routes | **Done** ✓ |
| 1B | Dashboard redesign (Figma `172:20570`) | **Done** ✓ |
| 1C | NewScan redesign (Figma `105:16689`) | Pending — Figma not yet fetched |
| 1D | AuditDetail redesign (Figma `105:15858`, `250:47714`) | **Done** ✓ |
| 1E | Pricing redesign (Figma `263:59336`) | **Done** ✓ |
| 1F | HowItWorks + Footer redesign (Figma `220:44843`) | **Done** ✓ |
| Landing+ | SocialProof, StatsBar, ComplianceBadges, Testimonials, CtaBanner | **Done** ✓ |
| 2A | Settings pages (Account, Security, Notifications) | **Done** ✓ |
| 2B | Billing pages (PlansAndCredits, PaymentHistory, CreditHistory) — full table redesign | **Done** ✓ |
| 2C | API expansion — backend routes for profile, password, history | **Done** ✓ |
| 3A | Custom hooks (useAudits, useAudit, useCredits, usePayments) | **Done** ✓ |
| 3B | Remove mock data components | **Done** ✓ |
| Security | Helmet, rate limiting, SSRF, IDOR, TOCTOU, timing attack, error sanitization | **Done** ✓ |
| Tests | 18 test files, 133 tests — all pages, hooks, layouts | **Done** ✓ |
| Deploy | Vercel frontend deploy + vercel.json + tsconfig build fix | **Done** ✓ |
| Auth+ | Google OAuth on Login/SignUp | **Done** ✓ (requires Supabase dashboard config) |
| 4A | Modals (BuyCredits, CancelSub, Reactivate, ShareReport, Rescan, Preview) | **Done** ✓ |
| 4B | PDF report (PdfReport component + pdf.ts lib) | **Done** ✓ |
| 4C | Onboarding + Tutorial flows | Pending |
| 4D | Animations, skeletons, toasts | Pending |
| 5 | Cleanup: design consistency, responsive polish, E2E testing | Pending |

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

---

## gstack

**Always use `/browse` from gstack for all web browsing tasks.** Never use `mcp__claude-in-chrome__*` tools.

### Setup (one-time, per developer)

```bash
git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup
```

Requires [bun](https://bun.sh) — install with `curl -fsSL https://bun.sh/install | bash` if not present.

### Available skills

| Skill | Purpose |
|-------|---------|
| `/browse` | Headless browser — fetch pages, screenshots, interact with web UIs |
| `/office-hours` | Open-ended Q&A and consultation |
| `/plan-ceo-review` | Review a plan from a CEO perspective |
| `/plan-eng-review` | Review a plan from an engineering perspective |
| `/plan-design-review` | Review a plan from a design perspective |
| `/design-consultation` | Get design feedback and recommendations |
| `/review` | Code review |
| `/ship` | Ship a feature end-to-end |
| `/qa` | Full QA pass |
| `/qa-only` | QA without shipping |
| `/design-review` | Visual/UX design review |
| `/setup-browser-cookies` | Configure browser cookies for authenticated browsing |
| `/retro` | Run a retrospective |
| `/investigate` | Deep-dive investigation of a problem |
| `/document-release` | Generate release documentation |
| `/codex` | Codebase knowledge lookup |
| `/careful` | Extra-careful mode for risky changes |
| `/freeze` | Freeze a file or directory from edits |
| `/guard` | Guard rails for a task |
| `/unfreeze` | Unfreeze a frozen file or directory |
| `/gstack-upgrade` | Upgrade gstack to the latest version |
