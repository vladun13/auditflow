import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Globe, Link2, Eye, X, XCircle, Zap } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useCredits } from "@/hooks/useCredits"
import { BuyCreditsModal } from "@/components/modals/BuyCreditsModal"
import { PreviewModal } from "@/components/modals/PreviewModal"

// ── Crawl Depth button (authenticated: depth picker / unauthenticated: unlock popup) ──

function CrawlDepthButton({ depth, onDepthChange }: { depth: number; onDepthChange: (v: number) => void }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const navigate = useNavigate()

  const DEPTH_OPTIONS = [
    { value: 1, label: "1 page", description: "Quick check" },
    { value: 2, label: "2 pages", description: "Light Scan" },
    { value: 3, label: "3 pages", description: "Standard Scan" },
    { value: 4, label: "4 pages", description: "Deep Scan" },
    { value: 5, label: "5 pages", description: "Full Scan" },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 h-9 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <Link2 className="h-4 w-4 text-gray-500" />
        Crawl Depth
        {user && depth !== 3 && (
          <span className="ml-1 rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-[#4F46E5]">{depth}</span>
        )}
      </button>

      {open && !user && (
        /* Unauthenticated: "Unlock more features" popup */
        <div className="absolute top-full left-0 mt-2 w-[220px] rounded-2xl border border-dashed border-indigo-300 bg-white shadow-lg p-4 z-50">
          <p className="text-sm font-semibold text-gray-900 mb-1">Unlock more features</p>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            Sign in to customize crawl depth and scan more pages at once.
          </p>
          <button
            onClick={() => { setOpen(false); navigate("/login") }}
            className="w-full rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium py-2 transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </div>
      )}

      {open && user && (
        /* Authenticated: depth picker */
        <div className="absolute top-full left-0 mt-2 w-[280px] rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-900">Crawl Depth</span>
            <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-2.5 flex flex-col gap-1.5">
            {DEPTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onDepthChange(opt.value); setOpen(false) }}
                className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                  depth === opt.value
                    ? "border-2 border-[#4F46E5] bg-indigo-50/50"
                    : "border border-gray-100 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#4F46E5]">
                    <rect x="4" y="6" width="13" height="16" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="7" y="3" width="13" height="16" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 11h7M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
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

// ── Signup modal (shown when unauthenticated user clicks Start Scanning) ──────

function SignupModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[380px] mx-4 rounded-3xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Illustration area */}
        <div className="flex items-center justify-center bg-indigo-50 px-8 pt-10 pb-8">
          <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Laptop */}
            <rect x="25" y="20" width="110" height="72" rx="6" fill="#C7D2FE" stroke="#818CF8" strokeWidth="1.5"/>
            <rect x="32" y="28" width="96" height="56" rx="3" fill="white"/>
            <rect x="10" y="92" width="140" height="8" rx="4" fill="#A5B4FC"/>
            {/* Globe on screen */}
            <circle cx="80" cy="56" r="22" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5"/>
            <ellipse cx="80" cy="56" rx="10" ry="22" fill="none" stroke="#6366F1" strokeWidth="1"/>
            <line x1="58" y1="56" x2="102" y2="56" stroke="#6366F1" strokeWidth="1"/>
            <line x1="62" y1="44" x2="98" y2="44" stroke="#6366F1" strokeWidth="0.75"/>
            <line x1="62" y1="68" x2="98" y2="68" stroke="#6366F1" strokeWidth="0.75"/>
            {/* Check badge */}
            <circle cx="97" cy="38" r="13" fill="#4F46E5"/>
            <path d="M91 38l4 4 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            {/* www. text hint */}
            <rect x="88" y="27" width="26" height="8" rx="2" fill="#6366F1"/>
            <text x="101" y="34" textAnchor="middle" fontSize="5" fill="white" fontWeight="600">www.</text>
          </svg>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="px-7 py-6 text-center">
          <p className="text-base font-bold text-gray-900 leading-snug mb-2">
            Run your first accessibility audit today!<br />
            Create a free account to get started.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Scan any website for WCAG violations and get AI-powered fix instructions — free for your first scan.
          </p>
          <button
            onClick={() => { onClose(); navigate("/signup") }}
            className="w-full rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold py-3 transition-colors cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

// ── No-credits modal ──────────────────────────────────────────────────────────

function NoCreditModal({ onClose, onGetCredits }: { onClose: () => void; onGetCredits: () => void }) {
  return (
    <div className="fixed top-5 right-5 z-[300] w-[320px] rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Not enough credits</p>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
            You cannot start scanning because you do not have enough credits in your account.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 px-4 pb-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-full border border-gray-200 h-9 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onGetCredits}
          className="flex-1 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] h-9 text-sm font-medium text-white transition-colors cursor-pointer"
        >
          Get credits
        </button>
      </div>
    </div>
  )
}

// ── Report preview cards ───────────────────────────────────────────────────────

const REPORT_CARDS = [
  { src: "/images/report-accessible.png", alt: "Accessible site audit report showing WCAG score 94/100 with AA certification" },
  { src: "/images/report-failing.png",    alt: "Failing site audit report showing WCAG score 31/100 with 41 violations" },
  { src: "/images/report-violations.png", alt: "Violations list showing critical and serious accessibility issues with WCAG criteria" },
  { src: "/images/report-ai-fix.png",     alt: "AI-generated fix instructions for missing alt text violation with code examples" },
]

// ── Hero ──────────────────────────────────────────────────────────────────────

export function Hero() {
  const { user } = useAuth()
  const { credits } = useCredits()
  const [url, setUrl] = useState("")
  const [crawlDepth, setCrawlDepth] = useState(3)
  const [showModal, setShowModal] = useState(false)
  const [showNoCreditModal, setShowNoCreditModal] = useState(false)
  const [showBuyCredits, setShowBuyCredits] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const navigate = useNavigate()
  const hasUrl = url.trim().length > 0
  const noCredits = user !== null && credits !== null && credits === 0

  const handleStartScanning = () => {
    if (!user) {
      setShowModal(true)
      return
    }
    if (noCredits) {
      setShowNoCreditModal(true)
      return
    }
    sessionStorage.setItem("auditflow_pending_url", url)
    navigate(`/scan?url=${encodeURIComponent(url)}&depth=${crawlDepth}`)
  }

  return (
    <>
      {showModal && <SignupModal onClose={() => setShowModal(false)} />}
      {showNoCreditModal && (
        <NoCreditModal
          onClose={() => setShowNoCreditModal(false)}
          onGetCredits={() => { setShowNoCreditModal(false); setShowBuyCredits(true) }}
        />
      )}
      <BuyCreditsModal open={showBuyCredits} onOpenChange={setShowBuyCredits} />
      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        url={url}
        depth={crawlDepth}
        onSave={(count) => console.log("Preview: selected", count, "pages")}
      />

      <section className="relative flex flex-col items-center pt-20 overflow-hidden min-h-screen">

        {/* Background gradient layer */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* White center base */}
          <div className="absolute inset-0 bg-white" />
          {/* Blue left blob */}
          <div
            className="absolute rounded-full blur-[120px]"
            style={{
              width: 700,
              height: 700,
              left: -200,
              top: 100,
              background: "radial-gradient(circle, rgba(79,70,229,0.55) 0%, rgba(99,102,241,0.35) 40%, transparent 70%)",
            }}
          />
          {/* Pink/purple center-bottom blob */}
          <div
            className="absolute rounded-full blur-[140px]"
            style={{
              width: 800,
              height: 600,
              left: "50%",
              top: "40%",
              transform: "translateX(-30%)",
              background: "radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(167,139,250,0.2) 40%, transparent 70%)",
            }}
          />
          {/* Blue bottom-right blob */}
          <div
            className="absolute rounded-full blur-[100px]"
            style={{
              width: 600,
              height: 500,
              right: -100,
              bottom: 0,
              background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(79,70,229,0.2) 50%, transparent 70%)",
            }}
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 mx-auto w-full max-w-[760px] px-6 text-center pt-20 pb-16">
          {/* Headline */}
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-950 leading-tight">
            Fix Accessibility Issues{" "}
            <span className="text-[#4F46E5]">Before They Reach Production</span>
          </h1>

          <p className="mb-10 mx-auto max-w-lg text-base text-gray-500 leading-relaxed">
            Generate comprehensive WCAG audit reports for any website and get instant AI-driven fix recommendations — built for developers and QA teams.
          </p>

          {/* URL Input Card */}
          <div
            className={`mx-auto max-w-[720px] rounded-3xl bg-white shadow-sm transition-all duration-200 ${
              hasUrl && noCredits
                ? "border border-red-300 shadow-[0_0_0_4px_rgba(239,68,68,0.08)]"
                : hasUrl
                ? "border border-indigo-200 shadow-[0_0_0_4px_rgba(99,102,241,0.08)]"
                : "border border-gray-100"
            }`}
          >
            {/* URL row */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <Globe className={`h-5 w-5 shrink-0 transition-colors ${hasUrl ? "text-[#4F46E5]" : "text-gray-300"}`} />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 bg-transparent text-base text-gray-800 placeholder:text-gray-300 outline-none"
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between px-4 py-3">
              <CrawlDepthButton depth={crawlDepth} onDepthChange={setCrawlDepth} />

              <div className="flex items-center gap-2">
                {/* Preview */}
                <button
                  type="button"
                  disabled={!hasUrl}
                  onClick={hasUrl ? () => setShowPreview(true) : undefined}
                  className={`inline-flex items-center gap-2 rounded-full border h-9 px-4 text-sm transition-colors ${
                    hasUrl
                      ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                      : "border-gray-100 bg-transparent text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>

                {/* Start Scanning */}
                <button
                  type="button"
                  onClick={hasUrl ? handleStartScanning : undefined}
                  disabled={!hasUrl || (noCredits && hasUrl)}
                  title={noCredits && hasUrl ? "You cannot start scanning because you do not have enough credits in your account." : undefined}
                  className={`inline-flex items-center justify-center rounded-full h-9 px-5 text-sm font-medium transition-colors ${
                    hasUrl && !noCredits
                      ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm cursor-pointer"
                      : "bg-transparent border border-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  Start Scanning
                </button>
              </div>
            </div>

            {/* Service cost row — only visible when URL entered */}
            {hasUrl && (
              <div className={`border-t px-5 py-3 flex items-center justify-center gap-1.5 ${noCredits ? "border-red-100" : "border-indigo-50"}`}>
                <span className="text-sm font-semibold text-gray-700">Service cost:</span>
                {user ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-white ${noCredits ? "bg-red-500" : "bg-[#4F46E5]"}`}>
                        <Zap className="h-3 w-3 fill-white" />
                      </span>
                      {credits !== null ? `${credits} credits` : "— credits"}
                    </span>
                    {noCredits && (
                      <button
                        type="button"
                        onClick={() => setShowNoCreditModal(true)}
                        className="ml-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Not enough credits
                      </button>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#4F46E5] text-[10px] text-white font-bold">
                      <Zap className="h-3 w-3 fill-white" />
                    </span>
                    First scan is free
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom white card */}
        <div className="relative z-10 mx-4 sm:mx-6 w-full max-w-[1360px] rounded-t-3xl bg-white px-8 pt-8 pb-0 shadow-[0px_-4px_32px_0px_rgba(0,0,0,0.07)]">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-950 mb-2">See what your report looks like</h2>
            <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
              Every scan generates a full accessibility breakdown — scored by severity, enriched with AI explanations, and ready to share or download as PDF.
            </p>
          </div>

          {/* 4 report preview cards */}
          <div className="flex gap-4 overflow-hidden pb-0" style={{ height: 200 }}>
            {REPORT_CARDS.map((card, i) => (
              <div key={i} className="flex-1 min-w-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src={card.src}
                  alt={card.alt}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
