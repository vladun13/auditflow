import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/hooks/useCredits'
import { Sidebar } from '@/components/sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function DashboardLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const { credits } = useCredits()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
          <div />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Credits:</span>
              <Badge variant="secondary" className="font-semibold">
                {credits ?? '—'}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/pricing')}
            >
              Buy Credits
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
