'use client'
import { useRef, MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { Zap, Layers, Target } from 'lucide-react'

// Custom SVG glass icon with light diffraction
function GlassIcon({ color, glowColor, children }: { color: string; glowColor: string; children: React.ReactNode }) {
  return (
    <div className="relative w-16 h-16 mx-auto mb-6">
      {/* Outer diffraction ring */}
      <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <linearGradient id={`diff-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={color} stopOpacity="0.7" />
            <stop offset="40%"  stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="70%"  stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.5" />
          </linearGradient>
          <filter id={`blur-${color}`}>
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>
        {/* Hexagon glass shape */}
        <polygon
          points="32,4 56,18 56,46 32,60 8,46 8,18"
          fill="none"
          stroke={`url(#diff-${color})`}
          strokeWidth="1"
          opacity="0.8"
        />
        <polygon
          points="32,10 50,21 50,43 32,54 14,43 14,21"
          fill={color}
          fillOpacity="0.06"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }}
      >
        {children}
      </div>
    </div>
  )
}

const cards = [
  {
    icon: Zap,
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.5)',
    border: 'rgba(6,182,212,0.25)',
    title: 'استذكار نشط متكامل',
    body: 'تحويل التلاخيص والسلايدات الجافة إلى بطاقات ذكية (Flashcards) تعزز الحفظ السريع والفهم العميق للمادة الأكاديمية.',
    topLine: 'from-transparent via-cyan-500 to-transparent',
    topGlow: 'rgba(6,182,212,1)',
  },
  {
    icon: Layers,
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.5)',
    border: 'rgba(129,140,248,0.25)',
    title: 'محاكاة دقيقة للامتحانات',
    body: 'توليد أسئلة اختيار من متعدد (MCQ) بمستوى كليات تكنولوجيا المعلومات لتدريب الطلاب على نمط الاختبارات الرسمية خالية من الأخطاء.',
    topLine: 'from-transparent via-indigo-400 to-transparent',
    topGlow: 'rgba(129,140,248,1)',
  },
  {
    icon: Target,
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.5)',
    border: 'rgba(167,139,250,0.25)',
    title: 'شروحات وتغذية فورية',
    body: 'تقديم تحليل فوري لكل إجابة مع شرح بيداغوجي مدعوم بالذكاء الاصطناعي لضمان فهم أسباب الخطأ ومعالجتها بلحظتها.',
    topLine: 'from-transparent via-violet-400 to-transparent',
    topGlow: 'rgba(167,139,250,1)',
  },
]

function RefractionCard({ card, index }: { card: typeof cards[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const Icon = card.icon

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    ref.current.style.setProperty('--glow-x', `${x}%`)
    ref.current.style.setProperty('--glow-y', `${y}%`)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.15, duration: 0.7, ease: 'easeOut' }}
      className="glass-refraction p-8 group"
      style={{ willChange: 'transform' }}
    >
      {/* Top glow line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r ${card.topLine} opacity-50 group-hover:opacity-100 transition-opacity duration-500`}
        style={{ boxShadow: `0 0 16px ${card.topGlow}` }}
      />

      <GlassIcon color={card.color} glowColor={card.glow}>
        <Icon size={26} color={card.color} strokeWidth={1.5} />
      </GlassIcon>

      <h3
        className="text-xl font-bold text-white text-center mb-4"
        style={{ lineHeight: 1.7 }}
      >
        {card.title}
      </h3>
      <p
        className="text-slate-400 text-sm text-center font-light"
        style={{ lineHeight: 2.0 }}
      >
        {card.body}
      </p>
    </motion.div>
  )
}

export default function CapabilityCards() {
  return (
    <section className="container mx-auto px-6 md:px-12 py-20 relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-violet-400 mb-4 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10">
          قدرات النظام
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ lineHeight: 1.6 }}>
          تقنية متطورة، نتائج استثنائية
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <RefractionCard key={i} card={card} index={i} />
        ))}
      </div>
    </section>
  )
}
