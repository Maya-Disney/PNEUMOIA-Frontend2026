import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/logo.png";

// ── Couleur brand teal très adoucies (light) ────────────────────────────────
const T1 = "#1f7a75";   // teal moyen-light
const T2 = "#339991";   // teal principal light
const T3 = "#5ab3ac";   // teal clair très light

// ── Blanc cassé doux pour réduire la fatigue oculaire ───────────────────────
const OFF_WHITE = "#faf9f6"; // Blanc papier naturel (alternative: "#f9f7f2" pour plus de chaleur)

const MISSIONS = [
  { icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>, title: "Validation des médecins", desc: "Diplômes, habilitations et documents" },
  { icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: "Sécurité & contrôle des accès", desc: "Rôles, permissions et authentifications" },
  { icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, title: "Statistiques & rapports", desc: "Activité globale et performances IA" },
  { icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, title: "Journaux d'audit", desc: "Traçabilité complète de chaque action" },
  { icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>, title: "Configuration système", desc: "Paramètres, SMS/email et maintenance" },
];

const TAGLINES = [
  "Supervisez la plateforme et garantissez la qualité des soins.",
  "Validez les dossiers médecins et assurez la conformité.",
  "Analysez les performances globales et pilotez le modèle IA.",
  "Gérez les accès, sécurisez les données et tracez chaque action.",
  "Configurez le système et maintenez l'intégrité de la plateforme.",
];

function getStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score: 1, label: "Faible", color: "#ef4444", width: "33%" };
  if (score <= 3) return { score: 2, label: "Moyen",  color: "#f59e0b", width: "66%" };
  return             { score: 3, label: "Fort",   color: T2,        width: "100%" };
}

const IcoEye    = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoSpin   = () => <svg className="animate-spin" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
const IcoSun    = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const IcoMoon   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IcoBack   = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IcoArrow  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IcoShield = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

function AnimatedTagline() {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => { setIdx(i => (i + 1) % TAGLINES.length); setShow(true); }, 400);
    }, 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <p style={{ 
      transition: "opacity .4s, transform .4s", 
      opacity: show ? 1 : 0, 
      transform: show ? "translateY(0)" : "translateY(6px)", 
      color: "#fff", 
      fontSize: 22, 
      fontWeight: 600,
      lineHeight: 1.4, 
      minHeight: 60, 
      textAlign: "center",
      padding: "0 20px"
    }}>
      {TAGLINES[idx]}
    </p>
  );
}

function Field({ label, id, type, value, onChange, placeholder, icon, right, dark, hint, hintColor }) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      <label htmlFor={id} style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6, color: dark ? "rgba(255,255,255,.6)" : "#374151" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 10, padding: "0 14px", height: 44,
          background: dark ? "rgba(255,255,255,.08)" : "#f9fafb",
          border: focus ? `1.5px solid ${T2}` : dark ? "1px solid rgba(255,255,255,.15)" : "1px solid #e5e7eb",
          boxShadow: focus ? `0 0 0 3px rgba(51,153,145,.1)` : "none", transition: "all .15s" }}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}>
        <span style={{ color: dark ? "rgba(255,255,255,.4)" : "#9ca3af", flexShrink: 0 }}>{icon}</span>
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={id}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: dark ? "#fff" : "#111827" }}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
        {right && <span style={{ flexShrink: 0 }}>{right}</span>}
      </div>
      {hint && <p style={{ fontSize: 11, marginTop: 5, color: hintColor || (dark ? "rgba(255,255,255,.5)" : "#6b7280") }}>{hint}</p>}
    </div>
  );
}

function StrengthMeter({ pwd, dark }) {
  if (!pwd) return null;
  const s = getStrength(pwd);
  const criteria = [
    { ok: pwd.length >= 8, label: "8 caractères minimum" },
    { ok: /[A-Z]/.test(pwd), label: "Une majuscule" },
    { ok: /[0-9]/.test(pwd), label: "Un chiffre" },
    { ok: /[^A-Za-z0-9]/.test(pwd), label: "Un caractère spécial" },
  ];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 99, background: dark ? "rgba(255,255,255,.15)" : "#e5e7eb", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 99, width: s.width, background: s.color, transition: "width .35s" }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: s.color, minWidth: 40, textAlign: "right" }}>{s.label}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px" }}>
        {criteria.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: c.ok ? T2 : (dark ? "rgba(255,255,255,.3)" : "#d1d5db"), flexShrink: 0 }}>
              {c.ok ? <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                     : <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>}
            </span>
            <span style={{ fontSize: 10.5, color: c.ok ? (dark ? T3 : T1) : (dark ? "rgba(255,255,255,.4)" : "#9ca3af") }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem("pneumo_theme") === "dark");
  const [view, setView] = useState("login");
  const [email, setEmail]         = useState("");
  const [pwd, setPwd]             = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [rEmail, setREmail]       = useState("");
  const [rPwd, setRPwd]           = useState("");
  const [rConfirm, setRConfirm]   = useState("");
  const [showRPwd, setShowRPwd]   = useState(false);
  const [showRConf, setShowRConf] = useState(false);
  const [rLoading, setRLoading]   = useState(false);
  const [rError, setRError]       = useState("");

  useEffect(() => {
    localStorage.setItem("pneumo_theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Veuillez entrer votre adresse email.");
    if (!pwd)          return setError("Veuillez entrer votre mot de passe.");
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      navigate("/administrateur/dashboard");
    } catch (err) {
      setError(err.message || "Erreur de connexion.");
    } finally { setLoading(false); }
  }, [email, pwd, navigate]);

  const handleReset = useCallback(async (e) => {
    e.preventDefault();
    setRError("");
    if (!rEmail.trim())    return setRError("Veuillez entrer votre email.");
    if (!rPwd)             return setRError("Veuillez entrer un nouveau mot de passe.");
    if (rPwd !== rConfirm) return setRError("Les mots de passe ne correspondent pas.");
    if (getStrength(rPwd).score < 2) return setRError("Mot de passe trop faible.");
    setRLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setRLoading(false);
    setView("sent");
  }, [rEmail, rPwd, rConfirm]);

  // ── Thème ──────────────────────────────────────────────────────────────────
  const tx1      = dark ? "#e6edf3" : "#111827";
  const tx2      = dark ? "#8b949e" : "#6b7280";
  const tx3      = dark ? "#484f58" : "#9ca3af";
  const cardBg   = dark ? "#161b22" : "#ffffff";
  const cardBord = dark ? "rgba(255,255,255,.15)" : "#e5e7eb";

  // Topbar - Blanc cassé doux
  const topbarBg   = dark ? "#0d1117" : OFF_WHITE;
  const topbarBord = dark ? "rgba(255,255,255,.1)" : "#e2e8e4";

  // Panneau gauche
  const asideBg = `linear-gradient(160deg, ${T1} 0%, ${T2} 55%, ${T3} 100%)`;

  // Panneau droit - Blanc cassé doux
  const rightBg = dark ? "#0d1117" : OFF_WHITE;

  const iconMail = <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  const iconLock = <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

  const EyeBtn = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle} style={{ color: tx3, lineHeight: 1, background: "none", border: "none", cursor: "pointer", display: "flex" }}>
      {show ? <IcoEyeOff /> : <IcoEye />}
    </button>
  );

  const ErrorBox = ({ msg }) => msg ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10, padding: "10px 14px", marginBottom: 14, background: dark ? "rgba(239,68,68,.15)" : "#fef2f2", border: "1px solid rgba(239,68,68,.25)" }}>
      <svg width="14" height="14" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p style={{ fontSize: 12, color: dark ? "#fca5a5" : "#dc2626" }}>{msg}</p>
    </div>
  ) : null;

  const BtnPrimary = ({ label, loadingLabel, isLoading, disabled, type = "submit" }) => (
    <button type={type} disabled={isLoading || disabled}
      style={{ width: "100%", height: 46, borderRadius: 10, border: "none", background: disabled || isLoading ? T1 : T2, opacity: disabled ? .55 : 1, color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: disabled || isLoading ? "not-allowed" : "pointer", transition: "background .15s" }}
      onMouseEnter={e => { if (!isLoading && !disabled) e.currentTarget.style.background = T1; }}
      onMouseLeave={e => { if (!isLoading && !disabled) e.currentTarget.style.background = T2; }}>
      {isLoading ? <><IcoSpin /><span>{loadingLabel}</span></> : <><span>{label}</span>{!disabled && <IcoArrow />}</>}
    </button>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── TOPBAR ── */}
      <header style={{ 
        height: 88, 
        display: "flex", 
        alignItems: "center", 
        padding: "0 48px", 
        background: topbarBg, 
        borderBottom: `1px solid ${topbarBord}`, 
        flexShrink: 0, 
        transition: "background .25s" 
      }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: 1400, margin: "0 auto" }}>
          {/* Logo - plus grand */}
          <img src={logo} alt="PneumoIA"
            style={{ 
              height: 82, 
              width: "auto", 
              objectFit: "contain", 
              maxWidth: 280, 
              filter: dark ? "brightness(1.15)" : "none", 
              transition: "filter .25s" 
            }} 
          />

          {/* Toggle clair/sombre */}
          <div style={{ 
            display: "flex", 
            gap: 3, 
            borderRadius: 99, 
            padding: 5, 
            background: dark ? "rgba(255,255,255,.1)" : "#edf0ee", 
            border: `1px solid ${topbarBord}` 
          }}>
            {[["light","Clair",<IcoSun/>],["dark","Sombre",<IcoMoon/>]].map(([mode,label,ico]) => {
              const isActive = (!dark && mode === "light") || (dark && mode === "dark");
              return (
                <button key={mode} onClick={() => setDark(mode === "dark")}
                  style={{ 
                    display: "flex", alignItems: "center", gap: 7, 
                    borderRadius: 99, padding: "7px 16px", 
                    fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", 
                    transition: "all .15s",
                    background: isActive ? (dark ? T2 : "#ffffff") : "transparent",
                    color: isActive ? (dark ? "#ffffff" : T1) : (dark ? "rgba(255,255,255,.5)" : "#6b7280"),
                    boxShadow: isActive ? "0 2px 4px rgba(0,0,0,.1)" : "none",
                  }}>{ico}{label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, display: "grid", gridTemplateColumns: "43% 57%", overflow: "hidden" }}>

        {/* ══ GAUCHE ── ═ */}
        <aside style={{ 
          position: "relative", 
          display: "flex", 
          flexDirection: "column", 
          padding: "28px 28px",
          overflow: "hidden", 
          background: asideBg 
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: .03, backgroundImage: "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }} />
          <div style={{ position: "absolute", top: -70, right: -70, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.1), transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: -50, left: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.08), transparent 70%)" }} />

          {/* Badge */}
          <div style={{ position: "relative", marginBottom: 20, textAlign: "center" }}>
                 <p style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>
                      Espace Administrateur
                     </p>
            </div>

          {/* Tagline */}
          <div style={{ position: "relative", marginBottom: 20, textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".15em", color: "rgba(255,255,255,.6)", marginBottom: 10 }}>Mission du moment</p>
            <AnimatedTagline />
          </div>

          {/* Missions - PLUS PETITES */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12, flex: 1, justifyContent: "center" }}>
            {MISSIONS.map((m, i) => (
              <div key={i}
                style={{ 
                  display: "flex", alignItems: "center", gap: 14, 
                  borderRadius: 12, 
                  padding: "14px 16px", 
                  background: "rgba(255,255,255,.1)", 
                  border: "1px solid rgba(255,255,255,.15)", 
                  cursor: "default", 
                  transition: "all .2s" 
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = "rgba(255,255,255,.2)"; 
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,.3)"; 
                  e.currentTarget.style.transform = "translateX(5px)"; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.background = "rgba(255,255,255,.1)"; 
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,.15)"; 
                  e.currentTarget.style.transform = "translateX(0)"; 
                }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(255,255,255,.15)" }}>
                  <span style={{ color: "#fff", transform: "scale(1.4)", display: "block" }}>{m.icon}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 3 }}>{m.title}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.7)", lineHeight: 1.3, fontWeight: 400 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>

    
        </aside>

        {/* ══ DROITE ── ══ */}
        <section style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "30px", background: rightBg, overflow: "hidden", transition: "background .25s" }}>
          <div style={{ width: "100%", maxWidth: 420, borderRadius: 18, background: cardBg, border: `1px solid ${cardBord}`, boxShadow: dark ? "0 8px 40px rgba(0,0,0,.4)" : "0 8px 32px rgba(31,122,117,.12)", padding: "36px", transition: "all .25s" }}>

            {/* LOGIN */}
            {view === "login" && (
              <>
                <div style={{ marginBottom: 26, display: "flex", flexDirection: "column", alignItems: "center" }}>
                             <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.5px", color: tx1, marginBottom: 6 }}>Connexion</h2>
                        <p style={{ fontSize: 13.5, color: tx2 }}>Accès réservé aux administrateurs autorisés</p>
                  </div>

                <ErrorBox msg={error} />
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
                  <Field label="Adresse email" id="email" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="admin@pneumoia.cm" dark={dark} icon={iconMail} />
                  <Field label="Mot de passe" id="current-password" type={showPwd ? "text" : "password"} value={pwd} onChange={e => { setPwd(e.target.value); setError(""); }} placeholder="••••••••" dark={dark} icon={iconLock}
                    right={<EyeBtn show={showPwd} onToggle={() => setShowPwd(v => !v)} />} />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -4 }}>
                    <button type="button" onClick={() => setView("reset")} style={{ fontSize: 12.5, fontWeight: 600, color: T2, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <BtnPrimary label="Se connecter" loadingLabel="Vérification…" isLoading={loading} />
                </form>
                <div style={{ marginTop: 20, display: "flex", gap: 10, borderRadius: 12, padding: "12px 14px", background: dark ? `rgba(51,153,145,.15)` : `rgba(51,153,145,.08)`, border: `1px solid ${dark ? "rgba(51,153,145,.3)" : "rgba(51,153,145,.25)"}` }}>
                  <span style={{ color: T2, flexShrink: 0, marginTop: 2 }}><IcoShield /></span>
                  <p style={{ fontSize: 11.5, color: dark ? `rgba(160,240,230,.9)` : T1, lineHeight: 1.5 }}>
                    <strong>Accès sécurisé.</strong> Réservé aux administrateurs habilités. Toute connexion est enregistrée dans les journaux d'audit.
                  </p>
                </div>
              </>
            )}

            {/* RESET */}
            {view === "reset" && (
              <>
                <button onClick={() => { setView("login"); setRError(""); }}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: tx2, background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: 0 }}>
                  <IcoBack /> Retour à la connexion
                </button>
                <div style={{ marginBottom: 22 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.5px", color: tx1, marginBottom: 6 }}>Nouveau mot de passe</h2>
                  <p style={{ fontSize: 13.5, color: tx2 }}>Renseignez votre email et définissez un nouveau mot de passe.</p>
                </div>
                <ErrorBox msg={rError} />
                <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 14 }} noValidate>
                  <Field label="Adresse email" id="reset-email" type="email" value={rEmail} onChange={e => { setREmail(e.target.value); setRError(""); }} placeholder="admin@pneumoia.cm" dark={dark} icon={iconMail} />
                  <div>
                    <Field label="Nouveau mot de passe" id="new-password" type={showRPwd ? "text" : "password"} value={rPwd} onChange={e => { setRPwd(e.target.value); setRError(""); }} placeholder="Créez un mot de passe fort" dark={dark} icon={iconLock}
                      right={<EyeBtn show={showRPwd} onToggle={() => setShowRPwd(v => !v)} />} />
                    <StrengthMeter pwd={rPwd} dark={dark} />
                  </div>
                  <Field label="Confirmer le mot de passe" id="confirm-password" type={showRConf ? "text" : "password"} value={rConfirm} onChange={e => { setRConfirm(e.target.value); setRError(""); }} placeholder="Répétez le mot de passe" dark={dark} icon={iconLock}
                    right={<EyeBtn show={showRConf} onToggle={() => setShowRConf(v => !v)} />}
                    hint={rConfirm && (rPwd === rConfirm ? "✓ Les mots de passe correspondent" : "✗ Ne correspondent pas")}
                    hintColor={rConfirm ? (rPwd === rConfirm ? T2 : "#ef4444") : undefined} />
                  <BtnPrimary label="Réinitialiser" loadingLabel="Enregistrement…" isLoading={rLoading}
                    disabled={!rEmail || !rPwd || !rConfirm || rPwd !== rConfirm || getStrength(rPwd).score < 2} />
                </form>
              </>
            )}

            {/* SENT */}
            {view === "sent" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18, padding: "20px 0" }}>
                <div style={{ width: 68, height: 68, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `rgba(51,153,145,.15)`, border: `2px solid rgba(51,153,145,.35)` }}>
                  <svg width="30" height="30" fill="none" stroke={T2} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: tx1, marginBottom: 8 }}>Mot de passe mis à jour !</h2>
                  <p style={{ fontSize: 13.5, color: tx2, lineHeight: 1.6 }}>Modifié avec succès. Vous pouvez maintenant vous connecter.</p>
                </div>
                <button onClick={() => { setView("login"); setREmail(""); setRPwd(""); setRConfirm(""); }}
                  style={{ fontSize: 14, fontWeight: 700, color: T2, background: "none", border: "none", cursor: "pointer" }}>
                  ← Aller à la connexion
                </button>
              </div>
            )}

            <p style={{ textAlign: "center", fontSize: 11, color: tx3, marginTop: 22 }}>
              © {new Date().getFullYear()} PneumoIA · Tous droits réservés
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}