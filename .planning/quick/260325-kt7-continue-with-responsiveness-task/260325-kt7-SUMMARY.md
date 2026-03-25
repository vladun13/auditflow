---
quick_id: 260325-kt7
status: completed
commit: ae78ba2
date: 2026-03-25
---

# Summary: Full-App Responsiveness Pass

## What was done

6 targeted responsive fixes across 4 files:

| # | File | Fix |
|---|------|-----|
| 1 | Hero.tsx | 4-image row: flex → grid-cols-2 sm:grid-cols-4, aspect-[3/2] replacing fixed 200px height |
| 2 | Hero.tsx | Controls row: flex-wrap gap-y-2 so Preview/Start buttons wrap on narrow screens |
| 3 | DashboardNew.tsx | Table: wrapped in overflow-x-auto + min-w-[600px] to enable horizontal scroll |
| 4 | DashboardNew.tsx | Toolbar: flex-col sm:flex-row, search w-full sm:w-48, stat cells px-3 sm:px-6 |
| 5 | DashboardLayout.tsx | Upgrade button: hidden sm:flex; Log out text: hidden sm:inline |
| 6 | AuditDetail.tsx | 3-panel: flex-col lg:flex-row; sidebar h-48 lg:h-full w-full lg:w-[270px]; HowToFix hidden lg:block |

## Commit
ae78ba2 — fix(responsive): full-app mobile/tablet layout pass
