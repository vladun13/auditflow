# Moderate Refactor — Design Spec

**Date:** 2026-03-18
**Scope:** Split large page components into focused sub-components; extract shared pieces
**Driver:** General cleanup — codebase getting hard to navigate
**Approach:** Top-down (start with biggest files, extract shared pieces as they emerge)
**Test policy:** Tests may break temporarily; all 133 must pass by end

---

## Goals

- Reduce the largest page files (440+ lines) to ~80–100 lines each
- Each sub-component has one clear responsibility
- No routes, API layer, hooks, or data flow changed
- No files deleted

---

## Changes

### 1. `src/components/new-scan/` (new folder)

Split `src/pages/NewScan.tsx` (440 lines) into:

| File | Responsibility |
|------|---------------|
| `constants.ts` | `DEPTH_OPTIONS`, `STANDARDS`, `CHECKS` arrays |
| `UrlInput.tsx` | URL text field + validation feedback |
| `DepthSelector.tsx` | Crawl depth card-row dropdown |
| `StandardsSelect.tsx` | WCAG standards checkboxes |
| `ChecksList.tsx` | Checks-to-run list |

`NewScan.tsx` retains only: form state wiring (React Hook Form), submit handler, top-level layout assembly.
Target size: ~100 lines.

### 2. `src/components/audit-detail/` (new folder)

Split `src/pages/AuditDetail.tsx` (382 lines) into:

| File | Responsibility |
|------|---------------|
| `AuditHeader.tsx` | Title, URL, status badge, action buttons |
| `ScoreRing.tsx` | SVG circular score indicator |
| `ScanningView.tsx` | Loading / scanning-in-progress state |
| `ViolationCard.tsx` | Single violation item (impact badge, description, AI fix steps) |
| `ViolationList.tsx` | Filter controls + renders list of `ViolationCard` items |

`AuditDetail.tsx` retains only: `useAudit` hook call, polling logic, top-level layout assembly.
Target size: ~80 lines.

### 3. `src/components/AuthIllustration.tsx` (new file)

The right-panel illustration is line-for-line identical in `Login.tsx` and `SignUp.tsx` (~150 lines of SVG each).
Extract to a single shared component with no props (purely decorative).
Both pages import `<AuthIllustration />`.

### 4. `src/components/ui/loading-spinner.tsx` (new file)

The inline loading spinner (`<div className="animate-spin ...">`) is copy-pasted into all 3 route guard functions in `App.tsx`.
Extract to `<LoadingSpinner />` and replace all 3 usages.

---

## Out of Scope

- No changes to hooks, API layer, contexts, or routing
- No changes to `backend/`
- No new features
- No Figma redesigns (those are separate phases)
- `SignUp.tsx` form logic is not split further (well-structured already)

---

## File Impact Summary

| Action | Files |
|--------|-------|
| New folder + 5 files | `src/components/new-scan/` |
| New folder + 5 files | `src/components/audit-detail/` |
| New file | `src/components/AuthIllustration.tsx` |
| New file | `src/components/ui/loading-spinner.tsx` |
| Modified | `src/pages/NewScan.tsx` |
| Modified | `src/pages/AuditDetail.tsx` |
| Modified | `src/pages/Login.tsx` |
| Modified | `src/pages/SignUp.tsx` |
| Modified | `src/App.tsx` |

---

## Success Criteria

- All 133 existing tests pass at end of refactor
- No visual or behavioral changes to the app
- Each new component file is under 120 lines
- `NewScan.tsx` and `AuditDetail.tsx` are each under 120 lines after splitting
