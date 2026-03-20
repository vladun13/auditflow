import type { Audit } from '@/types'
import { Link2, ExternalLink, Share2, RotateCcw, FileText, Loader2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface OverviewSectionProps {
  audit: Audit
  onShare: () => void
  onRescan: () => void
  onDownloadPdf: () => void
  pdfLoading: boolean
}

function ScoreRingSmall({ score }: { score: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: 110, height: 110 }}>
      <svg width="110" height="110" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#F3F4F6" strokeWidth={7} />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#4F46E5" strokeWidth={7}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-bold text-gray-900">{score.toFixed(0)}%</p>
      </div>
    </div>
  )
}

function ComplianceBox({ score, wcagLevel }: { score: number | null; wcagLevel: string | null }) {
  if (score === null) return (
    <div className="flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 py-6 mb-3">
      <span className="text-lg font-bold text-gray-400">PENDING</span>
    </div>
  )
  if (score >= 85) return (
    <div className="flex items-center justify-center rounded-lg bg-green-50 border border-green-200 py-6 mb-3">
      <span className="text-lg font-bold text-green-600">{wcagLevel ? `WCAG ${wcagLevel} COMPLIANT` : 'COMPLIANT'}</span>
    </div>
  )
  if (score >= 70) return (
    <div className="flex items-center justify-center rounded-lg bg-yellow-50 border border-yellow-200 py-6 mb-3">
      <span className="text-lg font-bold text-yellow-600">PARTIALLY COMPLIANT</span>
    </div>
  )
  return (
    <div className="flex items-center justify-center rounded-lg bg-red-50 border border-red-200 py-6 mb-3">
      <span className="text-xl font-bold text-red-500">NOT COMPLIANT</span>
    </div>
  )
}

function WcagCriteriaCard({ audit }: { audit: Audit }) {
  const segments = [
    { count: audit.critical_count ?? 0, color: 'bg-red-500', label: 'Critical Issues', dot: 'bg-red-500' },
    { count: audit.serious_count ?? 0, color: 'bg-orange-400', label: 'Serious Issues', dot: 'bg-orange-400' },
    { count: audit.moderate_count ?? 0, color: 'bg-yellow-400', label: 'Moderate Issues', dot: 'bg-yellow-400' },
    { count: audit.minor_count ?? 0, color: 'bg-blue-400', label: 'Minor Issues', dot: 'bg-blue-400' },
  ]
  const total = segments.reduce((s, x) => s + x.count, 0)

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 flex flex-col">
      <p className="text-sm font-semibold text-gray-700 mb-4">WCAG 2.2 Criteria</p>
      <div className="flex h-2 rounded-full overflow-hidden mb-4 gap-0.5">
        {total === 0
          ? <div className="flex-1 bg-gray-100 rounded-full" />
          : segments.map((seg, i) => seg.count > 0
              ? <div key={i} className={`${seg.color} rounded-full`} style={{ flex: seg.count }} />
              : null)}
      </div>
      <div className="space-y-2.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${seg.dot}`} />
              <span className="text-sm text-gray-600">{seg.label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OverviewSection({ audit, onShare, onRescan, onDownloadPdf, pdfLoading }: OverviewSectionProps) {
  return (
    <div className="px-6 pt-4 pb-5 border-b border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
          <div className="flex items-center gap-1.5">
            <Link2 className="h-4 w-4 text-[#4F46E5]" />
            <a href={audit.website_url} target="_blank" rel="noopener noreferrer"
              className="text-sm text-[#4F46E5] hover:underline font-medium">
              {audit.website_url}
            </a>
            <ExternalLink className="h-3.5 w-3.5 text-[#4F46E5]" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onShare} className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                <Share2 className="h-5 w-5" />
                <span className="text-[10px]">Share</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Share Report</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onRescan} className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                <RotateCcw className="h-5 w-5" />
                <span className="text-[10px]">Rescan</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Rescan Report</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onDownloadPdf} disabled={pdfLoading}
                className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-50">
                {pdfLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                <span className="text-[10px]">PDF</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Download PDF</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Audit Result</p>
          <ComplianceBox score={audit.wcag_score} wcagLevel={audit.wcag_level} />
          <p className="text-xs text-gray-400 leading-relaxed">
            {audit.total_violations === 0
              ? 'No accessibility violations detected.'
              : `Found ${audit.total_violations} violation${audit.total_violations !== 1 ? 's' : ''} across ${audit.pages_scanned} page${audit.pages_scanned !== 1 ? 's' : ''} scanned.`}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Audit Score</p>
          <div className="flex justify-center mb-3">
            {audit.wcag_score != null
              ? <ScoreRingSmall score={audit.wcag_score} />
              : <div className="flex items-center justify-center h-[110px]"><span className="text-3xl font-bold text-gray-300">—</span></div>}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed text-center">
            WCAG compliance score based on severity and count of issues found.
          </p>
        </div>

        <WcagCriteriaCard audit={audit} />
      </div>
    </div>
  )
}
