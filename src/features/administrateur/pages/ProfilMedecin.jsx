import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext, useLocation } from "react-router-dom";
import { suspendreMedecin, supprimerMedecin } from "../api/adminApi";
import { AlertTriangle, ArrowLeft, Trash2, X, FileDown, Cpu, Calendar, User, PauseCircle } from "lucide-react";

const BRAND = "#0f766e";

const MOCK = {
  1: { id:1, initials:"JD", avatarColor:"#0f766e", photo_url:null, nom:"Dr. Jean Dupont", specialite:"Pneumologue", cnom:"CM-2019-0847", hopital:"H. Général Douala", ville:"Douala", email:"j.dupont@hgd.cm", telephone:"+237 699 123 456", patients:134, consultations:4821, concordanceIA:88, statut:"Actif", derniereActivite:"2026-06-05T14:22:00", creeLE:"14/08/2025", valideLE:"17/08/2025", rangCommunaute:"#7/38", casPartages:"247 cas publiés", activiteRecente:[{texte:"Consultation #247 enregistrée",quand:"Auj. 14:22"},{texte:"Cas #241 partagé sur la communauté",quand:"Hier"},{texte:"3 consultations Pneumonie",quand:"15 mars"}] },
  2: { id:2, initials:"DK", avatarColor:"#185FA5", photo_url:null, nom:"Dr. Kamto Diane", specialite:"Pneumologue", cnom:"CM-2017-0432", hopital:"CHU Yaoundé", ville:"Yaoundé", email:"d.kamto@chu.cm", telephone:"+237 677 234 567", patients:198, consultations:3201, concordanceIA:92, statut:"Actif", derniereActivite:"2026-06-05T09:10:00", creeLE:"02/03/2026", valideLE:"04/03/2026", rangCommunaute:"#3/38", casPartages:"312 cas publiés", activiteRecente:[{texte:"Consultation #198 enregistrée",quand:"Auj. 09:10"},{texte:"Rapport mensuel soumis",quand:"Il y a 2j"}] },
  3: { id:3, initials:"DN", avatarColor:"#7C3AED", photo_url:null, nom:"Dr. Nkoa", specialite:"Pneumologue", cnom:"CM-2018-0521", hopital:"H. Général Douala", ville:"Douala", email:"nkoa@hgd.cm", telephone:"+237 699 345 678", patients:176, consultations:2847, concordanceIA:74, statut:"Inactif", derniereActivite:"2026-05-25T10:00:00", creeLE:"07/02/2026", valideLE:"09/02/2026", rangCommunaute:"#5/38", casPartages:"189 cas publiés", activiteRecente:[{texte:"Nouveau patient enregistré",quand:"Hier"}] },
  4: { id:4, initials:"DB", avatarColor:"#D97706", photo_url:null, nom:"Dr. Barry", specialite:"Pneumologue", cnom:"CM-2020-0612", hopital:"H. Régional Garoua", ville:"Garoua", email:"barry@hrg.cm", telephone:"+237 655 456 789", patients:89, consultations:1234, concordanceIA:61, statut:"Inactif", derniereActivite:"2026-05-29T08:00:00", creeLE:"20/11/2025", valideLE:"23/11/2025", rangCommunaute:"#12/38", casPartages:"74 cas publiés", activiteRecente:[{texte:"Consultation #89 enregistrée",quand:"Il y a 7j"}] },
};

const RAISONS = ["— Choisir une raison —","Signalement d'un confrère","Comportement non conforme","Vérification d'identité requise","Incohérence dans les documents","Inactivité prolongée","Autre"];

function Modal({ onClose, title, sub: subtitle, children, footer, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border shadow-xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <div>
            <p className={`text-[13px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{title}</p>
            {subtitle&&<p className={`text-[11px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{subtitle}</p>}
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
  const inp=`w-full text-[12px] px-3 py-2 rounded-xl border outline-none ${dark?"bg-[#0d1117] border-[#21262d] text-white":"bg-gray-50 border-gray-200 text-gray-800"}`;
  return (
    <Modal dark={dark} onClose={onClose} title="Suspendre l'accès" sub={m.nom}
      footer={<>
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-medium border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
        <button onClick={()=>ok&&onConfirm({raison,duree,msg})} disabled={!ok} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold text-white ${ok?"bg-orange-500 hover:bg-orange-600":"bg-gray-300 cursor-not-allowed"}`}>Confirmer</button>
      </>}>
      <div className="flex flex-col gap-3">
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[11px] ${dark?"bg-orange-900/20 border-orange-700/40 text-orange-300":"bg-orange-50 border-orange-200 text-orange-700"}`}>
          <AlertTriangle size={13} className="shrink-0 mt-0.5"/><span><strong>{m.nom}</strong> ne pourra plus se connecter.</span>
        </div>
        <div><label className={`block text-[11px] font-medium mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Raison <span className="text-red-500">*</span></label>
          <select value={raison} onChange={e=>setRaison(e.target.value)} className={inp}>{RAISONS.map(r=><option key={r}>{r}</option>)}</select></div>
        <div><label className={`block text-[11px] font-medium mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Durée</label>
          <select value={duree} onChange={e=>setDuree(e.target.value)} className={inp}>{["7 jours","15 jours","30 jours","60 jours","90 jours","Indéfinie"].map(d=><option key={d}>{d}</option>)}</select></div>
        <div><label className={`block text-[11px] font-medium mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Message (optionnel)</label>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3} className={`${inp} resize-none`} placeholder="Message envoyé par e-mail…"/></div>
      </div>
    </Modal>
  );
}

function ModaleSuppression({ m, onClose, onConfirm, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title="Supprimer le compte" sub={m.nom}
      footer={<>
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-medium border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
        <button onClick={onConfirm} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold">Supprimer définitivement</button>
      </>}>
      <div className="flex flex-col gap-3">
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[11px] ${dark?"bg-red-900/20 border-red-700/40 text-red-300":"bg-red-50 border-red-200 text-red-700"}`}>
          <AlertTriangle size={13} className="shrink-0 mt-0.5"/>Supprimer définitivement <strong className="mx-1">{m.nom}</strong> ? Action irréversible.
        </div>
        <div className={`rounded-xl border divide-y text-[12px] ${dark?"bg-[#0d1117] border-[#21262d] divide-[#21262d]":"bg-gray-50 border-gray-100 divide-gray-100"}`}>
          {[{l:"Médecin",v:m.nom},{l:"CNOM",v:m.cnom},{l:"Établissement",v:m.hopital},{l:"Statut",v:m.statut}].map(({l,v})=>(
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
  const location = useLocation();
  const { dark } = useOutletContext() || {};
  const [m,           setM]           = useState(null);
  const [modaleSusp,  setModaleSusp]  = useState(false);
  const [modaleSuppr, setModaleSuppr] = useState(false);
  const [modalePhoto, setModalePhoto] = useState(false);  // Modal photo CNI
  const [toast,       setToast]       = useState(null);

  useEffect(() => {
    // Priorité : state passé via navigate, sinon MOCK
    const fromState = location.state?.medecin;
    const fromMock  = MOCK[Number(id)];
    const data = (fromState && fromState.email) ? fromState : fromMock;
    if (data) setM(data); else navigate("/administrateur/medecins");
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
      // Fallback mock — simule le changement
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

  if (!m) return null;

  const act = m.derniereActivite ? new Date(m.derniereActivite).toLocaleString("fr-FR") : "—";
  const dark_c = (light, dk) => dark ? dk : light;

  // Shared style helpers
  const surface = `rounded-2xl border ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100"}`;
  const tx1 = dark ? "text-white"     : "text-gray-900";
  const tx2 = dark ? "text-[#8b949e]" : "text-gray-500";
  const tx3 = dark ? "text-[#484f58]" : "text-gray-400";
  const divider = dark ? "border-[#21262d]" : "border-gray-100";

  const InfoField = ({label, value, mono=false, teal=false, badge=false}) => (
    <div>
      <p className={`text-[11px] mb-1 ${tx3}`}>{label}</p>
      {badge
        ? <span style={{display:"inline-block",padding:"2px 10px",borderRadius:99,fontSize:11,fontWeight:500,
            background:value==="Actif"?"#ecfdf5":"#fef9c3",color:value==="Actif"?"#065f46":"#854d0e",
            border:value==="Actif"?"0.5px solid #6ee7b7":"0.5px solid #fde68a"}}>{value}</span>
        : <p className={`text-[12px] font-medium ${mono?"font-mono":""} ${teal?"text-[#0f766e]":tx1}`}>{value||"—"}</p>
      }
    </div>
  );

  const KpiCard = ({bg, bdr, iconBg, icon, label, labelColor, value, valueColor}) => (
    <div style={{borderRadius:12,padding:"16px 18px",background:bg,border:`0.5px solid ${bdr}`,display:"flex",alignItems:"center",gap:14,flex:1}}>
      <div style={{width:38,height:38,borderRadius:10,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff"}}>
        {icon}
      </div>
      <div>
        <p style={{fontSize:11,fontWeight:500,color:labelColor,marginBottom:2}}>{label}</p>
        <p style={{fontSize:16,fontWeight:500,color:valueColor}}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4" style={{maxWidth:960,margin:"0 auto",width:"100%"}}>
      <style>{`@media print{body *{visibility:hidden!important}#pp,#pp *{visibility:visible!important}#pp{position:absolute;left:0;top:0;width:100%;padding:28px;background:#fff!important}.np{display:none!important}}`}</style>

      {/* Nav */}
      <div className="flex items-center justify-between np">
        <button onClick={()=>navigate("/administrateur/medecins")}
          className={`flex items-center gap-2 text-[12px] font-medium transition-colors ${tx3} hover:${tx1}`}>
          <ArrowLeft size={13}/> Retour aux médecins
        </button>
        <button onClick={telechargerPDF}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[12px] font-medium transition-all"
          style={{borderColor: dark?"#21262d":"#e5e7eb", color: dark?"#8b949e":"#6b7280"}}
          onMouseEnter={e=>{e.currentTarget.style.background=BRAND;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=BRAND;}}
          onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color=dark?"#8b949e":"#6b7280";e.currentTarget.style.borderColor=dark?"#21262d":"#e5e7eb";}}>
          <FileDown size={13}/> Télécharger PDF
        </button>
      </div>

      <div id="pp" className="flex flex-col gap-4">

        {/* ── HEADER ── */}
        <div className={`${surface} px-6 py-5`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Avatar cliquable → ouvre la modale photo CNI */}
              <button onClick={()=>setModalePhoto(true)} title="Voir la photo CNI"
                style={{width:56,height:56,borderRadius:"50%",flexShrink:0,padding:0,border:"none",cursor:"pointer",position:"relative"}}
                className="group">
                {m.photo_url
                  ? <img src={m.photo_url} alt={m.nom} style={{width:56,height:56,borderRadius:"50%",objectFit:"cover",border:"2px solid #e5e7eb",display:"block"}}
                      className="group-hover:opacity-80 transition-opacity"/>
                  : <div style={{width:56,height:56,borderRadius:"50%",background:m.avatarColor||BRAND,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:500}}
                      className="group-hover:opacity-80 transition-opacity">
                      {m.initials}
                    </div>
                }
                {/* Overlay au hover */}
                <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(0,0,0,0.25)",display:"flex",alignItems:"center",justifyContent:"center",opacity:0}}
                  className="group-hover:opacity-100 transition-opacity">
                  <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
              </button>
              <div>
                <h1 className={`text-[19px] font-semibold leading-tight ${tx1}`}>{m.nom}</h1>
                <p className={`text-[12px] mt-0.5 ${tx3}`}>{m.specialite} · {m.hopital} · {m.ville}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span style={{display:"inline-block",padding:"2px 10px",borderRadius:99,fontSize:11,fontWeight:500,background:m.statut==="Actif"?"#ecfdf5":"#fef9c3",color:m.statut==="Actif"?"#065f46":"#854d0e",border:m.statut==="Actif"?"0.5px solid #6ee7b7":"0.5px solid #fde68a"}}>{m.statut}</span>
                  <span style={{display:"inline-block",padding:"2px 10px",borderRadius:99,fontSize:11,fontWeight:500,background:"#eff6ff",color:"#1d4ed8",border:"0.5px solid #bfdbfe"}}>CNOM vérifié</span>
                </div>
              </div>
            </div>
            {/* Actions inline dans le header */}
            <div className="flex items-center gap-2 np">
              <button onClick={()=>setModaleSusp(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[12px] font-medium transition-colors"
                style={{borderColor:"#f97316",color:"#c2410c"}}>
                <PauseCircle size={13}/> Suspendre
              </button>
              <button onClick={()=>setModaleSuppr(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium text-white transition-colors"
                style={{background:"#dc2626"}}>
                <Trash2 size={13}/> Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* ── LIGNE 1 : Infos (3/5) + KPIs (2/5) ── */}
        <div className="grid gap-4" style={{gridTemplateColumns:"minmax(0,1fr) 280px"}}>

          {/* Infos membre */}
          <div className={`${surface} px-6 py-5`}>
            <p className={`text-[12px] font-medium mb-4 ${tx1}`}>Informations du membre</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 32px"}}>
              <InfoField label="Email"              value={m.email}/>
              <InfoField label="Statut"             value={m.statut}       badge/>
              <InfoField label="Téléphone"         value={m.telephone}/>
              <InfoField label="N° CNOM"           value={m.cnom}         mono/>
              <InfoField label="Date d'ajout"      value={m.creeLE}/>
              <InfoField label="Validé le"         value={m.valideLE}     teal/>
              <InfoField label="Dernière activité" value={act}/>
              <InfoField label="Rang communauté"   value={m.rangCommunaute}/>
            </div>
          </div>

          {/* KPIs verticaux */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <KpiCard bg="#f0fdf4" bdr="#bbf7d0" iconBg="#0f766e" icon={<User size={17}/>}
              label="Statut" labelColor="#059669" value={m.statut} valueColor="#065f46"/>
            <KpiCard bg="#fff7ed" bdr="#fed7aa" iconBg="#f97316" icon={<Cpu size={17}/>}
              label="Concordance IA" labelColor="#ea580c"
              value={m.concordanceIA ? `${m.concordanceIA}%` : "—"} valueColor="#9a3412"/>
            <KpiCard bg="#eff6ff" bdr="#bfdbfe" iconBg="#3b82f6" icon={<Calendar size={17}/>}
              label="Validé le" labelColor="#2563eb" value={m.valideLE||"—"} valueColor="#1e40af"/>
          </div>
        </div>

        {/* ── LIGNE 2 : Stats (1/2) + Activité (1/2) ── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Statistiques */}
          <div className={`${surface} px-6 py-5`}>
            <p className={`text-[12px] font-medium mb-4 ${tx1}`}>Statistiques d'activité</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                {label:"Patients",       value:m.patients?m.patients.toLocaleString("fr-FR"):"0",       color:"#0f766e"},
                {label:"Consultations",  value:m.consultations?m.consultations.toLocaleString("fr-FR"):"0",color:"#185FA5"},
                {label:"Rang",           value:m.rangCommunaute||"—",                                    color:"#7C3AED"},
                {label:"Cas partagés",   value:m.casPartages?m.casPartages.replace(" cas publiés",""):"—", color:"#D97706"},
              ].map(({label,value,color})=>(
                <div key={label} className={`rounded-xl p-4 text-center ${dark?"bg-[#0d1117]":"bg-gray-50"}`}>
                  <p className={`text-[10px] uppercase tracking-wider font-medium mb-1.5 ${tx3}`}>{label}</p>
                  <p className="text-[22px] font-semibold" style={{color}}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          <div className={`${surface} px-6 py-5`}>
            <p className={`text-[12px] font-medium mb-4 ${tx1}`}>Activité récente</p>
            {(!m.activiteRecente||m.activiteRecente.length===0)
              ? <p className={`text-[12px] ${tx3}`}>Aucune activité récente</p>
              : <div className="flex flex-col gap-2">
                  {m.activiteRecente.map((a,i)=>(
                    <div key={i} className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl ${dark?"bg-[#0d1117]":"bg-gray-50"}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:BRAND}}/>
                        <p className={`text-[12px] ${tx2}`}>{a.texte}</p>
                      </div>
                      <span className={`text-[11px] shrink-0 ${tx3}`}>{a.quand}</span>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>

      </div>

      {/* ── Modal Photo CNI ── */}
      {modalePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModalePhoto(false)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <div>
                <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>{m.nom}</p>
                <p className={`text-[10px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>Photo d'identité (CNI)</p>
              </div>
              <button onClick={()=>setModalePhoto(false)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}>
                <X size={13}/>
              </button>
            </div>
            <div className="px-5 py-8 flex flex-col items-center gap-4">
              {m.photo_url
                ? <img src={m.photo_url} alt={m.nom} className="w-36 h-36 rounded-full object-cover border-2 border-gray-200 shadow-lg"/>
                : <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark?"border-[#21262d] bg-[#0d1117] text-[#484f58]":"border-gray-200 bg-gray-50 text-gray-300"}`}>
                    <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className="text-[10px] text-center px-4">Aucune photo disponible</span>
                  </div>
              }
              <div className="text-center">
                <p className={`text-[13px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{m.nom}</p>
                <p className={`text-[11px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.specialite} · {m.cnom}</p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  {m.statut==="Actif"
                    ?<><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/><span className="text-[10px] font-bold text-emerald-600">Actif</span></>
                    :m.statut==="Suspendu"
                    ?<><span className="w-1.5 h-1.5 rounded-full bg-red-400"/><span className="text-[10px] font-bold text-red-500">Suspendu</span></>
                    :<><span className="w-1.5 h-1.5 rounded-full bg-gray-400"/><span className="text-[10px] font-bold text-gray-400">{m.statut}</span></>
                  }
                </div>
              </div>
            </div>
            <div className={`px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setModalePhoto(false)} className={`w-full py-2 rounded-xl text-[12px] font-medium border ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {modaleSusp  && <ModaleSuspension  m={m} dark={dark} onClose={()=>setModaleSusp(false)}  onConfirm={handleSuspension}/>}
      {modaleSuppr && <ModaleSuppression m={m} dark={dark} onClose={()=>setModaleSuppr(false)} onConfirm={handleSuppression}/>}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-medium text-white ${toast.type==="warn"?"bg-orange-500":"bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}