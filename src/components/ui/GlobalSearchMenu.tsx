'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { Search, X, BookOpen, Clock, Activity, Command, Zap } from 'lucide-react'
import { searchAll, getChapterById } from '@/services/dataService'

const SUGGESTION_CATEGORIES = [
    {
        title: 'مواد دراسية',
        items: [
            { id: 'cs101', title: 'علم الحاسوب', icon: BookOpen, color: 'text-blue-500', path: '/majors/cs' },
            { id: 'se201', title: 'هندسة البرمجيات', icon: Activity, color: 'text-violet-500', path: '/majors/software-engineering' }
        ]
    },
    {
        title: 'ملخصات ذكية',
        items: [
            { id: 'cy101', title: 'مراجعة أمن المعلومات', icon: Clock, color: 'text-amber-500', path: '/courses/cy101' }
        ]
    },
    {
        title: 'فلاش كاردز',
        items: [
            { id: 'db_flash', title: 'قواعد البيانات (الفصل 1)', icon: Zap, color: 'text-pink-500', path: '/courses/cis401' }
        ]
    }
]

export default function GlobalSearchMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const overlayRef = useRef<HTMLDivElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
            if (e.key === 'Escape') setIsOpen(false)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        if (query.length > 1) {
            setResults(searchAll(query))
        } else {
            setResults([])
        }
    }, [query])

    useEffect(() => {
        if (isOpen) {
            gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' })
            gsap.fromTo(modalRef.current, { y: -50, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.2)' })
            setTimeout(() => inputRef.current?.focus(), 100)
        } else {
            gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.2 })
            gsap.to(modalRef.current, { y: -20, opacity: 0, scale: 0.95, duration: 0.2 })
            setQuery('')
        }
    }, [isOpen])

    if (!isOpen && typeof window !== 'undefined') return null

    const handleSelect = (path: string) => {
        setIsOpen(false)
        router.push(path)
    }

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[5vh] md:pt-[10vh] bg-slate-900/40 dark:bg-black/60 backdrop-blur-2xl invisible"
            onClick={(e) => {
                if (e.target === e.currentTarget) setIsOpen(false)
            }}
        >
            <div
                ref={modalRef}
                dir="rtl"
                className="w-full max-w-2xl bg-white/90 dark:bg-[#0a0f1e]/90 border border-slate-200 dark:border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[80vh]"
            >
                {/* Input Area */}
                <div className="flex items-center gap-4 p-5 border-b border-slate-200 dark:border-white/10">
                    <Search size={22} className="text-slate-400 dark:text-slate-500" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="ابحث عن مساقات، فصول، أدوات..."
                        className="flex-1 bg-transparent border-none outline-none text-base md:text-xl font-bold text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 scroller">
                    {query.length > 1 ? (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 px-2">النتائج</h4>
                            {results.length > 0 ? (
                                results.map((res, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleSelect(
                                            res.type === 'course' ? `/courses/${res.slug || res.id}` :
                                            res.type === 'major' ? `/majors/${res.id}` :
                                            `/courses/${res.courseSlug || getChapterById(res.id)?.courseId}?chapter=${res.id}`
                                        )}
                                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50/80 hover:text-blue-700 dark:hover:bg-cyan-900/30 cursor-pointer transition-colors group border border-transparent hover:border-blue-200 dark:hover:border-cyan-800"
                                    >
                                        <BookOpen size={18} className="text-slate-400 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-cyan-400" />
                                        <div>
                                            <div className="font-bold text-[14px] text-slate-950 dark:text-slate-200">{res.title}</div>
                                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-500">{res.type === 'major' ? 'تخصص' : res.type === 'course' ? 'مساق رئيسي' : 'فصل دراسي'}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                                    <span className="block text-4xl mb-2">🤔</span>
                                    لا توجد نتائج مطابقة لـ &quot;{query}&quot;
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {SUGGESTION_CATEGORIES.map((category, catIdx) => (
                                <div key={catIdx}>
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 px-2">{category.title}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {category.items.map((item, i) => (
                                            <div
                                                key={i}
                                                onClick={() => handleSelect(item.path)}
                                                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/10 hover:shadow-sm cursor-pointer transition-all"
                                            >
                                                <div className={`w-10 h-10 rounded-xl bg-white dark:bg-black/40 shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center ${item.color}`}>
                                                    <item.icon size={18} />
                                                </div>
                                                <span className="font-bold text-[13px] text-slate-900 dark:text-slate-200">{item.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center px-5">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        للإغلاق <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-sans leading-none">ESC</kbd>
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        للبحث <span className="flex items-center gap-0.5"><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-sans leading-none"><Command size={10} /></kbd> <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-sans leading-none">K</kbd></span>
                    </span>
                </div>
            </div>
        </div>
    )
}
