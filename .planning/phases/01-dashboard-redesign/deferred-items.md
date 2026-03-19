# Deferred Items — Phase 01 Dashboard Redesign

## Pre-existing Test Failures (AuditDetail.test.tsx)

6 tests in `src/pages/AuditDetail.test.tsx` fail due to Plan 01's refactoring of AuditDetail into sub-components (ScanningView, AuditHeader, ViolationList, ScoreRing). The tests still reference old content/structure (e.g., "scanning in progress" text, "Pages Scanned" stat card, inline violation cards).

**Affected tests:**
- `shows scanning state when status is scanning` -- expects "scanning in progress" text
- `renders stat cards: pages scanned, total violations, status` -- expects "Pages Scanned" text
- `renders violation cards when violations exist` -- expects inline violation_type text
- `shows empty violations message when no violations` -- expects "no violations found" text
- `renders impact filter buttons` -- expects button roles for filter tabs
- `renders Download PDF and Back to Reports buttons` -- expects button roles in header

**Root cause:** Plan 01 refactored AuditDetail.tsx into extracted sub-components with different DOM structure/text. Tests were not updated to match.

**Resolution:** Update AuditDetail.test.tsx to match the new component structure. Should be addressed in next test update plan or as part of Phase 01 cleanup.
