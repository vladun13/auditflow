import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

function AuditFlowLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 20V4L10 14V4L17 14V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5] text-white">
            <AuditFlowLogo />
          </div>
          <span className="text-sm font-semibold text-gray-900">AuditFlow</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Features
          </a>
          <a href="#contact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Contact
          </a>
          <Link to="/pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            News
          </Link>
          <a href="#resources" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Resources
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Login
          </Link>
          <Link to="/signup">
            <Button size="sm" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-full px-4 text-sm">
              Get Free Scan
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
