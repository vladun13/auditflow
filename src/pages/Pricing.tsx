import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { paymentApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Basic',
    price: 149,
    credits: 1,
    pages: 5,
    features: ['Up to 5 pages per scan', 'WCAG compliance scoring', 'AI-powered recommendations', 'PDF report'],
  },
  {
    name: 'Pro',
    price: 299,
    credits: 5,
    pages: 10,
    popular: true,
    features: ['Up to 10 pages per scan', 'Everything in Basic', '5 scans included', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: 499,
    credits: 15,
    pages: 'Unlimited',
    features: ['Unlimited pages per scan', 'Everything in Pro', '15 scans included', 'Custom branding (soon)'],
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

    // Redirect to Stripe checkout
    const checkoutUrl = (data as { url: string }).url
    window.location.href = checkoutUrl
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Pricing</h1>
            {user && (
              <Link to="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple, Pay-As-You-Go Pricing</h2>
          <p className="text-xl text-gray-600">
            No monthly commitments. Only pay for what you need.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${
                plan.popular ? 'border-2 border-blue-600 shadow-xl' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/ {plan.credits} audit{plan.credits > 1 ? 's' : ''}</span>
                </div>
                <p className="text-gray-600">
                  Up to {plan.pages} pages per scan
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleCheckout(plan.name)}
                disabled={loading === plan.name}
              >
                {loading === plan.name ? 'Processing...' : `Buy ${plan.name}`}
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Need More?</h3>
          <p className="text-gray-600 mb-6">
            Contact us for custom enterprise plans with unlimited scans and advanced features.
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </div>

        <div className="mt-16 bg-white rounded-lg p-8 border">
          <h3 className="text-xl font-bold mb-6 text-center">Frequently Asked Questions</h3>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h4 className="font-semibold mb-2">How do credits work?</h4>
              <p className="text-gray-600 text-sm">
                Each scan uses 1 credit. Credits never expire and can be used anytime.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I get a refund?</h4>
              <p className="text-gray-600 text-sm">
                We offer a 7-day money-back guarantee if you're not satisfied with your audit.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards via Stripe (Visa, Mastercard, Amex, etc.).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
