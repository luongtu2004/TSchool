"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/components/AuthPage";
import HomePage from "@/components/HomePage";
import QuizPage, { UserAnswers } from "@/components/QuizPage";
import ResultPage from "@/components/ResultPage";
import { Question, Exam } from "@/lib/quizData";

type AppState = "home" | "quiz" | "result";

interface QuizResult {
  answers: UserAnswers;
  questions: Question[];
  timeUsedSec: number;
}

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

export default function Page() {
  const { user, isLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>("home");
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const handleStartExam = useCallback((exam: Exam) => {
    setSelectedExam(exam);
    setAppState("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(
    (answers: UserAnswers, questions: Question[], timeUsedSec: number) => {
      // Calculate scores
      let correct = 0, wrong = 0, skipped = 0;
      for (const q of questions) {
        const a = answers[q.id];
        if (!a) skipped++;
        else if (a === q.answer) correct++;
        else wrong++;
      }
      const total = questions.length;
      const scoreValue = total > 0 ? Math.round((correct / total) * 100) / 10 : 0;

      if (user && selectedExam) {
        import("@/lib/quizData").then(({ saveAttempt }) => {
          saveAttempt(
            user.id,
            selectedExam.id,
            scoreValue,
            correct,
            wrong,
            skipped,
            total,
            timeUsedSec
          );
        });
      }

      setQuizResult({ answers, questions, timeUsedSec });
      setAppState("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [user, selectedExam]
  );

  const handleRetry = useCallback(() => {
    setQuizResult(null);
    setAppState("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBackHome = useCallback(() => {
    setQuizResult(null);
    setSelectedExam(null);
    setAppState("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (isLoading) return <FullscreenLoader />;
  if (!user) return <AuthPage />;

  if (appState === "home") {
    return <HomePage onStartExam={handleStartExam} />;
  }

  if (appState === "quiz") {
    return (
      <QuizPage
        onSubmit={handleSubmit}
        examId={selectedExam?.id}
        examName={selectedExam?.name}
        timeLimitMin={selectedExam?.time_limit_min}
        onBackHome={handleBackHome}
      />
    );
  }

  if (appState === "result" && quizResult) {
    return (
      <ResultPage
        questions={quizResult.questions}
        answers={quizResult.answers}
        timeUsedSec={quizResult.timeUsedSec}
        onRetry={handleRetry}
        onBackHome={handleBackHome}
      />
    );
  }

  return <FullscreenLoader />;
}
