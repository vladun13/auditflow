import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAudit } from '@/hooks/useAudit'
import { auditApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Share2, RefreshCw, ChevronRight } from 'lucide-react'
import type { Violation } from '@/types'
import { cn } from '@/lib/utils'

/* ── Score ring ─────────────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#ff4d4f'
  return (
    <div className="relative flex items-center justify-center w-[120px] h-[120px]">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f0f0f0" strokeWidth="12" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-gray-900">{score.toFixed(0)}%</p>
      </div>
    </div>
  )
}

/* ── Scanning state (matches Figma) ─────────────────────────────── */
function ScanningView({ url }: { url: string }) {
  return (
    <div className="flex items-center justify-center h-full bg-white">
      <div className="flex flex-col items-center gap-8 max-w-[720px] px-6 text-center">
        {/* Illustration */}
        <div className="w-[300px] h-[200px] flex items-center justify-center">
          <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="40" y="20" width="220" height="145" rx="8" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="1.5"/>
            <rect x="40" y="20" width="220" height="24" rx="8" fill="#e8e8e8"/>
            <circle cx="56" cy="32" r="4" fill="#ff6b6b"/>
            <circle cx="70" cy="32" r="4" fill="#ffd93d"/>
            <circle cx="84" cy="32" r="4" fill="#6bcb77"/>
            <rect x="55" y="55" width="130" height="8" rx="4" fill="#d9d9d9"/>
            <rect x="55" y="72" width="100" height="6" rx="3" fill="#ebebeb"/>
            <rect x="55" y="86" width="115" height="6" rx="3" fill="#ebebeb"/>
            <rect x="55" y="100" width="90" height="6" rx="3" fill="#ebebeb"/>
            <rect x="55" y="115" width="60" height="24" rx="4" fill="#4F46E5"/>
            {/* Magnifier */}
            <circle cx="210" cy="120" r="40" fill="none" stroke="#4F46E5" strokeWidth="3" opacity="0.3"/>
            <circle cx="210" cy="120" r="40" fill="none" stroke="#4F46E5" strokeWidth="2" strokeDasharray="8 4"/>
            <line x1="238" y1="148" x2="255" y2="165" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round"/>
            {/* Chart bars inside magnifier */}
            <rect x="192" y="128" width="10" height="20" rx="2" fill="#4F46E5" opacity="0.5"/>
            <rect x="206" y="118" width="10" height="30" rx="2" fill="#4F46E5" opacity="0.7"/>
            <rect x="220" y="123" width="10" height="25" rx="2" fill="#4F46E5" opacity="0.6"/>
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">We are scanning your website</h2>
          <p className="text-sm text-gray-500">
            Analyzing <span className="font-medium text-gray-700">{url}</span> for WCAG accessibility violations. This usually takes 2–5 minutes.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full border border-gray-200 rounded-lg p-4 space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full w-2/5 rounded-full bg-[#4F46E5] animate-pulse" />
            </div>
            <span className="text-sm text-gray-500 shrink-0">In progress</span>
          </div>
          <p className="text-xs text-gray-400">Estimated time: 2–5 min</p>
        </div>

        <Button variant="outline" className="rounded-full gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh status
        </Button>
      </div>
    </div>
  )
}

/* ── Impact colours ──────────────────────────────────────────────── */
const IMPACT_COLOR: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  critical: { dot: 'bg-red-500',    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  serious:  { dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  moderate: { dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  minor:    { dot: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
}

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
      {/* Top header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Rescan
          </Button>
          <Button size="sm" onClick={handleDownload} disabled={downloading} className="gap-1.5 text-xs bg-[#4F46E5] hover:bg-[#4338CA]">
            <Download className="h-3.5 w-3.5" />
            PDF
          </Button>
        </div>
      </div>

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
