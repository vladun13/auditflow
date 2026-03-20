import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ShoppingCart, X, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { paymentApi } from '@/lib/api'
import { toast } from 'sonner'

type Step = 'amount' | 'confirm' | 'success'

const PRESET_AMOUNTS = [10, 25, 100, 500]

interface BuyCreditsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Visa card row ────────────────────────────────────────────────────────────

function CardRow({ onChangeCard }: { onChangeCard: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 px-5 py-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-1.5">
          <span className="text-xl font-black italic text-blue-800 tracking-tighter">VISA</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 tracking-widest">
            **** **** **** ****
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Text</p>
        </div>
      </div>
      <button
        onClick={onChangeCard}
        className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Change
      </button>
    </div>
  )
}

// ─── Step 1: Amount selection ─────────────────────────────────────────────────

function AmountStep({
  selectedAmount,
  onSelectAmount,
  customAmount,
  onCustomAmount,
  onCancel,
  onContinue,
}: {
  selectedAmount: number | null
  onSelectAmount: (amount: number) => void
  customAmount: string
  onCustomAmount: (val: string) => void
  onCancel: () => void
  onContinue: () => void
}) {

  return (
    <>
      <CardRow onChangeCard={() => {}} />

      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-900 mb-3">Amount</p>
        <div className="flex gap-2">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => {
                onSelectAmount(amt)
                onCustomAmount('')
              }}
              className={cn(
                'flex-1 rounded-full py-2.5 text-sm font-semibold border transition-colors',
                selectedAmount === amt && customAmount === ''
                  ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                  : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300',
              )}
            >
              ${amt}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-2">Custom Amount</p>
        <div className="flex items-center rounded-xl border border-gray-200 px-4 py-3 focus-within:border-[#4F46E5] transition-colors">
          <span className="text-gray-400 mr-2 text-sm">$</span>
          <input
            type="number"
            min={1}
            placeholder="00"
            value={customAmount}
            onChange={(e) => {
              onCustomAmount(e.target.value)
              onSelectAmount(0) // clear preset
            }}
            className="flex-1 text-sm text-gray-900 outline-none placeholder-gray-300 bg-transparent"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedAmount && !customAmount}
          className="rounded-full bg-[#4F46E5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA] disabled:opacity-40 transition-colors"
        >
          Continue
        </button>
      </div>
    </>
  )
}

// ─── Step 2: Confirmation ─────────────────────────────────────────────────────

function ConfirmStep({
  amount,
  loading,
  onBack,
  onCancel,
  onPurchase,
}: {
  amount: number
  loading: boolean
  onBack: () => void
  onCancel: () => void
  onPurchase: () => void
}) {
  return (
    <>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <CardRow onChangeCard={() => {}} />

      <p className="text-base font-bold text-gray-900 mb-5">Please confirm your purchase</p>

      <div className="flex items-center justify-between py-4 border-t border-b border-gray-100 mb-4">
        <span className="text-sm font-semibold text-gray-900">Amount</span>
        <span className="text-sm font-semibold text-gray-900">${amount.toFixed(2)} USD</span>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed mb-8">
        You are about to purchase ${amount.toFixed(2)} USD worth of credits. Credits will be added
        to your account immediately after payment is confirmed.
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onPurchase}
          disabled={loading}
          className="rounded-full bg-[#4F46E5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA] disabled:opacity-60 transition-colors"
        >
          {loading ? 'Processing…' : 'Purchase Credits'}
        </button>
      </div>
    </>
  )
}

// ─── Step 3: Success ──────────────────────────────────────────────────────────

function SuccessStep({ onGoHome }: { onGoHome: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-4">
      {/* Illustration */}
      <div className="w-full rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 py-8">
        <div className="relative">
          {/* Bill / receipt illustration */}
          <div className="relative w-20 h-24 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center gap-1.5 mx-auto">
            <div className="text-xs font-bold text-gray-700">BILL</div>
            <div className="w-12 h-1 rounded bg-gray-200" />
            <div className="w-10 h-1 rounded bg-gray-200" />
            <div className="w-12 h-1 rounded bg-gray-200" />
            {/* Check badge */}
            <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#4F46E5] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          {/* Dollar coin */}
          <div className="absolute -bottom-3 -left-5 w-9 h-9 rounded-full bg-[#4F46E5] flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">$</span>
          </div>
          {/* Brick stack decorations */}
          <div className="absolute -bottom-2 -right-6 flex gap-1">
            <div className="w-3 h-6 rounded-sm bg-[#4F46E5] opacity-70" />
            <div className="w-3 h-4 rounded-sm bg-[#4F46E5] opacity-50" />
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">Thank you for your purchase!</h3>
      <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-8">
        Your credits have been added to your account and are ready to use.
      </p>

      <button
        onClick={onGoHome}
        className="w-full rounded-full bg-[#4F46E5] py-3 text-sm font-semibold text-white hover:bg-[#4338CA] transition-colors"
      >
        Go to Homepage
      </button>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function BuyCreditsModal({ open, onOpenChange }: BuyCreditsModalProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('amount')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10)
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const finalAmount =
    customAmount !== '' ? parseFloat(customAmount) : (selectedAmount ?? 0)

  const handleClose = () => {
    onOpenChange(false)
    // reset after animation
    setTimeout(() => {
      setStep('amount')
      setSelectedAmount(10)
      setCustomAmount('')
    }, 300)
  }

  const handlePurchase = async () => {
    setLoading(true)
    try {
      // Map amount to closest pack or use basic as default
      const pack = finalAmount >= 500 ? 'enterprise' : finalAmount >= 100 ? 'pro' : 'basic'
      const { data, error } = await paymentApi.createCheckout(pack)
      if (error || !data) {
        toast.error(error || 'Failed to start checkout')
        setLoading(false)
        return
      }
      // If checkout returns a URL, redirect; otherwise show success step
      const url = (data as { url?: string }).url
      if (url) {
        // Only allow https:// URLs to prevent open redirect attacks
        if (!url.startsWith('https://')) {
          toast.error('Invalid checkout URL')
          setLoading(false)
          return
        }
        window.location.href = url
      } else {
        setStep('success')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const STEP_TITLES: Record<Step, string> = {
    amount: 'Buy credits',
    confirm: 'Buy credits',
    success: '',
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 rounded-2xl overflow-hidden">
        {step !== 'success' && (
          <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="h-5 w-5 text-[#4F46E5]" />
              <span className="text-base font-bold text-gray-900">{STEP_TITLES[step]}</span>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="flex justify-end px-7 pt-5">
            <button
              onClick={handleClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="px-7 py-6">
          {step === 'amount' && (
            <AmountStep
              selectedAmount={selectedAmount}
              onSelectAmount={setSelectedAmount}
              customAmount={customAmount}
              onCustomAmount={setCustomAmount}
              onCancel={handleClose}
              onContinue={() => {
                if (customAmount !== '') {
                  const parsed = parseFloat(customAmount)
                  if (!isFinite(parsed) || parsed < 1) {
                    toast.error('Please enter a valid amount (minimum $1)')
                    return
                  }
                }
                setStep('confirm')
              }}
            />
          )}

          {step === 'confirm' && (
            <ConfirmStep
              amount={finalAmount}
              loading={loading}
              onBack={() => setStep('amount')}
              onCancel={handleClose}
              onPurchase={handlePurchase}
            />
          )}

          {step === 'success' && (
            <SuccessStep
              onGoHome={() => {
                handleClose()
                navigate('/dashboard')
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
