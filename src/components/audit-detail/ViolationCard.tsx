import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Violation } from '@/types'
import { cn } from '@/lib/utils'
import { IMPACT_COLOR } from './constants'

interface ViolationCardProps {
  violation: Violation
}

export function ViolationCard({ violation }: ViolationCardProps) {
  const [expanded, setExpanded] = useState(false)
  const colors = IMPACT_COLOR[violation.impact] || IMPACT_COLOR.minor

  return (
    <div className={cn('border rounded-lg overflow-hidden', colors.border)}>
      {/* Header row -- always visible */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full', colors.bg, colors.text)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
              {violation.impact}
            </span>
            <span className="text-xs text-gray-400">{violation.wcag_criterion}</span>
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">{violation.violation_type}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{violation.page_url}</p>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
              <p className="text-sm text-gray-600 mt-3">{violation.description}</p>

              {violation.ai_explanation && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Why This Matters</p>
                  <p className="text-sm text-gray-600">{violation.ai_explanation}</p>
                </div>
              )}

              {violation.ai_fix_steps && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">How to Fix</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{violation.ai_fix_steps}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                {violation.affected_elements != null && (
                  <span>
                    <strong className="text-gray-700">{violation.affected_elements}</strong> affected element{violation.affected_elements !== 1 ? 's' : ''}
                  </span>
                )}
                {violation.estimated_fix_hours != null && (
                  <span>
                    <strong className="text-gray-700">{violation.estimated_fix_hours}h</strong> estimated fix
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
