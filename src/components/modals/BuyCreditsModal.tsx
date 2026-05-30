import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ShoppingCart, X, ChevronLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { paymentApi } from '@/lib/api'
import { toast } from 'sonner'

type Step = 'amount' | 'confirm' | 'success'

interface Plan {
  id: 'basic' | 'pro' | 'enterprise'
  name: string
  price: number
  credits: number
  maxPages: string
  popular?: boolean
}

const PLANS: Plan[] = [
  { id: 'basic', name: 'Starter', price: 29, credits: 50, maxPages: '10 pages' },
  { id: 'pro', name: 'Pro', price: 79, credits: 150, maxPages: '30 pages', popular: true },
  { id: 'enterprise', name: 'Enterprise', price: 149, credits: 400, maxPages: 'Unlimited pages' },
]

interface BuyCreditsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Step 1: Plan selection ───────────────────────────────────────────────────

function AmountStep({
  selectedPlan,
  onSelectPlan,
  onCancel,
  onContinue,
}: {
  selectedPlan: Plan
  onSelectPlan: (plan: Plan) => void
  onCancel: () => void
  onContinue: () => void
}) {
  return (
    <>
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-900 mb-3">Select a credit pack</p>
        <div className="flex flex-col gap-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => onSelectPlan(plan)}
              className={cn(
                'relative flex items-center justify-between rounded-xl border px-5 py-4 text-left transition-colors',
                selectedPlan.id === plan.id
                  ? 'border-[#4F46E5] bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300',
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                  selectedPlan.id === plan.id
                    ? 'border-[#4F46E5] bg-[#4F46E5]'
                    : 'border-gray-300',
                )}>
                  {selectedPlan.id === plan.id && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{plan.name}</span>
                    {plan.popular && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">Popular</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {plan.credits} audit credit{plan.credits !== 1 ? 's' : ''} · {plan.maxPages}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">${plan.price}</span>
            </button>
          ))}
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
          className="rounded-full bg-[#4F46E5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA] transition-colors"
        >
          Continue
        </button>
      </div>
    </>
  )
}

// ─── Step 2: Confirmation ─────────────────────────────────────────────────────

function ConfirmStep({
  plan,
  loading,
  onBack,
  onCancel,
  onPurchase,
}: {
  plan: Plan
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

      <p className="text-base font-bold text-gray-900 mb-5">Please confirm your purchase</p>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Plan</span>
          <span className="text-sm font-semibold text-gray-900">{plan.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Credits</span>
          <span className="text-sm font-semibold text-gray-900">
            {plan.credits} audit credit{plan.credits !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Max pages per scan</span>
          <span className="text-sm font-semibold text-gray-900">{plan.maxPages}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Total</span>
          <span className="text-sm font-semibold text-gray-900">${plan.price} USD</span>
        </div>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed mb-8">
        You will be redirected to our secure payment page. Credits are added to your account
        immediately after payment is confirmed.
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
          {loading ? 'Redirecting…' : 'Purchase Credits'}
        </button>
      </div>
    </>
  )
}

// ─── Step 3: Success (shown if checkout URL isn't returned) ───────────────────

function SuccessStep({ onGoHome }: { onGoHome: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-4">
      <div className="w-full rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 py-8">
        <div className="relative">
          <div className="relative w-20 h-24 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center gap-1.5 mx-auto">
            <div className="text-xs font-bold text-gray-700">BILL</div>
            <div className="w-12 h-1 rounded bg-gray-200" />
            <div className="w-10 h-1 rounded bg-gray-200" />
            <div className="w-12 h-1 rounded bg-gray-200" />
            <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#4F46E5] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="absolute -bottom-3 -left-5 w-9 h-9 rounded-full bg-[#4F46E5] flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">$</span>
          </div>
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
        Go to Dashboard
      </button>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function BuyCreditsModal({ open, onOpenChange }: BuyCreditsModalProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('amount')
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[1]) // default to Pro
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep('amount')
      setSelectedPlan(PLANS[1])
    }, 300)
  }

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const { data, error } = await paymentApi.createCheckout(selectedPlan.id)
      if (error || !data) {
        toast.error(error || 'Failed to start checkout')
        setLoading(false)
        return
      }
      const url = (data as { url?: string }).url
      if (url) {
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
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              onCancel={handleClose}
              onContinue={() => setStep('confirm')}
            />
          )}

          {step === 'confirm' && (
            <ConfirmStep
              plan={selectedPlan}
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
