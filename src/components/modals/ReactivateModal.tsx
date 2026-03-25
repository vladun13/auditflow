import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { RefreshCw, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReactivateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planName?: string
  planPrice?: number
  nextBillingDate?: string
  onConfirm: () => void
}

export function ReactivateModal({
  open,
  onOpenChange,
  
  planPrice = 149,
  nextBillingDate,
  onConfirm,
}: ReactivateModalProps) {
  const [loading, setLoading] = useState(false)

  // Default next billing: ~30 days from now
  const billingDate = nextBillingDate ?? (() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      .replace(/(\w+ )(\d+)(, \d+)/, (_, m, day, rest) => {
        const suffix = ['th','st','nd','rd'][
          [11,12,13].includes(+day) ? 0 : Math.min(+day % 10, 3)
        ] ?? 'th'
        return `${m}${day}${suffix}${rest}`
      })
  })()

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    onOpenChange(false)
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="h-5 w-5 text-[#4F46E5]" />
            <span className="text-base font-bold text-gray-900">Reactivate your Subscription</span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-7">
          <p className="text-sm text-gray-600 leading-relaxed mb-8">
            You will be charged{' '}
            <span className="font-semibold text-gray-900">${planPrice}</span>{' '}
            on{' '}
            <span className="font-semibold text-gray-900">{billingDate}</span>{' '}
            and will automatically renew every year at the then-current rate until canceled.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={cn(
                'rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-colors',
                loading
                  ? 'bg-[#4F46E5]/60 cursor-default'
                  : 'bg-[#4F46E5] hover:bg-[#4338CA]',
              )}
            >
              {loading ? 'Reactivating…' : 'Confirm Reactivation'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
