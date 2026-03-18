import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCredits } from './useCredits'

// Use a configurable mock function so we can control the returned user per test
const mockUseAuth = vi.fn()
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockGetCredits = vi.fn()
vi.mock('@/lib/api', () => ({
  userApi: { getCredits: (...args: unknown[]) => mockGetCredits(...args) },
}))

const mockUser = { id: 'user-123' }

beforeEach(() => {
  vi.clearAllMocks()
  // Stable reference — prevents useEffect re-fires due to identity change
  mockUseAuth.mockReturnValue({ user: mockUser })
})

describe('useCredits', () => {
  it('returns credits on successful fetch', async () => {
    mockGetCredits.mockResolvedValueOnce({ data: { credits: 7 } })

    const { result } = renderHook(() => useCredits())
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.credits).toBe(7)
    expect(result.current.error).toBeNull()
  })

  it('returns null credits and error on failure', async () => {
    mockGetCredits.mockResolvedValueOnce({ error: 'Unauthorized' })

    const { result } = renderHook(() => useCredits())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.credits).toBeNull()
    expect(result.current.error).toBe('Unauthorized')
  })

  it('does not fetch when no user', () => {
    mockUseAuth.mockReturnValue({ user: null })
    renderHook(() => useCredits())
    expect(mockGetCredits).not.toHaveBeenCalled()
  })

  it('refetch updates credit count', async () => {
    mockGetCredits
      .mockResolvedValueOnce({ data: { credits: 3 } })
      .mockResolvedValueOnce({ data: { credits: 8 } })

    const { result } = renderHook(() => useCredits())
    await waitFor(() => expect(result.current.credits).toBe(3))

    await result.current.refetch()
    await waitFor(() => expect(result.current.credits).toBe(8))
  })
})
