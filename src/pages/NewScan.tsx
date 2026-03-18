import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/hooks/useCredits'
import { auditApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Zap } from 'lucide-react'
import { DEPTH_OPTIONS, STANDARDS, CHECKS } from '@/components/new-scan/constants'
import { DepthSelector } from '@/components/new-scan/DepthSelector'
import { UrlInput } from '@/components/new-scan/UrlInput'
import { StandardsSelect } from '@/components/new-scan/StandardsSelect'

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
  const [crawlDepth, setCrawlDepth] = useState(() => {
    const d = parseInt(searchParams.get('depth') || '3')
    return [1, 2, 3, 4, 5].includes(d) ? d : 3
  })
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

            <UrlInput value={websiteUrl} onChange={setWebsiteUrl} />

            <DepthSelector value={crawlDepth} onChange={setCrawlDepth} />

            <StandardsSelect selected={standards} onToggle={toggleStandard} />

            {/* Credits info */}
            {credits === 1 ? (
              <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Service cost: <strong className="text-green-700">First scan is free!</strong></span>
                </div>
                <span className="text-xs font-medium text-green-700 bg-green-100 rounded-full px-2.5 py-0.5">
                  1 free credit
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#4F46E5]" />
                  <span className="text-sm text-gray-700">This scan uses <strong>1 credit</strong></span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {credits ?? '—'} remaining
                </span>
              </div>
            )}

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
            <div className="mt-3 flex gap-2 flex-wrap">
              {DEPTH_OPTIONS.map(opt => (
                <span
                  key={opt.value}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors ${
                    crawlDepth === opt.value
                      ? 'bg-indigo-50 border-indigo-200 text-[#4F46E5]'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {opt.label}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Estimated time: 2–5 minutes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
