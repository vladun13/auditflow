import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { auditApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Globe, AlertCircle } from 'lucide-react'

export function NewScan() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [crawlDepth, setCrawlDepth] = useState(3)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate URL
    if (!validateUrl(websiteUrl)) {
      setError('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)

    // Create audit
    const { data, error: createError } = await auditApi.create(websiteUrl, crawlDepth)

    if (createError || !data) {
      setError(createError || 'Failed to create audit')
      setLoading(false)
      return
    }

    // Start scan
    const auditId = (data as { audit_id: string }).audit_id
    const { error: scanError } = await auditApi.startScan(auditId)

    setLoading(false)

    if (scanError) {
      setError(scanError)
    } else {
      navigate(`/audits/${auditId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">New Accessibility Scan</h1>
          <p className="text-gray-600">
            Enter a website URL to start scanning for accessibility issues
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-2">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="url"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="depth" className="block text-sm font-medium mb-2">
                Pages to Scan: {crawlDepth}
              </label>
              <input
                id="depth"
                type="range"
                min="1"
                max="5"
                value={crawlDepth}
                onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 page</span>
                <span>5 pages</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Scan Preview</h3>
              <p className="text-sm text-gray-700 mb-2">
                Will scan up to {crawlDepth} page{crawlDepth > 1 ? 's' : ''} starting from{' '}
                {websiteUrl || '[URL]'}
              </p>
              <p className="text-xs text-gray-600">
                ⏱️ Estimated time: 2-5 minutes
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading || !websiteUrl}>
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Starting Scan...
                  </>
                ) : (
                  'Start Scan'
                )}
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-8 bg-white rounded-lg p-6 border">
          <h3 className="font-semibold mb-4">What We'll Check</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>WCAG 2.1 Level A, AA, and AAA compliance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Color contrast issues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Missing alt text and ARIA labels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Keyboard navigation and focus management</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Form labels and input accessibility</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
