import { useState, useEffect } from "react";
import { navigate } from "../navigation";
import { updateProfile, fetchProfile, logout } from "../api/auth";
import type { ProfileData } from "../api/auth";
import { getToken, getUser } from "../api/api";
import "../css/taskdetail.css"; // Reuse existing layout wrappers

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
  "Weekdays", "Weekends", "Mornings", "Afternoons", "Evenings", "Flexible"
];

// --- Icons ---
const BellIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const MenuIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
const CloseIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const SettingsIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.8.96 1.41 1h.09a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

export default function ProfileEditPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const email = getUser()?.email || "User";
  const avatarLetter = email.charAt(0).toUpperCase();

  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState("Flexible");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!getToken()) {
      navigate("login");
      return;
    }
    fetchProfile().then((prof) => {
      setSkills(prof.skills || []);
      setInterests(prof.interests || []);
      if (prof.availability) setAvailability(prof.availability);
      if (prof.location?.address) setAddress(prof.location.address);
      setFetching(false);
    }).catch(() => {
      navigate("login");
    });
  }, []);

  function handleLogout() {
    logout();
    navigate("login");
  }

  const toggleArray = (arr: string[], setArr: any, item: string) => {
    if (arr.includes(item)) {
      setArr(arr.filter(x => x !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      await updateProfile({
        skills,
        interests,
        availability,
        location: { address }
      });
      setSuccess(true);
      setTimeout(() => navigate("profile"), 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="td-page" style={{display: 'flex', justifyContent: 'center', paddingTop: '100px'}}>Loading Editor...</div>;

  return (
    <div className="dashboard-root">
      {/* ── SIDEBAR ────────────────────────────────────────────────────── */}
      <aside className={`ds-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ds-sidebar-header">
          <div className="ds-logo">
            <div className="ds-logo-box"></div>
            <strong>SmartAid</strong>
          </div>
          <button className="ds-mobile-close" onClick={() => setSidebarOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <nav className="ds-nav">
          <a href="#dashboard" className="ds-nav-item" onClick={(e) => { e.preventDefault(); navigate("dashboard"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>
            <span className="ds-nav-item-text">Dashboard</span>
          </a>
          <a href="#tasks" className="ds-nav-item" onClick={(e) => { e.preventDefault(); navigate("tasks"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
            <span className="ds-nav-item-text">My Tasks</span>
          </a>
          <a href="#report" className="ds-nav-item" onClick={(e) => { e.preventDefault(); navigate("report"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
            <span className="ds-nav-item-text">Report Crisis</span>
          </a>
          <a href="#profile" className="ds-nav-item active" onClick={(e) => { e.preventDefault(); navigate("profile"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            <span className="ds-nav-item-text">Profile</span>
          </a>
        </nav>
      </aside>

      {/* ── MOBILE OVERLAY ─────────────────────────────────────────────── */}
      {sidebarOpen && <div className="ds-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
      <main className="ds-main">
        {/* Header (Top Nav) */}
        <header className="ds-header">
          <div className="ds-header-left">
            <button className="ds-mobile-menu" onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <h1 style={{fontSize:'1.2rem', margin:0}}>Edit Profile</h1>
          </div>
          <div className="ds-header-actions">
            <button className="ds-icon-btn"><BellIcon /></button>
            <div className="ds-avatar" onClick={handleLogout} title="Logout">{avatarLetter}</div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ padding: '40px 20px', backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 72px)' }}>
          <div style={{maxWidth: '700px', margin: '0 auto', background: 'var(--card-bg)', borderRadius: '16px', padding: '30px', border: '1px solid var(--border)'}}>
            
            <div style={{marginBottom: '25px'}}>
              <h2 style={{fontSize: '1.4rem', color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <SettingsIcon/> Updates & Settings
              </h2>
              <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px'}}>Update your skills and availability to receive better opportunity recommendations.</p>
            </div>

            {success && (
              <div style={{background: '#dcfce7', color: '#166534', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 500}}>
                ✅ Profile successfully updated! Redirecting...
              </div>
            )}

            {errorMsg && (
              <div style={{background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 500}}>
                ❌ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
              
              {/* SKILLS */}
              <div>
                <label style={{display: 'block', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600}}>YOUR SKILLS</label>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                  {ALL_SKILLS.map((s) => {
                    const isSelected = skills.includes(s.toLowerCase()) || skills.includes(s);
                    return (
                       <div key={s} onClick={() => toggleArray(skills, setSkills, s.toLowerCase())} style={{
                         padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, border: '1px solid',
                         background: isSelected ? '#e0e7ff' : 'var(--bg)',
                         color: isSelected ? '#4338ca' : 'var(--text-muted)',
                         borderColor: isSelected ? '#c7d2fe' : 'var(--border)'
                       }}>
                         {s}
                       </div>
                    );
                  })}
                </div>
              </div>

              {/* INTERESTS */}
              <div>
                <label style={{display: 'block', marginBottom: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600}}>YOUR INTERESTS</label>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                  {ALL_INTERESTS.map((i) => {
                    const isSelected = interests.includes(i.toLowerCase()) || interests.includes(i);
                    return (
                       <div key={i} onClick={() => toggleArray(interests, setInterests, i.toLowerCase())} style={{
                         padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, border: '1px solid',
                         background: isSelected ? '#ffedd5' : 'var(--bg)',
                         color: isSelected ? '#c2410c' : 'var(--text-muted)',
                         borderColor: isSelected ? '#fed7aa' : 'var(--border)'
                       }}>
                         {i}
                       </div>
                    );
                  })}
                </div>
              </div>

              {/* AVAILABILITY */}
              <div>
                 <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600}}>AVAILABILITY</label>
                 <select 
                   value={availability} 
                   onChange={e => setAvailability(e.target.value)}
                   style={{width: '100%', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', outline: 'none'}}
                 >
                   {AVAILABILITIES.map(a => <option key={a} value={a}>{a}</option>)}
                 </select>
              </div>

              {/* LOCATION */}
              <div>
                 <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600}}>LOCATION ADDRESS</label>
                 <input 
                   type="text" 
                   value={address} 
                   onChange={e => setAddress(e.target.value)} 
                   required 
                   placeholder="e.g. San Francisco, CA"
                   style={{width: '100%', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', outline: 'none'}}
                 />
              </div>

              <div style={{display: 'flex', gap: '15px', marginTop: '10px'}}>
                <button type="button" onClick={() => navigate("profile")} style={{
                    flex: 1, padding: '14px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'
                }}>Cancel</button>

                <button type="submit" disabled={loading} style={{
                    flex: 2, padding: '14px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
                }}>
                  {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
