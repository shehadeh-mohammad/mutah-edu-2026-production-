import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import { getAllQuizSets, getChapterById, getCourseById } from '@/services/dataService'
import { Badge } from '@/components/ui/index'

export default function QuizzesHubPage() {
  const sets = getAllQuizSets()

  return (
    <AppShell title="Quizzes">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-black text-slate-950 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
          ❓ Quizzes
        </h2>
        <p className="text-[13px] mt-1.5 font-bold text-slate-800 dark:text-[#94a3b8]">
          Test your knowledge chapter by chapter
        </p>
      </div>

      {sets.length === 0 ? (
        <div className="text-center py-20 text-slate-600 dark:text-[#94a3b8]">
          <span className="text-5xl block mb-4">❓</span>
          <p className="text-sm font-semibold">No quiz sets available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sets.map((set) => {
            const chapter = getChapterById(set.chapterId)
            const course = chapter ? getCourseById(chapter.courseId) : null

            return (
              <Link
                key={set.chapterId}
                href={`/quiz/${set.chapterId}`}
                className="flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 bg-white border-slate-300 shadow-[0_0_15px_rgba(225,29,72,0.15)] hover:shadow-[0_0_25px_rgba(225,29,72,0.35)] hover:border-rose-600 dark:bg-[rgba(10,15,30,0.5)] dark:border-white/10 dark:shadow-none dark:hover:border-white/20 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(244,63,94,0.08))', border: '1px solid rgba(244,63,94,0.3)' }}
                >
                  ❓
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-black transition-colors duration-300 text-slate-950 group-hover:text-red-700 dark:text-white dark:group-hover:text-red-400">
                    {chapter?.title ?? set.chapterId}
                  </p>
                  <p className="text-[12px] mt-0.5 font-bold text-slate-800 dark:text-[#94a3b8]">
                    {course?.title ?? ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge color="red">{set.questions.length} questions</Badge>
                  <span className="text-xs font-black transition-colors duration-300 text-slate-900 group-hover:text-red-700 dark:text-slate-300 dark:group-hover:text-red-400">Take Quiz →</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
