import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAudit } from './useAudit'
import { makeAudit } from '@/test/helpers'

const mockGet = vi.fn()
vi.mock('@/lib/api', () => ({
  auditApi: { get: (...args: unknown[]) => mockGet(...args) },
}))

beforeEach(() => {
  vi.clearAllMocks()
  // shouldAdvanceTime lets waitFor's internal polling still work
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useAudit', () => {
  it('fetches audit by id and returns data', async () => {
    const audit = makeAudit({ id: 'audit-1' })
    mockGet.mockResolvedValueOnce({ data: audit })

    const { result } = renderHook(() => useAudit('audit-1'))
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.audit?.id).toBe('audit-1')
    expect(result.current.error).toBeNull()
  })

  it('sets error when API fails', async () => {
    mockGet.mockResolvedValueOnce({ error: 'Not found' })

    const { result } = renderHook(() => useAudit('bad-id'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Not found')
    expect(result.current.audit).toBeNull()
  })

  it('does not fetch when id is undefined', () => {
    renderHook(() => useAudit(undefined))
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('starts polling when audit status is scanning', async () => {
    const scanning = makeAudit({ status: 'scanning' })
    const completed = makeAudit({ status: 'completed' })

    mockGet
      .mockResolvedValueOnce({ data: scanning })
      .mockResolvedValueOnce({ data: completed })

    const { result } = renderHook(() => useAudit('audit-1'))
    await waitFor(() => expect(result.current.audit?.status).toBe('scanning'))

    // Advance timer to trigger one poll cycle
    await act(async () => { vi.advanceTimersByTime(3000) })
    await waitFor(() => expect(result.current.audit?.status).toBe('completed'))

    // Should have been called twice total (initial + 1 poll)
    expect(mockGet).toHaveBeenCalledTimes(2)
  })

  it('stops polling when audit becomes completed', async () => {
    const scanning = makeAudit({ status: 'scanning' })
    const completed = makeAudit({ status: 'completed' })
    mockGet
      .mockResolvedValueOnce({ data: scanning })
      .mockResolvedValueOnce({ data: completed })

    const { result } = renderHook(() => useAudit('audit-1'))
    await waitFor(() => expect(result.current.audit?.status).toBe('scanning'))

    await act(async () => { vi.advanceTimersByTime(3000) })
    await waitFor(() => expect(result.current.audit?.status).toBe('completed'))

    const callCountAfterCompletion = mockGet.mock.calls.length
    await act(async () => { vi.advanceTimersByTime(9000) })
    // No more calls after completion
    expect(mockGet.mock.calls.length).toBe(callCountAfterCompletion)
  })
})
