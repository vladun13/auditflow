# Technology Stack

**Analysis Date:** 2026-03-19

## Languages

**Primary:**
- TypeScript 5.9.3 - Used throughout frontend and backend for type safety
- JavaScript (ES modules) - Runtime target after TypeScript compilation

**Tooling:**
- HTML5 - Frontend markup (React JSX)
- CSS - Styling via Tailwind CSS and CSS variables

## Runtime

**Environment:**
- Node.js 20.19+ (backend) - Express server runtime
- Browser - Frontend runs in modern browsers (SPA)

**Package Manager:**
- npm - Package management for both frontend and backend
- Lockfile: `package-lock.json` present for both root and `backend/` directories

## Frameworks

**Core:**
- React 19.2.0 - UI framework for frontend (Vite-based SPA)
- Express 4.21.2 - HTTP framework for Node.js backend API

**Build/Dev:**
- Vite 7.2.4 - Frontend build tool and dev server (port 5173)
- TypeScript ~5.9.3 - Type checking (`tsc`)

**Testing:**
- Vitest 4.1.0 - Test runner (unit tests)
- @testing-library/react 16.3.2 - React component testing utilities
- happy-dom 20.8.4 - DOM environment for tests (lightweight alternative to jsdom)
- @testing-library/jest-dom 6.9.1 - Jest matchers for DOM assertions

**Router:**
- React Router 7.9.6 - Client-side routing for SPA

## Key Dependencies

**Frontend - UI/Components:**
- shadcn/ui - Accessible headless UI component library (Radix UI wrapper)
- @radix-ui/* (40+ packages) - Accessible component primitives (1.2-2.2 versions)
- Tailwind CSS 4.1.17 - Utility-first styling framework
- Lucide React 0.555.0 - Icon library

**Frontend - Forms & Validation:**
- React Hook Form 7.67.0 - Form state management
- Zod 4.1.13 - Schema validation and type inference
- @hookform/resolvers 5.2.2 - Adapter for Zod + React Hook Form

**Frontend - State & Data:**
- Framer Motion 12.23.24 - Animation library
- Recharts 2.15.4 - Charting library (React)
- date-fns 4.1.0 - Date manipulation utilities
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.4.0 - Merge Tailwind CSS classes intelligently

**Frontend - Notifications:**
- Sonner 2.0.7 - Toast notification library

**Frontend - PDF Export:**
- jsPDF 3.0.4 - PDF generation library
- html2pdf.js 0.12.1 - HTML to PDF conversion
- @types/pdfkit 0.17.4 - Types for pdfkit (used in backend)

**Frontend - Authentication:**
- @supabase/supabase-js 2.86.0 - Supabase client (auth + DB access)

**Frontend - Payments:**
- @lemonsqueezy/lemonsqueezy.js 4.0.0 - Lemon Squeezy SDK for payments

**Frontend - Styling:**
- @tailwindcss/postcss 4.1.17 - PostCSS plugin for Tailwind
- autoprefixer 10.4.22 - Vendor prefix autoprefixer
- postcss 8.5.6 - CSS transformer
- class-variance-authority 0.7.1 - Type-safe className variants
- next-themes 0.4.6 - Theme management utility
- tw-animate-css 1.4.0 - Animation class utilities

**Frontend - Accessibility & Interaction:**
- cmdk 1.1.1 - Command palette library
- input-otp 1.4.2 - OTP input component
- embla-carousel-react 8.6.0 - Carousel component
- react-day-picker 9.11.3 - Date picker
- react-resizable-panels 3.0.6 - Resizable panel layout
- vaul 1.1.2 - Drawer component

**Backend - Core:**
- dotenv 16.4.7 - Environment variable loading
- cors 2.8.5 - CORS middleware
- cookie-parser 1.4.7 - Cookie parsing middleware
- helmet 8.1.0 - Security headers middleware
- express-rate-limit 8.3.1 - Rate limiting middleware

**Backend - Scanning:**
- Puppeteer 24.3.0 - Headless browser for web crawling
- @axe-core/puppeteer 4.10.4 - Accessibility testing via axe-core

**Backend - AI/LLM:**
- @anthropic-ai/sdk 0.32.0 - Anthropic Claude API client

**Backend - Database:**
- @supabase/supabase-js 2.86.0 - Supabase client (admin + service_role access)

**Backend - Payments:**
- @lemonsqueezy/lemonsqueezy.js 4.0.0 - Lemon Squeezy SDK

**Backend - Email (Optional):**
- @sendgrid/mail 8.1.5 - SendGrid email service client

**Backend - PDF Generation:**
- pdfkit 0.17.2 - PDF generation library for Node.js

**Development Dependencies:**
- tsx 4.19.5 - TypeScript executor for `npm run dev` watch mode
- ESLint 9.39.1 - Code linting
- @eslint/js 9.39.1 - ESLint base rules
- typescript-eslint 8.46.4 - TypeScript ESLint support
- eslint-plugin-react-hooks 7.0.1 - React hooks lint rules
- eslint-plugin-react-refresh 0.4.24 - Vite React refresh rules
- @vitejs/plugin-react 5.1.1 - Vite React plugin
- @vitest/coverage-v8 4.1.0 - Vitest code coverage
- @types/* - Type definitions for Node, React, DOM, and dependencies
- globals 16.5.0 - Global variables for ESLint

## Configuration

**Environment:**
- Frontend (.env): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
- Backend (.env): `PORT`, `NODE_ENV`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_VARIANT_ID_*`, `LEMONSQUEEZY_WEBHOOK_SECRET`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `FRONTEND_URL`

**Build Configuration:**
- `vite.config.ts` - Vite build config with React plugin, path alias (`@`), test environment (`happy-dom`), coverage setup
- `tsconfig.json` (root) - Frontend TypeScript config (ES2020, strict mode, React JSX)
- `tsconfig.app.json` - Production-only TypeScript config (excludes test files)
- `tsconfig.node.json` - Node.js TypeScript config for `vite.config.ts`
- `backend/tsconfig.json` - Backend TypeScript config (ES2020, CommonJS/ESM compatible)
- `vercel.json` - SPA rewrite rules for Vercel deployment

**Linting:**
- ESLint flat config (`.js` files recommended)

**Development Server:**
- Vite dev server on `http://localhost:5173`
- Backend server on `http://localhost:3001`

## Platform Requirements

**Development:**
- Node.js 20.19 or later
- npm or compatible package manager
- Supabase account with PostgreSQL database
- Anthropic API key for Claude AI
- Lemon Squeezy account for payment processing
- Optional: SendGrid API key for email notifications

**Production:**
- Vercel (frontend hosting)
- Render.com or Railway (backend hosting)
- Supabase (database and authentication)
- Puppeteer requires headless Chrome/Chromium (handled via Puppeteer package)

---

*Stack analysis: 2026-03-19*
