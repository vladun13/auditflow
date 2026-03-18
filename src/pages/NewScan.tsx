import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/hooks/useCredits'
import { auditApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Globe, AlertCircle, CheckCircle, Zap, Shield, Check } from 'lucide-react'

const STANDARDS = [
  { id: 'wcag21', label: 'WCAG 2.1', description: 'Web Content Accessibility Guidelines 2.1' },
  { id: 'wcag22', label: 'WCAG 2.2', description: 'Web Content Accessibility Guidelines 2.2' },
  { id: 'ada', label: 'ADA', description: 'Americans with Disabilities Act' },
  { id: 'eaa', label: 'EAA', description: 'European Accessibility Act' },
  { id: 'section508', label: 'Section 508', description: 'US Federal accessibility standard' },
  { id: 'aoda', label: 'AODA', description: 'Accessibility for Ontarians with Disabilities Act' },
]

const CHECKS = [
  'WCAG 2.1 Level A, AA & AAA compliance',
  'Color contrast and visual accessibility',
  'Missing alt text and ARIA labels',
  'Keyboard navigation and focus management',
  'Form labels and input accessibility',
  'Heading structure and landmarks',
]

function ScanIllustration() {
  return (
    <svg width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Browser window */}
      <rect x="20" y="10" width="180" height="120" rx="10" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5"/>
      <rect x="20" y="10" width="180" height="28" rx="10" fill="#E5E7EB"/>
      <rect x="20" y="28" width="180" height="10" fill="#E5E7EB"/>
      {/* Traffic lights */}
      <circle cx="36" cy="24" r="4" fill="#FC8181"/>
      <circle cx="50" cy="24" r="4" fill="#F6AD55"/>
      <circle cx="64" cy="24" r="4" fill="#68D391"/>
      {/* URL bar */}
      <rect x="78" y="17" width="100" height="14" rx="4" fill="#fff"/>
      <rect x="83" y="21" width="60" height="6" rx="2" fill="#D1D5DB"/>
      {/* Content lines */}
      <rect x="35" y="52" width="80" height="8" rx="3" fill="#D1D5DB"/>
      <rect x="35" y="66" width="120" height="6" rx="3" fill="#E5E7EB"/>
      <rect x="35" y="78" width="100" height="6" rx="3" fill="#E5E7EB"/>
      <rect x="35" y="90" width="60" height="6" rx="3" fill="#E5E7EB"/>
      {/* Scan line */}
      <line x1="20" y1="85" x2="200" y2="85" stroke="#4F46E5" strokeWidth="2" strokeDasharray="6 3" opacity="0.6"/>
      {/* Magnifier */}
      <circle cx="165" cy="105" r="22" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2"/>
      <circle cx="165" cy="105" r="14" fill="white" stroke="#C7D2FE" strokeWidth="1.5"/>
      <line x1="181" y1="121" x2="196" y2="136" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round"/>
      {/* Check marks inside magnifier */}
      <path d="M159 105 L163 109 L171 101" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function NewScan() {
  const { user } = useAuth()
  const { credits } = useCredits()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [websiteUrl, setWebsiteUrl] = useState(searchParams.get('url') || '')
  const [crawlDepth, setCrawlDepth] = useState(3)
  const [standards, setStandards] = useState<string[]>(
    searchParams.get('standards')?.split(',').filter(Boolean) || ['wcag21']
  )

  const toggleStandard = (id: string) => {
    setStandards(prev =>
      prev.includes(id)
        ? prev.length === 1 ? prev : prev.filter(s => s !== id)
        : [...prev, id]
    )
  }
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanningText, setScanningText] = useState('Initializing scan...')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!loading) return
    const messages = [
      'Initializing scan...',
      'Crawling website pages...',
      'Running accessibility checks...',
      'Analyzing WCAG violations...',
      'Generating AI recommendations...',
    ]
    let i = 0
    const msgInterval = setInterval(() => {
      i = (i + 1) % messages.length
      setScanningText(messages[i])
    }, 2000)

    const progInterval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 90))
    }, 400)

    return () => {
      clearInterval(msgInterval)
      clearInterval(progInterval)
    }
  }, [loading])

  const validateUrl = (url: string) => {
    try {
      const u = new URL(url)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateUrl(websiteUrl)) {
      setError('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    if (!user) { navigate('/login'); return }

    setLoading(true)
    setProgress(0)

    const { data, error: createError } = await auditApi.create(websiteUrl, crawlDepth)
    if (createError || !data) {
      setError(createError || 'Failed to create audit')
      setLoading(false)
      return
    }

    const auditId = (data as { audit_id: string }).audit_id
    const { error: scanError } = await auditApi.startScan(auditId)

    setLoading(false)

    if (scanError) {
      setError(scanError)
    } else {
      navigate(`/audits/${auditId}`)
    }
  }

  const noCredits = credits !== null && credits === 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-6">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <ScanIllustration />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">We are scanning your website</h2>
          <p className="text-sm text-gray-500 mb-2">{websiteUrl}</p>

          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>{scanningText}</span>
              <span className="font-medium text-gray-700">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Estimated loading time: 2–5 min</p>
          </div>

          <p className="text-xs text-gray-400">
            Scanning up to <strong className="text-gray-600">{crawlDepth} page{crawlDepth > 1 ? 's' : ''}</strong> for WCAG violations
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Scan</h1>
        <p className="text-sm text-gray-500">Enter a website URL to scan for WCAG accessibility violations</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Form */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {noCredits && (
              <div className="flex items-start gap-2 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  You have no credits.{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/pricing')}
                    className="underline font-medium cursor-pointer"
                  >
                    Buy credits
                  </button>{' '}
                  to continue scanning.
                </span>
              </div>
            )}

            {/* URL input */}
            <div>
              <label htmlFor="url" className="block text-xs font-medium text-gray-700 mb-1.5">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="url"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Crawl depth */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="depth" className="block text-xs font-medium text-gray-700">
                  Pages to scan
                </label>
                <span className="text-xs font-semibold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded-md">{crawlDepth} pages</span>
              </div>
              <input
                id="depth"
                type="range"
                min="1"
                max="5"
                value={crawlDepth}
                onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                className="w-full accent-[#4F46E5] h-1.5"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 page</span>
                <span>5 pages</span>
              </div>
            </div>

            {/* Accessibility standards */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-3.5 w-3.5 text-[#4F46E5]" />
                <label className="block text-xs font-medium text-gray-700">Accessibility Standards</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {STANDARDS.map(std => {
                  const active = standards.includes(std.id)
                  return (
                    <button
                      key={std.id}
                      type="button"
                      onClick={() => toggleStandard(std.id)}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                        active
                          ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${active ? 'border-[#4F46E5] bg-[#4F46E5]' : 'border-gray-300'}`}>
                        {active && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{std.label}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Credits info */}
            <div className="flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#4F46E5]" />
                <span className="text-sm text-gray-700">This scan uses <strong>1 credit</strong></span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {credits ?? '—'} remaining
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg"
                disabled={loading || !websiteUrl || noCredits}
              >
                Start Scan
              </Button>
            </div>
          </form>
        </div>

        {/* What we check */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">What we check</h3>
            <ul className="space-y-3">
              {CHECKS.map((check) => (
                <li key={check} className="flex items-start gap-2.5 text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {check}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Scan preview</h3>
            <p className="text-sm text-gray-500">
              Will scan up to <strong className="text-gray-700">{crawlDepth} page{crawlDepth > 1 ? 's' : ''}</strong> starting from{' '}
              <span className="text-[#4F46E5] break-all">{websiteUrl || '[URL]'}</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">Estimated time: 2–5 minutes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
