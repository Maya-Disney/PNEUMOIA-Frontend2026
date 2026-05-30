import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/logo.png";

const MISSIONS = [
  {
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>,
    title: "Validation des médecins",
    desc: "Diplômes, habilitations et documents professionnels",
  },
  {
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: "Sécurité & contrôle des accès",
    desc: "Rôles, permissions et authentifications",
  },
  {
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    title: "Statistiques & rapports",
    desc: "Activité globale et performances du modèle IA",
  },
  {
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    title: "Journaux d'audit",
    desc: "Traçabilité complète de chaque action",
  },
  {
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
    title: "Configuration système",
    desc: "Paramètres, SMS/email et maintenance",
  },
];

const TAGLINES = [
  "Supervisez la plateforme et garantissez la qualité des soins pneumologiques.",
  "Validez les dossiers médecins et assurez la conformité réglementaire.",
  "Analysez les performances globales et pilotez le modèle IA.",
  "Gérez les accès, sécurisez les données et tracez chaque action.",
  "Configurez le système et maintenez l'intégrité de la plateforme.",
];

function getStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score: 1, label: "Faible", color: "#ef4444", width: "33%" };
  if (score <= 3) return { score: 2, label: "Moyen",  color: "#f59e0b", width: "66%" };
  return             { score: 3, label: "Fort",   color: "#16a34a", width: "100%" };
}

const IcoEye    = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoSpin   = () => <svg className="animate-spin" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
const IcoSun    = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const IcoMoon   = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IcoBack   = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IcoArrow  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IcoShield = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

function AnimatedTagline({ dark }) {
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
      transform: show ? "translateY(0)" : "translateY(8px)",
      color: "rgba(255,255,255,.82)",
      fontSize: 15,
      lineHeight: 1.7,
      minHeight: 52,
      textAlign: "center",
    }}>
      {TAGLINES[idx]}
    </p>
  );
}

function Field({ label, id, type, value, onChange, placeholder, icon, right, dark, hint, hintColor }) {
  const [focus, setFocus] = useState(false);
  const GREEN = "#16a34a";
  return (
    <div>
      <label htmlFor={id} style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 5, color: dark ? "rgba(255,255,255,.35)" : "#6b7280" }}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 8, padding: "0 12px", height: 40, background: dark ? "rgba(255,255,255,.06)" : "#f9fafb", border: focus ? `1.5px solid ${GREEN}` : dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", boxShadow: focus ? "0 0 0 3px rgba(22,163,74,.12)" : "none", transition: "all .15s" }}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}>
        <span style={{ color: dark ? "rgba(255,255,255,.25)" : "#9ca3af", flexShrink: 0 }}>{icon}</span>
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={id}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: dark ? "#fff" : "#111827" }}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
        {right && <span style={{ flexShrink: 0 }}>{right}</span>}
      </div>
      {hint && <p style={{ fontSize: 10.5, marginTop: 4, color: hintColor || (dark ? "rgba(255,255,255,.35)" : "#9ca3af") }}>{hint}</p>}
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
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, height: 5, borderRadius: 99, background: dark ? "rgba(255,255,255,.1)" : "#e5e7eb", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 99, width: s.width, background: s.color, transition: "width .35s, background .35s" }} />
        </div>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: s.color, minWidth: 36, textAlign: "right" }}>{s.label}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 8px" }}>
        {criteria.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: c.ok ? "#16a34a" : (dark ? "rgba(255,255,255,.2)" : "#d1d5db"), flexShrink: 0 }}>
              {c.ok
                ? <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>}
            </span>
            <span style={{ fontSize: 10, color: c.ok ? (dark ? "rgba(134,239,172,.8)" : "#15803d") : (dark ? "rgba(255,255,255,.3)" : "#9ca3af") }}>{c.label}</span>
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
  const [email, setEmail]     = useState("");
  const [pwd, setPwd]         = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
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
      await new Promise(r => setTimeout(r, 1100));
      // const res = await fetch("http://localhost:8000/admin/auth/login", {
      //   method:"POST", headers:{"Content-Type":"application/json"},
      //   body: JSON.stringify({ email: email.trim(), password: pwd }),
      // });
      // if (!res.ok) throw new Error((await res.json()).detail || "Identifiants incorrects.");
      // localStorage.setItem("admin_token", (await res.json()).access_token);
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
    await new Promise(r => setTimeout(r, 1100));
    setRLoading(false);
    setView("sent");
  }, [rEmail, rPwd, rConfirm]);

  const GREEN      = dark ? "#22c55e" : "#16a34a";
  const GREEN_DARK = dark ? "#16a34a" : "#15803d";
  const pageBg     = dark ? "#0d1117" : "#ffffff";
  const barBg      = dark ? "#0d1117" : "#ffffff";
  const barBord    = dark ? "rgba(255,255,255,.09)" : "#e5e7eb";
  const cardBg     = dark ? "#161b22" : "#ffffff";
  const cardBord   = dark ? "rgba(255,255,255,.1)" : "#e5e7eb";
  const t1         = dark ? "#e6edf3" : "#111827";
  const t2         = dark ? "#8b949e" : "#6b7280";
  const t3         = dark ? "#484f58" : "#9ca3af";

  const iconMail = <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  const iconLock = <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

  const EyeBtn = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle} style={{ color: t3, lineHeight: 1, background: "none", border: "none", cursor: "pointer", display: "flex" }}>
      {show ? <IcoEyeOff /> : <IcoEye />}
    </button>
  );

  const ErrorBox = ({ msg }) => msg ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 8, padding: "9px 12px", marginBottom: 12, background: dark ? "rgba(239,68,68,.1)" : "#fef2f2", border: "1px solid rgba(239,68,68,.22)" }}>
      <svg width="13" height="13" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p style={{ fontSize: 11.5, color: dark ? "#fca5a5" : "#dc2626" }}>{msg}</p>
    </div>
  ) : null;

  const BtnPrimary = ({ label, loadingLabel, isLoading, disabled, type = "submit" }) => (
    <button type={type} disabled={isLoading || disabled}
      style={{ width: "100%", height: 42, borderRadius: 8, border: "none", background: (isLoading || disabled) ? GREEN_DARK : GREEN, opacity: disabled ? .55 : 1, color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: (isLoading || disabled) ? "not-allowed" : "pointer", transition: "background .15s" }}
      onMouseEnter={e => { if (!isLoading && !disabled) e.currentTarget.style.background = GREEN_DARK; }}
      onMouseLeave={e => { if (!isLoading && !disabled) e.currentTarget.style.background = GREEN; }}>
      {isLoading ? <><IcoSpin /><span>{loadingLabel}</span></> : <><span>{label}</span>{!disabled && <IcoArrow />}</>}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: pageBg, transition: "background .25s" }}>

      {/* TOP BAR */}
      <header style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: barBg, borderBottom: `1px solid ${barBord}`, flexShrink: 0, transition: "background .25s" }}>
        <img src={logo} alt="PneumoIA" style={{ height: 70, width: "auto", objectFit: "contain", filter: dark ? "brightness(1.15)" : "none" }} />
        <div style={{ display: "flex", gap: 2, borderRadius: 99, padding: 3, background: dark ? "rgba(255,255,255,.06)" : "#f3f4f6", border: `1px solid ${barBord}` }}>
          {[["light","Clair",<IcoSun/>],["dark","Sombre",<IcoMoon/>]].map(([mode,label,ico]) => (
            <button key={mode} onClick={() => setDark(mode === "dark")}
              style={{ display: "flex", alignItems: "center", gap: 5, borderRadius: 99, padding: "5px 12px", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", transition: "all .15s",
                background: ((!dark && mode==="light")||(dark && mode==="dark")) ? (dark ? GREEN_DARK : "#fff") : "transparent",
                color:      ((!dark && mode==="light")||(dark && mode==="dark")) ? (dark ? "#fff" : "#111827") : t2,
                boxShadow:  ((!dark && mode==="light")||(dark && mode==="dark")) ? "0 1px 3px rgba(0,0,0,.1)" : "none",
              }}>{ico}{label}</button>
          ))}
        </div>
      </header>

      {/* MAIN */}
      <main style={{ flex: 1, display: "grid", gridTemplateColumns: "43% 57%" }}>

        {/* GAUCHE */}
        <aside style={{ position: "relative", display: "flex", flexDirection: "column", padding: "32px 28px", overflow: "hidden",
          background: "linear-gradient(160deg, #052e16 0%, #14532d 35%, #166534 65%, #15803d 100%)",
          borderRight: dark ? "1px solid rgba(255,255,255,.06)" : "none" }}>

          <div style={{ position: "absolute", inset: 0, opacity: .04, backgroundImage: "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,222,128,.12), transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(22,163,74,.1), transparent 70%)" }} />

          {/* Badge */}
          <div style={{ position: "relative", marginBottom: 20, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 99, background: "rgba(74,222,128,.12)", border: "1px solid rgba(74,222,128,.25)" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80" }} />
              <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".15em", color: "#4ade80" }}>Espace Administrateur</span>
            </div>
          </div>

          {/* Tagline */}
          <div style={{ position: "relative", marginBottom: 20, textAlign: "center" }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em", color: "rgba(255,255,255,.4)", marginBottom: 10 }}>Mission du moment</p>
            <AnimatedTagline dark={dark} />
          </div>

          {/* Missions */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10, flex: 1, justifyContent: "center" }}>
            {MISSIONS.map((m, i) => (
              <div key={i}
                style={{ display: "flex", alignItems: "center", gap: 14, borderRadius: 12, padding: "14px 16px", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.11)", cursor: "default", transition: "all .18s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.13)"; e.currentTarget.style.border = "1px solid rgba(74,222,128,.3)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.07)"; e.currentTarget.style.border = "1px solid rgba(255,255,255,.11)"; e.currentTarget.style.transform = "translateX(0)"; }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(74,222,128,.15)", border: "1px solid rgba(74,222,128,.2)" }}>
                  <span style={{ color: "#4ade80" }}>{m.icon}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 4 }}>{m.title}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,.45)", lineHeight: 1.4 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ position: "relative", marginTop: 20, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.1)" }}>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,.25)" }}>© {new Date().getFullYear()} PneumoIA · Plateforme médicale intelligente · Cameroun</p>
          </div>
        </aside>

        {/* DROITE */}
        <section style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: dark ? "#0d1117" : "#f8fafc" }}>
          <div style={{ width: "100%", maxWidth: 380, borderRadius: 16, background: cardBg, border: `1px solid ${cardBord}`, boxShadow: dark ? "0 4px 32px rgba(0,0,0,.4)" : "0 4px 24px rgba(0,0,0,.07)", padding: "28px 28px 24px", transition: "background .25s" }}>

            {/* LOGIN */}
            {view === "login" && (
              <>
                <div style={{ marginBottom: 22 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.4px", color: t1 }}>Connexion</h2>
                  <p style={{ fontSize: 12, color: t2, marginTop: 4 }}>Accès réservé aux administrateurs autorisés</p>
                </div>
                <ErrorBox msg={error} />
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 13 }} noValidate>
                  <Field label="Adresse email" id="email" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="admin@pneumoia.cm" dark={dark} icon={iconMail} />
                  <Field label="Mot de passe" id="current-password" type={showPwd ? "text" : "password"} value={pwd} onChange={e => { setPwd(e.target.value); setError(""); }} placeholder="••••••••" dark={dark} icon={iconLock}
                    right={<EyeBtn show={showPwd} onToggle={() => setShowPwd(v => !v)} />} />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="button" onClick={() => setView("reset")} style={{ fontSize: 11, fontWeight: 600, color: GREEN, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <BtnPrimary label="Se connecter" loadingLabel="Vérification…" isLoading={loading} />
                </form>
                <div style={{ marginTop: 16, display: "flex", gap: 8, borderRadius: 10, padding: "10px 14px", background: dark ? "rgba(22,163,74,.08)" : "#f0fdf4", border: `1px solid ${dark ? "rgba(22,163,74,.18)" : "#bbf7d0"}` }}>
                  <span style={{ color: GREEN, flexShrink: 0, marginTop: 1 }}><IcoShield /></span>
                  <p style={{ fontSize: 11, color: dark ? "rgba(134,239,172,.75)" : "#166534", lineHeight: 1.6 }}>
                    <strong>Accès sécurisé.</strong> Réservé aux administrateurs habilités. Toute connexion est enregistrée dans les journaux d'audit.
                  </p>
                </div>
              </>
            )}

            {/* RESET */}
            {view === "reset" && (
              <>
                <button onClick={() => { setView("login"); setRError(""); }}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: t2, background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: 0 }}>
                  <IcoBack /> Retour à la connexion
                </button>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.4px", color: t1 }}>Nouveau mot de passe</h2>
                  <p style={{ fontSize: 12, color: t2, marginTop: 4 }}>Renseignez votre email et définissez un nouveau mot de passe.</p>
                </div>
                <ErrorBox msg={rError} />
                <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 12 }} noValidate>
                  <Field label="Adresse email" id="reset-email" type="email" value={rEmail} onChange={e => { setREmail(e.target.value); setRError(""); }} placeholder="admin@pneumoia.cm" dark={dark} icon={iconMail} />
                  <div>
                    <Field label="Nouveau mot de passe" id="new-password" type={showRPwd ? "text" : "password"} value={rPwd} onChange={e => { setRPwd(e.target.value); setRError(""); }} placeholder="Créez un mot de passe fort" dark={dark} icon={iconLock}
                      right={<EyeBtn show={showRPwd} onToggle={() => setShowRPwd(v => !v)} />} />
                    <StrengthMeter pwd={rPwd} dark={dark} />
                  </div>
                  <Field label="Confirmer le mot de passe" id="confirm-password" type={showRConf ? "text" : "password"} value={rConfirm} onChange={e => { setRConfirm(e.target.value); setRError(""); }} placeholder="Répétez le mot de passe" dark={dark} icon={iconLock}
                    right={<EyeBtn show={showRConf} onToggle={() => setShowRConf(v => !v)} />}
                    hint={rConfirm && (rPwd === rConfirm ? "✓ Les mots de passe correspondent" : "✗ Ne correspondent pas")}
                    hintColor={rConfirm ? (rPwd === rConfirm ? "#16a34a" : "#ef4444") : undefined} />
                  <BtnPrimary label="Réinitialiser" loadingLabel="Enregistrement…" isLoading={rLoading}
                    disabled={!rEmail || !rPwd || !rConfirm || rPwd !== rConfirm || getStrength(rPwd).score < 2} />
                </form>
              </>
            )}

            {/* SENT */}
            {view === "sent" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16, padding: "20px 0" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(22,163,74,.12)", border: "2px solid rgba(22,163,74,.3)" }}>
                  <svg width="28" height="28" fill="none" stroke={GREEN} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: t1 }}>Mot de passe mis à jour !</h2>
                  <p style={{ fontSize: 12, color: t2, marginTop: 8, lineHeight: 1.6 }}>Modifié avec succès. Vous pouvez maintenant vous connecter.</p>
                </div>
                <button onClick={() => { setView("login"); setREmail(""); setRPwd(""); setRConfirm(""); }}
                  style={{ fontSize: 13, fontWeight: 700, color: GREEN, background: "none", border: "none", cursor: "pointer" }}>
                  ← Aller à la connexion
                </button>
              </div>
            )}

            <p style={{ textAlign: "center", fontSize: 10, color: t3, marginTop: 20 }}>
              © {new Date().getFullYear()} PneumoIA · Tous droits réservés
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}