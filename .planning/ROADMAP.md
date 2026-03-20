# Roadmap: AuditFlow v1.0

## Overview

AuditFlow has a functional backend and working (but unstyled) frontend pages. This milestone transforms the UI to match Figma designs, adds missing features (modals, PDF export, onboarding), fixes the auth redirect flow, and polishes the app for launch with animations, responsive behavior, accessibility, and E2E test coverage. Seven phases move from core page redesigns through feature completion to launch-ready quality.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Dashboard Redesign** - Redesign DashboardNew to Figma spec with stat cards, skeletons, empty state, and recent audits (completed 2026-03-19)
- [x] **Phase 2: Scan & Results Redesign** - Redesign NewScan and AuditDetail pages to Figma spec, fix auth URL param preservation (completed 2026-03-19)
- [x] **Phase 3: Modals** - Build all 5 modal dialogs (BuyCredits, ShareReport, Upgrade, CancelSub, Reactivate) (completed 2026-03-19)
- [x] **Phase 4: PDF Report** - Implement PDF generation, download flow, and error handling (completed 2026-03-19)
- [x] **Phase 5: Onboarding** - First-run onboarding flow with skip capability (completed 2026-03-20)
- [ ] **Phase 6: Polish & Responsive** - Animations, responsive sidebar, keyboard accessibility
- [ ] **Phase 7: E2E Tests** - Playwright E2E coverage for critical user flows

## Phase Details

### Phase 1: Dashboard Redesign
**Goal**: Users see a polished, data-driven dashboard that matches the Figma design and provides immediate insight into their audit portfolio
**Depends on**: Nothing (first phase)
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, PLSH-01
**Success Criteria** (what must be TRUE):
  1. User sees 4 stat cards (Total Audits, Avg WCAG Score, Critical Issues, Compliant Sites) populated with real data from the API
  2. User sees shimmer skeleton placeholders while dashboard data is loading, on Dashboard, Reports, and AuditDetail pages
  3. User with zero audits sees a meaningful empty state with a CTA button to start their first scan
  4. User sees their 5 most recent audits with score, URL, relative time, and status badge
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md -- Dashboard redesign: shared utilities, extracted components, DashboardNew refactor, tests
- [ ] 01-02-PLAN.md -- Skeleton loading for Reports and AuditDetail pages, test updates

### Phase 2: Scan & Results Redesign
**Goal**: Users experience a polished scan initiation flow and rich audit results page that surfaces AI-generated fix instructions clearly
**Depends on**: Phase 1
**Requirements**: SCAN-01, SCAN-02, SCAN-03, SCAN-04, AUDIT-01, AUDIT-02, AUDIT-03, AUDIT-04, AUDIT-05, AUTH-01
**Success Criteria** (what must be TRUE):
  1. User sees a 2-column scan page with URL form on the left and "What We'll Check" checklist on the right, with scan progress animation in the right panel during scanning
  2. User with zero credits is blocked from scanning and sees an upgrade prompt instead of the scan button
  3. Unauthenticated user who enters a URL on the landing hero is redirected to login, and after login lands on /scan with the URL pre-filled from the preserved ?url= param
  4. User sees a circular WCAG score ring (green/yellow/red) and can filter violations by severity on the audit results page
  5. User sees each violation card with "Why This Matters" (AI explanation) and "How to Fix" (AI fix steps) sections clearly presented
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md -- NewScan redesign: 2-column layout, WCAG checklist, scan progress, zero-credits block, AUTH-01 URL preservation
- [ ] 02-02-PLAN.md -- AuditDetail redesign: score ring, scanning view, collapsible violation cards, severity tabs, PDF toast
- [ ] 02-03-PLAN.md -- Wave 0 test rewrites: NewScan, AuditDetail, Login tests + fix sidebar/DashboardLayout failures

### Phase 3: Modals
**Goal**: Users can manage credits, share reports, and handle subscription actions without leaving the current page
**Depends on**: Phase 2
**Requirements**: MODAL-01, MODAL-02, MODAL-03, MODAL-04, MODAL-05
**Success Criteria** (what must be TRUE):
  1. User can open Buy Credits modal from the dashboard header or Plans & Credits page, select a pack, and proceed to LemonSqueezy checkout
  2. User can open Share Report modal from an audit detail page and copy a shareable link
  3. User can open Upgrade modal when attempting an action that requires more credits
  4. User can open Cancel Subscription and Reactivate modals from Plans & Credits settings page
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md -- BuyCreditsModal component + wire into DashboardLayout header and NewScan zero-credits upgrade
- [ ] 03-02-PLAN.md -- ShareReportModal, CancelSubscriptionModal, ReactivateModal + wire into AuditHeader and PlansAndCredits

### Phase 4: PDF Report
**Goal**: Users can download a complete, professionally formatted PDF report from any completed audit
**Depends on**: Phase 2
**Requirements**: PDF-01, PDF-02, PDF-03, AUDIT-05
**Success Criteria** (what must be TRUE):
  1. User can click Download PDF on a completed audit and receive a PDF containing site URL, scan date, WCAG score, compliance level, and full violation list with AI fix steps
  2. Downloaded file is named `auditflow-report-{id}.pdf`
  3. User sees a clear error message if PDF generation fails
**Plans**: 2 plans

Plans:
- [ ] 04-01-PLAN.md -- TypeScript shim, generatePdf utility, PdfReport component with TDD tests
- [ ] 04-02-PLAN.md -- Wire PDF generation into AuditDetail/AuditHeader, update existing tests

### Phase 5: Onboarding
**Goal**: New users understand how to run their first scan without external documentation
**Depends on**: Phase 1
**Requirements**: ONBD-01, ONBD-02
**Success Criteria** (what must be TRUE):
  1. New user after first login sees an onboarding flow explaining the scan process (enter URL, review results, download report)
  2. User can skip the onboarding at any step and proceed directly to the dashboard
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Polish & Responsive
**Goal**: The app feels smooth and professional across all screen sizes, with proper animations and keyboard accessibility
**Depends on**: Phase 2
**Requirements**: PLSH-02, PLSH-03, PLSH-04
**Success Criteria** (what must be TRUE):
  1. Scan progress steps and page transitions have Framer Motion animations that feel responsive (not janky or delayed)
  2. Sidebar collapses to icon-only between 768-1279px and becomes a hamburger drawer below 768px
  3. All interactive elements (buttons, links, inputs, modals, dropdowns) are keyboard navigable with visible focus indicators
**Plans**: 2 plans

Plans:
- [ ] 06-01-PLAN.md -- Page transitions (AnimatePresence) + responsive sidebar (useIsTablet, forceCollapsed, tooltips)
- [ ] 06-02-PLAN.md -- Global keyboard focus indicators (:focus-visible CSS rule) + visual verification

### Phase 7: E2E Tests
**Goal**: Critical user flows are verified end-to-end with automated Playwright tests, providing confidence for launch
**Depends on**: Phase 4, Phase 6
**Requirements**: PLSH-05
**Success Criteria** (what must be TRUE):
  1. Playwright E2E tests cover: signup, run a scan, view results, download PDF, and buy credits flows
  2. All E2E tests pass in CI-compatible headless mode
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7
(Phases 3, 4, 5, 6 can partially overlap since they depend on Phase 2 or Phase 1 independently)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Dashboard Redesign | 2/2 | Complete    | 2026-03-19 |
| 2. Scan & Results Redesign | 3/3 | Complete   | 2026-03-19 |
| 3. Modals | 2/2 | Complete   | 2026-03-19 |
| 4. PDF Report | 2/2 | Complete   | 2026-03-19 |
| 5. Onboarding | 1/1 | Complete   | 2026-03-20 |
| 6. Polish & Responsive | 0/2 | Not started | - |
| 7. E2E Tests | 0/1 | Not started | - |
