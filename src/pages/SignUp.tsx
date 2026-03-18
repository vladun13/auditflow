import { useState, useRef } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Globe, Shield } from 'lucide-react'

type Step = 'form' | 'verify'

export function SignUp() {
  const [step, setStep] = useState<Step>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password)
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setStep('verify')
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
    if (newOtp.every((d) => d) && newOtp.join('').length === 6) {
      navigate('/dashboard')
    }
  }

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — form / verify */}
      <div className="flex w-full flex-col justify-center px-8 py-12 sm:px-12 lg:w-[45%] lg:px-16">
        {/* Logo */}
        <Link to="/" className="mb-12 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5] text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 20V4L10 14V4L17 14V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">AuditFlow</span>
        </Link>

        {step === 'form' ? (
          <div className="max-w-sm">
            <h1 className="mb-1.5 text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="mb-8 text-sm text-gray-500">Start auditing websites for accessibility</p>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Placeholder"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                  required
                />
              </div>

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

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Placeholder"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">Min 8 characters</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg py-2.5 text-sm font-medium"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#4F46E5] hover:text-[#4338CA]">
                Log in
              </Link>
            </p>
          </div>
        ) : (
          <div className="max-w-sm">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
              <svg className="h-7 w-7 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="mb-1.5 text-2xl font-bold text-gray-900">Check your email for a code</h1>
            <p className="mb-8 text-sm text-gray-500">
              We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-2 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-12 w-full rounded-lg border border-gray-200 bg-gray-50 text-center text-base font-semibold text-gray-900 focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                />
              ))}
            </div>

            <Button
              onClick={() => navigate('/dashboard')}
              disabled={loading || otp.some((d) => !d)}
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg py-2.5 text-sm font-medium"
            >
              Verify Email
            </Button>

            <p className="mt-4 text-center text-xs text-gray-500">
              Didn't receive it?{' '}
              <button
                type="button"
                onClick={() => signUp(email, password)}
                className="font-medium text-[#4F46E5] hover:text-[#4338CA]"
              >
                Resend code
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Right — decorative panel */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[55%] flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500" />
        <div className="absolute inset-0 bg-gradient-to-tl from-pink-400/40 via-transparent to-transparent" />
        <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-pink-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-4 px-12">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
            <Shield className="h-8 w-8 text-white" />
          </div>

          <div className="w-72 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 shadow-2xl">
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2">
              <Globe className="h-3.5 w-3.5 text-white/70" />
              <span className="text-xs text-white/70">https://example.com</span>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2">
              <div className="h-2 rounded bg-white/30" />
              <div className="h-2 rounded bg-white/20" />
              <div className="h-2 rounded bg-white/20" />
            </div>
            <div className="mb-3 space-y-1.5">
              <div className="h-2 w-full rounded bg-white/20" />
              <div className="h-2 w-4/5 rounded bg-white/20" />
              <div className="h-2 w-3/5 rounded bg-white/20" />
            </div>
            <div className="mb-3 h-1.5 w-full rounded-full bg-white/20">
              <div className="h-full w-2/5 rounded-full bg-white/70" />
            </div>
            <Button size="sm" className="w-full bg-white/90 text-indigo-700 hover:bg-white text-xs rounded-lg">
              Start Scanning
            </Button>
          </div>

          <div className="flex w-72 items-center gap-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 shadow-xl">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-white">Email for free</p>
              <p className="text-xs text-white/60">Get started in seconds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
