import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAudits } from '@/hooks/useAudits'
import { useOnboarding } from '@/hooks/useOnboarding'
import { WelcomeModal } from '@/components/onboarding/WelcomeModal'
import { auditApi } from '@/lib/api'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Eye, Download, MoreVertical, RotateCcw, Trash2,
  Search, ScanSearch, Link2, BarChart2, Zap, FileText,
  ChevronDown, Check, Calendar, ChevronLeft, ChevronRight,
  X,
} from 'lucide-react'
import type { Audit } from '@/types'

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-50">
              <Trash2 className="h-4 w-4 text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Delete Report</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete this report?<br />
            If you delete this report, you will no longer be able to download it. You will need to rerun the report again.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Sort Dropdown ────────────────────────────────────────────────────────────

type SortKey = 'all' | 'date' | 'wcag' | 'status'
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'date', label: 'Date' },
  { key: 'wcag', label: 'WCAG score' },
  { key: 'status', label: 'Status' },
]

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = SORT_OPTIONS.find(o => o.key === value)!

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${open ? 'border-[#4F46E5] bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
      >
        <span className="text-gray-500">Sort by:</span>
        <span className="font-medium text-gray-900">{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-40 rounded-xl border border-gray-100 bg-white shadow-lg z-30 py-1">
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sort by</div>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => { onChange(opt.key); setOpen(false) }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              <span className={value === opt.key ? 'text-[#4F46E5] font-medium' : 'text-gray-700'}>{opt.label}</span>
              {value === opt.key && <Check className="h-3.5 w-3.5 text-[#4F46E5]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Simple Date Range Picker ─────────────────────────────────────────────────

function DateRangePicker({ start, end, onChange }: {
  start: Date | null; end: Date | null
  onChange: (s: Date | null, e: Date | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [leftMonth, setLeftMonth] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [hovered, setHovered] = useState<Date | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const rightMonth = new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1)

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  function getDays(year: number, month: number) {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    let dayOfWeek = first.getDay() // 0=Sun
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // convert to Mo=0
    const cells: (Date | null)[] = Array(dayOfWeek).fill(null)
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }

  const handleDayClick = (d: Date) => {
    if (!start || (start && end)) { onChange(d, null); }
    else if (d < start) { onChange(d, start); }
    else { onChange(start, d); }
  }

  const isInRange = (d: Date) => {
    const effectiveEnd = end ?? hovered
    if (!start || !effectiveEnd) return false
    const lo = start < effectiveEnd ? start : effectiveEnd
    const hi = start < effectiveEnd ? effectiveEnd : start
    return d > lo && d < hi
  }
  const isSel = (d: Date) => !!(start && d.toDateString() === start.toDateString()) || !!(end && d.toDateString() === end.toDateString())
  const isToday = (d: Date) => d.toDateString() === new Date().toDateString()

  function MonthGrid({ year, month }: { year: number; month: number }) {
    const cells = getDays(year, month)
    return (
      <div>
        <div className="text-sm font-semibold text-center text-gray-800 mb-3">{months[month]} {year}</div>
        <div className="grid grid-cols-7 gap-0">
          {days.map(d => <div key={d} className="text-center text-xs text-gray-400 pb-1.5">{d}</div>)}
          {cells.map((d, i) => !d ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onClick={() => handleDayClick(d)}
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered(null)}
              className={[
                'h-7 w-7 mx-auto text-xs rounded-full flex items-center justify-center transition-colors',
                isSel(d) ? 'bg-[#4F46E5] text-white font-semibold' :
                isInRange(d) ? 'bg-indigo-50 text-[#4F46E5]' :
                isToday(d) ? 'border border-[#4F46E5] text-[#4F46E5]' :
                'text-gray-700 hover:bg-gray-100',
              ].join(' ')}
            >
              {d.getDate()}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const label = start
    ? `${start.toLocaleDateString('en-GB')}${end ? ` → ${end.toLocaleDateString('en-GB')}` : ''}`
    : null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors w-52 ${open ? 'border-[#4F46E5]' : 'border-gray-200 hover:border-gray-300'} bg-white`}
      >
        <span className="flex-1 text-left text-gray-400 text-xs">
          {label ?? <span className="flex items-center gap-1.5 text-gray-400"><span>Start date</span><span>→</span><span>End date</span></span>}
        </span>
        <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-4">
          <div className="flex gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setLeftMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft className="h-4 w-4 text-gray-500" />
                </button>
                <div className="w-4" />
              </div>
              <MonthGrid year={leftMonth.getFullYear()} month={leftMonth.getMonth()} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-4" />
                <button onClick={() => setLeftMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <MonthGrid year={rightMonth.getFullYear()} month={rightMonth.getMonth()} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <button onClick={() => { onChange(new Date(), null); }} className="text-sm text-[#4F46E5] hover:underline">Today</button>
            <button onClick={() => setOpen(false)} className="px-4 py-1.5 rounded-lg bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338CA]">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Row Actions ──────────────────────────────────────────────────────────────

function RowActions({ audit, onView, onDownload, onRescan, onDelete, downloading }: {
  audit: Audit
  onView: () => void
  onDownload: () => void
  onRescan: () => void
  onDelete: () => void
  downloading: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [tooltip, setTooltip] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const isCompleted = audit.status === 'completed'
  const isFailed = audit.status === 'failed'
  const isActive = isCompleted || isFailed

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex items-center gap-1 relative" onClick={e => e.stopPropagation()}>
      {/* View / Reactivate */}
      <div className="relative group">
        {isFailed ? (
          <button
            onClick={onRescan}
            onMouseEnter={() => setTooltip('Reactivate')} onMouseLeave={() => setTooltip(null)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onView}
            disabled={!isCompleted}
            onMouseEnter={() => isCompleted && setTooltip('View Details')} onMouseLeave={() => setTooltip(null)}
            className={`p-1.5 rounded-md transition-colors ${isCompleted ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-200 cursor-not-allowed'}`}
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
        {tooltip === 'Reactivate' && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20">Reactivate</div>
        )}
        {tooltip === 'View Details' && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20">View Details</div>
        )}
      </div>

      {/* Download */}
      <button
        onClick={onDownload}
        disabled={!isCompleted || downloading}
        className={`p-1.5 rounded-md transition-colors ${isCompleted ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-200 cursor-not-allowed'}`}
        title="Download PDF"
      >
        <Download className="h-4 w-4" />
      </button>

      {/* More menu */}
      {isActive && (
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1">
              <button
                onClick={() => { setMenuOpen(false); onRescan() }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="h-3.5 w-3.5 text-gray-500" /> Rescan
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete() }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ total, page, pageSize, onPage, onPageSize }: {
  total: number; page: number; pageSize: number
  onPage: (p: number) => void; onPageSize: (s: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pages: (number | '...')[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1, 2, 3, 4, 5)
    if (totalPages > 6) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
      <span>Total {total} items</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1.5">···</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`w-7 h-7 rounded text-xs font-medium transition-colors ${page === p ? 'bg-white border border-gray-300 text-gray-900 shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {p}
            </button>
          )
        )}
        <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1">
        <select
          value={pageSize}
          onChange={e => { onPageSize(Number(e.target.value)); onPage(1) }}
          className="text-xs text-gray-700 outline-none bg-transparent"
        >
          {[5, 10, 20, 50].map(s => <option key={s} value={s}>{s} / page</option>)}
        </select>
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function DashboardNew() {
  const navigate = useNavigate()
  const { audits, loading, refetch } = useAudits()
  const { showWelcome, completeOnboarding } = useOnboarding()

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('all')
  const [dateStart, setDateStart] = useState<Date | null>(null)
  const [dateEnd, setDateEnd] = useState<Date | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  const completedAudits = audits.filter(a => a.status === 'completed')
  const avgScore = completedAudits.length > 0
    ? Math.round(completedAudits.reduce((s, a) => s + (a.wcag_score ?? 0), 0) / completedAudits.length)
    : 0
  const creditsUsed = audits.length

  // Filter
  let filtered = audits.filter(a => a.website_url.toLowerCase().includes(search.toLowerCase()))
  if (dateStart) filtered = filtered.filter(a => new Date(a.created_at) >= dateStart)
  if (dateEnd) {
    const end = new Date(dateEnd); end.setHours(23, 59, 59)
    filtered = filtered.filter(a => new Date(a.created_at) <= end)
  }

  // Sort
  if (sort === 'date') filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  if (sort === 'wcag') filtered = [...filtered].sort((a, b) => (b.wcag_score ?? 0) - (a.wcag_score ?? 0))
  if (sort === 'status') filtered = [...filtered].sort((a, b) => a.status.localeCompare(b.status))

  // Paginate
  const total = filtered.length
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleDownload = async (audit: Audit) => {
    setDownloading(audit.id)
    await auditApi.downloadPdf(audit.id)
    setDownloading(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await auditApi.delete(deleteTarget)
    setDeleteTarget(null)
    await refetch()
  }

  if (loading) return <DashboardSkeleton />

  return (
    <>
      <WelcomeModal
        open={showWelcome}
        onStart={() => { completeOnboarding(); navigate('/onboarding') }}
        onClose={completeOnboarding}
      />
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />

      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Audit Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your main hub for viewing and managing all previous audits.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-0 rounded-xl border border-gray-100 bg-white shadow-sm mb-6 overflow-hidden">
          {[
            { label: 'Total Audits',   value: audits.length, Icon: FileText,  iconColor: 'text-blue-600' },
            { label: 'Average Score',  value: avgScore ? `${avgScore}%` : '--', Icon: BarChart2, iconColor: 'text-orange-500' },
            { label: 'Credits Used',   value: creditsUsed,   Icon: Zap,       iconColor: 'text-purple-600' },
          ].map(({ label, value, Icon, iconColor }, i, arr) => (
            <div key={label} className={`px-3 sm:px-6 py-5 ${i < arr.length - 1 ? 'border-r border-gray-100' : ''}`}>
              <p className="text-xs text-gray-400 mb-2">{label}</p>
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${iconColor}`} />
                <span className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 border-b border-gray-100">
            <div className="relative w-full sm:w-48 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-indigo-100 bg-white placeholder:text-gray-400"
              />
            </div>
            <div className="flex-1" />
            <SortDropdown value={sort} onChange={v => { setSort(v); setPage(1) }} />
            <DateRangePicker
              start={dateStart} end={dateEnd}
              onChange={(s, e) => { setDateStart(s); setDateEnd(e); setPage(1) }}
            />
          </div>

          {/* Empty state */}
          {audits.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-center px-6">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <ScanSearch className="h-8 w-8 text-[#4F46E5]" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No audits yet</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs">Run your first scan to see your accessibility score.</p>
              <button
                onClick={() => navigate('/scan')}
                className="rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-2 text-sm font-medium transition-colors"
              >
                Run Your First Scan
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      { label: 'URL', icon: true },
                      { label: 'Date', icon: true },
                      { label: 'WCAG score', icon: true },
                      { label: 'Status', icon: true },
                      { label: 'Credits', icon: true },
                      { label: 'Actions', icon: false },
                    ].map(col => (
                      <th key={col.label} className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.icon && <ChevronDown className="h-3 w-3 opacity-40" />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map(audit => (
                    <tr
                      key={audit.id}
                      onClick={() => audit.status === 'completed' && navigate(`/audits/${audit.id}`)}
                      className={`transition-colors ${audit.status === 'completed' ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                    >
                      {/* URL */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <span className="flex items-center gap-1.5 text-[#4F46E5] truncate text-xs">
                          <Link2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{audit.website_url}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                        {new Date(audit.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>

                      {/* WCAG score */}
                      <td className="px-4 py-3.5">
                        {audit.wcag_level ? (
                          <span className="inline-block border border-gray-200 rounded-md px-2 py-0.5 text-xs font-medium text-gray-700">
                            {audit.wcag_level}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={audit.status} />
                      </td>

                      {/* Credits */}
                      <td className="px-4 py-3.5 text-gray-600 text-xs">1</td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <RowActions
                          audit={audit}
                          onView={() => navigate(`/audits/${audit.id}`)}
                          onDownload={() => handleDownload(audit)}
                          onRescan={() => navigate(`/scan?url=${encodeURIComponent(audit.website_url)}`)}
                          onDelete={() => setDeleteTarget(audit.id)}
                          downloading={downloading === audit.id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              <Pagination
                total={total}
                page={page}
                pageSize={pageSize}
                onPage={setPage}
                onPageSize={setPageSize}
              />
            </>
          )}
        </div>
      </div>
    </>
  )
}
