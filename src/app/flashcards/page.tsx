'use client'

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'
import AppShell from '@/components/layout/AppShell'
import FlashcardViewer from '@/components/flashcards/FlashcardViewer'
import { getAllFlashcardSets, getChapterById, getCourseById } from '@/services/dataService'
import { Badge } from '@/components/ui/index'
import Link from 'next/link'
import type { Flashcard } from '@/types'
import { Upload, FileText, Sparkles, AlertCircle, RotateCcw, Brain, Lightbulb, CheckCircle, XCircle } from 'lucide-react'

// ─── AI-Generated Flashcard Type ──────────────────────────────────────────────
interface AIFlashcard extends Flashcard {
  category: string
  options?: string[]
  explanation?: string
}

// ─── Category badge colors ─────────────────────────────────────────────────────
const CATEGORY_STYLES: Record<string, string> = {
  Definition: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Concept:    'bg-violet-500/10 text-violet-300 border-violet-500/20',
  Logic:      'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  Algorithm:  'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Theory:     'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  Fact:       'bg-amber-500/10 text-amber-300 border-amber-500/20',
}

// ─── Skeleton shimmer while loading ───────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 overflow-hidden animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite]" />
      <div className="h-3 w-20 rounded-full bg-white/10 mb-5" />
      <div className="h-4 w-3/4 rounded-full bg-white/10 mb-3" />
      <div className="h-3 w-1/2 rounded-full bg-white/[0.07]" />
    </div>
  )
}

// ─── AI Upload Zone ────────────────────────────────────────────────────────────
function PDFUploadZone({ onGenerated }: { onGenerated: (cards: AIFlashcard[], mode: 'classic' | 'exam') => void }) {
  const [isDragging, setIsDragging]   = useState(false)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [fileName, setFileName]       = useState<string | null>(null)
  const [generationMode, setGenerationMode] = useState<'classic' | 'exam'>('classic')
  const inputRef                       = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')

    if (!file || !isPdf) {
      setError('الرجاء رفع ملف PDF صالح فقط.')
      return
    }
    setError(null)
    setFileName(file.name)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('mode', generationMode)

      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed to generate flashcards.')
      onGenerated(data.flashcards as AIFlashcard[], data.mode as 'classic' | 'exam')
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [onGenerated, generationMode])

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 1) {
      setError("الرجاء اختيار ملف واحد فقط في كل عملية ⚠️")
      setFileName(null)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
      return
    }

    const file = files?.[0]
    if (file) handleFile(file)
  }

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 1) {
      setError("الرجاء اختيار ملف واحد فقط في كل عملية ⚠️")
      setFileName(null)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
      return
    }

    const file = files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="mb-10">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500/[0.07] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-teal-500/[0.07] blur-[120px] rounded-full pointer-events-none" />

      {/* Mode Selector */}
      <div className="flex flex-wrap bg-white/[0.02] border border-white/10 rounded-xl p-1.5 mb-6 relative z-10 w-fit mx-auto" style={{ backdropFilter: 'blur(20px)' }}>
        <button
          onClick={() => !isLoading && setGenerationMode('classic')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
            generationMode === 'classic'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          الوضع الكلاسيكي
        </button>
        <button
          onClick={() => !isLoading && setGenerationMode('exam')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
            generationMode === 'exam'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-400/20 shadow-[0_0_15px_rgba(45,212,191,0.15)]'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
          }`}
        >
          <FileText className="w-4 h-4" />
          وضع الامتحان
        </button>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-6 md:p-12 flex flex-col items-center justify-center text-center transition-all duration-500 group
          ${isDragging
            ? 'border-indigo-400 bg-indigo-500/[0.08] scale-[1.01]'
            : 'border-white/[0.12] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
          } ${isLoading ? 'pointer-events-none' : ''}`}
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={onInputChange}
        />

        {isLoading ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center mb-6">
              <Brain className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            <p className="text-white text-lg font-semibold mb-2">جاري تحليل البيانات ذكائياً...</p>
            <p className="text-slate-400 text-sm">مساعد الذكاء الاصطناعي يحلل <span className="text-indigo-300 font-medium">{fileName}</span></p>
            <div className="mt-6 flex gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-6 rounded-full bg-indigo-500/40 animate-[bounce_1.2s_ease-in-out_infinite]"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </>
        ) : fileName && !error ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-400/20 flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-teal-400" />
            </div>
            <p className="text-white text-lg font-semibold mb-1">{fileName}</p>
            <p className="text-slate-400 text-sm">أفلت ملفًا آخر أو انقر للاستبدال</p>
          </>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-6 transition-all duration-500
              ${isDragging
                ? 'bg-indigo-500/20 border-indigo-400/40 scale-110'
                : 'bg-white/[0.04] border-white/10 group-hover:bg-indigo-500/10 group-hover:border-indigo-400/20'}`}>
              <Upload className={`w-7 h-7 transition-colors duration-500 ${isDragging ? 'text-indigo-300' : 'text-slate-400 group-hover:text-indigo-400'}`} />
            </div>
            <p className="text-white text-lg font-semibold mb-2">
              {isDragging ? 'أفلت الملف هنا' : 'ارفع ملف PDF لإنشاء البطاقات'}
            </p>
            <p className="text-slate-400 text-sm mb-4">اسحب وأفلت ملخصاتك أو سلايداتك (بصيغة PDF فقط)</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>الحد الأقصى 10 ميجابايت • PDF فقط</span>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-3 p-4 rounded-2xl bg-rose-500/[0.08] border border-rose-500/20 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// ─── AI-Generated Flashcard Viewer ────────────────────────────────────────────
function AIFlashcardViewer({ cards, mode, onReset }: { cards: AIFlashcard[]; mode: 'classic' | 'exam'; onReset: () => void }) {
  const [index, setIndex]   = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({})

  const card = cards[index]
  const currentSelected = selectedOptions[index]

  const prev = () => { setIndex((index - 1 + cards.length) % cards.length); setFlipped(false) }
  const next = () => { setIndex((index + 1) % cards.length); setFlipped(false) }

  const handleOptionClick = (e: React.MouseEvent, opt: string) => {
    e.stopPropagation()
    if (!currentSelected) {
      setSelectedOptions(prevOpts => ({ ...prevOpts, [index]: opt }))
    }
  }

  return (
    <div className="relative">
      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-white text-xl font-bold">AI-Generated Flashcards</h3>
          <p className="text-slate-400 text-sm mt-0.5">{cards.length} cards generated from your PDF</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-300 px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
        >
          <RotateCcw className="w-4 h-4" />
          Upload New PDF
        </button>
      </div>

      {/* The flip card */}
      <div className={`flashcard-scene mb-10 w-full max-w-2xl mx-auto ${mode === 'exam' ? 'h-[350px] md:h-[520px]' : 'h-[280px] md:h-[350px]'}`}>
        <div
          className={`flashcard-card cursor-pointer ${flipped ? 'is-flipped' : ''}`}
          onClick={() => setFlipped(!flipped)}
        >
          {/* Front */}
          <div className="flashcard-face rounded-3xl border border-white/10 flex flex-col p-4 sm:p-6 md:p-10 text-center overflow-y-auto"
            style={{ background: 'rgba(11,15,25,0.85)', backdropFilter: 'blur(24px)' }}>
            <span className="absolute top-5 left-0 right-0 flex justify-center">
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${CATEGORY_STYLES[card.category] ?? 'bg-white/5 text-slate-400 border-white/10'}`}>
                {card.category}
              </span>
            </span>
            <span className="absolute top-4 right-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {index + 1} / {cards.length}
            </span>
            <div className="flex flex-col items-center w-full h-full mt-10 pb-12">
              <p className={`${mode === 'exam' ? 'text-lg mb-8' : 'text-xl'} font-semibold leading-relaxed text-white`}>{card.question}</p>
              
              {card.options && card.options.length > 0 && (
                <div className="w-full flex flex-col gap-y-4 text-left mt-2 flex-grow">
                  {card.options.map((opt, idx) => {
                    const isSelected = currentSelected === opt
                    const isCorrect = opt === card.answer
                    const showFeedback = !!currentSelected
                    
                    let bgStyle = "bg-white/[0.04] border-white/10"
                    let textStyle = "text-slate-200"
                    let icon = null

                    if (showFeedback) {
                      if (isCorrect) {
                        bgStyle = "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                        textStyle = "text-emerald-300"
                        icon = <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      } else if (isSelected) {
                        bgStyle = "bg-rose-500/10 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                        textStyle = "text-rose-300"
                        icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      }
                    }

                    return (
                      <button 
                        key={idx} 
                        onClick={(e) => handleOptionClick(e, opt)}
                        disabled={showFeedback}
                        className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-md shadow-sm transition-all duration-300 w-full text-left cursor-pointer ${bgStyle} ${!showFeedback ? 'hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5' : 'cursor-default'}`}
                      >
                        <span className={`text-sm leading-snug font-medium ${textStyle}`}>{opt}</span>
                        {icon}
                      </button>
                    )
                  })}
                </div>
              )}
              
              <span className="text-white/40 text-sm mt-auto pt-6 tracking-wide">
                اضغط على البطاقة لرؤية الشرح والتوضيح
              </span>
            </div>
          </div>

          {/* Back */}
          <div className="flashcard-face flashcard-back rounded-3xl flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 text-center overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(45,212,191,0.12))',
              border: '1px solid rgba(99,102,241,0.3)',
              backdropFilter: 'blur(32px)'
            }}>
            
            {mode === 'exam' ? (
              <>
                <span className="absolute top-5 text-[10px] font-bold uppercase tracking-widest text-teal-400">Correct Answer</span>
                <div className="text-lg font-bold text-teal-300 mb-5 px-6 py-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 shadow-[0_0_20px_rgba(45,212,191,0.15)] text-center">
                  {card.answer}
                </div>
                {card.explanation && (
                  <div className="flex flex-col items-center mt-2 w-full max-w-lg">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Explanation</span>
                    <p className="text-sm leading-relaxed text-teal-50/90 text-center bg-black/20 p-5 rounded-2xl border border-white/5 shadow-inner">
                      {card.explanation}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="absolute top-5 text-[10px] font-bold uppercase tracking-widest text-indigo-400">Answer</span>
                <p className="text-lg leading-relaxed text-blue-200 max-w-lg">{card.answer}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button onClick={prev}
          className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300">
          ←
        </button>
        <div className="flex gap-1.5">
          {cards.map((_, i) => (
            <button key={i} onClick={() => { setIndex(i); setFlipped(false) }}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === index ? 20 : 8, height: 8,
                background: i === index ? 'rgb(99,102,241)' : 'rgba(255,255,255,0.1)'
              }}
            />
          ))}
        </div>
        <button onClick={next}
          className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300">
          →
        </button>
      </div>

      {/* Skeleton grid preview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => { setIndex(i); setFlipped(false) }}
            className={`text-left p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
              i === index
                ? 'border-indigo-400/40 bg-indigo-500/[0.08]'
                : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
            }`}
          >
            <span className={`text-[9px] font-bold uppercase tracking-wider mb-2 block px-2 py-0.5 rounded-full border w-fit ${CATEGORY_STYLES[c.category] ?? 'text-slate-500 border-white/10'}`}>
              {c.category}
            </span>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{c.question}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function FlashcardsHubPage() {
  const [aiCards, setAiCards]     = useState<AIFlashcard[] | null>(null)
  const [aiMode, setAiMode]       = useState<'classic' | 'exam'>('classic')
  const [isLoading, setIsLoading] = useState(false)
  const sets = getAllFlashcardSets()

  const handleGenerated = (cards: AIFlashcard[], mode: 'classic' | 'exam') => {
    setAiCards(cards)
    setAiMode(mode)
  }

  return (
    <AppShell title="Flashcards">
      <div className="relative">
        {/* Page header */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-black text-slate-950 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
            مولّد البطاقات الذكية 🃏
          </h2>
          <p className="text-[13px] mt-1.5 font-bold text-slate-800 dark:text-[#94a3b8]">
            راجع المفاهيم الأساسية من خلال رفع ملفات الـ PDF الدراسية.
          </p>
        </div>

        {/* ─── AI Generation Section ─────────────────────────────────────── */}
        <div className="relative rounded-3xl border border-white/10 bg-[#0B0F19]/60 p-4 md:p-8 mb-10 overflow-hidden"
          style={{ backdropFilter: 'blur(24px)' }}>

          {/* Section label */}
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-white font-semibold text-sm tracking-wide">مولّد البطاقات الذكية بالذكاء الاصطناعي</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 font-bold uppercase tracking-wider ml-1">
              Beta
            </span>
          </div>

          {aiCards ? (
            <AIFlashcardViewer cards={aiCards} mode={aiMode} onReset={() => setAiCards(null)} />
          ) : (
            <PDFUploadZone onGenerated={handleGenerated} />
          )}

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}
        </div>

        {/* ─── Existing Flashcard Sets ───────────────────────────────────── */}
        <div className="mb-4">
          <h3 className="text-white font-semibold mb-4">Course Flashcard Sets</h3>
        </div>

        {sets.length === 0 ? (
          <div className="text-center py-20 text-slate-600 dark:text-[#94a3b8]">
            <span className="text-5xl block mb-4">🃏</span>
            <p className="text-sm font-semibold">No flashcard sets available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sets.map((set) => {
              const chapter = getChapterById(set.chapterId)
              const course = chapter ? getCourseById(chapter.courseId) : null

              return (
                <Link
                  key={set.chapterId}
                  href={`/flashcards/${set.chapterId}`}
                  className="flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 bg-white border-slate-300 shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:border-indigo-600 dark:bg-[rgba(10,15,30,0.5)] dark:border-white/10 dark:shadow-none dark:hover:border-white/20 group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.08))', border: '1px solid rgba(99,102,241,0.3)' }}
                  >
                    🃏
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black transition-colors duration-300 text-slate-950 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-400">
                      {chapter?.title ?? set.chapterId}
                    </p>
                    <p className="text-[12px] mt-0.5 font-bold text-slate-800 dark:text-[#94a3b8]">
                      {course?.title ?? ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge color="violet">{set.cards.length} cards</Badge>
                    <span className="text-xs font-black transition-colors duration-300 text-slate-900 group-hover:text-indigo-700 dark:text-slate-300 dark:group-hover:text-indigo-400">
                      Study →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
