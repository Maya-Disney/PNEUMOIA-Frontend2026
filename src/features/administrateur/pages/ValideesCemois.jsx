import React, { useState, useEffect } from "react";
import useAdminTheme from "../hooks/useAdminTheme";
import useAdminNotificationCount from "../hooks/useAdminNotificationCount";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

// ─── Helpers date réelles ─────────────────────────────────────────────────────
const MOIS_LONG = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const MOIS_COURT = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];
const pad = (n) => String(n).padStart(2, "0");

function formatFull(d) {
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatCourt(d) {
  const now = new Date();
  const dm = Math.floor((now - d) / 60000);
  const dh = Math.floor(dm / 60);
  const dd = Math.floor(dh / 24);
  if (dm < 60) return `Il y a ${dm} min`;
  const sameDay = now.getDate()===d.getDate() && now.getMonth()===d.getMonth();
  if (sameDay) return `Auj. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (dd===1) return `Hier`;
  if (dd < 30) return `${d.getDate()} ${MOIS_COURT[d.getMonth()]}`;
  return `${d.getDate()} ${MOIS_COURT[d.getMonth()]} ${d.getFullYear()}`;
}
function formatValidation(d) {
  const now = new Date();
  const sameDay = now.getDate()===d.getDate() && now.getMonth()===d.getMonth() && now.getFullYear()===d.getFullYear();
  if (sameDay) return `Auj. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${d.getDate()} ${MOIS_COURT[d.getMonth()]}`;
}

// ─── Mocks avec timestamps réels ─────────────────────────────────────────────
const NOW = new Date();
const sub = (ms) => new Date(NOW.getTime() - ms);

const MOCK_VALIDEES = [
  {
    id: 1,
    initials: "AS", avatarBg: "#1D9E75", couleur: "bg-teal-600",
    name: "Dr. Aminata Sow",
    specialite: "Pneumologue",
    hopital: "H. Laquintinie, Douala",
    ville: "Douala", pays: "Cameroun",
    email: "aminata.sow@pneumo.cm",
    telephone: "+237 699 001 122",
    cnom: "CM-2024-1122",
    patients: 87, consultations: 1243, concordanceIA: 82,
    rangCommunaute: "#14/38", casPartages: "64 cas publiés",
    statut: "Actif",
    creeLE: formatFull(sub(3 * 3600 * 1000)),
    valideLE: formatFull(sub(47 * 60 * 1000)),
    dateDemande: sub(3 * 3600 * 1000),
    dateValidation: sub(47 * 60 * 1000),
    validePar: "Super Admin",
    documents: [
      { label: "Diplôme de spécialisation en pneumologie", status: "verified" },
      { label: "Diplôme de docteur en médecine",           status: "verified" },
      { label: "Inscription à l'ordre des médecins",       status: "verified" },
      { label: "Autorisation d'exercice",                  status: "verified" },
      { label: "Carte professionnelle de médecin",         status: "verified" },
      { label: "Carte nationale d'identité (CNI)",         status: "verified" },
    ],
    activiteRecente: [
      { texte: "Compte activé sur PneumoIA CEMAC", quand: "Auj." },
      { texte: "Dossier validé par Super Admin",   quand: "Auj." },
    ],
  },
  {
    id: 2,
    initials: "FK", avatarBg: "#854F0B", couleur: "bg-amber-600",
    name: "Dr. Fatou Konaté",
    specialite: "Pneumologue",
    hopital: "H. Central, Bafoussam",
    ville: "Bafoussam", pays: "Cameroun",
    email: "fatou.konate@hcb.cm",
    telephone: "+237 687 200 510",
    cnom: "CM-2022-0765",
    patients: 112, consultations: 2087, concordanceIA: 76,
    rangCommunaute: "#9/38", casPartages: "132 cas publiés",
    statut: "Actif",
    creeLE: formatFull(sub(13 * 24 * 3600 * 1000)),
    valideLE: formatFull(sub(11 * 24 * 3600 * 1000)),
    dateDemande: sub(13 * 24 * 3600 * 1000),
    dateValidation: sub(11 * 24 * 3600 * 1000),
    validePar: "Super Admin",
    documents: [
      { label: "Diplôme de spécialisation en pneumologie", status: "verified" },
      { label: "Diplôme de docteur en médecine",           status: "verified" },
      { label: "Inscription à l'ordre des médecins",       status: "verified" },
      { label: "Autorisation d'exercice",                  status: "verified" },
      { label: "Carte professionnelle de médecin",         status: "verified" },
      { label: "Carte nationale d'identité (CNI)",         status: "verified" },
    ],
    activiteRecente: [
      { texte: "Cas #132 partagé sur la communauté", quand: "Il y a 2j" },
      { texte: "Rapport mensuel soumis",             quand: "Il y a 5j" },
    ],
  },
  {
    id: 3,
    initials: "MB", avatarBg: "#185FA5", couleur: "bg-blue-600",
    name: "Dr. Martin Biya",
    specialite: "Pneumologue",
    hopital: "Clinique Bleue, Douala",
    ville: "Douala", pays: "Cameroun",
    email: "martin.biya@pneumo.cm",
    telephone: "+237 673 104 488",
    cnom: "CM-2021-0543",
    patients: 145, consultations: 3102, concordanceIA: 91,
    rangCommunaute: "#4/38", casPartages: "218 cas publiés",
    statut: "Actif",
    creeLE: formatFull(sub(16 * 24 * 3600 * 1000)),
    valideLE: formatFull(sub(14 * 24 * 3600 * 1000)),
    dateDemande: sub(16 * 24 * 3600 * 1000),
    dateValidation: sub(14 * 24 * 3600 * 1000),
    validePar: "Super Admin",
    documents: [
      { label: "Diplôme de spécialisation en pneumologie", status: "verified" },
      { label: "Diplôme de docteur en médecine",           status: "verified" },
      { label: "Inscription à l'ordre des médecins",       status: "verified" },
      { label: "Autorisation d'exercice",                  status: "verified" },
      { label: "Carte professionnelle de médecin",         status: "verified" },
      { label: "Carte nationale d'identité (CNI)",         status: "verified" },
    ],
    activiteRecente: [
      { texte: "Consultation #145 enregistrée",      quand: "Hier" },
      { texte: "Cas #218 partagé sur la communauté", quand: "Il y a 3j" },
    ],
  },
];

// ─── Titre du mois courant ────────────────────────────────────────────────────
function titreMois() {
  const n = new Date();
  return `${MOIS_LONG[n.getMonth()].charAt(0).toUpperCase() + MOIS_LONG[n.getMonth()].slice(1)} ${n.getFullYear()}`;
}

// ─── Utilitaires UI ───────────────────────────────────────────────────────────
function Overlay({ onClick }) {
  return <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm" onClick={onClick}/>;
}

// ─── Modal photo CNI ──────────────────────────────────────────────────────────
function ModalePhoto({ doc, onClose, darkMode }) {
  const card  = darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200";
  const muted = darkMode ? "text-gray-400" : "text-gray-500";
  const sep   = darkMode ? "border-gray-800" : "border-gray-100";
  return (
    <>
      <Overlay onClick={onClose}/>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`relative w-80 rounded-2xl border shadow-2xl overflow-hidden pointer-events-auto ${card}`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${sep}`}>
            <div>
              <p className="text-sm font-semibold">{doc.name}</p>
              <p className={`text-xs mt-0.5 ${muted}`}>Photo d'identité (CNI)</p>
            </div>
            <CloseBtn onClose={onClose} darkMode={darkMode}/>
          </div>
          <div className="flex flex-col items-center justify-center px-6 py-8 gap-4">
            <div className={`w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed
              ${darkMode ? "bg-gray-800 border-gray-600 text-gray-500" : "bg-gray-50 border-gray-300 text-gray-400"}`}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-xs text-center px-2">Photo soumise à l'adhésion</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">{doc.name}</p>
              <p className={`text-xs mt-0.5 ${muted}`}>{doc.specialite} · CNOM {doc.cnom}</p>
            </div>
          </div>
          <div className={`px-5 py-3 border-t ${sep}`}>
            <button onClick={onClose} className={`w-full py-2 rounded-xl text-sm font-medium border transition-colors
              ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Modal dossier de validation ─────────────────────────────────────────────
function MoaleDossier({ doc: m, onClose, darkMode }) {
  const card  = darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200";
  const inner = darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200";
  const lbl   = darkMode ? "text-gray-400" : "text-gray-500";
  const val   = darkMode ? "text-gray-100" : "text-gray-800";
  const sep   = darkMode ? "border-gray-800" : "border-gray-100";
  const row   = darkMode ? "border-gray-700" : "border-gray-100";

  const DOC_CFG = {
    verified: { label: "Vérifié",    bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
    pending:  { label: "En attente", bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200"   },
    missing:  { label: "Manquant",   bg: "bg-red-50",      text: "text-red-600",     border: "border-red-200"     },
  };

  return (
    <>
      <div className={`fixed inset-0 z-50 ${darkMode ? "bg-gray-950/80" : "bg-black/45"} backdrop-blur-sm`} onClick={onClose}/>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl pointer-events-auto ${card}`}>

          {/* Header sticky */}
          <div className={`flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10
            ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
            <div>
              <h2 className={`text-base font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                Dossier de validation
              </h2>
              <p className={`text-xs mt-0.5 ${lbl}`}>{m.name} · validé le {formatValidation(m.dateValidation)}</p>
            </div>
            <CloseBtn onClose={onClose} darkMode={darkMode}/>
          </div>

          <div className="px-6 py-5 space-y-4">

            {/* Bandeau validé */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border
              ${darkMode ? "bg-teal-900/20 border-teal-700/40 text-teal-300" : "bg-teal-50 border-teal-200 text-teal-700"}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p className="text-sm font-medium">
                Dossier complet — validé par <span className="font-bold">{m.validePar}</span> le {formatFull(m.dateValidation)}
              </p>
            </div>

            {/* Infos rapides */}
            <div className={`rounded-xl border overflow-hidden ${inner}`}>
              {[
                { l: "Médecin",    v: m.name },
                { l: "Spécialité", v: m.specialite },
                { l: "CNOM",       v: m.cnom },
                { l: "Établissement", v: m.hopital },
                { l: "Date demande",  v: formatFull(m.dateDemande) },
                { l: "Date validation", v: formatFull(m.dateValidation), teal: true },
              ].map((r, i, arr) => (
                <div key={i} className={`flex items-center justify-between px-4 py-2.5 border-b last:border-b-0 ${row}`}>
                  <span className={`text-xs ${lbl}`}>{r.l}</span>
                  <span className={`text-xs font-medium ${r.teal ? "text-teal-500" : val}`}>{r.v}</span>
                </div>
              ))}
            </div>

            {/* Pièces justificatives */}
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${lbl}`}>
                Pièces justificatives ({m.documents.length})
              </p>
              <div className={`rounded-xl border overflow-hidden ${inner}`}>
                {m.documents.map((d, i) => {
                  const c = DOC_CFG[d.status] ?? DOC_CFG.missing;
                  return (
                    <div key={i} className={`flex items-center justify-between gap-3 px-4 py-2.5 border-b last:border-b-0 ${row}`}>
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 ${lbl}`}>
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span className={`text-xs ${val}`}>{d.label}</span>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border} whitespace-nowrap`}>
                        {c.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t sticky bottom-0
            ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
            <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function CloseBtn({ onClose, darkMode }) {
  return (
    <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  );
}
function ModaleProfilValide({ doc: m, onClose, onSuspendre, onSupprimer, darkMode }) {
  const card = darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200";
  const lbl  = darkMode ? "text-gray-400" : "text-gray-400";
  const val  = darkMode ? "text-gray-100" : "text-gray-800";
  const row  = darkMode ? "border-gray-700" : "border-gray-100";

  const infos = [
    { l: "N° CNOM",        v: m.cnom,           cls: "text-teal-500 font-mono" },
    { l: "E-mail",         v: m.email,           cls: val },
    { l: "Téléphone",      v: m.telephone,       cls: val },
    { l: "Établissement",  v: m.hopital,         cls: val },
    { l: "Ville",          v: m.ville,           cls: val },
    { l: "Rang communauté",v: m.rangCommunaute,  cls: val },
    { l: "Cas partagés",   v: m.casPartages,     cls: val },
    { l: "Statut compte",  v: m.statut, badge: true },
  ];

  return (
    <>
      <Overlay onClick={onClose}/>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl pointer-events-auto
          ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}>

          {/* Header sticky */}
          <div className={`flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10
            ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-base font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              Profil — {m.name}
            </h2>
            <CloseBtn onClose={onClose} darkMode={darkMode}/>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Carte identité */}
            <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${card}`}>
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: m.avatarBg }}
                >
                  {m.initials}
                </div>
                <div>
                  <p className={`font-bold text-base ${val}`}>{m.name}</p>
                  <p className={`text-sm ${lbl}`}>{m.specialite} · {m.hopital}</p>
                  <div className="flex gap-2 mt-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.statut === "Actif" ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"}`}>{m.statut}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">CNOM vérifié</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-xs ${lbl}`}>Compte créé le</p>
                <p className={`text-sm font-semibold ${val}`}>{m.creeLE}</p>
                <p className={`text-xs mt-1 ${lbl}`}>Validé le</p>
                <p className="text-sm font-semibold text-teal-500">{m.valideLE}</p>
              </div>
            </div>

            {/* 3 stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: m.patients,                          l: "Patients actifs",      c: val },
                { v: m.consultations.toLocaleString("fr-FR"), l: "Consultations totales", c: val },
                { v: `${m.concordanceIA ?? "—"}%`,        l: "Concordance IA",       c: "text-teal-500" },
              ].map((s, i) => (
                <div key={i} className={`rounded-xl border p-4 text-center ${card}`}>
                  <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
                  <p className={`text-xs mt-1 ${lbl}`}>{s.l}</p>
                </div>
              ))}
            </div>

            {/* Infos + Activité */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${lbl}`}>Informations du compte</p>
                <div className={`rounded-xl border overflow-hidden ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  {infos.map((r, i) => (
                    <div key={i} className={`flex items-center justify-between px-3 py-2.5 border-b last:border-b-0 ${row}`}>
                      <span className={`text-xs ${lbl}`}>{r.l}</span>
                      {r.badge
                        ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.statut === "Actif" ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"}`}>{r.v}</span>
                        : <span className={`text-xs font-medium ${r.cls}`}>{r.v}</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${lbl}`}>Activité récente</p>
                <div className="space-y-2">
                  {m.activiteRecente.map((a, i) => (
                    <div key={i} className={`flex items-start justify-between gap-3 px-3 py-2.5 rounded-xl border ${card}`}>
                      <p className={`text-xs leading-relaxed ${val}`}>{a.texte}</p>
                      <span className={`text-xs whitespace-nowrap ${lbl}`}>{a.quand}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer sticky */}
          <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t sticky bottom-0
            ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
            <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>
              Fermer
            </button>
            {onSuspendre && (
              <button onClick={() => { onClose(); onSuspendre(m); }} className="px-4 py-2 rounded-xl border border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 text-sm font-medium transition-colors">
                Suspendre
              </button>
            )}
            {onSupprimer && (
              <button onClick={() => { onClose(); onSupprimer(m); }} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                Supprimer le compte
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const RAISONS = ["- Choisir une raison -","Signalement d'un confrère","Comportement non conforme à la déontologie","Vérification d'identité requise","Incohérence dans les documents soumis","Inactivité prolongée","Autre"];

function MoaleSuspension({ medecin: m, onClose, onConfirm, darkMode }) {
  const [raison, setRaison] = useState("");
  const [duree, setDuree]   = useState("30 jours");
  const [msg, setMsg]       = useState("");
  const inp = darkMode ? "bg-gray-800 border-gray-700 text-white focus:border-orange-400" : "bg-white border-gray-200 text-gray-900 focus:border-orange-400";
  const lbl = darkMode ? "text-gray-200" : "text-gray-700";
  const ok  = raison && raison !== "- Choisir une raison -";
  return (
    <>
      <Overlay onClick={onClose}/>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl pointer-events-auto ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
            <h2 className={`text-base font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Suspendre l'accès</h2>
            <CloseBtn onClose={onClose} darkMode={darkMode}/>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${darkMode ? "bg-red-950/30 border-red-800/40 text-red-300" : "bg-red-50 border-red-100 text-red-700"}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <p className="text-sm leading-relaxed"><span className="font-bold">{m.name}</span> ne pourra plus se connecter. La raison est enregistrée dans le journal d'audit.</p>
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${lbl}`}>Raison de la suspension <span className="text-red-500">*</span></label>
              <select value={raison} onChange={e => setRaison(e.target.value)} className={`w-full text-sm rounded-xl border px-3 py-2.5 outline-none transition-colors cursor-pointer ${inp}`}>
                {RAISONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${lbl}`}>Durée de suspension</label>
              <select value={duree} onChange={e => setDuree(e.target.value)} className={`w-full text-sm rounded-xl border px-3 py-2.5 outline-none transition-colors cursor-pointer ${inp}`}>
                {["7 jours","15 jours","30 jours","60 jours","90 jours","Indéfinie"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${lbl}`}>Message au médecin (optionnel)</label>
              <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Informations supplémentaires envoyées par e-mail..." rows={3} className={`w-full text-sm rounded-xl border px-3 py-2.5 outline-none transition-colors resize-none ${inp}`}/>
            </div>
          </div>
          <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
            <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Annuler</button>
            <button onClick={() => ok && onConfirm({ raison, duree, msg })} disabled={!ok} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${ok ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"}`}>Confirmer la suspension</button>
          </div>
        </div>
      </div>
    </>
  );
}

function MoaleSuppression({ medecin: m, onClose, onConfirm, darkMode }) {
  return (
    <>
      <Overlay onClick={onClose}/>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`relative w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
            <h2 className={`text-base font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Supprimer le compte</h2>
            <CloseBtn onClose={onClose} darkMode={darkMode}/>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${darkMode ? "bg-red-950/30 border-red-800/40 text-red-300" : "bg-red-50 border-red-100 text-red-700"}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <p className="text-sm leading-relaxed">Supprimer définitivement le compte de <span className="font-bold">{m.name}</span> ? Toutes ses données seront effacées de la plateforme.</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${darkMode ? "bg-red-950/20 text-red-400" : "bg-red-50 text-red-500"}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <p className="text-xs font-medium">Cette action est irréversible.</p>
            </div>
          </div>
          <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
            <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Annuler</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">Supprimer définitivement</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function ValideesCeMois() {
  const { darkMode, setDarkMode }                = useAdminTheme();
  const [activeKey, setActiveKey]                = useState("validees");
  const [isMobileOpen, setMobileOpen]            = useState(false);
  const [rows]                                   = useState(MOCK_VALIDEES);
  const [modalePhoto, setModalePhoto]            = useState(null);
  const [modaleProfl, setModaleProfl]            = useState(null);
  const [modaleDossier, setModaleDossier]        = useState(null);
  const [modaleSusp,  setModaleSusp]             = useState(null);
  const [modaleSuppr, setModaleSuppr]            = useState(null);
  const [toast,       setToast]                  = useState(null);
  const { setCount: setGlobalNotificationCount } = useAdminNotificationCount();

  useEffect(() => {
    setGlobalNotificationCount(0);
  }, [setGlobalNotificationCount]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); }
  }, [toast]);

  const showToast = (message, type = "success") => setToast({ message, type });

  const handleSuspension = ({ raison, duree }) => {
    showToast(`${modaleSusp.name} suspendu — ${duree}`, "warning");
    setModaleSusp(null);
  };
  const handleSuppression = () => {
    showToast(`Compte de ${modaleSuppr.name} supprimé définitivement`, "error");
    setModaleSuppr(null);
  };

  const handleExportCSV = () => {
    const headers = ["Nom","CNOM","Spécialité","Établissement","Ville","Email","Téléphone","Date demande","Date validation","Validé par"];
    const csvRows = rows.map((d) => [
      d.name, d.cnom, d.specialite, d.hopital, d.ville,
      d.email, d.telephone,
      formatFull(d.dateDemande), formatFull(d.dateValidation),
      d.validePar,
    ]);
    const csv = [headers, ...csvRows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g,'""')}"`).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF"+csv], { type:"text/csv;charset=utf-8;" }));
    a.download = `validees_ce_mois_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const dm  = darkMode;
  const muted  = dm ? "text-gray-400" : "text-gray-500";
  const thCls  = `px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide border-b select-none
    ${dm ? "text-gray-400 border-gray-700 bg-gray-900/60" : "text-gray-500 border-gray-200 bg-gray-50"}`;
  const tdCls  = `px-5 py-4 text-sm border-b ${dm ? "border-gray-800" : "border-gray-100"}`;

  return (
    <div className={`h-screen flex admin-theme ${dm ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <Sidebar activeKey={activeKey} setActiveKey={setActiveKey} darkMode={dm} isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen}/>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar darkMode={dm} setDarkMode={setDarkMode} setMobileOpen={setMobileOpen}/>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Inscriptions validées — {titreMois()}
              </h1>
              <p className={`text-sm mt-1 ${muted}`}>
                {rows.length} compte{rows.length > 1 ? "s" : ""} médecin{rows.length > 1 ? "s" : ""} activé{rows.length > 1 ? "s" : ""} ce mois
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all shrink-0
                ${dm ? "border-gray-700 text-gray-300 hover:bg-teal-600 hover:border-teal-600 hover:text-white"
                     : "border-gray-300 text-gray-700 hover:bg-teal-600 hover:border-teal-600 hover:text-white"}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>

          {/* Tableau */}
          <div className={`rounded-2xl border overflow-hidden ${dm ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={thCls}>Médecin</th>
                    <th className={thCls}>CNOM</th>
                    <th className={thCls}>Établissement</th>
                    <th className={thCls}>Ville</th>
                    <th className={thCls}>Date demande</th>
                    <th className={thCls}>Date validation</th>
                    <th className={thCls}>Validé par</th>
                    <th className={`${thCls} text-center`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className={`${tdCls} text-center py-16 ${muted}`}>
                        Aucune validation ce mois-ci.
                      </td>
                    </tr>
                  ) : rows.map((doc) => (
                    <tr
                      key={doc.id}
                      className={`transition-colors ${dm ? "hover:bg-gray-800/60" : "hover:bg-gray-50/80"}`}
                    >
                      {/* Médecin — avatar + nom cliquables → photo CNI */}
                      <td className={tdCls}>
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setModalePhoto(doc)}
                            title="Voir la photo d'identité"
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
                            style={{ background: doc.avatarBg }}
                          >
                            {doc.initials}
                          </div>
                          <div>
                            <p
                              onClick={() => setModalePhoto(doc)}
                              title="Voir la photo d'identité"
                              className={`font-semibold text-sm cursor-pointer hover:underline underline-offset-2 ${dm ? "text-gray-100" : "text-gray-800"}`}
                            >
                              {doc.name}
                            </p>
                            <p className={`text-xs mt-0.5 ${muted}`}>{doc.specialite}</p>
                          </div>
                        </div>
                      </td>

                      {/* CNOM */}
                      <td className={`${tdCls} font-mono text-xs ${muted}`}>{doc.cnom}</td>

                      {/* Établissement */}
                      <td className={`${tdCls} text-xs ${muted}`}>{doc.hopital}</td>

                      {/* Ville */}
                      <td className={`${tdCls} text-xs ${muted}`}>{doc.ville}</td>

                      {/* Date demande */}
                      <td className={`${tdCls} text-xs ${muted} whitespace-nowrap`}>
                        {formatCourt(doc.dateDemande)}
                      </td>

                      {/* Date validation — en teal */}
                      <td className={`${tdCls} text-xs font-semibold text-teal-500 whitespace-nowrap`}>
                        {formatValidation(doc.dateValidation)}
                      </td>

                      {/* Validé par */}
                      <td className={`${tdCls} text-xs ${muted}`}>{doc.validePar}</td>

                      {/* Actions */}
                      <td className={`${tdCls} text-center`}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setModaleDossier(doc)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors
                              ${dm ? "border-teal-700 text-teal-400 hover:bg-teal-900/20"
                                   : "border-teal-300 text-teal-700 hover:bg-teal-50"}`}
                          >
                            Voir dossier
                          </button>
                          <button
                            onClick={() => setModaleProfl(doc)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors
                              ${dm ? "border-gray-700 text-gray-300 hover:bg-gray-700"
                                   : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                          >
                            Voir profil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pied tableau */}
            {rows.length > 0 && (
              <div className={`px-5 py-3 border-t text-xs ${muted} ${dm ? "border-gray-800" : "border-gray-100"}`}>
                {rows.length} inscription{rows.length > 1 ? "s" : ""} validée{rows.length > 1 ? "s" : ""} ce mois
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal photo CNI */}
      {modalePhoto && (
        <ModalePhoto doc={modalePhoto} darkMode={dm} onClose={() => setModalePhoto(null)}/>
      )}

      {/* Modal dossier de validation */}
      {modaleDossier && (
        <MoaleDossier doc={modaleDossier} darkMode={dm} onClose={() => setModaleDossier(null)}/>
      )}

      {/* Modal profil complet */}
      {modaleProfl && (
        <ModaleProfilValide
          doc={modaleProfl}
          darkMode={dm}
          onClose={() => setModaleProfl(null)}
          onSuspendre={(m) => setModaleSusp(m)}
          onSupprimer={(m) => setModaleSuppr(m)}
        />
      )}

      {/* Modal suspension */}
      {modaleSusp && (
        <MoaleSuspension
          medecin={modaleSusp}
          darkMode={dm}
          onClose={() => setModaleSusp(null)}
          onConfirm={handleSuspension}
        />
      )}

      {/* Modal suppression */}
      {modaleSuppr && (
        <MoaleSuppression
          medecin={modaleSuppr}
          darkMode={dm}
          onClose={() => setModaleSuppr(null)}
          onConfirm={handleSuppression}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white
          ${toast.type === "success" ? "bg-teal-600" : toast.type === "warning" ? "bg-orange-500" : "bg-red-600"}`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {toast.type === "success"
              ? <polyline points="20 6 9 17 4 12"/>
              : <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}
          </svg>
          {toast.message}
        </div>
      )}
    </div>
  );
}