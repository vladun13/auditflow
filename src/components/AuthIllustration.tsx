function CursorArrow({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="32" viewBox="0 0 28 32" fill="none">
      <path d="M2 2L2 24L8 18L12 28L16 26L12 16L20 16L2 2Z" fill="#1a1a1a" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )
}

export function AuthIllustration() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden">
      {/* Gradient background: blue left → white center → pink/lavender right */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #5b9bff 0%, #a0c4ff 20%, #f0eeff 55%, #e8d5f5 80%, #d4b8f0 100%)'
      }} />

      {/* Tilted background decorative cards */}
      <div className="absolute rounded-3xl bg-white/40 border border-white/60" style={{
        width: '72%', height: '58%', top: '8%', left: '-8%', transform: 'rotate(-10deg)'
      }} />
      <div className="absolute rounded-3xl bg-white/30 border border-white/50" style={{
        width: '72%', height: '58%', top: '34%', left: '2%', transform: 'rotate(-10deg)'
      }} />

      {/* Main content */}
      <div className="relative z-10 w-full px-10 flex flex-col gap-5" style={{ maxWidth: 460 }}>

        {/* Globe floating card + cursor */}
        <div className="relative self-center mb-1">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-white shadow-xl">
            <GlobeIcon />
          </div>
          <CursorArrow className="absolute -bottom-5 -left-6 rotate-[20deg]" />
        </div>

        {/* Upper URL card */}
        <div className="rounded-2xl bg-white/90 shadow-lg overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
            <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <span className="text-sm text-gray-400">https://example.com</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3">
            <div className="h-7 w-28 rounded-full bg-gray-100" />
            <div className="h-7 w-20 rounded-full bg-gray-100" />
            <div className="h-7 w-28 rounded-full bg-gray-100" />
          </div>
        </div>

        {/* Squiggly line + progress pill row */}
        <div className="flex items-center justify-between px-2">
          {/* Squiggly SVG line */}
          <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
            <path d="M40 5 C50 15, 30 25, 40 35 C50 45, 30 55, 40 60" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>
          {/* Progress pill */}
          <div className="flex items-center gap-2.5 rounded-full bg-white px-4 py-2 shadow-md">
            <div className="w-20 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: '40%' }} />
            </div>
            <span className="text-sm font-semibold text-gray-700">40%</span>
          </div>
        </div>

        {/* Lower main card + cursor arrow */}
        <div className="relative">
          <CursorArrow className="absolute -top-6 right-10 rotate-[-15deg]" />

          <div className="rounded-2xl bg-white shadow-xl overflow-visible" style={{ borderLeft: '3px solid #7C3AED' }}>
            {/* URL row */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
              <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              <span className="flex-1 text-sm text-gray-700 font-medium">https://example.com</span>
              <div className="rounded-full bg-[#4F46E5] px-4 py-1.5 text-xs font-semibold text-white shadow-md whitespace-nowrap">
                Start Scanning
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-end gap-2.5 px-4 py-3 border-b border-gray-100">
              <div className="h-7 w-20 rounded-full bg-gray-100" />
              <div className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Preview
              </div>
            </div>

            {/* Service cost row */}
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="text-xs font-bold text-gray-800">Service cost:</span>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-3 w-3 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-purple-100">
                <div className="h-full rounded-full bg-purple-400" style={{ width: '35%' }} />
              </div>
            </div>
          </div>

          {/* Crawl Depth button overlapping left edge */}
          <div className="absolute -left-4 bottom-10 flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-md whitespace-nowrap">
            <svg className="h-3.5 w-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Crawl Depth
          </div>

          {/* Bottom cursor arrow */}
          <CursorArrow className="absolute -bottom-4 left-8 rotate-[10deg]" />
        </div>

      </div>
    </div>
  )
}
