import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/administrateur/dashboard":    "Tableau de bord",
  "/administrateur/demandes":     "Nouvelles demandes",
  "/administrateur/validees":     "Validées ce mois",
  "/administrateur/refusees":     "Refusées",
  "/administrateur/medecins":     "Médecins actifs",
  "/administrateur/suspendus":    "Médecins suspendus",
  "/administrateur/activite":     "Courbe d'activité",
  "/administrateur/stats":        "Statistiques",
  "/administrateur/performances": "Performances IA",
  "/administrateur/geo":          "Répartition géographique",
  "/administrateur/audit":        "Journal d'audit",
  "/administrateur/parametres":   "Paramètres plateforme",
};

const IcoSun  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const IcoMoon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>;
const IcoBell = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const IcoMenu = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IcoOut  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

export default function Topbar({ dark, setDark, setMobileOpen }) {
  const [searchVal, setSearchVal]     = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  const pageTitle = useMemo(
    () => PAGE_TITLES[location.pathname] ?? "Administration",
    [location.pathname]
  );

  const iconBtn = `p-2 rounded-xl border transition-all duration-150 ${
    dark
      ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
      : "bg-gray-50  border-gray-200 text-gray-500 hover:bg-gray-100"
  }`;

  return (
    <header className={`flex-shrink-0 z-40 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b shadow-sm ${
      dark ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100 text-gray-900"
    }`}>

      {/* Gauche — titre de page */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className={`lg:hidden p-2 rounded-lg transition-colors ${dark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
        >
          <IcoMenu />
        </button>
        <div>
          <h1 className={`text-base sm:text-lg font-bold ${dark ? "text-white" : "text-gray-900"}`}>
            {pageTitle}
          </h1>
          <p className={`text-[11px] hidden sm:block ${dark ? "text-gray-500" : "text-gray-400"}`}>
            Administration · PneumoIA CEMAC
          </p>
        </div>
      </div>

      {/* Droite — recherche + actions */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Recherche */}
        <div className={`hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 text-sm border transition-all duration-150 ${
          dark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-500"
        }`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un médecin…"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            className={`bg-transparent outline-none w-44 text-sm placeholder:text-gray-400 ${dark ? "text-gray-200" : "text-gray-700"}`}
          />
        </div>

        {/* Toggle dark/light */}
        <button
          onClick={() => setDark(!dark)}
          className={`${iconBtn} ${dark ? "text-yellow-400" : ""}`}
          title={dark ? "Mode clair" : "Mode sombre"}
        >
          {dark ? <IcoSun /> : <IcoMoon />}
        </button>

        {/* Notifications */}
        <button className={`relative ${iconBtn}`}>
          <IcoBell />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full leading-tight">
            4
          </span>
        </button>

        {/* Profil */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(v => !v)}
            className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 hover:bg-teal-700 transition-colors"
          >
            AD
          </button>

          {profileOpen && (
            <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg border p-4 z-50 ${
              dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}>
              <p className={`text-sm font-semibold mb-1 ${dark ? "text-white" : "text-gray-900"}`}>
                Administrateur
              </p>
              <p className={`text-xs mb-4 ${dark ? "text-gray-400" : "text-gray-500"}`}>
                admin@pneumoia.cm
              </p>
              <button
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => console.log("Déconnexion")}
              >
                <IcoOut /> Déconnexion
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
