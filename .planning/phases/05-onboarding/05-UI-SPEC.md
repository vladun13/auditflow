---
phase: 5
slug: onboarding
status: draft
shadcn_initialized: true
preset: new-york
created: 2026-03-19
figma_validated: true
---

# Phase 5 — UI Design Contract

> Visual and interaction contract for the onboarding and tutorial flows. Generated from Figma nodes `210:58803` (Onboarding) and `210:58819` (Tutorial) via Figma REST API.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn |
| Preset | new-york |
| Component library | radix |
| Icon library | lucide-react |
| Font | Plus Jakarta Sans (Google Fonts) |

---

## Figma Structure (from API)

### Node 210:58803 — Onboarding Section
Contains 3 sub-sections:
1. **Tutorial** (5 frames nested here — same as 210:58819)
2. **Home** — Welcome modal that appears over dashboard on first login
3. **Additional questions** — Full-page profile setup (2 variants)

### Node 210:58819 — Tutorial Section
5 full-screen tutorial step frames.

---

## Screen 1: Welcome Modal (Home → Modal)

**Trigger:** Appears over the dashboard on first login when `localStorage.getItem('auditflow_onboarding_done')` is null.

**Size:** 412×392px centered modal, `border-radius: 16px`, white background with drop shadow.

### Layout (top → bottom)

```
+--------------------------------------------+          [×]
|  [Illustration area — rgb(214,228,255)      |
|   h:206px, border-radius:12px, w:full       |
|   Centered SVG: + circle, document, ✓       |
|   FREE badge top-left in green]             |
+--------------------------------------------+
|  [Title — 16px semibold, centered]          |
|  "You can perform one audit at no cost"     |
|                                              |
|  [Body — 14px regular, text-muted,          |
|   centered, 2 lines]                        |
|  "Start your first scan free. Each          |
|   subsequent scan uses 1 credit."           |
+--------------------------------------------+
|  [Primary Button — full width, pill shape]  |
|  "Let's Get Started!"                       |
|  indigo bg (#2F54EB), white text, h:40px    |
+--------------------------------------------+
```

**Color values (from Figma):**
- Illustration bg: `rgb(214, 228, 255)` → `bg-[#D6E4FF]`
- Primary button: `rgb(47, 84, 235)` → `bg-[#2F54EB]`
- Title color: `rgba(0,0,0,0.85)` → `text-foreground`
- Body color: `rgba(0,0,0,0.85)` → `text-muted-foreground`
- Close X: `rgb(67,67,67)` → `text-muted-foreground`, top-right absolute

**Close button:** Small `×` in top-right corner (32×32px, circle). Closes modal and marks onboarding done.

**Illustration:** SVG illustration — blue circle with `+`, document/grid icon, blue checkmark circle, FREE badge. Implement as inline SVG or import.

---

## Screen 2: Additional Questions (Full-page)

**Trigger:** After clicking "Let's Get Started!" in the Welcome Modal.

**Layout:** Full-screen page, split 50/50:
- **Left column (720px):** White background, centered form content
- **Right column (720px):** Image/illustration panel (rounded-2xl, light bg)

### Left column content

```
AuditFlow logo (top-left, 24px bold)

[Title — 38px semibold]
"Tell us about your work"

[Subtitle — 16px regular, text-muted]
"Your input helps us prioritize what matters most in your audit results."

[Form — 3 dropdowns stacked with labels]
Label: "What's your role?"           → Select dropdown
Label: "What are you scanning today?" → Select dropdown
Label: "What's your primary goal?"   → Select dropdown

[Primary Button — full width]
"Continue" → bg-[#2F54EB], white text, h:40px, border-radius: 9999px
```

**Form field options (implement as sensible defaults):**
- Role: Frontend Developer / QA Engineer / Product Manager / Designer / Other
- Scanning: My company's website / Client website / Personal project / Competitor research
- Primary goal: Fix accessibility violations / Generate compliance report / Monitor over time / Client deliverable

**Note:** Answers stored in `localStorage` key `auditflow_onboarding_profile`. No API call required.

---

## Screen 3–7: Tutorial (5 Steps)

**Trigger:** After "Continue" on Additional Questions page. Also accessible via "?" button in dashboard header (if implemented).

**Layout (all 5 steps):** Full-screen 1440×1024px split layout:
- **Left side (840px):** App screenshot/preview image (static screenshot of the relevant UI step)
- **Right side (600px):** Tutorial step content, white background

### Right column anatomy (common to all steps)

```
[AuditFlow Logo — top-left, 24px 700wt, indigo icon]

[Right column content — centered vertically]
  Progress: "1 / 5" (14px, top of content area)

  [Main heading — 38px semibold]
  "Let's run your first accessibility scan"

  [Step card — bordered, rounded]
    [Step title — 20px semibold]
    [Step description — 14px regular, text-muted]
    [Step-specific content (input/button/etc)]

  [Continue/Back/Go to Homepage Button]

[Bottom-left: "Skip Tutorial" link — ghost, with FREE green badge]
```

### Step-by-step content

| Step | Progress | Step Title | Step Description | Step Content | Primary CTA |
|------|----------|------------|-----------------|--------------|-------------|
| 1 | 1 / 5 | "Start with the website URL" | "Paste the link to the website you want to audit for accessibility compliance" | URL input field (placeholder: https://example.com) | "Continue" |
| 2 | 2 / 5 | "Start with the website URL" | "Paste the link to the website you want to audit for accessibility compliance" | URL input field (filled state) | "Continue" (primary filled) |
| 3 | 3 / 5 | "Select crawl depth" | "Choose how many pages to scan. More pages = deeper audit, but takes longer." | Crawl depth selector (1–5 pages) | "Continue" + "Back" |
| 4 | 4 / 5 | "Review pages and start the scan" | "See which pages will be included in the audit. You can exclude any page before starting. When everything looks right, launch the scan." | Preview of pages list | "Continue" + "Back" |
| 5 | 5 / 5 | "Accessibility overview" | "See your overall results and issue breakdown by severity." | Score ring preview | "Go to Homepage" + "Back" |

**Notes on steps 3 content:** Step 3 from Figma shows a placeholder popconfirm - use a visual of the crawl depth selector.

### Skip Tutorial button
- Ghost variant, text: "Skip Tutorial", position: bottom of right column
- Includes "FREE" green badge `rgb(246,255,237)` bg, `rgb(56,158,13)` text
- On click: sets `localStorage.setItem('auditflow_tutorial_done', 'true')`, navigates to `/dashboard`

### Final step CTA
- "Go to Homepage" replaces "Continue"
- On click: sets `localStorage.setItem('auditflow_tutorial_done', 'true')`, navigates to `/dashboard`

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps |
| sm | 8px | Progress indicator gap |
| md | 16px | Card padding, label spacing |
| lg | 24px | Content padding |
| xl | 32px | Section padding |
| 2xl | 48px | Content vertical rhythm |

---

## Typography

| Role | Size | Weight | Usage |
|------|------|--------|-------|
| Display | 38px | 600 | Tutorial/Additional Questions page headings |
| Heading | 24px | 700 | Logo text |
| Sub-heading | 20px | 600 | Step card titles |
| Modal title | 16px | 600 | Welcome modal heading |
| Body | 16px | 400 | Subtitles, button labels |
| Small | 14px | 400 | Progress indicator, step descriptions, labels |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Primary indigo | `#2F54EB` (rgb 47,84,235) | Primary buttons, logo icon |
| Light blue bg | `#D6E4FF` (rgb 214,228,255) | Modal illustration area |
| Free badge bg | `#F6FFED` (rgb 246,255,237) | FREE tag background |
| Free badge text | `rgb(56,158,13)` | FREE tag text |
| Page bg | `#FFFFFF` | All pages/modals |
| Text primary | `rgba(0,0,0,0.85)` | Headings |
| Text muted | `rgba(0,0,0,0.65)` | Body text, labels |

---

## Component Inventory

| Component | Source | Notes |
|-----------|--------|-------|
| Dialog | shadcn `dialog` | Welcome modal wrapper |
| Button | shadcn `button` | All CTAs |
| Select | shadcn `select` | Additional questions dropdowns |
| Badge | shadcn `badge` | FREE badge |
| Progress indicator | custom | "1 / 5" text + optional scrubber |

---

## State Management

| State | Storage | Key |
|-------|---------|-----|
| Onboarding completed | localStorage | `auditflow_onboarding_done` |
| Tutorial completed | localStorage | `auditflow_tutorial_done` |
| Profile answers | localStorage | `auditflow_onboarding_profile` |
| Current step | React useState | Component-local |

---

## File Structure

```
src/
  components/
    onboarding/
      WelcomeModal.tsx          # First-login modal ("You can perform one audit at no cost")
      AdditionalQuestions.tsx   # Full-page profile questions (split layout)
      TutorialFlow.tsx          # 5-step tutorial (split-screen)
      TutorialStep.tsx          # Individual step content (right column)
  hooks/
    useOnboarding.ts            # localStorage check + step state
  pages/
    Onboarding.tsx              # Page wrapper: decides which screen to show
```

---

## Navigation Flow

```
First login
    ↓
WelcomeModal appears (over /dashboard)
    ↓ "Let's Get Started!"
/onboarding/profile  (AdditionalQuestions full page)
    ↓ "Continue"
/onboarding/tutorial (TutorialFlow - steps 1-5)
    ↓ "Go to Homepage" or "Skip Tutorial"
/dashboard
```

Routes to add to `App.tsx`:
- `/onboarding/profile` → `<AdditionalQuestions />`
- `/onboarding/tutorial` → `<TutorialFlow />`

---

## Animation Contract

| Animation | Library | Duration |
|-----------|---------|----------|
| Tutorial step crossfade | Framer Motion AnimatePresence | 300ms |
| Welcome modal entrance | Framer Motion | 200ms (scale 0.95→1, opacity 0→1) |
| Page transition to onboarding | none (instant navigate) | — |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Focus trap in modal | Radix Dialog auto-handles |
| Keyboard nav | Tab through buttons, Enter to advance, Escape to close modal |
| ARIA | `aria-label` on close button, `role="progressbar"` on step indicator |
| Reduced motion | global CSS `prefers-reduced-motion` already in index.css |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS (real Figma copy used)
- [x] Dimension 2 Visuals: PASS (Figma screenshots reviewed)
- [x] Dimension 3 Color: PASS (exact hex values from Figma API)
- [x] Dimension 4 Typography: PASS (font sizes from Figma style data)
- [x] Dimension 5 Spacing: PASS (layout dims from absoluteBoundingBox)
- [x] Dimension 6 Registry Safety: PASS (shadcn official only)

**Approval:** approved — Figma data extracted via REST API
