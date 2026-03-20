import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCredits } from '@/hooks/useCredits'
import { usePayments, useCreditHistory } from '@/hooks/usePayments'
import { paymentApi } from '@/lib/api'
import { toast } from 'sonner'
import {
  Zap, ExternalLink, Search, ChevronDown, Calendar,
  Eye, Download, CheckCircle2, Clock, ArrowUpDown, X, Receipt,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Subscription } from '@/types'
import { BuyCreditsModal } from '@/components/modals/BuyCreditsModal'
import { CancelSubscriptionModal } from '@/components/modals/CancelSubscriptionModal'
import { ReactivateModal } from '@/components/modals/ReactivateModal'

type Tab = 'plan' | 'payments' | 'credits'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function invoiceNumber(id: string, index: number) {
  const num = String(index + 1).padStart(4, '0')
  const upper = id.replace(/-/g, '').toUpperCase().slice(0, 10)
  return `AE${num}${upper.slice(0, 10)}UA`
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

type PaymentStatus = 'pending' | 'succeeded' | 'completed' | 'failed'

const STATUS_CONFIG: Record<PaymentStatus, { label: string; icon: ReactNode; cls: string }> = {
  pending:   { label: 'Pending',   icon: <Clock className="h-3.5 w-3.5" />,         cls: 'bg-orange-50 text-orange-600 border-orange-100' },
  succeeded: { label: 'Succeeded', icon: <CheckCircle2 className="h-3.5 w-3.5" />,  cls: 'bg-green-50 text-green-600 border-green-100' },
  completed: { label: 'Completed', icon: <CheckCircle2 className="h-3.5 w-3.5" />,  cls: 'bg-green-50 text-green-600 border-green-100' },
  failed:    { label: 'Failed',    icon: <X className="h-3.5 w-3.5" />,             cls: 'bg-red-50 text-red-600 border-red-100' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as PaymentStatus] ?? STATUS_CONFIG.pending
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border', cfg.cls)}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

// ─── Invoice Details Modal ────────────────────────────────────────────────────

interface InvoicePayment {
  id: string
  created_at: string
  amount: number
  plan: string
  status: string
  invoiceNo: string
  index: number
}

function InvoiceModal({ payment, onClose, onDownload }: {
  payment: InvoicePayment | null
  onClose: () => void
  onDownload: () => void
}) {
  if (!payment) return null
  const dueDate = new Date(payment.created_at)
  dueDate.setDate(dueDate.getDate() + 1)
  const amt = payment.amount > 100 ? payment.amount / 100 : payment.amount

  return (
    <Dialog open={!!payment} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] p-0 gap-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Receipt className="h-5 w-5 text-[#4F46E5]" />
            <span className="text-base font-bold text-gray-900">Invoice details</span>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-7 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-gray-500 leading-relaxed">
            Your invoice for the {payment.plan ?? 'Basic'} plan. Thank you for your purchase.
          </p>

          {/* Invoice info */}
          <div className="rounded-xl border border-gray-100 p-5 flex items-start justify-between">
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-semibold">Invoice No:</span> {String(payment.index + 1).padStart(4, '0')}</p>
              <p><span className="font-semibold">Invoice Date#:</span> {fmtDate(payment.created_at)}</p>
              <p><span className="font-semibold">Due Date#:</span> {fmtDate(dueDate.toISOString())}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Amount Due</p>
              <p className="text-2xl font-bold text-gray-900">${amt.toFixed(2)}</p>
            </div>
          </div>

          {/* Bill To */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">BILL TO</p>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>User Account</p>
              <p>AuditFlow Customer</p>
              <p>user@example.com</p>
            </div>
          </div>

          {/* Items table */}
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-[2rem_1fr_5rem_5rem_6rem] bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-500 border-b border-gray-100">
              <span>#</span>
              <span>Items</span>
              <span>QTY/HRS</span>
              <span>Price</span>
              <span className="text-right">Amount($)</span>
            </div>
            <div className="grid grid-cols-[2rem_1fr_5rem_5rem_6rem] px-4 py-4 text-sm text-gray-700 border-b border-gray-100">
              <span>1</span>
              <span className="font-medium capitalize">{payment.plan ?? 'Basic'} Plan</span>
              <span>1</span>
              <span>${amt.toFixed(2)}</span>
              <span className="text-right">${amt.toFixed(2)}</span>
            </div>
            <div className="px-4 py-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>${amt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Other discount</span><span>0</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax</span><span>0</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span><span>${amt.toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-7 py-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDownload}
            className="rounded-full bg-[#4F46E5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA] transition-colors"
          >
            Download PDF
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Payment History Tab ──────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 20, 50]
const STATUS_FILTER_OPTIONS = ['All', 'Pending', 'Succeeded', 'Completed', 'Failed']

function PaymentHistoryTab() {
  const { payments, loading } = usePayments()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusOpen, setStatusOpen] = useState(false)
  const [pageSizeOpen, setPageSizeOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<InvoicePayment | null>(null)
  const [tooltipId, setTooltipId] = useState<string | null>(null)
  const [tooltipType, setTooltipType] = useState<'view' | 'download' | null>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const pageSizeRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false)
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target as Node)) setPageSizeOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const enriched = payments.map((p, i) => ({ ...p, invoiceNo: invoiceNumber(p.id, i), index: i }))

  const filtered = enriched.filter(p => {
    const matchSearch = search === '' ||
      invoiceNumber(p.id, p.index).toLowerCase().includes(search.toLowerCase()) ||
      p.plan?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' ||
      p.status.toLowerCase() === statusFilter.toLowerCase()
    const matchStart = startDate === '' || new Date(p.created_at) >= new Date(startDate)
    const matchEnd = endDate === '' || new Date(p.created_at) <= new Date(endDate)
    return matchSearch && matchStatus && matchStart && matchEnd
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const isActive = (status: string) =>
    status.toLowerCase() === 'succeeded' || status.toLowerCase() === 'completed'

  function pageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1, 2, 3, 4, 5]
    if (totalPages > 6) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  if (loading) return (
    <div className="animate-pulse space-y-3 mt-6">
      {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg bg-gray-100" />)}
    </div>
  )

  return (
    <div className="mt-5">
      {/* Filters row */}
      <div className="flex items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#4F46E5] transition-colors"
          />
        </div>

        <div className="flex-1" />

        {/* Status filter */}
        <div className="relative" ref={statusRef}>
          <button
            onClick={() => setStatusOpen(v => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-500">Status:</span>
            <span className="font-medium">{statusFilter}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-gray-100 bg-white shadow-lg z-20 py-1">
              {STATUS_FILTER_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); setStatusOpen(false) }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50',
                    statusFilter === s ? 'text-[#4F46E5] font-medium' : 'text-gray-700',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date range */}
        <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400">
          <input
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setPage(1) }}
            className="outline-none text-sm text-gray-500 w-28 bg-transparent"
            placeholder="Start date"
          />
          <span className="text-gray-300">→</span>
          <input
            type="date"
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setPage(1) }}
            className="outline-none text-sm text-gray-500 w-24 bg-transparent"
            placeholder="End date"
          />
          <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1.4fr_0.8fr_1fr_5rem] px-5 py-3 bg-white border-b border-gray-100 text-sm font-medium text-gray-700">
          <button className="flex items-center gap-1.5 text-left hover:text-gray-900">
            Date <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
          </button>
          <button className="flex items-center gap-1.5 text-left hover:text-gray-900">
            Invoice number <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
          </button>
          <button className="flex items-center gap-1.5 text-left hover:text-gray-900">
            Amount <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
          </button>
          <button className="flex items-center gap-1.5 text-left hover:text-gray-900">
            Status <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
          </button>
          <span className="text-right">Actions</span>
        </div>

        {paged.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No payments found.</div>
        ) : (
          paged.map(p => {
            const active = isActive(p.status)
            const amt = p.amount > 100 ? p.amount / 100 : p.amount
            return (
              <div
                key={p.id}
                className="grid grid-cols-[1fr_1.4fr_0.8fr_1fr_5rem] px-5 py-4 text-sm items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <span className="text-gray-600">{fmtDate(p.created_at)}</span>
                <span className="text-gray-700">{p.invoiceNo}</span>
                <span className="text-gray-900 font-medium">${amt % 1 === 0 ? amt : amt.toFixed(2)}</span>
                <StatusBadge status={p.status} />
                <div className="flex items-center justify-end gap-2 relative">
                  {/* View Invoice */}
                  <div className="relative">
                    <button
                      disabled={!active}
                      onClick={() => setSelectedPayment({ ...p, index: p.index })}
                      onMouseEnter={() => { setTooltipId(p.id); setTooltipType('view') }}
                      onMouseLeave={() => { setTooltipId(null); setTooltipType(null) }}
                      className={cn(
                        'rounded-md p-1.5 transition-colors',
                        active
                          ? 'text-gray-500 hover:text-[#4F46E5] hover:bg-indigo-50'
                          : 'text-gray-200 cursor-default',
                      )}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {active && tooltipId === p.id && tooltipType === 'view' && (
                      <div className="absolute bottom-full right-0 mb-1.5 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg pointer-events-none z-30">
                        View Invoice details
                      </div>
                    )}
                  </div>
                  {/* Download PDF */}
                  <div className="relative">
                    <button
                      disabled={!active}
                      onMouseEnter={() => { setTooltipId(p.id); setTooltipType('download') }}
                      onMouseLeave={() => { setTooltipId(null); setTooltipType(null) }}
                      className={cn(
                        'rounded-md p-1.5 transition-colors',
                        active
                          ? 'text-gray-500 hover:text-[#4F46E5] hover:bg-indigo-50'
                          : 'text-gray-200 cursor-default',
                      )}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {active && tooltipId === p.id && tooltipType === 'download' && (
                      <div className="absolute bottom-full right-0 mb-1.5 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg pointer-events-none z-30">
                        Download PDF
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">Total {filtered.length} items</span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {pageNumbers().map((n, i) =>
              n === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">•••</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n as number)}
                  className={cn(
                    'min-w-[32px] h-8 rounded-md text-sm font-medium transition-colors',
                    page === n
                      ? 'border border-[#4F46E5] text-[#4F46E5]'
                      : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  {n}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Page size selector */}
          <div className="relative" ref={pageSizeRef}>
            <button
              onClick={() => setPageSizeOpen(v => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {pageSize} / page <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
            {pageSizeOpen && (
              <div className="absolute bottom-full right-0 mb-1 w-28 rounded-xl border border-gray-100 bg-white shadow-lg z-20 py-1">
                {PAGE_SIZE_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setPageSize(s); setPage(1); setPageSizeOpen(false) }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors',
                      pageSize === s ? 'text-[#4F46E5] font-medium' : 'text-gray-700',
                    )}
                  >
                    {s} / page
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <InvoiceModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onDownload={() => { toast.info('PDF download not yet connected to backend'); }}
      />
    </div>
  )
}

// ─── Credit History Tab ───────────────────────────────────────────────────────

const CREDIT_STATUS_OPTIONS = ['All', 'Purchase', 'Usage', 'Refund', 'Bonus']

function CreditHistoryTab() {
  const { history, loading } = useCreditHistory()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusOpen, setStatusOpen] = useState(false)
  const [pageSizeOpen, setPageSizeOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<InvoicePayment | null>(null)
  const [tooltipId, setTooltipId] = useState<string | null>(null)
  const [tooltipType, setTooltipType] = useState<'view' | 'download' | null>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const pageSizeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false)
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target as Node)) setPageSizeOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const enriched = history.map((e, i) => ({ ...e, invoiceNo: invoiceNumber(e.id, i), index: i }))

  const filtered = enriched.filter(e => {
    const matchSearch = search === '' ||
      e.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' ||
      e.type?.toLowerCase() === statusFilter.toLowerCase()
    const matchStart = startDate === '' || new Date(e.created_at) >= new Date(startDate)
    const matchEnd = endDate === '' || new Date(e.created_at) <= new Date(endDate)
    return matchSearch && matchStatus && matchStart && matchEnd
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  function pageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1, 2, 3, 4, 5]
    if (totalPages > 6) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  if (loading) return (
    <div className="animate-pulse space-y-3 mt-6">
      {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg bg-gray-100" />)}
    </div>
  )

  return (
    <div className="mt-5">
      {/* Filters row */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#4F46E5] transition-colors"
          />
        </div>
        <div className="flex-1" />

        {/* Status filter */}
        <div className="relative" ref={statusRef}>
          <button
            onClick={() => setStatusOpen(v => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-500">Status:</span>
            <span className="font-medium">{statusFilter}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-gray-100 bg-white shadow-lg z-20 py-1">
              {CREDIT_STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); setStatusOpen(false) }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50',
                    statusFilter === s ? 'text-[#4F46E5] font-medium' : 'text-gray-700',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date range */}
        <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400">
          <input
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setPage(1) }}
            className="outline-none text-sm text-gray-500 w-28 bg-transparent"
          />
          <span className="text-gray-300">→</span>
          <input
            type="date"
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setPage(1) }}
            className="outline-none text-sm text-gray-500 w-24 bg-transparent"
          />
          <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1.4fr_0.8fr_1fr_5rem] px-5 py-3 bg-white border-b border-gray-100 text-sm font-medium text-gray-700">
          <button className="flex items-center gap-1.5 text-left hover:text-gray-900">
            Date <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
          </button>
          <button className="flex items-center gap-1.5 text-left hover:text-gray-900">
            Invoice number <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
          </button>
          <button className="flex items-center gap-1.5 text-left hover:text-gray-900">
            Amount <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
          </button>
          <button className="flex items-center gap-1.5 text-left hover:text-gray-900">
            Balance <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
          </button>
          <span className="text-right">Actions</span>
        </div>

        {paged.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No credit activity found.</div>
        ) : (
          paged.map(e => (
            <div
              key={e.id}
              className="grid grid-cols-[1fr_1.4fr_0.8fr_1fr_5rem] px-5 py-4 text-sm items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
            >
              <span className="text-gray-600">{fmtDate(e.created_at)}</span>
              <span className="text-gray-700">{e.invoiceNo}</span>
              <span className={cn('font-medium', e.amount > 0 ? 'text-green-600' : 'text-red-600')}>
                {e.amount > 0 ? '+' : ''}{e.amount}
              </span>
              <span className="text-gray-700">{e.balance_after} credits</span>
              <div className="flex items-center justify-end gap-2">
                {/* View Invoice */}
                <div className="relative">
                  <button
                    onClick={() => setSelectedEntry({
                      id: e.id,
                      created_at: e.created_at,
                      amount: Math.abs(e.amount),
                      plan: e.type ?? 'credits',
                      status: 'succeeded',
                      invoiceNo: e.invoiceNo,
                      index: e.index,
                    })}
                    onMouseEnter={() => { setTooltipId(e.id); setTooltipType('view') }}
                    onMouseLeave={() => { setTooltipId(null); setTooltipType(null) }}
                    className="rounded-md p-1.5 text-gray-500 hover:text-[#4F46E5] hover:bg-indigo-50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {tooltipId === e.id && tooltipType === 'view' && (
                    <div className="absolute bottom-full right-0 mb-1.5 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg pointer-events-none z-30">
                      View Invoice details
                    </div>
                  )}
                </div>
                {/* Download PDF */}
                <div className="relative">
                  <button
                    onMouseEnter={() => { setTooltipId(e.id); setTooltipType('download') }}
                    onMouseLeave={() => { setTooltipId(null); setTooltipType(null) }}
                    onClick={() => toast.info('PDF download not yet connected to backend')}
                    className="rounded-md p-1.5 text-gray-500 hover:text-[#4F46E5] hover:bg-indigo-50 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {tooltipId === e.id && tooltipType === 'download' && (
                    <div className="absolute bottom-full right-0 mb-1.5 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg pointer-events-none z-30">
                      Download PDF
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">Total {filtered.length} items</span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {pageNumbers().map((n, i) =>
              n === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">•••</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n as number)}
                  className={cn(
                    'min-w-[32px] h-8 rounded-md text-sm font-medium transition-colors',
                    page === n
                      ? 'border border-[#4F46E5] text-[#4F46E5]'
                      : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  {n}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Page size selector */}
          <div className="relative" ref={pageSizeRef}>
            <button
              onClick={() => setPageSizeOpen(v => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {pageSize} / page <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
            {pageSizeOpen && (
              <div className="absolute bottom-full right-0 mb-1 w-28 rounded-xl border border-gray-100 bg-white shadow-lg z-20 py-1">
                {PAGE_SIZE_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setPageSize(s); setPage(1); setPageSizeOpen(false) }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors',
                      pageSize === s ? 'text-[#4F46E5] font-medium' : 'text-gray-700',
                    )}
                  >
                    {s} / page
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <InvoiceModal
        payment={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onDownload={() => { toast.info('PDF download not yet connected to backend'); }}
      />
    </div>
  )
}

// ─── Plan Management Tab ──────────────────────────────────────────────────────

function PlanManagementTab({ subscription, credits, onCancel, onBuy, isCancelled, onReactivate }: {
  subscription: Subscription | null
  credits: number | null
  onCancel: () => void
  onBuy: () => void
  isCancelled: boolean
  onReactivate: () => void
}) {
  const navigate = useNavigate()
  const planName = subscription?.plan ?? 'Starter'
  const billingPeriod = 'Monthly'
  const renewDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'March 5th, 2026'

  return (
    <div className="mt-6 space-y-0 divide-y divide-gray-100">
      {/* Subscription */}
      <div className="grid grid-cols-2 gap-10 py-6">
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1.5">Subscription</p>
          <p className="text-sm text-gray-500 leading-relaxed mb-3">
            You are currently subscribed to the {planName} {billingPeriod} plan.<br />
            Renews on {renewDate}.
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-1.5 text-sm text-[#4F46E5] hover:underline"
          >
            View all plans <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {/* Plan card */}
          <div className="rounded-2xl bg-gray-50 border border-gray-100 px-6 py-5 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-0.5">{planName}</p>
            <p className="text-sm text-gray-500 mb-4">{billingPeriod}</p>
            <button className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Switch to annual and save 28%
            </button>
          </div>
          {isCancelled ? (
            <button
              onClick={onReactivate}
              className="w-full rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold py-3 transition-colors"
            >
              Restore Plan
            </button>
          ) : (
            <button
              onClick={() => navigate('/pricing')}
              className="w-full rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold py-3 transition-colors"
            >
              Upgrade to Advanced
            </button>
          )}
        </div>
      </div>

      {/* Credits */}
      <div className="grid grid-cols-2 gap-10 py-6">
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1.5">Credits</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {/* Cancellation warning */}
          {isCancelled && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-gray-700">
              <div className="mt-0.5 shrink-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                <X className="h-2.5 w-2.5 text-white" />
              </div>
              <p>
                <span className="font-semibold">Heads up:</span> These credits will expire when your
                subscription ends on{' '}
                <span className="font-semibold">{renewDate}</span>{' '}
                unless you reactivate.
              </p>
            </div>
          )}
          <div className="rounded-2xl bg-purple-50 border border-purple-100 px-6 py-5 text-center">
            <p className="text-xs text-gray-500 mb-2">Your account balance</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
              <span className="text-4xl font-bold text-gray-900">{credits ?? 0}</span>
              <span className="text-lg text-gray-500 font-medium mt-1">credits</span>
            </div>
            <button
              onClick={onBuy}
              className="rounded-full border border-gray-200 bg-white px-5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Buy more credits
            </button>
          </div>
        </div>
      </div>

      {/* Manage Subscription */}
      <div className="grid grid-cols-2 gap-10 py-6">
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1.5">Manage Subscription</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            You can get invoices, update your payment method, and adjust your subscription in Stripe
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <button className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Manage subscription in Stripe <ExternalLink className="h-3.5 w-3.5" />
          </button>
          {isCancelled ? (
            <button
              onClick={onReactivate}
              className="text-sm font-medium text-[#4F46E5] hover:underline transition-colors"
            >
              Reactivate Subscription
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              Cancel subscription
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PlansAndCredits() {
  const { credits } = useCredits()
  const [tab, setTab] = useState<Tab>('plan')
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)

  useEffect(() => {
    paymentApi.getSubscription().then(({ data }) => {
      if (data) setSubscription(data as Subscription)
    })
  }, [])

  const handleCancelled = () => {
    setIsCancelled(true)
    toast.success('Your account has been scheduled for cancellation successfully', {
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    })
  }

  const handleReactivate = () => {
    setIsCancelled(false)
    toast.success('Success! Your membership is now active', {
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    })
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'plan',     label: 'Plan Management' },
    { id: 'payments', label: 'Payment History' },
    { id: 'credits',  label: 'Credit History' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 pt-7 pb-8">
      {/* Heading */}
      <h2 className="text-xl font-bold text-gray-900 mb-5">Plans & Credits</h2>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-100">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'plan' && (
        <PlanManagementTab
          subscription={subscription}
          credits={credits}
          onCancel={() => setCancelModalOpen(true)}
          onBuy={() => setBuyModalOpen(true)}
          isCancelled={isCancelled}
          onReactivate={() => setReactivateModalOpen(true)}
        />
      )}
      {tab === 'payments' && <PaymentHistoryTab />}
      {tab === 'credits'  && <CreditHistoryTab />}

      <BuyCreditsModal open={buyModalOpen} onOpenChange={setBuyModalOpen} />
      <CancelSubscriptionModal
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        onCancelled={handleCancelled}
      />
      <ReactivateModal
        open={reactivateModalOpen}
        onOpenChange={setReactivateModalOpen}
        planName={subscription?.plan ?? 'Starter'}
        planPrice={149}
        onConfirm={handleReactivate}
      />
    </div>
  )
}
