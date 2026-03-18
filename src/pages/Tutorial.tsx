import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Globe, Shield, CheckCircle, Zap, FileText, ChevronRight } from 'lucide-react'

interface TutorialStep {
  step: number
  subheading: string
  description: string
  illustration: React.ReactNode
}

// ── Illustrations for each step ──────────────────────────────────────────────

function ScanUrlIllustration() {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 45%, #c084fc 75%, #f0abfc 100%)' }}>
      <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-pink-300/20 blur-3xl" />
      <div className="relative h-full flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          {/* Globe badge */}
          <div className="flex justify-end mb-4">
            <div className="bg-white rounded-2xl p-3 shadow-xl">
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          {/* URL input mockup — highlighted */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#4f46e5] ring-4 ring-[#4f46e5]/20">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <Globe className="h-5 w-5 text-gray-400 shrink-0" />
              <span className="text-base text-gray-400 font-mono">https://example.com</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                Crawl Depth
              </div>
              <div className="flex gap-2">
                <button className="border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-500">Preview</button>
                <button className="bg-gray-100 rounded-full px-4 py-1.5 text-sm text-gray-400 cursor-not-allowed">Start Scanning</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CrawlDepthIllustration() {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 45%, #c084fc 75%, #f0abfc 100%)' }}>
      <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-pink-300/20 blur-3xl" />
      <div className="relative h-full flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-300/50 ring-4 ring-purple-200/30">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <Globe className="h-5 w-5 text-[#4f46e5] shrink-0" />
              <span className="text-base text-gray-700 font-mono">https://example.com</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Pages to scan</span>
                <span className="text-sm font-bold text-[#4f46e5] bg-indigo-50 px-2 py-0.5 rounded-md">3 pages</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div className="h-full w-3/5 bg-[#4f46e5] rounded-full" />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>1 page</span>
                <span>5 pages</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-3 bg-indigo-50">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#4f46e5]" />
                <span className="text-sm text-gray-700">This scan uses <strong>1 credit</strong></span>
              </div>
              <span className="text-sm font-medium text-gray-700">5 remaining</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StartScanIllustration() {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 45%, #c084fc 75%, #f0abfc 100%)' }}>
      <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-pink-300/20 blur-3xl" />
      <div className="relative h-full flex flex-col items-center justify-center gap-5 p-12">
        {/* Scanning animation mockup */}
        <div className="w-full max-w-xs text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-white/20 flex items-center justify-center">
                <div className="h-14 w-14 rounded-full border-4 border-white/40 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-white/80 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-[#4f46e5]" />
                  </div>
                </div>
              </div>
              <div className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-green-400 border-2 border-white animate-pulse" />
            </div>
          </div>
          <p className="text-white font-semibold text-lg mb-2">Scanning...</p>
          <p className="text-white/70 text-sm mb-4">Checking WCAG compliance</p>
          <div className="bg-white/20 rounded-full h-2 w-full">
            <div className="bg-white h-full rounded-full w-2/3 transition-all" />
          </div>
          <p className="text-white/60 text-xs mt-2">Estimated: 2–5 min</p>
        </div>
      </div>
    </div>
  )
}

function ResultsIllustration() {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 45%, #c084fc 75%, #f0abfc 100%)' }}>
      <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-pink-300/20 blur-3xl" />
      <div className="relative h-full flex items-center justify-center p-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Audit Results</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Completed</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">example.com</p>
            </div>
            {/* Score ring mockup */}
            <div className="p-5 flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="163" strokeDashoffset="49" strokeLinecap="round" transform="rotate(-90 32 32)"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">70</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-600">Critical</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-500">Serious</span>
                  <span className="font-medium">7</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-yellow-600">Moderate</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
            </div>
            {/* Issues list */}
            {['Missing alt text', 'Low color contrast', 'No focus indicator'].map((issue, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2.5 border-t border-gray-50">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                <span className="text-sm text-gray-700">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportIllustration() {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 45%, #c084fc 75%, #f0abfc 100%)' }}>
      <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-pink-300/20 blur-3xl" />
      <div className="relative h-full flex items-center justify-center p-12">
        <div className="w-full max-w-sm space-y-4">
          {/* PDF report mockup */}
          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Accessibility Report</p>
                <p className="text-xs text-gray-400">example.com · PDF</p>
              </div>
              <button className="ml-auto text-xs bg-[#4f46e5] text-white px-3 py-1.5 rounded-full">Download</button>
            </div>
            <div className="space-y-2">
              {['Executive Summary', 'Critical Issues (3)', 'AI Fix Instructions', 'WCAG Compliance Level'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Ready badge */}
          <div className="flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-5 py-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-white" />
              <span className="text-sm text-white font-medium">You're ready to start!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Step definitions ──────────────────────────────────────────────────────────

const STEPS: TutorialStep[] = [
  {
    step: 1,
    subheading: 'Start with the website URL',
    description: 'Paste the link to the website you want to audit for accessibility compliance',
    illustration: <ScanUrlIllustration />,
  },
  {
    step: 2,
    subheading: 'Set your crawl depth',
    description: 'Choose how many pages to scan — from a single page up to your entire site',
    illustration: <CrawlDepthIllustration />,
  },
  {
    step: 3,
    subheading: 'Start the scan',
    description: 'Our engine crawls your site with Puppeteer and runs axe-core WCAG checks on every page',
    illustration: <StartScanIllustration />,
  },
  {
    step: 4,
    subheading: 'Review your audit results',
    description: 'See a full breakdown of violations by severity — critical, serious, moderate, and minor',
    illustration: <ResultsIllustration />,
  },
  {
    step: 5,
    subheading: 'Get your AI-powered report',
    description: 'Download a PDF with plain-English explanations and step-by-step fix instructions for every issue',
    illustration: <ReportIllustration />,
  },
]

const TOTAL = STEPS.length

export function Tutorial() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)

  const step = STEPS[current]
  const isLast = current === TOTAL - 1

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('onboarding_complete', 'true')
      navigate('/dashboard')
    } else {
      setCurrent(c => c + 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding_complete', 'true')
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — content */}
      <div className="flex w-full flex-col justify-between px-14 py-14 lg:w-[42%]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5] text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 20V4L10 14V4L17 14V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">AuditFlow</span>
        </Link>

        {/* Main content */}
        <div className="max-w-sm">
          {/* Progress bar */}
          <div className="flex gap-1.5 mb-12">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= current ? 'bg-[#4F46E5]' : 'bg-gray-200'}`}
              />
            ))}
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
            Let's run your first accessibility scan
          </h1>

          {/* Step content */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{step.subheading}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
          </div>

          {/* Step counter + Continue */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleNext}
              className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-full h-10 flex items-center justify-center gap-1.5"
            >
              {isLast ? 'Get Started' : 'Continue'}
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          <p className="mt-3 text-xs text-center text-gray-400">
            Step {current + 1} of {TOTAL}
          </p>
        </div>

        {/* Skip */}
        <button
          type="button"
          onClick={handleSkip}
          className="w-full max-w-sm border border-gray-200 rounded-full py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Skip Tutorial
        </button>
      </div>

      {/* Right — illustration */}
      <div className="hidden lg:flex lg:flex-1 p-4">
        <div className="w-full h-full rounded-3xl overflow-hidden">
          {step.illustration}
        </div>
      </div>
    </div>
  )
}
