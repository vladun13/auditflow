import { Link } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

function AuditFlowLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 20V4L10 14V4L17 14V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="mx-auto flex h-20 items-center justify-between px-6 max-w-[1440px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5] text-white">
            <AuditFlowLogo />
          </div>
          <span className="text-sm font-semibold text-gray-900">AuditFlow</span>
        </Link>

        {/* Center nav */}
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

        {/* Auth buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-[#4F46E5]">
                {user.email?.slice(0, 2).toUpperCase()}
              </div>
              <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                Log out
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
