import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminTheme } from "../context/useAdminTheme";
import * as XLSX from "xlsx";
import { Download, Trash2, X, Send, Mail, MoreVertical, RefreshCw } from "lucide-react";
import { brand, getSurface, getText } from "../theme";
import { getMedecinsRefuses, supprimerMedecin, relancerMedecin as relancerMedecinApi } from "../api/adminApi";
import {
  TableCard, TableContainer, Th, Tr, Td, EmptyCell, PersonCell,
  MutedText, SubtleText, StatusText, PaginationBar, PaginationSelect, PaginationButton,
} from "../components/ui/Table";

const pad   = (n)  => String(n).padStart(2, "0");
function fmt(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }

function avatarColor(str) {
  const colors = ["#1D9E75","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"];
  let h = 0;
  for (let i=0;i<str.length;i++) h=str.charCodeAt(i)+((h<<5)-h);
  return colors[Math.abs(h)%colors.length];
}

const VILLES_CM = ["Yaoundé","Douala","Bafoussam","Garoua","Maroua","Ngaoundéré","Bertoua","Ebolowa","Buéa","Limbé"];

function Modal({ onClose, title, sub: subtitle, wide, children, footer, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`w-full ${wide?"max-w-2xl":"max-w-lg"} max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <div>
            <p className={`text-[15px] font-bold ${dark?"text-white":"text-gray-800"}`}>{title}</p>
            {subtitle&&<p className={`text-[14px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer&&<div className={`shrink-0 flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>{footer}</div>}
      </div>
    </div>
  );
}

function ModalePhoto({ r, onClose, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={r.nom} sub="Photo d'identité (CNI)" wide
      footer={<button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Fermer</button>}>
      <div className="flex flex-col items-center gap-4">
        {r.photo_url
          ? <img src={r.photo_url} alt={r.nom} className="w-full max-h-[42vh] rounded-xl object-contain border border-gray-200 shadow"/>
          : <div className={`w-full h-44 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark?"border-[#21262d] bg-[#0d1117] text-[#484f58]":"border-gray-200 bg-gray-50 text-gray-300"}`}>
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span className="text-[14px] text-center px-2">Aucune photo</span>
            </div>
        }
        <div className="text-center">
          <p className={`text-[14px] font-bold ${dark?"text-white":"text-gray-800"}`}>{r.nom}</p>
          <p className={`text-[14px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{r.specialite} · CNOM {r.cnom}</p>
        </div>
      </div>
    </Modal>
  );
}

function ModaleRelance({ r, onClose, onConfirm, dark }) {
  const [msg, setMsg] = useState(
    `Bonjour ${r.nom},\n\nVotre demande d'inscription sur PneumoIA a été refusée pour le motif suivant :\n\n« ${r.motif} »\n\nNous vous invitons à corriger les éléments manquants et à soumettre une nouvelle demande depuis votre espace.\n\nCordialement,\nL'équipe PneumoIA`
  );
  const inp = `w-full text-[14px] px-3 py-2 rounded-xl border outline-none resize-none ${dark?"bg-[#0d1117] border-[#21262d] text-white":"bg-gray-50 border-gray-200 text-gray-800"}`;
  return (
    <Modal dark={dark} onClose={onClose} title="Relancer par e-mail" sub={`${r.nom} · ${r.email}`}
      footer={<>
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
        <button onClick={()=>onConfirm(msg)}
          className="flex-1 py-2 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2"
          style={{background:brand.DEFAULT}}>
          <Send size={12}/> Envoyer l'e-mail
        </button>
      </>}>
      <div className="flex flex-col gap-4">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
          <Mail size={14} className={dark?"text-[#484f58]":"text-gray-400"}/>
          <div>
            <p className={`text-[14px] ${dark?"text-[#484f58]":"text-gray-400"}`}>Destinataire</p>
            <p className={`text-[14px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{r.email}</p>
          </div>
        </div>
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-[15px] ${dark?"bg-amber-900/20 border-amber-700/40 text-amber-300":"bg-amber-50 border-amber-200 text-amber-700"}`}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>Motif : <strong>{r.motif}</strong></span>
        </div>
        <div>
          <label className={`block text-[15px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>
            Message <span className={`font-normal ${dark?"text-[#484f58]":"text-gray-400"}`}>(modifiable)</span>
          </label>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={9} className={inp}/>
        </div>
        <p className={`text-[14px] ${dark?"text-[#484f58]":"text-gray-400"}`}>
          Le médecin recevra cet e-mail et pourra corriger son dossier et soumettre à nouveau.
        </p>
      </div>
    </Modal>
  );
}

export default function Refusees() {
  const { dark } = useOutletContext() || {};
  const { searchQuery } = useAdminTheme();
  const [rows,          setRows]         = useState([]);
  const [target,        setTarget]       = useState(null);
  const [modalePhoto,   setModalePhoto]  = useState(null);
  const [modaleRelance, setModaleRelance]= useState(null);
  const [toast,         setToast]        = useState(null);
  const [page,          setPage]         = useState(1);
  const [perPage,       setPerPage]      = useState(10);
  const [villeFiltre,   setVilleFiltre]  = useState("Toutes");
  const [motifFiltre,   setMotifFiltre]  = useState("Tous");

  const [openMenuId,       setOpenMenuId]       = useState(null);
  const [loading,          setLoading]          = useState(false);
  const [refreshKey,       setRefreshKey]       = useState(0);
  const [bulkDeleteModal,  setBulkDeleteModal]  = useState(false);
  const [bulkRelanceModal, setBulkRelanceModal] = useState(false);
  const [bulkLoading,      setBulkLoading]      = useState(false);
  const [bulkMsg,          setBulkMsg]          = useState("");
  const [modaleMotif,      setModaleMotif]      = useState(null);

  useEffect(() => {
    setLoading(true);
    getMedecinsRefuses()
      .then(data => {
        setRows(Array.isArray(data) ? data.map(m => ({
          id:          m.id,
          initials:    `${(m.prenom?.[0]||"").toUpperCase()}${(m.nom?.[0]||"").toUpperCase()}`,
          nom:         `${m.civilite||"Dr."} ${m.prenom} ${m.nom}`,
          specialite:  m.specialite    || "Pneumologue",
          hopital:     m.etablissement || "—",
          ville:       m.ville || m.adresse || "—",
          cnom:        m.numero_rpps   || "—",
          email:       m.email         || "—",
          telephone:   m.telephone     || "—",
          dateDemande: m.date_demande || (m.created_at ? fmt(new Date(m.created_at)) : "—"),
          dateRefus:   m.date_refus   || (m.updated_at ? fmt(new Date(m.updated_at)) : "—"),
          motif:       m.motif_rejet   || "—",
          refusePar:   "Administrateur",
          photo_url:   m.photo_url     || null,
          relanceSent: m.relance_sent  || false,
        })) : []);
      })
      .catch(e => {
        console.error("[Refuses] fetch error:", e?.message);
        setToast({msg: "Erreur lors du chargement des dossiers refusés", type: "error"});
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const motifs = ["Tous", ...new Set(rows.map(r=>r.motif))];

  const filtered = rows.filter(r => {
    const okVille  = villeFiltre==="Toutes" || r.ville===villeFiltre;
    const okMotif  = motifFiltre==="Tous"   || r.motif===motifFiltre;
    const q        = searchQuery.toLowerCase().trim();
    const okSearch = !q || [r.nom, r.cnom, r.email, r.ville, r.hopital]
      .some(v => v && v.toLowerCase().includes(q));
    return okVille && okMotif && okSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  const paginated  = filtered.slice((page-1)*perPage, page*perPage);
  const from = filtered.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, filtered.length);

  useEffect(()=>{
    if (!toast) return;
    const t = setTimeout(()=>setToast(null),3500);
    return ()=>clearTimeout(t);
  },[toast]);

  useEffect(() => {
    if (openMenuId === null) return;
    const handleClickOutside = () => setOpenMenuId(null);
    const timeout = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  const eligibleRelance = filtered.filter(r => !r.relanceSent);

  async function handleBulkSupprimer() {
    setBulkLoading(true);
    const ids = filtered.map(r => r.id);
    await Promise.all(ids.map(id => supprimerMedecin(id).catch(() => {})));
    setRows(p => p.filter(r => !ids.includes(r.id)));
    setToast({ msg: `${ids.length} dossier${ids.length > 1 ? "s" : ""} supprimé${ids.length > 1 ? "s" : ""}`, type: "error" });
    setBulkDeleteModal(false);
    setBulkLoading(false);
    setPage(1);
  }

  async function handleBulkRelancer() {
    setBulkLoading(true);
    await Promise.all(eligibleRelance.map(r => relancerMedecinApi(r.id, bulkMsg).catch(() => {})));
    const ids = eligibleRelance.map(r => r.id);
    setRows(p => p.map(r => ids.includes(r.id) ? { ...r, relanceSent: true } : r));
    setToast({ msg: `Relance envoyée à ${eligibleRelance.length} médecin${eligibleRelance.length > 1 ? "s" : ""}`, type: "success" });
    setBulkRelanceModal(false);
    setBulkLoading(false);
  }

  async function supprimer(r) {
    try { await supprimerMedecin(r.id); } catch {}
    setRows(p=>p.filter(x=>x.id!==r.id));
    setToast({msg:`Dossier de ${r.nom} supprimé`,type:"error"});
    setTarget(null);
  }

  async function handleRelance(msg) {
    try { await relancerMedecinApi(modaleRelance.id, msg); } catch {}
    setRows(p=>p.map(r=>r.id===modaleRelance.id?{...r,relanceSent:true}:r));
    setToast({msg:`E-mail envoyé à ${modaleRelance.email}`,type:"success"});
    setModaleRelance(null);
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(filtered.map((r,i)=>({
      "#":i+1,Nom:r.nom,CNOM:r.cnom,Spécialité:r.specialite,
      Établissement:r.hopital,Ville:r.ville,
      "Date demande":r.dateDemande,"Date refus":r.dateRefus,
      Motif:r.motif,"Refusé par":r.refusePar,
      "Relance envoyée":r.relanceSent?"Oui":"Non",
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Refusées");
    XLSX.writeFile(wb,`refusees_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const surface = getSurface(dark);
  const txt     = getText(dark);
  const sel = `text-[14px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-medium ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>
            Inscriptions refusées
          </h1>
          <p className={`text-[14px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>
            {filtered.length} dossier{filtered.length>1?"s":""} refusé{filtered.length>1?"s":""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            title="Actualiser"
            className={`p-2 rounded-xl border transition-colors ${dark?"border-[#30363d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            disabled={eligibleRelance.length === 0}
            onClick={() => {
              setBulkMsg(`Bonjour,\n\nVotre demande d'inscription sur PneumoIA a été refusée.\n\nNous vous invitons à corriger les éléments manquants et à soumettre une nouvelle demande depuis votre espace médecin.\n\nCordialement,\nL'équipe PneumoIA`);
              setBulkRelanceModal(true);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[14px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed
              ${dark?"border-[#30363d] text-[#8b949e] hover:enabled:bg-[#1D9E75] hover:enabled:text-white hover:enabled:border-[#1D9E75]":"border-gray-200 text-gray-600 hover:enabled:bg-[#1D9E75] hover:enabled:text-white hover:enabled:border-[#1D9E75]"}`}>
            <Send size={13}/> Relancer tout
            {eligibleRelance.length > 0 && (
              <span className={`ml-0.5 text-[12px] px-1.5 py-0.5 rounded-full font-bold ${dark?"bg-[#21262d]":"bg-gray-100"}`}>
                {eligibleRelance.length}
              </span>
            )}
          </button>

          <button
            disabled={filtered.length === 0}
            onClick={() => setBulkDeleteModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[14px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed border-red-200 text-red-600 hover:enabled:bg-red-600 hover:enabled:text-white hover:enabled:border-red-600">
            <Trash2 size={13}/> Supprimer tout
          </button>

          <button onClick={exportExcel}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[14px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e]"
            onMouseEnter={e=>{e.currentTarget.style.background=brand.DEFAULT;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=brand.DEFAULT;}}
            onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color="";e.currentTarget.style.borderColor="";}}>
            <Download size={13}/> Export Excel
          </button>
        </div>
      </div>

      <TableCard dark={dark}>
        <div className="flex items-center gap-3 flex-wrap px-5 py-3 border-b" style={{ borderColor: surface.border }}>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium" style={{ color: txt.subtle }}>Ville :</span>
            <select value={villeFiltre} onChange={e=>{setVilleFiltre(e.target.value);setPage(1);}} className={sel}>
              <option value="Toutes">Toutes les villes</option>
              {VILLES_CM.map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium" style={{ color: txt.subtle }}>Motif :</span>
            <select value={motifFiltre} onChange={e=>{setMotifFiltre(e.target.value);setPage(1);}} className={sel}
              style={{maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis"}}>
              {motifs.map(m => {
                const label = m === "Tous" ? "Tous les motifs" : m;
                const short = label.length > 30 ? label.slice(0, 30) + "…" : label;
                return <option key={m} value={m} title={label}>{short}</option>;
              })}
            </select>
          </div>
          {(villeFiltre!=="Toutes"||motifFiltre!=="Tous") && (
            <button onClick={()=>{setVilleFiltre("Toutes");setMotifFiltre("Tous");setPage(1);}}
              className="text-[14px] font-medium px-3 py-1.5 rounded-xl border transition-colors"
              style={{ borderColor: surface.border, color: txt.subtle }}>
              Réinitialiser
            </button>
          )}
        </div>

        <TableContainer dark={dark} fixed>
          <thead>
            <tr>
              <Th dark={dark} style={{width:"19%"}}>Médecin</Th>
              <Th dark={dark} style={{width:"11%"}}>CNOM</Th>
              <Th dark={dark} style={{width:"11%"}}>Établissement</Th>
              <Th dark={dark} style={{width:"7%"}}>Ville</Th>
              <Th dark={dark} style={{width:"9%"}}>Demande</Th>
              <Th dark={dark} style={{width:"9%"}}>Refus</Th>
              <Th dark={dark} style={{width:"13%"}}>Motif</Th>
              <Th dark={dark} style={{width:"13%"}}>Refusé par</Th>
              <Th dark={dark} center style={{width:"8%"}}>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginated.length===0
              ? <EmptyCell dark={dark} colSpan={9}>Aucun dossier</EmptyCell>
              : paginated.map(r => {
                  const isMenuOpen = openMenuId === r.id;
                  return (
                    <Tr key={r.id} dark={dark}>

                      <Td dark={dark}>
                        <PersonCell dark={dark} avatarColor={avatarColor(r.nom)} initials={r.initials}
                          name={r.nom} subtitle={r.specialite} onClick={()=>setModalePhoto(r)} photoUrl={r.photo_url} />
                      </Td>

                      <Td dark={dark}><MutedText dark={dark} mono>{r.cnom}</MutedText></Td>
                      <Td dark={dark}><MutedText dark={dark}>{r.hopital}</MutedText></Td>
                      <Td dark={dark}><MutedText dark={dark}>{r.ville}</MutedText></Td>
                      <Td dark={dark}><SubtleText dark={dark}>{r.dateDemande}</SubtleText></Td>
                      <Td dark={dark}><StatusText color="danger">{r.dateRefus}</StatusText></Td>

                      <Td dark={dark}>
                        <button
                          onClick={() => r.motif && r.motif !== "—" && setModaleMotif(r)}
                          className={`text-[13px] truncate block w-full text-left transition-colors ${r.motif && r.motif !== "—" ? "cursor-pointer hover:underline underline-offset-2" : "cursor-default"}`}
                          style={{ color: txt.secondary }}
                        >
                          {r.motif}
                        </button>
                      </Td>

                      <Td dark={dark}>
                        <span className="text-[14px] truncate block w-full" style={{ color: txt.secondary }} title={r.refusePar}>
                          {r.refusePar}
                        </span>
                      </Td>

                      <Td dark={dark} center>
                        <div className="relative flex justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(isMenuOpen ? null : r.id);
                            }}
                            title="Actions"
                            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all
                              ${isMenuOpen
                                ? (dark?"bg-[#21262d] border-[#30363d] text-white shadow-lg":"bg-gray-100 border-gray-300 text-gray-800 shadow-lg")
                                : (dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d] hover:text-white":"border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800")}`}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute right-0 top-full mt-1.5 z-30 min-w-[180px] rounded-xl border shadow-xl overflow-hidden
                                ${dark?"bg-[#161b22] border-[#30363d]":"bg-white border-gray-200"}`}
                              style={{ transformOrigin: "top right" }}
                            >
                              <button
                                disabled={r.relanceSent}
                                onClick={() => {
                                  setModaleRelance(r);
                                  setOpenMenuId(null);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium transition-colors
                                  ${r.relanceSent
                                    ? (dark?"text-[#484f58] cursor-not-allowed":"text-gray-300 cursor-not-allowed")
                                    : (dark?"text-[#c9d1d9] hover:bg-[#21262d]":"text-gray-700 hover:bg-gray-50")}`}
                              >
                                <Send size={14} className="shrink-0" style={{ color: r.relanceSent ? undefined : brand.DEFAULT }} />
                                <span>Relancer</span>
                                {r.relanceSent && (
                                  <span className={`ml-auto text-[12px] px-1.5 py-0.5 rounded ${dark?"bg-[#21262d] text-[#484f58]":"bg-gray-100 text-gray-400"}`}>
                                    Déjà fait
                                  </span>
                                )}
                              </button>

                              <div className={`border-t ${dark?"border-[#21262d]":"border-gray-100"}`} />

                              <button
                                onClick={() => {
                                  setTarget(r);
                                  setOpenMenuId(null);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-medium transition-colors
                                  ${dark?"text-red-400 hover:bg-red-900/20":"text-red-700 hover:bg-red-50"}`}
                              >
                                <Trash2 size={14} className="shrink-0" />
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  );
                })
            }
          </tbody>
        </TableContainer>

      </TableCard>

      <PaginationBar dark={dark}>
        <span>Affichage {from} à {to} sur {filtered.length} dossier{filtered.length>1?"s":""}</span>
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

      {bulkRelanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&!bulkLoading&&setBulkRelanceModal(false)}>
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <div>
                <p className={`text-[15px] font-bold ${dark?"text-white":"text-gray-800"}`}>Relancer tout</p>
                <p className={`text-[14px] mt-0.5 ${dark?"text-[#8b949e]":"text-gray-400"}`}>{eligibleRelance.length} médecin{eligibleRelance.length>1?"s":""} concerné{eligibleRelance.length>1?"s":""}</p>
              </div>
              <button disabled={bulkLoading} onClick={()=>setBulkRelanceModal(false)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[14px] ${dark?"bg-[#1D9E75]/10 border-[#1D9E75]/30 text-[#1D9E75]":"bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                <Send size={13} className="shrink-0 mt-0.5"/>
                <span>Un e-mail de relance sera envoyé à <strong>{eligibleRelance.length} médecin{eligibleRelance.length>1?"s":""}</strong> dont le dossier a été refusé.</span>
              </div>
              <div>
                <label className={`block text-[14px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>
                  Message <span className={`font-normal ${dark?"text-[#484f58]":"text-gray-400"}`}>(modifiable)</span>
                </label>
                <textarea
                  value={bulkMsg}
                  onChange={e=>setBulkMsg(e.target.value)}
                  rows={8}
                  disabled={bulkLoading}
                  className={`w-full text-[14px] px-3 py-2 rounded-xl border outline-none resize-none ${dark?"bg-[#0d1117] border-[#21262d] text-white":"bg-gray-50 border-gray-200 text-gray-800"}`}
                />
              </div>
            </div>
            <div className={`flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button disabled={bulkLoading} onClick={()=>setBulkRelanceModal(false)} className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
              <button disabled={bulkLoading} onClick={handleBulkRelancer}
                className="flex-1 py-2 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{background:brand.DEFAULT}}>
                {bulkLoading ? <RefreshCw size={13} className="animate-spin"/> : <Send size={12}/>}
                {bulkLoading ? "Envoi en cours…" : "Envoyer à tous"}
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&!bulkLoading&&setBulkDeleteModal(false)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <p className={`text-[15px] font-bold ${dark?"text-white":"text-gray-800"}`}>Supprimer tout</p>
              <button disabled={bulkLoading} onClick={()=>setBulkDeleteModal(false)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-[14px]">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>Supprimer définitivement <strong>{filtered.length} dossier{filtered.length>1?"s":""}</strong> ? Action irréversible.</span>
              </div>
              <p className={`text-[14px] px-1 ${dark?"text-[#8b949e]":"text-gray-500"}`}>
                Tous les dossiers refusés actuellement affichés (selon les filtres actifs) seront supprimés.
              </p>
            </div>
            <div className={`flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button disabled={bulkLoading} onClick={()=>setBulkDeleteModal(false)} className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
              <button disabled={bulkLoading} onClick={handleBulkSupprimer}
                className="flex-1 py-2 rounded-xl text-[14px] font-bold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1.5 disabled:opacity-60">
                {bulkLoading ? <RefreshCw size={13} className="animate-spin"/> : <Trash2 size={12}/>}
                {bulkLoading ? "Suppression…" : `Supprimer les ${filtered.length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setTarget(null)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <p className={`text-[15px] font-bold ${dark?"text-white":"text-gray-800"}`}>Supprimer définitivement</p>
              <button onClick={()=>setTarget(null)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-[15px]">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>Supprimer <strong>{target.nom}</strong> ? Action irréversible.</span>
              </div>
              <div className={`rounded-xl border px-4 py-3 text-[15px] ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
                {[{l:"Médecin",v:target.nom},{l:"CNOM",v:target.cnom},{l:"Motif",v:target.motif},{l:"Refusé le",v:target.dateRefus}].map(({l,v})=>(
                  <div key={l} className={`flex items-center justify-between py-1.5 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
                    <span className={dark?"text-[#484f58]":"text-gray-400"}>{l}</span>
                    <span className={`font-semibold truncate max-w-[160px] ${dark?"text-[#8b949e]":"text-gray-700"}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`flex gap-2 px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setTarget(null)} className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Annuler</button>
              <button onClick={()=>supprimer(target)} className="flex-1 py-2 rounded-xl text-[14px] font-bold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1.5">
                <Trash2 size={12}/> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {modaleMotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModaleMotif(null)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <p className={`text-[15px] font-bold ${dark?"text-white":"text-gray-800"}`}>Motif de refus</p>
              <button onClick={()=>setModaleMotif(null)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className={`text-[13px] px-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>
                {modaleMotif.nom} · {modaleMotif.dateRefus}
              </div>
              <div className={`px-4 py-3 rounded-xl border text-[14px] leading-relaxed break-words whitespace-pre-wrap max-h-60 overflow-y-auto ${dark?"bg-[#0d1117] border-[#21262d] text-[#c9d1d9]":"bg-gray-50 border-gray-100 text-gray-700"}`}>
                {modaleMotif.motif}
              </div>
            </div>
            <div className={`flex px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setModaleMotif(null)}
                className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {modalePhoto   && <ModalePhoto    r={modalePhoto}   dark={dark} onClose={()=>setModalePhoto(null)}/>}
      {modaleRelance && <ModaleRelance  r={modaleRelance} dark={dark} onClose={()=>setModaleRelance(null)} onConfirm={handleRelance}/>}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[14px] font-semibold text-white ${toast.type==="success"?"bg-blue-700":"bg-red-600"}`}>
          {toast.type==="success"?<Mail size={13}/>:<Trash2 size={13}/>} {toast.msg}
        </div>
      )}
    </div>
  );
}