import { cn } from '@/lib/utils'

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeColor = 'blue' | 'cyan' | 'violet' | 'green' | 'orange' | 'red' | 'gray'

const badgeStyles: Record<BadgeColor, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/25',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/25',
  violet: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/25',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25',
  orange: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25',
  red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/25',
  gray: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-white/5 dark:text-gray-300 dark:border-white/10',
}

interface BadgeProps {
  color?: BadgeColor
  children: React.ReactNode
  className?: string
}

export function Badge({ color = 'blue', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors duration-300', badgeStyles[color], className)}>
      {children}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  style?: React.CSSProperties
}

export function Card({ children, className, onClick, hover = false, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border p-5 bg-white/70 border-slate-200 dark:bg-black/30 dark:border-white/10 transition-colors duration-300',
        hover && 'cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-xl dark:hover:border-cyan-400/40',
        className
      )}
      style={{ ...style }}
    >
      {children}
    </div>
  )
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, className, showLabel = false }: ProgressBarProps) {
  return (
    <div className={className}>
      <div className="progress-track dark:bg-white/10 bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div className="progress-fill h-full bg-blue-600 dark:bg-cyan-400 rounded-full" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-600 dark:text-[var(--text3)]">{value}% complete</span>
        </div>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
interface SkeletonProps { className?: string }

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton dark:bg-white/5 bg-slate-200 rounded-md animate-pulse', className)} />
}

export function CourseCardSkeleton() {
  return (
    <div className="rounded-2xl border overflow-hidden bg-white border-slate-200 dark:bg-[#111827] dark:border-white/10">
      <Skeleton className="h-24 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2 w-full mt-3" />
      </div>
    </div>
  )
}
