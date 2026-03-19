import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface ShareReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auditUrl: string
}

export function ShareReportModal({ open, onOpenChange, auditUrl }: ShareReportModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(auditUrl)
      setCopied(true)
      toast('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            Anyone with the link can view this report (login required).
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
          <span className="text-sm text-muted-foreground truncate flex-1">
            {auditUrl}
          </span>
        </div>

        <DialogFooter>
          <Button onClick={handleCopy} className="w-full">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
