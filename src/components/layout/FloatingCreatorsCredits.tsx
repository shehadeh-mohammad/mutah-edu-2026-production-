"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ChevronDown,
  Brain,
  Video,
  Palette,
  LayoutGrid,
  Cpu,
  Network,
  Activity,
  Sparkles,
  Laptop,
  Settings,
  FileText,
  Users,
  ShieldCheck,
  BarChart3,
  Database,
  FileCheck,
  Search,
  Lock,
  TestTube2,
  CheckCircle2
} from "lucide-react";

const developers = [
  {
    id: 1,
    name: "Mohammad Shehadeh",
    role: "CIS Systems Architect & AI Engineer",
    contributions: [
      { text: "Architected Resilient Multi-Model AI Fallback Chains & Failover API Pipelines", icon: Brain, color: "text-pink-400", glow: "rgba(244, 114, 182, 0.5)" },
      { text: "Architected Cloud PDF Ingestion Pipeline & Document RAG Engine with Advanced Token Defenses", icon: Video, color: "text-amber-400", glow: "rgba(251, 191, 36, 0.5)" },
      { text: "Designed Interactive 3D Fanning Gallery Driven by Parallax Physics Springs", icon: Palette, color: "text-purple-400", glow: "rgba(192, 132, 252, 0.5)" },
      { text: "Developed Premium Glassmorphism Theme & Ambient Neon Glow Infrastructure", icon: LayoutGrid, color: "text-cyan-400", glow: "rgba(34, 211, 238, 0.5)" },
      { text: "Built Active Recall AI Flashcards Lab & Dynamic MCQ Examination Engine", icon: Cpu, color: "text-indigo-400", glow: "rgba(129, 140, 248, 0.5)" },
      { text: "Directed Viewport Scaling Logic, Mobile DOM Isolation & Fluid Grid Responsiveness", icon: Network, color: "text-blue-400", glow: "rgba(96, 165, 250, 0.5)" },
      { text: "Architected High-Performance Prisma Relational Schema, Core Video Framework & Local Services", icon: Database, color: "text-teal-400", glow: "rgba(45, 212, 191, 0.5)" },
      { text: "Implemented Kinetic Spring-Driven Magnetic CTA Buttons & Shimmer Transitions", icon: Sparkles, color: "text-orange-400", glow: "rgba(251, 146, 60, 0.5)" }
    ]
  },
  {
    id: 2,
    name: "Shahed Altamimi",
    role: "Project Manager & Core Foundation Engineer",
    contributions: [
      { text: "Constructed Core Next.js App Router & Framework Scaffolding", icon: Laptop, color: "text-indigo-400", glow: "rgba(129, 140, 248, 0.5)" },
      { text: "Established Base Component Directory & Layout Architecture", icon: Settings, color: "text-teal-400", glow: "rgba(45, 212, 191, 0.5)" },
      { text: "Implemented Static Navigation Flows & Academic Tab Routing", icon: Network, color: "text-emerald-400", glow: "rgba(52, 211, 153, 0.5)" },
      { text: "Spearheaded Technical Documentation & Development Artifacts", icon: FileText, color: "text-blue-400", glow: "rgba(96, 165, 250, 0.5)" },
      { text: "Coordinated Project Lifecycle, Scope Planning & Milestones", icon: Activity, color: "text-cyan-400", glow: "rgba(34, 211, 238, 0.5)" },
      { text: "Managed Team Workflow, Scheduling & Task Distribution", icon: Users, color: "text-orange-400", glow: "rgba(251, 146, 60, 0.5)" },
      { text: "Coordinated Feature Integration & Team Code Collaboration", icon: ShieldCheck, color: "text-green-400", glow: "rgba(74, 222, 128, 0.5)" },
      { text: "Directed Final Presentation Strategy & Academic Objectives at Mutah University", icon: BarChart3, color: "text-rose-400", glow: "rgba(251, 113, 133, 0.5)" }
    ]
  },
  {
    id: 3,
    name: "Zain Sami",
    role: "Educational Content & Data Schema Architect",
    contributions: [
      { text: "Curated & Organized Domain-Specific Educational Course Materials", icon: FileCheck, color: "text-emerald-400", glow: "rgba(52, 211, 153, 0.5)" },
      { text: "Populated Platform with Structured Course Files & Chapter Assets", icon: FileText, color: "text-lime-400", glow: "rgba(163, 230, 53, 0.5)" },
      { text: "Designed Static Data Models & Academic Object Mapping", icon: LayoutGrid, color: "text-green-400", glow: "rgba(74, 222, 128, 0.5)" },
      { text: "Structured Raw Educational Hierarchies for Maximum Clarity", icon: Network, color: "text-teal-500", glow: "rgba(20, 184, 166, 0.5)" }
    ]
  },
  {
    id: 4,
    name: "Abdulaziz Qandeel",
    role: "DevOps, QA & System Security Engineer",
    contributions: [
      { text: "Architected Native-like Mobile Drawer Navigation & Calibrated Hamburger Hitboxes", icon: LayoutGrid, color: "text-indigo-400", glow: "rgba(129, 140, 248, 0.5)" },
      { text: "Engineered Chat-Centric Mobile Viewports & Fluid Horizontal Swipe Architectures", icon: Activity, color: "text-teal-400", glow: "rgba(45, 212, 191, 0.5)" },
      { text: "Mitigated iOS Safari Auto-Zoom Anomalies & Enforced Rigid Device Scaling Policies", icon: Settings, color: "text-emerald-400", glow: "rgba(52, 211, 153, 0.5)" },
      { text: "Optimized System Security & Vulnerability Patching", icon: ShieldCheck, color: "text-rose-400", glow: "rgba(251, 113, 133, 0.5)" },
      { text: "Integrated Dynamic Video Stream Embeds & Responsive Player Media Layouts", icon: Video, color: "text-sky-400", glow: "rgba(56, 189, 248, 0.5)" },
      { text: "Executed Comprehensive User Acceptance Testing (UAT) & System QA", icon: TestTube2, color: "text-blue-500", glow: "rgba(59, 130, 246, 0.5)" },
      { text: "Streamlined Component Integration & Cross-Module Data Synchronization", icon: Network, color: "text-indigo-400", glow: "rgba(129, 140, 248, 0.5)" },
      { text: "Enforced Static Asset Caching & Strict API Security Protocols", icon: Lock, color: "text-pink-500", glow: "rgba(236, 72, 153, 0.5)" }
    ]
  },
  {
    id: 5,
    name: "Heba Muneer",
    role: "AI Multimedia & Learning Content Specialist",
    contributions: [
      { text: "Produced AI-Synthesized Educational Videos & Multimedia Course Nodes", icon: Video, color: "text-blue-500", glow: "rgba(59, 130, 246, 0.5)" },
      { text: "Populated Chapter Modules with Contextual Educational Artifacts", icon: FileText, color: "text-amber-500", glow: "rgba(245, 158, 11, 0.5)" },
      { text: "Generated Interactive AI-Driven Educational Course Materials", icon: Activity, color: "text-orange-400", glow: "rgba(251, 146, 60, 0.5)" },
      { text: "Refined Complex Information Architecture for End-Users", icon: Users, color: "text-yellow-500", glow: "rgba(234, 179, 8, 0.5)" }
    ]
  }
];

export default function FloatingCreatorsCredits() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Drag-to-dismiss state
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragCurrentY = useRef<number>(0);
  const isDragging = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Listen for cross-component open trigger (e.g. from mobile drawer)
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-credits', handler);
    return () => window.removeEventListener('open-credits', handler);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setExpandedId(null), 500);
  }, []);

  // ── Drag-to-dismiss handlers ──────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    dragCurrentY.current = dy;
    if (dy > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${dy}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.35s cubic-bezier(0.32,0.72,0,1)';
    }
    // If dragged > 120px downward → dismiss
    if (dragCurrentY.current > 120) {
      closeModal();
    } else {
      if (sheetRef.current) {
        sheetRef.current.style.transform = 'translateY(0)';
      }
    }
    dragCurrentY.current = 0;
  }, [closeModal]);

  if (!isMounted) return null;

  // ── Shared content block ──────────────────────────────────────────────────
  const ModalContent = (
    <div className="relative z-10 flex flex-col items-center">
      {/* Header */}
      <h2 className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 font-bold text-3xl tracking-wide mb-10 text-center">
        System Architects
      </h2>

      {/* Grid */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full mb-10">
        {developers.map((dev) => (
          <div
            key={dev.id}
            onClick={() => setExpandedId(expandedId === dev.id ? null : dev.id)}
            className={`group relative flex flex-col w-full md:w-[calc(50%-0.75rem)] items-center justify-start p-5 md:p-6 rounded-2xl border transition-all duration-700 ease-out text-center cursor-pointer overflow-hidden ${expandedId === dev.id
              ? "bg-white/[0.05] border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              : "bg-transparent border-transparent hover:border-white/10 hover:bg-white/[0.03] hover:-translate-y-1"
              }`}
          >
            {/* Card Header (Always visible) */}
            <div className="flex items-center justify-between w-full">
              <div className="w-5 h-5"></div> {/* Spacer */}
              <div className="flex flex-col items-center">
                <h3 className="text-slate-200 text-lg md:text-xl font-semibold mb-1">{dev.name}</h3>
                <p className="text-indigo-400/80 text-xs tracking-[0.2em] uppercase">{dev.role}</p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-500 transition-transform duration-500 ${expandedId === dev.id ? "rotate-180 text-white" : "group-hover:text-slate-300"
                  }`}
              />
            </div>

            {/* Expanded Content */}
            <div
              className={`grid transition-all duration-500 ease-in-out w-full ${expandedId === dev.id ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0 mt-0"
                }`}
            >
              <div className="overflow-hidden">
                <ul className="flex flex-col space-y-4 text-left w-full px-2 py-2">
                  {dev.contributions.map((item, idx) => (
                    <li key={idx} className="text-slate-300 text-sm flex items-center gap-3 leading-relaxed group/item">
                      <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 transition-all duration-300 ${item.color} group-hover/item:scale-110 group-hover/item:bg-white/10`}>
                        <item.icon
                          className="w-4 h-4 filter transition-all duration-300"
                          style={{ filter: `drop-shadow(0 0 5px ${item.glow})` }}
                        />
                      </div>
                      <span className="group-hover/item:text-white transition-colors duration-300">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <p className="text-slate-500 text-xs tracking-wider text-center mt-2">
        © 2026 Mutah Smart Education Hub. Designed with passion.
      </p>
    </div>
  );

  return (
    <>
      {/* CUSTOM BREATHING KEYFRAME */}
      <style>{`
        @keyframes breathe {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.96);
            box-shadow: 0 0 0px rgba(99,102,241,0);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
            box-shadow:
              0 0 18px rgba(99,102,241,0.45),
              0 0 30px rgba(45,212,191,0.25),
              inset 0 0 12px rgba(99,102,241,0.08);
          }
        }
        .fab-breathe {
          animation: breathe 7s ease-in-out infinite;
        }
        .fab-breathe:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* TRIGGER */}
      <button
        onClick={() => setIsOpen(true)}
        className="fab-breathe hidden md:flex fixed bottom-10 right-10 z-[90] p-[14px] rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:bg-white/[0.10] hover:scale-110 hover:border-white/20 hover:shadow-[0_0_28px_rgba(99,102,241,0.5),0_0_40px_rgba(45,212,191,0.3)] transition-[transform,background-color,border-color,box-shadow] duration-500 ease-out items-center justify-center group"
        aria-label="View System Architects"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-indigo-400 group-hover:text-white transition-colors duration-500"
        >
          <path
            d="M2 17.5L12 22.5L22 17.5M2 12.5L12 17.5L22 12.5M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ── MOBILE BOTTOM SHEET ─────────────────────────────────────────────────
          Visible on < md screens. Slides up from the bottom with drag-to-dismiss. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] md:hidden bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            ref={sheetRef}
            className="fixed bottom-0 inset-x-0 z-[101] bg-[#0B0F19]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl shadow-[0_-10px_60px_rgba(0,0,0,0.6)]"
            style={{ transform: 'translateY(0)', transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)', maxHeight: '90dvh' }}
            onClick={e => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Drag handle pill */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/10 p-2.5 rounded-full transition-colors duration-300 z-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable content with pb-12 safe-area padding */}
            <div className="overflow-y-auto pb-12 px-5 pt-2" style={{ maxHeight: 'calc(90dvh - 52px)' }}>
              {/* Ambient Lighting */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none translate-x-1/2 translate-y-1/2" />
              {ModalContent}
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP CENTERED MODAL ──────────────────────────────────────────────
          Visible on md+ screens. Classic centered overlay unchanged. */}
      <div
        className={`fixed inset-0 z-[100] hidden md:flex bg-black/40 backdrop-blur-md items-center justify-center transition-all duration-500 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeModal}
      >
        <div
          className={`relative bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-3xl p-6 md:p-10 max-w-4xl w-full mx-4 overflow-y-auto max-h-[90vh] transition-all duration-500 transform pb-12 ${isOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-8 opacity-0"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 text-slate-400 hover:text-white hover:bg-white/10 p-3 rounded-full transition-colors duration-300 z-50 cursor-pointer pointer-events-auto"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ambient Lighting */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none translate-x-1/2 translate-y-1/2"></div>

          {ModalContent}
        </div>
      </div>
    </>
  );
}
