# Phase 4: PDF Report - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers client-side PDF generation for completed audits. A hidden `PdfReport` React component renders full audit data (header, score, stats, violations with AI content) and is captured by `html2pdf.js` on Download PDF button click in AuditHeader. The "coming soon" toast is replaced with real generation. No backend changes.

</domain>

<decisions>
## Implementation Decisions

### PDF Generation Approach
- Client-side via `html2pdf.js` (already in package.json at ^0.12.1) — render hidden `PdfReport` component, capture as PDF
- Hidden off-screen `<div>` in AuditDetail, referenced by React ref, captured on button click
- Do NOT use the backend `/api/audits/:id/report/pdf` endpoint — it is a placeholder; client-side only for v1
- Replace `handleDownloadPdf` in `src/components/audit-detail/AuditHeader.tsx` (currently shows "coming soon" toast) with actual `html2pdf.js` call

### PDF Content & Layout
- **Header section:** AuditFlow logo/name + site URL + scan date + audit ID
- **Score card section:** WCAG score number + compliance level badge (AAA/AA/A/Failing) + color-coded (green ≥80, yellow ≥60, red <60)
- **Stats row:** 4 counts — Critical / Serious / Moderate / Minor violations
- **Violations list:** One card per violation — rule name + severity badge + AI explanation ("Why This Matters") + AI fix steps as numbered list
- Card-per-violation layout (not table format)
- `page-break-inside: avoid` on violation cards for `html2pdf.js` auto page breaks
- Full color matching app design (indigo primary `#4F46E5`, severity colors: red/orange/yellow/blue)

### Error Handling & UX
- Button shows spinner icon + "Generating..." text while `html2pdf.js` runs (use `pdfLoading` state in AuditDetail/AuditHeader)
- `try/catch` around `html2pdf.js` call → `toast.error('Failed to generate PDF. Please try again.')` on failure
- PDF available only when `audit.status === 'completed'` — otherwise button remains "coming soon" toast
- File name: `auditflow-report-{auditId}.pdf` (matches existing `api.ts` naming convention)

### Claude's Discretion
- Exact font sizes and spacing within the PDF layout
- Whether to include a footer with page numbers

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `html2pdf.js` ^0.12.1 — already in package.json, install not needed
- `jsPDF` ^3.0.4 — also available but not needed (html2pdf.js wraps it)
- `src/components/audit-detail/AuditHeader.tsx` — `handleDownloadPdf` at line ~17 currently calls `toast()`; replace with html2pdf call
- `src/pages/AuditDetail.tsx` — parent of AuditHeader, has `audit` object with all data; pass `onDownloadPdf` handler as prop
- `src/components/audit-detail/ScoreRing.tsx` — SVG score ring already built in Phase 2; can reference its color logic
- `src/components/audit-detail/ViolationCard.tsx` — existing violation card structure for reference
- `src/types/index.ts` — `Audit`, `Violation` interfaces; `Violation` has `ai_explanation`, `ai_fix_steps`, `impact`, `violation_type`, `wcag_criterion`
- Severity colors established: critical=red, serious=orange, moderate=yellow, minor=blue
- Score color: ≥80 green, ≥60 yellow, <60 red (from `src/lib/format.ts` `getScoreColor`)

### Established Patterns
- Sonner `toast.error()` for error notifications
- `useState` for loading states (e.g., `pdfLoading: boolean`)
- Tailwind CSS for all styling — no inline styles except for PDF-specific overrides
- `cn()` from `src/lib/utils.ts` for conditional classNames

### Integration Points
- `src/components/audit-detail/AuditHeader.tsx` — primary integration point; replace toast with pdf generation
- `src/pages/AuditDetail.tsx` — pass audit data down to PdfReport component via ref
- New file: `src/components/pdf/PdfReport.tsx` — hidden component rendered in AuditDetail
- New file: `src/lib/pdf.ts` — `generatePdf(elementId, filename)` utility wrapping html2pdf.js

</code_context>

<specifics>
## Specific Ideas

- The `PdfReport` component should be visually clean — white background, black text, designed for print
- Use `position: absolute; left: -9999px` to hide the PdfReport div off-screen while it exists in the DOM
- `html2pdf.js` options: `{ margin: 10, filename, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }`
- The Download PDF button is in AuditHeader; AuditDetail should pass a `onDownloadPdf` callback and a `pdfLoading` prop to AuditHeader

</specifics>

<deferred>
## Deferred Ideas

- Backend-generated PDF via `/api/audits/:id/report/pdf` — v2, when server-side rendering is needed for large audits
- Page numbers in PDF footer — deferred to polish pass
- Print-optimized black and white mode — deferred to v2

</deferred>
