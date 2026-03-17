import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    const { error } = await resetPassword(email)
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 sm:px-12 lg:w-[45%] lg:px-16">
        <Link to="/" className="mb-12 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5] text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 20V4L10 14V4L17 14V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">AuditFlow</span>
        </Link>

        <div className="max-w-sm">
          {success ? (
            <>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="mb-1.5 text-2xl font-bold text-gray-900">Check your email</h1>
              <p className="mb-8 text-sm text-gray-500">
                We sent a reset link to <span className="font-medium text-gray-700">{email}</span>. The link is valid for 24 hours.
              </p>
              <Link to="/login">
                <Button className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg py-2.5 text-sm font-medium">
                  Back to Log In
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h1 className="mb-1.5 text-2xl font-bold text-gray-900">Reset Password</h1>
              <p className="mb-8 text-sm text-gray-500">We'll send you a reset link</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Placeholder"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg py-2.5 text-sm font-medium"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-xs text-gray-500">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-[#4F46E5] hover:text-[#4338CA]">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right — decorative panel */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[55%] flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500" />
        <div className="absolute inset-0 bg-gradient-to-tl from-pink-400/40 via-transparent to-transparent" />
        <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-pink-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-4 px-12">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
            <Globe className="h-8 w-8 text-white" />
          </div>

          <div className="w-72 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 shadow-2xl">
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2">
              <Globe className="h-3.5 w-3.5 text-white/70" />
              <span className="text-xs text-white/70">https://example.com</span>
            </div>
            <div className="mb-3 space-y-1.5">
              <div className="h-2 w-full rounded bg-white/20" />
              <div className="h-2 w-4/5 rounded bg-white/20" />
              <div className="h-2 w-3/5 rounded bg-white/20" />
            </div>
            <div className="mb-3 h-1.5 w-full rounded-full bg-white/20">
              <div className="h-full w-3/5 rounded-full bg-white/70" />
            </div>
            <Button size="sm" className="w-full bg-white/90 text-indigo-700 hover:bg-white text-xs rounded-lg">
              Start Scanning
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
