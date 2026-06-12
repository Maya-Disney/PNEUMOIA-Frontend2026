import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import * as XLSX from "xlsx";
import { Download, X, FileText, User, MoreVertical } from "lucide-react"; // ← ajout MoreVertical
import { getMedecinsValides } from "../api/adminapi";

const BRAND = "#0f766e";

const MOIS_LONG  = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const MOIS_COURT = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];
const pad = (n) => String(n).padStart(2, "0");

function formatFull(d) {
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatCourt(d) {
  const now = new Date();
  const dm  = Math.floor((now - d) / 60000);
  const dh  = Math.floor(dm / 60);
  const dd  = Math.floor(dh / 24);
  if (dm < 60) return `Il y a ${dm} min`;
  const same = now.getDate()===d.getDate() && now.getMonth()===d.getMonth();
  if (same) return `Auj. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (dd === 1) return "Hier";
  if (dd < 30) return `${d.getDate()} ${MOIS_COURT[d.getMonth()]}`;
  return `${d.getDate()} ${MOIS_COURT[d.getMonth()]} ${d.getFullYear()}`;
}
function formatValidation(d) {
  const now  = new Date();
  const same = now.getDate()===d.getDate() && now.getMonth()===d.getMonth() && now.getFullYear()===d.getFullYear();
  if (same) return `Auj. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${d.getDate()} ${MOIS_COURT[d.getMonth()]}`;
}

const NOW = new Date();
const sub = (ms) => new Date(NOW.getTime() - ms);

const MOCK = [
  {
    id:1, initials:"AS", avatarBg:"#1D9E75",
    name:"Dr. Aminata Sow", specialite:"Pneumologue",
    hopital:"H. Laquintinie, Douala", ville:"Douala",
    email:"aminata.sow@pneumo.cm", telephone:"+237 699 001 122",
    cnom:"CM-2024-1122", patients:87, consultations:1243, concordanceIA:82,
    rangCommunaute:"#14/38", casPartages:"64 cas publiés", statut:"Actif",
    creeLE:formatFull(sub(3*3600*1000)), valideLE:formatFull(sub(47*60*1000)),
    dateDemande:sub(3*3600*1000), dateValidation:sub(47*60*1000),
    validePar:"Super Admin",
    documents:[
      {label:"Diplôme de spécialisation en pneumologie", status:"verified"},
      {label:"Diplôme de docteur en médecine",           status:"verified"},
      {label:"Inscription à l'ordre des médecins",       status:"verified"},
      {label:"Autorisation d'exercice",                  status:"verified"},
      {label:"Carte professionnelle de médecin",         status:"verified"},
      {label:"Carte nationale d'identité (CNI)",         status:"verified"},
    ],
    activiteRecente:[
      {texte:"Compte activé sur PneumoIA CEMAC", quand:"Auj."},
      {texte:"Dossier validé par Super Admin",   quand:"Auj."},
    ],
  },
  {
    id:2, initials:"FK", avatarBg:"#854F0B",
    name:"Dr. Fatou Konaté", specialite:"Pneumologue",
    hopital:"H. Central, Bafoussam", ville:"Bafoussam",
    email:"fatou.konate@hcb.cm", telephone:"+237 687 200 510",
    cnom:"CM-2022-0765", patients:112, consultations:2087, concordanceIA:76,
    rangCommunaute:"#9/38", casPartages:"132 cas publiés", statut:"Actif",
    creeLE:formatFull(sub(13*24*3600*1000)), valideLE:formatFull(sub(11*24*3600*1000)),
    dateDemande:sub(13*24*3600*1000), dateValidation:sub(11*24*3600*1000),
    validePar:"Super Admin",
    documents:[
      {label:"Diplôme de spécialisation en pneumologie", status:"verified"},
      {label:"Diplôme de docteur en médecine",           status:"verified"},
      {label:"Inscription à l'ordre des médecins",       status:"verified"},
      {label:"Autorisation d'exercice",                  status:"verified"},
      {label:"Carte professionnelle de médecin",         status:"verified"},
      {label:"Carte nationale d'identité (CNI)",         status:"verified"},
    ],
    activiteRecente:[
      {texte:"Cas #132 partagé sur la communauté", quand:"Il y a 2j"},
      {texte:"Rapport mensuel soumis",             quand:"Il y a 5j"},
    ],
  },
  {
    id:3, initials:"MB", avatarBg:"#185FA5",
    name:"Dr. Martin Biya", specialite:"Pneumologue",
    hopital:"Clinique Bleue, Douala", ville:"Douala",
    email:"martin.biya@pneumo.cm", telephone:"+237 673 104 488",
    cnom:"CM-2021-0543", patients:145, consultations:3102, concordanceIA:91,
    rangCommunaute:"#4/38", casPartages:"218 cas publiés", statut:"Actif",
    creeLE:formatFull(sub(16*24*3600*1000)), valideLE:formatFull(sub(14*24*3600*1000)),
    dateDemande:sub(16*24*3600*1000), dateValidation:sub(14*24*3600*1000),
    validePar:"Super Admin",
    documents:[
      {label:"Diplôme de spécialisation en pneumologie", status:"verified"},
      {label:"Diplôme de docteur en médecine",           status:"verified"},
      {label:"Inscription à l'ordre des médecins",       status:"verified"},
      {label:"Autorisation d'exercice",                  status:"verified"},
      {label:"Carte professionnelle de médecin",         status:"verified"},
      {label:"Carte nationale d'identité (CNI)",         status:"verified"},
    ],
    activiteRecente:[
      {texte:"Consultation #145 enregistrée",      quand:"Hier"},
      {texte:"Cas #218 partagé sur la communauté", quand:"Il y a 3j"},
    ],
  },
];

const DOC_CFG = {
  verified: { label:"Vérifié",    cls:"bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-700/40" },
  pending:  { label:"En attente", cls:"bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/40" },
  missing:  { label:"Manquant",   cls:"bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700/40" },
};

const RAISONS = ["— Choisir une raison —","Signalement d'un confrère","Comportement non conforme","Vérification d'identité requise","Incohérence dans les documents","Inactivité prolongée","Autre"];

// ── Modal shell générique ─────────────────────────────────────────────────────
function Modal({ onClose, title, sub: subtitle, wide, children, footer, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden
        ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
          <div>
            <p className={`text-[13px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{title}</p>
            {subtitle && <p className={`text-[10px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${dark ? "text-[#484f58] hover:bg-[#21262d]" : "text-gray-400 hover:bg-gray-100"}`}>
            <X size={13} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className={`shrink-0 flex gap-2 px-5 py-4 border-t ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Modal photo CNI ───────────────────────────────────────────────────────────
function ModalePhoto({ doc: m, onClose, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={m.name} sub="Photo d'identité (CNI)"
      footer={
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
          Fermer
        </button>
      }>
      <div className="flex flex-col items-center gap-4 py-4">
        <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark ? "border-[#21262d] bg-[#0d1117] text-[#484f58]" : "border-gray-200 bg-gray-50 text-gray-300"}`}>
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="text-[10px] text-center px-2">Photo soumise à l'adhésion</span>
        </div>
        <div className="text-center">
          <p className={`text-[12px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{m.name}</p>
          <p className={`text-[10px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{m.specialite} · CNOM {m.cnom}</p>
        </div>
      </div>
    </Modal>
  );
}

// ── Modal dossier ─────────────────────────────────────────────────────────────
function ModaleDossier({ doc: m, onClose, dark }) {
  function handleVoir(d) {
    if (d.url) window.open(d.url, "_blank");
    else alert("Document disponible après connexion backend.");
  }
  function handleDl(d) {
    if (d.url) {
      const a = document.createElement("a");
      a.href = d.url; a.download = d.label; a.click();
    } else {
      alert("Téléchargement disponible après connexion backend.");
    }
  }

  return (
    <Modal dark={dark} onClose={onClose} title="Dossier de validation" sub={`${m.name} · validé le ${formatValidation(m.dateValidation)}`} wide
      footer={
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
          Fermer
        </button>
      }>
      <div className="flex flex-col gap-3">

        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${dark ? "bg-teal-900/20 border-teal-700/40 text-teal-300" : "bg-teal-50 border-teal-200 text-teal-700"}`}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <p className="text-[11px] font-medium">
            Dossier complet — validé par <strong>{m.validePar}</strong> le {formatFull(m.dateValidation)}
          </p>
        </div>

        <div className={`rounded-xl border overflow-hidden ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
          {[
            {l:"Médecin",         v:m.name},
            {l:"Spécialité",      v:m.specialite},
            {l:"CNOM",            v:m.cnom},
            {l:"Établissement",   v:m.hopital},
            {l:"Date demande",    v:formatFull(m.dateDemande)},
            {l:"Date validation", v:formatFull(m.dateValidation), teal:true},
          ].map(({l,v,teal},i) => (
            <div key={i} className={`flex items-center justify-between px-4 py-2.5 border-b last:border-0 ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
              <span className={`text-[11px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{l}</span>
              <span className={`text-[11px] font-medium ${teal ? "text-[#0f766e]" : dark ? "text-[#8b949e]" : "text-gray-700"}`}>{v}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${dark ? "text-[#484f58]" : "text-gray-400"}`}>
            Pièces justificatives
          </p>
          <span className="text-[10px] font-bold text-teal-600">{m.documents.length}/6 vérifiées</span>
        </div>

        <div className={`rounded-xl border overflow-hidden ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
          {m.documents.map((d, i) => {
            const cfg = DOC_CFG[d.status] || DOC_CFG.missing;
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 border-b last:border-0 ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
                <span className={`text-[10px] font-bold w-5 shrink-0 ${dark ? "text-[#484f58]" : "text-gray-300"}`}>{i+1}</span>
                <span className={`text-[11px] font-medium flex-1 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>{d.label}</span>
                <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${cfg.cls}`}>
                  {cfg.label}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleVoir(d)} title="Voir le document"
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors
                      ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d] hover:text-white" : "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Voir
                  </button>
                  <button onClick={() => handleDl(d)} title="Télécharger"
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors
                      ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d] hover:text-white" : "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Télécharger
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className={`text-[10px] text-center ${dark ? "text-[#484f58]" : "text-gray-300"}`}>
          Documents soumis par le médecin à l'inscription · Stockés de façon sécurisée
        </p>
      </div>
    </Modal>
  );
}

// ── Modal profil complet ──────────────────────────────────────────────────────
function ModaleProfil({ doc: m, onClose, onSuspendre, onSupprimer, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={`Profil — ${m.name}`} wide
      footer={
        <>
          <button onClick={onClose} className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors ${dark ? "text-[#8b949e] hover:bg-[#21262d]" : "text-gray-500 hover:bg-gray-50"}`}>Fermer</button>
          <button onClick={() => { onClose(); onSuspendre(m); }} className="px-4 py-2 rounded-xl border border-orange-300 dark:border-orange-700/50 text-orange-600 dark:text-orange-400 text-[12px] font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">Suspendre</button>
          <button onClick={() => { onClose(); onSupprimer(m); }} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold transition-colors">Supprimer</button>
        </>
      }>
      <div className="flex flex-col gap-4">
        <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-black shrink-0" style={{background:m.avatarBg}}>{m.initials}</div>
            <div>
              <p className={`text-[13px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{m.name}</p>
              <p className={`text-[11px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{m.specialite} · {m.hopital}</p>
              <div className="flex gap-1.5 mt-1">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400">{m.statut}</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">CNOM vérifié</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-[9px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>Créé le</p>
            <p className={`text-[11px] font-semibold ${dark ? "text-white" : "text-gray-700"}`}>{m.creeLE}</p>
            <p className={`text-[9px] mt-1 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>Validé le</p>
            <p className="text-[11px] font-semibold" style={{color:BRAND}}>{m.valideLE}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[{v:m.patients,l:"Patients"},{v:m.consultations.toLocaleString("fr-FR"),l:"Consultations"},{v:`${m.concordanceIA}%`,l:"Concordance IA",teal:true}].map(({v,l,teal})=>(
            <div key={l} className={`rounded-xl border p-3 text-center ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
              <p className={`text-xl font-black ${teal ? "text-[#0f766e] dark:text-teal-400" : dark ? "text-white" : "text-gray-900"}`}>{v}</p>
              <p className={`text-[10px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{l}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${dark ? "text-[#484f58]" : "text-gray-300"}`}>Informations</p>
            <div className={`rounded-xl border overflow-hidden ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
              {[{l:"CNOM",v:m.cnom,mono:true},{l:"Email",v:m.email},{l:"Téléphone",v:m.telephone},{l:"Ville",v:m.ville},{l:"Rang",v:m.rangCommunaute},{l:"Cas",v:m.casPartages}].map(({l,v,mono})=>(
                <div key={l} className={`flex items-center justify-between px-3 py-2.5 border-b last:border-0 ${dark ? "border-[#21262d]" : "border-gray-50"}`}>
                  <span className={`text-[10px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{l}</span>
                  <span className={`text-[10px] font-medium truncate max-w-[120px] ${mono ? "font-mono" : ""} ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${dark ? "text-[#484f58]" : "text-gray-300"}`}>Activité récente</p>
            <div className="flex flex-col gap-2">
              {m.activiteRecente.map((a,i)=>(
                <div key={i} className={`flex items-start justify-between gap-2 px-3 py-2.5 rounded-xl border ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
                  <p className={`text-[10px] leading-relaxed ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>{a.texte}</p>
                  <span className={`text-[9px] shrink-0 ${dark ? "text-[#484f58]" : "text-gray-300"}`}>{a.quand}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Modal suspension ──────────────────────────────────────────────────────────
function ModaleSuspension({ medecin: m, onClose, onConfirm, dark }) {
  const [raison, setRaison] = useState("");
  const [duree,  setDuree]  = useState("30 jours");
  const [msg,    setMsg]    = useState("");
  const ok  = raison && raison !== "— Choisir une raison —";
  const inp = `w-full text-[12px] px-3 py-2 rounded-xl border outline-none transition-colors ${dark ? "bg-[#0d1117] border-[#21262d] text-white" : "bg-gray-50 border-gray-200 text-gray-800"}`;
  return (
    <Modal dark={dark} onClose={onClose} title="Suspendre l'accès" sub={m.name}
      footer={
        <>
          <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Annuler</button>
          <button onClick={() => ok && onConfirm({raison,duree,msg})} disabled={!ok}
            className={`flex-1 py-2 rounded-xl text-[12px] font-bold text-white transition-colors ${ok ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-200 dark:bg-[#21262d] text-gray-400 cursor-not-allowed"}`}>
            Confirmer
          </button>
        </>
      }>
      <div className="flex flex-col gap-3">
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[11px] ${dark ? "bg-orange-900/20 border-orange-700/40 text-orange-300" : "bg-orange-50 border-orange-200 text-orange-700"}`}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <strong>{m.name}</strong> ne pourra plus se connecter.
        </div>
        <div><label className={`block text-[11px] font-bold mb-1.5 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>Raison <span className="text-red-500">*</span></label>
          <select value={raison} onChange={e=>setRaison(e.target.value)} className={inp}>{RAISONS.map(r=><option key={r}>{r}</option>)}</select></div>
        <div><label className={`block text-[11px] font-bold mb-1.5 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>Durée</label>
          <select value={duree} onChange={e=>setDuree(e.target.value)} className={inp}>{["7 jours","15 jours","30 jours","60 jours","90 jours","Indéfinie"].map(d=><option key={d}>{d}</option>)}</select></div>
        <div><label className={`block text-[11px] font-bold mb-1.5 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>Message (optionnel)</label>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3} placeholder="Message envoyé par e-mail…" className={`${inp} resize-none`}/></div>
      </div>
    </Modal>
  );
}

// ── Modal suppression ─────────────────────────────────────────────────────────
function ModaleSuppression({ medecin: m, onClose, onConfirm, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title="Supprimer le compte" sub={m.name}
      footer={
        <>
          <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Annuler</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold transition-colors">Supprimer définitivement</button>
        </>
      }>
      <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[11px] ${dark ? "bg-red-900/20 border-red-700/40 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Supprimer définitivement le compte de <strong className="mx-1">{m.name}</strong> ? Action irréversible.
      </div>
    </Modal>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function ValideesCeMois() {
  const { dark } = useOutletContext() || {};

  const [rows,       setRows]       = useState(MOCK);
  const [loading,    setLoading]    = useState(true);
  const [moisSelec,  setMoisSelec]  = useState(new Date().getMonth() + 1);
  const [anneeSelec, setAnneeSelec] = useState(new Date().getFullYear());
  const [page,       setPage]       = useState(1);
  const [perPage,    setPerPage]    = useState(10);
  const [modalePhoto,   setModalePhoto]   = useState(null);
  const [modaleDossier, setModaleDossier] = useState(null);
  const [modaleProfil,  setModaleProfil]  = useState(null);
  const [modaleSusp,    setModaleSusp]    = useState(null);
  const [modaleSuppr,   setModaleSuppr]   = useState(null);
  const [toast,         setToast]         = useState(null);

  // ✨ État pour le menu déroulant (3 points)
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    setLoading(true);
    getMedecinsValides(moisSelec, anneeSelec)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRows(data.map(m => ({
            id:              m.id,
            initials:        `${(m.prenom?.[0]||"").toUpperCase()}${(m.nom?.[0]||"").toUpperCase()}`,
            name:            `${m.civilite||"Dr."} ${m.prenom} ${m.nom}`,
            specialite:      m.specialite || "Pneumologue",
            hopital:         m.etablissement || "—",
            ville:           "—",
            email:           m.email,
            telephone:       m.telephone || "—",
            cnom:            m.numero_rpps || "—",
            avatarBg:        ["#1D9E75","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"][Math.abs(m.id?.charCodeAt(0)||0) % 6],
            patients:        0,
            consultations:   0,
            concordanceIA:   0,
            statut:          "Actif",
            rangCommunaute:  "—",
            casPartages:     "—",
            creeLE:          m.created_at ? new Date(m.created_at).toLocaleString("fr-FR") : "—",
            valideLE:        m.valide_le  ? new Date(m.valide_le).toLocaleString("fr-FR")  : "—",
            dateDemande:     m.created_at ? new Date(m.created_at) : new Date(),
            dateValidation:  m.valide_le  ? new Date(m.valide_le)  : new Date(),
            validePar:       m.valide_par || "Administrateur",
            documents:       (m.documents || []).map(d => ({ label: d.label, url: d.url, status: "verified" })),
            activiteRecente: [],
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [moisSelec, anneeSelec]);

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const paginated  = rows.slice((page-1)*perPage, page*perPage);
  const from = rows.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, rows.length);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ✨ Fermer le menu déroulant au clic extérieur
  useEffect(() => {
    if (openMenuId === null) return;
    const handleClickOutside = () => setOpenMenuId(null);
    const timeout = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  function handleSuspension({ raison, duree }) {
    setToast({ msg: `${modaleSusp.name} suspendu — ${duree}`, type: "warn" });
    setModaleSusp(null);
  }
  function handleSuppression() {
    setToast({ msg: `Compte de ${modaleSuppr.name} supprimé`, type: "error" });
    setModaleSuppr(null);
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(rows.map((r, i) => ({
      "#": i+1, Nom: r.name, CNOM: r.cnom, Spécialité: r.specialite,
      Établissement: r.hopital, Ville: r.ville,
      "Date demande": formatFull(r.dateDemande),
      "Date validation": formatFull(r.dateValidation),
      "Validé par": r.validePar,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Validées");
    XLSX.writeFile(wb, `validees_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const th = `px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-b ${dark ? "text-[#484f58] border-[#21262d] bg-[#0d1117]/50" : "text-gray-400 border-gray-100 bg-gray-50"}`;
  const td = `px-4 py-3 border-b ${dark ? "border-[#21262d]" : "border-gray-50"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
            Inscriptions validées — {MOIS_LONG[moisSelec-1].charAt(0).toUpperCase() + MOIS_LONG[moisSelec-1].slice(1)} {anneeSelec}
          </h1>
          <p className={`text-[12px] mt-1 ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>
            {rows.length} compte{rows.length > 1 ? "s" : ""} médecin{rows.length > 1 ? "s" : ""} activé{rows.length > 1 ? "s" : ""} ce mois
          </p>
        </div>
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e]"
          onMouseEnter={e => { e.currentTarget.style.background = BRAND; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = BRAND; }}
          onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; }}>
          <Download size={13} /> Export Excel
        </button>
      </div>

      {/* Filtres mois/année */}
      <div style={{ marginTop: 8, marginBottom: 4, display:"flex", alignItems:"center", gap:10 }}>
        <span className={`text-[11px] font-semibold ${dark?"text-[#484f58]":"text-gray-400"}`}>
          Période :
        </span>
        <select
          value={moisSelec}
          onChange={e => { setMoisSelec(Number(e.target.value)); setPage(1); }}
          className={`text-[12px] px-3 py-2 rounded-xl border outline-none cursor-pointer font-semibold ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
          {MOIS_LONG.map((m, i) => (
            <option key={i} value={i+1}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={anneeSelec}
          onChange={e => { setAnneeSelec(Number(e.target.value)); setPage(1); }}
          className={`text-[12px] px-3 py-2 rounded-xl border outline-none cursor-pointer font-semibold ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
          {Array.from({length: 10}, (_, i) => 2026 + i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th className={th}>Médecin</th>
                <th className={th}>CNOM</th>
                <th className={th}>Établissement</th>
                <th className={th}>Ville</th>
                <th className={th}>Date demande</th>
                <th className={th}>Date validation</th>
                <th className={th}>Validé par</th>
                <th className={`${th} text-center`} style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className={`text-center py-14 text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>Chargement…</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={8} className={`text-center py-14 text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>Aucune validation ce mois</td></tr>
              ) : paginated.map(doc => {
                const isMenuOpen = openMenuId === doc.id;
                return (
                  <tr key={doc.id} className={`transition-colors ${dark ? "hover:bg-[#0d1117]/60" : "hover:bg-gray-50/80"}`}>
                    <td className={td}>
                      <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setModalePhoto(doc)}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 group-hover:opacity-75 transition-opacity"
                          style={{ background: doc.avatarBg }}>
                          {doc.initials}
                        </div>
                        <div>
                          <p className={`text-[12px] font-bold group-hover:underline underline-offset-2 ${dark ? "text-white" : "text-gray-800"}`}>{doc.name}</p>
                          <p className={`text-[10px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{doc.specialite}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${td} text-[11px] font-mono ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{doc.cnom}</td>
                    <td className={`${td} text-[11px] ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>{doc.hopital}</td>
                    <td className={`${td} text-[11px] ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>{doc.ville}</td>
                    <td className={`${td} text-[11px] ${dark ? "text-[#484f58]" : "text-gray-400"} whitespace-nowrap`}>{formatCourt(doc.dateDemande)}</td>
                    <td className={`${td} text-[11px] font-semibold whitespace-nowrap`} style={{ color: BRAND }}>{formatValidation(doc.dateValidation)}</td>
                    <td className={`${td} text-[11px] ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>{doc.validePar}</td>

                    {/* ✨ Actions — menu déroulant 3 points */}
                    <td className={td}>
                      <div className="relative flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(isMenuOpen ? null : doc.id);
                          }}
                          title="Actions"
                          className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all
                            ${isMenuOpen
                              ? (dark?"bg-[#21262d] border-[#30363d] text-white shadow-lg":"bg-gray-100 border-gray-300 text-gray-800 shadow-lg")
                              : (dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d] hover:text-white":"border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800")}`}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute right-0 top-full mt-1.5 z-30 min-w-[180px] rounded-xl border shadow-xl overflow-hidden
                              ${dark?"bg-[#161b22] border-[#30363d]":"bg-white border-gray-200"}`}
                            style={{ transformOrigin: "top right" }}
                          >
                            {/* Voir le dossier */}
                            <button
                              onClick={() => {
                                setModaleDossier(doc);
                                setOpenMenuId(null);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors
                                ${dark?"text-[#c9d1d9] hover:bg-[#21262d]":"text-gray-700 hover:bg-gray-50"}`}
                            >
                              <FileText size={14} className="shrink-0" style={{ color: BRAND }} />
                              Voir le dossier
                            </button>

                            {/* Voir le profil */}
                            <button
                              onClick={() => {
                                setModaleProfil(doc);
                                setOpenMenuId(null);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors
                                ${dark?"text-[#c9d1d9] hover:bg-[#21262d]":"text-gray-700 hover:bg-gray-50"}`}
                            >
                              <User size={14} className="shrink-0" style={{ color: "#6366f1" }} />
                              Voir le profil
                            </button>

                            <div className={`border-t ${dark?"border-[#21262d]":"border-gray-100"}`} />

                            {/* Suspendre */}
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setModaleSusp(doc);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors
                                ${dark?"text-orange-400 hover:bg-orange-900/20":"text-orange-700 hover:bg-orange-50"}`}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0">
                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                              </svg>
                              Suspendre
                            </button>

                            {/* Supprimer */}
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setModaleSuppr(doc);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors
                                ${dark?"text-red-400 hover:bg-red-900/20":"text-red-700 hover:bg-red-50"}`}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                              </svg>
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t text-[11px] ${dark?"border-[#21262d] text-[#484f58]":"border-gray-50 text-gray-400"}`}>
          <span>Affichage {from} à {to} sur {rows.length} inscription{rows.length>1?"s":""}</span>
          <div className="flex items-center gap-2">
            <span>Lignes :</span>
            <select value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}}
              className={`text-[11px] px-2 py-1 rounded-lg border outline-none cursor-pointer ${dark?"bg-[#0d1117] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
              {[5,10,20,50].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={()=>setPage(1)} disabled={page===1} className={`w-8 h-8 flex items-center justify-center rounded-lg border text-[11px] transition-colors ${page===1?dark?"border-[#21262d] text-[#484f58] cursor-not-allowed":"border-gray-100 text-gray-300 cursor-not-allowed":dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-600 hover:bg-gray-100"}`}>«</button>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className={`w-8 h-8 flex items-center justify-center rounded-lg border text-[11px] transition-colors ${page===1?dark?"border-[#21262d] text-[#484f58] cursor-not-allowed":"border-gray-100 text-gray-300 cursor-not-allowed":dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-600 hover:bg-gray-100"}`}>‹</button>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className={`w-8 h-8 flex items-center justify-center rounded-lg border text-[11px] transition-colors ${page===totalPages?dark?"border-[#21262d] text-[#484f58] cursor-not-allowed":"border-gray-100 text-gray-300 cursor-not-allowed":dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-600 hover:bg-gray-100"}`}>›</button>
            <button onClick={()=>setPage(totalPages)} disabled={page===totalPages} className={`w-8 h-8 flex items-center justify-center rounded-lg border text-[11px] transition-colors ${page===totalPages?dark?"border-[#21262d] text-[#484f58] cursor-not-allowed":"border-gray-100 text-gray-300 cursor-not-allowed":dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-600 hover:bg-gray-100"}`}>»</button>
          </div>
        </div>
      </div>

      {modalePhoto   && <ModalePhoto      doc={modalePhoto}    dark={dark} onClose={() => setModalePhoto(null)} />}
      {modaleDossier && <ModaleDossier    doc={modaleDossier}  dark={dark} onClose={() => setModaleDossier(null)} />}
      {modaleProfil  && <ModaleProfil     doc={modaleProfil}   dark={dark} onClose={() => setModaleProfil(null)} onSuspendre={m => setModaleSusp(m)} onSupprimer={m => setModaleSuppr(m)} />}
      {modaleSusp    && <ModaleSuspension medecin={modaleSusp} dark={dark} onClose={() => setModaleSusp(null)}   onConfirm={handleSuspension} />}
      {modaleSuppr   && <ModaleSuppression medecin={modaleSuppr} dark={dark} onClose={() => setModaleSuppr(null)} onConfirm={handleSuppression} />}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white ${toast.type === "success" ? "bg-teal-600" : toast.type === "warn" ? "bg-orange-500" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}