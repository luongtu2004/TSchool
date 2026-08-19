"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Question, OptionKey } from "@/lib/quizData";
import { UserAnswers } from "./QuizPage";
import { useAuth } from "@/contexts/AuthContext";
import AdminConfirmDialog, { DialogConfig } from "./AdminConfirmDialog";

interface ResultPageProps {
  questions: Question[];
  answers: UserAnswers;
  timeUsedSec: number;
  onRetry: () => void;
  onBackHome?: () => void;
}

function calculateScore(questions: Question[], answers: UserAnswers) {
  let correct = 0, wrong = 0, skipped = 0;
  for (const q of questions) {
    const a = answers[q.id];
    if (!a) skipped++;
    else if (a === q.answer) correct++;
    else wrong++;
  }
  const total = questions.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const score = total > 0 ? Math.round((correct / total) * 100) / 10 : 0;
  return { correct, wrong, skipped, total, pct, score, passed: pct >= 50 };
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s} giây`;
  return `${m} phút ${s > 0 ? s + " giây" : ""}`;
}

// Kahoot option colors for review
const TILE_CORRECT = "bg-emerald-600 border-emerald-500";
const TILE_WRONG   = "bg-red-600   border-red-500";
const TILE_NEUTRAL = "bg-white/5   border-white/10 text-slate-500";
const TILE_COLORS: Record<OptionKey, string> = {
  A: "bg-[#1368ce]/40 border-[#1368ce]/60",
  B: "bg-[#d89e00]/40 border-[#d89e00]/60",
  C: "bg-[#d13b3b]/40 border-[#d13b3b]/60",
  D: "bg-[#238c23]/40 border-[#238c23]/60",
};
const TILE_ICONS: Record<OptionKey, string> = { A: "A", B: "B", C: "C", D: "D" };

function getTileClass(key: OptionKey, correct: OptionKey, user?: OptionKey) {
  if (key === correct && key === user) return `${TILE_CORRECT} text-white`;
  if (key === correct)                 return `${TILE_CORRECT} text-white`;
  if (key === user)                    return `${TILE_WRONG} text-white`;
  return `${TILE_NEUTRAL}`;
}

export default function ResultPage({ questions, answers, timeUsedSec, onRetry, onBackHome }: ResultPageProps) {
  const { user, logout } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [dialog, setDialog] = useState<(DialogConfig & { onConfirm: () => void }) | null>(null);
  const r = useMemo(() => calculateScore(questions, answers), [questions, answers]);

  const gradeInfo = r.pct >= 90
    ? { label: "Xuất sắc 🏆", color: "text-amber-400" }
    : r.pct >= 75
    ? { label: "Giỏi 🎉",     color: "text-blue-400" }
    : r.pct >= 50
    ? { label: "Đạt ✅",      color: "text-emerald-400" }
    : { label: "Chưa đạt ❌", color: "text-red-400" };

  const displayQs = showAll ? questions : questions.slice(0, 5);
  const circumference = 2 * Math.PI * 38;

  return (
    <div className="min-h-screen bg-[#080b14] text-white">
      {/* Ambient glow */}
      <div className={`fixed top-0 right-0 w-72 h-72 sm:w-[500px] sm:h-[500px] rounded-full blur-3xl opacity-15 pointer-events-none ${r.passed ? "bg-emerald-600" : "bg-red-700"}`} />
      <div className="fixed bottom-0 left-0 w-64 h-64 rounded-full bg-indigo-700/10 blur-3xl pointer-events-none" />

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-[#080b14]/90 backdrop-blur-xl border-b border-white/10">
        <div className="w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Kết quả bài thi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-[120px]">{user?.name}</span>
            <Link
              href="/admin"
              title="Thêm câu hỏi"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                bg-violet-600/20 text-violet-300 border border-violet-500/30
                hover:bg-violet-600/40 hover:text-white transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Thêm câu
            </Link>
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
              className="p-2 text-slate-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
              title="Đăng xuất"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ── SCORE HERO ───────────────────────────────────────────────────── */}
        <div className={`w-full rounded-2xl border text-center px-4 py-8 flex flex-col items-center ${r.passed ? "bg-emerald-500/5 border-emerald-500/25" : "bg-red-500/5 border-red-500/25"}`}>
          {/* Badge */}
          <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold mb-6 ${r.passed ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
            {r.passed
              ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
              : <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
            }
            {r.passed ? "ĐẠT" : "CHƯA ĐẠT"}
          </div>

          {/* Score ring */}
          <div className="flex justify-center mb-5">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
                <circle cx="42" cy="42" r="38" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
                <circle
                  cx="42" cy="42" r="38" fill="none"
                  stroke={r.passed ? "#10b981" : "#ef4444"}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - r.pct / 100)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold leading-none">{r.score}</span>
                <span className="text-xs text-slate-400 mt-0.5">/ 10</span>
              </div>
            </div>
          </div>

          <p className={`text-xl font-bold ${gradeInfo.color}`}>{gradeInfo.label}</p>
          <p className="text-slate-400 text-sm mt-1">{user?.name} · {formatTime(timeUsedSec)}</p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            {[
              { v: `${r.correct}/${r.total}`, l: "Đúng",     c: "text-emerald-400" },
              { v: r.wrong,                   l: "Sai",      c: "text-red-400" },
              { v: r.skipped,                 l: "Bỏ trống", c: "text-amber-400" },
              { v: `${r.pct}%`,               l: "Tỷ lệ",   c: "text-indigo-400" },
            ].map(({ v, l, c }) => (
              <div key={l} className="bg-black/20 border border-white/10 rounded-xl py-3 px-1">
                <p className={`text-xl font-bold ${c}`}>{v}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── ACTION BUTTONS ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onRetry}
            className="py-3.5 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.97]
              flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Làm lại
          </button>
          {onBackHome ? (
            <button
              onClick={onBackHome}
              className="py-3.5 rounded-xl font-semibold text-sm text-slate-300
                border border-white/15 hover:bg-white/5 hover:text-white
                transition-all active:scale-[0.97]
                flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Đổi đề
            </button>
          ) : (
            <button
              onClick={() => document.getElementById("review")?.scrollIntoView({ behavior: "smooth" })}
              className="py-3.5 rounded-xl font-semibold text-sm text-slate-300
                border border-white/15 hover:bg-white/5 hover:text-white
                transition-all active:scale-[0.97]
                flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Xem đáp án
            </button>
          )}
        </div>

        {/* ── ANSWER REVIEW ────────────────────────────────────────────────── */}
        <section id="review" className="space-y-4 pb-8">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Chi tiết đáp án
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-600 inline-block" />Đúng</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600 inline-block" />Sai</span>
            </div>
          </div>

          {displayQs.map((q, idx) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.answer;
            const isSkipped = !userAns;

            return (
              <div key={q.id} className={`rounded-2xl overflow-hidden border-2 ${
                isSkipped  ? "border-amber-500/30"
                : isCorrect ? "border-emerald-500/30"
                :             "border-red-500/30"
              }`}>
                {/* Question panel */}
                <div className={`px-4 pt-4 pb-3 ${
                  isSkipped  ? "bg-amber-500/5"
                  : isCorrect ? "bg-[#1a3d2a]"
                  :             "bg-[#3d1a1a]"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {/* Status icon */}
                    <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isSkipped  ? "bg-amber-500/20 text-amber-400"
                      : isCorrect ? "bg-emerald-500/20 text-emerald-300"
                      :             "bg-red-500/20 text-red-300"
                    }`}>
                      {isSkipped ? "—" : isCorrect
                        ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                        : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                      }
                    </span>
                    <span className="text-xs text-white/50 font-medium">Câu {idx + 1}</span>
                  </div>
                  <p className="text-sm sm:text-[15px] text-white font-medium leading-snug text-center px-2">
                    {q.question}
                  </p>
                  {/* Image if any */}
                  {q.imageUrl && (
                    <div className="mt-3 flex justify-center">
                      <img src={q.imageUrl} alt="" className="w-full max-h-52 rounded-lg object-contain bg-black/20" />
                    </div>
                  )}
                </div>

                {/* Answer tiles */}
                <div className="grid grid-cols-2 gap-1.5 p-2 bg-[#100d1f]">
                  {q.options.map((opt) => {
                    const isOpt = opt.key === userAns;
                    const isCorrectOpt = opt.key === q.answer;
                    let cls = "";
                    if (isCorrectOpt) cls = `bg-emerald-600 border-emerald-500 text-white`;
                    else if (isOpt)   cls = `bg-red-600 border-red-500 text-white`;
                    else              cls = `bg-white/5 border-white/10 text-slate-500`;

                    return (
                      <div key={opt.key} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium min-h-[48px] ${cls}`}>
                        <span className="w-6 h-6 rounded-md bg-black/20 flex items-center justify-center text-xs font-black flex-shrink-0">
                          {opt.key}
                        </span>
                        <span className="leading-snug line-clamp-2">{opt.text}</span>
                        {isCorrectOpt && (
                          <svg className="w-4 h-4 ml-auto flex-shrink-0 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                        )}
                        {isOpt && !isCorrectOpt && (
                          <svg className="w-4 h-4 ml-auto flex-shrink-0 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Skipped note */}
                {isSkipped && (
                  <div className="mx-3 mb-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                    Bỏ trống · Đáp án đúng: <strong className="text-emerald-400 ml-1">{q.answer}</strong>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="mx-3 mb-3 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex gap-2">
                    <svg className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                    <span><strong className="text-indigo-300">Giải thích:</strong> {q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Show more */}
          {!showAll && questions.length > 5 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-3.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium
                hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
              Xem thêm {questions.length - 5} câu còn lại
            </button>
          )}
        </section>
      </div>

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
