import { Component, type ReactNode, useRef, useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/hooks/useCredits'
import { useIsTablet } from '@/hooks/use-tablet'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Zap, ArrowUpRight, Menu, LayoutDashboard, ScanSearch, FileText, Settings, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { BuyCreditsModal } from '@/components/modals/BuyCreditsModal'

// ── Error boundary ────────────────────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean; message: string }

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-sm font-medium text-gray-900">Something went wrong</p>
          <p className="text-xs text-gray-500">{this.state.message}</p>
          <Button size="sm" onClick={() => this.setState({ hasError: false, message: '' })}>
            Try again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Mobile nav items ──────────────────────────────────────────────────────────

const mobileNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/scan',      label: 'New Scan',  icon: ScanSearch },
  { path: '/reports',   label: 'Reports',   icon: FileText },
]

const mobileFooterItems = [
  { path: '/settings', label: 'Settings',       icon: Settings },
  { path: '/help',     label: 'Help & Support',  icon: HelpCircle },
]

// ── Layout ────────────────────────────────────────────────────────────────────

export function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { credits, isAdmin } = useCredits()
  const isTablet = useIsTablet()
  const mainRef = useRef<HTMLDivElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false)

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [location.pathname])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const isActive = (path: string) =>
    path === '/settings'
      ? location.pathname.startsWith('/settings')
      : location.pathname === path

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '?'
  const isFree = !isAdmin && credits !== null && credits <= 1

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop sidebar */}
      <Sidebar forceCollapsed={isTablet} />

      {/* Mobile sidebar drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center border-b border-gray-100 px-4">
            <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5] text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 20V4L10 14V4L17 14V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">AuditFlow</span>
            </Link>
          </div>

          <nav className="flex flex-1 flex-col p-2">
            <ul className="space-y-0.5">
              {mobileNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive(item.path)
                        ? 'bg-indigo-50 text-[#4F46E5]'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-gray-100 p-2">
            <ul className="space-y-0.5">
              {mobileFooterItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive(item.path)
                        ? 'bg-indigo-50 text-[#4F46E5]'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            {/* FREE badge (shown when on free tier) */}
            {isFree && (
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-[#4F46E5]">
                FREE
              </span>
            )}

            {/* Credits badge */}
            <button
              onClick={() => !isAdmin && setBuyCreditsOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Zap className="h-3.5 w-3.5 text-[#4F46E5]" />
              {isAdmin ? (
                <span>Unlimited</span>
              ) : (
                <span>{credits ?? '—'} credit{credits !== 1 ? 's' : ''}</span>
              )}
            </button>

            {/* Upgrade / Buy Credits — hidden for admins */}
            {!isAdmin && (
              <Button
                size="sm"
                onClick={() => setBuyCreditsOpen(true)}
                className="rounded-full bg-[#4F46E5] text-white hover:bg-[#4338CA] text-xs px-4 gap-1"
              >
                {isFree ? (
                  <>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Upgrade
                  </>
                ) : 'Buy Credits'}
              </Button>
            )}

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
        <main ref={mainRef} className="flex-1 overflow-y-auto bg-gray-50/40">
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>

      <BuyCreditsModal
        open={buyCreditsOpen}
        onOpenChange={setBuyCreditsOpen}
        context={isFree ? 'upgrade' : undefined}
      />
    </div>
  )
}
