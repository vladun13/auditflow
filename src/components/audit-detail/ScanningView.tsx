import { CheckCircle, Loader2, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

interface ScanningViewProps {
  currentStep: number
}

const STEPS = [
  { label: 'Crawling pages', description: 'Discovering and loading pages on your site' },
  { label: 'Scanning your site', description: 'Testing each page against WCAG 2.1 guidelines' },
  { label: 'Generating AI fixes', description: 'Creating plain-English explanations and fix steps' },
] as const

export function ScanningView({ currentStep }: ScanningViewProps) {
  return (
    <div className="flex items-center justify-center h-full bg-white">
      <div className="flex flex-col items-center gap-8 max-w-md px-6 text-center">
        {/* Pulsing icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#4F46E5]/10 animate-ping" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#4F46E5]/10">
            <Globe className="h-8 w-8 text-[#4F46E5]" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Scanning in progress...</h2>
          <p className="text-sm text-gray-500">
            This usually takes 2-5 minutes. You can leave and come back.
          </p>
        </div>

        {/* Step indicators */}
        <div className="w-full space-y-3">
          {STEPS.map((step, i) => {
            const isDone = i < currentStep
            const isActive = i === currentStep
            const isPending = i > currentStep

            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-start gap-3 text-left"
              >
                <div className="mt-0.5 shrink-0">
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
                  <p className={`text-sm font-medium ${isDone ? 'text-green-700' : isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs ${isDone ? 'text-green-600' : isActive ? 'text-gray-500' : 'text-gray-300'}`}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
