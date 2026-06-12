import { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2, X, Star, Search, AlertTriangle, Bell, MessageSquare, CheckCircle } from "lucide-react";

const BRAND = "#0f766e";
const NOW   = new Date();
const sub   = (ms) => new Date(NOW.getTime() - ms);

function elapsed(d) {
  const dm = Math.floor((Date.now() - d) / 60000);
  if (dm < 60)   return `Il y a ${dm} min`;
  if (dm < 1440) return `Il y a ${Math.floor(dm/60)}h`;
  return `Il y a ${Math.floor(dm/1440)}j`;
}

function avatarColor(str) {
  const colors = ["#1D9E75","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"];
  let h = 0;
  for (let i=0;i<str.length;i++) h=str.charCodeAt(i)+((h<<5)-h);
  return colors[Math.abs(h)%colors.length];
}

const VILLES_CM = ["Toutes","Yaoundé","Douala","Bafoussam","Garoua","Maroua","Ngaoundéré","Bertoua","Ebolowa","Buéa","Limbé"];
const NOTES     = ["Toutes","5","4","3","2","1"];

const MOCK = [
  { id:1, initials:"JD", nom:"Dr. Jean Dupont",   specialite:"Pneumologue", ville:"Douala",  hopital:"H. Général Douala",   photo_url:null, note:5, commentaire:"PneumoIA a révolutionné ma pratique quotidienne. L'IA est précise et les outils de suivi patients sont excellents. Je recommande à tous mes confrères.", date:sub(30*60000),       nouveau:true  },
  { id:2, initials:"DK", nom:"Dr. Kamto Diane",   specialite:"Pneumologue", ville:"Yaoundé", hopital:"CHU Yaoundé",          photo_url:null, note:4, commentaire:"Très bonne plateforme, interface intuitive. J'aurais aimé avoir plus d'options de personnalisation pour les rapports. Globalement très satisfaite.",  date:sub(3*3600000),      nouveau:true  },
  { id:3, initials:"DN", nom:"Dr. Nkoa",           specialite:"Pneumologue", ville:"Douala",  hopital:"H. Général Douala",   photo_url:null, note:2, commentaire:"La plateforme est souvent lente et certaines fonctionnalités ne marchent pas bien sur mobile. Le support ne répond pas vite non plus.",             date:sub(1*24*3600000),   nouveau:true  },
  { id:4, initials:"DB", nom:"Dr. Barry",          specialite:"Pneumologue", ville:"Garoua",  hopital:"H. Régional Garoua",  photo_url:null, note:5, commentaire:"Excellent outil ! La concordance IA m'aide énormément dans les cas complexes de pneumologie. Bravo à toute l'équipe de développement.",             date:sub(2*24*3600000),   nouveau:false },
  { id:5, initials:"AS", nom:"Dr. Aminata Sow",   specialite:"Pneumologue", ville:"Yaoundé", hopital:"Clinique Centrale",    photo_url:null, note:1, commentaire:"Je suis très déçue. Mes données ont été perdues deux fois. C'est inacceptable pour une plateforme médicale. Je ne recommande pas du tout.",         date:sub(4*24*3600000),   nouveau:false },
  { id:6, initials:"PF", nom:"Dr. Paul Fotso",    specialite:"Pneumologue", ville:"Douala",  hopital:"Clinique du Littoral", photo_url:null, note:4, commentaire:"Bonne expérience globale. Le module de partage de cas est très utile pour la communauté médicale. Quelques bugs mineurs à corriger.",              date:sub(5*24*3600000),   nouveau:false },
];

function StarRating({ note, size=14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i=>(
        <Star key={i} size={size} fill={i<=note?"#d97706":"none"} color={i<=note?"#d97706":"#e5e7eb"} strokeWidth={1.5}/>
      ))}
    </div>
  );
}

export default function Commentaires() {
  const { dark } = useOutletContext() || {};
  const [rows,         setRows]        = useState(MOCK);
  const [search,       setSearch]      = useState("");
  const [villeFiltre,  setVilleFiltre] = useState("Toutes");
  const [noteFiltre,   setNoteFiltre]  = useState("Toutes");
  const [statutFiltre, setStatutFiltre]= useState("Tous");
  const [modaleDelete, setModaleDelete]= useState(null);
  const [modaleVider,  setModaleVider] = useState(false);
  const [modalePhoto,  setModalePhoto] = useState(null);
  const [toast,        setToast]       = useState(null);
  const [page,         setPage]        = useState(1);
  const [perPage,      setPerPage]     = useState(10);

  // Timestamp du dernier vidage — les commentaires arrivés APRÈS ce timestamp
  // sont considérés comme "nouveaux après vidage" et restent visibles
  const dernierVidage = useRef(null);

  const nbNouveaux = rows.filter(r => r.nouveau).length;
  const moyNote    = rows.length > 0
    ? (rows.reduce((s,r) => s+r.note, 0) / rows.length).toFixed(1) : "—";

  function showToast(msg, type="success") {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3500);
  }

  function marquerVus() {
    setRows(p => p.map(r => ({...r, nouveau:false})));
  }

  // Supprimer un commentaire individuel → notifie le médecin
  function supprimer(r) {
    setRows(p => p.filter(x => x.id !== r.id));
    showToast(`Commentaire supprimé — ${r.nom} sera notifié`, "error");
    setModaleDelete(null);
    // TODO: await supprimerCommentaire(r.id)
  }

  // Vider la page = supprimer tous les commentaires visibles au moment du clic
  // Si un nouveau arrive pendant l'opération → il aura une date > dernierVidage → il restera
  function viderPage() {
    const maintenant = Date.now();
    dernierVidage.current = maintenant;
    // Supprimer seulement ceux dont la date est AVANT le clic
    setRows(p => p.filter(r => r.date.getTime() > maintenant));
    setSearch(""); setVilleFiltre("Toutes"); setNoteFiltre("Toutes"); setStatutFiltre("Tous"); setPage(1);
    setModaleVider(false);
    showToast("Page vidée — médecins notifiés", "error");
    // TODO: await viderCommentaires({ avant: maintenant })
  }

  const filtered = rows.filter(r => {
    const okSearch = !search || r.nom.toLowerCase().includes(search.toLowerCase()) || r.commentaire.toLowerCase().includes(search.toLowerCase());
    const okVille  = villeFiltre==="Toutes" || r.ville===villeFiltre;
    const okNote   = noteFiltre==="Toutes"  || r.note===Number(noteFiltre);
    const okStatut = statutFiltre==="Tous"
      || (statutFiltre==="nouveau" && r.nouveau);
    return okSearch && okVille && okNote && okStatut;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  const paginated  = filtered.slice((page-1)*perPage, page*perPage);
  const from = filtered.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, filtered.length);

  const tx1  = dark?"text-white":"text-gray-900";
  const tx2  = dark?"text-[#8b949e]":"text-gray-600";
  const tx3  = dark?"text-[#484f58]":"text-gray-400";
  const card = `rounded-2xl border ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`;
  const sel  = `text-[11px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-medium ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1100px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className={`text-xl md:text-2xl font-black tracking-tight ${tx1}`}>Commentaires publiés</h1>
          <p className={`text-[12px] mt-1 ${tx2}`}>
            Avis des médecins sur la landing page · Note moyenne{" "}
            <span className={`font-bold ${dark?"text-[#b45309]":"text-[#92400e]"}`}>★ {moyNote}/5</span>
          </p>
        </div>
        {rows.length > 0 && (
          <button onClick={()=>setModaleVider(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[12px] font-semibold transition-all ${dark?"border-[#21262d] text-[#484f58] hover:border-red-700/40 hover:text-red-400 hover:bg-red-900/20":"border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50"}`}>
            <Trash2 size={13}/> Vider la page
          </button>
        )}
      </div>

      {/* Bandeau nouveaux */}
      {nbNouveaux > 0 && (
        <div className={`flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border ${dark?"border-[#21262d] bg-[#1c2128]":"border-gray-200 bg-gray-50"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${dark?"bg-[#0f766e]/20":"bg-[#0f766e]/10"}`}>
              <Bell size={15} className={dark?"text-[#14b8a6]":"text-[#0f766e]"}/>
            </div>
            <div>
              <p className={`text-[12px] font-bold ${dark?"text-white":"text-gray-800"}`}>
                {nbNouveaux} nouveau{nbNouveaux>1?"x":""} commentaire{nbNouveaux>1?"s":""} depuis votre dernière visite
              </p>
              <p className={`text-[10px] mt-0.5 ${dark?"text-[#8b949e]":"text-gray-500"}`}>
                Vérifiez leur contenu — supprimez les commentaires déplaisants si nécessaire.
              </p>
            </div>
          </div>
          <button onClick={marquerVus}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition-colors shrink-0 ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d] hover:text-white":"border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800"}`}>
            Marquer vus
          </button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label:"Total publiés",  value:rows.length,    color:dark?"#fff":"#111827"              },
          { label:"Nouveaux",       value:nbNouveaux,     color:nbNouveaux>0?"#ea580c":"#9ca3af"   },
          { label:"Note moyenne",   value:`★ ${moyNote}`, color:"#b45309"                          },
        ].map(({label,value,color})=>(
          <div key={label} className={`${card} px-4 py-3`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${tx3}`}>{label}</p>
            <p className="text-2xl font-black" style={{color}}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className={`flex items-center gap-2 h-9 px-3 rounded-xl border flex-1 min-w-[180px] max-w-xs ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
          <Search size={13} className={tx3}/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="Médecin ou mot-clé…"
            className="flex-1 bg-transparent border-none outline-none text-[12px]"
            style={{color:dark?"#e6edf3":"#1f2937"}}/>
        </div>
        <select value={villeFiltre} onChange={e=>{setVilleFiltre(e.target.value);setPage(1);}} className={sel}>
          {VILLES_CM.map(v=><option key={v} value={v}>{v==="Toutes"?"Toutes les villes":v}</option>)}
        </select>
        <select value={noteFiltre} onChange={e=>{setNoteFiltre(e.target.value);setPage(1);}} className={sel}>
          {NOTES.map(n=><option key={n} value={n}>{n==="Toutes"?"Toutes les notes":`${n} étoile${n!=="1"?"s":""}`}</option>)}
        </select>
        <select value={statutFiltre} onChange={e=>{setStatutFiltre(e.target.value);setPage(1);}} className={sel}>
          <option value="Tous">Tous</option>
          <option value="nouveau">🔔 Nouveaux</option>
        </select>
        {(villeFiltre!=="Toutes"||noteFiltre!=="Toutes"||statutFiltre!=="Tous"||search) && (
          <button onClick={()=>{setVilleFiltre("Toutes");setNoteFiltre("Toutes");setStatutFiltre("Tous");setSearch("");setPage(1);}}
            className={`text-[11px] font-medium px-3 py-1.5 rounded-xl border transition-colors ${dark?"border-[#21262d] text-[#484f58] hover:text-white":"border-gray-200 text-gray-400 hover:text-gray-700"}`}>
            Réinitialiser
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-3">
        {rows.length===0
          ? <div className={`${card} px-5 py-16 flex flex-col items-center gap-5`}>
              <div style={{position:"relative",width:80,height:80}}>
                <div style={{width:80,height:80,borderRadius:"50%",background:dark?"rgba(15,118,110,0.1)":"#f0fdf4",border:`2px solid ${dark?"rgba(15,118,110,0.2)":"#bbf7d0"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <MessageSquare size={32} style={{color:BRAND}}/>
                </div>
                <div style={{position:"absolute",bottom:0,right:0,width:26,height:26,borderRadius:"50%",background:BRAND,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff"}}>
                  <CheckCircle size={13} color="#fff"/>
                </div>
              </div>
              <div className="text-center">
                <p className={`text-[15px] font-bold mb-1 ${tx1}`}>Aucun commentaire</p>
                <p className={`text-[12px] ${tx3}`}>La landing page ne contient aucun avis pour le moment.</p>
              </div>
            </div>
          : paginated.length===0
          ? <div className={`${card} px-5 py-12 text-center`}>
              <p className={`text-[12px] ${tx3}`}>Aucun commentaire correspondant aux filtres</p>
            </div>
          : paginated.map(r=>(
            <div key={r.id} className={`${card} p-5`}
              style={r.nouveau?{borderColor:dark?"#92400e":"#fed7aa"}:{}}>
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
                    style={{background:avatarColor(r.nom)}} onClick={()=>setModalePhoto(r)} title="Voir photo CNI">
                    {r.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <p className={`text-[13px] font-bold cursor-pointer hover:underline underline-offset-2 ${tx1}`}
                        onClick={()=>setModalePhoto(r)}>{r.nom}</p>
                      <span className={`text-[10px] ${tx3}`}>{r.ville} · {r.hopital}</span>
                      {r.nouveau && (
                        <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700,background:"#fff7ed",color:"#c2410c",border:"0.5px solid #fed7aa"}}>
                          <Bell size={9}/> Nouveau
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <StarRating note={r.note}/>
                      <span className={`text-[10px] ${tx3}`}>{elapsed(r.date)}</span>
                    </div>
                    <p className={`text-[12px] leading-relaxed ${tx2}`}>"{r.commentaire}"</p>
                  </div>
                </div>
                {/* Uniquement Supprimer */}
                <button onClick={()=>setModaleDelete(r)}
                  style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:4,
                    width:90,height:28,fontSize:10,fontWeight:700,borderRadius:8,cursor:"pointer",flexShrink:0,
                    border:"1px solid #fca5a5",background:"#fef2f2",color:"#dc2626"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#fee2e2"}
                  onMouseLeave={e=>e.currentTarget.style.background="#fef2f2"}>
                  <Trash2 size={10}/> Supprimer
                </button>
              </div>
            </div>
          ))
        }
      </div>

      {/* Pagination */}
      {filtered.length > perPage && (
        <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl border text-[11px] ${dark?"border-[#21262d] text-[#484f58] bg-[#161b22]":"border-gray-100 text-gray-400 bg-white shadow-sm"}`}>
          <span>Affichage {from} à {to} sur {filtered.length}</span>
          <div className="flex items-center gap-2">
            <span>Lignes :</span>
            <select value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}}
              className={`text-[11px] px-2 py-1 rounded-lg border outline-none ${dark?"bg-[#0d1117] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
              {[5,10,20].map(n=><option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            {[{d:()=>setPage(1),dis:page===1,l:"«"},{d:()=>setPage(p=>Math.max(1,p-1)),dis:page===1,l:"‹"},
              {d:()=>setPage(p=>Math.min(totalPages,p+1)),dis:page===totalPages,l:"›"},
              {d:()=>setPage(totalPages),dis:page===totalPages,l:"»"}].map(({d,dis,l})=>(
              <button key={l} onClick={d} disabled={dis}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border text-[11px] transition-colors ${dis?dark?"border-[#21262d] text-[#484f58] cursor-not-allowed":"border-gray-100 text-gray-300 cursor-not-allowed":dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal suppression individuelle */}
      {modaleDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModaleDelete(null)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>Supprimer le commentaire</p>
              <button onClick={()=>setModaleDelete(null)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-700/40 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[11px]">
                <AlertTriangle size={13} className="shrink-0 mt-0.5"/>
                <span>Ce commentaire sera supprimé de la landing page et <strong>{modaleDelete.nom}</strong> sera notifié par e-mail.</span>
              </div>
              <div className={`px-4 py-3 rounded-xl border text-[12px] italic leading-relaxed ${dark?"bg-[#0d1117] border-[#21262d] text-[#8b949e]":"bg-gray-50 border-gray-100 text-gray-600"}`}>
                "{modaleDelete.commentaire}"
              </div>
              <div className="flex items-center gap-2">
                <StarRating note={modaleDelete.note} size={12}/>
                <span className={`text-[10px] ${tx3}`}>{modaleDelete.nom} · {modaleDelete.ville}</span>
              </div>
            </div>
            <div className={`flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setModaleDelete(null)} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
              <button onClick={()=>supprimer(modaleDelete)} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold flex items-center justify-center gap-2">
                <Trash2 size={12}/> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal vider la page */}
      {modaleVider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModaleVider(false)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>Vider la page commentaires</p>
              <button onClick={()=>setModaleVider(false)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
            </div>
            <div className="px-5 py-5 flex flex-col gap-4">
              <div className="flex justify-center">
                <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}><Trash2 size={28} color="#dc2626"/></div>
              </div>
              <div className="text-center">
                <p className={`text-[13px] font-bold mb-1 ${dark?"text-white":"text-gray-800"}`}>
                  Supprimer les {rows.length} commentaire{rows.length>1?"s":""} ?
                </p>
                <p className={`text-[11px] ${tx3}`}>
                  Tous les commentaires actuellement visibles seront supprimés.<br/>
                  Si un nouveau arrive pendant l'opération, il sera préservé.
                </p>
              </div>
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-700/40 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[11px]">
                <AlertTriangle size={13} className="shrink-0 mt-0.5"/>
                <span>Chaque médecin concerné sera notifié par e-mail. Action irréversible.</span>
              </div>
            </div>
            <div className={`flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setModaleVider(false)} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
              <button onClick={viderPage} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold flex items-center justify-center gap-2">
                <Trash2 size={12}/> Tout supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal photo CNI */}
      {modalePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModalePhoto(null)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <div>
                <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>{modalePhoto.nom}</p>
                <p className={`text-[10px] mt-0.5 ${tx3}`}>Photo CNI · {modalePhoto.ville}</p>
              </div>
              <button onClick={()=>setModalePhoto(null)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
            </div>
            <div className="px-5 py-8 flex flex-col items-center gap-4">
              <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark?"border-[#21262d] bg-[#0d1117] text-[#484f58]":"border-gray-200 bg-gray-50 text-gray-300"}`}>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="text-[10px] text-center px-4">Aucune photo disponible</span>
              </div>
              <div className="text-center">
                <p className={`text-[13px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{modalePhoto.nom}</p>
                <p className={`text-[11px] mt-0.5 ${tx3}`}>{modalePhoto.specialite} · {modalePhoto.hopital}</p>
                <div className="flex justify-center mt-2"><StarRating note={modalePhoto.note}/></div>
              </div>
            </div>
            <div className={`px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setModalePhoto(null)} className={`w-full py-2 rounded-xl text-[12px] font-medium border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white ${toast.type==="success"?"bg-teal-600":toast.type==="warn"?"bg-orange-500":"bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}