import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2, X, Star, Search, AlertTriangle, Bell, MessageSquare, CheckCircle, RefreshCw, Archive, Clock } from "lucide-react";
import { brand, status, getSurface, getText } from "../theme";
import { getAvis, supprimerAvis, marquerAvisVus, archiverAvis, getAvisArchives } from "../api/adminApi";

function elapsed(d) {
  const dm = Math.floor((Date.now() - d) / 60000);
  if (dm < 60)   return `Il y a ${dm} min`;
  if (dm < 1440) return `Il y a ${Math.floor(dm/60)}h`;
  return `Il y a ${Math.floor(dm/1440)}j`;
}

function daysLeft(archivedAt) {
  const expiry = new Date(archivedAt).getTime() + 7 * 24 * 60 * 60 * 1000;
  const diff = Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function avatarColor(str) {
  const colors = ["#1D9E75","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"];
  let h = 0;
  for (let i=0;i<str.length;i++) h=str.charCodeAt(i)+((h<<5)-h);
  return colors[Math.abs(h)%colors.length];
}

const VILLES_CM = ["Toutes","Yaoundé","Douala","Bafoussam","Garoua","Maroua","Ngaoundéré","Bertoua","Ebolowa","Buéa","Limbé"];
const NOTES     = ["Toutes","5","4","3","2","1"];

function StarRating({ note, size=14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i=>(
        <Star key={i} size={size} fill={i<=note?"#d97706":"none"} color={i<=note?"#d97706":"#e5e7eb"} strokeWidth={1.5}/>
      ))}
    </div>
  );
}

const mapAvis = (a) => ({
  id:          a.id,
  initials:    `${(a.prenom?.[0]||"").toUpperCase()}${(a.nom?.[0]||"").toUpperCase()}`,
  nom:         `${a.civilite||"Dr."} ${a.prenom||""} ${a.nom||""}`.trim(),
  specialite:  a.specialite    || "Pneumologue",
  hopital:     a.etablissement || "—",
  ville:       a.ville         || "—",
  photo_url:   a.photo_url     || null,
  note:        a.note          || 0,
  commentaire: a.commentaire   || a.contenu || "",
  date:        a.created_at ? new Date(a.created_at.endsWith("Z") ? a.created_at : a.created_at + "Z") : new Date(),
  nouveau:     !a.vu,
  archived_at: a.archived_at ? new Date(a.archived_at.endsWith("Z") ? a.archived_at : a.archived_at + "Z") : null,
});

export default function Commentaires() {
  const { dark } = useOutletContext() || {};
  const surface = getSurface(dark);
  const txt     = getText(dark);

  const [tab,          setTab]         = useState("actifs");
  const [rows,         setRows]        = useState([]);
  const [archives,     setArchives]    = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [loadingArch,  setLoadingArch] = useState(false);
  const [search,       setSearch]      = useState("");
  const [villeFiltre,  setVilleFiltre] = useState("Toutes");
  const [noteFiltre,   setNoteFiltre]  = useState("Toutes");
  const [statutFiltre, setStatutFiltre]= useState("Tous");
  const [modaleDelete,      setModaleDelete]      = useState(null);
  const [modaleArchive,     setModaleArchive]     = useState(null);
  const [raisonDelete,      setRaisonDelete]      = useState("");
  const [bulkArchiveModal,  setBulkArchiveModal]  = useState(false);
  const [bulkDeleteModal,   setBulkDeleteModal]   = useState(false);
  const [bulkLoading,       setBulkLoading]       = useState(false);
  const [modalePhoto,  setModalePhoto] = useState(null);
  const [toast,        setToast]       = useState(null);
  const [page,         setPage]        = useState(1);
  const [perPage,      setPerPage]     = useState(10);
  const [refreshKey,   setRefreshKey]  = useState(0);

  useEffect(() => {
    setLoading(true);
    getAvis()
      .then(data => setRows(Array.isArray(data) ? data.map(mapAvis) : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    if (tab !== "archives") return;
    setLoadingArch(true);
    getAvisArchives()
      .then(data => setArchives(Array.isArray(data) ? data.map(mapAvis) : []))
      .catch(() => setArchives([]))
      .finally(() => setLoadingArch(false));
  }, [tab, refreshKey]);

  const nbNouveaux = rows.filter(r => r.nouveau).length;
  const moyNote    = rows.length > 0
    ? (rows.reduce((s,r) => s+r.note, 0) / rows.length).toFixed(1) : "—";

  function showToast(msg, type="success") {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3500);
  }

  function marquerVus() {
    marquerAvisVus().catch(() => {});
    setRows(p => p.map(r => ({...r, nouveau:false})));
  }

  async function archiver(r) {
    try {
      await archiverAvis(r.id);
      setRows(p => p.filter(x => x.id !== r.id));
      showToast(`Commentaire archivé — sera supprimé de l'archive dans 7 jours`, "success");
    } catch {
      showToast("Erreur lors de l'archivage", "error");
    }
    setModaleArchive(null);
  }

  async function supprimer(r) {
    try {
      await supprimerAvis(r.id, raisonDelete.trim() || null);
      setRows(p => p.filter(x => x.id !== r.id));
      showToast(`Commentaire supprimé de la landing page — ${r.nom} sera notifié`, "error");
    } catch {
      showToast("Erreur lors de la suppression", "error");
    }
    setModaleDelete(null);
    setRaisonDelete("");
  }

  async function handleBulkArchiver() {
    setBulkLoading(true);
    const ids = filtered.map(r => r.id);
    await Promise.all(ids.map(id => archiverAvis(id).catch(() => {})));
    setRows(p => p.filter(r => !ids.includes(r.id)));
    showToast(`${ids.length} commentaire${ids.length > 1 ? "s" : ""} archivé${ids.length > 1 ? "s" : ""} — landing page inchangée`, "success");
    setBulkArchiveModal(false);
    setBulkLoading(false);
    setPage(1);
  }

  async function handleBulkSupprimer() {
    setBulkLoading(true);
    const ids = filtered.map(r => r.id);
    await Promise.all(ids.map(id => supprimerAvis(id, null).catch(() => {})));
    setRows(p => p.filter(r => !ids.includes(r.id)));
    showToast(`${ids.length} commentaire${ids.length > 1 ? "s" : ""} supprimé${ids.length > 1 ? "s" : ""} de la landing page`, "error");
    setBulkDeleteModal(false);
    setBulkLoading(false);
    setPage(1);
  }

  const filtered = rows.filter(r => {
    const okSearch = !search || r.nom.toLowerCase().includes(search.toLowerCase()) || r.commentaire.toLowerCase().includes(search.toLowerCase());
    const okVille  = villeFiltre==="Toutes" || r.ville===villeFiltre;
    const okNote   = noteFiltre==="Toutes"  || r.note===Number(noteFiltre);
    const okStatut = statutFiltre==="Tous"  || (statutFiltre==="nouveau" && r.nouveau);
    return okSearch && okVille && okNote && okStatut;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  const paginated  = filtered.slice((page-1)*perPage, page*perPage);
  const from = filtered.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, filtered.length);

  const cardStyle = { background: surface.card, borderColor: surface.border };
  const selCls = "text-[13px] px-3 py-2 rounded-xl border outline-none cursor-pointer font-medium";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: txt.primary }}>
            Commentaires médecins
          </h1>
          <p className="text-[15px] mt-1" style={{ color: txt.muted }}>
            Avis sur la landing page · Note moyenne{" "}
            <span className="font-bold" style={{ color: "#b45309" }}>★ {moyNote}/5</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            title="Actualiser"
            className="p-2 rounded-xl border transition-colors"
            style={{ borderColor: surface.border, color: txt.subtle }}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            disabled={filtered.length === 0 || tab !== "actifs"}
            onClick={() => setBulkArchiveModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[14px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              borderColor: brand.lighter,
              color: brand.DEFAULT,
              background: "transparent",
            }}
            onMouseEnter={e => { if (filtered.length > 0) { e.currentTarget.style.background = brand.DEFAULT; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = brand.DEFAULT; }}}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = brand.DEFAULT; e.currentTarget.style.borderColor = brand.lighter; }}>
            <Archive size={13}/> Archiver tout
            {filtered.length > 0 && (
              <span className="text-[12px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: dark ? "rgba(0,158,130,0.15)" : "rgba(0,158,130,0.10)" }}>
                {filtered.length}
              </span>
            )}
          </button>

          <button
            disabled={filtered.length === 0 || tab !== "actifs"}
            onClick={() => setBulkDeleteModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[14px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed border-red-200 text-red-600 hover:enabled:bg-red-600 hover:enabled:text-white hover:enabled:border-red-600">
            <Trash2 size={13}/> Supprimer tout
          </button>
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="flex items-center gap-1 p-1 rounded-2xl w-fit" style={{ background: dark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>
        {[
          { key: "actifs",   label: "Actifs",   count: rows.length },
          { key: "archives", label: "Archives", count: archives.length, info: "Vidées auto après 7 j" },
        ].map(({ key, label, count, info }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => { setTab(key); setPage(1); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all"
              style={{
                background: active ? (key === "archives" ? "#f59e0b" : brand.DEFAULT) : "transparent",
                color: active ? "#fff" : txt.subtle,
                boxShadow: active ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
              }}
              title={info}>
              {key === "archives" ? <Archive size={14}/> : <MessageSquare size={14}/>}
              {label}
              {count > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: active ? "rgba(255,255,255,0.25)" : (dark ? "rgba(255,255,255,0.1)" : "#e2e8f0"), color: active ? "#fff" : txt.subtle }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════ ONGLET ACTIFS ══════════ */}
      {tab === "actifs" && (
        <>
          {/* Bandeau nouveaux */}
          {nbNouveaux > 0 && (
            <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border"
              style={{ borderColor: dark?"rgba(234,88,12,0.30)":"rgba(251,191,36,0.40)", background: dark?"rgba(234,88,12,0.08)":"#fffbeb" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: dark?"rgba(234,88,12,0.15)":"#fef3c7" }}>
                  <Bell size={17} style={{ color: "#d97706" }}/>
                </div>
                <div>
                  <p className="text-[15px] font-bold" style={{ color: dark?"#fcd34d":"#92400e" }}>
                    {nbNouveaux} nouveau{nbNouveaux>1?"x":""} commentaire{nbNouveaux>1?"s":""} depuis votre dernière visite
                  </p>
                  <p className="text-[13px] mt-0.5" style={{ color: dark?"rgba(252,211,77,0.7)":"rgba(146,64,14,0.7)" }}>
                    Archivez-les après lecture · Supprimez uniquement si le contenu est néfaste.
                  </p>
                </div>
              </div>
              <button onClick={marquerVus}
                className="text-[13px] font-semibold px-4 py-2 rounded-xl border transition-colors shrink-0"
                style={{ borderColor: dark?"rgba(234,88,12,0.30)":"#fde68a", color: dark?"#fcd34d":"#b45309" }}>
                Marquer vus
              </button>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label:"Total actifs",  value: rows.length,    color: txt.primary },
              { label:"Nouveaux",      value: nbNouveaux,     color: nbNouveaux>0?"#ea580c":txt.subtle },
              { label:"Note moyenne",  value: `★ ${moyNote}`, color: "#b45309" },
            ].map(({label,value,color})=>(
              <div key={label} className="rounded-2xl border px-5 py-4" style={cardStyle}>
                <p className="text-[13px] font-semibold mb-1.5" style={{ color: txt.subtle }}>{label}</p>
                <p className="text-3xl font-black" style={{color}}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 h-10 px-4 rounded-xl border flex-1 min-w-[200px] max-w-xs" style={cardStyle}>
              <Search size={15} style={{ color: txt.subtle }}/>
              <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
                placeholder="Médecin ou mot-clé…"
                className="flex-1 bg-transparent border-none outline-none text-[14px]"
                style={{ color: txt.secondary }}/>
            </div>
            <select value={villeFiltre} onChange={e=>{setVilleFiltre(e.target.value);setPage(1);}} className={selCls} style={cardStyle}>
              <option>Toutes les villes</option>
              {VILLES_CM.filter(v=>v!=="Toutes").map(v=><option key={v} value={v}>{v}</option>)}
            </select>
            <select value={noteFiltre} onChange={e=>{setNoteFiltre(e.target.value);setPage(1);}} className={selCls} style={cardStyle}>
              <option>Toutes les notes</option>
              {NOTES.filter(n=>n!=="Toutes").map(n=><option key={n} value={n}>{n} étoile{n!=="1"?"s":""}</option>)}
            </select>
            <select value={statutFiltre} onChange={e=>{setStatutFiltre(e.target.value);setPage(1);}} className={selCls} style={cardStyle}>
              <option value="Tous">Tous</option>
              <option value="nouveau">🔔 Nouveaux</option>
            </select>
            {(villeFiltre!=="Toutes"||noteFiltre!=="Toutes"||statutFiltre!=="Tous"||search) && (
              <button onClick={()=>{setVilleFiltre("Toutes");setNoteFiltre("Toutes");setStatutFiltre("Tous");setSearch("");setPage(1);}}
                className="text-[13px] font-medium px-4 py-2 rounded-xl border" style={{ borderColor: surface.border, color: txt.subtle }}>
                Réinitialiser
              </button>
            )}
          </div>

          {/* Liste actifs */}
          <div className="flex flex-col gap-3">
            {loading
              ? <div className="rounded-2xl border px-5 py-16 flex flex-col items-center gap-3" style={cardStyle}>
                  <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${brand.DEFAULT} transparent transparent transparent` }}/>
                  <p className="text-[14px]" style={{ color: txt.subtle }}>Chargement…</p>
                </div>
              : rows.length===0
              ? <div className="rounded-2xl border px-5 py-16 flex flex-col items-center gap-5" style={cardStyle}>
                  <div style={{position:"relative",width:88,height:88}}>
                    <div style={{width:88,height:88,borderRadius:"50%",background:dark?"rgba(0,158,130,0.10)":brand.light,border:`2px solid ${dark?"rgba(0,158,130,0.20)":brand.lighter}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <MessageSquare size={36} style={{color:brand.DEFAULT}}/>
                    </div>
                    <div style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:brand.DEFAULT,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${surface.card}`}}>
                      <CheckCircle size={14} color="#fff"/>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[17px] font-bold mb-1" style={{ color: txt.primary }}>Aucun commentaire actif</p>
                    <p className="text-[14px]" style={{ color: txt.subtle }}>Tous les commentaires ont été archivés ou supprimés.</p>
                  </div>
                </div>
              : paginated.length===0
              ? <div className="rounded-2xl border px-5 py-12 text-center" style={cardStyle}>
                  <p className="text-[14px]" style={{ color: txt.subtle }}>Aucun commentaire correspondant aux filtres</p>
                </div>
              : paginated.map(r=>(
                <div key={r.id} className="rounded-2xl border p-5"
                  style={{ ...cardStyle, ...(r.nouveau ? { borderColor: dark?"rgba(234,88,12,0.35)":"#fed7aa" } : {}) }}>
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {r.photo_url
                        ? <img src={r.photo_url} alt={r.nom}
                            className="w-12 h-12 rounded-full object-cover shrink-0 cursor-pointer hover:opacity-85 transition-opacity border border-gray-200"
                            onClick={()=>setModalePhoto(r)}
                            onError={e=>{ e.currentTarget.style.display="none"; e.currentTarget.nextSibling.style.display="flex"; }} />
                        : null}
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[14px] font-bold shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                        style={{background:avatarColor(r.nom), display: r.photo_url ? "none" : "flex"}} onClick={()=>setModalePhoto(r)}>
                        {r.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <p className="text-[16px] font-bold cursor-pointer hover:underline underline-offset-2"
                            style={{ color: txt.primary }} onClick={()=>setModalePhoto(r)}>{r.nom}</p>
                          <span className="text-[13px]" style={{ color: txt.subtle }}>{r.ville} · {r.hopital}</span>
                          {r.nouveau && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold"
                              style={{ background: dark?"rgba(234,88,12,0.15)":"#fff7ed", color:"#c2410c", border:`1px solid ${dark?"rgba(234,88,12,0.30)":"#fed7aa"}` }}>
                              <Bell size={11}/> Nouveau
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mb-2.5">
                          <StarRating note={r.note}/>
                          <span className="text-[13px]" style={{ color: txt.subtle }}>{elapsed(r.date)}</span>
                        </div>
                        <p className="text-[15px] leading-relaxed" style={{ color: txt.secondary }}>"{r.commentaire}"</p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={()=>setModaleArchive(r)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors"
                        style={{ borderColor: brand.lighter, background: dark?"rgba(0,158,130,0.10)":"rgba(0,158,130,0.06)", color: brand.DEFAULT }}
                        onMouseEnter={e=>e.currentTarget.style.background=dark?"rgba(0,158,130,0.18)":"rgba(0,158,130,0.12)"}
                        onMouseLeave={e=>e.currentTarget.style.background=dark?"rgba(0,158,130,0.10)":"rgba(0,158,130,0.06)"}>
                        <Archive size={13}/> Archiver
                      </button>
                      <button onClick={()=>setModaleDelete(r)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors"
                        style={{ borderColor:"#fca5a5", background: dark?"rgba(220,38,38,0.10)":"#fef2f2", color:"#dc2626" }}
                        onMouseEnter={e=>e.currentTarget.style.background=dark?"rgba(220,38,38,0.18)":"#fee2e2"}
                        onMouseLeave={e=>e.currentTarget.style.background=dark?"rgba(220,38,38,0.10)":"#fef2f2"}>
                        <Trash2 size={13}/> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Pagination */}
          {filtered.length > perPage && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 rounded-2xl border text-[13px]"
              style={{ ...cardStyle, color: txt.subtle }}>
              <span>Affichage {from} à {to} sur {filtered.length}</span>
              <div className="flex items-center gap-2">
                <span>Lignes :</span>
                <select value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}}
                  className="text-[13px] px-2 py-1 rounded-lg border outline-none"
                  style={{ background: surface.bg, borderColor: surface.border, color: txt.secondary }}>
                  {[5,10,20].map(n=><option key={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                {[{d:()=>setPage(1),dis:page===1,l:"«"},{d:()=>setPage(p=>Math.max(1,p-1)),dis:page===1,l:"‹"},
                  {d:()=>setPage(p=>Math.min(totalPages,p+1)),dis:page===totalPages,l:"›"},
                  {d:()=>setPage(totalPages),dis:page===totalPages,l:"»"}].map(({d,dis,l})=>(
                  <button key={l} onClick={d} disabled={dis}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border text-[13px] transition-colors"
                    style={{ borderColor: surface.border, color: dis?(dark?"#30363d":"#d1d5db"):txt.secondary, cursor:dis?"not-allowed":"pointer" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════ ONGLET ARCHIVES ══════════ */}
      {tab === "archives" && (
        <>
          {/* Bandeau info */}
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border"
            style={{ borderColor: dark?"rgba(245,158,11,0.30)":"rgba(245,158,11,0.25)", background: dark?"rgba(245,158,11,0.08)":"#fffbeb" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: dark?"rgba(245,158,11,0.15)":"#fef3c7" }}>
              <Clock size={16} style={{ color:"#d97706" }}/>
            </div>
            <div>
              <p className="text-[14px] font-bold" style={{ color: dark?"#fcd34d":"#92400e" }}>
                Archive admin — auto-vidée après 7 jours
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: dark?"rgba(252,211,77,0.7)":"rgba(146,64,14,0.7)" }}>
                Les commentaires archivés restent visibles sur la landing page — seule cette vue admin est nettoyée après 7 jours.
              </p>
            </div>
          </div>

          {/* Liste archives */}
          <div className="flex flex-col gap-3">
            {loadingArch
              ? <div className="rounded-2xl border px-5 py-16 flex flex-col items-center gap-3" style={cardStyle}>
                  <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${brand.DEFAULT} transparent transparent transparent` }}/>
                  <p className="text-[14px]" style={{ color: txt.subtle }}>Chargement des archives…</p>
                </div>
              : archives.length === 0
              ? <div className="rounded-2xl border px-5 py-16 flex flex-col items-center gap-5" style={cardStyle}>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: dark?"rgba(245,158,11,0.10)":"#fef3c7" }}>
                    <Archive size={34} style={{ color:"#d97706" }}/>
                  </div>
                  <div className="text-center">
                    <p className="text-[17px] font-bold mb-1" style={{ color: txt.primary }}>Archive vide</p>
                    <p className="text-[14px]" style={{ color: txt.subtle }}>Les commentaires archivés apparaîtront ici pendant 7 jours.</p>
                  </div>
                </div>
              : archives.map(r => {
                  const jours = r.archived_at ? daysLeft(r.archived_at) : "?";
                  return (
                    <div key={r.id} className="rounded-2xl border p-5 opacity-80" style={cardStyle}>
                      <div className="flex items-start gap-4 flex-wrap">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {r.photo_url
                            ? <img src={r.photo_url} alt={r.nom} className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-200" onClick={()=>setModalePhoto(r)}
                                onError={e=>{ e.currentTarget.style.display="none"; e.currentTarget.nextSibling.style.display="flex"; }} />
                            : null}
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[14px] font-bold shrink-0"
                            style={{background:avatarColor(r.nom), display: r.photo_url ? "none" : "flex"}}>
                            {r.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <p className="text-[16px] font-bold" style={{ color: txt.primary }}>{r.nom}</p>
                              <span className="text-[13px]" style={{ color: txt.subtle }}>{r.ville} · {r.hopital}</span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                                style={{ background: dark?"rgba(245,158,11,0.15)":"#fef3c7", color:"#b45309", border:"1px solid rgba(245,158,11,0.30)" }}>
                                <Clock size={10}/> Suppression dans {jours}j
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mb-2.5">
                              <StarRating note={r.note}/>
                              <span className="text-[13px]" style={{ color: txt.subtle }}>{elapsed(r.date)}</span>
                            </div>
                            <p className="text-[15px] leading-relaxed" style={{ color: txt.secondary }}>"{r.commentaire}"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </>
      )}

      {/* ── Modal archiver tout ── */}
      {bulkArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&!bulkLoading&&setBulkArchiveModal(false)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden" style={cardStyle}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor: surface.border}}>
              <div>
                <p className="text-[15px] font-bold" style={{ color: txt.primary }}>Archiver tout</p>
                <p className="text-[13px] mt-0.5" style={{ color: txt.subtle }}>{filtered.length} commentaire{filtered.length>1?"s":""} concerné{filtered.length>1?"s":""}</p>
              </div>
              <button disabled={bulkLoading} onClick={()=>setBulkArchiveModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: txt.subtle }}><X size={15}/></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl border text-[13px]"
                style={{ borderColor: brand.lighter, background: dark?"rgba(0,158,130,0.10)":"rgba(0,158,130,0.06)", color: dark?brand.lighter:brand.dark }}>
                <Archive size={15} className="shrink-0 mt-0.5"/>
                <span><strong>{filtered.length} commentaire{filtered.length>1?"s":""}</strong> seront archivés de la vue admin. <strong>Ils restent visibles sur la landing page.</strong></span>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t" style={{borderColor: surface.border}}>
              <button disabled={bulkLoading} onClick={()=>setBulkArchiveModal(false)}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold border"
                style={{ borderColor: surface.border, color: txt.muted }}>Annuler</button>
              <button disabled={bulkLoading} onClick={handleBulkArchiver}
                className="flex-1 py-2.5 rounded-xl text-white text-[14px] font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: brand.DEFAULT }}>
                {bulkLoading ? <RefreshCw size={13} className="animate-spin"/> : <Archive size={14}/>}
                {bulkLoading ? "Archivage…" : "Archiver tout"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal supprimer tout ── */}
      {bulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&!bulkLoading&&setBulkDeleteModal(false)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden" style={cardStyle}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor: surface.border}}>
              <div>
                <p className="text-[15px] font-bold" style={{ color: txt.primary }}>Supprimer tout</p>
                <p className="text-[13px] mt-0.5" style={{ color: txt.subtle }}>{filtered.length} commentaire{filtered.length>1?"s":""} concerné{filtered.length>1?"s":""}</p>
              </div>
              <button disabled={bulkLoading} onClick={()=>setBulkDeleteModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: txt.subtle }}><X size={15}/></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl border text-[13px]"
                style={{ borderColor: status.danger.border, background: status.danger.bg, color: status.danger.text }}>
                <AlertTriangle size={15} className="shrink-0 mt-0.5"/>
                <span><strong>{filtered.length} commentaire{filtered.length>1?"s":""}</strong> seront supprimés <strong>définitivement de la landing page</strong>. Les médecins seront notifiés.</span>
              </div>
              <p className="text-[13px]" style={{ color: txt.subtle }}>Cette action est irréversible.</p>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t" style={{borderColor: surface.border}}>
              <button disabled={bulkLoading} onClick={()=>setBulkDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold border"
                style={{ borderColor: surface.border, color: txt.muted }}>Annuler</button>
              <button disabled={bulkLoading} onClick={handleBulkSupprimer}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-[14px] font-bold flex items-center justify-center gap-2">
                {bulkLoading ? <RefreshCw size={13} className="animate-spin"/> : <Trash2 size={14}/>}
                {bulkLoading ? "Suppression…" : `Supprimer les ${filtered.length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal archiver ── */}
      {modaleArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModaleArchive(null)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden" style={cardStyle}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor: surface.border}}>
              <p className="text-[15px] font-bold" style={{ color: txt.primary }}>Archiver le commentaire</p>
              <button onClick={()=>setModaleArchive(null)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: txt.subtle }}><X size={15}/></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl border text-[13px]"
                style={{ borderColor: brand.lighter, background: dark?"rgba(0,158,130,0.10)":"rgba(0,158,130,0.06)", color: dark?brand.lighter:brand.dark }}>
                <Archive size={15} className="shrink-0 mt-0.5"/>
                <span>Ce commentaire sera retiré de la liste admin uniquement. <strong>Il reste visible sur la landing page.</strong> L'entrée archive sera nettoyée après <strong>7 jours</strong>.</span>
              </div>
              <div className="px-4 py-3 rounded-xl border text-[14px] italic leading-relaxed"
                style={{ background: surface.bg, borderColor: surface.border, color: txt.secondary }}>
                "{modaleArchive.commentaire}"
              </div>
              <div className="flex items-center gap-2">
                <StarRating note={modaleArchive.note} size={13}/>
                <span className="text-[13px]" style={{ color: txt.subtle }}>{modaleArchive.nom} · {modaleArchive.ville}</span>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t" style={{borderColor: surface.border}}>
              <button onClick={()=>setModaleArchive(null)}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold border"
                style={{ borderColor: surface.border, color: txt.muted }}>Annuler</button>
              <button onClick={()=>archiver(modaleArchive)}
                className="flex-1 py-2.5 rounded-xl text-white text-[14px] font-bold flex items-center justify-center gap-2"
                style={{ background: brand.DEFAULT }}>
                <Archive size={14}/> Archiver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal supprimer ── */}
      {modaleDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModaleDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden" style={cardStyle}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor: surface.border}}>
              <p className="text-[15px] font-bold" style={{ color: txt.primary }}>Supprimer de la landing page</p>
              <button onClick={()=>setModaleDelete(null)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: txt.subtle }}><X size={15}/></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl border text-[13px]"
                style={{ borderColor: status.danger.border, background: status.danger.bg, color: status.danger.text }}>
                <AlertTriangle size={15} className="shrink-0 mt-0.5"/>
                <span>Ce commentaire sera <strong>retiré définitivement de la landing page</strong>. <strong>{modaleDelete.nom}</strong> sera notifié par e-mail.</span>
              </div>
              <div className="px-4 py-3 rounded-xl border text-[14px] italic leading-relaxed"
                style={{ background: surface.bg, borderColor: surface.border, color: txt.secondary }}>
                "{modaleDelete.commentaire}"
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: txt.muted }}>
                  Raison de la suppression <span style={{ color:"#dc2626" }}>*</span>
                </label>
                <textarea
                  value={raisonDelete}
                  onChange={e => setRaisonDelete(e.target.value)}
                  placeholder="Ex : contenu offensant, publicité non autorisée, données patient mentionnées..."
                  rows={3}
                  className="w-full px-3 py-2 text-[13px] rounded-xl border outline-none resize-none"
                  style={{ background: surface.bg, borderColor: surface.border, color: txt.primary }}
                />
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t" style={{borderColor: surface.border}}>
              <button onClick={()=>{ setModaleDelete(null); setRaisonDelete(""); }}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold border"
                style={{ borderColor: surface.border, color: txt.muted }}>Annuler</button>
              <button onClick={()=>supprimer(modaleDelete)}
                disabled={!raisonDelete.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[14px] font-bold flex items-center justify-center gap-2">
                <Trash2 size={14}/> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal photo ── */}
      {modalePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModalePhoto(null)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden" style={cardStyle}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor: surface.border}}>
              <div>
                <p className="text-[13px] font-bold" style={{ color: txt.primary }}>{modalePhoto.nom}</p>
                <p className="text-[12px] mt-0.5" style={{ color: txt.subtle }}>{modalePhoto.ville}</p>
              </div>
              <button onClick={()=>setModalePhoto(null)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: txt.subtle }}><X size={15}/></button>
            </div>
            <div className="px-5 py-4 flex flex-col items-center gap-4">
              {modalePhoto.photo_url
                ? <img src={modalePhoto.photo_url} alt={modalePhoto.nom} className="w-full max-h-[42vh] rounded-xl object-contain border-2 border-gray-200 shadow"/>
                : <div className="w-full h-44 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed"
                    style={{ borderColor: surface.border, background: surface.bg, color: txt.subtle }}>
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span className="text-[13px]">Aucune photo disponible</span>
                  </div>
              }
              <div className="text-center">
                <p className="text-[15px] font-semibold" style={{ color: txt.primary }}>{modalePhoto.nom}</p>
                <p className="text-[13px] mt-0.5" style={{ color: txt.subtle }}>{modalePhoto.specialite} · {modalePhoto.hopital}</p>
                <div className="flex justify-center mt-2"><StarRating note={modalePhoto.note}/></div>
              </div>
            </div>
            <div className="px-5 py-4 border-t" style={{borderColor: surface.border}}>
              <button onClick={()=>setModalePhoto(null)} className="w-full py-2.5 rounded-xl text-[14px] font-medium border"
                style={{ borderColor: surface.border, color: txt.muted }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[14px] font-semibold text-white"
          style={{ background: toast.type==="success" ? brand.DEFAULT : toast.type==="warn" ? "#f59e0b" : "#dc2626" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
