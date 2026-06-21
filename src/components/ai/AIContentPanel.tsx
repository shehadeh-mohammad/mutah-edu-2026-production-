"use client";

import { useState } from "react";
import { generateAIContent, type AIGeneratedContent } from "@/lib/aiService";
import Button from "@/components/ui/Button";
import Image from "next/image";

interface AIContentPanelProps {
  chapterId: string;
}

export default function AIContentPanel({ chapterId }: AIContentPanelProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<AIGeneratedContent | null>(null);

  const generate = async () => {
    setLoading(true);
    const result = await generateAIContent(chapterId);
    setContent(result);
    setLoading(false);
  };

  return (
    <div>
      {/* Trigger button */}
      {!content && !loading && (
        <div className="flex justify-end mb-4">
          <Button variant="ai" onClick={generate}>
            ✨ Generate AI Content
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div
          className="rounded-2xl border p-6 mb-6"
          style={{
            background:
              "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.05))",
            borderColor: "rgba(139,92,246,0.2)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center p-1.5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))",
              }}
            >
              <Image
                src="/assets/MU.ai.logo/MU.ai.logoo.png"
                alt="AI Icon"
                width={32}
                height={32}
                className="object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse"
              />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
                AI is thinking…
              </p>
              <p className="text-xs" style={{ color: "var(--text3)" }}>
                Generating content for this chapter
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {[100, 80, 90].map((w, i) => (
              <div
                key={i}
                className="skeleton h-3 rounded"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {content && !loading && (
        <div
          className="rounded-2xl border p-5 mb-6 animate-fade-in-up"
          style={{
            background:
              "linear-gradient(135deg, rgba(139,92,246,0.07), rgba(6,182,212,0.04))",
            borderColor: "rgba(139,92,246,0.2)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center p-1.5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))",
                }}
              >
                <Image
                  src="/assets/MU.ai.logo/MU.ai.logoo.png"
                  alt="AI Icon"
                  width={32}
                  height={32}
                  className="object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                />
              </div>
              <div>
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--text)" }}
                >
                  AI-Generated Content
                </p>
                <p className="text-[11px]" style={{ color: "var(--text3)" }}>
                  NotebookLM-style learning tools
                </p>
              </div>
            </div>
            <button
              onClick={() => setContent(null)}
              className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
              style={{ borderColor: "var(--border)", color: "var(--text3)" }}
            >
              Regenerate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Summary */}
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--text3)" }}
              >
                📝 Chapter Summary
              </p>
              <div
                className="rounded-xl border px-4 py-3 text-xs leading-relaxed"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.06)",
                  color: "var(--text2)",
                }}
              >
                {content.summary}
              </div>
            </div>

            {/* Key Concepts */}
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--text3)" }}
              >
                🔑 Key Concepts
              </p>
              <div className="space-y-2">
                {content.keyConcepts.map((concept, i) => (
                  <div
                    key={i}
                    className="flex gap-2.5 rounded-xl border px-3 py-2 text-xs"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(255,255,255,0.06)",
                      color: "var(--text2)",
                    }}
                  >
                    <span style={{ color: "#60a5fa" }}>🔹</span>
                    <span>{concept}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Tips */}
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--text3)" }}
              >
                💡 Study Tips
              </p>
              <div className="space-y-2">
                {content.studyTips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex gap-2.5 rounded-xl border px-3 py-2 text-xs"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(255,255,255,0.06)",
                      color: "var(--text2)",
                    }}
                  >
                    <span>💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Questions */}
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--text3)" }}
              >
                🎯 Practice Questions
              </p>
              <div className="space-y-2">
                {content.practiceQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="flex gap-2.5 rounded-xl border px-3 py-2 text-xs"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(255,255,255,0.06)",
                      color: "var(--text2)",
                    }}
                  >
                    <span style={{ color: "#f59e0b" }}>❓</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
