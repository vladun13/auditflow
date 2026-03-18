const features = [
  {
    title: "Automated Audits",
    description: "Instantly scan any URL to identify accessibility violations based on WCAG 2.1 guidelines.",
    image: "/illustrations/feature-automated-audits.png",
  },
  {
    title: "AI Recommendations",
    description: "Get smart, context-aware code snippets and suggestions to fix identified issues immediately.",
    image: "/illustrations/feature-ai-recommendations.png",
  },
  {
    title: "Detailed Reporting",
    description: "Export comprehensive reports in PDF or JSON formats for your team or stakeholders.",
    image: "/illustrations/feature-detailed-reporting.png",
  },
  {
    title: "Team Collaboration",
    description: "Share audit results with your team and track remediation progress across projects.",
    image: "/illustrations/feature-team-collaboration.png",
  },
]

export function Features() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to ensure accessibility
          </h2>
          <p className="mx-auto max-w-xl text-base text-gray-500">
            Powerful scanning technology combined with advanced AI to make accessibility compliance effortless.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-gray-100 bg-white p-1 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={feature.image}
                alt={feature.title}
                className="h-40 w-full rounded-xl object-cover"
              />
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
