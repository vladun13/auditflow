import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    let redirected = false

    const redirect = (to: string) => {
      if (!redirected) {
        redirected = true
        navigate(to, { replace: true })
      }
    }

    // Subscribe first so we don't miss the event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        redirect('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        redirect('/')
      }
    })

    // Also check if session is already available
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) redirect('/dashboard')
    })

    // Safety timeout
    const timeout = setTimeout(() => redirect('/'), 8000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  )
}
