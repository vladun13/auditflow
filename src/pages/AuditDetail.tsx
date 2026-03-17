import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAudit } from '@/hooks/useAudit'
import { auditApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, ArrowLeft, AlertTriangle, AlertCircle, Info } from 'lucide-react'

const IMPACT_STYLES: Record<string, string> = {
  critical: 'bg-red-100 border-red-300 text-red-800',
  serious:  'bg-orange-100 border-orange-300 text-orange-800',
  moderate: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  minor:    'bg-blue-100 border-blue-300 text-blue-800',
}

function ImpactIcon({ impact }: { impact: string }) {
  if (impact === 'critical') return <AlertTriangle className="h-5 w-5 text-red-600" />
  if (impact === 'serious')  return <AlertCircle className="h-5 w-5 text-orange-600" />
  if (impact === 'moderate') return <Info className="h-5 w-5 text-yellow-600" />
  return <Info className="h-5 w-5 text-blue-600" />
}

function ScoreRing({ score }: { score: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : '#dc2626'

  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold" style={{ color }}>{score.toFixed(0)}</p>
        <p className="text-xs text-muted-foreground">/ 100</p>
      </div>
    </div>
  )
}

export function AuditDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { audit, loading } = useAudit(id)
  const [impactFilter, setImpactFilter] = useState('all')
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!audit) return
    setDownloading(true)
    const result = await auditApi.downloadPdf(audit.id)
    if (result && 'error' in result && result.error) {
      alert(result.error)
    }
    setDownloading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading audit...</p>
        </div>
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Audit Not Found</h2>
          <p className="text-muted-foreground mb-4">The audit you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </Card>
      </div>
    )
  }

  if (audit.status === 'scanning') {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <Card className="p-12 text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center animate-pulse">
              <span className="text-white text-2xl">🔍</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Scanning in Progress</h2>
          <p className="text-muted-foreground mb-4">
            Analyzing <span className="font-medium text-foreground">{audit.website_url}</span> for accessibility issues...
          </p>
          <p className="text-sm text-muted-foreground">This usually takes 2–5 minutes</p>
        </Card>
      </div>
    )
  }

  const filteredViolations = (audit.violations || []).filter(
    v => impactFilter === 'all' || v.impact === impactFilter
  )

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate('/reports')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Button>
        <Button onClick={handleDownload} disabled={downloading} className="gap-2">
          <Download className="h-4 w-4" />
          {downloading ? 'Preparing...' : 'Download PDF'}
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground break-all">{audit.website_url}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Scanned on {new Date(audit.created_at).toLocaleDateString()}
          {audit.wcag_level && <span> · WCAG Level {audit.wcag_level}</span>}
        </p>
      </div>

      {/* Score + stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-border bg-card">
          <CardContent className="p-6 flex flex-col items-center">
            {audit.wcag_score != null
              ? <ScoreRing score={audit.wcag_score} />
              : <p className="text-4xl font-bold text-muted-foreground">—</p>
            }
            <p className="text-sm text-muted-foreground mt-2">WCAG Score</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-foreground">{audit.pages_scanned}</p>
            <p className="text-sm text-muted-foreground mt-2">Pages Scanned</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-foreground">{audit.total_violations}</p>
            <p className="text-sm text-muted-foreground mt-2">Total Violations</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6 text-center">
            <p className="text-xl font-semibold text-foreground capitalize">{audit.status}</p>
            <p className="text-sm text-muted-foreground mt-2">Status</p>
          </CardContent>
        </Card>
      </div>

      {/* Severity breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Critical', count: audit.critical_count, color: 'bg-red-50 border-red-200', text: 'text-red-600', icon: <AlertTriangle className="h-4 w-4 text-red-600" /> },
          { label: 'Serious',  count: audit.serious_count,  color: 'bg-orange-50 border-orange-200', text: 'text-orange-600', icon: <AlertCircle className="h-4 w-4 text-orange-600" /> },
          { label: 'Moderate', count: audit.moderate_count, color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-600', icon: <Info className="h-4 w-4 text-yellow-600" /> },
          { label: 'Minor',    count: audit.minor_count,    color: 'bg-blue-50 border-blue-200',  text: 'text-blue-600', icon: <Info className="h-4 w-4 text-blue-600" /> },
        ].map(({ label, count, color, text, icon }) => (
          <div key={label} className={`rounded-lg border p-4 ${color}`}>
            <div className="flex items-center gap-2 mb-1">{icon}<span className={`text-sm font-medium ${text}`}>{label}</span></div>
            <p className={`text-2xl font-bold ${text}`}>{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all',      label: `All (${audit.total_violations})` },
          { key: 'critical', label: `Critical (${audit.critical_count})` },
          { key: 'serious',  label: `Serious (${audit.serious_count})` },
          { key: 'moderate', label: `Moderate (${audit.moderate_count})` },
          { key: 'minor',    label: `Minor (${audit.minor_count})` },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={impactFilter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setImpactFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Violations */}
      <div className="space-y-4">
        {filteredViolations.length > 0 ? (
          filteredViolations.map((v) => (
            <Card key={v.id} className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-0.5"><ImpactIcon impact={v.impact} /></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-base font-semibold text-foreground">{v.violation_type}</h3>
                      <Badge className={`border shrink-0 ${IMPACT_STYLES[v.impact] || ''}`} variant="outline">
                        {v.impact}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-1">WCAG {v.wcag_criterion}</p>
                    <p className="text-sm text-foreground mb-4">{v.description}</p>

                    {v.ai_explanation && (
                      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-3">
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Why This Matters</h4>
                        <p className="text-sm text-blue-800">{v.ai_explanation}</p>
                      </div>
                    )}

                    {v.ai_fix_steps && (
                      <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-3">
                        <h4 className="text-sm font-medium text-green-900 mb-1">How to Fix</h4>
                        <p className="text-sm text-green-800 whitespace-pre-line">{v.ai_fix_steps}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span><strong className="text-foreground">{v.affected_elements}</strong> instance{v.affected_elements !== 1 ? 's' : ''}</span>
                      {v.estimated_fix_hours && (
                        <span><strong className="text-foreground">{v.estimated_fix_hours}h</strong> estimated fix time</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              No violations found in this category
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
