# Phase 6: Polish & Responsive - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers three orthogonal improvements: (1) Framer Motion page transitions across all dashboard routes, (2) responsive sidebar that auto-collapses to icon-only at 768–1279px and becomes a hamburger drawer below 768px, and (3) visible keyboard focus indicators across all interactive dashboard elements.

</domain>

<decisions>
## Implementation Decisions

### Page Transitions
- Use `AnimatePresence` wrapping `<Outlet />` in `DashboardLayout` — single integration point for all dashboard pages
- Opacity fade only: `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, `exit={{ opacity: 0 }}`, duration 200ms — subtle, non-distracting for B2B
- Use `location.pathname` as the `key` prop on the animated div to trigger re-animation on route change
- Scope: dashboard pages only (within `DashboardLayout`) — do not animate public/auth pages

### Sidebar Responsive Behavior
- Auto-collapse sidebar at 768–1279px via breakpoint detection: `useIsMobile` already exists for <768px; add `useIsTablet` hook watching the 1280px breakpoint
- Collapsed (icon-only) state: icon centered in sidebar, Radix `TooltipProvider` wrapping nav items so label appears on hover
- Mobile hamburger (`md:hidden` button in DashboardLayout header) already wired — no changes needed
- Hide the manual collapse toggle button when sidebar is auto-collapsed at tablet breakpoint (user cannot manually expand at 768–1279px)

### Keyboard Accessibility & Focus Indicators
- Focus indicator style: `focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2` — indigo ring matching design system primary
- Apply via global CSS rule in `src/index.css` (`:focus-visible` selector) so all interactive elements inherit it; override per-component where needed
- Scope: all interactive elements in dashboard scope — buttons, links, inputs, modals, dropdowns, sidebar nav items; skip landing/public pages
- No skip links — not required by success criteria and complex to implement correctly

### Claude's Discretion
- Exact `motion.div` wrapper placement within DashboardLayout (before/after header, full-height vs content-only)
- Whether to use `mode="wait"` on AnimatePresence for cleaner transitions
- Tooltip content for collapsed sidebar items (use `item.label` directly)
- Which specific elements need focus ring overrides vs inherit from global CSS

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `framer-motion@12.x` already installed; used in `ScanProgress.tsx`, `ScanningView.tsx`, `ViolationCard.tsx`
- `AnimatePresence` already used in `ViolationCard.tsx` — established pattern
- `useIsMobile` hook at `src/hooks/use-mobile.ts` — watches 768px breakpoint via `matchMedia`
- `Sheet` + `SheetContent` from shadcn/ui already used for mobile drawer in `DashboardLayout.tsx`
- `Sidebar` component at `src/components/sidebar.tsx` — has `collapsed` state + CSS `transition-all duration-300`
- `Tooltip`, `TooltipProvider`, `TooltipContent`, `TooltipTrigger` available in `src/components/ui/` (shadcn/ui Radix)
- `cn()` utility from `src/lib/utils.ts` for conditional class merging

### Established Patterns
- Framer Motion: `initial={{ opacity: 0, x: -10 }}` + `animate={{ opacity: 1, x: 0 }}` + `transition={{ delay: i * 0.15 }}` (ScanProgress stagger pattern)
- Step transition in onboarding: `<AnimatePresence mode="wait">` with `initial={{ opacity: 0, x: 20 }}` / `exit={{ opacity: 0, x: -20 }}`
- Sidebar collapsed state: `w-16` vs `w-64` with `transition-all duration-300` — CSS-driven width change
- `hidden md:flex` on aside element — sidebar is desktop-only, mobile uses Sheet drawer
- `useLocation()` available from react-router-dom for pathname tracking

### Integration Points
- `DashboardLayout.tsx` — primary file for page transition and sidebar responsive changes
- `src/components/sidebar.tsx` — add tooltip wrapping, tablet auto-collapse prop
- `src/hooks/use-mobile.ts` — reference for creating `useIsTablet` alongside it
- `src/index.css` — add global `:focus-visible` CSS rule

</code_context>

<specifics>
## Specific Ideas

No specific references — open to standard approaches within the decisions above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
