import { useState, useEffect } from 'react'
import { userApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export function useCredits() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
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
      const d = data as { credits: number | null; isAdmin?: boolean }
      setCredits(d.credits)
      setIsAdmin(d.isAdmin === true)
    }
    setLoading(false)
  }

  return { credits, isAdmin, loading, error, refetch: fetchCredits }
}
