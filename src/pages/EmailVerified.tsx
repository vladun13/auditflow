import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export function EmailVerified() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding')
    }, 2500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white">
      {/* Gradient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-400/30 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-violet-300/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-pink-300/20 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="absolute left-6 top-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5] text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 20V4L10 14V4L17 14V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">AuditFlow</span>
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
        {/* Illustration */}
        <div className="flex items-center justify-center">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Envelope */}
            <rect x="30" y="70" width="140" height="100" rx="12" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="2"/>
            <path d="M30 82L100 128L170 82" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
            {/* Shield */}
            <circle cx="100" cy="65" r="36" fill="#4F46E5"/>
            <path d="M100 40C100 40 120 46 120 65C120 78 112 87 100 90C88 87 80 78 80 65C80 46 100 40 100 40Z" fill="#4F46E5" stroke="#818CF8" strokeWidth="1"/>
            <path d="M88 65L96 73L113 56" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Gear decorations */}
            <circle cx="48" cy="60" r="16" fill="none" stroke="#E0E7FF" strokeWidth="2"/>
            <circle cx="48" cy="60" r="6" fill="#E0E7FF"/>
            <circle cx="152" cy="56" r="12" fill="none" stroke="#EDE9FE" strokeWidth="2"/>
            <circle cx="152" cy="56" r="5" fill="#EDE9FE"/>
            {/* Stars */}
            <circle cx="62" cy="160" r="4" fill="#C7D2FE"/>
            <circle cx="140" cy="160" r="4" fill="#C7D2FE"/>
            <circle cx="100" cy="175" r="3" fill="#DDD6FE"/>
            <circle cx="78" cy="168" r="2.5" fill="#E0E7FF"/>
            <circle cx="122" cy="168" r="2.5" fill="#E0E7FF"/>
          </svg>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verified</h1>
          <p className="text-sm text-gray-400">Redirecting...</p>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-[#4F46E5]"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
