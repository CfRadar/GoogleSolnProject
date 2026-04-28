/**
 * navigation.ts
 * Pure navigation helpers — no React components.
 * Kept separate so router.tsx can satisfy react-refresh/only-export-components.
 */

import { getToken } from "./api/api";

// ── Navigate ───────────────────────────────────────────────────────────────

export function navigate(hash: string): void {
  window.location.hash = hash;
}

// ── Auth guard ─────────────────────────────────────────────────────────────

export function requireAuth(): boolean {
  if (!getToken()) {
    navigate("login");
    return false;
  }
  return true;
}

// ── Post-auth routing decision ─────────────────────────────────────────────

/**
 * redirectAfterAuth(isProfileComplete)
 * Called after login or signup to decide the next page:
 *   false → #profile-setup
 *   true  → #dashboard
 */
export function redirectAfterAuth(isProfileComplete: boolean): void {
  if (!isProfileComplete) {
    navigate("profile-setup");
  } else {
    navigate("dashboard");
  }
}
