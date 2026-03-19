import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap } from 'lucide-react'
import { paymentApi } from '@/lib/api'
import { useCredits } from '@/hooks/useCredits'
import { toast } from 'sonner'

const PACKS = [
  { id: 'basic', name: 'Basic', price: 149, credits: 1, pages: 5, popular: false },
  { id: 'pro', name: 'Pro', price: 299, credits: 5, pages: 10, popular: true },
  { id: 'enterprise', name: 'Enterprise', price: 499, credits: 15, pages: 'Unlimited' as const, popular: false },
] as const

interface BuyCreditsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  context?: 'upgrade'
}

export function BuyCreditsModal({ open, onOpenChange, context }: BuyCreditsModalProps) {
  const { credits } = useCredits()
  const [purchasing, setPurchasing] = useState<string | null>(null)

  const handleBuy = async (packId: string) => {
    setPurchasing(packId)
    const { data, error } = await paymentApi.createCheckout(packId)
    if (error || !data) {
      toast.error(error || 'Failed to start checkout')
      setPurchasing(null)
      return
    }
    window.location.href = (data as { url: string }).url
  }

  const isUpgrade = context === 'upgrade'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {isUpgrade ? "You're out of credits" : 'Buy Credits'}
          </DialogTitle>
          <DialogDescription>
            {isUpgrade
              ? 'Add more credits to continue scanning.'
              : `You have ${credits ?? 0} credit${credits !== 1 ? 's' : ''}. Select a pack below.`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`relative rounded-xl border p-4 ${
                pack.popular ? 'border-[#4F46E5] shadow-md' : 'border-border'
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#4F46E5] text-white hover:bg-[#4338CA]">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="pt-1">
                <p className="text-sm font-semibold text-foreground">{pack.name}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">${pack.price}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {pack.credits} credit{pack.credits > 1 ? 's' : ''}
                </p>
              </div>

              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#4F46E5] shrink-0" />
                  {pack.credits} scan credit{pack.credits > 1 ? 's' : ''}
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#4F46E5] shrink-0" />
                  Up to {pack.pages} pages/scan
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#4F46E5] shrink-0" />
                  PDF report included
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#4F46E5] shrink-0" />
                  Credits never expire
                </li>
              </ul>

              <Button
                className="mt-3 w-full"
                variant={pack.popular ? 'default' : 'outline'}
                size="sm"
                disabled={purchasing === pack.id}
                onClick={() => handleBuy(pack.id)}
              >
                {purchasing === pack.id ? 'Redirecting...' : `Buy ${pack.name}`}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
