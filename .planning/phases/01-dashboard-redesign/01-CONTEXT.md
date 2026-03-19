# Phase 1: Dashboard Redesign - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers a polished, data-driven dashboard that matches the provided Figma design and gives users immediate insight into their audit portfolio. Scope includes: 4 stat cards with real data, shimmer skeleton loading states on Dashboard + Reports + AuditDetail, a meaningful empty state with CTA, and a recent audits list (last 5).

</domain>

<decisions>
## Implementation Decisions

### Loading & Skeleton States
- Use shimmer/pulse gray blocks matching card shapes (shadcn `<Skeleton>` component)
- Apply skeletons on: Dashboard, Reports, and AuditDetail pages (initial load only)
- Show 4 stat card skeleton blocks while loading (matching final layout)
- Show 3 skeleton rows for the audit list (enough to indicate structure)
- Inline actions (delete, download) continue to use local spinner state, not skeleton

### Stats Card Data
- 4 stats: Total Audits, Avg WCAG Score, Critical Issues, Compliant Sites
- "Compliant Sites" = count of completed audits with `wcag_score >= 80`
- "Critical Issues" = sum of `critical_count` across all completed audits
- When zero audits exist: show "0" or "—" in stat cards (do not hide them)

### Audit List & Empty State
- Dashboard shows last 5 audits only, with "View all reports →" link to `/reports`
- Score in list rows: colored number (green ≥80 / yellow ≥60 / red <60) — no ring (ring reserved for AuditDetail)
- Empty state CTA: navigates to `/scan`
- Empty state copy: "No audits yet. Run your first scan to see your accessibility score."

### Claude's Discretion
- Exact Figma pixel values, spacing, shadows — match Figma design at node `17-20021` in file `1YlIhl3QmvzlH8fKo8qBq5`
- Icon choices per stat card
- Relative time format (e.g. "2 hours ago" via a formatRelativeTime utility)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DashboardNew.tsx` — existing StatCard, StatusBadge, WcagBadge sub-components; has `useAudits` + `useCredits` hooks wired
- `src/components/ui/skeleton.tsx` — shadcn Skeleton component available (standard)
- `useAudits` hook — returns `{ audits, loading, refetch }`
- `useCredits` hook — returns `{ credits }`
- `auditApi.delete()`, `auditApi.downloadPdf()` — already implemented

### Established Patterns
- Stat cards: `rounded-xl border border-gray-100 bg-white p-5 shadow-sm`
- Status badges: inline-flex with colored dot + label
- WCAG score colors: green-600 ≥80, yellow-600 ≥60, red-600 <60
- `cn()` for conditional classNames from `@/lib/utils`
- Function declaration components (not arrow function exports)
- shadcn `<Button>` variants: default, outline, ghost, destructive

### Integration Points
- `DashboardLayout.tsx` wraps all dashboard pages — no changes needed to layout
- `/reports` route already exists (Reports.tsx) — "View all" link works
- `/scan` route already exists (NewScan.tsx) — empty state CTA works

</code_context>

<specifics>
## Specific Ideas

- **Figma design URL:** https://www.figma.com/design/1YlIhl3QmvzlH8fKo8qBq5/Auditflow-Wireframes?node-id=17-20021 — fetch this before implementing visual layout
- User said: "use this design" — visual implementation must match Figma exactly, not approximate

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
