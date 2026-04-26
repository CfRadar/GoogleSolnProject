import { useState, useEffect } from "react";
import { navigate } from "../navigation";
import "../css/taskdetail.css";

const BackIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const ShareIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const HeartIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const HeartIconSolid = () => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const PinIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const CalendarIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ClockIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const PeopleIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CheckCircleIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const AwardIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>;
const NavigationIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>;

const getUrgencyText = (urgency: string) => {
  if (urgency === "high") return "Critical Priority";
  if (urgency === "medium") return "Medium Priority";
  return "Low Priority";
};

const getUrgencyColorClass = (urgency: string) => {
  if (urgency === "high") return "urgency-red";
  if (urgency === "medium") return "urgency-yellow";
  return "urgency-green";
};

export default function TaskDetailPage() {
  const [task, setTask] = useState<any>(null); // using any for flexible backend fields

  useEffect(() => {
    const data = sessionStorage.getItem("selectedTask");
    if (data) {
      setTask(JSON.parse(data));
    } else {
      navigate("tasks"); // Redirect back if no task
    }
  }, []);

  if (!task) return <div className="td-loading">Loading...</div>;

  const totalSpots = task.requirements?.peopleNeeded;
  const joined = task.participants?.length || 0; 
  const spotsLeftDisplay = totalSpots ? Math.max(0, totalSpots - joined) : "-";
  const progressPercent = totalSpots ? Math.min(100, (joined / totalSpots) * 100) : 0;

  // Use createdAt or updated at if available
  let createdDateObj = task.createdAt?.$date || task.createdAt; 
  let expiresDateObj = task.expiresAt?.$date || task.expiresAt;
  
  const dateStr = createdDateObj
    ? new Date(createdDateObj).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) 
    : "-";
  
  const shortDate = createdDateObj
    ? new Date(createdDateObj).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) 
    : "-";

  const expiresStr = expiresDateObj 
    ? new Date(expiresDateObj).toLocaleDateString('en-US')
    : "-";
    
  const isFlexible = task.schedule?.isFlexible ? "Flexible Schedule" : "Fixed Schedule";
    
  const orgName = task.sourceDetails?.name || "-";
  const orgUrl = task.sourceDetails?.url || "#";
  const contactEmail = task.contact?.email || "-";
  const contactPhone = task.contact?.phone || "-";
  
  const resourcesNeeded = task.requirements?.resourcesNeeded || [];
  
  // Real impact data
  const peopleAffected = task.impact?.peopleAffected ?? "-";
  const severityScore = task.impact?.severityScore ?? "-";
  
  const lat = task.location?.coordinates?.[1];
  const lng = task.location?.coordinates?.[0];

  return (
    <div className="td-page">
      {/* HEADER BAR */}
      <header className="td-header">
        <button className="td-back-btn" onClick={() => window.history.back()}>
          <BackIcon /> Back to Tasks
        </button>
        <div className="td-header-actions">
          <button className="td-icon-btn"><ShareIcon /></button>
          <button className="td-icon-btn"><HeartIcon /></button>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="td-hero">
        <div className="td-tags">
          <span className={`td-tag ${getUrgencyColorClass(task.urgency)}`}>
            <span className="td-dot"></span> {getUrgencyText(task.urgency)}
          </span>
          <span className="td-tag category-orange">
            {task.category ? task.category.charAt(0).toUpperCase() + task.category.slice(1) : "General"}
          </span>
        </div>
        <h1 className="td-title">{task.title || "-"}</h1>
        
        <div className="td-quick-info">
          <div className="td-info-block blue-bg">
            <div className="td-info-icon"><PinIcon/></div>
            <div className="td-info-text">
                <span className="td-info-label">Location</span>
              <span className="td-info-val">{lat !== undefined && lng !== undefined ? "Map available" : "-"}</span>
            </div>
          </div>
          <div className="td-info-block purple-bg">
            <div className="td-info-icon"><CalendarIcon/></div>
            <div className="td-info-text">
              <span className="td-info-label">Date</span>
              <span className="td-info-val">{shortDate}</span>
            </div>
          </div>
          <div className="td-info-block green-bg">
            <div className="td-info-icon"><ClockIcon/></div>
            <div className="td-info-text">
              <span className="td-info-label">Schedule Type</span>
              <span className="td-info-val">{isFlexible}</span>
            </div>
          </div>
          <div className="td-info-block orange-bg">
            <div className="td-info-icon"><PeopleIcon/></div>
            <div className="td-info-text">
              <span className="td-info-label">Spots Left</span>
              <span className="td-info-val">{spotsLeftDisplay} {totalSpots ? `of ${totalSpots}` : ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN CONTENT */}
      <div className="td-content">
        <div className="td-left-col">
          
          <div className="td-card">
            <h2>About This Task</h2>
            <p className="td-desc">{task.description || "-"}</p>
          </div>

          <div className="td-card">
            <h2><CalendarIcon/> Schedule</h2>
            <div className="td-schedule-list">
              <div className="td-schedule-item">
                <span className="td-sched-label">Schedule Type</span>
                <span className="td-sched-val">{isFlexible}</span>
              </div>
              <div className="td-schedule-item">
                <span className="td-sched-label">Posted Date</span>
                <span className="td-sched-val">{dateStr}</span>
              </div>
              <div className="td-schedule-item">
                <span className="td-sched-label">Expires On</span>
                <span className="td-sched-val">{expiresStr}</span>
              </div>
            </div>
          </div>

          <div className="td-card">
            <h2><CheckCircleIcon/> Requirements</h2>
            {task.requirements && totalSpots ? (
              <ul className="td-req-list">
                <li><CheckCircleIcon/> People Needed: {totalSpots}</li>
              </ul>
            ) : (
              <div style={{ color: "#64748b", fontSize: "15px" }}>-</div>
            )}
          </div>

          <div className="td-card">
            <h2><AwardIcon/> Skills</h2>
            {task.requirements?.skillsRequired && Array.isArray(task.requirements.skillsRequired) && task.requirements.skillsRequired.length > 0 ? (
              <div className="td-skills">
                {task.requirements.skillsRequired.map((skill: string, idx: number) => (
                  <span key={idx} className="td-skill-pill required">{skill}</span>
                ))}
              </div>
            ) : (
              <div style={{ color: "#64748b", fontSize: "15px" }}>-</div>
            )}
            {task.requirements?.skillsRequired?.length > 0 && <span className="td-req-note">* Required skills</span>}
          </div>

          <div className="td-card">
            <h2>What to Bring / Resources Needed</h2>
            {resourcesNeeded && Array.isArray(resourcesNeeded) && resourcesNeeded.length > 0 ? (
              <ul className="td-bullet-list">
                {resourcesNeeded.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <div style={{ color: "#64748b", fontSize: "15px" }}>-</div>
            )}
          </div>

          <div className="td-impact-card">
            <h2>Expected Impact</h2>
            <div className="td-impact-stats">
              <div className="td-stat-box">
                <span className="td-stat-num">{peopleAffected}</span>
                <span className="td-stat-label">People Affected</span>
              </div>
              <div className="td-stat-box">
                <span className="td-stat-num">{severityScore}</span>
                <span className="td-stat-label">Severity Score</span>
              </div>
            </div>
          </div>

        </div>

        <div className="td-right-col">
          
          <div className="td-card">
            <div className="td-volunteers-header">
              <span className="td-vol-label">Volunteers Joined</span>
              <span className="td-vol-count">{joined}/{totalSpots || "-"}</span>
            </div>
            <div className="td-progress-bar">
              <div className="td-progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="td-avatars-row">
               {totalSpots ? (
                 <>
                   <div className="td-av" style={{background: '#8b5cf6'}}>A</div>
                   <div className="td-av" style={{background: '#3b82f6'}}>B</div>
                   <div className="td-av" style={{background: '#10b981'}}>C</div>
                 </>
               ) : (
                 <div style={{ color: "#64748b", fontSize: "13px" }}>-</div>
               )}
            </div>
            <div className="td-remaining-alert">
              <CheckCircleIcon/> {spotsLeftDisplay} spots remaining
            </div>
            <button className="td-join-btn">
              <HeartIconSolid/> Join This Task
            </button>
          </div>

          <div className="td-card">
            <h2 className="td-loc-title"><PinIcon/> Location</h2>
            
            {lat !== undefined && lng !== undefined ? (
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05}%2C${lat - 0.05}%2C${lng + 0.05}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lng}`}
                width="100%" height="150" frameBorder="0" style={{ borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}
                title="Location Map"
              ></iframe>
            ) : (
              <div className="td-map-placeholder" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                <span style={{ position: 'absolute', zIndex: 2 }}>-</span>
              </div>
            )}
            
            <div className="td-address-block">
              <strong>{task.location?.address ? task.location.address.split(',')[0] : "-"}</strong>
              <p>{task.location?.address || "-"}</p>
            </div>
            <button className="td-directions-btn" onClick={() => lat !== undefined && lng !== undefined && window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`)}>
              <NavigationIcon/> Get Directions
            </button>
          </div>

          <div className="td-card">
            <h2>Organized By</h2>
            <div className="td-org-header">
              <div className="td-org-avatar">{orgName && orgName !== "-" ? orgName.slice(0, 2).toUpperCase() : "-"}</div>
              <div className="td-org-info">
                <strong>{orgName}</strong>
              </div>
            </div>
            <p className="td-org-desc">
              {task.sourceType === "web" ? "Sourced entirely from web pipeline." : "A community organizer."}
            </p>
            <div className="td-contact-links">
              <div>{contactPhone !== "-" ? `📞 ${contactPhone}` : "-"}</div>
              <div>{contactEmail !== "-" ? `✉️ ${contactEmail}` : "-"}</div>
              {orgUrl !== "#" ? <a href={orgUrl} target="_blank" rel="noreferrer">🌐 Source Link</a> : <div>-</div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
