import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Globe, ChevronDown, Eye } from "lucide-react"

export function Hero() {
  const [url, setUrl] = useState("")

  return (
    <section className="relative min-h-screen overflow-hidden bg-white flex flex-col items-center justify-center pt-14">
      {/* Gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-400/30 via-indigo-400/20 to-violet-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-pink-300/25 via-purple-300/20 to-blue-300/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-300/15 to-blue-300/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
          </span>
          AI-Powered Accessibility Audits
        </div>

        {/* Headline */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          Fix Accessibility Issues{" "}
          <span className="text-[#4F46E5]">Before They Reach Production</span>
        </h1>

        <p className="mb-10 mx-auto max-w-xl text-base text-gray-500 sm:text-lg">
          Generate comprehensive accessibility audits for your websites and get instant, AI-driven recommendations. Built for developers and QA teams.
        </p>

        {/* Scan card */}
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-200/60 p-4">
          {/* URL input */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 mb-3">
            <Globe className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Crawl Depth */}
              <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
                Crawl Depth
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {/* Preview */}
              <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
            </div>

            <Link to={url ? `/scan?url=${encodeURIComponent(url)}` : "/scan"}>
              <Button
                size="sm"
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg px-5 text-sm font-medium"
              >
                Start Scanning
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <p className="mt-4 text-xs text-gray-400">
          Already scanned{" "}
          <span className="font-semibold text-gray-600">11 websites</span>{" "}
          in the last 24 hours
        </p>

        {/* Trust indicators */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#4F46E5]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            WCAG 2.1 AA &amp; AAA
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#4F46E5]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Instant AI Fixes
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#4F46E5]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            PDF &amp; JSON Reports
          </span>
        </div>
      </div>
    </section>
  )
}
