import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Share2, RefreshCw } from 'lucide-react'

interface AuditHeaderProps {
  onBack: () => void
  onDownload: () => void
  downloading: boolean
}

export function AuditHeader({ onBack, onDownload, downloading }: AuditHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
      <button
        onClick={onBack}
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
        <Button size="sm" onClick={onDownload} disabled={downloading} className="gap-1.5 text-xs bg-[#4F46E5] hover:bg-[#4338CA]">
          <Download className="h-3.5 w-3.5" />
          PDF
        </Button>
      </div>
    </div>
  )
}
