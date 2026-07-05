import { useState, useEffect, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  AlertCircle, Clock, CheckCircle, XCircle, MessageSquare,
  Search, Send, Edit3, X, RefreshCw, Calendar, ShieldOff, Unlock, Trash2,
} from "lucide-react";
import {
  getRequetesMedecins, repondreRequete,
  modifierReponseRequete, reactiverMedecin, purgerRequetes,
} from "../api/adminApi";
import { brand, getSurface, getText } from "../theme";

const pad = (n) => String(n).padStart(2, "0");
function parseUTC(iso) {
  if (!iso) return null;
  return new Date(/Z$|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : iso + "Z");
}
function fmtDate(d) {
  if (!d) return "—";
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function elapsed(d) {
  if (!d) return "—";
  const dm = Math.floor((Date.now() - d) / 60000);
  if (dm < 1)     return "À l'instant";
  if (dm < 60)    return `il y a ${dm} min`;
  if (dm < 1440)  return `il y a ${Math.floor(dm/60)}h`;
  if (dm < 10080) return `il y a ${Math.floor(dm/1440)}j`;
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}

const CATEGORIES_LABELS = {
  bug_technique:  "Bug technique",
  probleme_acces: "Problème d'accès",
  erreur_ia:      "Erreur IA",
  lenteur:        "Lenteur",
  interface:      "Interface",
};
const CAT_COLORS = {
  bug_technique:  "#dc2626",
  probleme_acces: "#d97706",
  erreur_ia:      "#7c3aed",
  lenteur:        "#0891b2",
  interface:      "#0ea5e9",
};
const STATUT_CONFIG = {
  en_attente: { label: "En attente", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", left: "#f97316", Icon: Clock },
  en_cours:   { label: "En cours",   color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", left: "#3b82f6", Icon: MessageSquare },
  resolu:     { label: "Résolu",     color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", left: "#10b981", Icon: CheckCircle },
  ferme:      { label: "Fermé",      color: "#374151", bg: "#f3f4f6", border: "#e5e7eb", left: "#9ca3af", Icon: XCircle },
};
const ACTIONS_PREDEFINIES = [
  { value: "", label: "— Choisir une action —" },
  { value: "Redémarrer l'application",               label: "Redémarrer l'application" },
  { value: "Vider le cache navigateur",              label: "Vider le cache navigateur" },
  { value: "Mettre à jour le navigateur",            label: "Mettre à jour le navigateur" },
  { value: "Réinitialiser le mot de passe",          label: "Réinitialiser le mot de passe" },
  { value: "Contacter le support technique",         label: "Contacter le support technique" },
  { value: "Problème en cours de résolution",        label: "Problème en cours de résolution" },
  { value: "Vérifier la connexion internet",         label: "Vérifier la connexion internet" },
  { value: "Fonctionnalité temporairement indisponible", label: "Fonctionnalité temporairement indisponible" },
  { value: "personnalisee",                          label: "✏️ Écrire une réponse personnalisée…" },
];
const ONGLETS = [
  { key: "en_attente", label: "En attente"  },
  { key: "en_cours",   label: "En cours"    },
  { key: "resolu",     label: "Résolues"    },
  { key: "ferme",      label: "Fermées"     },
  { key: "toutes",     label: "Toutes"      },
];

function Modal({ onClose, title, subtitle, children, footer, dark, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
          <div>
            <p className={`text-[15px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{title}</p>
            {subtitle && <p className={`text-[13px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark ? "text-[#484f58] hover:bg-[#21262d]" : "text-gray-400 hover:bg-gray-100"}`}>
            <X size={13} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className={`shrink-0 flex gap-2 px-5 py-4 border-t ${dark ? "border-[#21262d]" : "border-gray-100"}`}>{footer}</div>}
      </div>
    </div>
  );
}

function Avatar({ nom, photoUrl, size = 36, onClickPhoto }) {
  const [err, setErr] = useState(false);
  const initials = String(nom || "?").replace(/^(Dr\.?|Mme\.?|M\.?)\s*/i, "").trim().split(/\s+/).map(w => w[0] || "").slice(0, 2).join("").toUpperCase() || "?";
  const colors = ["#1D9E75","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"];
  let h = 0; for (let i = 0; i < nom?.length; i++) h = nom.charCodeAt(i) + ((h << 5) - h);
  const bg = colors[Math.abs(h) % colors.length];
  if (photoUrl && !err) {
    return <img src={photoUrl} alt={nom} onError={() => setErr(true)} onClick={onClickPhoto}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, cursor: onClickPhoto ? "pointer" : "default", border: "2px solid #e5e7eb" }} />;
  }
  return (
    <div onClick={onClickPhoto} style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.33, fontWeight: 800, flexShrink: 0,
      cursor: onClickPhoto ? "pointer" : "default",
    }}>
      {initials}
    </div>
  );
}

export default function RequetesMedecins() {
  const { dark } = useOutletContext() || {};

  const [onglet,    setOnglet]    = useState("toutes");
  const [requetes,  setRequetes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [fetchError,setFetchError]= useState(null);
  const [refreshKey,setRefreshKey]= useState(0);
  const [search,    setSearch]    = useState("");
  const [expandId,  setExpandId]  = useState(null);
  const [modale,    setModale]    = useState(null);
  const [toast,     setToast]     = useState(null);
  const [actionSel, setActionSel] = useState("");
  const [reponseLib,setReponseLib]= useState("");
  const [saving,    setSaving]    = useState(false);
  const [newStatut, setNewStatut] = useState("");
  const [lastUpdate,setLastUpdate]= useState(null);
  const [photoModale,setPhotoModale] = useState(null);
  const [deblocageLoading,setDeblocageLoading] = useState(null);
  const [purgeModal,    setPurgeModal]    = useState(false);
  const [purgeJours,    setPurgeJours]    = useState(14);
  const [purging,       setPurging]       = useState(false);
  const pollingRef = useRef(null);

  const fetchRequetes = useCallback((filtre, silent = false) => {
    if (!silent) setLoading(true);
    setFetchError(null);
    return getRequetesMedecins(filtre)
      .then(data => { setRequetes(Array.isArray(data) ? data.filter(r => r.titre !== "Demande de déblocage de compte") : []); setLastUpdate(new Date()); })
      .catch(e => { setRequetes([]); setFetchError(e?.message || "Erreur lors du chargement"); })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  useEffect(() => {
    fetchRequetes("");
    pollingRef.current = setInterval(() => fetchRequetes("", true), 30000);
    return () => clearInterval(pollingRef.current);
  }, [refreshKey, fetchRequetes]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }
  function openModale(req) {
    setModale(req);
    setActionSel(req.action_admin || "");
    setReponseLib(req.reponse_admin || "");
    setNewStatut(req.statut);
  }
  const reponseFinale = actionSel === "personnalisee" ? reponseLib.trim() : (actionSel || reponseLib.trim());

  async function handleDebloquer(req) {
    setDeblocageLoading(req.id);
    try {
      await reactiverMedecin(req.medecin_id);
      await repondreRequete(req.id, {
        action_admin:  "Compte débloqué",
        reponse_admin: "Votre compte a été réactivé par l'administrateur. Vous pouvez vous reconnecter.",
        statut:        "resolu",
      });
      setRequetes(p => p.map(r => r.id === req.id
        ? { ...r, statut: "resolu", action_admin: "Compte débloqué", reponse_admin: "Votre compte a été réactivé." }
        : r
      ));
      showToast("Compte débloqué et médecin notifié ✓");
    } catch {
      showToast("Erreur lors du déblocage", "error");
    } finally {
      setDeblocageLoading(null);
    }
  }

  async function handlePurge() {
    setPurging(true);
    try {
      const res = await purgerRequetes(purgeJours);
      setRequetes(p => p.filter(r => r.statut !== "resolu" && r.statut !== "ferme"
        || !r.traite_le
        || (Date.now() - new Date(r.traite_le).getTime()) < purgeJours * 86400000
      ));
      showToast(res.message || "Historique purgé ✓");
      setPurgeModal(false);
      setRefreshKey(k => k + 1);
    } catch {
      showToast("Erreur lors de la purge", "error");
    } finally {
      setPurging(false);
    }
  }

  async function handleSend() {
    if (!reponseFinale) return;
    setSaving(true);
    try {
      const body = {
        action_admin:  actionSel === "personnalisee" ? "" : actionSel,
        reponse_admin: reponseFinale,
        statut:        newStatut || modale.statut || "en_cours",
      };
      if (modale.reponse_admin) await modifierReponseRequete(modale.id, body);
      else                       await repondreRequete(modale.id, body);
      setRequetes(p => p.map(r => r.id === modale.id ? { ...r, ...body, repondu_le: new Date().toISOString() } : r));
      showToast("Réponse envoyée au médecin");
      setModale(null);
    } catch {
      showToast("Erreur lors de l'envoi", "error");
    } finally {
      setSaving(false);
    }
  }

  const filtered = requetes.filter(r => {
    if (onglet !== "toutes" && r.statut !== onglet) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return r.titre?.toLowerCase().includes(q)
      || r.nom_medecin?.toLowerCase().includes(q)
      || r.description?.toLowerCase().includes(q);
  });

  const counts = {};
  ONGLETS.forEach(o => {
    counts[o.key] = o.key === "toutes" ? requetes.length : requetes.filter(r => r.statut === o.key).length;
  });
  const nbAttente   = counts["en_attente"] || 0;
  const nbHistorique = (counts["resolu"] || 0) + (counts["ferme"] || 0);

  const surface = getSurface(dark);
  const txt     = getText(dark);
  const inp = `w-full text-[14px] px-3 py-2.5 rounded-xl border outline-none transition-colors ${dark ? "bg-[#0d1117] border-[#21262d] text-white placeholder-[#484f58]" : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* ─── En-tête ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
            Requêtes Médecins
          </h1>
          <p className={`text-[14px] mt-1 font-semibold ${nbAttente > 0 ? "text-orange-500" : dark ? "text-[#8b949e]" : "text-gray-400"}`}>
            {nbAttente > 0
              ? `${nbAttente} requête${nbAttente > 1 ? "s" : ""} en attente`
              : "Toutes les requêtes ont été traitées ✓"
            }
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {nbHistorique > 0 && (
            <button
              onClick={() => setPurgeModal(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] font-medium transition-colors ${dark ? "border-[#30363d] text-[#8b949e] hover:bg-red-900/20 hover:text-red-400 hover:border-red-800/40" : "border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200"}`}
            >
              <Trash2 size={13} />
              Purger l'historique
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${dark ? "bg-[#21262d] text-[#8b949e]" : "bg-gray-100 text-gray-500"}`}>
                {nbHistorique}
              </span>
            </button>
          )}
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] font-medium transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            {lastUpdate ? `Mis à jour ${elapsed(lastUpdate)}` : "Actualiser"}
          </button>
        </div>
      </div>

      {/* ─── Onglets filtre ─── */}
      <div className={`flex border-b ${dark ? "border-[#21262d]" : "border-gray-200"}`}>
        {ONGLETS.map(o => {
          const active = onglet === o.key;
          const count  = counts[o.key] || 0;
          const isAttn = o.key === "en_attente" && count > 0;
          return (
            <button
              key={o.key}
              onClick={() => { setOnglet(o.key); setExpandId(null); }}
              className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? `border-[#009e82] ${dark ? "text-white" : "text-gray-800"}`
                  : `border-transparent ${dark ? "text-[#8b949e] hover:text-white" : "text-gray-400 hover:text-gray-700"}`
              }`}
            >
              {o.label}
              {count > 0 && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  active
                    ? dark ? "bg-white/10 text-white" : "bg-[#009e82]/10 text-[#009e82]"
                    : isAttn
                      ? "bg-orange-100 text-orange-600"
                      : dark ? "bg-[#21262d] text-[#8b949e]" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Recherche ─── */}
      <div className={`flex items-center gap-2 h-9 px-3 rounded-xl border max-w-sm ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-200"}`}>
        <Search size={13} style={{ color: txt.subtle, flexShrink: 0 }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Médecin, titre ou description…"
          className="flex-1 bg-transparent border-none outline-none text-[14px]"
          style={{ color: dark ? "#e6edf3" : "#1f2937" }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ color: txt.subtle, display: "flex" }}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* ─── Erreur ─── */}
      {fetchError && (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl border ${dark ? "bg-red-900/20 border-red-700/40 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] font-bold">Impossible de charger les requêtes</p>
            <p className="text-[13px] mt-0.5 opacity-80">{fetchError}</p>
            <button onClick={() => setRefreshKey(k => k + 1)} className="mt-2 text-[13px] font-semibold underline underline-offset-2">
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* ─── Liste ─── */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className={`flex flex-col items-center justify-center py-16 rounded-2xl border ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100"}`}>
            <RefreshCw size={22} className={`mb-3 animate-spin ${dark ? "text-[#484f58]" : "text-gray-300"}`} />
            <p className={`text-[14px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>Chargement…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-16 rounded-2xl border ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100"}`}>
            <AlertCircle size={28} className={`mb-3 ${dark ? "text-[#484f58]" : "text-gray-300"}`} />
            <p className={`text-[14px] font-medium ${dark ? "text-[#484f58]" : "text-gray-400"}`}>
              {search ? "Aucune requête trouvée" : "Aucune requête dans cette catégorie"}
            </p>
          </div>
        ) : (
          filtered.map(req => {
            const cfg       = STATUT_CONFIG[req.statut] || STATUT_CONFIG.en_attente;
            const StatusIcon= cfg.Icon;
            const catColor  = req.action_admin === "deblocage" ? "#dc2626" : (CAT_COLORS[req.categorie] || "#6b7280");
            const catLabel  = req.action_admin === "deblocage" ? "Déblocage sécurité" : CATEGORIES_LABELS[req.categorie];
            const createdAt = parseUTC(req.created_at);
            const reponduLe = parseUTC(req.repondu_le);
            const isExpanded = expandId === req.id;
            const isDeblocage = req.action_admin === "deblocage";

            return (
              <div
                key={req.id}
                className={`rounded-2xl border overflow-hidden transition-shadow hover:shadow-md ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}
              >
                {/* Bande colorée statut à gauche */}
                <div className="flex">
                  <div style={{ width: 4, background: isDeblocage && req.statut !== "resolu" ? "#dc2626" : cfg.left, flexShrink: 0 }} />

                  <div className="flex-1 px-5 py-4">
                    {/* Ligne 1 : avatar + nom + badges + date */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar
                          nom={req.nom_medecin}
                          photoUrl={req.photo_url}
                          size={38}
                          onClickPhoto={req.photo_url ? () => setPhotoModale(req) : undefined}
                        />
                        <div className="flex-1 min-w-0">
                          {/* Nom + statut */}
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className={`text-[14px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>
                              {req.nom_medecin}
                            </span>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 3,
                              padding: "1px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                              background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`,
                            }}>
                              <StatusIcon size={9} /> {cfg.label}
                            </span>
                            {(isDeblocage || catLabel) && (
                              <span style={{
                                display: "inline-block", padding: "1px 8px", borderRadius: 99,
                                fontSize: 11, fontWeight: 700,
                                background: `${catColor}18`, color: catColor, border: `0.5px solid ${catColor}40`,
                              }}>
                                {isDeblocage && <ShieldOff size={9} style={{ display: "inline", marginRight: 3 }} />}
                                {catLabel}
                              </span>
                            )}
                          </div>

                          {/* Email */}
                          {req.email_medecin && (
                            <p className={`text-[12px] mb-1 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>
                              {req.email_medecin}
                            </p>
                          )}

                          {/* Titre */}
                          <p className={`text-[15px] font-bold mb-1 ${dark ? "text-white" : "text-gray-900"}`}>
                            {req.titre}
                          </p>

                          {/* Description (toujours visible, 2 lignes) */}
                          <p className={`text-[13px] leading-relaxed line-clamp-2 mb-2 ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>
                            {req.description}
                          </p>

                          {/* Dates + actions expand */}
                          <div className="flex items-center gap-3 flex-wrap">
                            {createdAt && (
                              <span className={`flex items-center gap-1 text-[11px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>
                                <Calendar size={10} />
                                {fmtDate(createdAt)} · {elapsed(createdAt)}
                              </span>
                            )}
                            {reponduLe && (
                              <span className={`flex items-center gap-1 text-[11px] ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>
                                <CheckCircle size={10} className="text-emerald-500" />
                                Répondu {elapsed(reponduLe)}
                              </span>
                            )}
                            {req.description && req.description.length > 120 && (
                              <button
                                onClick={() => setExpandId(isExpanded ? null : req.id)}
                                className={`text-[11px] font-semibold underline underline-offset-2 ${dark ? "text-[#8b949e]" : "text-gray-400"}`}
                              >
                                {isExpanded ? "Réduire" : "Voir plus"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bouton action */}
                      <div className="shrink-0 flex flex-col items-end gap-2 mt-1">
                        {isDeblocage && req.statut !== "resolu" && req.statut !== "ferme" ? (
                          <button
                            onClick={() => handleDebloquer(req)}
                            disabled={deblocageLoading === req.id}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-white disabled:opacity-60 transition-colors"
                            style={{ background: "#dc2626" }}
                          >
                            {deblocageLoading === req.id
                              ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              : <Unlock size={12} />
                            }
                            Débloquer
                          </button>
                        ) : (
                          <button
                            onClick={() => openModale(req)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-90"
                            style={{ background: brand.DEFAULT }}
                          >
                            {req.reponse_admin
                              ? <><Edit3 size={12} /> Modifier</>
                              : <><Send size={12} /> Répondre</>
                            }
                          </button>
                        )}
                        <span className={`text-[11px] font-mono ${dark ? "text-[#484f58]" : "text-gray-300"}`}>
                          {String(req.id).slice(0, 12)}
                        </span>
                      </div>
                    </div>

                    {/* Réponse admin (si expandé ou réponse courte) */}
                    {req.reponse_admin && isExpanded && (
                      <div className={`mt-3 px-4 py-3 rounded-xl border-l-2 ${dark ? "bg-[#0d1117] border-teal-700" : "bg-blue-50 border-blue-400"}`}>
                        <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${dark ? "text-blue-400" : "text-blue-600"}`}>
                          Réponse administrateur
                          {req.action_admin && req.action_admin !== "deblocage" ? ` · ${req.action_admin}` : ""}
                        </p>
                        <p className={`text-[13px] leading-relaxed ${dark ? "text-[#8b949e]" : "text-gray-700"}`}>
                          {req.reponse_admin}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Modale réponse ─── */}
      {modale && (
        <Modal dark={dark} wide
          onClose={() => setModale(null)}
          title={modale.reponse_admin ? "Modifier la réponse" : "Répondre à la requête"}
          subtitle={`${modale.nom_medecin} · ${modale.titre}`}
          footer={<>
            <button onClick={() => setModale(null)}
              className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark ? "border-[#21262d] text-[#8b949e]" : "border-gray-200 text-gray-500"}`}>
              Annuler
            </button>
            <button onClick={handleSend} disabled={!reponseFinale || saving}
              className="flex-1 py-2 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2"
              style={{ background: (reponseFinale && !saving) ? brand.DEFAULT : "#d1d5db", cursor: (reponseFinale && !saving) ? "pointer" : "not-allowed" }}>
              <Send size={12} /> {modale.reponse_admin ? "Mettre à jour" : "Envoyer"}
            </button>
          </>}>
          <div className="flex flex-col gap-4">
            <div className={`px-4 py-3 rounded-xl border ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
              <p className={`text-[14px] font-bold mb-1 ${dark ? "text-white" : "text-gray-800"}`}>{modale.titre}</p>
              <p className={`text-[13px] leading-relaxed ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>{modale.description}</p>
            </div>
            <div>
              <label className={`block text-[13px] font-bold mb-1.5 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>Action à effectuer</label>
              <select value={actionSel} onChange={e => { setActionSel(e.target.value); if (e.target.value !== "personnalisee") setReponseLib(""); }}
                className={`${inp} cursor-pointer`}>
                {ACTIONS_PREDEFINIES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            {(actionSel === "personnalisee" || (!actionSel && !modale.reponse_admin)) && (
              <div>
                <label className={`block text-[13px] font-bold mb-1.5 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>
                  Réponse personnalisée <span className="text-red-500">*</span>
                </label>
                <textarea value={reponseLib} onChange={e => setReponseLib(e.target.value)} rows={5}
                  placeholder="Rédigez une réponse claire et complète…"
                  className={`${inp} resize-none`} />
              </div>
            )}
            <div>
              <label className={`block text-[13px] font-bold mb-1.5 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>Changer le statut</label>
              <select value={newStatut} onChange={e => setNewStatut(e.target.value)} className={`${inp} cursor-pointer`}>
                <option value="en_attente">En attente</option>
                <option value="en_cours">En cours</option>
                <option value="resolu">Résolu</option>
                <option value="ferme">Fermé</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Modale photo ─── */}
      {photoModale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setPhotoModale(null)}>
          <div className={`relative rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full ${dark ? "bg-[#161b22]" : "bg-white"}`}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setPhotoModale(null)}
              className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full ${dark ? "bg-[#21262d] text-[#8b949e]" : "bg-black/20 text-white"}`}>
              <X size={14} />
            </button>
            {photoModale.photo_url
              ? <img src={photoModale.photo_url} alt={photoModale.nom_medecin} className="w-full max-h-[70vh] object-contain" />
              : <div className={`flex items-center justify-center h-48 ${dark ? "text-[#484f58]" : "text-gray-300"}`}>
                  <p className="text-[13px]">Aucune photo</p>
                </div>
            }
            <div className={`px-4 py-3 border-t ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
              <p className={`text-[14px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{photoModale.nom_medecin}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modale purge ─── */}
      {purgeModal && (
        <Modal dark={dark}
          onClose={() => setPurgeModal(false)}
          title="Purger l'historique"
          subtitle="Suppression définitive des requêtes traitées"
          footer={<>
            <button onClick={() => setPurgeModal(false)}
              className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border ${dark ? "border-[#21262d] text-[#8b949e]" : "border-gray-200 text-gray-500"}`}>
              Annuler
            </button>
            <button onClick={handlePurge} disabled={purging}
              className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-[14px] font-bold flex items-center justify-center gap-2">
              <Trash2 size={13} /> {purging ? "Purge en cours…" : "Purger"}
            </button>
          </>}>
          <div className="flex flex-col gap-4">
            <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-[14px] ${dark ? "bg-red-900/20 border-red-800/40 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>
                Cette action supprime <strong>définitivement</strong> toutes les requêtes résolues et fermées
                dont la date de traitement est antérieure à la période choisie.
              </span>
            </div>

            <div>
              <label className={`block text-[13px] font-bold mb-2 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>
                Supprimer les requêtes traitées il y a plus de :
              </label>
              <div className="flex gap-2">
                {[14, 30, 60, 90].map(j => (
                  <button key={j} onClick={() => setPurgeJours(j)}
                    className={`flex-1 py-2 rounded-xl text-[13px] font-bold border transition-colors ${
                      purgeJours === j
                        ? "bg-red-600 text-white border-red-600"
                        : dark ? "border-[#30363d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}>
                    {j} jours
                  </button>
                ))}
              </div>
            </div>

            <div className={`px-4 py-3 rounded-xl border text-[13px] ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
              <div className={`flex justify-between py-1 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>
                <span>Résolues</span><strong>{counts["resolu"] || 0}</strong>
              </div>
              <div className={`flex justify-between py-1 border-t ${dark ? "border-[#21262d] text-[#8b949e]" : "border-gray-100 text-gray-600"}`}>
                <span>Fermées</span><strong>{counts["ferme"] || 0}</strong>
              </div>
              <div className={`flex justify-between py-1 border-t font-bold ${dark ? "border-[#21262d] text-white" : "border-gray-200 text-gray-800"}`}>
                <span>Total concerné</span><span>{nbHistorique}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Toast ─── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[14px] font-semibold text-white ${toast.type === "success" ? "bg-[#009e82]" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
