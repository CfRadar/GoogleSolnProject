/**
 * router.tsx
 * Minimal hash-based SPA router.
 *
 * Routes:
 *   #login         → <LoginPage>
 *   #signup        → <SignupPage>
 *   #verify        → <VerifyPage>
 *   #profile-setup → <ProfileSetupPage>
 *   #dashboard     → <DashboardPage>  (protected)
 *   (default)      → <LoginPage>
 *
 * Navigation helpers live in navigation.ts (separate file required by
 * react-refresh/only-export-components — this file must export only components).
 */

import type { ComponentType } from "react";
import { useState, useEffect } from "react";
import { getToken, getUser } from "./api/api";
import { redirectAfterAuth } from "./navigation";

import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import VerifyPage from "./pages/Verify";
import ProfileSetupPage from "./pages/ProfileSetup";
import DashboardPage from "./pages/Dashboard";
import TasksPage from "./pages/Tasks";
import TaskDetailPage from "./pages/TaskDetail";
import ProfilePage from "./pages/Profile";
import ReportPage from "./pages/Report";
import ProfileEditPage from "./pages/ProfileEdit";

// ── Route map ──────────────────────────────────────────────────────────────
// Explicit object makes every import visibly used — no language-server false positives.

const ROUTES: Record<string, ComponentType> = {
  login: LoginPage,
  signup: SignupPage,
  verify: VerifyPage,
  "profile-setup": ProfileSetupPage,
  dashboard: DashboardPage,
  tasks: TasksPage,
  "task-detail": TaskDetailPage,
  profile: ProfilePage,
  report: ReportPage,
  "profile-edit": ProfileEditPage,
};

// ── Route parsing ──────────────────────────────────────────────────────────

function getRoute(): string {
  return window.location.hash.replace(/^#\/?/, "") || "login";
}

// ── Router ─────────────────────────────────────────────────────────────────

export default function Router() {
  const [route, setRoute] = useState<string>(getRoute);

  // Listen for hash changes (browser back/forward + navigate() calls)
  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Guard: logged-in user landing on login/signup → send to app
  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (token && (route === "login" || route === "signup")) {
      redirectAfterAuth(user?.profileCompleted ?? true);
    }
  }, [route]);

  const Page = ROUTES[route] ?? LoginPage;
  return <Page />;
}
