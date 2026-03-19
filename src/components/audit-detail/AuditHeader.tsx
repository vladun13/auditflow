import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Audit } from '@/types'
import { formatRelativeTime } from '@/lib/format'

interface AuditHeaderProps {
  audit: Audit
  onBack: () => void
}

export function AuditHeader({ audit, onBack }: AuditHeaderProps) {
  const handleDownloadPdf = () => {
    toast('PDF report generation coming soon', {
      description: 'This feature will be available in a future update.',
    })
  }

  const handleShare = () => {
    toast('Share report coming soon', {
      description: 'This feature will be available in a future update.',
    })
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <a
            href={audit.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#4F46E5] hover:underline"
          >
            {audit.website_url}
          </a>
          <span className="text-xs text-gray-400">
            {formatRelativeTime(audit.created_at)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleShare}>
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownloadPdf}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  )
}
