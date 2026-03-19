---
phase: 5
slug: onboarding
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x + @testing-library/react |
| **Config file** | vitest.config.ts |
| **Quick run command** | `/opt/homebrew/bin/node node_modules/.bin/vitest run src/hooks/useOnboarding.test.ts src/components/onboarding/WelcomeModal.test.tsx` |
| **Full suite command** | `/opt/homebrew/bin/node node_modules/.bin/vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | ONBD-01 | unit | `vitest run src/hooks/useOnboarding.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | ONBD-01 | unit | `vitest run src/components/onboarding/WelcomeModal.test.tsx` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 2 | ONBD-01 | unit | `vitest run src/pages/Onboarding.test.tsx` | ❌ W0 | ⬜ pending |
| 05-01-04 | 01 | 2 | ONBD-02 | unit | `vitest run src/pages/Onboarding.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/hooks/useOnboarding.test.ts` — unit tests for `useOnboarding` hook (localStorage mocking)
- [ ] `src/components/onboarding/WelcomeModal.test.tsx` — render tests for WelcomeModal
- [ ] `src/pages/Onboarding.test.tsx` — render tests for AdditionalQuestions and TutorialFlow

*Note: localStorage must be mocked in tests via `vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: vi.fn() })`*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WelcomeModal appears on first login | ONBD-01 | localStorage state not set up in automated env | Clear localStorage, navigate to /dashboard, verify modal appears |
| Tutorial step transitions animate correctly | ONBD-02 | Framer Motion animations not capturable in happy-dom | Click Continue through all 5 steps, verify crossfade animation |
| Skip Tutorial navigates to dashboard | ONBD-02 | Navigation integration requires full app | Click Skip Tutorial on step 3, verify lands on /dashboard |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
