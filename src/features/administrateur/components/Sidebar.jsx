import React, { useEffect, useMemo, useState } from "react";
import logo from "../../../assets/images/logo.png";
import { Link } from "react-router-dom";

// TODO: remplacer par de vrais appels API quand le back est prêt
const MOCK_STATS = { nouvelles: 4, validees: 12, refusees: 3, actifs: 38, suspendus: 2 };

export default function Sidebar({ activeKey, setActiveKey, darkMode, isMobileOpen, setMobileOpen }) {
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [adminName, setAdminName] = useState("Administrateur"); // ← Valeur par défaut
  const [adminEmail, setAdminEmail] = useState("admin@pneumoia.cm");

  const stats = MOCK_STATS;
  const statsLoading = false;

  useEffect(() => {
    const syncAdminSession = () => {
      const token = localStorage.getItem("token");
      setIsAdminOnline(Boolean(token));
      setAdminName(localStorage.getItem("admin_name") || "Administrateur"); // ← Fallback cohérent
      setAdminEmail(localStorage.getItem("admin_email") || "admin@pneumoia.cm");
    };
    syncAdminSession();
    window.addEventListener("storage", syncAdminSession);
    window.addEventListener("focus", syncAdminSession);
    return () => {
      window.removeEventListener("storage", syncAdminSession);
      window.removeEventListener("focus", syncAdminSession);
    };
  }, []);

  const adminInitials = useMemo(() => {
    const parts = adminName.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "AD";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [adminName]);

  // Badge renderer — shows a spinner dot while loading, nothing if null
  const Badge = ({ value, color }) => {
    if (statsLoading) {
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "rgba(255,255,255,0.55)",
            animation: "pulse 1.4s ease-in-out infinite",
          }} />
        </span>
      );
    }
    if (value === null || value === undefined) return null;
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        minWidth: 24, height: 22, borderRadius: 11,
        padding: "0 6px",
        fontSize: 11, fontWeight: 700, color: "#fff",
        background: color,
        lineHeight: 1,
        letterSpacing: "0.01em",
        flexShrink: 0,
      }}>
        {value > 999 ? "999+" : value}
      </span>
    );
  };

  const navSections = [
    {
      title: "",
      items: [
        {
          label: "Tableau de bord",
          icon: "grid",
          badge: null,
          key: "dashboard",
          path: "/administrateur/dashboard",
        },
      ],
    },
    {
      title: "INSCRIPTIONS",
      items: [
        {
          label: "Nouvelles demandes",
          icon: "user-plus",
          badgeValue: stats.nouvelles,
          badgeColor: "#f97316",
          key: "nouvelles",
          path: "/administrateur/inscriptions/nouvelles",
        },
        {
          label: "Validées ce mois",
          icon: "circle-check",
          badgeValue: stats.validees,
          badgeColor: "#0d9488",
          key: "validees",
          path: "/administrateur/inscriptions/validees",
        },
        {
          label: "Refusées",
          icon: "circle-x",
          badgeValue: stats.refusees,
          badgeColor: "#ef4444",
          key: "refusees",
          path: "/administrateur/inscriptions/refusees",
        },
      ],
    },
    {
      title: "MÉDECINS",
      items: [
        {
          label: "Médecins actifs",
          icon: "users",
          badgeValue: stats.actifs,
          badgeColor: "#0d9488",
          key: "actifs",
          path: "/administrateur/medecins/actifs",
        },
        {
          label: "Suspendus",
          icon: "player-pause",
          badgeValue: stats.suspendus,
          badgeColor: "#eab308",
          key: "suspendus",
          path: "/administrateur/medecins/suspendus",
        },
      ],
    },
    {
      title: "SYSTÈME",
      items: [
        {
          label: "Journal d'audit",
          icon: "file-description",
          badgeValue: null,
          key: "audit",
          path: "/administrateur/journal-audit",
        },
        {
          label: "Paramètres plateforme",
          icon: "settings",
          badgeValue: null,
          key: "parametres",
          path: "/administrateur/parametres",
        },
      ],
    },
  ];

  const iconMap = {
    grid:             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    "user-plus":      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
    "circle-check":   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    "circle-x":       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    users:            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    "player-pause":   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
    "file-description":<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    settings:         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  };

  const bg = darkMode ? "#111827" : "#0f766e";
  const borderColor = darkMode ? "rgba(255,255,255,0.08)" : "#0a6560";
  const sectionLabelColor = darkMode ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.6)";
  const itemColor = darkMode ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.9)";
  const activeItemBg = darkMode ? "#0d9488" : "#0d9488";

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .sidebar-item {
          transition: background 0.15s ease, color 0.15s ease;
        }
        .sidebar-item:hover {
          background: rgba(255,255,255,0.12) !important;
        }
      `}</style>

      {isMobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 20 }}
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden h-screen
          transition-transform duration-300 ease-in-out
          lg:sticky lg:top-0 lg:translate-x-0 lg:z-10 lg:h-screen lg:flex-shrink-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          width: 272,
          maxWidth: "92vw",
          background: bg,
          borderRight: `1px solid ${borderColor}`,
        }}
      >

        {/* ── Logo ── */}
        <div style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 16px 16px",
          borderBottom: `1px solid ${borderColor}`,
        }}>
          <img
            src={logo}
            alt="PneumoIA"
            style={{
              width: 130,
              height: "auto",
              objectFit: "contain",
              filter: darkMode 
                ? "none" 
                : "brightness(0) invert(1) drop-shadow(0px 2px 3px rgba(0,0,0,0.3))",
              transition: "filter 0.3s ease",
            }}
          />
        </div>

        {/* ── Navigation ── */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px 12px", gap: 4, overflowY: "auto" }}>
          {navSections.map((section) => (
            <div key={section.title || "__top"} style={{ marginBottom: section.title ? 6 : 2 }}>
              {section.title && (
                <p style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: sectionLabelColor,
                  padding: "6px 12px 4px",
                  margin: 0,
                }}>
                  {section.title}
                </p>
              )}
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                {section.items.map((item) => {
                  const isActive = activeKey === item.key;
                  return (
                    <li key={item.key}>
                      <Link
                        to={item.path}
                        onClick={() => { setActiveKey(item.key); setMobileOpen(false); }}
                        className="sidebar-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          borderRadius: 12,
                          textDecoration: "none",
                          background: isActive ? activeItemBg : "transparent",
                          color: isActive ? "#ffffff" : itemColor,
                          fontWeight: isActive ? 600 : 400,
                          fontSize: 14,
                        }}
                      >
                        <span style={{
                          width: 20, height: 20,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                          opacity: isActive ? 1 : 0.85,
                        }}>
                          {iconMap[item.icon]}
                        </span>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.label}
                        </span>
                        {("badgeValue" in item) && (
                          <Badge value={item.badgeValue} color={item.badgeColor} />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Admin footer ── */}
        <div style={{
          flexShrink: 0,
          padding: "12px 16px",
          borderTop: `1px solid ${borderColor}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
              letterSpacing: "0.05em",
            }}>
              {adminInitials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {adminName}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {adminEmail}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: isAdminOnline ? "#99f6e4" : "rgba(255,255,255,0.45)" }}>
                {isAdminOnline ? "Actif" : "Hors ligne"}
              </p>
            </div>
            <div style={{
              width: 8, height: 8,
              borderRadius: "50%",
              flexShrink: 0,
              background: isAdminOnline ? "#5eead4" : "rgba(255,255,255,0.3)",
              boxShadow: isAdminOnline ? "0 0 0 2px rgba(94,234,212,0.3)" : "none",
            }} />
          </div>
        </div>
      </aside>
    </>
  );
}
