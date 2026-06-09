import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { HelpCircle, MessageSquare, CheckCircle, Clock, Plus, X, Send, ChevronDown, ChevronUp, Search, Tag, History } from "lucide-react";

const BRAND = "#0f766e";
const NOW   = new Date();
const pad   = (n) => String(n).padStart(2, "0");
function fmt(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function elapsed(d) {
  const dm = Math.floor((NOW - d) / 60000);
  if (dm < 60)  return `Il y a ${dm} min`;
  if (dm < 1440) return `Il y a ${Math.floor(dm/60)}h`;
  return `Il y a ${Math.floor(dm/1440)}j`;
}

const sub = (ms) => new Date(NOW.getTime() - ms);

// ── Questions posées par les médecins ─────────────────────────────────────────
const MOCK_QUESTIONS = [
  { id:1, medecin:"Dr. Jean Dupont", cnom:"CM-2019-0847", email:"j.dupont@hgd.cm",
    ville:"Douala", hopital:"H. Général Douala",
    avatarColor:"#0f766e", initials:"JD", photo_url:null,
    question:"Comment modifier mon établissement de rattachement sur la plateforme ?",
    categorie:"Compte", statut:"en_attente", date:sub(2*3600000),
    reponse:null },
  { id:2, medecin:"Dr. Kamto Diane", cnom:"CM-2017-0432", email:"d.kamto@chu.cm",
    ville:"Yaoundé", hopital:"CHU Yaoundé",
    avatarColor:"#185FA5", initials:"DK", photo_url:null,
    question:"Mon score de concordance IA semble incorrect. Comment est-il calculé ?",
    categorie:"IA", statut:"en_attente", date:sub(5*3600000),
    reponse:null },
  { id:3, medecin:"Dr. Nkoa", cnom:"CM-2018-0521", email:"nkoa@hgd.cm",
    ville:"Douala", hopital:"H. Général Douala",
    avatarColor:"#7C3AED", initials:"DN", photo_url:null,
    question:"Je n'arrive pas à partager un cas clinique. L'option est grisée.",
    categorie:"Technique", statut:"repondu", date:sub(2*24*3600000),
    reponse:"Le partage de cas est disponible après validation complète de votre profil. Vérifiez que votre CNOM est vérifié. Si le problème persiste, contactez le support technique.",
    dateReponse: sub(1*24*3600000) },
  { id:4, medecin:"Dr. Barry", cnom:"CM-2020-0612", email:"barry@hrg.cm",
    ville:"Garoua", hopital:"H. Régional Garoua",
    avatarColor:"#D97706", initials:"DB", photo_url:null,
    question:"Est-il possible d'exporter mes consultations en PDF ou Excel ?",
    categorie:"Exportation", statut:"repondu", date:sub(5*24*3600000),
    reponse:"Oui, depuis votre tableau de bord médecin, cliquez sur 'Mes consultations' puis 'Exporter'. Les formats PDF et Excel sont disponibles.",
    dateReponse: sub(4*24*3600000) },
  { id:5, medecin:"Dr. Aminata Sow", cnom:"CM-2024-1122", email:"aminata@pneumo.cm",
    ville:"Yaoundé", hopital:"Clinique centrale",
    avatarColor:"#1D9E75", initials:"AS", photo_url:null,
    question:"Combien de temps faut-il pour valider un nouveau dossier d'inscription ?",
    categorie:"Inscription", statut:"en_attente", date:sub(30*60000),
    reponse:null },
];

// ── FAQ générales publiées ────────────────────────────────────────────────────
const MOCK_FAQ = [
  { id:1, question:"Comment fonctionne le score de concordance IA ?",
    reponse:"Le score de concordance IA compare vos diagnostics avec les suggestions du modèle PneumoIA. Il est calculé sur vos 30 dernières consultations et mis à jour chaque semaine.",
    categorie:"IA", publie:true, vues:47 },
  { id:2, question:"Comment modifier mes informations personnelles ?",
    reponse:"Allez dans Profil > Modifier. Certains champs comme le CNOM ne peuvent être modifiés que par l'administrateur.",
    categorie:"Compte", publie:true, vues:32 },
  { id:3, question:"Comment partager un cas clinique avec la communauté ?",
    reponse:"Dans votre espace, ouvrez une consultation puis cliquez sur 'Partager'. Vous pouvez choisir de partager anonymement ou avec votre nom.",
    categorie:"Technique", publie:false, vues:0 },
];

const CATEGORIES = ["Toutes","Compte","IA","Technique","Exportation","Inscription","Autre"];
const CAT_COLORS = {
  "Compte":"#185FA5","IA":"#7C3AED","Technique":"#D97706",
  "Exportation":"#0891B2","Inscription":"#0f766e","Autre":"#6b7280"
};

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ onClose, title, subtitle, children, footer, dark, wide }) {
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

export default function FAQ() {
  const { dark } = useOutletContext() || {};
  const VILLES_CM = ["Toutes","Yaoundé","Douala","Bafoussam","Garoua","Maroua","Ngaoundéré","Bertoua","Ebolowa","Buéa","Limbé"];

  const [onglet,       setOnglet]       = useState("questions");
  const [questions,    setQuestions]    = useState(MOCK_QUESTIONS);
  const [faqList,      setFaqList]      = useState(MOCK_FAQ);
  const [search,       setSearch]       = useState("");
  const [catFiltre,    setCatFiltre]    = useState("Toutes");
  const [statutFiltre, setStatutFiltre] = useState("Tous");
  const [villeFiltre,  setVilleFiltre]  = useState("Toutes");
  const [modalePhoto,  setModalePhoto]  = useState(null);
  const [modaleRep,    setModaleRep]    = useState(null);
  const [modaleFAQ,    setModaleFAQ]    = useState(null); // null | "new" | {faq}
  const [expandFAQ,    setExpandFAQ]    = useState({});
  const [reponse,      setReponse]      = useState("");
  const [toast,        setToast]        = useState(null);

  // Filtres questions
  const qFiltered = questions.filter(q => {
    const okSearch  = !search || q.question.toLowerCase().includes(search.toLowerCase()) || q.medecin.toLowerCase().includes(search.toLowerCase());
    const okCat     = catFiltre==="Toutes"  || q.categorie===catFiltre;
    const okStatut  = statutFiltre==="Tous" || q.statut===statutFiltre;
    const okVille   = villeFiltre==="Toutes"|| q.ville===villeFiltre;
    return okSearch && okCat && okStatut && okVille;
  });

  const nbAttente = questions.filter(q=>q.statut==="en_attente").length;

  function showToast(msg, type="success") {
    setToast({msg,type});
    setTimeout(()=>setToast(null),3000);
  }

  function handleRepondre() {
    if (!reponse.trim()) return;
    setQuestions(p=>p.map(q=>q.id===modaleRep.id
      ? {...q, statut:"repondu", reponse:reponse.trim(), dateReponse:new Date()}
      : q
    ));
    showToast(`Réponse envoyée à ${modaleRep.medecin}`);
    setModaleRep(null);
    setReponse("");
  }

  function handleSaveFAQ(data) {
    if (data.id) {
      setFaqList(p=>p.map(f=>f.id===data.id?data:f));
      showToast("FAQ mise à jour");
    } else {
      setFaqList(p=>[...p, {...data, id:Date.now(), vues:0}]);
      showToast("FAQ publiée");
    }
    setModaleFAQ(null);
  }

  function togglePublish(id) {
    setFaqList(p=>p.map(f=>f.id===id?{...f,publie:!f.publie}:f));
  }

  const card  = `rounded-2xl border ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`;
  const tx1   = dark?"text-white":"text-gray-900";
  const tx2   = dark?"text-[#8b949e]":"text-gray-500";
  const tx3   = dark?"text-[#484f58]":"text-gray-400";
  const inp   = `w-full text-[12px] px-3 py-2.5 rounded-xl border outline-none transition-colors ${dark?"bg-[#0d1117] border-[#21262d] text-white placeholder-[#484f58]":"bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1100px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className={`text-xl md:text-2xl font-black tracking-tight ${tx1}`}>FAQ Médecins</h1>
          <p className={`text-[12px] mt-1 ${tx2}`}>
            {nbAttente > 0
              ? <span className="text-orange-500 font-bold">{nbAttente} question{nbAttente>1?"s":""} en attente de réponse</span>
              : "Toutes les questions ont été traitées ✓"
            }
          </p>
        </div>
        {/* Onglets */}
        <div className={`flex gap-1 p-1 rounded-xl border ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-100 border-gray-200"}`}>
          <button onClick={()=>setOnglet("attente")}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all"
            style={onglet==="attente"?{background:BRAND,color:"#fff"}:{color:dark?"#484f58":"#9ca3af"}}>
            <Clock size={12}/> En attente
            {nbAttente>0&&<span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{nbAttente}</span>}
          </button>
          <button onClick={()=>setOnglet("historique")}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all"
            style={onglet==="historique"?{background:BRAND,color:"#fff"}:{color:dark?"#484f58":"#9ca3af"}}>
            <MessageSquare size={12}/> Historique
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${onglet==="historique"?"bg-white/20 text-white":dark?"bg-[#21262d] text-[#484f58]":"bg-gray-200 text-gray-500"}`}>
              {questions.filter(q=>q.statut==="repondu").length}
            </span>
          </button>
          <button onClick={()=>setOnglet("faq")}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all"
            style={onglet==="faq"?{background:BRAND,color:"#fff"}:{color:dark?"#484f58":"#9ca3af"}}>
            <HelpCircle size={12}/> FAQ publiées
          </button>
        </div>
      </div>

      {/* Filtres communs aux 2 onglets questions */}
      {(onglet === "attente" || onglet === "historique") && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-2 h-9 px-3 rounded-xl border flex-1 min-w-[200px] max-w-xs ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <Search size={13} className={tx3}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Médecin ou question…"
              className="flex-1 bg-transparent border-none outline-none text-[12px]"
              style={{color:dark?"#e6edf3":"#1f2937"}}/>
          </div>
          <select value={catFiltre} onChange={e=>setCatFiltre(e.target.value)}
            className={`text-[11px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-medium ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
            {CATEGORIES.map(cat=><option key={cat} value={cat}>{cat==="Toutes"?"Toutes catégories":cat}</option>)}
          </select>
          <select value={villeFiltre} onChange={e=>setVilleFiltre(e.target.value)}
            className={`text-[11px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-medium ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
            {VILLES_CM.map(v=><option key={v} value={v}>{v==="Toutes"?"Toutes les villes":v}</option>)}
          </select>
        </div>
      )}

      {/* ══ ONGLET EN ATTENTE ══ */}
      {onglet === "attente" && (
        <>

          {/* Liste questions en attente */}
          <div className="flex flex-col gap-3">
            {qFiltered.filter(q=>q.statut==="en_attente").length===0
              ? <div className={`${card} px-5 py-12 text-center`}>
                  <HelpCircle size={32} className={`mx-auto mb-3 ${tx3}`}/>
                  <p className={`text-[12px] ${tx3}`}>Aucune question trouvée</p>
                </div>
              : qFiltered.map(q=>(
                <div key={q.id} className={`${card} p-5`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">

                    {/* Gauche : médecin + question */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
                        style={{background:q.avatarColor}} onClick={()=>setModalePhoto(q)} title="Voir la photo CNI">
                        {q.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className={`text-[12px] font-bold cursor-pointer hover:underline underline-offset-2 ${tx1}`}
                            onClick={()=>setModalePhoto(q)}>{q.medecin}</p>
                          <span className={`text-[10px] font-mono ${tx3}`}>{q.cnom}</span>
                          <span className={`text-[10px] ${tx3}`}>· {q.ville}</span>
                          {/* Badge catégorie */}
                          <span style={{
                            display:"inline-block",padding:"1px 8px",borderRadius:99,
                            fontSize:10,fontWeight:700,
                            background:`${CAT_COLORS[q.categorie]||"#6b7280"}18`,
                            color:CAT_COLORS[q.categorie]||"#6b7280",
                            border:`0.5px solid ${CAT_COLORS[q.categorie]||"#6b7280"}40`
                          }}>{q.categorie}</span>
                        </div>
                        <p className={`text-[13px] font-medium ${tx1} mb-1`}>{q.question}</p>
                        <p className={`text-[10px] ${tx3}`}>{elapsed(q.date)}</p>

                        {/* Réponse si existante */}
                        {q.reponse && (
                          <div className={`mt-3 px-4 py-3 rounded-xl border-l-2 ${dark?"bg-[#0d1117] border-teal-700":"bg-teal-50 border-teal-500"}`}>
                            <p className={`text-[10px] font-bold mb-1 ${dark?"text-teal-400":"text-teal-700"}`}>
                              Réponse de l'administrateur · {elapsed(q.dateReponse)}
                            </p>
                            <p className={`text-[12px] leading-relaxed ${dark?"text-[#8b949e]":"text-gray-700"}`}>{q.reponse}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Droite : statut + action */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {/* Badge statut */}
                      {q.statut==="en_attente"
                        ? <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,background:"#fff7ed",color:"#c2410c",border:"0.5px solid #fed7aa"}}>
                            <Clock size={9}/> En attente
                          </span>
                        : <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,background:"#ecfdf5",color:"#065f46",border:"0.5px solid #6ee7b7"}}>
                            <CheckCircle size={9}/> Répondu
                          </span>
                      }
                      {/* Bouton répondre */}
                      {q.statut==="en_attente"
                        ? <button onClick={()=>{setModaleRep(q);setReponse("");}}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-colors"
                            style={{background:BRAND}}>
                            <Send size={11}/> Répondre
                          </button>
                        : <button onClick={()=>{setModaleRep(q);setReponse(q.reponse||"");}}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                            Modifier
                          </button>
                      }
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </>
      )}

      {/* ══ ONGLET HISTORIQUE ══ */}
      {onglet === "historique" && (
        <>
          {/* Bandeau info 90 jours */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[11px] ${dark?"bg-[#0d1117] border-[#21262d] text-[#484f58]":"bg-blue-50 border-blue-100 text-blue-700"}`}>
            <Clock size={13} className="shrink-0"/>
            <span>Les questions répondues sont archivées pendant <strong>90 jours</strong> puis supprimées automatiquement.</span>
          </div>

          <div className="flex flex-col gap-3">
            {qFiltered.filter(q=>q.statut==="repondu").length===0
              ? <div className={`rounded-2xl border px-5 py-12 text-center ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
                  <MessageSquare size={32} className={`mx-auto mb-3 ${tx3}`}/>
                  <p className={`text-[12px] ${tx3}`}>Aucune question dans l'historique</p>
                </div>
              : qFiltered.filter(q=>q.statut==="repondu").map(q=>(
                <div key={q.id} className={`rounded-2xl border p-5 ${dark?"bg-[#161b22] border-[#21262d] opacity-80":"bg-white border-gray-100 shadow-sm"}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
                      style={{background:q.avatarColor}} onClick={()=>setModalePhoto(q)}>
                      {q.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className={`text-[12px] font-bold cursor-pointer hover:underline ${tx1}`} onClick={()=>setModalePhoto(q)}>{q.medecin}</p>
                        <span className={`text-[10px] font-mono ${tx3}`}>{q.cnom}</span>
                        <span className={`text-[10px] ${tx3}`}>· {q.ville}</span>
                        <span style={{display:"inline-block",padding:"1px 8px",borderRadius:99,fontSize:10,fontWeight:700,
                          background:`${CAT_COLORS[q.categorie]||"#6b7280"}18`,color:CAT_COLORS[q.categorie]||"#6b7280"}}>
                          {q.categorie}
                        </span>
                        <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"1px 8px",borderRadius:99,fontSize:10,fontWeight:700,background:"#ecfdf5",color:"#065f46",border:"0.5px solid #6ee7b7"}}>
                          <CheckCircle size={9}/> Répondu
                        </span>
                      </div>
                      <p className={`text-[13px] font-medium mb-2 ${tx1}`}>{q.question}</p>
                      <p className={`text-[10px] mb-3 ${tx3}`}>{elapsed(q.date)}</p>
                      {/* Réponse */}
                      <div className={`px-4 py-3 rounded-xl border-l-2 ${dark?"bg-[#0d1117] border-teal-700":"bg-teal-50 border-teal-500"}`}>
                        <p className={`text-[10px] font-bold mb-1 ${dark?"text-teal-400":"text-teal-700"}`}>
                          Réponse · {elapsed(q.dateReponse)}
                        </p>
                        <p className={`text-[12px] leading-relaxed ${dark?"text-[#8b949e]":"text-gray-700"}`}>{q.reponse}</p>
                      </div>
                    </div>
                    {/* Action modifier */}
                    <button onClick={()=>{setModaleRep(q);setReponse(q.reponse||"");}}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      Modifier
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </>
      )}

      {/* ══ ONGLET FAQ PUBLIÉES ══ */}
      {onglet === "faq" && (
        <>
          <div className="flex items-center justify-between">
            <p className={`text-[12px] ${tx2}`}>{faqList.length} entrée{faqList.length>1?"s":""} · {faqList.filter(f=>f.publie).length} publiée{faqList.filter(f=>f.publie).length>1?"s":""}</p>
            <button onClick={()=>setModaleFAQ("new")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-colors"
              style={{background:BRAND}}>
              <Plus size={13}/> Nouvelle FAQ
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {faqList.map(f=>(
              <div key={f.id} className={`${card} p-5`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span style={{
                        display:"inline-block",padding:"1px 8px",borderRadius:99,
                        fontSize:10,fontWeight:700,
                        background:`${CAT_COLORS[f.categorie]||"#6b7280"}18`,
                        color:CAT_COLORS[f.categorie]||"#6b7280",
                      }}>{f.categorie}</span>
                      <span style={{
                        display:"inline-block",padding:"1px 8px",borderRadius:99,fontSize:10,fontWeight:700,
                        background:f.publie?"#ecfdf5":"#f3f4f6",
                        color:f.publie?"#065f46":"#9ca3af",
                        border:`0.5px solid ${f.publie?"#6ee7b7":"#e5e7eb"}`
                      }}>{f.publie?"● Publiée":"○ Brouillon"}</span>
                      <span className={`text-[10px] ${tx3}`}>{f.vues} vues</span>
                    </div>

                    {/* Question cliquable */}
                    <button
                      onClick={()=>setExpandFAQ(p=>({...p,[f.id]:!p[f.id]}))}
                      className={`flex items-center justify-between w-full text-left gap-3 ${tx1}`}>
                      <p className="text-[13px] font-semibold flex-1">{f.question}</p>
                      {expandFAQ[f.id]?<ChevronUp size={14} className={tx3}/>:<ChevronDown size={14} className={tx3}/>}
                    </button>

                    {/* Réponse dépliable */}
                    {expandFAQ[f.id] && (
                      <div className={`mt-3 px-4 py-3 rounded-xl ${dark?"bg-[#0d1117]":"bg-gray-50"}`}>
                        <p className={`text-[12px] leading-relaxed ${tx2}`}>{f.reponse}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={()=>setModaleFAQ(f)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      Modifier
                    </button>
                    <button onClick={()=>togglePublish(f.id)}
                      className="px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors"
                      style={f.publie
                        ?{borderColor:"#fca5a5",color:"#dc2626",background:"#fef2f2"}
                        :{borderColor:"#bbf7d0",color:BRAND,background:"#f0fdf4"}}>
                      {f.publie?"Dépublier":"Publier"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Modal Répondre ── */}
      {modaleRep && (
        <Modal dark={dark} onClose={()=>{setModaleRep(null);setReponse("");}}
          title={modaleRep.statut==="en_attente"?"Répondre à la question":"Modifier la réponse"}
          subtitle={`${modaleRep.medecin} · ${modaleRep.email}`}
          wide
          footer={<>
            <button onClick={()=>{setModaleRep(null);setReponse("");}}
              className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>
              Annuler
            </button>
            <button onClick={handleRepondre} disabled={!reponse.trim()}
              className="flex-1 py-2 rounded-xl text-[12px] font-bold text-white flex items-center justify-center gap-2 transition-colors"
              style={{background:reponse.trim()?BRAND:"#d1d5db",cursor:reponse.trim()?"pointer":"not-allowed"}}>
              <Send size={12}/> {modaleRep.statut==="en_attente"?"Envoyer la réponse":"Mettre à jour"}
            </button>
          </>}>
          <div className="flex flex-col gap-4">
            {/* Question */}
            <div className={`px-4 py-3 rounded-xl border ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                  style={{background:modaleRep.avatarColor}}>{modaleRep.initials}</div>
                <p className={`text-[11px] font-bold ${tx1}`}>{modaleRep.medecin}</p>
                <span style={{padding:"1px 7px",borderRadius:99,fontSize:9,fontWeight:700,
                  background:`${CAT_COLORS[modaleRep.categorie]||"#6b7280"}18`,
                  color:CAT_COLORS[modaleRep.categorie]||"#6b7280"}}>
                  {modaleRep.categorie}
                </span>
              </div>
              <p className={`text-[12px] font-medium ${tx1}`}>{modaleRep.question}</p>
              <p className={`text-[10px] mt-1 ${tx3}`}>{elapsed(modaleRep.date)}</p>
            </div>

            {/* Zone de réponse */}
            <div>
              <label className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>
                Votre réponse <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reponse}
                onChange={e=>setReponse(e.target.value)}
                rows={6}
                placeholder="Rédigez une réponse claire et complète…"
                className={`${inp} resize-none`}
              />
              <p className={`text-[10px] mt-1 ${tx3}`}>
                La réponse sera envoyée par e-mail à {modaleRep.email}
              </p>
            </div>

            {/* Option ajouter à la FAQ */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${dark?"bg-[#0d1117] border-[#21262d]":"bg-blue-50 border-blue-100"}`}>
              <HelpCircle size={14} className={dark?"text-[#484f58]":"text-blue-500"}/>
              <p className={`text-[11px] ${dark?"text-[#484f58]":"text-blue-700"}`}>
                Voulez-vous ajouter cette Q&R à la FAQ publique ?
              </p>
              <button onClick={()=>{
                  setFaqList(p=>[...p,{id:Date.now(),question:modaleRep.question,reponse,categorie:modaleRep.categorie,publie:false,vues:0}]);
                  showToast("Ajoutée à la FAQ (brouillon)");
                }}
                className="ml-auto px-3 py-1 rounded-lg text-[10px] font-bold text-white shrink-0"
                style={{background:BRAND}}>
                Ajouter
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal Nouvelle/Modifier FAQ ── */}
      {modaleFAQ && (
        <ModalFAQForm
          dark={dark} tx1={tx1} tx3={tx3} inp={inp}
          faq={modaleFAQ==="new"?null:modaleFAQ}
          onClose={()=>setModaleFAQ(null)}
          onSave={handleSaveFAQ}
        />
      )}

      {/* Modal Photo CNI */}
      {modalePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModalePhoto(null)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <div>
                <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>{modalePhoto.medecin}</p>
                <p className={`text-[10px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>Photo d'identité (CNI) · {modalePhoto.ville}</p>
              </div>
              <button onClick={()=>setModalePhoto(null)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}>
                <X size={13}/>
              </button>
            </div>
            <div className="px-5 py-8 flex flex-col items-center gap-4">
              {modalePhoto.photo_url
                ? <img src={modalePhoto.photo_url} alt={modalePhoto.medecin} className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow"/>
                : <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark?"border-[#21262d] bg-[#0d1117] text-[#484f58]":"border-gray-200 bg-gray-50 text-gray-300"}`}>
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span className="text-[10px] text-center px-4">Aucune photo disponible</span>
                  </div>
              }
              <div className="text-center">
                <p className={`text-[13px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{modalePhoto.medecin}</p>
                <p className={`text-[11px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{modalePhoto.cnom} · {modalePhoto.hopital}</p>
              </div>
            </div>
            <div className={`px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setModalePhoto(null)} className={`w-full py-2 rounded-xl text-[12px] font-medium border ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white ${toast.type==="success"?"bg-teal-600":"bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Formulaire FAQ ─────────────────────────────────────────────────────────────
function ModalFAQForm({ dark, tx1, tx3, inp, faq, onClose, onSave }) {
  const [question,  setQuestion]  = useState(faq?.question  || "");
  const [reponse,   setReponse]   = useState(faq?.reponse   || "");
  const [categorie, setCategorie] = useState(faq?.categorie || "Compte");
  const [publie,    setPublie]    = useState(faq?.publie     || false);
  const ok = question.trim() && reponse.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>
            {faq?"Modifier la FAQ":"Nouvelle entrée FAQ"}
          </p>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          <div>
            <label className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Question <span className="text-red-500">*</span></label>
            <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Quelle est la question ?" className={inp}/>
          </div>
          <div>
            <label className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Réponse <span className="text-red-500">*</span></label>
            <textarea value={reponse} onChange={e=>setReponse(e.target.value)} rows={5} placeholder="Réponse complète et claire…" className={`${inp} resize-none`}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Catégorie</label>
              <select value={categorie} onChange={e=>setCategorie(e.target.value)} className={inp}>
                {CATEGORIES.filter(c=>c!=="Toutes").map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Visibilité</label>
              <select value={publie?1:0} onChange={e=>setPublie(!!Number(e.target.value))} className={inp}>
                <option value={0}>Brouillon</option>
                <option value={1}>Publier maintenant</option>
              </select>
            </div>
          </div>
        </div>
        <div className={`shrink-0 flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
          <button onClick={()=>ok&&onSave({...faq,question,reponse,categorie,publie})} disabled={!ok}
            className="flex-1 py-2 rounded-xl text-[12px] font-bold text-white flex items-center justify-center gap-2"
            style={{background:ok?"#0f766e":"#d1d5db",cursor:ok?"pointer":"not-allowed"}}>
            {faq?"Mettre à jour":"Publier la FAQ"}
          </button>
        </div>
      </div>
    </div>
  );
}