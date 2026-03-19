---
phase: 4
slug: pdf-report
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x + @testing-library/react |
| **Config file** | vitest.config.ts |
| **Quick run command** | `/opt/homebrew/bin/node node_modules/.bin/vitest run src/lib/pdf.test.ts src/components/pdf/PdfReport.test.tsx` |
| **Full suite command** | `/opt/homebrew/bin/node node_modules/.bin/vitest run` |
| **Estimated runtime** | ~8 seconds |

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
| 04-01-01 | 01 | 1 | PDF-01 | unit | `vitest run src/lib/pdf.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | PDF-01, PDF-02 | unit | `vitest run src/components/pdf/PdfReport.test.tsx` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | PDF-01, PDF-02, PDF-03 | unit | `vitest run src/pages/AuditDetail.test.tsx` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/pdf.test.ts` — unit tests for `generatePdf()` utility (mock html2pdf.js)
- [ ] `src/components/pdf/PdfReport.test.tsx` — render tests for PdfReport component (score display, violation cards, file structure)
- [ ] `src/types/html2pdf.d.ts` — TypeScript declare module shim (no @types package available)

*Note: html2pdf.js must be mocked in tests since it requires DOM canvas APIs not available in happy-dom.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PDF visually renders correctly in browser | PDF-01 | html2canvas produces a bitmap — automated tests verify the call, not the visual output | Click Download PDF on a completed audit, open the PDF, verify it contains site URL, scan date, score, violations with AI content |
| PDF file downloads with correct filename | PDF-02 | File download triggers a browser behavior not capturable in happy-dom | Verify filename is `auditflow-report-{auditId}.pdf` in downloads |
| Button spinner shows during generation | PDF-01 | Timing-dependent UI state | Click Download PDF, observe "Generating..." spinner before file downloads |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
