# Architecture

**Project:** AuditFlow
**Mapped:** 2026-03-19

## Pattern

**Frontend:** Single Page Application (SPA) — Vite + React 19, client-side routing via React Router v7.

**Backend:** RESTful Express API (Node.js) on port 3001 with async background processing.

**Database:** Supabase (PostgreSQL) with Row Level Security — users only access their own data.

## Layers

### Frontend Layers

```
Pages (src/pages/)
  └── Layouts (src/layouts/) — DashboardLayout, SettingsLayout
       └── Components (src/components/)
            └── UI Primitives (src/components/ui/) — shadcn/ui + Radix
Custom Hooks (src/hooks/) — useAudits, useAudit, useCredits, usePayments
API Client (src/lib/api.ts) — apiCall() with auto Bearer token
Auth Context (src/contexts/AuthContext.tsx) — Supabase JWT state
```

### Backend Layers

```
Routes (backend/src/routes/) — audits, auth, user, payments
  └── Auth Middleware (backend/src/middleware/auth.ts) — JWT verification
Services (backend/src/services/) — ScanService, AIService, PDFService
Utils (backend/src/utils/) — validateUrl (SSRF protection)
Config (backend/src/config/supabase.ts) — Supabase admin client
```

## Data Flow

### Scan Flow (async)

```
POST /api/audits/:id/scan
  → ScanService: Puppeteer crawl + axe-core WCAG scan
  → Save violations to Supabase
  → AIService: Claude API generates ai_explanation + ai_fix_steps
  → Update audit status to 'completed'

Frontend polls GET /api/audits/:id every 3s until status === 'completed'
```

### Auth Flow

```
Supabase auth → JWT token
Frontend: apiCall() injects Authorization: Bearer {jwt}
Backend: auth middleware verifies JWT → req.userId attached
RLS: Supabase enforces user can only see own rows
```

### Payment Flow

```
POST /api/payments/checkout → LemonSqueezy checkout URL
User completes payment → LemonSqueezy webhook → POST /api/payments/webhook
Webhook: verifies HMAC signature → credits added to users table
```

## Key Abstractions

| Abstraction | File | Purpose |
|-------------|------|---------|
| `apiCall()` | `src/lib/api.ts` | Central HTTP client, injects auth token |
| `AuthContext` | `src/contexts/AuthContext.tsx` | Supabase auth state + signIn/signOut/signInWithGoogle |
| `DashboardLayout` | `src/layouts/DashboardLayout.tsx` | Sidebar + header + Outlet for all protected pages |
| `SettingsLayout` | `src/layouts/SettingsLayout.tsx` | Left nav tabs for settings sub-pages |
| `useAudit` | `src/hooks/useAudit.ts` | Polling hook for audit status |
| `validateUrl` | `backend/src/utils/validateUrl.ts` | SSRF protection |
| Auth middleware | `backend/src/middleware/auth.ts` | JWT verification for all protected routes |

## Entry Points

- **Frontend:** `src/main.tsx` → `src/App.tsx` (route definitions)
- **Backend:** `backend/src/server.ts` (Express app, helmet, rate limiting, route mounts)

## WCAG Score Formula

```
score = 100 - (critical×10) - (serious×5) - (moderate×2) - (minor×1), min 0
Level: AAA ≥ 95, AA ≥ 85, A ≥ 70, null < 70
```

## Cross-Cutting Concerns

- **Security:** `helmet` headers, rate limiting (scans: 20/hr, payments: 10/hr, global: 200/15min), SSRF protection, IDOR fix, timing-safe webhook
- **Auth:** Supabase JWT everywhere — frontend context + backend middleware
- **Error handling:** Error sanitization on backend, user-friendly messages on frontend
- **No "use client":** Vite app, not Next.js — never add this directive
