# Structure

**Project:** AuditFlow
**Mapped:** 2026-03-19

## Directory Layout

```
/
├── src/                              # Frontend (Vite + React)
│   ├── App.tsx                       # Route definitions — CRITICAL FILE
│   ├── index.css                     # Design tokens (CSS variables)
│   ├── main.tsx                      # React entry point
│   ├── types/
│   │   └── index.ts                  # Centralized interfaces (Audit, Violation, etc.)
│   ├── contexts/
│   │   └── AuthContext.tsx           # Supabase auth state
│   ├── lib/
│   │   ├── api.ts                    # All API calls (apiCall helper + auditApi/userApi/paymentApi)
│   │   ├── supabase.ts               # Supabase client initialization
│   │   └── utils.ts                  # cn() classname helper
│   ├── layouts/
│   │   ├── DashboardLayout.tsx       # Sidebar + header + <Outlet/>
│   │   └── SettingsLayout.tsx        # Settings left nav + <Outlet/>
│   ├── hooks/
│   │   ├── useAudits.ts              # wraps auditApi.list()
│   │   ├── useAudit.ts               # wraps auditApi.get() with polling
│   │   ├── useCredits.ts             # wraps userApi.getCredits()
│   │   └── usePayments.ts            # wraps payment/credit history
│   ├── test/
│   │   ├── setup.ts                  # Vitest global setup (jest-dom matchers)
│   │   └── helpers.tsx               # makeAudit() factory, renderWithRouter()
│   ├── pages/
│   │   ├── Landing.tsx               # Public landing page
│   │   ├── Login.tsx                 # Auth — redesigned + Google OAuth
│   │   ├── SignUp.tsx                # Auth — redesigned + Google OAuth
│   │   ├── ForgotPassword.tsx        # Auth — redesigned
│   │   ├── Pricing.tsx               # Pricing — redesigned to light theme
│   │   ├── DashboardNew.tsx          # Active dashboard
│   │   ├── NewScan.tsx               # Scan form — functional, needs Figma redesign
│   │   ├── Reports.tsx               # Reports list with filtering
│   │   ├── AuditDetail.tsx           # Results — functional, needs Figma redesign
│   │   └── settings/
│   │       ├── Account.tsx
│   │       ├── Security.tsx
│   │       ├── Notifications.tsx
│   │       ├── PlansAndCredits.tsx
│   │       ├── PaymentHistory.tsx
│   │       └── CreditHistory.tsx
│   └── components/
│       ├── Navbar.tsx                # Landing navbar
│       ├── Hero.tsx                  # Landing hero (custom Crawl Depth dropdown)
│       ├── Features.tsx
│       ├── HowItWorks.tsx
│       ├── Footer.tsx
│       ├── SocialProof.tsx
│       ├── StatsBar.tsx
│       ├── ComplianceBadges.tsx
│       ├── Testimonials.tsx
│       ├── CtaBanner.tsx
│       ├── sidebar.tsx               # Dashboard sidebar
│       ├── modals/                   # PENDING — not yet implemented
│       └── ui/                       # shadcn/ui components (65+ components)
│
├── backend/                          # Node.js Express API
│   └── src/
│       ├── server.ts                 # Express app entry point
│       ├── config/
│       │   └── supabase.ts           # Supabase admin client
│       ├── middleware/
│       │   └── auth.ts               # JWT verification middleware
│       ├── routes/
│       │   ├── auth.ts               # GET /auth/me
│       │   ├── audits.ts             # CRUD + scan + PDF
│       │   ├── payments.ts           # LemonSqueezy checkout + webhook
│       │   └── user.ts               # Credits, profile, password
│       ├── services/
│       │   ├── scanService.ts        # Puppeteer crawl + axe-core + DB save
│       │   ├── aiService.ts          # Claude API — explanations + fix steps
│       │   └── pdfService.ts         # PDF generation (placeholder)
│       └── utils/
│           └── validateUrl.ts        # SSRF protection
│
├── .planning/                        # GSD planning artifacts
│   ├── codebase/                     # Codebase maps (this directory)
│   └── ui-reviews/                   # UI review artifacts
│
├── supabase-schema.sql               # Full DB schema
├── PRD.md                            # Product Requirements Document
├── CLAUDE.md                         # Project context for Claude Code
├── SETUP_GUIDE.md
├── LEMONSQUEEZY_SETUP.md
└── vercel.json                       # SPA rewrite config
```

## Key Locations

| What | Where |
|------|-------|
| Route definitions | `src/App.tsx` |
| API calls | `src/lib/api.ts` |
| Auth state | `src/contexts/AuthContext.tsx` |
| Shared types | `src/types/index.ts` |
| Design tokens | `src/index.css` |
| shadcn components | `src/components/ui/` |
| Backend entry | `backend/src/server.ts` |
| Scan logic | `backend/src/services/scanService.ts` |
| AI enrichment | `backend/src/services/aiService.ts` |
| DB schema | `supabase-schema.sql` |

## Routing Structure

```
/                         → Landing (public)
/login                    → Login
/signup                   → SignUp
/forgot-password          → ForgotPassword
/pricing                  → Pricing

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

## Naming Conventions

- **Pages:** PascalCase, suffix-free (e.g., `DashboardNew`, `AuditDetail`)
- **Components:** PascalCase (e.g., `ScoreRing`, `ViolationCard`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAudits`, `useCredits`)
- **API namespaces:** `auditApi`, `userApi`, `paymentApi` in `src/lib/api.ts`
- **Test files:** Co-located as `*.test.tsx` next to source files
- **CSS:** Tailwind utility classes + CSS variables via `cn()` helper

## Test File Locations

```
src/pages/*.test.tsx          # Page-level tests
src/components/*.test.tsx     # Component tests
src/hooks/*.test.ts           # Hook tests
src/layouts/*.test.tsx        # Layout tests
src/test/setup.ts             # Global test setup
src/test/helpers.tsx          # Test utilities (makeAudit, renderWithRouter)
```
