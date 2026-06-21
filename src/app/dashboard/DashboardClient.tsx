'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import type { Course, Chapter } from '@/types'
import CourseCard from '@/components/ui/CourseCard'
import { Library, TrendingUp, CheckCircle, Target, BookOpen } from 'lucide-react'

const ENROLLED_IDS = ['cs101', 'cs201', 'se101', 'ds101', 'cs301', 'se201']

const STAT_DATA = [
  { labelAr: 'المقررات المسجّلة', icon: Library, lightColor: 'text-blue-700', darkColor: 'dark:text-cyan-400', accent: 'from-blue-500 to-cyan-400', darkGlow: 'dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] drop-shadow-none', ring: 'rgba(6,182,212,0.5)' },
  { labelAr: 'متوسط التقدم', icon: TrendingUp, lightColor: 'text-violet-700', darkColor: 'dark:text-violet-300', accent: 'from-violet-500 to-pink-500', darkGlow: 'dark:drop-shadow-[0_0_8px_rgba(167,139,250,0.5)] drop-shadow-none', ring: 'rgba(139,92,246,0.5)' },
  { labelAr: 'الفصول المكتملة', icon: CheckCircle, lightColor: 'text-emerald-700', darkColor: 'dark:text-emerald-300', accent: 'from-emerald-500 to-teal-400', darkGlow: 'dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] drop-shadow-none', ring: 'rgba(16,185,129,0.5)' },
  { labelAr: 'درجة الاختبار', icon: Target, lightColor: 'text-amber-700', darkColor: 'dark:text-yellow-300', accent: 'from-amber-500 to-orange-400', darkGlow: 'dark:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] drop-shadow-none', ring: 'rgba(245,158,11,0.5)' },
]

export default function DashboardClient({ courses, recentChapters }: { courses: Course[], recentChapters: Chapter[] }) {
  const [showAllCourses, setShowAllCourses] = useState(false)
  const router = useRouter()
  const statsRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const recentRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  const avgProgress = Math.round(courses.reduce((a, c) => a + c.progress, 0) / courses.length) || 0

  const statValues = [courses.length, `${avgProgress}%`, 14, '87%']
  const statChanges = ['↑ نشط هذا الفصل', '↑ استمر هكذا!', '↑ 3 هذا الأسبوع', '↑ فوق المتوسط']

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
      gsap.fromTo(statsRef.current ? Array.from(statsRef.current.children) : [], { y: 50, opacity: 0, scale: 0.82 }, { y: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'elastic.out(1, 0.75)', stagger: 0.1, delay: 0.2 })
      gsap.fromTo(cardsRef.current ? Array.from(cardsRef.current.children) : [], { y: 60, opacity: 0, scale: 0.88 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.75)', stagger: 0.12, delay: 0.5 })
      gsap.fromTo(recentRef.current ? Array.from(recentRef.current.children) : [], { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1, delay: 0.85 })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div dir="rtl" className="bg-slate-50/80 border border-slate-200 shadow-xl dark:shadow-none dark:bg-black/30 dark:border-white/10 backdrop-blur-xl rounded-3xl p-2 -m-2 transition-colors duration-300">

      {/* Header */}
      <div ref={headerRef} className="mb-8">
        <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-black leading-[1.3] text-slate-950 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-blue-50 dark:via-cyan-300 dark:to-violet-400">
          مرحباً أيها الطالب، 👋
        </h2>
        <p className="text-[13px] font-bold mt-1.5 text-slate-800 dark:text-[#94a3b8]">
          واصل رحلتك التعليمية · كلية تكنولوجيا المعلومات — جامعة مؤتة
        </p>
      </div>

      {/* Stats Bento */}
      <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_DATA.map((s, i) => (
          <div key={i} className="glass-ultra px-5 py-[22px] relative overflow-hidden bg-white/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 transition-colors duration-300">
            {/* Dark Mode Neon Top Bar */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r hidden dark:block ${s.accent}`} style={{ boxShadow: `0 0 12px ${s.ring}` }} />
            {/* Dark Mode Orb Glow Background */}
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full blur-[20px] pointer-events-none hidden dark:block" style={{ background: `radial-gradient(circle, ${s.ring.replace('0.5', '0.12')} 0%, transparent 70%)` }} />

            <div className="pb-2.5 flex items-center">
              <s.icon size={24} strokeWidth={2} className={`${s.lightColor} ${s.darkColor} ${s.darkGlow} transition-colors duration-300`} />
            </div>
            <p className="text-[10px] font-bold tracking-[0.08em] uppercase mb-1.5 text-slate-800 dark:text-[#4a6882]">
              {s.labelAr}
            </p>
            {/* Value with ring */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-slate-200 bg-slate-100 dark:border-transparent dark:bg-transparent dark:neon-ring transition-colors duration-300 relative"
                style={{
                  // The inline neon ring style only runs correctly if the dark class overrides it visually, we ensure the dark mode explicitly drops the ring class
                }}>
                <span className="text-[12px] md:text-[14px] font-black leading-none text-slate-900 dark:text-[#f0f6ff]">
                  {statValues[i]}
                </span>

                {/* Specific dark-mode only inline glow ring */}
                <div className="absolute inset-0 hidden dark:block rounded-full neon-ring"
                  style={{
                    background: `radial-gradient(circle, ${s.ring.replace('0.5', '0.18')} 0%, transparent 70%)`,
                    border: `2px solid ${s.ring}`,
                    boxShadow: `0 0 15px ${s.ring}, 0 0 30px ${s.ring.replace('0.5', '0.2')}`
                  }}
                />
              </div>
              <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">{statChanges[i]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      {/* ── Section header row: title + inline collapse control ── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-black flex items-center gap-2.5 text-slate-950 dark:text-[#94b8d8]">
          <TrendingUp size={16} className="text-cyan-700 dark:text-cyan-400 drop-shadow-none dark:drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]" />
          واصل التعلم
        </h3>
        {/* Show-less button — only visible when list is expanded, placed here
            so user can collapse immediately without scrolling to the bottom */}
        {courses.length > 4 && showAllCourses && (
          <button
            onClick={() => setShowAllCourses(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all hover:bg-white/5 hover:border-cyan-500/40"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            عرض أقل ↑
          </button>
        )}
      </div>
      <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-4 items-stretch">
        {(showAllCourses ? courses : courses.slice(0, 4)).map(c => (
          <div key={c.id} className="h-full flex flex-col justify-between min-w-0">
            <CourseCard course={c} />
          </div>
        ))}
      </div>
      {/* Expand trigger — only shown when collapsed, hidden when expanded */}
      {courses.length > 4 && !showAllCourses && (
        <div className="flex justify-center mb-10">
          <button
            onClick={() => setShowAllCourses(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold border transition-all hover:bg-white/5 hover:border-cyan-500/40"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            استكشف باقي المساقات ↓
          </button>
        </div>
      )}

      {/* Recently Viewed */}
      <h3 className="text-[13px] font-black flex items-center gap-2.5 mb-4 text-slate-950 dark:text-[#94b8d8]">
        <BookOpen size={16} className="text-violet-700 dark:text-violet-300 drop-shadow-none dark:drop-shadow-[0_0_5px_rgba(167,139,250,0.4)]" />
        شاهدتها مؤخراً
      </h3>
      <div ref={recentRef} className="space-y-3">
        {recentChapters.map(ch => (
          <div
            key={ch.id}
            className="flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors duration-300 bg-white/70 border border-slate-200 dark:bg-white/[0.028] dark:border-white/[0.08] dark:hover:border-cyan-400/45 hover:border-blue-400/50 hover:bg-slate-50 dark:hover:bg-white/[0.04] rounded-2xl"
            onClick={() => router.push(`/courses/${ch.courseId}`)}
          >
            <BookOpen size={20} className="flex-shrink-0 text-cyan-700 dark:text-cyan-400 drop-shadow-none dark:drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[13px] font-black overflow-hidden text-ellipsis whitespace-nowrap text-slate-950 dark:text-[#f0f6ff]">
                {ch.title}
              </p>
              <p className="text-[11px] mt-0.5 font-bold text-slate-700 dark:text-[#94a3b8]">
                هياكل البيانات والخوارزميات
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
