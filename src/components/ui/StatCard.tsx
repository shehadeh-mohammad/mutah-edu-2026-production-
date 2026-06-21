import { cn } from '@/lib/utils'

type AccentColor = 'blue' | 'violet' | 'green' | 'orange'

const accents: Record<AccentColor, string> = {
  blue:   'from-blue-500 to-cyan-400',
  violet: 'from-violet-500 to-pink-500',
  green:  'from-emerald-500 to-teal-400',
  orange: 'from-amber-500 to-orange-400',
}

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  accent?: AccentColor
  icon?: string
}

export default function StatCard({ label, value, change, accent = 'blue', icon }: StatCardProps) {
  return (
    <div
      className="relative rounded-2xl border overflow-hidden p-5"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Top accent bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r', accents[accent])} />

      {icon && <div className="text-2xl mb-3">{icon}</div>}
      <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text3)' }}>
        {label}
      </p>
      <p className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>
        {value}
      </p>
      {change && (
        <p className="text-[11px] mt-1.5" style={{ color: '#10b981' }}>
          {change}
        </p>
      )}
    </div>
  )
}
