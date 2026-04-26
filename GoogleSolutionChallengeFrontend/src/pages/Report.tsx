import { useState, useEffect } from "react";
import { navigate } from "../navigation";
import { submitReport, logout } from "../api/auth";
import { getToken, getUser } from "../api/api";
import "../css/taskdetail.css"; // Reuse existing layout wrappers

// --- UI Icons ---
const BellIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const MenuIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
const CloseIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;

const MapPinIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6', width: '18px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const TagIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#22c55e', width: '18px' }}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
const UsersIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#a855f7', width: '18px' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const AlertCircleIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444', width: '18px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;

const URGENCY_LABELS = ["Low", "Medium", "High", "Critical"];
const URGENCY_COLORS = ["#22c55e", "#eab308", "#f97316", "#dc2626"];
const API_URGENCY_MAP = ["low", "medium", "high", "high"];

export default function ReportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const email = getUser()?.email || "User";
  const avatarLetter = email.charAt(0).toUpperCase();

  // Form states matching mockup
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("disaster");
  const [peopleAffected, setPeopleAffected] = useState("");
  const [urgencyVal, setUrgencyVal] = useState(2); // Default to High (index 2)
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!getToken()) navigate("login");
  }, []);

  function handleLogout() {
    logout();
    navigate("login");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      await submitReport({
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Event in ${address.split(',')[0] || 'Unknown Region'}`, // Auto-gen title
        description: details,
        category,
        urgency: API_URGENCY_MAP[urgencyVal] || "high",
        peopleAffected: Number(peopleAffected) || 1,
        location: { address },
        status: "submitted"
      });
      setSuccess(true);
      // Reset form
      setAddress("");
      setCategory("disaster");
      setPeopleAffected("");
      setUrgencyVal(2);
      setDetails("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit crisis report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-root">
      <style>{`
        .custom-slider {
          flex: 1;
          -webkit-appearance: none;
          height: 8px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
        }
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .custom-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .report-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background-color: #fafafa;
          outline: none;
          font-size: 1rem;
          color: #374151;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .report-input:focus {
          border-color: #3b82f6;
          background-color: #fff;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        .report-input::placeholder {
          color: #9ca3af;
        }
      `}</style>
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
          <a href="#report" className="ds-nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
            <span className="ds-nav-item-text">Report Crisis</span>
          </a>
          <a href="#profile" className="ds-nav-item" onClick={(e) => { e.preventDefault(); navigate("profile"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
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
            <h1 style={{ fontSize: '1.2rem', margin: 0 }}>Report New Crisis</h1>
          </div>
          <div className="ds-header-actions">
            <button className="ds-icon-btn"><BellIcon /></button>
            <div className="ds-avatar" onClick={handleLogout} title="Logout">{avatarLetter}</div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ padding: '40px 20px', backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 72px)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: '32px' }}>Report Details</h2>

            {success && (
              <div style={{ background: '#dcfce7', color: '#166534', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 500 }}>
                ✅ Report successfully submitted to the system!
              </div>
            )}

            {errorMsg && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 500 }}>
                ❌ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* Location */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#4b5563', marginBottom: '10px', fontWeight: 500 }}>
                  <MapPinIcon /> Location
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  className="report-input"
                  placeholder="e.g., Downtown Shelter, 123 Main St"
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#4b5563', marginBottom: '10px', fontWeight: 500 }}>
                  <TagIcon /> Category
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="report-input"
                    style={{ appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="disaster">Select a category</option>
                    <option value="disaster">Disaster Response</option>
                    <option value="medical">Medical Assistance</option>
                    <option value="food">Food & Shelter</option>
                    <option value="environment">Environmental</option>
                    <option value="other">Other Community Need</option>
                  </select>
                  <svg style={{ position: 'absolute', right: '16px', top: '18px', pointerEvents: 'none', width: '16px', color: '#6b7280' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </div>
              </div>

              {/* People Affected */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#4b5563', marginBottom: '10px', fontWeight: 500 }}>
                  <UsersIcon /> People Affected
                </label>
                <input
                  type="number"
                  min="1"
                  value={peopleAffected}
                  onChange={e => setPeopleAffected(e.target.value)}
                  required
                  className="report-input"
                  placeholder="Estimated number"
                />
              </div>

              {/* Urgency Level */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#4b5563', marginBottom: '16px', fontWeight: 500 }}>
                  <AlertCircleIcon /> Urgency Level
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="1"
                    value={urgencyVal}
                    onChange={(e) => setUrgencyVal(Number(e.target.value))}
                    className="custom-slider"
                    style={{
                      background: `linear-gradient(to right, #f97316 0%, #f97316 ${(urgencyVal / 3) * 100}%, #e5e7eb ${(urgencyVal / 3) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <span style={{ color: URGENCY_COLORS[urgencyVal], fontWeight: 600, minWidth: '60px' }}>
                    {URGENCY_LABELS[urgencyVal]}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af', marginTop: '10px', paddingRight: '76px' }}>
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                  <span>Critical</span>
                </div>
              </div>

              {/* Additional Details */}
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', color: '#374151', marginBottom: '10px', fontWeight: 700 }}>
                  Additional Details
                </label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  required
                  rows={4}
                  className="report-input"
                  placeholder="Describe the situation, needs, and any immediate actions required..."
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '14px 40px',
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
                  onMouseOut={e => e.currentTarget.style.background = '#3b82f6'}
                >
                  {loading ? 'Submitting...' : 'Submit Form'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
