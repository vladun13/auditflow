# Phase 1: Dashboard Redesign - Research

**Researched:** 2026-03-19
**Domain:** React dashboard UI redesign with skeleton loading states
**Confidence:** HIGH

## Summary

Phase 1 is a frontend-only redesign of the existing `DashboardNew.tsx` page, plus adding shimmer skeleton loading states to Dashboard, Reports, and AuditDetail pages. All backend APIs already exist and return the required data. The existing hooks (`useAudits`, `useCredits`) already wire up to the API and return `loading` state -- the primary work is replacing the current spinner-based loading with skeleton placeholders and restructuring the dashboard to match the UI spec (4 stat cards, last-5 audits list, proper empty state).

The codebase already has shadcn/ui `<Skeleton>` component installed, all necessary Lucide icons available, and established patterns for stat cards, status badges, and WCAG score coloring. A detailed UI spec (`01-UI-SPEC.md`) provides exact component structure, spacing tokens, color assignments, and copywriting. No new dependencies are required.

**Primary recommendation:** Refactor `DashboardNew.tsx` to match the UI spec (change stat cards from 3 to 4, add "Compliant Sites" / "Critical Issues", limit table to 5 rows with "View All" link, replace spinner with skeleton loading), then create reusable skeleton components for Reports and AuditDetail.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use shimmer/pulse gray blocks matching card shapes (shadcn `<Skeleton>` component)
- Apply skeletons on: Dashboard, Reports, and AuditDetail pages (initial load only)
- Show 4 stat card skeleton blocks while loading (matching final layout)
- Show 3 skeleton rows for the audit list (enough to indicate structure)
- Inline actions (delete, download) continue to use local spinner state, not skeleton
- 4 stats: Total Audits, Avg WCAG Score, Critical Issues, Compliant Sites
- "Compliant Sites" = count of completed audits with `wcag_score >= 80`
- "Critical Issues" = sum of `critical_count` across all completed audits
- When zero audits exist: show "0" or "--" in stat cards (do not hide them)
- Dashboard shows last 5 audits only, with "View all reports" link to `/reports`
- Score in list rows: colored number (green >=80 / yellow >=60 / red <60) -- no ring
- Empty state CTA: navigates to `/scan`
- Empty state copy: "No audits yet. Run your first scan to see your accessibility score."
- Visual implementation must match Figma design at node `17-20021` in file `1YlIhl3QmvzlH8fKo8qBq5`

### Claude's Discretion
- Exact Figma pixel values, spacing, shadows -- match Figma design
- Icon choices per stat card
- Relative time format (e.g. "2 hours ago" via a formatRelativeTime utility)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | User sees 4 stat cards (Total Audits, Avg WCAG Score, Critical Issues, Compliant Sites) populated from real API data | Existing `useAudits` hook returns all audit data needed; stat computations are client-side from the audits array. UI spec defines exact card layout, icons, and colors. |
| DASH-02 | User sees loading skeletons while dashboard data is fetching | shadcn `<Skeleton>` component already installed at `src/components/ui/skeleton.tsx`; replace current spinner with skeleton layout matching card dimensions. |
| DASH-03 | User sees a meaningful empty state with CTA when no audits exist | Empty state already partially implemented in `DashboardNew.tsx`; needs copy update per CONTEXT.md and layout per UI spec. |
| DASH-04 | User sees recent audits list (last 5) with score, URL, time ago, status badge | Current implementation shows ALL audits in a full table; needs to slice to 5, add relative time formatting, replace WCAG badge with colored score number, add "View all" link. |
| PLSH-01 | Loading skeletons shown on all data-fetching pages (Dashboard, Reports, AuditDetail) | Same `<Skeleton>` component used across all three pages; create page-specific skeleton layouts replacing current spinners. |

</phase_requirements>

## Standard Stack

### Core (already installed -- no new packages)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.0 | UI framework | Project standard |
| shadcn/ui (Skeleton) | latest | Skeleton loading component | Already in `src/components/ui/skeleton.tsx` |
| Lucide React | 0.555.0 | Icons (FileText, BarChart2, AlertTriangle, ShieldCheck, ScanSearch, etc.) | Project standard |
| Tailwind CSS | 4.1.17 | Styling | Project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns or custom utility | N/A | Relative time formatting ("2 hours ago") | For DASH-04 time display |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| date-fns `formatDistanceToNow` | Custom `formatRelativeTime()` utility | date-fns adds ~7KB gzipped; a 15-line custom utility covers the use case. Prefer custom since only one format function is needed. |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended File Structure
```
src/
├── pages/
│   └── DashboardNew.tsx         # Refactored: 4 stat cards, last 5 audits, skeleton loading
├── components/
│   ├── dashboard/
│   │   ├── StatCard.tsx          # Extracted reusable stat card component
│   │   ├── DashboardSkeleton.tsx # Full-page skeleton for Dashboard loading state
│   │   ├── StatusBadge.tsx       # Extracted from DashboardNew (reused by Reports)
│   │   └── RecentAuditRow.tsx    # Single audit row in the recent list
│   ├── skeletons/
│   │   ├── ReportsSkeleton.tsx   # Skeleton for Reports page
│   │   └── AuditDetailSkeleton.tsx # Skeleton for AuditDetail page
│   └── ui/
│       └── skeleton.tsx          # Existing shadcn Skeleton (no changes)
├── lib/
│   └── format.ts                 # formatRelativeTime() utility
└── hooks/
    ├── useAudits.ts              # No changes needed
    └── useCredits.ts             # No changes needed
```

### Pattern 1: Skeleton-First Loading
**What:** Replace the current full-page spinner with skeleton placeholders that match the final layout shape.
**When to use:** On initial data load for any page with async data.
**Example:**
```typescript
// In DashboardNew.tsx
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'

export function DashboardNew() {
  const { audits, loading } = useAudits()

  if (loading) {
    return <DashboardSkeleton />
  }
  // ... render actual content
}
```

### Pattern 2: Computed Stats from Existing Data
**What:** Derive stat card values from the audits array returned by `useAudits()`. No new API endpoints needed.
**When to use:** Stats that are aggregations of data already fetched.
**Example:**
```typescript
const completedAudits = audits.filter(a => a.status === 'completed')
const totalAudits = audits.length
const avgScore = completedAudits.length > 0
  ? Math.round(completedAudits.reduce((sum, a) => sum + (a.wcag_score || 0), 0) / completedAudits.length)
  : 0
const criticalIssues = completedAudits.reduce((sum, a) => sum + a.critical_count, 0)
const compliantSites = completedAudits.filter(a => (a.wcag_score || 0) >= 80).length
```

### Pattern 3: Extract Sub-Components for Reuse
**What:** Extract `StatCard`, `StatusBadge` from the monolithic `DashboardNew.tsx` into dedicated files under `src/components/dashboard/`.
**When to use:** When components are reused across pages or when a page file exceeds 200 lines.

### Anti-Patterns to Avoid
- **Monolithic page components:** Current `DashboardNew.tsx` at 252 lines with inline sub-components. Extract to separate files for maintainability.
- **Hardcoded hex colors:** Use Tailwind tokens (`text-primary`, `bg-green-50`) instead of inline `#4F46E5`. The current code has several hardcoded hex values that should be converted to design tokens.
- **Fetching all audits then slicing:** The current code fetches all audits. For the dashboard's "last 5" list, slice on the client side (`audits.slice(0, 5)`). This is acceptable since the full list is still needed for stat computations.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Skeleton loading | Custom shimmer CSS animation | shadcn `<Skeleton>` component | Already installed, consistent with project's UI library, handles animation via `animate-pulse` |
| Score color logic | Inline conditionals per-component | Shared `getScoreColor(score)` / `getScoreBg(score)` utility | Already exists in `Reports.tsx` -- extract and share |
| Status badge rendering | Copy-paste badge styles | Extracted `<StatusBadge>` component | Already exists in `DashboardNew.tsx` -- extract to shared location |

**Key insight:** Most visual components needed already exist in the codebase (StatCard, StatusBadge, score color functions). The work is extraction, reorganization, and updating to match the UI spec -- not building from scratch.

## Common Pitfalls

### Pitfall 1: Test Expectations Mismatch After Redesign
**What goes wrong:** Existing `DashboardNew.test.tsx` tests (7 tests) expect specific text like "Avg. Score", "Recent Audits", "Start New Audit", "View All Reports" and a loading spinner element. After redesign, these will break.
**Why it happens:** Tests are tightly coupled to current UI copy and structure.
**How to avoid:** Update tests alongside the component. The test file expects:
- `screen.getByText('Avg. Score')` -- needs to change to `'Avg WCAG Score'`
- `screen.getByText('Recent Audits')` -- heading text may change
- `screen.getByText('Start New Audit')` / `screen.getByText('View All Reports')` -- quick action cards being removed
- Loading state test expects `loading dashboard` text -- will be skeleton instead
- `useCredits` is mocked globally but the test does not mock it -- after removing the "Credits Used" card this may not matter, but verify
**Warning signs:** Tests fail after component changes.

### Pitfall 2: useCredits Mock Missing in Dashboard Tests
**What goes wrong:** Current `DashboardNew.tsx` imports `useCredits` but the test file only mocks `useAudits`. After redesign removes the credits card, this is fine, but if any credits reference remains, tests will fail with actual API calls.
**Why it happens:** `useCredits` is called but not mocked in test setup.
**How to avoid:** Ensure the redesigned component either removes `useCredits` usage entirely (the 4 new stat cards don't need it) or add the mock.

### Pitfall 3: Skeleton Dimensions Not Matching Final Layout
**What goes wrong:** Skeletons render in different dimensions than the actual loaded content, causing a jarring "jump" when data arrives.
**Why it happens:** Skeleton dimensions are eyeballed rather than matching the actual component dimensions.
**How to avoid:** Use the same container classes (grid cols, padding, card radius) for both skeleton and loaded states. The skeleton should be a structural mirror of the final layout with gray blocks replacing content.

### Pitfall 4: Score Color Duplication
**What goes wrong:** Score color logic is defined independently in `DashboardNew.tsx` (for table cells) and `Reports.tsx` (`getScoreColor`/`getScoreBg`). Adding a third instance in the dashboard redesign creates maintenance risk.
**Why it happens:** No shared utility for score colors.
**How to avoid:** Extract `getScoreColor()` and `getScoreBg()` to a shared location (e.g., `src/lib/format.ts` or `src/lib/score-utils.ts`) and import everywhere.

### Pitfall 5: Empty State Copy Inconsistency
**What goes wrong:** CONTEXT.md says "No audits yet. Run your first scan to see your accessibility score." but the UI spec says "Run your first accessibility scan to see results here. It only takes a minute."
**Why it happens:** Two separate documents define the same copy.
**How to avoid:** CONTEXT.md decisions are locked. Use the CONTEXT.md copy for the empty state body. The heading ("No audits yet") is consistent across both.

## Code Examples

### Stat Card Component (from UI spec)
```typescript
// src/components/dashboard/StatCard.tsx
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  iconBg: string
}

export function StatCard({ label, value, icon, iconBg }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-xs font-normal uppercase tracking-wide text-muted-foreground mb-2">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconBg)}>
          {icon}
        </span>
        <span className="text-[28px] font-bold text-foreground">{value}</span>
      </div>
    </div>
  )
}
```

### Dashboard Skeleton (from UI spec)
```typescript
// src/components/dashboard/DashboardSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8">
      {/* Heading skeleton */}
      <div className="mb-6">
        <Skeleton className="h-7 w-48 mb-1" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <Skeleton className="h-4 w-20 mb-2" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-border last:border-b-0">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Relative Time Utility
```typescript
// src/lib/format.ts
export function formatRelativeTime(dateString: string): string {
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}
```

### Score Color Shared Utility
```typescript
// src/lib/format.ts (or score-utils.ts)
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-50'
  if (score >= 60) return 'bg-yellow-50'
  return 'bg-red-50'
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full-page spinner while loading | Skeleton placeholders matching layout | Standard practice since 2020+ | Reduces perceived load time, prevents layout shift |
| Show all audits on dashboard | Show last 5 + "View All" link | Dashboard UX best practice | Reduces cognitive load, faster render |
| 3 stat cards (Total, Avg Score, Credits) | 4 stat cards (Total, Avg Score, Critical Issues, Compliant Sites) | Phase 1 redesign | More actionable insights at a glance |

**No deprecated patterns:** All technologies used (React 19, Tailwind 4, shadcn/ui) are current.

## Open Questions

1. **Figma access for pixel-perfect matching**
   - What we know: Figma URL is provided (node `17-20021`), but direct web fetch is blocked (403). A UI spec (`01-UI-SPEC.md`) has been generated with detailed component specifications.
   - What's unclear: Whether the UI spec fully captures the Figma design's exact spacing, shadows, and visual nuances.
   - Recommendation: Use the UI spec as the authoritative source. If pixel discrepancies arise during implementation, the user can provide Figma screenshots for specific components.

2. **Empty state copy discrepancy**
   - What we know: CONTEXT.md says "No audits yet. Run your first scan to see your accessibility score." The UI spec says different copy.
   - What's unclear: Which takes precedence when they conflict.
   - Recommendation: CONTEXT.md decisions are locked. Use CONTEXT.md copy.

3. **Reports and AuditDetail skeleton scope**
   - What we know: PLSH-01 requires skeletons on Dashboard, Reports, and AuditDetail.
   - What's unclear: Whether Reports and AuditDetail skeleton designs need Figma reference or can follow the Dashboard skeleton pattern.
   - Recommendation: Create skeleton layouts that mirror each page's existing structure. No Figma needed -- skeletons just match the rendered layout's shape.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library + happy-dom |
| Config file | `vite.config.ts` (test section) |
| Quick run command | `npx vitest run src/pages/DashboardNew.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | 4 stat cards render with correct computed values | unit | `npx vitest run src/pages/DashboardNew.test.tsx -t "stat cards"` | Exists but needs update |
| DASH-02 | Skeleton shown during loading state | unit | `npx vitest run src/pages/DashboardNew.test.tsx -t "loading"` | Exists but tests spinner, needs update to test skeleton |
| DASH-03 | Empty state with CTA displayed for 0 audits | unit | `npx vitest run src/pages/DashboardNew.test.tsx -t "empty state"` | Exists, needs copy update |
| DASH-04 | Last 5 audits shown with score, URL, time, status | unit | `npx vitest run src/pages/DashboardNew.test.tsx -t "recent audits"` | Partially exists (max 5 test), needs score/time assertions |
| PLSH-01 | Skeletons on Reports and AuditDetail pages | unit | `npx vitest run src/pages/Reports.test.tsx src/pages/AuditDetail.test.tsx` | Exist but test spinners, need skeleton updates |

### Sampling Rate
- **Per task commit:** `npx vitest run src/pages/DashboardNew.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Update `src/pages/DashboardNew.test.tsx` -- update expectations for new stat card labels, skeleton loading, "View all" link, score display format
- [ ] Update `src/pages/Reports.test.tsx` -- replace spinner test with skeleton test
- [ ] Update `src/pages/AuditDetail.test.tsx` -- replace spinner test with skeleton test
- [ ] Add `src/lib/format.test.ts` -- unit tests for `formatRelativeTime()` and shared `getScoreColor()`/`getScoreBg()`

## Sources

### Primary (HIGH confidence)
- Project source code: `src/pages/DashboardNew.tsx`, `src/hooks/useAudits.ts`, `src/hooks/useCredits.ts`, `src/components/ui/skeleton.tsx` -- direct inspection
- UI spec: `.planning/phases/01-dashboard-redesign/01-UI-SPEC.md` -- authoritative design contract
- CONTEXT.md: `.planning/phases/01-dashboard-redesign/01-CONTEXT.md` -- locked user decisions

### Secondary (MEDIUM confidence)
- `CLAUDE.md` project guide -- comprehensive project context and conventions

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use, no new dependencies
- Architecture: HIGH -- pattern is component extraction and refactoring of existing code
- Pitfalls: HIGH -- identified from direct analysis of existing test file expectations vs. new requirements

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable -- no moving targets, all dependencies locked)
