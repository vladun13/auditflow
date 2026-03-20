import { Outlet, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { User, Lock, Bell, CreditCard, Receipt, Coins } from 'lucide-react'

const settingsNav = [
  { path: '/settings/account',       label: 'Account',          icon: User },
  { path: '/settings/plans',         label: 'Plans & Credits',  icon: CreditCard },
  { path: '/settings/notifications', label: 'Notifications',    icon: Bell },
  { path: '/settings/security',      label: 'Security',         icon: Lock },
]

export function SettingsLayout() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Left nav */}
        <nav className="w-48 shrink-0">
          <ul className="space-y-1">
            {settingsNav.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Page content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
