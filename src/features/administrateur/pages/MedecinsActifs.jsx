import { useState, useCallback } from "react";
import useAdminTheme from "../hooks/useAdminTheme";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

const MOCK_MEDECINS = [
 { id:1, initiales:"JD", couleur:"bg-teal-600", nom:"Dr. Jean Dupont", specialite:"Pneumologue", cnom:"CM-2019-0847", eEtablissement:"H. General Douala", ville:"Douala", patients:134, consultations:4821, concordanceIA:88, creeLE:"12/06/2024", valideLE:"15/06/2024", statut:"Actif", derniereActivite:null, email:"j.dupont@hgd.cm", telephone:"+237 699 123 456", rangCommunaute:"#7/38", casPartages:"247 cas publies", activiteRecente:[{texte:"Consultation #247 enregistree",quand:"Auj. 14:22"},{texte:"Cas #241 partage sur la communaute",quand:"Hier"},{texte:"Acces accord Dr. Martin",quand:"Il y a 3j"},{texte:"3 consultations Pneumonie",quand:"15 mars"}] },
 { id:2, initiales:"DK", couleur:"bg-blue-600", nom:"Dr. Kamto", specialite:"Pneumologue", cnom:"CM-2017-0432", eEtablissement:"CHU Yaounde", ville:"Yaounde", patients:198, consultations:3201, concordanceIA:92, creeLE:"03/04/2024", valideLE:"05/04/2024", statut:"Actif", derniereActivite:null, email:"d.kamto@chu.cm", telephone:"+237 677 234 567", rangCommunaute:"#3/38", casPartages:"312 cas publies", activiteRecente:[{texte:"Consultation #198 enregistree",quand:"Auj. 09:10"},{texte:"Rapport mensuel soumis",quand:"Il y a 2j"}] },
 { id:3, initiales:"DN", couleur:"bg-purple-600", nom:"Dr. Nkoa", specialite:"Pneumologue", cnom:"CM-2018-0521", eEtablissement:"H. General Douala", ville:"Douala", patients:176, consultations:2847, concordanceIA:74, creeLE:"14/05/2024", valideLE:"16/05/2024", statut:"Inactif", derniereActivite:"2026-05-20T09:15:00", email:"nkoa@hgd.cm", telephone:"+237 699 345 678", rangCommunaute:"#5/38", casPartages:"189 cas publies", activiteRecente:[{texte:"Nouveau patient enregistre",quand:"Hier"},{texte:"Cas #235 publie",quand:"Il y a 5j"}] },
 { id:4, initiales:"DB", couleur:"bg-orange-500", nom:"Dr. Barry", specialite:"Pneumologue", cnom:"CM-2020-0612", eEtablissement:"H. Regional Garoua", ville:"Garoua", patients:89, consultations:1234, concordanceIA:61, creeLE:"22/07/2024", valideLE:"25/07/2024", statut:"Inactif", derniereActivite:"2026-05-24T17:42:00", email:"barry@hrg.cm", telephone:"+237 655 456 789", rangCommunaute:"#12/38", casPartages:"74 cas publies", activiteRecente:[{texte:"Consultation #89 enregistree",quand:"Il y a 2j"}] },
];

const RAISONS = ["- Choisir une raison -","Signalement d'un confrère","Comportement non conforme à la déontologie","Vérification d'identité requise","Incohérence dans les documents soumis","Inactivité prolongée","Autre"];

function formatDerniereActivite(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffJ = Math.floor(diffH / 24);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffJ === 1) return `Hier à ${date.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })}`;
  return `${date.toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit" })} à ${date.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })}`;
}

function StatutBadge({ statut, derniereActivite }) {
  if (statut === "Actif") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse flex-shrink-0"/>
        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">Actif</span>
      </div>
    );
  }
  const label = formatDerniereActivite(derniereActivite);
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0"/>
        <span className="text-xs font-semibold text-gray-400">Inactif</span>
      </div>
      {label && <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{label}</span>}
    </div>
  );
}

function CloseBtn({ onClick, darkMode }) {
 return (
  <button onClick={onClick} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${darkMode?"hover:bg-gray-800 text-gray-400":"hover:bg-gray-100 text-gray-500"}`}>
   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </button>
 );
}

function Overlay({ onClick }) { return <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClick}/>; }

// ==================== MODALE PHOTO CNI ====================
function ModalePhoto({ medecin: m, onClose, darkMode }) {
  const card  = darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200";
  const muted = darkMode ? "text-gray-400" : "text-gray-500";
  const sep   = darkMode ? "border-gray-800" : "border-gray-100";
  return (
    <>
      <Overlay onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`relative w-80 rounded-2xl border shadow-2xl overflow-hidden pointer-events-auto ${card}`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-4 border-b ${sep}`}>
            <div>
              <p className="text-sm font-semibold">{m.nom}</p>
              <p className={`text-xs mt-0.5 ${muted}`}>Photo d'identité (CNI)</p>
            </div>
            <CloseBtn onClick={onClose} darkMode={darkMode} />
          </div>
          {/* Photo */}
          <div className="flex flex-col items-center justify-center px-6 py-8 gap-4">
            {/* Remplacer par <img src={m.photoUrl} ... /> quand disponible */}
            <div className={`w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed
              ${darkMode ? "bg-gray-800 border-gray-600 text-gray-500" : "bg-gray-50 border-gray-300 text-gray-400"}`}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-xs text-center px-2">Photo soumise à l'adhésion</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">{m.nom}</p>
              <p className={`text-xs mt-0.5 ${muted}`}>{m.specialite} · CNOM {m.cnom}</p>
            </div>
          </div>
          {/* Footer */}
          <div className={`px-5 py-3 border-t ${sep}`}>
            <button
              onClick={onClose}
              className={`w-full py-2 rounded-xl text-sm font-medium border transition-colors
                ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ==================== MODALE PROFIL COMPLET ====================
function ModaleProfl({ medecin:m, onClose, onSuspendre, onSupprimer, darkMode }) {
 const card = darkMode?"bg-gray-800 border-gray-700":"bg-gray-50 border-gray-200";
 const lbl = darkMode?"text-gray-400":"text-gray-400";
 const val = darkMode?"text-gray-100":"text-gray-800";
 const row = darkMode?"border-gray-700":"border-gray-100";
 const infos=[
  {l:"N° CNOM",v:m.cnom,cls:"text-teal-500 font-mono"},
  {l:"E-mail",v:m.email,cls:val},
  {l:"Téléphone",v:m.telephone,cls:val},
  {l:"Établissement",v:m.eEtablissement,cls:val},
  {l:"Ville",v:m.ville,cls:val},
  {l:"Rang communauté",v:m.rangCommunaute,cls:val},
  {l:"Cas partagés",v:m.casPartages,cls:val},
  {l:"Statut compte",v:m.statut,badge:true},
 ];
 return (
  <>
   <Overlay onClick={onClose}/>
   <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
    <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl pointer-events-auto ${darkMode?"bg-gray-900 border border-gray-700":"bg-white border border-gray-200"}`}>
     <div className={`flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10 ${darkMode?"bg-gray-900 border-gray-800":"bg-white border-gray-100"}`}>
      <h2 className={`text-base font-bold ${darkMode?"text-gray-100":"text-gray-900"}`}>Profil {m.nom}</h2>
      <CloseBtn onClick={onClose} darkMode={darkMode}/>
     </div>
     <div className="px-6 py-5 space-y-5">
      <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${card}`}>
       <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${m.couleur}`}>{m.initiales}</div>
        <div>
         <p className={`font-bold text-base ${val}`}>{m.nom}</p>
         <p className={`text-sm ${lbl}`}>{m.specialite} {m.eEtablissement}</p>
         <div className="flex gap-2 mt-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.statut==="Actif"?"bg-teal-100 text-teal-700":"bg-gray-100 text-gray-500"}`}>{m.statut}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">CNOM vérifié</span>
         </div>
        </div>
       </div>
       <div className="text-right flex-shrink-0">
        <p className={`text-xs ${lbl}`}>Compte créé le</p>
        <p className={`text-sm font-semibold ${val}`}>{m.creeLE}</p>
        <p className={`text-xs mt-1 ${lbl}`}>Validé le</p>
        <p className="text-sm font-semibold text-teal-500">{m.valideLE}</p>
       </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
       {[
         {v:m.patients, l:"Patients actifs", c:val},
         {v:m.consultations.toLocaleString("fr-FR"), l:"Consultations totales", c:val},
         {v:`${m.concordanceIA ?? "—"}%`, l:"Concordance IA", c:"text-teal-500"},
       ].map((s,i)=>(
        <div key={i} className={`rounded-xl border p-4 text-center ${card}`}>
         <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
         <p className={`text-xs mt-1 ${lbl}`}>{s.l}</p>
        </div>
       ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <div>
        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${lbl}`}>Informations du compte</p>
        <div className={`rounded-xl border overflow-hidden ${darkMode?"border-gray-700":"border-gray-200"}`}>
         {infos.map((r,i)=>(
          <div key={i} className={`flex items-center justify-between px-3 py-2.5 border-b last:border-b-0 ${row}`}>
           <span className={`text-xs ${lbl}`}>{r.l}</span>
           {r.badge
            ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.statut==="Actif"?"bg-teal-100 text-teal-700":"bg-gray-100 text-gray-500"}`}>{r.v}</span>
            : <span className={`text-xs font-medium ${r.cls}`}>{r.v}</span>
           }
          </div>
         ))}
        </div>
       </div>
       <div>
        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${lbl}`}>Activité récente</p>
        <div className="space-y-2">
         {m.activiteRecente.map((a,i)=>(
          <div key={i} className={`flex items-start justify-between gap-3 px-3 py-2.5 rounded-xl border ${card}`}>
           <p className={`text-xs leading-relaxed ${val}`}>{a.texte}</p>
           <span className={`text-xs whitespace-nowrap ${lbl}`}>{a.quand}</span>
          </div>
         ))}
        </div>
       </div>
      </div>
     </div>
     <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t sticky bottom-0 ${darkMode?"bg-gray-900 border-gray-800":"bg-white border-gray-100"}`}>
      <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode?"text-gray-400 hover:text-gray-200":"text-gray-500 hover:text-gray-800"}`}>Fermer</button>
      <button onClick={()=>{onClose();onSuspendre(m);}} className="px-4 py-2 rounded-xl border border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 text-sm font-medium transition-colors">Suspendre</button>
      <button onClick={()=>{onClose();onSupprimer(m);}} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors flex items-center gap-1.5">
       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
       Supprimer le compte
      </button>
     </div>
    </div>
   </div>
  </>
 );
}

function MoaleSuspension({ medecin:m, onClose, onConfirm, darkMode }) {
 const [raison,setRaison]=useState(""); const [duree,setDureee]=useState("30 jours"); const [msg,setMsg]=useState("");
 const inp=darkMode?"bg-gray-800 border-gray-700 text-white focus:border-orange-400":"bg-white border-gray-200 text-gray-900 focus:border-orange-400";
 const lbl=darkMode?"text-gray-200":"text-gray-700";
 const ok=raison&&raison!=="- Choisir une raison -";
 return (
  <>
   <Overlay onClick={onClose}/>
   <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
    <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl pointer-events-auto ${darkMode?"bg-gray-900 border border-gray-700":"bg-white border border-gray-200"}`}>
     <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode?"border-gray-800":"border-gray-100"}`}>
      <h2 className={`text-base font-bold ${darkMode?"text-gray-100":"text-gray-900"}`}>Suspendre l'accès</h2>
      <CloseBtn onClick={onClose} darkMode={darkMode}/>
     </div>
     <div className="px-6 py-5 space-y-4">
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${darkMode?"bg-red-950/30 border-red-800/40 text-red-300":"bg-red-50 border-red-100 text-red-700"}`}>
       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
       <p className="text-sm leading-relaxed"><span className="font-bold">{m.nom}</span> ne pourra plus se connecter. La raison est enregistrée dans le journal d'audit.</p>
      </div>
      <div>
       <label className={`block text-sm font-semibold mb-1.5 ${lbl}`}>Raison de la suspension <span className="text-red-500">*</span></label>
       <select value={raison} onChange={e=>setRaison(e.target.value)} className={`w-full text-sm rounded-xl border px-3 py-2.5 outline-none transition-colors cursor-pointer ${inp}`}>
        {RAISONS.map(r=><option key={r} value={r}>{r}</option>)}
       </select>
      </div>
      <div>
       <label className={`block text-sm font-semibold mb-1.5 ${lbl}`}>Durée de suspension</label>
       <select value={duree} onChange={e=>setDureee(e.target.value)} className={`w-full text-sm rounded-xl border px-3 py-2.5 outline-none transition-colors cursor-pointer ${inp}`}>
        {["7 jours","15 jours","30 jours","60 jours","90 jours","Indéfinie"].map(d=><option key={d}>{d}</option>)}
       </select>
      </div>
      <div>
       <label className={`block text-sm font-semibold mb-1.5 ${lbl}`}>Message au médecin (optionnel)</label>
       <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Informations supplémentaires envoyées par e-mail..." rows={3} className={`w-full text-sm rounded-xl border px-3 py-2.5 outline-none transition-colors resize-none ${inp}`}/>
      </div>
     </div>
     <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${darkMode?"border-gray-800":"border-gray-100"}`}>
      <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode?"text-gray-400 hover:text-gray-200":"text-gray-500 hover:text-gray-800"}`}>Annuler</button>
      <button onClick={()=>ok&&onConfirm({raison,duree,msg})} disabled={!ok} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${ok?"bg-orange-500 hover:bg-orange-600 text-white":"bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"}`}>Confirmer la suspension</button>
     </div>
    </div>
   </div>
  </>
 );
}

function MoaleSuppression({ medecin:m, onClose, onConfirm, darkMode }) {
 return (
  <>
   <Overlay onClick={onClose}/>
   <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
    <div className={`relative w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto ${darkMode?"bg-gray-900 border border-gray-700":"bg-white border border-gray-200"}`}>
     <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode?"border-gray-800":"border-gray-100"}`}>
      <h2 className={`text-base font-bold ${darkMode?"text-gray-100":"text-gray-900"}`}>Supprimer le compte</h2>
      <CloseBtn onClick={onClose} darkMode={darkMode}/>
     </div>
     <div className="px-6 py-5 space-y-3">
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${darkMode?"bg-red-950/30 border-red-800/40 text-red-300":"bg-red-50 border-red-100 text-red-700"}`}>
       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
       <p className="text-sm leading-relaxed">Supprimer definitivement le compte de <span className="font-bold">{m.nom}</span> ? Toutes ses donnees seront effacees de la plateforme.</p>
      </div>
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${darkMode?"bg-red-950/20 text-red-400":"bg-red-50 text-red-500"}`}>
       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
       <p className="text-xs font-medium">Cette action est irreversible.</p>
      </div>
     </div>
     <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${darkMode?"border-gray-800":"border-gray-100"}`}>
      <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode?"text-gray-400 hover:text-gray-200":"text-gray-500 hover:text-gray-800"}`}>Annuler</button>
      <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">Supprimer definitivement</button>
     </div>
    </div>
   </div>
  </>
 );
}

export default function MedecinsActifs() {
 const { darkMode, setDarkMode } = useAdminTheme();
 const [activeKey, setActiveKey]   = useState("actifs");
 const [isMobileOpen, setMobileOpen] = useState(false);
 const [medecins, setMedecins]     = useState(MOCK_MEDECINS);
 const [filtreStatut, setFiltreStatut] = useState("Tous");
 const [modaleProfl, setModaleProfl]   = useState(null);
 const [modalePhoto, setModalePhoto]   = useState(null); // ← photo CNI
 const [modaleSusp, setModaleSusp]     = useState(null);
 const [modaleSuppr, setModaleSuppr]   = useState(null);
 const [toast, setToast]               = useState(null);

 const showToast = (message, type="success") => { setToast({message,type}); setTimeout(()=>setToast(null),3500); };

 const medecinsFiltres = medecins.filter(m => {
  if (filtreStatut === "Actif")   return m.statut === "Actif";
  if (filtreStatut === "Inactif") return m.statut === "Inactif";
  return true;
 });

 const nbActifs   = medecins.filter(m => m.statut === "Actif").length;
 const nbInactifs = medecins.filter(m => m.statut === "Inactif").length;

 const handleExportCSV = useCallback(() => {
  const h = ["Nom","CNOM","Etablissement","Ville","Patients","Consultations","Statut","Cree le","Valid le"];
  const r = medecins.map(m => [m.nom,m.cnom,m.eEtablissement,m.ville,m.patients,m.consultations,m.statut,m.creeLE,m.valideLE]);
  const csv = [h,...r].map(x=>x.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}));
  a.download = `medecins_actifs_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
 },[medecins]);

 const handleDownloadDossier = useCallback((medecin) => {
  const lignes = [
   ["Champ","Valeur"],["Nom",medecin.nom],["Specialite",medecin.specialite],
   ["CNOM",medecin.cnom],["Etablissement",medecin.eEtablissement],["Ville",medecin.ville],
   ["Patients",medecin.patients],["Consultations",medecin.consultations],["Statut",medecin.statut],
   ["Cree le",medecin.creeLE],["Valide le",medecin.valideLE],["Email",medecin.email],["Telephone",medecin.telephone],
  ];
  const csv = lignes.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}));
  const nomFichier = medecin.nom.toLowerCase().replace(/\s+/g,"_").replace(/[^\w]/g,"");
  a.download = `dossier_${nomFichier}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  showToast(`Dossier de ${medecin.nom} telecharge`,"success");
 },[]);

 const handleSuspension = useCallback(({raison,duree}) => {
  setMedecins(p=>p.filter(m=>m.id!==modaleSusp.id));
  showToast(`${modaleSusp.nom} suspendu ${duree}`,"warning");
  setModaleSusp(null);
 },[modaleSusp]);

 const handleSuppression = useCallback(() => {
  setMedecins(p=>p.filter(m=>m.id!==modaleSuppr.id));
  showToast(`Compte de ${modaleSuppr.nom} supprimé définitivement`,"error");
  setModaleSuppr(null);
 },[modaleSuppr]);

 const page  = darkMode?"bg-gray-950 text-white":"bg-gray-50 text-gray-900";
 const card  = darkMode?"bg-gray-900 border-gray-800":"bg-white border-gray-200";
 const th    = darkMode?"bg-gray-800/80 text-gray-400":"bg-gray-50 text-gray-500";
 const muted = darkMode?"text-gray-400":"text-gray-500";
 const td    = darkMode?"text-gray-200":"text-gray-800";
 const rh    = darkMode?"hover:bg-gray-800/60":"hover:bg-gray-50";
 const div   = darkMode?"divide-gray-800":"divide-gray-100";
 const iBtn  = darkMode?"text-gray-500 hover:text-gray-200 hover:bg-gray-700":"text-gray-400 hover:text-gray-700 hover:bg-gray-100";

 const filtresBtns = [
  { key:"Tous",    label:`Tous (${medecins.length})` },
  { key:"Actif",   label:`Actifs (${nbActifs})` },
  { key:"Inactif", label:`Inactifs (${nbInactifs})` },
 ];

 return (
  <div className={`h-screen flex admin-theme ${darkMode?"bg-gray-950 text-white":"bg-gray-50 text-gray-900"}`}>
   <Sidebar activeKey={activeKey} setActiveKey={setActiveKey} darkMode={darkMode} isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen}/>
   <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
    <Topbar darkMode={darkMode} setDarkMode={setDarkMode} setMobileOpen={setMobileOpen}/>
    <main className={`overflow-y-auto flex-1 p-4 md:p-6 ${page}`}>

     {/* En-tête */}
     <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
       <h1 className="text-2xl font-bold tracking-tight">Médecins actifs</h1>
       <p className={`text-sm mt-0.5 ${muted}`}>{medecins.length} médecins sur la plateforme PneumoIA CEMAC</p>
      </div>
      <button onClick={handleExportCSV} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all shrink-0 ${darkMode?"border-gray-700 text-gray-300 hover:bg-teal-600 hover:border-teal-600 hover:text-white":"border-gray-300 text-gray-700 hover:bg-teal-600 hover:border-teal-600 hover:text-white"}`}>
       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
       Export CSV
      </button>
     </div>

     {/* Filtres statut */}
     <div className="flex gap-2 mb-4 flex-wrap">
      {filtresBtns.map(f => (
       <button key={f.key} onClick={() => setFiltreStatut(f.key)}
        className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-colors
         ${filtreStatut === f.key
          ? f.key === "Actif" ? "bg-teal-600 border-teal-600 text-white"
          : f.key === "Inactif" ? "bg-gray-500 border-gray-500 text-white"
          : darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-800 border-gray-800 text-white"
          : darkMode ? "border-gray-700 text-gray-400 hover:text-gray-200" : "border-gray-200 text-gray-500 hover:text-gray-800"
         }`}
       >{f.label}</button>
      ))}
     </div>

     {/* Tableau */}
     <div className={`rounded-2xl border overflow-hidden ${card}`}>
      <div className="overflow-x-auto">
       <table className="w-full text-sm">
        <thead>
         <tr className={`text-xs uppercase tracking-wider border-b ${th} ${darkMode?"border-gray-700":"border-gray-200"}`}>
          {["Médecin","CNOM","Établissement","Ville","Patients","Consultations","Créé le","Validé le","Statut","Actions"].map(h=>(
           <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
          ))}
         </tr>
        </thead>
        <tbody className={`divide-y ${div}`}>
         {medecinsFiltres.length===0 ? (
          <tr><td colSpan={10} className={`text-center py-16 ${muted}`}>
           <div className="flex flex-col items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            <span className="text-sm">Aucun médecin dans cette catégorie</span>
           </div>
          </td></tr>
         ) : medecinsFiltres.map(m=>(
          <tr key={m.id} className={`transition-colors duration-100 ${rh}`}>

           {/* Colonne Médecin — avatar cliquable → photo CNI, nom cliquable → photo CNI */}
           <td className="px-4 py-3.5">
            <div className="flex items-center gap-3">
             {/* Avatar → photo CNI */}
             <div
              onClick={() => setModalePhoto(m)}
              title="Voir la photo d'identité"
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 cursor-pointer hover:opacity-75 transition-opacity ${m.couleur}`}
             >
              {m.initiales}
             </div>
             <div>
              {/* Nom → photo CNI */}
              <p
               onClick={() => setModalePhoto(m)}
               title="Voir la photo d'identité"
               className={`font-semibold text-sm cursor-pointer hover:underline underline-offset-2 ${td}`}
              >
               {m.nom}
              </p>
              <p className={`text-xs ${muted}`}>{m.specialite}</p>
             </div>
            </div>
           </td>

           <td className={`px-4 py-3.5 font-mono text-xs ${muted}`}>{m.cnom}</td>
           <td className={`px-4 py-3.5 text-xs ${muted}`}>{m.eEtablissement}</td>
           <td className={`px-4 py-3.5 text-xs ${muted}`}>{m.ville}</td>
           <td className={`px-4 py-3.5 font-bold text-sm ${td}`}>{m.patients}</td>
           <td className={`px-4 py-3.5 font-bold text-sm ${td}`}>{m.consultations.toLocaleString("fr-FR")}</td>
           <td className={`px-4 py-3.5 text-xs ${muted}`}>{m.creeLE}</td>
           <td className="px-4 py-3.5 text-xs text-teal-500 font-semibold whitespace-nowrap">{m.valideLE}</td>
           <td className="px-4 py-3.5">
            <StatutBadge statut={m.statut} derniereActivite={m.derniereActivite}/>
           </td>
           <td className="px-4 py-3.5">
            <div className="flex items-center gap-1">
             {/* 👁 Profil complet */}
             <button onClick={()=>setModaleProfl(m)} title="Voir le profil complet" className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${iBtn}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
             </button>
             {/* ↓ Télécharger dossier */}
             <button onClick={()=>handleDownloadDossier(m)} title="Télécharger le dossier" className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${iBtn}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
             </button>
             {/* 🗑 Supprimer */}
             <button onClick={()=>setModaleSuppr(m)} title="Supprimer le compte" className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
             </button>
            </div>
           </td>
          </tr>
         ))}
        </tbody>
       </table>
      </div>
     </div>

     {medecinsFiltres.length>0 && <p className={`text-xs mt-3 text-right ${muted}`}>Dernière mise à jour : {new Date().toLocaleString("fr-FR")}</p>}

     {/* Modale photo CNI */}
     {modalePhoto && <ModalePhoto medecin={modalePhoto} onClose={()=>setModalePhoto(null)} darkMode={darkMode}/>}

     {/* Modales existantes — inchangées */}
     {modaleProfl && <ModaleProfl medecin={modaleProfl} onClose={()=>setModaleProfl(null)} onSuspendre={m=>setModaleSusp(m)} onSupprimer={m=>setModaleSuppr(m)} darkMode={darkMode}/>}
     {modaleSusp  && <MoaleSuspension medecin={modaleSusp} onClose={()=>setModaleSusp(null)} onConfirm={handleSuspension} darkMode={darkMode}/>}
     {modaleSuppr && <MoaleSuppression medecin={modaleSuppr} onClose={()=>setModaleSuppr(null)} onConfirm={handleSuppression} darkMode={darkMode}/>}

     {toast && (
      <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type==="success"?"bg-teal-600":toast.type==="warning"?"bg-orange-500":"bg-red-600"}`}>
       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {toast.type==="success"?<polyline points="20 6 9 17 4 12"/>:<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}
       </svg>
       {toast.message}
      </div>
     )}
    </main>
   </div>
  </div>
 );
}
