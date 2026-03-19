import { useNavigate } from 'react-router-dom'
import { useCredits } from '@/hooks/useCredits'
import { paymentApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { Subscription } from '@/types'
import { CancelSubscriptionModal } from '@/components/modals/CancelSubscriptionModal'
import { ReactivateModal } from '@/components/modals/ReactivateModal'

const PACKS = [
  { id: 'basic',      name: 'Basic',      price: 149, credits: 1,  pages: 5,           popular: false },
  { id: 'pro',        name: 'Pro',        price: 299, credits: 5,  pages: 10,          popular: true  },
  { id: 'enterprise', name: 'Enterprise', price: 499, credits: 15, pages: 'Unlimited', popular: false },
]

export function PlansAndCredits() {
  const navigate = useNavigate()
  const { credits, loading } = useCredits()
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reactivateOpen, setReactivateOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [reactivateLoading, setReactivateLoading] = useState(false)

  useEffect(() => {
    paymentApi.getSubscription().then(({ data }) => {
      if (data) setSubscription(data as Subscription)
    })
  }, [])

  const handleCancelSubscription = () => {
    setCancelLoading(true)
    toast.info('Subscription cancellation is not yet connected to backend')
    setCancelLoading(false)
    setCancelOpen(false)
  }

  const handleReactivate = () => {
    setReactivateLoading(true)
    toast.info('Subscription reactivation is not yet connected to backend')
    setReactivateLoading(false)
    setReactivateOpen(false)
  }

  const handleBuy = async (planId: string) => {
    setPurchasing(planId)
    const { data, error } = await paymentApi.createCheckout(planId)
    if (error || !data) {
      toast.error(error || 'Failed to start checkout')
      setPurchasing(null)
      return
    }
    window.location.href = (data as { url: string }).url
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Plans & Credits</h2>
        <p className="text-sm text-muted-foreground">Buy credit packs to run accessibility scans</p>
      </div>

      {/* Current balance */}
      <Card className="border-border bg-card">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available credits</p>
              <p className="text-2xl font-bold text-foreground">{loading ? '—' : credits}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/settings/credits')}>
            View history
          </Button>
        </CardContent>
      </Card>

      {/* Credit packs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PACKS.map((pack) => (
          <Card key={pack.id} className={`border-border bg-card relative ${pack.popular ? 'border-primary shadow-md' : ''}`}>
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3">Most Popular</Badge>
              </div>
            )}
            <CardContent className="p-5 pt-6">
              <h3 className="font-semibold text-foreground mb-1">{pack.name}</h3>
              <div className="mb-3">
                <span className="text-3xl font-bold text-foreground">${pack.price}</span>
              </div>
              <ul className="space-y-1.5 mb-5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600 shrink-0" />{pack.credits} scan credit{pack.credits > 1 ? 's' : ''}</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600 shrink-0" />Up to {pack.pages} pages/scan</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600 shrink-0" />PDF report included</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600 shrink-0" />Credits never expire</li>
              </ul>
              <Button
                className="w-full"
                variant={pack.popular ? 'default' : 'outline'}
                disabled={purchasing === pack.id}
                onClick={() => handleBuy(pack.id)}
              >
                {purchasing === pack.id ? 'Redirecting...' : `Buy ${pack.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription management */}
      {subscription && (
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-1">Subscription</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {subscription.status === 'active' && !subscription.cancel_at_period_end
                ? `Active ${subscription.plan} plan`
                : subscription.cancel_at_period_end
                ? `${subscription.plan} plan cancels at end of billing period`
                : `${subscription.plan} plan (${subscription.status})`}
            </p>
            {subscription.status === 'active' && !subscription.cancel_at_period_end ? (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setCancelOpen(true)}
              >
                Cancel Subscription
              </Button>
            ) : (subscription.status === 'cancelled' || subscription.cancel_at_period_end) ? (
              <Button
                size="sm"
                className="bg-[#4F46E5] hover:bg-[#4338CA]"
                onClick={() => setReactivateOpen(true)}
              >
                Reactivate
              </Button>
            ) : null}
          </CardContent>
        </Card>
      )}

      <CancelSubscriptionModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancelSubscription}
        loading={cancelLoading}
      />
      <ReactivateModal
        open={reactivateOpen}
        onOpenChange={setReactivateOpen}
        planName={subscription?.plan ?? 'your'}
        onConfirm={handleReactivate}
        loading={reactivateLoading}
      />
    </div>
  )
}
