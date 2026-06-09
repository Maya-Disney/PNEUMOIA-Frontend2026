import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import * as XLSX from "xlsx";
import { Download, Trash2, X, Send, Mail } from "lucide-react";

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

const VILLES_CM = ["Yaoundé","Douala","Bafoussam","Garoua","Maroua","Ngaoundéré","Bertoua","Ebolowa","Buéa","Limbé"];

const MOCK = [
  { id:1, initials:"DT", nom:"Dr. Tabi Jonas",    specialite:"Pneumologue",
    cnom:"CM-2024-9999", hopital:"Clinique Alpha", ville:"Yaoundé",
    email:"tabi.jonas@clinique.cm", telephone:"+237 699 001 002",
    dateDemande:fmt(sub(5*24*3600000)), dateRefus:fmt(sub(4*24*3600000)),
    motif:"N° CNOM invalide ou introuvable", refusePar:"Administrateur",
    photo_url:null, relanceSent:false },
  { id:2, initials:"BM", nom:"Dr. Bella Martin",  specialite:"Médecine générale",
    cnom:"CM-2023-0411", hopital:"Cabinet privé", ville:"Douala",
    email:"bella.martin@cabinet.cm", telephone:"+237 677 200 300",
    dateDemande:fmt(sub(9*24*3600000)), dateRefus:fmt(sub(8*24*3600000)),
    motif:"Spécialité non couverte", refusePar:"Administrateur",
    photo_url:null, relanceSent:true },
  { id:3, initials:"NK", nom:"Dr. Nguele Kali",   specialite:"Pneumologue",
    cnom:"CM-2021-0887", hopital:"CHU Garoua",    ville:"Garoua",
    email:"nguele.kali@chu.cm", telephone:"+237 655 400 500",
    dateDemande:fmt(sub(14*24*3600000)), dateRefus:fmt(sub(12*24*3600000)),
    motif:"Documents manquants ou expirés", refusePar:"Administrateur",
    photo_url:null, relanceSent:false },
  { id:4, initials:"AM", nom:"Dr. Abena Meka",    specialite:"Pneumologue",
    cnom:"CM-2022-1145", hopital:"Hôpital Central", ville:"Yaoundé",
    email:"abena.meka@hc.cm", telephone:"+237 677 100 200",
    dateDemande:fmt(sub(20*24*3600000)), dateRefus:fmt(sub(18*24*3600000)),
    motif:"Informations incohérentes", refusePar:"Administrateur",
    photo_url:null, relanceSent:false },
  { id:5, initials:"PF", nom:"Dr. Paul Fotso",    specialite:"Pneumologue",
    cnom:"CM-2023-0320", hopital:"Clinique du Littoral", ville:"Douala",
    email:"paul.fotso@cl.cm", telephone:"+237 699 300 400",
    dateDemande:fmt(sub(25*24*3600000)), dateRefus:fmt(sub(23*24*3600000)),
    motif:"Dossier incomplet", refusePar:"Administrateur",
    photo_url:null, relanceSent:false },
];

// ── Modal shell ────────────────────────────────────────────────────────────────
function Modal({ onClose, title, sub: subtitle, wide, children, footer, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`w-full ${wide?"max-w-2xl":"max-w-lg"} max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
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

function ModalePhoto({ r, onClose, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={r.nom} sub="Photo d'identité (CNI)"
      footer={<button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Fermer</button>}>
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

function ModaleRelance({ r, onClose, onConfirm, dark }) {
  const [msg, setMsg] = useState(
    `Bonjour ${r.nom},\n\nVotre demande d'inscription sur PneumoIA a été refusée pour le motif suivant :\n\n« ${r.motif} »\n\nNous vous invitons à corriger les éléments manquants et à soumettre une nouvelle demande depuis votre espace.\n\nCordialement,\nL'équipe PneumoIA`
  );
  const inp = `w-full text-[12px] px-3 py-2 rounded-xl border outline-none resize-none ${dark?"bg-[#0d1117] border-[#21262d] text-white":"bg-gray-50 border-gray-200 text-gray-800"}`;
  return (
    <Modal dark={dark} onClose={onClose} title="Relancer par e-mail" sub={`${r.nom} · ${r.email}`}
      footer={<>
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
        <button onClick={()=>onConfirm(msg)}
          className="flex-1 py-2 rounded-xl text-[12px] font-bold text-white flex items-center justify-center gap-2"
          style={{background:BRAND}}>
          <Send size={12}/> Envoyer l'e-mail
        </button>
      </>}>
      <div className="flex flex-col gap-4">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
          <Mail size={14} className={dark?"text-[#484f58]":"text-gray-400"}/>
          <div>
            <p className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>Destinataire</p>
            <p className={`text-[12px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{r.email}</p>
          </div>
        </div>
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-[11px] ${dark?"bg-amber-900/20 border-amber-700/40 text-amber-300":"bg-amber-50 border-amber-200 text-amber-700"}`}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>Motif : <strong>{r.motif}</strong></span>
        </div>
        <div>
          <label className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>
            Message <span className={`font-normal ${dark?"text-[#484f58]":"text-gray-400"}`}>(modifiable)</span>
          </label>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={9} className={inp}/>
        </div>
        <p className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>
          Le médecin recevra cet e-mail et pourra corriger son dossier et soumettre à nouveau.
        </p>
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

export default function Refusees() {
  const { dark } = useOutletContext() || {};
  const [rows,          setRows]         = useState(MOCK);
  const [target,        setTarget]       = useState(null);
  const [modalePhoto,   setModalePhoto]  = useState(null);
  const [modaleRelance, setModaleRelance]= useState(null);
  const [toast,         setToast]        = useState(null);
  const [page,          setPage]         = useState(1);
  const [perPage,       setPerPage]      = useState(10);
  const [villeFiltre,   setVilleFiltre]  = useState("Toutes");
  const [motifFiltre,   setMotifFiltre]  = useState("Tous");

  // Motifs uniques
  const motifs = ["Tous", ...new Set(rows.map(r=>r.motif))];

  // Filtrage
  const filtered = rows.filter(r => {
    const okVille = villeFiltre==="Toutes" || r.ville===villeFiltre;
    const okMotif = motifFiltre==="Tous"   || r.motif===motifFiltre;
    return okVille && okMotif;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  const paginated  = filtered.slice((page-1)*perPage, page*perPage);
  const from = filtered.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, filtered.length);

  useEffect(()=>{
    if (!toast) return;
    const t = setTimeout(()=>setToast(null),3500);
    return ()=>clearTimeout(t);
  },[toast]);

  function supprimer(r) {
    setRows(p=>p.filter(x=>x.id!==r.id));
    setToast({msg:`Dossier de ${r.nom} supprimé`,type:"error"});
    setTarget(null);
  }

  async function handleRelance(msg) {
    setRows(p=>p.map(r=>r.id===modaleRelance.id?{...r,relanceSent:true}:r));
    setToast({msg:`E-mail envoyé à ${modaleRelance.email}`,type:"success"});
    setModaleRelance(null);
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(filtered.map((r,i)=>({
      "#":i+1,Nom:r.nom,CNOM:r.cnom,Spécialité:r.specialite,
      Établissement:r.hopital,Ville:r.ville,
      "Date demande":r.dateDemande,"Date refus":r.dateRefus,
      Motif:r.motif,"Refusé par":r.refusePar,
      "Relance envoyée":r.relanceSent?"Oui":"Non",
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Refusées");
    XLSX.writeFile(wb,`refusees_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const th = `px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-b ${dark?"text-[#484f58] border-[#21262d] bg-[#0d1117]/50":"text-gray-400 border-gray-100 bg-gray-50"}`;
  const td = `px-4 py-3 border-b ${dark?"border-[#21262d]":"border-gray-50"}`;
  const sel = `text-[11px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-medium ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>
            Inscriptions refusées
          </h1>
          <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>
            {filtered.length} dossier{filtered.length>1?"s":""} refusé{filtered.length>1?"s":""}
          </p>
        </div>
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e]"
          onMouseEnter={e=>{e.currentTarget.style.background=BRAND;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=BRAND;}}
          onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color="";e.currentTarget.style.borderColor="";}}>
          <Download size={13}/> Export Excel
        </button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-medium ${dark?"text-[#484f58]":"text-gray-400"}`}>Ville :</span>
          <select value={villeFiltre} onChange={e=>{setVilleFiltre(e.target.value);setPage(1);}} className={sel}>
            <option value="Toutes">Toutes les villes</option>
            {VILLES_CM.map(v=><option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-medium ${dark?"text-[#484f58]":"text-gray-400"}`}>Motif :</span>
          <select value={motifFiltre} onChange={e=>{setMotifFiltre(e.target.value);setPage(1);}} className={sel}>
            {motifs.map(m=><option key={m} value={m}>{m==="Tous"?"Tous les motifs":m}</option>)}
          </select>
        </div>
        {(villeFiltre!=="Toutes"||motifFiltre!=="Tous") && (
          <button onClick={()=>{setVilleFiltre("Toutes");setMotifFiltre("Tous");setPage(1);}}
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
                <th className={th}>Établissement</th>
                <th className={th}>Ville</th>
                <th className={th}>Demande</th>
                <th className={th}>Refus</th>
                <th className={th}>Motif</th>
                <th className={th}>Refusé par</th>
                <th className={th} style={{width:180}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length===0
                ? <tr><td colSpan={9} className={`${td} text-center py-14 text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>Aucun dossier</td></tr>
                : paginated.map(r=>(
                  <tr key={r.id} className={`transition-colors ${dark?"hover:bg-[#0d1117]/60":"hover:bg-gray-50/80"}`}>

                    {/* Médecin — avatar + nom cliquable pour photo */}
                    <td className={td}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
                          style={{background:avatarColor(r.nom)}} onClick={()=>setModalePhoto(r)} title="Voir photo CNI">
                          {r.initials}
                        </div>
                        <div>
                          <p className={`text-[12px] font-bold cursor-pointer hover:underline underline-offset-2 ${dark?"text-white":"text-gray-800"}`}
                            onClick={()=>setModalePhoto(r)}>{r.nom}</p>
                          <p className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{r.specialite}</p>
                        </div>
                      </div>
                    </td>

                    <td className={`${td} text-[11px] font-mono ${dark?"text-[#484f58]":"text-gray-400"}`}>{r.cnom}</td>
                    <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`}>{r.hopital}</td>
                    <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`}>{r.ville}</td>
                    <td className={`${td} text-[11px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{r.dateDemande}</td>
                    <td className={`${td} text-[11px] font-semibold text-red-500`}>{r.dateRefus}</td>

                    {/* Motif — texte simple sans badge */}
                    <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-600"}`} style={{maxWidth:180}}>
                      <span className="line-clamp-2">{r.motif}</span>
                    </td>

                    <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`}>{r.refusePar}</td>

                    {/* Actions */}
                    <td className={td}>
                      <div style={{display:"flex", alignItems:"center", gap:6}}>
                        {/* Relancer — largeur fixe 80px */}
                        {r.relanceSent
                          ? <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:4,width:80,height:28,fontSize:10,fontWeight:500,borderRadius:8,border:"1px solid #e5e7eb",color:"#d1d5db",flexShrink:0}}>
                              <Mail size={10}/> Relancé
                            </span>
                          : <button onClick={()=>setModaleRelance(r)}
                              style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:4,width:80,height:28,fontSize:10,fontWeight:700,borderRadius:8,border:"1px solid #bbf7d0",background:"#f0fdf4",color:BRAND,flexShrink:0,cursor:"pointer"}}
                              onMouseEnter={e=>{e.currentTarget.style.background=BRAND;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=BRAND;}}
                              onMouseLeave={e=>{e.currentTarget.style.background="#f0fdf4";e.currentTarget.style.color=BRAND;e.currentTarget.style.borderColor="#bbf7d0";}}>
                              <Send size={10}/> Relancer
                            </button>
                        }
                        {/* Supprimer — largeur fixe 80px */}
                        <button onClick={()=>setTarget(r)}
                          style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:4,width:80,height:28,fontSize:10,fontWeight:700,borderRadius:8,border:"1px solid #fca5a5",background:"#fef2f2",color:"#dc2626",flexShrink:0,cursor:"pointer"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="#fee2e2";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="#fef2f2";}}>
                          <Trash2 size={10}/> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t text-[11px] ${dark?"border-[#21262d] text-[#484f58]":"border-gray-50 text-gray-400"}`}>
          <span>Affichage {from} à {to} sur {filtered.length} dossier{filtered.length>1?"s":""}</span>
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

      {/* Modal suppression */}
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
                <span>Supprimer <strong>{target.nom}</strong> ? Action irréversible.</span>
              </div>
              <div className={`rounded-xl border px-4 py-3 text-[11px] ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
                {[{l:"Médecin",v:target.nom},{l:"CNOM",v:target.cnom},{l:"Motif",v:target.motif},{l:"Refusé le",v:target.dateRefus}].map(({l,v})=>(
                  <div key={l} className={`flex items-center justify-between py-1.5 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
                    <span className={dark?"text-[#484f58]":"text-gray-400"}>{l}</span>
                    <span className={`font-semibold truncate max-w-[160px] ${dark?"text-[#8b949e]":"text-gray-700"}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setTarget(null)} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
              <button onClick={()=>supprimer(target)} className="flex-1 py-2 rounded-xl text-[12px] font-bold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1.5">
                <Trash2 size={12}/> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {modalePhoto   && <ModalePhoto    r={modalePhoto}   dark={dark} onClose={()=>setModalePhoto(null)}/>}
      {modaleRelance && <ModaleRelance  r={modaleRelance} dark={dark} onClose={()=>setModaleRelance(null)} onConfirm={handleRelance}/>}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white ${toast.type==="success"?"bg-teal-600":"bg-red-600"}`}>
          {toast.type==="success"?<Mail size={13}/>:<Trash2 size={13}/>} {toast.msg}
        </div>
      )}
    </div>
  );
}