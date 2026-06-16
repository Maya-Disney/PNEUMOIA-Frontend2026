import { useState, useEffect, useMemo, useRef } from "react";
import { getDemandes, validerMedecin, rejeterMedecin } from "../api/adminApi";
import { useOutletContext } from "react-router-dom";
import { useAdminTheme } from "../context/useAdminTheme";
import * as XLSX from "xlsx";
import { Download, Eye, CheckCircle, XCircle, FileText, MoreVertical } from "lucide-react";
import { brand, getSurface, getText } from "../theme";
import {
  TableContainer, Th, Tr, Td, EmptyCell, PersonCell,
  MutedText, SubtleText, StatusText, PaginationBar, PaginationSelect, PaginationButton,
} from "../components/ui/Table";

import { mapMedecin, elapsedStr, pad } from "../api/demandesData";

const JOURS = ["dim.","lun.","mar.","mer.","jeu.","ven.","sam."];
const MOIS  = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];

function formatFull(d) {
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DOC_CFG = {
  verified:{label:"Vérifié",    cls:"bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"},
  pending: {label:"En attente", cls:"bg-orange-100 text-orange-700 border-orange-300 font-bold"},
  missing: {label:"Manquant",   cls:"bg-red-100 text-red-700 border-red-300 font-bold"},
};

const MOTIFS = ["— Choisir un motif —","N° CNOM invalide ou introuvable","Spécialité non couverte","Documents manquants ou expirés","Informations incohérentes","Dossier incomplet","Autre"];

function docState(doc) {
  if (doc.documents.every(d => d.status==="verified")) return "ok";
  if (doc.documents.some(d => d.status==="verified")) return "partial";
  return "wait";
}


function Modal({ onClose, title, sub: subtitle, wide, children, footer, dark }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div className={`w-full ${wide?"max-w-2xl":"max-w-lg"} max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden`}
        style={{ background: surface.card, borderColor: surface.border }}>
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: surface.border }}>
          <div>
            <p className="text-[15px] font-bold" style={{ color: txt.primary }}>{title}</p>
            {subtitle && <p className="text-[14px] mt-0.5" style={{ color: txt.subtle }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: txt.subtle }}
            onMouseEnter={e=>{e.currentTarget.style.background=surface.bg;}}
            onMouseLeave={e=>{e.currentTarget.style.background="";}}>
            <XCircle size={13}/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="shrink-0 flex gap-2 px-5 py-4 border-t" style={{ borderColor: surface.border }}>{footer}</div>}
      </div>
    </div>
  );
}

function ModaleProfil({ doc: m, onClose, dark }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  return (
    <Modal dark={dark} onClose={onClose} title={m.name} sub="Photo d'identité (CNI)" wide
      footer={
        <button onClick={onClose} className="flex-1 py-2 rounded-xl text-[14px] font-semibold border transition-colors"
          style={{ borderColor: surface.border, color: txt.muted }}
          onMouseEnter={e=>{e.currentTarget.style.background=surface.bg;}}
          onMouseLeave={e=>{e.currentTarget.style.background="";}}>
          Fermer
        </button>
      }>
      <div className="flex flex-col items-center gap-4">
        {m.photo_url
          ? <img src={m.photo_url} alt={m.name}
              className="w-full max-h-[65vh] rounded-xl object-contain border-2 border-gray-200 shadow" />
          : <div className="w-full h-72 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed"
              style={{ borderColor: surface.border, background: surface.bg, color: txt.subtle }}>
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-[14px] text-center px-2">Aucune photo</span>
            </div>
        }
        <div className="text-center">
          <p className="text-[14px] font-bold" style={{ color: txt.primary }}>{m.name}</p>
          <p className="text-[14px] mt-0.5" style={{ color: txt.subtle }}>{m.specialite} · CNOM {m.cnom}</p>
        </div>
      </div>
    </Modal>
  );
}

function ModaleDossier({ doc: m, onClose, onUpdateDocs, dark }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  const [docs,    setDocs]   = useState(m.documents.map(d => ({...d, status: "pending"})));
  const [opened,  setOpened] = useState({});
  const [apercu,  setApercu] = useState(null);

  const verified = docs.filter(d => d.status==="verified").length;
  const total    = docs.length;
  const allOk    = verified === total;

  function markOpened(i) {
    setOpened(prev => ({...prev, [i]: true}));
  }

  function toggleDoc(i) {
    if (!opened[i]) return;
    setDocs(prev => {
      const next = [...prev];
      next[i] = { ...next[i], status: next[i].status === "verified" ? "pending" : "verified" };
      return next;
    });
  }

  function handleClose() {
    onUpdateDocs(m.id, docs);
    onClose();
  }

  return (
    <Modal dark={dark} onClose={handleClose} title="Dossier de candidature" sub={`${m.name} · ${m.specialite}`} wide
      footer={
        <button onClick={handleClose}
          className="flex-1 py-2 rounded-xl text-[14px] font-bold text-white transition-opacity hover:opacity-90"
          style={{background: allOk ? brand.DEFAULT : "#6b7280"}}>
          {allOk ? "✓ Dossier complet — Fermer" : `Fermer (${verified}/${total} vérifiés)`}
        </button>
      }>
      <div className="flex flex-col gap-3">

        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[15px] font-medium
          ${allOk
            ? (dark?"bg-teal-900/20 border-teal-700/40 text-teal-300":"bg-teal-50 border-teal-200 text-teal-700")
            : (dark?"bg-amber-900/20 border-amber-700/40 text-amber-300":"bg-amber-50 border-amber-200 text-amber-700")}`}>
          {allOk
            ? `✓ Tous les documents vérifiés — dossier complet`
            : `${verified}/${total} documents vérifiés — cliquez sur chaque document pour le marquer`}
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ background: surface.bg, borderColor: surface.border }}>
          {[{l:"Médecin",v:m.name},{l:"Spécialité",v:m.specialite},{l:"CNOM",v:m.cnom,mono:true},{l:"Établissement",v:m.hopital},{l:"E-mail",v:m.email},{l:"Téléphone",v:m.telephone},{l:"Soumis",v:formatFull(m.submittedAt)}].map(({l,v,mono})=>(
            <div key={l} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0" style={{ borderColor: surface.borderSoft }}>
              <span className="text-[15px]" style={{ color: txt.subtle }}>{l}</span>
              <span className={`text-[15px] font-medium ${mono?"font-mono":""}`} style={{ color: txt.secondary }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[14px] font-bold uppercase tracking-wider" style={{ color: txt.subtle }}>
            Pièces justificatives
          </p>
          <span className="text-[14px] font-bold" style={{ color: allOk ? brand.DEFAULT : "#d97706" }}>
            {verified}/{total} vérifiés
          </span>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ background: surface.bg, borderColor: surface.border }}>
          {docs.map((d, i) => {
            const isVerified = d.status === "verified";
            const cfg = DOC_CFG[d.status] || DOC_CFG.missing;
            const fileUrl = d.url || null;

            function handleView(e) {
              e.stopPropagation();
              markOpened(i);
              setApercu(d);
            }
            function handleDownload(e) {
              e.stopPropagation();
              markOpened(i);
              if (fileUrl) {
                const a = document.createElement("a");
                a.href = fileUrl;
                a.download = d.label;
                a.click();
              } else {
                alert("Téléchargement disponible après connexion du backend.");
              }
            }

            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-0" style={{ borderColor: surface.borderSoft }}>

                <button onClick={() => toggleDoc(i)}
                  title={!opened[i] ? "Ouvrez d'abord le document pour pouvoir le valider" : isVerified ? "Décocher" : "Marquer comme vérifié"}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                    ${!opened[i] ? "cursor-not-allowed opacity-35" : "cursor-pointer"}
                    ${isVerified ? "border-teal-500 bg-teal-500" : "hover:border-teal-500"}`}
                  style={!isVerified ? { borderColor: opened[i] ? txt.subtle : surface.border, background: surface.bg } : undefined}>
                  {isVerified && (
                    <svg width="11" height="11" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <span className="text-[15px] font-medium" style={{ color: txt.secondary }}>{d.label}</span>
                  {!opened[i] && !isVerified && (
                    <span className="ml-2 text-[15px]" style={{ color: txt.subtle }}>← ouvrir pour valider</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={handleView}
                    title="Voir le document"
                    className="flex items-center gap-1 px-2 py-1 text-[14px] font-bold rounded-lg border transition-colors"
                    style={{ borderColor: surface.border, color: txt.muted }}
                    onMouseEnter={e=>{e.currentTarget.style.background=surface.bg;}}
                    onMouseLeave={e=>{e.currentTarget.style.background="";}}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Voir
                  </button>
                  <button onClick={handleDownload}
                    title="Télécharger le document"
                    className="flex items-center gap-1 px-2 py-1 text-[14px] font-bold rounded-lg border transition-colors"
                    style={{ borderColor: surface.border, color: txt.muted }}
                    onMouseEnter={e=>{e.currentTarget.style.background=surface.bg;}}
                    onMouseLeave={e=>{e.currentTarget.style.background="";}}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Télécharger
                  </button>
                </div>

                <span className={`text-[15px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${cfg.cls}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[14px] text-center" style={{ color: txt.subtle }}>
          Cochez chaque document après l'avoir vérifié · Les fichiers sont fournis par le médecin à l'inscription
        </p>
      </div>

      {apercu && <ModaleApercu doc={apercu} dark={dark} onClose={()=>setApercu(null)} />}
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

function ModaleApercu({ doc: d, onClose, dark }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  const fileUrl = d.url || null;
  const pdf     = isPdf(fileUrl, d.mime);
  const image   = isImage(fileUrl, d.mime);

  function handleDownload() {
    if (!fileUrl) return;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = d.label;
    a.click();
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/80" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ background: surface.card, borderBottom: `1px solid ${surface.border}` }}>
        <div>
          <p className="text-[15px] font-bold" style={{ color: txt.primary }}>{d.label}</p>
          <p className="text-[14px] mt-0.5" style={{ color: txt.subtle }}>Aperçu du document</p>
        </div>
        <div className="flex items-center gap-2">
          {fileUrl && (
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[14px] font-bold rounded-lg border transition-colors"
              style={{ borderColor: surface.border, color: txt.muted }}
              onMouseEnter={e=>{e.currentTarget.style.background=surface.bg;}}
              onMouseLeave={e=>{e.currentTarget.style.background="";}}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Télécharger
            </button>
          )}
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: txt.subtle }}
            onMouseEnter={e=>{e.currentTarget.style.background=surface.bg;}}
            onMouseLeave={e=>{e.currentTarget.style.background="";}}>
            <XCircle size={18}/>
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

function ModaleValider({ doc: m, onClose, onConfirm, dark }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  return (
    <Modal dark={dark} onClose={onClose} title="Valider la demande" sub={m.name}
      footer={<>
        <button onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold border transition-colors"
          style={{ borderColor: surface.border, color: txt.muted }}>
          Annuler
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl text-[14px] font-bold text-white hover:opacity-90 transition-opacity"
          style={{background:brand.DEFAULT}}>
          Confirmer la validation
        </button>
      </>}>
      <div className="flex flex-col gap-3">
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[15px] ${dark?"bg-teal-900/20 border-teal-700/40 text-teal-300":"bg-teal-50 border-teal-200 text-teal-700"}`}>
          <CheckCircle size={13} className="shrink-0" />
          <span>Le compte de <strong>{m.name}</strong> sera activé. Un e-mail d'activation lui sera envoyé.</span>
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ background: surface.bg, borderColor: surface.border }}>
          {[{l:"Médecin",v:m.name},{l:"CNOM",v:m.cnom},{l:"E-mail",v:m.email},{l:"Ville",v:m.ville},{l:"Soumis",v:formatFull(m.submittedAt)}].map(({l,v})=>(
            <div key={l} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0" style={{ borderColor: surface.borderSoft }}>
              <span className="text-[15px]" style={{ color: txt.subtle }}>{l}</span>
              <span className="text-[15px] font-medium" style={{ color: txt.secondary }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function ModaleRefuser({ doc: m, onClose, onConfirm, dark }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  const [motif, setMotif] = useState("");
  const [msg,   setMsg]   = useState("");
  const ok  = motif && motif !== "— Choisir un motif —";
  const inp = `w-full text-[14px] px-3 py-2 rounded-xl border outline-none transition-colors`;
  return (
    <Modal dark={dark} onClose={onClose} title="Refuser la demande" sub={m.name}
      footer={<>
        <button onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold border transition-colors"
          style={{ borderColor: surface.border, color: txt.muted }}>
          Annuler
        </button>
        <button onClick={()=>ok&&onConfirm({motif,msg})} disabled={!ok}
          className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold text-white transition-colors ${ok?"bg-red-600 hover:bg-red-700":"bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
          Confirmer le refus
        </button>
      </>}>
      <div className="flex flex-col gap-3">
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[15px] ${dark?"bg-red-900/20 border-red-700/40 text-red-300":"bg-red-50 border-red-200 text-red-700"}`}>
          <XCircle size={13} className="shrink-0" />
          <span>La demande de <strong>{m.name}</strong> sera refusée. Un e-mail d'information lui sera envoyé.</span>
        </div>
        <div>
          <label className="block text-[15px] font-bold mb-1.5" style={{ color: txt.muted }}>Motif du refus <span className="text-red-500">*</span></label>
          <select value={motif} onChange={e=>setMotif(e.target.value)} className={inp} style={{ background: surface.bg, borderColor: surface.border, color: txt.primary }}>
            {MOTIFS.map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[15px] font-bold mb-1.5" style={{ color: txt.muted }}>Message complémentaire (optionnel)</label>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3} placeholder="Explications supplémentaires…" className={`${inp} resize-none`} style={{ background: surface.bg, borderColor: surface.border, color: txt.primary }}/>
        </div>
      </div>
    </Modal>
  );
}

export default function NouvellesDemandes() {
  const { dark } = useOutletContext() || {};
  const { searchQuery: search } = useAdminTheme();
  const [demandes,       setDemandes]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [sortField,      setSortField]      = useState("submittedAt");
  const [sortDir,        setSortDir]        = useState("desc");
  const [page,           setPage]           = useState(1);
  const [perPage,        setPerPage]        = useState(10);
  const [clock,          setClock]          = useState(new Date());
  const [modaleProfil,   setModaleProfil]   = useState(null);
  const [modaleDossier,  setModaleDossier]  = useState(null);
  const [modaleValider,  setModaleValider]  = useState(null);
  const [modaleRefuser,  setModaleRefuser]  = useState(null);
  const [activationInfo, setActivationInfo] = useState(null);
  const [toast,          setToast]          = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => { const t = setInterval(()=>setClock(new Date()),1000); return ()=>clearInterval(t); }, []);

  useEffect(() => { if (!toast) return; const t=setTimeout(()=>setToast(null),3500); return ()=>clearTimeout(t); }, [toast]);

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

  useEffect(() => {
    setLoading(true);
    getDemandes()
      .then(data => setDemandes(Array.isArray(data) ? data.map(mapMedecin) : []))
      .catch(() => setDemandes([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = useMemo(() => demandes, [demandes]);

  const filtered = useMemo(() => {
    let items = pending.filter(d =>
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      d.cnom.toLowerCase().includes(search.toLowerCase()) ||
      d.ville.toLowerCase().includes(search.toLowerCase())
    );
    return [...items].sort((a,b) => {
      let va=a[sortField], vb=b[sortField];
      if (sortField==="name") { va=va.toLowerCase(); vb=vb.toLowerCase(); }
      if (va<vb) return sortDir==="asc"?-1:1;
      if (va>vb) return sortDir==="asc"?1:-1;
      return 0;
    });
  }, [pending, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page-1)*perPage, page*perPage);
  const from = filtered.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, filtered.length);

  function handleSort(field) {
    if (sortField===field) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortField(field); setSortDir("asc"); }
    setPage(1);
  }

  function SortIcon({ field }) {
    if (sortField!==field) return <span className="ml-1 opacity-30">↕</span>;
    return <span className="ml-1" style={{color:brand.DEFAULT}}>{sortDir==="asc"?"↑":"↓"}</span>;
  }

  async function handleAction(id, action, extra={}) {
    try {
      if (action === "valide") {
        const data = await validerMedecin(id);
        if (!data.email_envoye) {
          setActivationInfo({ email: data.email_medecin, lien: data.lien_activation });
        }
      } else if (action === "rejete") {
        const motif = extra.motif || "Dossier incomplet";
        await rejeterMedecin(id, motif);
      }
    } catch(e) {
      console.error("[handleAction]", e.message);
    }
    setDemandes(p => p.map(item => item.id === id ? { ...item, status: action } : item));
  }

  function handleUpdateDocs(id, newDocs) {
    setDemandes(p => p.map(d => d.id===id ? {...d, documents: newDocs} : d));
  }

  function handleValider() {
    handleAction(modaleValider.id, "valide");
    setToast({msg:`${modaleValider.name} validé — e-mail d'activation envoyé`, type:"success"});
    setModaleValider(null);
  }
  function handleRefuser({motif, msg}) {
    const motifFull = msg ? `${motif} : ${msg}` : motif;
    handleAction(modaleRefuser.id, "rejete", {motif:motifFull});
    setToast({msg:`Demande de ${modaleRefuser.name} refusée`, type:"error"});
    setModaleRefuser(null);
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(pending.map((d,i)=>({
      "#":i+1, Nom:d.name, CNOM:d.cnom, Spécialité:d.specialite,
      Établissement:d.hopital, Ville:d.ville, Email:d.email, Téléphone:d.telephone,
      "Statut dossier":docState(d), "Soumis le":formatFull(d.submittedAt), "En attente":elapsedStr(d.submittedAt),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nouvelles demandes");
    XLSX.writeFile(wb, `demandes_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const surface = getSurface(dark);
  const txt     = getText(dark);

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: txt.primary }}>
            Nouvelles demandes
          </h1>
          <p className="text-[14px] mt-1" style={{ color: txt.muted }}>
            {pending.length} demande{pending.length!==1?"s":""} en attente · validation manuelle obligatoire
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[14px] tabular-nums" style={{ color: txt.subtle }}>
            {JOURS[clock.getDay()]} {clock.getDate()} {MOIS[clock.getMonth()]} {clock.getFullYear()}
            &nbsp;{pad(clock.getHours())}:{pad(clock.getMinutes())}:{pad(clock.getSeconds())}
          </span>
          <button onClick={exportExcel}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[14px] font-semibold transition-all"
            style={{ borderColor: surface.border, color: txt.muted }}
            onMouseEnter={e=>{e.currentTarget.style.background=brand.DEFAULT;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=brand.DEFAULT;}}
            onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color=txt.muted;e.currentTarget.style.borderColor=surface.border;}}>
            <Download size={13}/> Export Excel
          </button>
        </div>
      </div>

      <div className="rounded-2xl border" style={{ background: surface.card, borderColor: surface.border, boxShadow: dark ? "none" : "0 1px 2px rgba(0,0,0,0.03)" }}>

        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b" style={{ borderColor: surface.border }}>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold" style={{ color: txt.primary }}>Demandes en attente</span>
            <span className="bg-amber-100 text-amber-700 text-[14px] font-bold px-2 py-0.5 rounded-full">{demandes.filter(d=>d.status==="en_attente").length} en attente</span>
          </div>
          {search && (
            <span className="text-[13px] font-medium px-2 py-0.5 rounded-lg" style={{ background: `${brand.DEFAULT}18`, color: brand.DEFAULT }}>
              Recherche : « {search} »
            </span>
          )}
        </div>

        <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th dark={dark} center style={{width: 40}}>#</Th>
                <Th dark={dark} onClick={()=>handleSort("name")}>Médecin <SortIcon field="name"/></Th>
                <Th dark={dark}>Contact</Th>
                <Th dark={dark}>Spécialité</Th>
                <Th dark={dark}>Dossier</Th>
                <Th dark={dark} onClick={()=>handleSort("submittedAt")}>Soumis <SortIcon field="submittedAt"/></Th>
                <Th dark={dark} center>Statut</Th>
                <Th dark={dark} center style={{width: 80}}>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <EmptyCell dark={dark} colSpan={8}>Chargement…</EmptyCell>
              ) : paginated.length===0 ? (
                <EmptyCell dark={dark} colSpan={8}>Aucune demande en attente</EmptyCell>
              ) : paginated.map((doc, i) => {
                const ds  = docState(doc);
                const num = (page-1)*perPage+i+1;
                const canAct = ds === "ok";
                const isMenuOpen = openMenuId === doc.id;

                return (
                  <Tr key={doc.id} dark={dark}>
                    <Td dark={dark} center><SubtleText dark={dark}>{num}</SubtleText></Td>

                    <Td dark={dark}>
                      <PersonCell dark={dark} avatarColor={doc.avatarBg} initials={doc.initials}
                        name={doc.name} subtitle={`${doc.hopital} · ${doc.ville}`} onClick={()=>setModaleProfil(doc)} photoUrl={doc.photo_url} />
                    </Td>

                    <Td dark={dark}>
                      <p className="text-[14px]" style={{ color: txt.secondary }}>{doc.email}</p>
                      <p className="text-[13px] mt-0.5" style={{ color: txt.subtle }}>{doc.telephone}</p>
                    </Td>

                    <Td dark={dark}>
                      <p className="text-[14px] font-medium" style={{ color: txt.muted }}>{doc.specialite}</p>
                      <p className="text-[13px] font-mono mt-0.5" style={{ color: txt.subtle }}>{doc.cnom}</p>
                    </Td>

                    <Td dark={dark}>
                      <button onClick={()=>setModaleDossier(doc)}
                        className="flex items-center gap-1.5 text-[13px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors"
                        style={ds==="ok"
                          ? { borderColor: surface.border, color: brand.DEFAULT }
                          : { borderColor: surface.border, color: "#d97706" }}>
                        <FileText size={12}/>
                        {doc.documents.filter(d=>d.status==="verified").length}/{doc.documents.length} vérifiés
                      </button>
                    </Td>

                    <Td dark={dark}>
                      <p className="text-[15px]" style={{ color: txt.secondary }}>{formatFull(doc.submittedAt)}</p>
                      <p className="text-[13px] mt-0.5" style={{ color: txt.subtle }}>{elapsedStr(doc.submittedAt)}</p>
                    </Td>

                    <Td dark={dark} center>
                      {{
                        "en_attente": <StatusText color="warning">En attente</StatusText>,
                        "valide":     <StatusText color="success">Validé</StatusText>,
                        "rejete":     <StatusText color="danger">Refusé</StatusText>,
                      }[doc.status] || <StatusText color="brand">Inconnu</StatusText>}
                    </Td>

                    <Td dark={dark} center>
                      <div className="relative flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(isMenuOpen ? null : doc.id);
                          }}
                          title="Actions"
                          className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all"
                          style={isMenuOpen
                            ? { background: surface.bg, borderColor: surface.borderSoft, color: txt.primary, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }
                            : { borderColor: surface.border, color: txt.muted }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1.5 z-30 min-w-[180px] rounded-xl border shadow-xl overflow-hidden"
                            style={{ background: surface.card, borderColor: surface.border, transformOrigin: "top right" }}
                          >
                            <button
                              onClick={() => {
                                setModaleDossier(doc);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium transition-colors"
                              style={{ color: txt.secondary }}
                              onMouseEnter={e=>{e.currentTarget.style.background=surface.bg;}}
                              onMouseLeave={e=>{e.currentTarget.style.background="";}}
                            >
                              <Eye size={14} className="shrink-0" style={{ color: brand.DEFAULT }} />
                              Voir le dossier
                            </button>

                            <div className="border-t" style={{ borderColor: surface.border }} />

                            <button
                              disabled={!canAct}
                              onClick={() => {
                                setModaleValider(doc);
                                setOpenMenuId(null);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium transition-colors
                                ${canAct
                                  ? (dark?"text-emerald-300 hover:bg-emerald-900/20":"text-emerald-700 hover:bg-emerald-50")
                                  : "cursor-not-allowed"}`}
                              style={!canAct ? { color: txt.subtle } : undefined}
                            >
                              <CheckCircle size={14} className="shrink-0" />
                              <span>Valider</span>
                              {!canAct && <span className="ml-auto text-[12px] px-1.5 py-0.5 rounded" style={{ background: surface.bg, color: txt.subtle }}>Incomplet</span>}
                            </button>

                            <button
                              disabled={!canAct}
                              onClick={() => {
                                setModaleRefuser(doc);
                                setOpenMenuId(null);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium transition-colors
                                ${canAct
                                  ? (dark?"text-red-400 hover:bg-red-900/20":"text-red-700 hover:bg-red-50")
                                  : "cursor-not-allowed"}`}
                              style={!canAct ? { color: txt.subtle } : undefined}
                            >
                              <XCircle size={14} className="shrink-0" />
                              <span>Refuser</span>
                              {!canAct && <span className="ml-auto text-[12px] px-1.5 py-0.5 rounded" style={{ background: surface.bg, color: txt.subtle }}>Incomplet</span>}
                            </button>
                          </div>
                        )}
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
        </table>

      </div>

      <PaginationBar dark={dark}>
        <span>Affichage {from} à {to} sur {filtered.length} demande{filtered.length>1?"s":""}</span>
        <div className="flex items-center gap-2">
          <span>Lignes :</span>
          <PaginationSelect dark={dark} value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}} />
        </div>
        <div className="flex items-center gap-1">
          <PaginationButton dark={dark} onClick={()=>setPage(1)} disabled={page===1}>«</PaginationButton>
          <PaginationButton dark={dark} onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>‹</PaginationButton>
          {Array.from({length:totalPages},(_,i)=>i+1)
            .filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1)
            .reduce((acc,p,idx,arr)=>{if(idx>0&&p-arr[idx-1]>1)acc.push("…"+idx);acc.push(p);return acc;},[])
            .map(p=>typeof p==="string"
              ? <span key={p} className="px-1 opacity-30">…</span>
              : <PaginationButton key={p} dark={dark} onClick={()=>setPage(p)} active={p===page}>{p}</PaginationButton>
            )}
          <PaginationButton dark={dark} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>›</PaginationButton>
          <PaginationButton dark={dark} onClick={()=>setPage(totalPages)} disabled={page===totalPages}>»</PaginationButton>
        </div>
      </PaginationBar>

      {modaleProfil  && <ModaleProfil  doc={modaleProfil}  dark={dark} onClose={()=>setModaleProfil(null)}/>}
      {modaleDossier && <ModaleDossier doc={modaleDossier} dark={dark} onClose={()=>setModaleDossier(null)} onUpdateDocs={handleUpdateDocs}/>}
      {modaleValider && <ModaleValider doc={modaleValider} dark={dark} onClose={()=>setModaleValider(null)} onConfirm={handleValider}/>}
      {modaleRefuser && <ModaleRefuser doc={modaleRefuser} dark={dark} onClose={()=>setModaleRefuser(null)} onConfirm={handleRefuser}/>}

      {activationInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-2xl border shadow-2xl p-6" style={{ background: surface.card, borderColor: surface.border, color: txt.primary }}>
            <p className="font-bold text-[15px] mb-1">E-mail non reçu ?</p>
            <p className="text-[15px] mb-3" style={{ color: txt.subtle }}>Copiez ce lien et transmettez-le manuellement à <strong>{activationInfo.email}</strong></p>
            <div className="flex items-center gap-2 p-3 rounded-xl border text-[15px] font-mono break-all" style={{ background: surface.bg, borderColor: surface.border }}>
              <span className="flex-1">{activationInfo.lien}</span>
              <button onClick={()=>navigator.clipboard.writeText(activationInfo.lien)}
                className="shrink-0 px-2 py-1 bg-blue-600 text-white rounded-lg text-[14px] font-bold hover:bg-blue-700">Copier</button>
            </div>
            <button onClick={()=>setActivationInfo(null)}
              className="mt-4 w-full py-2 rounded-xl text-[14px] font-bold text-white transition-colors"
              style={{background:brand.DEFAULT}}>Fermer</button>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[14px] font-semibold text-white ${toast.type==="success"?"bg-teal-600":"bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}