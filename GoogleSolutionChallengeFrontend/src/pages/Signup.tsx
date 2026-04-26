/**
 * Signup.tsx
 * POST /api/auth/signup → stores pendingEmail → routes to #verify
 * UI: pixel-perfect Smart Aid design (two-column auth layout)
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { signup } from "../api/auth";
import { navigate } from "../navigation";
import "../css/auth.css";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password);
      sessionStorage.setItem("pendingEmail", email);
      navigate("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-root">
      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <aside className="auth-left">
        {/* Illustration cards */}
        <div className="auth-illustration">
          {/* Progress card */}
          <div className="ill-card ill-progress-card">
            <div className="ill-progress-row">
              <div className="ill-icon-badge blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="ill-progress-content">
                <div className="ill-bar-group">
                  <div className="ill-bar-track"><div className="ill-bar-fill green" /></div>
                  <div className="ill-bar-track"><div className="ill-bar-fill blue" style={{ width: "48%" }} /></div>
                </div>
              </div>
            </div>
            <div className="ill-progress-row">
              <div className="ill-icon-badge green">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <div className="ill-progress-content">
                <div className="ill-bar-group">
                  <div className="ill-bar-track"><div className="ill-bar-fill blue2" style={{ width: "62%" }} /></div>
                  <div className="ill-bar-track"><div className="ill-bar-fill green2" style={{ width: "38%" }} /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Location card */}
          <div className="ill-card ill-location-card">
            <div className="ill-location-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className="ill-location-bars">
                <div className="ill-loc-bar" />
                <div className="ill-loc-bar" />
              </div>
            </div>
            <div className="ill-blocks">
              <div className="ill-block purple" />
              <div className="ill-block sage" />
              <div className="ill-block rose" />
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="auth-tagline">
          <h2>Making Impact Together</h2>
          <p>
            Connect with <mark>volunteers</mark>, coordinate aid efforts, and create{" "}
            <mark>meaningful</mark> change in <mark>communities</mark> worldwide.
          </p>
        </div>
      </aside>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <main className="auth-right">
        <div className="auth-form-container">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <span className="auth-logo-text">Smart Aid</span>
          </div>

          {/* Heading */}
          <div className="auth-heading-block">
            <h1>Create account</h1>
            <p>Join us and start making an impact today</p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="signup-email">Email address</label>
              <div className="auth-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <div className="auth-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label htmlFor="signup-confirm">Confirm password</label>
              <div className="auth-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="signup-confirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p id="signup-error" className="auth-error" role="alert">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              id="btn-signup"
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          {/* Footer */}
          <p className="auth-footer-link">
            Already have an account?{" "}
            <button type="button" onClick={() => navigate("login")}>
              Sign in
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
