"use client";

import { useState } from "react";
import type { Flashcard } from "@/types";
import { cn } from "@/lib/utils";

interface FlashcardViewerProps {
  cards: Flashcard[];
}

export default function FlashcardViewer({ cards }: FlashcardViewerProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!cards.length)
    return (
      <div className="text-center py-16" style={{ color: "var(--text3)" }}>
        <span className="text-5xl block mb-3">🃏</span>
        <p className="text-sm">No flashcards available for this chapter.</p>
      </div>
    );

  const card = cards[index];

  const prev = () => {
    setIndex((index - 1 + cards.length) % cards.length);
    setFlipped(false);
  };
  const next = () => {
    setIndex((index + 1) % cards.length);
    setFlipped(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-center text-xs mb-4" style={{ color: "var(--text3)" }}>
        Click the card to reveal the answer
      </p>

      {/* Card */}
      <div className="flashcard-scene mb-5" style={{ height: 240 }}>
        <div
          className={cn(
            "flashcard-card cursor-pointer",
            flipped && "is-flipped"
          )}
          onClick={() => setFlipped(!flipped)}
        >
          {/* Front */}
          <div
            className="flashcard-face rounded-2xl border flex flex-col items-center justify-center p-8 text-center"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <span
              className="absolute top-4 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--text3)" }}
            >
              Question
            </span>
            <p
              className="text-base font-semibold leading-relaxed"
              style={{ color: "var(--text)" }}
            >
              {card.question}
            </p>
          </div>

          {/* Back */}
          <div
            className="flashcard-face flashcard-back rounded-2xl border flex flex-col items-center justify-center p-8 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.08))",
              borderColor: "rgba(59,130,246,0.3)",
            }}
          >
            <span
              className="absolute top-4 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--text3)" }}
            >
              Answer
            </span>
            <p className="text-sm leading-relaxed" style={{ color: "#93c5fd" }}>
              {card.answer}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full flex items-center justify-center border text-base transition-all hover:bg-white/5"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text)",
          }}
        >
          ←
        </button>
        <span
          className="text-sm min-w-[60px] text-center"
          style={{ color: "var(--text3)" }}
        >
          {index + 1} / {cards.length}
        </span>
        <button
          onClick={next}
          className="w-10 h-10 rounded-full flex items-center justify-center border text-base transition-all hover:bg-white/5"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text)",
          }}
        >
          →
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIndex(i);
              setFlipped(false);
            }}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background: i === index ? "var(--blue)" : "var(--border2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
