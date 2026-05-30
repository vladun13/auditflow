# AuditFlow — Accessibility Audit Generator

**Live:** https://auditflow.me  
**GitHub:** https://github.com/vladun13/auditflow

A full-stack B2B SaaS tool that automatically generates WCAG-compliant accessibility audit reports for websites. Built with React, Express.js, Supabase, and Claude AI.

## Features

- **User Authentication** — Email/password + Google OAuth via Supabase
- **Website Scanning** — Automated crawling with Puppeteer + axe-core
- **AI-Powered Recommendations** — Claude generates plain-English fix instructions per violation
- **WCAG Scoring** — Automatic compliance scoring (A, AA, AAA levels)
- **PDF Reports** — Professional downloadable reports
- **Scan Packs** — Pay-as-you-go via LemonSqueezy (Free / Starter $29 / Pro $79 / Enterprise $149)
- **Responsive Design** — Mobile, tablet, and desktop layouts

## Tech Stack

### Frontend
- React 19 + TypeScript
- React Router v7 (client-side SPA)
- Tailwind CSS v4 + shadcn/ui
- Supabase JS client (auth)
- LemonSqueezy JS (payments)
- Vite 7 (build tool)

### Backend
- Node.js 20+ + Express 4
- TypeScript
- Puppeteer (headless Chrome crawling)
- @axe-core/puppeteer (WCAG testing)
- Anthropic Claude API (AI recommendations)
- LemonSqueezy API (payments + webhooks)
- helmet + express-rate-limit (security)

### Database
- Supabase (PostgreSQL + auth + RLS)
- Row Level Security on all tables
- Automatic user profile creation via trigger

## Quick Start

### Prerequisites

- Node.js 20.19+
- Supabase account
- Anthropic API key
- LemonSqueezy account

### 1. Clone and Install

```bash
npm install
cd backend && npm install && cd ..
```

### 2. Set Up Supabase

1. Create a project at https://supabase.com
2. Run `supabase-schema.sql` in the SQL Editor
3. Copy your project URL and API keys from Settings → API

### 3. Configure Environment Variables

**Frontend (`.env`):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:3001
```

**Backend (`backend/.env`):**
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
LEMONSQUEEZY_API_KEY=eyJ0...
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_VARIANT_ID_STARTER=...   # also accepted as LEMONSQUEEZY_VARIANT_ID_BASIC
LEMONSQUEEZY_VARIANT_ID_PRO=...
LEMONSQUEEZY_VARIANT_ID_ENTERPRISE=...
LEMONSQUEEZY_WEBHOOK_SECRET=...
FRONTEND_URL=http://localhost:5173
SENDGRID_API_KEY=        # optional
SENDGRID_FROM_EMAIL=
```

### 4. Run Development Servers

```bash
# Terminal 1 — Frontend (http://localhost:5173)
npm run dev

# Terminal 2 — Backend (http://localhost:3001)
cd backend && npm run dev
```

## Project Structure

```
.
├── src/                          # Frontend source
│   ├── types/index.ts            # Centralized types (Audit, Violation, Payment, etc.)
│   ├── contexts/AuthContext.tsx  # Supabase auth state + Google OAuth
│   ├── lib/
│   │   ├── api.ts                # API client (all backend calls)
│   │   ├── supabase.ts           # Supabase client init
│   │   └── utils.ts              # cn() helper
│   ├── layouts/
│   │   ├── DashboardLayout.tsx   # Sidebar + header + <Outlet/>
│   │   └── SettingsLayout.tsx    # Settings left nav + <Outlet/>
│   ├── hooks/
│   │   ├── useAudits.ts
│   │   ├── useAudit.ts           # Polls every 3s until scan completes
│   │   ├── useCredits.ts
│   │   └── usePayments.ts
│   ├── components/
│   │   ├── Navbar.tsx / Hero.tsx / Features.tsx / HowItWorks.tsx / Footer.tsx
│   │   ├── SocialProof.tsx / StatsBar.tsx / ComplianceBadges.tsx / Testimonials.tsx / CtaBanner.tsx
│   │   ├── modals/               # BuyCreditsModal, CancelSubscriptionModal, ReactivateModal,
│   │   │                         # ShareReportModal, RescanModal, PreviewModal
│   │   └── ui/                   # shadcn/ui primitives (65+ components)
│   └── pages/
│       ├── Landing.tsx / Login.tsx / SignUp.tsx / ForgotPassword.tsx / ResetPassword.tsx
│       ├── AuthCallback.tsx / EmailVerified.tsx / Pricing.tsx / FAQ.tsx / Terms.tsx / Privacy.tsx
│       ├── Onboarding.tsx / Tutorial.tsx
│       ├── DashboardNew.tsx / NewScan.tsx / AuditDetail.tsx / Reports.tsx
│       ├── PaymentSuccess.tsx / NotFound.tsx
│       └── settings/
│           ├── Account.tsx / Security.tsx / Notifications.tsx
│           ├── PlansAndCredits.tsx / PaymentHistory.tsx / CreditHistory.tsx
│
├── backend/src/
│   ├── server.ts                 # Express app, helmet, rate limiting, route mounts
│   ├── config/supabase.ts        # Supabase admin client (service_role)
│   ├── middleware/auth.ts        # JWT verification
│   ├── routes/
│   │   ├── auth.ts               # GET /auth/me
│   │   ├── audits.ts             # CRUD + scan + PDF (rate-limited per endpoint)
│   │   ├── payments.ts           # LemonSqueezy checkout + webhook
│   │   └── user.ts               # Credits + profile + password + credit history
│   ├── services/
│   │   ├── scanService.ts        # Puppeteer crawl + axe-core
│   │   ├── aiService.ts          # Claude AI explanations + fix steps
│   │   └── pdfService.ts         # PDF generation
│   └── utils/validateUrl.ts      # SSRF protection
│
├── public/_redirects             # Netlify SPA catch-all rewrite
├── supabase-schema.sql           # Full DB schema
├── render.yaml                   # Render.com backend blueprint
├── PRD.md                        # Product Requirements Document
├── CLAUDE.md                     # Claude Code project guide
└── SETUP_GUIDE.md                # Detailed setup walkthrough
```

## API Endpoints

### Auth
- `GET /auth/me` — Current user info

### Audits
- `POST /api/audits/create` — Create audit (rate-limited: 20/hr)
- `POST /api/audits/:id/scan` — Start scan, async (rate-limited: 20/hr)
- `GET /api/audits/:id` — Audit details + violations
- `GET /api/audits` — List user's audits
- `DELETE /api/audits/:id` — Delete audit
- `GET /api/audits/:id/report/pdf` — Download PDF

### Payments
- `POST /api/payments/checkout` — Create LemonSqueezy checkout session
- `POST /api/payments/webhook` — LemonSqueezy webhook (no auth, HMAC-verified) — grants credits via `meta.custom_data`
- `GET /api/payments/history` — Payment history
- `GET /api/payments/subscription` — Subscription info (pay-as-you-go only)

### User
- `GET /api/user/credits` — Credit balance
- `GET /api/user/profile` — Profile info
- `PUT /api/user/profile` — Update profile
- `PUT /api/user/password` — Change password
- `GET /api/user/credit-history` — Credit usage log

## Deployment

### Frontend (Netlify)

1. Push to GitHub, connect repo to Netlify
2. Build command: `npm run build` / Publish dir: `dist`
3. Set env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
4. SPA routing handled by `public/_redirects`

### Backend (Render.com)

1. Create Web Service from GitHub repo
2. Build command: `cd backend && npm install && npx puppeteer browsers install chrome && npm run build`
3. Start command: `cd backend && npm start`
4. Required env vars — all backend `.env` vars plus:
   - `PUPPETEER_CACHE_DIR=/opt/render/project/src/backend/.cache/puppeteer`
   - `FRONTEND_URL=https://auditflow.me` (no trailing slash)

### Database (Supabase)

Already hosted. Run `supabase-schema.sql` in SQL Editor once.

## Troubleshooting

### CORS errors
- `FRONTEND_URL` on Render must match your Netlify domain exactly (no trailing slash)

### 404 on page refresh (Netlify)
- Ensure `public/_redirects` is present: `/* /index.html 200`

### Puppeteer / Chrome not found on Render
- Set `PUPPETEER_CACHE_DIR` env var and include `npx puppeteer browsers install chrome` in build command

### Scanning timeouts
- Puppeteer may time out on slow or JS-heavy sites — increase timeout in `scanService.ts`

### Payment issues
- Variant ID env var for the Starter plan must be named `LEMONSQUEEZY_VARIANT_ID_STARTER` (or `LEMONSQUEEZY_VARIANT_ID_BASIC`)
- Verify all `LEMONSQUEEZY_VARIANT_ID_*` vars are the **variant** ID (numeric), not the product ID
- Webhook secret must match exactly what's configured in LemonSqueezy Settings → Webhooks
- Credits are granted via the `order_created` webhook using `meta.custom_data` — ensure the webhook endpoint is registered and `order_created` event is enabled
- The webhook route requires raw body for signature verification; `express.raw()` is mounted before `express.json()` in `server.ts` — do not reorder these

## Testing

```bash
# Run all tests (133 tests, Vitest + React Testing Library)
npm test

# Watch mode
npm run test:watch
```

## Roadmap

### Done (v1.0)
- Full landing page + auth pages
- Dashboard, NewScan, AuditDetail, Pricing, Reports
- All settings pages + billing pages
- All modals (BuyCredits, CancelSub, Reactivate, Share, Rescan, Preview)
- PDF report export
- Google OAuth
- Backend security hardening (helmet, rate limiting, SSRF, IDOR, TOCTOU)
- Deployed: frontend on Netlify, backend on Render
- Pricing redesign: Free / Starter $29 / Pro $79 / Enterprise $149 tiers
- FAQ page at /faq with accordion layout
- Onboarding + tutorial flows (/onboarding, /tutorial)
- AuthCallback, ResetPassword, EmailVerified pages
- Logged-in navbar with credits panel, notifications panel, profile panel
- End-to-end payment flow: LemonSqueezy checkout → webhook → credit grant working in production

### Upcoming (v1.1)
- Animations, loading skeletons, micro-interactions
- Rescan + share-link backend endpoints
- E2E test suite
- Email notifications (SendGrid)
- Scheduled recurring scans

## License

MIT — see LICENSE for details.

## Support

- Email: support@auditflow.me
- Issues: https://github.com/vladun13/auditflow/issues
- Full architecture: see `CLAUDE.md`
