/**
 * FAQ.jsx — Gestion FAQ médecins + FAQ publiées admin
 *
 * 3 onglets :
 *   1. En attente  → questions non répondues + bouton Répondre
 *   2. Historique  → questions répondues (masquables frontend, 90j en BD)
 *   3. FAQ publiées → entrées créées par l'admin (vider = suppression BD)
 *
 * Dates affichées :
 *   - Questions : date de soumission (elapsed) + date de réponse si répondu
 *   - FAQ       : created_at + updated_at si modifié
 */

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  HelpCircle, MessageSquare, CheckCircle, Clock, Plus, X,
  Send, ChevronDown, ChevronUp, Search, Wind, PauseCircle,
  AlertCircle, Trash2, Calendar,
} from "lucide-react";
import { getQuestions, repondreQuestion, getFAQ, creerFAQ, modifierFAQ, toggleFAQPublie } from "../api/adminApi";
import { brand, getSurface, getText } from "../theme";

const NOW   = new Date();
const pad   = (n) => String(n).padStart(2, "0");
const sub   = (ms) => new Date(NOW.getTime() - ms);

/** Affiche une date en DD/MM/YYYY HH:MM */
function fmt(d) {
  if (!d) return "—";
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Affiche une date en DD/MM/YYYY */
function fmtDate(d) {
  if (!d) return "—";
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}

/** Affiche une durée relative depuis maintenant */
function elapsed(d) {
  if (!d) return "—";
  const dm = Math.floor((NOW - d) / 60000);
  if (dm < 1)    return "À l'instant";
  if (dm < 60)   return `Il y a ${dm} min`;
  if (dm < 1440) return `Il y a ${Math.floor(dm/60)}h`;
  if (dm < 10080) return `Il y a ${Math.floor(dm/1440)}j`;
  return fmtDate(d);
}

// ─────────────────────────────────────────────────────────────────────────────
// DONNÉES MOCK
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_QUESTIONS = [
  {
    id:1, medecin:"Dr. Jean Dupont", cnom:"CM-2019-0847", email:"j.dupont@hgd.cm",
    ville:"Douala", hopital:"H. Général Douala",
    avatarColor:brand.DEFAULT, initials:"JD", photo_url:null,
    question:"Comment modifier mon établissement de rattachement sur la plateforme ?",
    categorie:"Compte", statut:"en_attente",
    date: sub(2*3600000),
    reponse:null, dateReponse:null,
  },
  {
    id:2, medecin:"Dr. Kamto Diane", cnom:"CM-2017-0432", email:"d.kamto@chu.cm",
    ville:"Yaoundé", hopital:"CHU Yaoundé",
    avatarColor:"#185FA5", initials:"DK", photo_url:null,
    question:"Mon score de concordance IA semble incorrect. Comment est-il calculé ?",
    categorie:"IA", statut:"en_attente",
    date: sub(5*3600000),
    reponse:null, dateReponse:null,
  },
  {
    id:3, medecin:"Dr. Nkoa", cnom:"CM-2018-0521", email:"nkoa@hgd.cm",
    ville:"Douala", hopital:"H. Général Douala",
    avatarColor:"#7C3AED", initials:"DN", photo_url:null,
    question:"Je n'arrive pas à partager un cas clinique. L'option est grisée.",
    categorie:"Technique", statut:"repondu",
    date: sub(2*24*3600000),
    reponse:"Le partage de cas est disponible après validation complète de votre profil.",
    dateReponse: sub(1*24*3600000),
  },
  {
    id:4, medecin:"Dr. Barry", cnom:"CM-2020-0612", email:"barry@hrg.cm",
    ville:"Garoua", hopital:"H. Régional Garoua",
    avatarColor:"#D97706", initials:"DB", photo_url:null,
    question:"Est-il possible d'exporter mes consultations en PDF ou Excel ?",
    categorie:"Exportation", statut:"repondu",
    date: sub(5*24*3600000),
    reponse:"Oui, depuis votre tableau de bord médecin, cliquez sur 'Mes consultations' puis 'Exporter'.",
    dateReponse: sub(4*24*3600000),
  },
  {
    id:5, medecin:"Dr. Aminata Sow", cnom:"CM-2024-1122", email:"aminata@pneumo.cm",
    ville:"Yaoundé", hopital:"Clinique centrale",
    avatarColor:"#1D9E75", initials:"AS", photo_url:null,
    question:"Combien de temps faut-il pour valider un nouveau dossier d'inscription ?",
    categorie:"Inscription", statut:"en_attente",
    date: sub(30*60000),
    reponse:null, dateReponse:null,
  },
];

const MOCK_FAQ = [
  {
    id:1,
    question:"Comment fonctionne le score de concordance IA ?",
    reponse:"Le score compare vos diagnostics avec les suggestions de PneumoIA sur vos 30 dernières consultations.",
    categorie:"IA", publie:true, nb_vues:47,
    created_at: sub(15*24*3600000),
    updated_at: sub(2*24*3600000),
  },
  {
    id:2,
    question:"Comment modifier mes informations personnelles ?",
    reponse:"Allez dans Profil > Modifier. Certains champs comme le CNOM ne peuvent être modifiés que par l'administrateur.",
    categorie:"Compte", publie:true, nb_vues:32,
    created_at: sub(20*24*3600000),
    updated_at: null,
  },
  {
    id:3,
    question:"Comment partager un cas clinique avec la communauté ?",
    reponse:"Dans votre espace, ouvrez une consultation puis cliquez sur 'Partager'.",
    categorie:"Technique", publie:false, nb_vues:0,
    created_at: sub(3*24*3600000),
    updated_at: sub(1*24*3600000),
  },
];

const CATEGORIES = ["Toutes","Compte","IA","Technique","Exportation","Inscription","Autre"];
const CAT_COLORS = {
  "Compte":"#185FA5","IA":"#7C3AED","Technique":"#D97706",
  "Exportation":"#0891B2","Inscription":brand.DEFAULT,"Autre":"#6b7280",
};
const VILLES_CM = ["Toutes","Yaoundé","Douala","Bafoussam","Garoua","Maroua","Ngaoundéré","Bertoua","Ebolowa","Buéa","Limbé"];

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANTS UI
// ─────────────────────────────────────────────────────────────────────────────

function Modal({ onClose, title, subtitle, children, footer, dark, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`w-full ${wide?"max-w-2xl":"max-w-lg"} max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <div>
            <p className={`text-[15px] font-bold ${dark?"text-white":"text-gray-800"}`}>{title}</p>
            {subtitle&&<p className={`text-[14px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}>
            <X size={13}/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer&&<div className={`shrink-0 flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>{footer}</div>}
      </div>
    </div>
  );
}

function BadgeCat({ cat }) {
  return (
    <span style={{
      display:"inline-block", padding:"1px 8px", borderRadius:99,
      fontSize:14, fontWeight:700,
      background:`${CAT_COLORS[cat]||"#6b7280"}18`,
      color: CAT_COLORS[cat]||"#6b7280",
      border:`0.5px solid ${CAT_COLORS[cat]||"#6b7280"}40`,
    }}>{cat}</span>
  );
}

function DateLine({ label, date, dark }) {
  if (!date) return null;
  return (
    <span className={`flex items-center gap-1 text-[14px] ${dark?"text-[#484f58]":"text-gray-400"}`}>
      <Calendar size={9}/>
      {label} {elapsed(date)}
      <span className="opacity-50">· {fmtDate(date)}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function FAQ() {
  const { dark } = useOutletContext() || {};

  const [onglet,        setOnglet]        = useState("attente");
  const [questions,     setQuestions]     = useState(MOCK_QUESTIONS);
  const [faqList,       setFaqList]       = useState(MOCK_FAQ);
  const [loadingQ,      setLoadingQ]      = useState(true);
  const [loadingF,      setLoadingF]      = useState(true);
  const [search,        setSearch]        = useState("");
  const [catFiltre,     setCatFiltre]     = useState("Toutes");
  const [villeFiltre,   setVilleFiltre]   = useState("Toutes");
  const [modalePhoto,   setModalePhoto]   = useState(null);
  const [modaleRep,     setModaleRep]     = useState(null);
  const [modaleFAQ,     setModaleFAQ]     = useState(null);
  const [modaleViderH,  setModaleViderH]  = useState(false);
  const [modaleViderFAQ,       setModaleViderFAQ]       = useState(false);
  const [modaleViderBrouillons, setModaleViderBrouillons] = useState(false);
  const [expandFAQ,     setExpandFAQ]     = useState({});
  const [reponse,       setReponse]       = useState("");
  const [toast,         setToast]         = useState(null);

  useEffect(() => {
    setLoadingQ(true);
    getQuestions()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data.map(q => ({
            ...q,
            date:        q.created_at  ? new Date(q.created_at)  : new Date(),
            dateReponse: q.repondu_le  ? new Date(q.repondu_le)  : null,
          })));
        }
      })
      .catch(()=>{})
      .finally(()=>setLoadingQ(false));
  }, []);

  useEffect(() => {
    setLoadingF(true);
    getFAQ()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFaqList(data.map(f => ({
            ...f,
            created_at: f.created_at ? new Date(f.created_at) : null,
            updated_at: f.updated_at ? new Date(f.updated_at) : null,
          })));
        }
      })
      .catch(()=>{})
      .finally(()=>setLoadingF(false));
  }, []);

  const qFiltered = questions.filter(q => {
    const okSearch = !search || q.question.toLowerCase().includes(search.toLowerCase()) || q.medecin.toLowerCase().includes(search.toLowerCase());
    const okCat    = catFiltre==="Toutes"  || q.categorie===catFiltre;
    const okVille  = villeFiltre==="Toutes"|| q.ville===villeFiltre;
    return okSearch && okCat && okVille;
  });

  const nbAttente  = questions.filter(q=>q.statut==="en_attente").length;
  const nbRepondus = questions.filter(q=>q.statut==="repondu").length;

  function showToast(msg, type="success") {
    setToast({msg, type});
    setTimeout(()=>setToast(null), 3500);
  }

  async function handleRepondre() {
    if (!reponse.trim()) return;
    try {
      await repondreQuestion(modaleRep.id, reponse.trim());
    } catch(e) {}
    setQuestions(p=>p.map(q=>q.id===modaleRep.id
      ? {...q, statut:"repondu", reponse:reponse.trim(), dateReponse:new Date()}
      : q
    ));
    showToast(`Réponse envoyée à ${modaleRep.medecin}`);
    setModaleRep(null);
    setReponse("");
  }

  function handleViderHistorique() {
    const maintenant = Date.now();
    setQuestions(p => p.filter(q =>
      q.statut !== "repondu" ||
      (q.dateReponse && q.dateReponse.getTime() > maintenant)
    ));
    showToast("Historique vidé — les données restent en base");
    setModaleViderH(false);
  }

  function handleViderFAQ() {
    setFaqList(p => p.filter(f => !f.publie));
    showToast("FAQ publiées masquées de l'affichage");
    setModaleViderFAQ(false);
  }

  function handleViderBrouillons() {
    setFaqList(p => p.filter(f => f.publie));
    showToast("Brouillons masqués de l'affichage");
    setModaleViderBrouillons(false);
  }

  async function handleSaveFAQ(data) {
    try {
      if (data.id) {
        const updated = await modifierFAQ(data.id, data.question, data.reponse, data.categorie, data.publie);
        setFaqList(p=>p.map(f=>f.id===data.id ? {...updated, created_at:f.created_at, updated_at:new Date()} : f));
      } else {
        const created = await creerFAQ(data.question, data.reponse, data.categorie, data.publie);
        setFaqList(p=>[...p, {...created, created_at:new Date(), updated_at:null}]);
      }
    } catch(e) {
      if (data.id) {
        setFaqList(p=>p.map(f=>f.id===data.id ? {...data, updated_at:new Date()} : f));
      } else {
        setFaqList(p=>[...p, {...data, id:Date.now(), nb_vues:0, created_at:new Date(), updated_at:null}]);
      }
    }
    showToast(data.id ? "FAQ mise à jour" : "FAQ créée");
    setModaleFAQ(null);
  }

  async function togglePublish(id) {
    try { await toggleFAQPublie(id); } catch(e) {}
    setFaqList(p=>p.map(f=>f.id===id ? {...f, publie:!f.publie, updated_at:new Date()} : f));
  }

  const card = `rounded-2xl border ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`;
  const tx1  = dark?"text-white":"text-gray-900";
  const tx2  = dark?"text-[#8b949e]":"text-gray-500";
  const tx3  = dark?"text-[#484f58]":"text-gray-400";
  const inp  = `w-full text-[14px] px-3 py-2.5 rounded-xl border outline-none transition-colors ${dark?"bg-[#0d1117] border-[#21262d] text-white placeholder-[#484f58]":"bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400"}`;
  const sel  = `text-[15px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-medium ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${tx1}`}>FAQ Médecins</h1>
          <p className={`text-[14px] mt-1 ${tx2}`}>
            {nbAttente > 0
              ? <span className="text-orange-500 font-bold">{nbAttente} question{nbAttente>1?"s":""} en attente</span>
              : "Toutes les questions ont été traitées ✓"
            }
          </p>
        </div>
        <div className={`flex gap-1 p-1 rounded-xl border ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-100 border-gray-200"}`}>
          <button onClick={()=>setOnglet("attente")}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[15px] font-bold transition-all"
            style={onglet==="attente"?{background:brand.DEFAULT,color:"#fff"}:{color:dark?"#484f58":"#9ca3af"}}>
            <Clock size={12}/> En attente
            {nbAttente>0&&<span className="bg-orange-500 text-white text-[15px] font-black px-1.5 py-0.5 rounded-full">{nbAttente}</span>}
          </button>
          <button onClick={()=>setOnglet("historique")}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[15px] font-bold transition-all"
            style={onglet==="historique"?{background:brand.DEFAULT,color:"#fff"}:{color:dark?"#484f58":"#9ca3af"}}>
            <MessageSquare size={12}/> Historique
            <span className={`text-[15px] font-black px-1.5 py-0.5 rounded-full ${onglet==="historique"?"bg-white/20 text-white":dark?"bg-[#21262d] text-[#484f58]":"bg-gray-200 text-gray-500"}`}>
              {nbRepondus}
            </span>
          </button>
          <button onClick={()=>setOnglet("faq")}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[15px] font-bold transition-all"
            style={onglet==="faq"?{background:brand.DEFAULT,color:"#fff"}:{color:dark?"#484f58":"#9ca3af"}}>
            <HelpCircle size={12}/> FAQ publiées
            <span className={`text-[15px] font-black px-1.5 py-0.5 rounded-full ${onglet==="faq"?"bg-white/20 text-white":dark?"bg-[#21262d] text-[#484f58]":"bg-gray-200 text-gray-500"}`}>
              {faqList.filter(f=>f.publie).length}
            </span>
          </button>
          <button onClick={()=>setOnglet("brouillons")}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[15px] font-bold transition-all"
            style={onglet==="brouillons"?{background:brand.DEFAULT,color:"#fff"}:{color:dark?"#484f58":"#9ca3af"}}>
            <HelpCircle size={12}/> Brouillons
            <span className={`text-[15px] font-black px-1.5 py-0.5 rounded-full ${onglet==="brouillons"?"bg-white/20 text-white":dark?"bg-[#21262d] text-[#484f58]":"bg-gray-200 text-gray-500"}`}>
              {faqList.filter(f=>!f.publie).length}
            </span>
          </button>
        </div>
      </div>

      {(onglet==="attente"||onglet==="historique") && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-2 h-9 px-3 rounded-xl border flex-1 min-w-[200px] max-w-xs ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <Search size={13} className={tx3}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Médecin ou question…"
              className="flex-1 bg-transparent border-none outline-none text-[14px]"
              style={{color:dark?"#e6edf3":"#1f2937"}}/>
          </div>
          <select value={catFiltre} onChange={e=>setCatFiltre(e.target.value)} className={sel}>
            {CATEGORIES.map(c=><option key={c} value={c}>{c==="Toutes"?"Toutes catégories":c}</option>)}
          </select>
          <select value={villeFiltre} onChange={e=>setVilleFiltre(e.target.value)} className={sel}>
            {VILLES_CM.map(v=><option key={v} value={v}>{v==="Toutes"?"Toutes les villes":v}</option>)}
          </select>
        </div>
      )}

      {onglet==="attente" && (
        <div className="flex flex-col gap-3">
          {qFiltered.filter(q=>q.statut==="en_attente").length===0
            ? <div className={`${card} px-5 py-12 text-center`}>
                <HelpCircle size={32} className={`mx-auto mb-3 ${tx3}`}/>
                <p className={`text-[14px] ${tx3}`}>Aucune question en attente</p>
              </div>
            : qFiltered.filter(q=>q.statut==="en_attente").map(q=>(
              <div key={q.id} className={`${card} p-5`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {q.photo_url
                      ? <img src={q.photo_url} alt={q.medecin}
                          className="w-9 h-9 rounded-full object-cover shrink-0 cursor-pointer hover:opacity-75 transition-opacity border border-gray-200"
                          onClick={()=>setModalePhoto(q)}
                          onError={e => { e.currentTarget.style.display="none"; e.currentTarget.nextSibling.style.display="flex"; }} />
                      : null}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[14px] font-bold shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
                      style={{background:q.avatarColor, display: q.photo_url ? "none" : "flex"}} onClick={()=>setModalePhoto(q)}>
                      {q.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className={`text-[14px] font-bold cursor-pointer hover:underline ${tx1}`} onClick={()=>setModalePhoto(q)}>{q.medecin}</p>
                        <span className={`text-[14px] font-mono ${tx3}`}>{q.cnom}</span>
                        <span className={`text-[14px] ${tx3}`}>· {q.ville}</span>
                        <BadgeCat cat={q.categorie}/>
                      </div>
                      <p className={`text-[15px] font-medium ${tx1} mb-1.5`}>{q.question}</p>
                      <DateLine label="Posée" date={q.date} dark={dark}/>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,fontSize:14,fontWeight:700,background:"#fff7ed",color:"#c2410c",border:"0.5px solid #fed7aa"}}>
                      <Clock size={9}/> En attente
                    </span>
                    <button onClick={()=>{setModaleRep(q);setReponse("");}}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[15px] font-bold text-white"
                      style={{background:brand.DEFAULT}}>
                      <Send size={11}/> Répondre
                    </button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {onglet==="historique" && (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[15px] flex-1 ${dark?"bg-[#0d1117] border-[#21262d] text-[#484f58]":"bg-blue-50 border-blue-100 text-blue-700"}`}>
              <Clock size={13} className="shrink-0"/>
              <span>Archivage automatique après <strong>90 jours</strong> · Les données restent en base.</span>
            </div>
            {nbRepondus > 0 && (
              <button onClick={()=>setModaleViderH(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[15px] font-bold border transition-colors shrink-0 ${dark?"border-[#21262d] text-[#484f58] hover:border-red-700/40 hover:text-red-400 hover:bg-red-900/20":"border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50"}`}>
                <Trash2 size={12}/> Vider
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {qFiltered.filter(q=>q.statut==="repondu").length===0
              ? <div className={`${card} px-5 py-12 text-center`}>
                  <MessageSquare size={32} className={`mx-auto mb-3 ${tx3}`}/>
                  <p className={`text-[14px] ${tx3}`}>Aucune question dans l'historique</p>
                </div>
              : qFiltered.filter(q=>q.statut==="repondu").map(q=>(
                <div key={q.id} className={`${card} p-5 opacity-90`}>
                  <div className="flex items-start gap-3">
                    {q.photo_url
                      ? <img src={q.photo_url} alt={q.medecin}
                          className="w-9 h-9 rounded-full object-cover shrink-0 cursor-pointer hover:opacity-75 border border-gray-200"
                          onClick={()=>setModalePhoto(q)}
                          onError={e => { e.currentTarget.style.display="none"; e.currentTarget.nextSibling.style.display="flex"; }} />
                      : null}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[14px] font-bold shrink-0 cursor-pointer hover:opacity-75"
                      style={{background:q.avatarColor, display: q.photo_url ? "none" : "flex"}} onClick={()=>setModalePhoto(q)}>
                      {q.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className={`text-[14px] font-bold cursor-pointer hover:underline ${tx1}`} onClick={()=>setModalePhoto(q)}>{q.medecin}</p>
                        <span className={`text-[14px] font-mono ${tx3}`}>{q.cnom}</span>
                        <span className={`text-[14px] ${tx3}`}>· {q.ville}</span>
                        <BadgeCat cat={q.categorie}/>
                        <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"1px 8px",borderRadius:99,fontSize:14,fontWeight:700,background:"#ecfdf5",color:"#065f46",border:"0.5px solid #6ee7b7"}}>
                          <CheckCircle size={9}/> Répondu
                        </span>
                      </div>
                      <p className={`text-[15px] font-medium mb-2 ${tx1}`}>{q.question}</p>

                      <div className="flex items-center gap-4 mb-3 flex-wrap">
                        <DateLine label="Posée" date={q.date} dark={dark}/>
                        <DateLine label="Répondu" date={q.dateReponse} dark={dark}/>
                      </div>

                      <div className={`px-4 py-3 rounded-xl border-l-2 ${dark?"bg-[#0d1117] border-teal-700":"bg-blue-50 border-blue-500"}`}>
                        <p className={`text-[14px] font-bold mb-1 ${dark?"text-blue-400":"text-blue-800"}`}>
                          Réponse de l'administrateur
                        </p>
                        <p className={`text-[14px] leading-relaxed ${dark?"text-[#8b949e]":"text-gray-700"}`}>{q.reponse}</p>
                      </div>
                    </div>
                    <button onClick={()=>{setModaleRep(q);setReponse(q.reponse||"");}}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-[14px] font-bold border ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      Modifier
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </>
      )}

      {onglet==="faq" && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border flex-1 ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
              <p className={`text-[14px] flex-1 ${tx2}`}>
                {faqList.filter(f=>f.publie).length} entrée{faqList.filter(f=>f.publie).length>1?"s":""} publiée{faqList.filter(f=>f.publie).length>1?"s":""}
              </p>
              {faqList.length > 0 && (
                <button onClick={()=>setModaleViderFAQ(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[15px] font-bold border transition-colors shrink-0 ${dark?"border-[#21262d] text-[#484f58] hover:border-red-700/40 hover:text-red-400 hover:bg-red-900/20":"border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50"}`}>
                  <Trash2 size={11}/> Vider
                </button>
              )}
            </div>
            <button onClick={()=>setModaleFAQ("new")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-bold text-white shrink-0"
              style={{background:brand.DEFAULT}}>
              <Plus size={13}/> Nouvelle FAQ
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {faqList.filter(f=>f.publie).length===0
              ? <div className={`${card} px-5 py-12 text-center`}>
                  <HelpCircle size={32} className={`mx-auto mb-3 ${tx3}`}/>
                  <p className={`text-[14px] ${tx3}`}>Aucune FAQ publiée — publiez un brouillon ou créez une nouvelle entrée</p>
                </div>
              : faqList.filter(f=>f.publie).map(f=>(
                <div key={f.id} className={`${card} p-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <BadgeCat cat={f.categorie}/>
                        <span style={{
                          display:"inline-block",padding:"1px 8px",borderRadius:99,fontSize:14,fontWeight:700,
                          background:f.publie?"#ecfdf5":"#f3f4f6",
                          color:f.publie?"#065f46":"#9ca3af",
                          border:`0.5px solid ${f.publie?"#6ee7b7":"#e5e7eb"}`,
                        }}>{f.publie?"● Publiée":"○ Brouillon"}</span>
                        <span className={`text-[14px] ${tx3}`}>{f.nb_vues} vue{f.nb_vues>1?"s":""}</span>
                      </div>

                      <button onClick={()=>setExpandFAQ(p=>({...p,[f.id]:!p[f.id]}))}
                        className={`flex items-center justify-between w-full text-left gap-3 ${tx1} mb-2`}>
                        <p className="text-[15px] font-semibold flex-1">{f.question}</p>
                        {expandFAQ[f.id]?<ChevronUp size={14} className={tx3}/>:<ChevronDown size={14} className={tx3}/>}
                      </button>

                      {expandFAQ[f.id] && (
                        <div className={`mb-3 px-4 py-3 rounded-xl ${dark?"bg-[#0d1117]":"bg-gray-50"}`}>
                          <p className={`text-[14px] leading-relaxed ${tx2}`}>{f.reponse}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 flex-wrap">
                        <DateLine label="Créée" date={f.created_at} dark={dark}/>
                        {f.updated_at && <DateLine label="Modifiée" date={f.updated_at} dark={dark}/>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={()=>setModaleFAQ(f)}
                        className={`px-3 py-1.5 rounded-xl text-[14px] font-bold border transition-colors ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                        Modifier
                      </button>
                      <button onClick={()=>togglePublish(f.id)}
                        className="px-3 py-1.5 rounded-xl text-[14px] font-bold border transition-colors"
                        style={f.publie
                          ?{borderColor:"#fed7aa",color:"#c2410c",background:"#fff7ed"}
                          :{borderColor:"#bbf7d0",color:brand.DEFAULT,background:"#f0fdf4"}}>
                        {f.publie?"Dépublier":"Publier"}
                      </button>

                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </>
      )}

      {modaleRep && (
        <Modal dark={dark} wide
          onClose={()=>{setModaleRep(null);setReponse("");}}
          title={modaleRep.statut==="en_attente"?"Répondre à la question":"Modifier la réponse"}
          subtitle={`${modaleRep.medecin} · ${modaleRep.email}`}
          footer={<>
            <button onClick={()=>{setModaleRep(null);setReponse("");}}
              className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>
              Annuler
            </button>
            <button onClick={handleRepondre} disabled={!reponse.trim()}
              className="flex-1 py-2 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2"
              style={{background:reponse.trim()?brand.DEFAULT:"#d1d5db",cursor:reponse.trim()?"pointer":"not-allowed"}}>
              <Send size={12}/> {modaleRep.statut==="en_attente"?"Envoyer la réponse":"Mettre à jour"}
            </button>
          </>}>
          <div className="flex flex-col gap-4">
            <div className={`px-4 py-3 rounded-xl border ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                {modaleRep.photo_url
                  ? <img src={modaleRep.photo_url} alt={modaleRep.medecin} className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-200" />
                  : <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[15px] font-bold shrink-0"
                      style={{background:modaleRep.avatarColor}}>{modaleRep.initials}</div>
                }
                <p className={`text-[15px] font-bold ${tx1}`}>{modaleRep.medecin}</p>
                <BadgeCat cat={modaleRep.categorie}/>
              </div>
              <p className={`text-[14px] font-medium ${tx1} mb-1`}>{modaleRep.question}</p>
              <DateLine label="Posée" date={modaleRep.date} dark={dark}/>
            </div>

            <div>
              <label className={`block text-[15px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>
                Votre réponse <span className="text-red-500">*</span>
              </label>
              <textarea value={reponse} onChange={e=>setReponse(e.target.value)} rows={6}
                placeholder="Rédigez une réponse claire et complète…"
                className={`${inp} resize-none`}/>
              <p className={`text-[14px] mt-1 ${tx3}`}>
                La réponse sera envoyée par e-mail à {modaleRep.email}
              </p>
            </div>

            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${dark?"bg-[#0d1117] border-[#21262d]":"bg-blue-50 border-blue-100"}`}>
              <HelpCircle size={14} className={dark?"text-[#484f58]":"text-blue-500"}/>
              <p className={`text-[15px] ${dark?"text-[#484f58]":"text-blue-700"}`}>
                Ajouter cette Q&R à la FAQ publique ?
              </p>
              <button onClick={()=>{
                  if (!reponse.trim()) return;
                  setFaqList(p=>[...p,{
                    id:Date.now(), question:modaleRep.question, reponse,
                    categorie:modaleRep.categorie, publie:false, nb_vues:0,
                    created_at:new Date(), updated_at:null,
                  }]);
                  showToast("Ajoutée à la FAQ (brouillon)");
                }}
                className="ml-auto px-3 py-1 rounded-lg text-[14px] font-bold text-white shrink-0"
                style={{background:brand.DEFAULT}}>
                Ajouter
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modaleFAQ && (
        <ModalFAQForm
          dark={dark} inp={inp}
          faq={modaleFAQ==="new"?null:modaleFAQ}
          onClose={()=>setModaleFAQ(null)}
          onSave={handleSaveFAQ}
        />
      )}

      {modaleViderH && (
        <Modal dark={dark} onClose={()=>setModaleViderH(false)}
          title="Vider l'affichage de l'historique"
          footer={<>
            <button onClick={()=>setModaleViderH(false)}
              className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>
              Annuler
            </button>
            <button onClick={handleViderHistorique}
              className="flex-1 py-2 rounded-xl text-[14px] font-bold text-white"
              style={{background:brand.DEFAULT}}>
              Vider l'affichage
            </button>
          </>}>
          <div className="flex flex-col gap-3">
            <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[15px] ${dark?"bg-blue-900/20 border-blue-700/40 text-blue-300":"bg-blue-50 border-blue-200 text-blue-700"}`}>
              <HelpCircle size={13} className="shrink-0 mt-0.5"/>
              <span>
                Ceci masque uniquement les questions répondues de l'affichage.
                <strong> Les données restent en base de données</strong> et sont archivées pendant 90 jours.
              </span>
            </div>
            <p className={`text-[14px] ${tx2}`}>
              {nbRepondus} question{nbRepondus>1?"s":""} répondue{nbRepondus>1?"s":""} sera{nbRepondus>1?"ont":""} masquée{nbRepondus>1?"s":""}.
            </p>
          </div>
        </Modal>
      )}

      {onglet==="brouillons" && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border flex-1 ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
              <p className={`text-[14px] flex-1 ${tx2}`}>
                {faqList.filter(f=>!f.publie).length} brouillon{faqList.filter(f=>!f.publie).length>1?"s":""}
              </p>
              {faqList.filter(f=>!f.publie).length > 0 && (
                <button onClick={()=>setModaleViderBrouillons(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[15px] font-bold border transition-colors shrink-0 ${dark?"border-[#21262d] text-[#484f58] hover:border-red-700/40 hover:text-red-400 hover:bg-red-900/20":"border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50"}`}>
                  <Trash2 size={11}/> Vider
                </button>
              )}
            </div>
            <button onClick={()=>setModaleFAQ("new")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-bold text-white shrink-0"
              style={{background:brand.DEFAULT}}>
              <Plus size={13}/> Nouvelle FAQ
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {faqList.filter(f=>!f.publie).length===0
              ? <div className={`${card} px-5 py-12 text-center`}>
                  <HelpCircle size={32} className={`mx-auto mb-3 ${tx3}`}/>
                  <p className={`text-[14px] ${tx3}`}>Aucun brouillon</p>
                </div>
              : faqList.filter(f=>!f.publie).map(f=>(
                <div key={f.id} className={`${card} p-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <BadgeCat cat={f.categorie}/>
                        <span style={{display:"inline-block",padding:"1px 8px",borderRadius:99,fontSize:14,fontWeight:700,background:"#f3f4f6",color:"#9ca3af",border:"0.5px solid #e5e7eb"}}>
                          ○ Brouillon
                        </span>
                      </div>
                      <button onClick={()=>setExpandFAQ(p=>({...p,[`b_${f.id}`]:!p[`b_${f.id}`]}))}
                        className={`flex items-center justify-between w-full text-left gap-3 ${tx1} mb-2`}>
                        <p className="text-[15px] font-semibold flex-1">{f.question}</p>
                        {expandFAQ[`b_${f.id}`]?<ChevronUp size={14} className={tx3}/>:<ChevronDown size={14} className={tx3}/>}
                      </button>
                      {expandFAQ[`b_${f.id}`] && (
                        <div className={`mb-3 px-4 py-3 rounded-xl ${dark?"bg-[#0d1117]":"bg-gray-50"}`}>
                          <p className={`text-[14px] leading-relaxed ${tx2}`}>{f.reponse}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 flex-wrap">
                        <DateLine label="Créée" date={f.created_at} dark={dark}/>
                        {f.updated_at && <DateLine label="Modifiée" date={f.updated_at} dark={dark}/>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={()=>setModaleFAQ(f)}
                        className={`px-3 py-1.5 rounded-xl text-[14px] font-bold border transition-colors ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                        Modifier
                      </button>
                      <button onClick={()=>togglePublish(f.id)}
                        className="px-3 py-1.5 rounded-xl text-[14px] font-bold border transition-colors"
                        style={{borderColor:"#bbf7d0",color:brand.DEFAULT,background:"#f0fdf4"}}>
                        Publier
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </>
      )}

      {modaleViderBrouillons && (
        <Modal dark={dark} onClose={()=>setModaleViderBrouillons(false)}
          title="Vider l'affichage des brouillons"
          footer={<>
            <button onClick={()=>setModaleViderBrouillons(false)}
              className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>
              Annuler
            </button>
            <button onClick={handleViderBrouillons}
              className="flex-1 py-2 rounded-xl text-[14px] font-bold text-white"
              style={{background:brand.DEFAULT}}>
              Vider l'affichage
            </button>
          </>}>
          <div className="flex flex-col gap-3">
            <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[15px] ${dark?"bg-blue-900/20 border-blue-700/40 text-blue-300":"bg-blue-50 border-blue-200 text-blue-700"}`}>
              <HelpCircle size={13} className="shrink-0 mt-0.5"/>
              <span>
                Ceci masque les brouillons de l'affichage.
                <strong> Les données restent en base</strong> — elles ne sont pas supprimées.
              </span>
            </div>
            <p className={`text-[14px] ${tx2}`}>
              {faqList.filter(f=>!f.publie).length} brouillon{faqList.filter(f=>!f.publie).length>1?"s":""} sera{faqList.filter(f=>!f.publie).length>1?"ont":""} masqué{faqList.filter(f=>!f.publie).length>1?"s":""}.
            </p>
          </div>
        </Modal>
      )}

      {modaleViderFAQ && (
        <Modal dark={dark} onClose={()=>setModaleViderFAQ(false)}
          title="Vider l'affichage de la FAQ"
          footer={<>
            <button onClick={()=>setModaleViderFAQ(false)}
              className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>
              Annuler
            </button>
            <button onClick={handleViderFAQ}
              className="flex-1 py-2 rounded-xl text-[14px] font-bold text-white"
              style={{background:brand.DEFAULT}}>
              Vider l'affichage
            </button>
          </>}>
          <div className="flex flex-col gap-3">
            <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[15px] ${dark?"bg-blue-900/20 border-blue-700/40 text-blue-300":"bg-blue-50 border-blue-200 text-blue-700"}`}>
              <HelpCircle size={13} className="shrink-0 mt-0.5"/>
              <span>
                Ceci masque les entrées FAQ de l'affichage.
                <strong> Les données restent en base</strong> — elles ne sont pas supprimées.
              </span>
            </div>
            <p className={`text-[14px] ${tx2}`}>
              {faqList.length} entrée{faqList.length>1?"s":""} sera{faqList.length>1?"ont":""} masquée{faqList.length>1?"s":""}.
            </p>
          </div>
        </Modal>
      )}

      {modalePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModalePhoto(null)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <div>
                <p className={`text-[15px] font-bold ${dark?"text-white":"text-gray-800"}`}>{modalePhoto.medecin}</p>
                <p className={`text-[14px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>Photo d'identité · {modalePhoto.ville}</p>
              </div>
              <button onClick={()=>setModalePhoto(null)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
            </div>
            <div className="px-5 py-8 flex flex-col items-center gap-4">
              {modalePhoto.photo_url
                ? <img src={modalePhoto.photo_url} alt={modalePhoto.medecin} className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow"/>
                : <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark?"border-[#21262d] bg-[#0d1117] text-[#484f58]":"border-gray-200 bg-gray-50 text-gray-300"}`}>
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span className="text-[14px] text-center px-4">Aucune photo disponible</span>
                  </div>
              }
              <div className="text-center">
                <p className={`text-[15px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{modalePhoto.medecin}</p>
                <p className={`text-[15px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{modalePhoto.cnom} · {modalePhoto.hopital}</p>
              </div>
            </div>
            <div className={`px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setModalePhoto(null)} className={`w-full py-2 rounded-xl text-[14px] font-medium border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[14px] font-semibold text-white ${toast.type==="success"?"bg-blue-700":"bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function ModalFAQForm({ dark, inp, faq, onClose, onSave }) {
  const [question,  setQuestion]  = useState(faq?.question  || "");
  const [reponse,   setReponse]   = useState(faq?.reponse   || "");
  const [categorie, setCategorie] = useState(faq?.categorie || "Compte");
  const [publie,    setPublie]    = useState(faq?.publie     || false);
  const ok = question.trim() && reponse.trim();

  const tx1 = dark?"text-white":"text-gray-800";
  const tx3 = dark?"text-[#484f58]":"text-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <div>
            <p className={`text-[15px] font-bold ${tx1}`}>{faq?"Modifier la FAQ":"Nouvelle entrée FAQ"}</p>
            {faq && (
              <div className="flex items-center gap-3 mt-0.5">
                {faq.created_at && (
                  <span className={`text-[14px] flex items-center gap-1 ${tx3}`}>
                    <Calendar size={9}/> Créée {faq.created_at.toLocaleDateString("fr-FR")}
                  </span>
                )}
                {faq.updated_at && (
                  <span className={`text-[14px] flex items-center gap-1 ${tx3}`}>
                    · Modifiée {faq.updated_at.toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            )}
          </div>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          <div>
            <label className={`block text-[15px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Question <span className="text-red-500">*</span></label>
            <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Quelle est la question ?" className={inp}/>
          </div>
          <div>
            <label className={`block text-[15px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Réponse <span className="text-red-500">*</span></label>
            <textarea value={reponse} onChange={e=>setReponse(e.target.value)} rows={5} placeholder="Réponse complète et claire…" className={`${inp} resize-none`}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-[15px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Catégorie</label>
              <select value={categorie} onChange={e=>setCategorie(e.target.value)} className={inp}>
                {CATEGORIES.filter(c=>c!=="Toutes").map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-[15px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Visibilité</label>
              <select value={publie?1:0} onChange={e=>setPublie(!!Number(e.target.value))} className={inp}>
                <option value={0}>Brouillon</option>
                <option value={1}>Publier maintenant</option>
              </select>
            </div>
          </div>
        </div>
        <div className={`shrink-0 flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
          <button onClick={()=>ok&&onSave({...faq, question, reponse, categorie, publie})} disabled={!ok}
            className="flex-1 py-2 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2"
            style={{background:ok?brand.DEFAULT:"#d1d5db",cursor:ok?"pointer":"not-allowed"}}>
            {faq?"Mettre à jour":"Créer la FAQ"}
          </button>
        </div>
      </div>
    </div>
  );
}