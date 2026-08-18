"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type OptionKey = "A" | "B" | "C" | "D";
type Tab = "add-question" | "create-exam" | "manage-questions" | "manage-users" | "view-scores";

const OPTION_COLORS: Record<OptionKey, string> = {
  A: "border-[#1368ce] bg-[#1368ce]/10",
  B: "border-[#d89e00] bg-[#d89e00]/10",
  C: "border-[#d13b3b] bg-[#d13b3b]/10",
  D: "border-[#238c23] bg-[#238c23]/10",
};
const OPTION_DOT: Record<OptionKey, string> = {
  A: "bg-[#1368ce]",
  B: "bg-[#d89e00]",
  C: "bg-[#d13b3b]",
  D: "bg-[#238c23]",
};

const EMPTY_FORM = {
  question: "", option_a: "", option_b: "", option_c: "", option_d: "",
  answer: "A" as OptionKey, explanation: "",
};

interface Exam { id: number; name: string; description?: string }
interface DbQuestion {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: OptionKey;
  explanation?: string;
  image_url?: string;
  exam_id: number;
  created_at?: string;
}
interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: "admin" | "student";
  approved: boolean;
  created_at?: string;
}
interface QuizAttempt {
  id: number;
  user_id: number;
  exam_id: number;
  score: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  total_count: number;
  time_used_sec: number;
  created_at: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("add-question");

  // ── Add question state ────────────────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Create exam state ─────────────────────────────────────────────────────
  const [examName, setExamName] = useState("");
  const [examDesc, setExamDesc] = useState("");
  const [isCreatingExam, setIsCreatingExam] = useState(false);

  // ── Manage Questions state ────────────────────────────────────────────────
  const [questionsList, setQuestionsList] = useState<DbQuestion[]>([]);
  const [selectedFilterExamId, setSelectedFilterExamId] = useState<string>("all");
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);

  // ── Manage Users state ────────────────────────────────────────────────────
  const [profilesList, setProfilesList] = useState<UserProfile[]>([]);
  const [isProfilesLoading, setIsProfilesLoading] = useState(false);

  // ── View Scores state ─────────────────────────────────────────────────────
  const [attemptsList, setAttemptsList] = useState<QuizAttempt[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isAttemptsLoading, setIsAttemptsLoading] = useState(false);

  // ── Shared ────────────────────────────────────────────────────────────────
  const [exams, setExams] = useState<Exam[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Auth guard check ──────────────────────────────────────────────────────
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (user) {
      setIsReady(true);
    }
  }, [user]);

  // Load URL tab query if any
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["add-question", "create-exam", "manage-questions", "manage-users", "view-scores"].includes(tabParam)) {
        setTab(tabParam as Tab);
      }
    }
  }, []);

  // Load tab data
  useEffect(() => {
    if (!isReady) return;
    
    loadExams();

    if (tab === "manage-questions") {
      loadQuestions();
    } else if (tab === "manage-users") {
      loadProfiles();
    } else if (tab === "view-scores") {
      loadAttempts();
    }
  }, [tab, selectedFilterExamId, isReady]);

  async function loadExams() {
    const { data } = await supabase.from("exams").select("id, name, description").order("created_at", { ascending: false });
    if (data) setExams(data);
  }

  async function loadQuestions() {
    setIsQuestionsLoading(true);
    let query = supabase.from("questions").select("*").order("created_at", { ascending: false });
    if (selectedFilterExamId !== "all") {
      query = query.eq("exam_id", parseInt(selectedFilterExamId));
    }
    const { data } = await query;
    if (data) setQuestionsList(data as DbQuestion[]);
    setIsQuestionsLoading(false);
  }

  async function loadProfiles() {
    setIsProfilesLoading(true);
    const { data } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false });
    if (data) setProfilesList(data as UserProfile[]);
    setIsProfilesLoading(false);
  }

  async function loadAttempts() {
    setIsAttemptsLoading(true);
    const { data: attemptsData } = await supabase.from("quiz_attempts").select("*").order("created_at", { ascending: false });
    const { data: profilesData } = await supabase.from("user_profiles").select("*");
    if (attemptsData) setAttemptsList(attemptsData as QuizAttempt[]);
    if (profilesData) setAllProfiles(profilesData as UserProfile[]);
    setIsAttemptsLoading(false);
  }

  function setField(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  }

  // ── Create exam handler ───────────────────────────────────────────────────
  async function handleCreateExam(e: FormEvent) {
    e.preventDefault();
    if (!examName.trim()) { showToast("error", "Vui lòng nhập tên đề thi."); return; }
    setIsCreatingExam(true);
    try {
      const { error } = await supabase.from("exams").insert({
        name: examName.trim(),
        description: examDesc.trim() || null,
      });
      if (error) throw error;
      showToast("success", `✅ Đã tạo đề "${examName.trim()}" thành công!`);
      setExamName("");
      setExamDesc("");
      await loadExams();
      setTab("add-question");
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Lỗi không xác định.");
    } finally {
      setIsCreatingExam(false);
    }
  }

  // ── Add question handler ──────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.question.trim() || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      showToast("error", "Vui lòng điền đầy đủ câu hỏi và 4 đáp án.");
      return;
    }
    if (!selectedExamId) {
      showToast("error", "Vui lòng chọn đề thi cho câu hỏi này.");
      return;
    }

    setIsSubmitting(true);
    let imageUrl: string | null = null;

    try {
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const fileName = `question_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("question-images")
          .upload(fileName, imageFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("question-images").getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("questions").insert({
        question: form.question.trim(),
        option_a: form.option_a.trim(),
        option_b: form.option_b.trim(),
        option_c: form.option_c.trim(),
        option_d: form.option_d.trim(),
        answer: form.answer,
        explanation: form.explanation.trim() || null,
        image_url: imageUrl,
        exam_id: parseInt(selectedExamId),
      });

      if (error) throw error;

      showToast("success", "✅ Câu hỏi đã được thêm! Đang về trang chủ…");
      setForm(EMPTY_FORM);
      removeImage();
      setTimeout(() => router.push("/"), 1800);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Manage Questions handlers ─────────────────────────────────────────────
  async function handleDeleteQuestion(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw error;
      showToast("success", "🗑️ Đã xóa câu hỏi thành công.");
      loadQuestions();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Không thể xóa câu hỏi.");
    }
  }

  // ── Manage Users handlers ─────────────────────────────────────────────────
  async function toggleApproveUser(userId: number, currentApproved: boolean) {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ approved: !currentApproved })
        .eq("id", userId);
      if (error) throw error;
      showToast("success", `Đã ${!currentApproved ? "duyệt" : "hủy duyệt"} tài khoản thành công.`);
      loadProfiles();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Lỗi cập nhật trạng thái duyệt.");
    }
  }

  async function toggleRoleUser(userId: number, currentRole: string) {
    const nextRole = currentRole === "admin" ? "student" : "admin";
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ role: nextRole })
        .eq("id", userId);
      if (error) throw error;
      showToast("success", "Đã cập nhật chức vụ thành công.");
      loadProfiles();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Lỗi cập nhật chức vụ.");
    }
  }

  async function handleDeleteUser(userId: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này? Tất cả kết quả thi liên quan cũng sẽ bị xóa.")) return;
    try {
      const { error } = await supabase.from("user_profiles").delete().eq("id", userId);
      if (error) throw error;
      showToast("success", "Đã xóa tài khoản thành công.");
      loadProfiles();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Không thể xóa tài khoản.");
    }
  }

  // ── View Scores handler ───────────────────────────────────────────────────
  async function handleClearAttempts() {
    if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử điểm số?")) return;
    try {
      const { error } = await supabase.from("quiz_attempts").delete().neq("id", 0);
      if (error) throw error;
      showToast("success", "🧹 Đã xóa sạch lịch sử bảng điểm.");
      loadAttempts();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Không thể xóa bảng điểm.");
    }
  }

  // Auth Protection render
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#080b14] flex flex-col items-center justify-center text-center p-6 text-white relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 max-w-sm shadow-2xl relative z-10">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2">Quyền truy cập bị từ chối</h1>
          <p className="text-slate-400 text-sm mb-6">Chức năng này chỉ dành cho tài khoản Quản trị viên (Admin).</p>
          <Link href="/" className="inline-block w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-all">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b14] text-white">
      <div className="fixed -top-32 -left-32 w-96 h-96 rounded-full bg-violet-700/10 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-700/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#080b14]/90 backdrop-blur-xl border-b border-white/10">
        <div className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Về trang chủ
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.357.205a1.125 1.125 0 01-1.4-.205l-1.91-1.91a1.125 1.125 0 010-1.591l1.91-1.91a1.125 1.125 0 011.4-.08l.356.205c.523.3.71.96.457 1.511-.401.89-.732 1.82-1.01 2.783zm1.12-6.24a20.088 20.088 0 00-.985-2.783 1.125 1.125 0 01.463-1.511l.357-.205a1.125 1.125 0 011.4.205l1.91 1.91a1.125 1.125 0 010 1.591l-1.91 1.91a1.125 1.125 0 01-1.4.08l-.356-.205c-.523-.3-.71-.96-.457-1.511.401-.89.732-1.82 1.01-2.783z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">T+ School Admin</span>
          </div>
        </div>
      </header>

      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        {/* Toast */}
        {toast && (
          <div className={`mb-5 px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-3 transition-all animate-pulse ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            {toast.type === "success"
              ? <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
              : <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            }
            {toast.msg}
          </div>
        )}

        {/* Tab switcher - Admin dashboard horizontal menu */}
        <div className="flex flex-wrap bg-white/5 rounded-xl p-1 mb-6 gap-1 sm:gap-0">
          {([
            { key: "add-question", label: "➕ Thêm câu" },
            { key: "create-exam",  label: "📋 Tạo đề" },
            { key: "manage-questions", label: "📚 Quản lý câu hỏi" },
            { key: "manage-users", label: "👥 Tài khoản" },
            { key: "view-scores", label: "🏆 Điểm số" },
          ] as { key: Tab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 min-w-[100px] py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === key
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── CREATE EXAM TAB ─────────────────────────────────────────────── */}
        {tab === "create-exam" && (
          <form onSubmit={handleCreateExam} className="space-y-4 max-w-2xl mx-auto">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold">Tạo đề thi mới</h2>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  📋 Tên đề thi <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Đề ôn tập PLC"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">📝 Mô tả (tuỳ chọn)</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả ngắn về đề thi…"
                  value={examDesc}
                  onChange={(e) => setExamDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                    resize-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Existing exams list */}
            {exams.length > 0 && (
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">📚 Đề thi hiện có ({exams.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {exams.map((ex) => (
                    <div key={ex.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{ex.name}</p>
                        {ex.description && <p className="text-xs text-slate-400 truncate">{ex.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isCreatingExam}
              className="w-full py-4 rounded-2xl font-bold text-white
                bg-gradient-to-r from-indigo-600 to-violet-600
                hover:from-indigo-500 hover:to-violet-500
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-xl shadow-indigo-500/30
                transition-all active:scale-[0.99]
                flex items-center justify-center gap-3 text-base"
            >
              {isCreatingExam ? (
                <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Đang tạo…</>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>Tạo đề thi</>
              )}
            </button>
          </form>
        )}

        {/* ── ADD QUESTION TAB ────────────────────────────────────────────── */}
        {tab === "add-question" && (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
            {/* Select exam */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 shadow-xl">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                📋 Chọn đề thi <span className="text-red-400">*</span>
              </label>
              {exams.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                  Chưa có đề thi.{" "}
                  <button type="button" onClick={() => setTab("create-exam")} className="underline font-semibold hover:text-amber-300">
                    Tạo đề trước
                  </button>
                </div>
              ) : (
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                    transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a1040]">-- Chọn đề thi --</option>
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id} className="bg-[#1a1040]">{ex.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Question */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 shadow-xl">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                📝 Nội dung câu hỏi <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Nhập nội dung câu hỏi…"
                value={form.question}
                onChange={(e) => setField("question", e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                  resize-none transition-all text-[15px]"
              />

              {/* Image */}
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-300 mb-2">🖼️ Hình ảnh (tuỳ chọn)</p>
                {imagePreview ? (
                  <div className="relative group rounded-xl overflow-hidden border border-white/10">
                    <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-contain bg-black/30" />
                    <button type="button" onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-all opacity-0 group-hover:opacity-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-2 text-xs text-white/60 bg-black/50 px-2 py-0.5 rounded">{imageFile?.name}</div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-white/15
                    rounded-xl cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
                    <svg className="w-7 h-7 text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-sm text-slate-400 group-hover:text-slate-300">Click để chọn ảnh</span>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 shadow-xl">
              <p className="text-sm font-semibold text-slate-300 mb-3">🎯 Các đáp án <span className="text-red-400">*</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["A","B","C","D"] as OptionKey[]).map((key) => {
                  const fieldKey = `option_${key.toLowerCase()}` as keyof typeof form;
                  return (
                    <div key={key} className={`rounded-xl border-2 p-3 ${OPTION_COLORS[key]}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-4 h-4 rounded flex-shrink-0 ${OPTION_DOT[key]}`} />
                        <span className="text-xs font-bold text-white/80">Đáp án {key}</span>
                      </div>
                      <input
                        type="text"
                        placeholder={`Nhập đáp án ${key}…`}
                        value={form[fieldKey]}
                        onChange={(e) => setField(fieldKey, e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                          placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Answer + explanation */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-3">✅ Đáp án đúng</p>
                <div className="flex gap-3">
                  {(["A","B","C","D"] as OptionKey[]).map((key) => (
                    <button key={key} type="button" onClick={() => setField("answer", key)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
                        form.answer === key
                          ? `${OPTION_DOT[key]} border-transparent text-white shadow-lg scale-105`
                          : "bg-white/5 border-white/15 text-slate-400 hover:text-white hover:border-white/30"
                      }`}
                    >{key}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">💡 Giải thích (tuỳ chọn)</label>
                <textarea rows={2} placeholder="Giải thích đáp án đúng…"
                  value={form.explanation} onChange={(e) => setField("explanation", e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                    resize-none transition-all text-sm"
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-4 rounded-2xl font-bold text-base text-white
                bg-gradient-to-r from-indigo-600 to-violet-600
                hover:from-indigo-500 hover:to-violet-500
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-xl shadow-indigo-500/30
                transition-all active:scale-[0.99]
                flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Đang lưu…</>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>Thêm câu hỏi</>
              )}
            </button>
            <p className="text-center text-xs text-slate-600 pb-4">Sau khi thêm sẽ tự về trang chủ.</p>
          </form>
        )}

        {/* ── MANAGE QUESTIONS TAB ────────────────────────────────────────── */}
        {tab === "manage-questions" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-4">
              <div>
                <h3 className="font-bold text-sm">Bộ lọc câu hỏi</h3>
                <p className="text-xs text-slate-400">Chọn đề thi để xem câu hỏi chi tiết</p>
              </div>
              <select
                value={selectedFilterExamId}
                onChange={(e) => setSelectedFilterExamId(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all" className="bg-[#1a1040]">-- Tất cả đề thi --</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id} className="bg-[#1a1040]">{ex.name}</option>
                ))}
              </select>
            </div>

            {isQuestionsLoading ? (
              <div className="py-20 text-center text-slate-400 animate-pulse text-sm">Đang tải danh sách câu hỏi…</div>
            ) : questionsList.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl text-slate-400 text-sm">
                Không tìm thấy câu hỏi nào.
              </div>
            ) : (
              <div className="space-y-3">
                {questionsList.map((q, idx) => {
                  const examName = exams.find((e) => e.id === q.exam_id)?.name || "Không rõ đề";
                  return (
                    <div key={q.id} className="bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between transition-all">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded">
                            {examName}
                          </span>
                          <span className="bg-white/5 text-slate-400 px-2 py-0.5 rounded">
                            Câu ID: #{q.id}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-white leading-snug">{q.question}</h4>
                        {q.image_url && (
                          <div className="max-w-xs rounded-lg overflow-hidden border border-white/10 mt-1">
                            <img src={q.image_url} alt="Minh họa" className="max-h-24 object-contain bg-black/20" />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-1.5 mt-2">
                          <div className={`text-xs p-1.5 rounded border ${q.answer === "A" ? "border-indigo-500 bg-indigo-500/10 text-white" : "border-white/5 text-slate-400"}`}>A. {q.option_a}</div>
                          <div className={`text-xs p-1.5 rounded border ${q.answer === "B" ? "border-amber-500 bg-amber-500/10 text-white" : "border-white/5 text-slate-400"}`}>B. {q.option_b}</div>
                          <div className={`text-xs p-1.5 rounded border ${q.answer === "C" ? "border-red-500 bg-red-500/10 text-white" : "border-white/5 text-slate-400"}`}>C. {q.option_c}</div>
                          <div className={`text-xs p-1.5 rounded border ${q.answer === "D" ? "border-emerald-500 bg-emerald-500/10 text-white" : "border-white/5 text-slate-400"}`}>D. {q.option_d}</div>
                        </div>
                        {q.explanation && (
                          <p className="text-xs text-slate-400 mt-1.5 bg-black/20 p-2 rounded border border-white/5">
                            💡 <strong>Giải thích:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                      <div className="self-end md:self-start">
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="px-3 py-1.5 text-xs font-bold bg-red-600/15 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                        >
                          Xóa câu
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MANAGE USERS TAB ────────────────────────────────────────────── */}
        {tab === "manage-users" && (
          <div className="space-y-4">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Danh sách tài khoản</h3>
                <p className="text-xs text-slate-400">Duyệt tài khoản mới đăng ký và phân quyền quản trị</p>
              </div>
              <span className="text-xs bg-white/5 text-slate-300 px-2.5 py-1 rounded-full border border-white/10 font-bold">
                {profilesList.length} người dùng
              </span>
            </div>

            {isProfilesLoading ? (
              <div className="py-20 text-center text-slate-400 animate-pulse text-sm">Đang tải danh sách tài khoản…</div>
            ) : profilesList.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl text-slate-400 text-sm">
                Không tìm thấy tài khoản nào.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0c101d]">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-semibold">
                      <th className="p-4">Họ tên / Email</th>
                      <th className="p-4">Chức vụ</th>
                      <th className="p-4">Trạng thái duyệt</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {profilesList.map((p) => {
                      const isCurrentUser = user && String(p.id) === String(user.id);
                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {p.name}
                              {isCurrentUser && (
                                <span className="text-[10px] bg-slate-500/20 text-slate-400 px-1.5 py-0.2 rounded font-bold">Bạn</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">{p.email}</div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              p.role === "admin"
                                ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                                : "bg-slate-700/20 text-slate-400 border border-slate-500/20"
                            }`}>
                              {p.role === "admin" ? "Admin" : "Học sinh"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              p.approved
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                            }`}>
                              {p.approved ? "Đã duyệt" : "Chờ duyệt"}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            {/* Approve button */}
                            {!isCurrentUser && (
                              <button
                                type="button"
                                onClick={() => toggleApproveUser(p.id, p.approved)}
                                className={`px-2 py-1 rounded text-xs font-bold border transition-all ${
                                  p.approved
                                    ? "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-white"
                                    : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-white"
                                }`}
                              >
                                {p.approved ? "Hủy duyệt" : "Duyệt"}
                              </button>
                            )}

                            {/* Promote role button */}
                            {!isCurrentUser && (
                              <button
                                type="button"
                                onClick={() => toggleRoleUser(p.id, p.role)}
                                className="px-2 py-1 bg-violet-600/15 border border-violet-500/30 text-violet-300 hover:bg-violet-600 hover:text-white rounded text-xs font-bold transition-all"
                              >
                                {p.role === "admin" ? "Hạ Student" : "Lên Admin"}
                              </button>
                            )}

                            {/* Delete button */}
                            {!isCurrentUser && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(p.id)}
                                className="px-2 py-1 bg-red-600/15 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white rounded text-xs font-bold transition-all"
                              >
                                Xóa
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── VIEW SCORES TAB ─────────────────────────────────────────────── */}
        {tab === "view-scores" && (
          <div className="space-y-4">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-sm">Bảng điểm thi thử</h3>
                <p className="text-xs text-slate-400">Danh sách kết quả làm bài thi của người dùng</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={loadAttempts}
                  className="px-3 py-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                >
                  🔄 Tải lại
                </button>
                <button
                  type="button"
                  onClick={handleClearAttempts}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-600/15 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                >
                  🗑️ Xóa toàn bộ
                </button>
              </div>
            </div>

            {isAttemptsLoading ? (
              <div className="py-20 text-center text-slate-400 animate-pulse text-sm">Đang tải danh sách điểm số…</div>
            ) : attemptsList.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl text-slate-400 text-sm">
                Chưa có học sinh nào làm bài thi thử.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0c101d]">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-semibold">
                      <th className="p-4">Người làm bài</th>
                      <th className="p-4">Đề thi</th>
                      <th className="p-4 text-center">Số câu đúng</th>
                      <th className="p-4 text-center">Điểm số</th>
                      <th className="p-4 text-center">Thời gian</th>
                      <th className="p-4 text-right">Ngày làm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {attemptsList.map((at) => {
                      const student = allProfiles.find((u) => u.id === at.user_id);
                      const examName = exams.find((e) => e.id === at.exam_id)?.name || "Không rõ đề";
                      
                      // Convert seconds to readable format
                      const m = Math.floor(at.time_used_sec / 60);
                      const s = at.time_used_sec % 60;
                      const durationStr = m > 0 ? `${m}ph${s}s` : `${s}s`;

                      // Convert timestamp to readable format
                      const dateObj = at.created_at ? new Date(at.created_at) : null;
                      const dateStr = dateObj ? dateObj.toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "Không rõ";

                      return (
                        <tr key={at.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{student?.name || "Người dùng ẩn danh"}</div>
                            <div className="text-xs text-slate-400">{student?.email || ""}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-200">{examName}</div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-bold text-indigo-300">{at.correct_count}</span>
                            <span className="text-slate-500"> / {at.total_count}</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded font-black ${
                              at.score >= 8
                                ? "bg-amber-500/20 text-amber-400"
                                : at.score >= 5
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-red-500/20 text-red-400"
                            }`}>
                              {at.score.toFixed(1)}
                            </span>
                          </td>
                          <td className="p-4 text-center text-slate-300 font-medium">
                            {durationStr}
                          </td>
                          <td className="p-4 text-right text-slate-400 text-xs">
                            {dateStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
