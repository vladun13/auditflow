const testimonials = [
  {
    quote:
      'AuditFlow cut our pre-launch accessibility review from 2 days to under an hour. The AI fix steps are specific enough that I can copy them straight into the PR.',
    name: 'Dana M.',
    role: 'Frontend Developer',
    company: 'Digital Agency',
    initials: 'DM',
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    quote:
      "We run AuditFlow on every sprint as part of QA sign-off. The severity bucketing and estimated fix hours finally give us a way to prioritize what to fix first.",
    name: 'Quinn R.',
    role: 'QA Lead',
    company: 'Product Company',
    initials: 'QR',
    color: 'bg-violet-100 text-violet-700',
  },
  {
    quote:
      "Legal needed proof of WCAG compliance after an ADA inquiry. AuditFlow gave us a scored PDF report the same day — exactly what we needed to close the issue.",
    name: 'Parker S.',
    role: 'Product Manager',
    company: 'E-commerce Platform',
    initials: 'PS',
    color: 'bg-blue-100 text-blue-700',
  },
]

export function Testimonials() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by teams who ship fast
          </h2>
          <p className="mx-auto max-w-xl text-base text-gray-500">
            From individual developers to QA teams to compliance leads — here's what they say.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-600">"{t.quote}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${t.color}`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
