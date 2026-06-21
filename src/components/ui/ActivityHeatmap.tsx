'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Activity } from 'lucide-react'

// Generate simulated data (last 16 weeks * 7 days)
const WEEKS = 18
const DAYS = 7
const heatmapData = Array.from({ length: WEEKS * DAYS }, () => {
    // roughly 30% chance for 0, else random
    return Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0
})

const getIntensityClass = (val: number) => {
    switch (val) {
        case 0: return 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-white/5'
        case 1: return 'bg-emerald-200 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-800'
        case 2: return 'bg-emerald-400 dark:bg-emerald-700 border-emerald-500 dark:border-emerald-600'
        case 3: return 'bg-emerald-600 dark:bg-emerald-500 border-emerald-700 dark:border-emerald-400'
        default: return 'bg-emerald-800 dark:bg-emerald-400 border-emerald-900 dark:border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
    }
}

export default function ActivityHeatmap() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.heatmap-square',
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, stagger: { amount: 1.5, from: 'random' }, ease: 'back.out(2)' }
            )
        }, containerRef)
        return () => ctx.revert()
    }, [])

    return (
        <div className="glass-ultra anim-card px-[24px] py-[22px] bg-white border-slate-300 shadow-sm dark:bg-white/[0.02] dark:border-white/10 dark:shadow-none transition-colors duration-300" ref={containerRef}>
            <h4 className="text-[13px] font-black mb-5 flex items-center justify-between text-slate-950 dark:text-[#f0f6ff]">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-emerald-600 dark:text-emerald-400" />
                    معدل الساعات الدراسية
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-sans">
                    328 Total Hours
                </span>
            </h4>

            {/* Heatmap Grid */}
            <div className="flex overflow-x-auto scroller pb-2">
                <div className="grid grid-rows-7 grid-flow-col gap-1.5 mx-auto dir-ltr">
                    {heatmapData.map((val, i) => (
                        <div
                            key={i}
                            title={`${val} hours`}
                            className={`w-3.5 h-3.5 rounded-[3px] border heatmap-square ${getIntensityClass(val)} cursor-crosshair transition-colors duration-300`}
                        />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span>قليل</span>
                <div className={`w-3 h-3 rounded-[2px] border ${getIntensityClass(0)}`} />
                <div className={`w-3 h-3 rounded-[2px] border ${getIntensityClass(1)}`} />
                <div className={`w-3 h-3 rounded-[2px] border ${getIntensityClass(2)}`} />
                <div className={`w-3 h-3 rounded-[2px] border ${getIntensityClass(3)}`} />
                <div className={`w-3 h-3 rounded-[2px] border ${getIntensityClass(4)}`} />
                <span>مكثف</span>
            </div>
        </div>
    )
}
