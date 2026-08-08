export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    // The admin session lives in an HTTP-only cookie; the browser attaches it
    // automatically. The frontend never reads or stores the token itself.
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !payload || !payload.success) {
    throw new ApiError(payload?.message ?? `Request failed with status ${res.status}`, res.status);
  }

  return payload.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path, "GET"),
  post: <T>(path: string, body?: unknown) => request<T>(path, "POST", body),
  put: <T>(path: string, body?: unknown) => request<T>(path, "PUT", body),
  delete: <T>(path: string) => request<T>(path, "DELETE"),
};
