'use client'

import { useState, useEffect, useCallback } from 'react'
import { getLocalStorage, setLocalStorage } from '@/lib/utils'

interface ProgressState {
  completedChapters: string[]
  quizScores: Record<string, number>
  lastViewed: string[]
}

const DEFAULT_PROGRESS: ProgressState = {
  completedChapters: [],
  quizScores: {},
  lastViewed: [],
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(DEFAULT_PROGRESS)

  useEffect(() => {
    setProgress(getLocalStorage<ProgressState>('mu_progress', DEFAULT_PROGRESS))
  }, [])

  const save = useCallback((next: ProgressState) => {
    setProgress(next)
    setLocalStorage('mu_progress', next)
  }, [])

  const markChapterComplete = useCallback(
    (chapterId: string) => {
      if (progress.completedChapters.includes(chapterId)) return
      save({ ...progress, completedChapters: [...progress.completedChapters, chapterId] })
    },
    [progress, save]
  )

  const recordQuizScore = useCallback(
    (chapterId: string, score: number) => {
      save({ ...progress, quizScores: { ...progress.quizScores, [chapterId]: score } })
    },
    [progress, save]
  )

  const addToLastViewed = useCallback(
    (chapterId: string) => {
      const filtered = progress.lastViewed.filter((id) => id !== chapterId)
      save({ ...progress, lastViewed: [chapterId, ...filtered].slice(0, 5) })
    },
    [progress, save]
  )

  const isChapterComplete = (chapterId: string) =>
    progress.completedChapters.includes(chapterId)

  const getCourseProgress = (chapterIds: string[]): number => {
    if (!chapterIds.length) return 0
    const done = chapterIds.filter((id) => progress.completedChapters.includes(id)).length
    return Math.round((done / chapterIds.length) * 100)
  }

  return {
    progress,
    markChapterComplete,
    recordQuizScore,
    addToLastViewed,
    isChapterComplete,
    getCourseProgress,
  }
}
