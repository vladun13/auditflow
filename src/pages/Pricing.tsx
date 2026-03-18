import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { paymentApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const plans = [
  {
    name: 'Basic',
    price: 149,
    credits: 1,
    pages: 5,
    features: [
      'Up to 5 pages per scan',
      'WCAG 2.1 compliance scoring',
      'AI-powered recommendations',
      'PDF report export',
    ],
  },
  {
    name: 'Pro',
    price: 299,
    credits: 5,
    pages: 10,
    popular: true,
    features: [
      'Up to 10 pages per scan',
      'Everything in Basic',
      '5 scans included',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 499,
    credits: 15,
    pages: 'Unlimited',
    features: [
      'Unlimited pages per scan',
      'Everything in Pro',
      '15 scans included',
      'Custom branding (soon)',
    ],
  },
]

const faqs = [
  {
    q: 'How do credits work?',
    a: 'Each scan uses 1 credit. Credits never expire and can be used anytime.',
  },
  {
    q: 'Can I get a refund?',
    a: "We offer a 7-day money-back guarantee if you're not satisfied with your audit.",
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards via LemonSqueezy (Visa, Mastercard, Amex, etc.).',
  },
]

export function Pricing() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (planName: string) => {
    if (!user) {
      window.location.href = '/signup'
      return
    }

    setLoading(planName)
    const { data, error } = await paymentApi.createCheckout(planName.toLowerCase())

    if (error || !data) {
      alert(error || 'Failed to create checkout session')
      setLoading(null)
      return
    }

    const checkoutUrl = (data as { url: string }).url
    window.location.href = checkoutUrl
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-14">
        {/* Hero */}
        <div className="py-20 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple, Pay-As-You-Go Pricing
          </h1>
          <p className="mx-auto max-w-xl text-base text-gray-500">
            No monthly commitments. Only pay for what you need. Credits never expire.
          </p>
        </div>

        {/* Plans */}
        <div className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-shadow duration-200 hover:shadow-md ${
                  plan.popular
                    ? 'border-[#4F46E5] shadow-lg shadow-indigo-100'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-[#4F46E5] px-4 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="mb-1 text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="mb-1 text-sm text-gray-500">
                      / {plan.credits} audit{plan.credits > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Up to {plan.pages} pages per scan</p>
                </div>

                <ul className="mb-8 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#4F46E5]" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full rounded-lg text-sm font-medium transition-colors duration-200 ${
                    plan.popular
                      ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleCheckout(plan.name)}
                  disabled={loading === plan.name}
                >
                  {loading === plan.name ? 'Processing…' : `Get ${plan.name}`}
                </Button>
              </div>
            ))}
          </div>

          {/* Back to dashboard */}
          {user && (
            <div className="mt-6 text-center">
              <Link
                to="/dashboard"
                className="text-sm text-gray-500 transition-colors duration-200 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
            </div>
          )}

          {/* Enterprise CTA */}
          <div className="mt-20 rounded-2xl border border-gray-100 bg-gray-50/60 p-10 text-center">
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Need more scans?</h3>
            <p className="mb-6 text-sm text-gray-500">
              Contact us for custom enterprise plans with unlimited scans and advanced features.
            </p>
            <Button
              variant="outline"
              className="rounded-lg border-gray-200 px-6 text-sm font-medium transition-colors duration-200 hover:bg-gray-100"
            >
              Contact Sales
            </Button>
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <h3 className="mb-8 text-center text-xl font-semibold text-gray-900">
              Frequently Asked Questions
            </h3>
            <div className="mx-auto max-w-2xl space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-gray-100 bg-white p-5">
                  <h4 className="mb-1.5 text-sm font-semibold text-gray-900">{faq.q}</h4>
                  <p className="text-sm leading-relaxed text-gray-500">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
