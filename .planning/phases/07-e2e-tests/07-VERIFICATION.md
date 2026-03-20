---
phase: 07-e2e-tests
verified: 2026-03-20T14:00:00Z
status: gaps_found
score: 5/6 must-haves verified
gaps:
  - truth: "Credits E2E test opens BuyCreditsModal and asserts LemonSqueezy popup/navigation"
    status: partial
    reason: "credits.spec.ts verifies the modal opens and pack buttons/credit text are visible, but does NOT assert a LemonSqueezy popup or redirect navigation. The test stops at the modal boundary rather than completing the checkout entry point assertion declared in must_haves."
    artifacts:
      - path: "e2e/credits.spec.ts"
        issue: "No waitForEvent('popup') or waitForURL(/lemonsqueezy/) assertion present. Modal open + buy button visibility is verified, but LemonSqueezy navigation is not."
    missing:
      - "Either add waitForEvent('popup') with popup.url() assertion, or add waitForURL(/lemonsqueezy/) if checkout navigates the current page, to satisfy the declared must_have truth"
human_verification:
  - test: "Run full E2E suite against live servers"
    expected: "All 5 spec files pass: auth, scan, results, pdf, credits"
    why_human: "Tests require running frontend (port 5174), backend (port 3001), a real Supabase test user with credits, and env vars E2E_EMAIL / E2E_PASSWORD. Cannot execute in static analysis."
  - test: "Verify PDF download filename"
    expected: "download.suggestedFilename() contains 'auditflow-report'"
    why_human: "Depends on runtime html2pdf.js behavior and the actual filename the backend/frontend sets on the download anchor element."
  - test: "Verify credits modal trigger selector"
    expected: "getByRole('button', { name: /buy credits|upgrade/i }) locates the correct button in DashboardLayout header"
    why_human: "The DashboardLayout FREE-tier upgrade button text may not match the regex if user has credits — behavior depends on live user credit state."
---

# Phase 7: E2E Tests Verification Report

**Phase Goal:** Critical user flows are verified end-to-end with automated Playwright tests, providing confidence for launch
**Verified:** 2026-03-20T14:00:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Login E2E test navigates to /login, fills credentials, submits, and asserts redirect to /dashboard | VERIFIED | `e2e/auth.spec.ts` fills `#email` + `#password`, clicks `button[type="submit"]`, calls `waitForURL('**/dashboard')` and asserts `toHaveURL(/dashboard/)`. Fresh context override via `test.use({ storageState: { cookies: [], origins: [] } })` confirmed. |
| 2 | Scan E2E test starts a new scan and waits for completion with extended timeout | VERIFIED | `e2e/scan.spec.ts` has `test.setTimeout(120_000)`, fills `input[type="url"]`, clicks Start Scan button, waits for `/audits/` URL, then awaits `getByText(/WCAG|Score|violations/i)` with `{ timeout: 120_000 }`. |
| 3 | Results E2E test asserts WCAG score and violation cards are visible on a completed audit | VERIFIED | `e2e/results.spec.ts` navigates to `/reports`, clicks first audit card via `[class*="cursor-pointer"]`, waits for `/audits/` URL, then asserts both `WCAG|Score` and `violations` text are visible. |
| 4 | PDF E2E test clicks Download PDF and asserts a Playwright download event fires | VERIFIED | `e2e/pdf.spec.ts` uses `page.waitForEvent('download')` before clicking `button[name=/download pdf/i]`, awaits the download, and asserts `suggestedFilename()` contains `'auditflow-report'`. |
| 5 | Credits E2E test opens BuyCreditsModal and asserts LemonSqueezy popup/navigation | PARTIAL | `e2e/credits.spec.ts` asserts `getByRole('dialog')` is visible and buy button + credit text appear inside it. The test does NOT assert a LemonSqueezy popup or redirect. The SUMMARY documents this as a deliberate boundary decision, but it deviates from the must_have truth as declared in the PLAN. |
| 6 | All tests run headless in CI mode with npx playwright test | VERIFIED | `playwright.config.ts` sets `headless: true`, `retries: process.env.CI ? 1 : 0`, `workers: process.env.CI ? 1 : undefined`, `reporter: 'html'`. Playwright 1.58.2 installed and confirmed via `npx playwright --version`. `package.json` has `"e2e": "playwright test"` script. |

**Score:** 5/6 truths verified (1 partial)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `playwright.config.ts` | Playwright configuration with Chromium, baseURL 5174, storageState, headless | VERIFIED | All required fields present: `baseURL: 'http://localhost:5174'`, `headless: true`, `storageState: 'e2e/auth.json'`, `globalSetup: './e2e/global-setup.ts'`, `projects: [{ name: 'chromium' }]` |
| `e2e/global-setup.ts` | One-time login saving storageState to e2e/auth.json | VERIFIED | Launches chromium, navigates to `http://localhost:5174/login`, fills `#email`/`#password` from env vars, waits for dashboard, saves `storageState({ path: 'e2e/auth.json' })` |
| `e2e/auth.spec.ts` | Login flow E2E test | VERIFIED | Contains `test('user can log in and reach dashboard', ...)`, fresh storageState override, fills credentials, asserts dashboard redirect |
| `e2e/scan.spec.ts` | Run scan flow E2E test | VERIFIED | Contains `test.setTimeout(120_000)`, `input[type="url"]` fill, button click, `waitForURL(/\/audits\//)`, 120s completion wait |
| `e2e/results.spec.ts` | View results flow E2E test | VERIFIED | Navigates to `/reports`, clicks audit card, waits for `/audits/` URL, asserts WCAG/Score text and violations text visible |
| `e2e/pdf.spec.ts` | Download PDF flow E2E test | VERIFIED | Uses `waitForEvent('download')`, clicks Download PDF button, asserts `suggestedFilename()` contains `'auditflow-report'` |
| `e2e/credits.spec.ts` | Buy credits flow E2E test | PARTIAL | Opens BuyCreditsModal (dialog role), asserts buy button and credit text visible — but does not assert LemonSqueezy popup or redirect navigation |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `playwright.config.ts` | `e2e/global-setup.ts` | `globalSetup` option | WIRED | Line 17: `globalSetup: './e2e/global-setup.ts'` present |
| `playwright.config.ts` | `e2e/auth.json` | `storageState` in use config | WIRED | Line 14: `storageState: 'e2e/auth.json'` present |
| `e2e/global-setup.ts` | `http://localhost:5174/login` | `page.goto` | WIRED | Line 6: `await page.goto('http://localhost:5174/login')` present |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| PLSH-05 | 07-01-PLAN.md | E2E tests cover critical flows: signup -> scan -> view results -> download PDF -> buy credits | PARTIALLY SATISFIED | 5 of 5 critical flows have spec files. Login, scan, results, and PDF flows fully implemented per declared must_haves. Credits flow stops at modal boundary — LemonSqueezy navigation not asserted. REQUIREMENTS.md marks this as Complete; the gap is internal to the must_have specification vs implementation. |

No orphaned requirements found. REQUIREMENTS.md maps PLSH-05 to Phase 7 only, and 07-01-PLAN.md claims it. All requirement IDs are accounted for.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `e2e/credits.spec.ts` | 13 | Comment says "BuyCreditsModal redirects via window.location.href to LemonSqueezy checkout" but no assertion follows through on this behavior | Info | Test documents the expected behavior but does not verify it; the LemonSqueezy boundary assertion is absent |

No TODO/FIXME/placeholder comments found. No empty implementations or return-null stubs found in any spec file.

### Human Verification Required

#### 1. Full E2E Suite Execution

**Test:** With both servers running (frontend port 5174, backend port 3001), run `E2E_EMAIL=<test-user> E2E_PASSWORD=<test-pass> npx playwright test`
**Expected:** All 5 spec files pass (5 tests total, with scan.spec.ts taking up to 120s)
**Why human:** Requires live Supabase test user with credits, running servers, and real LemonSqueezy / scan backend. Cannot validate with static analysis.

#### 2. PDF Download Filename

**Test:** During E2E run, observe pdf.spec.ts — specifically the `download.suggestedFilename()` assertion
**Expected:** Filename contains `'auditflow-report'`
**Why human:** Depends on runtime behavior of `html2pdf.js` and what filename the frontend wires to the download anchor. If the actual filename differs, the assertion will fail and needs the selector/filename updated.

#### 3. Credits Modal Trigger

**Test:** Navigate to `/dashboard` logged in as a user with credits <= 1 (free tier), then check the header for a button matching `/buy credits|upgrade/i`
**Expected:** Button exists and is clickable, opens the BuyCreditsModal dialog
**Why human:** `DashboardLayout.tsx` only shows the FREE badge + Upgrade button for users with `credits <= 1`. If the test user has more credits, the button may not render, causing the credits test to fail in a non-obvious way.

### Gaps Summary

One gap was found: the credits test's declared must_have truth ("asserts LemonSqueezy popup/navigation") is not satisfied by the implementation. The test verifies the modal opens and shows credit pack information, but it does not attempt the checkout action that would trigger navigation to LemonSqueezy. This was documented in the SUMMARY as a deliberate decision (external service boundary), but it represents a scope reduction from the declared must_have. REQUIREMENTS.md marks PLSH-05 as Complete, so this is a gap between the plan's internal specification and what was implemented — not a blocking requirements violation. The credits flow is covered to the modal level; the checkout entry point assertion is absent.

The 5 other automated checks (login, scan, results, PDF download, CI mode) are all fully verified at artifact, content, and wiring levels. All 4 commits documented in the SUMMARY exist in git. Playwright 1.58.2 is installed. No stubs, no anti-patterns, no orphaned requirements.

---

_Verified: 2026-03-20T14:00:00Z_
_Verifier: Claude (gsd-verifier)_
