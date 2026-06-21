'use client'

import { useRouter } from 'next/navigation'
import type { Course } from '@/types'
import { ProgressBar, Badge } from './index'
import { Network, Blocks, MonitorSmartphone, TerminalSquare, Database, BookOpen } from 'lucide-react'

// Map of dark header gradients to light variants if we want. But the dark ones look premium in both modes headers! Let's just adjust them slightly to Tailwind classes.
const COURSE_ICONS: Record<string, React.ReactNode> = {
  cs101: <TerminalSquare size={44} strokeWidth={1.5} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" />,
  cs201: <Network size={44} strokeWidth={1.5} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" />,
  cs301: <Blocks size={44} strokeWidth={1.5} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" />,
  se101: <MonitorSmartphone size={44} strokeWidth={1.5} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" />,
  se201: <MonitorSmartphone size={44} strokeWidth={1.5} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" />,
  ds101: <Database size={44} strokeWidth={1.5} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" />,
  default: <BookOpen size={44} strokeWidth={1.5} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
}

const LEVEL_COLOR: Record<string, 'green' | 'orange' | 'red'> = {
  Beginner: 'green',
  Intermediate: 'orange',
  Advanced: 'red',
}

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  const router = useRouter()

  return (
    <div
      className="rounded-2xl h-full flex flex-col justify-between min-w-0 border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 group bg-white border-slate-300 shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:border-blue-500 dark:bg-[rgba(10,15,30,0.5)] dark:border-white/10 dark:shadow-none dark:hover:border-white/20"
      onClick={() => router.push(`/courses/${course.id}`)}
    >
      {/* Header - consistently dark/premium gradient across both themes for the image block */}
      <div
        className="h-24 shrink-0 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 dark:from-[rgba(30,48,96,0.6)] dark:to-black"
      >
        <span className="group-hover:scale-110 transition-transform duration-300">
          {COURSE_ICONS[course.id] || COURSE_ICONS.default}
        </span>
        <div className="absolute top-3 right-3">
          <Badge color={LEVEL_COLOR[course.level] ?? 'gray'}>{course.level}</Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-bold leading-snug mb-1 text-slate-900 dark:text-[#f0f6ff] truncate">
          {course.title}
        </h3>
        <p className="text-xs mb-auto text-slate-600 dark:text-[#94a3b8]">
          {course.credits} Credits · {course.chapterIds.length} Chapters · {course.instructor}
        </p>
        <div className="mt-3">
          <ProgressBar value={course.progress} />
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-slate-500 dark:text-[#94a3b8]">{course.progress}% complete</span>
            <span className="text-[10px] text-slate-500 dark:text-[#94a3b8]">{course.chapterIds.length} chapters</span>
          </div>
        </div>
      </div>
    </div>
  )
}

