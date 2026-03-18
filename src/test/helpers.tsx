import { type ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import type { Audit, Violation } from '@/types'

// ─── Route wrapper ────────────────────────────────────────────────────────────

export function renderWithRouter(
  ui: ReactNode,
  { initialPath = '/', routePath = '*' }: { initialPath?: string; routePath?: string } = {},
  options?: RenderOptions,
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path={routePath} element={ui} />
      </Routes>
    </MemoryRouter>,
    options,
  )
}

// ─── Auth mock helpers ────────────────────────────────────────────────────────

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
}

export function mockUseAuth(overrides: Record<string, unknown> = {}) {
  return {
    user: mockUser,
    session: { access_token: 'test-token' },
    loading: false,
    signIn: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue(undefined),
    resetPassword: vi.fn().mockResolvedValue({ error: null }),
    ...overrides,
  }
}

// ─── Fixture factories ────────────────────────────────────────────────────────

export function makeAudit(overrides: Partial<Audit> = {}): Audit {
  return {
    id: 'audit-1',
    website_url: 'https://example.com',
    status: 'completed',
    wcag_score: 78,
    wcag_level: 'AA',
    total_violations: 5,
    critical_count: 1,
    serious_count: 2,
    moderate_count: 1,
    minor_count: 1,
    pages_scanned: 3,
    created_at: '2024-03-01T12:00:00Z',
    completed_at: '2024-03-01T12:05:00Z',
    violations: [],
    ...overrides,
  }
}

export function makeViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    id: 'v-1',
    page_url: 'https://example.com',
    violation_type: 'color-contrast',
    impact: 'serious',
    wcag_criterion: '1.4.3',
    description: 'Elements must have sufficient color contrast',
    ai_explanation: 'Low contrast makes text hard to read for users with visual impairments.',
    ai_fix_steps: '1. Increase contrast ratio to at least 4.5:1',
    affected_elements: 3,
    estimated_fix_hours: 1,
    ...overrides,
  }
}
