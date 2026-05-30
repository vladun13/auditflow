import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { paymentApi } from '@/lib/api'
import { Check } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

// ─── Plan data ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'free',
    apiName: null,
    name: 'Free',
    price: 0,
    scans: 3,
    pagesPerScan: '3',
    costPerScan: null,
    popular: false,
    note: 'No credit card required',
    perfectFor: 'trying AuditFlow on one site before you commit',
    features: [
      '3 scans included',
      '3 pages per scan',
      'Export results as PDF',
    ],
    cta: 'Get Started',
  },
  {
    id: 'starter',
    apiName: 'basic',
    name: 'Starter',
    price: 29,
    scans: 50,
    pagesPerScan: '10',
    costPerScan: '$0.58 per scan',
    popular: false,
    note: null,
    perfectFor: 'freelancers and small teams auditing client sites',
    features: [
      '50 scans included',
      '10 pages per scan',
      'PDF export',
      'Email support',
    ],
    cta: 'Buy Now',
  },
  {
    id: 'pro',
    apiName: 'pro',
    name: 'Pro',
    price: 79,
    scans: 150,
    pagesPerScan: '30',
    costPerScan: '$0.53 per scan',
    popular: true,
    note: null,
    perfectFor: 'accessibility consultants and agencies running regular audits',
    features: [
      '150 scans included',
      '30 pages per scan',
      'PDF export',
      'Priority email support',
    ],
    cta: 'Buy Now',
  },
  {
    id: 'enterprise',
    apiName: 'enterprise',
    name: 'Enterprise',
    price: 149,
    scans: 400,
    pagesPerScan: 'Unlimited',
    costPerScan: '$0.37 per scan',
    popular: false,
    note: null,
    perfectFor: 'teams managing multiple properties or large applications',
    features: [
      '400 scans included',
      'Unlimited pages per scan',
      'PDF export',
      'Priority support',
    ],
    cta: 'Buy Now',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<string | null>(null)

  const handleCta = async (plan: typeof PLANS[number]) => {
    if (!plan.apiName) {
      // Free plan
      navigate(user ? '/scan' : '/signup')
      return
    }
    if (!user) {
      navigate('/signup')
      return
    }
    setLoading(plan.apiName)
    const { data, error } = await paymentApi.createCheckout(plan.apiName)
    if (error || !data) {
      alert(error || 'Failed to create checkout session')
      setLoading(null)
      return
    }
    window.location.href = (data as { url: string }).url
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <Navbar />

      <div className="pt-20 pb-24 px-4">
        {/* Hero */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple pricing. Per scan, not per page.
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">
            One credit = one full accessibility audit. No hidden limits, no surprise invoices.
          </p>
        </div>

        {/* Plan cards */}
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-6 flex flex-col ${
                plan.popular
                  ? 'border-2 border-[#4F46E5] shadow-md shadow-indigo-100'
                  : 'border border-gray-150 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-white border border-[#4F46E5] text-[#4F46E5] text-xs font-semibold rounded-full px-3 py-1 shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan name */}
              <div className="mb-3">
                <span className="text-base font-semibold text-gray-900">{plan.name}</span>
              </div>

              {/* Price */}
              <div className="flex items-end gap-1 mb-1">
                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                {plan.price > 0 && (
                  <span className="text-sm text-gray-400 mb-1">one-time</span>
                )}
              </div>

              {/* Cost per scan */}
              {plan.costPerScan ? (
                <p className="text-xs text-gray-400 mb-5">Roughly {plan.costPerScan}</p>
              ) : (
                <p className="text-xs text-gray-400 mb-5">&nbsp;</p>
              )}

              {/* CTA button */}
              {plan.popular ? (
                <button
                  onClick={() => handleCta(plan)}
                  disabled={loading === plan.apiName}
                  className="w-full rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold py-2.5 transition-colors mb-2 disabled:opacity-60"
                >
                  {loading === plan.apiName ? 'Processing…' : plan.cta}
                </button>
              ) : (
                <button
                  onClick={() => handleCta(plan)}
                  disabled={loading === plan.apiName}
                  className="w-full rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold py-2.5 transition-colors mb-2 disabled:opacity-60"
                >
                  {loading === plan.apiName ? 'Processing…' : plan.cta}
                </button>
              )}

              {/* No credit card note */}
              {plan.note && (
                <p className="text-xs text-center text-gray-400 mb-4">{plan.note}</p>
              )}
              {!plan.note && <div className="mb-4" />}

              {/* Divider */}
              <div className="border-t border-gray-100 mb-4" />

              {/* Perfect for */}
              <p className="text-xs text-gray-500 italic mb-4">
                Perfect for: {plan.perfectFor}
              </p>

              {/* Features */}
              <ul className="space-y-2.5">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
