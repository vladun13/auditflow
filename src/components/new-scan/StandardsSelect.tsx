import { Shield, Check } from 'lucide-react'
import { STANDARDS } from './constants'

interface StandardsSelectProps {
  selected: string[]
  onToggle: (id: string) => void
}

export function StandardsSelect({ selected, onToggle }: StandardsSelectProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-3.5 w-3.5 text-[#4F46E5]" />
        <label className="block text-xs font-medium text-gray-700">Accessibility Standards</label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {STANDARDS.map(std => {
          const active = selected.includes(std.id)
          return (
            <button
              key={std.id}
              type="button"
              onClick={() => onToggle(std.id)}
              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                active
                  ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${active ? 'border-[#4F46E5] bg-[#4F46E5]' : 'border-gray-300'}`}>
                {active && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
              </div>
              <p className="text-xs font-semibold">{std.label}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
