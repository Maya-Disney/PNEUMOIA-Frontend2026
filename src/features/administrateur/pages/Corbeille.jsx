import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2, X, RotateCcw, AlertTriangle, Clock, MoreVertical } from "lucide-react";
import { brand, status, getSurface, getText } from "../theme";
import { getCorbeille, restaurerMedecin, supprimerDefinitivement } from "../api/adminApi";
import {
  TableCard, TableContainer, Th, Tr, Td, EmptyCell, PersonCell,
  MutedText, SubtleText, StatusText, PaginationBar, PaginationSelect, PaginationButton,
} from "../components/ui/Table";

const NOW = new Date();
const pad = (n) => String(n).padStart(2, "0");
function fmt(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }

function avatarColor(str) {
  const colors = ["#1D9E75","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"];
  let h = 0;
  for (let i=0;i<str.length;i++) h=str.charCodeAt(i)+((h<<5)-h);
  return colors[Math.abs(h)%colors.length];
}

// Jours restants avant suppression définitive
function joursRestants(dateSuppression) {
  const expiry = new Date(dateSuppression.getTime() + 30*24*3600*1000);
  const diff   = Math.ceil((expiry - NOW) / (24*3600*1000));
  return Math.max(0, diff);
}

function couleurJours(jours) {
  if (jours <= 3)  return { bg:"#fef2f2", color:"#dc2626", border:"#fca5a5" };
  if (jours <= 7)  return { bg:"#fff7ed", color:"#ea580c", border:"#fed7aa" };
  if (jours <= 15) return { bg:"#fefce8", color:"#ca8a04", border:"#fde68a" };
  return             { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" };
}

function mapCorbeille(m) {
  return {
    id:               m.id,
    initials:         `${(m.prenom?.[0]||"").toUpperCase()}${(m.nom?.[0]||"").toUpperCase()}`,
    nom:              `${m.civilite||"Dr."} ${m.prenom} ${m.nom}`,
    specialite:       m.specialite    || "Pneumologue",
    hopital:          m.etablissement || "—",
    ville:            m.ville || m.adresse || "—",
    cnom:             m.numero_rpps   || "—",
    email:            m.email         || "—",
    ancienStatut:     m.statut_precedent || m.ancien_statut || m.statut || "rejete",
    dateSuppression:  m.supprime_le   ? new Date(m.supprime_le) : new Date(),
    supprimePar:      m.supprime_par  || "Administrateur",
    motifSuppression: m.motif_suppression || m.motif_rejet || "—",
    photo_url:        m.photo_url     || null,
  };
}

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ onClose, title, sub: subtitle, children, footer, dark }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: surface.card, borderColor: surface.border }}>
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{borderColor: surface.border}}>
          <div>
            <p className="text-[15px] font-bold" style={{ color: txt.primary }}>{title}</p>
            {subtitle && <p className="text-[13px] mt-0.5" style={{ color: txt.subtle }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ color: txt.subtle }}><X size={15}/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="shrink-0 flex gap-2 px-5 py-4 border-t" style={{borderColor: surface.border}}>{footer}</div>}
      </div>
    </div>
  );
}

function ModalePhoto({ r, onClose, dark }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  return (
    <Modal dark={dark} onClose={onClose} title={r.nom} sub="Photo d'identité (CNI)"
      footer={<button onClick={onClose} className="flex-1 py-2 rounded-xl text-[14px] font-semibold border"
        style={{ borderColor: surface.border, color: txt.muted }}>Fermer</button>}>
      <div className="flex flex-col items-center gap-4">
        {r.photo_url
          ? <img src={r.photo_url} alt={r.nom} className="w-full max-h-[65vh] rounded-xl object-contain border-2 border-gray-200 shadow"/>
          : <div className="w-full h-72 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed"
              style={{ borderColor: surface.border, background: surface.bg, color: txt.subtle }}>
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-[14px] text-center px-2">Aucune photo disponible</span>
            </div>
        }
        <div className="text-center">
          <p className="text-[14px] font-bold" style={{ color: txt.primary }}>{r.nom}</p>
          <p className="text-[14px] mt-0.5" style={{ color: txt.subtle }}>{r.specialite} · CNOM {r.cnom}</p>
        </div>
      </div>
    </Modal>
  );
}

export default function Corbeille() {
  const { dark } = useOutletContext() || {};
  const surface = getSurface(dark);
  const txt     = getText(dark);

  const [rows,          setRows]         = useState([]);
  const [modaleRestore, setModaleRestore] = useState(null);
  const [modaleDelete,  setModaleDelete]  = useState(null);
  const [modalePhoto,   setModalePhoto]   = useState(null);
  const [toast,         setToast]         = useState(null);
  const [page,          setPage]          = useState(1);
  const [perPage,       setPerPage]       = useState(10);
  const [villeFiltre,   setVilleFiltre]   = useState("Toutes");
  const [statutFiltre,  setStatutFiltre]  = useState("Tous");

  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    getCorbeille()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRows(data.map(mapCorbeille));
        }
      })
      .catch(() => {});
  }, []);

  const VILLES_CM = ["Toutes","Yaoundé","Douala","Bafoussam","Garoua","Maroua","Ngaoundéré","Bertoua","Ebolowa","Buéa","Limbé"];
  const STATUTS   = ["Tous","valide","rejete","suspendu"];

  const filtered = rows.filter(r => {
    const okVille  = villeFiltre  === "Toutes" || r.ville        === villeFiltre;
    const okStatut = statutFiltre === "Tous"   || r.ancienStatut === statutFiltre;
    return okVille && okStatut;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  const paginated  = filtered.slice((page-1)*perPage, page*perPage);
  const from = filtered.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, filtered.length);

  const urgences = filtered.filter(r => joursRestants(r.dateSuppression) <= 3);

  useEffect(()=>{
    if (!toast) return;
    const t = setTimeout(()=>setToast(null),3500);
    return ()=>clearTimeout(t);
  },[toast]);

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

  async function handleRestore(r) {
    try { await restaurerMedecin(r.id); } catch {}
    setRows(p=>p.filter(x=>x.id!==r.id));
    setToast({msg:`${r.nom} restauré — statut "${r.ancienStatut}"`,type:"success"});
    setModaleRestore(null);
  }

  async function handleDeleteDefinitif(r) {
    try { await supprimerDefinitivement(r.id); } catch {}
    setRows(p=>p.filter(x=>x.id!==r.id));
    setToast({msg:`${r.nom} supprimé définitivement`,type:"error"});
    setModaleDelete(null);
  }

  const selCls = "text-[13px] px-3 py-2 rounded-xl border outline-none cursor-pointer font-medium";

  const badgeStatut = (s) => {
    const cfg = {
      valide:   {bg:status.success.bg, color:status.success.text, border:status.success.border, label:"Actif"},
      rejete:   {bg:status.danger.bg,  color:status.danger.text,  border:status.danger.border,  label:"Refusé"},
      suspendu: {bg:"#fff7ed", color:"#9a3412", border:"#fed7aa", label:"Suspendu"},
    }[s] || {bg:status.neutral.bg, color:status.neutral.text, border:status.neutral.border, label:s};
    return (
      <span className="inline-block px-2.5 py-1 rounded-full text-[12px] font-semibold"
        style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background: status.danger.bg}}>
            <Trash2 size={19} color="#dc2626"/>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: txt.primary }}>
              Corbeille
            </h1>
            <p className="text-[15px] mt-0.5" style={{ color: txt.muted }}>
              {rows.length} compte{rows.length>1?"s":""} en corbeille — suppression définitive après 30 jours
            </p>
          </div>
        </div>
      </div>

      {/* ── Bandeau urgence ── */}
      {urgences.length > 0 && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border"
          style={{ borderColor: status.danger.border, background: status.danger.bg }}>
          <AlertTriangle size={17} className="shrink-0 mt-0.5" style={{ color: status.danger.text }}/>
          <div>
            <p className="text-[15px] font-bold" style={{ color: status.danger.text }}>
              {urgences.length} compte{urgences.length>1?"s":""} expire{urgences.length>1?"nt":""} dans moins de 3 jours
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: status.danger.text }}>
              {urgences.map(r=>r.nom).join(", ")} — restaurez-les ou ils seront supprimés définitivement.
            </p>
          </div>
        </div>
      )}

      <TableCard dark={dark}>
        <div className="flex items-center gap-3 flex-wrap px-5 py-3 border-b" style={{ borderColor: surface.border }}>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium" style={{ color: txt.subtle }}>Ville :</span>
            <select value={villeFiltre} onChange={e=>{setVilleFiltre(e.target.value);setPage(1);}}
              className={selCls} style={{ background: surface.card, borderColor: surface.border, color: txt.secondary }}>
              {VILLES_CM.map(v=><option key={v} value={v}>{v==="Toutes"?"Toutes les villes":v}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium" style={{ color: txt.subtle }}>Statut :</span>
            <select value={statutFiltre} onChange={e=>{setStatutFiltre(e.target.value);setPage(1);}}
              className={selCls} style={{ background: surface.card, borderColor: surface.border, color: txt.secondary }}>
              {STATUTS.map(s=><option key={s} value={s}>
                {s==="Tous"?"Tous les statuts":s==="valide"?"Actif":s==="rejete"?"Refusé":"Suspendu"}
              </option>)}
            </select>
          </div>
          {(villeFiltre!=="Toutes"||statutFiltre!=="Tous") && (
            <button onClick={()=>{setVilleFiltre("Toutes");setStatutFiltre("Tous");setPage(1);}}
              className="text-[14px] font-medium px-3 py-1.5 rounded-xl border transition-colors"
              style={{ borderColor: surface.border, color: txt.subtle }}>
              Réinitialiser
            </button>
          )}
        </div>

        <TableContainer dark={dark}>
          <thead>
            <tr>
              <Th dark={dark}>Médecin</Th>
              <Th dark={dark}>CNOM</Th>
              <Th dark={dark}>Ville</Th>
              <Th dark={dark}>Ancien statut</Th>
              <Th dark={dark}>Supprimé le</Th>
              <Th dark={dark}>Expiration</Th>
              <Th dark={dark} style={{ width: 80 }}>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.length===0
              ? <tr><td colSpan={7} className="px-5 py-16 text-center text-[14px]" style={{ color: txt.subtle, borderBottom: `1px solid ${surface.borderSoft}` }}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: surface.bg }}>
                      <Trash2 size={22} style={{ color: surface.border }}/>
                    </div>
                    <p>La corbeille est vide</p>
                  </div>
                </td></tr>
              : paginated.map(r => {
                  const jours = joursRestants(r.dateSuppression);
                  const clr   = couleurJours(jours);
                  const isMenuOpen = openMenuId === r.id;

                  return (
                    <Tr key={r.id} dark={dark}>

                      <Td dark={dark}>
                        <div className="opacity-60">
                          <PersonCell dark={dark} avatarColor={avatarColor(r.nom)} initials={r.initials}
                            name={r.nom} subtitle={r.specialite} onClick={()=>setModalePhoto(r)} photoUrl={r.photo_url} />
                        </div>
                      </Td>

                      <Td dark={dark}><MutedText dark={dark} mono>{r.cnom}</MutedText></Td>
                      <Td dark={dark}><MutedText dark={dark}>{r.ville}</MutedText></Td>
                      <Td dark={dark}>{badgeStatut(r.ancienStatut)}</Td>
                      <Td dark={dark}><SubtleText dark={dark}>{fmt(r.dateSuppression)}</SubtleText></Td>

                      <Td dark={dark}>
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} style={{color:clr.color,flexShrink:0}}/>
                          <span className="inline-block px-2.5 py-1 rounded-full text-[12px] font-bold"
                            style={{ background:clr.bg, color:clr.color, border:`1px solid ${clr.border}` }}>
                            {jours === 0 ? "Expire aujourd'hui" : `${jours}j restant${jours>1?"s":""}`}
                          </span>
                        </div>
                      </Td>

                      <Td dark={dark}>
                        <div className="relative flex justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(isMenuOpen ? null : r.id);
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
                              className={`absolute right-0 top-full mt-1.5 z-30 min-w-[200px] rounded-xl border shadow-xl overflow-hidden
                                ${dark?"bg-[#161b22] border-[#30363d]":"bg-white border-gray-200"}`}
                              style={{ transformOrigin: "top right" }}
                            >
                              <button
                                onClick={() => {
                                  setModaleRestore(r);
                                  setOpenMenuId(null);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium transition-colors
                                  ${dark?"text-teal-400 hover:bg-teal-900/20":"text-teal-700 hover:bg-teal-50"}`}
                              >
                                <RotateCcw size={14} className="shrink-0" />
                                Restaurer le compte
                              </button>

                              <div className={`border-t ${dark?"border-[#21262d]":"border-gray-100"}`} />

                              <button
                                onClick={() => {
                                  setModaleDelete(r);
                                  setOpenMenuId(null);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium transition-colors
                                  ${dark?"text-red-400 hover:bg-red-900/20":"text-red-700 hover:bg-red-50"}`}
                              >
                                <Trash2 size={14} className="shrink-0" />
                                Supprimer définitivement
                              </button>
                            </div>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  );
                })
            }
          </tbody>
        </TableContainer>

      </TableCard>

      <PaginationBar dark={dark}>
        <span>Affichage {from} à {to} sur {filtered.length} compte{filtered.length>1?"s":""}</span>
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

      {/* ── Note auto-suppression ── */}
      <p className="text-[13px] text-center" style={{ color: txt.subtle }}>
        Les comptes en corbeille sont supprimés automatiquement après 30 jours · Restaurez-les avant expiration
      </p>

      {/* ── Modal Restaurer ── */}
      {modaleRestore && (
        <Modal dark={dark} onClose={()=>setModaleRestore(null)}
          title="Restaurer le compte" sub={modaleRestore.nom}
          footer={<>
            <button onClick={()=>setModaleRestore(null)} className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold border"
              style={{ borderColor: surface.border, color: txt.muted }}>Annuler</button>
            <button onClick={()=>handleRestore(modaleRestore)}
              className="flex-1 py-2.5 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2"
              style={{background:brand.DEFAULT}}>
              <RotateCcw size={14}/> Restaurer
            </button>
          </>}>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border text-[13px]"
              style={{ borderColor: "#bbf7d0", background: dark?"rgba(0,158,130,0.10)":"#f0fdf4", color: brand.dark }}>
              <RotateCcw size={15} className="shrink-0 mt-0.5"/>
              <span>Le compte de <strong>{modaleRestore.nom}</strong> sera restauré avec son statut précédent.</span>
            </div>
            <div className="rounded-xl border px-4 py-3 text-[13px]" style={{ background: surface.bg, borderColor: surface.border }}>
              {[
                {l:"Médecin",        v:modaleRestore.nom},
                {l:"CNOM",           v:modaleRestore.cnom},
                {l:"Ancien statut",  v:modaleRestore.ancienStatut},
                {l:"Supprimé le",    v:fmt(modaleRestore.dateSuppression)},
                {l:"Jours restants", v:`${joursRestants(modaleRestore.dateSuppression)} jours`},
                {l:"Supprimé par",   v:modaleRestore.supprimePar},
                {l:"Motif",          v:modaleRestore.motifSuppression},
              ].map(({l,v})=>(
                <div key={l} className="flex items-start justify-between gap-3 py-1.5 border-b last:border-0" style={{borderColor: surface.borderSoft}}>
                  <span style={{ color: txt.subtle }}>{l}</span>
                  <span className="font-semibold text-right max-w-[200px]" style={{ color: txt.secondary }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal Suppression définitive ── */}
      {modaleDelete && (
        <Modal dark={dark} onClose={()=>setModaleDelete(null)}
          title="Supprimer définitivement" sub={modaleDelete.nom}
          footer={<>
            <button onClick={()=>setModaleDelete(null)} className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold border"
              style={{ borderColor: surface.border, color: txt.muted }}>Annuler</button>
            <button onClick={()=>handleDeleteDefinitif(modaleDelete)}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold flex items-center justify-center gap-2">
              <Trash2 size={14}/> Supprimer définitivement
            </button>
          </>}>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border text-[13px]"
              style={{ borderColor: status.danger.border, background: status.danger.bg, color: status.danger.text }}>
              <AlertTriangle size={15} className="shrink-0 mt-0.5"/>
              <span>Supprimer définitivement <strong>{modaleDelete.nom}</strong> ? Toutes les données seront effacées de la base. Action irréversible.</span>
            </div>
            <div className="rounded-xl border px-4 py-3 text-[13px]" style={{ background: surface.bg, borderColor: surface.border }}>
              {[
                {l:"Médecin",       v:modaleDelete.nom},
                {l:"CNOM",          v:modaleDelete.cnom},
                {l:"Email",         v:modaleDelete.email},
                {l:"Supprimé par",  v:modaleDelete.supprimePar},
                {l:"Motif",         v:modaleDelete.motifSuppression},
              ].map(({l,v})=>(
                <div key={l} className="flex items-start justify-between gap-3 py-1.5 border-b last:border-0" style={{borderColor: surface.borderSoft}}>
                  <span style={{ color: txt.subtle }}>{l}</span>
                  <span className="font-semibold text-right max-w-[200px]" style={{ color: txt.secondary }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {modalePhoto && <ModalePhoto r={modalePhoto} dark={dark} onClose={()=>setModalePhoto(null)} />}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[14px] font-semibold text-white"
          style={{ background: toast.type==="success" ? brand.DEFAULT : "#dc2626" }}>
          {toast.type==="success" ? <RotateCcw size={15}/> : <Trash2 size={15}/>} {toast.msg}
        </div>
      )}
    </div>
  );
}