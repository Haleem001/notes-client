// ---------------------------------------------------------------------------
// API client
// All requests go to the NestJS backend.  The base URL defaults to
// http://localhost:3000 but can be overridden via NEXT_PUBLIC_API_URL.
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "https://notes-api-db1i.onrender.com";

const TOKEN_KEY = "notes_access_token";
const USER_KEY = "notes_user";

// ── Token helpers (safe for SSR – guards `window`) ──────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

export interface Note {
  _id: string;
  title: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  withAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (withAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // keep default message
    }
    const err: ApiError = { message, statusCode: res.status };
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Auth endpoints ───────────────────────────────────────────────────────────

export async function signUp(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ accessToken: string; user: AuthUser }> {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function signIn(data: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; user: AuthUser }> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Notes endpoints (all require auth) ──────────────────────────────────────

export async function getNotes(): Promise<Note[]> {
  return apiFetch("/notes", { method: "GET" }, true);
}

export async function createNote(data: {
  title: string;
  content?: string;
}): Promise<Note> {
  return apiFetch(
    "/notes",
    { method: "POST", body: JSON.stringify(data) },
    true
  );
}

export async function updateNote(
  id: string,
  data: { title?: string; content?: string }
): Promise<Note> {
  return apiFetch(
    `/notes/${id}`,
    { method: "PATCH", body: JSON.stringify(data) },
    true
  );
}

export async function deleteNote(id: string): Promise<void> {
  return apiFetch(`/notes/${id}`, { method: "DELETE" }, true);
}
