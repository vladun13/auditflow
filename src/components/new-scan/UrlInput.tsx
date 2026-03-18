import { Globe } from 'lucide-react'

interface UrlInputProps {
  value: string
  onChange: (value: string) => void
}

export function UrlInput({ value, onChange }: UrlInputProps) {
  return (
    <div>
      <label htmlFor="url" className="block text-xs font-medium text-gray-700 mb-1.5">
        Website URL
      </label>
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          id="url"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5] transition-colors"
          required
        />
      </div>
    </div>
  )
}
