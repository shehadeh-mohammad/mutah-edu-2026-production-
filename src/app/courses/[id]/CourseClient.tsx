/// <reference types="styled-jsx" />
'use client'

import { useState, useEffect, useRef, useCallback, FormEvent, useMemo } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AppShell from '@/components/layout/AppShell'
import { Course } from '@/types/course'
import { Badge } from '@/components/ui/index'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'
import { PlayCircle, CheckCircle, Clock, BookOpen, Presentation, Video, Sparkles, Layers, FileText, Download, ChevronLeft, ChevronRight, RotateCw, Loader2, MessageSquare, Send, User, Bot, AlertCircle, SkipForward, Menu, X, VideoOff } from 'lucide-react'

// ─── Thinking-status phrase bank ──────────────────────────────────────────────
const THINKING_PHRASES = [
    'Analyzing core module context...',
    'Accessing localized knowledge base...',
    'Synthesizing dynamic explanation...',
    'Parsing pedagogical constraints...',
    'Cross-referencing lecture transcript...',
    'Calibrating semantic precision...',
    'Evaluating conceptual dependencies...',
    'Mapping instructional pathways...',
    'Distilling academic insights...',
    'Resolving knowledge graph edges...',
    'Structuring response schema...',
    'Applying contextual reasoning layer...',
]


const setSafeLocalStorage = (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, value);
    } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e?.message?.toLowerCase().includes('quota')) {
            console.warn('LocalStorage quota exceeded. Clearing old summary caches...');
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('summary_cache_')) {
                    keysToRemove.push(k);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            try {
                localStorage.setItem(key, value);
            } catch (retryErr) {
                console.error('Failed to save to localStorage after clearing caches', retryErr);
            }
        } else {
            console.error('LocalStorage error:', e);
        }
    }
}

import { useRouter } from 'next/navigation'

type ChatMessage = {
    id: string
    role: 'user' | 'model'
    text: string
    isTyping?: boolean
}

export default function CourseClient({ course: courseData }: { course: Course }) {
    const router = useRouter()
    const chapters = courseData.chapters
    const course = {
        ...courseData,
        title: courseData.nameArabic,
        majorId: courseData.majorId || 'software-engineering',
        level: 'Year 3',
        instructor: 'Faculty'
    };

    const [activeChapterIndex, setActiveChapterIndex] = useState(0)
    const activeChapterRaw = chapters?.[activeChapterIndex] || chapters?.[0]

    // Adapt the new minimal schema to the existing UI layout seamlessly
    const activeChapter = useMemo(() => {
        return activeChapterRaw ? {
            ...activeChapterRaw,
            id: activeChapterRaw.id,
            title: activeChapterRaw.titleArabic,
            videoUrl: activeChapterRaw.youtubeUrl || activeChapterRaw.localVideoPath,
            videoId: null, // Let the robust regex below extract it from vUrl
            pdfUrl: activeChapterRaw.pdfDriveUrl,
            resource: { url: activeChapterRaw.pdfDriveUrl, name: 'Lecture Document', size: 'PDF' },
            description: activeChapterRaw.aiContextSummary,
            slidesTitle: 'Lecture Slides',
            transcript: activeChapterRaw.transcript,
            aiContextSummary: activeChapterRaw.aiContextSummary
        } : null;
    }, [activeChapterRaw]);

    const [activeTab, setActiveTab] = useState<'chapters' | 'summary' | 'flashcards' | 'chat'>('chapters')

    // AI Caches
    const [summaryCache, setSummaryCache] = useState<Record<string, string>>({})
    const [flashcardCache, setFlashcardCache] = useState<Record<string, { front: string, back: string }[]>>({})
    const [chatCache, setChatCache] = useState<Record<string, ChatMessage[]>>({})

    // Local States
    const [summaryState, setSummaryState] = useState<'idle' | 'loading' | 'active'>('idle')
    const [currentSummary, setCurrentSummary] = useState('')
    const [summaryError, setSummaryError] = useState<string | null>(null)

    const [flashcardState, setFlashcardState] = useState<'idle' | 'loading' | 'active'>('idle')
    const [currentFlashcards, setCurrentFlashcards] = useState<{ front: string, back: string }[]>([])
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [flashcardError, setFlashcardError] = useState<string | null>(null)

    const [chatInput, setChatInput] = useState('')
    const [currentChat, setCurrentChat] = useState<ChatMessage[]>([])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadError, setDownloadError] = useState<string | null>(null)
    const [summaryIsTyping, setSummaryIsTyping] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    // Tracks which message IDs are still animating (for skip button)
    const [typingMsgIds, setTypingMsgIds] = useState<Set<string>>(new Set())
    // Thinking-status indicator state
    const [thinkingStatus, setThinkingStatus] = useState('')
    const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)
    // True when the user has manually scrolled up — pauses auto-scroll
    const userScrolledUp = useRef(false)

    // RAF-based typewriter: animates in chunks of `chunkSize` chars per frame
    const rafHandle = useRef<number | null>(null)
    const chatRafHandle = useRef<number | null>(null)
    const summaryFullText = useRef<string>('')

    useEffect(() => {
        // Reset states when chapter changes
        if (rafHandle.current) cancelAnimationFrame(rafHandle.current)
        if (chatRafHandle.current) cancelAnimationFrame(chatRafHandle.current)
        rafHandle.current = null
        chatRafHandle.current = null

        // Load summary from cache if exists

        let localSummary = null
        if (typeof window !== 'undefined' && activeChapter) {
            localSummary = localStorage.getItem(`summary_cache_${activeChapter.id}`)
        }
        if (localSummary) {
            setCurrentSummary(localSummary)
            setSummaryState('active')
        } else if (activeChapter && summaryCache[activeChapter.id]) {
            setCurrentSummary(summaryCache[activeChapter.id])
            setSummaryState('active')
        } else {
            setCurrentSummary('')
            setSummaryState('idle')
        }

        // Load flashcards from cache if exists
        if (activeChapter && flashcardCache[activeChapter.id]) {
            setCurrentFlashcards(flashcardCache[activeChapter.id])
            setCurrentFlashcardIndex(0)
            setIsFlipped(false)
            setFlashcardState('active')
        } else {
            setCurrentFlashcards([])
            setFlashcardState('idle')
        }

        // Load chat from cache if exists
        if (activeChapter && chatCache[activeChapter.id]) {
            setCurrentChat(chatCache[activeChapter.id])
        } else {
            setCurrentChat([])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChapterIndex, activeChapter?.id])

    // Smart auto-scroll: only fires if the user hasn't manually scrolled up
    useEffect(() => {
        if (activeTab === 'chat' && !userScrolledUp.current) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [currentChat, isChatLoading, activeTab])

    // Detect manual upward scroll and pause auto-scroll
    const handleChatScroll = useCallback(() => {
        if (!chatContainerRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
        const distFromBottom = scrollHeight - scrollTop - clientHeight
        // Within 80px of bottom → resume auto-scroll; further up → pause it
        userScrolledUp.current = distFromBottom > 80
    }, [])

    const fetchAI = async (prompt: string) => {
        const contextLines = [];
        if (activeChapter?.title) contextLines.push(`عنوان الفصل الحالي: ${activeChapter.title}`);
        if (activeChapter?.aiContextSummary) contextLines.push(`ملخص المحتوى: ${activeChapter.aiContextSummary}`);
        if (activeChapter?.transcript) contextLines.push(`المحتوى المرجعي من الفيديو: ${activeChapter.transcript}`);

        const context = contextLines.length > 0 ? `[السياق: ${contextLines.join(' | ')}]` : '';

        const finalPrompt = `${context}\n\n ${prompt}`

        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: finalPrompt }),
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error ?? 'حدث خطأ')
        return json.data
    }

    // Chunked RAF typewriter — updates in batches of `chunkSize` chars per animation frame.
    // This is dramatically more performant than setInterval(fn, 10) because:
    // 1. We update 4 chars at once → 75% fewer React re-renders.
    // 2. requestAnimationFrame is throttled by the browser to match display refresh rate.
    // 3. React.memo on MarkdownRenderer prevents re-parsing unchanged content.
    const startTypewriter = useCallback((
        fullText: string,
        onUpdate: (text: string) => void,
        onComplete: () => void,
        chunkSize = 4
    ) => {
        if (rafHandle.current) cancelAnimationFrame(rafHandle.current)
        let i = 0
        const tick = () => {
            i = Math.min(i + chunkSize, fullText.length)
            onUpdate(fullText.substring(0, i))
            if (i < fullText.length) {
                rafHandle.current = requestAnimationFrame(tick)
            } else {
                rafHandle.current = null
                onComplete()
            }
        }
        rafHandle.current = requestAnimationFrame(tick)
    }, [])

    // Immediately shows the full text, cancelling the animation
    const skipSummaryAnimation = useCallback(() => {
        if (rafHandle.current) {
            cancelAnimationFrame(rafHandle.current)
            rafHandle.current = null
        }
        setCurrentSummary(summaryFullText.current)
        setSummaryIsTyping(false)
        if (activeChapter) {
            setSummaryCache(prev => ({ ...prev, [activeChapter.id]: summaryFullText.current }))
            setSafeLocalStorage(`summary_cache_${activeChapter.id}`, summaryFullText.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChapter])

    const handleStartSummary = async () => {

        setSummaryState('loading')
        setSummaryError(null)
        setCurrentSummary('')
        try {
            const targetPdfUrl = activeChapter?.pdfUrl || activeChapter?.resource?.url;
            if (!targetPdfUrl) {
                if (activeChapter?.aiContextSummary) {
                    summaryFullText.current = activeChapter.aiContextSummary;
                    setSummaryState('active');
                    setSummaryIsTyping(true);
                    startTypewriter(activeChapter.aiContextSummary, setCurrentSummary, () => {
                        setSummaryIsTyping(false);
                        if (activeChapter) {
                            setSummaryCache(prev => ({ ...prev, [activeChapter.id]: activeChapter.aiContextSummary }))
                            setSafeLocalStorage(`summary_cache_${activeChapter.id}`, activeChapter.aiContextSummary)
                        }
                    });
                    return;
                } else {
                    throw new Error('لا يوجد ملف PDF متاح لهذا الفصل لكي يتم تلخيصه.');
                }
            }

            const prompt = `قم بتلخيص المحتوى بأسلوب أكاديمي احترافي باللغة العربية، مع التركيز على أهم 5 نقاط رئيسية. لا تذكر أنك تقوم بالتلخيص، فقط اعرض النقاط مباشرة.`

            const res = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pdfUrl: targetPdfUrl,
                    prompt,
                    // Passed for video/masterclass chapters with no physical PDF.
                    // The API will use this context to generate a summary if pdfUrl is a placeholder.
                    aiContext: {
                        title: activeChapter?.title,
                        summary: activeChapter?.aiContextSummary,
                        transcript: activeChapter?.transcript,
                    },
                }),
            })
            const json = await res.json()
            if (!res.ok || !json.success) throw new Error(json.error ?? 'حدث خطأ أثناء قراءة الملف.')

            const result = json.data;

            summaryFullText.current = result
            setSummaryState('active')
            setSummaryIsTyping(true)
            startTypewriter(result, setCurrentSummary, () => {
                setSummaryIsTyping(false)
                if (activeChapter) {
                    setSummaryCache(prev => ({ ...prev, [activeChapter.id]: result }))
                    setSafeLocalStorage(`summary_cache_${activeChapter.id}`, result)
                }
            })
        } catch (err: any) {
            const fallbackText = activeChapter?.aiContextSummary || activeChapter?.transcript;
            if (fallbackText) {
                setSummaryError(null);
                summaryFullText.current = fallbackText;
                setSummaryState('active');
                setSummaryIsTyping(true);
                startTypewriter(fallbackText, setCurrentSummary, () => {
                    setSummaryIsTyping(false);
                    if (activeChapter) {
                        setSummaryCache(prev => ({ ...prev, [activeChapter.id]: fallbackText }));
                        setSafeLocalStorage(`summary_cache_${activeChapter.id}`, fallbackText);
                    }
                });
            } else {
                const isNetworkError = err.message === 'Failed to fetch' || err.message?.includes('NetworkError');
                setSummaryError(isNetworkError ? 'تعذر الاتصال بالخادم. يرجى التحقق من الشبكة.' : (err.message || 'عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي.'));
                setSummaryState('idle');
            }
        }
    }

    const handleStartFlashcards = async () => {

        setFlashcardState('loading')
        setFlashcardError(null)
        try {
            const contextLines = [];
            if (activeChapter?.title) contextLines.push(`عنوان الفصل الحالي: ${activeChapter.title}`);
            if (activeChapter?.aiContextSummary) contextLines.push(`ملخص المحتوى: ${activeChapter.aiContextSummary}`);
            if (activeChapter?.transcript) contextLines.push(`المحتوى المرجعي من الفيديو: ${activeChapter.transcript}`);
            const context = contextLines.length > 0 ? `[السياق: ${contextLines.join(' | ')}]` : 'قم بتوليد أسئلة عامة عن تكنولوجيا المعلومات.';

            const res = await fetch('/api/flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: context, count: 3 }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.error ?? 'حدث خطأ أثناء توليد البطاقات.');

            const parsed = json.data;

            if (activeChapter) {
                setFlashcardCache(prev => ({ ...prev, [activeChapter.id]: parsed }))
            }
            setCurrentFlashcards(parsed)
            setCurrentFlashcardIndex(0)
            setIsFlipped(false)
            setFlashcardState('active')
        } catch (err: any) {
            const fallbackText = activeChapter?.aiContextSummary || activeChapter?.transcript || 'لم يتم العثور على ملخص إضافي.';
            const parsed = [{
                front: activeChapter?.title || 'ملخص الفصل (وضع عدم الاتصال)',
                back: fallbackText
            }];
            if (activeChapter) {
                setFlashcardCache(prev => ({ ...prev, [activeChapter.id]: parsed }))
            }
            setCurrentFlashcards(parsed)
            setCurrentFlashcardIndex(0)
            setIsFlipped(false)
            setFlashcardState('active')
        }
    }

    const handleChatSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!chatInput.trim() || isChatLoading) return

        const userMsgId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`
        const userMsg: ChatMessage = { id: userMsgId, role: 'user', text: chatInput }
        const newChat = [...currentChat, userMsg]
        setCurrentChat(newChat)
        if (activeChapter) {
            setChatCache(prev => ({ ...prev, [activeChapter.id]: newChat }))
        }

        const prompt = chatInput
        setChatInput('')
        setIsChatLoading(true)

        // Start thinking-status cycling immediately on submit
        const pickPhrase = () => THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)]
        setThinkingStatus(pickPhrase())
        thinkingIntervalRef.current = setInterval(() => setThinkingStatus(pickPhrase()), 1800)

        const modelMsgId = `model-${Date.now()}-${Math.random().toString(36).substring(7)}`
        const modelMsg: ChatMessage = { id: modelMsgId, role: 'model', text: '', isTyping: true }
        setCurrentChat(prev => [...prev, modelMsg])

        try {
            const result = await fetchAI(`أنت مساعد ذكي مخصص لمساعدة الطالب في فهم هذا الفيديو. أجب عن هذا السؤال بناءً على المحتوى المرفق: ${prompt}`)

            // Response has arrived — kill the thinking indicator immediately (zero-latency safe)
            if (thinkingIntervalRef.current) { clearInterval(thinkingIntervalRef.current); thinkingIntervalRef.current = null }
            setThinkingStatus('')

            // Track this message as currently animating
            setTypingMsgIds(prev => new Set(prev).add(modelMsgId))

            const completeMsg = () => {
                setCurrentChat(prev => {
                    const finalChat = prev.map(msg =>
                        msg.id === modelMsgId ? { ...msg, text: result, isTyping: false } : msg
                    )
                    if (activeChapter) setChatCache(c => ({ ...c, [activeChapter.id]: finalChat }))
                    return finalChat
                })
                setTypingMsgIds(prev => { const s = new Set(prev); s.delete(modelMsgId); return s })
                chatRafHandle.current = null
                setIsChatLoading(false)
            }

            let i = 0
            const chunkSize = 4
            const tick = () => {
                i = Math.min(i + chunkSize, result.length)
                const slice = result.substring(0, i)
                setCurrentChat(prev => prev.map(msg =>
                    msg.id === modelMsgId ? { ...msg, text: slice } : msg
                ))
                if (i < result.length) {
                    chatRafHandle.current = requestAnimationFrame(tick)
                } else {
                    completeMsg()
                }
            }
            chatRafHandle.current = requestAnimationFrame(tick)
        } catch (err: any) {
            if (thinkingIntervalRef.current) { clearInterval(thinkingIntervalRef.current); thinkingIntervalRef.current = null }
            setThinkingStatus('')
            const fallbackText = activeChapter?.aiContextSummary || activeChapter?.transcript || 'عذراً، حدث خطأ في الاتصال. إليك ملخص الدرس بدلاً من ذلك.';
            
            // Track this message as currently animating
            setTypingMsgIds(prev => new Set(prev).add(modelMsgId))
            
            const completeMsg = () => {
                setCurrentChat(prev => {
                    const finalChat = prev.map(msg =>
                        msg.id === modelMsgId ? { ...msg, text: fallbackText, isTyping: false } : msg
                    )
                    if (activeChapter) setChatCache(c => ({ ...c, [activeChapter.id]: finalChat }))
                    return finalChat
                })
                setTypingMsgIds(prev => { const s = new Set(prev); s.delete(modelMsgId); return s })
                chatRafHandle.current = null
                setIsChatLoading(false)
            }
            
            let i = 0
            const chunkSize = 4
            const tick = () => {
                i = Math.min(i + chunkSize, fallbackText.length)
                const slice = fallbackText.substring(0, i)
                setCurrentChat(prev => prev.map(msg =>
                    msg.id === modelMsgId ? { ...msg, text: slice } : msg
                ))
                if (i < fallbackText.length) {
                    chatRafHandle.current = requestAnimationFrame(tick)
                } else {
                    completeMsg()
                }
            }
            chatRafHandle.current = requestAnimationFrame(tick)
        }
    }

    const nextFlashcard = () => {
        setIsFlipped(false)
        setTimeout(() => {
            setCurrentFlashcardIndex(prev => Math.min(prev + 1, currentFlashcards.length - 1))
        }, 150)
    }

    const prevFlashcard = () => {
        setIsFlipped(false)
        setTimeout(() => {
            setCurrentFlashcardIndex(prev => Math.max(prev - 1, 0))
        }, 150)
    }

    const handleDownload = (url: string, filename: string) => {
        if (!url) return;
        setIsDownloading(true);
        setDownloadError(null);
        try {
            if (url.startsWith('http://') || url.startsWith('https://') || url.includes('drive.google.com')) {
                // Open external links (e.g. Google Drive) in a new tab to download/view
                window.open(url, '_blank', 'noopener,noreferrer');
            } else {
                // Trigger local download via proxy API route to bypass IDM
                const apiUrl = `/api/download?fileUrl=${encodeURI(url)}&fileName=${encodeURIComponent(filename || 'download.pdf')}`;
                window.location.href = apiUrl;
            }
        } catch (error: any) {
            console.error('Download failed:', error);
            setDownloadError('فشل التحميل. حاول مرة أخرى.');
        } finally {
            // Give a slight delay before hiding the spinner
            setTimeout(() => setIsDownloading(false), 1500);
        }
    }

    if (!chapters?.length) {
        return (
            <AppShell title={course.title}>
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <div className="glass-ultra p-12 flex flex-col items-center justify-center text-center max-w-lg w-full relative overflow-hidden group">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 opacity-60 shadow-[0_0_25px_rgba(6,182,212,0.8)]" />
                        <BookOpen size={56} className="text-cyan-500 mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse" />
                        <h2 className="text-3xl font-black mb-4 gradient-text" dir="auto">محتوى هذا المساق قيد التجهيز</h2>
                        <p className="text-base font-medium leading-relaxed" style={{ color: 'var(--text2)' }} dir="auto">
                            نحن نعمل بجد لإعداد وإضافة أحدث الفيديوهات التعليمية قريباً. يرجى العودة لاحقاً لاستكمال رحلتك التعليمية!
                        </p>
                        <Link href={`/majors/${course.majorId}`} className="mt-8 px-8 py-3 rounded-xl border transition-all hover:bg-white/5 font-bold text-sm hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 dark:to-transparent" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                            العودة للتخصص
                        </Link>
                    </div>
                </div>
            </AppShell>
        )
    }

    return (
        <AppShell title={course?.title || 'Masterclass'}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => {
                            if (typeof window !== 'undefined' && window.history.length > 2) {
                                router.back()
                            } else {
                                router.push(course?.majorId ? `/majors/${course.majorId.split(',')[0]}` : '/dashboard')
                            }
                        }}
                        className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border transition-all hover:bg-white/5"
                        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text3)' }}
                    >
                        ← Back
                    </button>
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="lg:hidden p-2.5 mx-2 rounded-xl border transition-all hover:bg-cyan-500/10 flex items-center justify-center bg-cyan-500/5 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                        style={{ borderColor: 'rgba(6,182,212,0.3)' }}
                    >
                        <Bot size={20} className="text-cyan-500" />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <Badge color="blue">{course?.level || 'N/A'}</Badge>
                    <span className="text-sm font-bold tracking-wide" style={{ color: 'var(--text)' }}>
                        {course?.title || 'Unknown Course'}
                    </span>
                </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 h-auto lg:h-[calc(100vh-160px)]">

                <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="glass-ultra rounded-3xl overflow-hidden aspect-video relative shadow-2xl flex-shrink-0 bg-black">
                        {(() => {
                            // Pull from all possible sources to be resilient against field-name drift
                            const rawUrl = (activeChapter as any)?.videoUrl
                                || (activeChapterRaw as any)?.youtubeUrl
                                || (activeChapterRaw as any)?.videoUrl
                                || (activeChapterRaw as any)?.localVideoPath
                                || '';
                            const vUrl = typeof rawUrl === 'string' ? rawUrl.trim() : '';

                            const isYouTubeUrl = vUrl.includes('youtube.com') || vUrl.includes('youtu.be');

                            // Extract YouTube video ID — handles watch?v=, youtu.be/, embed/, and si= tracking params
                            let youtubeId: string | null = null;
                            if (isYouTubeUrl) {
                                // Try youtu.be short URL first: https://youtu.be/VIDEO_ID?si=...
                                const shortMatch = vUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
                                if (shortMatch) {
                                    youtubeId = shortMatch[1];
                                } else {
                                    // Try long URL: youtube.com/watch?v=VIDEO_ID or embed/VIDEO_ID
                                    const longMatch = vUrl.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/);
                                    if (longMatch) youtubeId = longMatch[1];
                                }
                            }

                            if (youtubeId) {
                                return (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${youtubeId}`}
                                        title={activeChapter?.title || 'Video'}
                                        className="absolute inset-0 w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                    ></iframe>
                                );
                            } else if (vUrl && !isYouTubeUrl) {
                                return (
                                    <video
                                        src={encodeURI(vUrl)}
                                        controls
                                        controlsList="nodownload"
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                );
                            } else {
                                return (
                                    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400">
                                        <VideoOff size={48} className="mb-4 opacity-50" />
                                        <p className="text-sm font-bold tracking-wide" dir="rtl">لا يوجد فيديو متاح لهذا الفصل حالياً</p>
                                    </div>
                                );
                            }
                        })()}
                    </div>

                    <div className="glass p-6 rounded-3xl shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 border" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                                <FileText className="text-cyan-500" size={24} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">ملحقات الفصل</h3>
                                {activeChapter?.resource ? (
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <span className="truncate max-w-[200px]" dir="ltr">{activeChapter.resource.name}</span>
                                        <span>•</span>
                                        <span>{activeChapter.resource.size}</span>
                                    </div>
                                ) : (
                                    <div className="text-xs font-medium text-slate-400 dark:text-slate-500">
                                        لا توجد ملفات مرفقة لهذا الفصل
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto shrink-0">
                            {(activeChapter?.pdfUrl || activeChapter?.resource?.url) && (
                                <button
                                    onClick={() => handleDownload(activeChapter?.pdfUrl || activeChapter?.resource?.url || '', activeChapter?.resource?.name || 'chapter.pdf')}
                                    disabled={isDownloading}
                                    className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all hover:scale-105 flex items-center justify-center gap-2 shrink-0 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-wait"
                                >
                                    {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                    {isDownloading ? 'جاري التحضير...' : 'تحميل'}
                                </button>
                            )}
                            {downloadError && (
                                <div className="text-red-500 text-[11px] font-bold flex items-center justify-center md:justify-end gap-1 animate-in fade-in slide-in-from-top-2 mt-1">
                                    <AlertCircle size={14} />
                                    <span>{downloadError}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass p-8 rounded-3xl flex-1 mb-6 flex flex-col justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold mb-3 gradient-text" dir="auto">
                                {activeChapter?.title || 'Untitlted Chapter'}
                            </h1>
                            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text2)' }} dir="auto">
                                {activeChapter?.description || 'No description available for this chapter.'}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-6">
                                {activeChapter?.slidesTitle && (
                                    <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border" style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                                        <Presentation size={16} className="text-violet-500" />
                                        <span dir="auto">{activeChapter.slidesTitle}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setActiveChapterIndex(Math.min(activeChapterIndex + 1, chapters.length - 1))}
                                disabled={activeChapterIndex === chapters.length - 1}
                                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                            >
                                {activeChapterIndex === chapters.length - 1 ? 'Course Completed 🎉' : 'Next Chapter →'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Drawer Overlay for Mobile */}
                {isDrawerOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsDrawerOpen(false)}
                    />
                )}
                {/* Masterclass Guide Drawer / Sidebar */}
                <div className={`fixed inset-y-0 left-0 w-[85vw] max-w-[360px] z-50 bg-slate-950 shadow-2xl transform transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:transform-none lg:w-auto lg:max-w-none lg:z-auto lg:bg-transparent glass rounded-r-3xl lg:rounded-3xl p-5 flex flex-col h-full overflow-hidden border-r lg:border`} style={{ borderColor: 'var(--border)' }}>

                    <div className="lg:hidden flex justify-end mb-4 shrink-0">
                        <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mb-4 shrink-0 bg-[var(--surface2)] p-1.5 rounded-2xl grid grid-cols-4 gap-1 border w-full" style={{ borderColor: 'var(--border)' }}>
                        <button
                            onClick={() => setActiveTab('chapters')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'chapters' ? 'bg-[var(--surface)] border border-[rgba(0,0,0,0.05)] dark:border-white/10 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-700 border border-transparent'}`}
                        >
                            <BookOpen size={16} />
                            الفصول
                        </button>
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'summary' ? 'bg-[var(--surface)] border border-[rgba(0,0,0,0.05)] dark:border-white/10 shadow-sm text-violet-600 dark:text-violet-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-700 border border-transparent'}`}
                        >
                            <FileText size={16} />
                            الملخص
                        </button>
                        <button
                            onClick={() => setActiveTab('flashcards')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'flashcards' ? 'bg-[var(--surface)] border border-[rgba(0,0,0,0.05)] dark:border-white/10 shadow-sm text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-700 border border-transparent'}`}
                        >
                            <Layers size={16} />
                            كويز
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'chat' ? 'bg-[var(--surface)] border border-[rgba(0,0,0,0.05)] dark:border-white/10 shadow-sm text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-700 border border-transparent'}`}
                        >
                            <MessageSquare size={16} />
                            دردشة
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col">

                        <div className={activeTab === 'chapters' ? 'block' : 'hidden'}>
                            <div className="mb-4 pb-4 border-b shrink-0 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                                <div>
                                    <h3 className="text-lg font-extrabold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                                        <BookOpen size={18} className="text-blue-500" />
                                        Masterclass Guide
                                    </h3>
                                    <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text3)' }}>
                                        {chapters?.length || 0} Modules • {course?.instructor || 'Faculty'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {chapters.map((ch, idx) => {
                                    const isActive = idx === activeChapterIndex;
                                    const isCompleted = idx < activeChapterIndex;

                                    return (
                                        <div
                                            key={ch.id}
                                            onClick={() => setActiveChapterIndex(idx)}
                                            className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${isActive
                                                ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)] dark:bg-blue-500/20'
                                                : 'hover:scale-[1.02] hover:ring-1 hover:ring-purple-500/50 border-transparent bg-[var(--surface)]'
                                                }`}
                                            style={{ borderColor: !isActive ? 'var(--border)' : '' }}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="mt-0.5 shrink-0">
                                                    {isActive ? (
                                                        <PlayCircle size={20} className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                                    ) : (
                                                        <Video size={20} style={{ color: isCompleted ? 'var(--text3)' : 'var(--text2)', opacity: isCompleted ? 0.4 : 1 }} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`text-sm font-bold relative inline-block ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} style={{ color: !isActive ? (isCompleted ? 'var(--text3)' : 'var(--text)') : '' }}>
                                                        {idx + 1}. {ch.titleArabic}
                                                        <span
                                                            className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] transition-all duration-700 ease-out"
                                                            style={{ width: isCompleted ? '100%' : '0%' }}
                                                        />
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className={`flex flex-col flex-1 items-center justify-center h-full min-h-full text-center py-2 relative w-full ${activeTab === 'summary' ? '' : 'hidden'}`}>
                            {summaryState === 'idle' && (
                                <>
                                    <div className="flex items-center justify-center mb-6 relative w-full h-32 md:h-40">
                                        <div className="absolute inset-0 bg-violet-500/10 rounded-full blur-2xl animate-pulse"></div>
                                        <Image src="/assets/MU.ai.logo/MU.ai.logoo.png" alt="Mutah AI Mascot" width={240} height={240} className="w-2/5 md:w-1/3 object-contain relative z-10 opacity-70 animate-[bounce_3s_infinite] drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]" priority />
                                    </div>
                                    <h3 className="text-xl font-extrabold mb-3" style={{ color: 'var(--text)' }}>الملخص الذكي</h3>
                                    <>
                                        <p className="text-sm font-medium mb-8 leading-relaxed" style={{ color: 'var(--text3)' }}>
                                            سيقوم محرك الذكاء الاصطناعي بتحليل وتلخيص المحتوى بذكاء لـ: <br />
                                            <strong className="text-violet-600 dark:text-violet-400 block mt-2">{activeChapter?.title}</strong>
                                        </p>
                                        {summaryError && <p className="text-red-500 text-xs mb-4">{summaryError}</p>}
                                        <button onClick={handleStartSummary} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)]">
                                            بدء التحليل الذكي ✨
                                        </button>
                                    </>
                                </>
                            )}

                            {summaryState === 'loading' && (
                                <div className="flex flex-col items-center justify-center h-full w-full animate-in fade-in duration-500">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl animate-ping"></div>
                                        <Loader2 size={48} className="text-violet-500 animate-spin relative z-10" />
                                    </div>
                                    <h3 className="text-lg font-bold text-violet-500 animate-pulse">جاري قراءة وتحليل الملف...</h3>
                                    <p className="text-sm mt-2 opacity-70" style={{ color: 'var(--text3)' }}>الذكاء الاصطناعي يقوم الآن بقراءة الـ PDF الفعلي واستخراج أهم النقاط</p>
                                </div>
                            )}

                            {summaryState === 'active' && (
                                <div className="flex flex-col w-full h-full animate-in fade-in zoom-in-95 duration-500 text-right">
                                    <div className="glass-ultra rounded-3xl p-6 flex-1 border border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.1)] relative overflow-hidden flex flex-col items-start text-start w-full mb-2">
                                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-violet-500 to-fuchsia-500 opacity-80" />
                                        <div className="text-xl font-bold mb-4 flex items-center gap-2 text-violet-600 dark:text-violet-400 shrink-0 w-full">
                                            <Sparkles size={20} />
                                            <span className="flex-1">الملخص الذكي</span>
                                            {summaryIsTyping && (
                                                <button
                                                    onClick={skipSummaryAnimation}
                                                    title="عرض الملخص كاملاً"
                                                    className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 px-2.5 py-1 rounded-lg transition-all"
                                                >
                                                    <SkipForward size={13} />
                                                    تخطي
                                                </button>
                                            )}
                                            {!summaryIsTyping && (
                                                <button
                                                    onClick={() => {
                                                        if (typeof window !== 'undefined' && activeChapter) {
                                                            localStorage.removeItem(`summary_cache_${activeChapter.id}`)
                                                        }
                                                        setSummaryCache(prev => { const n = { ...prev }; if (activeChapter) delete n[activeChapter.id]; return n; })
                                                        handleStartSummary()
                                                    }}
                                                    className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 px-2.5 py-1 rounded-lg transition-all"
                                                >
                                                    <RotateCw size={13} />
                                                    إعادة التلخيص 🔄
                                                </button>
                                            )}
                                        </div>
                                        <div className="bg-violet-500/5 rounded-2xl p-5 w-full flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar min-w-0">
                                            <div className="text-[15px] leading-relaxed font-medium w-full min-w-0" style={{ color: 'var(--text)' }} dir="auto">
                                                <MarkdownRenderer content={currentSummary + (summaryIsTyping ? ' ▍' : '')} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`flex flex-col flex-1 items-center justify-center h-full min-h-full text-center py-2 relative w-full ${activeTab === 'flashcards' ? '' : 'hidden'}`}>
                            {/* Ambient glows */}
                            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/[0.08] blur-[80px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 w-40 h-40 bg-teal-500/[0.08] blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative w-full flex-1 max-w-2xl min-h-[360px] rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 md:p-6 pb-6 flex flex-col justify-between items-center text-center shadow-2xl backdrop-blur-xl overflow-hidden mb-2">
                                {/* Noise/Grain Texture */}
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none rounded-3xl" />

                                {/* Top accent line */}
                                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]" />

                                {/* Top Content wrapper with flex-grow */}
                                <div className="flex flex-col items-center flex-grow w-full gap-y-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-400/20 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.15)] backdrop-blur-md shrink-0 mb-2 mt-2">
                                        <Sparkles size={24} className="text-indigo-600 dark:text-indigo-400 drop-shadow-md" />
                                    </div>

                                    <div className="text-center flex flex-col items-center relative z-10 w-full gap-y-3" dir="rtl" style={{ fontFamily: "'Tajawal', 'Cairo', sans-serif" }}>
                                        <h3 className="text-xl md:text-2xl text-slate-900 dark:text-white drop-shadow-sm font-extrabold tracking-tight">ارتقِ بمستوى معرفتك ✨</h3>

                                        <div className="flex flex-col items-center justify-center w-full gap-y-3 mb-2">
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-[340px]">
                                                حول محتوى الـ PDF الخاص بـ
                                            </p>
                                            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)] dark:shadow-[0_0_15px_rgba(99,102,241,0.2)] mx-auto max-w-full">
                                                <span className="text-indigo-600 dark:text-indigo-300 text-xs sm:text-sm font-bold tracking-wide truncate block" dir="ltr">
                                                    {activeChapter?.title}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-[340px]">
                                                إلى تجربة تعليمية تفاعلية. مختبرنا الذكي جاهز لتحليل بياناتك وإنشاء بطاقات مراجعة احترافية فوراً.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Anchored Button */}
                                <Link
                                    href="/flashcards"
                                    className="relative z-10 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-[15px] text-white transition-all duration-300
                                            bg-gradient-to-r from-indigo-600 to-violet-600
                                            hover:from-indigo-500 hover:to-violet-500
                                            shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
                                            hover:-translate-y-1 tracking-wide border border-white/10 active:scale-[0.98] shrink-0 mt-auto"
                                >
                                    <Sparkles size={18} />
                                    ابدأ مختبر البطاقات الذكية
                                </Link>
                            </div>
                        </div>

                        <div className={`flex flex-col h-full relative ${activeTab === 'chat' ? '' : 'hidden'}`}>
                            <>
                                <div ref={chatContainerRef} onScroll={handleChatScroll} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-2 space-y-4 mb-20 min-w-0" dir="rtl">
                                    {currentChat.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                                            <Bot size={40} className="text-cyan-500 mb-3" />
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">مرحباً! أنا المساعد الخاص بهذه المحاضرة.</p>
                                            <p className="text-xs text-slate-500 mt-1">هل لديك أي سؤال حول &quot;{activeChapter?.title}&quot;؟</p>
                                        </div>
                                    ) : (
                                        currentChat.map((msg) => (
                                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                                <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <div className="flex-shrink-0 mt-1">
                                                        {msg.role === 'user' ? (
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center border border-blue-200 dark:border-blue-500/30">
                                                                <User size={14} className="text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center border border-cyan-200 dark:border-cyan-500/30">
                                                                <Bot size={14} className="text-cyan-600 dark:text-cyan-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={`p-3.5 rounded-2xl text-[14px] min-w-0 max-w-full overflow-hidden ${msg.role === 'user'
                                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                                        : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none'
                                                        }`}>
                                                        {msg.isTyping && !msg.text ? (
                                                            <>
                                                                {/* Thinking-status label — only visible while isChatLoading is true */}
                                                                {isChatLoading && thinkingStatus && (
                                                                    <div
                                                                        key={thinkingStatus}
                                                                        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2 bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md"
                                                                    >
                                                                        {/* Pulsing orb */}
                                                                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)] shrink-0" />
                                                                        <span className="text-xs font-semibold tracking-wide text-cyan-700 dark:text-cyan-300 animate-pulse">
                                                                            {thinkingStatus}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {/* Three-dot bounce indicator */}
                                                                <div className="flex gap-1 items-center h-4 px-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce"></span>
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="leading-relaxed font-medium w-full min-w-0 overflow-hidden text-right">
                                                                <MarkdownRenderer content={msg.text + (msg.isTyping ? ' ▍' : '')} />
                                                                {typingMsgIds.has(msg.id) && (
                                                                    <button
                                                                        onClick={() => {
                                                                            if (chatRafHandle.current) cancelAnimationFrame(chatRafHandle.current)
                                                                            chatRafHandle.current = null
                                                                            // Force-complete this message
                                                                            setCurrentChat(prev => prev.map(m =>
                                                                                m.id === msg.id ? { ...m, text: msg.text, isTyping: false } : m
                                                                            ))
                                                                            setTypingMsgIds(prev => { const s = new Set(prev); s.delete(msg.id); return s })
                                                                            setIsChatLoading(false)
                                                                        }}
                                                                        className="mt-2 flex items-center justify-end gap-1 text-[11px] font-medium text-cyan-400/60 hover:text-cyan-400 transition-colors w-full"
                                                                    >
                                                                        <SkipForward size={11} />
                                                                        تخطي
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)] to-transparent pt-4 pb-[max(16px,env(safe-area-inset-bottom,24px))]">
                                    <form onSubmit={handleChatSubmit} className="relative flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] shadow-sm focus-within:ring-1 focus-within:ring-cyan-500/50" dir="rtl">
                                        <button
                                            type="submit"
                                            disabled={!chatInput.trim() || isChatLoading}
                                            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white disabled:opacity-50 transition-all"
                                        >
                                            {isChatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="-ml-0.5" />}
                                        </button>
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="اسأل عن المحاضرة..."
                                            className="flex-1 bg-transparent border-none outline-none text-[16px] lg:text-sm font-medium px-2"
                                            style={{ color: 'var(--text)' }}
                                            disabled={isChatLoading}
                                        />
                                    </form>
                                </div>
                            </>
                        </div>

                    </div>
                </div>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--scrollbar);
          border-radius: 4px;
        }
      `}</style>
        </AppShell>
    )
}
