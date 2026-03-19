import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAudits } from '@/hooks/useAudits'
import { auditApi } from '@/lib/api'
import { getScoreColor, getScoreBg } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Trash2, ScanSearch } from 'lucide-react'
import { ReportsSkeleton } from '@/components/skeletons/ReportsSkeleton'
import type { Audit } from '@/types'

const STATUS_FILTERS = ['all', 'completed', 'scanning', 'failed'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

function getStatusLabel(audit: Audit) {
  if (audit.status !== 'completed') return audit.status
  if (!audit.wcag_score) return 'completed'
  if (audit.wcag_score >= 80) return 'Passing'
  if (audit.wcag_score >= 60) return 'Needs Work'
  return 'Failing'
}

export function Reports() {
  const navigate = useNavigate()
  const { audits, loading, refetch } = useAudits()
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = filter === 'all' ? audits : audits.filter(a => a.status === filter)

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Delete this audit? This cannot be undone.')) return
    setDeleting(id)
    await auditApi.delete(id)
    await refetch()
    setDeleting(null)
  }

  if (loading) {
    return <ReportsSkeleton />
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Reports</h1>
          <p className="text-gray-500">View and manage all your accessibility audits</p>
        </div>
        <Button onClick={() => navigate('/scan')}>
          <ScanSearch className="h-4 w-4 mr-2" />
          New Scan
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === 'all' ? `All (${audits.length})` : `${f} (${audits.filter(a => a.status === f).length})`}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-gray-100 bg-white shadow-sm">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground mb-4">No audits found</p>
            <Button onClick={() => navigate('/scan')}>Run Your First Scan</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((audit) => (
            <Card
              key={audit.id}
              onClick={() => navigate(`/audits/${audit.id}`)}
              className="border-gray-100 bg-white shadow-sm hover:border-indigo-200 hover:shadow cursor-pointer transition-colors"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${audit.wcag_score ? getScoreBg(audit.wcag_score) : 'bg-gray-50'}`}>
                      <span className={`text-lg font-bold ${audit.wcag_score ? getScoreColor(audit.wcag_score) : 'text-gray-500'}`}>
                        {audit.wcag_score?.toFixed(0) || '—'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{audit.website_url}</p>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(audit.created_at).toLocaleDateString()}</span>
                        <span>{audit.pages_scanned} pages</span>
                        <span>{audit.total_violations} violations</span>
                        {audit.wcag_level && <span>WCAG {audit.wcag_level}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                      {getStatusLabel(audit)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={(e) => { e.stopPropagation(); navigate(`/audits/${audit.id}`) }}
                    >
                      View <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete audit"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDelete(e, audit.id)}
                      disabled={deleting === audit.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
