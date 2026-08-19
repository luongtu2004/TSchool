/**
 * QuizPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Main quiz interface – redesigned with Kahoot/Wayground style:
 *  - Dark purple header with question text (centered)
 *  - Optional image between question and answers
 *  - 4 large colorful answer tiles in a 2×2 grid
 *  - Sticky header with countdown timer + progress bar
 *  - Sidebar question navigator
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Question, OptionKey, fetchQuestions } from "@/lib/quizData";
import { useAuth } from "@/contexts/AuthContext";
import ConfirmModal from "./ConfirmModal";
import AdminConfirmDialog, { DialogConfig } from "./AdminConfirmDialog";

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserAnswers = Record<number, OptionKey>;

interface QuizPageProps {
  onSubmit: (answers: UserAnswers, questions: Question[], timeUsed: number) => void;
  examId?: number;
  examName?: string;
  timeLimitMin?: number;
  onBackHome?: () => void;
}

// ─── Timer hook ───────────────────────────────────────────────────────────────

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

// ─── Option colors (Kahoot-style: blue, red, yellow, green) ──────────────────
const OPTION_STYLES: Record<OptionKey, { bg: string; hoverBg: string; selectedBg: string; label: string }> = {
  A: {
    bg: "bg-white/5",
    hoverBg: "hover:bg-white/10",
    selectedBg: "bg-emerald-600 border border-emerald-500",
    label: "A",
  },
  B: {
    bg: "bg-white/5",
    hoverBg: "hover:bg-white/10",
    selectedBg: "bg-emerald-600 border border-emerald-500",
    label: "B",
  },
  C: {
    bg: "bg-white/5",
    hoverBg: "hover:bg-white/10",
    selectedBg: "bg-emerald-600 border border-emerald-500",
    label: "C",
  },
  D: {
    bg: "bg-white/5",
    hoverBg: "hover:bg-white/10",
    selectedBg: "bg-emerald-600 border border-emerald-500",
    label: "D",
  },
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-[#2d2060] h-32 rounded-t-2xl" />
      <div className="grid grid-cols-2 gap-2 p-2 bg-[#1a1040]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}

// ─── Single Question Card (Kahoot style) ─────────────────────────────────────
interface QuestionCardProps {
  q: Question;
  idx: number;
  selected: OptionKey | undefined;
  isActive: boolean;
  onSelect: (key: OptionKey) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}

function QuestionCard({ q, idx, selected, isActive, onSelect, cardRef }: QuestionCardProps) {
  return (
    <div
      ref={cardRef}
      id={`question-${q.id}`}
      className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 scroll-mt-24 ${
        isActive
          ? "border-violet-400/60 shadow-xl shadow-violet-500/20"
          : selected
          ? "border-indigo-500/40 shadow-lg shadow-indigo-500/10"
          : "border-white/[0.06] hover:border-white/20"
      }`}
    >
      {/* ── Question header (dark purple panel) ────────────────────────────── */}
      <div className="bg-gradient-to-b from-[#2d2060] to-[#1e1545] px-6 pt-5 pb-4 relative">
        {/* Question number badge */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold flex-shrink-0 transition-colors ${
              selected ? "bg-violet-600 text-white" : "bg-white/15 text-slate-300"
            }`}
          >
            {idx + 1}
          </span>
        </div>

        {/* Question text */}
        <p className="text-left text-white text-[16px] sm:text-[18px] font-semibold leading-snug min-h-[2.5rem]">
          {q.question}
        </p>

        {/* Optional image */}
        {q.imageUrl && (
          <div className="mt-4 flex justify-center">
            <div className="relative w-full rounded-xl overflow-hidden border border-white/10">
              <img
                src={q.imageUrl}
                alt={`Hình minh họa câu ${idx + 1}`}
                className="w-full h-auto max-h-72 object-contain bg-black/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Answer tiles (1 col mobile, 2 cols desktop) ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2.5 bg-[#100d1f]">
        {q.options.map((opt) => {
          const style = OPTION_STYLES[opt.key];
          const isSelected = selected === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onSelect(opt.key)}
              className={`
                group relative flex items-center gap-3 px-4 py-4 rounded-xl
                text-white font-semibold text-sm leading-snug text-left
                transition-all duration-150 cursor-pointer min-h-[64px]
                ${isSelected
                  ? `${style.selectedBg} ring-2 ring-white/70 shadow-lg scale-[0.98]`
                  : `${style.bg} ${style.hoverBg} hover:scale-[1.02] active:scale-[0.97]`
                }
              `}
            >
              {/* Letter label */}
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base font-extrabold flex-shrink-0 transition-colors shadow-sm ${
                isSelected ? "bg-white text-slate-900" : "bg-white/25 text-white"
              }`}>
                {style.label}
              </span>
              <span className="flex-1 line-clamp-3">{opt.text}</span>
              {/* Check mark when selected */}
              {isSelected && (
                <svg className="w-5 h-5 text-white/90 flex-shrink-0 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function QuizPage({ onSubmit, examId, examName, timeLimitMin, onBackHome }: QuizPageProps) {
  const { user, logout } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [showModal, setShowModal] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [dialog, setDialog] = useState<(DialogConfig & { onConfirm: () => void }) | null>(null);

  const questionRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    fetchQuestions(examId).then((qs) => {
      setQuestions(qs);
      setIsLoading(false);
    });
  }, [examId]);

  const durationSec = (timeLimitMin || 45) * 60;

  const handleExpire = useCallback(() => {
    setShowModal(false);
    onSubmit(answers, questions, durationSec);
  }, [answers, questions, onSubmit, durationSec]);

  const { remaining, elapsed, formatted } = useCountdown(durationSec, handleExpire);
  const isUrgent = remaining <= 5 * 60;

  function selectAnswer(questionId: number, key: OptionKey) {
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
    setActiveQuestion(questionId);
  }

  function confirmSubmit() {
    setShowModal(false);
    onSubmit(answers, questions, elapsed);
  }

  function jumpTo(id: number) {
    setActiveQuestion(id);
    questionRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#080b14] text-white">
      {/* ── STICKY HEADER ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#080b14]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* ── LEFT: Back + Logo + Title ── */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onBackHome && (
              <button
                onClick={() => {
                  setDialog({
                    variant: "warning",
                    title: "Thoát bài thi?",
                    message: "Bạn có chắc chắn muốn thoát? Kết quả làm bài hiện tại sẽ không được lưu.",
                    confirmLabel: "Thoát",
                    cancelLabel: "Ở lại",
                    onConfirm: () => {
                      setDialog(null);
                      onBackHome();
                    }
                  });
                }}
                title="Thoát"
                className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
            )}

            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 hidden sm:flex">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <div className="min-w-0">
              <p className="text-[13px] sm:text-sm font-semibold text-white leading-tight truncate">{examName ?? "Bài thi Tschool"}</p>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-tight truncate">Đang làm bài...</p>
            </div>
          </div>

          {/* ── CENTER: Progress (Hidden on mobile) ── */}
          <div className="hidden md:flex flex-col items-center gap-1 flex-1 max-w-xs mx-4">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">{answeredCount}/{questions.length} câu đã trả lời</p>
          </div>

          {/* ── RIGHT: Timer + Nav + Logout ── */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            
            {/* Timer */}
            <div className={`flex items-center gap-1.5 font-mono font-bold tracking-tight transition-colors ${
              isUrgent ? "text-red-400 animate-pulse" : "text-white"
            }`}>
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isUrgent ? "text-red-400" : "text-slate-400"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[15px] sm:text-lg mt-[1px]">{formatted}</span>
            </div>
            
            {/* Nav Toggle (Mobile only) */}
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              title="Danh sách câu hỏi"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                setDialog({
                  variant: "danger",
                  title: "Đăng xuất?",
                  message: "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?",
                  confirmLabel: "Đăng xuất",
                  cancelLabel: "Hủy",
                  onConfirm: () => {
                    setDialog(null);
                    logout();
                  }
                });
              }}
              title="Đăng xuất"
              className="p-2 -mr-2 sm:mr-0 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE NAV OVERLAY ────────────────────────────────────────────────── */}
      {isNavOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-black/60 backdrop-blur-sm" onClick={() => setIsNavOpen(false)}>
          <div className="absolute top-[72px] inset-x-0 bg-[#101426] border-b border-white/10 p-4 max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Danh sách câu hỏi</h3>
            <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 mb-4">
              {questions.map((q, idx) => {
                const done = !!answers[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => { jumpTo(q.id); setIsNavOpen(false); }}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center ${
                      done
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            {/* Mobile Nav Legend */}
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
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* ── QUESTION LIST ──────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-5 pb-24 sm:pb-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                q={q}
                idx={idx}
                selected={answers[q.id]}
                isActive={activeQuestion === q.id}
                onSelect={(key) => selectAnswer(q.id, key)}
                cardRef={(el) => { if (el) questionRefs.current.set(q.id, el); }}
              />
            ))
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

        {/* ── QUESTION NAVIGATOR (DESKTOP ONLY) ───────────────────────────── */}
        {!isLoading && (
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-20 bg-white/[0.04] border border-white/10 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Danh sách câu hỏi</h3>
              
              <div className="grid grid-cols-5 gap-1.5 mb-4 max-h-[60vh] overflow-y-auto pr-1">
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

      {/* Mobile FAB removed to prevent overlap and UX confusion */}

      {/* ── GLOBAL DIALOG ─────────────────────────────────────────────────────── */}
      {dialog && (
        <AdminConfirmDialog
          isOpen={true}
          variant={dialog.variant}
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          onConfirm={dialog.onConfirm}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>

  );
}
