import { useNavigate } from 'react-router-dom'
import { useAudits } from '@/hooks/useAudits'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, AlertTriangle, CheckCircle, TrendingUp, Clock, ScanSearch, ArrowRight } from 'lucide-react'

export function DashboardNew() {
  const navigate = useNavigate()
  const { audits, loading } = useAudits()

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50'
    if (score >= 60) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  const completedAudits = audits.filter(a => a.status === 'completed')
  const avgScore = completedAudits.length > 0
    ? completedAudits.reduce((sum, a) => sum + (a.wcag_score || 0), 0) / completedAudits.length
    : 0
  const totalCritical = audits.reduce((sum, a) => sum + a.critical_count, 0)
  const compliantSites = audits.filter(a => a.wcag_score && a.wcag_score >= 85).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Monitor your accessibility audits and compliance status</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-100 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Audits</p>
                <p className="text-3xl font-bold text-foreground">{audits.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{completedAudits.length} completed</p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-3xl font-bold text-foreground">{avgScore.toFixed(0)}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">WCAG compliance</p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-3xl font-bold text-foreground">{totalCritical}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Needs immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliant Sites</p>
                <p className="text-3xl font-bold text-foreground">{compliantSites}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">WCAG 2.1 AA compliant</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card className="border-gray-100 bg-white shadow-sm transition-colors hover:border-indigo-200 hover:shadow-sm cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary">
                <ScanSearch className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Start New Audit</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter a URL to scan for WCAG accessibility violations and generate AI-powered recommendations.
                </p>
                <Button onClick={() => navigate('/scan')} className="mt-4">
                  Scan Website
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 bg-white shadow-sm transition-colors hover:border-indigo-200 hover:shadow-sm cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <FileText className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">View All Reports</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Access your complete audit history, export PDFs, and track compliance progress over time.
                </p>
                <Button onClick={() => navigate('/reports')} variant="outline" className="mt-4">
                  Browse Reports
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audits */}
      <Card className="border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Recent Audits</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')} className="text-muted-foreground hover:text-foreground">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <CardContent className="p-6">
          {audits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No audits yet</p>
              <Button onClick={() => navigate('/scan')}>Run Your First Scan</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {audits.slice(0, 5).map((audit) => (
                <div
                  key={audit.id}
                  onClick={() => navigate(`/audits/${audit.id}`)}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:border-indigo-100 hover:shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${audit.wcag_score ? getScoreBg(audit.wcag_score) : 'bg-gray-50'}`}>
                      <span className={`text-lg font-bold ${audit.wcag_score ? getScoreColor(audit.wcag_score) : 'text-gray-500'}`}>
                        {audit.wcag_score?.toFixed(0) || '—'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{audit.website_url}</p>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(new Date(audit.created_at))}
                        </span>
                        <span>{audit.pages_scanned} pages</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`border-0 ${audit.wcag_score ? getScoreBg(audit.wcag_score) : 'bg-gray-50'} ${audit.wcag_score ? getScoreColor(audit.wcag_score) : 'text-gray-500'}`}
                    >
                      {audit.status === 'completed'
                        ? audit.wcag_score && audit.wcag_score >= 80 ? 'Passing'
                          : audit.wcag_score && audit.wcag_score >= 60 ? 'Needs Work' : 'Failing'
                        : audit.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      View <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return 'Just now'
}
