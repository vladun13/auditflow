import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAudits } from '@/hooks/useAudits'
import { useOnboarding } from '@/hooks/useOnboarding'
import { WelcomeModal } from '@/components/onboarding/WelcomeModal'
import { auditApi } from '@/lib/api'
import { getScoreColor } from '@/lib/format'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { Button } from '@/components/ui/button'
import { FileText, BarChart2, AlertTriangle, ShieldCheck, Eye, Download, Search, Trash2, ScanSearch, Link } from 'lucide-react'
import type { Audit } from '@/types'

export function DashboardNew() {
  const navigate = useNavigate()
  const { audits, loading, refetch } = useAudits()
  const { showWelcome, completeOnboarding } = useOnboarding()
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  const completedAudits = audits.filter(a => a.status === 'completed')
  const totalAudits = audits.length
  const avgScore = completedAudits.length > 0
    ? Math.round(completedAudits.reduce((sum, a) => sum + (a.wcag_score || 0), 0) / completedAudits.length)
    : 0
  const criticalIssues = completedAudits.reduce((sum, a) => sum + a.critical_count, 0)
  const compliantSites = completedAudits.filter(a => (a.wcag_score || 0) >= 80).length

  const recentAudits = audits.slice(0, 5)
  const filtered = recentAudits.filter(a =>
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
    return <DashboardSkeleton />
  }

  return (
    <>
      <WelcomeModal
        open={showWelcome}
        onStart={() => { completeOnboarding(); navigate('/onboarding') }}
        onClose={completeOnboarding}
      />
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Audit Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your main hub for viewing and managing all previous audits.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Audits"
          value={totalAudits}
          icon={<FileText className="h-4 w-4 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Avg WCAG Score"
          value={avgScore ? `${avgScore}%` : '--'}
          icon={<BarChart2 className="h-4 w-4 text-orange-500" />}
          iconBg="bg-orange-50"
        />
        <StatCard
          label="Critical Issues"
          value={criticalIssues}
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
          iconBg="bg-red-50"
        />
        <StatCard
          label="Compliant Sites"
          value={compliantSites}
          icon={<ShieldCheck className="h-4 w-4 text-green-600" />}
          iconBg="bg-green-50"
        />
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg bg-secondary border-0 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <Button size="sm" onClick={() => navigate('/scan')} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg gap-2">
            <ScanSearch className="h-3.5 w-3.5" />
            New Scan
          </Button>
        </div>

        {/* Table */}
        {audits.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center px-6">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
              <ScanSearch className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No audits yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Run your first scan to see your accessibility score.
            </p>
            <Button
              onClick={() => navigate('/scan')}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              Run Your First Scan
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">URL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">WCAG Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Pages</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(audit => (
                <tr
                  key={audit.id}
                  onClick={() => navigate(`/audits/${audit.id}`)}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3.5 max-w-[220px]">
                    <span className="flex items-center gap-1.5 text-primary hover:underline truncate">
                      <Link className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{audit.website_url}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                    {new Date(audit.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn('font-semibold', audit.wcag_score ? getScoreColor(audit.wcag_score) : 'text-muted-foreground')}>
                      {audit.wcag_score != null ? audit.wcag_score : '--'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={audit.status} />
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {audit.pages_scanned}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/audits/${audit.id}`)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {audit.status === 'completed' && (
                        <button
                          onClick={(e) => handleDownload(e, audit)}
                          disabled={downloading === audit.id}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, audit.id)}
                        disabled={deleting === audit.id}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
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
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total {audits.length} item{audits.length !== 1 ? 's' : ''}</span>
            {audits.length > 5 && (
              <button onClick={() => navigate('/reports')} className="text-xs text-primary hover:underline">
                View all reports
              </button>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  )
}
