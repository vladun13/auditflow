import { cn } from '@/lib/utils'
import type { Audit } from '@/types'

const statusConfig: Record<Audit['status'], { dot: string; text: string; bg: string; label: string }> = {
  completed: {
    dot: 'bg-green-500',
    text: 'text-green-700',
    bg: 'bg-green-50',
    label: 'Completed',
  },
  scanning: {
    dot: 'bg-blue-500 animate-pulse',
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    label: 'Scanning',
  },
  pending: {
    dot: 'bg-yellow-500',
    text: 'text-yellow-700',
    bg: 'bg-yellow-50',
    label: 'Pending',
  },
  failed: {
    dot: 'bg-red-500',
    text: 'text-red-700',
    bg: 'bg-red-50',
    label: 'Failed',
  },
}

interface StatusBadgeProps {
  status: Audit['status']
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        config.bg,
        config.text,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
