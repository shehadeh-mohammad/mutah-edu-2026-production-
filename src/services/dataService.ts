/**
 * dataService.ts
 * Central data access layer — reads from local JSON files.
 * No database required. All data lives in src/data/.
 */

import type { Major, Course, Chapter, FlashcardSet, QuizSet } from '@/types'

import majorsData from '@/data/majors.json'
import coursesData from '@/data/courses.json'

// Chapter imports (one JSON per course)
import cs101Chapters from '@/data/chapters/cs101.json'
import cs201Chapters from '@/data/chapters/cs201.json'
import cs301Chapters from '@/data/chapters/cs301.json'
import se101Chapters from '@/data/chapters/se101.json'
import se201Chapters from '@/data/chapters/se201.json'
import ds101Chapters from '@/data/chapters/ds101.json'
import ai101Chapters from '@/data/chapters/ai101.json'
import ai201Chapters from '@/data/chapters/ai201.json'
import ai301Chapters from '@/data/chapters/ai301.json'
import cis101Chapters from '@/data/chapters/cis101.json'
import cis201Chapters from '@/data/chapters/cis201.json'
import cis301Chapters from '@/data/chapters/cis301.json'
import cis401Chapters from '@/data/chapters/cis401.json'
import cis402Chapters from '@/data/chapters/cis402.json'
import cy101Chapters from '@/data/chapters/cy101.json'
import cy201Chapters from '@/data/chapters/cy201.json'

// Flashcard imports (one JSON per chapter)
import fcCs1011 from '@/data/flashcards/ch-cs101-1.json'
import fcCs1012 from '@/data/flashcards/ch-cs101-2.json'
import fcCs2011 from '@/data/flashcards/ch-cs201-1.json'
import fcDs1011 from '@/data/flashcards/ch-ds101-1.json'
import fcSe1011 from '@/data/flashcards/ch-se101-1.json'

// Quiz imports (one JSON per chapter)
import qzCs1011 from '@/data/quizzes/ch-cs101-1.json'
import qzDs1011 from '@/data/quizzes/ch-ds101-1.json'
import qzSe1011 from '@/data/quizzes/ch-se101-1.json'
import qzCs2011 from '@/data/quizzes/ch-cs201-1.json'

// ─── Aggregated Maps ─────────────────────────────────────────────────────────

const ALL_CHAPTERS: Chapter[] = [
  ...cs101Chapters,
  ...cs201Chapters,
  ...cs301Chapters,
  ...se101Chapters,
  ...se201Chapters,
  ...ds101Chapters,
  ...ai101Chapters,
  ...ai201Chapters,
  ...ai301Chapters,
  ...cis101Chapters,
  ...cis201Chapters,
  ...cis301Chapters,
  ...cis401Chapters,
  ...cis402Chapters,
  ...cy101Chapters,
  ...cy201Chapters,
] as Chapter[]

const FLASHCARD_MAP: Record<string, FlashcardSet> = {
  'ch-cs101-1': fcCs1011 as FlashcardSet,
  'ch-cs101-2': fcCs1012 as FlashcardSet,
  'ch-cs201-1': fcCs2011 as FlashcardSet,
  'ch-ds101-1': fcDs1011 as FlashcardSet,
  'ch-se101-1': fcSe1011 as FlashcardSet,
}

const QUIZ_MAP: Record<string, QuizSet> = {
  'ch-cs101-1': qzCs1011 as QuizSet,
  'ch-ds101-1': qzDs1011 as QuizSet,
  'ch-se101-1': qzSe1011 as QuizSet,
  'ch-cs201-1': qzCs2011 as QuizSet,
}

// ─── Majors ───────────────────────────────────────────────────────────────────

export function getAllMajors(): Major[] {
  return majorsData as Major[]
}

export function getMajorById(id: string): Major | undefined {
  return (majorsData as Major[]).find((m) => m.id === id)
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export function getAllCourses(): Course[] {
  return coursesData as Course[]
}

export function getCourseById(id: string): Course | undefined {
  return (coursesData as Course[]).find((c) => c.id === id)
}

export function getCoursesByMajorId(majorId: string): Course[] {
  return (coursesData as Course[]).filter((c) => c.majorId === majorId)
}

export function getCoursesByIds(ids: string[]): Course[] {
  return ids.map((id) => getCourseById(id)).filter(Boolean) as Course[]
}

// ─── Chapters ─────────────────────────────────────────────────────────────────

export function getAllChapters(): Chapter[] {
  return ALL_CHAPTERS
}

export function getChapterById(id: string): Chapter | undefined {
  const found = ALL_CHAPTERS.find((ch) => ch.id === id)
  if (found) return found

  if (id.includes('-mock-')) {
    const courseId = id.split('-')[1] || 'course'
    const isIntro = id.endsWith('-1')
    return {
      id,
      courseId,
      title: isIntro ? 'المقدمة (Introduction)' : 'المفاهيم المتقدمة (Advanced Concepts)',
      videoId: 'OAWl6F_9HJ8',
      order: isIntro ? 1 : 2,
      description: 'محتوى تجريبي (Mock Content).',
      resource: {
        name: isIntro ? 'Intro_Slides.pdf' : 'Advanced_Concepts.pdf',
        size: '1.5 MB',
        url: '#'
      }
    } as Chapter
  }
  return undefined
}

export function getChaptersByCourseId(courseId: string): Chapter[] {
  const existing = ALL_CHAPTERS.filter((ch) => ch.courseId === courseId).sort(
    (a, b) => a.order - b.order
  )

  if (existing.length === 0) {
    return [
      {
        id: `ch-${courseId}-mock-1`,
        courseId,
        title: 'المقدمة (Introduction)',
        videoId: 'OAWl6F_9HJ8',
        order: 1,
        description: 'مرحباً بك في هذا المساق. يتم حالياً إعداد المحتوى التفصيلي، لكن يمكنك البدء بمراجعة الأساسيات هنا.',
        resource: {
          name: 'Course_Intro_Slides.pdf',
          size: '2.1 MB',
          url: '#'
        }
      },
      {
        id: `ch-${courseId}-mock-2`,
        courseId,
        title: 'المفاهيم المتقدمة (Advanced Concepts)',
        videoId: 'OAWl6F_9HJ8',
        order: 2,
        description: 'هذا الفصل سيغطي المفاهيم المتقدمة والتطبيقات العملية. سيتم توفير الفيديو قريباً.',
        resource: {
          name: 'Advanced_Topics.pdf',
          size: '3.4 MB',
          url: '#'
        }
      }
    ] as Chapter[]
  }

  return existing
}

export function getChaptersByIds(ids: string[]): Chapter[] {
  return ids.map((id) => getChapterById(id)).filter(Boolean) as Chapter[]
}

// ─── Flashcards ───────────────────────────────────────────────────────────────

export function getFlashcardsByChapterId(chapterId: string): FlashcardSet | undefined {
  return FLASHCARD_MAP[chapterId]
}

export function getAllFlashcardSets(): FlashcardSet[] {
  return Object.values(FLASHCARD_MAP)
}

// ─── Quizzes ──────────────────────────────────────────────────────────────────

export function getQuizByChapterId(chapterId: string): QuizSet | undefined {
  return QUIZ_MAP[chapterId]
}

export function getAllQuizSets(): QuizSet[] {
  return Object.values(QUIZ_MAP)
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  type: 'course' | 'chapter' | 'major'
  id: string
  title: string
  subtitle: string
  slug?: string
  courseSlug?: string
}

export function searchAll(query: string): SearchResult[] {
  if (!query || query.trim().length < 2) return []
  const q = query.toLowerCase()
  const results: SearchResult[] = []

  for (const major of majorsData as Major[]) {
    if (major.title.toLowerCase().includes(q)) {
      results.push({ type: 'major', id: major.id, title: major.title, subtitle: 'Major' })
    }
  }

  for (const course of coursesData as Course[]) {
    const titleMatch = course.title.toLowerCase().includes(q)
    const arabicMatch = course.nameArabic ? course.nameArabic.toLowerCase().includes(q) : false
    const descMatch = course.description.toLowerCase().includes(q)
    
    if (titleMatch || arabicMatch || descMatch) {
      results.push({ 
        type: 'course', 
        id: course.id, 
        title: course.title, 
        subtitle: `${course.credits} Credits`,
        slug: course.slug || course.id
      })
    }
  }

  for (const chapter of ALL_CHAPTERS) {
    if (chapter.title.toLowerCase().includes(q) || chapter.description.toLowerCase().includes(q)) {
      const course = getCourseById(chapter.courseId)
      results.push({ 
        type: 'chapter', 
        id: chapter.id, 
        title: chapter.title, 
        subtitle: course?.title ?? '',
        courseSlug: course?.slug || course?.id
      })
    }
  }

  return results.slice(0, 8)
}
