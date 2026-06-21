import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline' | 'ai' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary: 'text-white border-transparent hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0',
  outline: 'border hover:bg-white/5',
  ai: 'border hover:bg-white/10 hover:-translate-y-0.5',
  ghost: 'border-transparent hover:bg-white/5',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
}

export default function Button({
  variant = 'outline',
  size = 'md',
  loading = false,
  children,
  className,
  style,
  ...props
}: ButtonProps) {
  const inlineStyles: React.CSSProperties = variant === 'primary'
    ? { background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', ...style }
    : variant === 'ai'
    ? { background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))', borderColor: 'rgba(139,92,246,0.4)', color: 'var(--text)', ...style }
    : { borderColor: 'var(--border2)', color: 'var(--text)', ...style }

  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 font-semibold transition-all duration-200 cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      style={inlineStyles}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-white/60" />
      )}
      {children}
    </button>
  )
}
