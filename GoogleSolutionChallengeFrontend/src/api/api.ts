/**
 * api.ts
 * Core fetch wrapper + session helpers.
 * Used by every page and API module.
 */

// Relative path — Vite dev proxy forwards /api/* → http://localhost:3000
// In production, set your actual backend base URL here.
export const API_BASE = "/api";

// ── Session helpers ────────────────────────────────────────────────────────

export interface StoredUser {
  email: string;
  isVerified?: boolean;
  profileCompleted: boolean;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function getUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: StoredUser): void {
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────

/**
 * apiFetch<T>(path, options?)
 * - Injects Content-Type: application/json
 * - Injects Authorization: Bearer <token> when logged in
 * - Unwraps backend `{ error }` and throws as Error
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Server returned a non-JSON response (HTTP ${response.status})`
    );
  }

  if (!response.ok) {
    // Backend always returns { error: "..." } on failure
    const msg =
      (data.error as string) ||
      (data.message as string) ||
      `Request failed with status ${response.status}`;

    // Tag auth-related failures so callers can redirect to login reliably
    if (response.status === 401 || response.status === 404) {
      throw new Error(`AUTH_ERROR: ${msg}`);
    }

    throw new Error(msg);
  }

  return data as T;
}
