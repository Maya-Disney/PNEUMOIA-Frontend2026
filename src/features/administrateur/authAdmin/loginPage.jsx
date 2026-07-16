import { useState, useEffect, useCallback } from "react";
import { adminLogin, adminResetRequest, adminResetConfirm } from "../api/adminApi";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/logo.png";
import "../admin.css";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isDesktop;
}

const T1 = "#007a64";
const T2 = "#009e82";
const T3 = "#00c2a0";

const MISSIONS = [
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
const IcoShield = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoPhone  = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>;
const IcoMail   = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoLock   = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

function AnimatedTagline() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % MISSIONS.length); setVisible(true); }, 350);
    }, 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <p style={{
      transition: "opacity .35s, transform .35s",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(8px)",
      color: "rgba(255,255,255,0.88)",
      fontSize: 17,
      fontWeight: 600,
      lineHeight: 1.7,
      textAlign: "center",
      margin: 0,
      padding: "0 8px",
      minHeight: 52,
    }}>
      {MISSIONS[idx]}
    </p>
  );
}

function FormInput({ id, type, value, onChange, placeholder, icon, rightEl, dark, onFocusCb, onBlurCb }) {
  const [focus, setFocus] = useState(false);
  const handleFocus = () => { setFocus(true); onFocusCb?.(); };
  const handleBlur  = () => { setFocus(false); onBlurCb?.(); };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      borderRadius: 10, padding: "0 14px", height: 48,
      background: dark ? "rgba(255,255,255,.06)" : "#f8fafc",
      border: focus ? `1.5px solid ${T2}` : dark ? "1px solid rgba(255,255,255,.18)" : "1px solid #e2e8f0",
      boxShadow: focus ? `0 0 0 3px rgba(0,158,130,.12)` : "none",
      transition: "all .18s",
    }} onFocus={handleFocus} onBlur={handleBlur}>
      <span style={{ color: focus ? T2 : (dark ? "rgba(255,255,255,.35)" : "#94a3b8"), flexShrink: 0 }}>{icon}</span>
      <input
        id={id} type={type} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={id}
        className="admin-login-input"
        style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: dark ? "#f1f5f9" : "#1e293b" }}
        onFocus={handleFocus} onBlur={handleBlur}
      />
      {rightEl && <span style={{ flexShrink: 0 }}>{rightEl}</span>}
    </div>
  );
}

function StrengthMeter({ pwd, dark }) {
  if (!pwd) return null;
  const s = getStrength(pwd);
  const criteria = [
    { ok: pwd.length >= 8,          label: "8 caractères minimum" },
    { ok: /[A-Z]/.test(pwd),        label: "Une majuscule" },
    { ok: /[0-9]/.test(pwd),        label: "Un chiffre" },
    { ok: /[^A-Za-z0-9]/.test(pwd), label: "Un caractère spécial" },
  ];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 99, background: dark ? "rgba(255,255,255,.15)" : "#e2e8f0", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 99, width: s.width, background: s.color, transition: "width .35s" }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: s.color, minWidth: 40, textAlign: "right" }}>{s.label}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px" }}>
        {criteria.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: c.ok ? T2 : (dark ? "rgba(255,255,255,.25)" : "#cbd5e1"), flexShrink: 0 }}>
              {c.ok
                ? <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>}
            </span>
            <span style={{ fontSize: 10.5, color: c.ok ? (dark ? T3 : T1) : (dark ? "rgba(255,255,255,.38)" : "#94a3b8") }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminLogin() {
  const navigate  = useNavigate();
  const isDesktop = useIsDesktop();
  const [dark, setDark] = useState(() => localStorage.getItem("pneumo_login_theme") === "dark");
  const [view, setView] = useState("login");

  const [email,   setEmail]   = useState(() => localStorage.getItem("pneumo_admin_remember_email") || "");
  const [phone,   setPhone]   = useState(() => localStorage.getItem("pneumo_admin_remember_phone") || "");
  const [pwd,     setPwd]     = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(() => localStorage.getItem("pneumo_admin_remember") === "true");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const [rEmail,    setREmail]    = useState("");
  const [rPhone,    setRPhone]    = useState("");
  const [rOtp,      setROtp]      = useState("");
  const [rPwd,      setRPwd]      = useState("");
  const [rConfirm,  setRConfirm]  = useState("");
  const [showRPwd,  setShowRPwd]  = useState(false);
  const [showRConf, setShowRConf] = useState(false);
  const [rLoading,  setRLoading]  = useState(false);
  const [rError,    setRError]    = useState("");

  useEffect(() => { localStorage.setItem("pneumo_login_theme", dark ? "dark" : "light"); }, [dark]);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Entrez votre adresse email.");
    if (!phone.trim()) return setError("Entrez votre numéro de téléphone.");
    if (!pwd)          return setError("Entrez votre mot de passe.");
    setLoading(true);
    try {
      await adminLogin({ email, phone, password: pwd });
      if (remember) {
        localStorage.setItem("pneumo_admin_remember", "true");
        localStorage.setItem("pneumo_admin_remember_email", email);
        localStorage.setItem("pneumo_admin_remember_phone", phone);
      } else {
        localStorage.removeItem("pneumo_admin_remember");
        localStorage.removeItem("pneumo_admin_remember_email");
        localStorage.removeItem("pneumo_admin_remember_phone");
      }
      navigate("/administrateur/dashboard");
    } catch (err) {
      setError(err.message || "Erreur de connexion.");
    } finally { setLoading(false); }
  }, [email, phone, pwd, navigate]);

  const handleReset = useCallback(async (e) => {
    e.preventDefault();
    setRError("");
    if (!rEmail.trim()) return setRError("Veuillez entrer votre adresse email.");
    if (!rPhone.trim()) return setRError("Veuillez entrer votre numéro de téléphone.");
    setRLoading(true);
    try {
      await adminResetRequest({ email: rEmail, phone: rPhone });
      setView("otp");
    } catch (err) {
      setRError(err.message || "Identifiants invalides ou erreur serveur.");
    } finally { setRLoading(false); }
  }, [rEmail, rPhone]);

  const handleOtp = useCallback(async (e) => {
    e.preventDefault();
    setRError("");
    if (!rOtp || rOtp.length !== 6) return setRError("Entrez le code à 6 chiffres reçu par SMS.");
    if (!rPwd)             return setRError("Entrez un nouveau mot de passe.");
    if (rPwd !== rConfirm) return setRError("Les mots de passe ne correspondent pas.");
    if (getStrength(rPwd).score < 2) return setRError("Mot de passe trop faible.");
    setRLoading(true);
    try {
      await adminResetConfirm({ email: rEmail, otp: rOtp, new_password: rPwd, confirm_password: rConfirm });
      setView("sent");
    } catch (err) {
      setRError(err.message || "Code invalide ou expiré. Recommencez.");
    } finally { setRLoading(false); }
  }, [rEmail, rOtp, rPwd, rConfirm]);

  const tx1    = dark ? "#f1f5f9" : "#0f172a";
  const tx2    = dark ? "#94a3b8" : "#64748b";
  const tx3    = dark ? "#475569" : "#94a3b8";
  const rightBg = dark ? "#0f172a" : "#ffffff";

  const ThemeToggle = ({ prefix }) => (
    <div style={{ display:"inline-flex", gap:3, borderRadius:99, padding:4,
      background: dark ? "rgba(255,255,255,.08)" : "#f1f5f9",
      border:`1px solid ${dark ? "rgba(255,255,255,.1)" : "#e2e8f0"}` }}>
      {[["light","Clair",<IcoSun/>],["dark","Sombre",<IcoMoon/>]].map(([mode,lbl,ico]) => {
        const active = (!dark && mode==="light") || (dark && mode==="dark");
        return (
          <button key={`${prefix}-${mode}`} onClick={() => setDark(mode==="dark")}
            style={{ display:"flex", alignItems:"center", gap:6, borderRadius:99, padding:"6px 14px",
              fontSize:12, fontWeight:700, border:"none", cursor:"pointer", transition:"all .15s",
              background: active ? (dark ? T2 : "#fff") : "transparent",
              color: active ? (dark ? "#fff" : T1) : (dark ? "rgba(255,255,255,.45)" : "#64748b"),
              boxShadow: active ? "0 1px 4px rgba(0,0,0,.12)" : "none" }}>
            {ico}{lbl}
          </button>
        );
      })}
    </div>
  );

  const ErrorBox = ({ msg }) => msg ? (
    <div style={{ display:"flex", alignItems:"center", gap:8, borderRadius:10, padding:"10px 14px", marginBottom:14,
      background: dark ? "rgba(239,68,68,.12)" : "#fef2f2", border:"1px solid rgba(239,68,68,.22)" }}>
      <svg width="14" height="14" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p style={{ fontSize:12.5, color: dark ? "#fca5a5" : "#dc2626" }}>{msg}</p>
    </div>
  ) : null;

  const BtnPrimary = ({ label, loadingLabel, isLoading, disabled, type="submit", onClick }) => (
    <button type={type} disabled={isLoading || disabled} onClick={onClick}
      style={{ width:"100%", height:48, borderRadius:12, border:"none",
        background: disabled || isLoading ? "#94a3b8" : `linear-gradient(135deg, ${T1} 0%, ${T2} 100%)`,
        color:"#fff", fontSize:15, fontWeight:700, cursor: disabled||isLoading?"not-allowed":"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        boxShadow: disabled||isLoading ? "none" : "0 4px 15px rgba(0,158,130,.35)",
        transition:"all .2s", letterSpacing:".3px" }}
      onMouseEnter={e => { if (!isLoading && !disabled) e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,158,130,.5)"; }}
      onMouseLeave={e => { if (!isLoading && !disabled) e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,158,130,.35)"; }}>
      {isLoading ? <><IcoSpin /><span>{loadingLabel}</span></> : label}
    </button>
  );

  const BtnOutlined = ({ label, onClick }) => (
    <button type="button" onClick={onClick}
      style={{ width:"100%", height:48, borderRadius:12, background:"transparent",
        border: `1.5px solid ${dark ? "rgba(0,158,130,.45)" : "#cbd5e1"}`,
        color: dark ? T3 : T1, fontSize:14, fontWeight:600, cursor:"pointer",
        transition:"all .18s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T2; e.currentTarget.style.color = T2; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? "rgba(0,158,130,.45)" : "#cbd5e1"; e.currentTarget.style.color = dark ? T3 : T1; }}>
      {label}
    </button>
  );

  const ShowHideBtn = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle}
      style={{ fontSize:12, fontWeight:700, color:T2, background:"none", border:"none", cursor:"pointer", letterSpacing:".5px" }}>
      {show ? "CACHER" : "AFFICHER"}
    </button>
  );

  const Divider = () => (
    <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0" }}>
      <div style={{ flex:1, height:1, background: dark ? "rgba(255,255,255,.1)" : "#e2e8f0" }} />
      <span style={{ fontSize:12, color:tx3, fontWeight:500 }}>Ou</span>
      <div style={{ flex:1, height:1, background: dark ? "rgba(255,255,255,.1)" : "#e2e8f0" }} />
    </div>
  );

  return (
    <div className={dark ? "dark" : ""} style={{ height:"100vh", display:"flex", overflow:"hidden", fontFamily:"'Inter',sans-serif" }}>

      {/* ── PANNEAU GAUCHE — desktop uniquement ── */}
      {isDesktop && <aside style={{
        width:"42%", flexShrink:0,
        background:"linear-gradient(145deg, #004a3a 0%, #007a64 45%, #009e82 100%)",
        position:"relative", overflow:"hidden",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
      }}>

        {/* Sphère haut-gauche */}
        <div style={{
          position:"absolute", top:-60, left:-60, width:190, height:190, borderRadius:"50%",
          background:"radial-gradient(circle at 32% 32%, #6ef7df 0%, #00c2a0 35%, #004a3a 100%)",
          boxShadow:"10px 10px 30px rgba(0,0,0,.3)",
        }} />

        {/* Grande sphère bas-droite */}
        <div style={{
          position:"absolute", bottom:-100, right:-90, width:280, height:280, borderRadius:"50%",
          background:"radial-gradient(circle at 28% 28%, #5df5d8 0%, #009e82 40%, #003d30 100%)",
          boxShadow:"0 0 50px rgba(0,0,0,.35)",
        }} />

        {/* Sphère milieu-gauche flottante */}
        <div style={{
          position:"absolute", bottom:"22%", left:-35, width:110, height:110, borderRadius:"50%",
          background:"radial-gradient(circle at 32% 32%, #a7f3e4 0%, #00c2a0 45%, #006652 100%)",
          boxShadow:"6px 6px 20px rgba(0,0,0,.25)",
        }} />

        {/* Contenu */}
        <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:"0 44px", display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
          <div onClick={() => navigate("/")} title="Retour à l'accueil"
            style={{ width:130, height:130, borderRadius:"50%", background:"#ffffff", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8, boxShadow:"0 6px 24px rgba(0,0,0,.25)", cursor:"pointer" }}>
            <img src={logo} alt="PneumoIA" style={{ height:108, width:108, objectFit:"contain" }} />
          </div>
          <h1 style={{ fontSize:46, fontWeight:900, color:"#ffffff", letterSpacing:3, textTransform:"uppercase", margin:0, lineHeight:1 }}>
            BIENVENUE
          </h1>
          <p style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.75)", letterSpacing:2, textTransform:"uppercase", margin:0 }}>
            ESPACE ADMINISTRATEUR
          </p>
          <div style={{ width:48, height:2, borderRadius:99, background:"rgba(255,255,255,.35)", margin:"4px 0" }} />
          <AnimatedTagline />
        </div>
      </aside>}

      {/* ── PANNEAU DROIT ── */}
      <section style={{
        flex:1, background:rightBg,
        display:"flex", flexDirection:"column",
        overflow:"auto", transition:"background .25s", position:"relative",
      }}>

        {/* Bandeau mobile — visible uniquement si pas desktop */}
        {!isDesktop && <div>
          <div style={{
            position:"relative", overflow:"hidden", flexShrink:0,
            background:"linear-gradient(145deg, #004a3a 0%, #007a64 45%, #009e82 100%)",
            padding:"28px 24px 32px", display:"flex", flexDirection:"column", alignItems:"center", gap:10,
          }}>
            <div style={{ position:"absolute", top:-40, left:-40, width:120, height:120, borderRadius:"50%", background:"radial-gradient(circle at 32% 32%, #6ef7df, #004a3a)", opacity:.8 }} />
            <div style={{ position:"absolute", bottom:-50, right:-50, width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle at 28% 28%, #5df5d8, #003d30)", opacity:.8 }} />
            <div style={{ position:"absolute", bottom:"20%", left:-20, width:70, height:70, borderRadius:"50%", background:"radial-gradient(circle at 32% 32%, #a7f3e4, #006652)", opacity:.7 }} />
            <div onClick={() => navigate("/")} title="Retour à l'accueil"
              style={{ position:"relative", zIndex:1, width:80, height:80, borderRadius:"50%", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(0,0,0,.2)", cursor:"pointer" }}>
              <img src={logo} alt="PneumoIA" style={{ height:64, width:64, objectFit:"contain" }} />
            </div>
            <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
              <h1 style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:2, textTransform:"uppercase", margin:0 }}>BIENVENUE</h1>
              <p style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.72)", letterSpacing:2, textTransform:"uppercase", margin:"4px 0 0" }}>ESPACE ADMINISTRATEUR</p>
            </div>
          </div>
          {/* Toggle thème mobile */}
          <div style={{ display:"flex", justifyContent:"center", padding:"14px 24px 0" }}>
            <ThemeToggle dark={dark} setDark={setDark} prefix="m" />
          </div>
        </div>}

        {/* Toggle thème desktop */}
        {isDesktop && <div style={{ textAlign:"right", padding:"20px 32px 0" }}>
          <ThemeToggle dark={dark} setDark={setDark} prefix="d" />
        </div>}

        {/* Formulaire centré */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 20px" }}>
          <div style={{ width:"100%", maxWidth:420, padding:"0 4px" }}>

            {/* ── VUE LOGIN ── */}
            {view === "login" && (
              <>
                <div style={{ marginBottom:28, textAlign:"center" }}>
                  <h2 style={{ fontSize:32, fontWeight:800, color:tx1, marginBottom:6, letterSpacing:"-.5px" }}>
                    Se connecter
                  </h2>
                  <p style={{ fontSize:13.5, color:tx2, lineHeight:1.5 }}>
                    Accès réservé aux administrateurs autorisés de PneumoIA.
                  </p>
                </div>

                <ErrorBox msg={error} />

                <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:14 }} noValidate>
                  <FormInput
                    id="email" type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    placeholder="Adresse email" icon={<IcoMail />} dark={dark}
                  />
                  <FormInput
                    id="phone" type="tel" value={phone}
                    onChange={e => { setPhone(e.target.value); setError(""); }}
                    placeholder="Numéro de téléphone" icon={<IcoPhone />} dark={dark}
                  />
                  <FormInput
                    id="current-password" type={showPwd ? "text" : "password"} value={pwd}
                    onChange={e => { setPwd(e.target.value); setError(""); }}
                    placeholder="Mot de passe" icon={<IcoLock />} dark={dark}
                    rightEl={<ShowHideBtn show={showPwd} onToggle={() => setShowPwd(v => !v)} />}
                  />

                  {/* Remember me + Forgot */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:-4 }}>
                    <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", userSelect:"none" }}>
                      <div onClick={() => setRemember(v => !v)} style={{
                        width:18, height:18, borderRadius:5, flexShrink:0,
                        border: remember ? "none" : `1.5px solid ${dark ? "rgba(255,255,255,.3)" : "#cbd5e1"}`,
                        background: remember ? `linear-gradient(135deg, ${T1}, ${T2})` : "transparent",
                        display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
                        transition:"all .15s",
                      }}>
                        {remember && <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span style={{ fontSize:13, color:tx2 }}>Se souvenir de moi</span>
                    </label>
                    <button type="button" onClick={() => { setView("reset"); setError(""); }}
                      style={{ fontSize:13, fontWeight:600, color:T2, background:"none", border:"none", cursor:"pointer", padding:0 }}>
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <BtnPrimary label="Se connecter" loadingLabel="Vérification…" isLoading={loading} />

                  {/* Sécurité */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, borderRadius:10, padding:"10px 14px",
                    background: dark ? "rgba(0,158,130,.1)" : "rgba(0,158,130,.06)",
                    border:`1px solid ${dark ? "rgba(0,158,130,.25)" : "rgba(0,158,130,.18)"}` }}>
                    <span style={{ color:T2, flexShrink:0 }}><IcoShield /></span>
                    <p style={{ fontSize:11.5, color: dark ? "rgba(160,240,230,.85)" : T1, lineHeight:1.5 }}>
                      <strong>Accès sécurisé.</strong> Toute connexion est enregistrée dans les journaux d'audit.
                    </p>
                  </div>
                </form>
              </>
            )}

            {/* ── VUE RESET ── */}
            {view === "reset" && (
              <>
                <button onClick={() => { setView("login"); setRError(""); }}
                  style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, color:tx2, background:"none", border:"none", cursor:"pointer", marginBottom:20, padding:0 }}>
                  <IcoBack /> Retour à la connexion
                </button>
                <div style={{ marginBottom:24, textAlign:"center" }}>
                  <h2 style={{ fontSize:28, fontWeight:800, color:tx1, marginBottom:6, letterSpacing:"-.4px" }}>Réinitialiser</h2>
                  <p style={{ fontSize:13, color:tx2, lineHeight:1.6 }}>Entrez votre email et votre téléphone. Vous recevrez un code OTP par SMS.</p>
                </div>
                <ErrorBox msg={rError} />
                <form onSubmit={handleReset} style={{ display:"flex", flexDirection:"column", gap:14 }} noValidate>
                  <FormInput id="reset-email" type="email" value={rEmail}
                    onChange={e => { setREmail(e.target.value); setRError(""); }}
                    placeholder="Adresse email" icon={<IcoMail />} dark={dark} />
                  <FormInput id="reset-phone" type="tel" value={rPhone}
                    onChange={e => { setRPhone(e.target.value); setRError(""); }}
                    placeholder="Numéro de téléphone" icon={<IcoPhone />} dark={dark} />
                  <BtnPrimary label="Envoyer le code OTP" loadingLabel="Envoi en cours…" isLoading={rLoading} disabled={!rEmail || !rPhone} />
                  <BtnOutlined label="Annuler" onClick={() => setView("login")} />
                </form>
              </>
            )}

            {/* ── VUE OTP ── */}
            {view === "otp" && (
              <>
                <button onClick={() => { setView("reset"); setRError(""); setROtp(""); }}
                  style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, color:tx2, background:"none", border:"none", cursor:"pointer", marginBottom:20, padding:0 }}>
                  <IcoBack /> Retour
                </button>
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, borderRadius:12, padding:"12px 14px", marginBottom:20,
                  background: dark?"rgba(0,158,130,.12)":"rgba(0,158,130,.07)", border:`1px solid ${dark?"rgba(0,158,130,.28)":"rgba(0,158,130,.2)"}` }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>📱</span>
                  <div>
                    <p style={{ fontSize:12.5, fontWeight:700, color: dark?T3:T1, marginBottom:2 }}>Code OTP envoyé par SMS</p>
                    <p style={{ fontSize:11.5, color: dark?"rgba(160,240,230,.8)":T2, lineHeight:1.5 }}>
                      Code à 6 chiffres envoyé au <strong>{rPhone}</strong>. Valide <strong>10 minutes</strong>.
                    </p>
                  </div>
                </div>
                <div style={{ marginBottom:18 }}>
                  <h2 style={{ fontSize:22, fontWeight:800, color:tx1, marginBottom:4 }}>Nouveau mot de passe</h2>
                  <p style={{ fontSize:12.5, color:tx2 }}>Saisissez le code reçu et choisissez un nouveau mot de passe.</p>
                </div>
                <ErrorBox msg={rError} />
                <form onSubmit={handleOtp} style={{ display:"flex", flexDirection:"column", gap:12 }} noValidate>
                  <div>
                    <input type="text" inputMode="numeric" maxLength={6} value={rOtp}
                      onChange={e => { setROtp(e.target.value.replace(/\D/g,"")); setRError(""); }}
                      placeholder="• • • • • •"
                      style={{ width:"100%", height:54, borderRadius:12, boxSizing:"border-box",
                        border: rOtp.length===6 ? `2px solid ${T2}` : dark?"1px solid rgba(255,255,255,.15)":"1px solid #e2e8f0",
                        background: dark?"rgba(255,255,255,.06)":"#f8fafc",
                        color: dark?"#fff":"#0f172a", fontSize:26, fontWeight:700,
                        textAlign:"center", letterSpacing:14, outline:"none", transition:"border .15s" }} />
                    {rOtp.length > 0 && rOtp.length < 6 && (
                      <p style={{ fontSize:11, color:"#f59e0b", marginTop:4 }}>{6-rOtp.length} chiffre{6-rOtp.length>1?"s":""} restant{6-rOtp.length>1?"s":""}</p>
                    )}
                  </div>
                  <div>
                    <FormInput id="new-password" type={showRPwd?"text":"password"} value={rPwd}
                      onChange={e => { setRPwd(e.target.value); setRError(""); }}
                      placeholder="Nouveau mot de passe" icon={<IcoLock />} dark={dark}
                      rightEl={<ShowHideBtn show={showRPwd} onToggle={() => setShowRPwd(v => !v)} />} />
                    <StrengthMeter pwd={rPwd} dark={dark} />
                  </div>
                  <FormInput id="confirm-password" type={showRConf?"text":"password"} value={rConfirm}
                    onChange={e => { setRConfirm(e.target.value); setRError(""); }}
                    placeholder="Confirmer le mot de passe" icon={<IcoLock />} dark={dark}
                    rightEl={<ShowHideBtn show={showRConf} onToggle={() => setShowRConf(v => !v)} />} />
                  {rConfirm && (
                    <p style={{ fontSize:11.5, marginTop:-8, color: rPwd===rConfirm ? T2 : "#ef4444" }}>
                      {rPwd===rConfirm ? "✓ Mots de passe identiques" : "✗ Ne correspondent pas"}
                    </p>
                  )}
                  <BtnPrimary label="Confirmer et réinitialiser" loadingLabel="Vérification…" isLoading={rLoading}
                    disabled={rOtp.length!==6 || !rPwd || !rConfirm || rPwd!==rConfirm || getStrength(rPwd).score < 2} />
                  <p style={{ textAlign:"center", fontSize:12, color:tx3 }}>
                    Pas reçu ?{" "}
                    <button type="button" onClick={() => setView("reset")}
                      style={{ fontSize:12, fontWeight:700, color:T2, background:"none", border:"none", cursor:"pointer", padding:0 }}>
                      Renvoyer le code
                    </button>
                  </p>
                </form>
              </>
            )}

            {/* ── VUE SENT ── */}
            {view === "sent" && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:20, padding:"30px 0" }}>
                <div style={{ width:72, height:72, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                  background:`linear-gradient(135deg, ${T1}, ${T2})`, boxShadow:"0 8px 24px rgba(0,158,130,.4)" }}>
                  <svg width="32" height="32" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <h2 style={{ fontSize:24, fontWeight:800, color:tx1, marginBottom:10 }}>Mot de passe mis à jour !</h2>
                  <p style={{ fontSize:14, color:tx2, lineHeight:1.6 }}>Modifié avec succès. Vous pouvez maintenant vous connecter.</p>
                </div>
                <BtnPrimary label="Aller à la connexion" loadingLabel="" isLoading={false}
                  type="button"
                  onClick={() => { setView("login"); setREmail(""); setRPhone(""); setRPwd(""); setRConfirm(""); }} />
              </div>
            )}

            <p style={{ textAlign:"center", fontSize:11, color:tx3, marginTop:20 }}>
              © {new Date().getFullYear()} PneumoIA · Tous droits réservés
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
