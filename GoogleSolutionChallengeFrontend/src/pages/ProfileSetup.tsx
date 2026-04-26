/**
 * ProfileSetup.tsx
 * POST /api/profile/setup → sets profileCompleted = true → redirect to #dashboard
 * UI: Split two-column layout matching Login/Signup to fix vertical scroll issues.
 */
import { useState, useEffect } from "react";
import { setupProfile } from "../api/auth";
import { getToken, setUser } from "../api/api";
import { navigate } from "../navigation";
import "../css/auth.css";
import "../css/profile.css";

const ALL_SKILLS = [
  "Teaching", "Medical", "Logistics", "Food Distribution",
  "Translation", "Construction", "IT Support", "Counseling",
  "Fundraising", "Photography"
];

const ALL_INTERESTS = [
  "Education", "Healthcare", "Environment", "Disaster Relief",
  "Community Development", "Children & Youth", "Elderly Care", "Animal Welfare"
];

const AVAILABILITIES = [
  { label: "Weekdays", icon: "📅" },
  { label: "Weekends", icon: "🌅" },
  { label: "Mornings", icon: "🌄" },
  { label: "Afternoons", icon: "🌞" },
  { label: "Evenings", icon: "🌆" },
  { label: "Flexible", icon: "⏰" },
];

export default function ProfileSetupPage() {
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");
  const [address, setAddress] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) navigate("login");
  }, []);

  const toggleSkill = (s: string) => {
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };
  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  async function handleComplete() {
    setError("");
    setLoading(true);
    try {
      const profile = await setupProfile({
        skills,
        interests,
        availability: availability || "Flexible",
        location: { address: address || "Remote" },
      });

      setUser({
        email: profile.email,
        isVerified: profile.isVerified,
        profileCompleted: true,
      });

      navigate("dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Profile setup failed");
    } finally {
      setLoading(false);
    }
  }

  const percent = step === 1 ? 33 : step === 2 ? 67 : 100;

  const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <div className="auth-root">
      
      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <aside className="auth-left profile-left">
        <div className="profile-left-content">
          
          <div className="auth-logo" style={{ marginBottom: '24px' }}>
            <div className="auth-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <span className="auth-logo-text" style={{ fontSize: '18px' }}>Smart Aid</span>
          </div>
          
          <div className="auth-heading-block" style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px' }}>Complete Your Profile</h1>
            <p style={{ fontSize: '15px' }}>Help us match you with the right opportunities</p>
          </div>

          {/* Progress Tracker inside illustration card matching login design */}
          <div className="ill-card profile-tracker-card">
            <div className="tracker-top">
              <span className="tracker-step-text">Step {step} of 3</span>
              <span className="tracker-pct-text">{percent}% Complete</span>
            </div>
            <div className="tracker-bar-bg">
              <div className="tracker-bar-fill" style={{ width: `${percent}%` }}></div>
            </div>
            <div className="tracker-steps">
              
              <div className={`tracker-node active ${step > 1 ? 'completed' : ''}`}>
                <div className="tracker-circle">{step > 1 ? <CheckIcon /> : "1"}</div>
                <span className="tracker-label">Skills</span>
              </div>
              
              <div className={`tracker-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <div className="tracker-circle">{step > 2 ? <CheckIcon /> : "2"}</div>
                <span className="tracker-label">Availability</span>
              </div>
              
              <div className={`tracker-node ${step === 3 ? 'active' : ''}`}>
                <div className="tracker-circle">3</div>
                <span className="tracker-label">Location</span>
              </div>

            </div>
          </div>

        </div>
      </aside>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <main className="auth-right">
        <div className="auth-form-container" style={{ maxWidth: '440px' }}>

          {/* Step 1 Form */}
          {step === 1 && (
            <div className="profile-step-block">
              <div className="step-header">
                <div className="step-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                  </svg>
                  Your Skills
                </div>
                <p className="step-subtitle">Select all skills that apply (choose at least 2)</p>
              </div>
              
              <div className="pill-grid">
                {ALL_SKILLS.map((s) => (
                  <div key={s} className={`pill ${skills.includes(s) ? 'selected' : ''}`} onClick={() => toggleSkill(s)}>
                    {s}
                  </div>
                ))}
              </div>

              <div className="step-header" style={{ marginTop: '36px' }}>
                <div className="step-title">
                  <svg className="green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  Areas of Interest
                </div>
                <p className="step-subtitle">What causes are you passionate about?</p>
              </div>
              
              <div className="pill-grid" style={{ marginBottom: 0 }}>
                {ALL_INTERESTS.map((i) => (
                  <div key={i} className={`pill ${interests.includes(i) ? 'selected' : ''}`} onClick={() => toggleInterest(i)}>
                    {i}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 Form */}
          {step === 2 && (
            <div className="profile-step-block">
              <div className="step-header">
                <div className="step-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Your Availability
                </div>
                <p className="step-subtitle">When are you typically available to volunteer?</p>
              </div>
              
              <div className="availability-grid">
                {AVAILABILITIES.map(a => (
                  <div key={a.label} className={`avail-card ${availability === a.label ? 'selected' : ''}`} onClick={() => setAvailability(a.label)}>
                    <span>{a.icon}</span>
                    <div>{a.label}</div>
                  </div>
                ))}
              </div>

              <div className="pro-tip">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v1"/><path d="M12 7a5 5 0 0 0-5 5c0 2 1.5 3.5 2 5h6c.5-1.5 2-3 2-5a5 5 0 0 0-5-5z"/>
                 </svg>
                 <div>
                    <div className="pro-tip-title">Pro Tip</div>
                    <div className="pro-tip-desc">Volunteers with flexible availability get matched 3x faster with opportunities</div>
                 </div>
              </div>
            </div>
          )}

          {/* Step 3 Form */}
          {step === 3 && (
            <div className="profile-step-block">
              <div className="step-header">
                <div className="step-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  Your Location
                </div>
                <p className="step-subtitle">Help us find opportunities near you</p>
              </div>
              
              <button type="button" className="loc-auto-btn" onClick={() => setAddress("San Francisco, CA")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Auto-Detect My Location
              </button>
              
              <div className="loc-divider">Or enter manually</div>
              
              <div className="loc-input-group">
                <label>City or ZIP Code</label>
                <input type="text" placeholder="e.g., San Francisco, CA or 94102" value={address} onChange={e => setAddress(e.target.value)} />
              </div>

              <label className="loc-checkbox">
                <input type="checkbox" defaultChecked />
                <span>I'm willing to travel up to 25 miles for opportunities</span>
              </label>
              <label className="loc-checkbox">
                <input type="checkbox" defaultChecked />
                <span>I'm interested in remote/virtual volunteering</span>
              </label>

              <div className="success-banner">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
                 </svg>
                 <div>
                   <div className="success-title">Almost Done!</div>
                   <div className="success-desc">You're all set to start making an impact. Click continue to explore opportunities matched to your profile.</div>
                 </div>
              </div>
            </div>
          )}

          {/* Global Error */}
          {error && <div className="auth-error" style={{ padding: '12px', marginTop: '16px' }}>{error}</div>}

          {/* Bottom Nav Buttons */}
          <div className="profile-footer" style={{ marginTop: '24px' }}>
            {step > 1 && (
              <button className="auth-btn-secondary btn-back" type="button" onClick={() => setStep(step - 1)}>
                &lt; Back
              </button>
            )}
            
            {step < 3 ? (
              <button 
                className="auth-btn-primary btn-next" 
                style={{ marginLeft: step === 1 ? 'auto' : 0, width: step === 1 ? '100%' : '50%' }} 
                type="button" 
                onClick={() => setStep(step + 1)}
                disabled={(step === 1 && skills.length < 2) || (step === 2 && !availability)}
              >
                Continue &gt;
              </button>
            ) : (
              <button 
                className="auth-btn-primary btn-next" 
                style={{ width: '50%' }}
                type="button" 
                onClick={handleComplete} 
                disabled={loading || !address.trim()}
              >
                {loading ? "Completing..." : "Complete Profile >"}
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
