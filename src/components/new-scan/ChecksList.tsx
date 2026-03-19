import { Eye, MousePointer, Brain, Shield } from 'lucide-react'
import { WCAG_PRINCIPLES } from './constants'

const ICON_MAP = {
  Eye,
  MousePointer,
  Brain,
  Shield,
} as const

export function ChecksList() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">What we check</h3>
        <div className="space-y-4">
          {WCAG_PRINCIPLES.map((principle) => {
            const Icon = ICON_MAP[principle.icon]
            return (
              <div key={principle.id} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <Icon className="h-4 w-4 text-[#4F46E5]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{principle.label}</p>
                  <ul className="mt-1 space-y-0.5">
                    {principle.items.map((item) => (
                      <li key={item} className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-gray-300 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
