import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { getMedecinById, suspendreMedecin, supprimerMedecin } from "../api/adminApi";
import { AlertTriangle, ArrowLeft, Trash2, X, FileDown, Cpu, Calendar, User, PauseCircle } from "lucide-react";
import { brand, getSurface, getText } from "../theme";


const RAISONS = ["— Choisir une raison —","Signalement d'un confrère","Comportement non conforme","Vérification d'identité requise","Incohérence dans les documents","Inactivité prolongée","Autre"];

// Formate une date ISO en DD/MM/YYYY
function fmt(d) {
  const pad = n => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// ref = max(derniere_activite, valide_le) — la plus récente des deux
// Un compte validé aujourd'hui est "Actif" même si une ancienne connexion existait
function getStatutEffectif(statutBackend, derniereActivite, valideLE) {
  if (statutBackend !== "Actif") return statutBackend;
  const d1 = derniereActivite ? new Date(derniereActivite).getTime() : 0;
  const d2 = valideLE         ? new Date(valideLE).getTime()         : 0;
  const refTs = Math.max(d1, d2);
  if (!refTs) return "Actif";
  const diffJours = (new Date() - refTs) / (1000 * 3600 * 24);
  return diffJours > 14 ? "Inactif" : "Actif";
}

// Convertit les champs API vers le format local attendu par le JSX
function normaliserMedecin(data) {
  const initials = `${(data.prenom?.[0] || "").toUpperCase()}${(data.nom?.[0] || "").toUpperCase()}`;
  const statutMap = { valide: "Actif", suspendu: "Suspendu", en_attente: "En attente", rejete: "Refusé" };
  const statutBase = statutMap[data.statut] || data.statut || "Inactif";
  return {
    id:               data.id,
    initials,
    avatarColor:      "#009e82",
    photo_url:        data.photo_url || null,
    nom:              `${data.civilite || "Dr."} ${data.prenom} ${data.nom}`,
    specialite:       data.specialite       || "Pneumologue",
    cnom:             data.numero_rpps      || "—",
    hopital:          data.etablissement    || "—",
    ville:            data.adresse          || "—",
    email:            data.email            || "—",
    telephone:        data.telephone        || "—",
    patients:         data.nb_patients      || 0,
    consultations:    data.nb_consultations || 0,
    concordanceIA:    data.concordance_ia   || null,
    statut:           data.statut_effectif || getStatutEffectif(statutBase, data.derniere_activite, data.valide_le),
    derniereActivite: data.derniere_activite || null,
    creeLE:           data.created_at ? fmt(new Date(data.created_at)) : "—",
    valideLE:         data.valide_le  ? fmt(new Date(data.valide_le))  : "—",
    rangCommunaute:   (data.rang_communaute || "—").replace(/^#/, ""),
    casPartages:      data.cas_partages     || "—",
    activiteRecente:  data.activite_recente || [],
  };
}

function Modal({ onClose, title, sub: subtitle, children, footer, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border shadow-xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <div>
            <p className={`text-[15px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{title}</p>
            {subtitle&&<p className={`text-[15px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer&&<div className={`shrink-0 flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>{footer}</div>}
      </div>
    </div>
  );
}

function ModaleSuspension({ m, onClose, onConfirm, dark }) {
  const [raison,setRaison]=useState(""); const [duree,setDuree]=useState("30 jours"); const [msg,setMsg]=useState("");
  const ok=raison&&raison!=="— Choisir une raison —";
  const inp=`w-full text-[14px] px-3 py-2 rounded-xl border outline-none ${dark?"bg-[#0d1117] border-[#21262d] text-white":"bg-gray-50 border-gray-200 text-gray-800"}`;
  return (
    <Modal dark={dark} onClose={onClose} title="Suspendre l'accès" sub={m.nom}
      footer={<>
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[14px] font-medium border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
        <button onClick={()=>ok&&onConfirm({raison,duree,msg})} disabled={!ok} className={`flex-1 py-2 rounded-xl text-[14px] font-semibold text-white ${ok?"bg-orange-500 hover:bg-orange-600":"bg-gray-300 cursor-not-allowed"}`}>Confirmer</button>
      </>}>
      <div className="flex flex-col gap-3">
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[15px] ${dark?"bg-orange-900/20 border-orange-700/40 text-orange-300":"bg-orange-50 border-orange-200 text-orange-700"}`}>
          <AlertTriangle size={13} className="shrink-0 mt-0.5"/><span><strong>{m.nom}</strong> ne pourra plus se connecter.</span>
        </div>
        <div><label className={`block text-[15px] font-medium mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Raison <span className="text-red-500">*</span></label>
          <select value={raison} onChange={e=>setRaison(e.target.value)} className={inp}>{RAISONS.map(r=><option key={r}>{r}</option>)}</select></div>
        <div><label className={`block text-[15px] font-medium mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Durée</label>
          <select value={duree} onChange={e=>setDuree(e.target.value)} className={inp}>{["7 jours","15 jours","30 jours","60 jours","90 jours","Indéfinie"].map(d=><option key={d}>{d}</option>)}</select></div>
        <div><label className={`block text-[15px] font-medium mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Message (optionnel)</label>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3} className={`${inp} resize-none`} placeholder="Message envoyé par e-mail…"/></div>
      </div>
    </Modal>
  );
}

function ModaleSuppression({ m, onClose, onConfirm, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title="Supprimer le compte" sub={m.nom}
      footer={<>
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[14px] font-medium border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
        <button onClick={onConfirm} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[14px] font-semibold">Supprimer définitivement</button>
      </>}>
      <div className="flex flex-col gap-3">
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[15px] ${dark?"bg-red-900/20 border-red-700/40 text-red-300":"bg-red-50 border-red-200 text-red-700"}`}>
          <AlertTriangle size={13} className="shrink-0 mt-0.5"/>
          <span>Supprimer définitivement <strong>{m.nom}</strong> ? Action irréversible.</span>
        </div>
        <div className={`rounded-xl border divide-y text-[14px] ${dark?"bg-[#0d1117] border-[#21262d] divide-[#21262d]":"bg-gray-50 border-gray-100 divide-gray-100"}`}>
          {[{l:"Médecin",v:m.nom},{l:"N° d'ordre",v:m.cnom},{l:"Établissement",v:m.hopital},{l:"Statut",v:m.statut}].map(({l,v})=>(
            <div key={l} className="flex items-center justify-between px-4 py-2.5">
              <span className={dark?"text-[#484f58]":"text-gray-400"}>{l}</span>
              <span className={`font-medium ${dark?"text-[#8b949e]":"text-gray-700"}`}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default function ProfilMedecin() {
  const { id }   = useParams();
  const navigate = useNavigate();
const { dark } = useOutletContext() || {};
  const [m,           setM]           = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [modaleSusp,  setModaleSusp]  = useState(false);
  const [modaleSuppr, setModaleSuppr] = useState(false);
  const [modalePhoto, setModalePhoto] = useState(false);
  const [toast,       setToast]       = useState(null);

  useEffect(() => {
    setLoading(true);
    getMedecinById(id)
      .then(data => {
        setM(normaliserMedecin(data));
      })
      .catch(() => {
        navigate("/administrateur/medecins");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(()=>setToast(null),3500);
    return ()=>clearTimeout(t);
  }, [toast]);

  async function handleSuspension({raison, duree, msg}) {
    try {
      await suspendreMedecin(m.id, raison, duree, msg);
      setM(prev => ({ ...prev, statut: "Suspendu" }));
      setToast({ msg: `${m.nom} suspendu — ${duree}`, type: "warn" });
      setModaleSusp(false);
      setTimeout(() => navigate("/administrateur/medecins"), 2000);
    } catch(e) {
      setM(prev => ({ ...prev, statut: "Suspendu" }));
      setToast({ msg: `${m.nom} suspendu — ${duree}`, type: "warn" });
      setModaleSusp(false);
      setTimeout(() => navigate("/administrateur/medecins"), 2000);
    }
  }

  async function handleSuppression() {
    try {
      await supprimerMedecin(m.id);
    } catch(e) {}
    setModaleSuppr(false);
    navigate("/administrateur/medecins");
  }

  function telechargerPDF() {
    const s=document.createElement("style");
    s.innerHTML=`@media print{body *{visibility:hidden!important}#pp,#pp *{visibility:visible!important}#pp{position:absolute;left:0;top:0;width:100%;padding:28px;background:#fff!important}.np{display:none!important}}`;
    document.head.appendChild(s); window.print(); document.head.removeChild(s);
  }

  if (loading || !m) {
    const surface = getSurface(dark);
    const pulse = `rounded-xl animate-pulse ${dark ? "bg-[#21262d]" : "bg-gray-100"}`;
    return (
      <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
        <div className={`rounded-2xl border px-6 py-5 ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100"}`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full ${pulse}`}/>
            <div className="flex flex-col gap-2">
              <div className={`h-5 w-48 ${pulse}`}/>
              <div className={`h-3 w-72 ${pulse}`}/>
              <div className={`h-6 w-16 rounded-full ${pulse}`}/>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl border px-6 py-5 ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100"}`}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {Array.from({length: 8}).map((_,i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className={`h-3 w-20 ${pulse}`}/>
                <div className={`h-4 w-40 ${pulse}`}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statutAffiche = m.statut;

  const act = m.derniereActivite ? new Date(m.derniereActivite).toLocaleString("fr-FR") : "—";
  const dark_c = (light, dk) => dark ? dk : light;

  const surface = `rounded-2xl border ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100"}`;
  const tx1 = dark ? "text-white"     : "text-gray-900";
  const tx2 = dark ? "text-[#8b949e]" : "text-gray-500";
  const tx3 = dark ? "text-[#484f58]" : "text-gray-400";
  const divider = dark ? "border-[#21262d]" : "border-gray-100";

  function statutStyle(s) {
    if (s === "Actif")    return { bg:"#ecfdf5", color:"#065f46", border:"0.5px solid #6ee7b7" };
    if (s === "Suspendu") return { bg:"#fff7ed", color:"#c2410c", border:"0.5px solid #fed7aa" };
    return                       { bg:"#f3f4f6", color:"#6b7280", border:"0.5px solid #d1d5db" };
  }

  const InfoField = ({label, value, mono=false, teal=false, badge=false}) => (
    <div>
      <p className={`text-[15px] mb-1 ${tx3}`}>{label}</p>
      {badge
        ? (() => { const s = statutStyle(value); return (
            <span style={{display:"inline-block",padding:"2px 10px",borderRadius:99,fontSize:13,fontWeight:500,
              background:s.bg,color:s.color,border:s.border}}>{value}</span>
          ); })()
        : <p className={`text-[14px] font-medium ${mono?"font-mono":""} ${teal?"text-blue-800":tx1}`}>{value||"—"}</p>
      }
    </div>
  );

  const KpiCard = ({bg, bdr, iconBg, icon, label, labelColor, value, valueColor}) => (
    <div style={{borderRadius:12,padding:"16px 18px",background:bg,border:`0.5px solid ${bdr}`,display:"flex",alignItems:"center",gap:14,flex:1}}>
      <div style={{width:38,height:38,borderRadius:10,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff"}}>
        {icon}
      </div>
      <div>
        <p style={{fontSize:13,fontWeight:500,color:labelColor,marginBottom:2}}>{label}</p>
        <p style={{fontSize:18,fontWeight:500,color:valueColor}}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      <style>{`@media print{body *{visibility:hidden!important}#pp,#pp *{visibility:visible!important}#pp{position:absolute;left:0;top:0;width:100%;padding:28px;background:#fff!important}.np{display:none!important}}`}</style>

      <div className="flex items-center justify-between gap-3 flex-wrap np">
        <button onClick={()=>navigate("/administrateur/medecins")}
          className={`flex items-center gap-2 text-[14px] font-medium transition-colors ${tx3} hover:${tx1}`}>
          <ArrowLeft size={13}/> Retour aux médecins
        </button>
        <button onClick={telechargerPDF}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[14px] font-medium transition-all"
          style={{borderColor: dark?"#21262d":"#e5e7eb", color: dark?"#8b949e":"#6b7280"}}
          onMouseEnter={e=>{e.currentTarget.style.background=brand.DEFAULT;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=brand.DEFAULT;}}
          onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color=dark?"#8b949e":"#6b7280";e.currentTarget.style.borderColor=dark?"#21262d":"#e5e7eb";}}>
          <FileDown size={13}/> Télécharger PDF
        </button>
      </div>

      <div id="pp" className="flex flex-col gap-4">

        <div className={`${surface} px-4 sm:px-6 py-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={()=>setModalePhoto(true)} title="Voir la photo CNI"
                style={{width:56,height:56,borderRadius:"50%",flexShrink:0,padding:0,border:"none",cursor:"pointer",position:"relative"}}
                className="group">
                {m.photo_url
                  ? <img src={m.photo_url} alt={m.nom} style={{width:56,height:56,borderRadius:"50%",objectFit:"cover",border:"2px solid #e5e7eb",display:"block"}}
                      className="group-hover:opacity-80 transition-opacity"/>
                  : <div style={{width:56,height:56,borderRadius:"50%",background:m.avatarColor||brand.DEFAULT,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:500}}
                      className="group-hover:opacity-80 transition-opacity">
                      {m.initials}
                    </div>
                }
                <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(0,0,0,0.25)",display:"flex",alignItems:"center",justifyContent:"center",opacity:0}}
                  className="group-hover:opacity-100 transition-opacity">
                  <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
              </button>
              <div>
                <h1 className={`text-[22px] font-semibold leading-tight ${tx1}`}>{m.nom}</h1>
                <p className={`text-[14px] mt-0.5 ${tx3}`}>{m.specialite} · {m.hopital} · {m.ville}</p>
                <div className="flex items-center gap-2 mt-2">
                  {(() => { const s = statutStyle(statutAffiche); return (
                    <span style={{display:"inline-block",padding:"2px 10px",borderRadius:99,fontSize:13,fontWeight:500,
                      background:s.bg,color:s.color,border:s.border}}>{statutAffiche}</span>
                  ); })()}
                  <span style={{display:"inline-block",padding:"2px 10px",borderRadius:99,fontSize:13,fontWeight:500,background:"#e6f7f4",color:"#007a64",border:"0.5px solid #6ee7b7"}}>CNOM vérifié</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 np">
              <button onClick={()=>setModaleSusp(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[14px] font-medium transition-colors"
                style={{borderColor:"#f97316",color:"#c2410c"}}>
                <PauseCircle size={13}/> Suspendre
              </button>
              <button onClick={()=>setModaleSuppr(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[14px] font-medium text-white transition-colors"
                style={{background:"#dc2626"}}>
                <Trash2 size={13}/> Supprimer
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-4">

          <div className={`${surface} px-4 sm:px-6 py-5`}>
            <p className={`text-[14px] font-medium mb-4 ${tx1}`}>Informations du membre</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <InfoField label="Email"              value={m.email}/>
              <InfoField label="Statut"             value={statutAffiche}  badge/>
              <InfoField label="Téléphone"         value={m.telephone}/>
              <InfoField label="N° d'ordre"         value={m.cnom}         mono/>
              <InfoField label="Date d'ajout"      value={m.creeLE}/>
              <InfoField label="Validé le"         value={m.valideLE}     teal/>
              <InfoField label="Dernière activité" value={act}/>
              <InfoField label="Rang communauté"   value={m.rangCommunaute}/>
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-2.5">
            {(() => {
              const sk = statutAffiche === "Actif"   ? { bg:"#f0fdf4",bdr:"#bbf7d0",ibg:"#009e82",lc:"#059669",vc:"#065f46" }
                       : statutAffiche === "Suspendu" ? { bg:"#fff7ed",bdr:"#fed7aa",ibg:"#f97316",lc:"#ea580c",vc:"#c2410c" }
                       : { bg:"#f3f4f6",bdr:"#d1d5db",ibg:"#9ca3af",lc:"#6b7280",vc:"#374151" };
              return <KpiCard bg={sk.bg} bdr={sk.bdr} iconBg={sk.ibg} icon={<User size={17}/>}
                label="Statut" labelColor={sk.lc} value={statutAffiche} valueColor={sk.vc}/>;
            })()}
            <KpiCard bg="#fff7ed" bdr="#fed7aa" iconBg="#f97316" icon={<Cpu size={17}/>}
              label="Concordance IA" labelColor="#ea580c"
              value={m.concordanceIA ? `${m.concordanceIA}%` : "—"} valueColor="#9a3412"/>
            <KpiCard bg="#e6f7f4" bdr="#6ee7b7" iconBg="#009e82" icon={<Calendar size={17}/>}
              label="Validé le" labelColor="#007a64" value={m.valideLE||"—"} valueColor="#005c4b"/>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className={`${surface} px-4 sm:px-6 py-5`}>
            <p className={`text-[14px] font-medium mb-4 ${tx1}`}>Statistiques d'activité</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                {label:"Patients",       value:m.patients?m.patients.toLocaleString("fr-FR"):"0",       color:"#009e82"},
                {label:"Consultations",  value:m.consultations?m.consultations.toLocaleString("fr-FR"):"0",color:"#185FA5"},
                {label:"Rang",           value:m.rangCommunaute||"—",                                    color:"#7C3AED"},
                {label:"Cas partagés",   value:m.casPartages?(m.casPartages.match(/\d+/)?.[0] ?? "—"):"—", color:"#D97706"},
              ].map(({label,value,color})=>(
                <div key={label} className={`rounded-xl p-4 text-center ${dark?"bg-[#0d1117]":"bg-gray-50"}`}>
                  <p className={`text-[14px] uppercase tracking-wider font-medium mb-1.5 ${tx3}`}>{label}</p>
                  <p className="text-[22px] font-semibold" style={{color}}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${surface} px-4 sm:px-6 py-5`}>
            <p className={`text-[14px] font-medium mb-4 ${tx1}`}>Activité récente</p>
            {(!m.activiteRecente||m.activiteRecente.length===0)
              ? <p className={`text-[14px] ${tx3}`}>Aucune activité récente</p>
              : <div className="flex flex-col gap-2">
                  {m.activiteRecente.map((a,i)=>(
                    <div key={i} className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl ${dark?"bg-[#0d1117]":"bg-gray-50"}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:brand.DEFAULT}}/>
                        <p className={`text-[14px] ${tx2}`}>{a.texte}</p>
                      </div>
                      <span className={`text-[15px] shrink-0 ${tx3}`}>{a.quand}</span>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>

      </div>

      {modalePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModalePhoto(false)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <div>
                <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>{m.nom}</p>
                <p className={`text-[12px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>Photo d'identité (CNI)</p>
              </div>
              <button onClick={()=>setModalePhoto(false)} className={`w-6 h-6 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}>
                <X size={12}/>
              </button>
            </div>
            <div className="px-4 py-4 flex flex-col items-center gap-3">
              {m.photo_url
                ? <img src={m.photo_url} alt={m.nom} className="w-full max-h-[45vh] rounded-xl object-contain border border-gray-200 shadow"/>
                : <div className={`w-full h-48 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark?"border-[#21262d] bg-[#0d1117] text-[#484f58]":"border-gray-200 bg-gray-50 text-gray-300"}`}>
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className="text-[13px] text-center px-4">Aucune photo disponible</span>
                  </div>
              }
              <div className="text-center">
                <p className={`text-[13px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{m.nom}</p>
                <p className={`text-[12px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.specialite} · {m.cnom}</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {statutAffiche==="Actif"
                    ?<><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/><span className="text-[12px] font-bold text-emerald-600">Actif</span></>
                    :statutAffiche==="Suspendu"
                    ?<><span className="w-1.5 h-1.5 rounded-full bg-red-400"/><span className="text-[12px] font-bold text-red-500">Suspendu</span></>
                    :<><span className="w-1.5 h-1.5 rounded-full bg-gray-400"/><span className="text-[12px] font-bold text-gray-400">{statutAffiche}</span></>
                  }
                </div>
              </div>
            </div>
            <div className={`px-4 py-3 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setModalePhoto(false)} className={`w-full py-1.5 rounded-xl text-[13px] font-medium border ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {modaleSusp  && <ModaleSuspension  m={m} dark={dark} onClose={()=>setModaleSusp(false)}  onConfirm={handleSuspension}/>}
      {modaleSuppr && <ModaleSuppression m={m} dark={dark} onClose={()=>setModaleSuppr(false)} onConfirm={handleSuppression}/>}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[14px] font-medium text-white ${toast.type==="warn"?"bg-orange-500":"bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}