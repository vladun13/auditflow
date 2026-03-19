import { motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SCAN_STEPS } from './constants'

interface ScanProgressProps {
  currentStep: number
}

export function ScanProgress({ currentStep }: ScanProgressProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-5">Scan Progress</h3>
      <div className="space-y-4">
        {SCAN_STEPS.map((step, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep
          const isPending = i > currentStep

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-start gap-3"
            >
              <div className="mt-0.5">
                {isDone && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {isActive && (
                  <Loader2 className="h-5 w-5 text-[#4F46E5] animate-spin" />
                )}
                {isPending && (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-200" />
                )}
              </div>
              <div>
                <p
                  className={cn(
                    'text-sm font-medium',
                    isDone && 'text-green-700',
                    isActive && 'text-gray-900',
                    isPending && 'text-gray-400'
                  )}
                >
                  {step.label}
                </p>
                <p
                  className={cn(
                    'text-xs mt-0.5',
                    isDone && 'text-green-500',
                    isActive && 'text-gray-500',
                    isPending && 'text-gray-300'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
