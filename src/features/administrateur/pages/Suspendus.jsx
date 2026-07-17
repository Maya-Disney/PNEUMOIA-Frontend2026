import { useState, useCallback, useEffect } from "react";
import useAdminTheme from "../hooks/useAdminTheme";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

// ==================== DONNÉES MOCKÉES ====================
const MOCK_SUSPENDUS = [
  {
    id: 1,
    initiales: "DM",
    nom: "Dr. Mbang",
    specialite: "Pneumologue",
    etablissement: "Clinique Sud, Douala",
    cnom: "CM-2020-0345",
    raison: "Signalement d'un confrère — comportement non conforme à la déontologie",
    duree: "30 jours",
    dureeType: "limitee",
    suspenduLe: "Hier",
    suspenduPar: "Super Admin",
  },
  {
    id: 2,
    initiales: "TD",
    nom: "Dr. Tamba Diallo",
    specialite: "Pneumologue",
    etablissement: "Hôpital Laquintinie",
    cnom: "CM-2021-0789",
    raison: "Vérification d'identité requise — incohérence dans les documents soumis",
    duree: "Indéfinie",
    dureeType: "indefinie",
    suspenduLe: "Il y a 5j",
    suspenduPar: "Super Admin",
  },
];

// ==================== MODALE PHOTO CNI ====================
function ModalePhoto({ medecin, onClose, darkMode }) {
  const overlay = darkMode ? "bg-gray-950/80" : "bg-black/60";
  const card    = darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200";
  const muted   = darkMode ? "text-gray-400" : "text-gray-500";
  const sep     = darkMode ? "border-gray-800" : "border-gray-100";

  return (
    <>
      <div
        className={`fixed inset-0 z-50 ${overlay}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`relative w-80 rounded-2xl border shadow-2xl overflow-hidden pointer-events-auto ${card}`}>

          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-4 border-b ${sep}`}>
            <div>
              <p className="text-sm font-semibold">{medecin.nom}</p>
              <p className={`text-xs mt-0.5 ${muted}`}>Photo d'identité (CNI)</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                ${darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-400 hover:bg-gray-100"}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Photo */}
          <div className="flex flex-col items-center justify-center px-6 py-8 gap-4">
            {/* Remplacer par <img src={medecin.photoUrl} ... /> quand disponible */}
            <div
              className={`w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed
                ${darkMode ? "bg-gray-800 border-gray-600 text-gray-500" : "bg-gray-50 border-gray-300 text-gray-400"}`}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-xs text-center px-2">Photo soumise à l'adhésion</span>
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold">{medecin.nom}</p>
              <p className={`text-xs mt-0.5 ${muted}`}>{medecin.specialite} · CNOM {medecin.cnom}</p>
            </div>
          </div>

          {/* Footer */}
          <div className={`px-5 py-3 border-t ${sep}`}>
            <button
              onClick={onClose}
              className={`w-full py-2 rounded-xl text-sm font-medium border transition-colors
                ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ==================== MODALE SUPPRESSION ====================
function ModaleSuppression({ medecin, onConfirm, onCancel, darkMode }) {
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={`relative w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto
            ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}
        >
          <div className={`flex items-center justify-between px-6 py-4 border-b
            ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
            <h2 id="modal-title" className={`text-base font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              Supprimer le compte
            </h2>
            <button
              onClick={onCancel}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
              aria-label="Fermer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-5 space-y-3">
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border
              ${darkMode ? "bg-red-950/30 border-red-800/40 text-red-300" : "bg-red-50 border-red-100 text-red-700"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-sm leading-relaxed">
                Supprimer définitivement le compte de{" "}
                <span className="font-bold">{medecin.nom}</span> ? Toutes ses données seront effacées de la plateforme.
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl
              ${darkMode ? "bg-red-950/20 text-red-400" : "bg-red-50 text-red-500"}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-xs font-medium">Cette action est irréversible.</p>
            </div>
          </div>

          <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t
            ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
            <button
              onClick={onCancel}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
            >
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ==================== SOUS-COMPOSANTS ====================
function DureeBadge({ duree, dureeType }) {
  const isIndefinie = dureeType === "indefinie";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
      isIndefinie
        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
        : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
    }`}>
      {duree}
    </span>
  );
}

function Avatar({ initiales, darkMode, onClick }) {
  return (
    <div
      onClick={onClick}
      title={onClick ? "Voir la photo d'identité" : undefined}
      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-opacity
        ${onClick ? "cursor-pointer hover:opacity-75 ring-2 ring-transparent hover:ring-offset-1 hover:ring-gray-300" : ""}
        ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}
    >
      {initiales}
    </div>
  );
}

function SkeletonRow({ darkMode }) {
  return (
    <tr>
      {[180, 100, 220, 70, 70, 80, 120].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className={`h-4 rounded-md animate-pulse ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
            style={{ width: `${w}px` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ==================== COMPOSANT PRINCIPAL ====================
export default function MedecinsSuspendus() {
  const { darkMode, setDarkMode } = useAdminTheme();
  const [activeKey, setActiveKey]   = useState("suspendus");
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [suspendus, setSuspendus]   = useState(MOCK_SUSPENDUS);
  const [loading]                   = useState(false);
  const [modaleSuppr, setModaleSuppr] = useState(null);
  const [modalePhoto, setModalePhoto] = useState(null); // ← nouveau
  const [toast, setToast]           = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setModaleSuppr(null);
        setModalePhoto(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleReactiver = useCallback((id) => {
    setSuspendus((prev) => prev.filter((m) => m.id !== id));
    setToast({ message: "Compte réactivé avec succès", type: "success" });
  }, []);

  const handleSupprimer = useCallback(() => {
    if (!modaleSuppr) return;
    setSuspendus((prev) => prev.filter((m) => m.id !== modaleSuppr.id));
    setToast({ message: `Compte de ${modaleSuppr.nom} supprimé définitivement`, type: "error" });
    setModaleSuppr(null);
  }, [modaleSuppr]);

  const pageCls   = darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900";
  const cardCls   = darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const thCls     = darkMode ? "bg-gray-800/80 text-gray-400" : "bg-gray-50 text-gray-500";
  const mutedCls  = darkMode ? "text-gray-400" : "text-gray-500";
  const tdCls     = darkMode ? "text-gray-200" : "text-gray-800";
  const rowHover  = darkMode ? "hover:bg-gray-800/60" : "hover:bg-gray-50";
  const divider   = darkMode ? "divide-gray-800" : "divide-gray-100";

  return (
    <div className={`h-screen flex admin-theme ${pageCls}`}>
      <Sidebar
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        darkMode={darkMode}
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar darkMode={darkMode} setDarkMode={setDarkMode} setMobileOpen={setMobileOpen} />

        <main className={`overflow-y-auto flex-1 p-4 md:p-6 ${pageCls}`}>

          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Comptes suspendus</h1>
              <p className={`text-sm mt-0.5 ${mutedCls}`}>
                {suspendus.length} compte{suspendus.length > 1 ? "s" : ""} suspendu{suspendus.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Tableau */}
          <div className={`rounded-2xl border overflow-hidden ${cardCls}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-xs uppercase tracking-wider border-b ${thCls} ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <th className="px-4 py-3 text-left font-semibold">Médecin</th>
                    <th className="px-4 py-3 text-left font-semibold">CNOM</th>
                    <th className="px-4 py-3 text-left font-semibold">Raison de la suspension</th>
                    <th className="px-4 py-3 text-left font-semibold">Durée</th>
                    <th className="px-4 py-3 text-left font-semibold">Suspendu le</th>
                    <th className="px-4 py-3 text-left font-semibold">Suspendu par</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className={`divide-y ${divider}`}>
                  {loading ? (
                    <>
                      <SkeletonRow darkMode={darkMode} />
                      <SkeletonRow darkMode={darkMode} />
                    </>
                  ) : suspendus.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={`text-center py-16 ${mutedCls}`}>
                        <div className="flex flex-col items-center gap-3">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                          <span>Aucun compte suspendu</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    suspendus.map((m) => (
                      <tr key={m.id} className={`transition-colors duration-100 ${rowHover}`}>

                        {/* Médecin — avatar cliquable → photo */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar
                              initiales={m.initiales}
                              darkMode={darkMode}
                              onClick={() => setModalePhoto(m)}
                            />
                            <div>
                              <p
                                className={`font-semibold text-sm cursor-pointer hover:underline underline-offset-2 ${tdCls}`}
                                onClick={() => setModalePhoto(m)}
                                title="Voir la photo d'identité"
                              >
                                {m.nom}
                              </p>
                              <p className={`text-xs ${mutedCls}`}>
                                {m.specialite} · {m.etablissement}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className={`px-4 py-3.5 font-mono text-xs ${mutedCls}`}>{m.cnom}</td>

                        <td className="px-4 py-3.5 max-w-xs">
                          <span className="text-orange-500 dark:text-orange-400 text-xs font-medium leading-snug">
                            {m.raison}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <DureeBadge duree={m.duree} dureeType={m.dureeType} />
                        </td>

                        <td className={`px-4 py-3.5 text-xs whitespace-nowrap ${mutedCls}`}>{m.suspenduLe}</td>

                        <td className={`px-4 py-3.5 text-xs whitespace-nowrap ${mutedCls}`}>{m.suspenduPar}</td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReactiver(m.id)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-teal-400 text-teal-600 hover:bg-teal-50 dark:border-teal-600 dark:text-teal-400 dark:hover:bg-teal-900/20 font-medium transition-colors"
                            >
                              Réactiver
                            </button>
                            <button
                              onClick={() => setModaleSuppr(m)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 font-medium transition-colors"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && suspendus.length > 0 && (
            <p className={`text-xs mt-3 text-right ${mutedCls}`}>
              Dernière mise à jour : {new Date().toLocaleString("fr-FR")}
            </p>
          )}

          {/* Modale photo CNI */}
          {modalePhoto && (
            <ModalePhoto
              medecin={modalePhoto}
              darkMode={darkMode}
              onClose={() => setModalePhoto(null)}
            />
          )}

          {/* Modale suppression */}
          {modaleSuppr && (
            <ModaleSuppression
              medecin={modaleSuppr}
              onConfirm={handleSupprimer}
              onCancel={() => setModaleSuppr(null)}
              darkMode={darkMode}
            />
          )}

          {/* Toast */}
          {toast && (
            <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white
              ${toast.type === "success" ? "bg-teal-600" : "bg-red-600"}`}
            >
              {toast.type === "success" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              {toast.message}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}