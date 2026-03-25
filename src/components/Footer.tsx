import { useState } from 'react'
import { Link } from 'react-router-dom'

function AuditFlowLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 20V4L10 14V4L17 14V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

type FooterLink = { label: string; href: string; comingSoon?: boolean }

const footerLinks: Record<string, FooterLink[]> = {
  Product: [
    { label: 'Demo', href: '#demo' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'API', href: '#', comingSoon: true },
  ],
  Resources: [
    { label: 'Blog', href: '#' },
    { label: 'Community', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Accessibility Statement', href: '#' },
    { label: 'Font Statement', href: '#' },
  ],
}

function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
    }
  }

  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-gray-700 mb-2">Get notified when API launches</p>
      {submitted ? (
        <p className="text-xs text-[#4F46E5]">You're on the list!</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-[#4F46E5] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4338CA] transition-colors"
          >
            Notify me
          </button>
        </form>
      )}
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5] text-white">
                <AuditFlowLogo />
              </div>
              <span className="text-sm font-semibold text-gray-900">AuditFlow</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Automated accessibility audits and AI-powered fix recommendations for modern web applications.
            </p>
            <NewsletterSignup />
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-900">
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.comingSoon ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-400 cursor-default select-none">
                        {link.label}
                        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 leading-none">
                          Soon
                        </span>
                      </span>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-gray-500 transition-colors duration-200 hover:text-gray-900"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-gray-100 pt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} AuditFlow. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
