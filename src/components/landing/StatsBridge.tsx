'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1800
    const step = 16
    const increment = target / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, step)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString('ar-EG')}{suffix}</span>
}

const stats = [
  { value: 100,  suffix: '+', label: 'ملف تم معالجته',  color: 'from-cyan-400 to-cyan-600',   glow: 'rgba(6,182,212,0.4)' },
  { value: 5000, suffix: '+', label: 'سؤال ذكي',        color: 'from-blue-400 to-indigo-500',  glow: 'rgba(99,102,241,0.4)' },
  { value: 99,   suffix: '%', label: 'دقة RAG',          color: 'from-violet-400 to-purple-600', glow: 'rgba(139,92,246,0.4)' },
]

export default function StatsBridge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="stats-bridge mx-auto max-w-4xl px-6 py-6 shimmer-sweep relative overflow-hidden"
    >
      <div className="grid grid-cols-3 divide-x divide-white/10 rtl:divide-x-reverse">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            className="flex flex-col items-center gap-1 px-4 py-2"
          >
            <span
              className={`text-3xl md:text-4xl font-bold bg-gradient-to-b ${s.color} bg-clip-text text-transparent`}
              style={{ filter: `drop-shadow(0 0 12px ${s.glow})`, lineHeight: 1.3 }}
            >
              <AnimatedCounter target={s.value} suffix={s.suffix} />
            </span>
            <span className="text-xs md:text-sm text-slate-400 font-medium tracking-wide text-center" style={{ lineHeight: 1.6 }}>
              {s.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
