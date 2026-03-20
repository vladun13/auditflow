---
phase: 6
slug: polish-responsive
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + React Testing Library 16.3.2 + happy-dom 20.8.4 |
| **Config file** | vitest.config.ts (root) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 0 | PLSH-02 | unit | `npx vitest run src/layouts/DashboardLayout.test.tsx -x` | ✅ (update needed) | ⬜ pending |
| 06-01-02 | 01 | 0 | PLSH-03b | unit | `npx vitest run src/hooks/use-tablet.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 0 | PLSH-03a | unit | `npx vitest run src/components/sidebar.test.tsx -x` | ✅ (update needed) | ⬜ pending |
| 06-01-04 | 01 | 1 | PLSH-02 | unit | `npx vitest run src/layouts/DashboardLayout.test.tsx -x` | ✅ | ⬜ pending |
| 06-01-05 | 01 | 1 | PLSH-03b | unit | `npx vitest run src/hooks/use-tablet.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-01-06 | 01 | 1 | PLSH-03a,PLSH-03c | unit | `npx vitest run src/components/sidebar.test.tsx src/layouts/DashboardLayout.test.tsx -x` | ✅ | ⬜ pending |
| 06-01-07 | 01 | 2 | PLSH-04 | manual | Visual: Tab through dashboard, verify indigo ring visible | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/hooks/use-tablet.test.ts` — stubs for PLSH-03b (useIsTablet hook, mocking matchMedia at 768-1279px)
- [ ] Update `src/components/sidebar.test.tsx` — add tests for forceCollapsed prop and tooltip rendering
- [ ] Update `src/layouts/DashboardLayout.test.tsx` — add test verifying AnimatePresence wrapper and isTablet prop passing to Sidebar

*Existing Vitest infrastructure covers all phase requirements — no new framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Focus-visible indigo ring on all interactive elements | PLSH-04 | `:focus-visible` depends on browser heuristics not reproducible in happy-dom | Tab through dashboard: sidebar nav, buttons, modals, dropdowns. Verify 2px indigo ring visible on each focused element. |

---

## Testing Notes

**Framer Motion in tests:** happy-dom does not run CSS animations. Tests should verify:
- The `motion.div` wrapper exists around Outlet content (structural test using container querySelector)
- AnimatePresence is present in the component tree
- The `key` prop on the animated div changes when route changes

**matchMedia mocking:** Mock `window.matchMedia` to return controlled values. Pattern from existing `useIsMobile` tests applies to `useIsTablet`.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
