import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2, X, RotateCcw, AlertTriangle, Clock } from "lucide-react";

const BRAND = "#0f766e";
const NOW   = new Date();
const sub   = (ms) => new Date(NOW.getTime() - ms);
const pad   = (n)  => String(n).padStart(2, "0");
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

const MOCK = [
  { id:1, initials:"DT", nom:"Dr. Tabi Jonas",   specialite:"Pneumologue",
    cnom:"CM-2024-9999", hopital:"Clinique Alpha", ville:"Yaoundé",
    email:"tabi.jonas@clinique.cm",
    ancienStatut:"rejete", dateSuppression:sub(2*24*3600000),
    supprimePar:"Administrateur", motifSuppression:"Dossier refusé — N° CNOM invalide" },
  { id:2, initials:"MB", nom:"Dr. Martin Biya",   specialite:"Pneumologue",
    cnom:"CM-2021-0543", hopital:"Clinique Bleue", ville:"Douala",
    email:"martin.biya@pneumo.cm",
    ancienStatut:"valide", dateSuppression:sub(10*24*3600000),
    supprimePar:"Administrateur", motifSuppression:"Compte supprimé à la demande" },
  { id:3, initials:"BM", nom:"Dr. Bella Martin",  specialite:"Médecine générale",
    cnom:"CM-2023-0411", hopital:"Cabinet privé", ville:"Douala",
    email:"bella.martin@cabinet.cm",
    ancienStatut:"rejete", dateSuppression:sub(27*24*3600000),
    supprimePar:"Administrateur", motifSuppression:"Spécialité non couverte" },
  { id:4, initials:"JD", nom:"Dr. Jean Dupont",   specialite:"Pneumologue",
    cnom:"CM-2019-0847", hopital:"H. Général Douala", ville:"Douala",
    email:"j.dupont@hgd.cm",
    ancienStatut:"suspendu", dateSuppression:sub(5*24*3600000),
    supprimePar:"Administrateur", motifSuppression:"Comportement non conforme" },
];

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ onClose, title, sub: subtitle, children, footer, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <div>
            <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>{title}</p>
            {subtitle&&<p className={`text-[10px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer&&<div className={`shrink-0 flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>{footer}</div>}
      </div>
    </div>
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

export default function Corbeille() {
  const { dark } = useOutletContext() || {};
  const [rows,          setRows]         = useState(MOCK);
  const [modaleRestore, setModaleRestore] = useState(null);
  const [modaleDelete,  setModaleDelete]  = useState(null);
  const [toast,         setToast]         = useState(null);
  const [page,          setPage]          = useState(1);
  const [perPage,       setPerPage]       = useState(10);
  const [villeFiltre,   setVilleFiltre]   = useState("Toutes");
  const [statutFiltre,  setStatutFiltre]  = useState("Tous");

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

  // Urgences — médecins qui expirent dans 3 jours
  const urgences = filtered.filter(r => joursRestants(r.dateSuppression) <= 3);

  useEffect(()=>{
    if (!toast) return;
    const t = setTimeout(()=>setToast(null),3500);
    return ()=>clearTimeout(t);
  },[toast]);

  async function handleRestore(r) {
    // TODO: await restaurerMedecin(r.id)
    setRows(p=>p.filter(x=>x.id!==r.id));
    setToast({msg:`${r.nom} restauré — statut "${r.ancienStatut}"`,type:"success"});
    setModaleRestore(null);
  }

  async function handleDeleteDefinitif(r) {
    // TODO: await supprimerDefinitivement(r.id)
    setRows(p=>p.filter(x=>x.id!==r.id));
    setToast({msg:`${r.nom} supprimé définitivement`,type:"error"});
    setModaleDelete(null);
  }

  const th = `px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-b ${dark?"text-[#484f58] border-[#21262d] bg-[#0d1117]/50":"text-gray-400 border-gray-100 bg-gray-50"}`;
  const td = `px-4 py-3 border-b ${dark?"border-[#21262d]":"border-gray-50"}`;

  const badgeStatut = (s) => {
    const cfg = {
      valide:   {bg:"#ecfdf5",color:"#065f46",border:"#6ee7b7",label:"Actif"},
      rejete:   {bg:"#fef2f2",color:"#991b1b",border:"#fca5a5",label:"Refusé"},
      suspendu: {bg:"#fff7ed",color:"#9a3412",border:"#fed7aa",label:"Suspendu"},
    }[s] || {bg:"#f3f4f6",color:"#6b7280",border:"#e5e7eb",label:s};
    return (
      <span style={{display:"inline-block",padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:600,
        background:cfg.bg,color:cfg.color,border:`0.5px solid ${cfg.border}`}}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"#fef2f2"}}>
              <Trash2 size={17} color="#dc2626"/>
            </div>
            <div>
              <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>
                Corbeille
              </h1>
              <p className={`text-[12px] mt-0.5 ${dark?"text-[#8b949e]":"text-gray-400"}`}>
                {rows.length} compte{rows.length>1?"s":""} en corbeille — suppression définitive après 30 jours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bandeau urgence */}
      {urgences.length > 0 && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700/40">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400"/>
          <div>
            <p className="text-[12px] font-bold text-red-700 dark:text-red-400">
              {urgences.length} compte{urgences.length>1?"s":""} expire{urgences.length>1?"nt":""} dans moins de 3 jours
            </p>
            <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">
              {urgences.map(r=>r.nom).join(", ")} — restaurez-les ou ils seront supprimés définitivement.
            </p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-medium ${dark?"text-[#484f58]":"text-gray-400"}`}>Ville :</span>
          <select value={villeFiltre} onChange={e=>{setVilleFiltre(e.target.value);setPage(1);}}
            className={`text-[11px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-medium ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
            {VILLES_CM.map(v=><option key={v} value={v}>{v==="Toutes"?"Toutes les villes":v}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-medium ${dark?"text-[#484f58]":"text-gray-400"}`}>Statut :</span>
          <select value={statutFiltre} onChange={e=>{setStatutFiltre(e.target.value);setPage(1);}}
            className={`text-[11px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-medium ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
            {STATUTS.map(s=><option key={s} value={s}>
              {s==="Tous"?"Tous les statuts":s==="valide"?"Actif":s==="rejete"?"Refusé":"Suspendu"}
            </option>)}
          </select>
        </div>
        {(villeFiltre!=="Toutes"||statutFiltre!=="Tous") && (
          <button onClick={()=>{setVilleFiltre("Toutes");setStatutFiltre("Tous");setPage(1);}}
            className={`text-[11px] font-medium px-3 py-1.5 rounded-xl border transition-colors ${dark?"border-[#21262d] text-[#484f58] hover:text-white":"border-gray-200 text-gray-400 hover:text-gray-700"}`}>
            Réinitialiser
          </button>
        )}
      </div>

      {/* Tableau */}
      <div className={`rounded-2xl border overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{minWidth:860}}>
            <thead>
              <tr>
                <th className={th}>Médecin</th>
                <th className={th}>CNOM</th>
                <th className={th}>Ville</th>
                <th className={th}>Ancien statut</th>
                <th className={th}>Supprimé le</th>
                <th className={th}>Supprimé par</th>
                <th className={th}>Motif</th>
                <th className={th}>Expiration</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length===0
                ? <tr><td colSpan={9} className={`${td} text-center py-16 text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dark?"bg-[#0d1117]":"bg-gray-50"}`}>
                        <Trash2 size={20} className={dark?"text-[#21262d]":"text-gray-200"}/>
                      </div>
                      <p>La corbeille est vide</p>
                    </div>
                  </td></tr>
                : paginated.map(r=>{
                  const jours = joursRestants(r.dateSuppression);
                  const clr   = couleurJours(jours);
                  return (
                    <tr key={r.id} className={`transition-colors ${dark?"hover:bg-[#0d1117]/60":"hover:bg-gray-50/80"}`}>

                      {/* Médecin */}
                      <td className={td}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 opacity-60"
                            style={{background:avatarColor(r.nom)}}>
                            {r.initials}
                          </div>
                          <div>
                            <p className={`text-[12px] font-bold ${dark?"text-[#8b949e]":"text-gray-500"}`}>{r.nom}</p>
                            <p className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{r.specialite}</p>
                          </div>
                        </div>
                      </td>

                      <td className={`${td} text-[11px] font-mono ${dark?"text-[#484f58]":"text-gray-400"}`}>{r.cnom}</td>
                      <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`}>{r.ville}</td>
                      <td className={td}>{badgeStatut(r.ancienStatut)}</td>
                      <td className={`${td} text-[11px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{fmt(r.dateSuppression)}</td>
                      <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`}>{r.supprimePar}</td>
                      <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`} style={{maxWidth:180}}>
                        <span className="line-clamp-2">{r.motifSuppression}</span>
                      </td>

                      {/* Timer expiration */}
                      <td className={td}>
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} style={{color:clr.color,flexShrink:0}}/>
                          <span style={{
                            display:"inline-block",padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700,
                            background:clr.bg,color:clr.color,border:`0.5px solid ${clr.border}`
                          }}>
                            {jours === 0 ? "Expire aujourd'hui" : `${jours}j restant${jours>1?"s":""}`}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className={td}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          {/* Restaurer */}
                          <button onClick={()=>setModaleRestore(r)}
                            style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:4,
                              width:84,height:28,fontSize:10,fontWeight:700,borderRadius:8,cursor:"pointer",
                              border:"1px solid #bbf7d0",background:"#f0fdf4",color:BRAND,flexShrink:0}}
                            onMouseEnter={e=>{e.currentTarget.style.background=BRAND;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=BRAND;}}
                            onMouseLeave={e=>{e.currentTarget.style.background="#f0fdf4";e.currentTarget.style.color=BRAND;e.currentTarget.style.borderColor="#bbf7d0";}}>
                            <RotateCcw size={10}/> Restaurer
                          </button>
                          {/* Supprimer définitivement */}
                          <button onClick={()=>setModaleDelete(r)}
                            style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:4,
                              width:84,height:28,fontSize:10,fontWeight:700,borderRadius:8,cursor:"pointer",
                              border:"1px solid #fca5a5",background:"#fef2f2",color:"#dc2626",flexShrink:0}}
                            onMouseEnter={e=>{e.currentTarget.style.background="#fee2e2";}}
                            onMouseLeave={e=>{e.currentTarget.style.background="#fef2f2";}}>
                            <Trash2 size={10}/> Supprimer
                          </button>
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
          <span>Affichage {from} à {to} sur {filtered.length} compte{filtered.length>1?"s":""}</span>
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

      {/* Note auto-suppression */}
      <p className={`text-[11px] text-center ${dark?"text-[#484f58]":"text-gray-300"}`}>
        Les comptes en corbeille sont supprimés automatiquement après 30 jours · Restaurez-les avant expiration
      </p>

      {/* Modal Restaurer */}
      {modaleRestore && (
        <Modal dark={dark} onClose={()=>setModaleRestore(null)}
          title="Restaurer le compte" sub={modaleRestore.nom}
          footer={<>
            <button onClick={()=>setModaleRestore(null)} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
            <button onClick={()=>handleRestore(modaleRestore)}
              className="flex-1 py-2 rounded-xl text-[12px] font-bold text-white flex items-center justify-center gap-2"
              style={{background:BRAND}}>
              <RotateCcw size={12}/> Restaurer
            </button>
          </>}>
          <div className="flex flex-col gap-3">
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-[11px] ${dark?"bg-teal-900/20 border-teal-700/40 text-teal-300":"bg-teal-50 border-teal-200 text-teal-700"}`}>
              <RotateCcw size={13} className="shrink-0 mt-0.5"/>
              <span>Le compte de <strong>{modaleRestore.nom}</strong> sera restauré avec son statut précédent.</span>
            </div>
            <div className={`rounded-xl border px-4 py-3 text-[11px] ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
              {[
                {l:"Médecin",        v:modaleRestore.nom},
                {l:"CNOM",           v:modaleRestore.cnom},
                {l:"Ancien statut",  v:modaleRestore.ancienStatut},
                {l:"Supprimé le",    v:fmt(modaleRestore.dateSuppression)},
                {l:"Jours restants", v:`${joursRestants(modaleRestore.dateSuppression)} jours`},
              ].map(({l,v})=>(
                <div key={l} className={`flex items-center justify-between py-1.5 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
                  <span className={dark?"text-[#484f58]":"text-gray-400"}>{l}</span>
                  <span className={`font-semibold ${dark?"text-[#8b949e]":"text-gray-700"}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Suppression définitive */}
      {modaleDelete && (
        <Modal dark={dark} onClose={()=>setModaleDelete(null)}
          title="Supprimer définitivement" sub={modaleDelete.nom}
          footer={<>
            <button onClick={()=>setModaleDelete(null)} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
            <button onClick={()=>handleDeleteDefinitif(modaleDelete)}
              className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold flex items-center justify-center gap-2">
              <Trash2 size={12}/> Supprimer définitivement
            </button>
          </>}>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-700/40 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[11px]">
              <AlertTriangle size={13} className="shrink-0 mt-0.5"/>
              <span>Supprimer définitivement <strong>{modaleDelete.nom}</strong> ? Toutes les données seront effacées de la base. Action irréversible.</span>
            </div>
            <div className={`rounded-xl border px-4 py-3 text-[11px] ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
              {[
                {l:"Médecin",  v:modaleDelete.nom},
                {l:"CNOM",    v:modaleDelete.cnom},
                {l:"Email",   v:modaleDelete.email},
              ].map(({l,v})=>(
                <div key={l} className={`flex items-center justify-between py-1.5 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
                  <span className={dark?"text-[#484f58]":"text-gray-400"}>{l}</span>
                  <span className={`font-semibold ${dark?"text-[#8b949e]":"text-gray-700"}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white ${toast.type==="success"?"bg-teal-600":"bg-red-600"}`}>
          {toast.type==="success"?<RotateCcw size={13}/>:<Trash2 size={13}/>} {toast.msg}
        </div>
      )}
    </div>
  );
}