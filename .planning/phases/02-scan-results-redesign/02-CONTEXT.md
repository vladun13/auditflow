# Phase 2: Scan & Results Redesign - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 delivers polished redesigns of NewScan.tsx and AuditDetail.tsx to match the Figma design, plus the AUTH-01 URL preservation flow. Scope: 2-column NewScan layout with animated progress panel, zero-credits block, circular WCAG score ring, collapsed violation cards with AI content, severity tab filters, scanning animated state, and sessionStorage-based URL param preservation through login.

</domain>

<decisions>
## Implementation Decisions

### NewScan Page Interaction
- Right panel idle state: static "What We'll Check" WCAG checklist with icons (Perceivable, Operable, Understandable, Robust + sub-items)
- Right panel during active scanning: animated progress steps replace checklist (Crawling → Analyzing → Generating AI fixes), spinner per active step
- Zero credits block: disable scan button + inline banner "No credits remaining. Upgrade to continue." with Upgrade CTA button
- URL pre-fill from `?url=` query param (SCAN-04): silently pre-fill the URL input field, no toast

### AuditDetail Results Page
- Score ring: circular SVG ring, score number centered inside, WCAG level label below, green ≥80 / yellow ≥60 / red <60
- Violation cards: collapsed by default — click to expand AI explanation ("Why This Matters") + fix steps ("How to Fix")
- Severity filter UI: tab row — All / Critical / Serious / Moderate / Minor with count badges per tab
- Scanning in-progress state: animated "Scanning…" view with step indicators (Crawling pages → Running axe-core → Generating AI fixes), replaces results table until complete

### Auth Flow & PDF
- URL preservation (AUTH-01): store `?url=` value in `sessionStorage` before redirecting to /login; restore and pre-fill on /scan after successful auth
- Post-auth redirect: silent — land on /scan with URL pre-filled, scan button ready immediately
- Download PDF button (AUDIT-05): top-right of AuditDetail header, alongside any action buttons
- PDF while service is stub (Phase 4 not yet built): button visible, on click shows toast "PDF report generation coming soon"

### Claude's Discretion
- Exact Figma visual layout — match Figma file `1YlIhl3QmvzlH8fKo8qBq5` all Phase 2 screens
- SVG ring stroke width and animation
- WCAG checklist item copy and icon choices
- Scan progress step copy and timing

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/format.ts` (Phase 1) — `getScoreColor`, `getScoreBg`, `formatRelativeTime` available
- `src/components/ui/skeleton.tsx` — shimmer skeleton available
- `src/components/ui/tabs.tsx` — shadcn Tabs component available for severity filter
- `src/hooks/useAudit.ts` — polls audit status every 3s, returns `{ audit, loading }`
- `src/hooks/useCredits.ts` — returns `{ credits }`
- `auditApi.create()`, `auditApi.scan()` — existing in `src/lib/api.ts`
- `src/contexts/AuthContext.tsx` — `signIn`, `user` available for auth redirect logic

### Established Patterns
- Score color: `getScoreColor`/`getScoreBg` from `src/lib/format.ts` (Phase 1 pattern)
- Skeleton: shadcn `<Skeleton>` with `animate-pulse` (Phase 1 pattern)
- No hardcoded hex colors — Tailwind tokens or CSS variables only
- Function declaration components (not arrow function exports)
- `cn()` from `@/lib/utils` for conditional classNames

### Integration Points
- `NewScan.tsx` → `useCredits` for credits check, `auditApi.create + scan` for scan initiation
- `AuditDetail.tsx` → `useAudit` hook for polling, renders violations list
- `AuthContext` → check `user` state on /scan mount to detect post-login redirect
- `Hero.tsx` → already has URL input; needs to store to sessionStorage before navigating to /login
- `Login.tsx` / `SignUp.tsx` → after successful auth, redirect to /scan (preserving stored URL)

</code_context>

<specifics>
## Specific Ideas

- **Figma URL:** https://www.figma.com/design/1YlIhl3QmvzlH8fKo8qBq5/Auditflow-Wireframes?node-id=17-20021 — fetch all Phase 2 screens before implementing
- User said: "make sure all screens from figma are implemented" — all Phase 2 screens (NewScan, AuditDetail, scanning state) must match Figma exactly

</specifics>

<deferred>
## Deferred Ideas

- AUDIT-05 full PDF download — deferred to Phase 4 (pdfService is stub); Phase 2 adds button with "coming soon" toast
- Pre-existing AuditDetail.test.tsx failures (6 tests) documented in Phase 1 deferred-items.md — address in Phase 2 test updates

</deferred>
