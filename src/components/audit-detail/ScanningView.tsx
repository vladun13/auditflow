import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface ScanningViewProps { url: string }

export function ScanningView({ url }: ScanningViewProps) {
  return (
    <div className="flex items-center justify-center h-full bg-white">
      <div className="flex flex-col items-center gap-8 max-w-[720px] px-6 text-center">
        {/* Illustration */}
        <div className="w-[300px] h-[200px] flex items-center justify-center">
          <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="40" y="20" width="220" height="145" rx="8" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="1.5"/>
            <rect x="40" y="20" width="220" height="24" rx="8" fill="#e8e8e8"/>
            <circle cx="56" cy="32" r="4" fill="#ff6b6b"/>
            <circle cx="70" cy="32" r="4" fill="#ffd93d"/>
            <circle cx="84" cy="32" r="4" fill="#6bcb77"/>
            <rect x="55" y="55" width="130" height="8" rx="4" fill="#d9d9d9"/>
            <rect x="55" y="72" width="100" height="6" rx="3" fill="#ebebeb"/>
            <rect x="55" y="86" width="115" height="6" rx="3" fill="#ebebeb"/>
            <rect x="55" y="100" width="90" height="6" rx="3" fill="#ebebeb"/>
            <rect x="55" y="115" width="60" height="24" rx="4" fill="#4F46E5"/>
            {/* Magnifier */}
            <circle cx="210" cy="120" r="40" fill="none" stroke="#4F46E5" strokeWidth="3" opacity="0.3"/>
            <circle cx="210" cy="120" r="40" fill="none" stroke="#4F46E5" strokeWidth="2" strokeDasharray="8 4"/>
            <line x1="238" y1="148" x2="255" y2="165" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round"/>
            {/* Chart bars inside magnifier */}
            <rect x="192" y="128" width="10" height="20" rx="2" fill="#4F46E5" opacity="0.5"/>
            <rect x="206" y="118" width="10" height="30" rx="2" fill="#4F46E5" opacity="0.7"/>
            <rect x="220" y="123" width="10" height="25" rx="2" fill="#4F46E5" opacity="0.6"/>
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">We are scanning your website</h2>
          <p className="text-sm text-gray-500">
            Analyzing <span className="font-medium text-gray-700">{url}</span> for WCAG accessibility violations. This usually takes 2–5 minutes.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full border border-gray-200 rounded-lg p-4 space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full w-2/5 rounded-full bg-[#4F46E5] animate-pulse" />
            </div>
            <span className="text-sm text-gray-500 shrink-0">In progress</span>
          </div>
          <p className="text-xs text-gray-400">Estimated time: 2–5 min</p>
        </div>

        <Button variant="outline" className="rounded-full gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh status
        </Button>
      </div>
    </div>
  )
}
