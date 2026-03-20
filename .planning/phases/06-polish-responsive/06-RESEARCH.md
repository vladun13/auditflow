# Phase 6: Polish & Responsive - Research

**Researched:** 2026-03-20
**Domain:** Framer Motion page transitions, responsive sidebar, keyboard accessibility
**Confidence:** HIGH

## Summary

Phase 6 delivers three orthogonal UI improvements to existing dashboard infrastructure: (1) Framer Motion page transitions via AnimatePresence wrapping the Outlet in DashboardLayout, (2) responsive sidebar that auto-collapses to icon-only at tablet breakpoints using a new useIsTablet hook, and (3) global focus-visible indicators via CSS in index.css.

All three areas build on established patterns already in the codebase. Framer Motion 12.x is installed and used in ViolationCard, ScanProgress, and ScanningView. The sidebar already has a collapsed state with CSS transition. Tooltip components from shadcn/ui (Radix) are available. The focus-visible approach is pure CSS with no library dependencies.

**Primary recommendation:** Implement as three independent workstreams -- page transitions (DashboardLayout.tsx only), sidebar responsive (sidebar.tsx + new useIsTablet hook), and focus indicators (index.css + targeted overrides) -- since they have no cross-dependencies.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Page transitions:** AnimatePresence wrapping Outlet in DashboardLayout, opacity fade only (200ms), location.pathname as key, dashboard pages only
- **Sidebar responsive:** useIsTablet hook watching 1280px breakpoint, Radix TooltipProvider on collapsed nav items, hide manual collapse toggle at tablet breakpoint
- **Keyboard focus:** `focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2` via global CSS rule in index.css, dashboard scope only, no skip links

### Claude's Discretion
- Exact motion.div wrapper placement within DashboardLayout (before/after header, full-height vs content-only)
- Whether to use mode="wait" on AnimatePresence
- Tooltip content for collapsed sidebar items (use item.label directly)
- Which specific elements need focus ring overrides vs inherit from global CSS

### Deferred Ideas (OUT OF SCOPE)
None.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PLSH-02 | Framer Motion animations on scan progress steps and page transitions | AnimatePresence + motion.div pattern already established in ViolationCard.tsx; wrap Outlet in DashboardLayout with opacity fade |
| PLSH-03 | Sidebar collapses to icon-only at 768-1279px; becomes hamburger drawer at <768px | Sidebar already has collapsed state + CSS transition; mobile drawer already works via Sheet; add useIsTablet hook + Tooltip wrapping |
| PLSH-04 | All interactive elements are keyboard navigable and have visible focus indicators | Global :focus-visible CSS rule in index.css; shadcn/ui components already use Radix (keyboard-accessible by default) |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | 12.23.24 | Page transition animations | Already in use; AnimatePresence + motion.div for route transitions |
| @radix-ui/react-tooltip | (via shadcn/ui) | Tooltip on collapsed sidebar items | Already available in src/components/ui/tooltip.tsx |
| Tailwind CSS | 4.1.17 | Focus-visible utility classes | Already in use; `focus-visible:ring-*` utilities built-in |

### Supporting (no new installs needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-router-dom | 7.9.6 | useLocation for route key | Already used in DashboardLayout and sidebar |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion page transitions | React Router view transitions API | View Transitions API is experimental and not widely supported; Framer Motion already installed |
| Global CSS :focus-visible | Per-component Tailwind classes | Global rule reduces repetition; per-component only needed for overrides |

**Installation:**
```bash
# No new packages required -- all dependencies already installed
```

## Architecture Patterns

### Recommended Changes (by file)
```
src/
├── index.css                    # Add global :focus-visible rule
├── hooks/
│   └── use-tablet.ts            # NEW: useIsTablet hook (mirrors use-mobile.ts)
├── layouts/
│   └── DashboardLayout.tsx      # Wrap Outlet with AnimatePresence + motion.div
└── components/
    └── sidebar.tsx              # Accept isTablet prop, add Tooltip wrapping, hide toggle
```

### Pattern 1: AnimatePresence Page Transitions
**What:** Wrap `<Outlet />` inside `<AnimatePresence>` with a `motion.div` keyed on `location.pathname`
**When to use:** Dashboard routes only (within DashboardLayout)
**Example:**
```typescript
// In DashboardLayout.tsx -- wrap the Outlet area
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// Inside the component:
const location = useLocation()  // already imported

// In JSX, replace <Outlet /> with:
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>
```

**Placement recommendation:** The motion.div should wrap ONLY the Outlet inside `<main>`, keeping the header static. This prevents the header from flashing during transitions.

**mode="wait" recommendation:** Use `mode="wait"` so the exiting page fades out before the entering page fades in. Without it, both pages render simultaneously during the transition causing layout jumps.

### Pattern 2: Responsive Sidebar with useIsTablet
**What:** New hook detects 768-1279px range; sidebar accepts `collapsed` as a prop driven by this hook
**When to use:** Sidebar should auto-collapse at tablet, user can manually collapse at desktop
**Example:**
```typescript
// src/hooks/use-tablet.ts
import { useState, useEffect } from 'react'

const TABLET_MAX = 1280

export function useIsTablet() {
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${TABLET_MAX - 1}px)`)
    const onChange = () => setIsTablet(mql.matches)
    mql.addEventListener('change', onChange)
    setIsTablet(mql.matches)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isTablet
}
```

```typescript
// sidebar.tsx changes:
// - Accept `forceCollapsed` prop from DashboardLayout
// - When forceCollapsed is true: always show collapsed state, hide toggle button
// - When forceCollapsed is false: user controls collapse via existing toggle
// - Wrap each nav item in Tooltip when collapsed
```

### Pattern 3: Tooltip on Collapsed Nav Items
**What:** When sidebar is collapsed, wrap each Link in a Radix Tooltip showing the item label
**Example:**
```typescript
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Wrap entire sidebar in TooltipProvider (once)
// Then per nav item:
const navLink = (
  <Link to={item.path} className={...}>
    <item.icon className="h-4 w-4 shrink-0" />
    {!isCollapsed && <span>{item.label}</span>}
  </Link>
)

// When collapsed, wrap in Tooltip:
{isCollapsed ? (
  <Tooltip>
    <TooltipTrigger asChild>{navLink}</TooltipTrigger>
    <TooltipContent side="right">{item.label}</TooltipContent>
  </Tooltip>
) : navLink}
```

### Pattern 4: Global Focus-Visible CSS
**What:** Add a `:focus-visible` rule in `src/index.css` applying indigo ring to all interactive elements
**Example:**
```css
/* In src/index.css, inside @layer base */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #4F46E5;
}
```

**Important:** Use `box-shadow` instead of Tailwind's `ring` utilities in the global rule because ring utilities require Tailwind class compilation. The `box-shadow` approach gives the same visual effect (2px white offset + 2px indigo ring) and works on any element.

**Alternative (Tailwind approach):** If using the Tailwind `@apply` directive within `@layer base`, this also works:
```css
@layer base {
  :focus-visible {
    @apply outline-none ring-2 ring-[#4F46E5] ring-offset-2;
  }
}
```

### Anti-Patterns to Avoid
- **Animating layout properties:** Never animate `height`, `width`, or `top`/`left` for page transitions -- opacity is GPU-accelerated and performant
- **Missing prefers-reduced-motion:** The codebase already has a `prefers-reduced-motion` media query in index.css (line 70-76) that sets `transition-duration: 0.01ms`. Framer Motion respects this via its own `useReducedMotion` hook, but the CSS rule covers CSS transitions too
- **Focus ring on non-interactive elements:** The `:focus-visible` selector naturally only applies to focusable elements (buttons, links, inputs), not divs/spans, so no extra filtering needed
- **Sidebar state conflicts:** Do not allow manual expand when `forceCollapsed` is true (tablet breakpoint) -- the sidebar would immediately re-collapse on the next render

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive breakpoint detection | Custom resize event listener with debounce | `window.matchMedia` API (as in use-mobile.ts) | matchMedia is event-driven, no polling, no debounce needed |
| Tooltips | Custom tooltip with positioning logic | Radix Tooltip via shadcn/ui | Already installed; handles positioning, accessibility, keyboard support |
| Page transition animations | CSS keyframes + route change detection | Framer Motion AnimatePresence | Already installed; handles mount/unmount animations, exit animations |
| Focus indicator styling | Per-component focus classes on every interactive element | Global :focus-visible CSS rule | Single rule covers all elements; override only where needed |

**Key insight:** Every library needed is already installed. This phase is purely about wiring existing tools together -- zero new dependencies.

## Common Pitfalls

### Pitfall 1: AnimatePresence Key Mismatch
**What goes wrong:** Page transition does not trigger when navigating between routes
**Why it happens:** The `key` prop on the motion.div must change when the route changes. Using a static key or forgetting the key entirely means AnimatePresence never detects a component swap.
**How to avoid:** Always use `location.pathname` as the key. Import `useLocation` from react-router-dom.
**Warning signs:** No fade animation when clicking sidebar nav links.

### Pitfall 2: Exit Animation Not Running
**What goes wrong:** Page fades in but does not fade out when leaving
**Why it happens:** AnimatePresence requires its direct child to have a `key` prop AND the child must be conditionally rendered (or replaced). If the Outlet stays mounted, exit never fires.
**How to avoid:** The `key={location.pathname}` approach causes React to unmount the old motion.div and mount a new one, which triggers exit correctly.
**Warning signs:** Content snaps away instantly, only fade-in visible.

### Pitfall 3: Scroll Position on Route Change
**What goes wrong:** After page transition, the new page is scrolled to the middle instead of the top
**Why it happens:** The `<main>` element retains its scroll position across route changes because the scroll container persists.
**How to avoid:** Add a scroll-to-top effect keyed on location.pathname, or reset scrollTop on the main container within the motion.div's `onAnimationComplete`.
**Warning signs:** Navigating from a long page (Reports) to Dashboard shows content below the fold.

### Pitfall 4: Tooltip Not Showing on Collapsed Sidebar
**What goes wrong:** Tooltips do not appear when hovering icon-only nav items
**Why it happens:** Missing `TooltipProvider` wrapper (required once at the top of the tooltip tree) or `asChild` prop missing on `TooltipTrigger`.
**How to avoid:** Wrap the entire sidebar in `<TooltipProvider delayDuration={0}>` and use `asChild` on TooltipTrigger so the Link is the actual trigger element.
**Warning signs:** Hovering collapsed nav items shows nothing; console shows no errors.

### Pitfall 5: Focus Ring on shadcn/ui Components
**What goes wrong:** Some shadcn/ui components (Dialog, DropdownMenu, Select) already have their own focus styles that conflict with the global rule
**Why it happens:** shadcn/ui components use Radix primitives that set their own `outline` and `box-shadow` styles
**How to avoid:** After adding the global rule, visually audit all modal/dropdown interactions. Where conflicts occur, use a more specific selector to override or remove the global ring for that component's internal elements.
**Warning signs:** Double focus rings, or focus ring appearing on the overlay behind a modal.

### Pitfall 6: useIsTablet SSR/Initial Render Flash
**What goes wrong:** Sidebar briefly shows expanded state before collapsing at tablet width
**Why it happens:** `useState(false)` initializes to non-tablet, and the matchMedia check runs in useEffect (after first paint)
**How to avoid:** This is minor for an SPA (no SSR). If it matters, initialize state from `window.matchMedia` synchronously: `useState(() => window.matchMedia(...).matches)`.
**Warning signs:** Brief layout shift on page load at tablet widths.

## Code Examples

### DashboardLayout.tsx -- Page Transition Integration
```typescript
// Add to imports:
import { AnimatePresence, motion } from 'framer-motion'

// Replace the <main> content area:
<main className="flex-1 overflow-y-auto bg-gray-50/40">
  <ErrorBoundary>
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  </ErrorBoundary>
</main>
```

### sidebar.tsx -- Responsive Collapse with Tooltips
```typescript
// New props interface:
interface SidebarProps {
  forceCollapsed?: boolean
}

export function Sidebar({ forceCollapsed = false }: SidebarProps) {
  const [manualCollapsed, setManualCollapsed] = useState(false)
  const isCollapsed = forceCollapsed || manualCollapsed
  // ...
  // Hide toggle button when forceCollapsed:
  {!forceCollapsed && (
    <button onClick={() => setManualCollapsed(prev => !prev)} ...>
      ...
    </button>
  )}
}
```

### index.css -- Global Focus Indicator
```css
/* Add inside the existing @layer base block */
@layer base {
  :focus-visible {
    @apply outline-none ring-2 ring-[#4F46E5] ring-offset-2;
  }
}
```

### DashboardLayout.tsx -- Sidebar Integration with useIsTablet
```typescript
import { useIsTablet } from '@/hooks/use-tablet'

// Inside component:
const isTablet = useIsTablet()

// Pass to Sidebar:
<Sidebar forceCollapsed={isTablet} />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| :focus with outline | :focus-visible with ring | CSS :focus-visible widely supported since 2022 | Focus rings only show for keyboard users, not mouse clicks |
| React Transition Group | Framer Motion AnimatePresence | Framer Motion 4+ (2021) | Declarative enter/exit animations tied to component lifecycle |
| JS resize listeners with debounce | matchMedia API with event listeners | Always available, widely adopted | No polling, no debounce, fires on exact breakpoint match |

**Deprecated/outdated:**
- `:focus` without `:focus-visible` -- shows focus ring on mouse click (bad UX)
- `@media (prefers-reduced-motion: reduce)` with JS detection -- the codebase already handles this in CSS (line 69-76 of index.css)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + React Testing Library 16.3.2 + happy-dom 20.8.4 |
| Config file | vitest.config.ts (root) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PLSH-02 | AnimatePresence wraps Outlet with key={pathname} | unit | `npx vitest run src/layouts/DashboardLayout.test.tsx -x` | Exists (update needed) |
| PLSH-03a | Sidebar accepts forceCollapsed prop and hides labels | unit | `npx vitest run src/components/sidebar.test.tsx -x` | Exists (update needed) |
| PLSH-03b | useIsTablet returns true between 768-1279px | unit | `npx vitest run src/hooks/use-tablet.test.ts -x` | New file needed |
| PLSH-03c | DashboardLayout passes isTablet to Sidebar | unit | `npx vitest run src/layouts/DashboardLayout.test.tsx -x` | Exists (update needed) |
| PLSH-04 | Focus-visible CSS rule applied globally | manual-only | Visual check: Tab through dashboard, verify indigo ring visible | N/A -- CSS rule, not testable in happy-dom |

### Testing Strategy Notes

**Framer Motion in tests:** happy-dom does not run CSS animations. Tests should verify that:
- The `motion.div` wrapper exists around Outlet content (structural test)
- The key prop changes when route changes (render with different paths)
- AnimatePresence is present in the component tree

**matchMedia in happy-dom:** happy-dom supports `window.matchMedia` to some extent. The existing `useIsMobile` tests (if any) establish the pattern. For `useIsTablet`, mock `window.matchMedia` to return controlled values.

**Focus-visible testing:** Cannot be reliably tested in happy-dom since `:focus-visible` depends on browser heuristics for distinguishing keyboard vs mouse focus. This is a CSS-only change best validated by manual visual inspection or Playwright/Cypress E2E tests (out of scope for this phase -- PLSH-05 is Phase 7).

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/hooks/use-tablet.test.ts` -- covers PLSH-03b (useIsTablet hook)
- [ ] Update `src/components/sidebar.test.tsx` -- add tests for forceCollapsed prop + tooltip rendering
- [ ] Update `src/layouts/DashboardLayout.test.tsx` -- add test verifying AnimatePresence wrapper + isTablet prop passing

## Open Questions

1. **Scroll position reset on route change**
   - What we know: The `<main>` element has `overflow-y-auto` and retains scroll position across Outlet swaps
   - What's unclear: Whether Framer Motion's `onAnimationStart` or a separate useEffect is the better reset mechanism
   - Recommendation: Add a `useEffect` keyed on `location.pathname` that sets `mainRef.current.scrollTop = 0` -- simpler and more reliable than animation callbacks

2. **ErrorBoundary placement relative to AnimatePresence**
   - What we know: ErrorBoundary is a class component wrapping Outlet currently
   - What's unclear: Whether ErrorBoundary should wrap AnimatePresence (catches all) or be inside the motion.div (per-page isolation)
   - Recommendation: Keep ErrorBoundary OUTSIDE AnimatePresence so errors during exit animations are caught. The motion.div goes inside ErrorBoundary.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `src/layouts/DashboardLayout.tsx`, `src/components/sidebar.tsx`, `src/hooks/use-mobile.ts`, `src/index.css`
- Codebase inspection: `src/components/audit-detail/ViolationCard.tsx` (AnimatePresence pattern), `src/components/new-scan/ScanProgress.tsx` (motion.div stagger pattern)
- Codebase inspection: `src/components/ui/tooltip.tsx` (Radix Tooltip API)
- Codebase inspection: existing test files for DashboardLayout and sidebar

### Secondary (MEDIUM confidence)
- Framer Motion AnimatePresence docs -- `mode="wait"` behavior for route transitions
- CSS `:focus-visible` spec -- browser support is universal in modern browsers

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and used in codebase
- Architecture: HIGH - patterns directly extend existing code with minimal new abstractions
- Pitfalls: HIGH - based on direct codebase inspection revealing specific integration points

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable -- no fast-moving dependencies)
