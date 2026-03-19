import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

function GradientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-400/30 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-violet-300/25 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-pink-300/20 blur-3xl" />
    </div>
  )
}

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white">
      <GradientBackground />

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

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-[480px] flex-col items-center gap-12 px-6">
        {success ? (
          /* Success state — Screen 3 */
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-[2.375rem] font-semibold leading-[46px] text-gray-900">
              Reset your password
            </h1>
            <Link
              to="/login"
              className="flex items-center gap-2 text-base font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
            <p className="mt-1 text-base text-gray-800 text-center leading-6">
              If an account exists with that email, you'll get<br />
              a message in your inbox soon!
            </p>
          </div>
        ) : (
          /* Form state — Screens 1 & 2 */
          <>
            <div className="flex flex-col items-center gap-3 text-center">
              <h1 className="text-[2.375rem] font-semibold leading-[46px] text-gray-900">
                Reset your password
              </h1>
              <Link
                to="/login"
                className="flex items-center gap-2 text-base font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-12">
              <div className="flex flex-col gap-6">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="px-1 text-sm text-gray-900">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-full h-10 text-sm font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border disabled:border-gray-200"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
