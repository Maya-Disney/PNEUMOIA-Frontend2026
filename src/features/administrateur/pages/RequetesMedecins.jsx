import { useState, useEffect, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  AlertCircle, Clock, CheckCircle, XCircle, MessageSquare,
  ChevronDown, ChevronUp, Search, Send, Edit3, X, RefreshCw,
  Calendar,
} from "lucide-react";
import {
  getRequetesMedecins, repondreRequete,
  modifierReponseRequete,
} from "../api/adminApi";
import { brand, getSurface, getText } from "../theme";

const pad = (n) => String(n).padStart(2, "0");
function parseUTC(iso) {
  if (!iso) return null;
  // Le serveur retourne UTC sans 'Z' — on l'ajoute pour éviter le décalage horaire local
  return new Date(/Z$|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : iso + "Z");
}
function fmtDate(d) {
  if (!d) return "—";
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function elapsed(d) {
  if (!d) return "—";
  const dm = Math.floor((Date.now() - d) / 60000);
  if (dm < 1)    return "À l'instant";
  if (dm < 60)   return `Il y a ${dm} min`;
  if (dm < 1440) return `Il y a ${Math.floor(dm/60)}h`;
  if (dm < 10080) return `Il y a ${Math.floor(dm/1440)}j`;
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}

const CATEGORIES_LABELS = {
  bug_technique: "Bug technique",
  probleme_acces: "Problème d'accès",
  erreur_ia: "Erreur IA",
  lenteur: "Lenteur",
  interface: "Interface",
  autre: "Autre",
};

const CAT_COLORS = {
  bug_technique:  "#dc2626",
  probleme_acces: "#d97706",
  erreur_ia:      "#7c3aed",
  lenteur:        "#0891b2",
  interface:      "#0ea5e9",
  autre:          "#6b7280",
};

const STATUT_CONFIG = {
  en_attente: { label: "En attente",   color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", icon: Clock },
  en_cours:   { label: "En cours",     color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", icon: MessageSquare },
  resolu:     { label: "Résolu",       color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", icon: CheckCircle },
  ferme:      { label: "Fermé",        color: "#374151", bg: "#f3f4f6", border: "#e5e7eb", icon: XCircle },
};

const ACTIONS_PREDEFINIES = [
  { value: "", label: "— Choisir une action —" },
  { value: "Redémarrer l'application", label: "Redémarrer l'application" },
  { value: "Vider le cache navigateur", label: "Vider le cache navigateur" },
  { value: "Mettre à jour le navigateur", label: "Mettre à jour le navigateur" },
  { value: "Réinitialiser le mot de passe", label: "Réinitialiser le mot de passe" },
  { value: "Contacter le support technique", label: "Contacter le support technique" },
  { value: "Problème en cours de résolution", label: "Problème en cours de résolution" },
  { value: "Vérifier la connexion internet", label: "Vérifier la connexion internet" },
  { value: "Fonctionnalité temporairement indisponible", label: "Fonctionnalité temporairement indisponible" },
  { value: "personnalisee", label: "✏️ Écrire une réponse personnalisée…" },
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

function BadgeCat({ cat }) {
  const color = CAT_COLORS[cat] || "#6b7280";
  return (
    <span style={{
      display: "inline-block", padding: "1px 8px", borderRadius: 99,
      fontSize: 12, fontWeight: 700,
      background: `${color}18`, color, border: `0.5px solid ${color}40`,
    }}>
      {CATEGORIES_LABELS[cat] || cat}
    </span>
  );
}

function BadgeStatut({ statut }) {
  const cfg = STATUT_CONFIG[statut] || STATUT_CONFIG.en_attente;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`,
    }}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

const ONGLETS = [
  { key: "en_attente", label: "En attente",  color: "orange" },
  { key: "en_cours",   label: "En cours",    color: "blue"   },
  { key: "resolu",     label: "Résolues",    color: "green"  },
  { key: "ferme",      label: "Fermées",     color: "gray"   },
  { key: "toutes",     label: "Toutes",      color: "teal"   },
];

export default function RequetesMedecins() {
  const { dark } = useOutletContext() || {};

  const [onglet,    setOnglet]    = useState("toutes");
  const [requetes,  setRequetes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search,    setSearch]    = useState("");
  const [expand,    setExpand]    = useState({});
  const [modale,    setModale]    = useState(null);
  const [toast,     setToast]     = useState(null);

  const [actionSel, setActionSel]    = useState("");
  const [reponseLib, setReponseLib]  = useState("");
  const [saving,    setSaving]       = useState(false);
  const [newStatut, setNewStatut]    = useState("");
  const [lastUpdate, setLastUpdate]  = useState(null);
  const [photoModale, setPhotoModale] = useState(null);
  const pollingRef = useRef(null);

  const fetchRequetes = useCallback((filtre, silent = false) => {
    if (!silent) setLoading(true);
    setFetchError(null);
    return getRequetesMedecins(filtre)
      .then(data => {
        setRequetes(Array.isArray(data) ? data : []);
        setLastUpdate(new Date());
      })
      .catch(e => { setRequetes([]); setFetchError(e?.message || "Erreur lors du chargement"); })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  useEffect(() => {
    const filtre = onglet === "toutes" ? "" : onglet;
    fetchRequetes(filtre);

    // Rafraîchissement automatique toutes les 30 secondes
    pollingRef.current = setInterval(() => fetchRequetes(filtre, true), 30000);
    return () => clearInterval(pollingRef.current);
  }, [onglet, refreshKey, fetchRequetes]);

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

  const reponseFinale = actionSel === "personnalisee"
    ? reponseLib.trim()
    : (actionSel || reponseLib.trim());

  async function handleSend() {
    if (!reponseFinale) return;
    setSaving(true);
    try {
      const hasExistingResponse = Boolean(modale.reponse_admin);
      const body = {
        action_admin:  actionSel === "personnalisee" ? "" : actionSel,
        reponse_admin: reponseFinale,
        statut:        newStatut || modale.statut || "en_cours",
      };
      if (hasExistingResponse) {
        await modifierReponseRequete(modale.id, body);
      } else {
        await repondreRequete(modale.id, body);
      }
      setRequetes(p => p.map(r => r.id === modale.id
        ? { ...r, ...body, repondu_le: new Date().toISOString() }
        : r
      ));
      showToast("Réponse envoyée au médecin");
      setModale(null);
    } catch {
      showToast("Erreur lors de l'envoi", "error");
    } finally {
      setSaving(false);
    }
  }

  const filtered = requetes.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.titre?.toLowerCase().includes(q)
      || r.nom_medecin?.toLowerCase().includes(q)
      || r.description?.toLowerCase().includes(q);
  });

  const counts = {};
  ONGLETS.forEach(o => {
    counts[o.key] = o.key === "toutes"
      ? requetes.length
      : requetes.filter(r => r.statut === o.key).length;
  });
  const nbAttente = requetes.filter(r => r.statut === "en_attente").length;

  const card = `rounded-2xl border ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`;
  const tx1  = dark ? "text-white" : "text-gray-900";
  const tx2  = dark ? "text-[#8b949e]" : "text-gray-500";
  const tx3  = dark ? "text-[#484f58]" : "text-gray-400";
  const inp  = `w-full text-[14px] px-3 py-2.5 rounded-xl border outline-none transition-colors ${dark ? "bg-[#0d1117] border-[#21262d] text-white placeholder-[#484f58]" : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${tx1}`}>Requêtes Médecins</h1>
          <p className={`text-[14px] mt-1 ${tx2}`}>
            {nbAttente > 0
              ? <span className="text-orange-500 font-bold">{nbAttente} requête{nbAttente > 1 ? "s" : ""} en attente</span>
              : "Toutes les requêtes ont été traitées ✓"
            }
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            title="Actualiser"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-colors text-[12px] font-medium ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">
              {lastUpdate ? `Mis à jour ${elapsed(lastUpdate)}` : "Actualiser"}
            </span>
          </button>
          <div className={`flex gap-1 p-1 rounded-xl border overflow-x-auto ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-100 border-gray-200"}`}>
            {ONGLETS.map(o => (
              <button key={o.key} onClick={() => setOnglet(o.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap shrink-0"
                style={onglet === o.key
                  ? { background: brand.DEFAULT, color: "#fff" }
                  : { color: dark ? "#484f58" : "#9ca3af" }}>
                {o.label}
                {(onglet === o.key || o.key === "en_attente" || o.key === "toutes") && (
                  <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${onglet === o.key ? "bg-white/20 text-white" : dark ? "bg-[#21262d] text-[#484f58]" : "bg-gray-200 text-gray-500"}`}>
                    {counts[o.key] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className={`flex items-center gap-2 h-9 px-3 rounded-xl border max-w-sm ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-200"}`}>
        <Search size={13} className={tx3} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Médecin, titre ou description…"
          className="flex-1 bg-transparent border-none outline-none text-[14px]"
          style={{ color: dark ? "#e6edf3" : "#1f2937" }} />
      </div>

      {/* Erreur de chargement */}
      {fetchError && (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl border ${dark ? "bg-red-900/20 border-red-700/40 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] font-bold">Impossible de charger les requêtes</p>
            <p className="text-[13px] mt-0.5 opacity-80">{fetchError}</p>
            <button onClick={() => setRefreshKey(k => k + 1)}
              className="mt-2 text-[13px] font-semibold underline underline-offset-2">
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="flex flex-col gap-3">
        {loading
          ? <div className={`${card} px-5 py-12 text-center`}>
              <RefreshCw size={24} className={`mx-auto mb-3 animate-spin ${tx3}`} />
              <p className={`text-[14px] ${tx3}`}>Chargement…</p>
            </div>
          : filtered.length === 0
            ? <div className={`${card} px-5 py-12 text-center`}>
                <AlertCircle size={32} className={`mx-auto mb-3 ${tx3}`} />
                <p className={`text-[14px] ${tx3}`}>Aucune requête{search ? " trouvée" : " dans cette catégorie"}</p>
              </div>
            : filtered.map(req => {
                const isOpen = expand[req.id];
                const createdAt = parseUTC(req.created_at);
                const reponduLe = parseUTC(req.repondu_le);
                return (
                  <div key={req.id} className={`${card} p-5`}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <BadgeStatut statut={req.statut} />
                          <BadgeCat cat={req.categorie} />
                          <span className={`text-[12px] font-mono ${tx3}`}>{req.id}</span>
                        </div>

                        <p className={`text-[15px] font-bold mb-0.5 ${tx1}`}>{req.titre}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {req.photo_url
                            ? <img
                                src={req.photo_url} alt=""
                                onClick={() => setPhotoModale(req)}
                                className="w-6 h-6 rounded-full object-cover shrink-0 cursor-pointer hover:ring-2 hover:ring-offset-1 transition-all"
                                style={{ "--tw-ring-color": brand.DEFAULT }}
                              />
                            : <div
                                onClick={req.photo_url ? () => setPhotoModale(req) : undefined}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${dark ? "bg-[#21262d] text-[#8b949e]" : "bg-gray-100 text-gray-500"}`}>
                                {(req.nom_medecin || "?")[0].toUpperCase()}
                              </div>
                          }
                          <p className={`text-[13px] ${tx2}`}>
                            {req.nom_medecin}
                            {req.email_medecin && <span className={`ml-2 ${tx3}`}>· {req.email_medecin}</span>}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {createdAt && (
                            <span className={`flex items-center gap-1 text-[12px] ${tx3}`}>
                              <Calendar size={10} /> Soumise {elapsed(createdAt)} · {fmtDate(createdAt)}
                            </span>
                          )}
                          {reponduLe && (
                            <span className={`flex items-center gap-1 text-[12px] ${tx3}`}>
                              <CheckCircle size={10} /> Répondu {elapsed(reponduLe)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button onClick={() => openModale(req)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold text-white"
                          style={{ background: brand.DEFAULT }}>
                          {req.reponse_admin ? <><Edit3 size={11} /> Modifier</> : <><Send size={11} /> Répondre</>}
                        </button>

                        <button onClick={() => setExpand(p => ({ ...p, [req.id]: !p[req.id] }))}
                          className={`flex items-center gap-1 text-[12px] ${tx3}`}>
                          {isOpen ? <><ChevronUp size={12} /> Réduire</> : <><ChevronDown size={12} /> Détails</>}
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-4 flex flex-col gap-3">
                        <div className={`px-4 py-3 rounded-xl border ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
                          <p className={`text-[12px] font-bold uppercase tracking-wider mb-1.5 ${tx3}`}>Description</p>
                          <p className={`text-[14px] leading-relaxed ${tx2}`}>{req.description}</p>
                        </div>

                        {req.reponse_admin && (
                          <div className={`px-4 py-3 rounded-xl border-l-2 ${dark ? "bg-[#0d1117] border-teal-700" : "bg-blue-50 border-blue-500"}`}>
                            <p className={`text-[12px] font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-blue-400" : "text-blue-700"}`}>
                              Réponse de l'administrateur
                              {req.action_admin && ` · ${req.action_admin}`}
                            </p>
                            <p className={`text-[14px] leading-relaxed ${dark ? "text-[#8b949e]" : "text-gray-700"}`}>{req.reponse_admin}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
        }
      </div>

      {/* Modale réponse */}
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
            {/* Résumé requête */}
            <div className={`px-4 py-3 rounded-xl border ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <BadgeStatut statut={modale.statut} />
                <BadgeCat cat={modale.categorie} />
              </div>
              <p className={`text-[14px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{modale.titre}</p>
              <p className={`text-[13px] mt-1 leading-relaxed ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>{modale.description}</p>
            </div>

            {/* Action prédéfinie */}
            <div>
              <label className={`block text-[13px] font-bold mb-1.5 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>
                Action à effectuer
              </label>
              <select value={actionSel} onChange={e => {
                  setActionSel(e.target.value);
                  if (e.target.value !== "personnalisee") setReponseLib("");
                }}
                className={`${inp} cursor-pointer`}>
                {ACTIONS_PREDEFINIES.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            {/* Texte libre si personnalisée ou complément */}
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

            {/* Statut */}
            <div>
              <label className={`block text-[13px] font-bold mb-1.5 ${dark ? "text-[#8b949e]" : "text-gray-600"}`}>
                Changer le statut
              </label>
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

      {/* Modal photo médecin */}
      {photoModale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setPhotoModale(null)}>
          <div
            className={`relative rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full ${dark ? "bg-[#161b22]" : "bg-white"}`}
            onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPhotoModale(null)}
              className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full ${dark ? "bg-[#21262d] text-[#8b949e]" : "bg-black/20 text-white"}`}>
              <X size={14} />
            </button>
            {photoModale.photo_url
              ? <img
                  src={photoModale.photo_url}
                  alt={photoModale.nom_medecin}
                  className="w-full max-h-[70vh] object-contain"
                />
              : <div className={`flex flex-col items-center justify-center h-48 gap-3 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black ${dark ? "bg-[#21262d] text-[#8b949e]" : "bg-gray-100 text-gray-500"}`}>
                    {(photoModale.nom_medecin || "?")[0].toUpperCase()}
                  </div>
                  <p className="text-[13px]">Aucune photo disponible</p>
                </div>
            }
            <div className={`px-4 py-3 border-t ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
              <p className={`text-[14px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{photoModale.nom_medecin}</p>
              {photoModale.email_medecin && (
                <p className={`text-[12px] mt-0.5 ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>{photoModale.email_medecin}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[14px] font-semibold text-white ${toast.type === "success" ? "bg-[#009e82]" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
