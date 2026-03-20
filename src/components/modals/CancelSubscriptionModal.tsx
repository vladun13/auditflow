import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { CalendarX2, X, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const REASONS = [
  "I'm just not ready to launch my business I'm leaving for another competitor",
  "I was just testing the platform",
  "Lack of features",
  "Customer support was neither accessible nor helpful",
  "AuditFlow doesn't support my language",
  "I'm closing or selling my business",
]

const MAX_COMMENT = 100

interface CancelSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancelled: () => void
}

export function CancelSubscriptionModal({
  open,
  onOpenChange,
  onCancelled,
}: CancelSubscriptionModalProps) {
  const [step, setStep] = useState<'reason' | 'success'>('reason')
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep('reason')
      setSelectedReason(null)
      setComment('')
    }, 300)
  }

  const handleCancel = async () => {
    setLoading(true)
    // Simulate API call — backend cancellation not yet connected
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    setStep('success')
  }

  const handleDone = () => {
    handleClose()
    onCancelled()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <CalendarX2 className="h-5 w-5 text-[#4F46E5]" />
            <span className="text-base font-bold text-gray-900">
              {step === 'reason' ? 'Cancel Subscription' : 'Subscription Cancelled'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        {step === 'reason' ? (
          <div className="px-7 py-6">
            <p className="text-sm text-gray-600 mb-4">
              Please tell us more about why you are leaving (optional):
            </p>

            {/* Reason list */}
            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 mb-5">
              {REASONS.map(reason => (
                <label
                  key={reason}
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50/60 transition-colors"
                >
                  <input
                    type="radio"
                    name="cancel-reason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="h-4 w-4 accent-[#4F46E5] shrink-0 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            {/* Other comments */}
            <p className="text-sm font-medium text-gray-700 mb-2">Other comments</p>
            <div className="relative">
              <textarea
                placeholder="Text"
                maxLength={MAX_COMMENT}
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#4F46E5] resize-none transition-colors"
              />
              <span className="absolute bottom-3 right-3 text-xs text-gray-400">
                {comment.length} / {MAX_COMMENT}
              </span>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleClose}
                className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Don't Cancel
              </button>
              <button
                onClick={handleCancel}
                disabled={!selectedReason || loading}
                className={cn(
                  'rounded-full px-6 py-2.5 text-sm font-semibold transition-colors',
                  selectedReason
                    ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                    : 'bg-gray-100 text-gray-400 cursor-default',
                )}
              >
                {loading ? 'Cancelling…' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        ) : (
          <div className="px-7 py-8 flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 leading-relaxed">
                Your account has been scheduled for cancellation successfully.
                You won't be billed again
              </p>
            </div>

            <button
              onClick={handleDone}
              className="w-full rounded-full bg-[#4F46E5] py-3 text-sm font-semibold text-white hover:bg-[#4338CA] transition-colors"
            >
              Back to Plans & Credits
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
