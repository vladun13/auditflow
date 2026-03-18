import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePayments, useCreditHistory } from './usePayments'

const mockUser = { id: 'user-123' }
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}))

const mockGetHistory = vi.fn()
const mockGetCreditHistory = vi.fn()

vi.mock('@/lib/api', () => ({
  paymentApi: { getHistory: (...args: unknown[]) => mockGetHistory(...args) },
  userApi: { getCreditHistory: (...args: unknown[]) => mockGetCreditHistory(...args) },
}))

beforeEach(() => vi.clearAllMocks())

describe('usePayments', () => {
  it('fetches payment history and returns data', async () => {
    const payments = [
      { id: 'p-1', amount: 29900, plan: 'pro', status: 'completed', credits: 5, currency: 'usd', created_at: '2024-01-01T00:00:00Z' },
    ]
    mockGetHistory.mockResolvedValueOnce({ data: payments })

    const { result } = renderHook(() => usePayments())
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.payments).toHaveLength(1)
    expect(result.current.payments[0].plan).toBe('pro')
  })

  it('sets error on API failure', async () => {
    mockGetHistory.mockResolvedValueOnce({ error: 'Server error' })

    const { result } = renderHook(() => usePayments())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Server error')
    expect(result.current.payments).toHaveLength(0)
  })
})

describe('useCreditHistory', () => {
  it('fetches credit history and returns data', async () => {
    const history = [
      { id: 'c-1', amount: 5, type: 'purchase', description: 'Pro pack', balance_after: 5, created_at: '2024-01-01T00:00:00Z' },
      { id: 'c-2', amount: -1, type: 'usage', description: 'Scan: example.com', balance_after: 4, created_at: '2024-01-02T00:00:00Z' },
    ]
    mockGetCreditHistory.mockResolvedValueOnce({ data: history })

    const { result } = renderHook(() => useCreditHistory())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.history).toHaveLength(2)
    expect(result.current.history[0].type).toBe('purchase')
    expect(result.current.history[1].type).toBe('usage')
  })

  it('returns empty history on error', async () => {
    mockGetCreditHistory.mockResolvedValueOnce({ error: 'Unauthorized' })

    const { result } = renderHook(() => useCreditHistory())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.history).toHaveLength(0)
    expect(result.current.error).toBe('Unauthorized')
  })
})
