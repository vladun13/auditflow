# Phase 7: E2E Tests — Research

**Phase:** 7 — E2E Tests
**Status:** RESEARCH COMPLETE

---

## Stack & Setup

### Playwright Install
```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

Config file: `playwright.config.ts` at project root.

### Key Config Values
```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5174',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  globalSetup: './e2e/global-setup.ts',
})
```

### Auth Strategy (storageState)
Global setup logs in once and saves session to `e2e/auth.json`. All tests use `storageState: 'e2e/auth.json'` via `use` in config — no per-test login.

```ts
// e2e/global-setup.ts
import { chromium } from '@playwright/test'

async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:5174/login')
  await page.fill('#email', process.env.E2E_EMAIL!)
  await page.fill('#password', process.env.E2E_PASSWORD!)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard')
  await page.context().storageState({ path: 'e2e/auth.json' })
  await browser.close()
}
export default globalSetup
```

Add `e2e/auth.json` to `.gitignore`.

---

## Flow-by-Flow Research

### Flow 1: Login
- Navigate to `/login`
- Fill `#email` and `#password` (confirmed from Login.tsx: `id="email"`, `id="password"`)
- Click `button[type="submit"]`
- Assert redirect to `/dashboard`
- **Note:** This is also the global-setup pattern — login test can use a fresh browser context without storageState

### Flow 2: Run a Scan
- Start on `/dashboard` (storageState auth)
- Click "New Scan" nav link → navigate to `/scan`
- Fill URL input → click scan button
- Assert navigation to `/audits/:id`
- Poll / wait for `status === 'completed'` (Playwright `waitForURL` or wait for scan results element)
- Assert violation cards visible
- **Timing:** Backend scan takes ~10-60s. Use `timeout: 90_000` on the waitFor assertion.

### Flow 3: View Audit Results
- Navigate to `/audits/:id` (can reuse audit from flow 2 or use a pre-existing audit ID)
- Assert WCAG score ring visible
- Assert violation list visible
- Assert filter tabs (critical/serious/moderate/minor) present

### Flow 4: Download PDF
- On `/audits/:id` page
- Listen for `download` event via `page.waitForEvent('download')`
- Click "Download PDF" button (text: 'Download PDF' per AuditHeader.tsx)
- Assert download started (download event resolves)

### Flow 5: Buy Credits
- On `/dashboard`
- Click credits badge button (contains credits count text) OR "Buy Credits" / "Upgrade" button
- Assert `BuyCreditsModal` opens (dialog/modal visible)
- Click a credit pack
- Assert navigation or popup to LemonSqueezy URL (new tab or popup)

---

## Selectors Reference (from codebase)

| Element | Selector |
|---------|----------|
| Email input (Login) | `#email` |
| Password input (Login) | `#password` |
| Login submit | `button[type="submit"]` |
| New Scan nav | `text=New Scan` |
| URL input (NewScan) | `input[type="url"]` or `input[placeholder*="url" i]` |
| Download PDF btn | `text=Download PDF` |
| Credits badge | `button:has-text("credit")` |
| Buy Credits btn | `button:has-text("Buy Credits"), button:has-text("Upgrade")` |

---

## Pitfalls

1. **Supabase localStorage auth** — storageState saves localStorage + cookies. Supabase SDK reads from `localStorage`. Playwright storageState captures this correctly.
2. **Scan timeout** — 60s default Playwright timeout insufficient for scan. Override with `test.setTimeout(120_000)` in the scan test.
3. **LemonSqueezy popup** — checkout may open a popup (new page) rather than a navigation. Use `page.waitForEvent('popup')` not `waitForURL`.
4. **Auth.json in CI** — must not be committed. Add to `.gitignore`. CI must run global-setup before tests.
5. **PDF download URL** — `auditApi.downloadPdf()` may use `window.open` rather than an anchor click. Check AuditHeader for click handler pattern.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright (@playwright/test) |
| Config file | playwright.config.ts (root) |
| Quick run | `npx playwright test --reporter=line` |
| Full suite | `npx playwright test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command |
|--------|----------|-----------|-------------------|
| PLSH-05 | Login flow | E2E | `npx playwright test e2e/auth.spec.ts` |
| PLSH-05 | Run scan flow | E2E | `npx playwright test e2e/scan.spec.ts` |
| PLSH-05 | View results flow | E2E | `npx playwright test e2e/results.spec.ts` |
| PLSH-05 | Download PDF | E2E | `npx playwright test e2e/pdf.spec.ts` |
| PLSH-05 | Buy credits | E2E | `npx playwright test e2e/credits.spec.ts` |
| PLSH-05 | CI headless mode | Config | `CI=true npx playwright test` |

### Wave 0 Gaps
- `playwright.config.ts` — does not exist yet
- `e2e/global-setup.ts` — does not exist yet
- `e2e/auth.json` in `.gitignore` — not yet added

### Manual-Only
None — all flows have automated Playwright assertions.

---

## Open Questions (resolved)

- Port: confirmed 5174 (not 5173)
- Signup: skip real signup, use existing test user
- POM vs inline: inline locators sufficient for 5 flows
