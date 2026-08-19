/**
 * Toast.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Beautiful toast notification that slides in from the right.
 * Supports "success", "error", "warning", "info" types.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastItemProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const TOAST_CONFIG: Record<
  ToastType,
  { icon: React.ReactNode; bar: string; bg: string; border: string; title: string }
> = {
  success: {
    bar: "bg-emerald-500",
    bg: "bg-[#0d1f17] hover:bg-[#0f2319]",
    border: "border-emerald-500/30",
    title: "text-emerald-400",
    icon: (
      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  error: {
    bar: "bg-red-500",
    bg: "bg-[#1f0d0d] hover:bg-[#231010]",
    border: "border-red-500/30",
    title: "text-red-400",
    icon: (
      <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  warning: {
    bar: "bg-amber-500",
    bg: "bg-[#1f1a0d] hover:bg-[#231d10]",
    border: "border-amber-500/30",
    title: "text-amber-400",
    icon: (
      <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  info: {
    bar: "bg-indigo-500",
    bg: "bg-[#0d1020] hover:bg-[#0f1225]",
    border: "border-indigo-500/30",
    title: "text-indigo-400",
    icon: (
      <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [visible, setVisible] = useState(false);
  const cfg = TOAST_CONFIG[toast.type];

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto remove after 4.5s
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 350);
    }, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [toast.id, onRemove]);

  return (
    <div
      className={`relative overflow-hidden w-80 rounded-xl border shadow-2xl shadow-black/40 transition-all duration-350 ease-out cursor-pointer
        ${cfg.bg} ${cfg.border}
        ${visible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-10 pointer-events-none"
        }`}
      onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 350); }}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar}`} />

      <div className="flex items-start gap-3 px-4 py-3 pl-5">
        <div className="mt-0.5">{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${cfg.title}`}>{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
          )}
        </div>
        {/* Close button */}
        <button
          onClick={(e) => { e.stopPropagation(); setVisible(false); setTimeout(() => onRemove(toast.id), 350); }}
          className="text-slate-500 hover:text-slate-300 transition-colors mt-0.5 flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className={`absolute bottom-0 left-1 right-0 h-0.5 ${cfg.bar} opacity-40`}
        style={{ animation: "toast-progress 4.5s linear forwards" }}
      />
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2.5 pointer-events-none">
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
