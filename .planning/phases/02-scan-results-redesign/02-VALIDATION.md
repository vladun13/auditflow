---
phase: 2
slug: scan-results-redesign
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library + happy-dom |
| **Config file** | `vite.config.ts` (test section) |
| **Quick run command** | `npx vitest run src/pages/NewScan.test.tsx src/pages/AuditDetail.test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/pages/NewScan.test.tsx src/pages/AuditDetail.test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-W0 | W0 | 0 | SCAN-01..04 | unit | `npx vitest run src/pages/NewScan.test.tsx` | needs rewrite | ⬜ pending |
| 2-W0 | W0 | 0 | AUDIT-01..05 | unit | `npx vitest run src/pages/AuditDetail.test.tsx` | needs rewrite | ⬜ pending |
| 2-W0 | W0 | 0 | AUTH-01 | unit | `npx vitest run src/pages/Login.test.tsx` | ❌ W0 create | ⬜ pending |
| 2-01 | 02-01 | 1 | SCAN-01,02,03,04 | unit | `npx vitest run src/pages/NewScan.test.tsx` | ✅ W0 | ⬜ pending |
| 2-02 | 02-02 | 1 | AUDIT-01,02,03,04,05 | unit | `npx vitest run src/pages/AuditDetail.test.tsx` | ✅ W0 | ⬜ pending |
| 2-03 | 02-03 | 2 | AUTH-01 | unit | `npx vitest run src/pages/Login.test.tsx` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/pages/NewScan.test.tsx` — rewrite assertions to match new 2-column DOM, progress steps, credits block (4 currently failing)
- [ ] `src/pages/AuditDetail.test.tsx` — rewrite all assertions to match redesigned component structure; add expand/collapse, tab filter, PDF toast tests (6 currently failing + new tests needed)
- [ ] `src/pages/Login.test.tsx` — create new test file for AUTH-01 sessionStorage redirect (does not exist yet)

**Pre-existing failures outside Phase 2 scope (fix opportunistically):**
- `src/components/sidebar.test.tsx` — 3 failing (active nav highlighting)
- `src/layouts/DashboardLayout.test.tsx` — 3 failing (credit balance, signOut, null credits)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Scan progress animation plays step-by-step | SCAN-02 | CSS/Framer Motion animation hard to unit-test | Start a scan; verify each step animates in sequence in the right panel |
| Score ring color changes correctly | AUDIT-01 | Visual color rendering browser-only | Load completed audit; verify ring is green/yellow/red matching score |
| sessionStorage survives browser navigation | AUTH-01 | Browser storage behavior | Enter URL in hero unauthenticated → login → confirm /scan pre-filled |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
