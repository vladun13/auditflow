import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/hooks/useCredits'
import { auditApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Globe, AlertCircle, CheckCircle, Clock } from 'lucide-react'

const CHECKS = [
  'WCAG 2.1 Level A, AA, and AAA compliance',
  'Color contrast issues',
  'Missing alt text and ARIA labels',
  'Keyboard navigation and focus management',
  'Form labels and input accessibility',
  'Heading structure and landmarks',
  'Link text and button descriptions',
]

export function NewScan() {
  const { user } = useAuth()
  const { credits } = useCredits()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [websiteUrl, setWebsiteUrl] = useState(searchParams.get('url') || '')
  const [crawlDepth, setCrawlDepth] = useState(3)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  const noCredits = credits !== null && credits === 0

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Accessibility Scan</h1>
        <p className="text-gray-500">Enter a website URL to scan for WCAG violations</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-6">
          <Card className="border-gray-100 bg-white shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {noCredits && (
                  <div className="flex items-start gap-2 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      You have no credits left.{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/pricing')}
                        className="underline font-medium"
                      >
                        Buy credits
                      </button>{' '}
                      to continue scanning.
                    </span>
                  </div>
                )}

                {/* URL input */}
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="url"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                </div>

                {/* Crawl depth */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="depth" className="block text-sm font-medium text-foreground">
                      Pages to scan
                    </label>
                    <span className="text-sm font-semibold text-primary">{crawlDepth}</span>
                  </div>
                  <input
                    id="depth"
                    type="range"
                    min="1"
                    max="5"
                    value={crawlDepth}
                    onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 page</span>
                    <span>5 pages</span>
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <p className="text-sm font-medium text-foreground mb-1">Scan preview</p>
                  <p className="text-sm text-muted-foreground">
                    Will scan up to <strong>{crawlDepth} page{crawlDepth > 1 ? 's' : ''}</strong> starting from{' '}
                    <span className="text-foreground">{websiteUrl || '[URL]'}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Estimated time: 2–5 minutes
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading || !websiteUrl || noCredits}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Starting...
                      </span>
                    ) : (
                      'Start Scan'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* What we check */}
        <div>
          <Card className="border-gray-100 bg-white shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">What we'll check</h3>
              <ul className="space-y-3">
                {CHECKS.map((check) => (
                  <li key={check} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    {check}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-100 bg-white shadow-sm mt-4">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-2">Credit usage</h3>
              <p className="text-sm text-muted-foreground">
                This scan will use <strong>1 credit</strong>.{' '}
                You currently have{' '}
                <strong className="text-foreground">{credits ?? '—'} credit{credits !== 1 ? 's' : ''}</strong>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
