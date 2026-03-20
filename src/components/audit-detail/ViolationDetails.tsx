import type { Violation } from '@/types'
import { Link2, ExternalLink } from 'lucide-react'

interface ViolationDetailsProps {
  violation: Violation | null
}

export function ViolationDetails({ violation }: ViolationDetailsProps) {
  if (!violation) {
    return (
      <div className="flex items-center justify-center h-full text-center px-6">
        <p className="text-sm text-gray-400">Select an issue from the left to view details</p>
      </div>
    )
  }

  // Simulate failing element selectors from violation data
  const elementCount = Math.max(1, violation.affected_elements)
  const selectorLabel = violation.violation_type
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .substring(0, 40)

  // Generate a few mock selectors based on violation type
  const selectors = Array.from({ length: Math.min(elementCount, 3) }, (_, i) => ({
    num: i + 1,
    selector: `${selectorLabel.toLowerCase().replace(/\s+/g, '-')}[data-index="${i}"]`,
    html: `<${violation.violation_type.includes('button') ? 'button' : 'div'} role="${
      violation.violation_type.toLowerCase().includes('aria') ? 'none' : 'group'
    }" aria-label="" data-element="${i + 1}" tabindex="${i === 0 ? '0' : '-1'}">...</${
      violation.violation_type.includes('button') ? 'button' : 'div'
    }>`,
  }))

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">Details</h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          {violation.description}
          {violation.ai_explanation && (
            <> {violation.ai_explanation}</>
          )}
        </p>

        {/* Failing elements header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-gray-900">Failing elements on your website:</span>
          <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-gray-900 text-white text-xs font-bold px-1.5">
            {elementCount}
          </span>
        </div>

        {/* Element cards */}
        <div className="space-y-3 mb-5">
          {selectors.map((el) => (
            <div key={el.num} className="rounded-xl border border-gray-200 overflow-hidden">
              {/* Selector header */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <span className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-bold">✕</span>
                </span>
                <span className="text-xs font-semibold text-gray-700 font-mono">
                  {el.num}. SELECTOR: {violation.violation_type.toUpperCase().substring(0, 30)}
                </span>
              </div>
              {/* Code */}
              <div className="px-4 py-3 bg-white">
                <p className="text-xs text-gray-500 font-mono leading-relaxed break-all">
                  {el.html}
                </p>
              </div>
            </div>
          ))}
          {elementCount > 3 && (
            <p className="text-xs text-gray-400 px-1">&lt;...{elementCount - 3} more elements&gt;</p>
          )}
        </div>

        {/* Affected page link */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-2">Affected page link</p>
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <Link2 className="h-4 w-4 text-[#4F46E5] shrink-0" />
              <a
                href={violation.page_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#4F46E5] hover:underline truncate"
              >
                {violation.page_url}
              </a>
            </div>
            <a
              href={violation.page_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 shrink-0 ml-2"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
