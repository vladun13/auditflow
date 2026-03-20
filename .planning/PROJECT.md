# AuditFlow

## What This Is

AuditFlow is a B2B SaaS web application that automatically generates WCAG 2.1 accessibility audit reports for websites. Users enter a URL, the backend crawls the site with Puppeteer + axe-core, then Claude AI generates plain-English explanations and step-by-step fix instructions for each violation. Results appear as an interactive dashboard report and downloadable PDF. Business model is pay-as-you-go credit packs — each scan costs 1 credit.

## Core Value

Every developer who runs a scan gets actionable, code-level fix instructions for every violation — eliminating the hours wasted looking up WCAG docs.

## Requirements

### Validated

- ✓ Landing page (Hero, Features, HowItWorks, SocialProof, StatsBar, Testimonials, ComplianceBadges, CtaBanner, Footer) — existing
- ✓ Auth pages: Login, SignUp, ForgotPassword with Google OAuth — existing
- ✓ DashboardNew.tsx — functional with real API data — existing
- ✓ NewScan.tsx — functional (Crawl Depth dropdown, URL input, scan initiation) — existing
- ✓ AuditDetail.tsx — functional with polling, violation list, filters — existing
- ✓ Reports.tsx — reports list with status filtering and delete — existing
- ✓ Settings suite: Account, Security, Notifications, PlansAndCredits, PaymentHistory, CreditHistory — existing
- ✓ Backend: scan service (Puppeteer + axe-core), AI service (Claude), payment routes (LemonSqueezy) — existing
- ✓ Security: helmet, rate limiting, SSRF protection, IDOR fix, TOCTOU fix, timing-safe webhook, error sanitization — existing
- ✓ Custom hooks: useAudits, useAudit, useCredits, usePayments — existing
- ✓ Test suite: 18 test files, 133 tests passing (Vitest + RTL) — existing
- ✓ Deployed: frontend on Vercel, supabase-schema.sql applied — existing

### Active

- ✓ Dashboard redesign — 4 stat cards, shimmer skeleton, empty state, last-5 audits table — Validated in Phase 1
- ✓ Loading skeletons on Dashboard, Reports, AuditDetail — Validated in Phase 1
- ✓ NewScan Figma redesign — 2-column layout, WCAG checklist panel, animated scan progress, zero-credits blocking — Validated in Phase 2
- ✓ AuditDetail Figma redesign — circular SVG score ring, animated scanning state, collapsible violation cards with AI content, severity tab filter — Validated in Phase 2
- ✓ BuyCreditsModal + UpgradeModal — 3-pack selection, LemonSqueezy checkout, wired to DashboardLayout + NewScan — Validated in Phase 3
- [ ] CancelSubscriptionModal (node `185:36009`)
- [ ] UpgradeModal (node `185:36220`)
- [ ] ReactivateModal (node `185:36490`)
- ✓ ShareReportModal — clipboard copy, Sonner toast, wired to AuditHeader — Validated in Phase 3
- ✓ CancelSubscriptionModal + ReactivateModal — single-step flows, wired to PlansAndCredits — Validated in Phase 3
- ✓ PDF report generation — PdfReport component + pdf.ts lib — Validated in Phase 4
- ✓ Unauthenticated redirect preserving `?url=` param through login (AUTH-01 via sessionStorage) — Validated in Phase 2
- ✓ WelcomeModal (first-login popup, Figma node `210:58803`) — Validated in Phase 5
- ✓ Onboarding profile questions + Tutorial flow (5 steps) — Validated in Phase 5
- ✓ Loading skeletons throughout dashboard — Validated in Phase 1
- ✓ Framer Motion page transitions (AnimatePresence on Outlet, opacity fade 200ms) + responsive sidebar (useIsTablet, forceCollapsed, Radix tooltips) + global :focus-visible keyboard indicators — Validated in Phase 6
- [ ] E2E tests for critical flows (Playwright)

### Out of Scope

- Custom branding / white-label reports — complexity, v2 feature
- Team/organization accounts (multi-user) — requires significant schema changes
- CI/CD integrations (GitHub Actions, etc.) — v2 feature
- Scheduled / recurring scans — v2 feature
- Browser extension — out of scope entirely
- Stripe — using LemonSqueezy; do not add Stripe

## Context

- **Target personas:** Frontend devs (quick a11y fix lookup), QA engineers (sprint-level audits), PMs (legal compliance reporting)
- **Launch target:** 2026-06-01 public launch
- **Figma:** Daily fetch limit on starter plan — max ~4 screens per session; always fetch before implementing
- **Backend:** Running on port 3001; frontend polls audit status every 3s. scanService.ts has 3 pre-existing TS errors — do not touch unless refactoring
- **Credits:** New users get 1 free credit via Supabase trigger. DashboardLayout shows FREE badge + Upgrade button when credits ≤ 1
- **Google OAuth:** Requires Supabase dashboard config (Authentication → Providers → Google) — not yet done

## Constraints

- **Tech stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui — no framework changes
- **No "use client":** Vite SPA, not Next.js — never add this directive
- **Design system:** Light theme, `#4F46E5` indigo primary, white background — match Figma exactly
- **Figma MCP limit:** ~4 screens per session on starter plan
- **Testing:** Maintain 80%+ coverage; do not delete existing tests
- **Backend stability:** Backend is production-ready; minimize backend changes in UI phases

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| LemonSqueezy over Stripe | Already integrated, webhook live | ✓ Good |
| Pay-as-you-go credit packs (no subscription) | Lower friction for SMB buyers | — Pending validation |
| Supabase for auth + DB | All-in-one: auth + RLS + realtime | ✓ Good |
| Polling over WebSockets for scan status | Simpler; scan duration ~60s, polling sufficient | ✓ Good |
| shadcn/ui + Radix for UI components | Accessible headless primitives, matches design system | ✓ Good |
| user_metadata for full_name (not DB column) | Avoids schema migration | ⚠️ Revisit if profile features expand |
| Client-side routing (SPA) | Simpler deployment on Vercel | ✓ Good |

---
*Last updated: 2026-03-20 after Phase 6 (Polish & Responsive) completion*
