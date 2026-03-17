import { useState, useEffect, useRef } from 'react'
import { auditApi } from '@/lib/api'
import type { Audit } from '@/types'

export function useAudit(id: string | undefined) {
  const [audit, setAudit] = useState<Audit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!id) return
    fetchAudit()

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [id])

  // Start or stop polling based on scan status
  useEffect(() => {
    if (audit?.status === 'scanning') {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(fetchAudit, 3000)
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [audit?.status])

  const fetchAudit = async () => {
    if (!id) return
    const { data, error } = await auditApi.get(id)
    if (error) {
      setError(error)
    } else if (data) {
      setAudit(data as Audit)
    }
    setLoading(false)
  }

  return { audit, loading, error, refetch: fetchAudit }
}
