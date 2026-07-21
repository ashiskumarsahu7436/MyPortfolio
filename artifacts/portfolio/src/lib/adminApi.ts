/**
 * Typed API client for all CMS endpoints.
 * Import `publicApi` for unauthenticated reads (portfolio sections).
 * Import `adminApi` for authenticated CRUD (admin panel).
 */

// In dev (Replit), VITE_API_BASE is unset and the Vite proxy forwards /api → Express.
// In production (Vercel), set VITE_API_BASE to your API server's origin, e.g. https://your-api.vercel.app
const BASE = (import.meta.env.VITE_API_BASE ?? "") + "/api";

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed");
  return data as T;
}

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface Profile {
  id: number;
  full_name: string;
  tagline: string;
  bio: string;
  email: string;
  github_url: string;
  linkedin_url: string;
  photo_url: string;
  focus: string;
  philosophy: string;
  tech_stack: string[];
  updated_at: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  tech_stack: string[];
  live_url: string;
  github_url: string;
  thumbnail: string;
  sort_order: number;
  published: boolean;
  status: string;
  label: string;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: number;
  file_url: string;
  last_updated: string | null;
  updated_at: string;
}

export interface Certification {
  id: number;
  title: string;
  issuer: string;
  issue_date: string | null;
  expiry_date: string | null;
  credential_url: string;
  badge_url: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Public API (no auth, portfolio sections) ─────────────────────────────────

export const publicApi = {
  profile: (): Promise<Profile> => req("GET", "/profile"),
  projects: (): Promise<Project[]> => req("GET", "/projects"),
  resume: (): Promise<Resume> => req("GET", "/resume"),
  certifications: (): Promise<Certification[]> => req("GET", "/certifications"),
};

// ─── Admin API (requires JWT token) ──────────────────────────────────────────

export const adminApi = {
  profile: {
    get: (token: string) =>
      req<Profile>("GET", "/profile", undefined, token),
    update: (token: string, data: Partial<Omit<Profile, "id" | "updated_at">>) =>
      req<Profile>("PATCH", "/profile", data, token),
  },

  projects: {
    list: (token: string) =>
      req<Project[]>("GET", "/projects", undefined, token),
    create: (token: string, data: Partial<Omit<Project, "id" | "created_at" | "updated_at">>) =>
      req<Project>("POST", "/projects", data, token),
    update: (token: string, id: number, data: Partial<Omit<Project, "id" | "created_at" | "updated_at">>) =>
      req<Project>("PATCH", `/projects/${id}`, data, token),
    remove: (token: string, id: number) =>
      req<{ ok: boolean }>("DELETE", `/projects/${id}`, undefined, token),
    reorder: (token: string, orders: { id: number; sort_order: number }[]) =>
      req<{ ok: boolean }>("PATCH", "/projects/reorder", { orders }, token),
  },

  resume: {
    get: (token: string) =>
      req<Resume>("GET", "/resume", undefined, token),
    update: (token: string, data: { file_url?: string; last_updated?: string | null }) =>
      req<Resume>("PATCH", "/resume", data, token),
  },

  certifications: {
    list: (token: string) =>
      req<Certification[]>("GET", "/certifications", undefined, token),
    create: (token: string, data: Partial<Omit<Certification, "id" | "created_at" | "updated_at">>) =>
      req<Certification>("POST", "/certifications", data, token),
    update: (token: string, id: number, data: Partial<Omit<Certification, "id" | "created_at" | "updated_at">>) =>
      req<Certification>("PATCH", `/certifications/${id}`, data, token),
    remove: (token: string, id: number) =>
      req<{ ok: boolean }>("DELETE", `/certifications/${id}`, undefined, token),
    reorder: (token: string, orders: { id: number; sort_order: number }[]) =>
      req<{ ok: boolean }>("PATCH", "/certifications/reorder", { orders }, token),
  },
};
