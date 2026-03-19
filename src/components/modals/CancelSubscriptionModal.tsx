import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface CancelSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  loading?: boolean
}

export function CancelSubscriptionModal({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: CancelSubscriptionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogDescription>Are you sure you want to cancel?</DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>
            Your subscription will remain active until end of billing period.
            Credits already purchased won't expire.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : 'Cancel Subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
