'use client'

import { useRouter } from 'next/navigation'
import type { Major } from '@/types'
import { Badge } from './index'
import { Code, Brain, GitBranch, Database, ShieldCheck, BookOpen } from 'lucide-react'

const SecurityShield = ({ size, className }: { size?: number; className?: string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// Very soft inner glow inside the card header
const COLOR_GLOW: Record<string, string> = {
  blue: 'rgba(59,130,246,0.06)',
  violet: 'rgba(139,92,246,0.06)',
  cyan: 'rgba(6,182,212,0.06)',
  emerald: 'rgba(16,185,129,0.06)',
  red: 'rgba(239,68,68,0.06)',
}

// Intense thematic outer glow on hover
const HOVER_GLOW_CLASS: Record<string, string> = {
  cs: 'hover:shadow-[0_0_35px_rgba(59,130,246,0.5)]',
  ai: 'hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]',
  se: 'hover:shadow-[0_0_35px_rgba(139,92,246,0.5)]',
  cis: 'hover:shadow-[0_0_35px_rgba(16,185,129,0.5)]',
  cy: 'hover:shadow-[0_0_35px_rgba(220,38,38,0.5)]',
}

// Deep, high-contrast border colors for Light Mode
const BORDER_COLOR_CLASS: Record<string, string> = {
  cs: 'border-blue-700',
  ai: 'border-cyan-700',
  se: 'border-violet-700',
  cis: 'border-emerald-700',
  cy: 'border-red-700',
}

const TAG_COLOR_MAP: Record<string, 'blue' | 'violet' | 'cyan' | 'green' | 'red' | 'orange'> = {
  blue: 'blue', violet: 'violet', cyan: 'cyan', emerald: 'green', red: 'red',
}

interface MajorCardProps {
  major: Major
  courseCount?: number
}

// Light color icons vividly matching brand colors; Dark mode incorporates glows
const MAJOR_ICON_MAP: Record<string, { icon: any, lightClass: string, darkClass: string }> = {
  cs: { icon: Code, lightClass: 'text-blue-600', darkClass: 'dark:text-white dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]' },
  ai: { icon: Brain, lightClass: 'text-cyan-600', darkClass: 'dark:text-cyan-300 dark:drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]' },
  se: { icon: GitBranch, lightClass: 'text-violet-600', darkClass: 'dark:text-violet-300 dark:drop-shadow-[0_0_12px_rgba(139,92,246,0.4)]' },
  cis: { icon: Database, lightClass: 'text-emerald-600', darkClass: 'dark:text-emerald-300 dark:drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]' },
  'cyber-security': { icon: SecurityShield, lightClass: 'text-rose-500 group-hover:text-slate-900 transition-colors duration-500', darkClass: 'dark:text-rose-400 dark:group-hover:text-white transition-colors duration-500 dark:drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]' },
  cy: { icon: ShieldCheck, lightClass: 'text-red-600', darkClass: 'dark:text-red-300 dark:drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]' },
  default: { icon: BookOpen, lightClass: 'text-slate-800', darkClass: 'dark:text-white dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]' },
}

export default function MajorCard({ major, courseCount = 3 }: MajorCardProps) {
  const router = useRouter()
  const tagColor = TAG_COLOR_MAP[major.color] ?? 'blue'
  const shadowGlow = HOVER_GLOW_CLASS[major.id] || 'hover:shadow-2xl'
  const borderColorClass = BORDER_COLOR_CLASS[major.id] || 'border-slate-400'
  const IconConfig = MAJOR_ICON_MAP[major.id] || MAJOR_ICON_MAP.default
  const IconCmp = IconConfig.icon

  return (
    <div
      className={`rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-white ${borderColorClass} dark:bg-white/[0.015] dark:border-white/10 dark:hover:border-white/20 group ${shadowGlow}`}
      onClick={() => router.push(`/majors/${major.id}`)}
    >
      <div
        className="p-6 transition-colors duration-300"
        style={{ background: COLOR_GLOW[major.color] ?? 'transparent' }}
      >
        {/* Strictly center-aligned scale effect with NO horizontal movement */}
        <div className="mb-4 inline-block transform transition-transform duration-300 group-hover:scale-105 origin-center">
          <IconCmp size={46} strokeWidth={1.5} className={`transition-colors duration-300 drop-shadow-none ${IconConfig.lightClass} ${IconConfig.darkClass}`} />
        </div>

        <h3 className="font-display text-base font-black mb-2 leading-snug text-black dark:text-[#f0f6ff]">
          {major.title}
        </h3>
        <p className="text-xs font-medium leading-relaxed mb-4 text-slate-800 dark:text-[#94a3b8]">
          {major.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {major.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} color={tagColor}>{tag}</Badge>
          ))}
          {major.tags.length > 4 && (
            <Badge color="gray">+{major.tags.length - 4}</Badge>
          )}
        </div>
      </div>

      <div
        className={`flex items-center gap-2 px-5 py-3 border-t ${borderColorClass} dark:border-white/[0.05]`}
      >
        <Badge color={tagColor}>{courseCount} المقررات</Badge>
        <span className="ml-auto text-xs font-black text-black dark:text-slate-300 transition-colors group-hover:text-blue-700 dark:group-hover:text-cyan-300">
          استكشف التخصص ←
        </span>
      </div>
    </div>
  )
}
