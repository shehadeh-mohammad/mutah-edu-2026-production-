'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import CourseCard from '@/components/ui/CourseCard'
import { Badge } from '@/components/ui/index'
import { SearchX } from 'lucide-react'
import type { Course } from '@/types'

export default function MajorClient({ major, allCourses }: { major: any, allCourses: Course[] }) {
  const tagColor = major.color === 'blue' ? 'blue' : major.color === 'violet' ? 'violet' : 'cyan'

  const [searchQuery, setSearchQuery] = useState('')
  const [showAllCourses, setShowAllCourses] = useState(false)

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return allCourses
    const q = searchQuery.toLowerCase()
    return allCourses.filter(c =>
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
    )
  }, [allCourses, searchQuery])

  const displayedCourses = showAllCourses || searchQuery.trim()
    ? filteredCourses
    : filteredCourses.slice(0, 4)

  return (
    <AppShell title={major.title}>
      <Link
        href="/majors"
        className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border mb-6 transition-all hover:bg-white/5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text3)' }}
      >
        ← Back to Majors
      </Link>

      {/* Hero */}
      <div className="flex gap-5 items-start mb-10 flex-wrap">
        <span className="text-6xl">{major.emoji}</span>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            {major.title}
          </h2>
          <p className="text-sm leading-relaxed mb-4 max-w-2xl" style={{ color: 'var(--text2)' }}>
            {major.longDescription}
          </p>
          <div className="flex flex-wrap gap-2">
            {major.tags.map((tag: string) => <Badge key={tag} color={tagColor as 'blue'}>{tag}</Badge>)}
          </div>
        </div>
      </div>

      {/* Two-column details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {/* Objectives */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>🎯 Learning Objectives</h3>
          <ul className="space-y-2">
            {major.objectives.map((obj: string, i: number) => (
              <li key={i} className="flex gap-2.5 text-xs" style={{ color: 'var(--text2)' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>

        {/* Career Paths */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>💼 Career Paths</h3>
          <div className="flex flex-wrap gap-2">
            {major.careerPaths.map((path: string) => (
              <Badge key={path} color="gray">{path}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>
        📚 Courses in this Major
      </h3>

      {/* Search Bar — text-base (≥16px) prevents iOS Safari auto-zoom */}
      <div className="relative mb-5">
        <input
          id="major-course-search"
          type="search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="🔍 ابحث عن مساق..."
          dir="rtl"
          className="w-full text-base rounded-2xl border px-4 py-3 pr-4 outline-none transition-all focus:ring-2 focus:ring-cyan-500/40"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
            fontSize: '16px',
          }}
        />
      </div>

      {/* Zero-results Fallback */}
      {filteredCourses.length === 0 && searchQuery.trim() && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <SearchX
            size={48}
            className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)] animate-pulse"
          />
          <p
            className="text-sm font-medium leading-relaxed max-w-xs"
            dir="rtl"
            style={{ color: 'var(--text2)' }}
          >
            عذراً، لم نجد هذا المساق في هذا التخصص.. جرب استكشاف مساقات أخرى أو ابحث في مساقاتي المعتمدة فوق ✨
          </p>
        </div>
      )}

      {/* Course Grid — 2×2 on mobile, 4-col on PC */}
      {filteredCourses.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-6">
            {displayedCourses.map(c => (
              <div key={c.id} className="flex flex-col">
                <CourseCard course={c} />
              </div>
            ))}
          </div>

          {!searchQuery.trim() && allCourses.length > 4 && (
            <div className="flex justify-center mb-10">
              <button
                onClick={() => setShowAllCourses(prev => !prev)}
                className="px-6 py-3 rounded-2xl text-sm font-bold border transition-all hover:bg-white/5 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                {showAllCourses ? 'عرض أقل ↑' : 'استكشف باقي المساقات ↓'}
              </button>
            </div>
          )}
        </>
      )}

    </AppShell>
  )
}
