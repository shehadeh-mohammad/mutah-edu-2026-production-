'use client'

import { useEffect, useRef, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import Image from 'next/image'
import AppShell from '@/components/layout/AppShell'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'
import { getAllCourses } from '@/services/dataService'
import { Sparkles, Activity, FileText, Zap, X, Loader2, AlertCircle, Send, User, Bot, ChevronDown, ArrowLeft } from 'lucide-react'

const THINKING_PHRASES = [
    'Analyzing core module context...',
    'Accessing localized knowledge base...',
    'Synthesizing dynamic explanation...',
    'Parsing pedagogical constraints...'
]

const GlassCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bento-card p-4 md:p-6 rounded-3xl backdrop-blur-3xl bg-white/40 dark:bg-slate-900/60 border border-white/20 shadow-[0_0_20px_rgba(34,211,238,0.1)] dark:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300 ${className}`}>
        {children}
    </div>
)

type ChatMessage = {
    id: string
    role: 'user' | 'model'
    text: string
    isTyping?: boolean
}

// ─── Which tab the Guided Trippers modal opens with ───────────────────────────
type GuidedAction = 'summary' | 'flashcards'

export default function AIAssistantDashboard() {
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [isTyping, setIsTyping] = useState(false)
    const rafHandle = useRef<number | null>(null)

    const [thinkingStatus, setThinkingStatus] = useState('')
    const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // ── Quick-action AI response modal ───────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalTitle, setModalTitle] = useState('')
    const [aiText, setAiText] = useState('')
    const [isModalLoading, setIsModalLoading] = useState(false)
    const [modalError, setModalError] = useState<string | null>(null)

    // ── Guided Trippers modal (course-selector) ───────────────────────────────
    const [isGuidedOpen, setIsGuidedOpen] = useState(false)
    const [guidedAction, setGuidedAction] = useState<GuidedAction>('summary')
    const [selectedCourseId, setSelectedCourseId] = useState('')

    const allCourses = getAllCourses()

    // ── Inline chat ──────────────────────────────────────────────────────────
    const [chatInput, setChatInput] = useState('')
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
    const [isInlineLoading, setIsInlineLoading] = useState(false)

    useEffect(() => {
        const stored = sessionStorage.getItem('global_chat_session_history');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setChatHistory(parsed);
                }
            } catch (err) {
                console.error("Failed to parse chat history from session storage", err);
            }
        }
    }, []);

    useEffect(() => {
        if (chatHistory.length > 0) {
            sessionStorage.setItem('global_chat_session_history', JSON.stringify(chatHistory));
        }
    }, [chatHistory]);

    const startTypewriter = (fullText: string) => {
        if (thinkingIntervalRef.current) { clearInterval(thinkingIntervalRef.current); thinkingIntervalRef.current = null }
        setThinkingStatus('')
        setIsTyping(true)
        setAiText('')
        if (rafHandle.current) cancelAnimationFrame(rafHandle.current)
        let i = 0
        const tick = () => {
            i = Math.min(i + 4, fullText.length)
            setAiText(fullText.substring(0, i))
            if (i < fullText.length) { rafHandle.current = requestAnimationFrame(tick) }
            else { rafHandle.current = null; setIsTyping(false) }
        }
        rafHandle.current = requestAnimationFrame(tick)
    }

    const handleQuickAction = async (prompt: string, title: string) => {
        setModalTitle(title); setIsModalOpen(true); setIsModalLoading(true); setModalError(null); setAiText('')
        const pick = () => THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)]
        setThinkingStatus(pick())
        thinkingIntervalRef.current = setInterval(() => setThinkingStatus(pick()), 1800)
        if (rafHandle.current) { cancelAnimationFrame(rafHandle.current); rafHandle.current = null }
        try {
            const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
            const json = await res.json()
            if (!res.ok || !json.success) throw new Error(json.errorCode ?? json.error ?? 'ERROR')
            startTypewriter(json.data)
        } catch (err: any) {
            const code = err?.message ?? ''
            if (code === 'OVERLOADED') setModalError('جميع نماذج الذكاء الاصطناعي مشغولة حالياً. يرجى المحاولة بعد 30 ثانية.')
            else if (code === 'RATE_LIMIT') setModalError('تجاوزت عدد الطلبات المسموح به. يرجى الانتظار دقيقة.')
            else setModalError('عذراً، حدث خطأ غير متوقع في الاتصال.')
        } finally {
            if (thinkingIntervalRef.current) { clearInterval(thinkingIntervalRef.current); thinkingIntervalRef.current = null }
            setThinkingStatus(''); setIsModalLoading(false)
        }
    }

    // ── Open Guided Trippers modal (intercept context-less actions) ───────────
    const openGuided = (action: GuidedAction) => {
        setGuidedAction(action)
        setSelectedCourseId(allCourses[0]?.id ?? '')
        setIsGuidedOpen(true)
    }

    // ── Navigate to the selected course with tab pre-selected via query param ─
    const handleGuidedConfirm = () => {
        if (!selectedCourseId) return
        setIsGuidedOpen(false)
        // Pass the desired tab as a query param so CourseClient can activate it on mount
        router.push(`/courses/${selectedCourseId}?tab=${guidedAction}`)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        if (rafHandle.current) { cancelAnimationFrame(rafHandle.current); rafHandle.current = null }
        if (thinkingIntervalRef.current) { clearInterval(thinkingIntervalRef.current); thinkingIntervalRef.current = null }
        setThinkingStatus(''); setAiText(''); setModalError(null); setIsModalLoading(false)
    }

    useEffect(() => {
        if (!scrollContainerRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
        if (scrollHeight - scrollTop - clientHeight < 120) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [chatHistory, isInlineLoading])

    const startInlineTypewriter = (messageId: string, fullText: string) => {
        if (thinkingIntervalRef.current) { clearInterval(thinkingIntervalRef.current); thinkingIntervalRef.current = null }
        setThinkingStatus('')
        let i = 0
        const tick = () => {
            i = Math.min(i + 4, fullText.length)
            setChatHistory(prev => prev.map(msg => msg.id === messageId ? { ...msg, text: fullText.substring(0, i) } : msg))
            if (i < fullText.length) { rafHandle.current = requestAnimationFrame(tick) }
            else { setChatHistory(prev => prev.map(msg => msg.id === messageId ? { ...msg, isTyping: false } : msg)); rafHandle.current = null }
        }
        rafHandle.current = requestAnimationFrame(tick)
    }

    const handleInlineSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!chatInput.trim() || isInlineLoading) return
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput }
        setChatHistory(prev => [...prev, userMsg])
        const prompt = chatInput
        setChatInput('')
        setIsInlineLoading(true)
        const pick = () => THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)]
        setThinkingStatus(pick())
        thinkingIntervalRef.current = setInterval(() => setThinkingStatus(pick()), 1800)
        const modelMsgId = (Date.now() + 1).toString()
        setChatHistory(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isTyping: true }])
        try {
            const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
            const json = await res.json()
            if (!res.ok || !json.success) throw new Error(json.errorCode ?? 'ERROR')
            startInlineTypewriter(modelMsgId, json.data)
        } catch (err: any) {
            const code = err?.message ?? ''
            let errText = 'عذراً، حدث خطأ في الاتصال.'
            if (code === 'OVERLOADED') errText = 'جميع نماذج الذكاء مشغولة حالياً ⚡'
            if (code === 'RATE_LIMIT') errText = 'تجاوزت عدد الطلبات ⏳'
            setChatHistory(prev => prev.map(msg => msg.id === modelMsgId ? { ...msg, text: errText, isTyping: false } : msg))
        } finally {
            if (thinkingIntervalRef.current) { clearInterval(thinkingIntervalRef.current); thinkingIntervalRef.current = null }
            setThinkingStatus(''); setIsInlineLoading(false)
        }
    }

    // ── TASK 2: Direct prompt injector ───────────────────────────────────────
    // Bypasses the FormEvent requirement by wiring directly into the same
    // chat pipeline as handleInlineSubmit — no mock data, no context errors.
    const handleDirectPrompt = async (prompt: string) => {
        if (isInlineLoading) return
        // Mirror user message into the thread so it feels natural
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: prompt }
        setChatHistory(prev => [...prev, userMsg])
        setChatInput('')
        setIsInlineLoading(true)
        const pick = () => THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)]
        setThinkingStatus(pick())
        thinkingIntervalRef.current = setInterval(() => setThinkingStatus(pick()), 1800)
        const modelMsgId = (Date.now() + 1).toString()
        setChatHistory(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isTyping: true }])
        try {
            const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
            const json = await res.json()
            if (!res.ok || !json.success) throw new Error(json.errorCode ?? 'ERROR')
            startInlineTypewriter(modelMsgId, json.data)
        } catch (err: any) {
            const code = err?.message ?? ''
            let errText = 'عذراً، حدث خطأ في الاتصال.'
            if (code === 'OVERLOADED') errText = 'جميع نماذج الذكاء مشغولة حالياً ⚡'
            if (code === 'RATE_LIMIT') errText = 'تجاوزت عدد الطلبات ⏳'
            setChatHistory(prev => prev.map(msg => msg.id === modelMsgId ? { ...msg, text: errText, isTyping: false } : msg))
        } finally {
            if (thinkingIntervalRef.current) { clearInterval(thinkingIntervalRef.current); thinkingIntervalRef.current = null }
            setThinkingStatus(''); setIsInlineLoading(false)
        }
    }

    useEffect(() => {
        if (containerRef.current) {
            const cards = containerRef.current.querySelectorAll('.bento-card')
            const ctx = gsap.context(() => {
                gsap.fromTo(cards, { opacity: 0, y: 30, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', stagger: 0.1 })
            }, containerRef)
            return () => ctx.revert()
        }
    }, [])

    return (
        <AppShell title="المساعد الأكاديمي الذكي لجامعة مؤتة">
            {/* ── Rigid mobile viewport — overflow-hidden prevents body scroll bleed ── */}
            <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">

                {/* ── Shrinkable header + quick actions ── */}
                {chatHistory.length === 0 && (
                    <div ref={containerRef} className="shrink-0 px-3 pt-2 pb-1 sm:px-6 sm:pt-3 sm:pb-2">

                    {/* ── TASK 1: Hero Welcome Card — smaller on mobile ── */}
                    <GlassCard className="bg-gradient-to-br from-blue-100/60 to-indigo-100/50 dark:from-cyan-900/40 dark:to-emerald-900/30 overflow-hidden relative">
                        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-blue-400/20 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
                        {/* Mobile: column-stack; md+: side-by-side */}
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-8" dir="rtl">
                            <div className="flex-1">
                                <span className="text-[10px] md:text-xs font-bold text-pink-600/80 dark:text-pink-400/80 tracking-wider">POWERED BY MUTAH CIS AI ENGINE</span>
                                {/* TASK 1: scale text and padding down on mobile */}
                                <h2 className="text-lg md:text-2xl lg:text-4xl font-black text-slate-900 dark:text-white leading-snug mt-1 mb-1 md:mt-2 md:mb-2">
                                    مرحباً بك في{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-500 to-blue-600 dark:from-cyan-400 dark:to-emerald-400">المساعد الأكاديمي الذكي</span>
                                </h2>
                                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium max-w-lg leading-relaxed hidden sm:block">
                                    اسألني أي سؤال في مساقاتك، أو استخدم الإجراءات السريعة أدناه.
                                </p>
                            </div>
                            <div className="flex-shrink-0 hidden lg:block">
                                <div className="rounded-full overflow-hidden bg-gradient-to-tr from-cyan-500/10 to-pink-500/10 border border-white/10 flex items-center justify-center p-2">
                                    <Image src="/assets/MU.ai.logo/MU.ai.logoo.png" alt="Mutah AI" width={100} height={100} className="w-24 object-contain" priority />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* ── TASK 1: Quick actions — horizontal swipe bar on ALL viewports ── */}
                    {/* flex overflow-x-auto whitespace-nowrap scrollbar-none ensures single-row
                        swipeable layout on mobile, preventing wrapping or clipping */}
                    <div className="flex overflow-x-auto whitespace-nowrap gap-2 px-1 pb-2 pt-2 scrollbar-none" dir="rtl">
                        {[
                            {
                                label: 'تلخيص مادة',
                                icon: Zap,
                                iconClass: 'text-pink-600 dark:text-cyan-400',
                                cardClass: 'dark:bg-cyan-900/20 dark:border-cyan-500/20',
                                // TASK 3: intercept — open guided modal instead of firing a context-less prompt
                                action: () => openGuided('summary'),
                            },
                            {
                                label: 'كويز تجريبي',
                                icon: FileText,
                                iconClass: 'text-cyan-600 dark:text-pink-400',
                                cardClass: 'dark:bg-rose-900/20 dark:border-rose-500/20',
                                // TASK 3: intercept — open guided modal instead of firing a context-less prompt
                                action: () => openGuided('flashcards'),
                            },
                            {
                                label: 'نصائح الدراسة',
                                icon: Sparkles,
                                iconClass: 'text-violet-600 dark:text-violet-400',
                                cardClass: 'dark:bg-violet-900/20 dark:border-violet-500/20',
                                // TASK 2: direct prompt injection — no context dependency, no modal
                                action: () => handleDirectPrompt('أهلاً بك! اعطيني أهم 5 نصائح ذهبية ومجربة لتنظيم الوقت والدراسة بذكاء لتخصصي التقني.'),
                            },
                            {
                                label: 'شرح مفهوم',
                                icon: Activity,
                                iconClass: 'text-emerald-600 dark:text-emerald-400',
                                cardClass: 'dark:bg-emerald-900/20 dark:border-emerald-500/20',
                                // TASK 2: direct prompt injection — no context dependency, no modal
                                action: () => handleDirectPrompt('اشرح لي مفهوماً برمجياً أو معمارية معقدة في علوم الحاسوب بأسلوب مبسط وشيق مع مثال عملي.'),
                            },
                        ].map(({ label, icon: Icon, iconClass, cardClass, action }) => (
                            <button
                                key={label}
                                onClick={action}
                                // TASK 1: smaller size on mobile, standard on md+
                                className={`bento-card inline-flex flex-shrink-0 items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2.5 rounded-2xl bg-[#f8fafc]/80 border border-slate-200 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 cursor-pointer transition-all hover:scale-105 ${cardClass}`}
                            >
                                <Icon size={14} className={`${iconClass} flex-shrink-0`} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                )}

                {/* ── Chat history — scrolls independently (flex-1 overflow-y-auto) ── */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-6 pt-2 pb-2">
                    {chatHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-60 gap-3" dir="rtl">
                            <Bot size={44} className="text-cyan-500" />
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">مرحباً! أنا المساعد الأكاديمي الذكي.</p>
                            <p className="text-xs text-slate-500">اكتب سؤالك أدناه أو استخدم الإجراءات السريعة فوق.</p>
                        </div>
                    ) : (
                        <div className="space-y-5 pt-2 pb-4" dir="rtl">
                            {chatHistory.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`flex gap-3 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className="flex-shrink-0 mt-1">
                                            {msg.role === 'user' ? (
                                                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center border border-blue-200 dark:border-blue-500/30">
                                                    <User size={16} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-100 to-pink-100 dark:from-cyan-900/40 dark:to-pink-900/40 flex items-center justify-center border border-cyan-200 dark:border-cyan-500/30">
                                                    <Sparkles size={16} className="text-pink-600 dark:text-cyan-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-[14px] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-md' : 'bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'}`}>
                                            {msg.isTyping && !msg.text ? (
                                                <>
                                                    {isInlineLoading && thinkingStatus && (
                                                        <div key={thinkingStatus} className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2 bg-cyan-500/10 border border-cyan-500/20">
                                                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                                                            <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 animate-pulse">{thinkingStatus}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-1.5 items-center h-5 px-2">
                                                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
                                                        <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                                                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="font-medium leading-relaxed min-w-0 max-w-full overflow-hidden" style={{ direction: 'rtl' }}>
                                                    <MarkdownRenderer content={msg.text + (msg.isTyping ? ' ▍' : '')} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    )}
                </div>

                {/* ── Sticky input — anchored to bottom, keyboard-isolated ── */}
                <div className="sticky bottom-0 bg-slate-950/95 dark:bg-slate-950/98 z-40 border-t border-white/5 px-3 pb-[max(16px,env(safe-area-inset-bottom,16px))] pt-3 sm:px-6 shrink-0">
                    <form
                        onSubmit={handleInlineSubmit}
                        className="bento-card relative flex items-center gap-3 p-2 pl-4 rounded-2xl bg-white dark:bg-slate-900/95 backdrop-blur-3xl border border-slate-200 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_40px_rgba(6,182,212,0.15)] focus-within:ring-2 focus-within:ring-cyan-500/50 transition-all"
                        dir="rtl"
                    >
                        <button type="submit" disabled={!chatInput.trim() || isInlineLoading} className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                            {isInlineLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="-ml-1" />}
                        </button>
                        {/* font-size:16px prevents iOS Safari auto-zoom on focus */}
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="اسأل المساعد الذكي أي سؤال بخصوص مساقاتك..."
                            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base"
                            style={{ fontSize: '16px' }}
                            disabled={isInlineLoading}
                        />
                    </form>
                    <p className="text-center text-[11px] font-bold text-slate-400 dark:text-slate-600 mt-2">
                        مساعد مؤتة الأكاديمي قد يرتكب بعض الأخطاء. يرجى التحقق من المعلومات الهامة.
                    </p>
                </div>
            </div>

            {/* ─── AI Response Modal (Quick Actions — general prompts) ─────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md" onClick={closeModal}>
                    <div className="bg-white/95 dark:bg-[#0a0f1e]/95 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.2)] relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 to-pink-500" />
                        <button onClick={closeModal} className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors z-10">
                            <X size={20} className="text-slate-500 dark:text-slate-400" />
                        </button>
                        <div className="p-4 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-cyan-100 dark:from-pink-900/40 dark:to-cyan-900/40 flex items-center justify-center border border-pink-200 dark:border-pink-500/30">
                                    <Sparkles className="text-pink-500 dark:text-cyan-400" size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white" dir="rtl">{modalTitle}</h3>
                            </div>
                            <div dir="rtl" className="min-h-[180px] p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap leading-relaxed text-[15px] flex flex-col">
                                {isModalLoading && (
                                    <div className="flex flex-col items-center justify-center flex-1 gap-4 py-6">
                                        <div className="relative">
                                            <Loader2 size={36} className="animate-spin text-cyan-500" />
                                            <div className="absolute inset-0 rounded-full blur-md bg-cyan-400/30 animate-pulse" />
                                        </div>
                                        {thinkingStatus ? (
                                            <div key={thinkingStatus} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                                                <span className="text-sm font-bold text-cyan-700 dark:text-cyan-400 animate-pulse">{thinkingStatus}</span>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-bold text-slate-400 dark:text-slate-500">يفكر المساعد الذكي...</p>
                                        )}
                                    </div>
                                )}
                                {modalError && !isModalLoading && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
                                        <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">عذراً، حدث خطأ في الاتصال</p>
                                            <p className="text-xs text-red-500/80 break-words">{modalError}</p>
                                        </div>
                                    </div>
                                )}
                                {!isModalLoading && !modalError && (
                                    <div className="min-w-0 max-w-full overflow-hidden">
                                        <MarkdownRenderer content={aiText + (isTyping ? ' ▍' : '')} />
                                    </div>
                                )}
                            </div>
                            {!isModalLoading && (
                                <div className="mt-6 flex justify-between items-center">
                                    <button onClick={closeModal} className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-transform">
                                        <Sparkles size={14} />
                                        تأكيد ومتابعة
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Guided Trippers Modal — fully dark glass, no light-mode bleed ── */}
            {isGuidedOpen && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
                    onClick={() => setIsGuidedOpen(false)}
                >
                    <div
                        className="relative w-full max-w-md rounded-3xl overflow-hidden
                                   bg-slate-950/90 backdrop-blur-xl
                                   border border-white/10
                                   shadow-[0_24px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* TASK 1: Accent top bar — color-coded per action */}
                        <div className={`absolute top-0 inset-x-0 h-[2px] ${guidedAction === 'summary'
                            ? 'bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500'
                            : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400'}`}
                        />
                        {/* Ambient glow behind the bar */}
                        <div className={`absolute top-0 inset-x-0 h-24 pointer-events-none opacity-20 ${guidedAction === 'summary'
                            ? 'bg-gradient-to-b from-violet-600 to-transparent'
                            : 'bg-gradient-to-b from-amber-500 to-transparent'}`}
                        />

                        {/* TASK 1: Close button — dark-safe */}
                        <button
                            onClick={() => setIsGuidedOpen(false)}
                            className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors z-10"
                            aria-label="إغلاق"
                        >
                            <X size={16} className="text-slate-300" />
                        </button>

                        <div className="p-6 sm:p-8 relative z-10" dir="rtl">

                            {/* TASK 1: Header — white text, strict contrast */}
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                                    guidedAction === 'summary'
                                        ? 'bg-violet-500/15 border-violet-500/30'
                                        : 'bg-amber-500/15 border-amber-500/30'
                                }`}>
                                    {guidedAction === 'summary'
                                        ? <Zap size={20} className="text-violet-400" />
                                        : <FileText size={20} className="text-amber-400" />}
                                </div>
                                <div>
                                    {/* TASK 1: header must be text-white */}
                                    <h3 className="text-lg font-black text-white">
                                        {guidedAction === 'summary' ? 'تلخيص مادة' : 'كويز تجريبي'}
                                    </h3>
                                    {/* TASK 1: subtitle uses text-slate-400 for readable contrast */}
                                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                                        اختر المساق لتحميل السياق الأكاديمي الكامل
                                    </p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/[0.07] my-5" />

                            {/* TASK 1: Label — text-slate-300 for crisp readability on dark */}
                            <label className="block text-[13px] font-black text-slate-300 mb-3">
                                أي مساق تريد تحميله في بيئة الذكاء الاصطناعي الآن؟
                            </label>

                            {/* ── TASK 1: Course dropdown — dark-native styling ── */}
                            <div className="relative">
                                <select
                                    id="guided-course-select"
                                    value={selectedCourseId}
                                    onChange={e => setSelectedCourseId(e.target.value)}
                                    className="w-full appearance-none pr-4 pl-10 py-3 rounded-xl text-sm font-bold
                                               bg-slate-900 border border-white/10
                                               text-white
                                               outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30
                                               transition-all cursor-pointer"
                                    dir="rtl"
                                >
                                    {allCourses.map(course => (
                                        <option key={course.id} value={course.id}
                                            className="bg-slate-900 text-white">
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                />
                            </div>

                            {/* TASK 1: Info note — text-slate-400, highlighted span text-slate-200 */}
                            <p className="text-[11px] font-medium text-slate-400 mt-3 leading-relaxed">
                                سيتم توجيهك إلى صفحة المساق وتفعيل تبويب{' '}
                                <span className="font-bold text-slate-200">
                                    {guidedAction === 'summary' ? 'الملخص الذكي' : 'الكويز'}
                                </span>{' '}
                                مباشرةً مع السياق الحقيقي للمحتوى.
                            </p>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3 mt-6">
                                <button
                                    onClick={handleGuidedConfirm}
                                    disabled={!selectedCourseId}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] ${
                                        guidedAction === 'summary'
                                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 shadow-violet-500/30'
                                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/30'
                                    }`}
                                >
                                    <ArrowLeft size={16} />
                                    انتقل للمساق
                                </button>
                                {/* Cancel — dark glass surface */}
                                <button
                                    onClick={() => setIsGuidedOpen(false)}
                                    className="px-5 py-3.5 rounded-2xl font-bold text-sm text-slate-300 border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    )
}
