import { CheckCircle } from 'lucide-react'
import { CHECKS, DEPTH_OPTIONS } from './constants'

interface ChecksListProps {
  crawlDepth: number
  websiteUrl: string
}

export function ChecksList({ crawlDepth, websiteUrl }: ChecksListProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">What we check</h3>
        <ul className="space-y-3">
          {CHECKS.map((check) => (
            <li key={check} className="flex items-start gap-2.5 text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              {check}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Scan preview</h3>
        <p className="text-sm text-gray-500">
          Will scan up to <strong className="text-gray-700">{crawlDepth} page{crawlDepth > 1 ? 's' : ''}</strong> starting from{' '}
          <span className="text-[#4F46E5] break-all">{websiteUrl || '[URL]'}</span>
        </p>
        <div className="mt-3 flex gap-2 flex-wrap">
          {DEPTH_OPTIONS.map(opt => (
            <span
              key={opt.value}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors ${
                crawlDepth === opt.value
                  ? 'bg-indigo-50 border-indigo-200 text-[#4F46E5]'
                  : 'bg-white border-gray-200 text-gray-400'
              }`}
            >
              {opt.label}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Estimated time: 2–5 minutes</p>
      </div>
    </div>
  )
}
