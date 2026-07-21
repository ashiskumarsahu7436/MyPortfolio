/**
 * Thin API client for the admin auth endpoints.
 * The API server is served at /api (Replit path-based routing).
 */

// In dev (Replit), VITE_API_BASE is unset and the Vite proxy forwards /api → Express.
// In production (Vercel), set VITE_API_BASE to your API server's origin, e.g. https://your-api.vercel.app
const BASE = (import.meta.env.VITE_API_BASE ?? "") + "/api";

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, string>,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed");
  return data as T;
}

export const authApi = {
  /** Check if credentials have been set up yet */
  status(): Promise<{ setup: boolean }> {
    return request("GET", "/auth/status");
  },

  /** First-time setup — only works once */
  setup(userId: string, password: string): Promise<{ token: string }> {
    return request("POST", "/auth/setup", { userId, password });
  },

  /** Log in with existing credentials */
  login(userId: string, password: string): Promise<{ token: string }> {
    return request("POST", "/auth/login", { userId, password });
  },

  /** Change credentials — requires current ones to be correct */
  reset(
    userId: string,
    password: string,
    newUserId: string,
    newPassword: string
  ): Promise<{ token: string }> {
    return request("POST", "/auth/reset", { userId, password, newUserId, newPassword });
  },

  /** Verify a stored JWT is still valid */
  verify(token: string): Promise<{ valid: boolean; userId?: string }> {
    return request("GET", "/auth/verify", undefined, token);
  },
};

/** Persist the JWT across page loads */
export const session = {
  save(token: string) {
    localStorage.setItem("admin_token", token);
  },
  get(): string | null {
    return localStorage.getItem("admin_token");
  },
  clear() {
    localStorage.removeItem("admin_token");
  },
};
