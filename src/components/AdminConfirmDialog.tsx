/**
 * AdminConfirmDialog.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Beautiful confirm/alert dialog to replace browser confirm() and alert().
 * Supports danger, warning, and info variants.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useEffect } from "react";

export type DialogVariant = "danger" | "warning" | "info";

export interface DialogConfig {
  variant: DialogVariant;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface AdminConfirmDialogProps extends DialogConfig {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_CONFIG: Record<DialogVariant, {
  icon: React.ReactNode;
  iconBg: string;
  confirmBtn: string;
  titleColor: string;
}> = {
  danger: {
    iconBg: "bg-red-500/10 border-red-500/30",
    titleColor: "text-red-400",
    confirmBtn: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-500/25",
    icon: (
      <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
  },
  warning: {
    iconBg: "bg-amber-500/10 border-amber-500/30",
    titleColor: "text-amber-400",
    confirmBtn: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/25",
    icon: (
      <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  info: {
    iconBg: "bg-indigo-500/10 border-indigo-500/30",
    titleColor: "text-indigo-300",
    confirmBtn: "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/25",
    icon: (
      <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
};

export default function AdminConfirmDialog({
  isOpen,
  variant,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  const cfg = VARIANT_CONFIG[variant];

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
        onClick={onCancel}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm bg-[#0f1629] border border-white/10 rounded-2xl p-6 shadow-2xl
          animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border ${cfg.iconBg}`}>
          {cfg.icon}
        </div>

        {/* Title */}
        <h2
          id="admin-dialog-title"
          className={`text-lg font-bold text-center mb-2 ${cfg.titleColor}`}
        >
          {title}
        </h2>

        {/* Message */}
        <p className="text-slate-300 text-sm text-center leading-relaxed mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 font-semibold text-sm
              hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white
              ${cfg.confirmBtn}
              shadow-lg transition-all duration-200 active:scale-[0.98]`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
