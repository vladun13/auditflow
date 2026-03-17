import { useCreditHistory } from '@/hooks/usePayments'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

const TYPE_STYLES: Record<string, string> = {
  purchase: 'bg-green-50 text-green-700',
  usage:    'bg-red-50 text-red-700',
  refund:   'bg-blue-50 text-blue-700',
  bonus:    'bg-purple-50 text-purple-700',
}

export function CreditHistory() {
  const { history, loading } = useCreditHistory()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Credit History</h2>
          <p className="text-sm text-muted-foreground">How your credits have been used</p>
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
        <h2 className="text-lg font-semibold text-foreground">Credit History</h2>
        <p className="text-sm text-muted-foreground">How your credits have been used</p>
      </div>

      {history.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No credit activity yet</p>
            <Button onClick={() => navigate('/settings/plans')}>Buy Credits</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <div className="divide-y divide-border">
            <div className="grid grid-cols-4 px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Date</span>
              <span>Event</span>
              <span>Credits</span>
              <span>Balance</span>
            </div>
            {history.map((entry) => (
              <div key={entry.id} className="grid grid-cols-4 px-6 py-4 text-sm items-center">
                <span className="text-muted-foreground">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
                <div>
                  <Badge variant="outline" className={cn('border-0 capitalize', TYPE_STYLES[entry.type])}>
                    {entry.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">{entry.description}</p>
                </div>
                <span className={cn('font-medium', entry.amount > 0 ? 'text-green-600' : 'text-red-600')}>
                  {entry.amount > 0 ? '+' : ''}{entry.amount}
                </span>
                <span className="font-medium text-foreground">{entry.balance_after}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
