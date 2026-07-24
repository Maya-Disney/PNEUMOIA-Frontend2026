import { useEffect, useState, useCallback } from "react";
import useAdminTheme from "../hooks/useAdminTheme";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

// ────────────────────────────── Valeurs par défaut ──────────────────────────────
const DEFAULTS = {
  // Général
  inscriptions_ouvertes: true,
  validation_manuelle: true,
  verification_cnom: false,
  partage_dossiers: true,

  // Sécurité
  double_auth: true,
  session_max: true,
  audit_complet: true,

  // Communications
  email_bienvenue: true,
  notif_refus: true,
  notif_suspension: true,
  rapport_mensuel: false,
};

// ────────────────────────────── Données mockées — Publications communauté ──────────────────────────────
const MOCK_PUBLICATIONS = [
  {
    id: 235,
    titre: "Cas #235 — BPCO exacerbation sévère",
    auteur: "Dr. Nkoa",
    meta: "H64, Bafoussam · Publié il y a 5j · 19 vues · 4 commentaires",
    resume: "Exacerbation aiguë BPCO stade III. Corticothérapie + bronchodilatateur. Évolution favorable.",
    statut: "publie",
    raison: null,
  },
  {
    id: 241,
    titre: "Cas #241 — Pneumonie atypique résistante",
    auteur: "Dr. Dupont",
    meta: "H47, Douala · Publié il y a 1j · 12 vues · 3 commentaires",
    resume: "Pneumonie bactérienne atypique résistante à l'amoxicilline. Évolution favorable sous azithromycine.",
    statut: "publie",
    raison: null,
  },
  {
    id: 229,
    titre: "Cas #229 — Pneumopathie virale sévère",
    auteur: "Dr. Barry",
    meta: "F29, Garoua · Suspendu le 14/03/2026",
    resume: null,
    statut: "suspendu",
    raison: "Erreur dans les données biologiques signalée par 2 confrères.",
  },
  {
    id: 218,
    titre: "Cas #218 — Tuberculose pulmonaire active",
    auteur: "Dr. Fouda",
    meta: "H52, Yaoundé · Signalé il y a 2j · 8 vues · 1 commentaire",
    resume: "Cas signalé pour données patient non anonymisées dans les images jointes.",
    statut: "signale",
    raison: "Données patient non anonymisées signalées par 3 confrères.",
  },
];

// ────────────────────────────── Onglets ──────────────────────────────
const ONGLETS = [
  { key: "general", label: "Général" },
  { key: "publications", label: "Publications communauté" },
  { key: "securite", label: "Sécurité" },
  { key: "communications", label: "Communications" },
];

// ────────────────────────────── Composant Toggle ──────────────────────────────
function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${checked ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
        transition duration-200 ease-in-out
        ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

// ────────────────────────────── Ligne Toggle ──────────────────────────────
function ToggleRow({ label, description, checked, onChange, darkMode, disabled }) {
  return (
    <div className={`flex items-center justify-between py-4 border-b last:border-b-0
      ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
      <div className="pr-6">
        <p className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
          {label}
        </p>
        {description && (
          <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {description}
          </p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ────────────────────────────── Carte de section ──────────────────────────────
function SectionCard({ titre, description, darkMode, children, headerRight }) {
  return (
    <div className={`rounded-2xl border mb-4 overflow-hidden
      ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
      <div className={`px-5 py-4 border-b flex items-start justify-between gap-4
        ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
        <div>
          <h2 className={`text-sm font-bold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
            {titre}
          </h2>
          {description && (
            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {description}
            </p>
          )}
        </div>
        {headerRight}
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

// ────────────────────────────── Toast ──────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
      ${type === "success" ? "bg-teal-600 text-white" : "bg-red-600 text-white"}`}>
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      {message}
    </div>
  );
}

// ────────────────────────────── Icône Poumon ──────────────────────────────
function IconPoumon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v10M6 8c-2 1-4 3-4 6a4 4 0 008 0V8M18 8c2 1 4 3 4 6a4 4 0 01-8 0V8" />
    </svg>
  );
}

// ────────────────────────────── Onglet Publications ──────────────────────────────
function OngletPublications({ darkMode }) {
  const [filtre, setFiltre] = useState("Tous les cas");
  const [publications, setPublications] = useState(MOCK_PUBLICATIONS);

  const handleSuspendre = (id) => {
    setPublications((prev) =>
      prev.map((p) => (p.id === id ? { ...p, statut: "suspendu" } : p))
    );
  };

  const handleReactiver = (id) => {
    setPublications((prev) =>
      prev.map((p) => (p.id === id ? { ...p, statut: "publie", raison: null } : p))
    );
  };

  const handleSupprimer = (id) => {
    setPublications((prev) => prev.filter((p) => p.id !== id));
  };

  const filtrees = publications.filter((p) => {
    if (filtre === "Actifs") return p.statut === "publie";
    if (filtre === "Suspendus") return p.statut === "suspendu";
    if (filtre === "Signalés") return p.statut === "signale";
    return true;
  });

  const selectCls = darkMode
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-white border-gray-200 text-gray-800";

  return (
    <SectionCard
      titre="Publications — Cas cliniques communauté"
      description="Gérez les cas publiés sur la plateforme"
      darkMode={darkMode}
      headerRight={
        <select
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          className={`text-sm rounded-xl border px-3 py-1.5 outline-none cursor-pointer ${selectCls}`}
        >
          <option>Tous les cas</option>
          <option>Actifs</option>
          <option>Suspendus</option>
          <option>Signalés</option>
        </select>
      }
    >
      {/* Bandeau info */}
      <div className={`flex items-start gap-2 my-4 px-4 py-3 rounded-xl text-xs
        ${darkMode ? "bg-blue-900/20 text-blue-300 border border-blue-800/40" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Vous pouvez suspendre ou supprimer un cas clinique publié si son contenu ne respecte pas les règles de la plateforme (données non anonymisées, contenu inadapté, erreur médicale grave).
      </div>

      {/* Liste */}
      <div className="space-y-3 pb-4">
        {filtrees.length === 0 && (
          <p className={`text-sm text-center py-8 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
            Aucune publication dans cette catégorie
          </p>
        )}

        {filtrees.map((pub) => (
          <div key={pub.id} className={`rounded-xl border p-4
            ${pub.statut === "suspendu"
              ? darkMode ? "bg-orange-950/20 border-orange-800/30" : "bg-orange-50 border-orange-100"
              : pub.statut === "signale"
              ? darkMode ? "bg-red-950/20 border-red-800/30" : "bg-red-50 border-red-100"
              : darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
            }`}>
            <div className="flex items-start gap-3">
              {/* Icône */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                ${pub.statut === "suspendu"
                  ? darkMode ? "bg-orange-900/30" : "bg-orange-100"
                  : pub.statut === "signale"
                  ? darkMode ? "bg-red-900/30" : "bg-red-100"
                  : darkMode ? "bg-teal-900/30" : "bg-teal-50"
                }`}>
                {pub.statut === "suspendu" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : pub.statut === "signale" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                ) : (
                  <IconPoumon />
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                      {pub.titre}
                    </p>
                    <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {pub.auteur} · {pub.meta}
                    </p>
                  </div>

                  {/* Statut + Actions */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-xs font-semibold
                      ${pub.statut === "suspendu" ? "text-orange-500"
                      : pub.statut === "signale" ? "text-red-500"
                      : "text-teal-500"}`}>
                      {pub.statut === "suspendu" ? "Suspendu"
                       : pub.statut === "signale" ? "Signalé"
                       : "Actif"}
                    </span>

                    <div className="flex gap-1.5">
                      {pub.statut === "publie" && (
                        <>
                          <button
                            onClick={() => handleSuspendre(pub.id)}
                            className="text-xs px-2.5 py-1 rounded-lg border border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 transition-colors"
                          >
                            Suspendre
                          </button>
                          <button className={`text-xs px-2.5 py-1 rounded-lg border transition-colors
                            ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
                            Voir
                          </button>
                        </>
                      )}
                      {pub.statut === "signale" && (
                        <>
                          <button
                            onClick={() => handleSuspendre(pub.id)}
                            className="text-xs px-2.5 py-1 rounded-lg border border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 transition-colors"
                          >
                            Suspendre
                          </button>
                          <button
                            onClick={() => handleReactiver(pub.id)}
                            className="text-xs px-2.5 py-1 rounded-lg border border-teal-400 text-teal-600 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400 transition-colors"
                          >
                            Ignorer
                          </button>
                        </>
                      )}
                      {pub.statut === "suspendu" && (
                        <>
                          <button
                            onClick={() => handleReactiver(pub.id)}
                            className="text-xs px-2.5 py-1 rounded-lg border border-teal-400 text-teal-600 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400 transition-colors"
                          >
                            Réactiver
                          </button>
                          <button
                            onClick={() => handleSupprimer(pub.id)}
                            className="text-xs px-2.5 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 transition-colors"
                          >
                            Supprimer
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {pub.resume && (
                  <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {pub.resume}
                  </p>
                )}
                {pub.raison && (
                  <p className="text-xs mt-2 text-orange-500 font-medium">
                    Raison de suspension : {pub.raison}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ────────────────────────────── Onglet Sécurité ──────────────────────────────
function OngletSecurite({ params, set, darkMode }) {
  return (
    <SectionCard
      titre="Sécurité & authentification"
      description="Paramètres d'accès admin"
      darkMode={darkMode}
    >
      <ToggleRow
        label="Double authentification (2FA)"
        description="Obligatoire pour le super admin"
        checked={params.double_auth}
        onChange={(v) => set("double_auth", v)}
        darkMode={darkMode}
      />
      <ToggleRow
        label="Session max 8h"
        description="Déconnexion automatique après inactivité"
        checked={params.session_max}
        onChange={(v) => set("session_max", v)}
        darkMode={darkMode}
      />
      <ToggleRow
        label="Journal d'audit complet"
        description="Enregistrer toutes les actions administratives"
        checked={params.audit_complet}
        onChange={(v) => set("audit_complet", v)}
        darkMode={darkMode}
      />
    </SectionCard>
  );
}

// ────────────────────────────── Onglet Communications ──────────────────────────────
function OngletCommunications({ params, set, darkMode }) {
  return (
    <SectionCard
      titre="E-mails automatiques"
      description="Notifications envoyées aux médecins"
      darkMode={darkMode}
    >
      <ToggleRow
        label="E-mail de bienvenue à l'activation"
        checked={params.email_bienvenue}
        onChange={(v) => set("email_bienvenue", v)}
        darkMode={darkMode}
      />
      <ToggleRow
        label="Notification de refus avec motif"
        checked={params.notif_refus}
        onChange={(v) => set("notif_refus", v)}
        darkMode={darkMode}
      />
      <ToggleRow
        label="Notification de suspension avec raison"
        checked={params.notif_suspension}
        onChange={(v) => set("notif_suspension", v)}
        darkMode={darkMode}
      />
      <ToggleRow
        label="Rapport mensuel aux médecins"
        checked={params.rapport_mensuel}
        onChange={(v) => set("rapport_mensuel", v)}
        darkMode={darkMode}
      />
    </SectionCard>
  );
}

// ────────────────────────────── Composant Principal ──────────────────────────────
export default function ParametresPlateforme() {
  const { darkMode, setDarkMode } = useAdminTheme();
  const [activeKey, setActiveKey] = useState("parametres");
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [ongletActif, setOnglet] = useState("general");
  const [params, setParams] = useState(DEFAULTS);
  const [original, setOriginal] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Chargement
  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/parametres")
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => {
        setParams({ ...DEFAULTS, ...data });
        setOriginal({ ...DEFAULTS, ...data });
        setLoading(false);
      })
      .catch(() => {
        setParams(DEFAULTS);
        setOriginal(DEFAULTS);
        setLoading(false);
      });
  }, []);

  const set = useCallback((key, value) => setParams((p) => ({ ...p, [key]: value })), []);

  // Sauvegarde
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/parametres", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error();
      setOriginal(params);
      setToast({ message: "Paramètres sauvegardés avec succès", type: "success" });
    } catch {
      setOriginal(params);
      setToast({ message: "Paramètres sauvegardés (mode démo)", type: "success" });
    } finally {
      setSaving(false);
    }
  }, [params]);

  const handleReset = useCallback(() => setParams(original), [original]);
  const hasChanges = JSON.stringify(params) !== JSON.stringify(original);

  const pageCls = darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900";
  const tabActive = darkMode ? "border-teal-400 text-teal-400" : "border-teal-600 text-teal-700";
  const tabInact = darkMode ? "border-transparent text-gray-500 hover:text-gray-300" : "border-transparent text-gray-500 hover:text-gray-700";

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
        <Topbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setMobileOpen={setMobileOpen}
        />
        <main className={`overflow-y-auto flex-1 p-4 md:p-6 ${pageCls}`}>

          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Paramètres de la plateforme</h1>
              <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Configuration globale de PneumoIA
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <button onClick={handleReset}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
                    ${darkMode ? "border-gray-700 text-gray-400 hover:text-white" : "border-gray-300 text-gray-600 hover:text-gray-900"}`}>
                  Annuler
                </button>
              )}
              <button onClick={handleSave} disabled={!hasChanges || saving}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
                  ${hasChanges && !saving
                    ? "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                    : darkMode ? "bg-gray-800 text-gray-600 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}>
                {saving ? "Sauvegarde…" : "Sauvegarder"}
              </button>
            </div>
          </div>

          {/* Onglets */}
          <div className={`flex gap-0 border-b mb-6 overflow-x-auto ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
            {ONGLETS.map((o) => (
              <button key={o.key} onClick={() => setOnglet(o.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors duration-150
                  ${ongletActif === o.key ? tabActive : tabInact}`}>
                {o.label}
              </button>
            ))}
          </div>

          {/* Contenu */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className={`rounded-2xl border h-40 animate-pulse
                  ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`} />
              ))}
            </div>
          ) : (
            <>
              {ongletActif === "general" && (
                <SectionCard titre="Inscriptions & accès" description="Contrôle des nouvelles demandes médecins" darkMode={darkMode}>
                  <ToggleRow label="Nouvelles inscriptions ouvertes" description="Accepter de nouvelles demandes sur la plateforme" checked={params.inscriptions_ouvertes} onChange={(v) => set("inscriptions_ouvertes", v)} darkMode={darkMode} />
                  <ToggleRow label="Validation manuelle obligatoire" description="Chaque inscription validée manuellement par le super admin" checked={params.validation_manuelle} onChange={(v) => set("validation_manuelle", v)} darkMode={darkMode} />
                  <ToggleRow label="Vérification CNOM en ligne" description="Appel API Ordre National des Médecins du Cameroun" checked={params.verification_cnom} onChange={(v) => set("verification_cnom", v)} darkMode={darkMode} />
                  <ToggleRow label="Partage de dossiers entre médecins" description="Autoriser les demandes de partage de dossiers patients" checked={params.partage_dossiers} onChange={(v) => set("partage_dossiers", v)} darkMode={darkMode} />
                </SectionCard>
              )}

              {ongletActif === "publications" && <OngletPublications darkMode={darkMode} />}

              {ongletActif === "securite" && (
                <OngletSecurite params={params} set={set} darkMode={darkMode} />
              )}

              {ongletActif === "communications" && (
                <OngletCommunications params={params} set={set} darkMode={darkMode} />
              )}
            </>
          )}

          {/* Bandeau changements non sauvegardés */}
          {hasChanges && ongletActif !== "publications" && (
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40
              flex items-center gap-4 px-5 py-3 rounded-2xl shadow-xl border text-sm
              ${darkMode ? "bg-gray-900 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-700"}`}>
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
              Modifications non sauvegardées
              <button onClick={handleReset}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors
                  ${darkMode ? "border-gray-600 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"}`}>
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="text-xs px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                {saving ? "…" : "Sauvegarder"}
              </button>
            </div>
          )}

          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
      </div>
    </div>
  );
}