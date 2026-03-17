import { useState, useEffect } from 'react'
import { auditApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { Audit } from '@/types'

export function useAudits() {
  const { user } = useAuth()
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchAudits()
  }, [user])

  const fetchAudits = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await auditApi.list()
    if (error) {
      setError(error)
    } else if (data) {
      setAudits(data as Audit[])
    }
    setLoading(false)
  }

  return { audits, loading, error, refetch: fetchAudits }
}
