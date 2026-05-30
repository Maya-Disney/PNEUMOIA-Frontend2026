import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import * as XLSX from "xlsx";

const NOW = new Date();
const sub = (ms) => new Date(NOW.getTime() - ms);
const pad = (n) => String(n).padStart(2, "0");
const MOIS_COURT = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];
const MOIS_LONG  = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

function formatFull(d) {
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatCourt(d) {
  const dm = Math.floor((NOW - d) / 60000);
  const dh = Math.floor(dm / 60);
  const dd = Math.floor(dh / 24);
  if (dm < 60) return `Il y a ${dm} min`;
  if (NOW.getDate() === d.getDate() && NOW.getMonth() === d.getMonth()) return `Auj. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (dd === 1) return "Hier";
  if (dd < 30) return `${d.getDate()} ${MOIS_COURT[d.getMonth()]}`;
  return `${d.getDate()} ${MOIS_COURT[d.getMonth()]} ${d.getFullYear()}`;
}
function formatValidation(d) {
  const sameDay = NOW.getDate()===d.getDate() && NOW.getMonth()===d.getMonth() && NOW.getFullYear()===d.getFullYear();
  return sameDay ? `Auj. ${pad(d.getHours())}:${pad(d.getMinutes())}` : `${d.getDate()} ${MOIS_COURT[d.getMonth()]}`;
}
function titreMois() {
  const m = MOIS_LONG[NOW.getMonth()];
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${NOW.getFullYear()}`;
}

// ── 1 seul mock ───────────────────────────────────────────────────────────────
const MOCK = [
  {
    id: 1, initials: "AS", avatarBg: "#1D9E75",
    name: "Dr. Aminata Sow", specialite: "Pneumologue",
    hopital: "H. Laquintinie, Douala", ville: "Douala", pays: "Cameroun",
    email: "aminata.sow@pneumo.cm", telephone: "+237 699 001 122", cnom: "CM-2024-1122",
    patients: 87, consultations: 1243, concordanceIA: 82,
    rangCommunaute: "#14/38", casPartages: "64 cas publiés", statut: "Actif",
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
];

const DOC_CFG = {
  verified: { label: "Vérifié",    cls: "bg-green-100  dark:bg-green-900/20  text-green-700  dark:text-green-400  border-green-200  dark:border-green-700/40"  },
  pending:  { label: "En attente", cls: "bg-amber-100  dark:bg-amber-900/20  text-amber-700  dark:text-amber-400  border-amber-200  dark:border-amber-700/40"  },
  missing:  { label: "Manquant",   cls: "bg-red-100    dark:bg-red-900/20    text-red-600    dark:text-red-400    border-red-200    dark:border-red-700/40"    },
};

const RAISONS = ["— Choisir une raison —","Signalement d'un confrère","Comportement non conforme","Vérification d'identité requise","Incohérence dans les documents","Inactivité prolongée","Autre"];

function CloseBtn({ onClose }) {
  return (
    <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#484f58] hover:bg-gray-100 dark:hover:bg-[#21262d] transition-colors">
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  );
}

function ModalShell({ onClose, title, sub, wide, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#21262d] shadow-2xl overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#21262d] shrink-0">
          <div>
            <p className="text-[14px] font-bold text-gray-800 dark:text-[#e6edf3]">{title}</p>
            {sub && <p className="text-[11px] text-gray-400 dark:text-[#484f58] mt-0.5">{sub}</p>}
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="shrink-0 px-6 py-4 border-t border-gray-100 dark:border-[#21262d] flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

function ModaleDossier({ doc: m, onClose }) {
  return (
    <ModalShell onClose={onClose} title="Dossier de validation" sub={`${m.name} · validé le ${formatValidation(m.dateValidation)}`}
      footer={<button onClick={onClose} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-gray-500 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors">Fermer</button>}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-green-200 dark:border-green-700/40 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[12px] font-medium">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Dossier complet — validé par <strong className="ml-1">{m.validePar}</strong> le {formatFull(m.dateValidation)}
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-[#21262d] overflow-hidden">
          {[
            { l: "Médecin",           v: m.name },
            { l: "Spécialité",        v: m.specialite },
            { l: "CNOM",              v: m.cnom },
            { l: "Établissement",     v: m.hopital },
            { l: "Date demande",      v: formatFull(m.dateDemande) },
            { l: "Date validation",   v: formatFull(m.dateValidation), green: true },
          ].map(({ l, v, green }) => (
            <div key={l} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 dark:border-[#21262d] last:border-0">
              <span className="text-[11px] text-gray-400 dark:text-[#484f58]">{l}</span>
              <span className={`text-[11px] font-medium ${green ? "text-green-600 dark:text-[#22c55e]" : "text-gray-700 dark:text-[#e6edf3]"}`}>{v}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-300 dark:text-[#484f58] mb-2">Pièces justificatives</p>
          <div className="rounded-xl border border-gray-100 dark:border-[#21262d] overflow-hidden">
            {m.documents.map((d, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-50 dark:border-[#21262d] last:border-0">
                <span className="text-[11px] text-gray-600 dark:text-[#8b949e]">{d.label}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${DOC_CFG[d.status]?.cls}`}>
                  {DOC_CFG[d.status]?.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function ModaleProfil({ doc: m, onClose, onSuspendre, onSupprimer }) {
  return (
    <ModalShell onClose={onClose} title={`Profil — ${m.name}`} wide
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-gray-500 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors">Fermer</button>
          <button onClick={() => { onClose(); onSuspendre(m); }} className="px-4 py-2 rounded-xl border border-orange-300 dark:border-orange-700/50 text-orange-600 dark:text-orange-400 text-[12px] font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">Suspendre</button>
          <button onClick={() => { onClose(); onSupprimer(m); }} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold transition-colors">Supprimer</button>
        </>
      }>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#21262d]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0" style={{ background: m.avatarBg }}>{m.initials}</div>
            <div>
              <p className="text-[13px] font-bold text-gray-800 dark:text-[#e6edf3]">{m.name}</p>
              <p className="text-[11px] text-gray-400 dark:text-[#484f58]">{m.specialite} · {m.hopital}</p>
              <div className="flex gap-1.5 mt-1">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">{m.statut}</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">CNOM vérifié</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] text-gray-400 dark:text-[#484f58]">Créé le</p>
            <p className="text-[11px] font-semibold text-gray-700 dark:text-[#e6edf3]">{m.creeLE}</p>
            <p className="text-[9px] text-gray-400 dark:text-[#484f58] mt-1">Validé le</p>
            <p className="text-[11px] font-semibold text-green-600 dark:text-[#22c55e]">{m.valideLE}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { v: m.patients,                              l: "Patients actifs",      cls: "text-gray-800 dark:text-[#e6edf3]" },
            { v: m.consultations.toLocaleString("fr-FR"), l: "Consultations",        cls: "text-gray-800 dark:text-[#e6edf3]" },
            { v: `${m.concordanceIA}%`,                   l: "Concordance IA",       cls: "text-green-600 dark:text-[#22c55e]" },
          ].map(({ v, l, cls }) => (
            <div key={l} className="rounded-xl bg-gray-50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#21262d] p-3 text-center">
              <p className={`text-xl font-black ${cls}`}>{v}</p>
              <p className="text-[9px] text-gray-400 dark:text-[#484f58] mt-0.5">{l}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-300 dark:text-[#484f58] mb-2">Informations</p>
            <div className="rounded-xl border border-gray-100 dark:border-[#21262d] overflow-hidden">
              {[
                { l: "CNOM",          v: m.cnom,           mono: true },
                { l: "Email",         v: m.email },
                { l: "Téléphone",     v: m.telephone },
                { l: "Ville",         v: m.ville },
                { l: "Rang communauté", v: m.rangCommunaute },
                { l: "Cas partagés",  v: m.casPartages },
              ].map(({ l, v, mono }) => (
                <div key={l} className="flex items-center justify-between px-3 py-2 border-b border-gray-50 dark:border-[#21262d] last:border-0">
                  <span className="text-[10px] text-gray-400 dark:text-[#484f58]">{l}</span>
                  <span className={`text-[10px] font-medium text-gray-700 dark:text-[#8b949e] ${mono ? "font-mono" : ""}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-300 dark:text-[#484f58] mb-2">Activité récente</p>
            <div className="flex flex-col gap-2">
              {m.activiteRecente.map((a, i) => (
                <div key={i} className="flex items-start justify-between gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#21262d]">
                  <p className="text-[10px] text-gray-700 dark:text-[#8b949e] leading-relaxed">{a.texte}</p>
                  <span className="text-[9px] text-gray-300 dark:text-[#484f58] shrink-0">{a.quand}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function MoaleSuspension({ medecin: m, onClose, onConfirm }) {
  const [raison, setRaison] = useState("");
  const [duree, setDuree]   = useState("30 jours");
  const [msg, setMsg]       = useState("");
  const ok = raison && raison !== "— Choisir une raison —";
  const inp = "w-full text-[12px] rounded-xl border px-3 py-2 outline-none transition-colors bg-gray-50 dark:bg-[#0d1117] border-gray-200 dark:border-[#21262d] text-gray-800 dark:text-[#e6edf3] focus:border-orange-400 dark:focus:border-orange-500";
  return (
    <ModalShell onClose={onClose} title="Suspendre l'accès" sub={m.name}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-gray-500 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors">Annuler</button>
          <button onClick={() => ok && onConfirm({ raison, duree, msg })} disabled={!ok}
            className={`px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-colors ${ok ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-200 dark:bg-[#21262d] text-gray-400 cursor-not-allowed"}`}>
            Confirmer
          </button>
        </>
      }>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-700/40 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-[11px]">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <strong>{m.name}</strong> ne pourra plus se connecter. La raison est enregistrée dans le journal d'audit.
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-600 dark:text-[#8b949e] mb-1.5">Raison <span className="text-red-500">*</span></label>
          <select value={raison} onChange={e => setRaison(e.target.value)} className={inp + " cursor-pointer"}>
            {RAISONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-600 dark:text-[#8b949e] mb-1.5">Durée</label>
          <select value={duree} onChange={e => setDuree(e.target.value)} className={inp + " cursor-pointer"}>
            {["7 jours","15 jours","30 jours","60 jours","90 jours","Indéfinie"].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-600 dark:text-[#8b949e] mb-1.5">Message au médecin (optionnel)</label>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3} placeholder="Informations supplémentaires…" className={inp + " resize-none"} />
        </div>
      </div>
    </ModalShell>
  );
}

function MoaleSuppression({ medecin: m, onClose, onConfirm }) {
  return (
    <ModalShell onClose={onClose} title="Supprimer le compte" sub={m.name}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-gray-500 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors">Annuler</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold transition-colors">Supprimer définitivement</button>
        </>
      }>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[11px]">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Supprimer définitivement le compte de <strong className="mx-1">{m.name}</strong> ? Toutes ses données seront effacées.
        </div>
        <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold">Cette action est irréversible.</p>
      </div>
    </ModalShell>
  );
}

export default function ValideesCeMois() {
  const { dark } = useOutletContext();

  const [rows] = useState(MOCK);
  const [modaleDossier, setModaleDossier] = useState(null);
  const [modaleProfil,  setModaleProfil]  = useState(null);
  const [modaleSusp,    setModaleSusp]    = useState(null);
  const [modaleSuppr,   setModaleSuppr]   = useState(null);
  const [toast, setToast]                 = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(rows.map((d, i) => ({
      "#":               i + 1,
      "Nom":             d.name,
      "CNOM":            d.cnom,
      "Spécialité":      d.specialite,
      "Établissement":   d.hopital,
      "Ville":           d.ville,
      "Email":           d.email,
      "Téléphone":       d.telephone,
      "Date demande":    formatFull(d.dateDemande),
      "Date validation": formatFull(d.dateValidation),
      "Validé par":      d.validePar,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Validées");
    XLSX.writeFile(wb, `validees_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const th = "px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wider border-b border-gray-100 dark:border-[#21262d] bg-gray-50 dark:bg-[#161b22] text-gray-400 dark:text-[#484f58] select-none";
  const td = "px-5 py-4 text-sm border-b border-gray-50 dark:border-[#21262d]";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">
            Inscriptions validées — {titreMois()}
          </h1>
          <p className="text-[12px] mt-1 text-gray-400 dark:text-[#484f58]">
            {rows.length} compte{rows.length > 1 ? "s" : ""} médecin activé{rows.length > 1 ? "s" : ""} ce mois
          </p>
        </div>
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-[12px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e] hover:bg-green-600 hover:border-green-600 hover:text-white dark:hover:bg-green-700 dark:hover:border-green-700">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Excel
        </button>
      </div>

      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Médecin</th>
                <th className={th}>CNOM</th>
                <th className={th}>Établissement</th>
                <th className={th}>Ville</th>
                <th className={th}>Date demande</th>
                <th className={th}>Date validation</th>
                <th className={th}>Validé par</th>
                <th className={`${th} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0
                ? <tr><td colSpan={8} className={`${td} text-center py-14 text-[12px] text-gray-300 dark:text-[#484f58]`}>Aucune validation ce mois-ci.</td></tr>
                : rows.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50/80 dark:hover:bg-[#0d1117]/60 transition-colors">
                    <td className={td}>
                      <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setModaleProfil(doc)}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: doc.avatarBg }}>{doc.initials}</div>
                        <div>
                          <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3] group-hover:underline underline-offset-2">{doc.name}</p>
                          <p className="text-[10px] text-gray-400 dark:text-[#484f58]">{doc.specialite}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${td} text-[11px] font-mono text-gray-400 dark:text-[#484f58]`}>{doc.cnom}</td>
                    <td className={`${td} text-[11px] text-gray-500 dark:text-[#8b949e]`}>{doc.hopital}</td>
                    <td className={`${td} text-[11px] text-gray-500 dark:text-[#8b949e]`}>{doc.ville}</td>
                    <td className={`${td} text-[11px] text-gray-400 dark:text-[#484f58] whitespace-nowrap`}>{formatCourt(doc.dateDemande)}</td>
                    <td className={`${td} text-[11px] font-semibold text-green-600 dark:text-[#22c55e] whitespace-nowrap`}>{formatValidation(doc.dateValidation)}</td>
                    <td className={`${td} text-[11px] text-gray-400 dark:text-[#484f58]`}>{doc.validePar}</td>
                    <td className={`${td} text-center`}>
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setModaleDossier(doc)}
                          className="px-3 py-1.5 text-[11px] font-semibold rounded-xl border border-green-200 dark:border-green-700/40 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                          Dossier
                        </button>
                        <button onClick={() => setModaleProfil(doc)}
                          className="px-3 py-1.5 text-[11px] font-semibold rounded-xl border border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors">
                          Profil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-50 dark:border-[#21262d] text-[11px] text-gray-300 dark:text-[#484f58]">
            {rows.length} inscription{rows.length > 1 ? "s" : ""} validée{rows.length > 1 ? "s" : ""} ce mois
          </div>
        )}
      </div>

      {modaleDossier && <ModaleDossier doc={modaleDossier} onClose={() => setModaleDossier(null)} />}
      {modaleProfil  && <ModaleProfil  doc={modaleProfil}  onClose={() => setModaleProfil(null)}
        onSuspendre={m => setModaleSusp(m)} onSupprimer={m => setModaleSuppr(m)} />}
      {modaleSusp    && <MoaleSuspension medecin={modaleSusp} onClose={() => setModaleSusp(null)}
        onConfirm={({ raison, duree }) => { setToast({ msg: `${modaleSusp.name} suspendu — ${duree}`, type: "warn" }); setModaleSusp(null); }} />}
      {modaleSuppr   && <MoaleSuppression medecin={modaleSuppr} onClose={() => setModaleSuppr(null)}
        onConfirm={() => { setToast({ msg: `Compte de ${modaleSuppr.name} supprimé`, type: "err" }); setModaleSuppr(null); }} />}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white
          ${toast.type === "warn" ? "bg-orange-500" : toast.type === "err" ? "bg-red-600" : "bg-green-600"}`}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            {toast.type === "err" || toast.type === "warn"
              ? <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
              : <polyline points="20 6 9 17 4 12"/>}
          </svg>
          {toast.msg}
        </div>
      )}
    </div>
  );
}