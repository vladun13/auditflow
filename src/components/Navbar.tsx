import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Bell, ChevronDown, ChevronUp, Zap, Settings, Tag,
  Monitor, HelpCircle, LogOut, Sun, Moon, Ban,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useCredits } from "@/hooks/useCredits"
import { BuyCreditsModal } from "@/components/modals/BuyCreditsModal"

// ── Shared ─────────────────────────────────────────────────────────────────────

function AuditFlowLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 20V4L10 14V4L17 14V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoMark() {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5] text-white">
        <AuditFlowLogo />
      </div>
      <span className="text-sm font-semibold text-gray-900">AuditFlow</span>
    </Link>
  )
}

// ── Credits Panel ──────────────────────────────────────────────────────────────

const CREDITS_FAQS = [
  {
    q: "What uses credits?",
    a: [
      "Each accessibility scan consumes 1 credit, regardless of crawl depth.",
      "PDF report generation is included free with every scan.",
      "Credits never expire — use them whenever you need.",
    ],
  },
  {
    q: "How many credits do I get?",
    a: ["New accounts receive 1 free credit to run your first scan. Additional credits are purchased in packs."],
  },
  {
    q: "How can I earn more credits?",
    a: ["Purchase credit packs (Basic, Pro, or Enterprise) from the Pricing page at any time."],
  },
  {
    q: "Is my personal information safe?",
    a: ["Yes. We use Supabase for auth with row-level security. Payment data is handled by LemonSqueezy and never stored on our servers."],
  },
  {
    q: "How can we get in touch?",
    a: ["Reach us at support@auditflow.app. We reply within one business day."],
  },
]

function CreditsPanel({ credits, onBuyCredits }: { credits: number | null; onBuyCredits: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="w-[360px] rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
      {/* Balance header */}
      <div className="bg-indigo-50 px-5 pt-5 pb-5">
        <p className="text-xs text-gray-500 text-center mb-2">Your account balance</p>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#4F46E5]">
            <Zap className="h-4 w-4 text-white fill-white" />
          </span>
          <span className="text-5xl font-bold text-gray-900 leading-none">
            {credits ?? "—"}
          </span>
          <span className="text-lg text-gray-500 self-end pb-1">credits</span>
        </div>
        <button
          type="button"
          onClick={onBuyCredits}
          className="w-full rounded-full bg-white border border-gray-200 h-10 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
        >
          Buy more credits
        </button>
      </div>

      {/* FAQ section */}
      <div className="px-5 py-4">
        <h3 className="text-base font-bold text-gray-900 mb-1">Credits</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4">
          Credits power your scans. Each scan costs 1 credit and includes AI-generated fix instructions.
        </p>
        <div className="flex flex-col divide-y divide-gray-100">
          {CREDITS_FAQS.map((faq, i) => (
            <div key={i}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-800 text-left cursor-pointer hover:text-gray-900 transition-colors"
              >
                {faq.q}
                {openFaq === i
                  ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                  : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                }
              </button>
              {openFaq === i && (
                <ul className="pb-3 pl-2 flex flex-col gap-2">
                  {faq.a.map((line, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                      {line}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Notifications Panel ────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS = [
  { id: 1, title: "Scan completed", body: "Your scan of example.com finished with 8 accessibility issues found.", time: "2:14 AM", unread: true },
  { id: 2, title: "Credits running low", body: "You have 1 credit remaining. Top up to keep scanning without interruption.", time: "Yesterday", unread: true },
  { id: 3, title: "Scan completed", body: "Your scan of mysite.io is complete. 0 critical issues detected.", time: "Mar 19", unread: false },
  { id: 4, title: "Welcome to AuditFlow", body: "You received 1 free credit. Run your first accessibility scan now.", time: "Mar 18", unread: false },
]

function NotificationsPanel() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))

  return (
    <div className="w-[380px] rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900">Notifications</h3>
        <button
          type="button"
          onClick={markAllRead}
          className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer"
        >
          Mark all as read
        </button>
      </div>
      <div className="max-h-[440px] overflow-y-auto divide-y divide-gray-50">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-sm font-semibold text-[#4F46E5]">
              AF
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{n.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed mt-0.5">{n.body}</p>
              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
            </div>
            {n.unread && (
              <span className="mt-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Profile Panel ──────────────────────────────────────────────────────────────

type Theme = "light" | "dark" | "system"

function ProfilePanel({ avatarUrl, initials, displayName, email, onClose }: {
  avatarUrl?: string
  initials: string
  displayName: string
  email: string
  onClose: () => void
}) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [theme, setTheme] = useState<Theme>("system")

  const go = (path: string) => { onClose(); navigate(path) }

  return (
    <div className="w-[280px] rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
      {/* Avatar + name */}
      <div className="flex flex-col items-center pt-6 pb-5 px-5 border-b border-gray-100">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover mb-3" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-[#4F46E5] mb-3">
            {initials}
          </div>
        )}
        <p className="text-sm font-bold text-gray-900">{displayName}</p>
        <p className="text-xs text-gray-500 mt-0.5">{email}</p>
      </div>

      {/* Menu items */}
      <div className="py-2">
        <button
          type="button"
          onClick={() => go("/settings/account")}
          className="flex items-center gap-3 w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4 text-gray-400" />
          Settings
        </button>
        <button
          type="button"
          onClick={() => go("/pricing")}
          className="flex items-center gap-3 w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Tag className="h-4 w-4 text-gray-400" />
          Pricing
        </button>

        {/* Theme */}
        <div className="flex items-center gap-3 w-full px-5 py-3">
          <Monitor className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-700 flex-1">Theme</span>
          <div className="flex items-center gap-1">
            {(["light", "dark", "system"] as Theme[]).map((t) => {
              const Icon = t === "light" ? Sun : t === "dark" ? Moon : Ban
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer ${
                    theme === t ? "bg-indigo-100 text-[#4F46E5]" : "text-gray-400 hover:bg-gray-100"
                  }`}
                  title={t.charAt(0).toUpperCase() + t.slice(1)}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-3 w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <HelpCircle className="h-4 w-4 text-gray-400" />
          Help
        </button>

        <div className="border-t border-gray-100 mt-1 pt-1">
          <button
            type="button"
            onClick={() => { onClose(); signOut() }}
            className="flex items-center gap-3 w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-gray-400" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Logged-in Navbar ──────────────────────────────────────────────────────────

type Panel = "credits" | "notifications" | "profile" | null

function LoggedInNavbar({ credits }: { credits: number | null }) {
  const location = useLocation()
  const isHome = location.pathname === "/"
  const { user } = useAuth()
  const [openPanel, setOpenPanel] = useState<Panel>(null)
  const [showBuyCredits, setShowBuyCredits] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "?"
  const displayName = (user?.user_metadata?.full_name as string | undefined) || user?.email?.split("@")[0] || "User"
  const email = user?.email ?? ""
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenPanel(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const toggle = (panel: Panel) =>
    setOpenPanel(prev => (prev === panel ? null : panel))

  return (
    <>
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="mx-auto flex h-16 items-center justify-between px-6 max-w-[1440px]">
          <LogoMark />

          {/* Center nav */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className={`relative pb-4 -mb-4 text-sm font-medium transition-colors ${
                isHome ? "text-[#4F46E5]" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Home
              {isHome && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F46E5] rounded-full" />}
            </Link>
            <Link to="/dashboard" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
              Audit Dashboard
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Credits button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggle("credits")}
                className={`inline-flex items-center gap-1.5 rounded-full border h-9 px-4 text-sm transition-colors cursor-pointer ${
                  openPanel === "credits"
                    ? "border-indigo-300 bg-indigo-50 text-[#4F46E5]"
                    : "border-indigo-200 bg-white text-gray-700 hover:bg-indigo-50"
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-[#4F46E5] fill-[#4F46E5]" />
                {credits !== null ? `${credits} credits` : "— credits"}
              </button>
              {openPanel === "credits" && (
                <div className="absolute top-full right-0 mt-3">
                  <CreditsPanel
                    credits={credits}
                    onBuyCredits={() => { setOpenPanel(null); setShowBuyCredits(true) }}
                  />
                </div>
              )}
            </div>

            {/* Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggle("notifications")}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer ${
                  openPanel === "notifications" ? "bg-gray-100" : "hover:bg-gray-100"
                }`}
              >
                <Bell className={`h-5 w-5 ${openPanel === "notifications" ? "text-gray-900" : "text-gray-600"}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>
              {openPanel === "notifications" && (
                <div className="absolute top-full right-0 mt-3">
                  <NotificationsPanel />
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggle("profile")}
                className="cursor-pointer rounded-full ring-2 ring-transparent hover:ring-indigo-200 transition-all"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-[#4F46E5]">
                    {initials}
                  </div>
                )}
              </button>
              {openPanel === "profile" && (
                <div className="absolute top-full right-0 mt-3">
                  <ProfilePanel
                    avatarUrl={avatarUrl}
                    initials={initials}
                    displayName={displayName}
                    email={email}
                    onClose={() => setOpenPanel(null)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <BuyCreditsModal open={showBuyCredits} onOpenChange={setShowBuyCredits} />
    </>
  )
}

// ── Public Navbar ─────────────────────────────────────────────────────────────

export function Navbar() {
  const { user } = useAuth()
  const { credits } = useCredits()

  if (user) return <LoggedInNavbar credits={credits} />

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="mx-auto flex h-20 items-center justify-between px-6 max-w-[1440px]">
        <LogoMark />

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
            Product <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </a>
          <a href="#solutions" className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
            Solutions <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </a>
          <Link to="/pricing" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
            Pricing
          </Link>
          <a href="#resources" className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
            Resources <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </a>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/login"
            className="inline-flex h-10 items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm text-gray-800 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#4F46E5] hover:bg-[#4338CA] px-6 text-sm font-medium text-white transition-colors shadow-sm"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </nav>
  )
}
