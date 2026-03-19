import { useState } from 'react'
import type { Violation } from '@/types'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ViolationCard } from './ViolationCard'

interface ViolationListProps {
  violations: Violation[]
}

const SEVERITY_ORDER = ['critical', 'serious', 'moderate', 'minor'] as const

const TAB_CONFIG = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'serious', label: 'Serious' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'minor', label: 'Minor' },
] as const

function sortBySeverity(violations: readonly Violation[]): Violation[] {
  return [...violations].sort((a, b) => {
    const aIdx = SEVERITY_ORDER.indexOf(a.impact as typeof SEVERITY_ORDER[number])
    const bIdx = SEVERITY_ORDER.indexOf(b.impact as typeof SEVERITY_ORDER[number])
    return aIdx - bIdx
  })
}

export function ViolationList({ violations }: ViolationListProps) {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all'
    ? sortBySeverity(violations)
    : sortBySeverity(violations.filter(v => v.impact === activeTab))

  const countByImpact = (impact: string): number =>
    impact === 'all'
      ? violations.length
      : violations.filter(v => v.impact === impact).length

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          {TAB_CONFIG.map(tab => {
            const count = countByImpact(tab.value)
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                {tab.label}
                <span className="text-xs text-muted-foreground">({count})</span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No violations found</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(v => (
            <ViolationCard key={v.id} violation={v} />
          ))}
        </div>
      )}
    </div>
  )
}
