# Quick Task 260325-khj: Summary

**Completed:** 2026-03-25
**Status:** Done

## Changes Made

### src/components/Navbar.tsx
- Credits fallback changed from `"— credits"` to `"0 credits"` (loading/null state now shows 0)
- `ChevronDown` import retained — still used in CreditsPanel FAQ accordion

### src/components/Footer.tsx
- Product section: Features → Demo (href #demo), Pricing unchanged, API → disabled with "Soon" badge
- Resources section: removed Documentation, kept Blog + Community
- Legal section: added Accessibility Statement and Font Statement links
- Brand column: added newsletter signup form ("Get notified when API launches") with email input + Notify me button and submitted confirmation state
