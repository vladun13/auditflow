import { useState } from "react"
import type { AuditResult, Issue } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ScanSearch, Globe, CheckCircle2, FileSearch, Brain, FileText } from "lucide-react"
import { ReloadIcon } from "@radix-ui/react-icons"

interface ScanViewProps {
  onScanComplete: (audit: AuditResult) => void
}

const scanSteps = [
  { id: 1, label: "Crawling pages", icon: Globe },
  { id: 2, label: "Analyzing accessibility", icon: FileSearch },
  { id: 3, label: "Generating AI recommendations", icon: Brain },
  { id: 4, label: "Compiling report", icon: FileText },
]

export function ScanView({ onScanComplete }: ScanViewProps) {
  const [url, setUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [options, setOptions] = useState({
    deepScan: true,
    includeAria: true,
    colorContrast: true,
    keyboardNav: true,
  })

  const handleScan = async () => {
    if (!url) return

    setIsScanning(true)
    setCurrentStep(1)
    setProgress(0)

    // Simulate scanning process
    for (let step = 1; step <= 4; step++) {
      setCurrentStep(step)
      for (let p = 0; p <= 100; p += 5) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        setProgress((step - 1) * 25 + p / 4)
      }
    }

    // Generate mock audit result
    const mockIssues: Issue[] = [
      {
        id: "1",
        type: "critical",
        wcagCriteria: "1.1.1",
        description: "Images must have alternate text",
        element: '<img src="hero.jpg">',
        recommendation: 'Add an alt attribute describing the image content. For decorative images, use alt="".',
        count: 12,
      },
      {
        id: "2",
        type: "serious",
        wcagCriteria: "1.4.3",
        description: "Contrast ratio insufficient for normal text",
        element: '<p class="subtitle">',
        recommendation: "Increase the color contrast ratio to at least 4.5:1 for normal text or 3:1 for large text.",
        count: 8,
      },
      {
        id: "3",
        type: "serious",
        wcagCriteria: "2.4.4",
        description: "Links must have discernible text",
        element: '<a href="/page"><img src="icon.svg"></a>',
        recommendation: "Add aria-label or visible text content to describe the link purpose.",
        count: 5,
      },
      {
        id: "4",
        type: "moderate",
        wcagCriteria: "2.4.1",
        description: "Page must have skip navigation link",
        element: "<body>",
        recommendation: "Add a skip link at the beginning of the page to bypass navigation.",
        count: 1,
      },
      {
        id: "5",
        type: "moderate",
        wcagCriteria: "3.1.1",
        description: "Page must have lang attribute",
        element: "<html>",
        recommendation: 'Add lang="en" attribute to the html element.',
        count: 1,
      },
      {
        id: "6",
        type: "minor",
        wcagCriteria: "2.4.6",
        description: "Heading levels should increase by one",
        element: "<h4>",
        recommendation: "Ensure heading hierarchy is sequential (h1 → h2 → h3).",
        count: 3,
      },
    ]

    const audit: AuditResult = {
      id: Date.now().toString(),
      url,
      score: 72,
      issues: mockIssues,
      scannedAt: new Date(),
      pagesScanned: 24,
    }

    setIsScanning(false)
    onScanComplete(audit)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">New Accessibility Scan</h1>
        <p className="text-muted-foreground">Enter a URL to analyze for WCAG 2.1 accessibility compliance</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scan Form */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ScanSearch className="h-5 w-5 text-primary" />
              Website URL
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter the full URL of the website you want to audit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url" className="text-foreground">
                  URL to scan
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isScanning}
                    className="flex-1 border-border bg-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-foreground">Scan Options</Label>
                <div className="grid gap-3">
                  {Object.entries(options).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-3">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => setOptions({ ...options, [key]: checked as boolean })}
                        disabled={isScanning}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <Label htmlFor={key} className="text-sm font-normal text-muted-foreground">
                        {key === "deepScan" && "Deep scan (crawl all linked pages)"}
                        {key === "includeAria" && "Include ARIA attribute checks"}
                        {key === "colorContrast" && "Color contrast analysis"}
                        {key === "keyboardNav" && "Keyboard navigation testing"}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleScan}
                disabled={!url || isScanning}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isScanning ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <ScanSearch className="mr-2 h-4 w-4" />
                    Start Accessibility Scan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scan Progress */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Scan Progress</CardTitle>
            <CardDescription className="text-muted-foreground">
              {isScanning ? "Analyzing your website for accessibility issues..." : "Start a scan to see progress"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isScanning ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium text-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-secondary" />
                </div>

                <div className="space-y-3">
                  {scanSteps.map((step) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                        currentStep === step.id
                          ? "border-primary bg-primary/5"
                          : currentStep > step.id
                            ? "border-success/30 bg-success/5"
                            : "border-border bg-secondary/30"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          currentStep === step.id
                            ? "bg-primary text-primary-foreground"
                            : currentStep > step.id
                              ? "bg-success text-success-foreground"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : currentStep === step.id ? (
                          <ReloadIcon className="h-4 w-4 animate-spin" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <ScanSearch className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Enter a URL and click "Start Accessibility Scan" to begin
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* WCAG Guidelines Info */}
      <Card className="mt-6 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">WCAG 2.1 Guidelines Checked</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { title: "Perceivable", count: 29, description: "Content must be presentable to users" },
              { title: "Operable", count: 24, description: "UI must be operable by all users" },
              { title: "Understandable", count: 17, description: "Information must be understandable" },
              { title: "Robust", count: 8, description: "Content must be robust for assistive tech" },
            ].map((principle) => (
              <div key={principle.title} className="rounded-lg border border-border bg-secondary/30 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{principle.title}</h4>
                  <span className="text-sm font-medium text-primary">{principle.count} criteria</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{principle.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
