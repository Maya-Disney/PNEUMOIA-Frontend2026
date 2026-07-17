// ==========================
// ADMIN RESET PASSWORD - FULL VISIBLE NO CLIPPING
// ==========================

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function EyeOpen() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const score = checks.filter(Boolean).length;

  const levels = [
    {
      label: "Très faible",
      colors: ["bg-red-400", "bg-gray-200", "bg-gray-200", "bg-gray-200"],
      text: "text-red-500",
    },
    {
      label: "Faible",
      colors: ["bg-orange-400", "bg-orange-400", "bg-gray-200", "bg-gray-200"],
      text: "text-orange-500",
    },
    {
      label: "Moyen",
      colors: ["bg-yellow-400", "bg-yellow-400", "bg-yellow-400", "bg-gray-200"],
      text: "text-yellow-600",
    },
    {
      label: "Fort",
      colors: ["bg-teal-400", "bg-teal-400", "bg-teal-400", "bg-teal-400"],
      text: "text-teal-600",
    },
  ];

  const level = levels[Math.min(score, 3)];

  return (
    <div className="mt-1">
      <div className="flex gap-1.5">
        {level.colors.map((color, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${color} transition-all duration-300`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-semibold mt-1 ${level.text}`}>
        {level.label}
      </p>
    </div>
  );
}

export default function AdminResetPassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email) {
      setError("Veuillez saisir votre adresse e-mail.");
      return;
    }

    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 1200));
      setSuccess(true);

      setTimeout(() => {
        navigate("/administrateur/login");
      }, 2500);
    } catch (err) {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-6 px-4">
      <div className="w-full max-w-md">
        {/* HEADER */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-blue-600">Pneumo</span>IA
          </h1>
          <p className="text-gray-500 text-xs font-medium mt-1">
            Espace Administrateur
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-xl px-6 py-6">
          {/* ICON & TITLE */}
          <div className="text-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mx-auto mb-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0f766e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-gray-900">
              Nouveau mot de passe
            </h2>
            <p className="text-gray-500 text-xs mt-1">
              Réinitialisez votre accès administrateur sécurisé
            </p>
          </div>

          {/* SUCCESS MESSAGE */}
          {success ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                Réinitialisation réussie
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                Redirection...
              </p>
            </div>
          ) : (
            <>
              {/* ERROR */}
              {error && (
                <div className="mb-3 bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* EMAIL */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Adresse e-mail
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/20 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="admin@pneumoia.cm"
                      autoComplete="email"
                      className="flex-1 bg-transparent outline-none text-xs font-medium text-gray-800 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      name="password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 caractères"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-8 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-xs font-medium text-gray-800 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPwd ? <EyeOff /> : <EyeOpen />}
                    </button>
                  </div>
                  <PasswordStrength password={form.password} />
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirm"
                      required
                      value={form.confirm}
                      onChange={handleChange}
                      placeholder="Confirmez votre mot de passe"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-8 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-xs font-medium text-gray-800 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showConfirm ? <EyeOff /> : <EyeOpen />}
                    </button>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-xs font-bold rounded-lg py-2.5 transition-all duration-200 shadow-md shadow-teal-500/25 mt-2"
                >
                  {loading ? "..." : "Réinitialiser le mot de passe"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* BACK LINK & FOOTER */}
        <div className="text-center mt-3">
          <Link
            to="/administrateur/login"
            className="text-xs font-semibold text-gray-500 hover:text-teal-600 transition"
          >
            Retour à la connexion
          </Link>
          <p className="text-[10px] text-gray-400 font-medium mt-2">
            © {new Date().getFullYear()} PneumoIA
          </p>
        </div>
      </div>
    </div>
  );
}