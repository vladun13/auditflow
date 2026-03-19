# Phase 5: Onboarding — Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers first-login onboarding and a 5-step tutorial flow. Three screens:

1. **WelcomeModal** — compact dialog (412×392px) over the dashboard, shown on first login. Contains illustration, "You can perform one audit at no cost" message, and "Let's Get Started!" CTA.
2. **AdditionalQuestions** — full-page split-screen (left: form, right: image) asking 3 profile questions (role, scanning target, primary goal). Stored to localStorage only.
3. **TutorialFlow** — 5-step full-page split-screen (left: app screenshot, right: tutorial content). Walks user through URL input → crawl depth → page review → results overview.

No backend changes. All state in localStorage.

</domain>

<decisions>
## Implementation Decisions

### Routing
- Add two routes to `App.tsx` under DashboardLayout (protected):
  - `/onboarding/profile` → `<AdditionalQuestions />`
  - `/onboarding/tutorial` → `<TutorialFlow />`
- WelcomeModal is rendered inside `DashboardNew.tsx` (or `DashboardLayout.tsx`) — it appears ON TOP of the dashboard, not as a separate route.

### Detection Logic (useOnboarding hook)
- Show WelcomeModal when: `!localStorage.getItem('auditflow_onboarding_done')`
- Show modal only once: set flag immediately on open (not just on CTA click) to prevent re-show on page refresh during the flow
- After completing tutorial or skipping: `localStorage.setItem('auditflow_tutorial_done', 'true')`

### WelcomeModal
- Uses shadcn `Dialog` with `open` controlled by `useOnboarding`
- Illustration: inline SVG (blue circle with `+`, document/grid, checkmark) — keep it simple, geometric
- Primary CTA "Let's Get Started!" → `navigate('/onboarding/profile')`, sets `auditflow_onboarding_done: 'true'`
- Close × → same as primary CTA (sets flag, navigates to dashboard — NOT to onboarding)
- No "OK" button — Figma has one but it's redundant; close × handles dismissal

### AdditionalQuestions
- Full-page layout, white background
- Left column (50%): AuditFlow logo top-left, centered form with title + 3 shadcn Select dropdowns
- Right column (50%): light bg (`bg-secondary`), rounded-2xl, subtle illustration or app screenshot placeholder
- "Continue" CTA → saves to localStorage `auditflow_onboarding_profile`, navigates to `/onboarding/tutorial`
- All 3 fields optional (no validation required — this is low-stakes profile data)

### TutorialFlow
- Full-page layout, 5 steps managed by React `useState` (currentStep: 0–4)
- Left side (58% — 840/1440): static per-step image (use a `<div className="bg-secondary rounded-2xl">` with a centered step-relevant icon or screenshot)
- Right side (42% — 600/1440): step content with logo, progress "X / 5", heading, step card, CTA buttons, Skip Tutorial
- Framer Motion `AnimatePresence` for crossfade between steps
- "Skip Tutorial" + FREE badge in bottom of right column → navigate to `/dashboard`, set `auditflow_tutorial_done: 'true'`
- Final step "Go to Homepage" → same action

### Step Images (Left panel)
Use a styled `div` with relevant icon from lucide-react centered on a `bg-[#D6E4FF]` or `bg-secondary` background rather than real screenshots. This avoids the complexity of maintaining actual app screenshots. Steps:
1. Globe icon (URL input step)
2. Globe icon (URL input, filled state)
3. Settings/sliders icon (crawl depth)
4. List icon (page review)
5. BarChart3 icon (results overview)

### Copy (real from Figma)
- Welcome modal title: "You can perform one audit at no cost"
- Welcome modal body: "Start your first scan free. Each subsequent scan uses 1 credit."
- Onboarding heading: "Tell us about your work"
- Onboarding subtitle: "Your input helps us prioritize what matters most in your audit results."
- Tutorial heading (all steps): "Let's run your first accessibility scan"

</decisions>

<code_context>
## Existing Code Insights

### Integration Points
- `src/pages/DashboardNew.tsx` — add `<WelcomeModal />` rendered here (appears over dashboard)
- `src/App.tsx` — add two routes: `/onboarding/profile` and `/onboarding/tutorial`
- `src/hooks/useOnboarding.ts` — new hook: reads/writes localStorage flags, manages step state

### Design Patterns to Follow
- `cn()` from `src/lib/utils.ts` for conditional classNames
- shadcn `Dialog`, `Button`, `Select`, `Badge`
- Framer Motion for step animations (already installed at `framer-motion@12.x`)
- Sonner `toast` for any error states (not needed here)
- Tailwind for all layout — no inline styles except `#2F54EB` color for primary button (Figma uses slightly different indigo from CSS variable)

### File References
- `src/components/modals/BuyCreditsModal.tsx` — good pattern for modal dialog structure
- `src/pages/NewScan.tsx` — good pattern for split-screen full-page layouts
- `src/components/new-scan/ScanProgress.tsx` — Framer Motion stagger animation reference

### Type Definitions
No new types needed — all state is string-keyed localStorage.

</code_context>

<specifics>
## Specific Ideas

- FREE badge: `<span className="bg-[#F6FFED] text-[#389E0D] text-xs font-medium px-2 py-0.5 rounded-full">FREE</span>`
- Progress indicator: Simple "1 / 5" text in 14px muted, no scrubber needed
- WelcomeModal illustration: simple inline SVG or use lucide `FileCheck2` + `PlusCircle` icons in a blue container
- Step transition: `<AnimatePresence mode="wait">` with `initial={{ opacity: 0, x: 20 }}` / `exit={{ opacity: 0, x: -20 }}`

</specifics>

<deferred>
## Deferred

- Real app screenshots in tutorial left panel — deferred; use icon placeholders
- "?" help button in dashboard header to re-trigger tutorial — deferred to polish pass
- Backend persistence of onboarding answers — v2; localStorage sufficient for v1

</deferred>
