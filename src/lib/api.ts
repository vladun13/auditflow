import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || 'An error occurred' }
    }

    return { data }
  } catch {
    return { error: 'Network error. Please try again.' }
  }
}

// ─── Audit API ────────────────────────────────────────────────────────────────

export const auditApi = {
  create: (websiteUrl: string, crawlDepth: number) =>
    apiCall('/api/audits/create', {
      method: 'POST',
      body: JSON.stringify({ website_url: websiteUrl, crawl_depth: crawlDepth }),
    }),

  startScan: (auditId: string) =>
    apiCall(`/api/audits/${auditId}/scan`, { method: 'POST' }),

  get: (auditId: string) =>
    apiCall(`/api/audits/${auditId}`),

  list: () =>
    apiCall('/api/audits'),

  delete: (auditId: string) =>
    apiCall(`/api/audits/${auditId}`, { method: 'DELETE' }),

  rescan: (auditId: string) =>
    apiCall(`/api/audits/${auditId}/rescan`, { method: 'POST' }),

  share: (auditId: string) =>
    apiCall(`/api/audits/${auditId}/share`, { method: 'POST' }),

  downloadPdf: async (auditId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return { error: 'Please log in to download the report' }
      }

      const response = await fetch(`${API_URL}/api/audits/${auditId}/report/pdf`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { error: errorData.error || 'Failed to download PDF' }
      }

      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const data = await response.json()
        return { error: data.message || 'PDF generation coming soon' }
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `auditflow-report-${auditId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      return { data: true }
    } catch {
      return { error: 'An error occurred while downloading the report' }
    }
  },
}

// ─── User API ─────────────────────────────────────────────────────────────────

export const userApi = {
  getCredits: () =>
    apiCall('/api/user/credits'),

  getProfile: () =>
    apiCall('/api/user/profile'),

  updateProfile: (profile: { full_name?: string; email?: string }) =>
    apiCall('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiCall('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),

  getCreditHistory: () =>
    apiCall('/api/user/credit-history'),
}

// ─── Payment API ──────────────────────────────────────────────────────────────

export const paymentApi = {
  createCheckout: (plan: string) =>
    apiCall('/api/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }),

  confirmPayment: (sessionId: string) =>
    apiCall(`/api/payments/success/${sessionId}`),

  getHistory: () =>
    apiCall('/api/payments/history'),

  getSubscription: () =>
    apiCall('/api/payments/subscription'),
}
