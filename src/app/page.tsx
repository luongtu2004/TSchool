/**
 * app/page.tsx  –  Root page (entry point)
 * ─────────────────────────────────────────────────────────────────────────────
 * Controls the high-level app state machine:
 *
 *  "auth"   → Show Login/Register page (user not logged in)
 *  "quiz"   → Show active quiz interface (user logged in, not yet submitted)
 *  "result" → Show result/review page (quiz submitted)
 *
 * State transitions:
 *  auth  ──[login success]──► quiz
 *  quiz  ──[submit]─────────► result
 *  result──[retry]──────────► quiz
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/components/AuthPage";
import QuizPage, { UserAnswers } from "@/components/QuizPage";
import ResultPage from "@/components/ResultPage";
import { Question } from "@/lib/quizData";

// ─── App state machine ────────────────────────────────────────────────────────
type AppState = "quiz" | "result";

interface QuizResult {
  answers: UserAnswers;
  questions: Question[];
  timeUsedSec: number;
}

// ─── Loading spinner ──────────────────────────────────────────────────────────
function FullscreenLoader() {
  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-slate-400 text-sm font-medium">Đang tải…</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Page() {
  const { user, isLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>("quiz");
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Called when user submits the quiz
  const handleSubmit = useCallback(
    (answers: UserAnswers, questions: Question[], timeUsedSec: number) => {
      setQuizResult({ answers, questions, timeUsedSec });
      setAppState("result");
      // Scroll to top after state change
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  // Called when user clicks "Làm lại bài thi"
  const handleRetry = useCallback(() => {
    setQuizResult(null);
    setAppState("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── 1. Auth check loading ─────────────────────────────────────────────────
  if (isLoading) return <FullscreenLoader />;

  // ── 2. Not logged in → show Auth page ────────────────────────────────────
  if (!user) return <AuthPage />;

  // ── 3. Quiz in progress ───────────────────────────────────────────────────
  if (appState === "quiz") {
    return <QuizPage onSubmit={handleSubmit} />;
  }

  // ── 4. Result view ────────────────────────────────────────────────────────
  if (appState === "result" && quizResult) {
    return (
      <ResultPage
        questions={quizResult.questions}
        answers={quizResult.answers}
        timeUsedSec={quizResult.timeUsedSec}
        onRetry={handleRetry}
      />
    );
  }

  // Fallback (should never reach)
  return <FullscreenLoader />;
}
