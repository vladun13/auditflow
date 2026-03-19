import { Skeleton } from '@/components/ui/skeleton'

export function AuditDetailSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      {/* Overview section skeleton */}
      <div className="px-6 py-5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2 mb-5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-16 w-16 mx-auto rounded-full mb-2" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Issues panel skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Issue list */}
        <div className="w-[280px] shrink-0 border-r border-border bg-card p-4">
          <div className="flex gap-2 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16 rounded-md" />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="mb-3">
              <Skeleton className="h-5 w-full mb-1" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
        {/* Middle: Details */}
        <div className="flex-1 bg-card p-5">
          <Skeleton className="h-6 w-20 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full rounded-lg mb-4" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        {/* Right: How to Fix */}
        <div className="w-[340px] shrink-0 bg-card p-5">
          <Skeleton className="h-6 w-28 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
}
