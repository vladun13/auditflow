---
phase: 1
slug: dashboard-redesign
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library + happy-dom |
| **Config file** | `vite.config.ts` (test section) |
| **Quick run command** | `npx vitest run src/pages/DashboardNew.test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/pages/DashboardNew.test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-W0 | 01 | 0 | DASH-01,02,03,04 | unit | `npx vitest run src/pages/DashboardNew.test.tsx` | needs update | ⬜ pending |
| 1-01-W0 | 01 | 0 | PLSH-01 | unit | `npx vitest run src/pages/Reports.test.tsx src/pages/AuditDetail.test.tsx` | needs update | ⬜ pending |
| 1-01-01 | 01 | 1 | DASH-01 | unit | `npx vitest run src/pages/DashboardNew.test.tsx -t "stat cards"` | ✅ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | DASH-02 | unit | `npx vitest run src/pages/DashboardNew.test.tsx -t "loading"` | ✅ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | DASH-03 | unit | `npx vitest run src/pages/DashboardNew.test.tsx -t "empty state"` | ✅ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | DASH-04 | unit | `npx vitest run src/pages/DashboardNew.test.tsx -t "recent audits"` | ✅ W0 | ⬜ pending |
| 1-02-01 | 02 | 2 | PLSH-01 | unit | `npx vitest run src/pages/Reports.test.tsx src/pages/AuditDetail.test.tsx` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/pages/DashboardNew.test.tsx` — update expectations for new stat card labels (Total Audits, Avg WCAG Score, Critical Issues, Compliant Sites), skeleton loading (not spinner), "View all reports" link, last-5 audit list, colored score display
- [ ] `src/pages/Reports.test.tsx` — replace spinner loading test with skeleton test
- [ ] `src/pages/AuditDetail.test.tsx` — replace spinner loading test with skeleton test
- [ ] `src/lib/format.test.ts` — unit tests for `formatRelativeTime()` and `getScoreColor()`/`getScoreBg()` helpers

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Skeleton shimmer animation visible | DASH-02 | CSS animation cannot be unit-tested | Load dashboard with network throttled; verify shimmer animation plays on stat cards and rows |
| "Compliant Sites" count updates after new scan | DASH-01 | Requires real API integration | Complete a scan with score ≥80; verify count increments on dashboard |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
