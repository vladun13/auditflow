import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Globe, Link2, X, Eye } from "lucide-react"

const DEPTH_OPTIONS = [
  { value: 1, label: "1 page", description: "Quick check" },
  { value: 2, label: "2 pages", description: "Light Scan" },
  { value: 3, label: "3 pages", description: "Standard Scan" },
  { value: 4, label: "4 pages", description: "Deep Scan" },
  { value: 5, label: "5 pages", description: "Full Scan" },
]

function PagesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#4F46E5]">
      <rect x="4" y="6" width="13" height="16" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="7" y="3" width="13" height="16" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 11h7M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function CrawlDepthButton({
  depth,
  onDepthChange,
}: {
  depth: number
  onDepthChange: (v: number) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const selected = DEPTH_OPTIONS.find(o => o.value === depth) ?? DEPTH_OPTIONS[2]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 h-10 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
      >
        <Link2 className="h-4 w-4 text-gray-500" />
        Crawl Depth
        {depth !== 3 && (
          <span className="ml-1 rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-[#4F46E5]">{depth}</span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60 overflow-hidden"
          style={{ minWidth: 280, zIndex: 9999 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="text-base font-bold text-gray-900">Crawl Depth</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Options */}
          <div className="p-3 flex flex-col gap-1.5">
            {DEPTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onDepthChange(opt.value); setOpen(false) }}
                className={`flex items-center gap-3 w-full rounded-xl px-3 py-3 text-left transition-colors cursor-pointer ${
                  selected.value === opt.value
                    ? "border-2 border-[#4F46E5] bg-indigo-50/50"
                    : "border border-gray-100 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <PagesIcon />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Decorative showcase cards ────────────────────────────────────────────────

function PurpleCard() {
  return (
    <div className="relative flex-1 min-w-0 rounded-2xl overflow-hidden bg-[#7646ff]" style={{ minHeight: 220 }}>
      {/* Abstract circle shapes */}
      <div className="absolute -top-8 -left-8 h-36 w-36 rounded-full bg-purple-400/40" />
      <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-indigo-300/30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      {/* Cloud-like element */}
      <div className="absolute bottom-4 left-4 h-10 w-20 rounded-full bg-white/20" />
      <div className="absolute top-4 right-4 h-8 w-16 rounded-full bg-white/15" />
      {/* Label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold tracking-widest text-white/40 uppercase">WCAG Report</div>
    </div>
  )
}

function GlassCard() {
  return (
    <div className="relative flex-1 min-w-0 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50" style={{ minHeight: 220 }}>
      <div className="absolute inset-4 rounded-xl border border-white/60 bg-white/50 backdrop-blur-sm shadow-inner" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-indigo-200/30 blur-2xl" />
      {/* Score ring mock */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#e0e7ff" strokeWidth="6"/>
          <circle cx="32" cy="32" r="26" fill="none" stroke="#6366f1" strokeWidth="6" strokeDasharray="100 63" strokeLinecap="round" transform="rotate(-90 32 32)"/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500">85</div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold tracking-widest text-gray-300 uppercase">Score</div>
    </div>
  )
}

function BlueCard() {
  return (
    <div className="relative flex-1 min-w-0 rounded-2xl overflow-hidden bg-[#a6ace9]" style={{ minHeight: 220 }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#8b91e3]/80 to-[#b0b5eb]" />
      {/* Vertical highlight lines */}
      <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white/30" />
      <div className="absolute left-2/4 top-0 bottom-0 w-px bg-white/20" />
      <div className="absolute left-3/4 top-0 bottom-0 w-px bg-white/15" />
      {/* Abstract badge */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 rounded-full bg-white/20 px-4 py-1 text-[10px] font-semibold text-white/80">AA</div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-28 rounded-full bg-white/10 blur-xl" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold tracking-widest text-white/40 uppercase">Compliance</div>
    </div>
  )
}

function LavenderCard() {
  return (
    <div className="relative flex-1 min-w-0 rounded-2xl overflow-hidden bg-[#f5edff]" style={{ minHeight: 220 }}>
      {/* Conic gradient grid pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(circle at 25% 25%, #d8b4fe 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, #c4b5fd 0%, transparent 50%)
        `,
        opacity: 0.5,
      }} />
      <div className="absolute inset-4 grid grid-cols-3 grid-rows-3 gap-1 opacity-20">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-md bg-indigo-400" />
        ))}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-purple-300/30 blur-xl" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold tracking-widest text-purple-300 uppercase">AI Fixes</div>
    </div>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────

export function Hero() {
  const [url, setUrl] = useState("")
  const [crawlDepth, setCrawlDepth] = useState(3)
  const hasUrl = url.trim().length > 0

  return (
    <section className="relative bg-white flex flex-col items-center pt-20" style={{ overflow: 'visible' }}>
      {/* Gradient background blobs */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[700px] w-[700px] rounded-full bg-gradient-to-bl from-blue-500/45 via-indigo-500/35 to-violet-500/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-pink-400/35 via-purple-300/25 to-blue-400/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-400/15 via-indigo-300/10 to-blue-300/5 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-20 mx-auto w-full max-w-[868px] px-6 text-center pt-20 pb-16">
        {/* Badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
          </span>
          AI-Powered Accessibility Audits
        </div>

        {/* Headline */}
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-[52px] md:leading-[60px]">
          Fix Accessibility Issues{" "}
          <span className="text-[#4F46E5]">Before They Reach Production</span>
        </h1>

        <p className="mb-10 mx-auto max-w-xl text-base text-gray-500 sm:text-lg leading-relaxed">
          Generate comprehensive WCAG audit reports for your websites and get instant, AI-driven fix recommendations. Built for developers and QA teams.
        </p>

        {/* URL Input Card */}
        <div className="mx-auto max-w-[800px] rounded-3xl border border-gray-100 bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03),0px_1px_6px_-1px_rgba(0,0,0,0.02),0px_2px_4px_0px_rgba(0,0,0,0.02)]" style={{ overflow: 'visible' }}>
          {/* URL row */}
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
            <Globe className="h-5 w-5 shrink-0 text-gray-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 bg-transparent text-base text-gray-700 placeholder:text-gray-300 outline-none"
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between px-4 py-4">
            {/* Crawl Depth pill button */}
            <CrawlDepthButton depth={crawlDepth} onDepthChange={setCrawlDepth} />

            <div className="flex items-center gap-3">
              {/* Preview */}
              <button
                disabled={!hasUrl}
                className={`inline-flex items-center gap-2 rounded-full border h-10 px-5 text-sm transition-colors ${
                  hasUrl
                    ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm cursor-pointer"
                    : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                }`}
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>

              {/* Start Scanning */}
              {hasUrl ? (
                <Link
                  to={`/scan?url=${encodeURIComponent(url)}&depth=${crawlDepth}`}
                  className="inline-flex items-center justify-center rounded-full bg-[#4F46E5] hover:bg-[#4338CA] h-10 px-6 text-sm font-medium text-white transition-colors shadow-sm"
                >
                  Start Scanning
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 h-10 px-6 text-sm text-gray-300 cursor-not-allowed"
                >
                  Start Scanning
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <p className="mt-4 text-xs text-gray-400">
          Already scanned{" "}
          <span className="font-semibold text-gray-600">11 websites</span>{" "}
          in the last 24 hours
        </p>

        {/* Trust indicators */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
          {["WCAG 2.1 AA & AAA", "Instant AI Fixes", "PDF & JSON Reports"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[#4F46E5]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Page preview card — Figma "Page" section at bottom of hero */}
      <div className="relative z-10 mx-6 mb-0 w-full max-w-[1360px] rounded-t-3xl bg-white px-8 pt-8 pb-0 shadow-[0px_-4px_24px_0px_rgba(0,0,0,0.06)]">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">See what your report looks like</h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Every scan generates a full accessibility breakdown — scored by severity, enriched with AI explanations, and ready to share or download as PDF.
          </p>
        </div>

        {/* 4 decorative cards */}
        <div className="flex gap-4 overflow-hidden" style={{ height: 200 }}>
          <PurpleCard />
          <GlassCard />
          <BlueCard />
          <LavenderCard />
        </div>
      </div>
    </section>
  )
}
