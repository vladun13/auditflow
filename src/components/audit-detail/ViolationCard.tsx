import type { Violation } from '@/types'
import { cn } from '@/lib/utils'
import { IMPACT_COLOR } from './constants'

interface ViolationCardProps {
  violation: Violation
  index: number
  isActive: boolean
  impactFilter: string
  onSelect: () => void
}

export function ViolationCard({ violation, index, isActive, impactFilter, onSelect }: ViolationCardProps) {
  const c = IMPACT_COLOR[impactFilter] || IMPACT_COLOR.minor
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left px-3 py-2.5 text-xs border-b border-gray-50 transition-colors',
        isActive ? `${c.bg} ${c.text}` : 'text-gray-600 hover:bg-gray-50'
      )}
    >
      <div className="font-medium truncate">Error type {index + 1}</div>
      <div className="text-gray-400 truncate mt-0.5">{violation.violation_type}</div>
      <div className={cn('mt-1 text-xs font-medium', c.text)}>
        Total Failing Elements {violation.affected_elements}
      </div>
    </button>
  )
}
