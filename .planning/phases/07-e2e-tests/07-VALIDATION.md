---
phase: 7
slug: e2e-tests
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 7 — Validation Strategy

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (@playwright/test) |
| **Config file** | playwright.config.ts (root) |
| **Quick run command** | `npx playwright test --reporter=line` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~2-3 minutes (scan flow has 60-90s timeout) |

---

## Sampling Rate

- **After every task commit:** `npx playwright test --reporter=line` (if server running)
- **After every plan wave:** `npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 180 seconds (scan flow dominates)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 0 | PLSH-05 | infra | `test -f playwright.config.ts && npx playwright --version` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | PLSH-05 | E2E | `npx playwright test e2e/auth.spec.ts` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | PLSH-05 | E2E | `npx playwright test e2e/scan.spec.ts` | ❌ W0 | ⬜ pending |
| 07-01-04 | 01 | 1 | PLSH-05 | E2E | `npx playwright test e2e/results.spec.ts` | ❌ W0 | ⬜ pending |
| 07-01-05 | 01 | 1 | PLSH-05 | E2E | `npx playwright test e2e/pdf.spec.ts` | ❌ W0 | ⬜ pending |
| 07-01-06 | 01 | 1 | PLSH-05 | E2E | `npx playwright test e2e/credits.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — Playwright config (baseURL: 5174, Chromium, headless, retries, storageState)
- [ ] `e2e/global-setup.ts` — Login once, save storageState to `e2e/auth.json`
- [ ] `.env.example` — Document `E2E_EMAIL` and `E2E_PASSWORD` vars
- [ ] `.gitignore` — Add `e2e/auth.json`
- [ ] `package.json` — Add `"e2e": "playwright test"` script

---

## Manual-Only Verifications

None — all flows have automated Playwright assertions.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency documented (scan flow ~90s max)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
