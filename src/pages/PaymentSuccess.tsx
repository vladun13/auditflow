import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { paymentApi } from '@/lib/api'
import { Loader2, XCircle } from 'lucide-react'

function SuccessIllustration() {
  return (
    <div className="w-full bg-indigo-50 rounded-t-2xl flex items-center justify-center py-10 px-8">
      <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="20" y="110" width="32" height="14" rx="3" fill="#4F46E5" opacity="0.7"/>
        <rect x="56" y="110" width="32" height="14" rx="3" fill="#4F46E5" opacity="0.5"/>
        <rect x="92" y="110" width="32" height="14" rx="3" fill="#4F46E5" opacity="0.3"/>
        <rect x="128" y="110" width="32" height="14" rx="3" fill="#4F46E5" opacity="0.5"/>
        <rect x="164" y="110" width="20" height="14" rx="3" fill="#4F46E5" opacity="0.4"/>
        <rect x="36" y="98" width="32" height="14" rx="3" fill="#4F46E5" opacity="0.4"/>
        <rect x="72" y="98" width="32" height="14" rx="3" fill="#4F46E5" opacity="0.3"/>
        <rect x="108" y="98" width="32" height="14" rx="3" fill="#4F46E5" opacity="0.4"/>
        <rect x="148" y="98" width="28" height="14" rx="3" fill="#4F46E5" opacity="0.3"/>
        <rect x="72" y="20" width="80" height="100" rx="8" fill="white" stroke="#E0E7FF" strokeWidth="1.5"/>
        <rect x="84" y="52" width="56" height="5" rx="2" fill="#C7D2FE"/>
        <rect x="84" y="62" width="40" height="5" rx="2" fill="#C7D2FE"/>
        <rect x="84" y="72" width="48" height="5" rx="2" fill="#C7D2FE"/>
        <rect x="84" y="82" width="36" height="5" rx="2" fill="#C7D2FE"/>
        <rect x="84" y="32" width="32" height="12" rx="3" fill="#4F46E5"/>
        <text x="88" y="42" fill="white" fontSize="8" fontWeight="700" fontFamily="sans-serif">BILL</text>
        <circle cx="140" cy="80" r="22" fill="#4F46E5"/>
        <path d="M129 80 L137 88 L152 72" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="52" cy="100" r="24" fill="#4F46E5"/>
        <circle cx="52" cy="100" r="19" fill="#6366F1"/>
        <text x="46" y="107" fill="white" fontSize="18" fontWeight="700" fontFamily="sans-serif">$</text>
      </svg>
    </div>
  )
}

type Status = 'loading' | 'success' | 'already_processed' | 'error' | 'no_order'

export function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')
  const [creditsAdded, setCreditsAdded] = useState<number | null>(null)

  useEffect(() => {
    const orderId = searchParams.get('order_id')
    if (!orderId) {
      setStatus('no_order')
      return
    }

    paymentApi.confirmPayment(orderId).then(({ data, error }) => {
      if (error) {
        setStatus('error')
        return
      }
      const result = data as { success: boolean; credits_added?: number; message?: string }
      if (result?.success) {
        if (result.message === 'Payment already processed') {
          setStatus('already_processed')
        } else {
          setCreditsAdded(result.credits_added ?? null)
          setStatus('success')
        }
      } else {
        setStatus('error')
      }
    })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-200/60 flex items-center justify-center p-4">
      <Dialog open>
        <DialogContent className="sm:max-w-[440px] p-0 gap-0 rounded-2xl overflow-hidden [&>button]:hidden">
          {status === 'loading' && (
            <>
              <SuccessIllustration />
              <div className="px-8 py-7 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Confirming your payment…</p>
              </div>
            </>
          )}

          {(status === 'success' || status === 'already_processed') && (
            <>
              <SuccessIllustration />
              <div className="px-8 py-7 text-center">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Thank you for your purchase!</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  {creditsAdded != null
                    ? `${creditsAdded} credit${creditsAdded !== 1 ? 's' : ''} have been added to your account and are ready to use.`
                    : 'Your credits have been added to your account and are ready to use.'}
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold py-3 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </>
          )}

          {(status === 'error' || status === 'no_order') && (
            <div className="px-8 py-10 text-center">
              <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {status === 'no_order'
                  ? 'No order found. If you completed a purchase, please contact support.'
                  : 'We could not confirm your payment. Your credits may still be added automatically. Please check your account in a few minutes or contact support.'}
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold py-3 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
