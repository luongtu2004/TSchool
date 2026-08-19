/**
 * AuthContext.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Global authentication context using React Context API + Supabase database.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "student";
  approved: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; pending?: boolean; error?: string }>;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "tschool_session";

/** Return a deterministic avatar color from user name */
function getAvatarColor(name: string): string {
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

/** Very lightweight "hashing" – NOT for production use */
function pseudoHash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return (h >>> 0).toString(16);
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Restore session on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      /* ignore corrupt storage */
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Login against Supabase user_profiles table */
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("email", email.toLowerCase().trim())
          .eq("password_hash", pseudoHash(password));

        if (error || !data || data.length === 0) {
          return { success: false, error: "Email hoặc mật khẩu không đúng." };
        }

        const profile = data[0];

        if (!profile.approved && profile.role !== "admin") {
          return { success: false, error: "Tài khoản của bạn chưa được quản trị viên duyệt." };
        }

        const session: User = {
          id: String(profile.id),
          name: profile.name,
          email: profile.email,
          avatar: getAvatarColor(profile.name),
          role: profile.role as "admin" | "student",
          approved: profile.approved,
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : "Lỗi kết nối database." };
      }
    },
    []
  );

  /** Register user into Supabase user_profiles table */
  const register = useCallback(
    async (name: string, email: string, password: string): Promise<{ success: boolean; pending?: boolean; error?: string }> => {
      try {
        const cleanEmail = email.toLowerCase().trim();

        // Check if email already exists
        const { data: existing } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("email", cleanEmail);

        if (existing && existing.length > 0) {
          return { success: false, error: "Email này đã được đăng ký." };
        }

        // Check if this is the first user (only first user becomes admin)
        const { count } = await supabase
          .from("user_profiles")
          .select("*", { count: "exact", head: true });

        const isFirstUser = count === 0;

        const role = isFirstUser ? "admin" : "student";
        const approved = isFirstUser;

        const { data, error } = await supabase
          .from("user_profiles")
          .insert({
            name: name.trim(),
            email: cleanEmail,
            password_hash: pseudoHash(password),
            role,
            approved,
          })
          .select();

        if (error || !data || data.length === 0) {
          throw new Error(error?.message || "Không thể tạo tài khoản.");
        }

        if (!approved) {
          // Requires approval
          return { success: true, pending: true };
        }

        // Auto login for approved admin/users
        const profile = data[0];
        const session: User = {
          id: String(profile.id),
          name: profile.name,
          email: profile.email,
          avatar: getAvatarColor(profile.name),
          role: profile.role as "admin" | "student",
          approved: profile.approved,
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : "Đăng ký thất bại." };
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
