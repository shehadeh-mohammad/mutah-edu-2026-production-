'use client'

import AppShell from '@/components/layout/AppShell'
import { getAllMajors } from '@/services/dataService'
import MajorCard from '@/components/ui/MajorCard'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
// No longer using GraduationCap from lucide-react

export default function MajorsPage() {
  const majors = getAllMajors()
  const gridRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current,
        { y: -20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
      )
      if (gridRef.current) {
        gsap.fromTo(Array.from(gridRef.current.children),
          { y: 70, opacity: 0, scale: 0.82, rotateX: 8 },
          { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 1, ease: 'elastic.out(1, 0.75)', stagger: 0.15, delay: 0.3 }
        )
      }
    })
    return () => ctx.revert()
  }, [])

  return (
    <AppShell title="التخصصات الأكاديمية">
      <div dir="rtl">
        <div ref={titleRef} className="mb-8">
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black flex items-center gap-4 text-slate-950 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-blue-50 dark:via-cyan-300 dark:to-violet-400 pb-2">
            <Image src="/assets/mutah_logo1.png/mutah_logo1.png.png" alt="Mutah University" width={80} height={80} className="w-20 h-20 object-contain drop-shadow-xl dark:drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
            التخصصات الأكاديمية
          </h2>
          <p className="text-[13px] mt-1.5 text-slate-700 dark:text-[#94a3b8] font-bold tracking-wide">
            خمس تخصصات تتيحها كلية تكنولوجيا المعلومات — جامعة مؤتة
          </p>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {majors.map(m => (
            <MajorCard key={m.id} major={m} courseCount={m.courseIds.length} />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
