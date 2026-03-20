import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/hooks/useCredits'
import { paymentApi } from '@/lib/api'
import { Check, Zap } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

// ─── Plan data ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'free',
    apiName: null,
    name: 'Free',
    badge: '1 audit',
    badgeColor: 'bg-gray-100 text-gray-600',
    price: 0,
    credits: 450,
    popular: false,
    features: [
      'Feature One',
      'Feature Two',
      'Feature Three',
      'Feature Four',
    ],
    featureLabel: 'Includes everything in Free:',
  },
  {
    id: 'starter',
    apiName: 'basic',
    name: 'Starter',
    badge: '5-pack',
    badgeColor: 'bg-green-50 text-green-700 border border-green-200',
    price: 149,
    credits: 1000,
    popular: true,
    features: [
      'Feature One',
      'Feature Two',
      'Feature Three',
      'Feature Four',
      'Feature Five',
      'Feature Six',
    ],
    featureLabel: 'Includes everything in Free:',
  },
  {
    id: 'advanced',
    apiName: 'pro',
    name: 'Advanced',
    badge: '10-pack',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200',
    price: 299,
    credits: 2000,
    popular: false,
    features: [
      'Feature One',
      'Feature Two',
      'Feature Three',
      'Feature Four',
      'Feature Five',
      'Feature Six',
      'Feature Seven',
      'Feature Eight',
    ],
    featureLabel: 'Includes everything in Advanced:',
  },
  {
    id: 'enterprise',
    apiName: 'enterprise',
    name: 'Enterprise',
    badge: '20-pack',
    badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200',
    price: 499,
    credits: 3000,
    popular: false,
    features: [
      'Feature One',
      'Feature Two',
      'Feature Three',
      'Feature Four',
      'Feature Five',
      'Feature Six',
      'Feature Seven',
      'Feature Eight',
      'Feature Nine',
      'Feature Ten',
      'Feature Eleven',
    ],
    featureLabel: 'Includes everything in Enterprise:',
  },
]

type BillingCycle = 'yearly' | 'monthly'

// ─── Component ────────────────────────────────────────────────────────────────

export function Pricing() {
  const { user } = useAuth()
  const { credits } = useCredits()
  const [billing, setBilling] = useState<BillingCycle>('yearly')
  const [loading, setLoading] = useState<string | null>(null)

  const isFree = !user || (credits ?? 0) <= 1

  const handleCheckout = async (apiName: string | null) => {
    if (!apiName) return
    if (!user) { window.location.href = '/signup'; return }
    setLoading(apiName)
    const { data, error } = await paymentApi.createCheckout(apiName)
    if (error || !data) { alert(error || 'Failed to create checkout session'); setLoading(null); return }
    window.location.href = (data as { url: string }).url
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <Navbar />

      <div className="pt-20 pb-24 px-4">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Upgrade your plan</h1>
          <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 gap-0.5 shadow-sm">
            <div className="bg-gray-900 text-white text-xs font-semibold rounded-full px-4 py-1.5 select-none">
              -20% OFF
            </div>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${billing === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Yearly
            </button>
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${billing === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {PLANS.map(plan => {
            const price = billing === 'yearly' ? plan.price : Math.round(plan.price * 1.25)
            const yearlyPrice = plan.price
            const isCurrentPlan = plan.id === 'free' && isFree

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-6 flex flex-col ${
                  plan.popular
                    ? 'border-2 border-[#4F46E5] shadow-md shadow-indigo-100'
                    : 'border border-gray-150 shadow-sm'
                }`}
              >
                {/* Most Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-white border border-[#4F46E5] text-[#4F46E5] text-xs font-semibold rounded-full px-3 py-1 shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan name + pack badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base font-semibold text-gray-900">{plan.name}</span>
                  <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1 mb-0.5">
                  <span className="text-3xl font-bold text-gray-900">${price}</span>
                  <div className="mb-1 leading-tight">
                    <div className="text-xs text-gray-400">month billed</div>
                    <div className="text-xs text-gray-400">yearly as ${yearlyPrice}</div>
                  </div>
                </div>

                {/* Credits */}
                <div className="flex items-center gap-1.5 mb-5 mt-1">
                  <Zap className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-sm font-semibold text-gray-800">{plan.credits.toLocaleString()} credits</span>
                </div>

                {/* CTA button */}
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-sm font-medium py-2.5 cursor-not-allowed mb-6"
                  >
                    Your current plan
                  </button>
                ) : plan.popular ? (
                  <button
                    onClick={() => handleCheckout(plan.apiName)}
                    disabled={loading === plan.apiName}
                    className="w-full rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold py-2.5 transition-colors mb-6 disabled:opacity-60"
                  >
                    {loading === plan.apiName ? 'Processing…' : `Upgrade to ${plan.name}`}
                  </button>
                ) : plan.apiName ? (
                  <button
                    onClick={() => handleCheckout(plan.apiName)}
                    disabled={loading === plan.apiName}
                    className="w-full rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold py-2.5 transition-colors mb-6 disabled:opacity-60"
                  >
                    {loading === plan.apiName ? 'Processing…' : `Upgrade to ${plan.name}`}
                  </button>
                ) : null}

                {/* Divider */}
                <div className="border-t border-gray-100 mb-5" />

                {/* Features */}
                <p className="text-xs font-semibold text-gray-900 mb-3">{plan.featureLabel}</p>
                <ul className="space-y-2.5">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <Check className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      <Footer />
    </div>
  )
}
