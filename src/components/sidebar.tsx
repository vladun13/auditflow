import { cn } from "@/lib/utils"
import { LayoutDashboard, ScanSearch, FileText, Settings, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/scan",      label: "New Scan",  icon: ScanSearch },
  { path: "/reports",   label: "Reports",   icon: FileText },
]

const footerItems = [
  { path: "/settings", label: "Settings",      icon: Settings },
  { path: "/help",     label: "Help & Support", icon: HelpCircle },
]

function AuditFlowLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 20V4L10 14V4L17 14V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const isActive = (path: string) =>
    path === "/settings"
      ? location.pathname.startsWith("/settings")
      : location.pathname === path

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-gray-100 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5] text-white">
              <AuditFlowLogo />
            </div>
            <span className="text-sm font-semibold text-gray-900">AuditFlow</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5] text-white mx-auto">
            <AuditFlowLogo />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors",
            collapsed && "hidden"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 p-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.path)
                    ? "bg-indigo-50 text-[#4F46E5]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer nav */}
      <div className="border-t border-gray-100 p-2">
        <ul className="space-y-0.5">
          {footerItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.path)
                    ? "bg-indigo-50 text-[#4F46E5]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
