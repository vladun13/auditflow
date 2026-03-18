import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAudit } from '@/hooks/useAudit'
import { auditApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import type { Violation } from '@/types'
import { cn } from '@/lib/utils'
import { ScoreRing } from '@/components/audit-detail/ScoreRing'
import { ScanningView } from '@/components/audit-detail/ScanningView'
import { IMPACT_COLOR } from '@/components/audit-detail/constants'
import { AuditHeader } from '@/components/audit-detail/AuditHeader'

/* ── Main component ─────────────────────────────────────────────── */
export function AuditDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { audit, loading } = useAudit(id)
  const [impactFilter, setImpactFilter] = useState<string>('critical')
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!audit) return
    setDownloading(true)
    await auditApi.downloadPdf(audit.id)
    setDownloading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4F46E5]" />
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Audit not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (audit.status === 'scanning') {
    return <ScanningView url={audit.website_url} />
  }

  const TABS = [
    { key: 'critical', label: 'Critical', count: audit.critical_count },
    { key: 'serious',  label: 'Serious',  count: audit.serious_count },
    { key: 'moderate', label: 'Moderate', count: audit.moderate_count },
    { key: 'minor',    label: 'Minor',    count: audit.minor_count },
  ]

  const violations = (audit.violations || []).filter(v => v.impact === impactFilter)
  const active = selectedViolation || violations[0] || null
  const c = IMPACT_COLOR[impactFilter] || IMPACT_COLOR.minor
  const isCompliant = audit.wcag_score != null && audit.wcag_score >= 85

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AuditHeader
        onBack={() => navigate('/dashboard')}
        onDownload={handleDownload}
        downloading={downloading}
      />

      {/* Overview section */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-2 mb-5">
          <h1 className="text-lg font-semibold text-gray-900">Overview</h1>
          <a href={audit.website_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-[#4F46E5] hover:underline">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {audit.website_url}
          </a>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Compliance card */}
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-3">Audit Result</p>
            <div className={cn('rounded-lg border px-4 py-2 text-center mb-3', isCompliant ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700')}>
              <p className="text-sm font-bold tracking-wide">{isCompliant ? 'COMPLIANT' : 'NOT COMPLIANT'}</p>
            </div>
            <p className="text-xs text-gray-500">
              Scanned {audit.pages_scanned} page{audit.pages_scanned !== 1 ? 's' : ''} on{' '}
              {new Date(audit.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Score card */}
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-2">Audit Score</p>
            <div className="flex justify-center">
              {audit.wcag_score != null
                ? <ScoreRing score={audit.wcag_score} />
                : <p className="text-4xl font-bold text-gray-300 py-6">—</p>
              }
            </div>
            <p className="text-xs text-gray-400 text-center mt-1">
              {audit.wcag_level ? `WCAG Level ${audit.wcag_level}` : 'WCAG score'}
            </p>
          </div>

          {/* Issues breakdown */}
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-3">WCAG 2.2 Criteria</p>
            <div className="space-y-2.5">
              {[
                { label: 'Critical Issues', count: audit.critical_count, color: 'bg-red-400' },
                { label: 'Serious Issues',  count: audit.serious_count,  color: 'bg-orange-400' },
                { label: 'Moderate Issues', count: audit.moderate_count, color: 'bg-yellow-400' },
                { label: 'Minor Issues',    count: audit.minor_count,    color: 'bg-blue-400' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{}} >
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                  </div>
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: audit.total_violations > 0 ? `${(count / audit.total_violations) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Issues + Details 3-panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Issue tabs */}
        <div className="w-[200px] shrink-0 border-r border-gray-100 bg-white overflow-y-auto">
          <div className="p-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">
              Issues {audit.total_violations}
            </p>
            <div className="space-y-0.5">
              {TABS.map(tab => {
                const col = IMPACT_COLOR[tab.key]
                return (
                  <button
                    key={tab.key}
                    onClick={() => { setImpactFilter(tab.key); setSelectedViolation(null) }}
                    className={cn(
                      'w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                      impactFilter === tab.key ? `${col.bg} ${col.text}` : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                      {tab.label}
                    </div>
                    <span className={cn('text-xs font-medium', impactFilter === tab.key ? col.text : 'text-gray-400')}>
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Violation list */}
          <div className="border-t border-gray-100 mt-1 pt-1">
            {violations.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setSelectedViolation(v)}
                className={cn(
                  'w-full text-left px-3 py-2.5 text-xs border-b border-gray-50 transition-colors',
                  (active?.id === v.id) ? `${c.bg} ${c.text}` : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <div className="font-medium truncate">Error type {i + 1}</div>
                <div className="text-gray-400 truncate mt-0.5">{v.violation_type}</div>
                <div className={cn('mt-1 text-xs font-medium', c.text)}>
                  Total Failing Elements {v.affected_elements}
                </div>
              </button>
            ))}
            {violations.length === 0 && (
              <p className="px-3 py-4 text-xs text-gray-400 text-center">No {impactFilter} issues</p>
            )}
          </div>
        </div>

        {/* Middle: Details */}
        <div className="flex-1 overflow-y-auto bg-white border-r border-gray-100">
          {active ? (
            <div className="p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900 mb-1">Details</h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">{active.violation_type}</p>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', c.bg, c.text)}>
                    {impactFilter}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{active.description}</p>

              <p className="text-xs font-medium text-gray-500 mb-2">WCAG {active.wcag_criterion}</p>

              {active.ai_explanation && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className={cn('h-4 w-4 rounded-full flex items-center justify-center', c.bg)}>
                      <span className={cn('text-xs', c.text)}>!</span>
                    </div>
                    <p className="text-xs font-medium text-gray-700">Why this matters</p>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{active.ai_explanation}</p>
                </div>
              )}

              <div className="rounded-lg border border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Affected page link</p>
                <a href={active.page_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#4F46E5] hover:underline break-all">
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {active.page_url}
                </a>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <span><strong className="text-gray-700">{active.affected_elements}</strong> affected element{active.affected_elements !== 1 ? 's' : ''}</span>
                {active.estimated_fix_hours && (
                  <span><strong className="text-gray-700">{active.estimated_fix_hours}h</strong> estimated fix</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Select an issue to view details
            </div>
          )}
        </div>

        {/* Right: How to Fix */}
        <div className="w-[340px] shrink-0 overflow-y-auto bg-white">
          {active ? (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">How to Fix it</h2>
                {active.estimated_fix_hours && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    ~{active.estimated_fix_hours}h
                  </span>
                )}
              </div>

              {active.ai_fix_steps ? (
                <div className="prose prose-sm max-w-none text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {active.ai_fix_steps}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No fix steps available yet.</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Fix guidance will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
