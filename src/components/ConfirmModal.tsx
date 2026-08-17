/**
 * ConfirmModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable confirmation modal with backdrop blur, scale animation and
 * unanswered-question warning.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  totalQuestions: number;
  answeredCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  totalQuestions,
  answeredCount,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Trap focus & close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const unanswered = totalQuestions - answeredCount;
  const pct = Math.round((answeredCount / totalQuestions) * 100);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md bg-[#0f1629] border border-white/10 rounded-2xl p-8 shadow-2xl
          animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${
          unanswered > 0
            ? "bg-amber-500/15 border border-amber-500/30"
            : "bg-emerald-500/15 border border-emerald-500/30"
        }`}>
          {unanswered > 0 ? (
            <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h2 id="modal-title" className="text-xl font-bold text-white text-center mb-2">
          Xác nhận nộp bài?
        </h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          Sau khi nộp bài, bạn sẽ không thể thay đổi câu trả lời.
        </p>

        {/* Progress summary */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Tiến độ hoàn thành</span>
            <span className={`font-semibold ${pct === 100 ? "text-emerald-400" : "text-amber-400"}`}>
              {pct}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${pct === 100 ? "bg-emerald-500" : "bg-amber-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Đã trả lời</span>
            <span className="text-white font-medium">{answeredCount} / {totalQuestions} câu</span>
          </div>
          {unanswered > 0 && (
            <div className="flex items-center gap-2 pt-1 text-amber-400 text-xs">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Bạn còn {unanswered} câu chưa trả lời. Những câu này sẽ bị tính sai.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-medium
              hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            Làm tiếp
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-semibold text-white
              bg-gradient-to-r from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98]"
          >
            Nộp bài
          </button>
        </div>
      </div>
    </div>
  );
}
