import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminTheme } from "../context/useAdminTheme";
import * as XLSX from "xlsx";
import { Download, X, FileText, User, MoreVertical, XCircle } from "lucide-react";
import { getMedecinsValides } from "../api/adminapi";
import { brand, getSurface, getText } from "../theme";
import {
  TableCard, TableContainer, Th, Tr, Td, EmptyCell, PersonCell,
  MutedText, SubtleText, StatusText, PaginationBar, PaginationSelect, PaginationButton,
} from "../components/ui/Table";

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



const RAISONS = ["— Choisir une raison —","Signalement d'un confrère","Comportement non conforme","Vérification d'identité requise","Incohérence dans les documents","Inactivité prolongée","Autre"];

function Modal({ onClose, title, sub: subtitle, wide, children, footer, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden
        ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
          <div>
            <p className={`text-[15px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{title}</p>
            {subtitle && <p className={`text-[14px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{subtitle}</p>}
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

function ModalePhoto({ doc: m, onClose, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={m.name} sub="Photo d'identité (CNI)" wide
      footer={
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
          Fermer
        </button>
      }>
      <div className="flex flex-col items-center gap-4">
        {m.photo_url
          ? <img src={m.photo_url} alt={m.name} className="w-full max-h-[65vh] rounded-xl object-contain border-2 border-gray-200 shadow-md" />
          : (
            <div className={`w-full h-72 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark ? "border-[#21262d] bg-[#0d1117] text-[#484f58]" : "border-gray-200 bg-gray-50 text-gray-300"}`}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-[14px] text-center px-2">Aucune photo disponible</span>
            </div>
          )
        }
        <div className="text-center">
          <p className={`text-[14px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{m.name}</p>
          <p className={`text-[14px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{m.specialite} · CNOM {m.cnom}</p>
        </div>
      </div>
    </Modal>
  );
}

function isPdf(url, mime) {
  if (mime) return mime.toLowerCase().includes("pdf");
  if (!url) return false;
  return url.toLowerCase().split("?")[0].endsWith(".pdf");
}

function isImage(url, mime) {
  if (mime) return mime.toLowerCase().startsWith("image/");
  if (!url) return false;
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url.toLowerCase().split("?")[0]);
}

function isOfficeDoc(url, mime) {
  if (mime) return /word|excel|spreadsheet|presentationml|officedocument/i.test(mime);
  if (!url) return false;
  return /\.(docx?|xlsx?|pptx?)$/i.test(url.toLowerCase().split("?")[0]);
}

function ModaleApercu({ doc: d, onClose, dark }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  const fileUrl = d.url || null;
  const pdf     = isPdf(fileUrl, d.mime);
  const image   = isImage(fileUrl, d.mime);
  const office  = isOfficeDoc(fileUrl, d.mime);
  const officeViewerUrl = office && fileUrl
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
    : null;

  function handleDownload() {
    if (!fileUrl) return;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = d.label;
    a.click();
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/80"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ background: surface.card, borderBottom: `1px solid ${surface.border}` }}>
        <div>
          <p className="text-[15px] font-bold" style={{ color: txt.primary }}>{d.label}</p>
          <p className="text-[14px] mt-0.5" style={{ color: txt.subtle }}>Aperçu du document</p>
        </div>
        <div className="flex items-center gap-2">
          {fileUrl && (
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[14px] font-bold rounded-lg border transition-colors"
              style={{ borderColor: surface.border, color: txt.muted }}
              onMouseEnter={e => { e.currentTarget.style.background = surface.bg; }}
              onMouseLeave={e => { e.currentTarget.style.background = ""; }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Télécharger
            </button>
          )}
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: txt.subtle }}
            onMouseEnter={e => { e.currentTarget.style.background = surface.bg; }}
            onMouseLeave={e => { e.currentTarget.style.background = ""; }}>
            <XCircle size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {!fileUrl ? (
          <div className="flex flex-col items-center gap-3 text-center px-6 py-12 rounded-xl border-2 border-dashed"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="text-[15px]">Document non disponible — sera accessible après connexion du backend.</p>
          </div>
        ) : pdf ? (
          <iframe src={fileUrl} title={d.label} className="w-full h-full rounded-lg" style={{ background: "#fff", border: "none" }} />
        ) : image ? (
          <img src={fileUrl} alt={d.label} className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" />
        ) : office ? (
          <iframe src={officeViewerUrl} title={d.label} className="w-full h-full rounded-lg" style={{ background: "#fff", border: "none" }} />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center px-6 py-12 rounded-xl border-2 border-dashed"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="text-[15px]">Aperçu indisponible pour ce type de fichier — téléchargez-le pour le consulter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ModaleDossier({ doc: m, onClose, dark }) {
  const [apercu, setApercu] = useState(null);

  function handleVoir(d) {
    setApercu(d);
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
    <>
    <Modal dark={dark} onClose={onClose} title="Dossier de validation" sub={`${m.name} · validé le ${formatValidation(m.dateValidation)}`} wide
      footer={
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
          Fermer
        </button>
      }>
      <div className="flex flex-col gap-3">

        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${dark ? "bg-teal-900/20 border-teal-700/40 text-teal-300" : "bg-teal-50 border-teal-200 text-teal-700"}`}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <p className="text-[15px] font-medium">
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
              <span className={`text-[15px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{l}</span>
              <span className={`text-[15px] font-medium ${teal ? "text-teal-700" : dark ? "text-[#8b949e]" : "text-gray-700"}`}>{v}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-[14px] font-bold uppercase tracking-wider ${dark ? "text-[#484f58]" : "text-gray-400"}`}>
            Pièces justificatives
          </p>
        </div>

        <div className={`rounded-xl border overflow-hidden ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
          {m.documents.map((d, i) => {
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 border-b last:border-0 ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
                <span className={`text-[14px] font-bold w-5 shrink-0 ${dark ? "text-[#484f58]" : "text-gray-300"}`}>{i+1}</span>
                <span className={`text-[15px] font-medium flex-1 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>{d.label}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleVoir(d)} title="Voir le document"
                    className={`flex items-center gap-1 px-2 py-1 text-[14px] font-bold rounded-lg border transition-colors
                      ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d] hover:text-white" : "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Voir
                  </button>
                  <button onClick={() => handleDl(d)} title="Télécharger"
                    className={`flex items-center gap-1 px-2 py-1 text-[14px] font-bold rounded-lg border transition-colors
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

        <p className={`text-[14px] text-center ${dark ? "text-[#484f58]" : "text-gray-300"}`}>
          Documents soumis par le médecin à l'inscription · Stockés de façon sécurisée
        </p>
      </div>
    </Modal>
    {apercu && <ModaleApercu doc={apercu} dark={dark} onClose={() => setApercu(null)} />}
    </>
  );
}

function ModaleProfil({ doc: m, onClose, onSuspendre, onSupprimer, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={`Profil — ${m.name}`} wide
      footer={
        <>
          <button onClick={onClose} className={`px-4 py-2 rounded-xl text-[14px] font-semibold transition-colors ${dark ? "text-[#8b949e] hover:bg-[#21262d]" : "text-gray-500 hover:bg-gray-50"}`}>Fermer</button>
          <button onClick={() => { onClose(); onSuspendre(m); }} className="px-4 py-2 rounded-xl border border-orange-300 dark:border-orange-700/50 text-orange-600 dark:text-orange-400 text-[14px] font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">Suspendre</button>
          <button onClick={() => { onClose(); onSupprimer(m); }} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold transition-colors">Supprimer</button>
        </>
      }>
      <div className="flex flex-col gap-4">
        <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-black shrink-0" style={{background:m.avatarBg}}>{m.initials}</div>
            <div>
              <p className={`text-[15px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{m.name}</p>
              <p className={`text-[15px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{m.specialite} · {m.hopital}</p>
              <div className="flex gap-1.5 mt-1">
                <span className="text-[15px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400">{m.statut}</span>
                <span className="text-[15px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">CNOM vérifié</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-[15px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>Créé le</p>
            <p className={`text-[15px] font-semibold ${dark ? "text-white" : "text-gray-700"}`}>{m.creeLE}</p>
            <p className={`text-[15px] mt-1 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>Validé le</p>
            <p className="text-[15px] font-semibold" style={{color:brand.DEFAULT}}>{m.valideLE}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[{v:m.patients,l:"Patients"},{v:m.consultations.toLocaleString("fr-FR"),l:"Consultations"},{v:`${m.concordanceIA}%`,l:"Concordance IA",teal:true}].map(({v,l,teal})=>(
            <div key={l} className={`rounded-xl border p-3 text-center ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
              <p className={`text-xl font-black ${teal ? "text-teal-700 dark:text-teal-400" : dark ? "text-white" : "text-gray-900"}`}>{v}</p>
              <p className={`text-[14px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{l}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={`text-[14px] font-bold uppercase tracking-wider mb-2 ${dark ? "text-[#484f58]" : "text-gray-300"}`}>Informations</p>
            <div className={`rounded-xl border overflow-hidden ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
              {[{l:"CNOM",v:m.cnom,mono:true},{l:"Email",v:m.email},{l:"Téléphone",v:m.telephone},{l:"Ville",v:m.ville},{l:"Rang",v:m.rangCommunaute},{l:"Cas",v:m.casPartages}].map(({l,v,mono})=>(
                <div key={l} className={`flex items-center justify-between px-3 py-2.5 border-b last:border-0 ${dark ? "border-[#21262d]" : "border-gray-50"}`}>
                  <span className={`text-[14px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{l}</span>
                  <span className={`text-[14px] font-medium truncate max-w-[120px] ${mono ? "font-mono" : ""} ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className={`text-[14px] font-bold uppercase tracking-wider mb-2 ${dark ? "text-[#484f58]" : "text-gray-300"}`}>Activité récente</p>
            <div className="flex flex-col gap-2">
              {m.activiteRecente.map((a,i)=>(
                <div key={i} className={`flex items-start justify-between gap-2 px-3 py-2.5 rounded-xl border ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
                  <p className={`text-[14px] leading-relaxed ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>{a.texte}</p>
                  <span className={`text-[15px] shrink-0 ${dark ? "text-[#484f58]" : "text-gray-300"}`}>{a.quand}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ModaleSuspension({ medecin: m, onClose, onConfirm, dark }) {
  const [raison, setRaison] = useState("");
  const [duree,  setDuree]  = useState("30 jours");
  const [msg,    setMsg]    = useState("");
  const ok  = raison && raison !== "— Choisir une raison —";
  const inp = `w-full text-[14px] px-3 py-2 rounded-xl border outline-none transition-colors ${dark ? "bg-[#0d1117] border-[#21262d] text-white" : "bg-gray-50 border-gray-200 text-gray-800"}`;
  return (
    <Modal dark={dark} onClose={onClose} title="Suspendre l'accès" sub={m.name}
      footer={
        <>
          <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Annuler</button>
          <button onClick={() => ok && onConfirm({raison,duree,msg})} disabled={!ok}
            className={`flex-1 py-2 rounded-xl text-[14px] font-bold text-white transition-colors ${ok ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-200 dark:bg-[#21262d] text-gray-400 cursor-not-allowed"}`}>
            Confirmer
          </button>
        </>
      }>
      <div className="flex flex-col gap-3">
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[15px] ${dark ? "bg-orange-900/20 border-orange-700/40 text-orange-300" : "bg-orange-50 border-orange-200 text-orange-700"}`}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span><strong>{m.name}</strong> ne pourra plus se connecter.</span>
        </div>
        <div><label className={`block text-[15px] font-bold mb-1.5 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>Raison <span className="text-red-500">*</span></label>
          <select value={raison} onChange={e=>setRaison(e.target.value)} className={inp}>{RAISONS.map(r=><option key={r}>{r}</option>)}</select></div>
        <div><label className={`block text-[15px] font-bold mb-1.5 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>Durée</label>
          <select value={duree} onChange={e=>setDuree(e.target.value)} className={inp}>{["7 jours","15 jours","30 jours","60 jours","90 jours","Indéfinie"].map(d=><option key={d}>{d}</option>)}</select></div>
        <div><label className={`block text-[15px] font-bold mb-1.5 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>Message (optionnel)</label>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3} placeholder="Message envoyé par e-mail…" className={`${inp} resize-none`}/></div>
      </div>
    </Modal>
  );
}

function ModaleSuppression({ medecin: m, onClose, onConfirm, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title="Supprimer le compte" sub={m.name}
      footer={
        <>
          <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Annuler</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold transition-colors">Supprimer définitivement</button>
        </>
      }>
      <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[15px] ${dark ? "bg-red-900/20 border-red-700/40 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Supprimer définitivement le compte de <strong>{m.name}</strong> ? Action irréversible.</span>
      </div>
    </Modal>
  );
}

export default function ValideesCeMois() {
  const { dark } = useOutletContext() || {};
  const { searchQuery } = useAdminTheme();

  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [erreur,     setErreur]     = useState(null);
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

  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setErreur(null);
    getMedecinsValides(moisSelec, anneeSelec)
      .then(data => {
        const liste = Array.isArray(data) ? data : (data?.items ?? data?.medecins ?? []);
        setRows(liste.map(m => ({
          id:              m.id,
          initials:        `${(m.prenom?.[0]||"").toUpperCase()}${(m.nom?.[0]||"").toUpperCase()}`,
          name:            `${m.civilite||"Dr."} ${m.prenom} ${m.nom}`,
          specialite:      m.specialite || "Pneumologue",
          hopital:         m.etablissement || "—",
          ville:           m.ville || m.adresse || "—",
          email:           m.email,
          telephone:       m.telephone || "—",
          cnom:            m.numero_rpps || "—",
          photo_url:       m.photo_url || null,
          avatarBg:        ["#1D9E75","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"][Math.abs(m.id?.charCodeAt(0)||0) % 6],
          patients:        m.nb_patients     ?? 0,
          consultations:   m.nb_consultations ?? 0,
          concordanceIA:   m.concordance_ia  ?? 0,
          statut:          "Actif",
          rangCommunaute:  m.rang_communaute  || "—",
          casPartages:     m.cas_partages     || "—",
          creeLE:          m.created_at ? new Date(m.created_at).toLocaleString("fr-FR") : "—",
          valideLE:        m.valide_le  ? new Date(m.valide_le).toLocaleString("fr-FR")  : "—",
          dateDemande:     m.created_at ? new Date(m.created_at) : new Date(),
          dateValidation:  m.valide_le  ? new Date(m.valide_le)  : new Date(),
          validePar:       m.valide_par || "Administrateur",
          documents:       (m.documents || []).map(d => ({ label: d.label, url: d.url })),
          activiteRecente: m.activite_recente || [],
        })));
      })
      .catch(err => {
        console.error("[ValidesCeMois] erreur API:", err);
        setErreur(err.message || "Impossible de charger les données.");
      })
      .finally(() => setLoading(false));
  }, [moisSelec, anneeSelec]);

  const q      = searchQuery.toLowerCase().trim();
  const liste  = rows.filter(r => !q || [r.name, r.cnom, r.hopital, r.ville, r.email]
    .some(v => v && v.toLowerCase().includes(q)));
  const totalPages = Math.max(1, Math.ceil(liste.length / perPage));
  const paginated  = liste.slice((page-1)*perPage, page*perPage);
  const from = liste.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, liste.length);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

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

  const surface = getSurface(dark);
  const txt     = getText(dark);

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
            Inscriptions validées — {MOIS_LONG[moisSelec-1].charAt(0).toUpperCase() + MOIS_LONG[moisSelec-1].slice(1)} {anneeSelec}
          </h1>
          <p className={`text-[14px] mt-1 ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>
            {rows.length} compte{rows.length > 1 ? "s" : ""} médecin{rows.length > 1 ? "s" : ""} activé{rows.length > 1 ? "s" : ""} ce mois
          </p>
        </div>
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[14px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e]"
          onMouseEnter={e => { e.currentTarget.style.background = brand.DEFAULT; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = brand.DEFAULT; }}
          onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; }}>
          <Download size={13} /> Export Excel
        </button>
      </div>

      <TableCard dark={dark}>
        <div className="flex items-center gap-3 flex-wrap px-5 py-3 border-b" style={{ borderColor: surface.border }}>
          <span className="text-[14px] font-semibold" style={{ color: txt.subtle }}>Période :</span>
          <select
            value={moisSelec}
            onChange={e => { setMoisSelec(Number(e.target.value)); setPage(1); }}
            className={`text-[14px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-semibold ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
            {MOIS_LONG.map((m, i) => (
              <option key={i} value={i+1}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={anneeSelec}
            onChange={e => { setAnneeSelec(Number(e.target.value)); setPage(1); }}
            className={`text-[14px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-semibold ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
            {Array.from({length: 10}, (_, i) => 2026 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <TableContainer dark={dark}>
          <thead>
            <tr>
              <Th dark={dark}>Médecin</Th>
              <Th dark={dark}>CNOM</Th>
              <Th dark={dark}>Établissement</Th>
              <Th dark={dark}>Ville</Th>
              <Th dark={dark}>Date demande</Th>
              <Th dark={dark}>Date validation</Th>
              <Th dark={dark}>Validé par</Th>
              <Th dark={dark} center style={{ width: 80 }}>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyCell dark={dark} colSpan={8}>Chargement…</EmptyCell>
            ) : erreur ? (
              <EmptyCell dark={dark} colSpan={8}>
                <span className="text-red-500">{erreur}</span>
              </EmptyCell>
            ) : paginated.length === 0 ? (
              <EmptyCell dark={dark} colSpan={8}>Aucune validation ce mois</EmptyCell>
            ) : paginated.map(doc => {
              const isMenuOpen = openMenuId === doc.id;
              return (
                <Tr key={doc.id} dark={dark}>
                  <Td dark={dark}>
                    <PersonCell dark={dark} avatarColor={doc.avatarBg} initials={doc.initials}
                      name={doc.name} subtitle={doc.specialite} onClick={() => setModalePhoto(doc)} photoUrl={doc.photo_url} />
                  </Td>
                  <Td dark={dark}><MutedText dark={dark} mono>{doc.cnom}</MutedText></Td>
                  <Td dark={dark}><MutedText dark={dark}>{doc.hopital}</MutedText></Td>
                  <Td dark={dark}><MutedText dark={dark}>{doc.ville}</MutedText></Td>
                  <Td dark={dark}><SubtleText dark={dark}>{formatCourt(doc.dateDemande)}</SubtleText></Td>
                  <Td dark={dark}><StatusText color="success">{formatValidation(doc.dateValidation)}</StatusText></Td>
                  <Td dark={dark}><MutedText dark={dark}>{doc.validePar}</MutedText></Td>

                  <Td dark={dark} center>
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
                          <button
                            onClick={() => {
                              setModaleDossier(doc);
                              setOpenMenuId(null);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium transition-colors
                              ${dark?"text-[#c9d1d9] hover:bg-[#21262d]":"text-gray-700 hover:bg-gray-50"}`}
                          >
                            <FileText size={14} className="shrink-0" style={{ color: brand.DEFAULT }} />
                            Voir le dossier
                          </button>

                          <button
                            onClick={() => {
                              setModaleProfil(doc);
                              setOpenMenuId(null);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium transition-colors
                              ${dark?"text-[#c9d1d9] hover:bg-[#21262d]":"text-gray-700 hover:bg-gray-50"}`}
                          >
                            <User size={14} className="shrink-0" style={{ color: "#6366f1" }} />
                            Voir le profil
                          </button>

                          <div className={`border-t ${dark?"border-[#21262d]":"border-gray-100"}`} />

                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              setModaleSusp(doc);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium transition-colors
                              ${dark?"text-orange-400 hover:bg-orange-900/20":"text-orange-700 hover:bg-orange-50"}`}
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0">
                              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            Suspendre
                          </button>

                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              setModaleSuppr(doc);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium transition-colors
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
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </TableContainer>

      </TableCard>

      <PaginationBar dark={dark}>
        <span>Affichage {from} à {to} sur {liste.length} inscription{liste.length>1?"s":""}</span>
        <div className="flex items-center gap-2">
          <span>Lignes :</span>
          <PaginationSelect dark={dark} value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}} />
        </div>
        <div className="flex items-center gap-1">
          <PaginationButton dark={dark} onClick={()=>setPage(1)} disabled={page===1}>«</PaginationButton>
          <PaginationButton dark={dark} onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>‹</PaginationButton>
          <PaginationButton dark={dark} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>›</PaginationButton>
          <PaginationButton dark={dark} onClick={()=>setPage(totalPages)} disabled={page===totalPages}>»</PaginationButton>
        </div>
      </PaginationBar>

      {modalePhoto   && <ModalePhoto      doc={modalePhoto}    dark={dark} onClose={() => setModalePhoto(null)} />}
      {modaleDossier && <ModaleDossier    doc={modaleDossier}  dark={dark} onClose={() => setModaleDossier(null)} />}
      {modaleProfil  && <ModaleProfil     doc={modaleProfil}   dark={dark} onClose={() => setModaleProfil(null)} onSuspendre={m => setModaleSusp(m)} onSupprimer={m => setModaleSuppr(m)} />}
      {modaleSusp    && <ModaleSuspension medecin={modaleSusp} dark={dark} onClose={() => setModaleSusp(null)}   onConfirm={handleSuspension} />}
      {modaleSuppr   && <ModaleSuppression medecin={modaleSuppr} dark={dark} onClose={() => setModaleSuppr(null)} onConfirm={handleSuppression} />}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[14px] font-semibold text-white ${toast.type === "success" ? "bg-teal-600" : toast.type === "warn" ? "bg-orange-500" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}