/**
 * auth.ts
 * All backend API calls related to auth and profile.
 *
 * Endpoints (read-only from backend):
 *   POST /api/auth/signup
 *   POST /api/auth/login
 *   GET  /api/profile
 *   POST /api/profile/setup
 */

import {
  apiFetch,
  setToken,
  setUser,
  clearSession,
} from "./api";
import type { StoredUser } from "./api";

// ── Response shapes (matching backend exactly) ─────────────────────────────

export interface SignupResponse {
  token: string;
  user: StoredUser;
}

export interface AuthResponse {
  token: string;
  user: StoredUser; // { email, isProfileComplete }
}

export interface ProfileData {
  _id: string;
  email: string;
  isProfileComplete: boolean;
  profileCompleted?: boolean;
  skills: string[];
  interests: string[];
  availability?: string;
  location?: { address: string };
  rankingScore: number;
  stats: {
    peopleHelped: number;
    hoursContributed: number;
    tasksCompleted: number;
  };
}

// ── Auth calls ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 * Body: { email, password }
 * Returns: { token, user }
 */
export async function signup(
  email: string,
  password: string
): Promise<SignupResponse> {
  const data = await apiFetch<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setToken(data.token);
  setUser(data.user);

  return data;
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { token, user: { email, isProfileComplete } }
 * → Stores token + user in localStorage
 */
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setToken(data.token);
  setUser(data.user);

  return data;
}

/**
 * GET /api/profile
 * Requires: Authorization: Bearer <token>
 * Returns: full ProfileData object
 */
export async function fetchProfile(): Promise<ProfileData> {
  return apiFetch<ProfileData>("/profile");
}

/**
 * POST /api/profile/setup
 * Requires: Authorization: Bearer <token>
 * Body: { skills, interests, availability, location: { address } }
 * Sets isProfileComplete = true on backend.
 */
export async function setupProfile(payload: {
  skills: string[];
  interests: string[];
  availability: string;
  location: { address: string };
}): Promise<ProfileData> {
  return apiFetch<ProfileData>("/profile/setup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * PUT /api/profile
 * Requires: Authorization: Bearer <token>
 * Body: { skills, interests, availability, location: { address } }
 * General profile update (does NOT reset profile completion).
 */
export async function updateProfile(payload: {
  skills?: string[];
  interests?: string[];
  availability?: string;
  location?: { address: string };
}): Promise<ProfileData> {
  return apiFetch<ProfileData>("/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * logout()
 * Clears localStorage session. Caller handles redirect.
 */
export function logout(): void {
  clearSession();
}

export interface ReportPayload {
  title: string;
  description: string;
  category: string;
  urgency: string;
  peopleAffected: number;
  location: { address: string };
  status: string;
}

/**
 * POST /api/report
 * Requires: Authorization: Bearer <token>
 */
export async function submitReport(payload: ReportPayload): Promise<any> {
  return apiFetch<any>("/report", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Opportunities Calls ───────────────────────────────────────────────────

export interface Opportunity {
  contact: any;
  sourceDetails: any;
  _id: string;
  title: string;
  description: string;
  category: string;
  urgency: string; // low, medium, high
  location?: {
    coordinates: any; address?: string 
};
  schedule?: { startTime?: string };
  requirements?: {
    participants: any; peopleNeeded?: number 
};
}

export interface OpportunitiesResponse {
  success: boolean;
  items: Opportunity[];
}

export async function fetchOpportunities(): Promise<OpportunitiesResponse> {
  return apiFetch<OpportunitiesResponse>("/opportunities?limit=100");
}

export async function fetchRecommendations(): Promise<Opportunity[]> {
  return apiFetch<Opportunity[]>("/recommendations");
}

export async function fetchLeaderboard(): Promise<any[]> {
  return apiFetch<any[]>("/leaderboard");
}
