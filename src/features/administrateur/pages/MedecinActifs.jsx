import { useState, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import * as XLSX from "xlsx";

const NOW = new Date();
const sub = (ms) => new Date(NOW.getTime() - ms);
const pad = (n) => String(n).padStart(2, "0");
const MOIS = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];

function formatDate(d) {
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}
function formatActivite(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const dm = Math.floor((NOW - d) / 60000);
  const dh = Math.floor(dm / 60);
  const dd = Math.floor(dh / 24);
  if (dm < 1)  return "À l'instant";
  if (dm < 60) return `Il y a ${dm} min`;
  if (dh < 24) return `Il y a ${dh}h`;
  if (dd === 1) return `Hier à ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)} à ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const MOCK = [
  {
    id: 1, initiales: "JD", couleur: "bg-teal-600",
    nom: "Dr. Jean Dupont", specialite: "Pneumologue", cnom: "CM-2019-0847",
    eEtablissement: "H. General Douala", ville: "Douala",
    patients: 134, consultations: 4821, concordanceIA: 88,
    creeLE: formatDate(sub(180 * 24 * 3600 * 1000)),
    valideLE: formatDate(sub(177 * 24 * 3600 * 1000)),
    statut: "Actif", derniereActivite: null,
    email: "j.dupont@hgd.cm", telephone: "+237 699 123 456",
    rangCommunaute: "#7/38", casPartages: "247 cas publiés",
    activiteRecente: [
      { texte: "Consultation #247 enregistrée",         quand: "Auj. 14:22" },
      { texte: "Cas #241 partagé sur la communauté",    quand: "Hier"        },
      { texte: "Accès accordé Dr. Martin",              quand: "Il y a 3j"   },
    ],
  },
  {
    id: 2, initiales: "DK", couleur: "bg-blue-600",
    nom: "Dr. Kamto Diane", specialite: "Pneumologue", cnom: "CM-2017-0432",
    eEtablissement: "CHU Yaoundé", ville: "Yaoundé",
    patients: 198, consultations: 3201, concordanceIA: 92,
    creeLE: formatDate(sub(90 * 24 * 3600 * 1000)),
    valideLE: formatDate(sub(88 * 24 * 3600 * 1000)),
    statut: "Inactif", derniereActivite: sub(6 * 24 * 3600 * 1000).toISOString(),
    email: "d.kamto@chu.cm", telephone: "+237 677 234 567",
    rangCommunaute: "#3/38", casPartages: "312 cas publiés",
    activiteRecente: [
      { texte: "Consultation #198 enregistrée", quand: "Il y a 6j" },
      { texte: "Rapport mensuel soumis",         quand: "Il y a 8j" },
    ],
  },
];

const RAISONS = ["— Choisir une raison —","Signalement d'un confrère","Comportement non conforme à la déontologie","Vérification d'identité requise","Incohérence dans les documents soumis","Inactivité prolongée","Autre"];

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
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#21262d] shrink-0">
          <div>
            <p className="text-[13px] font-bold text-gray-800 dark:text-[#e6edf3]">{title}</p>
            {sub && <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">{sub}</p>}
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="shrink-0 px-5 py-4 border-t border-gray-100 dark:border-[#21262d] flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

function StatutBadge({ statut, derniereActivite }) {
  if (statut === "Actif") return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
      <span className="text-[11px] font-bold text-green-600 dark:text-[#22c55e]">Actif</span>
    </div>
  );
  const label = formatActivite(derniereActivite);
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
        <span className="text-[11px] font-bold text-gray-400 dark:text-[#484f58]">Inactif</span>
      </div>
      {label && <span className="text-[9px] text-gray-400 dark:text-[#484f58] whitespace-nowrap">{label}</span>}
    </div>
  );
}

function ModalePhoto({ medecin: m, onClose }) {
  return (
    <ModalShell onClose={onClose} title={m.nom} sub="Photo d'identité (CNI)"
      footer={<button onClick={onClose} className="px-4 py-2 rounded-xl text-[12px] font-semibold border border-gray-200 dark:border-[#21262d] text-gray-500 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors">Fermer</button>}>
      <div className="flex flex-col items-center justify-center gap-4 py-6">
        <div className="w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-[#21262d] bg-gray-50 dark:bg-[#1c2128] text-gray-400 dark:text-[#484f58]">
          <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="text-[10px] text-center px-2">Photo soumise à l'adhésion</span>
        </div>
        <div className="text-center">
          <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">{m.nom}</p>
          <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">{m.specialite} · CNOM {m.cnom}</p>
        </div>
      </div>
    </ModalShell>
  );
}

function MoaleProfil({ medecin: m, onClose, onSuspendre, onSupprimer }) {
  return (
    <ModalShell onClose={onClose} title={`Profil — ${m.nom}`} wide
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-gray-500 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors">Fermer</button>
          <button onClick={() => { onClose(); onSuspendre(m); }} className="px-4 py-2 rounded-xl border border-orange-300 dark:border-orange-700/50 text-orange-600 dark:text-orange-400 text-[12px] font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">Suspendre</button>
          <button onClick={() => { onClose(); onSupprimer(m); }} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold flex items-center gap-1.5 transition-colors">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Supprimer
          </button>
        </>
      }>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#21262d]">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 ${m.couleur}`}>{m.initiales}</div>
            <div>
              <p className="text-[13px] font-bold text-gray-800 dark:text-[#e6edf3]">{m.nom}</p>
              <p className="text-[11px] text-gray-400 dark:text-[#484f58]">{m.specialite} · {m.eEtablissement}</p>
              <div className="flex gap-1.5 mt-1">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.statut === "Actif" ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-[#21262d] text-gray-500 dark:text-[#8b949e]"}`}>{m.statut}</span>
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
            { v: m.patients,                              l: "Patients actifs",   cls: "text-gray-800 dark:text-[#e6edf3]" },
            { v: m.consultations.toLocaleString("fr-FR"), l: "Consultations",     cls: "text-gray-800 dark:text-[#e6edf3]" },
            { v: `${m.concordanceIA}%`,                   l: "Concordance IA",   cls: "text-green-600 dark:text-[#22c55e]" },
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
                { l: "CNOM",           v: m.cnom,           mono: true },
                { l: "Email",          v: m.email },
                { l: "Téléphone",      v: m.telephone },
                { l: "Ville",          v: m.ville },
                { l: "Rang communauté",v: m.rangCommunaute },
                { l: "Cas partagés",   v: m.casPartages },
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
  const inp = "w-full text-[12px] rounded-xl border px-3 py-2 outline-none transition-colors bg-gray-50 dark:bg-[#0d1117] border-gray-200 dark:border-[#21262d] text-gray-800 dark:text-[#e6edf3] focus:border-orange-400 dark:focus:border-orange-500 cursor-pointer";
  return (
    <ModalShell onClose={onClose} title="Suspendre l'accès" sub={m.nom}
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
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <strong>{m.nom}</strong> ne pourra plus se connecter. La raison est enregistrée dans le journal d'audit.
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-600 dark:text-[#8b949e] mb-1.5">Raison <span className="text-red-500">*</span></label>
          <select value={raison} onChange={e => setRaison(e.target.value)} className={inp}>
            {RAISONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-600 dark:text-[#8b949e] mb-1.5">Durée</label>
          <select value={duree} onChange={e => setDuree(e.target.value)} className={inp}>
            {["7 jours","15 jours","30 jours","60 jours","90 jours","Indéfinie"].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-600 dark:text-[#8b949e] mb-1.5">Message au médecin (optionnel)</label>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3} placeholder="Informations supplémentaires…"
            className="w-full text-[12px] rounded-xl border px-3 py-2 outline-none resize-none bg-gray-50 dark:bg-[#0d1117] border-gray-200 dark:border-[#21262d] text-gray-800 dark:text-[#e6edf3] focus:border-orange-400" />
        </div>
      </div>
    </ModalShell>
  );
}

function MoaleSuppression({ medecin: m, onClose, onConfirm }) {
  return (
    <ModalShell onClose={onClose} title="Supprimer le compte" sub={m.nom}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-gray-500 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors">Annuler</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold transition-colors">Supprimer définitivement</button>
        </>
      }>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[11px]">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Supprimer définitivement le compte de <strong className="mx-1">{m.nom}</strong> ? Toutes ses données seront effacées.
        </div>
        <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold">Cette action est irréversible.</p>
      </div>
    </ModalShell>
  );
}

export default function MedecinsActifs() {
  useOutletContext();

  const [medecins, setMedecins]       = useState(MOCK);
  const [filtre, setFiltre]           = useState("Tous");
  const [modalePhoto, setModalePhoto] = useState(null);
  const [modaleProfil, setModaleProfil] = useState(null);
  const [modaleSusp, setModaleSusp]   = useState(null);
  const [modaleSuppr, setModaleSuppr] = useState(null);
  const [toast, setToast]             = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const nbActifs   = medecins.filter(m => m.statut === "Actif").length;
  const nbInactifs = medecins.filter(m => m.statut === "Inactif").length;

  const liste = medecins.filter(m => {
    if (filtre === "Actif")   return m.statut === "Actif";
    if (filtre === "Inactif") return m.statut === "Inactif";
    return true;
  });

  const exportExcel = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(medecins.map((m, i) => ({
      "#":              i + 1,
      "Nom":            m.nom,
      "CNOM":           m.cnom,
      "Spécialité":     m.specialite,
      "Établissement":  m.eEtablissement,
      "Ville":          m.ville,
      "Patients":       m.patients,
      "Consultations":  m.consultations,
      "Concordance IA": `${m.concordanceIA}%`,
      "Statut":         m.statut,
      "Créé le":        m.creeLE,
      "Validé le":      m.valideLE,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Médecins");
    XLSX.writeFile(wb, `medecins_${new Date().toISOString().slice(0,10)}.xlsx`);
  }, [medecins]);

  const downloadDossier = useCallback((m) => {
    const ws = XLSX.utils.json_to_sheet([{
      "Nom": m.nom, "CNOM": m.cnom, "Spécialité": m.specialite,
      "Établissement": m.eEtablissement, "Ville": m.ville,
      "Email": m.email, "Téléphone": m.telephone,
      "Patients": m.patients, "Consultations": m.consultations,
      "Concordance IA": `${m.concordanceIA}%`,
      "Statut": m.statut, "Créé le": m.creeLE, "Validé le": m.valideLE,
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dossier");
    const slug = m.nom.toLowerCase().replace(/\s+/g,"_").replace(/[^\w]/g,"");
    XLSX.writeFile(wb, `dossier_${slug}_${new Date().toISOString().slice(0,10)}.xlsx`);
    setToast({ msg: `Dossier de ${m.nom} téléchargé`, type: "success" });
  }, []);

  const handleSuspension = useCallback(({ raison, duree }) => {
    // await fetch(`/api/admin/medecins/${modaleSusp.id}/suspendre`, { method: "POST", body: JSON.stringify({ raison, duree }) })
    setMedecins(prev => prev.filter(m => m.id !== modaleSusp.id));
    setToast({ msg: `${modaleSusp.nom} suspendu — ${duree}`, type: "warn" });
    setModaleSusp(null);
  }, [modaleSusp]);

  const handleSuppression = useCallback(() => {
    // await fetch(`/api/admin/medecins/${modaleSuppr.id}`, { method: "DELETE" })
    setMedecins(prev => prev.filter(m => m.id !== modaleSuppr.id));
    setToast({ msg: `Compte de ${modaleSuppr.nom} supprimé définitivement`, type: "error" });
    setModaleSuppr(null);
  }, [modaleSuppr]);

  const th = "px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider border-b border-gray-100 dark:border-[#21262d] bg-gray-50 dark:bg-[#161b22] text-gray-400 dark:text-[#484f58] whitespace-nowrap";
  const td = "px-4 py-3.5 border-b border-gray-50 dark:border-[#21262d]";
  const iBtn = "w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-gray-400 dark:text-[#484f58] hover:text-gray-700 dark:hover:text-[#e6edf3] hover:bg-gray-100 dark:hover:bg-[#21262d]";

  const FILTRES = [
    { key: "Tous",    label: `Tous (${medecins.length})` },
    { key: "Actif",   label: `Actifs (${nbActifs})` },
    { key: "Inactif", label: `Inactifs (${nbInactifs})` },
  ];

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">Médecins actifs</h1>
          <p className="text-[12px] mt-1 text-gray-400 dark:text-[#484f58]">
            {medecins.length} médecin{medecins.length > 1 ? "s" : ""} sur la plateforme PneumoIA CEMAC
          </p>
        </div>
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-[12px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e] hover:bg-green-600 hover:border-green-600 hover:text-white dark:hover:bg-green-700">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Excel
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTRES.map(f => (
          <button key={f.key} onClick={() => setFiltre(f.key)}
            className={`px-4 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
              filtre === f.key
                ? f.key === "Actif"   ? "bg-green-600 border-green-600 text-white"
                : f.key === "Inactif" ? "bg-gray-500 border-gray-500 text-white"
                : "bg-gray-800 dark:bg-[#e6edf3] border-gray-800 dark:border-[#e6edf3] text-white dark:text-[#0d1117]"
                : "border-gray-200 dark:border-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-800 dark:hover:text-[#e6edf3]"
            }`}>{f.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Médecin","CNOM","Établissement","Ville","Patients","Consultations","Créé le","Validé le","Statut","Actions"].map(h => (
                  <th key={h} className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.length === 0 ? (
                <tr><td colSpan={10} className={`${td} text-center py-14 text-[12px] text-gray-300 dark:text-[#484f58]`}>Aucun médecin dans cette catégorie</td></tr>
              ) : liste.map(m => (
                <tr key={m.id} className="hover:bg-gray-50/80 dark:hover:bg-[#0d1117]/60 transition-colors">
                  <td className={td}>
                    <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setModalePhoto(m)}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 group-hover:opacity-75 transition-opacity ${m.couleur}`}>{m.initiales}</div>
                      <div>
                        <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3] group-hover:underline underline-offset-2">{m.nom}</p>
                        <p className="text-[10px] text-gray-400 dark:text-[#484f58]">{m.specialite}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`${td} text-[11px] font-mono text-gray-400 dark:text-[#484f58]`}>{m.cnom}</td>
                  <td className={`${td} text-[11px] text-gray-500 dark:text-[#8b949e]`}>{m.eEtablissement}</td>
                  <td className={`${td} text-[11px] text-gray-500 dark:text-[#8b949e]`}>{m.ville}</td>
                  <td className={`${td} text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]`}>{m.patients}</td>
                  <td className={`${td} text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]`}>{m.consultations.toLocaleString("fr-FR")}</td>
                  <td className={`${td} text-[11px] text-gray-400 dark:text-[#484f58]`}>{m.creeLE}</td>
                  <td className={`${td} text-[11px] font-semibold text-green-600 dark:text-[#22c55e]`}>{m.valideLE}</td>
                  <td className={td}><StatutBadge statut={m.statut} derniereActivite={m.derniereActivite} /></td>
                  <td className={td}>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => setModaleProfil(m)} title="Voir le profil" className={iBtn}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button onClick={() => downloadDossier(m)} title="Télécharger le dossier Excel" className={iBtn}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                      <button onClick={() => setModaleSuppr(m)} title="Supprimer le compte"
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-gray-400 dark:text-[#484f58] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {liste.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 dark:border-[#21262d] text-[11px] text-gray-300 dark:text-[#484f58] text-right">
            Dernière mise à jour : {new Date().toLocaleString("fr-FR")}
          </div>
        )}
      </div>

      {modalePhoto  && <ModalePhoto    medecin={modalePhoto}  onClose={() => setModalePhoto(null)} />}
      {modaleProfil && <MoaleProfil   medecin={modaleProfil} onClose={() => setModaleProfil(null)} onSuspendre={m => setModaleSusp(m)} onSupprimer={m => setModaleSuppr(m)} />}
      {modaleSusp   && <MoaleSuspension medecin={modaleSusp}   onClose={() => setModaleSusp(null)}   onConfirm={handleSuspension} />}
      {modaleSuppr  && <MoaleSuppression medecin={modaleSuppr}  onClose={() => setModaleSuppr(null)}  onConfirm={handleSuppression} />}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white
          ${toast.type === "success" ? "bg-green-600" : toast.type === "warn" ? "bg-orange-500" : "bg-red-600"}`}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            {toast.type === "success"
              ? <polyline points="20 6 9 17 4 12"/>
              : <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}
          </svg>
          {toast.msg}
        </div>
      )}
    </div>
  );
}