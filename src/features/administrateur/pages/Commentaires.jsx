import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2, X, Star, Search, AlertTriangle, Bell, MessageSquare, CheckCircle } from "lucide-react";
import { brand, status, getSurface, getText } from "../theme";
import { getAvis, supprimerAvis, marquerAvisVus } from "../api/adminApi";

const NOW = new Date();
const sub = (ms) => new Date(NOW.getTime() - ms);

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
  const surface = getSurface(dark);
  const txt     = getText(dark);

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

  const dernierVidage = useRef(null);

  useEffect(() => {
    getAvis()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRows(data.map(a => ({
            id:          a.id,
            initials:    `${(a.prenom?.[0]||"").toUpperCase()}${(a.nom?.[0]||"").toUpperCase()}`,
            nom:         `${a.civilite||"Dr."} ${a.prenom} ${a.nom}`,
            specialite:  a.specialite    || "Pneumologue",
            hopital:     a.etablissement || "—",
            ville:       a.ville         || "—",
            photo_url:   a.photo_url     || null,
            note:        a.note          || 0,
            commentaire: a.commentaire   || a.contenu || "",
            date:        a.created_at ? new Date(a.created_at) : new Date(),
            nouveau:     !a.vu,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const nbNouveaux = rows.filter(r => r.nouveau).length;
  const moyNote    = rows.length > 0
    ? (rows.reduce((s,r) => s+r.note, 0) / rows.length).toFixed(1) : "—";

  function showToast(msg, type="success") {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3500);
  }

  function marquerVus() {
    marquerAvisVus().catch(() => {});
    setRows(p => p.map(r => ({...r, nouveau:false})));
  }

  function supprimer(r) {
    supprimerAvis(r.id).catch(() => {});
    setRows(p => p.filter(x => x.id !== r.id));
    showToast(`Commentaire supprimé — ${r.nom} sera notifié`, "error");
    setModaleDelete(null);
  }

  function viderPage() {
    const maintenant = Date.now();
    dernierVidage.current = maintenant;
    setRows(p => p.filter(r => r.date.getTime() > maintenant));
    setSearch(""); setVilleFiltre("Toutes"); setNoteFiltre("Toutes"); setStatutFiltre("Tous"); setPage(1);
    setModaleVider(false);
    showToast("Page vidée — médecins notifiés", "error");
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

  const cardStyle = { background: surface.card, borderColor: surface.border };
  const selCls = "text-[13px] px-3 py-2 rounded-xl border outline-none cursor-pointer font-medium";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: txt.primary }}>
            Commentaires publiés
          </h1>
          <p className="text-[15px] mt-1" style={{ color: txt.muted }}>
            Avis des médecins sur la landing page · Note moyenne{" "}
            <span className="font-bold" style={{ color: "#b45309" }}>★ {moyNote}/5</span>
          </p>
        </div>
        {rows.length > 0 && (
          <button onClick={()=>setModaleVider(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[14px] font-semibold transition-all"
            style={{ borderColor: surface.border, color: txt.subtle }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#fca5a5";e.currentTarget.style.color="#dc2626";e.currentTarget.style.background=dark?"rgba(220,38,38,0.10)":"#fef2f2";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=surface.border;e.currentTarget.style.color=txt.subtle;e.currentTarget.style.background="transparent";}}>
            <Trash2 size={14}/> Vider la page
          </button>
        )}
      </div>

      {/* ── Bandeau nouveaux ── */}
      {nbNouveaux > 0 && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border"
          style={{ borderColor: dark?"rgba(234,88,12,0.30)":"rgba(251,191,36,0.40)", background: dark?"rgba(234,88,12,0.08)":"#fffbeb" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: dark?"rgba(234,88,12,0.15)":"#fef3c7" }}>
              <Bell size={17} style={{ color: "#d97706" }}/>
            </div>
            <div>
              <p className="text-[15px] font-bold" style={{ color: dark?"#fcd34d":"#92400e" }}>
                {nbNouveaux} nouveau{nbNouveaux>1?"x":""} commentaire{nbNouveaux>1?"s":""} depuis votre dernière visite
              </p>
              <p className="text-[13px] mt-0.5" style={{ color: dark?"rgba(252,211,77,0.7)":"rgba(146,64,14,0.7)" }}>
                Vérifiez leur contenu — supprimez les commentaires déplaisants si nécessaire.
              </p>
            </div>
          </div>
          <button onClick={marquerVus}
            className="text-[13px] font-semibold px-4 py-2 rounded-xl border transition-colors shrink-0"
            style={{ borderColor: dark?"rgba(234,88,12,0.30)":"#fde68a", color: dark?"#fcd34d":"#b45309" }}>
            Marquer vus
          </button>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label:"Total publiés",  value:rows.length,    color: txt.primary },
          { label:"Nouveaux",       value:nbNouveaux,     color: nbNouveaux>0?"#ea580c":txt.subtle },
          { label:"Note moyenne",   value:`★ ${moyNote}`, color: "#b45309" },
        ].map(({label,value,color})=>(
          <div key={label} className="rounded-2xl border px-5 py-4" style={cardStyle}>
            <p className="text-[13px] font-semibold mb-1.5" style={{ color: txt.subtle }}>{label}</p>
            <p className="text-3xl font-black" style={{color}}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 h-10 px-4 rounded-xl border flex-1 min-w-[200px] max-w-xs"
          style={cardStyle}>
          <Search size={15} style={{ color: txt.subtle }}/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="Médecin ou mot-clé…"
            className="flex-1 bg-transparent border-none outline-none text-[14px]"
            style={{ color: txt.secondary }}/>
        </div>
        <select value={villeFiltre} onChange={e=>{setVilleFiltre(e.target.value);setPage(1);}}
          className={selCls} style={cardStyle}>
          <option style={{color: txt.secondary}}>Toutes les villes</option>
          {VILLES_CM.filter(v=>v!=="Toutes").map(v=><option key={v} value={v} style={{color: txt.secondary}}>{v}</option>)}
        </select>
        <select value={noteFiltre} onChange={e=>{setNoteFiltre(e.target.value);setPage(1);}}
          className={selCls} style={cardStyle}>
          <option style={{color: txt.secondary}}>Toutes les notes</option>
          {NOTES.filter(n=>n!=="Toutes").map(n=><option key={n} value={n} style={{color: txt.secondary}}>{n} étoile{n!=="1"?"s":""}</option>)}
        </select>
        <select value={statutFiltre} onChange={e=>{setStatutFiltre(e.target.value);setPage(1);}}
          className={selCls} style={cardStyle}>
          <option value="Tous" style={{color: txt.secondary}}>Tous</option>
          <option value="nouveau" style={{color: txt.secondary}}>🔔 Nouveaux</option>
        </select>
        {(villeFiltre!=="Toutes"||noteFiltre!=="Toutes"||statutFiltre!=="Tous"||search) && (
          <button onClick={()=>{setVilleFiltre("Toutes");setNoteFiltre("Toutes");setStatutFiltre("Tous");setSearch("");setPage(1);}}
            className="text-[13px] font-medium px-4 py-2 rounded-xl border transition-colors"
            style={{ borderColor: surface.border, color: txt.subtle }}>
            Réinitialiser
          </button>
        )}
      </div>

      {/* ── Liste ── */}
      <div className="flex flex-col gap-3">
        {rows.length===0
          ? <div className="rounded-2xl border px-5 py-16 flex flex-col items-center gap-5" style={cardStyle}>
              <div style={{position:"relative",width:88,height:88}}>
                <div style={{width:88,height:88,borderRadius:"50%",background: dark?"rgba(0,158,130,0.10)":brand.light,border:`2px solid ${dark?"rgba(0,158,130,0.20)":brand.lighter}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <MessageSquare size={36} style={{color:brand.DEFAULT}}/>
                </div>
                <div style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:brand.DEFAULT,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${surface.card}`}}>
                  <CheckCircle size={14} color="#fff"/>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[17px] font-bold mb-1" style={{ color: txt.primary }}>Aucun commentaire</p>
                <p className="text-[14px]" style={{ color: txt.subtle }}>La landing page ne contient aucun avis pour le moment.</p>
              </div>
            </div>
          : paginated.length===0
          ? <div className="rounded-2xl border px-5 py-12 text-center" style={cardStyle}>
              <p className="text-[14px]" style={{ color: txt.subtle }}>Aucun commentaire correspondant aux filtres</p>
            </div>
          : paginated.map(r=>(
            <div key={r.id} className="rounded-2xl border p-5"
              style={{ ...cardStyle, ...(r.nouveau ? { borderColor: dark?"rgba(234,88,12,0.35)":"#fed7aa" } : {}) }}>
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {r.photo_url
                    ? <img src={r.photo_url} alt={r.nom}
                        className="w-12 h-12 rounded-full object-cover shrink-0 cursor-pointer hover:opacity-85 transition-opacity border border-gray-200"
                        onClick={()=>setModalePhoto(r)} title="Voir photo CNI"
                        onError={e => { e.currentTarget.style.display="none"; e.currentTarget.nextSibling.style.display="flex"; }} />
                    : null}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[14px] font-bold shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                    style={{background:avatarColor(r.nom), display: r.photo_url ? "none" : "flex"}} onClick={()=>setModalePhoto(r)} title="Voir photo CNI">
                    {r.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <p className="text-[16px] font-bold cursor-pointer hover:underline underline-offset-2"
                        style={{ color: txt.primary }}
                        onClick={()=>setModalePhoto(r)}>{r.nom}</p>
                      <span className="text-[13px]" style={{ color: txt.subtle }}>{r.ville} · {r.hopital}</span>
                      {r.nouveau && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold"
                          style={{ background: dark?"rgba(234,88,12,0.15)":"#fff7ed", color:"#c2410c", border:`1px solid ${dark?"rgba(234,88,12,0.30)":"#fed7aa"}` }}>
                          <Bell size={11}/> Nouveau
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-2.5">
                      <StarRating note={r.note}/>
                      <span className="text-[13px]" style={{ color: txt.subtle }}>{elapsed(r.date)}</span>
                    </div>
                    <p className="text-[15px] leading-relaxed" style={{ color: txt.secondary }}>"{r.commentaire}"</p>
                  </div>
                </div>
                <button onClick={()=>setModaleDelete(r)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors shrink-0"
                  style={{ borderColor:"#fca5a5", background: dark?"rgba(220,38,38,0.10)":"#fef2f2", color:"#dc2626" }}
                  onMouseEnter={e=>e.currentTarget.style.background=dark?"rgba(220,38,38,0.18)":"#fee2e2"}
                  onMouseLeave={e=>e.currentTarget.style.background=dark?"rgba(220,38,38,0.10)":"#fef2f2"}>
                  <Trash2 size={13}/> Supprimer
                </button>
              </div>
            </div>
          ))
        }
      </div>

      {/* ── Pagination ── */}
      {filtered.length > perPage && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 rounded-2xl border text-[13px]"
          style={{ ...cardStyle, color: txt.subtle }}>
          <span>Affichage {from} à {to} sur {filtered.length}</span>
          <div className="flex items-center gap-2">
            <span>Lignes :</span>
            <select value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}}
              className="text-[13px] px-2 py-1 rounded-lg border outline-none"
              style={{ background: surface.bg, borderColor: surface.border, color: txt.secondary }}>
              {[5,10,20].map(n=><option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            {[{d:()=>setPage(1),dis:page===1,l:"«"},{d:()=>setPage(p=>Math.max(1,p-1)),dis:page===1,l:"‹"},
              {d:()=>setPage(p=>Math.min(totalPages,p+1)),dis:page===totalPages,l:"›"},
              {d:()=>setPage(totalPages),dis:page===totalPages,l:"»"}].map(({d,dis,l})=>(
              <button key={l} onClick={d} disabled={dis}
                className="w-8 h-8 flex items-center justify-center rounded-lg border text-[13px] transition-colors"
                style={{
                  borderColor: surface.border,
                  color: dis ? (dark?"#30363d":"#d1d5db") : txt.secondary,
                  cursor: dis ? "not-allowed" : "pointer",
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal suppression individuelle ── */}
      {modaleDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModaleDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden" style={cardStyle}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor: surface.border}}>
              <p className="text-[15px] font-bold" style={{ color: txt.primary }}>Supprimer le commentaire</p>
              <button onClick={()=>setModaleDelete(null)} className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ color: txt.subtle }}><X size={15}/></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl border text-[13px]"
                style={{ borderColor: status.danger.border, background: status.danger.bg, color: status.danger.text }}>
                <AlertTriangle size={15} className="shrink-0 mt-0.5"/>
                <span>Ce commentaire sera supprimé de la landing page et <strong>{modaleDelete.nom}</strong> sera notifié par e-mail.</span>
              </div>
              <div className="px-4 py-3 rounded-xl border text-[14px] italic leading-relaxed"
                style={{ background: surface.bg, borderColor: surface.border, color: txt.secondary }}>
                "{modaleDelete.commentaire}"
              </div>
              <div className="flex items-center gap-2">
                <StarRating note={modaleDelete.note} size={13}/>
                <span className="text-[13px]" style={{ color: txt.subtle }}>{modaleDelete.nom} · {modaleDelete.ville}</span>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t" style={{borderColor: surface.border}}>
              <button onClick={()=>setModaleDelete(null)} className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold border"
                style={{ borderColor: surface.border, color: txt.muted }}>Annuler</button>
              <button onClick={()=>supprimer(modaleDelete)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold flex items-center justify-center gap-2">
                <Trash2 size={14}/> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal vider la page ── */}
      {modaleVider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModaleVider(false)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden" style={cardStyle}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor: surface.border}}>
              <p className="text-[15px] font-bold" style={{ color: txt.primary }}>Vider la page commentaires</p>
              <button onClick={()=>setModaleVider(false)} className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ color: txt.subtle }}><X size={15}/></button>
            </div>
            <div className="px-5 py-5 flex flex-col gap-4">
              <div className="flex justify-center">
                <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(220,38,38,0.10)",display:"flex",alignItems:"center",justifyContent:"center"}}><Trash2 size={30} color="#dc2626"/></div>
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold mb-1" style={{ color: txt.primary }}>
                  Supprimer les {rows.length} commentaire{rows.length>1?"s":""} ?
                </p>
                <p className="text-[13px]" style={{ color: txt.subtle }}>
                  Tous les commentaires actuellement visibles seront supprimés.<br/>
                  Si un nouveau arrive pendant l'opération, il sera préservé.
                </p>
              </div>
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl border text-[13px]"
                style={{ borderColor: status.danger.border, background: status.danger.bg, color: status.danger.text }}>
                <AlertTriangle size={15} className="shrink-0 mt-0.5"/>
                <span>Chaque médecin concerné sera notifié par e-mail. Action irréversible.</span>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t" style={{borderColor: surface.border}}>
              <button onClick={()=>setModaleVider(false)} className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold border"
                style={{ borderColor: surface.border, color: txt.muted }}>Annuler</button>
              <button onClick={viderPage} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold flex items-center justify-center gap-2">
                <Trash2 size={14}/> Tout supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal photo CNI ── */}
      {modalePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModalePhoto(null)}>
          <div className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden" style={cardStyle}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor: surface.border}}>
              <div>
                <p className="text-[15px] font-bold" style={{ color: txt.primary }}>{modalePhoto.nom}</p>
                <p className="text-[13px] mt-0.5" style={{ color: txt.subtle }}>Photo CNI · {modalePhoto.ville}</p>
              </div>
              <button onClick={()=>setModalePhoto(null)} className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ color: txt.subtle }}><X size={15}/></button>
            </div>
            <div className="px-5 py-6 flex flex-col items-center gap-4">
              {modalePhoto.photo_url
                ? <img src={modalePhoto.photo_url} alt={modalePhoto.nom} className="w-full max-h-[65vh] rounded-xl object-contain border-2 border-gray-200 shadow"/>
                : <div className="w-full h-72 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed"
                    style={{ borderColor: surface.border, background: surface.bg, color: txt.subtle }}>
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span className="text-[13px] text-center px-4">Aucune photo disponible</span>
                  </div>
              }
              <div className="text-center">
                <p className="text-[15px] font-semibold" style={{ color: txt.primary }}>{modalePhoto.nom}</p>
                <p className="text-[13px] mt-0.5" style={{ color: txt.subtle }}>{modalePhoto.specialite} · {modalePhoto.hopital}</p>
                <div className="flex justify-center mt-2"><StarRating note={modalePhoto.note}/></div>
              </div>
            </div>
            <div className="px-5 py-4 border-t" style={{borderColor: surface.border}}>
              <button onClick={()=>setModalePhoto(null)} className="w-full py-2.5 rounded-xl text-[14px] font-medium border"
                style={{ borderColor: surface.border, color: txt.muted }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[14px] font-semibold text-white"
          style={{ background: toast.type==="success" ? brand.DEFAULT : toast.type==="warn" ? "#f59e0b" : "#dc2626" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}