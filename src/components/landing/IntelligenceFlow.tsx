'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Upload, Database, Brain, GraduationCap } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    label: 'رفع الملف الأكاديمي',
    sub: 'سحب وإفلات ملخصاتك الأكاديمية (PDF) ليتم معالجتها محلياً بأعلى درجات الأمان السرعة.',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.5)',
  },
  {
    icon: Database,
    label: 'التحليل الرقمي الذكي',
    sub: 'استخراج النصوص وهيكلة البيانات لربطها بمحرك الموديلات المتسلسل (MODEL_CHAIN) الخاص بنا.',
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.5)',
  },
  {
    icon: Brain,
    label: 'توليد مختبر البطاقات',
    sub: 'بناء كروت المراجعة والأسئلة الذكية بناءً على اختيارك (الوضع الكلاسيكي أو وضع الامتحان).',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.5)',
  },
  {
    icon: GraduationCap,
    label: 'بدء التقييم التفاعلي',
    sub: 'خوض تجربة اختبار متكاملة بـ واجهات زجاجية نيونية تقدم لك تصحيحاً تفاعلياً ومباشراً.',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.5)',
  },
]

export default function IntelligenceFlow() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative py-24 px-6 md:px-12">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-cyan-400 mb-4 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10">
          رحلة الذكاء الاصطناعي
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-relaxed">
          كيف يعمل النظام؟
        </h2>
        <p className="text-slate-400 mt-4 text-base md:text-lg max-w-xl mx-auto" style={{ lineHeight: 1.9 }}>
          من رفع المستند إلى اختبار ذكي — في ثوانٍ
        </p>
      </motion.div>

      {/* Desktop flow */}
      <div className="hidden md:block relative max-w-5xl mx-auto">
        {/* SVG connecting lines */}
        <svg
          className="absolute top-1/2 left-0 right-0 w-full -translate-y-1/2 pointer-events-none"
          height="4"
          style={{ zIndex: 0 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.line
              key={i}
              x1={`${12.5 + i * 25}%`} y1="2"
              x2={`${37.5 + i * 25}%`} y2="2"
              stroke={`url(#grad${i})`}
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ delay: 0.4 + i * 0.35, duration: 0.7, ease: 'easeOut' }}
            />
          ))}
          <defs>
            <linearGradient id="grad0" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative grid grid-cols-4 gap-6 z-10">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ delay: i * 0.2, duration: 0.6, type: 'spring', stiffness: 120 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Node */}
                <div className="relative">
                  {/* Pulse ring */}
                  {inView && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: `1.5px solid ${step.color}` }}
                      animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.4, ease: 'easeOut' }}
                    />
                  )}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}20, ${step.color}08)`,
                      border: `1px solid ${step.color}40`,
                      boxShadow: `0 0 24px ${step.glow}`,
                    }}
                  >
                    {/* Diffraction shimmer */}
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: `linear-gradient(135deg, transparent 30%, ${step.color}40 50%, transparent 70%)`,
                      }}
                    />
                    <Icon size={28} color={step.color} strokeWidth={1.5} style={{ filter: `drop-shadow(0 0 6px ${step.glow})` }} />
                  </div>
                  {/* Step number */}
                  <div
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: step.color, boxShadow: `0 0 8px ${step.glow}` }}
                  >
                    {i + 1}
                  </div>
                </div>

                {/* Label */}
                <div className="text-center">
                  <p className="text-white font-semibold text-sm" style={{ lineHeight: 1.7 }}>{step.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{step.sub}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="md:hidden flex flex-col gap-5 max-w-xs mx-auto">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex items-center gap-4 glass-refraction p-4"
            >
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{
                  background: `${step.color}18`,
                  border: `1px solid ${step.color}40`,
                  boxShadow: `0 0 16px ${step.glow}`,
                }}
              >
                <Icon size={22} color={step.color} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm" style={{ lineHeight: 1.7 }}>{step.label}</p>
                <p className="text-slate-500 text-xs">{step.sub}</p>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="absolute -bottom-3 right-8 w-px h-3"
                  style={{ background: `linear-gradient(to bottom, ${step.color}, transparent)` }}
                />
              )}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
