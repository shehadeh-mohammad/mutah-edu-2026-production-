'use client'

import { cn } from '@/lib/utils'

export type ChapterTab = 'video' | 'slides' | 'flashcards' | 'quiz'

interface Tab {
  id: ChapterTab
  label: string
  icon: string
  available: boolean
}

interface ChapterTabsProps {
  active: ChapterTab
  onChange: (tab: ChapterTab) => void
  hasFlashcards: boolean
  hasQuiz: boolean
}

export default function ChapterTabs({ active, onChange, hasFlashcards, hasQuiz }: ChapterTabsProps) {
  const tabs: Tab[] = [
    { id: 'video',      label: 'Video',      icon: '🎥', available: true },
    { id: 'slides',     label: 'Slides',     icon: '📑', available: true },
    { id: 'flashcards', label: 'Flashcards', icon: '🃏', available: hasFlashcards },
    { id: 'quiz',       label: 'Quiz',       icon: '❓', available: hasQuiz },
  ]

  return (
    <div
      className="flex gap-1 p-1 rounded-xl border mb-6"
      style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => tab.available && onChange(tab.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200',
            active === tab.id
              ? 'border shadow-sm'
              : tab.available
              ? 'hover:bg-white/5'
              : 'opacity-40 cursor-not-allowed'
          )}
          style={active === tab.id ? {
            background: 'var(--surface)',
            color: 'var(--text)',
            borderColor: 'var(--border)',
          } : {
            color: 'var(--text2)',
          }}
        >
          <span className="text-sm">{tab.icon}</span>
          <span>{tab.label}</span>
          {!tab.available && <span className="text-[9px] opacity-60">(N/A)</span>}
        </button>
      ))}
    </div>
  )
}
