import { useState } from "react"
import type { AuditResult } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Download, Eye, Trash2, Clock, Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MagnifyingGlassIcon, CalendarIcon, CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons"

interface ReportsViewProps {
  onViewAudit: (audit: AuditResult) => void
}

const mockReports: AuditResult[] = [
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
  {
    id: "4",
    url: "https://startup-hub.com",
    score: 91,
    issues: [],
    scannedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    pagesScanned: 12,
  },
  {
    id: "5",
    url: "https://digital-agency.co",
    score: 67,
    issues: [],
    scannedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    pagesScanned: 34,
  },
  {
    id: "6",
    url: "https://ecommerce-pro.shop",
    score: 58,
    issues: [],
    scannedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    pagesScanned: 89,
  },
]

export function ReportsView({ onViewAudit }: ReportsViewProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredReports = mockReports.filter((report) => report.url.toLowerCase().includes(searchQuery.toLowerCase()))

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

  const getStatusBadge = (score: number) => {
    if (score >= 80) return { label: "Compliant", variant: "success" as const }
    if (score >= 60) return { label: "Needs Work", variant: "warning" as const }
    return { label: "Non-Compliant", variant: "destructive" as const }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Reports</h1>
          <p className="text-muted-foreground">View and export your accessibility audit history</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Download className="mr-2 h-4 w-4" />
          Export All Reports
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-border bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Date Range
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
                <CaretSortIcon className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">{filteredReports.length} Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const status = getStatusBadge(report.score)
              return (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-lg ${getScoreBg(report.score)}`}
                    >
                      <span className={`text-xl font-bold ${getScoreColor(report.score)}`}>{report.score}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium text-foreground">{report.url}</p>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(report.scannedAt)}
                        </span>
                        <span>{report.pagesScanned} pages</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`border-0 ${
                        status.variant === "success"
                          ? "bg-success/10 text-success"
                          : status.variant === "warning"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {status.label}
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewAudit(report)}
                      className="border-border text-foreground hover:bg-secondary"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-secondary bg-transparent"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <DotsHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem className="text-foreground focus:bg-secondary focus:text-foreground">
                          Re-scan Website
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-foreground focus:bg-secondary focus:text-foreground">
                          Share Report
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredReports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">No reports found matching your search</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}
