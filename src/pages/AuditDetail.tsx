import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAudit } from '@/hooks/useAudit'
import { generatePdf } from '@/lib/pdf'
import { PdfReport } from '@/components/pdf/PdfReport'
import { Button } from '@/components/ui/button'
import { ScanningView } from '@/components/audit-detail/ScanningView'
import { AuditDetailSkeleton } from '@/components/skeletons/AuditDetailSkeleton'
import { OverviewSection } from '@/components/audit-detail/OverviewSection'
import { IssuesSidebar } from '@/components/audit-detail/IssuesSidebar'
import { ViolationDetails } from '@/components/audit-detail/ViolationDetails'
import { HowToFix } from '@/components/audit-detail/HowToFix'
import { ShareReportModal } from '@/components/modals/ShareReportModal'
import { RescanModal } from '@/components/modals/RescanModal'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import type { Violation } from '@/types'

export function AuditDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { audit, loading } = useAudit(id)
  const pdfRef = useRef<HTMLDivElement>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [rescanOpen, setRescanOpen] = useState(false)
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleDownloadPdf = async () => {
    if (!pdfRef.current || !audit) return
    setPdfLoading(true)
    try {
      await generatePdf(pdfRef.current, `auditflow-report-${audit.id}.pdf`)
    } catch {
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setPdfLoading(false)
    }
  }

  const handleSelectViolation = (v: Violation) => {
    setSelectedViolation(v)
  }

  if (loading) return <AuditDetailSkeleton />

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
    return <ScanningView currentStep={0} />
  }

  if (audit.status === 'failed') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="max-w-md text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Scan failed</h2>
          <p className="text-sm text-gray-500">
            Something went wrong while scanning {audit.website_url}. Please try again.
          </p>
          <Button onClick={() => navigate('/scan')}>Try Again</Button>
        </div>
      </div>
    )
  }

  const violations = audit.violations || []
  const firstViolation = selectedViolation ?? violations[0] ?? null

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Hidden PDF target */}
      <div style={{ position: 'fixed', left: 0, top: 0, width: '210mm', overflow: 'hidden', height: 0, zIndex: -1, opacity: 0, pointerEvents: 'none' }}>
        <div ref={pdfRef}><PdfReport audit={audit} /></div>
      </div>

      <ShareReportModal open={shareOpen} onOpenChange={setShareOpen} auditUrl={window.location.href} />
      <RescanModal
        open={rescanOpen}
        onOpenChange={setRescanOpen}
        onConfirm={() => navigate(`/scan?url=${encodeURIComponent(audit.website_url)}`)}
      />

      {/* Back link */}
      <div className="px-6 pt-4 pb-1 shrink-0">
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-1.5 text-sm text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      </div>

      {/* Overview section */}
      <OverviewSection
        audit={audit}
        onShare={() => setShareOpen(true)}
        onRescan={() => setRescanOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        pdfLoading={pdfLoading}
      />

      {/* 3-column panel */}
      {violations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Document */}
              <rect x="42" y="28" width="90" height="118" rx="8" fill="#EEF0FF" stroke="#C7CBF9" strokeWidth="1.5"/>
              <line x1="60" y1="62" x2="114" y2="62" stroke="#C7CBF9" strokeWidth="2" strokeLinecap="round"/>
              <line x1="60" y1="76" x2="114" y2="76" stroke="#C7CBF9" strokeWidth="2" strokeLinecap="round"/>
              <line x1="60" y1="90" x2="96" y2="90" stroke="#C7CBF9" strokeWidth="2" strokeLinecap="round"/>
              <line x1="60" y1="104" x2="104" y2="104" stroke="#C7CBF9" strokeWidth="2" strokeLinecap="round"/>
              <line x1="60" y1="118" x2="88" y2="118" stroke="#C7CBF9" strokeWidth="2" strokeLinecap="round"/>
              {/* Star */}
              <path d="M68 150 L72.5 137 L60 129 L74 129 L78.5 116 L83 129 L97 129 L84.5 137 L89 150 L78.5 142 Z" fill="#C4B5FD" stroke="#A78BFA" strokeWidth="1"/>
              {/* Badge circle */}
              <circle cx="118" cy="136" r="22" fill="#3B82F6" stroke="white" strokeWidth="3"/>
              {/* Checkmark */}
              <path d="M108 136 L115 143 L129 129" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Ribbon left */}
              <path d="M107 156 L110 168 L118 161" fill="#2563EB"/>
              {/* Ribbon right */}
              <path d="M129 156 L126 168 L118 161" fill="#2563EB"/>
            </svg>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Issues Found</h3>
              <p className="text-sm text-gray-500">Great news! We didn't detect any significant<br />accessibility issues.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
          {/* Left: Issues list */}
          <div className={`overflow-hidden flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'w-full lg:w-14 h-14 lg:h-full' : 'w-full lg:w-[270px] h-48 lg:h-full'}`}>
            <IssuesSidebar
              violations={violations}
              selectedId={firstViolation?.id ?? null}
              onSelect={handleSelectViolation}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(c => !c)}
            />
          </div>

          {/* Center: Details */}
          <div className="flex-1 overflow-hidden min-w-0">
            <ViolationDetails violation={firstViolation} />
          </div>

          {/* Right: How to Fix */}
          <div className="hidden lg:block w-[340px] shrink-0 overflow-hidden">
            <HowToFix violation={firstViolation} />
          </div>
        </div>
      )}
    </div>
  )
}
