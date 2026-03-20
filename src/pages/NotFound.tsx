import { Link, useNavigate } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { Navbar } from '@/components/Navbar'

function ErrorIllustration() {
  return (
    <svg
      width="420"
      height="280"
      viewBox="0 0 420 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background browser window */}
      <rect x="120" y="30" width="240" height="180" rx="8" fill="#E8EAF6" stroke="#C5CAE9" strokeWidth="1.5" />
      {/* Browser top bar */}
      <rect x="120" y="30" width="240" height="28" rx="8" fill="#C5CAE9" />
      <rect x="120" y="50" width="240" height="8" fill="#C5CAE9" />
      {/* Traffic lights */}
      <circle cx="140" cy="44" r="5" fill="#EF9A9A" />
      <circle cx="155" cy="44" r="5" fill="#EF9A9A" />
      <circle cx="170" cy="44" r="5" fill="#EF9A9A" />
      {/* Address bar */}
      <rect x="185" y="37" width="155" height="14" rx="7" fill="#E8EAF6" />

      {/* Content lines in background window */}
      <rect x="135" y="75" width="140" height="8" rx="4" fill="#C5CAE9" />
      <rect x="135" y="91" width="100" height="8" rx="4" fill="#C5CAE9" />
      <rect x="135" y="107" width="120" height="8" rx="4" fill="#C5CAE9" />

      {/* Middle error window */}
      <rect x="155" y="110" width="200" height="130" rx="8" fill="#FDECEA" stroke="#FFCDD2" strokeWidth="1.5" />
      {/* Middle window top bar */}
      <rect x="155" y="110" width="200" height="24" rx="8" fill="#FFCDD2" />
      <rect x="155" y="126" width="200" height="8" fill="#FFCDD2" />
      {/* Content lines */}
      <rect x="170" y="148" width="120" height="7" rx="3.5" fill="#FFCDD2" />
      <rect x="170" y="163" width="90" height="7" rx="3.5" fill="#FFCDD2" />
      <rect x="170" y="178" width="100" height="7" rx="3.5" fill="#FFCDD2" />
      {/* Middle X button */}
      <circle cx="338" cy="175" r="18" fill="#EF5350" />
      <path d="M331 168l14 14M345 168l-14 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

      {/* Front error window */}
      <rect x="180" y="145" width="200" height="110" rx="8" fill="#FDECEA" stroke="#FFCDD2" strokeWidth="1.5" />
      {/* Front window top bar */}
      <rect x="180" y="145" width="200" height="24" rx="8" fill="#FFCDD2" />
      <rect x="180" y="161" width="200" height="8" fill="#FFCDD2" />
      {/* Content lines */}
      <rect x="196" y="183" width="120" height="7" rx="3.5" fill="#FFCDD2" />
      <rect x="196" y="198" width="90" height="7" rx="3.5" fill="#FFCDD2" />
      <rect x="196" y="213" width="100" height="7" rx="3.5" fill="#FFCDD2" />
      {/* Front X button */}
      <circle cx="308" cy="210" r="18" fill="#EF5350" />
      <path d="M301 203l14 14M315 203l-14 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

      {/* Floating X */}
      <circle cx="240" cy="245" r="16" fill="#EF5350" />
      <path d="M234 239l12 12M246 239l-12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

      {/* Person body */}
      <ellipse cx="148" cy="258" rx="50" ry="12" fill="#E8EAF6" />
      {/* Torso */}
      <path d="M108 200 Q110 240 148 258 Q186 240 188 200 Q168 190 148 188 Q128 190 108 200Z" fill="#5C6BC0" />
      {/* Neck */}
      <rect x="140" y="170" width="16" height="20" rx="8" fill="#FFCCBC" />
      {/* Head */}
      <ellipse cx="148" cy="158" rx="28" ry="30" fill="#FFCCBC" />
      {/* Hair */}
      <path d="M120 148 Q122 118 148 115 Q174 118 176 148 Q165 130 148 128 Q131 130 120 148Z" fill="#212121" />
      {/* Arm reaching out */}
      <path d="M188 210 Q230 195 260 200 Q265 202 265 208 Q265 214 260 216 Q230 211 188 226Z" fill="#5C6BC0" />
      {/* Hand */}
      <ellipse cx="268" cy="209" rx="14" ry="10" fill="#FFCCBC" />
      {/* Fingers */}
      <path d="M274 202 Q282 198 284 204" stroke="#FFCCBC" strokeWidth="4" strokeLinecap="round" />
      <path d="M276 199 Q284 196 285 203" stroke="#FFCCBC" strokeWidth="3" strokeLinecap="round" />

      {/* Dots decoration */}
      <circle cx="84" cy="180" r="6" fill="#EF9A9A" />
      <circle cx="84" cy="200" r="6" fill="#EF9A9A" />
      <circle cx="84" cy="220" r="6" fill="#EF9A9A" />
    </svg>
  )
}

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 px-6">
        <ErrorIllustration />

        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <h1 className="text-[1.75rem] font-bold text-gray-900">
            Oops! Something went wrong.
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">
            An unexpected error occurred, sorry about that.<br />
            We've been notified and will get started on a fix.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 h-11 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh the page
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[#4F46E5] hover:bg-[#4338CA] px-6 h-11 text-sm font-medium text-white transition-colors shadow-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
