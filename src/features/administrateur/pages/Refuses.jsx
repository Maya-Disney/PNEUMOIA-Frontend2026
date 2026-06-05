import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import * as XLSX from "xlsx";
import { Download, Trash2, X } from "lucide-react";

const BRAND = "#0f766e";
const NOW   = new Date();
const sub   = (ms) => new Date(NOW.getTime() - ms);
const pad   = (n)  => String(n).padStart(2, "0");
function fmt(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }

function avatarColor(str) {
  const colors = ["#1D9E75","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"];
  let h = 0;
  for (let i=0; i<str.length; i++) h = str.charCodeAt(i)+((h<<5)-h);
  return colors[Math.abs(h) % colors.length];
}

const MOCK = [
  {
    id:1, initials:"DT", nom:"Dr. Tabi Jonas", specialite:"Pneumologue",
    cnom:"CM-2024-9999", hopital:"Clinique Alpha, Yaoundé", ville:"Yaoundé",
    email:"tabi.jonas@clinique.cm", telephone:"+237 699 001 002",
    dateDemande:fmt(sub(5*24*3600000)), dateRefus:fmt(sub(4*24*3600000)),
    motif:"N° CNOM invalide ou introuvable", refusePar:"Administrateur",
    photo_url: null,
    documents:[
      {label:"Diplôme de spécialisation", statut:"vérifié"},
      {label:"Diplôme de docteur en médecine", statut:"vérifié"},
      {label:"Inscription à l'ordre des médecins", statut:"manquant"},
      {label:"Autorisation d'exercice", statut:"vérifié"},
      {label:"Carte professionnelle", statut:"manquant"},
      {label:"CNI", statut:"vérifié"},
    ],
  },
  {
    id:2, initials:"BM", nom:"Dr. Bella Martin", specialite:"Médecine générale",
    cnom:"CM-2023-0411", hopital:"Cabinet privé, Douala", ville:"Douala",
    email:"bella.martin@cabinet.cm", telephone:"+237 677 200 300",
    dateDemande:fmt(sub(9*24*3600000)), dateRefus:fmt(sub(8*24*3600000)),
    motif:"Spécialité non couverte par la plateforme", refusePar:"Administrateur",
    photo_url: null,
    documents:[
      {label:"Diplôme de spécialisation", statut:"vérifié"},
      {label:"Diplôme de docteur en médecine", statut:"vérifié"},
      {label:"Inscription à l'ordre des médecins", statut:"vérifié"},
      {label:"Autorisation d'exercice", statut:"vérifié"},
      {label:"Carte professionnelle", statut:"vérifié"},
      {label:"CNI", statut:"vérifié"},
    ],
  },
  {
    id:3, initials:"NK", nom:"Dr. Nguele Kali", specialite:"Pneumologue",
    cnom:"CM-2021-0887", hopital:"CHU Garoua", ville:"Garoua",
    email:"nguele.kali@chu.cm", telephone:"+237 655 400 500",
    dateDemande:fmt(sub(14*24*3600000)), dateRefus:fmt(sub(12*24*3600000)),
    motif:"Documents manquants ou expirés", refusePar:"Administrateur",
    photo_url: null,
    documents:[
      {label:"Diplôme de spécialisation", statut:"vérifié"},
      {label:"Diplôme de docteur en médecine", statut:"expiré"},
      {label:"Inscription à l'ordre des médecins", statut:"vérifié"},
      {label:"Autorisation d'exercice", statut:"expiré"},
      {label:"Carte professionnelle", statut:"vérifié"},
      {label:"CNI", statut:"vérifié"},
    ],
  },
];

// ── Modal shell ────────────────────────────────────────────────────────────────
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
            <X size={13}/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className={`shrink-0 flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>{footer}</div>}
      </div>
    </div>
  );
}

// ── Modal Photo ────────────────────────────────────────────────────────────────
function ModalePhoto({ r, onClose, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={r.nom} sub="Photo d'identité (CNI)"
      footer={<button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Fermer</button>}>
      <div className="flex flex-col items-center gap-4 py-4">
        {r.photo_url
          ? <img src={r.photo_url} alt={r.nom} className="w-36 h-36 rounded-full object-cover border-2 border-gray-200 shadow"/>
          : <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark?"border-[#21262d] bg-[#0d1117] text-[#484f58]":"border-gray-200 bg-gray-50 text-gray-300"}`}>
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span className="text-[10px] text-center px-2">Aucune photo</span>
            </div>
        }
        <div className="text-center">
          <p className={`text-[12px] font-bold ${dark?"text-white":"text-gray-800"}`}>{r.nom}</p>
          <p className={`text-[10px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{r.specialite} · CNOM {r.cnom}</p>
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

// ── Composant principal ────────────────────────────────────────────────────────
export default function Refusees() {
  const { dark } = useOutletContext() || {};
  const [rows,         setRows]         = useState(MOCK);
  const [target,       setTarget]       = useState(null);
  const [modalePhoto,  setModalePhoto]  = useState(null);
  const [toast,        setToast]        = useState(null);
  const [page,         setPage]         = useState(1);
  const [perPage,      setPerPage]      = useState(10);

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const paginated  = rows.slice((page-1)*perPage, page*perPage);
  const from = rows.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, rows.length);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function supprimer(r) {
    setRows(p => p.filter(x => x.id !== r.id));
    setToast(`Dossier de ${r.nom} supprimé`);
    setTarget(null);
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(rows.map((r, i) => ({
      "#": i+1, Nom: r.nom, CNOM: r.cnom, Spécialité: r.specialite,
      Établissement: r.hopital, Ville: r.ville,
      "Date demande": r.dateDemande, "Date refus": r.dateRefus,
      Motif: r.motif, "Refusé par": r.refusePar,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Refusées");
    XLSX.writeFile(wb, `refusees_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const th = `px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-b ${dark?"text-[#484f58] border-[#21262d] bg-[#0d1117]/50":"text-gray-400 border-gray-100 bg-gray-50"}`;
  const td = `px-4 py-3 border-b ${dark?"border-[#21262d]":"border-gray-50"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>
            Inscriptions refusées
          </h1>
          <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>
            {rows.length} dossier{rows.length>1?"s":""} refusé{rows.length>1?"s":""} — consultation et suppression possible
          </p>
        </div>
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e]"
          onMouseEnter={e=>{e.currentTarget.style.background=BRAND;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=BRAND;}}
          onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color="";e.currentTarget.style.borderColor="";}}>
          <Download size={13}/> Export Excel
        </button>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{minWidth:780}}>
            <thead>
              <tr>
                <th className={th}>Médecin</th>
                <th className={th}>CNOM</th>
                <th className={th}>Établissement</th>
                <th className={th}>Date demande</th>
                <th className={th}>Date refus</th>
                <th className={th}>Motif du refus</th>
                <th className={th}>Refusé par</th>
                <th className={`${th} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0
                ? <tr><td colSpan={8} className={`${td} text-center py-14 text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>Aucun dossier refusé</td></tr>
                : paginated.map(r => (
                  <tr key={r.id} className={`transition-colors ${dark?"hover:bg-[#0d1117]/60":"hover:bg-gray-50/80"}`}>
                    <td className={td}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 group-hover:opacity-75 transition-opacity"
                          style={{background: avatarColor(r.nom), cursor:"pointer"}} onClick={()=>setModalePhoto(r)} title="Voir la photo CNI">
                          {r.initials}
                        </div>
                        <div>
                          <p className={`text-[12px] font-bold cursor-pointer hover:underline underline-offset-2 ${dark?"text-white":"text-gray-800"}`} onClick={()=>setModalePhoto(r)}>{r.nom}</p>
                          <p className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{r.specialite}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${td} text-[11px] font-mono ${dark?"text-[#484f58]":"text-gray-400"}`}>{r.cnom}</td>
                    <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`}>{r.hopital}</td>
                    <td className={`${td} text-[11px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{r.dateDemande}</td>
                    <td className={`${td} text-[11px] font-semibold text-red-500`}>{r.dateRefus}</td>
                    <td className={td}>
                      <span style={{display:"inline-block",padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,background:"#fef2f2",color:"#991b1b",border:"1px solid #fca5a5",whiteSpace:"nowrap"}}>
                        {r.motif}
                      </span>
                    </td>
                    <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`}>{r.refusePar}</td>
                    <td className={`${td} text-center`}>
                      <button onClick={() => setTarget(r)}
                        className="flex items-center gap-1.5 mx-auto px-3 py-1.5 text-[11px] font-bold rounded-xl border border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                        <Trash2 size={11} /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t text-[11px] ${dark?"border-[#21262d] text-[#484f58]":"border-gray-50 text-gray-400"}`}>
          <span>Affichage {from} à {to} sur {rows.length} dossier{rows.length>1?"s":""}</span>
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

      {/* Modal suppression rapide */}
      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setTarget(null)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>Supprimer définitivement</p>
              <button onClick={()=>setTarget(null)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-[11px]">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>Supprimer le dossier de <strong>{target.nom}</strong> ? Action irréversible.</span>
              </div>
              <div className={`rounded-xl border px-4 py-3 text-[11px] ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
                {[{l:"Médecin",v:target.nom},{l:"CNOM",v:target.cnom},{l:"Motif",v:target.motif},{l:"Refusé le",v:target.dateRefus}].map(({l,v})=>(
                  <div key={l} className={`flex items-center justify-between py-1.5 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
                    <span className={dark?"text-[#484f58]":"text-gray-400"}>{l}</span>
                    <span className={`font-semibold ${dark?"text-[#8b949e]":"text-gray-700"}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setTarget(null)} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Annuler</button>
              <button onClick={()=>supprimer(target)} className="flex-1 py-2 rounded-xl text-[12px] font-bold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1.5">
                <Trash2 size={12}/> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {modalePhoto  && <ModalePhoto   r={modalePhoto}  dark={dark} onClose={()=>setModalePhoto(null)}/>}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white bg-red-600">
          <Trash2 size={13}/> {toast}
        </div>
      )}
    </div>
  );
}