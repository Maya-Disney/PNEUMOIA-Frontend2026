import { useState, useEffect } from "react";
import {
  AlertCircle, Clock, CheckCircle, XCircle, MessageSquare,
  Plus, X, Send, ChevronDown, ChevronUp, Calendar,
} from "lucide-react";
import { soumettreRequete, mesRequetes } from "../services/api";

const pad = (n) => String(n).padStart(2, "0");
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

const CATEGORIE_OPTIONS = [
  { value: "bug_technique",   label: "Bug technique"       },
  { value: "probleme_acces",  label: "Problème d'accès"    },
  { value: "erreur_ia",       label: "Erreur IA"           },
  { value: "lenteur",         label: "Lenteur de la plateforme" },
  { value: "interface",       label: "Problème d'interface" },
  { value: "autre",           label: "Autre"               },
];

const CAT_COLORS = {
  bug_technique:  { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  probleme_acces: { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
  erreur_ia:      { bg: "#ede9fe", color: "#7c3aed", border: "#c4b5fd" },
  lenteur:        { bg: "#e0f2fe", color: "#0891b2", border: "#7dd3fc" },
  interface:      { bg: "#e0f9ff", color: "#0ea5e9", border: "#7dd3fc" },
  autre:          { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
};

const STATUT_CONFIG = {
  en_attente: { label: "En attente",   color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", icon: Clock },
  en_cours:   { label: "En cours",     color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", icon: MessageSquare },
  resolu:     { label: "Résolu",       color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", icon: CheckCircle },
  ferme:      { label: "Fermé",        color: "#374151", bg: "#f3f4f6", border: "#e5e7eb", icon: XCircle },
};

function BadgeCat({ cat }) {
  const c = CAT_COLORS[cat] || CAT_COLORS.autre;
  const label = CATEGORIE_OPTIONS.find(o => o.value === cat)?.label || cat;
  return (
    <span style={{
      display: "inline-block", padding: "1px 8px", borderRadius: 99,
      fontSize: 12, fontWeight: 700,
      background: c.bg, color: c.color, border: `0.5px solid ${c.border}`,
    }}>
      {label}
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

export default function Requetes() {
  const [requetes, setRequetes]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [expand,   setExpand]     = useState({});
  const [modale,   setModale]     = useState(false);
  const [toast,    setToast]      = useState(null);
  const [saving,   setSaving]     = useState(false);

  const [titre,       setTitre]       = useState("");
  const [categorie,   setCategorie]   = useState("bug_technique");
  const [description, setDescription] = useState("");

  useEffect(() => {
    mesRequetes()
      .then(data => setRequetes(Array.isArray(data) ? data : []))
      .catch(() => setRequetes([]))
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function resetForm() {
    setTitre("");
    setCategorie("bug_technique");
    setDescription("");
  }

  async function handleSubmit() {
    if (!titre.trim() || !description.trim()) return;
    setSaving(true);
    try {
      const data = await soumettreRequete({ titre: titre.trim(), categorie, description: description.trim() });
      setRequetes(p => [{
        id:           data.id,
        titre:        titre.trim(),
        categorie,
        description:  description.trim(),
        statut:       "en_attente",
        action_admin: null,
        reponse_admin: null,
        repondu_le:   null,
        created_at:   new Date().toISOString(),
      }, ...p]);
      showToast("Requête soumise à l'administrateur.");
      setModale(false);
      resetForm();
    } catch (e) {
      showToast(e.message || "Erreur lors de l'envoi", "error");
    } finally {
      setSaving(false);
    }
  }

  const nbAttente = requetes.filter(r => r.statut === "en_attente").length;
  const nbRepondus = requetes.filter(r => r.reponse_admin).length;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Mes requêtes
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">
            {requetes.length === 0
              ? "Signalez un problème ou une anomalie à l'administrateur."
              : nbAttente > 0
                ? `${nbAttente} requête${nbAttente > 1 ? "s" : ""} en attente · ${nbRepondus} réponse${nbRepondus > 1 ? "s" : ""}`
                : "Toutes vos requêtes ont reçu une réponse ✓"
            }
          </p>
        </div>
        <button
          onClick={() => { setModale(true); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-bold text-white shrink-0"
          style={{ background: "#009e82" }}>
          <Plus size={15} /> Nouvelle requête
        </button>
      </div>

      {/* Liste */}
      {loading
        ? <div className="text-center py-16 text-gray-400">Chargement…</div>
        : requetes.length === 0
          ? (
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-6 py-16 text-center">
              <AlertCircle size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-[15px] font-semibold text-gray-600 mb-1">Aucune requête soumise</p>
              <p className="text-[13px] text-gray-400 mb-5">
                Vous pouvez signaler un bug, une lenteur ou un problème d'accès à l'équipe technique.
              </p>
              <button
                onClick={() => { setModale(true); resetForm(); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold text-white"
                style={{ background: "#009e82" }}>
                <Plus size={14} /> Soumettre ma première requête
              </button>
            </div>
          )
          : (
            <div className="flex flex-col gap-3">
              {requetes.map(req => {
                const isOpen = expand[req.id];
                const createdAt = req.created_at ? new Date(req.created_at) : null;
                const reponduLe = req.repondu_le ? new Date(req.repondu_le) : null;
                return (
                  <div key={req.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <BadgeStatut statut={req.statut} />
                          <BadgeCat cat={req.categorie} />
                        </div>
                        <p className="text-[15px] font-bold text-gray-900 mb-0.5">{req.titre}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          {createdAt && (
                            <span className="flex items-center gap-1 text-[12px] text-gray-400">
                              <Calendar size={10} /> {elapsed(createdAt)} · {fmtDate(createdAt)}
                            </span>
                          )}
                          {reponduLe && (
                            <span className="flex items-center gap-1 text-[12px] text-green-600">
                              <CheckCircle size={10} /> Réponse reçue {elapsed(reponduLe)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setExpand(p => ({ ...p, [req.id]: !p[req.id] }))}
                        className="flex items-center gap-1 text-[12px] text-gray-400 shrink-0">
                        {isOpen ? <><ChevronUp size={14} /> Réduire</> : <><ChevronDown size={14} /> Voir</>}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Description</p>
                          <p className="text-[14px] leading-relaxed text-gray-700">{req.description}</p>
                        </div>

                        {req.reponse_admin ? (
                          <div className="px-4 py-3 rounded-xl border-l-2 bg-blue-50 border-blue-500">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1.5">
                              Réponse de l'administrateur
                              {req.action_admin && ` · ${req.action_admin}`}
                            </p>
                            <p className="text-[14px] leading-relaxed text-gray-700">{req.reponse_admin}</p>
                          </div>
                        ) : (
                          <div className="px-4 py-3 rounded-xl bg-orange-50 border border-orange-100">
                            <p className="text-[13px] text-orange-700">
                              <Clock size={12} className="inline mr-1.5" />
                              En attente de réponse de l'administrateur…
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
      }

      {/* Modale nouvelle requête */}
      {modale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e => e.target === e.currentTarget && setModale(false)}>
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-[15px] font-bold text-gray-800">Nouvelle requête</p>
                <p className="text-[13px] text-gray-400 mt-0.5">Signalez un problème à l'équipe technique</p>
              </div>
              <button onClick={() => setModale(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
                <X size={13} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-1.5">
                  Catégorie
                </label>
                <select value={categorie} onChange={e => setCategorie(e.target.value)}
                  className="w-full text-[14px] px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 outline-none cursor-pointer">
                  {CATEGORIE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-1.5">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input value={titre} onChange={e => setTitre(e.target.value)}
                  placeholder="Résumez le problème en quelques mots…"
                  className="w-full text-[14px] px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 outline-none" />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-600 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
                  placeholder="Décrivez le problème en détail : quand cela se produit, quelle page, quel message d'erreur…"
                  className="w-full text-[14px] px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 outline-none resize-none" />
              </div>

              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-[13px] text-blue-700">
                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                <span>
                  Votre requête sera transmise à l'administrateur. Vous recevrez une notification dès qu'une réponse est disponible.
                </span>
              </div>
            </div>

            <div className="shrink-0 flex gap-2 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setModale(false)}
                className="flex-1 py-2 rounded-xl text-[14px] font-semibold border border-gray-200 text-gray-500">
                Annuler
              </button>
              <button onClick={handleSubmit}
                disabled={!titre.trim() || !description.trim() || saving}
                className="flex-1 py-2 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: (titre.trim() && description.trim() && !saving) ? "#009e82" : "#d1d5db",
                  cursor: (titre.trim() && description.trim() && !saving) ? "pointer" : "not-allowed",
                }}>
                <Send size={12} /> {saving ? "Envoi…" : "Soumettre"}
              </button>
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
