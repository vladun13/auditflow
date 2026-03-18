import type { Violation } from '@/types'
import { cn } from '@/lib/utils'
import { IMPACT_COLOR } from './constants'
import { ViolationCard } from './ViolationCard'

interface Tab { key: string; label: string; count: number }

interface ViolationListProps {
  tabs: Tab[]
  violations: Violation[]
  totalViolations: number
  activeViolation: Violation | null
  impactFilter: string
  onFilterChange: (filter: string) => void
  onSelectViolation: (v: Violation) => void
}

export function ViolationList({
  tabs, violations, totalViolations, activeViolation,
  impactFilter, onFilterChange, onSelectViolation,
}: ViolationListProps) {
  return (
    <div className="w-[200px] shrink-0 border-r border-gray-100 bg-white overflow-y-auto">
      <div className="p-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">
          Issues {totalViolations}
        </p>
        <div className="space-y-0.5">
          {tabs.map(tab => {
            const col = IMPACT_COLOR[tab.key]
            return (
              <button
                key={tab.key}
                onClick={() => onFilterChange(tab.key)}
                className={cn(
                  'w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                  impactFilter === tab.key ? `${col.bg} ${col.text}` : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  {tab.label}
                </div>
                <span className={cn('text-xs font-medium', impactFilter === tab.key ? col.text : 'text-gray-400')}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="border-t border-gray-100 mt-1 pt-1">
        {violations.map((v, i) => (
          <ViolationCard
            key={v.id}
            violation={v}
            index={i}
            isActive={activeViolation?.id === v.id}
            impactFilter={impactFilter}
            onSelect={() => onSelectViolation(v)}
          />
        ))}
        {violations.length === 0 && (
          <p className="px-3 py-4 text-xs text-gray-400 text-center">No {impactFilter} issues</p>
        )}
      </div>
    </div>
  )
}
