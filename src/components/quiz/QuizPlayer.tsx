'use client'

import { useState } from 'react'
import type { QuizQuestion } from '@/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/index'

interface QuizPlayerProps {
  questions: QuizQuestion[]
  onComplete?: (score: number, total: number) => void
}

export default function QuizPlayer({ questions, onComplete }: QuizPlayerProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({})

  if (!questions.length) return (
    <div className="text-center py-16" style={{ color: 'var(--text3)' }}>
      <span className="text-5xl block mb-3">❓</span>
      <p className="text-sm">No quiz available for this chapter.</p>
    </div>
  )

  const answered = Object.keys(answers).length
  const score = Object.entries(answers).filter(([qi, oi]) => questions[+qi].correctIndex === oi).length
  const allDone = answered === questions.length

  const answer = (qi: number, oi: number) => {
    if (answers[qi] !== undefined) return
    const next = { ...answers, [qi]: oi }
    setAnswers(next)
    if (Object.keys(next).length === questions.length && onComplete) {
      const s = Object.entries(next).filter(([i, o]) => questions[+i].correctIndex === +o).length
      onComplete(s, questions.length)
    }
  }

  const reset = () => setAnswers({})

  return (
    <div className="space-y-5">
      {/* Progress dots */}
      <div className="flex items-center gap-2 flex-wrap">
        {questions.map((_, i) => {
          const a = answers[i]
          const correct = a !== undefined && a === questions[i].correctIndex
          return (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                background: a === undefined
                  ? 'var(--border2)'
                  : correct ? '#10b981' : '#ef4444',
              }}
            />
          )
        })}
        {allDone && (
          <Badge color={score >= questions.length / 2 ? 'green' : 'red'} className="ml-auto">
            Score: {score}/{questions.length}
          </Badge>
        )}
      </div>

      {/* Questions */}
      {questions.map((q, qi) => {
        const chosen = answers[qi]
        const isDone = chosen !== undefined

        return (
          <div
            key={q.id}
            className="rounded-2xl border p-5"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-sm font-semibold mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
              Q{qi + 1}: {q.question}
            </p>

            <div className="space-y-2.5">
              {q.options.map((opt, oi) => {
                let bg = 'var(--bg3)'
                let border = 'var(--border)'
                let color = 'var(--text2)'

                if (isDone) {
                  if (oi === q.correctIndex) {
                    bg = 'rgba(16,185,129,0.1)'; border = '#10b981'; color = '#10b981'
                  } else if (oi === chosen) {
                    bg = 'rgba(239,68,68,0.08)'; border = '#ef4444'; color = '#ef4444'
                  }
                }

                return (
                  <button
                    key={oi}
                    onClick={() => answer(qi, oi)}
                    disabled={isDone}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all',
                      !isDone && 'hover:bg-white/5 hover:border-blue-500/40'
                    )}
                    style={{ background: bg, borderColor: border, color }}
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'var(--border)', color: 'var(--text2)' }}
                    >
                      {['A', 'B', 'C', 'D'][oi]}
                    </span>
                    {opt}
                    {isDone && oi === q.correctIndex && <span className="ml-auto">✅</span>}
                    {isDone && oi === chosen && oi !== q.correctIndex && <span className="ml-auto">❌</span>}
                  </button>
                )
              })}
            </div>

            {isDone && (
              <div
                className="mt-4 rounded-xl px-4 py-3 text-xs leading-relaxed"
                style={{ background: 'var(--bg3)', color: 'var(--text2)' }}
              >
                💡 {q.explanation}
              </div>
            )}
          </div>
        )
      })}

      {allDone && (
        <div className="text-center pt-2">
          <button
            onClick={reset}
            className="text-sm font-semibold px-5 py-2.5 rounded-xl border transition-all hover:bg-white/5"
            style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}
          >
            🔄 Retry Quiz
          </button>
        </div>
      )}
    </div>
  )
}
