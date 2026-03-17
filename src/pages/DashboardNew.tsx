import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { auditApi, userApi } from '@/lib/api'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, AlertTriangle, CheckCircle, TrendingUp, Clock, ScanSearch, ArrowRight } from 'lucide-react'

interface Audit {
  id: string
  website_url: string
  status: string
  wcag_score: number | null
  wcag_level: string | null
  total_violations: number
  critical_count: number
  serious_count: number
  moderate_count: number
  minor_count: number
  pages_scanned: number
  created_at: string
}

type ViewType = 'dashboard' | 'scan' | 'reports'

export function DashboardNew() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0)
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchData()
  }, [user, navigate])

  const fetchData = async () => {
    setLoading(true)

    const auditsResponse = await auditApi.list()
    if (auditsResponse.data) {
      setAudits(auditsResponse.data as Audit[])
    }

    const creditsResponse = await userApi.getCredits()
    if (creditsResponse.data) {
      setCredits((creditsResponse.data as { credits: number }).credits)
    }

    setLoading(false)
  }

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

  const handleViewChange = (view: ViewType) => {
    if (view === 'scan') {
      navigate('/scan')
    } else if (view === 'reports') {
      setCurrentView('reports')
    } else {
      setCurrentView('dashboard')
    }
  }

  const handleViewAudit = (audit: Audit) => {
    navigate(`/audits/${audit.id}`)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  // Calculate stats
  const completedAudits = audits.filter(a => a.status === 'completed')
  const avgScore = completedAudits.length > 0
    ? completedAudits.reduce((sum, a) => sum + (a.wcag_score || 0), 0) / completedAudits.length
    : 0
  const totalCritical = audits.reduce((sum, a) => sum + a.critical_count, 0)
  const compliantSites = audits.filter(a => a.wcag_score && a.wcag_score >= 85).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">AuditFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Credits:</span>
              <Badge variant="secondary" className="font-semibold">{credits}</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/pricing')}
            >
              Buy Credits
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && (
            <div className="p-6 lg:p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Monitor your accessibility audits and compliance status</p>
              </div>

              {/* Stats Grid */}
              <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border bg-card">
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
                    <p className="mt-2 text-xs text-muted-foreground">
                      {completedAudits.length} completed
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
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
                    <p className="mt-2 text-xs text-muted-foreground">
                      WCAG compliance
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
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
                    <p className="mt-2 text-xs text-muted-foreground">
                      Needs immediate attention
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
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
                <Card className="border-border bg-card transition-colors hover:border-primary/50 cursor-pointer">
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
                        <Button
                          onClick={() => navigate('/scan')}
                          className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Scan Website
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card transition-colors hover:border-primary/50 cursor-pointer">
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
                        <Button
                          onClick={() => setCurrentView('reports')}
                          variant="outline"
                          className="mt-4 border-border text-foreground hover:bg-secondary"
                        >
                          Browse Reports
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Audits */}
              <Card className="border-border bg-card">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-lg font-semibold text-foreground">Recent Audits</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView('reports')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-6">
                  {audits.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No audits yet</p>
                      <Button onClick={() => navigate('/scan')}>
                        Run Your First Scan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {audits.slice(0, 5).map((audit) => (
                        <div
                          key={audit.id}
                          onClick={() => handleViewAudit(audit)}
                          className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50 cursor-pointer"
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
                                <span>{audit.pages_scanned} pages scanned</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={`border-0 ${audit.wcag_score ? getScoreBg(audit.wcag_score) : 'bg-gray-50'} ${audit.wcag_score ? getScoreColor(audit.wcag_score) : 'text-gray-500'}`}
                            >
                              {audit.status === 'completed' ? (audit.wcag_score && audit.wcag_score >= 80 ? "Passing" : audit.wcag_score && audit.wcag_score >= 60 ? "Needs Work" : "Failing") : audit.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              View
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentView === 'reports' && (
            <div className="p-6 lg:p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">All Reports</h1>
                <p className="text-muted-foreground">View and manage all your accessibility audits</p>
              </div>

              <div className="space-y-4">
                {audits.map((audit) => (
                  <Card
                    key={audit.id}
                    onClick={() => handleViewAudit(audit)}
                    className="border-border bg-card hover:border-primary/50 cursor-pointer transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${audit.wcag_score ? getScoreBg(audit.wcag_score) : 'bg-gray-50'}`}>
                            <span className={`text-lg font-bold ${audit.wcag_score ? getScoreColor(audit.wcag_score) : 'text-gray-500'}`}>
                              {audit.wcag_score?.toFixed(0) || '—'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{audit.website_url}</p>
                            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{new Date(audit.created_at).toLocaleDateString()}</span>
                              <span>{audit.pages_scanned} pages</span>
                              <span>{audit.total_violations} violations</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'}>
                          {audit.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return "Just now"
}
