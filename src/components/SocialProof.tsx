export function SocialProof() {
  return (
    <div className="border-y border-gray-100 bg-gray-50/60 py-5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-8 sm:text-left">
          <p className="text-sm font-medium text-gray-500">
            Trusted by developers, QA teams, and compliance leads at:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {['Acme Corp', 'DigitalCo', 'BuildFast', 'DevStudio', 'LaunchPad'].map((name) => (
              <span key={name} className="text-sm font-semibold text-gray-400 tracking-wide">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
