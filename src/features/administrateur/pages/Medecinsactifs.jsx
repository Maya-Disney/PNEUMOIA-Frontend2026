import { useState, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import * as XLSX from "xlsx";
import { Download, Eye, Trash2, X, AlertTriangle } from "lucide-react";

const BRAND = "#0f766e";
const NOW   = new Date();
const sub   = (ms) => new Date(NOW.getTime() - ms);
const pad   = (n)  => String(n).padStart(2, "0");
function fmt(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }
function elapsed(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const dm = Math.floor((NOW-d)/60000), dh = Math.floor(dm/60), dd = Math.floor(dh/24);
  if (dm < 1)  return "À l'instant";
  if (dm < 60) return `Il y a ${dm} min`;
  if (dh < 24) return `Il y a ${dh}h`;
  if (dd === 1) return `Hier à ${d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}`;
  return `${d.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"})} à ${d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}`;
}

const MOCK = [
  { id:1, initials:"JD", bg:"bg-teal-100 text-teal-700", avatarColor:"#0f766e",
    nom:"Dr. Jean Dupont", specialite:"Pneumologue", cnom:"CM-2019-0847",
    hopital:"H. Général Douala", ville:"Douala",
    patients:134, consultations:4821, concordanceIA:88,
    creeLE:fmt(sub(180*24*3600000)), valideLE:fmt(sub(177*24*3600000)),
    statut:"Actif", derniereActivite:null,
    email:"j.dupont@hgd.cm", telephone:"+237 699 123 456",
    rangCommunaute:"#7/38", casPartages:"247 cas publiés",
    activiteRecente:[
      {texte:"Consultation #247 enregistrée",         quand:"Auj. 14:22"},
      {texte:"Cas #241 partagé sur la communauté",    quand:"Hier"},
      {texte:"Accès accordé Dr. Martin",              quand:"Il y a 3j"},
      {texte:"3 consultations Pneumonie",             quand:"15 mars"},
    ]},
  { id:2, initials:"DK", bg:"bg-blue-100 text-blue-700", avatarColor:"#185FA5",
    nom:"Dr. Kamto Diane", specialite:"Pneumologue", cnom:"CM-2017-0432",
    hopital:"CHU Yaoundé", ville:"Yaoundé",
    patients:198, consultations:3201, concordanceIA:92,
    creeLE:fmt(sub(90*24*3600000)), valideLE:fmt(sub(88*24*3600000)),
    statut:"Actif", derniereActivite:null,
    email:"d.kamto@chu.cm", telephone:"+237 677 234 567",
    rangCommunaute:"#3/38", casPartages:"312 cas publiés",
    activiteRecente:[
      {texte:"Consultation #198 enregistrée", quand:"Auj. 09:10"},
      {texte:"Rapport mensuel soumis",        quand:"Il y a 2j"},
    ]},
  { id:3, initials:"DN", bg:"bg-purple-100 text-purple-700", avatarColor:"#7C3AED",
    nom:"Dr. Nkoa", specialite:"Pneumologue", cnom:"CM-2018-0521",
    hopital:"H. Général Douala", ville:"Douala",
    patients:176, consultations:2847, concordanceIA:74,
    creeLE:fmt(sub(120*24*3600000)), valideLE:fmt(sub(118*24*3600000)),
    statut:"Inactif", derniereActivite:sub(11*24*3600000).toISOString(),
    email:"nkoa@hgd.cm", telephone:"+237 699 345 678",
    rangCommunaute:"#5/38", casPartages:"189 cas publiés",
    activiteRecente:[
      {texte:"Nouveau patient enregistré", quand:"Hier"},
      {texte:"Cas #235 publié",            quand:"Il y a 5j"},
    ]},
  { id:4, initials:"DB", bg:"bg-orange-100 text-orange-700", avatarColor:"#D97706",
    nom:"Dr. Barry", specialite:"Pneumologue", cnom:"CM-2020-0612",
    hopital:"H. Régional Garoua", ville:"Garoua",
    patients:89, consultations:1234, concordanceIA:61,
    creeLE:fmt(sub(200*24*3600000)), valideLE:fmt(sub(197*24*3600000)),
    statut:"Inactif", derniereActivite:sub(7*24*3600000).toISOString(),
    email:"barry@hrg.cm", telephone:"+237 655 456 789",
    rangCommunaute:"#12/38", casPartages:"74 cas publiés",
    activiteRecente:[
      {texte:"Consultation #89 enregistrée", quand:"Il y a 7j"},
    ]},
];

const RAISONS = ["— Choisir une raison —","Signalement d'un confrère","Comportement non conforme à la déontologie","Vérification d'identité requise","Incohérence dans les documents soumis","Inactivité prolongée","Autre"];

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ onClose, title, sub: subtitle, wide, children, footer, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}>
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

// ── Modal Photo CNI ───────────────────────────────────────────────────────────
function ModalePhoto({ m, onClose, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={m.nom} sub="Photo d'identité (CNI)"
      footer={<button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Fermer</button>}>
      <div className="flex flex-col items-center gap-4 py-4">
        <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark?"border-[#21262d] bg-[#0d1117] text-[#484f58]":"border-gray-200 bg-gray-50 text-gray-300"}`}>
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span className="text-[9px] text-center px-2">Photo soumise à l'adhésion</span>
        </div>
        <p className={`text-[12px] font-bold ${dark?"text-white":"text-gray-800"}`}>{m.nom}</p>
        <p className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.specialite} · CNOM {m.cnom}</p>
      </div>
    </Modal>
  );
}

// ── Modal Profil complet ──────────────────────────────────────────────────────
function ModaleProfil({ m, onClose, onSuspendre, onSupprimer, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={`Profil — ${m.nom}`} wide
      footer={<>
        <button onClick={onClose} className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors ${dark?"text-[#8b949e] hover:bg-[#21262d]":"text-gray-500 hover:bg-gray-50"}`}>Fermer</button>
        <button onClick={() => { onClose(); onSuspendre(m); }} className="px-4 py-2 rounded-xl border border-orange-300 dark:border-orange-700/50 text-orange-600 dark:text-orange-400 text-[12px] font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">Suspendre</button>
        <button onClick={() => { onClose(); onSupprimer(m); }} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold flex items-center justify-center gap-1 transition-colors"><Trash2 size={12}/>Supprimer</button>
      </>}>
      <div className="flex flex-col gap-4">
        {/* Identité */}
        <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-black shrink-0" style={{background:m.avatarColor}}>{m.initials}</div>
            <div>
              <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>{m.nom}</p>
              <p className={`text-[11px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.specialite} · {m.hopital}</p>
              <div className="flex gap-1.5 mt-1">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.statut==="Actif"?"bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400":"bg-gray-100 dark:bg-[#21262d] text-gray-500"}`}>{m.statut}</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">CNOM vérifié</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-[9px] ${dark?"text-[#484f58]":"text-gray-400"}`}>Créé le</p>
            <p className={`text-[11px] font-semibold ${dark?"text-white":"text-gray-700"}`}>{m.creeLE}</p>
            <p className={`text-[9px] mt-1 ${dark?"text-[#484f58]":"text-gray-400"}`}>Validé le</p>
            <p className="text-[11px] font-semibold" style={{color:BRAND}}>{m.valideLE}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[{v:m.patients,l:"Patients actifs"},{v:m.consultations.toLocaleString("fr-FR"),l:"Consultations"},{v:`${m.concordanceIA}%`,l:"Concordance IA",teal:true}].map(({v,l,teal})=>(
            <div key={l} className={`rounded-xl border p-3 text-center ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
              <p className={`text-xl font-black ${teal?"text-[#0f766e] dark:text-teal-400":dark?"text-white":"text-gray-900"}`}>{v}</p>
              <p className={`text-[10px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{l}</p>
            </div>
          ))}
        </div>

        {/* Infos + Activité */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${dark?"text-[#484f58]":"text-gray-300"}`}>Informations du compte</p>
            <div className={`rounded-xl border overflow-hidden ${dark?"border-[#21262d]":"border-gray-100"}`}>
              {[{l:"N° CNOM",v:m.cnom,mono:true},{l:"E-mail",v:m.email},{l:"Téléphone",v:m.telephone},{l:"Établissement",v:m.hopital},{l:"Ville",v:m.ville},{l:"Rang communauté",v:m.rangCommunaute},{l:"Cas partagés",v:m.casPartages}].map(({l,v,mono})=>(
                <div key={l} className={`flex items-center justify-between px-3 py-2.5 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-50"}`}>
                  <span className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{l}</span>
                  <span className={`text-[10px] font-medium truncate max-w-[120px] ${mono?"font-mono text-[#0f766e] dark:text-teal-400":dark?"text-[#8b949e]":"text-gray-600"}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${dark?"text-[#484f58]":"text-gray-300"}`}>Activité récente</p>
            <div className="flex flex-col gap-2">
              {m.activiteRecente.map((a,i)=>(
                <div key={i} className={`flex items-start justify-between gap-2 px-3 py-2.5 rounded-xl border ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
                  <p className={`text-[10px] leading-relaxed ${dark?"text-[#8b949e]":"text-gray-600"}`}>{a.texte}</p>
                  <span className={`text-[9px] shrink-0 ${dark?"text-[#484f58]":"text-gray-300"}`}>{a.quand}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Modal Suspension ──────────────────────────────────────────────────────────
function ModaleSuspension({ m, onClose, onConfirm, dark }) {
  const [raison, setRaison] = useState("");
  const [duree,  setDuree]  = useState("30 jours");
  const [msg,    setMsg]    = useState("");
  const ok  = raison && raison !== "— Choisir une raison —";
  const inp = `w-full text-[12px] px-3 py-2 rounded-xl border outline-none transition-colors ${dark?"bg-[#0d1117] border-[#21262d] text-white":"bg-gray-50 border-gray-200 text-gray-800"}`;
  return (
    <Modal dark={dark} onClose={onClose} title="Suspendre l'accès" sub={m.nom}
      footer={<>
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Annuler</button>
        <button onClick={() => ok && onConfirm({raison,duree,msg})} disabled={!ok}
          className={`flex-1 py-2 rounded-xl text-[12px] font-bold text-white transition-colors ${ok?"bg-orange-500 hover:bg-orange-600":"bg-gray-200 dark:bg-[#21262d] text-gray-400 cursor-not-allowed"}`}>
          Confirmer
        </button>
      </>}>
      <div className="flex flex-col gap-3">
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[11px] ${dark?"bg-orange-900/20 border-orange-700/40 text-orange-300":"bg-orange-50 border-orange-200 text-orange-700"}`}>
          <AlertTriangle size={13} className="shrink-0 mt-0.5"/>
          <span><strong>{m.nom}</strong> ne pourra plus se connecter. La raison est enregistrée dans le journal d'audit.</span>
        </div>
        <div><label className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Raison <span className="text-red-500">*</span></label>
          <select value={raison} onChange={e=>setRaison(e.target.value)} className={inp}>{RAISONS.map(r=><option key={r}>{r}</option>)}</select></div>
        <div><label className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Durée de suspension</label>
          <select value={duree} onChange={e=>setDuree(e.target.value)} className={inp}>{["7 jours","15 jours","30 jours","60 jours","90 jours","Indéfinie"].map(d=><option key={d}>{d}</option>)}</select></div>
        <div><label className={`block text-[11px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>Message au médecin (optionnel)</label>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Informations supplémentaires envoyées par e-mail…" rows={3} className={`${inp} resize-none`}/></div>
      </div>
    </Modal>
  );
}

// ── Modal Suppression ─────────────────────────────────────────────────────────
function ModaleSuppression({ m, onClose, onConfirm, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title="Supprimer le compte" sub={m.nom}
      footer={<>
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Annuler</button>
        <button onClick={onConfirm} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold transition-colors">Supprimer définitivement</button>
      </>}>
      <div className="flex flex-col gap-3">
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[11px] ${dark?"bg-red-900/20 border-red-700/40 text-red-300":"bg-red-50 border-red-200 text-red-700"}`}>
          <AlertTriangle size={13} className="shrink-0 mt-0.5"/>
          Supprimer définitivement le compte de <strong className="mx-1">{m.nom}</strong> ? Toutes ses données seront effacées.
        </div>
        <div className={`rounded-xl border px-4 py-3 text-[11px] ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
          {[{l:"Médecin",v:m.nom},{l:"CNOM",v:m.cnom},{l:"Établissement",v:m.hopital},{l:"Statut",v:m.statut}].map(({l,v})=>(
            <div key={l} className={`flex items-center justify-between py-1.5 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <span className={dark?"text-[#484f58]":"text-gray-400"}>{l}</span>
              <span className={`font-semibold ${dark?"text-[#8b949e]":"text-gray-700"}`}>{v}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-red-500 font-semibold">Cette action est irréversible.</p>
      </div>
    </Modal>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function MedecinsActifs() {
  const { dark } = useOutletContext() || {};
  const [medecins,    setMedecins]    = useState(MOCK);
  const [filtre,      setFiltre]      = useState("Tous");
  const [modalePhoto, setModalePhoto] = useState(null);
  const [modaleProfil,setModaleProfil]= useState(null);
  const [modaleSusp,  setModaleSusp]  = useState(null);
  const [modaleSuppr, setModaleSuppr] = useState(null);
  const [toast,       setToast]       = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const nbActifs   = medecins.filter(m => m.statut === "Actif").length;
  const nbInactifs = medecins.filter(m => m.statut === "Inactif").length;
  const liste      = medecins.filter(m => filtre==="Actif"?m.statut==="Actif":filtre==="Inactif"?m.statut==="Inactif":true);

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(medecins.map((m,i) => ({"#":i+1,Nom:m.nom,CNOM:m.cnom,Spécialité:m.specialite,Établissement:m.hopital,Ville:m.ville,Patients:m.patients,Consultations:m.consultations,"Concordance IA":`${m.concordanceIA}%`,Statut:m.statut,"Créé le":m.creeLE,"Validé le":m.valideLE})));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Médecins");
    XLSX.writeFile(wb,`medecins_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  function dlDossier(m) {
    const ws = XLSX.utils.json_to_sheet([{Nom:m.nom,CNOM:m.cnom,Spécialité:m.specialite,Établissement:m.hopital,Ville:m.ville,Email:m.email,Téléphone:m.telephone,Patients:m.patients,Consultations:m.consultations,"Concordance IA":`${m.concordanceIA}%`,Statut:m.statut,"Créé le":m.creeLE,"Validé le":m.valideLE}]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Dossier");
    XLSX.writeFile(wb,`dossier_${m.nom.toLowerCase().replace(/\s+/g,"_").replace(/[^\w]/g,"")}_${new Date().toISOString().slice(0,10)}.xlsx`);
    setToast({msg:`Dossier de ${m.nom} téléchargé`,type:"success"});
  }

  function handleSuspension({raison,duree}) {
    setMedecins(p=>p.filter(x=>x.id!==modaleSusp.id));
    setToast({msg:`${modaleSusp.nom} suspendu — ${duree}`,type:"warn"});
    setModaleSusp(null);
  }

  function handleSuppression() {
    setMedecins(p=>p.filter(x=>x.id!==modaleSuppr.id));
    setToast({msg:`Compte de ${modaleSuppr.nom} supprimé`,type:"error"});
    setModaleSuppr(null);
  }

  const th = `px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-b ${dark?"text-[#484f58] border-[#21262d] bg-[#0d1117]/50":"text-gray-400 border-gray-100 bg-gray-50"}`;
  const td = `px-4 py-3 border-b ${dark?"border-[#21262d]":"border-gray-50"}`;
  const ib = `w-7 h-7 flex items-center justify-center rounded-lg transition-colors border ${dark?"border-[#21262d] text-[#484f58] hover:text-white hover:bg-[#21262d]":"border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>Médecins actifs</h1>
          <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>{medecins.length} médecin{medecins.length>1?"s":""} sur la plateforme PneumoIA CEMAC</p>
        </div>
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e]"
          onMouseEnter={e=>{e.currentTarget.style.background=BRAND;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=BRAND;}}
          onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color="";e.currentTarget.style.borderColor="";}}>
          <Download size={13}/>Export Excel
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[{k:"Tous",l:`Tous (${medecins.length})`},{k:"Actif",l:`Actifs (${nbActifs})`},{k:"Inactif",l:`Inactifs (${nbInactifs})`}].map(f=>(
          <button key={f.k} onClick={()=>setFiltre(f.k)}
            className="px-4 py-1.5 rounded-xl text-[11px] font-bold border transition-colors"
            style={filtre===f.k?{background:BRAND,borderColor:BRAND,color:"#fff"}:{borderColor:dark?"#21262d":"#e5e7eb",color:dark?"#484f58":"#9ca3af"}}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className={`rounded-2xl border overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{minWidth:780}}>
            <thead><tr>
              {["Médecin","CNOM","Établissement","Ville","Patients","Consultations","Créé le","Validé le","Statut","Actions"].map(h=><th key={h} className={th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {liste.length===0
                ? <tr><td colSpan={10} className={`${td} text-center py-14 text-[12px] text-gray-300 dark:text-[#484f58]`}>Aucun médecin dans cette catégorie</td></tr>
                : liste.map(m=>(
                  <tr key={m.id} className={`transition-colors ${dark?"hover:bg-[#0d1117]/60":"hover:bg-gray-50/80"}`}>
                    <td className={td}>
                      <div className="flex items-center gap-2.5 cursor-pointer group" onClick={()=>setModalePhoto(m)}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 group-hover:opacity-75 transition-opacity ${m.bg}`}>{m.initials}</div>
                        <div>
                          <p className={`text-[12px] font-bold group-hover:underline underline-offset-2 ${dark?"text-white":"text-gray-800"}`}>{m.nom}</p>
                          <p className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.specialite}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${td} text-[11px] font-mono ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.cnom}</td>
                    <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`}>{m.hopital}</td>
                    <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`}>{m.ville}</td>
                    <td className={`${td} text-[12px] font-bold ${dark?"text-white":"text-gray-900"}`}>{m.patients}</td>
                    <td className={`${td} text-[12px] font-bold ${dark?"text-white":"text-gray-900"}`}>{m.consultations.toLocaleString("fr-FR")}</td>
                    <td className={`${td} text-[11px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.creeLE}</td>
                    <td className={`${td} text-[11px] font-semibold`} style={{color:BRAND}}>{m.valideLE}</td>
                    <td className={td}>
                      {m.statut==="Actif"
                        ? <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/><span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Actif</span></div>
                        : <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400"/><span className={`text-[11px] font-bold ${dark?"text-[#484f58]":"text-gray-400"}`}>Inactif</span></div>
                            {elapsed(m.derniereActivite)&&<span className={`text-[9px] ${dark?"text-[#484f58]":"text-gray-300"}`}>{elapsed(m.derniereActivite)}</span>}
                          </div>
                      }
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-1">
                        <button onClick={()=>setModaleProfil(m)} title="Voir le profil" className={ib}><Eye size={12}/></button>
                        <button onClick={()=>dlDossier(m)} title="Télécharger dossier" className={ib}><Download size={12}/></button>
                        <button onClick={()=>setModaleSuppr(m)} title="Supprimer" className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-gray-400 dark:text-[#484f58] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={12}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <div className={`px-4 py-3 border-t text-[11px] text-right ${dark?"border-[#21262d] text-[#484f58]":"border-gray-50 text-gray-300"}`}>
          Dernière mise à jour : {new Date().toLocaleString("fr-FR")}
        </div>
      </div>

      {modalePhoto  && <ModalePhoto      m={modalePhoto}  dark={dark} onClose={()=>setModalePhoto(null)}/>}
      {modaleProfil && <ModaleProfil     m={modaleProfil} dark={dark} onClose={()=>setModaleProfil(null)} onSuspendre={m=>setModaleSusp(m)} onSupprimer={m=>setModaleSuppr(m)}/>}
      {modaleSusp   && <ModaleSuspension m={modaleSusp}   dark={dark} onClose={()=>setModaleSusp(null)}   onConfirm={handleSuspension}/>}
      {modaleSuppr  && <ModaleSuppression m={modaleSuppr} dark={dark} onClose={()=>setModaleSuppr(null)}  onConfirm={handleSuppression}/>}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white ${toast.type==="success"?"bg-emerald-600":toast.type==="warn"?"bg-orange-500":"bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}