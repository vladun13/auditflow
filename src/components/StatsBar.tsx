const stats = [
  { value: '2,400+', label: 'Pages scanned' },
  { value: '18,000+', label: 'Violations detected' },
  { value: '94%', label: 'Issues resolved with AI fix' },
  { value: '< 60s', label: 'Average scan time' },
]

export function StatsBar() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mb-1 text-3xl font-bold text-gray-900 sm:text-4xl">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
