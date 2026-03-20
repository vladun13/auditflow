import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/hooks/useCredits'
import { auditApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Zap } from 'lucide-react'
import { BuyCreditsModal } from '@/components/modals/BuyCreditsModal'
import { DepthSelector } from '@/components/new-scan/DepthSelector'
import { UrlInput } from '@/components/new-scan/UrlInput'
import { StandardsSelect } from '@/components/new-scan/StandardsSelect'
import { ChecksList } from '@/components/new-scan/ChecksList'
import { ScanProgress } from '@/components/new-scan/ScanProgress'

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
  const [loading, setLoading] = useState(false)
  const [scanStep, setScanStep] = useState(0)

  useEffect(() => {
    if (!loading) {
      setScanStep(0)
      return
    }
    const timer1 = setTimeout(() => setScanStep(1), 5000)
    const timer2 = setTimeout(() => setScanStep(2), 10000)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
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

  const noCredits = !isAdmin && credits !== null && credits === 0

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
                  <span className="text-sm text-amber-800">
                    You have no credits left.{' '}
                  </span>
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
                disabled={loading || !websiteUrl || noCredits}
              >
                {loading ? 'Scanning...' : 'Start Scan'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right column: ChecksList (idle) or ScanProgress (scanning) */}
        <div>
          {loading ? (
            <ScanProgress currentStep={scanStep} />
          ) : (
            <ChecksList />
          )}
        </div>
      </div>

      <BuyCreditsModal
        open={buyCreditsOpen}
        onOpenChange={setBuyCreditsOpen}
        context="upgrade"
      />
    </div>
  )
}
