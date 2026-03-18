import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auditApi, userApi, paymentApi } from './api'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockOkResponse(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  } as Response)
}

function mockErrorResponse(status: number, error: string) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error }),
    status,
  } as Response)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── auditApi ─────────────────────────────────────────────────────────────────

describe('auditApi', () => {
  describe('list', () => {
    it('calls GET /api/audits', async () => {
      mockOkResponse([])
      const result = await auditApi.list()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/audits'),
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) }),
      )
      expect(result.data).toEqual([])
    })
  })

  describe('create', () => {
    it('calls POST /api/audits/create with url and depth', async () => {
      mockOkResponse({ audit_id: 'abc-123' })
      const result = await auditApi.create('https://example.com', 3)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/audits/create'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ website_url: 'https://example.com', crawl_depth: 3 }),
        }),
      )
      expect(result.data).toEqual({ audit_id: 'abc-123' })
    })
  })

  describe('get', () => {
    it('calls GET /api/audits/:id', async () => {
      mockOkResponse({ id: 'audit-1', status: 'completed' })
      const result = await auditApi.get('audit-1')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/audits/audit-1'),
        expect.anything(),
      )
      expect((result.data as { id: string }).id).toBe('audit-1')
    })
  })

  describe('startScan', () => {
    it('calls POST /api/audits/:id/scan', async () => {
      mockOkResponse({ started: true })
      await auditApi.startScan('audit-1')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/audits/audit-1/scan'),
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  describe('delete', () => {
    it('calls DELETE /api/audits/:id', async () => {
      mockOkResponse({ deleted: true })
      await auditApi.delete('audit-1')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/audits/audit-1'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })
  })

  describe('error handling', () => {
    it('returns error string on non-ok response', async () => {
      mockErrorResponse(400, 'Invalid URL')
      const result = await auditApi.create('not-a-url', 1)
      expect(result.error).toBe('Invalid URL')
      expect(result.data).toBeUndefined()
    })

    it('returns network error message on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'))
      const result = await auditApi.list()
      expect(result.error).toBe('Network error. Please try again.')
    })
  })
})

// ─── userApi ──────────────────────────────────────────────────────────────────

describe('userApi', () => {
  it('getCredits calls GET /api/user/credits', async () => {
    mockOkResponse({ credits: 5 })
    const result = await userApi.getCredits()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/credits'),
      expect.anything(),
    )
    expect(result.data).toEqual({ credits: 5 })
  })

  it('getProfile calls GET /api/user/profile', async () => {
    mockOkResponse({ full_name: 'Test User' })
    const result = await userApi.getProfile()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/profile'),
      expect.anything(),
    )
    expect(result.data).toEqual({ full_name: 'Test User' })
  })

  it('updateProfile calls PUT /api/user/profile with body', async () => {
    mockOkResponse({ updated: true })
    await userApi.updateProfile({ full_name: 'New Name' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/profile'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ full_name: 'New Name' }),
      }),
    )
  })

  it('updatePassword calls PUT /api/user/password with body', async () => {
    mockOkResponse({ updated: true })
    await userApi.updatePassword('oldpass', 'newpass')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/password'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ current_password: 'oldpass', new_password: 'newpass' }),
      }),
    )
  })

  it('getCreditHistory calls GET /api/user/credit-history', async () => {
    mockOkResponse([])
    const result = await userApi.getCreditHistory()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/credit-history'),
      expect.anything(),
    )
    expect(result.data).toEqual([])
  })
})

// ─── paymentApi ───────────────────────────────────────────────────────────────

describe('paymentApi', () => {
  it('createCheckout calls POST /api/payments/checkout with plan', async () => {
    mockOkResponse({ url: 'https://checkout.lemonsqueezy.com/pay/xyz' })
    const result = await paymentApi.createCheckout('pro')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/payments/checkout'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ plan: 'pro' }),
      }),
    )
    expect((result.data as { url: string }).url).toContain('lemonsqueezy')
  })

  it('getHistory calls GET /api/payments/history', async () => {
    mockOkResponse([{ id: 'pay-1', amount: 29900, plan: 'pro', status: 'completed' }])
    const result = await paymentApi.getHistory()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/payments/history'),
      expect.anything(),
    )
    expect(Array.isArray(result.data)).toBe(true)
  })
})
