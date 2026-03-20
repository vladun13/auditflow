# Requirements: AuditFlow

**Defined:** 2026-03-19
**Core Value:** Every developer who runs a scan gets actionable, code-level fix instructions for every violation -- eliminating hours wasted on WCAG docs.

## v1 Requirements

### Dashboard Redesign

- [x] **DASH-01**: User sees 4 stat cards (Total Audits, Avg WCAG Score, Critical Issues, Compliant Sites) populated from real API data
- [x] **DASH-02**: User sees loading skeletons while dashboard data is fetching
- [x] **DASH-03**: User sees a meaningful empty state with CTA when no audits exist
- [x] **DASH-04**: User sees recent audits list (last 5) with score, URL, time ago, status badge

### Scan Page Redesign

- [x] **SCAN-01**: User sees a 2-column layout -- URL form on left, "What We'll Check" checklist panel on right
- [x] **SCAN-02**: User sees scan progress animation in the right panel while scan is in flight
- [x] **SCAN-03**: User is blocked from initiating a scan when credits = 0, with upgrade prompt shown
- [x] **SCAN-04**: User's URL is pre-filled from `?url=` query param when navigating from the landing hero

### Audit Results Redesign

- [x] **AUDIT-01**: User sees a circular WCAG score ring with color coding (green >=80, yellow >=60, red <60)
- [x] **AUDIT-02**: User sees an animated scanning state while audit status is 'scanning'
- [x] **AUDIT-03**: User sees violation cards with AI explanation ("Why This Matters") and AI fix steps ("How to Fix")
- [x] **AUDIT-04**: User can filter violations by severity (critical, serious, moderate, minor)
- [x] **AUDIT-05**: User can download a PDF report via the Download PDF button

### Modals

- [x] **MODAL-01**: User can open a Buy Credits modal from the dashboard header or Plans & Credits page and select a credit pack
- [x] **MODAL-02**: User can open a Share Report modal from AuditDetail and copy a shareable link
- [x] **MODAL-03**: User can open an Upgrade modal when trying to perform an action requiring more credits
- [x] **MODAL-04**: User can open a Cancel Subscription modal from Plans & Credits
- [x] **MODAL-05**: User can open a Reactivate modal after cancellation

### PDF Report

- [x] **PDF-01**: User can download a fully rendered PDF from a completed audit containing: site URL, scan date, WCAG score, compliance level, and full violation list with AI fix steps
- [x] **PDF-02**: Downloaded PDF is named `auditflow-report-{id}.pdf`
- [x] **PDF-03**: User sees an error state if PDF generation fails

### Auth Flow Fix

- [x] **AUTH-01**: Unauthenticated user who enters a URL in the hero and is redirected to /login has the `?url=` param preserved through to /scan after login

### Onboarding

- [x] **ONBD-01**: New user after first login sees an onboarding flow explaining how to run their first scan
- [x] **ONBD-02**: User can skip onboarding at any step

### Polish & Quality

- [x] **PLSH-01**: Loading skeletons shown on all data-fetching pages (Dashboard, Reports, AuditDetail)
- [x] **PLSH-02**: Framer Motion animations on scan progress steps and page transitions
- [x] **PLSH-03**: Sidebar collapses to icon-only at 768-1279px; becomes hamburger drawer at <768px
- [x] **PLSH-04**: All interactive elements are keyboard navigable and have visible focus indicators
- [ ] **PLSH-05**: E2E tests cover critical flows: signup -> scan -> view results -> download PDF -> buy credits

## v2 Requirements

### Advanced Features

- **ADV-01**: User can re-scan a URL without creating a new audit entry
- **ADV-02**: User can generate a shareable public link for a report (no auth required to view)
- **ADV-03**: Real stats replace placeholder data in StatsBar (live API metrics)
- **ADV-04**: Real company logos replace placeholder names in SocialProof

### Team Features

- **TEAM-01**: Organization accounts with multiple user seats
- **TEAM-02**: Shared audit history across team members

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom branding / white-label reports | Complexity -- v2+ feature |
| CI/CD integrations (GitHub Actions) | Not core to MVP |
| Scheduled / recurring scans | Infrastructure cost, v2 |
| Browser extension | Out of scope entirely |
| Stripe payment integration | Using LemonSqueezy -- do not add Stripe |
| Multi-user organization accounts | Requires significant schema changes |
| Dropdown menus in Navbar (Product, Solutions) | Nice-to-have, not blocking launch |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DASH-01 | Phase 1 | Complete |
| DASH-02 | Phase 1 | Complete |
| DASH-03 | Phase 1 | Complete |
| DASH-04 | Phase 1 | Complete |
| PLSH-01 | Phase 1 | Complete |
| SCAN-01 | Phase 2 | Complete |
| SCAN-02 | Phase 2 | Complete |
| SCAN-03 | Phase 2 | Complete |
| SCAN-04 | Phase 2 | Complete |
| AUDIT-01 | Phase 2 | Complete |
| AUDIT-02 | Phase 2 | Complete |
| AUDIT-03 | Phase 2 | Complete |
| AUDIT-04 | Phase 2 | Complete |
| AUTH-01 | Phase 2 | Complete |
| MODAL-01 | Phase 3 | Complete |
| MODAL-02 | Phase 3 | Complete |
| MODAL-03 | Phase 3 | Complete |
| MODAL-04 | Phase 3 | Complete |
| MODAL-05 | Phase 3 | Complete |
| PDF-01 | Phase 4 | Complete |
| PDF-02 | Phase 4 | Complete |
| PDF-03 | Phase 4 | Complete |
| AUDIT-05 | Phase 4 | Complete |
| ONBD-01 | Phase 5 | Complete |
| ONBD-02 | Phase 5 | Complete |
| PLSH-02 | Phase 6 | Complete |
| PLSH-03 | Phase 6 | Complete |
| PLSH-04 | Phase 6 | Complete |
| PLSH-05 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 -- traceability updated to match ROADMAP.md phase assignments*
