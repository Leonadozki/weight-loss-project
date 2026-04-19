"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getCurrentUser,
  setCurrentUser,
  findUserByEmail,
  saveUser,
  type StoredUser,
} from "../lib/storage";

interface AuthContextType {
  user: StoredUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = getCurrentUser();
    setUser(saved);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500)); // simulate network
    const found = findUserByEmail(email);
    if (!found) return { success: false, error: "该邮箱尚未注册" };
    if (found.password !== password) return { success: false, error: "密码错误" };
    setCurrentUser(found);
    setUser(found);
    return { success: true };
  };

  const register = async (name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    const existing = findUserByEmail(email);
    if (existing) return { success: false, error: "该邮箱已被注册" };
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    saveUser(newUser);
    setCurrentUser(newUser);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
