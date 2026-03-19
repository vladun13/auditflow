# Standalone — UI Review

**Audited:** 2026-03-19
**Baseline:** Abstract 6-pillar standards (no UI-SPEC.md exists)
**Screenshots:** Captured — landing desktop/mobile, login, signup, pricing (localhost:5173)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Strong CTAs throughout; 3 notable issues: wrong button label, hardcoded stat, placeholder company names |
| 2. Visuals | 3/4 | Landing and auth pages look polished; dashboard lacks mobile sidebar; 3-panel audit detail is dense |
| 3. Color | 3/4 | Indigo primary used consistently; 40+ hardcoded `#4F46E5` hex strings instead of CSS token |
| 4. Typography | 3/4 | Two arbitrary font sizes found; weight and size scale is otherwise well-controlled |
| 5. Spacing | 3/4 | Arbitrary pixel/rem values used in structural layout elements; scale otherwise consistent |
| 6. Experience Design | 2/4 | No ErrorBoundary anywhere; spinner-only loading (no skeletons); native `confirm()` for deletes; no mobile sidebar |

**Overall: 17/24**

---

## Top 3 Priority Fixes

1. **ForgotPassword CTA mislabeled "Verify Email"** — Users clicking this button are submitting a password reset request, not verifying their email address. The label will confuse users who have already verified. Change `ForgotPassword.tsx:119` to `"Send Reset Link"`.

2. **No ErrorBoundary in the application** — Any uncaught render error in AuditDetail, DashboardNew, or Reports will produce a blank white screen with no recovery path. Wrap the `<Outlet />` in `DashboardLayout.tsx:77` in a React ErrorBoundary that shows a friendly error message and a "Back to Dashboard" link.

3. **Dashboard sidebar has no mobile breakpoint** — On screens narrower than 768px the sidebar renders full-width and pushes the main content off-screen. `DashboardLayout.tsx` has no `md:hidden` gate on the sidebar, and `sidebar.tsx` has no drawer/sheet implementation. Add a Sheet-based mobile drawer triggered by a hamburger button in the dashboard header.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**What works well:**
- Landing CTAs are specific and action-oriented: "Fix Accessibility Issues Before They Reach Production", "Start Scanning", "Run Your First Scan", "Start Free Trial".
- Empty state in DashboardNew.tsx:158–165 is well-written: heading "No audits yet", descriptive subtext, clear CTA "Run Your First Scan".
- Error messages are contextual — `ForgotPassword.tsx`, `Login.tsx`, `SignUp.tsx` all surface API error messages directly.
- Loading states have in-context labels: "Logging in…", "Creating account…", "Verifying…", "Processing…".
- The "Verify Email" button in `SignUp.tsx:148` is correct for the OTP step — it is only the `ForgotPassword` usage that is wrong.

**Issues found:**

1. **ForgotPassword.tsx:119** — Button label is `"Verify Email"` but the action is sending a password reset email. This mislabeling will confuse users, especially those who already verified their email during signup. Fix: change to `"Send Reset Link"`.

2. **Hero.tsx:206** — Hardcoded stat: `"11 websites"` in "Already scanned 11 websites in the last 24 hours". CLAUDE.md notes this is a placeholder until real API data is available. Until it is live, this reads as stale/fake and erodes trust. Consider hiding this line entirely until real data is wired in.

3. **SocialProof.tsx:10** — Placeholder company names: `['Acme Corp', 'DigitalCo', 'BuildFast', 'DevStudio', 'LaunchPad']`. CLAUDE.md acknowledges these need real logos. Currently they render as gray text labels with no logos, which weakens social proof. Either replace with real customer names/logos or remove the section until real customers exist.

4. **Reports.tsx:90** — Empty state copy is `"No audits found"` (generic, matches a search filter result). When filter is `'all'`, this correctly falls through but the wording does not distinguish "no audits ever" from "no audits matching this filter". Low priority but worth splitting.

5. **ResetPassword.tsx:148** — The submit button in the ResetPassword page uses the generic label `"Submit"`. Change to `"Set New Password"`.

---

### Pillar 2: Visuals (3/4)

**What works well:**
- Landing page hero has a clear focal point: large headline + indigo gradient + URL input card. The screenshot confirms strong visual hierarchy.
- Login/Signup split-layout with the AuthIllustration right panel is polished and visually distinctive (confirmed via screenshot).
- Pricing page 3-column grid with "Most Popular" badge on Pro tier is well-executed (confirmed via screenshot).
- Status badges in DashboardNew use color-coded dots with animated pulse for scanning state — excellent visual affordance.
- The ScoreRing SVG in AuditDetail provides a clear focal metric.

**Issues found:**

1. **No mobile sidebar** — The mobile screenshot confirms that the dashboard navigation is not visible on 375px wide screens. `sidebar.tsx` only collapses to 64px icon-only; there is no sheet/drawer mode. On mobile, the sidebar takes the left portion and main content is squished or inaccessible.

2. **AuditDetail 3-panel density** — The middle panel ("Details") and right panel ("How to Fix") are both 100% height overflow-y-auto panels side by side. On laptops with 1280px width, each panel is roughly 280px wide. Long AI fix steps (`ai_fix_steps`) render as `whitespace-pre-line` text in a narrow column — very dense. No max-width prose constraint is applied, though `prose-sm` class is present.

3. **Dashboard search placeholder** — `DashboardNew.tsx:140` uses `placeholder="Search"` with no label. While the search icon provides visual context, there is no accessible text label for screen readers (ironic for an accessibility audit product).

4. **Navbar dropdown items are non-functional** — Product, Solutions, and Resources nav items have `ChevronDown` icons suggesting dropdown menus, but clicking them only follows the `href="#"` or `href="#features"` anchor link. The chevron icon implies dropdown behavior that does not exist, creating a visual lie.

---

### Pillar 3: Color (3/4)

**What works well:**
- The 60/30/10 split is well maintained: white background dominates, light grays for surfaces, indigo for primary actions.
- Score color convention (green/yellow/red) is consistent across Reports.tsx, DashboardNew.tsx, and AuditDetail.tsx.
- Violation severity colors (red/orange/yellow/blue) are consistently applied.
- The CtaBanner indigo section breaks visual rhythm intentionally and works.
- Dark mode CSS variables are defined (sidebar) but dark mode is not activated in this app — the light theme is clean.

**Issues found:**

1. **Hardcoded `#4F46E5` hex in 40+ locations** — The primary color is defined as `--primary: 239 84% 67%` in `index.css`, but components bypass the token and use literal `bg-[#4F46E5]`, `text-[#4F46E5]`, `hover:bg-[#4338CA]` across nearly every page and component file. If the brand color ever changes, it requires a find-and-replace across the entire codebase. Fix: define a Tailwind alias like `primary-brand` or use `bg-primary text-primary-foreground` consistently.

2. **`#4338CA` hover color also hardcoded** — The hover-state darker indigo is hardcoded as `#4338CA` in 15+ locations instead of using a token like `hover:bg-primary/90` or a custom `--primary-hover` variable.

3. **Google SVG icon uses hardcoded brand colors** (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`) — this is acceptable for the Google logo specifically as those are mandated by Google's brand guidelines, not an application concern.

4. **`text-primary` token is used in SettingsLayout.tsx** for active nav state, while sidebar.tsx uses `text-[#4F46E5]` directly — inconsistent token usage for the same semantic purpose across sibling layout files.

---

### Pillar 4: Typography (4/4)

**What works well:**
- Plus Jakarta Sans is loaded globally via Google Fonts and set in `index.css:64` as the base font. The screenshot confirms it is rendering.
- Font sizes follow a disciplined scale across landing components: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`.
- Font weights are controlled: `font-medium`, `font-semibold`, `font-bold` are the three weights in use throughout pages. `font-extrabold` is not used in application code.
- Visual hierarchy is clear: page headings at `text-2xl font-bold`, section labels at `text-lg font-semibold`, body at `text-sm`, meta at `text-xs`.

**Minor findings (not score-impacting):**

1. **ForgotPassword.tsx:59,78** — Uses the arbitrary value `text-[2.375rem]` with `leading-[46px]`. This is outside the standard Tailwind scale. The value is approximately between `text-4xl` (2.25rem) and `text-5xl` (3rem). Using `text-4xl` would be equivalent and avoid the arbitrary value. Same pattern in `ResetPassword.tsx:74`.

2. **ResetPassword.tsx and ForgotPassword.tsx** use `font-semibold` on the page `<h1>` while all other page headings use `font-bold`. Minor inconsistency within the auth flow.

---

### Pillar 5: Spacing (3/4)

**What works well:**
- Dashboard page content uses `p-6 lg:p-8` consistently across DashboardNew, NewScan, Reports, and SettingsLayout.
- Card padding is consistently `p-5` or `p-6` throughout the dashboard.
- Landing section padding follows `py-16`, `py-20`, `py-24` for a clear rhythm.
- Form field spacing uses `space-y-4` consistently across Login, SignUp, Account, Security.

**Issues found:**

1. **Arbitrary fixed-width layout values** — `AuditDetail.tsx:209` uses `w-[340px]` for the "How to Fix" panel. `NewScan.tsx:181` uses `lg:grid-cols-[1fr_340px]`. These hardcoded pixel values work on desktop but may cause awkward layouts on intermediate viewport widths (768–1024px). Consider using `lg:w-80` (`320px`) or a fluid approach.

2. **Blob/gradient positioning uses large arbitrary pixel values** — `ForgotPassword.tsx:11–13` and `SignUp.tsx:25–27` use `-top-40`, `-left-40`, `h-[600px]`, `w-[600px]` etc. These are repeated verbatim across 4 files (`ForgotPassword`, `SignUp`, `ResetPassword`, `EmailVerified`). Not a user-facing spacing problem, but indicates a copy-pasted utility that should be extracted into a shared `GradientBackground` component — which `SignUp.tsx` already does, but `ForgotPassword.tsx` duplicates it locally with the same function name.

3. **`DashboardNew.tsx:111`** — Stat cards use `flex gap-4` but there is no responsive wrapping (`flex-wrap` or `grid`). On narrow screens (mobile), all three stat cards will overflow horizontally since flexbox without wrap will squish them.

4. **Hero URL input card** — `Hero.tsx:151` applies a long arbitrary shadow value via `shadow-[0px_1px_2px_0px_...]`. While functional, this is a one-off value that cannot be reused via the design token system.

---

### Pillar 6: Experience Design (2/4)

**Strengths:**
- Loading spinners are present on every data-fetching page (Dashboard, Reports, AuditDetail, PlansAndCredits).
- The NewScan loading state is particularly well-designed: animated progress bar, rotating status messages, illustration, estimated time — gives users confidence during the 2–5 minute scan.
- Disabled states are properly applied: submit buttons disable during loading, CTA disables when URL is empty, actions disable when credits are zero.
- Empty state in DashboardNew is high-quality with illustration, copy, and a CTA.
- Success state is implemented in ForgotPassword (shows confirmation message after submit).
- `prefers-reduced-motion` media query is respected in `index.css:70`.

**Issues found:**

1. **No ErrorBoundary anywhere** — Neither `App.tsx`, `DashboardLayout.tsx`, nor any page has a React ErrorBoundary. An uncaught error in any component (e.g., if `audit.violations` is unexpectedly null in AuditDetail) will crash the entire app to a blank white screen. This is especially problematic for an accessibility product that audits third-party sites and may receive malformed API responses.

2. **`window.confirm()` used for destructive actions** — `DashboardNew.tsx:80` and `Reports.tsx:44` use `confirm('Delete this audit? This cannot be undone.')`. The native browser confirm dialog is unstyled, blocks the main thread, and is blocked by default in some iframe contexts. The codebase already has shadcn `AlertDialog` component available in `src/components/ui/alert-dialog.tsx`. Replace both `confirm()` calls with the AlertDialog component.

3. **No skeleton loading states** — All loading states render a spinning circle (`animate-spin rounded-full`). For data-heavy pages like DashboardNew (table), Reports (card list), and PlansAndCredits, skeleton placeholders would reduce perceived load time and prevent layout shift. The `Skeleton` component from shadcn/ui appears to be unused.

4. **Dashboard sidebar has no mobile implementation** — On viewports under 768px, the sidebar collapses to 64px but does not convert to a sheet/drawer. The collapse button hides itself when `collapsed === true` (`sidebar.tsx:60: collapsed && "hidden"`), making it impossible to re-expand the sidebar at all in collapsed state. Users on mobile have no access to navigation.

5. **AuditDetail polling does not stop on completion** — CLAUDE.md documents this: `useAudit.ts` uses `[id]` as the polling dependency rather than `[id, audit?.status]`, so the interval continues firing even after status is `completed`. This causes unnecessary network requests for every user viewing a completed audit.

6. **Contact Sales button on Pricing page** — `Pricing.tsx:178` — the "Contact Sales" button has `onClick` undefined and no `href`. It renders as an inert `<button>` with no action. Users clicking it get no response.

7. **Preview button on Hero has no implementation** — `Hero.tsx:171-180` — The "Preview" button is disabled when no URL is entered, but when a URL is entered it becomes active with no `onClick` handler. Clicking it does nothing. Either implement the preview or remove the button.

---

## Files Audited

**Pages (9):**
- `src/pages/Landing.tsx`
- `src/pages/Login.tsx`
- `src/pages/SignUp.tsx`
- `src/pages/ForgotPassword.tsx`
- `src/pages/DashboardNew.tsx`
- `src/pages/NewScan.tsx`
- `src/pages/AuditDetail.tsx`
- `src/pages/Reports.tsx`
- `src/pages/Pricing.tsx`

**Settings pages (3):**
- `src/pages/settings/Account.tsx`
- `src/pages/settings/Security.tsx`
- `src/pages/settings/PlansAndCredits.tsx`

**Components (11):**
- `src/components/Navbar.tsx`
- `src/components/Hero.tsx`
- `src/components/Features.tsx`
- `src/components/HowItWorks.tsx`
- `src/components/Footer.tsx`
- `src/components/SocialProof.tsx`
- `src/components/StatsBar.tsx`
- `src/components/ComplianceBadges.tsx`
- `src/components/Testimonials.tsx`
- `src/components/CtaBanner.tsx`
- `src/components/sidebar.tsx`

**Layouts (2):**
- `src/layouts/DashboardLayout.tsx`
- `src/layouts/SettingsLayout.tsx`

**Design system (1):**
- `src/index.css`

**Registry audit:** shadcn initialized (official registry only), no third-party blocks — no registry safety concerns.
