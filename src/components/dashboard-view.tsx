"use client"

import type { AuditResult, ViewType } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScanSearch, FileText, AlertTriangle, CheckCircle, TrendingUp, Clock } from "lucide-react"
import { ArrowRightIcon } from "@radix-ui/react-icons"

interface DashboardViewProps {
  onViewAudit: (audit: AuditResult) => void
  onNavigate: (view: ViewType) => void
}

const recentAudits: AuditResult[] = [
  {
    id: "1",
    url: "https://acme-corp.com",
    score: 72,
    issues: [],
    scannedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    pagesScanned: 24,
  },
  {
    id: "2",
    url: "https://techstartup.io",
    score: 89,
    issues: [],
    scannedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    pagesScanned: 18,
  },
  {
    id: "3",
    url: "https://enterprise.dev",
    score: 45,
    issues: [],
    scannedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    pagesScanned: 56,
  },
]

export function DashboardView({ onViewAudit, onNavigate }: DashboardViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    return "text-destructive"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success/10"
    if (score >= 60) return "bg-warning/10"
    return "bg-destructive/10"
  }

  return (
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
                <p className="text-3xl font-bold text-foreground">127</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="text-success">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-3xl font-bold text-foreground">74%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="text-success">+5%</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-3xl font-bold text-foreground">23</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="text-success">-8</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliant Sites</p>
                <p className="text-3xl font-bold text-foreground">18</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">WCAG 2.1 AA compliant</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-card transition-colors hover:border-primary/50">
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
                  onClick={() => onNavigate("scan")}
                  className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Scan Website
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card transition-colors hover:border-primary/50">
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
                  onClick={() => onNavigate("reports")}
                  variant="outline"
                  className="mt-4 border-border text-foreground hover:bg-secondary"
                >
                  Browse Reports
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audits */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Recent Audits</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("reports")}
            className="text-muted-foreground hover:text-foreground"
          >
            View All
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAudits.map((audit) => (
              <div
                key={audit.id}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${getScoreBg(audit.score)}`}>
                    <span className={`text-lg font-bold ${getScoreColor(audit.score)}`}>{audit.score}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{audit.url}</p>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(audit.scannedAt)}
                      </span>
                      <span>{audit.pagesScanned} pages scanned</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`border-0 ${getScoreBg(audit.score)} ${getScoreColor(audit.score)}`}
                  >
                    {audit.score >= 80 ? "Passing" : audit.score >= 60 ? "Needs Work" : "Failing"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewAudit(audit)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    View
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
