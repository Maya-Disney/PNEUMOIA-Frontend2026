import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../../assets/images/logo.png';

const PHRASES = [
  "Bienvenue sur votre plateforme de gestion médicale intelligente",
  "Gérez les comptes médecins et le personnel soignant",
  "Supervisez l'activité globale de la plateforme",
  "Contrôlez les accès et la sécurité des données",
  "Pilotez les statistiques et les rapports d'activité",
];

function SlidingTagline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % PHRASES.length);
        setVisible(true);
      }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      style={{
        transition: "opacity 0.5s ease, transform 0.5s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
      }}
      className="text-white/90 text-base font-medium leading-relaxed text-center min-h-[56px]"
    >
      {PHRASES[index]}
    </p>
  );
}

function EyeOpen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function FeatureBadge({ icon, label }) {
  return (
    <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-3">
      <span className="text-teal-200 flex-shrink-0">{icon}</span>
      <span className="text-white/85 text-sm">{label}</span>
    </div>
  );
}

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await new Promise((res) => setTimeout(res, 900));
      localStorage.setItem("token", "demo-admin-token");
      localStorage.setItem("token_type", "bearer");
      localStorage.setItem("admin_name", "Super Admin");
      localStorage.setItem("admin_email", form.email || "admin@pneumoia.cm");
      navigate('/administrateur/dashboard');
    } catch (err) {
      setError(err.message || "Erreur de connexion. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">

      {/* Panneau gauche */}
      <div className="relative lg:w-[42%] xl:w-[38%] bg-gradient-to-br from-teal-500 via-teal-600 to-teal-800 flex flex-col items-center justify-center px-8 py-14 lg:py-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/3 right-6 w-28 h-28 rounded-full bg-teal-400/15 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-xs gap-6">
          <div className="w-50 h-50 rounded-full bg-white shadow-xl flex items-center justify-center">
            <img src={logo} alt="PneumoIA" className="w-40 h-40 object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Pneumo<span className="text-teal-200">IA</span>
            </h1>
            <p className="text-white/40 text-xs tracking-widest uppercase mt-1">Espace Administrateur</p>
          </div>

          <div className="min-h-[64px] flex items-center justify-center px-2">
            <SlidingTagline />
          </div>

          <div className="hidden sm:flex flex-col gap-2.5 w-full">
            <FeatureBadge
              label="Gestion des utilisateurs et accès"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              }
            />
            <FeatureBadge
              label="Supervision et rapports d'activité"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              }
            />
            <FeatureBadge
              label="Sécurité et contrôle des données"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-7 py-8">

            <div className="mb-7 text-center">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Se connecter</h2>
              <p className="text-gray-400 text-sm mt-1">Espace administrateur PneumoIA</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Identifiant email
                </label>
                <div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-3 transition-all duration-150 bg-white ${
                  emailFocus ? "border-teal-500 ring-2 ring-teal-500/10" : "border-gray-200"
                }`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                    required
                    autoComplete="email"
                    className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-300"
                    placeholder="admin@pneumoia.cm"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    Mot de passe
                  </label>
                  <Link
                    to="/administrateur/reset-password"
                    className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-3 transition-all duration-150 bg-white ${
                  pwdFocus ? "border-teal-500 ring-2 ring-teal-500/10" : "border-gray-200"
                }`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                    <circle cx="12" cy="16" r="1" fill="#9ca3af"/>
                  </svg>
                  <input
                    type={showPwd ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setPwdFocus(true)}
                    onBlur={() => setPwdFocus(false)}
                    required
                    autoComplete="current-password"
                    className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-300"
                    placeholder="Votre mot de passe"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                    {showPwd ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all duration-150 shadow-sm shadow-teal-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                    </svg>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
              <p className="text-xs text-teal-700 leading-relaxed">
                <span className="font-semibold">Démo :</span> remplissez les champs et cliquez sur{" "}
                <span className="font-semibold italic">Se connecter</span> pour accéder au tableau de bord.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} PneumoIA · Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}