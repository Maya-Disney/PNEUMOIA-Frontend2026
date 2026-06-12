import { useState, useEffect, useMemo, useRef } from "react"; // ← ajout useRef
import { getDemandes, validerMedecin, rejeterMedecin } from "../api/adminApi";
import { useOutletContext } from "react-router-dom";
import * as XLSX from "xlsx";
import { Download, Eye, CheckCircle, XCircle, FileText, MoreVertical } from "lucide-react"; // ← ajout MoreVertical

const BRAND = "#0f766e";
// ── Helpers date ───────────────────────────────────────────────────────────────
const JOURS = ["dim.","lun.","mar.","mer.","jeu.","ven.","sam."];
const MOIS  = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];
const pad   = (n) => String(n).padStart(2, "0");

function formatFull(d) {
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function elapsedStr(d) {
  const dm = Math.floor((Date.now() - d.getTime()) / 60000);
  const dh = Math.floor(dm / 60);
  const dd = Math.floor(dh / 24);
  if (dm < 60) return `Il y a ${dm} min`;
  if (dh < 24) return `Il y a ${dh}h${pad(dm % 60)}`;
  return `Il y a ${dd}j ${dh % 24}h`;
}

// ── Mocks ─────────────────────────────────────────────────────────────────────
const NOW = new Date();
const sub = (ms) => new Date(NOW.getTime() - ms);

const MOCK = [
  {
    id:1, initials:"DK", avatarBg:"#1D9E75",
    name:"Dr. Kamga Denis", specialite:"Pneumologue",
    hopital:"H. Central, Yaoundé", ville:"Yaoundé",
    email:"kamga.denis@pneumo.cm", telephone:"+237 698 001 234",
    cnom:"CM-2025-4401", submittedAt:sub(2*3600*1000), status:"en_attente",
    documents:[
      {label:"Diplôme de spécialisation en pneumologie", status:"verified"},
      {label:"Diplôme de docteur en médecine",           status:"verified"},
      {label:"Inscription à l'ordre des médecins",       status:"pending"},
      {label:"Autorisation d'exercice",                  status:"verified"},
      {label:"Carte professionnelle de médecin",         status:"missing"},
      {label:"Carte nationale d'identité (CNI)",         status:"verified"},
    ],
  },
  {
    id:2, initials:"AN", avatarBg:"#7C3AED",
    name:"Dr. Abena Nkolo", specialite:"Pneumologue",
    hopital:"H. Laquintinie, Douala", ville:"Douala",
    email:"abena.nkolo@pnm.cm", telephone:"+237 677 555 021",
    cnom:"CM-2025-4398", submittedAt:sub(5*3600*1000), status:"en_attente",
    documents:[
      {label:"Diplôme de spécialisation en pneumologie", status:"verified"},
      {label:"Diplôme de docteur en médecine",           status:"verified"},
      {label:"Inscription à l'ordre des médecins",       status:"verified"},
      {label:"Autorisation d'exercice",                  status:"verified"},
      {label:"Carte professionnelle de médecin",         status:"verified"},
      {label:"Carte nationale d'identité (CNI)",         status:"verified"},
    ],
  },
  {
    id:3, initials:"MB", avatarBg:"#D97706",
    name:"Dr. Mbala Berthe", specialite:"Pneumologue",
    hopital:"CHU, Bafoussam", ville:"Bafoussam",
    email:"mbala.berthe@chu-baf.cm", telephone:"+237 655 300 887",
    cnom:"CM-2025-4410", submittedAt:sub(24*3600*1000), status:"en_attente",
    documents:[
      {label:"Diplôme de spécialisation en pneumologie", status:"verified"},
      {label:"Diplôme de docteur en médecine",           status:"pending"},
      {label:"Inscription à l'ordre des médecins",       status:"verified"},
      {label:"Autorisation d'exercice",                  status:"pending"},
      {label:"Carte professionnelle de médecin",         status:"verified"},
      {label:"Carte nationale d'identité (CNI)",         status:"verified"},
    ],
  },
];

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

function avatarColor(str) {
  const colors = ["#1D9E75","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"];
  let h = 0;
  for (let i=0; i<str.length; i++) h = str.charCodeAt(i)+((h<<5)-h);
  return colors[Math.abs(h) % colors.length];
}

function mapMedecin(m) {
  return {
    id:          m.id,
    initials:    `${(m.prenom?.[0]||"").toUpperCase()}${(m.nom?.[0]||"").toUpperCase()}`,
    name:        `${m.civilite||"Dr."} ${m.prenom} ${m.nom}`,
    specialite:  m.specialite || "Pneumologue",
    hopital:     m.etablissement || "—",
    ville:       "—",
    email:       m.email,
    telephone:   m.telephone || "—",
    cnom:        m.numero_rpps || "—",
    photo_url:   m.photo_url || null,
    submittedAt: new Date(m.created_at),
    status:      m.statut || "en_attente",
    avatarBg:    avatarColor(`${m.prenom}${m.nom}`),
    documents:   (m.documents || []).map(d => ({
      label:  d.label,
      url:    d.url,
      status: "pending",
    })),
  };
}

// ── Modal générique ────────────────────────────────────────────────────────────
function Modal({ onClose, title, sub: subtitle, wide, children, footer, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div className={`w-full ${wide?"max-w-2xl":"max-w-lg"} max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden
        ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <div>
            <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>{title}</p>
            {subtitle && <p className={`text-[10px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}>
            <XCircle size={13}/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className={`shrink-0 flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>{footer}</div>}
      </div>
    </div>
  );
}

// ── Modal photo CNI ────────────────────────────────────────────────────────────
function ModaleProfil({ doc: m, onClose, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={m.name} sub="Photo d'identité (CNI)"
      footer={<button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Fermer</button>}>
      <div className="flex flex-col items-center gap-4 py-4">
        {m.photo_url
          ? <img src={m.photo_url} alt={m.name}
              className="w-36 h-36 rounded-full object-cover border-2 border-gray-200 shadow" />
          : <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark?"border-[#21262d] bg-[#0d1117] text-[#484f58]":"border-gray-200 bg-gray-50 text-gray-300"}`}>
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-[10px] text-center px-2">Aucune photo</span>
            </div>
        }
        <div className="text-center">
          <p className={`text-[12px] font-bold ${dark?"text-white":"text-gray-800"}`}>{m.name}</p>
          <p className={`text-[10px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.specialite} · CNOM {m.cnom}</p>
        </div>
      </div>
    </Modal>
  );
}

// ── Modal dossier avec vérification interactive ────────────────────────────────
function ModaleDossier({ doc: m, onClose, onUpdateDocs, dark }) {
  const [docs,    setDocs]   = useState(m.documents.map(d => ({...d, status: "pending"})));
  const [opened,  setOpened] = useState({});

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
          className="flex-1 py-2 rounded-xl text-[12px] font-bold text-white transition-opacity hover:opacity-90"
          style={{background: allOk ? "#0f766e" : "#6b7280"}}>
          {allOk ? "✓ Dossier complet — Fermer" : `Fermer (${verified}/${total} vérifiés)`}
        </button>
      }>
      <div className="flex flex-col gap-3">

        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[11px] font-medium
          ${allOk
            ? (dark?"bg-teal-900/20 border-teal-700/40 text-teal-300":"bg-teal-50 border-teal-200 text-teal-700")
            : (dark?"bg-amber-900/20 border-amber-700/40 text-amber-300":"bg-amber-50 border-amber-200 text-amber-700")}`}>
          {allOk
            ? `✓ Tous les documents vérifiés — dossier complet`
            : `${verified}/${total} documents vérifiés — cliquez sur chaque document pour le marquer`}
        </div>

        <div className={`rounded-xl border overflow-hidden ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
          {[{l:"Médecin",v:m.name},{l:"Spécialité",v:m.specialite},{l:"CNOM",v:m.cnom,mono:true},{l:"Établissement",v:m.hopital},{l:"E-mail",v:m.email},{l:"Téléphone",v:m.telephone},{l:"Soumis",v:formatFull(m.submittedAt)}].map(({l,v,mono})=>(
            <div key={l} className={`flex items-center justify-between px-4 py-2.5 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <span className={`text-[11px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{l}</span>
              <span className={`text-[11px] font-medium ${mono?"font-mono":""} ${dark?"text-[#8b949e]":"text-gray-700"}`}>{v}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${dark?"text-[#484f58]":"text-gray-300"}`}>
            Pièces justificatives
          </p>
          <span className={`text-[10px] font-bold ${allOk?"text-teal-600 dark:text-teal-400":"text-amber-600 dark:text-amber-400"}`}>
            {verified}/{total} vérifiés
          </span>
        </div>

        <div className={`rounded-xl border overflow-hidden ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
          {docs.map((d, i) => {
            const isVerified = d.status === "verified";
            const cfg = DOC_CFG[d.status] || DOC_CFG.missing;
            const fileUrl = d.url || null;

            function handleView(e) {
              e.stopPropagation();
              markOpened(i);
              if (fileUrl) window.open(fileUrl, "_blank");
              else alert("Document non disponible — sera accessible après connexion du backend.");
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
              <div key={i} className={`flex items-center gap-3 px-4 py-3 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>

                <button onClick={() => toggleDoc(i)}
                  title={!opened[i] ? "Ouvrez d'abord le document pour pouvoir le valider" : isVerified ? "Décocher" : "Marquer comme vérifié"}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                    ${!opened[i] ? "cursor-not-allowed opacity-35" : "cursor-pointer"}
                    ${isVerified
                      ? "border-teal-500 bg-teal-500"
                      : opened[i]
                        ? (dark?"border-[#484f58] bg-[#0d1117] hover:border-teal-500":"border-gray-400 bg-white hover:border-teal-500")
                        : (dark?"border-[#21262d] bg-[#0d1117]":"border-gray-200 bg-gray-50")}`}>
                  {isVerified && (
                    <svg width="11" height="11" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <span className={`text-[11px] font-medium ${dark?"text-[#8b949e]":"text-gray-600"}`}>{d.label}</span>
                  {!opened[i] && !isVerified && (
                    <span className={`ml-2 text-[9px] ${dark?"text-[#484f58]":"text-gray-300"}`}>← ouvrir pour valider</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={handleView}
                    title="Voir le document"
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors
                      ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d] hover:text-white":"border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Voir
                  </button>
                  <button onClick={handleDownload}
                    title="Télécharger le document"
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors
                      ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d] hover:text-white":"border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Télécharger
                  </button>
                </div>

                <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${cfg.cls}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className={`text-[10px] text-center ${dark?"text-[#484f58]":"text-gray-300"}`}>
          Cochez chaque document après l'avoir vérifié · Les fichiers sont fournis par le médecin à l'inscription
        </p>
      </div>
    </Modal>
  );
}

// ── Modal valider ──────────────────────────────────────────────────────────────
function ModaleValider({ doc: m, onClose, onConfirm, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title="Valider l'inscription" sub={m.name}
      footer={<>
        <button onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          Annuler
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white hover:opacity-90 transition-opacity"
          style={{background:BRAND}}>
          Confirmer la validation
        </button>
      </>}>
      <div className="flex flex-col gap-3">
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[11px] ${dark?"bg-teal-900/20 border-teal-700/40 text-teal-300":"bg-teal-50 border-teal-200 text-teal-700"}`}>
          <CheckCircle size={13} className="shrink-0" />
          <span>Le compte de <strong>{m.name}</strong> sera activé. Un e-mail d'activation lui sera envoyé.</span>
        </div>
        <div className={`rounded-xl border overflow-hidden ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
          {[{l:"Médecin",v:m.name},{l:"CNOM",v:m.cnom},{l:"E-mail",v:m.email},{l:"Ville",v:m.ville},{l:"Soumis",v:formatFull(m.submittedAt)}].map(({l,v})=>(
            <div key={l} className={`flex items-center justify-between px-4 py-2.5 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <span className={`text-[11px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{l}</span>
              <span className={`text-[11px] font-medium ${dark?"text-[#8b949e]":"text-gray-700"}`}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ── Modal refuser ──────────────────────────────────────────────────────────────
function ModaleRefuser({ doc: m, onClose, onConfirm, dark }) {
  const [motif, setMotif] = useState("");
  const [msg,   setMsg]   = useState("");
  const ok  = motif && motif !== "— Choisir un motif —";
  const inp = `w-full text-[12px] px-3 py-2 rounded-xl border outline-none transition-colors ${dark?"bg-[#0d1117] border-[#21262d] text-white":"bg-gray-50 border-gray-200 text-gray-800"}`;
  return (
    <Modal dark={dark} onClose={onClose} title="Refuser la demande" sub={m.name}
      footer={<>
        <button onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          Annuler
        </button>
        <button onClick={()=>ok&&onConfirm({motif,msg})} disabled={!ok}
          className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white transition-colors ${ok?"bg-red-600 hover:bg-red-700":"bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
          Confirmer le refus
        </button>
      </>}>
      <div className="flex flex-col gap-3">
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[11px] ${dark?"bg-red-900/20 border-red-700/40 text-red-300":"bg-red-50 border-red-200 text-red-700"}`}>
          <XCircle size={13} className="shrink-0" />
          <span>La demande de <strong>{m.name}</strong> sera refusée. Un e-mail d'information lui sera envoyé.</span>
        </div>
        <div>
          <label className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Motif du refus <span className="text-red-500">*</span></label>
          <select value={motif} onChange={e=>setMotif(e.target.value)} className={inp}>
            {MOTIFS.map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Message complémentaire (optionnel)</label>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3} placeholder="Explications supplémentaires…" className={`${inp} resize-none`}/>
        </div>
      </div>
    </Modal>
  );
}

// ── Bouton pagination ─────────────────────────────────────────────────────────
function PagBtn({ onClick, disabled, label, dark }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-lg border text-[11px] transition-colors
        ${disabled
          ? dark?"border-[#21262d] text-[#484f58] cursor-not-allowed":"border-gray-100 text-gray-300 cursor-not-allowed"
          : dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
      {label}
    </button>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function NouvellesDemandes() {
  const { dark } = useOutletContext() || {};
  const [demandes,       setDemandes]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
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

  // ✨ État pour le menu déroulant (3 points) — id du médecin dont le menu est ouvert
  const [openMenuId, setOpenMenuId] = useState(null);

  // Horloge
  useEffect(() => { const t = setInterval(()=>setClock(new Date()),1000); return ()=>clearInterval(t); }, []);

  // Toast auto-dismiss
  useEffect(() => { if (!toast) return; const t=setTimeout(()=>setToast(null),3500); return ()=>clearTimeout(t); }, [toast]);

  // ✨ Fermer le menu déroulant au clic extérieur
  useEffect(() => {
    if (openMenuId === null) return;
    const handleClickOutside = () => setOpenMenuId(null);
    // délai pour éviter de fermer le menu immédiatement après le clic qui l'a ouvert
    const timeout = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  // Chargement API avec fallback mock
  useEffect(() => {
    setLoading(true);
    getDemandes()
      .then(data => setDemandes(Array.isArray(data) ? data.map(mapMedecin) : MOCK))
      .catch(() => setDemandes(MOCK))
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
    return <span className="ml-1" style={{color:BRAND}}>{sortDir==="asc"?"↑":"↓"}</span>;
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

  const th = `px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-b select-none cursor-pointer ${dark?"text-[#484f58] border-[#21262d] bg-[#0d1117]/50":"text-gray-400 border-gray-100 bg-gray-50"}`;
  const td = `px-4 py-3 border-b ${dark?"border-[#21262d]":"border-gray-50"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>
            Nouvelles demandes
          </h1>
          <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>
            {pending.length} demande{pending.length!==1?"s":""} en attente · validation manuelle obligatoire
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-[10px] tabular-nums ${dark?"text-[#484f58]":"text-gray-400"}`}>
            {JOURS[clock.getDay()]} {clock.getDate()} {MOIS[clock.getMonth()]} {clock.getFullYear()}
            &nbsp;{pad(clock.getHours())}:{pad(clock.getMinutes())}:{pad(clock.getSeconds())}
          </span>
          <button onClick={exportExcel}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e]"
            onMouseEnter={e=>{e.currentTarget.style.background=BRAND;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=BRAND;}}
            onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color="";e.currentTarget.style.borderColor="";}}>
            <Download size={13}/> Export Excel
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className={`rounded-2xl border overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>

        {/* Toolbar */}
        <div className={`flex items-center justify-between gap-4 px-5 py-3 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <div className="flex items-center gap-2">
            <span className={`text-[12px] font-bold ${dark?"text-white":"text-gray-800"}`}>Demandes en attente</span>
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{demandes.filter(d=>d.status==="en_attente").length} en attente</span>
          </div>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="Rechercher par nom, e-mail, CNOM, ville…"
            className={`w-64 text-[12px] px-3 py-2 rounded-xl border outline-none transition-colors ${dark?"bg-[#0d1117] border-[#21262d] text-white placeholder-[#484f58] focus:border-[#0f766e]":"bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-300 focus:border-[#0f766e]"}`}/>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{minWidth:800}}>
            <thead>
              <tr>
                <th className={`${th} w-10 text-center`}>#</th>
                <th className={th} onClick={()=>handleSort("name")}>Médecin <SortIcon field="name"/></th>
                <th className={th}>Contact</th>
                <th className={th}>Spécialité</th>
                <th className={th}>Dossier</th>
                <th className={th} onClick={()=>handleSort("submittedAt")}>Soumis <SortIcon field="submittedAt"/></th>
                <th className={`${th} text-center`}>Statut</th>
                <th className={`${th} text-center`} style={{width: 80}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className={`${td} text-center py-14 text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>Chargement…</td></tr>
              ) : paginated.length===0 ? (
                <tr><td colSpan={8} className={`${td} text-center py-14 text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>Aucune demande en attente</td></tr>
              ) : paginated.map((doc, i) => {
                const ds  = docState(doc);
                const num = (page-1)*perPage+i+1;
                const canAct = ds === "ok";
                const isMenuOpen = openMenuId === doc.id;

                return (
                  <tr key={doc.id} className={`transition-colors ${dark?"hover:bg-[#0d1117]/60":"hover:bg-gray-50/80"}`}>
                    <td className={`${td} text-center text-[10px] ${dark?"text-[#484f58]":"text-gray-300"}`}>{num}</td>

                    {/* Médecin */}
                    <td className={td}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
                          style={{background:doc.avatarBg}} onClick={()=>setModaleProfil(doc)} title="Voir la photo CNI">
                          {doc.initials}
                        </div>
                        <div>
                          <p className={`text-[12px] font-bold cursor-pointer hover:underline underline-offset-2 ${dark?"text-white":"text-gray-800"}`}
                            onClick={()=>setModaleProfil(doc)}>{doc.name}</p>
                          <p className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{doc.hopital} · {doc.ville}</p>
                        </div>
                      </div>
                    </td>

                    <td className={td}>
                      <p className={`text-[11px] ${dark?"text-[#8b949e]":"text-gray-600"}`}>{doc.email}</p>
                      <p className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{doc.telephone}</p>
                    </td>

                    <td className={td}>
                      <p className={`text-[11px] font-medium ${dark?"text-[#8b949e]":"text-gray-700"}`}>{doc.specialite}</p>
                      <p className={`text-[10px] font-mono ${dark?"text-[#484f58]":"text-gray-400"}`}>{doc.cnom}</p>
                    </td>

                    <td className={td}>
                      <button onClick={()=>setModaleDossier(doc)}
                        className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors
                          ${ds==="ok"
                            ? (dark?"border-[#21262d] text-teal-400 hover:bg-teal-900/10":"border-gray-200 text-teal-700 hover:bg-gray-50")
                            : (dark?"border-[#21262d] text-amber-400 hover:bg-amber-900/10":"border-gray-200 text-amber-600 hover:bg-gray-50")}`}>
                        <FileText size={10}/>
                        {doc.documents.filter(d=>d.status==="verified").length}/{doc.documents.length} vérifiés
                      </button>
                    </td>

                    <td className={td}>
                      <p className={`text-[11px] ${dark?"text-[#8b949e]":"text-gray-600"}`}>{formatFull(doc.submittedAt)}</p>
                      <p className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{elapsedStr(doc.submittedAt)}</p>
                    </td>

                    <td className={`${td} text-center`}>
                      {{
                        "en_attente": (
                          <span style={{display:"inline-block",padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,background:"#fffbeb",color:"#b45309",border:"1px solid #fde68a",whiteSpace:"nowrap"}}>
                            En attente
                          </span>
                        ),
                        "valide": (
                          <span style={{display:"inline-block",padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,background:"#ecfdf5",color:"#065f46",border:"1px solid #6ee7b7",whiteSpace:"nowrap"}}>
                            Validé
                          </span>
                        ),
                        "rejete": (
                          <span style={{display:"inline-block",padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,background:"#fef2f2",color:"#991b1b",border:"1px solid #fca5a5",whiteSpace:"nowrap"}}>
                            Refusé
                          </span>
                        ),
                      }[doc.status] || (
                        <span style={{display:"inline-block",padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,background:"#f3f4f6",color:"#6b7280",border:"1px solid #e5e7eb",whiteSpace:"nowrap"}}>
                          Inconnu
                        </span>
                      )}
                    </td>

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
                            {/* Dossier */}
                            <button
                              onClick={() => {
                                setModaleDossier(doc);
                                setOpenMenuId(null);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors
                                ${dark?"text-[#c9d1d9] hover:bg-[#21262d]":"text-gray-700 hover:bg-gray-50"}`}
                            >
                              <Eye size={14} className="shrink-0" style={{ color: BRAND }} />
                              Voir le dossier
                            </button>

                            <div className={`border-t ${dark?"border-[#21262d]":"border-gray-100"}`} />

                            {/* Valider */}
                            <button
                              disabled={!canAct}
                              onClick={() => {
                                setModaleValider(doc);
                                setOpenMenuId(null);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors
                                ${canAct
                                  ? (dark?"text-emerald-300 hover:bg-emerald-900/20":"text-emerald-700 hover:bg-emerald-50")
                                  : (dark?"text-[#484f58] cursor-not-allowed":"text-gray-300 cursor-not-allowed")}`}
                            >
                              <CheckCircle size={14} className="shrink-0" />
                              <span>Valider</span>
                              {!canAct && <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded ${dark?"bg-[#21262d] text-[#484f58]":"bg-gray-100 text-gray-400"}`}>Incomplet</span>}
                            </button>

                            {/* Refuser */}
                            <button
                              disabled={!canAct}
                              onClick={() => {
                                setModaleRefuser(doc);
                                setOpenMenuId(null);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors
                                ${canAct
                                  ? (dark?"text-red-400 hover:bg-red-900/20":"text-red-700 hover:bg-red-50")
                                  : (dark?"text-[#484f58] cursor-not-allowed":"text-gray-300 cursor-not-allowed")}`}
                            >
                              <XCircle size={14} className="shrink-0" />
                              <span>Refuser</span>
                              {!canAct && <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded ${dark?"bg-[#21262d] text-[#484f58]":"bg-gray-100 text-gray-400"}`}>Incomplet</span>}
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
          <span>Affichage {from} à {to} sur {filtered.length} demande{filtered.length>1?"s":""}</span>
          <div className="flex items-center gap-2">
            <span>Lignes :</span>
            <select value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}}
              className={`text-[11px] px-2 py-1 rounded-lg border outline-none cursor-pointer ${dark?"bg-[#0d1117] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
              {[5,10,20,50].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <PagBtn onClick={()=>setPage(1)} disabled={page===1} label="«" dark={dark}/>
            <PagBtn onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} label="‹" dark={dark}/>
            {Array.from({length:totalPages},(_,i)=>i+1)
              .filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1)
              .reduce((acc,p,idx,arr)=>{if(idx>0&&p-arr[idx-1]>1)acc.push("…"+idx);acc.push(p);return acc;},[])
              .map(p=>typeof p==="string"
                ? <span key={p} className="px-1 opacity-30">…</span>
                : <button key={p} onClick={()=>setPage(p)}
                    className="w-7 h-7 rounded-lg border text-[11px] font-medium transition-colors"
                    style={p===page?{background:BRAND,borderColor:BRAND,color:"#fff"}:{}}>{p}</button>
              )}
            <PagBtn onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} label="›" dark={dark}/>
            <PagBtn onClick={()=>setPage(totalPages)} disabled={page===totalPages} label="»" dark={dark}/>
          </div>
        </div>
      </div>

      {/* Modales */}
      {modaleProfil  && <ModaleProfil  doc={modaleProfil}  dark={dark} onClose={()=>setModaleProfil(null)}/>}
      {modaleDossier && <ModaleDossier doc={modaleDossier} dark={dark} onClose={()=>setModaleDossier(null)} onUpdateDocs={handleUpdateDocs}/>}
      {modaleValider && <ModaleValider doc={modaleValider} dark={dark} onClose={()=>setModaleValider(null)} onConfirm={handleValider}/>}
      {modaleRefuser && <ModaleRefuser doc={modaleRefuser} dark={dark} onClose={()=>setModaleRefuser(null)} onConfirm={handleRefuser}/>}

      {/* Popup lien activation fallback */}
      {activationInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-900"}`}>
            <p className="font-bold text-[13px] mb-1">E-mail non reçu ?</p>
            <p className={`text-[11px] mb-3 ${dark?"text-[#484f58]":"text-gray-400"}`}>Copiez ce lien et transmettez-le manuellement à <strong>{activationInfo.email}</strong></p>
            <div className={`flex items-center gap-2 p-3 rounded-xl border text-[11px] font-mono break-all ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-200"}`}>
              <span className="flex-1">{activationInfo.lien}</span>
              <button onClick={()=>navigator.clipboard.writeText(activationInfo.lien)}
                className="shrink-0 px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700">Copier</button>
            </div>
            <button onClick={()=>setActivationInfo(null)}
              className="mt-4 w-full py-2 rounded-xl text-[12px] font-bold text-white transition-colors"
              style={{background:BRAND}}>Fermer</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white ${toast.type==="success"?"bg-teal-600":"bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}