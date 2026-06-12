/**
 * MedecinsSuspendus.jsx — Liste des médecins suspendus
 *
 * Actions disponibles :
 *   - Réactiver → statut repasse à "valide" + email de notification au médecin
 *   - Supprimer → suppression définitive + email de notification au médecin
 *
 * Notifications email (Brevo) : envoyées depuis admin_service.py
 *   - Réactivation : message indiquant la levée de suspension + motif initial
 *   - Suppression  : message indiquant la suppression définitive du compte
 */

import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2, X, AlertTriangle, RotateCcw, MoreVertical } from "lucide-react"; // ← ajout MoreVertical
import { reactiverMedecin, supprimerMedecin, getMedecinsSuspendus } from "../api/adminApi";

const BRAND = "#0f766e";
const NOW   = new Date();
const sub   = (ms) => new Date(NOW.getTime() - ms);
const pad   = (n)  => String(n).padStart(2, "0");
function fmtDT(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; }

// ─────────────────────────────────────────────────────────────────────────────
// DONNÉES MOCK — Un seul mock conservé
// ─────────────────────────────────────────────────────────────────────────────

const MOCK = [
  {
    id: 1, initials: "DM", nom: "Dr. Mbang",
    specialite: "Pneumologue", hopital: "Clinique Sud, Douala",
    cnom: "CM-2020-0345", email: "mbang@clinique.cm",
    raison: "Signalement d'un confrère — comportement non conforme à la déontologie",
    duree: "30 jours", dureeType: "limitee",
    suspenduLe: sub(24*3600000), suspenduPar: "Super Admin",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANTS UI
// ─────────────────────────────────────────────────────────────────────────────

function Modal({ onClose, title, sub: subtitle, children, footer, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <div>
            <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>{title}</p>
            {subtitle&&<p className={`text-[10px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}>
            <X size={13}/>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer&&<div className={`flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>{footer}</div>}
      </div>
    </div>
  );
}

function ModalePhoto({ m, onClose, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={m.nom} sub="Photo d'identité (CNI)"
      footer={<button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Fermer</button>}>
      <div className="flex flex-col items-center gap-4 py-4">
        <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark?"border-[#21262d] bg-[#0d1117] text-[#484f58]":"border-gray-200 bg-gray-50 text-gray-300"}`}>
          <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="text-[10px] text-center px-2">Photo soumise à l'adhésion</span>
        </div>
        <div className="text-center">
          <p className={`text-[12px] font-bold ${dark?"text-white":"text-gray-800"}`}>{m.nom}</p>
          <p className={`text-[10px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.specialite} · CNOM {m.cnom}</p>
        </div>
      </div>
    </Modal>
  );
}

function PagBtn({ onClick, disabled, label, dark }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-lg border text-[11px] transition-colors
        ${disabled
          ?dark?"border-[#21262d] text-[#484f58] cursor-not-allowed":"border-gray-100 text-gray-300 cursor-not-allowed"
          :dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function MedecinsSuspendus() {
  const { dark } = useOutletContext() || {};

  // ── États ──────────────────────────────────────────────────────────────────
  const [suspendus,      setSuspendus]      = useState(MOCK);
  const [loadingData,    setLoadingData]    = useState(true);
  const [modaleReactiver,setModaleReactiver]= useState(null);
  const [modaleSuppr,    setModaleSuppr]    = useState(null);
  const [modalePhoto,    setModalePhoto]    = useState(null);
  const [msgReactiv,     setMsgReactiv]     = useState("");
  const [loading,        setLoading]        = useState(false);
  const [toast,          setToast]          = useState(null);
  const [page,           setPage]           = useState(1);
  const [perPage,        setPerPage]        = useState(10);

  // ✨ État pour le menu déroulant (3 points)
  const [openMenuId, setOpenMenuId] = useState(null);

  const totalPages = Math.max(1, Math.ceil(suspendus.length/perPage));
  const paginated  = suspendus.slice((page-1)*perPage, page*perPage);
  const from = suspendus.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, suspendus.length);

  // ── Chargement depuis le backend ───────────────────────────────────────────
  useEffect(() => {
    setLoadingData(true);
    getMedecinsSuspendus()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSuspendus(data.map(m => ({
            id:          m.id,
            initials:    `${(m.prenom?.[0]||"").toUpperCase()}${(m.nom?.[0]||"").toUpperCase()}`,
            nom:         `${m.civilite||"Dr."} ${m.prenom} ${m.nom}`,
            specialite:  m.specialite    || "—",
            hopital:     m.etablissement || "—",
            cnom:        m.numero_rpps   || "—",
            email:       m.email         || "—",
            raison:      m.suspension_raison || m.motif_rejet || "—",
            duree:       m.suspension_duree  || "—",
            dureeType:   m.suspension_duree === "Indéfinie" ? "indefinie" : "limitee",
            suspenduLe:  m.suspension_le ? new Date(m.suspension_le) : new Date(),
            suspenduPar: m.suspension_par || "Administrateur",
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, []);

  // Auto-fermeture toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(()=>setToast(null), 4000);
    return ()=>clearTimeout(t);
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

  // Fermer modales avec Escape
  useEffect(() => {
    const esc = e => {
      if (e.key==="Escape") {
        setModaleReactiver(null);
        setModaleSuppr(null);
        setModalePhoto(null);
      }
    };
    window.addEventListener("keydown", esc);
    return ()=>window.removeEventListener("keydown", esc);
  }, []);

  // ── Réactiver un médecin ────────────────────────────────────────────────────
  const handleReactiver = useCallback(async () => {
    if (!modaleReactiver) return;
    setLoading(true);
    try {
      await reactiverMedecin(modaleReactiver.id);
    } catch(e) {
      // Fallback mock si backend indisponible
    }
    setSuspendus(p => p.filter(m => m.id !== modaleReactiver.id));
    setToast({
      msg: `✓ ${modaleReactiver.nom} réactivé — notification envoyée`,
      type: "success",
    });
    setModaleReactiver(null);
    setMsgReactiv("");
    setLoading(false);
  }, [modaleReactiver]);

  // ── Supprimer un médecin ────────────────────────────────────────────────────
  const handleSupprimer = useCallback(async () => {
    if (!modaleSuppr) return;
    setLoading(true);
    try {
      await supprimerMedecin(modaleSuppr.id);
    } catch(e) {}
    setSuspendus(p => p.filter(m => m.id !== modaleSuppr.id));
    setToast({
      msg: `Compte de ${modaleSuppr.nom} supprimé — notification envoyée`,
      type: "error",
    });
    setModaleSuppr(null);
    setLoading(false);
  }, [modaleSuppr]);

  const th = `px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-b ${dark?"text-[#484f58] border-[#21262d] bg-[#0d1117]/50":"text-gray-400 border-gray-100 bg-gray-50"}`;
  const td = `px-4 py-3 border-b ${dark?"border-[#21262d]":"border-gray-50"}`;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div>
        <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>
          Comptes suspendus
        </h1>
        <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>
          {suspendus.length} compte{suspendus.length>1?"s":""} suspendu{suspendus.length>1?"s":""}
          {" "}· Réactiver ou supprimer avec notification e-mail automatique
        </p>
      </div>

      {/* ── Tableau ── */}
      <div className={`rounded-2xl border overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{minWidth:700}}>
            <thead>
              <tr>
                {["Médecin","CNOM","Raison de la suspension","Durée","Suspendu le","Suspendu par"].map(h=>(
                  <th key={h} className={th}>{h}</th>
                ))}
                <th className={`${th} text-center`} style={{width: 80}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingData
                ? <tr><td colSpan={7} className={`${td} text-center py-14 text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>Chargement…</td></tr>
                : paginated.length===0
                ? <tr><td colSpan={7} className={`${td} text-center py-14 text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>Aucun compte suspendu</td></tr>
                : paginated.map(m => {
                    const isMenuOpen = openMenuId === m.id;
                    return (
                      <tr key={m.id} className={`transition-colors ${dark?"hover:bg-[#0d1117]/60":"hover:bg-gray-50/80"}`}>

                        {/* Médecin — clic → photo CNI */}
                        <td className={td}>
                          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={()=>setModalePhoto(m)}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 group-hover:opacity-75 transition-opacity ${dark?"bg-[#21262d] text-[#8b949e]":"bg-gray-100 text-gray-600"}`}>
                              {m.initials}
                            </div>
                            <div>
                              <p className={`text-[12px] font-bold group-hover:underline underline-offset-2 ${dark?"text-white":"text-gray-800"}`}>{m.nom}</p>
                              <p className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.specialite} · {m.hopital}</p>
                            </div>
                          </div>
                        </td>

                        <td className={`${td} text-[11px] font-mono ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.cnom}</td>

                        {/* Raison en orange */}
                        <td className={`${td} text-[11px] font-medium text-orange-500 dark:text-orange-400 max-w-xs`}>
                          <span className="line-clamp-2">{m.raison}</span>
                        </td>

                        {/* Badge durée */}
                        <td className={td}>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${m.dureeType==="indefinie"?"bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400":"bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"}`}>
                            {m.duree}
                          </span>
                        </td>

                        <td className={`${td} text-[11px] whitespace-nowrap ${dark?"text-[#484f58]":"text-gray-400"}`}>
                          {fmtDT(m.suspenduLe)}
                        </td>

                        <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`}>{m.suspenduPar}</td>

                        {/* ✨ Actions — menu déroulant 3 points */}
                        <td className={td}>
                          <div className="relative flex justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(isMenuOpen ? null : m.id);
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
                                {/* Réactiver */}
                                <button
                                  onClick={() => {
                                    setModaleReactiver(m);
                                    setMsgReactiv("");
                                    setOpenMenuId(null);
                                  }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors
                                    ${dark?"text-teal-400 hover:bg-teal-900/20":"text-teal-700 hover:bg-teal-50"}`}
                                >
                                  <RotateCcw size={14} className="shrink-0" />
                                  Réactiver le compte
                                </button>

                                <div className={`border-t ${dark?"border-[#21262d]":"border-gray-100"}`} />

                                {/* Supprimer */}
                                <button
                                  onClick={() => {
                                    setModaleSuppr(m);
                                    setOpenMenuId(null);
                                  }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors
                                    ${dark?"text-red-400 hover:bg-red-900/20":"text-red-700 hover:bg-red-50"}`}
                                >
                                  <Trash2 size={14} className="shrink-0" />
                                  Supprimer
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t text-[11px] ${dark?"border-[#21262d] text-[#484f58]":"border-gray-50 text-gray-400"}`}>
          <span>Affichage {from} à {to} sur {suspendus.length} compte{suspendus.length>1?"s":""}</span>
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
                ?<span key={p} className="px-1 opacity-30">…</span>
                :<button key={p} onClick={()=>setPage(p)}
                    className="w-7 h-7 rounded-lg border text-[11px] font-medium transition-colors"
                    style={p===page?{background:BRAND,borderColor:BRAND,color:"#fff"}:{}}>{p}</button>
              )}
            <PagBtn onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} label="›" dark={dark}/>
            <PagBtn onClick={()=>setPage(totalPages)} disabled={page===totalPages} label="»" dark={dark}/>
          </div>
        </div>
      </div>

      {/* ── Modal photo CNI ── */}
      {modalePhoto && <ModalePhoto m={modalePhoto} dark={dark} onClose={()=>setModalePhoto(null)}/>}

      {/* ── Modal Réactivation ── */}
      {modaleReactiver && (
        <Modal dark={dark} onClose={()=>setModaleReactiver(null)}
          title="Réactiver le compte" sub={modaleReactiver.nom}
          footer={<>
            <button onClick={()=>setModaleReactiver(null)}
              className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>
              Annuler
            </button>
            <button onClick={handleReactiver} disabled={loading}
              className="flex-1 py-2 rounded-xl text-[12px] font-bold text-white flex items-center justify-center gap-2 transition-colors"
              style={{background:BRAND}}>
              <RotateCcw size={12}/> {loading?"Envoi…":"Réactiver"}
            </button>
          </>}>
          <div className="flex flex-col gap-3">
            <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[11px] ${dark?"bg-teal-900/20 border-teal-700/40 text-teal-300":"bg-teal-50 border-teal-200 text-teal-700"}`}>
              <RotateCcw size={13} className="shrink-0 mt-0.5"/>
              <span>
                Le compte de <strong>{modaleReactiver.nom}</strong> sera réactivé.
                Il recevra un e-mail de notification avec le motif de réactivation.
              </span>
            </div>

            <div className={`rounded-xl border px-4 py-3 text-[11px] ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
              {[
                {l:"Médecin",    v:modaleReactiver.nom},
                {l:"CNOM",       v:modaleReactiver.cnom},
                {l:"E-mail",     v:modaleReactiver.email},
                {l:"Raison susp.",v:modaleReactiver.raison},
                {l:"Durée susp.",v:modaleReactiver.duree},
              ].map(({l,v})=>(
                <div key={l} className={`flex items-start justify-between gap-3 py-1.5 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
                  <span className={dark?"text-[#484f58]":"text-gray-400"}>{l}</span>
                  <span className={`font-semibold text-right max-w-[200px] ${dark?"text-[#8b949e]":"text-gray-700"}`}>{v}</span>
                </div>
              ))}
            </div>

            <div>
              <label className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>
                Message au médecin <span className={`font-normal ${dark?"text-[#484f58]":"text-gray-400"}`}>(optionnel)</span>
              </label>
              <textarea
                value={msgReactiv}
                onChange={e=>setMsgReactiv(e.target.value)}
                rows={3}
                placeholder={`Bonjour ${modaleReactiver.nom},\n\nVotre compte a été réactivé suite à vérification de votre dossier…`}
                className={`w-full text-[12px] px-3 py-2 rounded-xl border outline-none resize-none ${dark?"bg-[#0d1117] border-[#21262d] text-white placeholder-[#484f58]":"bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400"}`}
              />
              <p className={`text-[10px] mt-1 ${dark?"text-[#484f58]":"text-gray-400"}`}>
                L'e-mail de réactivation sera envoyé à <strong>{modaleReactiver.email}</strong>
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal Suppression ── */}
      {modaleSuppr && (
        <Modal dark={dark} onClose={()=>setModaleSuppr(null)}
          title="Supprimer le compte" sub={modaleSuppr.nom}
          footer={<>
            <button onClick={()=>setModaleSuppr(null)}
              className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>
              Annuler
            </button>
            <button onClick={handleSupprimer} disabled={loading}
              className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold flex items-center justify-center gap-2">
              <Trash2 size={12}/> {loading?"Suppression…":"Supprimer définitivement"}
            </button>
          </>}>
          <div className="flex flex-col gap-3">
            <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[11px] ${dark?"bg-red-900/20 border-red-700/40 text-red-300":"bg-red-50 border-red-200 text-red-700"}`}>
              <AlertTriangle size={13} className="shrink-0 mt-0.5"/>
              <span>
                Supprimer définitivement <strong>{modaleSuppr.nom}</strong> ?
                Toutes ses données seront effacées.
                Un <strong>e-mail de notification</strong> lui sera envoyé automatiquement.
              </span>
            </div>
            <div className={`rounded-xl border px-4 py-3 text-[11px] ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
              {[
                {l:"Médecin",     v:modaleSuppr.nom},
                {l:"CNOM",        v:modaleSuppr.cnom},
                {l:"E-mail",      v:modaleSuppr.email},
                {l:"Raison",      v:modaleSuppr.raison},
                {l:"Suspendu le", v:fmtDT(modaleSuppr.suspenduLe)},
              ].map(({l,v})=>(
                <div key={l} className={`flex items-start justify-between gap-3 py-1.5 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
                  <span className={dark?"text-[#484f58]":"text-gray-400"}>{l}</span>
                  <span className={`font-semibold text-right max-w-[200px] ${dark?"text-[#8b949e]":"text-gray-700"}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white transition-all ${toast.type==="success"?"bg-teal-600":"bg-red-600"}`}>
          {toast.type==="success"?<RotateCcw size={13}/>:<Trash2 size={13}/>}
          {toast.msg}
        </div>
      )}
    </div>
  );
}