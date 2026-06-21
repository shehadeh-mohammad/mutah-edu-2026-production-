'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, MouseEvent as ME, useState, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import StatsBridge from '@/components/landing/StatsBridge'
import IntelligenceFlow from '@/components/landing/IntelligenceFlow'
import CapabilityCards from '@/components/landing/CapabilityCards'

gsap.registerPlugin(ScrollTrigger)

/* ─── Desktop detection hook ──────────────────────────────────────────────── */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

/* ─── Magnetic CTA Button ─────────────────────────────────────────────────── */
function MagneticButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 })
  const sy = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 })

  const onMove = (e: ME<HTMLButtonElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.3)
    y.set((e.clientY - r.top - r.height / 2) * 0.3)
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy, willChange: 'transform' }}
      onMouseMove={onMove}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      onClick={onClick}
      className="relative px-10 py-4 rounded-2xl backdrop-blur-xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 transition-all duration-500 text-white font-semibold text-lg tracking-wider overflow-hidden group shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)]"
    >
      <span className="relative z-10">{children}</span>
      {/* Shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
    </motion.button>
  )
}

/* ─── 3-D Fanning Gallery ─────────────────────────────────────────────────── */
function FanningGallery() {
  const isDesktop = useIsDesktop()

  // ── Motion values for 3D parallax (desktop only) ────────────────────────
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 80, damping: 25 })
  const sy = useSpring(my, { stiffness: 80, damping: 25 })
  const rotX = useTransform(sy, [-200, 200], [12, -12])
  const rotY = useTransform(sx, [-200, 200], [-15, 15])

  // ── Programmatic autoplay — more reliable than JSX autoPlay attr ─────────
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    // Force play after mount; catch any autoplay-policy rejection silently
    vid.play().catch((err) => {
      console.warn('[HeroVideo] autoplay blocked or error:', err)
    })
  }, [])

  const onMove = (e: ME<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(e.clientX - r.left - r.width / 2)
    my.set(e.clientY - r.top - r.height / 2)
  }

  // ── Shared video element — identical on mobile and desktop ───────────────
  const HeroVideo = (
    <video
      ref={videoRef}
      // ?v=2 breaks the aggressive browser caching from the previous 500/404 errors
      src="/assets/dashbord_background/rag_engine.mp4?v=3"
      autoPlay
      loop={true}
      muted
      playsInline
      preload="auto"
      onError={(e) => console.error('[HeroVideo] load error:', e)}
      className="opacity-75 brightness-[1.15] contrast-[1.2] mix-blend-screen"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 'inherit',
        zIndex: 0,
      }}
    />
  )

  /* ── Mobile / tablet: flat layout ────────────────────────────────────── */
  if (!isDesktop) {
    return (
      <div className="relative w-full flex flex-col items-center gap-4 py-4">
        <div
          className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-cyan-400/30 bg-cyan-950/5"
          style={{
            aspectRatio: '16 / 10',
            boxShadow: '0 0 50px rgba(34,211,238,0.30)',
          }}
        >
          {HeroVideo}
          {/* Colour-grade overlay — lives above video, uses z-index not blend */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              zIndex: 1,
              background: 'linear-gradient(135deg, rgba(6,182,212,0.10) 0%, transparent 60%)',
            }}
          />
        </div>
        {/* Flat feature badges */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {[
            { label: 'الإحصائيات', emoji: '📊' },
            { label: 'المساعد الآلي', emoji: '💬' },
            { label: 'الاختبارات الذكية', emoji: '❓' },
            { label: 'المساقات', emoji: '📚' },
          ].map((p, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-white/10 bg-white/5"
            >
              <span className="text-xl">{p.emoji}</span>
              <p className="text-white font-bold text-xs text-center leading-snug">{p.label}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── Desktop: full 3D luxury physics ─────────────────────────────────── */
  return (
    <motion.div
      style={{ perspective: 1400, willChange: 'transform' }}
      onMouseMove={onMove}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      className="relative w-full h-[480px] lg:h-[620px] flex items-center justify-center cursor-crosshair"
    >
      <motion.div
        style={{
          rotateX: rotX,
          rotateY: rotY,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        className="relative w-full h-full flex items-center justify-center"
        layout
      >
        {/* Back panels */}
        {[
          { x: -300, ry: 40, z: -60, op: 0.75, label: 'الإحصائيات', emoji: '📊', col: 'blue' },
          { x: 300, ry: -40, z: -60, op: 0.75, label: 'المساعد الآلي', emoji: '💬', col: 'cyan' },
        ].map((p, i) => (
          <motion.div
            key={i}
            className="absolute z-10 w-[170px] h-[250px] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-5 shadow-2xl"
            style={{
              x: p.x, rotateY: p.ry, translateZ: p.z, opacity: p.op,
              background: 'rgba(10,18,40,0.72)',
              backdropFilter: 'blur(12px)',
              willChange: 'transform',
            }}
          >
            <div className={`w-10 h-10 rounded-xl bg-${p.col}-500/20 border border-${p.col}-500/40 mb-4 flex items-center justify-center text-lg`}>
              {p.emoji}
            </div>
            <p className="text-white font-bold text-sm mb-3 leading-relaxed">{p.label}</p>
            <div className="w-full h-1.5 bg-slate-700/40 rounded-full mb-2.5" />
            <div className="w-2/3 h-1.5 bg-slate-700/40 rounded-full" />
          </motion.div>
        ))}

        {/* Mid panels */}
        {[
          { x: -180, ry: 25, z: 20, label: 'الاختبارات الذكية', emoji: '❓', col: 'cyan' },
          { x: 180, ry: -25, z: 20, label: 'المساقات', emoji: '📚', col: 'blue' },
        ].map((p, i) => (
          <motion.div
            key={i}
            className="absolute z-20 w-[210px] h-[300px] border border-white/15 rounded-2xl flex flex-col items-center justify-center p-6 shadow-xl"
            style={{
              x: p.x, rotateY: p.ry, translateZ: 20, opacity: 0.95,
              background: 'rgba(10,18,40,0.80)',
              backdropFilter: 'blur(12px)',
              willChange: 'transform',
            }}
          >
            <div
              className={`w-12 h-12 rounded-xl bg-${p.col}-500/20 border border-${p.col}-500/50 flex items-center justify-center mb-5 text-xl`}
              style={{ boxShadow: '0 0 16px rgba(6,182,212,0.3)' }}
            >
              {p.emoji}
            </div>
            <p className="text-white font-bold text-base mb-3 leading-relaxed">{p.label}</p>
            <div className="w-full h-2 bg-slate-700/60 rounded-full mb-3" />
            <div className="w-3/4 h-2 bg-slate-700/60 rounded-full mb-3" />
            <div className="w-1/2 h-2 bg-slate-700/60 rounded-full" />
          </motion.div>
        ))}

        {/* ── Central video screen ────────────────────────────────────────
            CRITICAL: NO backdrop-filter on this wrapper.
            backdrop-filter creates a GPU compositing layer boundary that
            traps child blend modes, making the video invisible.
            Depth / glass effect is achieved via box-shadow + bg only. */}
        <motion.div
          className="absolute z-30 w-[300px] md:w-[410px] h-[180px] md:h-[260px] rounded-3xl overflow-hidden border border-cyan-400/40 bg-cyan-950/5"
          style={{
            translateZ: 100,
            willChange: 'transform',
            boxShadow: '0 0 50px rgba(34,211,238,0.30), 0 0 120px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Video renders on its own layer — no blend mode interference */}
          {HeroVideo}

          {/* Overlays sit ABOVE video via z-index, no blend mode needed */}
          {/* Colour-grade tint */}
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              zIndex: 1,
              background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, transparent 55%, rgba(99,102,241,0.08) 100%)',
            }}
          />
          {/* Inner border glow */}
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              zIndex: 2,
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 0 30px rgba(34,211,238,0.08)',
            }}
          />
          {/* Tech scanlines */}
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              zIndex: 2,
              opacity: 0.07,
              backgroundImage: 'linear-gradient(rgba(18,150,242,0.4) 50%, rgba(0,0,0,0.4) 50%)',
              backgroundSize: '100% 4px',
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function HeroLandingPage() {
  const router = useRouter()
  const [hasMounted, setHasMounted] = useState(false)

  // GSAP target refs
  const backdropRef = useRef<HTMLDivElement>(null)  // frosted-glass blur overlay
  const bgImageRef = useRef<HTMLDivElement>(null)  // raw image wrapper (scale + parallax)
  const heroRef = useRef<HTMLElement>(null)      // ScrollTrigger anchor

  // ── Mount guard: prevents SSR/hydration blank-screen bug ──────────────────
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // ── GSAP: cinematic blur-reveal + elastic scale-down + parallax ───────────
  useEffect(() => {
    if (!hasMounted) return
    if (!backdropRef.current || !bgImageRef.current || !heroRef.current) return

    const ctx = gsap.context(() => {
      // 1. Progressive backdrop-filter blur: 40px → 2px (hero text crisp → BG reveals)
      gsap.fromTo(
        backdropRef.current,
        { backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' },
        {
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        }
      )

      // 2. Elastic scale-down on the image container: 1.1 → 1.0
      gsap.fromTo(
        bgImageRef.current,
        { scale: 1.1 },
        {
          scale: 1.0,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        }
      )

      // 3. Subtle parallax drift — image drifts down as user scrolls up
      gsap.to(bgImageRef.current, {
        y: '10%',
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    })

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [hasMounted])

  // ── SSR placeholder — avoids flash of blank black on first load ───────────
  if (!hasMounted) {
    return <div className="min-h-screen bg-[#060d1f]" />
  }

  return (
    <div
      dir="rtl"
      className={`landing-root text-white selection:bg-cyan-500/30 font-[family-name:var(--font-tajawal)]`}
    >
      {/* ── Film grain overlay (fixed, cosmetic only) ── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay z-50">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <filter id="ng">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#ng)" />
        </svg>
      </div>

      {/* ── Fixed Background Stack ─────────────────────────────────────────────
          Layer order (bottom → top):
            [1] bgImageRef  → university crest JPEG  (scale 1.1→1.0 + parallax)
            [2] Vignette    → static dark gradient   (legibility, always on)
            [3] backdropRef → frosted glass overlay  (GSAP blur 40px → 2px)
            [4] Neon glows  → static radial accents  (color atmosphere)
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">

        {/* [1] Background image — receives GSAP scale + parallax */}
        <div
          ref={bgImageRef}
          className="absolute inset-0 w-full h-full"
          style={{ transformOrigin: 'center center', willChange: 'transform, filter' }}
        >
          <Image
            src="/assets/mutah_it_faculty_hero.jpeg"
            alt="Mutah University — Official Branded Backdrop"
            fill
            priority
            quality={88}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        {/* [2] Vignette — keeps hero copy readable at all times */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to right,  rgba(6,13,31,0.88) 0%, rgba(6,13,31,0.50) 55%, rgba(6,13,31,0.75) 100%),
              linear-gradient(to bottom, rgba(6,13,31,0.60) 0%, rgba(6,13,31,0.10) 40%, rgba(6,13,31,0.92) 100%)
            `,
          }}
        />

        {/* [3] Frosted glass overlay — GSAP animates backdropFilter blur on this */}
        <div
          ref={backdropRef}
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            background: 'rgba(6,13,31,0.06)',
            willChange: 'backdrop-filter, filter',
          }}
        />

        {/* [4] Neon accent glows — static ambient color atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 25% 55%, rgba(99,102,241,0.16) 0%, transparent 65%),
              radial-gradient(ellipse 50% 40% at 72% 38%, rgba(6,182,212,0.12) 0%,  transparent 60%),
              radial-gradient(ellipse 40% 35% at 50% 92%, rgba(139,92,246,0.11) 0%, transparent 55%)
            `,
          }}
        />
      </div>

      {/* ── Header ── */}
      <header className="absolute top-0 w-full z-40 px-8 py-6 md:px-16 flex justify-start items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Image
            src="/assets/mutah_logo1.png/mutah_logo1.png.png"
            alt="Mutah University Logo"
            width={120}
            height={120}
            quality={100}
            priority={true}
            className="h-20 md:h-28 w-auto object-contain drop-shadow-[0_0_22px_rgba(255,255,255,0.35)]"
            style={{ imageRendering: 'auto' }}
          />
        </motion.div>
      </header>

      {/* ── Hero Section ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center container mx-auto px-6 md:px-10 pt-20 pb-10 z-20"
      >
        {/* Subtle dot grid on top of backdrop */}
        <div className="hero-grid" aria-hidden />

        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 lg:gap-x-12 xl:gap-x-20 items-center w-full">

          {/* ── Right column: Copy ── */}
          <div className="flex flex-col items-start text-right w-full max-w-lg order-2 lg:order-1 mt-10 lg:mt-0 relative z-30">

            {/* Luxury glass card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="w-full rounded-3xl p-7 md:p-8 mb-7 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.11)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09)',
              }}
            >
              {/* Corner glow accent */}
              <div
                className="absolute top-0 right-0 w-36 h-36 rounded-full opacity-25 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(6,182,212,0.5), transparent 70%)',
                  transform: 'translate(35%, -35%)',
                }}
              />

              {/* Eyebrow badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-xs font-semibold tracking-[0.22em] uppercase text-cyan-400 mb-4 flex items-center gap-2 leading-relaxed"
              >
                <span className="w-6 h-px bg-cyan-400/60 inline-block" />
                منصة الذكاء الأكاديمي
              </motion.div>

              {/* H1 */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                className="text-4xl md:text-5xl lg:text-[2.6rem] font-bold tracking-wide leading-[1.55] bg-gradient-to-l from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent"
              >
                نظام مؤتة الذكي
                <br />
                <span className="text-2xl md:text-3xl font-normal text-slate-300 leading-relaxed">
                  مستقبل إدارة الموارد الأكاديمية
                </span>
              </motion.h1>
            </motion.div>

            {/* Sub-description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="text-slate-300 font-light text-base md:text-lg mb-9 max-w-lg text-right leading-relaxed"
            >
              تحسين تجربة التعلم والأتمتة الأكاديمية بذكاء اصطناعي متطور — من تحليل المستندات إلى توليد الاختبارات الذكية.
            </motion.p>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.7 }}
            >
              <MagneticButton onClick={() => router.push('/dashboard')}>
                الدخول للمنصة ←
              </MagneticButton>
            </motion.div>

            {/* Scroll hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="mt-10 flex items-center gap-3 text-slate-500 text-xs tracking-widest uppercase"
            >
              <div className="flex flex-col gap-[3px] items-center">
                <span className="w-px h-6 bg-gradient-to-b from-transparent to-slate-500/60" />
                <span className="w-1 h-1 rounded-full bg-cyan-500/60 animate-bounce" />
              </div>
              <span>مرّر للأسفل لاكتشاف المنصة</span>
            </motion.div>
          </div>

          {/* ── Left column: 3D Gallery ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="w-full flex justify-center lg:justify-center order-1 lg:order-2 relative z-10"
            style={{ willChange: 'transform' }}
          >
            <FanningGallery />
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bridge ── */}
      <div className="container mx-auto px-6 md:px-10 -mt-4 mb-12 relative z-20">
        <StatsBridge />
      </div>

      {/* ── Intelligence Flow ── */}
      <div className="container mx-auto relative z-20">
        <IntelligenceFlow />
      </div>

      {/* ── Capabilities ── */}
      <CapabilityCards />

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-sm leading-relaxed">
        <span className="text-slate-500">مؤتة هاب</span> — منصة الذكاء الأكاديمي لجامعة مؤتة
        <span className="mx-2 text-white/10">|</span>
        <span>كل الحقوق محفوظة © 2026</span>
      </footer>
    </div>
  )
}
