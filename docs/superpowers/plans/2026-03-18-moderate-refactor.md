# Moderate Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split large page components into focused sub-components and extract shared pieces so the codebase is easier to navigate.

**Architecture:** Top-down extraction — biggest files first (NewScan 440 lines, AuditDetail 382 lines), each split into co-located sub-components under `src/components/new-scan/` and `src/components/audit-detail/`, then shared cross-cutting pieces (AuthIllustration, LoadingSpinner). No routes, hooks, API layer, or data flow changed.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Vite, Vitest + React Testing Library (133 tests)

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `src/components/ui/loading-spinner.tsx` | Shared auth-guard spinner |
| Create | `src/components/AuthIllustration.tsx` | Shared right-panel illustration for Login + SignUp |
| Create | `src/components/new-scan/constants.ts` | DEPTH_OPTIONS, STANDARDS, CHECKS arrays |
| Create | `src/components/new-scan/UrlInput.tsx` | URL text field |
| Create | `src/components/new-scan/DepthSelector.tsx` | Crawl depth card-row dropdown (owns open/ref state) |
| Create | `src/components/new-scan/StandardsSelect.tsx` | WCAG standards checkbox grid |
| Create | `src/components/new-scan/ChecksList.tsx` | Right sidebar: "What we check" + "Scan preview" |
| Create | `src/components/audit-detail/constants.ts` | IMPACT_COLOR map |
| Create | `src/components/audit-detail/ScoreRing.tsx` | SVG circular score indicator |
| Create | `src/components/audit-detail/ScanningView.tsx` | Scanning-in-progress state |
| Create | `src/components/audit-detail/AuditHeader.tsx` | Top bar: back + Share/Rescan/PDF buttons |
| Create | `src/components/audit-detail/ViolationCard.tsx` | Single violation row in left list |
| Create | `src/components/audit-detail/ViolationList.tsx` | Impact tabs + violation rows (left panel) |
| Modify | `src/App.tsx` | Use LoadingSpinner in 3 route guards |
| Modify | `src/pages/Login.tsx` | Use AuthIllustration |
| Modify | `src/pages/SignUp.tsx` | Use AuthIllustration |
| Modify | `src/pages/NewScan.tsx` | Delegate to 4 sub-components |
| Modify | `src/pages/AuditDetail.tsx` | Delegate to 5 sub-components |

---

## Task 1: Baseline test check

**Files:** none

- [ ] Run the full test suite to record the current passing count:
  ```bash
  cd "/Users/vlad_nemyrovskyi/Desktop/Projects/Accessibility Audit generator" && npm test -- --run 2>&1 | tail -20
  ```
  Note the exact number of passing/failing tests. This is your baseline — do not introduce new failures.

---

## Task 2: Extract LoadingSpinner

**Files:**
- Create: `src/components/ui/loading-spinner.tsx`
- Modify: `src/App.tsx`

- [ ] Create `src/components/ui/loading-spinner.tsx`:
  ```tsx
  export function LoadingSpinner() {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }
  ```

- [ ] In `src/App.tsx`, add import after existing imports:
  ```tsx
  import { LoadingSpinner } from '@/components/ui/loading-spinner'
  ```

- [ ] Replace all 3 identical loading `return` blocks in `ProtectedRoute`, `OnboardingRoute`, `PublicOnlyRoute` (currently lines 44–49, 59–64, 73–78) with a single line each:
  ```tsx
  if (loading) return <LoadingSpinner />
  ```

- [ ] Run tests and confirm no new failures:
  ```bash
  npm test -- --run 2>&1 | tail -5
  ```

- [ ] Commit:
  ```bash
  git add src/components/ui/loading-spinner.tsx src/App.tsx
  git commit -m "refactor: extract LoadingSpinner from route guards in App.tsx"
  ```

---

## Task 3: Extract AuthIllustration

**Files:**
- Create: `src/components/AuthIllustration.tsx`
- Modify: `src/pages/Login.tsx`
- Modify: `src/pages/SignUp.tsx`

Note: `Login.tsx` has `CursorArrow`, `GlobeIcon`, `LoginIllustration`. `SignUp.tsx` has identical copies named `CursorArrow`, `GlobeIcon`, `SignupIllustration`. Both are ~150 lines of decorative SVG.

- [ ] Create `src/components/AuthIllustration.tsx` by copying the three helper functions from `Login.tsx` (`CursorArrow`, `GlobeIcon`) and `LoginIllustration` body, renaming the export:
  ```tsx
  function CursorArrow({ className }: { className?: string }) {
    return (
      <svg className={className} width="28" height="32" viewBox="0 0 28 32" fill="none">
        <path d="M2 2L2 24L8 18L12 28L16 26L12 16L20 16L2 2Z" fill="#1a1a1a" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    )
  }

  function GlobeIcon() {
    return (
      <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    )
  }

  export function AuthIllustration() {
    return (
      <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #5b9bff 0%, #a0c4ff 20%, #f0eeff 55%, #e8d5f5 80%, #d4b8f0 100%)'
        }} />

        {/* Tilted background decorative cards */}
        <div className="absolute rounded-3xl bg-white/40 border border-white/60" style={{
          width: '72%', height: '58%', top: '8%', left: '-8%', transform: 'rotate(-10deg)'
        }} />
        <div className="absolute rounded-3xl bg-white/30 border border-white/50" style={{
          width: '72%', height: '58%', top: '34%', left: '2%', transform: 'rotate(-10deg)'
        }} />

        {/* Main content — copy the full inner div from LoginIllustration verbatim */}
        <div className="relative z-10 w-full px-10 flex flex-col gap-5" style={{ maxWidth: 460 }}>

          <div className="relative self-center mb-1">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-white shadow-xl">
              <GlobeIcon />
            </div>
            <CursorArrow className="absolute -bottom-5 -left-6 rotate-[20deg]" />
          </div>

          <div className="rounded-2xl bg-white/90 shadow-lg overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
              <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              <span className="text-sm text-gray-400">https://example.com</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-3">
              <div className="h-7 w-28 rounded-full bg-gray-100" />
              <div className="h-7 w-20 rounded-full bg-gray-100" />
              <div className="h-7 w-28 rounded-full bg-gray-100" />
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
              <path d="M40 5 C50 15, 30 25, 40 35 C50 45, 30 55, 40 60" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
            <div className="flex items-center gap-2.5 rounded-full bg-white px-4 py-2 shadow-md">
              <div className="w-20 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: '40%' }} />
              </div>
              <span className="text-sm font-semibold text-gray-700">40%</span>
            </div>
          </div>

          <div className="relative">
            <CursorArrow className="absolute -top-6 right-10 rotate-[-15deg]" />
            <div className="rounded-2xl bg-white shadow-xl overflow-visible" style={{ borderLeft: '3px solid #7C3AED' }}>
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                <span className="flex-1 text-sm text-gray-700 font-medium">https://example.com</span>
                <div className="rounded-full bg-[#4F46E5] px-4 py-1.5 text-xs font-semibold text-white shadow-md whitespace-nowrap">
                  Start Scanning
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 px-4 py-3 border-b border-gray-100">
                <div className="h-7 w-20 rounded-full bg-gray-100" />
                <div className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Preview
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-3">
                <span className="text-xs font-bold text-gray-800">Service cost:</span>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100">
                  <svg className="h-3 w-3 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-purple-100">
                  <div className="h-full rounded-full bg-purple-400" style={{ width: '35%' }} />
                </div>
              </div>
            </div>
            <div className="absolute -left-4 bottom-10 flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-md whitespace-nowrap">
              <svg className="h-3.5 w-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Crawl Depth
            </div>
            <CursorArrow className="absolute -bottom-4 left-8 rotate-[10deg]" />
          </div>

        </div>
      </div>
    )
  }
  ```

- [ ] In `src/pages/Login.tsx`:
  - Add import: `import { AuthIllustration } from '@/components/AuthIllustration'`
  - Delete the `CursorArrow`, `GlobeIcon`, and `LoginIllustration` function definitions (lines 8–138)
  - Replace `<LoginIllustration />` at the bottom of the JSX with `<AuthIllustration />`

- [ ] In `src/pages/SignUp.tsx`:
  - Add import: `import { AuthIllustration } from '@/components/AuthIllustration'`
  - Delete the `CursorArrow`, `GlobeIcon`, and `SignupIllustration` function definitions
  - Replace `<SignupIllustration />` with `<AuthIllustration />`

- [ ] Run tests, confirm no new failures:
  ```bash
  npm test -- --run 2>&1 | tail -5
  ```

- [ ] Commit:
  ```bash
  git add src/components/AuthIllustration.tsx src/pages/Login.tsx src/pages/SignUp.tsx
  git commit -m "refactor: extract shared AuthIllustration from Login and SignUp"
  ```

---

## Task 4: NewScan — constants file

**Files:**
- Create: `src/components/new-scan/constants.ts`
- Modify: `src/pages/NewScan.tsx`

- [ ] Create `src/components/new-scan/constants.ts`:
  ```ts
  export const DEPTH_OPTIONS = [
    { value: 1, label: '1 page', description: 'Quick check' },
    { value: 2, label: '2 pages', description: 'Light Scan' },
    { value: 3, label: '3 pages', description: 'Standard Scan' },
    { value: 4, label: '4 pages', description: 'Deep Scan' },
    { value: 5, label: '5 pages', description: 'Full Scan' },
  ]

  export const STANDARDS = [
    { id: 'wcag21', label: 'WCAG 2.1', description: 'Web Content Accessibility Guidelines 2.1' },
    { id: 'wcag22', label: 'WCAG 2.2', description: 'Web Content Accessibility Guidelines 2.2' },
    { id: 'ada',    label: 'ADA',      description: 'Americans with Disabilities Act' },
    { id: 'eaa',    label: 'EAA',      description: 'European Accessibility Act' },
    { id: 'section508', label: 'Section 508', description: 'US Federal accessibility standard' },
    { id: 'aoda',   label: 'AODA',     description: 'Accessibility for Ontarians with Disabilities Act' },
  ]

  export const CHECKS = [
    'WCAG 2.1 Level A, AA & AAA compliance',
    'Color contrast and visual accessibility',
    'Missing alt text and ARIA labels',
    'Keyboard navigation and focus management',
    'Form labels and input accessibility',
    'Heading structure and landmarks',
  ]
  ```

- [ ] In `src/pages/NewScan.tsx`:
  - Delete lines 10–34 (the three `const` blocks)
  - Add import after existing imports:
    ```tsx
    import { DEPTH_OPTIONS, STANDARDS, CHECKS } from '@/components/new-scan/constants'
    ```

- [ ] Run tests, confirm no new failures.

- [ ] Commit:
  ```bash
  git add src/components/new-scan/constants.ts src/pages/NewScan.tsx
  git commit -m "refactor: move NewScan constants to dedicated file"
  ```

---

## Task 5: NewScan — DepthSelector component

**Files:**
- Create: `src/components/new-scan/DepthSelector.tsx`
- Modify: `src/pages/NewScan.tsx`

The `DepthSelector` owns its own open/close state and outside-click ref, so it removes 3 state variables and 1 `useEffect` from `NewScan`.

- [ ] Create `src/components/new-scan/DepthSelector.tsx`:
  ```tsx
  import { useState, useRef, useEffect } from 'react'
  import { SlidersHorizontal, X } from 'lucide-react'
  import { DEPTH_OPTIONS } from './constants'

  interface DepthSelectorProps {
    value: number
    onChange: (depth: number) => void
  }

  export function DepthSelector({ value, onChange }: DepthSelectorProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#4F46E5]" />
          <label className="block text-xs font-medium text-gray-700">Pages to Scan</label>
        </div>
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 hover:bg-gray-50 focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="font-medium">{DEPTH_OPTIONS.find(o => o.value === value)?.label}</span>
              <span className="text-gray-400 text-xs">— {DEPTH_OPTIONS.find(o => o.value === value)?.description}</span>
            </span>
            <svg className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-900">Crawl Depth</span>
                <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2.5 flex flex-col gap-1.5">
                {DEPTH_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false) }}
                    className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                      value === opt.value
                        ? 'border-2 border-[#4F46E5] bg-indigo-50/50'
                        : 'border border-gray-100 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#4F46E5]">
                        <rect x="4" y="6" width="13" height="16" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="7" y="3" width="13" height="16" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 11h7M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  ```

- [ ] In `src/pages/NewScan.tsx`:
  - Remove `depthOpen`, `setDepthOpen`, `depthRef` state/ref declarations
  - Remove the outside-click `useEffect` (the one that listens to `mousedown`)
  - Remove `SlidersHorizontal` and `X` from the lucide import (if no longer used elsewhere)
  - Remove the entire Crawl depth `<div>` block (lines 263–323 in original)
  - Add import: `import { DepthSelector } from '@/components/new-scan/DepthSelector'`
  - Add `<DepthSelector value={crawlDepth} onChange={setCrawlDepth} />` in its place inside the form

- [ ] Run tests, confirm no new failures.

- [ ] Commit:
  ```bash
  git add src/components/new-scan/DepthSelector.tsx src/pages/NewScan.tsx
  git commit -m "refactor: extract DepthSelector sub-component from NewScan"
  ```

---

## Task 6: NewScan — UrlInput component

**Files:**
- Create: `src/components/new-scan/UrlInput.tsx`
- Modify: `src/pages/NewScan.tsx`

- [ ] Create `src/components/new-scan/UrlInput.tsx`:
  ```tsx
  import { Globe } from 'lucide-react'

  interface UrlInputProps {
    value: string
    onChange: (value: string) => void
  }

  export function UrlInput({ value, onChange }: UrlInputProps) {
    return (
      <div>
        <label htmlFor="url" className="block text-xs font-medium text-gray-700 mb-1.5">
          Website URL
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="url"
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
            required
          />
        </div>
      </div>
    )
  }
  ```

- [ ] In `src/pages/NewScan.tsx`:
  - Remove `Globe` from the lucide import
  - Delete the URL input `<div>` block inside the form
  - Add import: `import { UrlInput } from '@/components/new-scan/UrlInput'`
  - Add `<UrlInput value={websiteUrl} onChange={setWebsiteUrl} />` in the same location

  The test `screen.getByLabelText(/website url/i)` still works because `UrlInput` renders the same `<label htmlFor="url">`.

- [ ] Run tests, confirm no new failures:
  ```bash
  npm test -- --run 2>&1 | tail -5
  ```

- [ ] Commit:
  ```bash
  git add src/components/new-scan/UrlInput.tsx src/pages/NewScan.tsx
  git commit -m "refactor: extract UrlInput sub-component from NewScan"
  ```

---

## Task 7: NewScan — StandardsSelect component

**Files:**
- Create: `src/components/new-scan/StandardsSelect.tsx`
- Modify: `src/pages/NewScan.tsx`

- [ ] Create `src/components/new-scan/StandardsSelect.tsx`:
  ```tsx
  import { Shield, Check } from 'lucide-react'
  import { STANDARDS } from './constants'

  interface StandardsSelectProps {
    selected: string[]
    onToggle: (id: string) => void
  }

  export function StandardsSelect({ selected, onToggle }: StandardsSelectProps) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-3.5 w-3.5 text-[#4F46E5]" />
          <label className="block text-xs font-medium text-gray-700">Accessibility Standards</label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {STANDARDS.map(std => {
            const active = selected.includes(std.id)
            return (
              <button
                key={std.id}
                type="button"
                onClick={() => onToggle(std.id)}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                  active
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${active ? 'border-[#4F46E5] bg-[#4F46E5]' : 'border-gray-300'}`}>
                  {active && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </div>
                <p className="text-xs font-semibold">{std.label}</p>
              </button>
            )
          })}
        </div>
      </div>
    )
  }
  ```

- [ ] In `src/pages/NewScan.tsx`:
  - Remove `Shield` and `Check` from the lucide import (if unused elsewhere)
  - Delete the accessibility standards `<div>` block
  - Add import: `import { StandardsSelect } from '@/components/new-scan/StandardsSelect'`
  - Add `<StandardsSelect selected={standards} onToggle={toggleStandard} />` in its place

- [ ] Run tests, confirm no new failures.

- [ ] Commit:
  ```bash
  git add src/components/new-scan/StandardsSelect.tsx src/pages/NewScan.tsx
  git commit -m "refactor: extract StandardsSelect sub-component from NewScan"
  ```

---

## Task 8: NewScan — ChecksList component

**Files:**
- Create: `src/components/new-scan/ChecksList.tsx`
- Modify: `src/pages/NewScan.tsx`

This extracts the entire right sidebar (both "What we check" and "Scan preview" cards).

- [ ] Create `src/components/new-scan/ChecksList.tsx`:
  ```tsx
  import { CheckCircle } from 'lucide-react'
  import { CHECKS, DEPTH_OPTIONS } from './constants'

  interface ChecksListProps {
    crawlDepth: number
    websiteUrl: string
  }

  export function ChecksList({ crawlDepth, websiteUrl }: ChecksListProps) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">What we check</h3>
          <ul className="space-y-3">
            {CHECKS.map((check) => (
              <li key={check} className="flex items-start gap-2.5 text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                {check}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Scan preview</h3>
          <p className="text-sm text-gray-500">
            Will scan up to <strong className="text-gray-700">{crawlDepth} page{crawlDepth > 1 ? 's' : ''}</strong> starting from{' '}
            <span className="text-[#4F46E5] break-all">{websiteUrl || '[URL]'}</span>
          </p>
          <div className="mt-3 flex gap-2 flex-wrap">
            {DEPTH_OPTIONS.map(opt => (
              <span
                key={opt.value}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors ${
                  crawlDepth === opt.value
                    ? 'bg-indigo-50 border-indigo-200 text-[#4F46E5]'
                    : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                {opt.label}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Estimated time: 2–5 minutes</p>
        </div>
      </div>
    )
  }
  ```

- [ ] In `src/pages/NewScan.tsx`:
  - Remove `CheckCircle` from the lucide import (if unused elsewhere)
  - Delete the entire right sidebar `<div>` block (the `{/* What we check */}` comment and everything after it, inside the grid)
  - Add import: `import { ChecksList } from '@/components/new-scan/ChecksList'`
  - Add `<ChecksList crawlDepth={crawlDepth} websiteUrl={websiteUrl} />` as the second child of the grid div

- [ ] Run tests, confirm no new failures:
  ```bash
  npm test -- --run 2>&1 | tail -5
  ```

- [ ] Verify `NewScan.tsx` is now under 150 lines:
  ```bash
  wc -l "src/pages/NewScan.tsx"
  ```

- [ ] Commit:
  ```bash
  git add src/components/new-scan/ChecksList.tsx src/pages/NewScan.tsx
  git commit -m "refactor: extract ChecksList sub-component from NewScan"
  ```

---

## Task 9: AuditDetail — constants + ScoreRing + ScanningView

**Files:**
- Create: `src/components/audit-detail/constants.ts`
- Create: `src/components/audit-detail/ScoreRing.tsx`
- Create: `src/components/audit-detail/ScanningView.tsx`
- Modify: `src/pages/AuditDetail.tsx`

- [ ] Create `src/components/audit-detail/constants.ts`:
  ```ts
  export const IMPACT_COLOR: Record<string, { dot: string; bg: string; text: string; border: string }> = {
    critical: { dot: 'bg-red-500',    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
    serious:  { dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    moderate: { dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    minor:    { dot: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  }
  ```

- [ ] Create `src/components/audit-detail/ScoreRing.tsx` (copy the function from AuditDetail.tsx lines 11–28):
  ```tsx
  interface ScoreRingProps { score: number }

  export function ScoreRing({ score }: ScoreRingProps) {
    const r = 44
    const circ = 2 * Math.PI * r
    const offset = circ - (score / 100) * circ
    const color = score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#ff4d4f'
    return (
      <div className="relative flex items-center justify-center w-[120px] h-[120px]">
        <svg width="120" height="120" className="-rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#f0f0f0" strokeWidth="12" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute text-center">
          <p className="text-2xl font-bold text-gray-900">{score.toFixed(0)}%</p>
        </div>
      </div>
    )
  }
  ```

- [ ] Create `src/components/audit-detail/ScanningView.tsx` (copy the function from AuditDetail.tsx lines 31–84):
  ```tsx
  import { Button } from '@/components/ui/button'
  import { RefreshCw } from 'lucide-react'

  interface ScanningViewProps { url: string }

  export function ScanningView({ url }: ScanningViewProps) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="flex flex-col items-center gap-8 max-w-[720px] px-6 text-center">
          <div className="w-[300px] h-[200px] flex items-center justify-center">
            <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <rect x="40" y="20" width="220" height="145" rx="8" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="1.5"/>
              <rect x="40" y="20" width="220" height="24" rx="8" fill="#e8e8e8"/>
              <circle cx="56" cy="32" r="4" fill="#ff6b6b"/>
              <circle cx="70" cy="32" r="4" fill="#ffd93d"/>
              <circle cx="84" cy="32" r="4" fill="#6bcb77"/>
              <rect x="55" y="55" width="130" height="8" rx="4" fill="#d9d9d9"/>
              <rect x="55" y="72" width="100" height="6" rx="3" fill="#ebebeb"/>
              <rect x="55" y="86" width="115" height="6" rx="3" fill="#ebebeb"/>
              <rect x="55" y="100" width="90" height="6" rx="3" fill="#ebebeb"/>
              <rect x="55" y="115" width="60" height="24" rx="4" fill="#4F46E5"/>
              <circle cx="210" cy="120" r="40" fill="none" stroke="#4F46E5" strokeWidth="3" opacity="0.3"/>
              <circle cx="210" cy="120" r="40" fill="none" stroke="#4F46E5" strokeWidth="2" strokeDasharray="8 4"/>
              <line x1="238" y1="148" x2="255" y2="165" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round"/>
              <rect x="192" y="128" width="10" height="20" rx="2" fill="#4F46E5" opacity="0.5"/>
              <rect x="206" y="118" width="10" height="30" rx="2" fill="#4F46E5" opacity="0.7"/>
              <rect x="220" y="123" width="10" height="25" rx="2" fill="#4F46E5" opacity="0.6"/>
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">We are scanning your website</h2>
            <p className="text-sm text-gray-500">
              Analyzing <span className="font-medium text-gray-700">{url}</span> for WCAG accessibility violations. This usually takes 2–5 minutes.
            </p>
          </div>
          <div className="w-full border border-gray-200 rounded-lg p-4 space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full w-2/5 rounded-full bg-[#4F46E5] animate-pulse" />
              </div>
              <span className="text-sm text-gray-500 shrink-0">In progress</span>
            </div>
            <p className="text-xs text-gray-400">Estimated time: 2–5 min</p>
          </div>
          <Button variant="outline" className="rounded-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh status
          </Button>
        </div>
      </div>
    )
  }
  ```

- [ ] In `src/pages/AuditDetail.tsx`:
  - Delete `ScoreRing` function (lines 11–28)
  - Delete `ScanningView` function (lines 31–84)
  - Delete `IMPACT_COLOR` constant (lines 87–93)
  - Add imports:
    ```tsx
    import { ScoreRing } from '@/components/audit-detail/ScoreRing'
    import { ScanningView } from '@/components/audit-detail/ScanningView'
    import { IMPACT_COLOR } from '@/components/audit-detail/constants'
    ```

- [ ] Run tests, confirm no new failures:
  ```bash
  npm test -- --run 2>&1 | tail -5
  ```

- [ ] Commit:
  ```bash
  git add src/components/audit-detail/ src/pages/AuditDetail.tsx
  git commit -m "refactor: extract ScoreRing, ScanningView, IMPACT_COLOR from AuditDetail"
  ```

---

## Task 10: AuditDetail — AuditHeader component

**Files:**
- Create: `src/components/audit-detail/AuditHeader.tsx`
- Modify: `src/pages/AuditDetail.tsx`

- [ ] Create `src/components/audit-detail/AuditHeader.tsx`:
  ```tsx
  import { Button } from '@/components/ui/button'
  import { ArrowLeft, Download, Share2, RefreshCw } from 'lucide-react'

  interface AuditHeaderProps {
    onBack: () => void
    onDownload: () => void
    downloading: boolean
  }

  export function AuditHeader({ onBack, onDownload, downloading }: AuditHeaderProps) {
    return (
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Rescan
          </Button>
          <Button size="sm" onClick={onDownload} disabled={downloading} className="gap-1.5 text-xs bg-[#4F46E5] hover:bg-[#4338CA]">
            <Download className="h-3.5 w-3.5" />
            PDF
          </Button>
        </div>
      </div>
    )
  }
  ```

- [ ] In `src/pages/AuditDetail.tsx`:
  - Delete the top header `<div>` block (the `{/* Top header */}` comment and its contents)
  - Remove `ArrowLeft`, `Download`, `Share2`, `RefreshCw` from lucide import (if unused elsewhere)
  - Add import: `import { AuditHeader } from '@/components/audit-detail/AuditHeader'`
  - Add as first child of the outer `<div className="flex flex-col h-full overflow-hidden">`:
    ```tsx
    <AuditHeader
      onBack={() => navigate('/dashboard')}
      onDownload={handleDownload}
      downloading={downloading}
    />
    ```

- [ ] Run tests, confirm no new failures.

- [ ] Commit:
  ```bash
  git add src/components/audit-detail/AuditHeader.tsx src/pages/AuditDetail.tsx
  git commit -m "refactor: extract AuditHeader sub-component from AuditDetail"
  ```

---

## Task 11: AuditDetail — ViolationCard + ViolationList components

**Files:**
- Create: `src/components/audit-detail/ViolationCard.tsx`
- Create: `src/components/audit-detail/ViolationList.tsx`
- Modify: `src/pages/AuditDetail.tsx`

- [ ] Create `src/components/audit-detail/ViolationCard.tsx`:
  ```tsx
  import type { Violation } from '@/types'
  import { cn } from '@/lib/utils'
  import { IMPACT_COLOR } from './constants'

  interface ViolationCardProps {
    violation: Violation
    index: number
    isActive: boolean
    impactFilter: string
    onSelect: () => void
  }

  export function ViolationCard({ violation, index, isActive, impactFilter, onSelect }: ViolationCardProps) {
    const c = IMPACT_COLOR[impactFilter] || IMPACT_COLOR.minor
    return (
      <button
        onClick={onSelect}
        className={cn(
          'w-full text-left px-3 py-2.5 text-xs border-b border-gray-50 transition-colors',
          isActive ? `${c.bg} ${c.text}` : 'text-gray-600 hover:bg-gray-50'
        )}
      >
        <div className="font-medium truncate">Error type {index + 1}</div>
        <div className="text-gray-400 truncate mt-0.5">{violation.violation_type}</div>
        <div className={cn('mt-1 text-xs font-medium', c.text)}>
          Total Failing Elements {violation.affected_elements}
        </div>
      </button>
    )
  }
  ```

- [ ] Create `src/components/audit-detail/ViolationList.tsx`:
  ```tsx
  import type { Violation } from '@/types'
  import { cn } from '@/lib/utils'
  import { IMPACT_COLOR } from './constants'
  import { ViolationCard } from './ViolationCard'

  interface Tab { key: string; label: string; count: number }

  interface ViolationListProps {
    tabs: Tab[]
    violations: Violation[]
    totalViolations: number
    activeViolation: Violation | null
    impactFilter: string
    onFilterChange: (filter: string) => void
    onSelectViolation: (v: Violation) => void
  }

  export function ViolationList({
    tabs, violations, totalViolations, activeViolation,
    impactFilter, onFilterChange, onSelectViolation,
  }: ViolationListProps) {
    return (
      <div className="w-[200px] shrink-0 border-r border-gray-100 bg-white overflow-y-auto">
        <div className="p-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">
            Issues {totalViolations}
          </p>
          <div className="space-y-0.5">
            {tabs.map(tab => {
              const col = IMPACT_COLOR[tab.key]
              return (
                <button
                  key={tab.key}
                  onClick={() => onFilterChange(tab.key)}
                  className={cn(
                    'w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    impactFilter === tab.key ? `${col.bg} ${col.text}` : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                    {tab.label}
                  </div>
                  <span className={cn('text-xs font-medium', impactFilter === tab.key ? col.text : 'text-gray-400')}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="border-t border-gray-100 mt-1 pt-1">
          {violations.map((v, i) => (
            <ViolationCard
              key={v.id}
              violation={v}
              index={i}
              isActive={activeViolation?.id === v.id}
              impactFilter={impactFilter}
              onSelect={() => onSelectViolation(v)}
            />
          ))}
          {violations.length === 0 && (
            <p className="px-3 py-4 text-xs text-gray-400 text-center">No {impactFilter} issues</p>
          )}
        </div>
      </div>
    )
  }
  ```

- [ ] In `src/pages/AuditDetail.tsx`:
  - Delete the left panel `<div className="w-[200px] ...">` block (everything from the `{/* Left: Issue tabs */}` comment to its closing `</div>`)
  - Add imports:
    ```tsx
    import { ViolationList } from '@/components/audit-detail/ViolationList'
    ```
  - Add `<ViolationList>` in place of the deleted block:
    ```tsx
    <ViolationList
      tabs={TABS}
      violations={violations}
      totalViolations={audit.total_violations}
      activeViolation={active}
      impactFilter={impactFilter}
      onFilterChange={(f) => { setImpactFilter(f); setSelectedViolation(null) }}
      onSelectViolation={setSelectedViolation}
    />
    ```

- [ ] Run tests, confirm no new failures:
  ```bash
  npm test -- --run 2>&1 | tail -5
  ```

- [ ] Verify `AuditDetail.tsx` is now under 150 lines:
  ```bash
  wc -l "src/pages/AuditDetail.tsx"
  ```

- [ ] Commit:
  ```bash
  git add src/components/audit-detail/ViolationCard.tsx src/components/audit-detail/ViolationList.tsx src/pages/AuditDetail.tsx
  git commit -m "refactor: extract ViolationList and ViolationCard from AuditDetail"
  ```

---

## Task 12: Final verification

- [ ] Run full test suite — confirm same pass/fail count as Task 1 baseline:
  ```bash
  npm test -- --run
  ```

- [ ] Check line counts on the refactored pages:
  ```bash
  wc -l src/pages/NewScan.tsx src/pages/AuditDetail.tsx src/pages/Login.tsx src/pages/SignUp.tsx src/App.tsx
  ```
  Expected: `NewScan.tsx` < 150, `AuditDetail.tsx` < 150, `Login.tsx` < 150, `SignUp.tsx` < 150, `App.tsx` < 100

- [ ] Spot-check the app visually by running the dev server:
  ```bash
  npm run dev
  ```
  Visit `/scan`, `/audits/any-id`, `/login`, `/signup`. Confirm nothing looks broken.
