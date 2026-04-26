/**
 * Verify.tsx
 * POST /api/auth/verify-otp → stores token → routes based on profileCompleted
 * UI: pixel-perfect Smart Aid design (two-column auth layout)
 *
 * Email is pre-filled from sessionStorage ("pendingEmail") set during signup.
 */
import { useState, useRef } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { verifyOTP } from "../api/auth";
import { navigate, redirectAfterAuth } from "../navigation";
import "../css/auth.css";

export default function VerifyPage() {
  const [email] = useState(() => sessionStorage.getItem("pendingEmail") ?? "");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleSubmit(e?: FormEvent) {
    if (e) e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await verifyOTP(email, otp);
      sessionStorage.removeItem("pendingEmail");
      redirectAfterAuth(data.user.profileCompleted);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, val: string) {
    // Only allow digits
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];

    // Handle paste or typing string with length > 1
    if (val.length > 1) {
      const pasted = val.split("").slice(0, 6 - index);
      for (let i = 0; i < pasted.length; i++) {
        newDigits[index + i] = pasted[i];
      }
      setDigits(newDigits);

      const nextFocus = Math.min(index + pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    // Handle single character
    newDigits[index] = val;
    setDigits(newDigits);

    // Auto-focus next input
    if (val !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      handleSubmit();
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
          
          <div className="auth-otp-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>

          {/* Heading */}
          <div className="auth-heading-block">
            <h1>Check your email</h1>
            <p>We&apos;ve sent a 6-digit verification code to:</p>
            {email && (
              <div className="auth-email-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                {email}
              </div>
            )}
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            
            <div className="auth-field">
              <span className="otp-label">Verification code</span>
              <div className="otp-boxes">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className={`otp-box ${digit ? "filled" : ""}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    required
                  />
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p id="verify-error" className="auth-error" role="alert">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              id="btn-verify"
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? "Verifying…" : "Verify code"}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-resend">
            Entered the wrong email?{" "}
            <button type="button" onClick={() => navigate("signup")}>
              Back to signup
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
