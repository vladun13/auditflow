# Requirements: AuditFlow

**Defined:** 2026-03-19
**Core Value:** Every developer who runs a scan gets actionable, code-level fix instructions for every violation -- eliminating hours wasted on WCAG docs.

## v1 Requirements

### Dashboard Redesign

- [ ] **DASH-01**: User sees 4 stat cards (Total Audits, Avg WCAG Score, Critical Issues, Compliant Sites) populated from real API data
- [ ] **DASH-02**: User sees loading skeletons while dashboard data is fetching
- [ ] **DASH-03**: User sees a meaningful empty state with CTA when no audits exist
- [ ] **DASH-04**: User sees recent audits list (last 5) with score, URL, time ago, status badge

### Scan Page Redesign

- [ ] **SCAN-01**: User sees a 2-column layout -- URL form on left, "What We'll Check" checklist panel on right
- [ ] **SCAN-02**: User sees scan progress animation in the right panel while scan is in flight
- [ ] **SCAN-03**: User is blocked from initiating a scan when credits = 0, with upgrade prompt shown
- [ ] **SCAN-04**: User's URL is pre-filled from `?url=` query param when navigating from the landing hero

### Audit Results Redesign

- [ ] **AUDIT-01**: User sees a circular WCAG score ring with color coding (green >=80, yellow >=60, red <60)
- [ ] **AUDIT-02**: User sees an animated scanning state while audit status is 'scanning'
- [ ] **AUDIT-03**: User sees violation cards with AI explanation ("Why This Matters") and AI fix steps ("How to Fix")
- [ ] **AUDIT-04**: User can filter violations by severity (critical, serious, moderate, minor)
- [ ] **AUDIT-05**: User can download a PDF report via the Download PDF button

### Modals

- [ ] **MODAL-01**: User can open a Buy Credits modal from the dashboard header or Plans & Credits page and select a credit pack
- [ ] **MODAL-02**: User can open a Share Report modal from AuditDetail and copy a shareable link
- [ ] **MODAL-03**: User can open an Upgrade modal when trying to perform an action requiring more credits
- [ ] **MODAL-04**: User can open a Cancel Subscription modal from Plans & Credits
- [ ] **MODAL-05**: User can open a Reactivate modal after cancellation

### PDF Report

- [ ] **PDF-01**: User can download a fully rendered PDF from a completed audit containing: site URL, scan date, WCAG score, compliance level, and full violation list with AI fix steps
- [ ] **PDF-02**: Downloaded PDF is named `auditflow-report-{id}.pdf`
- [ ] **PDF-03**: User sees an error state if PDF generation fails

### Auth Flow Fix

- [ ] **AUTH-01**: Unauthenticated user who enters a URL in the hero and is redirected to /login has the `?url=` param preserved through to /scan after login

### Onboarding

- [ ] **ONBD-01**: New user after first login sees an onboarding flow explaining how to run their first scan
- [ ] **ONBD-02**: User can skip onboarding at any step

### Polish & Quality

- [ ] **PLSH-01**: Loading skeletons shown on all data-fetching pages (Dashboard, Reports, AuditDetail)
- [ ] **PLSH-02**: Framer Motion animations on scan progress steps and page transitions
- [ ] **PLSH-03**: Sidebar collapses to icon-only at 768-1279px; becomes hamburger drawer at <768px
- [ ] **PLSH-04**: All interactive elements are keyboard navigable and have visible focus indicators
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
| DASH-01 | Phase 1 | Pending |
| DASH-02 | Phase 1 | Pending |
| DASH-03 | Phase 1 | Pending |
| DASH-04 | Phase 1 | Pending |
| PLSH-01 | Phase 1 | Pending |
| SCAN-01 | Phase 2 | Pending |
| SCAN-02 | Phase 2 | Pending |
| SCAN-03 | Phase 2 | Pending |
| SCAN-04 | Phase 2 | Pending |
| AUDIT-01 | Phase 2 | Pending |
| AUDIT-02 | Phase 2 | Pending |
| AUDIT-03 | Phase 2 | Pending |
| AUDIT-04 | Phase 2 | Pending |
| AUTH-01 | Phase 2 | Pending |
| MODAL-01 | Phase 3 | Pending |
| MODAL-02 | Phase 3 | Pending |
| MODAL-03 | Phase 3 | Pending |
| MODAL-04 | Phase 3 | Pending |
| MODAL-05 | Phase 3 | Pending |
| PDF-01 | Phase 4 | Pending |
| PDF-02 | Phase 4 | Pending |
| PDF-03 | Phase 4 | Pending |
| AUDIT-05 | Phase 4 | Pending |
| ONBD-01 | Phase 5 | Pending |
| ONBD-02 | Phase 5 | Pending |
| PLSH-02 | Phase 6 | Pending |
| PLSH-03 | Phase 6 | Pending |
| PLSH-04 | Phase 6 | Pending |
| PLSH-05 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 -- traceability updated to match ROADMAP.md phase assignments*
