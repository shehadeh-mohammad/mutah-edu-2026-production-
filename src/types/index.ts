// ─── Major ───────────────────────────────────────────────
export interface Major {
  id: string
  emoji: string
  color: 'blue' | 'violet' | 'cyan'
  title: string
  description: string
  longDescription: string
  tags: string[]
  courseIds: string[]
  objectives: string[]
  careerPaths: string[]
}

// ─── Course ───────────────────────────────────────────────
export interface Course {
  id: string
  title: string
  nameArabic?: string
  majorId: string
  credits: number
  chapterIds: string[]
  progress: number
  emoji: string
  description: string
  instructor: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration?: string
  slug?: string
}

// ─── Chapter ──────────────────────────────────────────────
export interface Chapter {
  id: string
  courseId: string
  title: string
  videoId: string
  videoUrl?: string
  pdfUrl?: string
  aiContextSummary?: string
  slidesTitle: string
  order: number
  description: string
  resource?: {
    name: string
    size: string
    url: string
  }
  transcript?: string
}

// ─── Flashcard ────────────────────────────────────────────
export interface Flashcard {
  id: string
  question: string
  answer: string
}

export interface FlashcardSet {
  chapterId: string
  cards: Flashcard[]
}

// ─── Quiz ─────────────────────────────────────────────────
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface QuizSet {
  chapterId: string
  questions: QuizQuestion[]
}

// ─── AI Content ───────────────────────────────────────────
export interface AIContent {
  chapterId: string
  summary: string
  keyConcepts: string[]
  studyTips: string[]
}

// ─── User ─────────────────────────────────────────────────
export interface User {
  name: string
  universityId: string
  major: string
  enrolledCourseIds: string[]
  year: string
  email: string
}

// ─── Progress ─────────────────────────────────────────────
export interface CourseProgress {
  courseId: string
  completedChapters: string[]
  lastViewedChapter?: string
  quizScores: Record<string, number>
}
