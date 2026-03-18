import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAudits } from './useAudits'
import { makeAudit } from '@/test/helpers'

const mockUseAuth = vi.fn()
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockList = vi.fn()
vi.mock('@/lib/api', () => ({
  auditApi: { list: (...args: unknown[]) => mockList(...args) },
}))

const mockUser = { id: 'user-123' }

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({ user: mockUser })
})

describe('useAudits', () => {
  it('returns loading=true initially then audits on success', async () => {
    const audits = [makeAudit(), makeAudit({ id: 'audit-2', website_url: 'https://other.com' })]
    mockList.mockResolvedValueOnce({ data: audits })

    const { result } = renderHook(() => useAudits())
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.audits).toHaveLength(2)
    expect(result.current.error).toBeNull()
  })

  it('sets error when API returns error', async () => {
    mockList.mockResolvedValueOnce({ error: 'Server error' })

    const { result } = renderHook(() => useAudits())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Server error')
    expect(result.current.audits).toHaveLength(0)
  })

  it('does not fetch when user is null', () => {
    mockUseAuth.mockReturnValue({ user: null })
    const { result } = renderHook(() => useAudits())
    expect(result.current.loading).toBe(false)
    expect(mockList).not.toHaveBeenCalled()
  })

  it('refetch re-calls the API', async () => {
    mockList
      .mockResolvedValueOnce({ data: [makeAudit()] })
      .mockResolvedValueOnce({ data: [makeAudit(), makeAudit({ id: 'audit-2' })] })

    const { result } = renderHook(() => useAudits())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.audits).toHaveLength(1)

    await result.current.refetch()
    await waitFor(() => expect(result.current.audits).toHaveLength(2))
  })
})
