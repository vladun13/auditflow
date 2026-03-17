const features = [
  {
    title: "Automated Audits",
    description: "Instantly scan any URL to identify accessibility violations based on WCAG 2.1 guidelines.",
    gradient: "from-blue-400 via-indigo-400 to-violet-500",
  },
  {
    title: "AI Recommendations",
    description: "Get smart, context-aware code snippets and suggestions to fix identified issues immediately.",
    gradient: "from-violet-400 via-purple-400 to-pink-400",
  },
  {
    title: "Detailed Reporting",
    description: "Export comprehensive reports in PDF or JSON formats for your team or stakeholders.",
    gradient: "from-pink-400 via-rose-400 to-orange-400",
  },
]

function FeatureIllustration({ gradient }: { gradient: string }) {
  return (
    <div className={`relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-br ${gradient}`}>
      {/* Blob decorations */}
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/20 blur-xl" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-black/10 blur-xl" />
      {/* Mockup lines */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 gap-1.5">
        <div className="h-1.5 w-3/4 rounded-full bg-white/30" />
        <div className="h-1.5 w-1/2 rounded-full bg-white/20" />
        <div className="h-1.5 w-2/3 rounded-full bg-white/25" />
      </div>
    </div>
  )
}

export function Features() {
  return (
    <section id="features" className="bg-gray-50/60 py-24">
      <div className="container mx-auto px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to ensure accessibility
          </h2>
          <p className="mx-auto max-w-xl text-base text-gray-500">
            Powerful scanning technology combined with advanced AI to make accessibility compliance effortless.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-gray-200 bg-white p-1 shadow-sm hover:shadow-md transition-shadow"
            >
              <FeatureIllustration gradient={feature.gradient} />
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
