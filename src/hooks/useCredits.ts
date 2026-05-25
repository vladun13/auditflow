import { useState, useEffect } from 'react'
import { userApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export function useCredits() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [plan, setPlan] = useState<string>('free')
  const [maxPages, setMaxPages] = useState<number>(5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchCredits()
  }, [user])

  const fetchCredits = async () => {
    setLoading(true)
    const { data, error } = await userApi.getCredits()
    if (error) {
      setError(error)
    } else if (data) {
      const d = data as { credits: number | null; isAdmin?: boolean; plan?: string; max_pages_per_scan?: number }
      setCredits(d.credits)
      setIsAdmin(d.isAdmin === true)
      setPlan(d.plan ?? 'free')
      setMaxPages(d.max_pages_per_scan ?? 5)
    }
    setLoading(false)
  }

  const isUnlimited = isAdmin || maxPages === 0

  return { credits, isAdmin, plan, maxPages, isUnlimited, loading, error, refetch: fetchCredits }
}
