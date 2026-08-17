/**
 * ResultPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Detailed result view after quiz submission.
 *
 * Scoring logic:
 *  - correctCount = number of questions where userAnswer === question.answer
 *  - score = correctCount / totalQuestions × 10  (out of 10)
 *  - passMark = 5/10 (50%)
 *
 * Each question shows:
 *  - User's answer highlighted GREEN (correct) or RED (wrong)
 *  - Correct answer always highlighted with a subtle glow
 *  - Explanation (if provided in data)
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useMemo, useState } from "react";
import { Question, OptionKey } from "@/lib/quizData";
import { UserAnswers } from "./QuizPage";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ResultPageProps {
  questions: Question[];
  answers: UserAnswers;
  timeUsedSec: number;
  onRetry: () => void;
}

// ─── Score calculator ──────────────────────────────────────────────────────────
/**
 * Calculates quiz results.
 * @returns correctCount, wrongCount, unansweredCount, percentage, passed, score (out of 10)
 */
function calculateScore(questions: Question[], answers: UserAnswers) {
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  for (const q of questions) {
    const userAnswer = answers[q.id];
    if (!userAnswer) {
      unansweredCount++;
    } else if (userAnswer === q.answer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  }

  const total = questions.length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const score = total > 0 ? Math.round((correctCount / total) * 10 * 10) / 10 : 0; // 1 decimal
  const passed = percentage >= 50; // Pass mark: 50%

  return { correctCount, wrongCount, unansweredCount, total, percentage, score, passed };
}

// ─── Time formatter ───────────────────────────────────────────────────────────
function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} phút ${s} giây`;
}

// ─── Grade label ─────────────────────────────────────────────────────────────
function getGrade(pct: number): { label: string; color: string } {
  if (pct >= 90) return { label: "Xuất sắc", color: "text-emerald-400" };
  if (pct >= 75) return { label: "Giỏi", color: "text-blue-400" };
  if (pct >= 50) return { label: "Đạt", color: "text-indigo-400" };
  return { label: "Chưa đạt", color: "text-red-400" };
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

// ─── Option style helper ──────────────────────────────────────────────────────
function getOptionClass(
  key: OptionKey,
  correct: OptionKey,
  userAnswer: OptionKey | undefined,
): string {
  const isCorrect = key === correct;
  const isUserAnswer = key === userAnswer;

  if (isCorrect && isUserAnswer) {
    // ✅ User answered correctly
    return "bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-500/10";
  }
  if (isCorrect) {
    // ✅ Correct answer (user chose wrong)
    return "bg-emerald-500/10 border-emerald-500/40 text-emerald-400";
  }
  if (isUserAnswer) {
    // ❌ User's wrong answer
    return "bg-red-500/15 border-red-500/60 text-red-300";
  }
  return "bg-white/[0.02] border-white/[0.06] text-slate-500";
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResultPage({ questions, answers, timeUsedSec, onRetry }: ResultPageProps) {
  const { user, logout } = useAuth();
  const [showAll, setShowAll] = useState(false);

  const result = useMemo(
    () => calculateScore(questions, answers),
    [questions, answers]
  );

  const grade = getGrade(result.percentage);
  const displayQuestions = showAll ? questions : questions.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#080b14] text-white">
      {/* Ambient blobs */}
      <div className={`fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none ${result.passed ? "bg-emerald-600" : "bg-red-600"}`} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#080b14]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">Kết quả bài thi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 hidden sm:inline">{user?.name}</span>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* ── SCORE HERO CARD ────────────────────────────────────────────────── */}
        <div className={`relative rounded-2xl border p-8 text-center overflow-hidden ${
          result.passed
            ? "bg-emerald-500/5 border-emerald-500/20"
            : "bg-red-500/5 border-red-500/20"
        }`}>
          {/* Result badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5 ${
            result.passed
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/15 text-red-400 border border-red-500/30"
          }`}>
            {result.passed ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            )}
            {result.passed ? "ĐẠT" : "CHƯA ĐẠT"}
          </div>

          {/* Score circle */}
          <div className="relative inline-block mb-5">
            <svg className="w-36 h-36" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={result.passed ? "#10b981" : "#ef4444"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - result.percentage / 100)}`}
                className="transition-all duration-1000"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{result.score}</span>
              <span className="text-xs text-slate-400">/ 10</span>
            </div>
          </div>

          <p className={`text-2xl font-bold ${grade.color} mb-1`}>{grade.label}</p>
          <p className="text-slate-400 text-sm">{user?.name} • {formatTime(timeUsedSec)}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
            <StatCard value={`${result.correctCount}/${result.total}`} label="Câu đúng" color="text-emerald-400" />
            <StatCard value={result.wrongCount} label="Câu sai" color="text-red-400" />
            <StatCard value={result.unansweredCount} label="Bỏ trống" color="text-amber-400" />
            <StatCard value={`${result.percentage}%`} label="Tỷ lệ đúng" color="text-indigo-400" />
          </div>
        </div>

        {/* ── ACTION BUTTONS ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-3.5 rounded-xl font-semibold text-white
              bg-gradient-to-r from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98]
              flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Làm lại bài thi
          </button>
          <button
            onClick={() => window.scrollTo({ top: document.getElementById("review")?.offsetTop ?? 0, behavior: "smooth" })}
            className="flex-1 py-3.5 rounded-xl font-semibold text-slate-300
              border border-white/10 hover:bg-white/5 hover:text-white
              transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Xem đáp án
          </button>
        </div>

        {/* ── ANSWER REVIEW ─────────────────────────────────────────────────── */}
        <section id="review" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Chi tiết đáp án
            </h2>
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500/40 border border-emerald-500/60 inline-block" />
                Đúng
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-500/40 border border-red-500/60 inline-block" />
                Sai
              </span>
            </div>
          </div>

          {displayQuestions.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.answer;
            const isSkipped = !userAnswer;

            return (
              <div
                key={q.id}
                className={`rounded-2xl border transition-colors ${
                  isSkipped
                    ? "bg-amber-500/5 border-amber-500/20"
                    : isCorrect
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-red-500/5 border-red-500/20"
                }`}
              >
                {/* Question header */}
                <div className="px-6 pt-5 pb-3 flex items-start gap-4">
                  {/* Status icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    isSkipped ? "bg-amber-500/20 text-amber-400" : isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {isSkipped ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    ) : isCorrect ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-slate-500 font-medium">Câu {idx + 1}</span>
                    <p className="text-[15px] text-slate-100 leading-relaxed font-medium mt-0.5">
                      {q.question}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="px-6 pb-4 ml-12 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => {
                    const cls = getOptionClass(opt.key, q.answer, userAnswer);
                    const isOpt = opt.key === userAnswer;
                    const isCorrectOpt = opt.key === q.answer;

                    return (
                      <div
                        key={opt.key}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm ${cls}`}
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center bg-white/10">
                          {opt.key}
                        </span>
                        <span className="leading-snug">{opt.text}</span>
                        {isCorrectOpt && (
                          <svg className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                        )}
                        {isOpt && !isCorrectOpt && (
                          <svg className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mx-6 mb-5 ml-[4.5rem] px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-300 flex gap-2">
                    <svg className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                    <span><strong className="text-indigo-300">Giải thích:</strong> {q.explanation}</span>
                  </div>
                )}

                {/* Skipped note */}
                {isSkipped && (
                  <div className="mx-6 mb-5 ml-[4.5rem] px-4 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-400 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Bạn đã bỏ trống câu này. Đáp án đúng là <strong className="text-emerald-400 ml-1">({q.answer})</strong>.
                  </div>
                )}
              </div>
            );
          })}

          {/* Show more */}
          {!showAll && questions.length > 5 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-3.5 rounded-xl border border-white/10 text-slate-300 font-medium
                hover:bg-white/5 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
              Xem thêm {questions.length - 5} câu còn lại
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
