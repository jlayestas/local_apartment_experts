"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/types/auth";
import { getMe } from "@/lib/api/auth";

type AuthState = {
  /** Authenticated user, or null if not authenticated. */
  user: AuthUser | null;
  /** True while the initial /me check is in flight. */
  isLoading: boolean;
  /** Called after a successful login to update context without a page reload. */
  login: (user: AuthUser) => void;
  /** Called after logout to clear context. */
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

/**
 * Wraps the application and manages authentication state.
 * Calls GET /api/v1/auth/me on mount to restore an existing session.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within <AuthProvider>");
  }
  return ctx;
}
