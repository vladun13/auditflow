# Conventions

**Project:** AuditFlow
**Mapped:** 2026-03-19

## Code Style

- **Language:** TypeScript strict mode on both frontend and backend
- **Formatter:** No explicit prettier config detected — consistent 2-space indentation throughout
- **Linting:** ESLint configured via `eslint.config.js`
- **Line length:** ~100 chars practical limit

## Naming Conventions

| Pattern | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `AuditDetail`, `ScoreRing`, `ViolationCard` |
| Hooks | camelCase + `use` prefix | `useAudits`, `useCredits` |
| API namespaces | camelCase + `Api` suffix | `auditApi`, `userApi`, `paymentApi` |
| Types/interfaces | PascalCase | `Audit`, `Violation`, `CreditHistory` |
| CSS classnames | Tailwind utilities via `cn()` | `cn("flex items-center", isActive && "bg-primary")` |
| Constants | SCREAMING_SNAKE_CASE | `IMPACT_COLOR`, `WCAG_THRESHOLDS` |
| Backend routes files | lowercase | `audits.ts`, `payments.ts`, `user.ts` |
| Test files | Co-located `*.test.tsx` | `DashboardNew.test.tsx` |

## Import Organization

Standard import order (no enforced tooling, consistent by convention):
1. React and React-related (react, react-dom, react-router)
2. Third-party libraries (lucide-react, framer-motion, recharts)
3. Internal — lib/utils (`@/lib/api`, `@/lib/utils`)
4. Internal — hooks (`@/hooks/useAudits`)
5. Internal — components (`@/components/ui/button`)
6. Types (`@/types`)

**Path aliases:** `@/` maps to `src/` via Vite/tsconfig.

## Component Patterns

### Functional components only
```tsx
// Always use function declarations, not arrow function expressions for components
export default function AuditDetail() {
  // ...
}
```

### cn() for conditional classNames
```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-classes", condition && "conditional-class")} />
```

### shadcn/ui primitives
All UI primitives from `src/components/ui/` — never raw HTML for interactive elements:
- Buttons → `<Button>` with variants: `default`, `outline`, `ghost`, `destructive`
- Cards → `<Card>` + `<CardContent>`
- Badges → `<Badge>` with variants
- Dialogs → `<Dialog>` (for modals, pending implementation)

### No "use client"
This is a Vite SPA, not Next.js. Never add `"use client"` directives.

## State Management

- **Local state:** `useState` — no Redux/Zustand
- **Server state:** Custom hooks wrapping `apiCall()` + `useEffect`
- **Form state:** React Hook Form + Zod validation
- **Auth state:** `AuthContext` via `useContext(AuthContext)` or `useAuth()` hook
- **Immutability:** Always create new objects, never mutate in place

## Error Handling

### Frontend
- API errors caught in custom hooks, surfaced via Sonner toast notifications
- Form validation errors displayed inline via React Hook Form + Zod
- `apiCall()` throws on non-2xx responses — callers handle via try/catch or `.catch()`

### Backend
- Errors sanitized before sending to client (no stack traces in production)
- `console.error` for server-side logging
- HTTP status codes: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)

## Styling

- **Framework:** Tailwind CSS v4
- **Design tokens:** CSS variables in `src/index.css` (HSL format)
- **No hardcoded hex colors** — use Tailwind tokens or CSS variables only
- **Primary:** `text-primary`, `bg-primary` → maps to `#4F46E5` indigo
- **Score colors:**
  - `≥80` → `text-green-600 / bg-green-50`
  - `≥60` → `text-yellow-600 / bg-yellow-50`
  - `<60` → `text-red-600 / bg-red-50`
- **Violation severity:**
  - `critical` → `bg-red-100 / text-red-800`
  - `serious` → `bg-orange-100 / text-orange-800`
  - `moderate` → `bg-yellow-100 / text-yellow-800`
  - `minor` → `bg-blue-100 / text-blue-800`

## API Client Pattern

All frontend API calls go through `apiCall()` in `src/lib/api.ts`:
```ts
const apiCall = async (endpoint: string, options?: RequestInit) => {
  const token = await getToken(); // from Supabase session
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options?.headers }
  });
};
```

Namespaced API objects: `auditApi.list()`, `userApi.getCredits()`, `paymentApi.checkout()`.

## File Size Targets

- **Typical file:** 200–400 lines
- **Max:** ~800 lines before extracting sub-components
- **Pattern:** Extract sub-components when a file exceeds ~400 lines (e.g., `AuditHeader`, `ViolationList`, `ScoreRing` extracted from `AuditDetail`)
