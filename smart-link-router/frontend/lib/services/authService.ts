import { api } from "@/lib/api";

export interface AdminUser {
  email: string;
}

export function login(email: string, password: string): Promise<AdminUser> {
  return api.post<AdminUser>("/api/auth/login", { email, password });
}

export function logout(): Promise<null> {
  return api.post<null>("/api/auth/logout");
}

export function getCurrentAdmin(): Promise<AdminUser> {
  return api.get<AdminUser>("/api/auth/me");
}
