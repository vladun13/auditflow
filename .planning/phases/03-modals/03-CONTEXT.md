# Phase 3: Modals - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers 5 modal components (BuyCreditsModal, ShareReportModal, UpgradeModal, CancelSubscriptionModal, ReactivateModal) wired into their trigger points across the app. Each modal keeps the user on the current page for credit management, report sharing, and subscription actions. No new backend endpoints — all existing APIs are used.

</domain>

<decisions>
## Implementation Decisions

### Modal State Architecture
- Local component `useState` per trigger site — no global modal context needed
- DashboardLayout Upgrade button opens BuyCreditsModal inline (replaces current `/pricing` navigate)
- shadcn `<Dialog>` portal for all modals (already in codebase, handles z-index and focus trap)
- Single `<BuyCreditsModal>` shared component with optional `context` prop that changes title text (used for UpgradeModal scenario)

### Share Report Mechanism
- Shareable link = current page URL copied to clipboard — no backend token in v1 (ADV-02 covers public links in v2)
- Shared link requires login to view (current behavior unchanged)
- UI feedback: Sonner toast "Link copied!" + button text briefly changes to "Copied ✓" for 2s
- Trigger location: Share button in AuditHeader alongside the Download PDF button

### Credit Pack Selection UI
- 3-card layout (Basic / Pro / Enterprise) matching Pricing page style — reuse credit pack data/structure
- Selecting a pack immediately calls `paymentApi.createCheckout(plan)` and redirects to LemonSqueezy — no confirmation step
- Modal header shows current credit balance: "You have X credits"
- UpgradeModal (zero-credits trigger) shows: "You're out of credits. Add more to continue scanning." as heading

### Subscription Modals Confirmation Flow
- Cancel modal: single step — "Are you sure?" with consequence text + Cancel Subscription button
- Consequence text: "Your subscription will remain active until end of billing period. Credits already purchased won't expire."
- Reactivate modal: simple "Resume your subscription" with current plan details + Reactivate button
- Subscription state from `paymentApi.getSubscription()` via `usePayments` hook — `subscription.status` field

### Claude's Discretion
- Specific animation timing for modal open/close transitions
- Exact layout details not covered by Figma node IDs if fetching is not done in this phase

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/dialog.tsx` — shadcn Dialog (Portal, Overlay, Content, Header, Title, Description, Close) — use for all modals
- `src/components/ui/button.tsx` — Button variants: default, outline, ghost, destructive
- `src/components/ui/badge.tsx` — Badge for credit pack labels
- `src/layouts/DashboardLayout.tsx:169` — Upgrade button currently `navigate('/pricing')` → replace with modal open
- `src/pages/AuditDetail.tsx` — AuditHeader is imported from `src/components/audit-detail/AuditHeader.tsx` → add Share button there
- `src/pages/settings/PlansAndCredits.tsx` — trigger location for Cancel/Reactivate modals
- `src/lib/api.ts` — `paymentApi.createCheckout(plan)`, `paymentApi.getSubscription()` already available
- `src/hooks/useCredits.ts` — `credits` value for modal header
- `src/hooks/usePayments.ts` — subscription state

### Established Patterns
- Framer Motion used for scan progress animations (Phase 2 pattern)
- shadcn/ui Dialog for modal shell — consistent with existing ui/ components
- Sonner `toast()` for notifications (already used in AuditHeader for PDF button)
- `cn()` from `src/lib/utils.ts` for conditional classNames
- Tailwind indigo `#4F46E5` as primary action color

### Integration Points
- `DashboardLayout.tsx` — replace navigate('/pricing') at line ~162 and ~172 with modal state
- `src/components/audit-detail/AuditHeader.tsx` — add Share button next to Download PDF
- `src/pages/settings/PlansAndCredits.tsx` — add Cancel/Reactivate buttons that open respective modals
- `src/components/new-scan/` — UpgradeModal triggered from zero-credits block in NewScan.tsx

</code_context>

<specifics>
## Specific Ideas

- BuyCreditsModal card layout should visually match the `/pricing` page pack cards — same price/credits/description structure
- The "Copied ✓" state on the Share button should auto-reset after 2 seconds using `setTimeout`
- CancelSubscriptionModal destructive button should use `variant="destructive"` from shadcn Button

</specifics>

<deferred>
## Deferred Ideas

- Public shareable links (no auth required) — ADV-02 in v2 requirements
- Cancellation reason survey / multi-step cancel flow — overly complex for v1
- Backend-generated share tokens — v2 when public links are built

</deferred>
