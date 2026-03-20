import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ScanSearch, X } from 'lucide-react'

interface RescanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function RescanModal({ open, onOpenChange, onConfirm }: RescanModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-50">
              <ScanSearch className="h-4.5 w-4.5 text-[#4F46E5]" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Rescan Website?</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-600 mb-6">
            Starting a new scan will replace the results from your previous audit. This action cannot be undone.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onOpenChange(false); onConfirm() }}
              className="px-5 py-2 rounded-lg bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338CA] transition-colors"
            >
              Rescan
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
