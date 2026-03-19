# Phase 4: PDF Report - Research

**Researched:** 2026-03-19
**Domain:** Client-side PDF generation with html2pdf.js in a Vite/React/TypeScript project
**Confidence:** MEDIUM

## Summary

This phase implements client-side PDF report generation for completed audits using html2pdf.js (already installed at ^0.12.1). The library works by using html2canvas to capture a DOM element as a canvas image, then wrapping it in a jsPDF document. The core challenge is that html2pdf.js has no TypeScript types, has known issues with off-screen/hidden elements, and page-break-inside:avoid is unreliable for longer documents.

The recommended approach is: render the PdfReport component temporarily visible (using overflow:hidden + height:0 on a wrapper, or briefly make visible before capture), use inline styles (not Tailwind classes) for PDF-specific styling to avoid html2canvas rendering issues, and use the `pagebreak: { mode: 'avoid-all' }` option as the best-available page break strategy.

**Primary recommendation:** Use html2pdf.js with a "temporarily visible" pattern (not position:absolute off-screen), inline/computed styles for print layout, and the `avoid-all` page break mode. Create a `declare module` shim for TypeScript.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Client-side via `html2pdf.js` (already in package.json at ^0.12.1) -- render hidden `PdfReport` component, capture as PDF
- Hidden off-screen `<div>` in AuditDetail, referenced by React ref, captured on button click
- Do NOT use the backend `/api/audits/:id/report/pdf` endpoint -- it is a placeholder; client-side only for v1
- Replace `handleDownloadPdf` in `src/components/audit-detail/AuditHeader.tsx` (currently shows "coming soon" toast) with actual `html2pdf.js` call
- Header section: AuditFlow logo/name + site URL + scan date + audit ID
- Score card section: WCAG score number + compliance level badge (AAA/AA/A/Failing) + color-coded
- Stats row: 4 counts -- Critical / Serious / Moderate / Minor violations
- Violations list: One card per violation -- rule name + severity badge + AI explanation + AI fix steps as numbered list
- Card-per-violation layout (not table format)
- `page-break-inside: avoid` on violation cards for `html2pdf.js` auto page breaks
- Full color matching app design (indigo primary `#4F46E5`, severity colors)
- Button shows spinner icon + "Generating..." text while `html2pdf.js` runs
- `try/catch` around `html2pdf.js` call -> `toast.error('Failed to generate PDF. Please try again.')` on failure
- PDF available only when `audit.status === 'completed'`
- File name: `auditflow-report-{auditId}.pdf`
- New file: `src/components/pdf/PdfReport.tsx` -- hidden component rendered in AuditDetail
- New file: `src/lib/pdf.ts` -- `generatePdf(element, filename)` utility wrapping html2pdf.js

### Claude's Discretion
- Exact font sizes and spacing within the PDF layout
- Whether to include a footer with page numbers

### Deferred Ideas (OUT OF SCOPE)
- Backend-generated PDF via `/api/audits/:id/report/pdf` -- v2
- Page numbers in PDF footer -- deferred to polish pass
- Print-optimized black and white mode -- deferred to v2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PDF-01 | User can download a fully rendered PDF from a completed audit containing: site URL, scan date, WCAG score, compliance level, and full violation list with AI fix steps | html2pdf.js API chain `.from(element).set(opts).save(filename)` captures a React-rendered component; PdfReport component provides all required content sections |
| PDF-02 | Downloaded PDF is named `auditflow-report-{id}.pdf` | html2pdf.js `.save(filename)` or `set({ filename })` option controls download name |
| PDF-03 | User sees an error state if PDF generation fails | html2pdf.js returns a Promise; wrap in try/catch with `toast.error()` |
| AUDIT-05 | User can download a PDF report via the Download PDF button | Replace current toast placeholder in AuditHeader.tsx `handleDownloadPdf` with actual generation call |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| html2pdf.js | 0.12.1 (installed) | HTML-to-PDF client-side conversion | Already in package.json; wraps html2canvas + jsPDF; simple chain API |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jsPDF | 3.0.4 (installed) | PDF document creation | Already installed; html2pdf.js uses it internally; no direct usage needed |
| sonner | 2.0.7 (installed) | Toast notifications | Error state display on PDF generation failure |
| lucide-react | 0.555.0 (installed) | Icons | Loader2 spinner icon for "Generating..." state |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| html2pdf.js | @react-pdf/renderer | True PDF (selectable text) but requires rewriting layout in react-pdf primitives, not HTML/CSS -- much more work |
| html2pdf.js | jsPDF directly | More control but requires manual layout positioning -- html2pdf.js abstracts this |

**Installation:** No new packages needed. html2pdf.js ^0.12.1 and jsPDF ^3.0.4 are already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── pdf/
│       └── PdfReport.tsx        # Hidden PDF-specific layout component
├── lib/
│   └── pdf.ts                   # generatePdf() utility wrapping html2pdf.js
├── components/audit-detail/
│   └── AuditHeader.tsx          # Modified: real PDF generation replaces toast
└── pages/
    └── AuditDetail.tsx          # Modified: renders hidden PdfReport + passes ref
```

### Pattern 1: TypeScript Declaration Shim
**What:** html2pdf.js has no @types package. Create a declaration file.
**When to use:** Always -- required for TypeScript compilation.
**Example:**
```typescript
// src/types/html2pdf.d.ts
declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[]
    filename?: string
    image?: { type?: string; quality?: number }
    html2canvas?: { scale?: number; useCORS?: boolean; logging?: boolean }
    jsPDF?: { unit?: string; format?: string; orientation?: string }
    pagebreak?: { mode?: string | string[]; before?: string | string[]; after?: string | string[]; avoid?: string | string[] }
    enableLinks?: boolean
  }

  interface Html2PdfWorker {
    from(element: HTMLElement | string, type?: string): Html2PdfWorker
    set(options: Html2PdfOptions): Html2PdfWorker
    save(filename?: string): Promise<void>
    toPdf(): Html2PdfWorker
    toCanvas(): Html2PdfWorker
    toImg(): Html2PdfWorker
    toContainer(): Html2PdfWorker
    then(callback: (value: unknown) => void): Html2PdfWorker
    output(type: string, options?: Record<string, unknown>): Promise<unknown>
    get(key: string): Promise<unknown>
  }

  function html2pdf(): Html2PdfWorker
  function html2pdf(element: HTMLElement, options?: Html2PdfOptions): Promise<void>

  export default html2pdf
}
```

### Pattern 2: Temporarily Visible Rendering (CRITICAL)
**What:** html2pdf.js/html2canvas cannot reliably capture elements positioned off-screen (`left: -9999px`) or with `display: none`. The recommended approach is to use a wrapper that clips the element visually but keeps it in normal flow.
**When to use:** Always -- the PdfReport component must be "visible" to the rendering engine.
**Example:**
```typescript
// In AuditDetail.tsx -- wrapper for hidden PdfReport
<div
  style={{
    position: 'fixed',
    left: 0,
    top: 0,
    width: '210mm',   // A4 width
    overflow: 'hidden',
    height: 0,
    zIndex: -1,
    opacity: 0,
    pointerEvents: 'none',
  }}
>
  <div ref={pdfRef}>
    <PdfReport audit={audit} />
  </div>
</div>
```

**Alternative approach (more reliable):** Temporarily make the element visible before capture, then hide after:
```typescript
async function generatePdf(element: HTMLElement, filename: string) {
  // Temporarily make visible for capture
  const wrapper = element.parentElement
  if (wrapper) {
    wrapper.style.height = 'auto'
    wrapper.style.overflow = 'visible'
  }

  try {
    await html2pdf().from(element).set(options).save(filename)
  } finally {
    if (wrapper) {
      wrapper.style.height = '0'
      wrapper.style.overflow = 'hidden'
    }
  }
}
```

### Pattern 3: PDF Utility Function
**What:** Encapsulate html2pdf.js configuration in a utility.
**Example:**
```typescript
// src/lib/pdf.ts
import html2pdf from 'html2pdf.js'

export async function generatePdf(element: HTMLElement, filename: string): Promise<void> {
  const options = {
    margin: 10,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css'] },
  }

  await html2pdf().from(element).set(options).save()
}
```

### Pattern 4: PdfReport Component Styling
**What:** Use inline styles (not Tailwind) for the PdfReport component to ensure html2canvas captures colors correctly.
**When to use:** All PDF-rendered content.
**Why:** html2canvas captures computed styles. Tailwind CSS classes are resolved at runtime but html2canvas cloning can miss some computed values (especially CSS custom properties/variables). Using explicit inline hex colors is more reliable.
**Example:**
```typescript
// Use inline styles for colors that MUST appear in PDF
<div style={{ color: '#4F46E5', fontSize: '24px', fontWeight: 700 }}>
  AuditFlow Report
</div>

// Severity colors inline
const SEVERITY_COLORS = {
  critical: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  serious:  { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  moderate: { bg: '#fefce8', text: '#854d0e', border: '#fef08a' },
  minor:    { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
}
```

### Anti-Patterns to Avoid
- **Using `position: absolute; left: -9999px`:** html2canvas does not reliably render off-screen elements. Use overflow:hidden/height:0 or temporarily-visible pattern instead.
- **Using `display: none`:** html2canvas cannot capture elements with display:none at all.
- **Relying on Tailwind CSS variables for PDF colors:** CSS custom properties (HSL values from index.css) may not resolve correctly in the html2canvas clone. Use explicit hex colors.
- **Using SVG elements in PDF content:** html2canvas has limited SVG support. For the score ring, render a simplified version using divs/borders instead of the SVG-based ScoreRing component.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML to PDF conversion | Manual canvas + jsPDF positioning | html2pdf.js chain API | html2pdf handles page sizing, breaks, margins automatically |
| Page break logic | Manual element height calculation | `pagebreak: { mode: 'avoid-all' }` option | Built-in mode handles most cases; manual calculation is fragile |
| PDF filename prompt | Custom download dialog | html2pdf `.save(filename)` | Triggers browser download automatically |

## Common Pitfalls

### Pitfall 1: Off-Screen Elements Render Blank
**What goes wrong:** Elements positioned with `left: -9999px` or `display: none` produce blank/empty PDFs.
**Why it happens:** html2canvas needs the element in the document flow with computed dimensions to capture it.
**How to avoid:** Use the `overflow: hidden; height: 0` wrapper pattern. Or temporarily show element, capture, then hide.
**Warning signs:** PDF downloads but all pages are blank or empty.

### Pitfall 2: Tailwind CSS Colors Missing in PDF
**What goes wrong:** Colors defined via CSS custom properties (HSL variables) appear as black or transparent in the PDF.
**Why it happens:** html2canvas clones the DOM but may not resolve CSS custom properties correctly, especially when they use the `hsl(var(--primary))` pattern.
**How to avoid:** Use explicit hex color values in inline styles for the PdfReport component. Do not rely on Tailwind utility classes for colors in PDF content.
**Warning signs:** PDF renders with correct layout but wrong/missing colors.

### Pitfall 3: SVG Score Ring Not Captured
**What goes wrong:** The SVG-based ScoreRing component renders blank or incorrectly in the PDF.
**Why it happens:** html2canvas has limited and inconsistent SVG support.
**How to avoid:** Create a simplified, div-based score display for the PDF version instead of reusing the SVG ScoreRing component.
**Warning signs:** Score ring area is blank or shows artifacts.

### Pitfall 4: Page Breaks Split Violation Cards
**What goes wrong:** Violation cards get cut in half across page boundaries.
**Why it happens:** `page-break-inside: avoid` is not 100% reliable in html2pdf.js, especially for longer documents.
**How to avoid:** Use `pagebreak: { mode: ['avoid-all', 'css'] }` in options. Add `break-inside: avoid` CSS on violation card wrappers. Keep individual cards under ~250px height to reduce the chance of splitting. For very long cards (long AI fix steps), accept that some splitting may occur.
**Warning signs:** Cards are visually cut in half in the generated PDF.

### Pitfall 5: TypeScript Import Error
**What goes wrong:** `Cannot find module 'html2pdf.js'` TypeScript error.
**Why it happens:** html2pdf.js ships no type definitions and has no @types package.
**How to avoid:** Create `src/types/html2pdf.d.ts` declaration file (see Architecture Patterns section).
**Warning signs:** TypeScript compilation fails on `import html2pdf from 'html2pdf.js'`.

### Pitfall 6: Large Audits Cause Browser Freeze
**What goes wrong:** Audits with 50+ violations cause the browser to become unresponsive during PDF generation.
**Why it happens:** html2canvas renders the entire element as one tall canvas. Large canvases are memory-intensive.
**How to avoid:** Set `html2canvas: { scale: 2 }` (not higher). The "Generating..." loading state gives user feedback. For v1 this is acceptable; backend PDF generation is deferred to v2.
**Warning signs:** Browser tab freezes for >10 seconds.

### Pitfall 7: Vite ESM Import
**What goes wrong:** html2pdf.js uses CommonJS internally but Vite expects ESM.
**Why it happens:** html2pdf.js was built for older module systems.
**How to avoid:** Vite's pre-bundling (via esbuild) automatically converts CJS to ESM. The standard `import html2pdf from 'html2pdf.js'` should work. If it doesn't, use dynamic import: `const html2pdf = (await import('html2pdf.js')).default`.
**Warning signs:** Runtime error about `require` or module format.

## Code Examples

### Complete generatePdf Utility
```typescript
// src/lib/pdf.ts
import html2pdf from 'html2pdf.js'

export async function generatePdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const options = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait' as const,
    },
    pagebreak: {
      mode: ['avoid-all', 'css'],
    },
  }

  await html2pdf().from(element).set(options).save()
}
```

### AuditHeader Integration
```typescript
// Modified handleDownloadPdf in AuditHeader.tsx
interface AuditHeaderProps {
  audit: Audit
  onBack: () => void
  onDownloadPdf: () => void
  pdfLoading: boolean
}

// In the button:
<Button
  variant="outline"
  size="sm"
  className="gap-1.5 text-xs"
  onClick={onDownloadPdf}
  disabled={pdfLoading}
>
  {pdfLoading ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Download className="h-4 w-4" />
  )}
  {pdfLoading ? 'Generating...' : 'Download PDF'}
</Button>
```

### AuditDetail PDF Handler
```typescript
// In AuditDetail.tsx
const pdfRef = useRef<HTMLDivElement>(null)
const [pdfLoading, setPdfLoading] = useState(false)

const handleDownloadPdf = async () => {
  if (!pdfRef.current || !audit) return
  setPdfLoading(true)
  try {
    await generatePdf(pdfRef.current, `auditflow-report-${audit.id}.pdf`)
  } catch {
    toast.error('Failed to generate PDF. Please try again.')
  } finally {
    setPdfLoading(false)
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| html2pdf.js 0.9.x | html2pdf.js 0.12.1+ | 2023 | Better page break support, but still imperfect |
| `display:none` + onclone | Overflow-hidden wrapper | Ongoing community pattern | Avoids blank PDF output |
| Tailwind classes in PDF | Inline styles for PDF content | Best practice | Reliable color rendering |

**Deprecated/outdated:**
- html2pdf.js 0.10.1: Known to produce blank pages -- avoid this version
- `html2pdf__page-break` legacy class: Still works but `avoid-all` mode is preferred

## Open Questions

1. **SVG rendering in html2canvas**
   - What we know: html2canvas has limited SVG support; the ScoreRing uses SVG
   - What's unclear: Whether the specific SVG pattern (circle + strokeDasharray) will render
   - Recommendation: Build a simplified div-based score display for the PDF. Do not reuse ScoreRing.

2. **Font rendering (Plus Jakarta Sans)**
   - What we know: The app uses Plus Jakarta Sans loaded from Google Fonts
   - What's unclear: Whether html2canvas will capture the custom font or fall back to a system font
   - Recommendation: The PDF will likely fall back to a system sans-serif font. This is acceptable for v1. If needed, add `@import` in the PdfReport's inline styles, but this adds complexity.

3. **Maximum canvas size for very large audits**
   - What we know: HTML5 canvas has maximum dimension limits (~16k-32k pixels depending on browser)
   - What's unclear: At what violation count the PDF will fail
   - Recommendation: With scale:2 and A4 sizing, each page is ~2480px. A 100-violation audit would be ~50 pages, likely within limits. Accept this for v1.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + React Testing Library 16.3.2 + happy-dom 20.8.4 |
| Config file | `vite.config.ts` (test section) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PDF-01 | generatePdf calls html2pdf with correct options and element | unit | `npx vitest run src/lib/pdf.test.ts -x` | No -- Wave 0 |
| PDF-01 | PdfReport renders all required sections (header, score, stats, violations) | unit | `npx vitest run src/components/pdf/PdfReport.test.tsx -x` | No -- Wave 0 |
| PDF-02 | Filename follows `auditflow-report-{id}.pdf` pattern | unit | `npx vitest run src/lib/pdf.test.ts -x` | No -- Wave 0 |
| PDF-03 | Error state shows toast on failure | unit | `npx vitest run src/pages/AuditDetail.test.tsx -x` | Partially -- existing test covers toast placeholder; needs update |
| AUDIT-05 | Download PDF button triggers generation, shows loading state | unit | `npx vitest run src/pages/AuditDetail.test.tsx -x` | Partially -- existing test checks "coming soon" toast; needs replacement |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/types/html2pdf.d.ts` -- TypeScript declaration for html2pdf.js
- [ ] `src/lib/pdf.test.ts` -- covers PDF-01, PDF-02 (mock html2pdf.js, verify options/filename)
- [ ] `src/components/pdf/PdfReport.test.tsx` -- covers PDF-01 (verify all sections render)
- [ ] Update `src/pages/AuditDetail.test.tsx` -- replace "coming soon" toast test with actual PDF generation test (PDF-03, AUDIT-05)

**Testing strategy for html2pdf.js:** Since html2pdf.js performs canvas rendering (browser-only), it must be mocked in unit tests. Tests verify:
1. `generatePdf` calls html2pdf with correct element and options (mock the module)
2. PdfReport component renders all required data sections
3. AuditDetail wires up the handler correctly (loading state, error handling)
4. Actual PDF output quality is verified manually

## Sources

### Primary (HIGH confidence)
- [html2pdf.js official docs](https://ekoopmans.github.io/html2pdf.js/) -- full API, configuration options, page break modes
- Project source code -- AuditHeader.tsx, AuditDetail.tsx, types/index.ts, package.json (direct inspection)

### Secondary (MEDIUM confidence)
- [GitHub Issue #246: Can't handle hidden element](https://github.com/eKoopmans/html2pdf.js/issues/246) -- workaround for hidden element rendering
- [GitHub Issue #675: Page break avoid does nothing](https://github.com/eKoopmans/html2pdf.js/issues/675) -- confirms page-break limitations
- [GitHub Issue #244: TypeScript import](https://github.com/eKoopmans/html2pdf.js/issues/244) -- confirms need for declaration file
- [GitHub Issue #659: Different styles in PDF](https://github.com/eKoopmans/html2pdf.js/issues/659) -- CSS rendering differences
- [Tailwind CSS Discussion #19516: UI bug with html2pdf.js](https://github.com/tailwindlabs/tailwindcss/discussions/19516) -- Tailwind line-height issues

### Tertiary (LOW confidence)
- html2pdf.js latest version may be 0.14.0 per npm search -- project uses ^0.12.1 which is acceptable; no need to upgrade for this phase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- html2pdf.js is already installed; API is well-documented
- Architecture: MEDIUM -- hidden element rendering pattern has known gotchas; recommended workaround is well-tested by community but not officially documented
- Pitfalls: HIGH -- multiple GitHub issues confirm each pitfall; workarounds are community-verified
- Testing: HIGH -- existing test infrastructure is solid; mocking strategy is straightforward

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (html2pdf.js is stable/slow-moving; 30 days is appropriate)
