/**
 * AuthContext.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Global authentication context using React Context API + localStorage.
 * Simulates a real auth flow: register → login → session persistence.
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

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // initials-based avatar color
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "tschool_users";
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

  /** Simulates login API – validates against localStorage "DB" */
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 600));

      const raw = localStorage.getItem(STORAGE_KEY);
      const users: Array<User & { passwordHash: string }> = raw ? JSON.parse(raw) : [];

      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() &&
               u.passwordHash === pseudoHash(password)
      );

      if (!found) return { success: false, error: "Email hoặc mật khẩu không đúng." };

      const session: User = { id: found.id, name: found.name, email: found.email, avatar: found.avatar };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      return { success: true };
    },
    []
  );

  /** Simulates register API – stores in localStorage "DB" */
  const register = useCallback(
    async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      await new Promise((r) => setTimeout(r, 600));

      const raw = localStorage.getItem(STORAGE_KEY);
      const users: Array<User & { passwordHash: string }> = raw ? JSON.parse(raw) : [];

      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: "Email này đã được đăng ký." };
      }

      const newUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        avatar: getAvatarColor(name),
        passwordHash: pseudoHash(password),
      };

      users.push(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

      const session: User = { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      return { success: true };
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
