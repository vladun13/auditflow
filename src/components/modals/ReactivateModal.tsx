import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface ReactivateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planName: string
  onConfirm: () => void
  loading?: boolean
}

export function ReactivateModal({
  open,
  onOpenChange,
  planName,
  onConfirm,
  loading,
}: ReactivateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reactivate Subscription</DialogTitle>
          <DialogDescription>Resume your {planName} plan.</DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
          <RefreshCw className="h-5 w-5 shrink-0 mt-0.5" />
          <p>
            Your subscription will resume immediately and you'll continue to
            receive credits on your next billing date.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-[#4F46E5] hover:bg-[#4338CA]"
          >
            {loading ? 'Reactivating...' : 'Reactivate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
