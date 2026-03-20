import { useState, useRef, useEffect } from 'react'
import type { Violation } from '@/types'
import { Filter, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { IMPACT_COLOR } from './constants'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type ImpactTab = 'critical' | 'serious' | 'moderate' | 'minor'
type SortOption = 'all' | 'impact' | 'frequency' | 'wcag'

interface IssuesSidebarProps {
  violations: Violation[]
  selectedId: string | null
  onSelect: (v: Violation) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const TABS: { value: ImpactTab; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'serious',  label: 'Serious' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'minor',    label: 'Minor' },
]

const IMPACT_BAR: Record<string, string> = {
  critical: 'bg-red-500',
  serious:  'bg-orange-400',
  moderate: 'bg-yellow-400',
  minor:    'bg-blue-400',
}

// Active tab underline matches impact color
const IMPACT_BORDER: Record<string, string> = {
  critical: 'border-red-500 text-red-600',
  serious:  'border-orange-400 text-orange-600',
  moderate: 'border-yellow-500 text-yellow-600',
  minor:    'border-blue-500 text-blue-600',
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'impact',    label: 'Impact' },
  { value: 'frequency', label: 'Frequency' },
  { value: 'wcag',      label: 'WCAG criterion' },
]

// ── Overflow tags with tooltip ─────────────────────────────────────────────────

function OverflowTags({ tags, max = 2 }: { tags: string[]; max?: number }) {
  const visible = tags.slice(0, max)
  const hidden  = tags.slice(max)
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((tag, i) => (
        <span key={i} className="text-[10px] text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">{tag}</span>
      ))}
      {hidden.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-[10px] text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 cursor-default">
              +{hidden.length}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[220px]">
            <div className="space-y-0.5">{hidden.map((t, i) => <div key={i}>{t}</div>)}</div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

// ── Issue card ─────────────────────────────────────────────────────────────────

function IssueCard({ violation, index, isSelected, onClick }: {
  violation: Violation; index: number; isSelected: boolean; onClick: () => void
}) {
  const bar = IMPACT_BAR[violation.impact] || 'bg-gray-300'
  const failingBg = {
    critical: 'bg-red-50 border-red-100',
    serious:  'bg-orange-50 border-orange-100',
    moderate: 'bg-yellow-50 border-yellow-100',
    minor:    'bg-blue-50 border-blue-100',
  }[violation.impact] ?? 'bg-red-50 border-red-100'

  const failingDot = {
    critical: 'bg-red-500',
    serious:  'bg-orange-400',
    moderate: 'bg-yellow-400',
    minor:    'bg-blue-400',
  }[violation.impact] ?? 'bg-red-500'

  const tags: string[] = []
  if (violation.wcag_criterion) {
    const raw = violation.wcag_criterion
    if (raw.includes('aaa'))      tags.push('WCAG 2.0 - 2.2 Level AAA')
    else if (raw.includes('aa'))  tags.push('WCAG 2.0 - 2.2 Level AA')
    else if (raw.includes('a'))   tags.push('WCAG 2.0 - 2.2 Level A')
    else                          tags.push(raw.toUpperCase())
  }
  if (violation.impact === 'critical' || violation.impact === 'serious') {
    tags.push('Mobility', 'Low Vision')
  } else if (violation.impact === 'moderate') {
    tags.push('Deafblind', 'Mobility')
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border transition-all cursor-pointer overflow-hidden bg-white ${
        isSelected
          ? 'border-[#4F46E5] shadow-[0_0_0_2px_rgba(79,70,229,0.12)]'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className={`h-1 ${bar}`} />
      <div className="p-3">
        <span className="inline-block text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5 mb-2">
          Error type {index + 1}
        </span>
        <p className="text-xs text-gray-700 leading-relaxed mb-2.5 line-clamp-2">
          {violation.description}
        </p>
        <div className="mb-2.5">
          <div className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${failingBg}`}>
            <span className={`h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 ${failingDot}`}>
              <span className="text-white text-[8px] font-bold">!</span>
            </span>
            <span className="text-xs font-medium text-gray-700">Total Failing Elements</span>
            <span className="text-xs font-bold text-gray-900 ml-1">{violation.affected_elements}</span>
          </div>
        </div>
        <OverflowTags tags={tags} max={2} />
      </div>
    </button>
  )
}

// ── Collapsed strip ────────────────────────────────────────────────────────────

function CollapsedStrip({ violations, selectedId, onSelect, onToggleCollapse }: {
  violations: Violation[]; selectedId: string | null
  onSelect: (v: Violation) => void; onToggleCollapse: () => void
}) {
  return (
    <div className="flex flex-col items-center py-3 gap-3 border-r border-gray-100 h-full overflow-y-auto">
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onToggleCollapse} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer mb-1">
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Expand Issues panel</TooltipContent>
      </Tooltip>
      {violations.map((v, i) => {
        const isSelected = v.id === selectedId
        const dotColor = IMPACT_BAR[v.impact] || 'bg-gray-300'
        return (
          <Tooltip key={v.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelect(v)}
                className={`relative flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected ? 'bg-[#4F46E5] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i + 1}
                {/* Impact color dot */}
                <span className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${dotColor}`} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px]">
              <p className="font-medium capitalize mb-0.5">{v.impact}</p>
              <p className="line-clamp-2 text-xs opacity-80">{v.description}</p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function IssuesSidebar({ violations, selectedId, onSelect, collapsed, onToggleCollapse }: IssuesSidebarProps) {
  const [sortOpen, setSortOpen] = useState(false)
  const [sort, setSort] = useState<SortOption>('all')
  const sortRef = useRef<HTMLDivElement>(null)

  // Independent tab state — defaults to first non-empty tab
  const firstNonEmpty = (TABS.find(t => violations.some(v => v.impact === t.value))?.value ?? 'critical') as ImpactTab
  const [activeTab, setActiveTab] = useState<ImpactTab>(firstNonEmpty)

  // Sync tab when the selected violation changes from outside (e.g. parent auto-selects)
  useEffect(() => {
    if (!selectedId) return
    const v = violations.find(v => v.id === selectedId)
    if (v && v.impact !== activeTab) {
      setActiveTab(v.impact as ImpactTab)
    }
  // Only run when selectedId changes, not on activeTab change (would cause loop)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, violations])

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (collapsed) {
    return (
      <CollapsedStrip
        violations={violations}
        selectedId={selectedId}
        onSelect={onSelect}
        onToggleCollapse={onToggleCollapse}
      />
    )
  }

  const countFor = (impact: ImpactTab) => violations.filter(v => v.impact === impact).length

  // Filter + sort
  let filtered = violations.filter(v => v.impact === activeTab)
  if (sort === 'frequency') filtered = [...filtered].sort((a, b) => b.affected_elements - a.affected_elements)
  else if (sort === 'wcag') filtered = [...filtered].sort((a, b) => a.wcag_criterion.localeCompare(b.wcag_criterion))

  function handleTabClick(tab: ImpactTab) {
    setActiveTab(tab)
    // Auto-select first violation of this type so Details + HowToFix update
    const first = violations.find(v => v.impact === tab)
    if (first) onSelect(first)
  }

  return (
    <div className="flex flex-col h-full border-r border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">Issues</span>
          <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-gray-100 text-xs font-semibold text-gray-700 px-1.5">
            {violations.length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          {/* Sort dropdown */}
          <div ref={sortRef} className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSortOpen(o => !o)}
                  className="hover:text-gray-600 cursor-pointer transition-colors"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Sort by</TooltipContent>
            </Tooltip>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-100 bg-white shadow-xl z-50 overflow-hidden py-1">
                <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Sort by</p>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSort(opt.value); setSortOpen(false) }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors cursor-pointer ${
                      sort === opt.value ? 'text-[#4F46E5] bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                    {sort === opt.value && <span className="text-[#4F46E5] text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Collapse */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onToggleCollapse} className="hover:text-gray-600 cursor-pointer transition-colors">
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Collapse Issues panel</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Tabs — scroll on overflow */}
      <div className="flex border-b border-gray-100 shrink-0 overflow-x-auto scrollbar-none">
        {TABS.map(tab => {
          const count = countFor(tab.value)
          if (count === 0) return null
          const isActive = tab.value === activeTab
          const colors    = IMPACT_COLOR[tab.value]
          const activeCls = IMPACT_BORDER[tab.value]

          return (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? `${activeCls}`
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`inline-flex items-center justify-center h-4 min-w-4 rounded-full text-[10px] font-bold px-1 ${
                isActive ? `${colors.bg} ${colors.text}` : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Issue list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No {activeTab} issues</p>
        ) : (
          filtered.map(v => (
            <IssueCard
              key={v.id}
              violation={v}
              index={violations.indexOf(v)}
              isSelected={v.id === selectedId}
              onClick={() => onSelect(v)}
            />
          ))
        )}
      </div>
    </div>
  )
}
