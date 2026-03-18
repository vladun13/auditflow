import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronDown, Globe, Shield, BarChart2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ROLES = [
  'Frontend Developer',
  'Full-Stack Developer',
  'QA Engineer',
  'Product Manager',
  'Designer / UX',
  'Accessibility Specialist',
  'Other',
]

const SCANNING_OPTIONS = [
  'My company\'s website',
  'A client\'s website',
  'A side project',
  'Learning / Research',
  'Compliance audit',
]

const GOALS = [
  'Achieve WCAG compliance',
  'Improve user experience',
  'Meet legal requirements',
  'Fix specific issues',
  'Regular monitoring',
]

function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-gray-700">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3.5 py-2.5 bg-gray-50 text-sm text-left cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-colors"
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || 'Select'}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className="w-full text-left px-3.5 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-[#4F46E5] transition-colors cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DecorativePanel() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 40%, #c084fc 70%, #f0abfc 100%)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-pink-400/30" />
      <div className="absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 h-48 w-48 rounded-full bg-pink-300/20 blur-3xl" />

      <div className="relative h-full flex flex-col items-center justify-center gap-5 p-12">
        {/* Globe icon card */}
        <div className="flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl w-16 h-16 shadow-xl">
          <Globe className="h-8 w-8 text-white" />
        </div>

        {/* URL scan mockup */}
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <Globe className="h-4 w-4 text-white/60 shrink-0" />
            <span className="text-sm text-white/80 font-mono">https://example.com</span>
          </div>
          <div className="p-4 space-y-2">
            <div className="h-2 rounded-full bg-white/20 w-full" />
            <div className="h-2 rounded-full bg-white/15 w-4/5" />
            <div className="h-2 rounded-full bg-white/10 w-3/5" />
          </div>
          <div className="px-4 pb-4">
            <div className="h-1.5 w-full bg-white/20 rounded-full">
              <div className="h-full w-2/5 bg-white/70 rounded-full" />
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-white/60">Service cost:</span>
              <div className="flex gap-1.5 items-center">
                <Zap className="h-3.5 w-3.5 text-purple-200" />
                <div className="h-2 w-14 rounded-full bg-purple-300/70" />
                <div className="h-2 w-14 rounded-full bg-purple-200/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Stat badges */}
        <div className="flex gap-3">
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-white" />
            <span className="text-xs text-white font-medium">WCAG 2.1</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-white" />
            <span className="text-xs text-white font-medium">AI Reports</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Onboarding() {
  const navigate = useNavigate()
  const [role, setRole] = useState('')
  const [scanning, setScanning] = useState('')
  const [goal, setGoal] = useState('')

  const canContinue = role && scanning && goal

  const handleContinue = () => {
    localStorage.setItem('onboarding_answers', JSON.stringify({ role, scanning, goal }))
    navigate('/tutorial')
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding_complete', 'true')
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex w-full flex-col px-10 py-10 lg:w-[42%] lg:px-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-12">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5] text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 20V4L10 14V4L17 14V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">AuditFlow</span>
        </Link>

        <div className="max-w-sm flex-1 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tell us about your work</h1>
          <p className="text-sm text-gray-500 mb-10">
            Your input helps us prioritize what matters most in your audit results.
          </p>

          <div className="space-y-5 mb-8">
            <SelectField
              label="What's your role?"
              options={ROLES}
              value={role}
              onChange={setRole}
            />
            <SelectField
              label="What are you scanning today?"
              options={SCANNING_OPTIONS}
              value={scanning}
              onChange={setScanning}
            />
            <SelectField
              label="What's your primary goal?"
              options={GOALS}
              value={goal}
              onChange={setGoal}
            />
          </div>

          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-full h-10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </Button>

          <button
            type="button"
            onClick={handleSkip}
            className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Right — decorative */}
      <div className="hidden lg:flex lg:flex-1 p-4">
        <DecorativePanel />
      </div>
    </div>
  )
}
