import { cn } from '@/lib/utils'
import { ScanSearch, Clock, XCircle, CheckCircle } from 'lucide-react'
import type { Audit } from '@/types'

const statusConfig: Record<Audit['status'], {
  text: string; bg: string; label: string
  Icon: React.ComponentType<{ className?: string }>
}> = {
  completed: { Icon: CheckCircle, text: 'text-green-600',  bg: 'bg-green-50',  label: 'Completed' },
  scanning:  { Icon: ScanSearch,  text: 'text-blue-600',   bg: 'bg-blue-50',   label: 'Scanning'  },
  pending:   { Icon: Clock,       text: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending'   },
  failed:    { Icon: XCircle,     text: 'text-red-600',    bg: 'bg-red-50',    label: 'Failed'    },
}

interface StatusBadgeProps { status: Audit['status'] }

export function StatusBadge({ status }: StatusBadgeProps) {
  const { Icon, text, bg, label } = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', bg, text)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
