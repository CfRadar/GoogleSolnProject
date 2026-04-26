/**
 * Tasks.tsx
 * Discover Tasks Main Interface
 */
import { useState, useEffect, useMemo } from "react";
import { fetchOpportunities } from "../api/auth";
import type { Opportunity } from "../api/auth";
import { getToken } from "../api/api";
import { navigate } from "../navigation";
import "../css/dashboard.css"; // For global sidebar
import "../css/tasks.css"; // For local grid overrides

// --- SVG Icons ---
const PinIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const ClockIcon = () => <svg className="purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const PeopleIcon = () => <svg className="green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const SirenIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4" /><path d="M12 14v4" /><path d="M12 22v-4" /><path d="M6 10c0-3.3 2.7-6 6-6s6 2.7 6 6v4H6v-4z" /></svg>;
const StarIconLine = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const SearchIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const ListIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
const MapIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>;
const TargetIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>;
const MedicalIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>;
const GeneralIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4" /><path d="M12 14v4" /><path d="M12 22v-4" /><path d="M6 10c0-3.3 2.7-6 6-6s6 2.7 6 6v4H6v-4z" /></svg>;
const FoodIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;

// Dynamic Helpers
const getCategoryColor = (cat: string) => {
  const c = (cat || "").toLowerCase();
  if (c.includes("food")) return "orange";
  if (c.includes("medical") || c.includes("health")) return "pink";
  if (c.includes("disaster") || c.includes("shelter")) return "blue";
  if (c.includes("water")) return "cyan";
  if (c.includes("education")) return "purple";
  if (c.includes("environment")) return "green";
  return "purple";
};

const getUrgencyText = (urgency: string) => {
  if (urgency === "high") return "Critical";
  if (urgency === "medium") return "Medium";
  return "Low";
};

const getUrgencyColor = (urgency: string) => {
  if (urgency === "high") return "red";
  if (urgency === "medium") return "yellow";
  return "green";
};

const formatDateRange = (ds?: string) => {
  if (!ds) return "Ongoing, flexible schedule";
  const d = new Date(ds);
  const end = new Date(d.getTime() + 3 * 60 * 60 * 1000); // mock +3 hours
  const t1 = d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
  const t2 = end.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${d.toLocaleDateString("en-US", { weekday: "short" })}, ${t1} - ${t2}`;
};

// Generates a consistent dummy distance (10 -> 10000) based on mongo string hash length
const getMockDistance = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = hash + id.charCodeAt(i);
  return ((hash % 9991) + 10).toFixed(1);
};

// Calculates true geographical Haversine distance in KMS
const getTrueDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

export default function TasksPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Filter States
  const [search, setSearch] = useState("");
  const [distanceVal, setDistanceVal] = useState(2500); // max 10000
  const [catFilter, setCatFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");

  // Geolocation States
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate("login");
      return;
    }

    Promise.all([fetchOpportunities()])
      .then(([opps]) => {
        if (opps?.items) setOpportunities(opps.items);
      })
      .finally(() => setLoading(false));
  }, []);


  function handleAutoDetect() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setIsLocating(false);

      // Reverse Geocode gracefully on success to display human-readable text
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
        .then(res => res.json())
        .then(data => {
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county;
          const state = data.address?.state;
          if (city && state) setLocationName(`${city}, ${state}`);
          else if (data.display_name) setLocationName(data.display_name.split(',')[0]);
        }).catch(() => setLocationName("Detected Location"));

    }, (err) => {
      console.warn("Location error:", err);
      // Fail silently to mock distance
      setIsLocating(false);
      alert("Please allow location access to autodetect true distances.");
    });
  }

  // Helper inside render logic for dynamic calculation fallback cleanly
  const computeDistance = (opp: Opportunity) => {
    if (userLocation && opp.location?.coordinates?.length === 2) {
      // MongoDB stores as [longitude, latitude]
      return getTrueDistance(userLocation.lat, userLocation.lng, opp.location.coordinates[1], opp.location.coordinates[0]);
    }
    return getMockDistance(opp._id);
  };

  // --- Filter Pipeline ---
  const filteredTasks = useMemo(() => {
    return opportunities.filter(opp => {
      // 1. Search Block
      const s = search.toLowerCase();
      if (s && !opp.title.toLowerCase().includes(s) && !opp.description.toLowerCase().includes(s) && !opp.location?.address?.toLowerCase().includes(s)) {
        return false;
      }

      // 2. Category Block
      if (catFilter !== "All" && opp.category.toLowerCase() !== catFilter.toLowerCase()) {
        if (catFilter === "Medical Emergency" && opp.category !== "medical") return false;
        if (catFilter === "Food Distribution" && opp.category !== "food") return false;
        if (catFilter === "Shelter Needed" && !opp.title.toLowerCase().includes('shelter')) return false;
        // Strict fallback if not mapped exactly
        if (!["Medical Emergency", "Food Distribution", "Shelter Needed"].includes(catFilter)) {
          if (opp.category.toLowerCase() !== catFilter.toLowerCase()) return false;
        }
      }

      // 3. Urgency Block
      if (urgencyFilter !== "All") {
        if (urgencyFilter === "Critical" && opp.urgency !== "high") return false;
        if (urgencyFilter === "Medium" && opp.urgency !== "medium") return false;
        if (urgencyFilter === "Low" && opp.urgency !== "low") return false;
      }

      // 4. Distance Block (Utilize intelligent logic routing Mock fallback vs Haversine real)
      const dist = parseFloat(computeDistance(opp));
      if (dist > distanceVal) return false;

      return true;
    }).sort((a, b) => {
      const distA = parseFloat(computeDistance(a));
      const distB = parseFloat(computeDistance(b));
      return distA - distB;
    });
  }, [opportunities, search, catFilter, urgencyFilter, distanceVal, userLocation]);


  return (
    <div className="dashboard-root tk-root">

      {/* ── GLOBAL SIDEBAR ──────────────────────────────────────────────── */}
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
          <a href="#dashboard" className="ds-nav-item" onClick={(e) => { e.preventDefault(); navigate("dashboard"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            <span className="ds-nav-item-text">Dashboard</span>
          </a>
          <a href="#tasks" className="ds-nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
            <span className="ds-nav-item-text">My Tasks</span>
          </a>
          <a href="#report" className="ds-nav-item" onClick={(e) => { e.preventDefault(); navigate("report"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
            <span className="ds-nav-item-text">Report Crisis</span>
          </a>
          <a href="#" className="ds-nav-item" onClick={(e) => { e.preventDefault(); setIsNotifOpen(true); }}>
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

      {/* ── DISCOVER MAIN CONTENT ─────────────────────────────────────────── */}
      <main className={`ds-main ${sidebarCollapsed ? 'collapsed' : ''}`} onClick={(e) => {
        if (!((e.target as Element).closest('.ds-nav-item')) && !((e.target as Element).closest('.ds-notification-popup'))) {
          setIsNotifOpen(false);
        }
      }}>

        {/* Absolute Popup Menu explicitly inherited strictly via ds- notification class styling bound globally */}
        <div className={`ds-notification-popup ${isNotifOpen ? 'open' : ''}`} style={{
          position: 'fixed', top: '24px', left: sidebarCollapsed ? '86px' : '260px', right: 'auto', zIndex: 1000
        }}>
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

        <div className="tk-container">

          {/* Top Header Row */}
          <div className="tk-topbar">
            <div className="tk-header-left">
              <div className="tk-logo-icon heart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              </div>
              <div className="tk-title-block">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <h1 style={{ margin: 0 }}>Discover Tasks</h1>
                  <button
                    onClick={handleAutoDetect}
                    disabled={isLocating}
                    style={{
                      padding: '8px 18px', background: userLocation ? '#f0fdf4' : '#ffffff',
                      color: userLocation ? '#16a34a' : '#64748b', border: `1px solid ${userLocation ? '#bbf7d0' : '#e2e8f0'}`,
                      borderRadius: '99px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.2px',
                      cursor: isLocating ? 'wait' : 'pointer', display: 'flex',
                      alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)', height: 'fit-content', transform: 'translateY(2px)'
                    }}>
                    <TargetIcon />
                    {isLocating ? 'Locating...' : userLocation ? 'Using GPS' : 'Auto-Detect'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                  <p style={{ margin: 0 }}>{filteredTasks.length} opportunities available</p>
                  {locationName && (
                    <p style={{ margin: 0, color: '#10b981', fontWeight: 600, fontSize: '13px' }}>• Near {locationName}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="tk-view-toggles">
              <button className={`tk-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                <ListIcon /> List
              </button>
              <button className={`tk-toggle-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>
                <MapIcon /> Map
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="tk-search-wrapper">
            <SearchIcon />
            <input
              type="text"
              className="tk-search-input"
              placeholder="Search by task name, NGO, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Main Layout Grid */}
          <div className="tk-layout">

            {/* ─ Filters Panel ─ */}
            <aside className="tk-filters">

              <div className="tk-filter-group">
                <h3>Filters</h3>
                <h4>Distance</h4>
                <div className="tk-range-labels" style={{ alignItems: 'center' }}>
                  <span>Within radius:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      min="0" max="10000"
                      value={distanceVal}
                      onChange={(e) => setDistanceVal(Number(e.target.value))}
                      style={{ width: '64px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#0f172a', outline: 'none' }}
                      onBlur={() => setDistanceVal(Math.min(10000, Math.max(0, distanceVal)))}
                    />
                    <span className="active-val">km</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0" max="10000" step="50"
                  className="tk-range-slider"
                  value={distanceVal}
                  onChange={(e) => setDistanceVal(Number(e.target.value))}
                />
                <div className="tk-range-limits">
                  <span>0 km</span>
                  <span>10,000 km</span>
                </div>
              </div>

              <div className="tk-filter-group">
                <h4>Category</h4>
                <div className="tk-radio-list">
                  {["All Categories", "Food Distribution", "Medical Emergency", "Education", "Shelter Needed", "Water Supply", "Healthcare", "Environment"].map(cat => {
                    const val = cat === "All Categories" ? "All" : cat;
                    return (
                      <label key={cat} className="tk-radio-label">
                        <input type="radio" className="tk-radio-input" name="catFilter" checked={catFilter === val} onChange={() => setCatFilter(val)} />
                        <span className="tk-radio-text">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="tk-filter-group">
                <h4>Urgency Level</h4>
                <div className="tk-radio-list">
                  {["All Levels", "Critical", "High", "Medium", "Low"].map(urg => {
                    const val = urg === "All Levels" ? "All" : urg;
                    let colorClass = "";
                    if (urg === "Critical") colorClass = "red";
                    if (urg === "High") colorClass = "orange";
                    if (urg === "Medium") colorClass = "orange"; // using orange for both high/med gradient
                    if (urg === "Low") colorClass = "green";
                    return (
                      <label key={urg} className="tk-radio-label">
                        <input type="radio" className="tk-radio-input" name="urgFilter" checked={urgencyFilter === val} onChange={() => setUrgencyFilter(val)} />
                        <span className={`tk-radio-text ${colorClass}`}>{urg}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

            </aside>

            {/* ─ Results Panel ─ */}
            <div className="tk-results">

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#64748b' }}>
                  <svg className="ds-section-anim" style={{ animation: 'urgentBlink 1s infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                </div>
              ) : viewMode === "map" ? (
                /* Leaflet OpenStreetMap Placeholder Iframe Integration - Coordinates bounded dynamically to state */
                <div className="tk-map-container ds-section-anim">
                  <iframe
                    src={userLocation
                      ? `https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.2}%2C${userLocation.lat - 0.2}%2C${userLocation.lng + 0.2}%2C${userLocation.lat + 0.2}&layer=mapnik&marker=${userLocation.lat}%2C${userLocation.lng}`
                      : `https://www.openstreetmap.org/export/embed.html?bbox=-123.0%2C37.0%2C-121.0%2C38.5&layer=mapnik&marker=37.7749%2C-122.4194`}
                    title="Opportunities Map"
                  ></iframe>
                </div>
              ) : (
                /* List View Render logic matching Design Pixel requirements */
                filteredTasks.length > 0 ? filteredTasks.map((task) => {
                  const spots = task.requirements?.peopleNeeded || 5;
                  const joined = task.requirements?.participants?.length || 0;
                  const remaining = Math.max(1, spots - joined);

                  return (
                    <div key={task._id} className="tk-card ds-section-anim">
                      <div className="tk-card-top">
                        <div className="tk-card-header">
                          <div className="tk-card-icon">
                            {task.category.includes('medical') ? <MedicalIcon /> : task.category.includes('food') ? <FoodIcon /> : <GeneralIcon />}
                          </div>
                          <div className="tk-card-title">
                            <h3>{task.title}</h3>
                            <p>{task.sourceDetails?.name || "Independent Organizer"}</p>
                          </div>
                        </div>
                        <span className={`tk-status-pill ${getUrgencyColor(task.urgency)}`}>
                          • {getUrgencyText(task.urgency)}
                        </span>
                      </div>

                      <p className="tk-card-desc">{task.description}</p>

                      <div className="tk-card-details">
                        <div className="tk-detail-item">
                          <PinIcon />
                          {task.location?.address || "Location unavailable"} <span style={{ opacity: 0.5 }}> | {computeDistance(task)} km away</span>
                        </div>
                        <div className="tk-detail-item">
                          <ClockIcon /> {formatDateRange(task.schedule?.startTime)}
                        </div>
                        <div className="tk-detail-item">
                          <PeopleIcon /> {spots} people need help
                        </div>
                        <span className={`tk-card-category ${getCategoryColor(task.category)}`}>
                          {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                        </span>
                      </div>

                      <div className="tk-card-bottom">
                        <div className="tk-volunteers">
                          {/* Conditionally render Contact Mock Avatars if contact is provided by backend rule */}
                          {task.contact?.email ? (
                            <>
                              <div className="tk-avatars">
                                <div className="tk-avatar" style={{ background: '#8b5cf6' }}>A</div>
                                <div className="tk-avatar" style={{ background: '#3b82f6' }}>B</div>
                                <div className="tk-avatar" style={{ background: '#10b981' }}>C</div>
                              </div>
                              <span className="tk-volunteers-text">{joined} volunteers joined</span>
                            </>
                          ) : (
                            <span className="tk-volunteers-text">Be the first to join!</span>
                          )}
                          <span className="tk-spots-pill">{remaining} spots left</span>
                        </div>
                        <button className="tk-join-btn" onClick={() => {
                          sessionStorage.setItem("selectedTask", JSON.stringify(task));
                          navigate("task-detail");
                        }}>
                          Join Task
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="tk-empty-state ds-section-anim">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#334155', fontSize: '16px' }}>No matches found</p>
                    <p style={{ margin: 0, fontSize: '14px' }}>Try expanding your distance slider or resetting category flags to see more opportunities.</p>
                  </div>
                )
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
