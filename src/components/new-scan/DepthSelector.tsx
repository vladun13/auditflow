import { useState, useRef, useEffect } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { DEPTH_OPTIONS } from './constants'

interface DepthSelectorProps {
  value: number
  onChange: (depth: number) => void
}

export function DepthSelector({ value, onChange }: DepthSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <SlidersHorizontal className="h-3.5 w-3.5 text-[#4F46E5]" />
        <label className="block text-xs font-medium text-gray-700">Pages to Scan</label>
      </div>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 hover:bg-gray-50 focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span className="font-medium">{DEPTH_OPTIONS.find(o => o.value === value)?.label}</span>
            <span className="text-gray-400 text-xs">— {DEPTH_OPTIONS.find(o => o.value === value)?.description}</span>
          </span>
          <svg className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">Crawl Depth</span>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2.5 flex flex-col gap-1.5">
              {DEPTH_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                    value === opt.value
                      ? 'border-2 border-[#4F46E5] bg-indigo-50/50'
                      : 'border border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#4F46E5]">
                      <rect x="4" y="6" width="13" height="16" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="7" y="3" width="13" height="16" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M8 11h7M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
