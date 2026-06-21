'use client'

import { notFound, useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import FlashcardViewer from '@/components/flashcards/FlashcardViewer'
import { getFlashcardsByChapterId, getChapterById, getCourseById } from '@/services/dataService'

interface Props { params: { id: string } }

export default function FlashcardsPage({ params }: Props) {
  const router = useRouter()
  const set = getFlashcardsByChapterId(params.id)
  if (!set) notFound()

  const chapter = getChapterById(params.id)
  const course = chapter ? getCourseById(chapter.courseId) : null

  return (
    <AppShell title={`Flashcards · ${chapter?.title ?? ''}`}>
      <button
        onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 2) {
                router.back()
            } else {
                router.push('/flashcards')
            }
        }}
        className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border mb-6 transition-all hover:bg-white/5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text3)' }}
      >
        ← Back
      </button>

      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>🃏 Flashcards</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
          {chapter?.title} · {course?.title} · {set.cards.length} cards
        </p>
      </div>

      <FlashcardViewer cards={set.cards} />
    </AppShell>
  )
}
