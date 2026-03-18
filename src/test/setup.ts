import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase globally — tests must not hit real network
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}))

// Silence console.error in tests (e.g. React act() warnings)
vi.spyOn(console, 'error').mockImplementation(() => {})
