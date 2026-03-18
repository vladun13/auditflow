import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/hooks/useCredits'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

export function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { credits } = useCredits()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">
          <div />

          <div className="flex items-center gap-3">
            {/* Credits badge */}
            <button
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Zap className="h-3.5 w-3.5 text-[#4F46E5]" />
              <span>{credits ?? '—'} credit{credits !== 1 ? 's' : ''}</span>
            </button>

            {/* Buy Credits */}
            <Button
              size="sm"
              onClick={() => navigate('/pricing')}
              className="rounded-full bg-[#4F46E5] text-white hover:bg-[#4338CA] text-xs px-4"
            >
              Buy Credits
            </Button>

            {/* Avatar + logout */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-[#4F46E5]">
                {initials}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/40">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
