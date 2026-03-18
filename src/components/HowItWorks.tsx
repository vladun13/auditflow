const steps = [
  {
    number: '01',
    title: 'Input URL',
    description: 'Simply enter the URL of the website or page you want to audit.',
  },
  {
    number: '02',
    title: 'Run Audit',
    description: 'Our engine scans your site against WCAG 2.1 guidelines in seconds.',
  },
  {
    number: '03',
    title: 'Get Fixes',
    description: 'Receive a detailed report with AI-generated code snippets to fix issues.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50/60">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto max-w-xl text-base text-gray-500">
            Three simple steps to a more accessible web.
          </p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connector line */}
          <div className="absolute top-6 left-0 hidden h-px w-full bg-gray-200 md:block" />

          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center">
              {/* Step number bubble */}
              <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#4F46E5] text-sm font-bold text-white shadow-md shadow-indigo-200">
                {step.number}
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm w-full">
                <h3 className="mb-2 text-base font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
