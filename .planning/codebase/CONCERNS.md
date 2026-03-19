# Concerns

**Project:** AuditFlow
**Mapped:** 2026-03-19

## Tech Debt

### TypeScript errors in scanService.ts
- **File:** `backend/src/services/scanService.ts`
- **Issue:** 3 pre-existing TS errors — missing `baseDomain` type annotation, `document`/`HTMLAnchorElement` DOM types in Node.js context
- **Impact:** Suppressed — doesn't affect runtime (Puppeteer provides DOM APIs)
- **Fix effort:** Low — add type annotations, but risky to touch without full test coverage

### Stripe/LemonSqueezy naming confusion
- **Files:** `README`, `Pricing.tsx` copy
- **Issue:** Documentation says "Stripe" but actual integration is LemonSqueezy (`LEMONSQUEEZY_VARIANT_ID_*`)
- **Impact:** Developer confusion only — no runtime impact
- **Fix effort:** Low — update copy/docs

### `full_name` in user_metadata (not a DB column)
- **File:** `backend/src/routes/user.ts`
- **Issue:** Profile name stored via `supabase.auth.admin.updateUserById()` user_metadata, not a DB column
- **Impact:** Workaround to avoid schema migration — works but non-standard
- **Fix effort:** Medium — requires schema migration + data migration

## Known Bugs / Incomplete Features

### Google OAuth requires manual Supabase setup
- **File:** `src/contexts/AuthContext.tsx`
- **Issue:** `signInWithGoogle()` calls `supabase.auth.signInWithOAuth({ provider: 'google' })` — will 400 until Google is enabled in Supabase dashboard
- **Status:** Documented in CLAUDE.md, requires Supabase dashboard config by developer

### Password change verification gap
- **File:** `backend/src/routes/user.ts`
- **Issue:** `PUT /api/user/password` requires `SUPABASE_ANON_KEY` in backend `.env` — without it, current-password verification is skipped
- **Impact:** Security gap if env var not set

### Polling interval doesn't clear on completion
- **File:** `src/pages/AuditDetail.tsx`
- **Issue:** Uses `[id]` as dependency array, not `[id, audit?.status]` — interval runs continuously even after scan completes
- **Impact:** Unnecessary API calls post-completion

### StatsBar uses placeholder data
- **File:** `src/components/StatsBar.tsx`
- **Issue:** 4 headline stats are hardcoded (not real API data)

### SocialProof uses placeholder company names
- **File:** `src/components/SocialProof.tsx`
- **Issue:** Company logos/names are placeholder content

## Security

### All critical issues mitigated ✓
| Area | Status | Implementation |
|------|--------|---------------|
| SSRF | ✓ Fixed | `backend/src/utils/validateUrl.ts` — blocks private IPs, cloud metadata |
| IDOR | ✓ Fixed | All routes verify `user_id` ownership |
| TOCTOU | ✓ Fixed | Atomic DB operations |
| Webhook tampering | ✓ Fixed | Timing-safe HMAC signature verification |
| Error leakage | ✓ Fixed | Error sanitization middleware |
| Rate limiting | ✓ Fixed | scans: 20/hr, payments: 10/hr, global: 200/15min |
| Security headers | ✓ Fixed | `helmet` middleware |

### Remaining concern
- `SUPABASE_SERVICE_ROLE_KEY` in backend `.env` — high-privilege key, must never reach frontend

## Performance

### Sequential AI enrichment
- **File:** `backend/src/services/aiService.ts`
- **Issue:** Violations processed sequentially by Claude API — slow for pages with many violations
- **Fix:** Batch API calls or parallelize with concurrency limit

### Single Puppeteer browser instance
- **File:** `backend/src/services/scanService.ts`
- **Issue:** No browser pooling — concurrent scans share one browser
- **Impact:** Degrades under load; fine for MVP

### No pagination on audits list
- **File:** `src/hooks/useAudits.ts`, `backend/src/routes/audits.ts`
- **Issue:** Fetches all user audits with no limit
- **Impact:** Degrades for power users with many scans

### PDF not cached
- **File:** `backend/src/services/pdfService.ts`
- **Issue:** PDF is regenerated on every download request (placeholder implementation)

## Fragile Areas

### `scanService.ts` — DOM types in Node context
Pre-existing TS errors (see Tech Debt above). Touching this file risks introducing new type issues.

### `aiService.ts` — JSON parsing from Claude response
Claude API returns markdown-wrapped JSON — parsing is fragile to response format changes.

### `pdfService.ts` — Placeholder implementation
PDF generation is a stub. The actual layout/coordinate system needs implementation.

### OAuth race condition
Sign-in with Google could race with session initialization in `AuthContext`. Not tested.

### URL param not preserved through auth redirect
If unauthenticated user visits `/scan?url=example.com`, the `?url=` param is lost after login redirect. CLAUDE.md notes this as pending.

## Missing Features (from CLAUDE.md)

| Feature | Impact | Phase |
|---------|--------|-------|
| BuyCreditsModal | Users can't buy credits from dashboard | 4A |
| CancelSubscriptionModal | Users can't cancel from UI | 4A |
| UpgradeModal | Upgrade flow incomplete | 4A |
| ShareReportModal | Sharing not implemented | 4A |
| PDF export | Download button present but unimplemented | 4B |
| Onboarding flow | New users get no guidance | 4C |
| Figma redesign: Dashboard | Functional but unstyled to spec | 1B |
| Figma redesign: NewScan | Functional but unstyled to spec | 1C |
| Figma redesign: AuditDetail | Functional but unstyled to spec | 1D |

## Test Coverage Gaps

- Backend services: `scanService`, `aiService`, `pdfService` — zero unit tests
- Payment webhook: Not integration tested
- DELETE audit endpoint: Not tested
- Google OAuth flow: Not testable in unit tests
- E2E tests: Not yet implemented (Playwright planned)
- `AuditDetail` polling cleanup: Interval behavior not verified in tests
