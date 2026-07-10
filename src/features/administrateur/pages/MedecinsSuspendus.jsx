/**
 * MedecinsSuspendus.jsx — Liste des médecins suspendus
 *
 * Actions disponibles :
 *   - Réactiver → statut repasse à "valide" + email de notification au médecin
 *   - Supprimer → suppression définitive + email de notification au médecin
 */

import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminTheme } from "../context/useAdminTheme";
import { Trash2, X, AlertTriangle, RotateCcw, MoreVertical, RefreshCw, ShieldAlert, Unlock, Bell } from "lucide-react";
import { reactiverMedecin, supprimerMedecin, getMedecinsSuspendus, getRequetesMedecins, repondreRequete } from "../api/adminApi";
import { brand, getSurface, getText } from "../theme";
import {
  TableCard, TableContainer, Th, Tr, Td, EmptyCell, PersonCell,
  MutedText, SubtleText, PaginationBar, PaginationSelect, PaginationButton,
} from "../components/ui/Table";

const pad = (n) => String(n).padStart(2, "0");
function fmtDT(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; }

const toUTC = (iso) => iso ? new Date(iso.endsWith('Z') ? iso : iso + 'Z') : null;

function fmtElapsed(iso) {
  if (!iso) return "";
  const dm = Math.floor((Date.now() - toUTC(iso).getTime()) / 60000);
  if (dm < 1)    return "À l'instant";
  if (dm < 60)   return `il y a ${dm} min`;
  if (dm < 1440) return `il y a ${Math.floor(dm / 60)}h`;
  return `il y a ${Math.floor(dm / 1440)}j`;
}

function deblocageInitials(nom) {
  const parts = String(nom || "").replace(/^Dr\.?\s*/i, "").trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "??";
}

function Modal({ onClose, title, sub: subtitle, children, footer, dark, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`w-full ${wide ? "max-w-lg" : "max-w-sm"} rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <div>
            <p className={`text-[15px] font-bold ${dark?"text-white":"text-gray-800"}`}>{title}</p>
            {subtitle&&<p className={`text-[14px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}>
            <X size={13}/>
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1 modal-scroll">{children}</div>
        {footer&&<div className={`flex gap-2 px-5 py-4 border-t shrink-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>{footer}</div>}
      </div>
    </div>
  );
}

function ModalePhoto({ m, onClose, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={m.nom} sub="Photo d'identité (CNI)" wide
      footer={<button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Fermer</button>}>
      <div className="flex flex-col items-center gap-4">
        {m.photo_url
          ? <img src={m.photo_url} alt={m.nom} className="w-full max-h-[42vh] rounded-xl object-contain border-2 border-gray-200 shadow"/>
          : <div className={`w-full h-44 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark?"border-[#21262d] bg-[#0d1117] text-[#484f58]":"border-gray-200 bg-gray-50 text-gray-300"}`}>
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-[14px] text-center px-2">Aucune photo disponible</span>
            </div>
        }
        <div className="text-center">
          <p className={`text-[14px] font-bold ${dark?"text-white":"text-gray-800"}`}>{m.nom}</p>
          <p className={`text-[14px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{m.specialite} · CNOM {m.cnom}</p>
        </div>
      </div>
    </Modal>
  );
}

export default function MedecinsSuspendus() {
  const { dark } = useOutletContext() || {};
  const { searchQuery } = useAdminTheme();

  const [suspendus,        setSuspendus]        = useState([]);
  const [loadingData,      setLoadingData]      = useState(true);
  const [modaleReactiver,  setModaleReactiver]  = useState(null);
  const [modaleSuppr,      setModaleSuppr]      = useState(null);
  const [modalePhoto,      setModalePhoto]      = useState(null);
  const [msgReactiv,       setMsgReactiv]       = useState("");
  const [loading,          setLoading]          = useState(false);
  const [toast,            setToast]            = useState(null);
  const [page,             setPage]             = useState(1);
  const [perPage,          setPerPage]          = useState(10);
  const [filtre,           setFiltre]           = useState("tous");
  const [openMenuId,       setOpenMenuId]       = useState(null);
  const [refreshKey,       setRefreshKey]       = useState(0);
  const [deblocageReqs,    setDeblocageReqs]    = useState({});
  const [deblocageLoading, setDeblocageLoading] = useState(null);
  const [mainTab,          setMainTab]          = useState("liste");
  const [deblocageReqsList,setDeblocageReqsList]= useState([]);

  const q = searchQuery.toLowerCase().trim();
  const nSecurite = suspendus.filter(m => m.bloqueSecurite).length;
  const nManuels  = suspendus.filter(m => !m.bloqueSecurite).length;

  const liste = suspendus.filter(m => {
    if (filtre === "securite" && !m.bloqueSecurite) return false;
    if (filtre === "manuel"   &&  m.bloqueSecurite) return false;
    return !q || [m.nom, m.hopital, m.cnom, m.email, m.specialite]
      .some(v => v && v.toLowerCase().includes(q));
  });
  const totalPages = Math.max(1, Math.ceil(liste.length/perPage));
  const paginated  = liste.slice((page-1)*perPage, page*perPage);
  const from = liste.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, liste.length);

  useEffect(() => {
    setLoadingData(true);
    Promise.all([
      getMedecinsSuspendus(),
      getRequetesMedecins("").catch(() => []),
    ]).then(([data, reqs]) => {
      if (Array.isArray(data) && data.length > 0) {
        setSuspendus(data.map(m => ({
          id:          m.id,
          initials:    `${(m.prenom?.[0]||"").toUpperCase()}${(m.nom?.[0]||"").toUpperCase()}`,
          nom:         `${m.civilite||"Dr."} ${m.prenom} ${m.nom}`,
          specialite:  m.specialite    || "—",
          hopital:     m.etablissement || "—",
          cnom:        m.numero_rpps   || "—",
          email:       m.email         || "—",
          raison:      m.suspension_raison || m.motif_rejet || "—",
          duree:       m.suspension_duree  || "—",
          dureeType:   m.suspension_duree === "Indéfinie" ? "indefinie" : "limitee",
          suspenduLe:     m.suspension_le ? toUTC(m.suspension_le) : new Date(),
          suspenduPar:    m.suspension_par || "Administrateur",
          bloqueSecurite: !m.suspension_par || m.suspension_par === "system",
          ville:          m.ville || m.adresse || "—",
          photo_url:      m.photo_url || null,
        })));
      }
      if (Array.isArray(reqs)) {
        const map = {};
        const list = [];
        reqs.forEach(r => {
          if (r.action_admin === "deblocage" && (r.statut === "en_attente" || r.statut === "en_cours")) {
            map[r.medecin_id] = r.id;
            list.push(r);
          }
        });
        setDeblocageReqs(map);
        setDeblocageReqsList(list);
      }
    })
    .catch(() => {})
    .finally(() => setLoadingData(false));
  }, [refreshKey]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(()=>setToast(null), 4000);
    return ()=>clearTimeout(t);
  }, [toast]);

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

  useEffect(() => {
    const esc = e => {
      if (e.key==="Escape") {
        setModaleReactiver(null);
        setModaleSuppr(null);
        setModalePhoto(null);
      }
    };
    window.addEventListener("keydown", esc);
    return ()=>window.removeEventListener("keydown", esc);
  }, []);

  const handleDebloquerDirect = useCallback(async (m) => {
    setDeblocageLoading(m.id);
    try {
      let alreadyActive = false;
      try {
        await reactiverMedecin(m.id);
      } catch (err) {
        if (err?.message?.includes("n'est pas suspendu")) {
          alreadyActive = true;
        } else {
          throw err;
        }
      }

      // Clore TOUTES les demandes en attente pour ce médecin
      const pendingReqs = deblocageReqsList.filter(r => r.medecin_id === m.id);
      await Promise.all(pendingReqs.map(r => repondreRequete(r.id, {
        action_admin:  "Compte débloqué",
        reponse_admin: alreadyActive
          ? "Votre compte est déjà actif. Cette demande a été clôturée par l'administrateur."
          : "Votre compte a été réactivé par l'administrateur. Vous pouvez vous reconnecter.",
        statut: "resolu",
      })));

      setDeblocageReqs(p => { const n = {...p}; delete n[m.id]; return n; });
      setDeblocageReqsList(p => p.filter(r => r.medecin_id !== m.id));
      setSuspendus(p => p.filter(x => x.id !== m.id));
      setToast({
        msg: alreadyActive
          ? `✓ Demande(s) clôturée(s) — ${m.nom} est déjà actif`
          : `✓ ${m.nom} débloqué — notification envoyée`,
        type: "success",
      });
    } catch {
      setToast({ msg: "Erreur lors du déblocage", type: "error" });
    } finally {
      setDeblocageLoading(null);
    }
  }, [deblocageReqs, deblocageReqsList]);

  const handleReactiver = useCallback(async () => {
    if (!modaleReactiver) return;
    setLoading(true);
    try {
      await reactiverMedecin(modaleReactiver.id);
    } catch(e) {}
    // Clore aussi les demandes de déblocage en attente pour ce médecin
    const pendingReqs = deblocageReqsList.filter(r => r.medecin_id === modaleReactiver.id);
    await Promise.all(pendingReqs.map(r => repondreRequete(r.id, {
      action_admin:  "Compte débloqué",
      reponse_admin: "Votre compte a été réactivé par l'administrateur. Vous pouvez vous reconnecter.",
      statut:        "resolu",
    }).catch(() => {})));
    setDeblocageReqs(p => { const n = {...p}; delete n[modaleReactiver.id]; return n; });
    setDeblocageReqsList(p => p.filter(r => r.medecin_id !== modaleReactiver.id));
    setSuspendus(p => p.filter(m => m.id !== modaleReactiver.id));
    setToast({
      msg: `✓ ${modaleReactiver.nom} réactivé — notification envoyée`,
      type: "success",
    });
    setModaleReactiver(null);
    setMsgReactiv("");
    setLoading(false);
  }, [modaleReactiver, deblocageReqsList]);

  const handleSupprimer = useCallback(async () => {
    if (!modaleSuppr) return;
    setLoading(true);
    try {
      await supprimerMedecin(modaleSuppr.id);
    } catch(e) {}
    setSuspendus(p => p.filter(m => m.id !== modaleSuppr.id));
    setToast({
      msg: `Compte de ${modaleSuppr.nom} supprimé — notification envoyée`,
      type: "error",
    });
    setModaleSuppr(null);
    setLoading(false);
  }, [modaleSuppr]);

  const surface = getSurface(dark);
  const txt     = getText(dark);
  const avatarGray = dark ? "#30363d" : "#9ca3af";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* ─── En-tête ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>
            Comptes suspendus
          </h1>
          <p className={`text-[14px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>
            {suspendus.length} compte{suspendus.length>1?"s":""} suspendu{suspendus.length>1?"s":""}
            {" "}· Réactiver ou supprimer avec notification e-mail automatique
          </p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          disabled={loadingData}
          title="Actualiser"
          className={`p-2 rounded-xl border transition-colors ${dark?"border-[#30363d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
          <RefreshCw size={16} className={loadingData ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ─── Onglets principaux ─── */}
      <div className={`flex border-b ${dark?"border-[#21262d]":"border-gray-200"}`}>
        {[
          { key: "liste",     label: "Comptes suspendus",     count: suspendus.length,         Icon: null,  danger: false },
          { key: "deblocage", label: "Demandes de déblocage", count: deblocageReqsList.length, Icon: Bell,  danger: true  },
        ].map(({ key, label, count, Icon, danger }) => {
          const active = mainTab === key;
          return (
            <button
              key={key}
              onClick={() => { setMainTab(key); }}
              className={`flex items-center gap-2 px-5 py-3 text-[14px] font-semibold border-b-2 transition-colors ${
                active
                  ? danger && count > 0
                    ? "border-red-500 text-red-600 dark:text-red-400"
                    : `border-[#009e82] ${dark?"text-white":"text-gray-800"}`
                  : dark
                    ? "border-transparent text-[#8b949e] hover:text-white"
                    : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              {Icon && <Icon size={14} />}
              {label}
              {count > 0 && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  active && danger
                    ? "bg-red-100 text-red-600"
                    : active
                      ? dark ? "bg-white/10 text-white" : "bg-[#009e82]/10 text-[#009e82]"
                      : dark ? "bg-[#21262d] text-[#8b949e]" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Vue : Comptes suspendus ─── */}
      {mainTab === "liste" && (<>

        {/* Onglets de filtre */}
        <div className={`flex gap-2 flex-wrap`}>
          {[
            { key: "tous",     label: "Tous",                   count: suspendus.length },
            { key: "securite", label: "Bloqués sécurité",       count: nSecurite, danger: true },
            { key: "manuel",   label: "Suspendus manuellement", count: nManuels },
          ].map(({ key, label, count, danger }) => {
            const active = filtre === key;
            return (
              <button
                key={key}
                onClick={() => { setFiltre(key); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border transition-colors ${
                  active
                    ? danger
                      ? "bg-red-600 text-white border-red-600"
                      : (dark ? "bg-[#009e82] text-white border-[#009e82]" : "bg-[#009e82] text-white border-[#009e82]")
                    : dark
                      ? "bg-transparent text-[#8b949e] border-[#30363d] hover:bg-[#21262d]"
                      : "bg-transparent text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {key === "securite" && <ShieldAlert size={13} />}
                {label}
                {count > 0 && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    active
                      ? "bg-white/20 text-white"
                      : danger && count > 0
                        ? "bg-red-100 text-red-600"
                        : dark ? "bg-[#21262d] text-[#8b949e]" : "bg-gray-100 text-gray-500"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <TableCard dark={dark}>
          <TableContainer dark={dark} fixed>
            <thead>
              <tr>
                <Th dark={dark}>Médecin</Th>
                <Th dark={dark}>CNOM</Th>
                <Th dark={dark}>Raison de la suspension</Th>
                <Th dark={dark}>Durée</Th>
                <Th dark={dark}>Suspendu le</Th>
                <Th dark={dark} center style={{width: 80}}>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loadingData
                ? <EmptyCell dark={dark} colSpan={6}>Chargement…</EmptyCell>
                : paginated.length===0
                ? <EmptyCell dark={dark} colSpan={6}>Aucun compte suspendu</EmptyCell>
                : paginated.map(m => {
                    const isMenuOpen = openMenuId === m.id;
                    return (
                      <Tr key={m.id} dark={dark}>

                        <Td dark={dark}>
                          <PersonCell dark={dark} avatarColor={m.bloqueSecurite ? "#dc2626" : avatarGray} initials={m.initials}
                            name={m.nom} subtitle={`${m.specialite} · ${m.hopital}`} onClick={()=>setModalePhoto(m)} photoUrl={m.photo_url} />
                          <div className="flex flex-wrap gap-1 mt-1">
                            {m.bloqueSecurite && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30">
                                <ShieldAlert size={10} /> Bloqué sécurité
                              </span>
                            )}
                            {deblocageReqs[m.id] && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-600 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30">
                                <Bell size={10} /> Demande de déblocage
                              </span>
                            )}
                          </div>
                        </Td>

                        <Td dark={dark}><MutedText dark={dark} mono>{m.cnom}</MutedText></Td>

                        <Td dark={dark}>
                          <span className="text-[14px] font-medium text-orange-500 dark:text-orange-400 line-clamp-2" style={{ maxWidth: 240, display: "inline-block" }}>{m.raison}</span>
                        </Td>

                        <Td dark={dark}>
                          <span className={`text-[13px] font-bold px-2.5 py-1 rounded-full ${m.dureeType==="indefinie"?"bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400":"bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"}`}>
                            {m.duree}
                          </span>
                        </Td>

                        <Td dark={dark}><SubtleText dark={dark}>{fmtDT(m.suspenduLe)}</SubtleText></Td>

                        <Td dark={dark} center>
                          <div className="relative flex flex-col items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(isMenuOpen ? null : m.id);
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
                                className={`absolute right-0 top-full mt-1.5 z-30 min-w-[200px] rounded-xl border shadow-xl overflow-hidden
                                  ${dark?"bg-[#161b22] border-[#30363d]":"bg-white border-gray-200"}`}
                                style={{ transformOrigin: "top right" }}
                              >
                                <button
                                  onClick={() => {
                                    setModaleReactiver(m);
                                    setMsgReactiv("");
                                    setOpenMenuId(null);
                                  }}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium transition-colors
                                    ${dark?"text-blue-400 hover:bg-blue-900/20":"text-blue-800 hover:bg-blue-50"}`}
                                >
                                  <RotateCcw size={16} className="shrink-0 mt-0.5" />
                                  <span className="flex-1">Réactiver</span>
                                </button>

                                <div className={`border-t ${dark?"border-[#21262d]":"border-gray-100"}`} />

                                <button
                                  onClick={() => {
                                    setModaleSuppr(m);
                                    setOpenMenuId(null);
                                  }}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium transition-colors
                                    ${dark?"text-red-400 hover:bg-red-900/20":"text-red-700 hover:bg-red-50"}`}
                                >
                                  <Trash2 size={16} className="shrink-0 mt-0.5" />
                                  <span className="flex-1">Supprimer</span>
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
          <span>Affichage {from} à {to} sur {liste.length} compte{liste.length>1?"s":""}</span>
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

      </>)}

      {/* ─── Vue : Demandes de déblocage ─── */}
      {mainTab === "deblocage" && (
        <div className="flex flex-col gap-4">

          <p className={`text-[11px] font-bold uppercase tracking-widest ${dark?"text-[#8b949e]":"text-gray-400"}`}>
            Demandes de déblocage ({deblocageReqsList.length})
          </p>

          {loadingData ? (
            <div className={`text-[14px] text-center py-12 ${dark?"text-[#8b949e]":"text-gray-400"}`}>Chargement…</div>
          ) : deblocageReqsList.length === 0 ? (
            <div className={`flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border-2 border-dashed ${dark?"border-[#21262d] text-[#484f58]":"border-gray-200 text-gray-300"}`}>
              <Bell size={32} strokeWidth={1.2} />
              <p className="text-[14px] font-medium">Aucune demande de déblocage en attente</p>
            </div>
          ) : (
            deblocageReqsList.map(req => {
              const initials = deblocageInitials(req.nom_medecin || "");
              const mObj = suspendus.find(s => s.id === req.medecin_id) || { id: req.medecin_id, nom: req.nom_medecin || "Médecin" };
              const isLoading = deblocageLoading === req.medecin_id;
              return (
                <div
                  key={req.id}
                  className={`flex items-start gap-4 p-5 rounded-2xl border transition-shadow hover:shadow-md ${
                    dark
                      ? "bg-[#0d1117] border-[#21262d] hover:border-[#30363d]"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 bg-red-600 mt-0.5">
                    {initials}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <p className={`text-[14px] font-bold ${dark?"text-white":"text-gray-800"}`}>
                        {req.nom_medecin || "Médecin"}
                      </p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-600 border border-red-200">
                        <ShieldAlert size={10} /> Bloqué sécurité
                      </span>
                      {req.email_medecin && (
                        <span className={`text-[12px] ${dark?"text-[#484f58]":"text-gray-400"}`}>
                          {req.email_medecin}
                        </span>
                      )}
                    </div>

                    <p className={`text-[14px] leading-relaxed mb-3 ${dark?"text-[#8b949e]":"text-gray-600"}`}>
                      {req.description || req.titre || "Demande de déblocage de compte"}
                    </p>

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className={`text-[13px] ${dark?"text-[#484f58]":"text-gray-400"}`}>
                        {fmtElapsed(req.created_at)}
                      </span>
                      <button
                        onClick={() => handleDebloquerDirect(mObj)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors"
                      >
                        {isLoading
                          ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <Unlock size={13} />
                        }
                        Débloquer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── Modale photo ─── */}
      {modalePhoto && <ModalePhoto m={modalePhoto} dark={dark} onClose={()=>setModalePhoto(null)}/>}

      {/* ─── Modale réactiver ─── */}
      {modaleReactiver && (
        <Modal dark={dark} onClose={()=>setModaleReactiver(null)}
          title="Réactiver le compte" sub={modaleReactiver.nom}
          footer={<>
            <button onClick={()=>setModaleReactiver(null)}
              className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>
              Annuler
            </button>
            <button onClick={handleReactiver} disabled={loading}
              className="flex-1 py-2 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-colors"
              style={{background:brand.DEFAULT}}>
              <RotateCcw size={12}/> {loading?"Envoi…":"Réactiver"}
            </button>
          </>}>
          <div className="flex flex-col gap-3">
            {modaleReactiver.bloqueSecurite ? (
              <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[15px] ${dark?"bg-red-900/20 border-red-700/40 text-red-300":"bg-red-50 border-red-200 text-red-700"}`}>
                <ShieldAlert size={13} className="shrink-0 mt-0.5"/>
                <span>
                  Ce compte a été <strong>bloqué automatiquement</strong> suite à des tentatives OTP suspectes.
                  Réactivez-le uniquement si vous avez vérifié l'identité du médecin.
                  Il recevra un e-mail + une notification in-app.
                </span>
              </div>
            ) : (
              <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[15px] ${dark?"bg-blue-900/20 border-blue-700/40 text-blue-300":"bg-blue-50 border-blue-200 text-blue-800"}`}>
                <RotateCcw size={13} className="shrink-0 mt-0.5"/>
                <span>
                  Le compte de <strong>{modaleReactiver.nom}</strong> sera réactivé.
                  Il recevra un e-mail de notification avec le motif de réactivation.
                </span>
              </div>
            )}

            <div className={`rounded-xl border px-4 py-3 text-[15px] ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
              {[
                {l:"Médecin",      v:modaleReactiver.nom},
                {l:"CNOM",         v:modaleReactiver.cnom},
                {l:"E-mail",       v:modaleReactiver.email},
                {l:"Raison susp.", v:modaleReactiver.raison},
                {l:"Durée susp.",  v:modaleReactiver.duree},
                {l:"Suspendu par", v:modaleReactiver.suspenduPar},
              ].map(({l,v})=>(
                <div key={l} className={`flex items-start justify-between gap-3 py-1.5 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
                  <span className={dark?"text-[#484f58]":"text-gray-400"}>{l}</span>
                  <span className={`font-semibold text-right flex-1 min-w-0 break-words ${dark?"text-[#8b949e]":"text-gray-700"}`}>{v}</span>
                </div>
              ))}
            </div>

            <div>
              <label className={`block text-[15px] font-bold mb-1.5 ${dark?"text-[#8b949e]":"text-gray-600"}`}>
                Message au médecin <span className={`font-normal ${dark?"text-[#484f58]":"text-gray-400"}`}>(optionnel)</span>
              </label>
              <textarea
                value={msgReactiv}
                onChange={e=>setMsgReactiv(e.target.value)}
                rows={3}
                placeholder={`Bonjour ${modaleReactiver.nom},\n\nVotre compte a été réactivé suite à vérification de votre dossier…`}
                className={`w-full text-[14px] px-3 py-2 rounded-xl border outline-none resize-none ${dark?"bg-[#0d1117] border-[#21262d] text-white placeholder-[#484f58]":"bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400"}`}
              />
              <p className={`text-[14px] mt-1 ${dark?"text-[#484f58]":"text-gray-400"}`}>
                L'e-mail de réactivation sera envoyé à <strong>{modaleReactiver.email}</strong>
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Modale supprimer ─── */}
      {modaleSuppr && (
        <Modal dark={dark} onClose={()=>setModaleSuppr(null)}
          title="Supprimer le compte" sub={modaleSuppr.nom}
          footer={<>
            <button onClick={()=>setModaleSuppr(null)}
              className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>
              Annuler
            </button>
            <button onClick={handleSupprimer} disabled={loading}
              className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold flex items-center justify-center gap-2">
              <Trash2 size={12}/> {loading?"Suppression…":"Supprimer définitivement"}
            </button>
          </>}>
          <div className="flex flex-col gap-3">
            <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[15px] ${dark?"bg-red-900/20 border-red-700/40 text-red-300":"bg-red-50 border-red-200 text-red-700"}`}>
              <AlertTriangle size={13} className="shrink-0 mt-0.5"/>
              <span>
                Supprimer définitivement <strong>{modaleSuppr.nom}</strong> ?
                Toutes ses données seront effacées.
                Un <strong>e-mail de notification</strong> lui sera envoyé automatiquement.
              </span>
            </div>
            <div className={`rounded-xl border px-4 py-3 text-[15px] ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-100"}`}>
              {[
                {l:"Médecin",      v:modaleSuppr.nom},
                {l:"CNOM",         v:modaleSuppr.cnom},
                {l:"E-mail",       v:modaleSuppr.email},
                {l:"Raison",       v:modaleSuppr.raison},
                {l:"Suspendu le",  v:fmtDT(modaleSuppr.suspenduLe)},
                {l:"Suspendu par", v:modaleSuppr.suspenduPar},
              ].map(({l,v})=>(
                <div key={l} className={`flex items-start justify-between gap-3 py-1.5 border-b last:border-0 ${dark?"border-[#21262d]":"border-gray-100"}`}>
                  <span className={dark?"text-[#484f58]":"text-gray-400"}>{l}</span>
                  <span className={`font-semibold text-right flex-1 min-w-0 break-words ${dark?"text-[#8b949e]":"text-gray-700"}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Toast ─── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[14px] font-semibold text-white transition-all ${toast.type==="success"?"bg-blue-700":"bg-red-600"}`}>
          {toast.type==="success"?<RotateCcw size={13}/>:<Trash2 size={13}/>}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
