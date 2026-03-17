import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

// API client helper
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add authorization header if user is logged in
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Include cookies
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || 'An error occurred' }
    }

    return { data }
  } catch (error) {
    return { error: 'Network error. Please try again.' }
  }
}

// Audit API
export const auditApi = {
  create: async (websiteUrl: string, crawlDepth: number) => {
    return apiCall('/api/audits/create', {
      method: 'POST',
      body: JSON.stringify({ website_url: websiteUrl, crawl_depth: crawlDepth }),
    })
  },

  startScan: async (auditId: string) => {
    return apiCall(`/api/audits/${auditId}/scan`, {
      method: 'POST',
    })
  },

  get: async (auditId: string) => {
    return apiCall(`/api/audits/${auditId}`)
  },

  list: async () => {
    return apiCall('/api/audits')
  },

  delete: async (auditId: string) => {
    return apiCall(`/api/audits/${auditId}`, {
      method: 'DELETE',
    })
  },

  downloadPdf: async (auditId: string) => {
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        alert('Please log in to download the report')
        return
      }

      // Fetch PDF with authentication
      const response = await fetch(`${API_URL}/api/audits/${auditId}/report/pdf`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to download PDF')
        return
      }

      // Check if response is JSON (placeholder) or actual PDF
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const data = await response.json()
        alert(data.message || 'PDF generation coming soon')
        return
      }

      // Get the blob
      const blob = await response.blob()

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `auditflow-report-${auditId}.pdf`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('An error occurred while downloading the report')
    }
  },
}

// User API
export const userApi = {
  getCredits: async () => {
    return apiCall('/api/user/credits')
  },
}

// Payment API
export const paymentApi = {
  createCheckout: async (plan: string) => {
    return apiCall('/api/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    })
  },

  confirmPayment: async (sessionId: string) => {
    return apiCall(`/api/payments/success/${sessionId}`)
  },
}
