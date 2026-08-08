"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  getCurrentAdmin,
  login as loginRequest,
  logout as logoutRequest,
  type AdminUser,
} from "@/lib/services/authService";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  admin: AdminUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Only routes that care about auth state need to check the session on load —
// skip the /api/auth/me call entirely on public pages (landing, /blog, etc.).
function routeNeedsAuthCheck(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/admin");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(routeNeedsAuthCheck(pathname) ? "loading" : "unauthenticated");

  useEffect(() => {
    if (!routeNeedsAuthCheck(pathname)) return;

    let cancelled = false;

    getCurrentAdmin()
      .then((data) => {
        if (cancelled) return;
        setAdmin(data);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        setAdmin(null);
        setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    setAdmin(data);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setAdmin(null);
    setStatus("unauthenticated");
  }, []);

  return <AuthContext.Provider value={{ admin, status, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
