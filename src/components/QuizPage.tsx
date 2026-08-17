/**
 * QuizPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Main quiz interface component. Features:
 *  - Async question loading with skeleton loader
 *  - Sticky header with countdown timer + progress bar
 *  - Question navigator grid (click to jump)
 *  - Smooth answer selection with Tailwind transitions
 *  - Floating "Nộp bài" button
 *  - Passes answers up to parent via onSubmit()
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Question, OptionKey, fetchQuestions } from "@/lib/quizData";
import { useAuth } from "@/contexts/AuthContext";
import ConfirmModal from "./ConfirmModal";

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserAnswers = Record<number, OptionKey>;

interface QuizPageProps {
  onSubmit: (answers: UserAnswers, questions: Question[], timeUsed: number) => void;
}

// ─── Timer hook ───────────────────────────────────────────────────────────────
const QUIZ_DURATION_SEC = 45 * 60; // 45 minutes

function useCountdown(initialSec: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(initialSec);
  const callbackRef = useRef(onExpire);
  callbackRef.current = onExpire;

  useEffect(() => {
    if (remaining <= 0) { callbackRef.current(); return; }
    const id = setInterval(() => setRemaining((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const elapsed = initialSec - remaining;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return { remaining, elapsed, formatted: `${mm}:${ss}` };
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 animate-pulse space-y-4">
      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-full" />
          <div className="h-4 bg-white/10 rounded w-3/4" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-white/5 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function QuizPage({ onSubmit }: QuizPageProps) {
  const { user, logout } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [showModal, setShowModal] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const questionRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Load questions
  useEffect(() => {
    fetchQuestions().then((qs) => {
      setQuestions(qs);
      setIsLoading(false);
    });
  }, []);

  const handleExpire = useCallback(() => {
    setShowModal(false);
    onSubmit(answers, questions, QUIZ_DURATION_SEC);
  }, [answers, questions, onSubmit]);

  const { remaining, elapsed, formatted } = useCountdown(QUIZ_DURATION_SEC, handleExpire);
  const isUrgent = remaining <= 5 * 60; // < 5 min

  // ── Answer selection ─────────────────────────────────────────────────────────
  function selectAnswer(questionId: number, key: OptionKey) {
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  function confirmSubmit() {
    setShowModal(false);
    onSubmit(answers, questions, elapsed);
  }

  // ── Jump to question ─────────────────────────────────────────────────────────
  function jumpTo(id: number) {
    setActiveQuestion(id);
    questionRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#080b14] text-white">
      {/* ── STICKY HEADER ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#080b14]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo + title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-tight truncate">Bài thi Tschool</p>
              <p className="text-xs text-slate-400 leading-tight truncate">{user?.name}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="hidden sm:flex flex-col items-center gap-1 flex-1 max-w-xs">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">{answeredCount}/{questions.length} câu đã trả lời</p>
          </div>

          {/* Timer + logout */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono font-semibold transition-colors ${
              isUrgent
                ? "bg-red-500/15 border-red-500/40 text-red-400 animate-pulse"
                : "bg-white/5 border-white/10 text-slate-300"
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatted}
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        {/* ── QUESTION LIST ──────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            questions.map((q, idx) => {
              const selected = answers[q.id];
              const isActive = activeQuestion === q.id;
              return (
                <div
                  key={q.id}
                  ref={(el) => { if (el) questionRefs.current.set(q.id, el); }}
                  id={`question-${q.id}`}
                  className={`rounded-2xl border transition-all duration-300 scroll-mt-24 ${
                    isActive
                      ? "bg-indigo-500/5 border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                      : selected
                      ? "bg-white/[0.04] border-white/10"
                      : "bg-white/[0.03] border-white/[0.06] hover:border-white/15"
                  }`}
                >
                  {/* Question header */}
                  <div className="px-6 pt-5 pb-3 flex items-start gap-4">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${
                      selected
                        ? "bg-indigo-600 text-white"
                        : "bg-white/10 text-slate-400"
                    }`}>
                      {idx + 1}
                    </span>
                    <p className="text-[15px] text-slate-100 leading-relaxed pt-0.5 font-medium">
                      {q.question}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 ml-12">
                    {q.options.map((opt) => {
                      const isSelected = selected === opt.key;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => {
                            selectAnswer(q.id, opt.key);
                            setActiveQuestion(q.id);
                          }}
                          className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 cursor-pointer
                            ${isSelected
                              ? "bg-indigo-600/20 border-indigo-500/70 text-white shadow-md shadow-indigo-500/10"
                              : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.07] hover:border-white/20 hover:text-white active:scale-[0.98]"
                            }`}
                        >
                          {/* Key badge */}
                          <span className={`flex-shrink-0 w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                            isSelected ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-400 group-hover:bg-white/15"
                          }`}>
                            {opt.key}
                          </span>
                          <span className="text-sm leading-snug">{opt.text}</span>
                          {/* Check icon */}
                          {isSelected && (
                            <svg className="w-4 h-4 text-indigo-400 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          {/* Submit button (bottom) */}
          {!isLoading && (
            <div className="pt-4 pb-8 flex justify-center">
              <button
                onClick={() => setShowModal(true)}
                className="px-10 py-4 rounded-2xl font-bold text-lg text-white
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500
                  shadow-xl shadow-indigo-500/30
                  transition-all duration-200 active:scale-[0.98]
                  flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Nộp bài
              </button>
            </div>
          )}
        </main>

        {/* ── QUESTION NAVIGATOR (sidebar) ──────────────────────────────────── */}
        {!isLoading && (
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-20 bg-white/[0.04] border border-white/10 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Câu hỏi</h3>
              <div className="grid grid-cols-5 gap-1.5 mb-4">
                {questions.map((q, idx) => {
                  const done = !!answers[q.id];
                  return (
                    <button
                      key={q.id}
                      onClick={() => jumpTo(q.id)}
                      title={`Câu ${idx + 1}`}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        done
                          ? "bg-indigo-600 text-white hover:bg-indigo-500"
                          : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-1.5 pt-3 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-4 h-4 rounded bg-indigo-600" />
                  <span>Đã trả lời ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-4 h-4 rounded bg-white/10" />
                  <span>Chưa trả lời ({questions.length - answeredCount})</span>
                </div>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold text-white
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500
                  transition-all duration-200 shadow-lg shadow-indigo-500/20"
              >
                Nộp bài
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ── CONFIRM MODAL ─────────────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={showModal}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        onConfirm={confirmSubmit}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
}
