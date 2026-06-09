/**
 * MedecinsActifs.jsx — Liste des médecins validés sur la plateforme
 *
 * Logique statut :
 *   - Actif   = dernière connexion < 14 jours
 *   - Inactif = dernière connexion > 14 jours (calculé automatiquement côté frontend)
 *
 * Actions disponibles depuis ce tableau :
 *   - 👁 Voir le profil → redirige vers ProfilMedecin
 *   - Suspendre / Supprimer → disponibles uniquement dans ProfilMedecin
 *
 * Notifications email (Brevo) : envoyées depuis admin_service.py
 *   lors de la suspension ou suppression avec le motif inclus.
 */

import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { Download, Eye, X, AlertTriangle } from "lucide-react";
import { getMedecinsActifs } from "../api/adminApi";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const BRAND = "#0f766e";
const NOW   = new Date();
const sub   = (ms) => new Date(NOW.getTime() - ms);
const pad   = (n)  => String(n).padStart(2, "0");

/** Formate une date en DD/MM/YYYY */
function fmt(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }

/** Génère une couleur d'avatar déterministe à partir du nom */
function avatarColor(str) {
  const colors = ["#0f766e","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"];
  let h = 0;
  for (let i=0;i<str.length;i++) h=str.charCodeAt(i)+((h<<5)-h);
  return colors[Math.abs(h)%colors.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIQUE STATUT — Inactif si pas connecté depuis > 14 jours
// ─────────────────────────────────────────────────────────────────────────────

/** Retourne "Actif" ou "Inactif" selon la dernière activité */
function getStatut(derniereActivite) {
  if (!derniereActivite) return "Inactif";
  const diffJours = (NOW - new Date(derniereActivite)) / (1000 * 3600 * 24);
  return diffJours > 14 ? "Inactif" : "Actif";
}

/** Retourne le nombre de jours d'inactivité */
function joursInactivite(derniereActivite) {
  if (!derniereActivite) return null;
  return Math.floor((NOW - new Date(derniereActivite)) / (1000 * 3600 * 24));
}

// ─────────────────────────────────────────────────────────────────────────────
// DONNÉES MOCK — utilisées si le backend est indisponible
// ─────────────────────────────────────────────────────────────────────────────

const MOCK = [
  { id:1, initials:"JD", avatarColor:"#0f766e",
    nom:"Dr. Jean Dupont",  specialite:"Pneumologue", cnom:"CM-2019-0847",
    hopital:"H. Général Douala", ville:"Douala",
    email:"j.dupont@hgd.cm", telephone:"+237 699 123 456",
    patients:134, consultations:4821, concordanceIA:88,
    rangCommunaute:"#7/38", casPartages:"247 cas publiés",
    derniereActivite: sub(2*3600000).toISOString(),     // Actif — il y a 2h
    activiteRecente:[{texte:"Consultation #247 enregistrée",quand:"Auj. 14:22"}],
    creeLE:fmt(sub(180*24*3600000)), valideLE:fmt(sub(177*24*3600000)) },
  { id:2, initials:"DK", avatarColor:"#185FA5",
    nom:"Dr. Kamto Diane", specialite:"Pneumologue", cnom:"CM-2017-0432",
    hopital:"CHU Yaoundé", ville:"Yaoundé",
    email:"d.kamto@chu.cm", telephone:"+237 677 234 567",
    patients:198, consultations:3201, concordanceIA:92,
    rangCommunaute:"#3/38", casPartages:"312 cas publiés",
    derniereActivite: sub(30*60000).toISOString(),      // Actif — il y a 30min
    activiteRecente:[{texte:"Consultation #198 enregistrée",quand:"Auj. 09:10"}],
    creeLE:fmt(sub(90*24*3600000)), valideLE:fmt(sub(88*24*3600000)) },
  { id:3, initials:"DN", avatarColor:"#7C3AED",
    nom:"Dr. Nkoa",        specialite:"Pneumologue", cnom:"CM-2018-0521",
    hopital:"H. Général Douala", ville:"Douala",
    email:"nkoa@hgd.cm", telephone:"+237 699 345 678",
    patients:176, consultations:2847, concordanceIA:74,
    rangCommunaute:"#5/38", casPartages:"189 cas publiés",
    derniereActivite: sub(20*24*3600000).toISOString(), // Inactif — 20 jours
    activiteRecente:[],
    creeLE:fmt(sub(120*24*3600000)), valideLE:fmt(sub(118*24*3600000)) },
  { id:4, initials:"DB", avatarColor:"#D97706",
    nom:"Dr. Barry",       specialite:"Pneumologue", cnom:"CM-2020-0612",
    hopital:"H. Régional Garoua", ville:"Garoua",
    email:"barry@hrg.cm", telephone:"+237 655 456 789",
    patients:89, consultations:1234, concordanceIA:61,
    rangCommunaute:"#12/38", casPartages:"74 cas publiés",
    derniereActivite: sub(30*24*3600000).toISOString(), // Inactif — 30 jours
    activiteRecente:[],
    creeLE:fmt(sub(200*24*3600000)), valideLE:fmt(sub(197*24*3600000)) },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PAGINATION
// ─────────────────────────────────────────────────────────────────────────────

function PagBtn({ onClick, disabled, label, dark }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-lg border text-[11px] transition-colors
        ${disabled
          ?dark?"border-[#21262d] text-[#484f58] cursor-not-allowed":"border-gray-100 text-gray-300 cursor-not-allowed"
          :dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function MedecinsActifs() {
  const { dark } = useOutletContext() || {};
  const navigate = useNavigate();

  // ── États ──────────────────────────────────────────────────────────────────
  const [medecins,    setMedecins]    = useState(MOCK);
  const [loading,     setLoading]     = useState(true);
  const [filtre,      setFiltre]      = useState("Tous");      // Tous | Actif | Inactif
  const [villeFiltre, setVilleFiltre] = useState("Toutes");
  const [modalePhoto, setModalePhoto] = useState(null);        // Modal photo CNI
  const [page,        setPage]        = useState(1);
  const [perPage,     setPerPage]     = useState(10);

  // ── Chargement depuis le backend ────────────────────────────────────────────
  // Fallback automatique sur les mocks si le backend est indisponible
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
            derniereActivite: m.derniere_activite || null,  // ISO string ou null
            concordanceIA:    m.concordance_ia   || null,
            patients:         m.nb_patients      || 0,
            consultations:    m.nb_consultations || 0,
            rangCommunaute:   m.rang_communaute  || "—",
            casPartages:      m.cas_partages     || "—",
            activiteRecente:  m.activite_recente || [],
            avatarColor:      avatarColor(`${m.prenom||""}${m.nom||""}`),
          })));
        }
        // Si data vide → garde les mocks
      })
      .catch(() => {})  // Erreur réseau → garde les mocks
      .finally(() => setLoading(false));
  }, []);

  // ── Calcul statut dynamique ─────────────────────────────────────────────────
  // Le statut n'est PAS stocké en base — il est calculé à la volée
  // selon la règle : Inactif si derniereActivite > 14 jours
  const medecinsAvecStatut = medecins.map(m => ({
    ...m,
    statut:      getStatut(m.derniereActivite),
    joursInactif: joursInactivite(m.derniereActivite),
  }));

  // ── Compteurs pour les filtres ──────────────────────────────────────────────
  const nbActifs   = medecinsAvecStatut.filter(m => m.statut === "Actif").length;
  const nbInactifs = medecinsAvecStatut.filter(m => m.statut === "Inactif").length;

  // ── Villes disponibles (dynamiques depuis les données) ─────────────────────
  const villes = ["Toutes", ...new Set(medecinsAvecStatut.map(m => m.ville).filter(v => v && v !== "—"))];

  // ── Filtrage combiné statut + ville ────────────────────────────────────────
  const liste = medecinsAvecStatut.filter(m => {
    const okFiltre = filtre==="Actif"?m.statut==="Actif":filtre==="Inactif"?m.statut==="Inactif":true;
    const okVille  = villeFiltre==="Toutes" || m.ville===villeFiltre;
    return okFiltre && okVille;
  });

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(liste.length/perPage));
  const paginated  = liste.slice((page-1)*perPage, page*perPage);
  const from = liste.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, liste.length);

  // ── Export Excel ────────────────────────────────────────────────────────────
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

  // ── Classes CSS réutilisables ───────────────────────────────────────────────
  const th = `px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-b ${dark?"text-[#484f58] border-[#21262d] bg-[#0d1117]/50":"text-gray-400 border-gray-100 bg-gray-50"}`;
  const td = `px-4 py-3 border-b ${dark?"border-[#21262d]":"border-gray-50"}`;

  // ── Bouton icône (tableau actions) ──────────────────────────────────────────
  const ib = `w-7 h-7 flex items-center justify-center rounded-lg transition-colors border ${dark?"border-[#21262d] text-[#484f58] hover:text-white hover:bg-[#21262d]":"border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>
            Médecins actifs
          </h1>
          <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>
            {medecins.length} médecin{medecins.length>1?"s":""} · Inactif si pas connecté depuis plus de 14 jours
          </p>
        </div>
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e]"
          onMouseEnter={e=>{e.currentTarget.style.background=BRAND;e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor=BRAND;}}
          onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color="";e.currentTarget.style.borderColor="";}}>
          <Download size={13}/> Export Excel
        </button>
      </div>

      {/* ── Bandeau alerte inactifs ── */}
      {/* Affiché seulement si des médecins n'ont pas été vus depuis 14+ jours */}
      {nbInactifs > 0 && (
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border ${dark?"bg-amber-900/20 border-amber-700/40":"bg-amber-50 border-amber-200"}`}>
          <AlertTriangle size={15} className={dark?"text-amber-400":"text-amber-600"}/>
          <p className={`text-[12px] font-medium ${dark?"text-amber-300":"text-amber-700"}`}>
            <strong>{nbInactifs} médecin{nbInactifs>1?"s":""}</strong> inactif{nbInactifs>1?"s":""} depuis plus de 14 jours —
            consultez leur profil pour suspendre ou supprimer.
          </p>
        </div>
      )}

      {/* ── Filtres statut + ville ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Boutons statut */}
        <div className="flex gap-2">
          {[
            {k:"Tous",    l:`Tous (${medecins.length})`},
            {k:"Actif",   l:`Actifs (${nbActifs})`},
            {k:"Inactif", l:`Inactifs (${nbInactifs})`},
          ].map(f=>(
            <button key={f.k} onClick={()=>{setFiltre(f.k);setPage(1);}}
              className="px-4 py-1.5 rounded-xl text-[11px] font-bold border transition-colors"
              style={filtre===f.k
                ?{background:BRAND,borderColor:BRAND,color:"#fff"}
                :{borderColor:dark?"#21262d":"#e5e7eb",color:dark?"#484f58":"#9ca3af"}}>
              {f.l}
            </button>
          ))}
        </div>
        {/* Filtre ville */}
        <select value={villeFiltre} onChange={e=>{setVilleFiltre(e.target.value);setPage(1);}}
          className={`text-[11px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-semibold ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
          {villes.map(v=><option key={v} value={v}>{v==="Toutes"?"Toutes les villes":v}</option>)}
        </select>
      </div>

      {/* ── Tableau ── */}
      <div className={`rounded-2xl border overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{minWidth:820}}>
            <thead>
              <tr>
                <th className={th}>Médecin</th>
                <th className={th}>CNOM</th>
                <th className={th}>Établissement</th>
                <th className={th}>Ville</th>
                <th className={th}>Statut</th>
                <th className={th}>Dernière activité</th>
                <th className={th}>Validé le</th>
                {/* Colonne Actions : uniquement Voir le profil */}
                <th className={`${th} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* État chargement */}
              {loading ? (
                <tr><td colSpan={8} className={`${td} text-center py-14 text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>Chargement…</td></tr>
              ) : paginated.length===0 ? (
                <tr><td colSpan={8} className={`${td} text-center py-14 text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>Aucun médecin</td></tr>
              ) : paginated.map(m=>(
                <tr key={m.id} className={`transition-colors ${dark?"hover:bg-[#0d1117]/60":"hover:bg-gray-50/80"}`}>

                  {/* Médecin — clic nom/avatar → photo CNI */}
                  <td className={td}>
                    <div className="flex items-center gap-2.5 cursor-pointer group" onClick={()=>setModalePhoto(m)}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 group-hover:opacity-75 transition-opacity ${m.statut==="Inactif"?"opacity-50":""}`}
                        style={{background:m.avatarColor}}>
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

                  {/* Statut : dot vert animé (Actif) ou gris + jours inactif (Inactif) */}
                  <td className={td}>
                    {m.statut==="Actif"
                      ? <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"/>
                          <span className="text-[11px] font-bold text-emerald-600">Actif</span>
                        </div>
                      : <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"/>
                            <span className={`text-[11px] font-bold ${dark?"text-[#484f58]":"text-gray-400"}`}>Inactif</span>
                          </div>
                          {m.joursInactif !== null && (
                            <span className="text-[9px] text-amber-500 font-medium ml-3.5">
                              {m.joursInactif}j sans connexion
                            </span>
                          )}
                        </div>
                    }
                  </td>

                  {/* Dernière activité — affichage relatif */}
                  <td className={`${td} text-[11px] ${dark?"text-[#484f58]":"text-gray-400"}`}>
                    {m.derniereActivite
                      ? (() => {
                          const j = Math.floor((NOW - new Date(m.derniereActivite)) / (1000*3600*24));
                          if (j === 0) return "Aujourd'hui";
                          if (j === 1) return "Hier";
                          return `Il y a ${j}j`;
                        })()
                      : "—"
                    }
                  </td>

                  <td className={`${td} text-[11px] font-semibold`} style={{color:BRAND}}>{m.valideLE}</td>

                  {/* Action : uniquement Voir le profil
                      Suspendre et Supprimer sont dans ProfilMedecin */}
                  <td className={`${td} text-center`}>
                    <button
                      onClick={()=>navigate(`/administrateur/medecins/${m.id}`, {state:{medecin:m}})}
                      title="Voir le profil"
                      className={ib}>
                      <Eye size={12}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
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
                ?<span key={p} className="px-1 opacity-30">…</span>
                :<button key={p} onClick={()=>setPage(p)}
                    className="w-7 h-7 rounded-lg border text-[11px] font-medium transition-colors"
                    style={p===page?{background:BRAND,borderColor:BRAND,color:"#fff"}:{}}>{p}</button>
              )}
            <PagBtn onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} label="›" dark={dark}/>
            <PagBtn onClick={()=>setPage(totalPages)} disabled={page===totalPages} label="»" dark={dark}/>
          </div>
        </div>
      </div>

      {/* ── Modal Photo CNI ── */}
      {/* Clic sur le nom ou l'avatar → affiche la photo CNI du médecin */}
      {modalePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e=>e.target===e.currentTarget&&setModalePhoto(null)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <div>
                <p className={`text-[13px] font-semibold ${dark?"text-white":"text-gray-800"}`}>{modalePhoto.nom}</p>
                <p className={`text-[11px] mt-0.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>Photo d'identité (CNI)</p>
              </div>
              <button onClick={()=>setModalePhoto(null)} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark?"text-[#484f58] hover:bg-[#21262d]":"text-gray-400 hover:bg-gray-100"}`}><X size={13}/></button>
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
                {/* Statut affiché dans la modale photo */}
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {getStatut(modalePhoto.derniereActivite)==="Actif"
                    ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/><span className="text-[10px] font-bold text-emerald-600">Actif</span></>
                    : <><span className="w-1.5 h-1.5 rounded-full bg-gray-400"/><span className="text-[10px] font-bold text-gray-400">Inactif — {joursInactivite(modalePhoto.derniereActivite)}j</span></>
                  }
                </div>
              </div>
            </div>
            <div className={`px-5 py-4 border-t ${dark?"border-[#21262d]":"border-gray-100"}`}>
              <button onClick={()=>setModalePhoto(null)} className={`w-full py-2 rounded-xl text-[12px] font-medium border ${dark?"border-[#21262d] text-[#8b949e]":"border-gray-200 text-gray-500"}`}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}