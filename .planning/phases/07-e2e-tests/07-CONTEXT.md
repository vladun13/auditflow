# Phase 7: E2E Tests - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase installs Playwright and writes automated E2E tests covering the 5 critical user flows: login, run a scan, view audit results, download PDF, and buy credits. Tests run in headless Chromium against the real dev stack (Vite at port 5174 + Express backend at port 3001). CI-compatible.

</domain>

<decisions>
## Implementation Decisions

### Playwright Setup & Infrastructure
- Test directory: `e2e/` at project root — standard Playwright convention, kept separate from Vitest unit tests in `src/`
- Base URL: `http://localhost:5174` (Vite dev server — confirmed running on 5174, not 5173)
- Authentication: Test credentials via env vars `E2E_EMAIL` and `E2E_PASSWORD` — no hardcoding, CI-friendly
- Browser: Chromium only — sufficient for CI confidence, dramatically faster than cross-browser

### Test Flow Coverage
- Signup: Skip real Supabase signup (requires email OTP) — test auth via direct login with pre-existing test user
- Scan flow: Call real backend at `http://localhost:3001` — test user must have at least 1 credit available
- PDF download: Click Download PDF → assert Playwright `download` event fires — no file content validation needed (unit-tested already)
- Buy Credits: Click Buy Credits → assert LemonSqueezy checkout URL opens in new tab — stop at redirect (cannot test payment in sandbox)

### CI & Test Reliability
- Always headless: `headless: true` in Playwright config — required for CI-compatible execution
- Auth reuse: `storageState` to save auth cookies after global setup login, reuse across all test files — no per-test login
- Retries: `retries: 1` in CI — one automatic retry handles transient timing issues without masking real failures
- Artifacts: `screenshot: 'only-on-failure'`, traces on first retry — enough for debugging, no CI storage bloat

### Claude's Discretion
- Exact `playwright.config.ts` structure and timeout values
- Global setup file path and auth state file path (e.g., `e2e/auth.json`)
- Whether to use Page Object Model (POM) pattern or inline locators for these 5 flows
- Specific selectors/locators for each UI element (read from actual component code)
- Whether to add `e2e` script to `package.json` or use `npx playwright test` directly

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Auth: `src/contexts/AuthContext.tsx` — `signIn(email, password)` calls Supabase `signInWithPassword`; JWT stored by Supabase SDK
- Routes: `/login`, `/dashboard`, `/scan`, `/audits/:id`, `/reports` — all React Router v7 routes
- Scan flow: `POST /api/audits/create` → `POST /api/audits/:id/scan` → poll `GET /api/audits/:id` until `status === 'completed'`
- PDF download: `GET /api/audits/:id/report/pdf` — triggered by Download PDF button in AuditDetail
- Buy Credits: Opens `BuyCreditsModal` → calls `POST /api/payments/checkout` → redirects to LemonSqueezy URL
- Credits badge button in DashboardLayout header: plain `<button>` with credits count text

### Established Patterns
- No Playwright yet — fresh install needed (`@playwright/test`)
- Existing test framework: Vitest + RTL + happy-dom (unit/component tests only)
- Backend runs on port 3001, frontend on port 5174
- Auth persisted via Supabase session — `localStorage` key format: `sb-{projectRef}-auth-token`

### Integration Points
- `package.json` — add `playwright` dev dependency and `e2e` test script
- `.env` at project root — add `E2E_EMAIL`, `E2E_PASSWORD` (also document in `.env.example` if it exists)
- `playwright.config.ts` at project root
- `e2e/` directory — all test files and global setup

</code_context>

<specifics>
## Specific Ideas

- Dev server confirmed on port 5174 (not 5173 as originally assumed) — all baseURL references must use 5174
- Test user must have credits pre-seeded in the database; plan should document this prerequisite

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
