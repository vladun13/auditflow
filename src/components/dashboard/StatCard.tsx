import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  iconBg: string
}

export function StatCard({ label, value, icon, iconBg }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-xs font-normal uppercase tracking-wide text-muted-foreground mb-2">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconBg)}>
          {icon}
        </span>
        <span className="text-[28px] font-bold text-foreground">{value}</span>
      </div>
    </div>
  )
}
