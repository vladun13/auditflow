import { usePayments } from '@/hooks/usePayments'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export function PaymentHistory() {
  const { payments, loading } = usePayments()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
          <p className="text-sm text-muted-foreground">All your past credit purchases</p>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg bg-muted" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
        <p className="text-sm text-muted-foreground">All your past credit purchases</p>
      </div>

      {payments.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No payments yet</p>
            <Button onClick={() => navigate('/settings/plans')}>Buy Credits</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <div className="divide-y divide-border">
            {/* Table header */}
            <div className="grid grid-cols-4 px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Date</span>
              <span>Plan</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {payments.map((p) => (
              <div key={p.id} className="grid grid-cols-4 px-6 py-4 text-sm items-center">
                <span className="text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
                <span className="font-medium text-foreground capitalize">{p.plan}</span>
                <span className="text-foreground">${(p.amount / 100).toFixed(2)}</span>
                <Badge
                  variant={p.status === 'completed' ? 'default' : 'secondary'}
                  className="w-fit capitalize"
                >
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
