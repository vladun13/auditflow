import { useState, useRef } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, ChevronLeft } from 'lucide-react'
import { AuthIllustration } from '@/components/AuthIllustration'

function AuditFlowLogo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5] text-white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 20V4L10 14V4L17 14V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="text-sm font-semibold text-gray-900">AuditFlow</span>
    </Link>
  )
}

function GradientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-400/30 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-violet-300/25 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-pink-300/20 blur-3xl" />
    </div>
  )
}

export function SignUp() {
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, verifyOtp, signInWithGoogle } = useAuth()
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
      navigate('/onboarding')
    }
  }

  const handleVerify = async (token: string) => {
    setLoading(true)
    setError('')
    const { error } = await verifyOtp(email, token)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/onboarding')
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
    if (newOtp.every((d) => d) && newOtp.join('').length === 6) handleVerify(newOtp.join(''))
  }

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus()
  }

  // OTP verification — full-page centered with gradient blobs (Figma: 210:58719)
  if (step === 'verify') {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white">
        <GradientBackground />

        <div className="absolute left-6 top-6">
          <AuditFlowLogo />
        </div>

        <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-8 px-6">
          {/* Back */}
          <button
            type="button"
            onClick={() => setStep('form')}
            className="flex items-center gap-1 text-sm text-[#4F46E5] hover:text-[#4338CA] transition-colors self-start cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Check your email for a code</h1>
            <p className="text-sm text-gray-500">
              We've sent you a code to{' '}
              <span className="font-semibold text-gray-900">{email}</span>
            </p>
          </div>

          {error && (
            <div className="w-full rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* OTP inputs */}
          <div className="flex gap-3">
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
                className="h-16 w-14 rounded-lg border border-gray-200 bg-white text-center text-xl font-semibold text-gray-900 shadow-sm focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 transition-colors"
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-3 w-full">
            <Button
              onClick={() => handleVerify(otp.join(''))}
              disabled={loading || otp.some((d) => !d)}
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-full h-10 text-sm font-medium"
            >
              {loading ? 'Verifying…' : 'Verify Email'}
            </Button>
            <p className="text-sm text-gray-500 text-center">Can't find your code? Check your spam folder!</p>
            <button
              type="button"
              onClick={() => signUp(email, password)}
              className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer"
            >
              Resend to email
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Signup form — 50/50 split (Figma: 210:58704)
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left — form */}
      <div className="flex w-full flex-col lg:w-1/2 overflow-y-auto">
        <div className="flex flex-1 flex-col justify-between px-8 py-12 sm:px-12 lg:px-16">
          <div className="max-w-sm w-full mx-auto flex flex-col flex-1 justify-center">
            <div className="mb-10">
              <AuditFlowLogo />
            </div>

            <h1 className="mb-8 text-3xl font-bold text-gray-900">Create your account</h1>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="mb-5 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative mb-5">
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
                <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-gray-700">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-gray-700">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="company" className="mb-1.5 block text-xs font-medium text-gray-700">Company Name</label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-full h-10 text-sm font-medium mt-2"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#4F46E5] hover:text-[#4338CA]">
                Log in
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="mt-8 text-center text-xs text-gray-400 max-w-sm mx-auto">
            By signing up, you agree to our{' '}
            <a href="/terms" className="underline hover:text-gray-600 transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="underline hover:text-gray-600 transition-colors">Privacy policy</a>.
          </p>
        </div>
      </div>

      {/* Right — illustration */}
      <AuthIllustration />
    </div>
  )
}
