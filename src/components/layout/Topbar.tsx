'use client'

import { useState, useEffect } from 'react'
import { Search, Sun, Moon, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'

interface TopbarProps {
  title: string
  /** Called when the mobile menu button is tapped */
  onMenuToggle?: () => void
  /** Controls which icon the mobile button shows */
  isMobileMenuOpen?: boolean
}

export default function Topbar({ title, onMenuToggle, isMobileMenuOpen = false }: TopbarProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => { setMounted(true) }, [])

  return (
    <header
      dir="rtl"
      className={[
        'flex items-center gap-3 h-[70px] min-h-[70px] px-4 md:px-6 relative z-50',
        'transition-colors duration-300',
        /* dark */ 'dark:bg-[rgba(10,15,30,0.75)] dark:border-b dark:border-white/[0.06] dark:shadow-none',
        /* light */ 'bg-slate-900 shadow-md border-b border-indigo-500/20',
        'backdrop-blur-2xl',
      ].join(' ')}
    >
      {/* ── Mobile menu toggle — only visible below md ─────────────── */}
      {onMenuToggle && (
        <button
          id="mobile-menu-toggle"
          onClick={onMenuToggle}
          aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={isMobileMenuOpen}
          className={[
            'md:hidden flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0',
            'border transition-all duration-300 active:scale-95',
            isMobileMenuOpen
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
              : 'bg-white/[0.06] border-white/[0.09] text-white/70 hover:bg-white/10 hover:text-white',
          ].join(' ')}
        >
          {/* Animated swap between hamburger and X */}
          <span
            key={isMobileMenuOpen ? 'close' : 'open'}
            style={{
              display: 'flex',
              animation: 'topbar-icon-pop 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            {isMobileMenuOpen
              ? <X size={20} strokeWidth={2.5} />
              : <Menu size={20} strokeWidth={2.5} />
            }
          </span>
        </button>
      )}

      {/* ── Page Title ─────────────────────────────────────────────── */}
      <h1 className="flex-1 font-black text-[16px] overflow-hidden text-ellipsis whitespace-nowrap text-white flex items-center gap-3">
        {title}
      </h1>

      {/* ── Search (hidden on xs) ──────────────────────────────────── */}
      <div className="relative hidden sm:block">
        <label
          onClick={() =>
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
          }
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-2xl w-[220px] md:w-[240px] transition-colors duration-300 cursor-text',
            'dark:border-white/[0.07] dark:bg-white/[0.03] border-white/20 bg-white/5 hover:bg-white/10 shadow-inner',
            'border backdrop-blur-md',
          ].join(' ')}
        >
          <Search size={16} className="text-white/60 dark:opacity-50 dark:text-white" />
          <span className="flex-1 text-[13px] text-white/80 dark:text-white/60 text-right select-none">
            بحث في المساقات...
          </span>
          <div className="flex items-center gap-0.5 text-white/50 text-[10px] font-sans pointer-events-none">
            <span className="bg-white/10 px-1 rounded">⌘K</span>
          </div>
        </label>
      </div>

      {/* ── Theme Toggle ──────────────────────────────────────────── */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={[
            'flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 cursor-pointer transition-all duration-300',
            'dark:bg-white/[0.04] dark:border-white/[0.09] dark:hover:bg-white/[0.1] dark:text-amber-300',
            'bg-white/10 border-white/20 hover:bg-white/20 text-white shadow-sm',
            'border',
          ].join(' ')}
        >
          {theme === 'dark'
            ? <Sun size={16} strokeWidth={2} />
            : <Moon size={16} strokeWidth={2} />}
        </button>
      )}

      {/* Micro-animation keyframe for icon swap */}
      <style>{`
        @keyframes topbar-icon-pop {
          from { opacity: 0; transform: scale(0.6) rotate(-15deg); }
          to   { opacity: 1; transform: scale(1)   rotate(0deg); }
        }
      `}</style>
    </header>
  )
}
