# Phase 2: Scan & Results Redesign - Research

**Researched:** 2026-03-19
**Domain:** React UI redesign (NewScan + AuditDetail pages), SVG score ring, sessionStorage auth flow
**Confidence:** HIGH

## Summary

Phase 2 redesigns two core pages (NewScan.tsx, AuditDetail.tsx) to match Figma designs, adds a sessionStorage-based URL preservation flow (AUTH-01), and fixes 6 pre-existing AuditDetail test failures from Phase 1. The existing codebase already has most building blocks: extracted sub-components in `src/components/audit-detail/` and `src/components/new-scan/`, a working `ScoreRing` SVG component, polling via `useAudit` hook, credit checking via `useCredits`, and the shadcn Tabs component. The primary work is visual restructuring, adding scan progress animation states, implementing the violation collapse/expand pattern, and wiring the sessionStorage URL flow through Hero -> Login -> NewScan.

**Primary recommendation:** Split into 2 plans: (1) NewScan redesign + AUTH-01 URL preservation, (2) AuditDetail redesign + test fixes. Both plans modify mostly independent files.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Right panel idle state: static "What We'll Check" WCAG checklist with icons (Perceivable, Operable, Understandable, Robust + sub-items)
- Right panel during active scanning: animated progress steps replace checklist (Crawling -> Analyzing -> Generating AI fixes), spinner per active step
- Zero credits block: disable scan button + inline banner "No credits remaining. Upgrade to continue." with Upgrade CTA button
- URL pre-fill from `?url=` query param (SCAN-04): silently pre-fill the URL input field, no toast
- Score ring: circular SVG ring, score number centered inside, WCAG level label below, green >=80 / yellow >=60 / red <60
- Violation cards: collapsed by default -- click to expand AI explanation ("Why This Matters") + fix steps ("How to Fix")
- Severity filter UI: tab row -- All / Critical / Serious / Moderate / Minor with count badges per tab
- Scanning in-progress state: animated "Scanning..." view with step indicators (Crawling pages -> Running axe-core -> Generating AI fixes), replaces results table until complete
- URL preservation (AUTH-01): store `?url=` value in `sessionStorage` before redirecting to /login; restore and pre-fill on /scan after successful auth
- Post-auth redirect: silent -- land on /scan with URL pre-filled, scan button ready immediately
- Download PDF button (AUDIT-05): top-right of AuditDetail header, alongside any action buttons
- PDF while service is stub: button visible, on click shows toast "PDF report generation coming soon"

### Claude's Discretion
- Exact Figma visual layout -- match Figma file `1YlIhl3QmvzlH8fKo8qBq5` all Phase 2 screens
- SVG ring stroke width and animation
- WCAG checklist item copy and icon choices
- Scan progress step copy and timing

### Deferred Ideas (OUT OF SCOPE)
- AUDIT-05 full PDF download -- deferred to Phase 4 (pdfService is stub); Phase 2 adds button with "coming soon" toast
- Pre-existing AuditDetail.test.tsx failures (6 tests) documented in Phase 1 deferred-items.md -- address in Phase 2 test updates
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCAN-01 | 2-column layout -- URL form on left, "What We'll Check" checklist panel on right | Existing `NewScan.tsx` already has 2-col grid `lg:grid-cols-[1fr_340px]` + `ChecksList` component. Redesign replaces ChecksList content with WCAG-principle-organized checklist (Perceivable, Operable, Understandable, Robust) |
| SCAN-02 | Scan progress animation in right panel while scan in flight | Existing `loading` state in NewScan.tsx renders a full-page progress view. Redesign keeps the 2-col layout visible, swaps right panel to animated step list. Framer Motion available for step transitions |
| SCAN-03 | Block scan when credits = 0, with upgrade prompt | Existing `noCredits` check already disables button and shows yellow banner. Redesign changes copy to match CONTEXT.md locked decision |
| SCAN-04 | URL pre-filled from `?url=` query param | Already implemented via `useSearchParams().get('url')`. Also needs sessionStorage restoration for AUTH-01 flow |
| AUDIT-01 | Circular WCAG score ring with color coding | `ScoreRing.tsx` already exists with SVG circle, stroke-dasharray math. Needs style updates (stroke width, color thresholds match) -- already uses green/yellow/red |
| AUDIT-02 | Animated scanning state while audit status is 'scanning' | `ScanningView.tsx` already exists and renders when `audit.status === 'scanning'`. Redesign adds step indicators per CONTEXT.md |
| AUDIT-03 | Violation cards with AI explanation + fix steps | Current layout has 3-panel (list / details / how-to-fix). Redesign converts to collapsible cards. AI fields (`ai_explanation`, `ai_fix_steps`) already in Violation type |
| AUDIT-04 | Filter violations by severity | Current `ViolationList` already has severity tabs (critical/serious/moderate/minor). Redesign adds "All" tab and uses shadcn Tabs or custom tab row with count badges |
| AUDIT-05 | Download PDF button | `AuditHeader` already has PDF button calling `auditApi.downloadPdf()`. Phase 2 keeps button visible, intercepts click to show sonner toast "coming soon" |
| AUTH-01 | Preserve `?url=` through login redirect | Requires changes in Hero.tsx (store to sessionStorage), Login.tsx (redirect to /scan after auth if sessionStorage has URL), and NewScan.tsx (read from sessionStorage on mount) |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.0 | UI framework | Project standard |
| Tailwind CSS | 4.1.17 | Styling | Project standard |
| shadcn/ui + Radix UI | latest | Tabs, Collapsible, Badge | Already in project, 65+ components |
| Lucide React | 0.555.0 | Icons | Project standard |
| Framer Motion | 12.23.24 | Scan progress step animations | Already installed |
| Sonner | 2.0.7 | Toast for "PDF coming soon" | Already used in settings pages |
| React Router | 7.9.6 | Navigation, useSearchParams | Project standard |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-tabs | (via shadcn) | Severity filter tabs | AuditDetail severity filter |
| @radix-ui/react-collapsible | (via shadcn) | Violation card expand/collapse | If shadcn Collapsible used; alternatively native disclosure |

**No new packages needed.** Everything required is already installed.

## Architecture Patterns

### Existing File Structure (to modify in-place)
```
src/
├── pages/
│   ├── NewScan.tsx              # REWRITE: 2-col layout, right panel states
│   ├── AuditDetail.tsx          # REWRITE: score ring, collapsible violations, tab filter
│   ├── Login.tsx                # MODIFY: post-auth redirect to /scan if sessionStorage URL exists
│   ├── NewScan.test.tsx         # UPDATE: match new DOM structure
│   └── AuditDetail.test.tsx     # REWRITE: fix 6 pre-existing failures + new coverage
├── components/
│   ├── Hero.tsx                 # MODIFY: store URL to sessionStorage before /login redirect
│   ├── new-scan/
│   │   ├── ChecksList.tsx       # REWRITE: WCAG principle checklist (Perceivable, Operable, etc.)
│   │   ├── ScanProgress.tsx     # NEW: animated step progress for right panel during scan
│   │   ├── UrlInput.tsx         # KEEP as-is (or minor style tweaks)
│   │   ├── DepthSelector.tsx    # KEEP as-is
│   │   ├── StandardsSelect.tsx  # KEEP as-is
│   │   └── constants.ts         # MODIFY: add WCAG principle items
│   ├── audit-detail/
│   │   ├── ScoreRing.tsx        # MODIFY: stroke width, animation, label below
│   │   ├── ScanningView.tsx     # REWRITE: step indicators (Crawling -> axe-core -> AI fixes)
│   │   ├── AuditHeader.tsx      # MODIFY: PDF button shows toast instead of calling downloadPdf
│   │   ├── ViolationCard.tsx    # REWRITE: collapsible card with AI sections
│   │   ├── ViolationList.tsx    # REWRITE: tab row (All/Critical/Serious/Moderate/Minor) + card list
│   │   └── constants.ts         # KEEP as-is
│   └── skeletons/
│       └── AuditDetailSkeleton.tsx  # UPDATE: match new layout
└── lib/
    └── format.ts                # KEEP: getScoreColor, getScoreBg already work
```

### Pattern 1: sessionStorage URL Preservation (AUTH-01)
**What:** Unauthenticated users who enter a URL in the landing Hero have it preserved through the login flow
**When to use:** Hero.tsx -> Login.tsx -> NewScan.tsx chain
**Implementation:**
```typescript
// Hero.tsx: Before navigating to /scan (which redirects to /login for unauth users)
// Currently: <Link to={`/scan?url=${encodeURIComponent(url)}&depth=${crawlDepth}`}>
// Problem: ProtectedRoute in App.tsx redirects to "/" not "/login", losing the URL
//
// Solution: Hero stores URL to sessionStorage, then links to /login directly for unauth
// OR: modify ProtectedRoute to preserve intended destination
//
// Simplest approach matching CONTEXT.md:
const SESSION_KEY = 'auditflow_pending_url'
sessionStorage.setItem(SESSION_KEY, url)
// Navigate to /scan?url=... (if logged in, works immediately)
// If not logged in, ProtectedRoute redirects to /

// Login.tsx: After successful auth
const pendingUrl = sessionStorage.getItem('auditflow_pending_url')
if (pendingUrl) {
  sessionStorage.removeItem('auditflow_pending_url')
  navigate(`/scan?url=${encodeURIComponent(pendingUrl)}`)
} else {
  navigate('/dashboard')
}

// NewScan.tsx: Already reads ?url= from searchParams -- no change needed
```

### Pattern 2: Collapsible Violation Cards
**What:** Each violation renders as a collapsed card; click expands to show "Why This Matters" + "How to Fix"
**When to use:** AuditDetail violations section
**Implementation options:**
1. **Native useState toggle** -- simplest, no extra dependency. Each card tracks `expanded: boolean`. Recommended.
2. **Radix Collapsible** -- animated expand. More complex for a list of items.
3. **HTML `<details>/<summary>`** -- native browser support but less styled.

**Recommendation:** Use useState toggle per card. Framer Motion `AnimatePresence` + `motion.div` for smooth expand animation (already installed).

### Pattern 3: SVG Circular Score Ring
**What:** Circular progress ring showing WCAG score percentage
**Already exists:** `src/components/audit-detail/ScoreRing.tsx`
**Current implementation:**
```typescript
// Already correct math:
const r = 44
const circ = 2 * Math.PI * r
const offset = circ - (score / 100) * circ
// Colors: green >= 80, yellow >= 60, red < 60 -- matches requirements
```
**Modifications needed:** Adjust stroke width, add WCAG level label below score, potentially add CSS animation on mount (stroke-dashoffset transition).

### Pattern 4: Severity Tab Filter with "All" Tab
**What:** Tab row showing All / Critical / Serious / Moderate / Minor with count badges
**Current state:** ViolationList has 4 sidebar buttons (critical/serious/moderate/minor), no "All" tab
**Redesign:** Horizontal tab row above violations list. Can use:
1. shadcn `<Tabs>` (already in project) -- proper a11y, keyboard nav built in
2. Custom buttons with manual state

**Recommendation:** Use shadcn Tabs for built-in accessibility. Map tab value to filter function.

### Anti-Patterns to Avoid
- **Inline hex colors:** Use Tailwind tokens. Existing code has `bg-[#4F46E5]` -- this is the established project pattern for the primary indigo, acceptable per project convention
- **Mutation of audit state:** Never mutate the audit object from useAudit; filter violations immutably
- **"use client" directive:** This is Vite, not Next.js -- never add it
- **Large monolithic components:** Keep sub-components under 200 lines. NewScan.tsx is currently 262 lines; should be broken further with the right panel as a separate component

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab accessibility | Custom tab key handling | shadcn `<Tabs>` (Radix) | Keyboard nav, ARIA roles, focus management built-in |
| Toast notifications | Custom toast component | `sonner` `toast()` | Already used in 4 settings pages, consistent UX |
| SVG score ring math | Canvas rendering or chart library | Raw SVG `<circle>` with stroke-dasharray | Already implemented in ScoreRing.tsx, <20 lines, no dependency needed |
| Expand/collapse animation | CSS transition hacks | Framer Motion `AnimatePresence` | Already installed, handles enter/exit animations cleanly |
| URL parsing | Manual string splitting | `useSearchParams()` from React Router | Already used in NewScan.tsx |

## Common Pitfalls

### Pitfall 1: Polling Interval Not Clearing
**What goes wrong:** useAudit hook's polling interval continues after audit completes
**Why it happens:** CLAUDE.md documents this as a known bug
**How to avoid:** The current `useAudit.ts` code actually handles this correctly now (Phase 1 fix) -- it clears interval when `audit.status !== 'scanning'`. Verify this works in the new ScanningView.
**Warning signs:** Network tab shows repeated GET requests after scan completes

### Pitfall 2: Test Assertions Matching Old DOM Structure
**What goes wrong:** Tests look for text/roles that no longer exist after redesign
**Why it happens:** Phase 1 refactored AuditDetail sub-components but didn't update tests. Phase 2 will further change DOM structure.
**How to avoid:** Rewrite tests alongside component changes. Use stable selectors: `data-testid`, role queries, accessible labels.
**Warning signs:** 6 pre-existing failures in AuditDetail.test.tsx; 4 in NewScan.test.tsx; 3 in sidebar.test.tsx; 2 in DashboardLayout.test.tsx

### Pitfall 3: ProtectedRoute Losing URL Context
**What goes wrong:** `ProtectedRoute` in App.tsx redirects to `"/"` when not authenticated, discarding any intended destination
**Why it happens:** The component does `<Navigate to="/" replace />` with no state preservation
**How to avoid:** For AUTH-01, use sessionStorage in Hero.tsx BEFORE navigation. Don't rely on URL params surviving the redirect chain. Login.tsx reads sessionStorage after successful auth.
**Warning signs:** URL disappears after login redirect

### Pitfall 4: Multiple WCAG 2.1 Text Matches in Tests
**What goes wrong:** NewScan.test.tsx line 98 fails with `getByText(/wcag 2\.1/i)` finding multiple matches
**Why it happens:** Both the StandardsSelect component and ChecksList render "WCAG 2.1" text
**How to avoid:** Use more specific selectors (`getAllByText` + index, or `within()` scoping, or `data-testid`)
**Warning signs:** "Found multiple elements" error in test output

### Pitfall 5: Score Ring Color Mismatch
**What goes wrong:** ScoreRing uses hardcoded hex colors (`#52c41a`, `#faad14`, `#ff4d4f`) that differ from Tailwind tokens
**Why it happens:** ScoreRing.tsx was written with direct hex, not using the project's Tailwind color scale
**How to avoid:** Use the same thresholds but map to Tailwind's green-500/yellow-500/red-500 equivalents, or keep hex but ensure they match the design system
**Warning signs:** Score ring colors look different from severity badge colors

### Pitfall 6: sessionStorage Not Cleared After Use
**What goes wrong:** Stale URL persists in sessionStorage, causing unexpected pre-fill on future visits
**Why it happens:** Forgetting to call `sessionStorage.removeItem()` after reading
**How to avoid:** Always remove the key immediately after reading in NewScan or Login redirect logic

## Code Examples

### Collapsible Violation Card with Framer Motion
```typescript
// Pattern for violation card expand/collapse
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Violation } from '@/types'

interface ViolationCardProps {
  violation: Violation
  impactColor: { bg: string; text: string; dot: string }
}

function ViolationCard({ violation, impactColor }: ViolationCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className={cn('h-2 w-2 rounded-full', impactColor.dot)} />
          <span className="text-sm font-medium text-gray-900">{violation.violation_type}</span>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', expanded && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {violation.ai_explanation && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Why This Matters</p>
                  <p className="text-sm text-gray-600">{violation.ai_explanation}</p>
                </div>
              )}
              {violation.ai_fix_steps && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">How to Fix</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{violation.ai_fix_steps}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### Scan Progress Steps Component
```typescript
// Pattern for right-panel scan progress
import { motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'

const SCAN_STEPS = [
  { id: 'crawl', label: 'Crawling pages', description: 'Discovering linked pages' },
  { id: 'analyze', label: 'Running axe-core', description: 'Testing WCAG compliance' },
  { id: 'ai', label: 'Generating AI fixes', description: 'Creating fix recommendations' },
]

interface ScanProgressProps {
  currentStep: number // 0-based index of active step
}

function ScanProgress({ currentStep }: ScanProgressProps) {
  return (
    <div className="space-y-4">
      {SCAN_STEPS.map((step, i) => {
        const isDone = i < currentStep
        const isActive = i === currentStep
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-start gap-3"
          >
            {isDone ? (
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            ) : isActive ? (
              <Loader2 className="h-5 w-5 text-[#4F46E5] animate-spin shrink-0 mt-0.5" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-gray-200 shrink-0 mt-0.5" />
            )}
            <div>
              <p className={cn('text-sm font-medium', isActive ? 'text-gray-900' : isDone ? 'text-gray-500' : 'text-gray-400')}>
                {step.label}
              </p>
              <p className="text-xs text-gray-400">{step.description}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
```

### sessionStorage URL Preservation (AUTH-01)
```typescript
// Hero.tsx modification -- store URL before navigation
const SESSION_URL_KEY = 'auditflow_pending_url'

// In the "Start Scanning" link handler:
function handleStartScanning() {
  sessionStorage.setItem(SESSION_URL_KEY, url)
  // Navigate to /scan?url=... -- if user is logged in, they arrive directly
  // If not logged in, ProtectedRoute redirects to "/"
}

// Login.tsx modification -- check sessionStorage after auth
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  // ... existing auth logic ...
  if (!error) {
    const pendingUrl = sessionStorage.getItem(SESSION_URL_KEY)
    if (pendingUrl) {
      sessionStorage.removeItem(SESSION_URL_KEY)
      navigate(`/scan?url=${encodeURIComponent(pendingUrl)}`)
    } else {
      navigate('/dashboard')
    }
  }
}

// NewScan.tsx -- already reads ?url= from searchParams, no change needed
```

### shadcn Tabs for Severity Filter
```typescript
// Usage of existing shadcn Tabs component
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const SEVERITY_TABS = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'serious', label: 'Serious' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'minor', label: 'Minor' },
]

// In AuditDetail:
<Tabs defaultValue="all" onValueChange={setImpactFilter}>
  <TabsList>
    {SEVERITY_TABS.map(tab => (
      <TabsTrigger key={tab.value} value={tab.value}>
        {tab.label}
        <span className="ml-1.5 text-xs">{getCount(tab.value)}</span>
      </TabsTrigger>
    ))}
  </TabsList>
</Tabs>
```

### Sonner Toast for PDF Stub
```typescript
import { toast } from 'sonner'

// In AuditHeader PDF button handler:
function handleDownload() {
  toast('PDF report generation coming soon', {
    description: 'This feature will be available in a future update.',
  })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 3-panel layout (list/details/how-to-fix) | Collapsible card list | Phase 2 redesign | Simpler, matches Figma, better mobile |
| Sidebar severity buttons | Horizontal tab row with "All" | Phase 2 redesign | More standard filter UX |
| Full-page scan progress | Right-panel step animation | Phase 2 redesign | User stays on NewScan page, sees form + progress |
| No URL preservation through auth | sessionStorage-based preservation | Phase 2 (AUTH-01) | Unauth users don't lose their URL |

## Open Questions

1. **Hero.tsx navigation target for unauthenticated users**
   - What we know: Hero currently links to `/scan?url=...`. ProtectedRoute redirects to `/` (landing). PublicOnlyRoute on `/login` redirects authenticated users to `/dashboard`.
   - What's unclear: Should Hero always link to `/scan` (relying on sessionStorage), or should it detect auth state and link to `/login` for unauth users?
   - Recommendation: Keep the `/scan?url=...` link as-is. Store URL to sessionStorage before navigating. When ProtectedRoute redirects to `/`, the user clicks login manually. Login.tsx checks sessionStorage after auth. This is the simplest approach matching CONTEXT.md's "silent" requirement.

2. **"All" tab filter logic**
   - What we know: Current filter shows violations matching one severity level at a time
   - What's unclear: Should "All" show all violations sorted by severity, or unsorted?
   - Recommendation: "All" shows all violations, sorted critical -> serious -> moderate -> minor

3. **Figma screen fetch budget**
   - What we know: Figma MCP has ~4 screen fetch limit per session
   - What's unclear: How many Phase 2 screens need fetching (NewScan, AuditDetail, Scanning state = 3 screens minimum)
   - Recommendation: Fetch in implementation plans: Plan 1 fetches NewScan + Scanning, Plan 2 fetches AuditDetail + Issues

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library + happy-dom |
| Config file | `vite.config.ts` (test section) |
| Quick run command | `npx vitest run src/pages/NewScan.test.tsx src/pages/AuditDetail.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCAN-01 | 2-column layout renders | unit | `npx vitest run src/pages/NewScan.test.tsx -x` | Yes (needs update) |
| SCAN-02 | Scan progress steps appear during loading | unit | `npx vitest run src/pages/NewScan.test.tsx -x` | Yes (needs update) |
| SCAN-03 | Scan blocked when credits=0, upgrade prompt shown | unit | `npx vitest run src/pages/NewScan.test.tsx -x` | Yes (needs update) |
| SCAN-04 | URL pre-filled from ?url= query param | unit | `npx vitest run src/pages/NewScan.test.tsx -x` | Yes (passes) |
| AUDIT-01 | Score ring renders with correct color | unit | `npx vitest run src/pages/AuditDetail.test.tsx -x` | Yes (needs rewrite) |
| AUDIT-02 | Scanning state shows step indicators | unit | `npx vitest run src/pages/AuditDetail.test.tsx -x` | Yes (needs rewrite) |
| AUDIT-03 | Violation cards expand to show AI content | unit | `npx vitest run src/pages/AuditDetail.test.tsx -x` | Yes (needs rewrite) |
| AUDIT-04 | Severity tab filters violations | unit | `npx vitest run src/pages/AuditDetail.test.tsx -x` | Yes (needs rewrite) |
| AUDIT-05 | PDF button shows "coming soon" toast | unit | `npx vitest run src/pages/AuditDetail.test.tsx -x` | Yes (needs rewrite) |
| AUTH-01 | URL preserved through login flow via sessionStorage | unit | `npx vitest run src/pages/Login.test.tsx -x` | No (Wave 0) |

### Sampling Rate
- **Per task commit:** `npx vitest run src/pages/NewScan.test.tsx src/pages/AuditDetail.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/pages/NewScan.test.tsx` -- rewrite assertions to match new DOM (4 currently failing)
- [ ] `src/pages/AuditDetail.test.tsx` -- rewrite all assertions to match new component structure (6 currently failing + new tests for expand/collapse, tab filter, toast)
- [ ] `src/pages/Login.test.tsx` -- new test file for AUTH-01 sessionStorage redirect (does not exist yet)
- [ ] Fix pre-existing sidebar.test.tsx failures (3 tests) and DashboardLayout.test.tsx failures (2 tests) -- these are outside Phase 2 scope but affect the full suite pass rate

### Current Test State (16 failures across 4 files)
| File | Failing | Passing | Root Cause |
|------|---------|---------|------------|
| AuditDetail.test.tsx | 6 | 2 | Phase 1 refactored DOM, tests not updated |
| NewScan.test.tsx | 4 | 7 | Text queries match multiple elements or wrong text |
| sidebar.test.tsx | 3 | 2 | Active nav highlighting logic changed |
| DashboardLayout.test.tsx | 3 | 1 | Credit balance, signOut, null credits assertions |

**Note:** sidebar and DashboardLayout failures are pre-existing and not Phase 2 scope. Phase 2 should fix NewScan and AuditDetail tests. If sidebar/DashboardLayout failures are trivial, fix opportunistically.

## Sources

### Primary (HIGH confidence)
- **Codebase inspection:** All source files listed in Architecture Patterns section read directly
- **ScoreRing.tsx:** SVG circle math verified from source -- stroke-dasharray/offset pattern is standard
- **useAudit.ts:** Polling logic verified -- correctly clears interval on status change
- **shadcn Tabs (tabs.tsx):** Radix UI TabsPrimitive, accessible keyboard nav built-in

### Secondary (MEDIUM confidence)
- **Framer Motion AnimatePresence:** Used per project installation (v12.23.24), pattern is standard for enter/exit animations
- **sessionStorage API:** Standard Web API, no library needed

### Tertiary (LOW confidence)
- None -- all findings based on direct codebase inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and verified in codebase
- Architecture: HIGH - existing component structure inspected, modification plan clear
- Pitfalls: HIGH - all pitfalls identified from actual test failures and code inspection
- AUTH-01 flow: HIGH - ProtectedRoute redirect behavior verified in App.tsx source

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable -- no external dependencies or version concerns)
