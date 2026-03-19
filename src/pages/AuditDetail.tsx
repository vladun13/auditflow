import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAudit } from '@/hooks/useAudit'
import { generatePdf } from '@/lib/pdf'
import { PdfReport } from '@/components/pdf/PdfReport'
import { Button } from '@/components/ui/button'
import { ScoreRing } from '@/components/audit-detail/ScoreRing'
import { ScanningView } from '@/components/audit-detail/ScanningView'
import { AuditHeader } from '@/components/audit-detail/AuditHeader'
import { ViolationList } from '@/components/audit-detail/ViolationList'
import { AuditDetailSkeleton } from '@/components/skeletons/AuditDetailSkeleton'
import { AlertTriangle } from 'lucide-react'

export function AuditDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { audit, loading } = useAudit(id)
  const [scanStep, setScanStep] = useState(0)
  const pdfRef = useRef<HTMLDivElement>(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  // Simulated step advancement for scanning state
  useEffect(() => {
    if (audit?.status !== 'scanning') {
      setScanStep(0)
      return
    }

    const timer1 = setTimeout(() => setScanStep(1), 5000)
    const timer2 = setTimeout(() => setScanStep(2), 10000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [audit?.status])

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

  if (loading) {
    return <AuditDetailSkeleton />
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
    return <ScanningView currentStep={scanStep} />
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

  // Completed state
  const violations = audit.violations || []
  const statCards = [
    { label: 'Pages Scanned', value: audit.pages_scanned ?? 0 },
    { label: 'Total Violations', value: audit.total_violations ?? 0 },
    { label: 'Critical', value: audit.critical_count ?? 0, color: 'text-red-600' },
    { label: 'Serious', value: audit.serious_count ?? 0, color: 'text-orange-600' },
    { label: 'Moderate', value: audit.moderate_count ?? 0, color: 'text-yellow-600' },
    { label: 'Minor', value: audit.minor_count ?? 0, color: 'text-blue-600' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AuditHeader
        audit={audit}
        onBack={() => navigate('/reports')}
        onDownloadPdf={handleDownloadPdf}
        pdfLoading={pdfLoading}
      />

      {/* Hidden PDF report for html2pdf.js capture */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '210mm',
          overflow: 'hidden',
          height: 0,
          zIndex: -1,
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <div ref={pdfRef}>
          <PdfReport audit={audit} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          {/* Summary row: ScoreRing + stat cards */}
          <div className="flex items-start gap-8">
            <div className="shrink-0">
              {audit.wcag_score != null ? (
                <ScoreRing score={audit.wcag_score} wcagLevel={audit.wcag_level} />
              ) : (
                <div className="flex items-center justify-center" style={{ width: 160, height: 160 }}>
                  <p className="text-4xl font-bold text-gray-300">--</p>
                </div>
              )}
            </div>
            <div className="flex-1 grid grid-cols-3 gap-4">
              {statCards.map(card => (
                <div key={card.label} className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.color || 'text-gray-900'}`}>
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Violations section */}
          {violations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No violations found</p>
          ) : (
            <ViolationList violations={violations} />
          )}
        </div>
      </div>
    </div>
  )
}
