import { Skeleton } from '@/components/ui/skeleton'

export function AuditDetailSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-px" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          {/* Summary row: score ring + stat cards */}
          <div className="flex items-start gap-8">
            <Skeleton className="h-40 w-40 rounded-full shrink-0" />
            <div className="flex-1 grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border p-4">
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-7 w-12" />
                </div>
              ))}
            </div>
          </div>

          {/* Tab row skeleton */}
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-lg" />
            ))}
          </div>

          {/* Violation card skeletons */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
