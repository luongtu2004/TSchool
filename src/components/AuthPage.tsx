/**
 * AuthPage.tsx  –  Login / Register page component
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 *  - Animated tab switch (Login ↔ Register)
 *  - Real-time form validation
 *  - Password strength indicator (Register)
 *  - Show/hide password toggle
 *  - Glassmorphism card on animated gradient background
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";

// ─── Password strength calculator ─────────────────────────────────────────────
function calcStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: "Rất yếu", color: "bg-red-500" },
    { label: "Yếu", color: "bg-orange-500" },
    { label: "Trung bình", color: "bg-yellow-400" },
    { label: "Mạnh", color: "bg-emerald-500" },
    { label: "Rất mạnh", color: "bg-emerald-400" },
  ];
  return { score, ...levels[score] };
}

// ─── Eye icon ─────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

// ─── Reusable Input ───────────────────────────────────────────────────────────
interface InputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  rightElement?: React.ReactNode;
  autoComplete?: string;
}

function FormInput({ id, label, type, value, onChange, placeholder, error, rightElement, autoComplete }: InputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500
            focus:outline-none focus:ring-2 transition-all duration-200 pr-${rightElement ? "12" : "4"}
            ${error
              ? "border-red-500/70 focus:ring-red-500/40"
              : "border-white/10 focus:ring-indigo-500/50 focus:border-indigo-500/50"
            }`}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-3 flex items-center">{rightElement}</div>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AuthPage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginErrors, setLoginErrors] = useState({ email: "", password: "" });

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regConfirmPw, setRegConfirmPw] = useState("");
  const [regErrors, setRegErrors] = useState({ name: "", email: "", password: "", confirm: "" });

  const pwStrength = calcStrength(regPw);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validateLogin(): boolean {
    const errs = { email: "", password: "" };
    if (!loginEmail) errs.email = "Vui lòng nhập email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) errs.email = "Email không hợp lệ.";
    if (!loginPw) errs.password = "Vui lòng nhập mật khẩu.";
    setLoginErrors(errs);
    return !errs.email && !errs.password;
  }

  function validateRegister(): boolean {
    const errs = { name: "", email: "", password: "", confirm: "" };
    if (!regName.trim() || regName.trim().length < 2) errs.name = "Họ tên phải có ít nhất 2 ký tự.";
    if (!regEmail) errs.email = "Vui lòng nhập email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) errs.email = "Email không hợp lệ.";
    if (regPw.length < 6) errs.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    if (regPw !== regConfirmPw) errs.confirm = "Mật khẩu xác nhận không khớp.";
    setRegErrors(errs);
    return !errs.name && !errs.email && !errs.password && !errs.confirm;
  }

  // ── Submit handlers ──────────────────────────────────────────────────────────
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validateLogin()) return;
    setIsSubmitting(true);
    const res = await login(loginEmail, loginPw);
    setIsSubmitting(false);
    if (!res.success) setServerError(res.error ?? "Đã xảy ra lỗi.");
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");
    if (!validateRegister()) return;
    setIsSubmitting(true);
    const res = await register(regName, regEmail, regPw);
    setIsSubmitting(false);
    if (!res.success) {
      setServerError(res.error ?? "Đã xảy ra lỗi.");
    } else if (res.pending) {
      setSuccessMessage("Đăng ký thành công! Vui lòng đợi quản trị viên phê duyệt tài khoản để đăng nhập.");
      setRegName("");
      setRegEmail("");
      setRegPw("");
      setRegConfirmPw("");
      setTab("login");
    }
  }

  // ── Tab switch reset ─────────────────────────────────────────────────────────
  function switchTab(t: "login" | "register") {
    setTab(t);
    setServerError("");
    setSuccessMessage("");
    setLoginErrors({ email: "", password: "" });
    setRegErrors({ name: "", email: "", password: "", confirm: "" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080b14] relative overflow-hidden px-4">
      {/* Animated blobs */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-violet-600/20 blur-3xl animate-pulse [animation-delay:1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-600/5 blur-3xl" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tschool Basic</h1>
          <p className="text-slate-400 text-sm mt-1">Nền tảng luyện thi trực tuyến</p>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Tab switcher */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-8">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  tab === t
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {serverError}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              <FormInput
                id="login-email"
                label="Email"
                type="email"
                value={loginEmail}
                onChange={setLoginEmail}
                placeholder="ten@email.com"
                error={loginErrors.email}
                autoComplete="email"
              />
              <FormInput
                id="login-password"
                label="Mật khẩu"
                type={showPw ? "text" : "password"}
                value={loginPw}
                onChange={setLoginPw}
                placeholder="••••••••"
                error={loginErrors.password}
                autoComplete="current-password"
                rightElement={
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-400 hover:text-white transition-colors">
                    <EyeIcon open={showPw} />
                  </button>
                }
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-semibold text-white
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500
                  disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-lg shadow-indigo-500/25
                  transition-all duration-200 active:scale-[0.98]
                  flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang đăng nhập…
                  </>
                ) : "Đăng nhập"}
              </button>

              <p className="text-center text-sm text-slate-400">
                Chưa có tài khoản?{" "}
                <button type="button" onClick={() => switchTab("register")} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Đăng ký ngay
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              <FormInput
                id="reg-name"
                label="Họ và tên"
                type="text"
                value={regName}
                onChange={setRegName}
                placeholder="Nguyễn Văn A"
                error={regErrors.name}
                autoComplete="name"
              />
              <FormInput
                id="reg-email"
                label="Email"
                type="email"
                value={regEmail}
                onChange={setRegEmail}
                placeholder="ten@email.com"
                error={regErrors.email}
                autoComplete="email"
              />
              <div>
                <FormInput
                  id="reg-password"
                  label="Mật khẩu"
                  type={showPw ? "text" : "password"}
                  value={regPw}
                  onChange={setRegPw}
                  placeholder="Tối thiểu 6 ký tự"
                  error={regErrors.password}
                  autoComplete="new-password"
                  rightElement={
                    <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-400 hover:text-white transition-colors">
                      <EyeIcon open={showPw} />
                    </button>
                  }
                />
                {/* Strength meter */}
                {regPw && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < pwStrength.score ? pwStrength.color : "bg-white/10"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">{pwStrength.label}</p>
                  </div>
                )}
              </div>
              <FormInput
                id="reg-confirm"
                label="Xác nhận mật khẩu"
                type={showConfirmPw ? "text" : "password"}
                value={regConfirmPw}
                onChange={setRegConfirmPw}
                placeholder="Nhập lại mật khẩu"
                error={regErrors.confirm}
                autoComplete="new-password"
                rightElement={
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="text-slate-400 hover:text-white transition-colors">
                    <EyeIcon open={showConfirmPw} />
                  </button>
                }
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-semibold text-white
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500
                  disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-lg shadow-indigo-500/25
                  transition-all duration-200 active:scale-[0.98]
                  flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang tạo tài khoản…
                  </>
                ) : "Tạo tài khoản"}
              </button>

              <p className="text-center text-sm text-slate-400">
                Đã có tài khoản?{" "}
                <button type="button" onClick={() => switchTab("login")} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Đăng nhập
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs text-slate-600 mt-4">
          Demo: Đăng ký tài khoản mới để bắt đầu
        </p>
      </div>
    </div>
  );
}
