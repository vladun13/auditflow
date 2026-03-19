# Testing

**Project:** AuditFlow
**Mapped:** 2026-03-19

## Framework

- **Test runner:** Vitest
- **DOM environment:** happy-dom
- **Component testing:** React Testing Library (`@testing-library/react`, `@testing-library/user-event`)
- **Matchers:** `@testing-library/jest-dom` (loaded in `src/test/setup.ts`)
- **Config:** `vitest.config.ts`

## Test Structure

```
src/
├── test/
│   ├── setup.ts          # Global setup — imports jest-dom matchers
│   └── helpers.tsx       # Test factories and render utilities
├── pages/
│   ├── Landing.test.tsx
│   ├── Login.test.tsx
│   ├── SignUp.test.tsx
│   ├── DashboardNew.test.tsx
│   ├── NewScan.test.tsx
│   ├── AuditDetail.test.tsx
│   ├── Reports.test.tsx
│   └── settings/
│       ├── Account.test.tsx
│       ├── Security.test.tsx
│       └── ...
├── components/
│   ├── AuditHeader.test.tsx
│   ├── ScoreRing.test.tsx
│   └── ...
├── hooks/
│   ├── useAudits.test.ts
│   ├── useAudit.test.ts
│   └── ...
└── layouts/
    ├── DashboardLayout.test.tsx
    └── SettingsLayout.test.tsx
```

**Total:** 18 test files, 133 tests (all passing as of 2026-03-18)

## Test Helpers (`src/test/helpers.tsx`)

### `makeAudit(overrides?)` — Audit factory
```tsx
const audit = makeAudit({ status: 'completed', wcag_score: 72 });
```

### `makeViolation(overrides?)` — Violation factory
```tsx
const violation = makeViolation({ impact: 'critical' });
```

### `renderWithRouter(ui, { route? })` — Router-wrapped render
```tsx
renderWithRouter(<DashboardNew />, { route: '/dashboard' });
```

## Mocking Patterns

### API mocks
```tsx
vi.mock('@/lib/api', () => ({
  auditApi: {
    list: vi.fn().mockResolvedValue([makeAudit()]),
    get: vi.fn().mockResolvedValue(makeAudit({ status: 'completed' })),
  }
}));
```

### AuthContext mock
```tsx
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, signOut: vi.fn() }),
}));
```

### Supabase mock
```tsx
vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: vi.fn(), onAuthStateChange: vi.fn() } }
}));
```

### Navigation mock
```tsx
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});
```

## Test Patterns

### Standard component test structure
```tsx
describe('ComponentName', () => {
  it('renders without crashing', () => {
    renderWithRouter(<ComponentName />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ComponentName />);
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(mockApi).toHaveBeenCalled();
  });
});
```

### Hook testing
```tsx
import { renderHook, waitFor } from '@testing-library/react';

it('fetches data on mount', async () => {
  const { result } = renderHook(() => useAudits());
  await waitFor(() => expect(result.current.audits).toHaveLength(1));
});
```

## Coverage

- **Target:** 80%+ coverage
- **Current:** 18 test files, 133 tests — covers all pages, hooks, layouts
- **Command:** `npm test` (Vitest watch mode) or `npm run test:run` (CI)

## Known Gaps

- `backend/src/services/scanService.ts` — no unit tests (Puppeteer complexity)
- `backend/src/services/aiService.ts` — AI response parsing not tested
- `backend/src/services/pdfService.ts` — PDF layout not tested (placeholder)
- Payment webhook integration tests missing
- Google OAuth flow not testable in unit tests
- E2E tests not yet implemented (Playwright planned for Phase 5)

## Configuration

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  }
});
```

Test files excluded from `tsc -b` via `tsconfig.app.json` to prevent Vercel build failures.
