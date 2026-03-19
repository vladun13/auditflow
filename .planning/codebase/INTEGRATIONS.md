# External Integrations

**Analysis Date:** 2026-03-19

## APIs & External Services

**Supabase (Database & Auth):**
- Supabase - Backend-as-a-service for PostgreSQL database, authentication, and Row-Level Security
  - SDK: `@supabase/supabase-js` 2.86.0
  - Frontend auth: Anonymous key (VITE_SUPABASE_ANON_KEY)
  - Backend admin: Service role key (SUPABASE_SERVICE_ROLE_KEY for privileged operations)
  - Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (frontend), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` (backend)

**Anthropic Claude API (AI Recommendations):**
- Claude API - Generates plain-English explanations and step-by-step fix instructions for WCAG violations
  - SDK: `@anthropic-ai/sdk` 0.32.0
  - Endpoint: `messages` create endpoint for text generation
  - Auth: `ANTHROPIC_API_KEY` (backend only)
  - Used in: `backend/src/services/aiService.ts` — calls `generateRecommendation()` for each unique violation type

**Lemon Squeezy (Payment Processing):**
- Lemon Squeezy - Payment platform for credit pack purchases (Basic $149/1cr, Pro $299/5cr, Enterprise $499/15cr)
  - SDK: `@lemonsqueezy/lemonsqueezy.js` 4.0.0
  - Setup function: `lemonSqueezySetup()` with API key
  - Checkout creation: `createCheckout()` function
  - Webhook validation: Timing-safe HMAC-SHA256 signature verification
  - Auth: `LEMONSQUEEZY_API_KEY` (backend only)
  - Config: `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_VARIANT_ID_BASIC`, `LEMONSQUEEZY_VARIANT_ID_PRO`, `LEMONSQUEEZY_VARIANT_ID_ENTERPRISE`, `LEMONSQUEEZY_WEBHOOK_SECRET`
  - Routes: `POST /api/payments/checkout` creates checkout, webhook at `POST /api/payments/webhook` (no auth required)

**SendGrid (Email Notifications - Optional):**
- SendGrid - Email service for notifications (optional, not yet fully integrated)
  - SDK: `@sendgrid/mail` 8.1.5
  - Auth: `SENDGRID_API_KEY` (backend only)
  - Config: `SENDGRID_FROM_EMAIL`

**Google OAuth (Social Authentication):**
- Google - OAuth 2.0 provider for social sign-in
  - Integration: Via Supabase OAuth provider (Authentication → Providers → Google in dashboard)
  - Frontend: `AuthContext.tsx` calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
  - Redirect URL: `{FRONTEND_URL}/auth/callback`
  - Status: Requires Supabase dashboard configuration before use

## Data Storage

**Databases:**
- PostgreSQL (via Supabase) - Primary data store
  - Client: `@supabase/supabase-js` admin client (backend) and anon client (frontend)
  - Schema: `users`, `audits`, `violations`, `payments` tables
  - Row-Level Security (RLS): Enabled on all tables — users see only their own data
  - Connection: Supabase provides connection pooling

**File Storage:**
- Local filesystem only - No cloud file storage configured
- PDF reports: Generated in memory via `jsPDF` and `html2pdf.js`, sent as blob download to client

**Caching:**
- In-memory caching (violation type recommendations) - `AIService` checks cache before calling Claude API
- No Redis or external cache layer configured

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - PostgreSQL-backed authentication system
  - Mechanism: Email + password (with OTP verification for signups)
  - Token: JWT stored in Supabase session
  - Frontend storage: Supabase SDK persists session automatically
  - Backend verification: Auth middleware (`backend/src/middleware/auth.ts`) verifies JWT on protected routes
  - JWT extraction: `Authorization: Bearer {token}` header
  - Current user: Available via `req.user` (decoded JWT) after middleware
  - OAuth: Google sign-in supported (requires Supabase provider config)

**Implementation:**
- Frontend: `src/contexts/AuthContext.tsx` — `signUp()`, `signIn()`, `signInWithGoogle()`, `signOut()`, `resetPassword()`, `updatePassword()`
- Backend: `backend/src/middleware/auth.ts` — JWT verification and user extraction
- Session management: Supabase SDK auto-refreshes tokens; `onAuthStateChange()` listener keeps frontend state in sync

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, LogRocket, or similar service configured

**Logs:**
- Console logging only - `console.log()` and `console.error()` throughout codebase
- Backend: Errors logged to stdout; production mode sanitizes error messages in responses (`server.ts` checks `NODE_ENV === 'production'`)
- Frontend: Console logs in browser dev tools only

## CI/CD & Deployment

**Hosting:**
- Frontend: Vercel (configured with `vercel.json` for SPA routing)
- Backend: Render.com or Railway (manual setup required)
- Database: Supabase (managed cloud PostgreSQL)

**CI Pipeline:**
- Not detected - No GitHub Actions, CircleCI, or similar service configured
- Manual deployment: `git push` triggers Vercel auto-deployment for frontend; backend deployed manually to chosen platform

**Build Process:**
- Frontend: `npm run build` runs `tsc -b && vite build` (type check + production build)
- Backend: `npm run build` runs `tsc` (TypeScript compilation to `dist/`)
- Test files: Excluded from `tsconfig.app.json` to prevent Vercel build failures

## Environment Configuration

**Required env vars:**

*Frontend (.env):*
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- `VITE_API_URL` - Backend API URL (http://localhost:3001 locally, production URL in deployed env)

*Backend (.env):*
- `PORT` - Server port (default 3001)
- `NODE_ENV` - Environment (`development` or `production`)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (admin access, secret)
- `SUPABASE_ANON_KEY` - Supabase anonymous key (used for password verification in auth middleware)
- `ANTHROPIC_API_KEY` - Claude API key (secret)
- `LEMONSQUEEZY_API_KEY` - Lemon Squeezy API key (secret)
- `LEMONSQUEEZY_STORE_ID` - Lemon Squeezy store ID
- `LEMONSQUEEZY_VARIANT_ID_BASIC` - Variant ID for Basic plan
- `LEMONSQUEEZY_VARIANT_ID_PRO` - Variant ID for Pro plan
- `LEMONSQUEEZY_VARIANT_ID_ENTERPRISE` - Variant ID for Enterprise plan
- `LEMONSQUEEZY_WEBHOOK_SECRET` - Webhook signature secret (secret)
- `SENDGRID_API_KEY` - SendGrid API key (optional, secret)
- `SENDGRID_FROM_EMAIL` - SendGrid sender email (optional)
- `FRONTEND_URL` - Frontend base URL for OAuth redirects (http://localhost:5173 locally)

**Secrets location:**
- Local: `.env` and `backend/.env` files (Git-ignored, never committed)
- Vercel: Environment variables set in project settings (UI)
- Render.com/Railway: Environment variables set in project dashboard (UI)
- Never: Hardcoded in source code (security risk)

## Webhooks & Callbacks

**Incoming:**
- Lemon Squeezy webhook - Listens at `POST /api/payments/webhook` (no auth required)
  - Signature verification: HMAC-SHA256 timing-safe comparison
  - Env var: `LEMONSQUEEZY_WEBHOOK_SECRET`
  - Payload: Contains order data with custom fields (user_id, credits, plan)
  - Handler: `backend/src/routes/payments.ts` — webhook route

**Outgoing:**
- Google OAuth redirect - Frontend redirects to Google auth, then back to `{FRONTEND_URL}/auth/callback`
- Lemon Squeezy redirect - After checkout, user redirected to `GET /api/payments/success/:id`
- No outbound webhooks configured (app doesn't push events to external services)

## API Rate Limiting

**Global:**
- 200 requests per 15 minutes per IP address (all endpoints except health)

**Scan Creation:**
- 20 scan requests per hour per IP (expensive operation)
- Applied to `POST /api/audits/:id/scan`

**Payment Checkout:**
- 10 payment requests per hour per IP (to prevent abuse)
- Applied to `POST /api/payments/checkout`

Implementation: `express-rate-limit` middleware with standard headers and custom error messages

---

*Integration audit: 2026-03-19*
