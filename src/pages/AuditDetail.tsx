import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { auditApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, ArrowLeft, AlertTriangle, AlertCircle, Info } from 'lucide-react'

interface Violation {
  id: string
  page_url: string
  violation_type: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  wcag_criterion: string
  description: string
  ai_explanation: string | null
  ai_fix_steps: string | null
  affected_elements: number
  estimated_fix_hours: number | null
}

interface Audit {
  id: string
  website_url: string
  status: string
  pages_scanned: number
  total_violations: number
  critical_count: number
  serious_count: number
  moderate_count: number
  minor_count: number
  wcag_score: number | null
  wcag_level: string | null
  created_at: string
  completed_at: string | null
  violations: Violation[]
}

export function AuditDetail() {
  const { id } = useParams<{ id: string }>()
  const [audit, setAudit] = useState<Audit | null>(null)
  const [loading, setLoading] = useState(true)
  const [impactFilter, setImpactFilter] = useState<string>('all')

  useEffect(() => {
    fetchAudit()
    // Poll for updates if status is scanning
    const interval = setInterval(() => {
      if (audit?.status === 'scanning') {
        fetchAudit()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [id])

  const fetchAudit = async () => {
    if (!id) return

    const { data, error } = await auditApi.get(id)
    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setAudit(data as Audit)
    setLoading(false)
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'serious':
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      case 'moderate':
        return <Info className="w-5 h-5 text-yellow-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800'
      case 'serious':
        return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'moderate':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800'
    }
  }

  const filteredViolations = audit?.violations?.filter(
    (v) => impactFilter === 'all' || v.impact === impactFilter
  ) || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading audit...</p>
        </div>
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Audit Not Found</h2>
          <p className="text-gray-600 mb-4">The audit you're looking for doesn't exist.</p>
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (audit.status === 'scanning') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-12 text-center max-w-md">
          <div className="animate-pulse mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
              <span className="text-white text-2xl">🔍</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Scanning in Progress</h2>
          <p className="text-gray-600 mb-4">
            Analyzing {audit.website_url} for accessibility issues...
          </p>
          <p className="text-sm text-gray-500">This usually takes 2-5 minutes</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link to="/dashboard">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Button onClick={() => auditApi.downloadPdf(audit.id)} className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">{audit.website_url}</h1>
          <p className="text-gray-600">
            Scanned on {new Date(audit.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">WCAG Score</h3>
            <p className="text-4xl font-bold text-blue-600">
              {audit.wcag_score?.toFixed(1) || '—'}
            </p>
            {audit.wcag_level && (
              <p className="text-sm text-gray-600 mt-1">Level {audit.wcag_level}</p>
            )}
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pages Scanned</h3>
            <p className="text-4xl font-bold">{audit.pages_scanned}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Violations</h3>
            <p className="text-4xl font-bold">{audit.total_violations}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Status</h3>
            <p className="text-xl font-semibold capitalize">{audit.status}</p>
          </Card>
        </div>

        {/* Violation Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Critical</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{audit.critical_count}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Serious</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{audit.serious_count}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Moderate</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{audit.moderate_count}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Minor</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{audit.minor_count}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={impactFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setImpactFilter('all')}
          >
            All ({audit.total_violations})
          </Button>
          <Button
            variant={impactFilter === 'critical' ? 'default' : 'outline'}
            onClick={() => setImpactFilter('critical')}
          >
            Critical ({audit.critical_count})
          </Button>
          <Button
            variant={impactFilter === 'serious' ? 'default' : 'outline'}
            onClick={() => setImpactFilter('serious')}
          >
            Serious ({audit.serious_count})
          </Button>
          <Button
            variant={impactFilter === 'moderate' ? 'default' : 'outline'}
            onClick={() => setImpactFilter('moderate')}
          >
            Moderate ({audit.moderate_count})
          </Button>
          <Button
            variant={impactFilter === 'minor' ? 'default' : 'outline'}
            onClick={() => setImpactFilter('minor')}
          >
            Minor ({audit.minor_count})
          </Button>
        </div>

        {/* Violations List */}
        <div className="space-y-4">
          {filteredViolations && filteredViolations.length > 0 ? (
            filteredViolations.map((violation) => (
              <Card key={violation.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{getImpactIcon(violation.impact)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{violation.violation_type}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(
                          violation.impact
                        )} border`}
                      >
                        {violation.impact}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      WCAG {violation.wcag_criterion}
                    </p>
                    <p className="text-gray-700 mb-4">{violation.description}</p>

                    {violation.ai_explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium mb-2">Why This Matters</h4>
                        <p className="text-sm text-gray-700">{violation.ai_explanation}</p>
                      </div>
                    )}

                    {violation.ai_fix_steps && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium mb-2">How to Fix</h4>
                        <div className="text-sm text-gray-700 whitespace-pre-line">
                          {violation.ai_fix_steps}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>
                        <strong>{violation.affected_elements}</strong> instance
                        {violation.affected_elements !== 1 ? 's' : ''}
                      </span>
                      {violation.estimated_fix_hours && (
                        <span>
                          <strong>{violation.estimated_fix_hours}h</strong> estimated fix time
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-gray-600">No violations found in this category</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
