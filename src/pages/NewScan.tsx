import { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/hooks/useCredits'
import { auditApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Zap, Bell } from 'lucide-react'
import { BuyCreditsModal } from '@/components/modals/BuyCreditsModal'
import { DepthSelector } from '@/components/new-scan/DepthSelector'
import { UrlInput } from '@/components/new-scan/UrlInput'
import { StandardsSelect } from '@/components/new-scan/StandardsSelect'
import { ChecksList } from '@/components/new-scan/ChecksList'

// ── Scanning illustration ──────────────────────────────────────────────────────

function ScanningIllustration() {
  return (
    <svg width="380" height="280" viewBox="0 0 380 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Monitor */}
      <rect x="90" y="20" width="220" height="160" rx="8" stroke="#1E1B4B" strokeWidth="2" fill="white"/>
      <rect x="90" y="20" width="220" height="18" rx="8" fill="#F1F5F9" stroke="#1E1B4B" strokeWidth="2"/>
      {/* Browser dots */}
      <circle cx="104" cy="29" r="3" fill="#E2E8F0"/>
      <circle cx="116" cy="29" r="3" fill="#E2E8F0"/>
      <circle cx="128" cy="29" r="3" fill="#E2E8F0"/>
      {/* URL bar */}
      <rect x="138" y="23" width="120" height="12" rx="3" fill="#E2E8F0"/>
      {/* Monitor stand */}
      <rect x="183" y="180" width="14" height="28" rx="2" fill="#CBD5E1" stroke="#1E1B4B" strokeWidth="1.5"/>
      <rect x="165" y="205" width="50" height="8" rx="4" fill="#CBD5E1" stroke="#1E1B4B" strokeWidth="1.5"/>
      {/* Screen content: text lines */}
      <rect x="170" y="55" width="55" height="6" rx="2" fill="#C7D2FE"/>
      <rect x="170" y="67" width="40" height="4" rx="2" fill="#E0E7FF"/>
      <rect x="170" y="77" width="50" height="4" rx="2" fill="#E0E7FF"/>
      <rect x="170" y="87" width="35" height="4" rx="2" fill="#E0E7FF"/>
      {/* Bar chart in screen */}
      <rect x="230" y="110" width="10" height="40" rx="2" fill="#4F46E5" fillOpacity="0.7"/>
      <rect x="246" y="95" width="10" height="55" rx="2" fill="#4F46E5"/>
      <rect x="262" y="105" width="10" height="45" rx="2" fill="#6366F1" fillOpacity="0.8"/>
      <rect x="278" y="85" width="10" height="65" rx="2" fill="#4F46E5"/>
      <rect x="230" y="150" width="60" height="1.5" stroke="#CBD5E1"/>
      {/* Small bars below */}
      <rect x="105" y="130" width="8" height="20" rx="1.5" fill="#C7D2FE"/>
      <rect x="118" y="120" width="8" height="30" rx="1.5" fill="#818CF8"/>
      <rect x="131" y="125" width="8" height="25" rx="1.5" fill="#C7D2FE"/>
      <rect x="144" y="115" width="8" height="35" rx="1.5" fill="#818CF8"/>
      <rect x="105" y="150" width="50" height="1" stroke="#E2E8F0"/>
      {/* Magnifying glass */}
      <circle cx="145" cy="115" r="52" stroke="#1E1B4B" strokeWidth="2.5" fill="white" fillOpacity="0.85"/>
      {/* Handle */}
      <line x1="103" y1="157" x2="80" y2="185" stroke="#1E1B4B" strokeWidth="6" strokeLinecap="round"/>
      {/* Bar chart inside magnifier */}
      <rect x="112" y="100" width="9" height="22" rx="2" fill="#4F46E5"/>
      <rect x="126" y="88" width="9" height="34" rx="2" fill="#6366F1"/>
      <rect x="140" y="96" width="9" height="26" rx="2" fill="#4F46E5" fillOpacity="0.7"/>
      <rect x="154" y="82" width="9" height="40" rx="2" fill="#4F46E5"/>
      <rect x="112" y="122" width="55" height="1.5" stroke="#C7D2FE"/>
      {/* Person sitting */}
      {/* Chair */}
      <ellipse cx="295" cy="220" rx="35" ry="12" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5"/>
      <rect x="268" y="185" width="55" height="8" rx="3" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5"/>
      {/* Body */}
      <rect x="280" y="155" width="28" height="35" rx="8" fill="#4F46E5"/>
      {/* Legs */}
      <rect x="278" y="185" width="14" height="30" rx="5" fill="#4F46E5"/>
      <rect x="296" y="185" width="14" height="30" rx="5" fill="#4F46E5"/>
      {/* Feet */}
      <ellipse cx="285" cy="216" rx="8" ry="5" fill="#1E1B4B"/>
      <ellipse cx="303" cy="216" rx="8" ry="5" fill="#1E1B4B"/>
      {/* Laptop on lap */}
      <rect x="270" y="165" width="48" height="30" rx="4" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5"/>
      <rect x="274" y="168" width="40" height="22" rx="2" fill="#C7D2FE"/>
      {/* Arms */}
      <path d="M280 165 Q265 175 270 185" stroke="#4F46E5" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M308 165 Q320 175 315 185" stroke="#4F46E5" strokeWidth="8" strokeLinecap="round" fill="none"/>
      {/* Head */}
      <circle cx="294" cy="145" r="16" fill="#FFD7B5" stroke="#CBD5E1" strokeWidth="1"/>
      {/* Hair */}
      <path d="M278 138 Q282 128 294 130 Q306 128 310 138 Q305 132 294 133 Q283 132 278 138Z" fill="#1E1B4B"/>
      {/* Ground line */}
      <line x1="60" y1="228" x2="360" y2="228" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 4"/>
    </svg>
  )
}

// ── Complete illustration ──────────────────────────────────────────────────────

function CompleteIllustration() {
  return (
    <svg width="360" height="280" viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Laptop base */}
      <rect x="70" y="200" width="230" height="12" rx="6" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="1.5"/>
      {/* Laptop screen frame */}
      <rect x="85" y="55" width="200" height="150" rx="8" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="2"/>
      {/* Browser bar */}
      <rect x="85" y="55" width="200" height="22" rx="8" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="2"/>
      {/* Three dots */}
      <circle cx="100" cy="66" r="3.5" fill="#C4B5FD"/>
      <circle cx="112" cy="66" r="3.5" fill="#C4B5FD"/>
      <circle cx="124" cy="66" r="3.5" fill="#C4B5FD"/>
      {/* Screen content area */}
      <rect x="95" y="85" width="180" height="110" rx="4" fill="white"/>
      {/* Checklist items */}
      {/* Item 1 - checked */}
      <rect x="108" y="97" width="75" height="6" rx="2" fill="#C7D2FE"/>
      <rect x="108" y="109" width="55" height="4" rx="2" fill="#E0E7FF"/>
      <circle cx="205" cy="101" r="10" stroke="#4F46E5" strokeWidth="2" fill="none"/>
      <path d="M199 101l4 4 7-7" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Item 2 - unchecked */}
      <rect x="108" y="125" width="65" height="6" rx="2" fill="#E2E8F0"/>
      <rect x="108" y="137" width="45" height="4" rx="2" fill="#F1F5F9"/>
      <circle cx="205" cy="130" r="10" stroke="#CBD5E1" strokeWidth="2" fill="none"/>
      {/* Item 3 - checked */}
      <rect x="108" y="152" width="70" height="6" rx="2" fill="#C7D2FE"/>
      <rect x="108" y="164" width="50" height="4" rx="2" fill="#E0E7FF"/>
      <circle cx="205" cy="157" r="10" stroke="#4F46E5" strokeWidth="2" fill="none"/>
      <path d="M199 157l4 4 7-7" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Magnifying glass bottom-left */}
      <circle cx="110" cy="175" r="22" stroke="#C4B5FD" strokeWidth="2" fill="white" fillOpacity="0.7"/>
      <line x1="88" y1="197" x2="76" y2="212" stroke="#C4B5FD" strokeWidth="5" strokeLinecap="round"/>
      {/* Content inside magnifier */}
      <rect x="100" y="168" width="20" height="3" rx="1" fill="#C7D2FE"/>
      <rect x="100" y="175" width="15" height="3" rx="1" fill="#E0E7FF"/>
      {/* Item 4 - crossed */}
      <circle cx="205" cy="182" r="10" stroke="#C4B5FD" strokeWidth="2" fill="none"/>
      <path d="M199 176l12 12M211 176l-12 12" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Person standing */}
      {/* Pencil / pen */}
      <rect x="270" y="90" width="12" height="80" rx="4" fill="#4F46E5" transform="rotate(20 270 90)"/>
      <polygon points="285,158 295,172 275,168" fill="#FCD34D"/>
      <rect x="280" y="85" width="12" height="10" rx="2" fill="#CBD5E1" transform="rotate(20 280 85)"/>
      {/* Body */}
      <rect x="235" y="150" width="30" height="45" rx="10" fill="#4F46E5"/>
      {/* Skirt/legs */}
      <path d="M235 185 Q225 215 228 228 M265 185 Q272 215 270 228" stroke="#4F46E5" strokeWidth="12" strokeLinecap="round"/>
      {/* Feet */}
      <ellipse cx="230" cy="226" rx="9" ry="5" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
      <ellipse cx="268" cy="226" rx="9" ry="5" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
      {/* Arm holding pencil */}
      <path d="M265 165 Q278 150 278 140" stroke="#4F46E5" strokeWidth="9" strokeLinecap="round" fill="none"/>
      {/* Other arm */}
      <path d="M235 165 Q222 155 220 165" stroke="#4F46E5" strokeWidth="9" strokeLinecap="round" fill="none"/>
      {/* Head */}
      <circle cx="250" cy="138" r="18" fill="#FFD7B5"/>
      {/* Long hair */}
      <path d="M232 132 Q232 155 238 168" stroke="#1E1B4B" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M232 128 Q240 118 250 120 Q262 118 268 128 Q264 122 250 122 Q236 122 232 128Z" fill="#1E1B4B"/>
      {/* Ground */}
      <line x1="60" y1="232" x2="320" y2="232" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 4"/>
    </svg>
  )
}

// ── Scanning screen ────────────────────────────────────────────────────────────

function ScanningScreen({ url, depth, onNotify }: { url: string; depth: number; onNotify: () => void }) {
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const estimatedSecs = depth * 40
  const estimatedLabel = estimatedSecs < 60 ? `${estimatedSecs}s` : `${Math.ceil(estimatedSecs / 60)}min`

  useEffect(() => {
    // Animate progress from 0 → 85% (API controls actual completion)
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) {
          clearInterval(intervalRef.current!)
          return 85
        }
        return prev + 1
      })
    }, estimatedSecs * 10) // spread across estimated time

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [estimatedSecs])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-6">
        <ScanningIllustration />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">We are scanning your website</h1>
      <p className="text-base text-gray-500 max-w-md leading-relaxed mb-10">
        Our engine is crawling <span className="font-medium text-gray-700 break-all">{url}</span> for WCAG accessibility violations. This may take a moment.
      </p>

      {/* Progress card */}
      <div className="w-full max-w-xl rounded-2xl border border-gray-100 bg-white shadow-sm px-6 py-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden mr-4">
            <div
              className="h-full rounded-full bg-[#4F46E5] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700 shrink-0">{progress}%</span>
        </div>
        <p className="text-sm text-gray-400 text-left">Estimated loading time: {estimatedLabel}</p>
      </div>

      <button
        type="button"
        onClick={onNotify}
        className="inline-flex items-center gap-2 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white px-7 py-3 text-sm font-medium transition-colors cursor-pointer shadow-sm"
      >
        <Bell className="h-4 w-4" />
        Notify me when it's ready
      </button>
    </div>
  )
}

// ── Complete screen ────────────────────────────────────────────────────────────

function CompleteScreen({ auditId, onRunAnother }: { auditId: string; onRunAnother: () => void }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-6">
        <CompleteIllustration />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">Audit Complete</h1>
      <p className="text-base text-gray-500 max-w-md leading-relaxed mb-10">
        Your website has been successfully analyzed for accessibility issues.
        You can now review detailed findings, prioritize fixes, and start improving compliance.
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRunAnother}
          className="h-11 px-7 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Run Another Scan
        </button>
        <button
          type="button"
          onClick={() => navigate(`/audits/${auditId}`)}
          className="h-11 px-7 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium transition-colors cursor-pointer shadow-sm"
        >
          View Full Report
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

type ScanPhase = 'form' | 'scanning' | 'complete'

export function NewScan() {
  const { user } = useAuth()
  const { credits, isAdmin } = useCredits()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [websiteUrl, setWebsiteUrl] = useState(() => {
    const paramUrl = searchParams.get('url')
    if (paramUrl) return paramUrl
    const sessionUrl = sessionStorage.getItem('auditflow_pending_url')
    if (sessionUrl) {
      sessionStorage.removeItem('auditflow_pending_url')
      return sessionUrl
    }
    return ''
  })

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

  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false)
  const [error, setError] = useState('')
  const [phase, setPhase] = useState<ScanPhase>('form')
  const [completedAuditId, setCompletedAuditId] = useState('')

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

    setPhase('scanning')

    const { data, error: createError } = await auditApi.create(websiteUrl, crawlDepth)
    if (createError || !data) {
      setError(createError || 'Failed to create audit')
      setPhase('form')
      return
    }

    const auditId = (data as { audit_id: string }).audit_id
    const { error: scanError } = await auditApi.startScan(auditId)

    if (scanError) {
      setError(scanError)
      setPhase('form')
    } else {
      setCompletedAuditId(auditId)
      setPhase('complete')
    }
  }

  const noCredits = !isAdmin && credits !== null && credits === 0

  // ── Scanning phase ──────────────────────────────────────────────────────────
  if (phase === 'scanning') {
    return (
      <ScanningScreen
        url={websiteUrl}
        depth={crawlDepth}
        onNotify={() => {
          // In a real app this would subscribe to push notifications
          // For now just show a toast or do nothing
        }}
      />
    )
  }

  // ── Complete phase ──────────────────────────────────────────────────────────
  if (phase === 'complete') {
    return (
      <CompleteScreen
        auditId={completedAuditId}
        onRunAnother={() => {
          setPhase('form')
          setWebsiteUrl('')
          setError('')
        }}
      />
    )
  }

  // ── Form phase ──────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Accessibility Scan</h1>
        <p className="text-sm text-gray-500">Enter a website URL to scan for WCAG accessibility violations</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left column: Form */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <UrlInput value={websiteUrl} onChange={setWebsiteUrl} />
            <DepthSelector value={crawlDepth} onChange={setCrawlDepth} />
            <StandardsSelect selected={standards} onToggle={toggleStandard} />

            {/* Credits info */}
            {isAdmin ? (
              <div className="flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#4F46E5]" />
                  <span className="text-sm text-gray-700">This scan uses <strong>1 credit</strong></span>
                </div>
                <span className="text-sm font-medium text-[#4F46E5]">Unlimited credits</span>
              </div>
            ) : noCredits ? (
              <div className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-800">You have no credits left.</span>
                </div>
                <button
                  onClick={() => setBuyCreditsOpen(true)}
                  className="text-sm font-medium text-[#4F46E5] hover:underline"
                >
                  Upgrade
                </button>
              </div>
            ) : credits === 1 ? (
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
                  {credits ?? '—'} credits remaining
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
                disabled={!websiteUrl || noCredits}
              >
                Start Scan
              </Button>
            </div>
          </form>
        </div>

        {/* Right column: checks list */}
        <div>
          <ChecksList />
        </div>
      </div>

      <BuyCreditsModal
        open={buyCreditsOpen}
        onOpenChange={setBuyCreditsOpen}
      />
    </div>
  )
}
