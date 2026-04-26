/**
 * Dashboard.tsx
 * Protected page — requires token.
 * Extracted layout mapped strictly to the backend `fetchOpportunities` endpoints.
 * Includes interactive animations and notification popup states.
 */
import { useState, useEffect, useMemo } from "react";
import { fetchProfile, fetchOpportunities, logout } from "../api/auth";
import type { ProfileData, Opportunity } from "../api/auth";
import { getToken } from "../api/api";
import { navigate } from "../navigation";
import "../css/dashboard.css";

// --- SVG Icons ---
const PinIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const ClockIcon = () => <svg className="purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const CalendarIcon = () => <svg className="purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const PeopleIcon = () => <svg className="green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const SirenIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4" /><path d="M12 14v4" /><path d="M12 22v-4" /><path d="M6 10c0-3.3 2.7-6 6-6s6 2.7 6 6v4H6v-4z" /></svg>;
const StarIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
const BellIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const StarIconLine = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;

// Dynamic Mapping Helpers
const getCategoryColor = (cat: string) => {
  const c = (cat || "").toLowerCase();
  if (c.includes("food")) return "orange";
  if (c.includes("medical") || c.includes("health")) return "pink";
  if (c.includes("disaster") || c.includes("shelter")) return "blue";
  if (c.includes("water")) return "cyan";
  if (c.includes("education")) return "purple";
  if (c.includes("environment")) return "green";
  return "purple"; // default
};

const formatDate = (ds?: string) => {
  if (!ds) return "Ongoing";
  const d = new Date(ds);
  return d.toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" }) + " • " + d.toLocaleDateString();
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalMode, setModalMode] = useState<"urgent" | "recommended" | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      navigate("login");
      return;
    }

    Promise.all([fetchProfile(), fetchOpportunities()])
      .then(([prof, opps]) => {
        setProfile(prof);
        if (opps?.items) {
          setOpportunities(opps.items);
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load dashboard data";
        if (
          msg.startsWith("AUTH_ERROR:") ||
          msg.toLowerCase().includes("token") ||
          msg.toLowerCase().includes("invalid")
        ) {
          logout();
          navigate("login");
        } else {
          setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    navigate("login");
  }

  // Derive Display Names
  const displayName = profile?.email ? profile.email.split('@')[0].replace(/[^a-zA-Z]/g, '') : "User";
  const capitalName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const avatarLetter = capitalName.charAt(0) || "U";

  // Compute Full Lists Arrays Natively (avoids backend limit caps allowing unrestricted 'View All' UX)
  const fullUrgentTasks = useMemo(() => {
    return opportunities.filter(o => o.urgency === 'high');
  }, [opportunities]);

  const fullRecommendedTasks = useMemo(() => {
    if (!opportunities.length) return [];

    // Exact mapping of the backend AI recommendation ranking matrix:
    const userSkills = profile?.skills || [];
    const userInterests = profile?.interests || [];

    const scored = opportunities.map(opp => {
      let score = 0;
      const cat = opp.category || "general";
      if (userInterests.includes(cat)) score += 2;
      if (userSkills.includes(cat)) score += 1;
      return { opp, score };
    });

    return scored.sort((a, b) => b.score - a.score).map(x => x.opp);
  }, [opportunities, profile]);

  // Derive Preview Windows (4 items max)
  const topUrgentTasks = fullUrgentTasks.slice(0, 4);
  const topRecommendedTasks = fullRecommendedTasks.slice(0, 4);

  // Derive Modal State Targeting
  const modalTasks = modalMode === "urgent" ? fullUrgentTasks : fullRecommendedTasks;
  const modalTitle = modalMode === "urgent" ? "All Urgent Tasks" : "Personalized Opportunities";
  const ModalIcon = modalMode === "urgent" ? SirenIcon : StarIcon;

  if (error) return <div style={{ padding: '40px', color: 'red' }}>Error: {error}</div>;

  return (
    <div className="dashboard-root">

      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <aside className={`ds-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="ds-logo" style={{ cursor: 'pointer' }} onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Toggle Sidebar">
          <div className="ds-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className="ds-logo-text">Smart Aid</span>
        </div>

        <nav className="ds-nav">
          <a href="#dashboard" className="ds-nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
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
          <a href="#dashboard" className="ds-nav-item" onClick={(e) => { e.preventDefault(); setIsNotifOpen(true); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            <span className="ds-nav-item-text">Alerts</span>
            <span className="ds-badge">2</span>
          </a>
          <a href="#profile" className="ds-nav-item" onClick={(e) => { e.preventDefault(); navigate("profile"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            <span className="ds-nav-item-text">Profile</span>
          </a>
        </nav>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <main className={`ds-main ${sidebarCollapsed ? 'collapsed' : ''}`} onClick={(e) => {
        // Close popup if clicking inside main but outside the notification toggle
        if (!(e.target as Element).closest('.ds-notification-btn') && !((e.target as Element).closest('.ds-notification-popup'))) {
          setIsNotifOpen(false);
        }
      }}>

        {/* Header */}
        <header className="ds-header">
          <div className="ds-greeting">
            <p>Ready to make a difference today?</p>
          </div>
          <div className="ds-header-actions">

            {/* Interactive Bell Toggle */}
            <button className="ds-notification-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
              <BellIcon />
              <div className="ds-notification-dot"></div>
            </button>

            {/* Absolute Popup Menu */}
            <div className={`ds-notification-popup ${isNotifOpen ? 'open' : ''}`}>
              <div className="ds-notif-header">Notifications (2)</div>
              <div className="ds-notif-item">
                <div className="ds-notif-item-icon green"><SirenIcon /></div>
                <div className="ds-notif-item-body">
                  <h4>New Urgent Match</h4>
                  <p>Flood relief requested ~2 miles from your saved location.</p>
                </div>
              </div>
              <div className="ds-notif-item">
                <div className="ds-notif-item-icon"><StarIconLine /></div>
                <div className="ds-notif-item-body">
                  <h4>Weekly Wrap-up</h4>
                  <p>You helped 12 people this week. View your impact report!</p>
                </div>
              </div>
            </div>

            <div className="ds-avatar" onClick={handleLogout} title="Click to Logout">
              {avatarLetter}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="ds-content">

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#64748b' }}>
              <svg className="ds-section-anim" style={{ animation: 'urgentBlink 1.5s ease-in-out infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
          ) : (
            <>
              {/* Section 1: Urgent Tasks */}
              <section className="ds-section-anim">
                <div className="ds-section-header">
                  <div className="ds-section-title">
                    <div className="ds-section-icon red">
                      <SirenIcon />
                    </div>
                    <h2>Urgent Tasks</h2>
                    <span className="ds-section-tag">{fullUrgentTasks.length} Available</span>
                  </div>
                  <a href="#dashboard" onClick={e => { e.preventDefault(); setModalMode("urgent"); }} className="ds-view-all">View All</a>
                </div>

                <div className="ds-cards-row">
                  {topUrgentTasks.length > 0 ? topUrgentTasks.map(task => (
                    <div key={task._id} className="ds-task-card">
                      <div className="ds-card-tags">
                        <span className={`ds-tag ${getCategoryColor(task.category)}`}>
                          {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                        </span>
                        <span className="ds-tag red">• Urgent</span>
                      </div>
                      <h3 className="ds-task-title">{task.title}</h3>
                      <div className="ds-task-details">
                        <div className="ds-detail-row"><PinIcon /> {task.location?.address || "Location unavailable"}</div>
                        <div className="ds-detail-row"><ClockIcon /> {formatDate(task.schedule?.startTime)}</div>
                        <div className="ds-detail-row"><PeopleIcon /> {task.requirements?.peopleNeeded || 0} people need help</div>
                      </div>
                      <button className="ds-card-btn primary" style={{ marginTop: 'auto' }} onClick={() => {
                        sessionStorage.setItem("selectedTask", JSON.stringify(task));
                        navigate("task-detail");
                      }}>
                        Join Task
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                      </button>
                    </div>
                  )) : (
                    <p style={{ color: '#64748b' }}>No extremely urgent tasks nearby at the moment!</p>
                  )}
                </div>
              </section>

              <div style={{ height: '2px', background: '#e2e8f0', margin: '6px 0' }}></div>

              {/* Section 2: Recommended */}
              <section className="ds-section-anim">
                <div className="ds-section-header">
                  <div className="ds-section-title">
                    <div className="ds-section-icon yellow">
                      <StarIcon />
                    </div>
                    <h2>Recommended for You</h2>
                    <span className="ds-section-tag" style={{ background: '#3b82f6' }}>{fullRecommendedTasks.length} Matches</span>
                  </div>
                  <a href="#dashboard" onClick={e => { e.preventDefault(); setModalMode("recommended"); }} className="ds-view-all">View All</a>
                </div>

                <div className="ds-cards-row">
                  {topRecommendedTasks.length > 0 ? topRecommendedTasks.map((task, i) => (
                    <div key={task._id} className="ds-task-card">
                      <div className="ds-card-tags">
                        <span className={`ds-tag ${getCategoryColor(task.category)}`}>
                          {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                        </span>
                        {/* Simulated match percentage logic for aesthetics based on index */}
                        <span className="ds-tag outline-green">{95 - (i * 2)}% match</span>
                      </div>
                      <h3 className="ds-task-title">{task.title}</h3>
                      <div className="ds-task-details">
                        <div className="ds-detail-row"><PinIcon /> {task.location?.address || "Remote available"}</div>
                        <div className="ds-detail-row"><CalendarIcon /> {formatDate(task.schedule?.startTime)}</div>
                      </div>
                      <button className="ds-card-btn secondary" style={{ marginTop: 'auto' }} onClick={() => {
                        sessionStorage.setItem("selectedTask", JSON.stringify(task));
                        navigate("task-detail");
                      }}>
                        Learn More
                      </button>
                    </div>
                  )) : (
                    <p style={{ color: '#64748b' }}>Check back later for personalized recommendations.</p>
                  )}
                </div>
              </section>

              {/* Section 3: Recent Notifications (Stub with animation) */}
              <section className="ds-section-anim">
                <div className="ds-section-header">
                  <div className="ds-section-title">
                    <div className="ds-section-icon blue">
                      <BellIcon />
                    </div>
                    <h2>Recent Notifications</h2>
                  </div>
                </div>
                <div className="ds-task-card" style={{ width: '100%' }}>
                  <p style={{ color: '#64748b', margin: 0 }}>No new background notifications. You are all caught up!</p>
                </div>
              </section>
            </>
          )}

        </div>
      </main>

      {/* ── MODAL OVERLAY ────────────────────────────────────────── */}
      {modalMode !== null && (
        <div className="ds-modal-overlay" onClick={() => setModalMode(null)}>
          <div className="ds-modal" onClick={e => e.stopPropagation()}>
            <div className="ds-modal-header">
              <h2>
                <ModalIcon /> {modalTitle}
              </h2>
              <button className="ds-close-btn" onClick={() => setModalMode(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="ds-modal-content">
              {modalTasks.length > 0 ? modalTasks.map((task, i) => (
                <div key={task._id} className="ds-task-card" style={{ minWidth: '100%', width: '100%' }}>
                  <div className="ds-card-tags">
                    <span className={`ds-tag ${getCategoryColor(task.category)}`}>
                      {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                    </span>
                    {modalMode === "urgent" ? (
                      <span className="ds-tag red">• Urgent</span>
                    ) : (
                      <span className="ds-tag outline-green">Top Match</span>
                    )}
                  </div>
                  <h3 className="ds-task-title">{task.title}</h3>
                  <div className="ds-task-details">
                    <div className="ds-detail-row"><PinIcon /> {task.location?.address || "Remote available"}</div>
                    <div className="ds-detail-row"><CalendarIcon /> {formatDate(task.schedule?.startTime)}</div>
                    {modalMode === "urgent" && (
                      <div className="ds-detail-row"><PeopleIcon /> {task.requirements?.peopleNeeded || 0} people need help</div>
                    )}
                  </div>
                  <button className="ds-card-btn secondary" style={{ marginTop: 'auto' }} onClick={() => {
                    sessionStorage.setItem("selectedTask", JSON.stringify(task));
                    navigate("task-detail");
                  }}>
                    Learn More
                  </button>
                </div>
              )) : (
                <p style={{ color: '#64748b', textAlign: 'center', width: '100%' }}>No tasks available for this category right now.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
