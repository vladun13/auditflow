const standards = [
  { label: 'WCAG 2.1 AA', description: 'Full coverage' },
  { label: 'WCAG 2.1 AAA', description: 'Full coverage' },
  { label: 'Section 508', description: 'US federal' },
  { label: 'ADA', description: 'US law' },
  { label: 'EN 301 549', description: 'EU standard' },
  { label: 'AODA', description: 'Ontario, Canada' },
]

export function ComplianceBadges() {
  return (
    <section className="bg-gray-50/60 py-16">
      <div className="container mx-auto px-6">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Covers the standards that matter
          </h2>
          <p className="text-sm text-gray-500">
            Every scan is validated against international accessibility guidelines and legal requirements.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {standards.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4F46E5]">
                <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="text-sm font-semibold text-gray-900">{s.label}</span>
              <span className="text-xs text-gray-400">{s.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
