/**
 * MedecinsActifs.jsx — Liste des médecins validés sur la plateforme
 */

import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { Download, Eye, X, AlertTriangle, RefreshCw } from "lucide-react";
import { getMedecinsActifs } from "../api/adminApi";
import { brand, getSurface, getText } from "../theme";
import { useAdminTheme } from "../context/useAdminTheme";
import {
  TableCard, TableContainer, Th, Tr, Td, EmptyCell, PersonCell,
  MutedText, SubtleText, StatusText, PaginationBar, PaginationSelect, PaginationButton,
} from "../components/ui/Table";

const NOW   = new Date();
const pad   = (n)  => String(n).padStart(2, "0");

function fmt(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }

function avatarColor(str) {
  const colors = [brand.DEFAULT,"#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"];
  let h = 0;
  for (let i=0;i<str.length;i++) h=str.charCodeAt(i)+((h<<5)-h);
  return colors[Math.abs(h)%colors.length];
}

function getStatut(derniereActivite, valideLeRaw) {
  // ref = max(derniere_activite, valide_le) : la plus récente des deux
  // Un compte validé aujourd'hui reste "Actif" même avec une ancienne connexion
  const d1 = derniereActivite ? new Date(derniereActivite).getTime() : 0;
  const d2 = valideLeRaw     ? new Date(valideLeRaw).getTime()      : 0;
  const refTs = Math.max(d1, d2);
  if (!refTs) return "Actif";
  const diffJours = (NOW - refTs) / (1000 * 3600 * 24);
  return diffJours > 14 ? "Inactif" : "Actif";
}

function joursInactivite(derniereActivite) {
  if (!derniereActivite) return null;
  return Math.floor((NOW - new Date(derniereActivite)) / (1000 * 3600 * 24));
}

export default function MedecinsActifs() {
  const { dark } = useOutletContext() || {};
  const { searchQuery } = useAdminTheme();
  const navigate = useNavigate();

  const [medecins,    setMedecins]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filtre,      setFiltre]      = useState("Tous");
  const [villeFiltre, setVilleFiltre] = useState("Toutes");
  const [modalePhoto, setModalePhoto] = useState(null);
  const [page,        setPage]        = useState(1);
  const [perPage,     setPerPage]     = useState(10);
  const [refreshKey,  setRefreshKey]  = useState(0);

  useEffect(() => {
    setLoading(true);
    getMedecinsActifs()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMedecins(data.map(m => ({
            id:               m.id,
            initials:         `${(m.prenom?.[0]||"").toUpperCase()}${(m.nom?.[0]||"").toUpperCase()}`,
            nom:              `${m.civilite||"Dr."} ${m.prenom} ${m.nom}`,
            specialite:       m.specialite       || "Pneumologue",
            hopital:          m.etablissement    || "—",
            ville:            m.adresse          || "—",
            email:            m.email            || "—",
            telephone:        m.telephone        || "—",
            cnom:             m.numero_rpps      || "—",
            creeLE:           m.created_at       ? fmt(new Date(m.created_at)) : "—",
            valideLE:         m.valide_le        ? fmt(new Date(m.valide_le))  : "—",
            valideLeRaw:      m.valide_le        || null,
            derniereActivite: m.derniere_activite || null,
            concordanceIA:    m.concordance_ia   || null,
            patients:         m.nb_patients      || 0,
            consultations:    m.nb_consultations || 0,
            rangCommunaute:   m.rang_communaute  || "—",
            casPartages:      m.cas_partages     || "—",
            activiteRecente:  m.activite_recente || [],
            photo_url:        m.photo_url        || null,
            avatarColor:      avatarColor(`${m.prenom||""}${m.nom||""}`),
            statutEffectif:   m.statut_effectif  || null,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const medecinsAvecStatut = medecins.map(m => ({
    ...m,
    statut:      m.statutEffectif || getStatut(m.derniereActivite, m.valideLeRaw),
    joursInactif: joursInactivite(m.derniereActivite),
  }));

  const nbActifs   = medecinsAvecStatut.filter(m => m.statut === "Actif").length;
  const nbInactifs = medecinsAvecStatut.filter(m => m.statut === "Inactif").length;

  const villes = ["Toutes", ...new Set(medecinsAvecStatut.map(m => m.ville).filter(v => v && v !== "—"))];

  const liste = medecinsAvecStatut.filter(m => {
    const okFiltre = filtre==="Actif"?m.statut==="Actif":filtre==="Inactif"?m.statut==="Inactif":true;
    const okVille  = villeFiltre==="Toutes" || m.ville===villeFiltre;
    const q = searchQuery.toLowerCase().trim();
    const okSearch = !q || [m.nom, m.specialite, m.hopital, m.ville, m.cnom, m.email]
      .some(v => v && v.toLowerCase().includes(q));
    return okFiltre && okVille && okSearch;
  });

  const totalPages = Math.max(1, Math.ceil(liste.length/perPage));
  const paginated  = liste.slice((page-1)*perPage, page*perPage);
  const from = liste.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, liste.length);

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(liste.map((m,i) => ({
      "#":i+1, Nom:m.nom, CNOM:m.cnom, Spécialité:m.specialite,
      Établissement:m.hopital, Ville:m.ville, Statut:m.statut,
      "Jours inactif": m.joursInactif ?? "—",
      "Créé le":m.creeLE, "Validé le":m.valideLE,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Médecins");
    XLSX.writeFile(wb, `medecins_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const surface = getSurface(dark);
  const txt     = getText(dark);
  const ib = `w-7 h-7 flex items-center justify-center rounded-lg transition-colors border ${dark?"border-[#21262d] text-[#484f58] hover:text-white hover:bg-[#21262d]":"border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>
            Médecins
          </h1>
          <p className={`text-[14px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>
            {medecins.length} médecin{medecins.length>1?"s":""} · Inactif si pas connecté depuis plus de 14 jours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            title="Actualiser"
            className={`p-2 rounded-xl border transition-colors ${dark?"border-[#30363d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={exportExcel}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[14px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e]"
            onMouseEnter={e=>{e.currentTarget.style.background=brand.DEFAULT;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=brand.DEFAULT;}}
            onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color="";e.currentTarget.style.borderColor="";}}>
            <Download size={13}/> Export Excel
          </button>
        </div>
      </div>

      {nbInactifs > 0 && (
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border ${dark?"bg-amber-900/20 border-amber-700/40":"bg-amber-50 border-amber-200"}`}>
          <AlertTriangle size={15} className={dark?"text-amber-400":"text-amber-600"}/>
          <p className={`text-[14px] font-medium ${dark?"text-amber-300":"text-amber-700"}`}>
            <strong>{nbInactifs} médecin{nbInactifs>1?"s":""}</strong> inactif{nbInactifs>1?"s":""} depuis plus de 14 jours —
            consultez leur profil pour suspendre ou supprimer.
          </p>
        </div>
      )}

      <TableCard dark={dark}>
        <div className="flex items-center gap-3 flex-wrap px-5 py-3 border-b" style={{ borderColor: surface.border }}>
          <div className="flex gap-2">
            {[
              {k:"Tous",    l:`Tous (${medecins.length})`},
              {k:"Actif",   l:`Actifs (${nbActifs})`},
              {k:"Inactif", l:`Inactifs (${nbInactifs})`},
            ].map(f=>(
              <button key={f.k} onClick={()=>{setFiltre(f.k);setPage(1);}}
                className="px-4 py-1.5 rounded-xl text-[14px] font-semibold border transition-colors"
                style={filtre===f.k
                  ?{background:brand.DEFAULT,borderColor:brand.DEFAULT,color:"#fff"}
                  :{borderColor:dark?"#21262d":"#e5e7eb",color:dark?"#484f58":"#9ca3af"}}>
                {f.l}
              </button>
            ))}
          </div>
          <select value={villeFiltre} onChange={e=>{setVilleFiltre(e.target.value);setPage(1);}}
            className={`text-[14px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-semibold ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
            {villes.map(v=><option key={v} value={v}>{v==="Toutes"?"Toutes les villes":v}</option>)}
          </select>
        </div>

        <TableContainer dark={dark}>
          <thead>
            <tr>
              <Th dark={dark}>Médecin</Th>
              <Th dark={dark}>CNOM</Th>
              <Th dark={dark}>Établissement</Th>
              <Th dark={dark}>Ville</Th>
              <Th dark={dark}>Statut</Th>
              <Th dark={dark}>Dernière activité</Th>
              <Th dark={dark}>Validé le</Th>
              <Th dark={dark} center>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyCell dark={dark} colSpan={8}>Chargement…</EmptyCell>
            ) : paginated.length===0 ? (
              <EmptyCell dark={dark} colSpan={8}>Aucun médecin</EmptyCell>
            ) : paginated.map(m=>(
              <Tr key={m.id} dark={dark}>

                <Td dark={dark}>
                  <div className={m.statut==="Inactif" ? "opacity-50" : ""}>
                    <PersonCell dark={dark} avatarColor={m.avatarColor} initials={m.initials}
                      name={m.nom} subtitle="Pneumologue" onClick={()=>setModalePhoto(m)} photoUrl={m.photo_url} />
                  </div>
                </Td>

                <Td dark={dark}><MutedText dark={dark} mono>{m.cnom}</MutedText></Td>
                <Td dark={dark}><MutedText dark={dark}>{m.hopital}</MutedText></Td>
                <Td dark={dark}><MutedText dark={dark}>{m.ville}</MutedText></Td>

                <Td dark={dark}>
                  {m.statut==="Actif"
                    ? <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"/>
                        <StatusText color="success">Actif</StatusText>
                      </div>
                    : <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"/>
                          <span className="text-[14px] font-semibold" style={{ color: txt.subtle }}>Inactif</span>
                        </div>
                        {m.joursInactif !== null && (
                          <span className="text-[12px] text-amber-500 font-medium ml-3.5">
                            {m.joursInactif}j sans connexion
                          </span>
                        )}
                      </div>
                  }
                </Td>

                <Td dark={dark}>
                  <SubtleText dark={dark}>
                    {m.derniereActivite
                      ? (() => {
                          const j = Math.floor((NOW - new Date(m.derniereActivite)) / (1000*3600*24));
                          if (j === 0) return "Aujourd'hui";
                          if (j === 1) return "Hier";
                          return `Il y a ${j}j`;
                        })()
                      : "—"
                    }
                  </SubtleText>
                </Td>

                <Td dark={dark}><StatusText color="success">{m.valideLE}</StatusText></Td>

                <Td dark={dark} center>
                  <button
                    onClick={()=>navigate(`/administrateur/medecins/${m.id}`, {state:{medecin:m}})}
                    title="Voir le profil"
                    className={ib}>
                    <Eye size={12}/>
                  </button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableContainer>

      </TableCard>

      <PaginationBar dark={dark}>
        <span>Affichage {from} à {to} sur {liste.length} médecin{liste.length>1?"s":""}</span>
        <div className="flex items-center gap-2">
          <span>Lignes :</span>
          <PaginationSelect dark={dark} value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}} />
        </div>
        <div className="flex items-center gap-1">
          <PaginationButton dark={dark} onClick={()=>setPage(1)} disabled={page===1}>«</PaginationButton>
          <PaginationButton dark={dark} onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>‹</PaginationButton>
          {Array.from({length:totalPages},(_,i)=>i+1)
            .filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1)
            .reduce((acc,p,idx,arr)=>{if(idx>0&&p-arr[idx-1]>1)acc.push("…"+idx);acc.push(p);return acc;},[])
            .map(p=>typeof p==="string"
              ? <span key={p} className="px-1 opacity-30">…</span>
              : <PaginationButton key={p} dark={dark} onClick={()=>setPage(p)} active={p===page}>{p}</PaginationButton>
            )}
          <PaginationButton dark={dark} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>›</PaginationButton>
          <PaginationButton dark={dark} onClick={()=>setPage(totalPages)} disabled={page===totalPages}>»</PaginationButton>
        </div>
      </PaginationBar>

      {modalePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModalePhoto(null)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <div>
                <p className={`text-[13px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{modalePhoto.nom}</p>
                <p className={`text-[13px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>Photo d'identité (CNI)</p>
              </div>
              <button onClick={()=>setModalePhoto(null)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
            </div>
            <div className="px-5 py-4 flex flex-col items-center gap-4">
              {modalePhoto.photo_url
                ? <img src={modalePhoto.photo_url} alt={modalePhoto.nom} className="w-full max-h-[42vh] rounded-xl object-contain border-2 border-gray-200 shadow"/>
                : <div className={`w-full h-44 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark?"border-[#21262d] bg-[#0d1117] text-[#484f58]":"border-gray-200 bg-gray-50 text-gray-300"}`}>
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span className="text-[13px] text-center px-4">Aucune photo disponible</span>
                  </div>
              }
              <div className="text-center">
                <p className={`text-[13px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{modalePhoto.nom}</p>
                <p className={`text-[13px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>Pneumologue · {modalePhoto.cnom}</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {modalePhoto.statut === "Actif"
                    ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/><span className="text-[14px] font-bold text-emerald-600">Actif</span></>
                    : <><span className="w-1.5 h-1.5 rounded-full bg-gray-400"/><span className="text-[14px] font-bold text-gray-400">
                        {modalePhoto.joursInactif !== null
                          ? `Inactif — ${modalePhoto.joursInactif}j sans connexion`
                          : "Inactif — jamais connecté"}
                      </span></>
                  }
                </div>
              </div>
            </div>
            <div className={`px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setModalePhoto(null)} className={`w-full py-2 rounded-xl text-[14px] font-medium border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}