import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { Download, Eye, Trash2, X, AlertTriangle } from "lucide-react";
import { getMedecinsActifs } from "../api/adminApi";

const BRAND = "#0f766e";
const NOW   = new Date();
const sub   = (ms) => new Date(NOW.getTime() - ms);
const pad   = (n)  => String(n).padStart(2, "0");
function fmt(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }

function avatarColor(str) {
  const colors = ["#0f766e","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

const MOCK = [
  { id:1, initials:"JD", avatarColor:"#0f766e",
    nom:"Dr. Jean Dupont",  specialite:"Pneumologue", cnom:"CM-2019-0847",
    hopital:"H. Général Douala", ville:"Douala",
    email:"j.dupont@hgd.cm", telephone:"+237 699 123 456",
    patients:134, consultations:4821, concordanceIA:88,
    rangCommunaute:"#7/38", casPartages:"247 cas publiés",
    derniereActivite: sub(2*3600000).toISOString(),
    activiteRecente:[{texte:"Consultation #247 enregistrée",quand:"Auj. 14:22"},{texte:"Cas #241 partagé",quand:"Hier"}],
    statut:"Actif", creeLE:fmt(sub(180*24*3600000)), valideLE:fmt(sub(177*24*3600000)) },
  { id:2, initials:"DK", avatarColor:"#185FA5",
    nom:"Dr. Kamto Diane", specialite:"Pneumologue", cnom:"CM-2017-0432",
    hopital:"CHU Yaoundé", ville:"Yaoundé",
    email:"d.kamto@chu.cm", telephone:"+237 677 234 567",
    patients:198, consultations:3201, concordanceIA:92,
    rangCommunaute:"#3/38", casPartages:"312 cas publiés",
    derniereActivite: sub(30*60000).toISOString(),
    activiteRecente:[{texte:"Consultation #198 enregistrée",quand:"Auj. 09:10"}],
    statut:"Actif", creeLE:fmt(sub(90*24*3600000)), valideLE:fmt(sub(88*24*3600000)) },
  { id:3, initials:"DN", avatarColor:"#7C3AED",
    nom:"Dr. Nkoa",        specialite:"Pneumologue", cnom:"CM-2018-0521",
    hopital:"H. Général Douala", ville:"Douala",
    email:"nkoa@hgd.cm", telephone:"+237 699 345 678",
    patients:176, consultations:2847, concordanceIA:74,
    rangCommunaute:"#5/38", casPartages:"189 cas publiés",
    derniereActivite: sub(11*24*3600000).toISOString(),
    activiteRecente:[{texte:"Nouveau patient enregistré",quand:"Hier"}],
    statut:"Inactif", creeLE:fmt(sub(120*24*3600000)), valideLE:fmt(sub(118*24*3600000)) },
  { id:4, initials:"DB", avatarColor:"#D97706",
    nom:"Dr. Barry",       specialite:"Pneumologue", cnom:"CM-2020-0612",
    hopital:"H. Régional Garoua", ville:"Garoua",
    email:"barry@hrg.cm", telephone:"+237 655 456 789",
    patients:89, consultations:1234, concordanceIA:61,
    rangCommunaute:"#12/38", casPartages:"74 cas publiés",
    derniereActivite: sub(7*24*3600000).toISOString(),
    activiteRecente:[{texte:"Consultation #89 enregistrée",quand:"Il y a 7j"}],
    statut:"Inactif", creeLE:fmt(sub(200*24*3600000)), valideLE:fmt(sub(197*24*3600000)) },
];

const RAISONS = ["— Choisir une raison —","Signalement d'un confrère","Comportement non conforme","Vérification d'identité requise","Incohérence dans les documents","Inactivité prolongée","Autre"];

function Modal({ onClose, title, sub: subtitle, children, footer, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
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

function ModaleSuppression({ m, onClose, onConfirm, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title="Supprimer le compte" sub={m.nom}
      footer={<>
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Annuler</button>
        <button onClick={onConfirm} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold">Supprimer définitivement</button>
      </>}>
      <div className="flex flex-col gap-3">
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[11px] ${dark?"bg-red-900/20 border-red-700/40 text-red-300":"bg-red-50 border-red-200 text-red-700"}`}>
          <AlertTriangle size={13} className="shrink-0 mt-0.5"/>
          Supprimer définitivement <strong className="mx-1">{m.nom}</strong> ? Action irréversible.
        </div>
        <div className={`rounded-xl border px-4 py-3 text-[11px] ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
          {[{l:"Médecin",v:m.nom},{l:"CNOM",v:m.cnom},{l:"Créé le",v:m.creeLE},{l:"Validé le",v:m.valideLE}].map(({l,v})=>(
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

export default function MedecinsActifs() {
  const { dark }   = useOutletContext() || {};
  const navigate   = useNavigate();
  const [medecins, setMedecins] = useState(MOCK);
  const [loading,  setLoading]  = useState(true);
  const [filtre,   setFiltre]   = useState("Tous");
  const [ville,    setVille]    = useState("Toutes");
  const [modaleSuppr, setModaleSuppr] = useState(null);
  const [modalePhoto, setModalePhoto] = useState(null);
  const [toast,    setToast]    = useState(null);
  const [page,     setPage]     = useState(1);
  const [perPage,  setPerPage]  = useState(10);

  useEffect(() => {
    setLoading(true);
    getMedecinsActifs()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMedecins(data.map(m => ({
            id:              m.id,
            initials:        `${(m.prenom?.[0]||"").toUpperCase()}${(m.nom?.[0]||"").toUpperCase()}`,
            nom:             `${m.civilite||"Dr."} ${m.prenom} ${m.nom}`,
            specialite:      m.specialite     || "Pneumologue",
            hopital:         m.etablissement  || "—",
            ville:           m.adresse        || "—",
            email:           m.email          || "—",
            telephone:       m.telephone      || "—",
            cnom:            m.numero_rpps    || "—",
            statut:          "Actif",
            creeLE:          m.created_at     ? fmt(new Date(m.created_at)) : "—",
            valideLE:        m.valide_le      ? fmt(new Date(m.valide_le))  : "—",
            derniereActivite: m.derniere_activite || null,
            concordanceIA:   m.concordance_ia || null,
            patients:        m.nb_patients    || 0,
            consultations:   m.nb_consultations || 0,
            rangCommunaute:  m.rang_communaute || "—",
            casPartages:     m.cas_partages   || "—",
            activiteRecente: m.activite_recente || [],
            avatarColor:     avatarColor(`${m.prenom||""}${m.nom||""}`),
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const nbActifs   = medecins.filter(m => m.statut === "Actif").length;
  const nbInactifs = medecins.filter(m => m.statut === "Inactif").length;
  const villes     = ["Toutes", ...new Set(medecins.map(m => m.ville).filter(v => v && v !== "—"))];

  const liste = medecins.filter(m => {
    const okFiltre = filtre==="Actif"?m.statut==="Actif":filtre==="Inactif"?m.statut==="Inactif":true;
    const okVille  = ville==="Toutes" || m.ville===ville;
    return okFiltre && okVille;
  });

  const totalPages = Math.max(1, Math.ceil(liste.length / perPage));
  const paginated  = liste.slice((page-1)*perPage, page*perPage);
  const from = liste.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, liste.length);

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(liste.map((m,i) => ({
      "#":i+1, Nom:m.nom, CNOM:m.cnom, Spécialité:m.specialite,
      Établissement:m.hopital, Ville:m.ville, Statut:m.statut,
      "Créé le":m.creeLE, "Validé le":m.valideLE,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Médecins");
    XLSX.writeFile(wb, `medecins_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  function handleSuppression() {
    setMedecins(p => p.filter(x => x.id !== modaleSuppr.id));
    setToast({ msg:`Compte de ${modaleSuppr.nom} supprimé`, type:"error" });
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
          <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>{medecins.length} médecin{medecins.length>1?"s":""} sur la plateforme</p>
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
        <div className="flex gap-2">
          {[{k:"Tous",l:`Tous (${medecins.length})`},{k:"Actif",l:`Actifs (${nbActifs})`},{k:"Inactif",l:`Inactifs (${nbInactifs})`}].map(f=>(
            <button key={f.k} onClick={()=>{setFiltre(f.k);setPage(1);}}
              className="px-4 py-1.5 rounded-xl text-[11px] font-bold border transition-colors"
              style={filtre===f.k?{background:BRAND,borderColor:BRAND,color:"#fff"}:{borderColor:dark?"#21262d":"#e5e7eb",color:dark?"#484f58":"#9ca3af"}}>
              {f.l}
            </button>
          ))}
        </div>
        <select value={ville} onChange={e=>{setVille(e.target.value);setPage(1);}}
          className={`text-[11px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-semibold ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
          {villes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <div className={`rounded-2xl border overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{minWidth:750}}>
            <thead>
              <tr>
                <th className={th}>Médecin</th>
                <th className={th}>CNOM</th>
                <th className={th}>Établissement</th>
                <th className={th}>Ville</th>
                <th className={th}>Statut</th>
                <th className={th}>Créé le</th>
                <th className={th}>Validé le</th>
                <th className={`${th} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className={`${td} text-center py-14 text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>Chargement…</td></tr>
              ) : paginated.length===0 ? (
                <tr><td colSpan={8} className={`${td} text-center py-14 text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>Aucun médecin</td></tr>
              ) : paginated.map(m => (
                <tr key={m.id} className={`transition-colors ${dark?"hover:bg-[#0d1117]/60":"hover:bg-gray-50/80"}`}>
                  <td className={td}>
                    <div className="flex items-center gap-2.5 cursor-pointer group" onClick={()=>setModalePhoto(m)}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 group-hover:opacity-75 transition-opacity"
                        style={{background: m.avatarColor}}>
                        {m.initials}
                      </div>
                      <div>
                        <p className={`text-[12px] font-bold group-hover:underline underline-offset-2 ${dark?"text-white":"text-gray-800"}`}>{m.nom}</p>
                        <p className={`text-[10px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.specialite}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`${td} text-[11px] font-mono ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.cnom}</td>
                  <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`}>{m.hopital}</td>
                  <td className={`${td} text-[11px] ${dark?"text-[#8b949e]":"text-gray-500"}`}>{m.ville}</td>
                  <td className={td}>
                    {m.statut==="Actif"
                      ? <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/><span className="text-[11px] font-bold text-emerald-600">Actif</span></div>
                      : <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400"/><span className={`text-[11px] font-bold ${dark?"text-[#484f58]":"text-gray-400"}`}>Inactif</span></div>
                    }
                  </td>
                  <td className={`${td} text-[11px] ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.creeLE}</td>
                  <td className={`${td} text-[11px] font-semibold`} style={{color:BRAND}}>{m.valideLE}</td>
                  <td className={`${td} text-center`}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={()=>navigate(`/administrateur/medecins/${m.id}`, { state: { medecin: m } })} title="Voir le profil" className={ib}><Eye size={12}/></button>
                      <button onClick={()=>setModaleSuppr(m)} title="Supprimer" className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-gray-400 dark:text-[#484f58] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t text-[11px] ${dark?"border-[#21262d] text-[#484f58]":"border-gray-50 text-gray-400"}`}>
          <span>Affichage {from} à {to} sur {liste.length} médecin{liste.length>1?"s":""}</span>
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

      {modalePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModalePhoto(null)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <div>
                <p className={`text-[13px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{modalePhoto.nom}</p>
                <p className={`text-[11px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>Photo d'identité (CNI)</p>
              </div>
              <button onClick={()=>setModalePhoto(null)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}>
                <X size={13}/>
              </button>
            </div>
            <div className="px-5 py-8 flex flex-col items-center gap-4">
              {modalePhoto.photo_url
                ? <img src={modalePhoto.photo_url} alt={modalePhoto.nom} className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow"/>
                : <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark?"border-[#21262d] bg-[#0d1117] text-[#484f58]":"border-gray-200 bg-gray-50 text-gray-300"}`}>
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span className="text-[10px] text-center px-4">Aucune photo disponible</span>
                  </div>
              }
              <div className="text-center">
                <p className={`text-[13px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{modalePhoto.nom}</p>
                <p className={`text-[11px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{modalePhoto.specialite} · {modalePhoto.cnom}</p>
              </div>
            </div>
            <div className={`px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setModalePhoto(null)} className={`w-full py-2 rounded-xl text-[12px] font-medium border ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Fermer</button>
            </div>
          </div>
        </div>
      )}
      {modaleSuppr && <ModaleSuppression m={modaleSuppr} dark={dark} onClose={()=>setModaleSuppr(null)} onConfirm={handleSuppression}/>}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white bg-red-600`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}