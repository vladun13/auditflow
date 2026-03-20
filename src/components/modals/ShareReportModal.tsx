import { useState, KeyboardEvent } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Link2, X, Trash2, Share2, Timer } from 'lucide-react'
import { toast } from 'sonner'

interface Viewer {
  email: string
  addedAt: Date
}

interface ShareReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auditUrl: string
}

type Expiration = '30' | '90' | 'never'

function expiryLabel(exp: Expiration): string {
  if (exp === 'never') return 'Never'
  const d = new Date()
  d.setDate(d.getDate() + parseInt(exp))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ShareReportModal({ open, onOpenChange, auditUrl }: ShareReportModalProps) {
  const [emailInput, setEmailInput] = useState('')
  const [pendingEmails, setPendingEmails] = useState<string[]>([])
  const [viewers, setViewers] = useState<Viewer[]>([])
  const [expiration, setExpiration] = useState<Expiration>('never')

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const parseEmails = (raw: string) =>
    raw.split(',').map(e => e.trim()).filter(isValidEmail)

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const emails = parseEmails(emailInput)
      if (emails.length > 0) {
        setPendingEmails(prev => [...new Set([...prev, ...emails])])
        setEmailInput('')
      }
    }
    if (e.key === 'Backspace' && emailInput === '' && pendingEmails.length > 0) {
      setPendingEmails(prev => prev.slice(0, -1))
    }
  }

  const removePending = (email: string) =>
    setPendingEmails(prev => prev.filter(e => e !== email))

  const handleAdd = () => {
    const fromInput = parseEmails(emailInput)
    const all = [...new Set([...pendingEmails, ...fromInput])]
    if (all.length === 0) return

    const newViewers: Viewer[] = all.map(email => ({ email, addedAt: new Date() }))
    setViewers(prev => {
      const existingEmails = new Set(prev.map(v => v.email))
      return [...prev, ...newViewers.filter(v => !existingEmails.has(v.email))]
    })
    toast.success(`Shared Report with ${all.join(', ')}`)
    setPendingEmails([])
    setEmailInput('')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(auditUrl)
      toast.success('Share link copied to clipboard')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const removeViewer = (email: string) =>
    setViewers(prev => prev.filter(v => v.email !== email))

  const hasInput = pendingEmails.length > 0 || emailInput.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-50">
              <Share2 className="h-4.5 w-4.5 text-[#4F46E5]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Share Report</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Public link */}
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Users without an Audit Flow account can open a public report link
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 mb-3">
              <span className="text-sm text-gray-500 truncate flex-1 font-mono">{auditUrl}</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Link2 className="h-4 w-4" />
              Copy Link
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Add viewers */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-0.5">Add viewers</p>
            <p className="text-xs text-gray-500 mb-3">
              Each viewer will receive an email with a secure link to this report
            </p>
            <div className="flex gap-2">
              {/* Tag input */}
              <div className="flex-1 min-h-[38px] flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 focus-within:border-[#4F46E5] focus-within:ring-2 focus-within:ring-indigo-100 transition">
                {pendingEmails.map(email => (
                  <span key={email} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs rounded-md px-2 py-0.5">
                    {email}
                    <button onClick={() => removePending(email)} className="hover:text-indigo-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={pendingEmails.length === 0 ? 'Add comma-separated emails to invite' : ''}
                  className="flex-1 min-w-[120px] text-sm outline-none bg-transparent placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!hasInput}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  hasInput
                    ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Add
              </button>
            </div>
          </div>

          {/* Expiration */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 shrink-0">
              <Timer className="h-4 w-4 text-[#4F46E5]" />
              Expiration date:
            </div>
            <div className="flex items-center gap-4">
              {(['30', '90', 'never'] as Expiration[]).map(opt => (
                <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="expiration"
                    checked={expiration === opt}
                    onChange={() => setExpiration(opt)}
                    className="accent-[#4F46E5]"
                  />
                  <span className="text-sm text-gray-700">
                    {opt === 'never' ? 'Never' : `${opt} days`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Who has access */}
          {viewers.length > 0 && (
            <>
              <div className="border-t border-gray-100" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-semibold text-gray-900">Who has access</p>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">View Only</span>
                </div>
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {viewers.map(viewer => (
                    <div key={viewer.email} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-indigo-600">
                          {viewer.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">{viewer.email}</span>
                          <span className="text-xs text-[#4F46E5] shrink-0">· Invite sent</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {expiration === 'never' ? 'Access never expires' : `Access expires ${expiryLabel(expiration)}`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeViewer(viewer.email)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
