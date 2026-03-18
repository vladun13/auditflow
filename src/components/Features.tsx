const features = [
  {
    title: "Automated Audits",
    description: "Instantly scan any URL to identify accessibility violations based on WCAG 2.1 guidelines.",
    illustration: "orb",
  },
  {
    title: "AI Recommendations",
    description: "Get smart, context-aware code snippets and suggestions to fix identified issues immediately.",
    illustration: "lines",
  },
  {
    title: "Detailed Reporting",
    description: "Export comprehensive reports in PDF or JSON formats for your team or stakeholders.",
    illustration: "chart",
  },
  {
    title: "Team Collaboration",
    description: "Share audit results with your team and track remediation progress across projects.",
    illustration: "mountains",
  },
]

// Each illustration matches Figma card visuals — all blue/indigo/navy palette
function FeatureIllustration({ type }: { type: string }) {
  if (type === "orb") {
    return (
      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
        {/* Glowing white orb */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full bg-white/90 blur-xl" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-white" />
      </div>
    )
  }
  if (type === "lines") {
    return (
      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-800">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent" />
        {/* Horizontal bar lines */}
        <div className="absolute inset-0 flex flex-col justify-center gap-2 px-5">
          <div className="h-2 w-full rounded-full bg-white/25" />
          <div className="h-2 w-4/5 rounded-full bg-white/20" />
          <div className="h-2 w-full rounded-full bg-white/25" />
          <div className="h-2 w-3/5 rounded-full bg-white/15" />
          <div className="h-2 w-4/5 rounded-full bg-white/20" />
        </div>
      </div>
    )
  }
  if (type === "chart") {
    return (
      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
        {/* Rising bars chart */}
        <div className="absolute bottom-4 inset-x-5 flex items-end gap-2">
          <div className="flex-1 rounded-t bg-white/30" style={{ height: '30px' }} />
          <div className="flex-1 rounded-t bg-white/25" style={{ height: '50px' }} />
          <div className="flex-1 rounded-t bg-white/30" style={{ height: '40px' }} />
          <div className="flex-1 rounded-t bg-white/35" style={{ height: '65px' }} />
          <div className="flex-1 rounded-t bg-white/40" style={{ height: '55px' }} />
        </div>
      </div>
    )
  }
  // mountains
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-br from-indigo-800 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-blue-800/20" />
      {/* Mountain triangles */}
      <svg className="absolute bottom-0 inset-x-0 w-full" viewBox="0 0 200 80" preserveAspectRatio="none">
        <polygon points="0,80 60,20 120,80" fill="rgba(99,102,241,0.5)" />
        <polygon points="60,80 130,10 200,80" fill="rgba(79,70,229,0.7)" />
        <polygon points="100,80 160,30 200,80" fill="rgba(67,56,202,0.6)" />
      </svg>
    </div>
  )
}

export function Features() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="mb-14 max-w-lg">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to ensure accessibility
          </h2>
          <p className="text-base text-gray-500">
            Powerful scanning technology combined with advanced AI to make accessibility compliance effortless.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-gray-100 bg-white p-1 shadow-sm hover:shadow-md transition-shadow"
            >
              <FeatureIllustration type={feature.illustration} />
              <div className="p-4">
                <h3 className="mb-1.5 text-sm font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
