'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, LibraryBig, X, Cpu } from 'lucide-react'

import Sidebar from './Sidebar'
import Topbar from './Topbar'
import GlobalSearchMenu from '@/components/ui/GlobalSearchMenu'

// ─── Shared nav schema (mirrors Sidebar.tsx NAV_ITEMS) ─────────────────────
const NAV_ITEMS = [
  {
    label: 'الرئيسية',
    href: '/dashboard',
    icon: <LayoutDashboard size={28} strokeWidth={2} />,
  },
  {
    label: 'التخصصات',
    href: '/majors',
    icon: (
      <Image
        src="/assets/mutah_logo1.png/mutah_logo1.png.png"
        alt="Mutah"
        width={28}
        height={28}
        className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]"
      />
    ),
  },
  {
    label: 'المساعد الذكي',
    href: '/ai-assistant',
    icon: (
      <Image
        src="/assets/MU.ai.logo/MU.ai.logoo.png"
        alt="Mutah Smart Assistant"
        width={28}
        height={28}
        className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
      />
    ),
  },
  {
    label: 'البطاقات الذكية',
    href: '/flashcards',
    icon: <LibraryBig size={26} strokeWidth={1.75} />,
  },
]

interface AppShellProps {
  children: React.ReactNode
  title: string
}

export default function AppShell({ children, title }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer automatically on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[var(--bg)] transition-colors duration-300">

      {/* ── Desktop Sidebar (unchanged) ──────────────────────────────── */}
      <Sidebar />

      {/* ── Main content column ──────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden w-full">
        <Topbar
          title={title}
          onMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-7 page-transition">
          {children}
        </main>
        <GlobalSearchMenu />
      </div>

      {/* ── Mobile Slide-over Drawer (md:hidden) ─────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Drawer panel — slides in from right (RTL layout) */}
            <motion.aside
              key="mobile-drawer"
              dir="rtl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36, mass: 0.8 }}
              className={[
                'md:hidden fixed top-0 right-0 z-[70]',
                'h-full w-[272px] flex flex-col',
                'dark:bg-[rgba(8,12,28,0.92)] bg-[rgba(15,23,42,0.96)]',
                'border-l dark:border-white/[0.07] border-white/10',
                'backdrop-blur-3xl shadow-[−20px_0_60px_rgba(0,0,0,0.5)]',
              ].join(' ')}
            >
              {/* ── Drawer header ── */}
              <div className={[
                'flex items-center justify-between gap-3 px-5 h-[70px] min-h-[70px] flex-shrink-0',
                'border-b dark:border-white/[0.06] border-white/10',
                'dark:bg-transparent bg-[#0f172a]',
              ].join(' ')}>
                {/* Brand */}
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 no-underline"
                >
                  <div className={[
                    'w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center',
                    'dark:bg-white/[0.06] bg-white/10',
                    'shadow-[0_0_20px_rgba(220,38,38,0.30)]',
                    'border border-red-600/30',
                  ].join(' ')}>
                    <Image
                      src="/assets/mutah_logo1.png/mutah_logo1.png.png"
                      alt="Mutah University"
                      width={36}
                      height={36}
                      quality={100}
                      priority
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-black text-[15px] leading-tight text-white">
                      مؤتة الذكية
                    </div>
                    <div className="text-[10px] text-white/50 mt-0.5">
                      كلية تكنولوجيا المعلومات
                    </div>
                  </div>
                </Link>

                {/* Close button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="إغلاق القائمة"
                  className={[
                    'flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0',
                    'dark:bg-white/[0.04] bg-white/10',
                    'border dark:border-white/[0.08] border-white/20',
                    'text-white/70 hover:text-white',
                    'hover:bg-white/10 dark:hover:bg-white/[0.08]',
                    'transition-all duration-200',
                  ].join(' ')}
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>

              {/* ── Nav items ── */}
              <nav className="flex-1 overflow-y-auto px-3 py-5">
                <ul className="list-none p-0 m-0 space-y-1.5">
                  {NAV_ITEMS.map((item, i) => {
                    const active = isActive(item.href)
                    return (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 + i * 0.07, duration: 0.35, ease: 'easeOut' }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={[
                            'group flex items-center gap-4 px-3.5 py-3.5 rounded-2xl text-[14px] no-underline transition-all duration-200',
                            active
                              ? 'font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.08)]'
                              : 'font-medium text-white/60 hover:text-white hover:bg-white/[0.05] border border-transparent',
                          ].join(' ')}
                        >
                          <span className={[
                            'flex items-center justify-center flex-shrink-0 w-8 transition-all duration-200',
                            active
                              ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                              : 'text-white/50 group-hover:text-white/80',
                          ].join(' ')}>
                            {item.icon}
                          </span>
                          <span className="flex-1">{item.label}</span>
                          {active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                          )}
                        </Link>
                      </motion.li>
                    )
                  })}

                  {/* ── Credits trigger (mobile-only, bottom of nav list) ── */}
                  <motion.li
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + NAV_ITEMS.length * 0.07, duration: 0.35, ease: 'easeOut' }}
                  >
                    <div className="mt-3 pt-3 border-t dark:border-white/[0.06] border-white/10">
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          window.dispatchEvent(new CustomEvent('open-credits'))
                        }}
                        className="group w-full flex items-center gap-4 px-3.5 py-3.5 rounded-2xl transition-all duration-200 border border-transparent hover:bg-purple-500/[0.07] hover:border-purple-500/20"
                      >
                        <span className="flex items-center justify-center flex-shrink-0 w-8 transition-all duration-200 text-purple-400/70 group-hover:text-purple-300 group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]">
                          <Cpu size={20} strokeWidth={1.75} />
                        </span>
                        <span className="flex-1 text-right text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] group-hover:from-purple-300 group-hover:to-blue-300 transition-all duration-300">
                          المطورين
                        </span>
                        <span className="w-1 h-1 rounded-full bg-purple-400/40 group-hover:bg-purple-400 group-hover:shadow-[0_0_6px_rgba(168,85,247,0.9)] transition-all duration-300" />
                      </button>
                    </div>
                  </motion.li>
                </ul>
              </nav>

              {/* ── Drawer footer ── */}
              <div className="flex-shrink-0 px-5 py-4 border-t dark:border-white/[0.06] border-white/10">
                <p className="text-[11px] text-white/25 text-center">
                  مؤتة الذكية · كلية تكنولوجيا المعلومات
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
