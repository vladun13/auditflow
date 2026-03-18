import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAudits } from '@/hooks/useAudits'
import { useCredits } from '@/hooks/useCredits'
import { auditApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { FileText, BarChart2, Zap, Eye, Download, Search, Trash2, ScanSearch } from 'lucide-react'
import type { Audit } from '@/types'

function StatCard({ label, value, icon, iconBg }: { label: string; value: string | number; icon: React.ReactNode; iconBg: string }) {
  return (
    <div className="flex-1 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${iconBg}`}>{icon}</span>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
    </div>
  )
}

function StatusBadge({ audit }: { audit: Audit }) {
  if (audit.status === 'scanning') return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
      Scanning
    </span>
  )
  if (audit.status === 'failed') return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Failed
    </span>
  )
  if (audit.status === 'completed') {
    const label = audit.wcag_score && audit.wcag_score >= 80 ? 'Completed' : 'Completed'
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        {label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
      Pending
    </span>
  )
}

function WcagBadge({ level }: { level: string | null }) {
  if (!level) return <span className="text-gray-400 text-sm">—</span>
  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700">
      {level}
    </span>
  )
}

export function DashboardNew() {
  const navigate = useNavigate()
  const { audits, loading, refetch } = useAudits()
  const { credits } = useCredits()
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  const completedAudits = audits.filter(a => a.status === 'completed')
  const avgScore = completedAudits.length > 0
    ? Math.round(completedAudits.reduce((sum, a) => sum + (a.wcag_score || 0), 0) / completedAudits.length)
    : 0

  const filtered = audits.filter(a =>
    a.website_url.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Delete this audit? This cannot be undone.')) return
    setDeleting(id)
    await auditApi.delete(id)
    await refetch()
    setDeleting(null)
  }

  const handleDownload = async (e: React.MouseEvent, audit: Audit) => {
    e.stopPropagation()
    setDownloading(audit.id)
    await auditApi.downloadPdf(audit.id)
    setDownloading(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4F46E5]" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Dashboard</h1>
        <p className="text-sm text-gray-500">Your main hub for viewing and managing all previous audits.</p>
      </div>

      {/* Stat cards */}
      <div className="flex gap-4 mb-6">
        <StatCard
          label="Total Audits"
          value={audits.length}
          icon={<FileText className="h-4 w-4 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Average Score"
          value={avgScore ? `${avgScore}%` : '—'}
          icon={<BarChart2 className="h-4 w-4 text-orange-500" />}
          iconBg="bg-orange-50"
        />
        <StatCard
          label="Credits Used"
          value={credits !== null ? credits : '—'}
          icon={<Zap className="h-4 w-4 text-purple-600" />}
          iconBg="bg-purple-50"
        />
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-100">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            />
          </div>
          <Button size="sm" onClick={() => navigate('/scan')} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg gap-2">
            <ScanSearch className="h-3.5 w-3.5" />
            New Scan
          </Button>
        </div>

        {/* Table */}
        {audits.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 mb-4 text-sm">No audits yet</p>
            <Button onClick={() => navigate('/scan')} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white">
              Run Your First Scan
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">URL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">WCAG Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Pages</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(audit => (
                <tr
                  key={audit.id}
                  onClick={() => navigate(`/audits/${audit.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3.5 max-w-[220px]">
                    <span className="flex items-center gap-1.5 text-[#4F46E5] hover:underline truncate">
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="truncate">{audit.website_url}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                    {new Date(audit.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5">
                    <WcagBadge level={audit.wcag_level} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge audit={audit} />
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">
                    {audit.pages_scanned}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/audits/${audit.id}`)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {audit.status === 'completed' && (
                        <button
                          onClick={(e) => handleDownload(e, audit)}
                          disabled={downloading === audit.id}
                          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, audit.id)}
                        disabled={deleting === audit.id}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Total {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
