import { useState, useEffect } from 'react'
import { paymentApi, userApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { Payment, CreditHistory } from '@/types'

export function usePayments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetchPayments()
  }, [user])

  const fetchPayments = async () => {
    setLoading(true)
    const { data, error } = await paymentApi.getHistory()
    if (error) setError(error)
    else if (data) setPayments(data as Payment[])
    setLoading(false)
  }

  return { payments, loading, error, refetch: fetchPayments }
}

export function useCreditHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState<CreditHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetchHistory()
  }, [user])

  const fetchHistory = async () => {
    setLoading(true)
    const { data, error } = await userApi.getCreditHistory()
    if (error) setError(error)
    else if (data) setHistory(data as CreditHistory[])
    setLoading(false)
  }

  return { history, loading, error, refetch: fetchHistory }
}
