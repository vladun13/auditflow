"use client"

import { useState } from "react"
import type { AuditResult, Issue } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  Share2,
  AlertTriangle,
  Info,
  CheckCircle,
  Code,
  Lightbulb,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { ArrowLeftIcon, ExclamationTriangleIcon, CopyIcon } from "@radix-ui/react-icons"

interface AuditResultsViewProps {
  audit: AuditResult
  onBack: () => void
}

export function AuditResultsView({ audit, onBack }: AuditResultsViewProps) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(audit.issues[0] || null)
  const [copiedCode, setCopiedCode] = useState(false)

  const criticalCount = audit.issues.filter((i) => i.type === "critical").length
  const seriousCount = audit.issues.filter((i) => i.type === "serious").length
  const moderateCount = audit.issues.filter((i) => i.type === "moderate").length
  const minorCount = audit.issues.filter((i) => i.type === "minor").length

  const getIssueIcon = (type: Issue["type"]) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      case "serious":
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case "moderate":
        return <Info className="h-4 w-4" />
      case "minor":
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getIssueColor = (type: Issue["type"]) => {
    switch (type) {
      case "critical":
        return "text-destructive bg-destructive/10 border-destructive/30"
      case "serious":
        return "text-warning bg-warning/10 border-warning/30"
      case "moderate":
        return "text-primary bg-primary/10 border-primary/30"
      case "minor":
        return "text-success bg-success/10 border-success/30"
    }
  }

  const handleCopyCode = () => {
    if (selectedIssue) {
      navigator.clipboard.writeText(selectedIssue.element)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const getScoreRing = (score: number) => {
    const circumference = 2 * Math.PI * 45
    const offset = circumference - (score / 100) * circumference
    let color = "stroke-destructive"
    if (score >= 80) color = "stroke-success"
    else if (score >= 60) color = "stroke-warning"

    return (
      <svg className="h-32 w-32 -rotate-90 transform">
        <circle cx="64" cy="64" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-secondary" />
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={color}
        />
      </svg>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Results</h1>
            <p className="flex items-center gap-2 text-muted-foreground">
              {audit.url}
              <ExternalLink className="h-3 w-3" />
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-1">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="relative">
              {getScoreRing(audit.score)}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{audit.score}</span>
                <span className="text-sm text-muted-foreground">out of 100</span>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">{audit.pagesScanned} pages analyzed</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Issues by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center">
                <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
                <p className="mt-2 text-2xl font-bold text-destructive">{criticalCount}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-center">
                <ExclamationTriangleIcon className="mx-auto h-6 w-6 text-warning" />
                <p className="mt-2 text-2xl font-bold text-warning">{seriousCount}</p>
                <p className="text-xs text-muted-foreground">Serious</p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
                <Info className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-2xl font-bold text-primary">{moderateCount}</p>
                <p className="text-xs text-muted-foreground">Moderate</p>
              </div>
              <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-center">
                <CheckCircle className="mx-auto h-6 w-6 text-success" />
                <p className="mt-2 text-2xl font-bold text-success">{minorCount}</p>
                <p className="text-xs text-muted-foreground">Minor</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues Detail */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Issues List */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Detected Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 grid w-full grid-cols-5 bg-secondary">
                <TabsTrigger
                  value="all"
                  className="text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="critical"
                  className="text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  Critical
                </TabsTrigger>
                <TabsTrigger
                  value="serious"
                  className="text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  Serious
                </TabsTrigger>
                <TabsTrigger
                  value="moderate"
                  className="text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  Moderate
                </TabsTrigger>
                <TabsTrigger
                  value="minor"
                  className="text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  Minor
                </TabsTrigger>
              </TabsList>

              {["all", "critical", "serious", "moderate", "minor"].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-2">
                  {audit.issues
                    .filter((issue) => tab === "all" || issue.type === tab)
                    .map((issue) => (
                      <button
                        key={issue.id}
                        onClick={() => setSelectedIssue(issue)}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          selectedIssue?.id === issue.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-secondary/30 hover:bg-secondary/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 rounded-full p-1 ${getIssueColor(issue.type)}`}>
                            {getIssueIcon(issue.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                                WCAG {issue.wcagCriteria}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {issue.count} {issue.count === 1 ? "instance" : "instances"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-medium text-foreground truncate">{issue.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Issue Detail */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedIssue ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className={`border ${getIssueColor(selectedIssue.type)}`}>{selectedIssue.type}</Badge>
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      WCAG {selectedIssue.wcagCriteria}
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">{selectedIssue.description}</h3>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Code className="h-4 w-4" />
                      Affected Element
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyCode}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copiedCode ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <CopyIcon className="mr-1 h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-secondary/50 p-3 font-mono text-sm text-foreground">
                    <code>{selectedIssue.element}</code>
                  </pre>
                </div>

                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">How to Fix</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedIssue.recommendation}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
                  >
                    View WCAG Docs
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                  <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                    Mark as Resolved
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Info className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">Select an issue to view AI-powered recommendations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
