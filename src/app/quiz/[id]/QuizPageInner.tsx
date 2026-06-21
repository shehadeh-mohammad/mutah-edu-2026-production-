"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getQuizByChapterId,
  getChapterById,
  getCourseById,
} from "@/services/dataService";
import QuizPlayer from "@/components/quiz/QuizPlayer";
import Toast from "@/components/ui/Toast";
import { useProgress } from "@/hooks/useProgress";

interface Props {
  chapterId: string;
}

export default function QuizPageInner({ chapterId }: Props) {
  const set = getQuizByChapterId(chapterId);
  const chapter = getChapterById(chapterId);
  const course = chapter ? getCourseById(chapter.courseId) : null;
  const [toast, setToast] = useState("");
  const { recordQuizScore } = useProgress();

  if (!set || !chapter) {
    return (
      <div className="text-center py-20" style={{ color: "var(--text3)" }}>
        <span className="text-5xl block mb-4">❓</span>
        <p className="text-sm">Quiz not found.</p>
        <Link
          href="/courses"
          className="text-xs mt-3 inline-block"
          style={{ color: "var(--blue2)" }}
        >
          ← Back to Courses
        </Link>
      </div>
    );
  }

  const handleComplete = (score: number, total: number) => {
    recordQuizScore(chapterId, Math.round((score / total) * 100));
    setToast(`🎉 Quiz complete! You scored ${score} out of ${total}`);
  };

  return (
    <div>
      <Link
        href={`/courses/${chapter.courseId}`}
        className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border mb-6 transition-all hover:bg-white/5"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text3)",
        }}
      >
        ← {chapter.title}
      </Link>

      <div className="mb-8">
        <h2
          className="font-display text-2xl font-bold"
          style={{ color: "var(--text)" }}
        >
          ❓ Quiz
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text3)" }}>
          {chapter.title} · {course?.title} · {set.questions.length} questions
        </p>
      </div>

      <QuizPlayer questions={set.questions} onComplete={handleComplete} />
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
