/**
 * utils.ts — Shared utility functions
 */

/** Merge class names, filtering out falsy values */
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Validate a 12-digit university ID */
export function isValidUniversityId(id: string): boolean {
  return /^\d{12}$/.test(id)
}

/** Map a major ID to a Tailwind gradient class */
export function majorGradient(color: string): string {
  switch (color) {
    case 'blue':   return 'from-blue-900 to-blue-950'
    case 'violet': return 'from-violet-900 to-violet-950'
    case 'cyan':   return 'from-cyan-900 to-cyan-950'
    default:       return 'from-slate-800 to-slate-900'
  }
}

/** Map a major color to a badge class */
export function majorBadgeClass(color: string): string {
  switch (color) {
    case 'blue':   return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    case 'violet': return 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
    case 'cyan':   return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
    default:       return 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
  }
}

/** Format a progress percentage string */
export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`
}

/** Get localStorage item safely (handles SSR) */
export function getLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const item = window.localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

/** Set localStorage item safely */
export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}
