'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

import { useEffect, useRef } from 'react'
import { LayoutDashboard, LibraryBig } from 'lucide-react'
import { gsap } from 'gsap'

const NAV_ITEMS = [
  { label: 'الرئيسية', href: '/dashboard', icon: <LayoutDashboard size={36} strokeWidth={2} /> },
  { label: 'التخصصات', href: '/majors', icon: <Image src="/assets/mutah_logo1.png/mutah_logo1.png.png" alt="Mutah" width={36} height={36} className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]" /> },
  { label: 'المساعد الذكي', href: '/ai-assistant', icon: <div className="w-9 h-9 flex items-center justify-center shrink-0"><Image src="/assets/MU.ai.logo/MU.ai.logoo.png" alt="Mutah Smart Assistant" width={36} height={36} className="object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(236,72,153,0.8)] transition-all" /></div> },
  { label: 'البطاقات الذكية', href: '/flashcards', icon: <LibraryBig size={32} strokeWidth={1.75} /> },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  const navRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.nav-icon',
        { scale: 0, opacity: 0, filter: 'blur(8px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'elastic.out(1, 0.65)', stagger: 0.1 }
      )
    }, navRef)
    return () => ctx.revert()
  }, [])

  return (
    <aside
      dir="rtl"
      className={[
        'hidden md:flex flex-col h-full transition-colors duration-300',
        'w-60 min-w-[240px]',
        /* dark */  'dark:bg-[rgba(10,15,30,0.85)] dark:border-l dark:border-white/[0.07]',
        /* light */ 'bg-white/40 border-l border-white/50 backdrop-blur-2xl',
      ].join(' ')}
    >
      {/* Logo — clicking returns to the landing page */}
      <Link
        href="/"
        className={[
          'group relative flex items-center gap-3 px-[18px] py-[13px] no-underline cursor-pointer',
          'transition-all duration-300',
          'border-b dark:border-white/[0.06] border-indigo-500/20',
          'dark:bg-transparent bg-[#0f172a] shadow-md h-[78px] md:h-[86px]',
        ].join(' ')}
      >
        {/* Logo icon — scales on hover for tactile feedback */}
        <div className={[
          'w-14 h-14 md:w-16 md:h-16 rounded-2xl flex-shrink-0 flex items-center justify-center',
          'dark:bg-white/[0.06] bg-white/10',
          'shadow-[0_0_30px_rgba(220,38,38,0.30)]',
          'border border-red-600/30 backdrop-blur-md',
          'transition-transform duration-300 group-hover:scale-105',
        ].join(' ')}>
          <Image
            src="/assets/mutah_logo1.png/mutah_logo1.png.png"
            alt="Mutah University"
            width={56}
            height={56}
            quality={100}
            priority={true}
            className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]"
            style={{ imageRendering: 'auto' }}
          />
        </div>

        <div>
          <div className="font-black text-[17px] md:text-[19px] leading-tight text-white dark:text-[var(--text)] transition-colors duration-300 group-hover:text-red-300 dark:group-hover:text-cyan-300">مؤتة الذكية</div>
          <div className="text-[10px] md:text-[11px] text-white/55 dark:text-[var(--text3)] mt-0.5">كلية تكنولوجيا المعلومات</div>
        </div>

        {/* Glassmorphic tooltip — floats below the logo on hover */}
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none absolute right-3 top-[74px] z-50',
            'whitespace-nowrap text-[11px] font-bold leading-none',
            'px-3 py-2 rounded-xl',
            /* glass surface */
            'bg-white/10 dark:bg-black/50 backdrop-blur-lg',
            'border border-white/20 dark:border-white/10',
            'shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
            /* text */
            'text-white dark:text-cyan-200',
            /* reveal */
            'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0',
            'transition-all duration-300 ease-out',
          ].join(' ')}
        >
          العودة للصفحة الترحيبية 🏠
        </span>
      </Link>

      {/* Nav */}
      <nav ref={navRef} className="flex-1 px-2.5 py-6 overflow-y-auto">
        <ul className="list-none p-0 m-0 space-y-2">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    'group relative flex items-center gap-4 px-3 py-3 rounded-[14px] text-[13px] no-underline transition-all duration-200',
                    active
                      ? 'font-bold dark:text-cyan-300 text-blue-700 dark:bg-cyan-500/10 bg-blue-50/70 border-l-[3px] border-l-blue-600 dark:border-cyan-500 border border-t-white/50 border-r-white/50 border-b-white/50 dark:border-transparent drop-shadow-[0_0_15px_rgba(37,99,235,0.15)] dark:drop-shadow-none'
                      : 'font-medium text-slate-600 dark:text-[var(--text2)] hover:bg-white/40 dark:hover:bg-white/[0.04] border border-transparent',
                  ].join(' ')}
                >
                  <span className={[
                    'nav-icon flex items-center justify-center flex-shrink-0 w-9',
                    active
                      ? 'dark:text-cyan-300 text-blue-700 dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] drop-shadow-none'
                      : 'dark:text-slate-300 text-slate-600',
                  ].join(' ')}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
