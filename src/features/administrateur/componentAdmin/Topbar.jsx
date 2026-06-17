import { useState, useEffect, useRef } from "react";
import {
  Search, Bell, Sun, Moon, Menu, Trash2, X,
  UserPlus, MessageSquare, HelpCircle, ChevronRight,
  Phone, Mail,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { brand, getSurface, getText } from "../theme";
import { useAdminTheme } from "../context/useAdminTheme";
import { getDemandes, getQuestions, getAvis, getAdminNotifications } from "../api/adminApi";
import { mapMedecin } from "../api/demandesData";

// ── Helpers ───────────────────────────────────────────────────────────────────
function notifElapsed(d) {
  const dm = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (dm < 1)    return "À l'instant";
  if (dm < 60)   return `${dm} min`;
  if (dm < 1440) return `${Math.floor(dm / 60)}h`;
  return `${Math.floor(dm / 1440)}j`;
}

function notifInitials(name) {
  const parts = String(name).replace(/^Dr\.?\s*/i, "").trim().split(" ");
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "??";
}

function notifAvatarColor(str) {
  const colors = ["#1D9E75", "#185FA5", "#7C3AED", "#DC2626", "#D97706", "#0891B2"];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

// ── Notification sound (Web Audio API — no file needed) ──────────────────────
function playNotifSound() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const t    = ctx.currentTime;
    // Ascending 3-note chime : D5 → F#5 → A5 (arpège majeur)
    [[587.33, 0], [739.99, 0.13], [880, 0.26]].forEach(([freq, delay]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t + delay);
      gain.gain.linearRampToValueAtTime(0.22, t + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.5);
      osc.start(t + delay);
      osc.stop(t + delay + 0.55);
    });
  } catch { /* audio non supporté ou bloqué */ }
}

// ── Sub-components (no hooks — safe to define at module level) ────────────────
function NotifSectionHeader({ label, count, Icon, color, txt }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 5px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon size={12} style={{ color }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: txt.subtle, textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      {count > 0 && (
        <span style={{ fontSize: 11, fontWeight: 800, padding: "1px 7px", borderRadius: 20, background: color + "25", color }}>
          {count}
        </span>
      )}
    </div>
  );
}

function NotifItem({ initials, bg, title, sub1, sub2, onClick, dark, txt, photoUrl }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "7px 16px", width: "100%", textAlign: "left",
        background: "transparent", border: "none", cursor: "pointer",
        transition: "background 0.12s",
      }}
    >
      {photoUrl && !imgErr ? (
        <img src={photoUrl} alt={title} onError={() => setImgErr(true)}
          style={{ width:30, height:30, borderRadius:"50%", objectFit:"cover", flexShrink:0, marginTop:1, border:"1px solid #e5e7eb" }} />
      ) : (
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: bg || brand.DEFAULT,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1,
        }}>
          {initials}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: txt.primary, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {title}
        </p>
        {sub1 != null && (
          <p style={{ fontSize: 12, color: txt.secondary, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {sub1}
          </p>
        )}
        {sub2 && (
          <p style={{ fontSize: 11, color: txt.subtle, margin: "1px 0 0" }}>
            {sub2}
          </p>
        )}
      </div>
    </button>
  );
}

function NotifSeeAll({ label, onClick, txt }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.color = brand.DEFAULT; }}
      onMouseLeave={e => { e.currentTarget.style.color = txt.subtle; }}
      style={{
        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3,
        width: "100%", padding: "3px 16px 10px",
        fontSize: 12, fontWeight: 600, color: txt.subtle,
        background: "transparent", border: "none", cursor: "pointer",
        transition: "color 0.12s",
      }}
    >
      {label} <ChevronRight size={12} />
    </button>
  );
}

// ── Main Topbar ───────────────────────────────────────────────────────────────
export default function Topbar({ dark, setDark, corbeilleCount = 0 }) {
  const { searchQuery, setSearchQuery } = useAdminTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifOpen,       setNotifOpen]       = useState(false);
  const [panelPos,        setPanelPos]        = useState({ top: 0, right: 0 });
  const [inscriptions,    setInscriptions]    = useState([]);
  const [faqNotifs,       setFaqNotifs]       = useState([]);
  const [commentNotifs,   setCommentNotifs]   = useState([]);
  const [patientNotifs,   setPatientNotifs]   = useState([]);
  const notifRef    = useRef(null);
  const bellRef     = useRef(null);
  const prevCount   = useRef(null); // null = premier chargement
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef    = useRef(null);
  const avatarRef     = useRef(null);

  const adminInfo = (() => {
    try { return JSON.parse(localStorage.getItem("pneumo_admin") || "{}"); }
    catch { return {}; }
  })();

  useEffect(() => { setSearchQuery(""); }, [location.pathname]);

  // Polling toutes les 30 s — joue le son si nouvelles notifications
  useEffect(() => {
    async function fetchAndAlert() {
      let newInscriptions = [];
      let newFaq          = [];

      try {
        const data = await getDemandes();
        const mapped = Array.isArray(data) ? data.map(mapMedecin) : [];
        newInscriptions = mapped.filter(d => d.status === "en_attente");
      } catch {
        newInscriptions = [];
      }

      try {
        const data = await getQuestions("en_attente");
        if (Array.isArray(data)) {
          newFaq = data.map(q => ({
            id:       q.id,
            medecin:  q.medecin || `${q.prenom || ""} ${q.nom || ""}`.trim() || "Médecin",
            question: q.question,
            date:     q.created_at ? new Date(q.created_at) : (q.date ? new Date(q.date) : new Date()),
          }));
        } else {
          newFaq = [];
        }
      } catch {
        newFaq = [];
      }

      let newComments = [];
      try {
        const data = await getAvis();
        if (Array.isArray(data)) {
          newComments = data
            .filter(a => !a.vu)
            .map(a => ({
              id:   a.id,
              nom:  `${a.civilite || "Dr."} ${a.prenom || ""} ${a.nom || ""}`.trim(),
              note: a.note || 0,
              date: a.created_at
                ? new Date(a.created_at.endsWith("Z") ? a.created_at : a.created_at + "Z")
                : new Date(),
            }));
        }
      } catch {
        newComments = [];
      }

      let newPatientNotifs = [];
      try {
        const data = await getAdminNotifications(true);
        if (data?.notifications) {
          newPatientNotifs = data.notifications.filter(n =>
            n.type === "patient_supprime" || n.type === "demande_recuperation_patient"
          );
        }
      } catch {
        newPatientNotifs = [];
      }

      const newTotal = newInscriptions.length + newFaq.length + newComments.length + newPatientNotifs.length;

      // Premier chargement avec notifs → son immédiat
      // Polling suivant avec plus de notifs → son d'alerte
      if (prevCount.current === null ? newTotal > 0 : newTotal > prevCount.current) {
        playNotifSound();
      }
      prevCount.current = newTotal;

      setInscriptions(newInscriptions);
      setFaqNotifs(newFaq);
      setCommentNotifs(newComments);
      setPatientNotifs(newPatientNotifs);
    }

    fetchAndAlert();
    const timer = setInterval(fetchAndAlert, 30000);
    return () => clearInterval(timer);
  }, []);

  // Close panel on outside click or Escape
  useEffect(() => {
    if (!notifOpen) return;
    function onDown(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown",   onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown",   onKey);
    };
  }, [notifOpen]);

  const surface     = getSurface(dark);
  const txt         = getText(dark);
  const totalNotifs = inscriptions.length + commentNotifs.length + faqNotifs.length + patientNotifs.length;

  function toggleNotif() {
    if (bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setPanelPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setNotifOpen(o => !o);
  }

  // Close profile popup on outside click or Escape
  useEffect(() => {
    if (!profileOpen) return;
    function onDown(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    function onKey(e) { if (e.key === "Escape") setProfileOpen(false); }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown",   onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown",   onKey);
    };
  }, [profileOpen]);

  function goTo(path) { setNotifOpen(false); navigate(path); }

  return (
    <header
      className="h-14 flex items-center justify-between px-4 md:px-6 shrink-0 border-b"
      style={{ background: surface.card, borderColor: surface.border }}
    >
      {/* Mobile menu btn */}
      <button
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg mr-2"
        style={{ color: txt.muted }}
        onClick={() => document.getElementById("sidebar-toggle")?.click()}
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div
        className="flex items-center gap-2 h-9 px-3 rounded-xl border w-full max-w-xs transition-all"
        style={{
          background:  surface.bg,
          borderColor: searchQuery ? brand.DEFAULT : surface.border,
          boxShadow:   searchQuery ? `0 0 0 2px ${brand.DEFAULT}22` : "none",
        }}
      >
        <Search size={14} style={{ color: searchQuery ? brand.DEFAULT : txt.subtle, flexShrink: 0 }} />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher médecin, ville, CNOM…"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: txt.secondary }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} style={{ color: txt.subtle, display: "flex", alignItems: "center" }}>
            <X size={13} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 ml-3">

        {/* Dark / Light toggle */}
        <div className="flex gap-0.5 p-1 rounded-xl border" style={{ background: surface.bg, borderColor: surface.border }}>
          {[
            { mode: false, icon: <Sun  size={13} />, label: "Clair"  },
            { mode: true,  icon: <Moon size={13} />, label: "Sombre" },
          ].map(({ mode, icon, label }) => {
            const isActive = dark === mode;
            return (
              <button
                key={label}
                onClick={() => setDark(mode)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all"
                style={{
                  background: isActive ? (dark ? brand.DEFAULT : "#ffffff") : "transparent",
                  color:      isActive ? (dark ? "#ffffff" : brand.dark)    : txt.muted,
                  boxShadow:  isActive ? "0 1px 3px rgba(0,0,0,.1)"        : "none",
                }}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Corbeille */}
        <button
          onClick={() => navigate("/administrateur/corbeille")}
          title="Corbeille"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl border transition-colors"
          style={{
            borderColor: surface.border,
            color:       corbeilleCount > 0 ? "#dc2626" : txt.muted,
            background:  corbeilleCount > 0 ? (dark ? "#2a1515" : "#fef2f2") : "transparent",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background  = dark ? "#2a1515" : "#fef2f2";
            e.currentTarget.style.borderColor = "#fca5a5";
            e.currentTarget.style.color       = "#dc2626";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background  = corbeilleCount > 0 ? (dark ? "#2a1515" : "#fef2f2") : "transparent";
            e.currentTarget.style.borderColor = surface.border;
            e.currentTarget.style.color       = corbeilleCount > 0 ? "#dc2626" : txt.muted;
          }}
        >
          <Trash2 size={15} />
          {corbeilleCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[7px] font-black"
              style={{ border: `2px solid ${surface.card}` }}
            >
              {corbeilleCount > 9 ? "9+" : corbeilleCount}
            </span>
          )}
        </button>

        {/* Notifications bell + dropdown panel */}
        <div className="relative" ref={notifRef}>
          <button
            ref={bellRef}
            onClick={toggleNotif}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl border transition-colors"
            style={{
              borderColor: notifOpen ? brand.DEFAULT : surface.border,
              color:       notifOpen ? brand.DEFAULT : txt.muted,
              background:  notifOpen ? `${brand.DEFAULT}12` : "transparent",
            }}
          >
            <Bell size={16} />
            {totalNotifs > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[7px] font-black"
                style={{ border: `2px solid ${surface.card}` }}
              >
                {totalNotifs > 9 ? "9+" : totalNotifs}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              style={{
                position:     "fixed",
                top:          panelPos.top,
                right:        panelPos.right,
                width:        360,
                maxHeight:    "80vh",
                overflowY:    "auto",
                zIndex:       100,
                background:   surface.card,
                border:       `1px solid ${surface.border}`,
                borderRadius: 16,
                boxShadow:    dark
                  ? "0 8px 32px rgba(0,0,0,.5)"
                  : "0 8px 32px rgba(0,0,0,.12)",
              }}
            >
              {/* Panel header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px 10px",
                borderBottom: `1px solid ${surface.border}`,
              }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: txt.primary, margin: 0 }}>Notifications</p>
                  <p style={{ fontSize: 12, color: txt.subtle, margin: "2px 0 0" }}>
                    {totalNotifs} en attente de traitement
                  </p>
                </div>
                <button
                  onClick={() => setNotifOpen(false)}
                  onMouseEnter={e => { e.currentTarget.style.background = surface.bg; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  style={{
                    color: txt.subtle, background: "transparent", border: "none",
                    cursor: "pointer", padding: 5, borderRadius: 8, display: "flex",
                    transition: "background 0.12s",
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* ── Inscriptions ── */}
              <NotifSectionHeader
                label="Inscriptions" count={inscriptions.length}
                Icon={UserPlus} color="#1D9E75" txt={txt}
              />
              {inscriptions.length === 0
                ? <p style={{ fontSize: 12, color: txt.subtle, padding: "3px 16px 10px", margin: 0 }}>
                    Aucune inscription en attente
                  </p>
                : inscriptions.slice(0, 3).map(d => (
                    <NotifItem
                      key={d.id}
                      initials={d.initials}
                      bg={d.avatarBg}
                      photoUrl={d.photo_url}
                      title={d.name}
                      sub1={d.hopital !== "—" ? d.hopital : d.specialite}
                      sub2={`En attente · il y a ${notifElapsed(d.submittedAt)}`}
                      onClick={() => goTo("/administrateur/demandes")}
                      dark={dark} txt={txt}
                    />
                  ))
              }
              <NotifSeeAll
                label="Voir toutes les demandes"
                onClick={() => goTo("/administrateur/demandes")}
                txt={txt}
              />

              <div style={{ borderTop: `1px solid ${surface.border}` }} />

              {/* ── Commentaires ── */}
              <NotifSectionHeader
                label="Commentaires" count={commentNotifs.length}
                Icon={MessageSquare} color="#d97706" txt={txt}
              />
              {commentNotifs.length === 0
                ? <p style={{ fontSize: 12, color: txt.subtle, padding: "3px 16px 10px", margin: 0 }}>
                    Aucun nouveau commentaire
                  </p>
                : commentNotifs.slice(0, 3).map(c => (
                    <NotifItem
                      key={c.id}
                      initials={notifInitials(c.nom)}
                      bg={notifAvatarColor(c.nom)}
                      title={c.nom}
                      sub1={`Nouveau · ${"★".repeat(c.note)}${"☆".repeat(5 - c.note)}`}
                      sub2={`Il y a ${notifElapsed(c.date)}`}
                      onClick={() => goTo("/administrateur/commentaires")}
                      dark={dark} txt={txt}
                    />
                  ))
              }
              <NotifSeeAll
                label="Voir tous les commentaires"
                onClick={() => goTo("/administrateur/commentaires")}
                txt={txt}
              />

              <div style={{ borderTop: `1px solid ${surface.border}` }} />

              {/* ── Questions FAQ ── */}
              <NotifSectionHeader
                label="Questions FAQ" count={faqNotifs.length}
                Icon={HelpCircle} color="#185FA5" txt={txt}
              />
              {faqNotifs.length === 0
                ? <p style={{ fontSize: 12, color: txt.subtle, padding: "3px 16px 10px", margin: 0 }}>
                    Aucune question en attente
                  </p>
                : faqNotifs.slice(0, 3).map(q => (
                    <NotifItem
                      key={q.id}
                      initials={notifInitials(q.medecin)}
                      bg={notifAvatarColor(q.medecin)}
                      title={q.medecin}
                      sub1={q.question.length > 52 ? q.question.slice(0, 52) + "…" : q.question}
                      sub2={`Il y a ${notifElapsed(q.date)}`}
                      onClick={() => goTo("/administrateur/faq")}
                      dark={dark} txt={txt}
                    />
                  ))
              }
              <NotifSeeAll
                label="Voir toutes les questions"
                onClick={() => goTo("/administrateur/faq")}
                txt={txt}
              />

              {patientNotifs.length > 0 && (
                <>
                  <div style={{ borderTop: `1px solid ${surface.border}` }} />
                  <NotifSectionHeader
                    label="Patients supprimés" count={patientNotifs.length}
                    Icon={Trash2} color="#dc2626" txt={txt}
                  />
                  {patientNotifs.slice(0, 3).map(n => (
                    <NotifItem
                      key={n.id}
                      initials="PT"
                      bg="#dc2626"
                      title={n.titre}
                      sub1={n.message.length > 52 ? n.message.slice(0, 52) + "…" : n.message}
                      sub2={n.created_at ? `Il y a ${notifElapsed(new Date(n.created_at.endsWith("Z") ? n.created_at : n.created_at + "Z"))}` : ""}
                      onClick={() => goTo("/administrateur/patients-supprimes")}
                      dark={dark} txt={txt}
                    />
                  ))}
                  <NotifSeeAll
                    label="Voir les patients supprimés"
                    onClick={() => goTo("/administrateur/patients-supprimes")}
                    txt={txt}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* Avatar + profile popup */}
        <div className="relative" ref={profileRef}>
          <button
            ref={avatarRef}
            onClick={() => setProfileOpen(o => !o)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-black transition-opacity"
            style={{
              background: brand.DEFAULT,
              opacity: profileOpen ? 0.85 : 1,
              outline: profileOpen ? `2px solid ${brand.DEFAULT}` : "none",
              outlineOffset: 2,
            }}
            title="Profil administrateur"
          >
            AD
          </button>

          {profileOpen && (
            <div
              style={{
                position:     "absolute",
                top:          "calc(100% + 10px)",
                right:        0,
                minWidth:     230,
                zIndex:       100,
                background:   surface.card,
                border:       `1px solid ${surface.border}`,
                borderRadius: 14,
                boxShadow:    dark
                  ? "0 8px 32px rgba(0,0,0,.5)"
                  : "0 8px 32px rgba(0,0,0,.12)",
                padding:      "14px 16px 12px",
              }}
            >
              {/* Mini avatar + titre */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: brand.DEFAULT,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0,
                }}>
                  AD
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: txt.primary }}>
                    Administrateur
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: txt.subtle }}>PneumoIA</p>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${surface.border}`, marginBottom: 10 }} />

              {/* Numéro */}
              {adminInfo.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Phone size={13} style={{ color: brand.DEFAULT, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: txt.secondary }}>{adminInfo.phone}</span>
                </div>
              )}

              {/* Email */}
              {adminInfo.email && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Mail size={13} style={{ color: brand.DEFAULT, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: txt.secondary, wordBreak: "break-all" }}>
                    {adminInfo.email}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
