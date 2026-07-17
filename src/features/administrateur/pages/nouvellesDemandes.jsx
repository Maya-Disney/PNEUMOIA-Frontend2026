import React, { useEffect, useMemo, useState } from "react";
import useAdminTheme from "../hooks/useAdminTheme";
import useAdminNotificationCount from "../hooks/useAdminNotificationCount";
import RefusModal from "../components/RefusModal";
import DossierModal from "../components/DossierModal";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

// ─── Helpers date réelles ─────────────────────────────────────────────────────
const JOURS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MOIS  = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"];
const pad   = (n) => String(n).padStart(2, "0");

function formatFull(d) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function elapsedStr(d) {
  const dm = Math.floor((Date.now() - d.getTime()) / 60000);
  const dh = Math.floor(dm / 60);
  const dd = Math.floor(dh / 24);
  if (dm < 60) return `Il y a ${dm} min`;
  if (dh < 24) return `Il y a ${dh}h${pad(dm % 60)}`;
  return `Il y a ${dd}j ${dh % 24}h`;
}

// ─── Mocks (2 médecins, timestamps réels) ────────────────────────────────────
const NOW = new Date();
const sub = (ms) => new Date(NOW.getTime() - ms);

const MOCK_DEMANDES = [
  {
    id: 1,
    initials: "AS",
    name: "Dr. Aminata Sow",
    specialite: "Pneumologue",
    hopital: "H. Laquintinie, Douala",
    ville: "Douala",
    email: "a.sow@laquintinie.cm",
    telephone: "+237 677 111 222",
    cnom: "CM-2024-1122",
    submittedAt: sub(47 * 60 * 1000),
    status: "pending",
    avatarBg: "#1D9E75",
    documents: [
      { label: "Diplôme de spécialisation en pneumologie", status: "verified" },
      { label: "Diplôme de docteur en médecine",           status: "verified" },
      { label: "Inscription à l'ordre des médecins",       status: "verified" },
      { label: "Autorisation d'exercice",                  status: "verified" },
      { label: "Carte professionnelle de médecin",         status: "verified" },
      { label: "Carte nationale d'identité (CNI)",         status: "verified" },
    ],
  },
  {
    id: 2,
    initials: "PE",
    name: "Dr. Paul Essomba",
    specialite: "Pneumologue",
    hopital: "CHU de Yaoundé",
    ville: "Yaoundé",
    email: "p.essomba@chuyde.cm",
    telephone: "+237 699 333 444",
    cnom: "CM-2023-0988",
    submittedAt: sub(18 * 3600 * 1000),
    status: "pending",
    avatarBg: "#185FA5",
    documents: [
      { label: "Diplôme de spécialisation en pneumologie", status: "missing" },
      { label: "Diplôme de docteur en médecine",           status: "verified" },
      { label: "Inscription à l'ordre des médecins",       status: "verified" },
      { label: "Autorisation d'exercice",                  status: "pending" },
      { label: "Carte professionnelle de médecin",         status: "verified" },
      { label: "Carte nationale d'identité (CNI)",         status: "verified" },
    ],
  },
];

// ─── Utilitaire état dossier ──────────────────────────────────────────────────
function docState(doc) {
  if (doc.documents.some((d) => d.status === "missing")) return "miss";
  if (doc.documents.some((d) => d.status === "pending")) return "wait";
  return "ok";
}

// ─── Badge statut dossier ─────────────────────────────────────────────────────
function DocBadge({ state, darkMode }) {
  const cfg = {
    ok:   { label: "Dossier complet",  light: "bg-emerald-50 text-emerald-700 border-emerald-300",  dark: "bg-emerald-900/30 text-emerald-300 border-emerald-700/50" },
    wait: { label: "Docs en attente",  light: "bg-amber-50 text-amber-700 border-amber-300",        dark: "bg-amber-900/30 text-amber-300 border-amber-700/50" },
    miss: { label: "Docs manquants",   light: "bg-red-50 text-red-600 border-red-300",              dark: "bg-red-900/30 text-red-400 border-red-700/50" },
  };
  const c = cfg[state];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${darkMode ? c.dark : c.light}`}>
      {c.label}
    </span>
  );
}

// ─── Modal photo CNI ──────────────────────────────────────────────────────────
function ProfilModal({ doc, darkMode, onClose }) {
  const overlay = darkMode ? "bg-gray-950/80" : "bg-black/60";
  const card    = darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200";
  const muted   = darkMode ? "text-gray-400" : "text-gray-500";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlay}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`relative w-80 rounded-2xl border shadow-2xl overflow-hidden ${card}`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
          <div>
            <p className="text-sm font-semibold">{doc.name}</p>
            <p className={`text-xs mt-0.5 ${muted}`}>Photo d'identité (CNI)</p>
          </div>
          <button
            onClick={onClose}
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
          {/* Placeholder photo — remplacer par <img src={doc.photoUrl} ... /> quand dispo */}
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

          {/* Nom + spécialité sous la photo */}
          <div className="text-center">
            <p className="text-sm font-semibold">{doc.name}</p>
            <p className={`text-xs mt-0.5 ${muted}`}>{doc.specialite} · CNOM {doc.cnom}</p>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-5 py-3 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
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
  );
}

// ─── Bouton pagination ────────────────────────────────────────────────────────
function PagBtn({ onClick, disabled, label, darkMode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition-colors
        ${disabled
          ? darkMode ? "border-gray-700 text-gray-600 cursor-not-allowed" : "border-gray-200 text-gray-300 cursor-not-allowed"
          : darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"
        }`}
    >
      {label}
    </button>
  );
}

const API = 'http://localhost:8000/api/v1';

// Génère une couleur d'avatar à partir du nom
function avatarColor(str) {
  const colors = ['#1D9E75','#185FA5','#7C3AED','#DC2626','#D97706','#0891B2'];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function mapMedecin(m) {
  return {
    id:          m.id,
    initials:    `${(m.prenom?.[0] || '').toUpperCase()}${(m.nom?.[0] || '').toUpperCase()}`,
    name:        `${m.civilite || 'Dr'} ${m.prenom} ${m.nom}`,
    specialite:  m.specialite || 'Pneumologue',
    hopital:     m.etablissement || '—',
    ville:       '—',
    email:       m.email,
    telephone:   m.telephone || '—',
    cnom:        m.numero_rpps || '—',
    submittedAt: new Date(m.created_at),
    status:      'pending',
    avatarBg:    avatarColor(`${m.prenom}${m.nom}`),
    documents:   [],
  };
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function NouvellesDemandes() {
  const { darkMode, setDarkMode }                     = useAdminTheme();
  const [activeKey, setActiveKey]                     = useState("nouvelles");
  const [isMobileOpen, setMobileOpen]                 = useState(false);
  const [demandes, setDemandes]                       = useState([]);
  const [apiLoading, setApiLoading]                   = useState(true);
  const [activationInfo, setActivationInfo]           = useState(null); // lien fallback
  const [selectedDossier, setSelectedDossier]         = useState(null);
  const [refusDoc, setRefusDoc]                       = useState(null);
  const [profilDoc, setProfilDoc]                     = useState(null);
  const { setCount: setGlobalNotificationCount }      = useAdminNotificationCount();

  // ── Chargement des demandes réelles ──────────────────────────────────────────
  useEffect(() => {
    setApiLoading(true);
    fetch(`${API}/admin/demandes`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDemandes(data.map(mapMedecin));
        } else {
          // Fallback sur les mocks si backend indisponible
          setDemandes(MOCK_DEMANDES);
        }
      })
      .catch(() => setDemandes(MOCK_DEMANDES))
      .finally(() => setApiLoading(false));
  }, []);

  // Tri & recherche
  const [search, setSearch]       = useState("");
  const [sortField, setSortField] = useState("submittedAt");
  const [sortDir, setSortDir]     = useState("desc");

  // Pagination
  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Horloge live
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pending = useMemo(() => demandes.filter((d) => d.status === "pending"), [demandes]);

  useEffect(() => {
    setGlobalNotificationCount(pending.length);
  }, [pending.length, setGlobalNotificationCount]);

  const filtered = useMemo(() => {
    let items = pending.filter((d) =>
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      d.cnom.toLowerCase().includes(search.toLowerCase()) ||
      d.ville.toLowerCase().includes(search.toLowerCase())
    );
    return [...items].sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "name") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [pending, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);
  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, filtered.length);

  function handleSort(field) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
    setPage(1);
  }

  function SortIcon({ field }) {
    if (sortField !== field) return <span className="ml-1 opacity-30">↕</span>;
    return <span className="ml-1 text-teal-500">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const handleAction = async (id, action, extra = {}) => {
    try {
      if (action === 'validated') {
        const res  = await fetch(`${API}/admin/demandes/${id}/valider`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Erreur validation');

        // Si email non envoyé → afficher le lien d'activation pour que l'admin le copie
        if (!data.email_envoye) {
          setActivationInfo({
            nom:   data.email_medecin,
            email: data.email_medecin,
            lien:  data.lien_activation,
          });
        }

      } else if (action === 'refused') {
        const motif = extra.motif || 'Dossier incomplet';
        const res = await fetch(`${API}/admin/demandes/${id}/rejeter`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ motif }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Erreur refus');
        }
      }
    } catch (e) {
      console.error('[handleAction]', e.message);
    }
    // Mettre à jour le state local dans tous les cas
    setDemandes((prev) => prev.map((item) => (item.id === id ? { ...item, status: action } : item)));
  };

  const handleExportCSV = () => {
    const headers = ["#", "Nom", "CNOM", "Spécialité", "Établissement", "Ville", "Email", "Téléphone", "Statut dossier", "Soumis le", "En attente depuis"];
    const rows = pending.map((d, i) => [
      i + 1, d.name, d.cnom, d.specialite, d.hopital, d.ville,
      d.email, d.telephone, docState(d),
      formatFull(d.submittedAt), elapsedStr(d.submittedAt),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `nouvelles_demandes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Styles réutilisables
  const thBase = `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide border-b select-none
    ${darkMode ? "text-gray-400 border-gray-700 bg-gray-900/50" : "text-gray-500 border-gray-200 bg-gray-50"}`;
  const tdBase = `px-4 py-3 text-sm border-b
    ${darkMode ? "border-gray-800" : "border-gray-100"}`;

  return (
    <div className={`h-screen flex admin-theme ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
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
          notificationCount={pending.length}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* ── En-tête page ── */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Nouvelles demandes</h1>
              <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Validation manuelle obligatoire · chaque dossier est vérifié avant activation du compte
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs tabular-nums ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                {JOURS[clock.getDay()]} {clock.getDate()} {MOIS[clock.getMonth()]} {clock.getFullYear()}
                &nbsp;{pad(clock.getHours())}:{pad(clock.getMinutes())}:{pad(clock.getSeconds())}
              </span>
              <button
                onClick={handleExportCSV}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
                  ${darkMode
                    ? "border-gray-700 text-gray-300 hover:bg-teal-600 hover:border-teal-600 hover:text-white"
                    : "border-gray-300 text-gray-700 hover:bg-teal-600 hover:border-teal-600 hover:text-white"
                  }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {/* ── Carte tableau ── */}
          <div className={`rounded-2xl border overflow-hidden ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>

            {/* Toolbar */}
            <div className={`flex items-center justify-between gap-4 px-5 py-4 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">Demandes en attente</span>
                <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {pending.length}
                </span>
              </div>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Rechercher par nom, e-mail, CNOM, ville…"
                className={`w-72 text-sm px-3 py-2 rounded-xl border outline-none transition-colors
                  ${darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-teal-600"
                    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-teal-400"
                  }`}
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={`${thBase} w-12 text-center`}>#</th>
                    <th className={`${thBase} cursor-pointer`} onClick={() => handleSort("name")}>
                      Nom du médecin <SortIcon field="name" />
                    </th>
                    <th className={thBase}>Contact</th>
                    <th className={thBase}>Spécialité</th>
                    <th className={thBase}>Statut dossier</th>
                    <th className={`${thBase} cursor-pointer`} onClick={() => handleSort("submittedAt")}>
                      Soumis le <SortIcon field="submittedAt" />
                    </th>
                    <th className={`${thBase} text-center`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={`${tdBase} text-center py-16 text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        Aucune demande en attente
                      </td>
                    </tr>
                  ) : (
                    paginated.map((doc, i) => {
                      const ds  = docState(doc);
                      const num = (page - 1) * perPage + i + 1;
                      return (
                        <tr
                          key={doc.id}
                          className={`transition-colors ${darkMode ? "hover:bg-gray-800/60" : "hover:bg-gray-50/80"}`}
                        >
                          {/* # */}
                          <td className={`${tdBase} text-center text-xs ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                            {num}
                          </td>

                          {/* Nom — cliquable → profil */}
                          <td className={tdBase}>
                            <div
                              className="flex items-center gap-3 cursor-pointer group"
                              onClick={() => setProfilDoc(doc)}
                              title="Voir le profil du médecin"
                            >
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-transparent group-hover:ring-offset-1 transition-all"
                                style={{ background: doc.avatarBg }}
                              >
                                {doc.initials}
                              </div>
                              <div>
                                <p className="font-semibold text-sm group-hover:underline underline-offset-2">
                                  {doc.name}
                                </p>
                                <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  {doc.hopital} · {doc.ville}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className={tdBase}>
                            <p className="text-sm">{doc.email}</p>
                            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{doc.telephone}</p>
                          </td>

                          {/* Spécialité */}
                          <td className={tdBase}>
                            <p className="text-sm">{doc.specialite}</p>
                            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>CNOM {doc.cnom}</p>
                          </td>

                          {/* Statut */}
                          <td className={tdBase}>
                            <DocBadge state={ds} darkMode={darkMode} />
                          </td>

                          {/* Soumis le */}
                          <td className={tdBase}>
                            <p className="text-sm">{formatFull(doc.submittedAt)}</p>
                            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              {elapsedStr(doc.submittedAt)}
                            </p>
                          </td>

                          {/* Actions */}
                          <td className={`${tdBase} text-center`}>
                            <div className="flex items-center justify-center gap-2">
                              {/* Voir dossier */}
                              <button
                                onClick={() => setSelectedDossier(doc)}
                                title="Voir le dossier complet"
                                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors
                                  ${darkMode
                                    ? "border-gray-700 text-gray-300 hover:bg-gray-700"
                                    : "border-gray-300 text-gray-500 hover:bg-gray-100"
                                  }`}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                </svg>
                              </button>

                              {/* Accepter (dossier complet uniquement) */}
                              {ds === "ok" && (
                                <button
                                  onClick={() => handleAction(doc.id, "validated")}
                                  title="Accepter l'adhésion"
                                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                </button>
                              )}

                              {/* Relancer e-mail (docs manquants / en attente) */}
                              {ds !== "ok" && (
                                <button
                                  title="Relancer par e-mail"
                                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                                  </svg>
                                </button>
                              )}

                              {/* Refuser */}
                              <button
                                onClick={() => setRefusDoc(doc)}
                                title="Refuser la demande"
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div className={`flex flex-wrap items-center justify-between gap-4 px-5 py-3 border-t text-sm
              ${darkMode ? "border-gray-800 text-gray-400" : "border-gray-100 text-gray-500"}`}
            >
              {/* Info */}
              <span className="text-xs">
                Affichage {from} à {to} sur {filtered.length} demande{filtered.length > 1 ? "s" : ""}
              </span>

              {/* Lignes par page */}
              <div className="flex items-center gap-2 text-xs">
                <span>Lignes par page</span>
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                  className={`px-2 py-1 rounded-lg border text-xs outline-none cursor-pointer
                    ${darkMode ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}
                >
                  {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-1">
                <PagBtn onClick={() => setPage(1)} disabled={page === 1} label="«" darkMode={darkMode} />
                <PagBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} label="‹" darkMode={darkMode} />
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…" + idx);
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p) =>
                    typeof p === "string" ? (
                      <span key={p} className="px-1 text-xs opacity-40">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg border text-xs font-medium transition-colors
                          ${p === page
                            ? "bg-teal-600 border-teal-600 text-white"
                            : darkMode
                              ? "border-gray-700 text-gray-300 hover:bg-gray-700"
                              : "border-gray-200 text-gray-600 hover:bg-gray-100"
                          }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <PagBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} label="›" darkMode={darkMode} />
                <PagBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} label="»" darkMode={darkMode} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Modal profil médecin ── */}
      {profilDoc && (
        <ProfilModal
          doc={profilDoc}
          darkMode={darkMode}
          onClose={() => setProfilDoc(null)}
        />
      )}

      {/* ── Modals (inchangées) ── */}
      {selectedDossier && (
        <DossierModal
          doc={selectedDossier}
          darkMode={darkMode}
          onClose={() => setSelectedDossier(null)}
          onValidate={(id) => handleAction(id, "validated")}
          onRefuse={(doc) => setRefusDoc(doc)}
        />
      )}

      {refusDoc && (
        <RefusModal
          doctorName={refusDoc.name}
          darkMode={darkMode}
          onClose={() => setRefusDoc(null)}
          onConfirm={({ motif, message }) => {
            const motifFull = message ? `${motif} : ${message}` : motif;
            handleAction(refusDoc.id, "refused", { motif: motifFull });
            setRefusDoc(null);
          }}
        />
      )}

      {/* Popup lien d'activation (fallback si email non reçu) */}
      {activationInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 text-xl">⚠️</span>
              </div>
              <div>
                <p className="font-bold text-sm">Email non reçu par le médecin ?</p>
                <p className="text-xs opacity-60">Copiez ce lien et transmettez-le manuellement</p>
              </div>
            </div>
            <p className="text-xs opacity-70 mb-2">Lien d'activation pour <strong>{activationInfo.email}</strong> :</p>
            <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-mono break-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <span className="flex-1">{activationInfo.lien}</span>
              <button
                onClick={() => navigator.clipboard.writeText(activationInfo.lien)}
                className="shrink-0 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-sans font-medium"
              >
                Copier
              </button>
            </div>
            <button
              onClick={() => setActivationInfo(null)}
              className="mt-4 w-full py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
