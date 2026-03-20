import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
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

export function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, updatePassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(newPassword)
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      navigate('/login')
    }
  }

  const isReady = newPassword.length > 0 && confirmPassword.length > 0

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
      <div className="relative z-10 flex w-full max-w-[427px] flex-col gap-12 px-6">
        {/* Heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-[2.375rem] font-semibold leading-[46px] text-gray-900">
            Change your password
          </h1>
          <p className="text-base text-gray-800 leading-6">
            Provide a new password for<br />
            <span className="font-semibold">{user?.email ?? 'your account'}:</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="new-password" className="px-1 text-sm text-gray-900">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showNew ? <Eye className="h-4 w-4 text-[#4F46E5]" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm-password" className="px-1 text-sm text-gray-900">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showConfirm ? <Eye className="h-4 w-4 text-[#4F46E5]" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !isReady}
            className="w-full rounded-full h-10 text-sm font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border disabled:border-gray-200"
          >
            {loading ? 'Saving…' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  )
}
