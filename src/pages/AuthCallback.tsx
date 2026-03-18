import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Try to get the session — Supabase processes the hash automatically
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard', { replace: true })
        return
      }
      // Fallback: wait for the auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          navigate('/dashboard', { replace: true })
        } else if (event === 'SIGNED_OUT') {
          navigate('/', { replace: true })
        }
      })
      // Timeout fallback — if nothing happens in 5s, go home
      const timeout = setTimeout(() => {
        navigate('/', { replace: true })
      }, 5000)
      return () => {
        subscription.unsubscribe()
        clearTimeout(timeout)
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  )
}
