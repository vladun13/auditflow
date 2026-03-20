import { useState } from 'react'
import { Clock, Copy, Check, CheckCircle, ExternalLink } from 'lucide-react'
import type { Violation } from '@/types'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface HowToFixProps {
  violation: Violation | null
}

function CodeBlock({
  title,
  code,
  variant,
}: {
  title: string
  code: string
  variant: 'current' | 'accessible'
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isAccessible = variant === 'accessible'

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 mb-3">
      <div className={`flex items-center justify-between px-3 py-2 ${
        isAccessible ? 'bg-teal-50 border-b border-teal-100' : 'bg-red-50 border-b border-red-100'
      }`}>
        <div className="flex items-center gap-1.5">
          {isAccessible
            ? <CheckCircle className="h-3.5 w-3.5 text-teal-600" />
            : <span className="h-3.5 w-3.5 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">✕</span>
              </span>
          }
          <span className={`text-xs font-semibold ${isAccessible ? 'text-teal-700' : 'text-red-700'}`}>
            {title}
          </span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>Copy code</TooltipContent>
        </Tooltip>
      </div>
      <div className="bg-gray-950 px-4 py-3">
        <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  )
}

function parseFixSteps(aiFixSteps: string | null): { steps: string[]; guidelines: string[] } {
  if (!aiFixSteps) return { steps: [], guidelines: [] }

  const lines = aiFixSteps
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)

  const steps: string[] = []
  const guidelines: string[] = []
  let inGuidelines = false

  for (const line of lines) {
    const clean = line.replace(/^[\d]+\.\s*/, '').replace(/^[-•*]\s*/, '').trim()
    if (!clean) continue
    if (line.toLowerCase().includes('guideline') || line.toLowerCase().includes('best practice')) {
      inGuidelines = true
      continue
    }
    if (inGuidelines) {
      guidelines.push(clean)
    } else {
      steps.push(clean)
    }
  }

  return { steps: steps.slice(0, 4), guidelines: guidelines.slice(0, 4) }
}

export function HowToFix({ violation }: HowToFixProps) {
  if (!violation) {
    return (
      <div className="flex items-center justify-center h-full text-center px-6">
        <p className="text-sm text-gray-400">Select an issue to see fix recommendations</p>
      </div>
    )
  }

  const { steps, guidelines } = parseFixSteps(violation.ai_fix_steps)
  const fixTimeLabel = violation.estimated_fix_hours != null
    ? `${violation.estimated_fix_hours}–${violation.estimated_fix_hours + 2}h`
    : '1–2h'

  // Generate example code blocks from violation data
  const badCode = `<!-- Current: missing ${violation.violation_type.toLowerCase().includes('label') ? 'label' : 'ARIA'} -->
<${violation.violation_type.includes('button') ? 'button' : 'div'}
  class="interactive-element"
  tabindex="0">
  Content here
</${violation.violation_type.includes('button') ? 'button' : 'div'}>`

  const goodCode = `<!-- Accessible version -->
<${violation.violation_type.includes('button') ? 'button' : 'div'}
  class="interactive-element"
  role="button"
  aria-label="Descriptive label"
  tabindex="0">
  Content here
</${violation.violation_type.includes('button') ? 'button' : 'div'}>`

  return (
    <div className="h-full overflow-y-auto border-l border-gray-100">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">How to Fix it</h3>
          <div className="flex items-center gap-1.5 rounded-full bg-[#4F46E5] px-3 py-1">
            <Clock className="h-3 w-3 text-white" />
            <span className="text-xs font-medium text-white">Time to fix: {fixTimeLabel}</span>
          </div>
        </div>

        {/* Steps */}
        {steps.length > 0 ? (
          <div className="space-y-5 mb-5">
            {steps.map((step, i) => (
              <div key={i}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#4F46E5] text-white text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                </div>

                {/* Show code blocks on first step */}
                {i === 0 && (
                  <>
                    <CodeBlock title="Current Code" code={badCode} variant="current" />
                    <CodeBlock title="Accessible Version" code={goodCode} variant="accessible" />
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#4F46E5] text-white text-xs font-bold shrink-0 mt-0.5">1</span>
              <p className="text-sm text-gray-700 leading-relaxed">
                {violation.ai_explanation || violation.description}
              </p>
            </div>
            <CodeBlock title="Current Code" code={badCode} variant="current" />
            <CodeBlock title="Accessible Version" code={goodCode} variant="accessible" />
          </div>
        )}

        {/* Guidelines */}
        {guidelines.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Guidelines provided by the system:</p>
            <ul className="space-y-1.5">
              {guidelines.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-gray-400 shrink-0" />
                  <span dangerouslySetInnerHTML={{
                    __html: g
                      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
                      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800">$1</code>')
                  }} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* WCAG criterion reference */}
        {violation.wcag_criterion && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              WCAG Criterion: <span className="font-medium text-gray-600">{violation.wcag_criterion}</span>
            </p>
          </div>
        )}

        {/* Recommended Libraries */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-900 mb-3">Recommended Libraries</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'SmartFinder', url: 'https://github.com' },
              { name: 'SHELLS',      url: 'https://github.com' },
              { name: 'Zoomerr',     url: 'https://github.com' },
              { name: 'kontrastr',   url: 'https://github.com' },
            ].map((lib) => (
              <a
                key={lib.name}
                href={lib.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-200 transition-colors"
              >
                {lib.name}
                <ExternalLink className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
