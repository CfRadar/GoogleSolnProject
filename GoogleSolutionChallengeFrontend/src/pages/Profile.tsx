import { useState, useEffect } from "react";
import { fetchProfile, fetchRecommendations, fetchLeaderboard, logout } from "../api/auth";
import type { ProfileData, Opportunity } from "../api/auth";
import { navigate } from "../navigation";
import "../css/profile.css";

const BackIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="15" y1="18" x2="9" y2="12" /><line x1="15" y1="6" x2="9" y2="12" /></svg>;
const CrownIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h20M2 20h20M7 8v8M17 8v8M12 8v8M3 12h18"/></svg>;
const CrownIconRank = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="2 15 2 2 7 6 12 2 17 6 22 2 22 15 2 15"/><line x1="2" y1="19" x2="22" y2="19"/></svg>;

const PeopleIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const ClockIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const TaskIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const RibbonIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>;

const TargetIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const TrendUpIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const MultiCategoryIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;

const TrophyIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10"/><path d="M17 4v8a5 5 0 0 1-10 0V4"/><path d="M4 4h3v8H4z"/><path d="M17 4h3v8h-3z"/></svg>;
const HeartSolidIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const StarSolidIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const MultiUserIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const LightningIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const CalendarIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [recs, setRecs] = useState<Opportunity[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [filter, setFilter] = useState("This Month");

  useEffect(() => {
    Promise.all([
      fetchProfile(),
      fetchRecommendations().catch(() => []),
      fetchLeaderboard().catch(() => [])
    ]).then(([prof, recsResp, leadResp]) => {
      setProfile(prof);
      setRecs(recsResp || []);
      setLeaderboard(leadResp || []);
    }).catch(() => navigate("login"));
  }, []);

  if (!profile) return <div className="prof-loading">Loading Profile...</div>;

  const stats = profile.stats || { peopleHelped: 0, hoursContributed: 0, tasksCompleted: 0 };
  
  // Real values directly from the DB
  const displayPeople = stats.peopleHelped || 0;
  const displayHours = stats.hoursContributed || 0;
  const displayTasks = stats.tasksCompleted || 0;

  const goals = {
    people: { current: displayPeople, target: 50 },
    hours: { current: displayHours, target: 20 },
    tasks: { current: displayTasks, target: 10 },
  };

  const getPercent = (curr: number, tar: number) => Math.min(100, Math.round((curr / tar) * 100));

  const userRankIndex = leaderboard.findIndex((u) => u.email === profile.email);
  const actualRank = userRankIndex !== -1 ? userRankIndex + 1 : "-";

  return (
    <div className="prof-page">
      {/* HEADER BAR */}
      <header className="prof-header">
        <button className="prof-back-btn" onClick={() => navigate("dashboard")}>
          <BackIcon /> Back to Dashboard
        </button>
      </header>

      {/* HERO / TITLE SECTION */}
      <div className="prof-hero">
        <div className="prof-title-area" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div>
            <h1 className="prof-title">Your Impact</h1>
            <p className="prof-subtitle">Track your volunteer journey and celebrate your achievements</p>
          </div>
          <button className="ds-card-btn secondary" style={{padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px'}} onClick={() => navigate("profile-edit")}>
            Edit Profile
          </button>
        </div>
        <div className="prof-rank-badge">
          <CrownIconRank />
          <div>
            <div className="prof-rank-label">Your Rank</div>
            <div className="prof-rank-val">#{actualRank}</div>
          </div>
        </div>
      </div>

      <div className="prof-content-wrapper">
        
        {/* TIME FILTERS */}
        <div className="prof-filters">
          {["This Week", "This Month", "This Year"].map((f) => (
            <button 
              key={f} 
              className={`prof-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 3 STATS CARDS */}
        <div className="prof-stats-grid">
          <div className="prof-stat-card blue">
            <div className="prof-stat-top">
              <div className="prof-stat-icon"><PeopleIcon /></div>
              <div className="prof-stat-trend"><TrendUpIcon/> +23%</div>
            </div>
            <div className="prof-stat-val">{displayPeople}</div>
            <div className="prof-stat-label">People Helped</div>
          </div>
          
          <div className="prof-stat-card green">
            <div className="prof-stat-top">
              <div className="prof-stat-icon"><ClockIcon /></div>
              <div className="prof-stat-trend"><TrendUpIcon/> +18%</div>
            </div>
            <div className="prof-stat-val">{displayHours}</div>
            <div className="prof-stat-label">Hours Contributed</div>
          </div>
          
          <div className="prof-stat-card purple">
            <div className="prof-stat-top">
              <div className="prof-stat-icon"><RibbonIcon /></div>
              <div className="prof-stat-trend"><TrendUpIcon/> +15%</div>
            </div>
            <div className="prof-stat-val">{displayTasks}</div>
            <div className="prof-stat-label">Tasks Completed</div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="prof-main-layout">
          
          {/* LEFT COLUMN */}
          <div className="prof-left-col">
            
            {/* GOALS */}
            <div className="prof-card">
              <h2 className="prof-card-title"><TargetIcon/> Progress Towards Goals</h2>
              
              <div className="prof-goal-item">
                <div className="prof-goal-header">
                  <span>People Helped This Month</span>
                  <strong>{goals.people.current} / {goals.people.target}</strong>
                </div>
                <div className="prof-pg-track">
                  <div className="prof-pg-fill pg-blue" style={{width: `${getPercent(goals.people.current, goals.people.target)}%`}}></div>
                  <div className="prof-pg-label" style={{right: '10px'}}>{getPercent(goals.people.current, goals.people.target)}%</div>
                </div>
              </div>

              <div className="prof-goal-item">
                <div className="prof-goal-header">
                  <span>Hours This Month</span>
                  <strong>{goals.hours.current} / {goals.hours.target}</strong>
                </div>
                <div className="prof-pg-track">
                  <div className="prof-pg-fill pg-green" style={{width: `${getPercent(goals.hours.current, goals.hours.target)}%`}}></div>
                  <div className="prof-pg-label" style={{right: '10px'}}>{getPercent(goals.hours.current, goals.hours.target)}%</div>
                </div>
              </div>

              <div className="prof-goal-item">
                <div className="prof-goal-header">
                  <span>Tasks This Year</span>
                  <strong>{goals.tasks.current} / {goals.tasks.target}</strong>
                </div>
                <div className="prof-pg-track">
                  <div className="prof-pg-fill pg-purple" style={{width: `${getPercent(goals.tasks.current, goals.tasks.target)}%`}}></div>
                  <div className="prof-pg-label" style={{right: '10px'}}>{getPercent(goals.tasks.current, goals.tasks.target)}%</div>
                </div>
              </div>
            </div>

            {/* LEADERBOARD SCORES */}
            <div className="prof-card">
              <h2 className="prof-card-title"><TrophyIcon/> Leaderboard Standings</h2>
              <div className="prof-chart-area">
                <div className="prof-chart-bars">
                  {leaderboard.length > 0 ? leaderboard.slice(0, 4).map((user, idx) => {
                    const maxScore = Math.max(...leaderboard.slice(0, 4).map(u => u.rankingScore || 1));
                    const h = Math.min(100, Math.max(10, ((user.rankingScore || 0) / maxScore) * 100));
                    const label = user.email ? user.email.split('@')[0] : `User ${idx+1}`;
                    const isMe = user.email === profile.email;
                    return (
                      <div className="prof-bar-col" key={idx}>
                        <div className="prof-bar" style={{height: `${h}%`, background: isMe ? '#22c55e' : undefined}}></div>
                        <span className="prof-bar-label" style={{fontSize: '0.7rem', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden'}}>{label}</span>
                      </div>
                    );
                  }) : (
                    <div style={{width: '100%', textAlign: 'center', color: '#64748b'}}>No leaderboard data available.</div>
                  )}
                </div>
                <div className="prof-chart-legend">
                  <div className="legend-item"><span className="legend-cd blue"></span> Score</div>
                  <div className="legend-item"><span className="legend-cd" style={{background: '#22c55e'}}></span> You</div>
                </div>
              </div>
            </div>

            {/* USER INTERESTS & SKILLS */}
            <div className="prof-card">
              <h2 className="prof-card-title" style={{color: '#8b5cf6'}}><MultiCategoryIcon/> Your Registered Skills</h2>
              <div className="prof-cat-list" style={{display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px 0'}}>
                {(profile.skills && profile.skills.length > 0) ? profile.skills.map((skill, index) => (
                  <span key={index} style={{background: '#e0e7ff', color: '#4338ca', padding: '6px 12px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 500}}>
                    {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  </span>
                )) : (
                  <div style={{color: '#64748b', fontSize: '0.9rem'}}>No specific skills registered.</div>
                )}
              </div>

              <h2 className="prof-card-title" style={{color: '#f97316', marginTop: '20px'}}><HeartSolidIcon/> Your Interests</h2>
              <div className="prof-cat-list" style={{display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px 0'}}>
                {(profile.interests && profile.interests.length > 0) ? profile.interests.map((interest, index) => (
                  <span key={index} style={{background: '#ffedd5', color: '#c2410c', padding: '6px 12px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 500}}>
                    {interest.charAt(0).toUpperCase() + interest.slice(1)}
                  </span>
                )) : (
                  <div style={{color: '#64748b', fontSize: '0.9rem'}}>No specific interests registered.</div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="prof-right-col">
            
            {/* ACHIEVEMENTS */}
            <div className="prof-card">
              <h2 className="prof-card-title"><TrophyIcon/> Achievements</h2>
              <div className="prof-ach-grid">
                <div className="prof-ach-badge blue">
                  <div className="star-icon"><StarSolidIcon/></div>
                  <div className="badge-icon"><StarSolidIcon/></div>
                  <span>First Timer</span>
                </div>
                <div className="prof-ach-badge purple">
                  <div className="star-icon"><StarSolidIcon/></div>
                  <div className="badge-icon"><MultiUserIcon/></div>
                  <span>Team Player</span>
                </div>
                <div className="prof-ach-badge green">
                  <div className="star-icon"><StarSolidIcon/></div>
                  <div className="badge-icon"><ClockIcon/></div>
                  <span>Time Champion</span>
                </div>
                <div className="prof-ach-badge red">
                  <div className="star-icon"><StarSolidIcon/></div>
                  <div className="badge-icon"><HeartSolidIcon/></div>
                  <span>Impact Maker</span>
                </div>
                <div className="prof-ach-badge orange">
                  <div className="star-icon"><StarSolidIcon/></div>
                  <div className="badge-icon"><TrophyIcon/></div>
                  <span>Rising Star</span>
                </div>
                <div className="prof-ach-badge gray">
                  <div className="badge-icon" style={{opacity: 0.5}}><TargetIcon/></div>
                  <span>Consistency King</span>
                </div>
              </div>
              <div className="prof-ach-footer">5 of 6 unlocked</div>
            </div>

            {/* RECOMMENDED ACTIVITY */}
            <div className="prof-card">
              <h2 className="prof-card-title" style={{color: '#3b82f6'}}><CalendarIcon/> Recommended For You</h2>
              <div className="prof-recent-list" style={{maxHeight: '500px', overflowY: 'auto', paddingRight: '12px'}}>
                {recs && recs.length > 0 ? recs.map((task) => (
                  <div className="prof-recent-item" key={task._id}>
                    <div className="prof-recent-top">
                      <h4>{task.title}</h4>
                      <span className={`prof-tag ${task.urgency === 'high' ? 'red-tag' : 'yellow-tag'}`}>
                        {task.urgency} priority
                      </span>
                    </div>
                    <span className="prof-recent-time">{task.location?.address || "Location unavailable"}</span>
                    <div className="prof-recent-meta">
                      <span><MultiUserIcon/> {task.requirements?.peopleNeeded || 10} needed</span>
                      <span><ClockIcon/> Open</span>
                    </div>
                    <button className="ds-card-btn secondary" style={{marginTop: '12px', width: '100%', padding: '8px', fontSize: '0.85rem'}} onClick={() => {
                      sessionStorage.setItem("selectedTask", JSON.stringify(task));
                      navigate("task-detail");
                    }}>
                      Go to Task
                    </button>
                  </div>
                )) : (
                  <div style={{color: '#64748b', fontSize: '0.95rem', padding: '10px 0'}}>
                    No active recommendations found. Check back later!
                  </div>
                )}
              </div>
            </div>

            {/* MOTIVATION CARD */}
            <div className="prof-motivate-card">
              <div className="motivate-icon"><LightningIcon/></div>
              <div className="motivate-content">
                <h3>Keep It Up!</h3>
                <p>You're on fire this month</p>
              </div>
              <div className="motivate-desc">
                Just 10 more people to reach your monthly goal.<br/>
                You're making amazing impact! 🚀
              </div>
            </div>

          </div>

        </div>
      </div>
      
    </div>
  );
}
