import { useState, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Wind, PauseCircle, AlertCircle, Globe, Bell, Settings,
  Shield, Mail, Wrench, Database, AlertTriangle,
  FileText, Lock, Users, Clock,
} from "lucide-react";
import { brand, getSurface, getText } from "../theme";
import { getParametres, updateParametres } from "../api/adminApi";

// ─────────────────────────────────────────────────────────────────────────────
// VALEURS PAR DÉFAUT
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULTS = {
  // Général
  inscriptions_ouvertes:    true,
  validation_manuelle:      true,
  delai_inactivite_jours:   14,
  duree_corbeille_jours:    30,
  relance_autorisee:        true,

  // Maintenance
  mode_maintenance:         false,
  message_maintenance:      "La plateforme est temporairement indisponible pour maintenance. Merci de réessayer dans quelques minutes.",

  // Limites
  taille_max_fichier_mb:    10,
  otp_max_tentatives:       3,
  duree_session_heures:     8,

  // Notifications admin
  notif_nouvelle_demande:     true,
  notif_nouveau_commentaire:  true,
  notif_nouvelle_faq:         true,
  notif_expiration_corbeille: true,
  notif_medecin_inactif:      true,

  // Préférences
  fuseau_horaire: "Africa/Douala",
  format_date:    "DD/MM/YYYY",
  format_heure:   "24h",
  langue:         "fr",

  // Sécurité
  double_auth:   true,
  session_max:   true,
  audit_complet: true,

  // Communications email (Brevo)
  email_bienvenue:  true,
  notif_refus:      true,
  notif_suspension: true,
};

const ONGLETS = [
  { key: "general",        label: "Général",        icon: Settings  },
  { key: "securite",       label: "Sécurité",       icon: Shield    },
  { key: "notifications",  label: "Notifications",  icon: Bell      },
  { key: "communications", label: "Communications", icon: Mail      },
  { key: "preferences",    label: "Préférences",    icon: Globe     },
  { key: "publications",   label: "Publications",   icon: Wind      },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANTS UI
// ─────────────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      style={{ background: checked ? brand.DEFAULT : "#d1d5db" }}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function ToggleRow({ label, description, checked, onChange, dark, disabled, tag }) {
  return (
    <div className={`flex items-center justify-between py-4 border-b last:border-b-0 ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
      <div className="pr-6 flex-1">
        <div className="flex items-center gap-2">
          <p className={`text-[14px] font-semibold ${dark ? "text-white" : "text-gray-800"}`}>{label}</p>
          {tag && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">{tag}</span>
          )}
        </div>
        {description && <p className={`text-[13px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function SectionCard({ titre, description, icon: Icon, accent, dark, children, headerRight }) {
  const surface = getSurface(dark);
  return (
    <div className={`rounded-2xl border overflow-hidden ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}>
      <div className={`flex items-start justify-between gap-4 px-5 py-4 border-b ${dark ? "border-[#21262d]" : "border-gray-100"}`}
        style={{ borderLeft: `3px solid ${accent || brand.DEFAULT}` }}>
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${accent || brand.DEFAULT}18` }}>
              <Icon size={15} style={{ color: accent || brand.DEFAULT }} />
            </div>
          )}
          <div>
            <p className={`text-[14px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{titre}</p>
            {description && <p className={`text-[13px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{description}</p>}
          </div>
        </div>
        {headerRight}
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

function SelectRow({ label, description, value, onChange, options, dark }) {
  return (
    <div className={`flex items-center justify-between py-4 border-b last:border-b-0 ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
      <div className="pr-6">
        <p className={`text-[14px] font-semibold ${dark ? "text-white" : "text-gray-800"}`}>{label}</p>
        {description && <p className={`text-[13px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{description}</p>}
      </div>
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`text-[13px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-medium shrink-0 ${dark ? "bg-[#0d1117] border-[#21262d] text-white" : "bg-white border-gray-200 text-gray-800"}`}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function NumberRow({ label, description, value, onChange, min, max, unit, dark }) {
  return (
    <div className={`flex items-center justify-between py-4 border-b last:border-b-0 ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
      <div className="pr-6">
        <p className={`text-[14px] font-semibold ${dark ? "text-white" : "text-gray-800"}`}>{label}</p>
        {description && <p className={`text-[13px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{description}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input type="number" value={value} min={min} max={max}
          onChange={e => onChange(Number(e.target.value))}
          className={`w-20 text-[14px] px-3 py-1.5 rounded-xl border outline-none text-center font-semibold ${dark ? "bg-[#0d1117] border-[#21262d] text-white" : "bg-white border-gray-200 text-gray-800"}`} />
        <span className={`text-[13px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{unit}</span>
      </div>
    </div>
  );
}

function TextareaRow({ label, description, value, onChange, dark, placeholder }) {
  return (
    <div className={`py-4 border-b last:border-b-0 ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
      <p className={`text-[14px] font-semibold mb-1 ${dark ? "text-white" : "text-gray-800"}`}>{label}</p>
      {description && <p className={`text-[13px] mb-2 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{description}</p>}
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
        className={`w-full text-[13px] px-3 py-2.5 rounded-xl border outline-none resize-none transition-colors ${dark ? "bg-[#0d1117] border-[#21262d] text-white placeholder:text-[#484f58]" : "bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400"}`} />
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// ONGLET PUBLICATIONS (logique inchangée)
// ─────────────────────────────────────────────────────────────────────────────

function OngletPublications({ dark }) {
  const [filtre, setFiltre] = useState("Tous les cas");
  const [pubs,   setPubs]   = useState([]);

  const suspendre = id => setPubs(p => p.map(x => x.id === id ? { ...x, statut: "suspendu" } : x));
  const reactiver = id => setPubs(p => p.map(x => x.id === id ? { ...x, statut: "publie", raison: null } : x));
  const supprimer = id => setPubs(p => p.filter(x => x.id !== id));

  const filtrees = pubs.filter(p =>
    filtre === "Actifs"    ? p.statut === "publie"   :
    filtre === "Suspendus" ? p.statut === "suspendu" :
    filtre === "Signalés"  ? p.statut === "signale"  : true
  );

  return (
    <SectionCard dark={dark} icon={Wind} accent="#6366f1"
      titre="Publications — Cas cliniques communauté"
      description="Gérez les cas publiés sur la plateforme"
      headerRight={
        <select value={filtre} onChange={e => setFiltre(e.target.value)}
          className={`text-[13px] rounded-xl border px-3 py-1.5 outline-none cursor-pointer ${dark ? "bg-[#0d1117] border-[#21262d] text-white" : "bg-white border-gray-200 text-gray-800"}`}>
          {["Tous les cas", "Actifs", "Suspendus", "Signalés"].map(f => <option key={f}>{f}</option>)}
        </select>
      }>
      <div className={`flex items-start gap-2 my-4 px-4 py-3 rounded-xl text-[13px] ${dark ? "bg-blue-900/20 text-blue-300 border border-blue-800/40" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
        <AlertCircle size={13} className="shrink-0 mt-0.5" />
        Suspendez ou supprimez un cas si son contenu ne respecte pas les règles (données non anonymisées, erreur médicale grave).
      </div>
      <div className="flex flex-col gap-3 pb-4">
        {filtrees.length === 0
          ? <p className={`text-[14px] text-center py-8 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>Aucune publication dans cette catégorie</p>
          : filtrees.map(pub => {
              const isS = pub.statut === "suspendu", isR = pub.statut === "signale";
              const bg = isS ? (dark ? "bg-orange-950/20 border-orange-800/30" : "bg-orange-50 border-orange-100") : isR ? (dark ? "bg-red-950/20 border-red-800/30" : "bg-red-50 border-red-100") : (dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-200");
              return (
                <div key={pub.id} className={`rounded-xl border p-4 ${bg}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isS ? (dark ? "bg-orange-900/30" : "bg-orange-100") : isR ? (dark ? "bg-red-900/30" : "bg-red-100") : (dark ? "bg-teal-900/30" : "bg-blue-50")}`}>
                      {isS ? <PauseCircle size={20} color="#f97316" /> : isR ? <AlertCircle size={20} color="#ef4444" /> : <Wind size={20} color={brand.DEFAULT} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`text-[14px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{pub.titre}</p>
                          <p className={`text-[13px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{pub.auteur} · {pub.meta}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`text-[13px] font-bold ${isS ? "text-orange-500" : isR ? "text-red-500" : "text-blue-700"}`}>
                            {isS ? "Suspendu" : isR ? "Signalé" : "Actif"}
                          </span>
                          <div className="flex gap-1.5">
                            {pub.statut === "publie"   && <button onClick={() => suspendre(pub.id)} className="text-[12px] px-2.5 py-1 rounded-lg border border-orange-300 text-orange-600 hover:bg-orange-50 transition-colors">Suspendre</button>}
                            {pub.statut === "signale"  && <><button onClick={() => suspendre(pub.id)} className="text-[12px] px-2.5 py-1 rounded-lg border border-orange-300 text-orange-600 hover:bg-orange-50 transition-colors">Suspendre</button><button onClick={() => reactiver(pub.id)} className="text-[12px] px-2.5 py-1 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors">Ignorer</button></>}
                            {pub.statut === "suspendu" && <><button onClick={() => reactiver(pub.id)} className="text-[12px] px-2.5 py-1 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors">Réactiver</button><button onClick={() => supprimer(pub.id)} className="text-[12px] px-2.5 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors">Supprimer</button></>}
                          </div>
                        </div>
                      </div>
                      {pub.raison && <p className="text-[13px] mt-2 text-orange-500 font-medium">Raison : {pub.raison}</p>}
                    </div>
                  </div>
                </div>
              );
            })
        }
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function Parametres() {
  const { dark } = useOutletContext() || {};

  const [onglet,   setOnglet]   = useState("general");
  const [params,   setParams]   = useState(DEFAULTS);
  const [original, setOriginal] = useState(DEFAULTS);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);

  useEffect(() => {
    setLoading(true);
    getParametres()
      .then(data => {
          const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined));
          const merged = { ...DEFAULTS, ...clean };
          setParams(merged);
          setOriginal(merged);
        })
      .catch(()  => { setParams(DEFAULTS); setOriginal(DEFAULTS); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const set = useCallback((k, v) => setParams(p => ({ ...p, [k]: v })), []);

  async function handleSave() {
    setSaving(true);
    try {
      await updateParametres(params);
      setOriginal(params);
      setToast({ msg: "Paramètres sauvegardés ✓", type: "success" });
    } catch {
      setToast({ msg: "Erreur lors de la sauvegarde. Vérifiez la connexion.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  const handleReset  = () => setParams(original);
  const hasChanges   = JSON.stringify(params) !== JSON.stringify(original);

  const surface = getSurface(dark);
  const txt     = getText(dark);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
            Paramètres
          </h1>
          <p className={`text-[14px] mt-1 ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>
            Configuration globale de PneumoIA
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button onClick={handleReset}
              className={`px-4 py-2 rounded-xl border text-[14px] font-semibold transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              Annuler
            </button>
          )}
          <button onClick={handleSave} disabled={!hasChanges || saving}
            className="px-4 py-2 rounded-xl text-[14px] font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: hasChanges ? brand.DEFAULT : "#9ca3af" }}>
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* ── Barre de statut rapide ── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Inscriptions",
              value: params.inscriptions_ouvertes ? "Ouvertes" : "Fermées",
              ok: params.inscriptions_ouvertes,
              icon: Users,
            },
            {
              label: "Mode maintenance",
              value: params.mode_maintenance ? "Actif" : "Inactif",
              ok: !params.mode_maintenance,
              icon: Wrench,
              warn: params.mode_maintenance,
            },
            {
              label: "Inactivité",
              value: `${params.delai_inactivite_jours} jours`,
              ok: true,
              icon: Clock,
            },
            {
              label: "Session max",
              value: params.session_max ? `${params.duree_session_heures ?? DEFAULTS.duree_session_heures}h` : "Illimitée",
              ok: params.session_max,
              icon: Lock,
            },
          ].map(({ label, value, ok, warn, icon: Icon }) => (
            <div key={label}
              className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                warn ? "bg-orange-100" : ok ? "bg-emerald-100" : "bg-red-100"
              }`}>
                <Icon size={14} style={{ color: warn ? "#ea580c" : ok ? "#059669" : "#dc2626" }} />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{label}</p>
                <p className={`text-[13px] font-bold truncate ${
                  warn ? "text-orange-500" : ok ? (dark ? "text-emerald-400" : "text-emerald-600") : (dark ? "text-red-400" : "text-red-600")
                }`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Onglets ── */}
      <div className={`flex border-b overflow-x-auto ${dark ? "border-[#21262d]" : "border-gray-200"}`}>
        {ONGLETS.map(o => {
          const active = onglet === o.key;
          return (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className="flex items-center gap-2 px-4 py-3 text-[13px] font-semibold border-b-2 whitespace-nowrap transition-colors"
              style={active
                ? { borderBottomColor: brand.DEFAULT, color: brand.DEFAULT }
                : { borderBottomColor: "transparent", color: dark ? "#484f58" : "#9ca3af" }}>
              {o.icon && <o.icon size={14} />}
              {o.label}
            </button>
          );
        })}
      </div>

      {/* ── Contenu ── */}
      {loading
        ? <div className="flex flex-col gap-4">
            {[1, 2].map(i => (
              <div key={i} className={`rounded-2xl border h-40 animate-pulse ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100"}`} />
            ))}
          </div>
        : <>

          {/* ══ GÉNÉRAL ══ */}
          {onglet === "general" && (
            <div className="flex flex-col gap-4">

              <SectionCard dark={dark} icon={Users} titre="Inscriptions & accès"
                description="Contrôle des nouvelles demandes médecins">
                <ToggleRow dark={dark} label="Nouvelles inscriptions ouvertes"
                  description="Accepter de nouvelles demandes sur la plateforme"
                  checked={params.inscriptions_ouvertes} onChange={v => set("inscriptions_ouvertes", v)} />
                <ToggleRow dark={dark} label="Validation manuelle obligatoire"
                  description="Chaque inscription validée manuellement par l'administrateur"
                  checked={params.validation_manuelle} onChange={v => set("validation_manuelle", v)} />
                <ToggleRow dark={dark} label="Relance des dossiers refusés autorisée"
                  description="L'admin peut envoyer un e-mail de relance aux médecins refusés"
                  checked={params.relance_autorisee} onChange={v => set("relance_autorisee", v)} />
              </SectionCard>

              <SectionCard dark={dark} icon={Clock} titre="Délais automatiques"
                description="Durées utilisées par les tâches planifiées">
                <NumberRow dark={dark} label="Délai d'inactivité"
                  description="Un médecin sans connexion depuis ce délai passe à Inactif"
                  value={params.delai_inactivite_jours} onChange={v => set("delai_inactivite_jours", v)}
                  min={7} max={90} unit="jours" />
                <NumberRow dark={dark} label="Durée de la corbeille"
                  description="Délai avant suppression définitive automatique depuis la corbeille"
                  value={params.duree_corbeille_jours} onChange={v => set("duree_corbeille_jours", v)}
                  min={7} max={90} unit="jours" />
              </SectionCard>

              <SectionCard dark={dark} icon={Wrench} accent="#ea580c" titre="Mode maintenance"
                description="Bloquer temporairement l'accès médecins à la plateforme">
                <ToggleRow dark={dark} label="Activer le mode maintenance"
                  description="Les médecins voient un message d'indisponibilité à la connexion"
                  checked={params.mode_maintenance} onChange={v => set("mode_maintenance", v)}
                  tag={params.mode_maintenance ? "ACTIF" : undefined} />
                <TextareaRow dark={dark} label="Message affiché pendant la maintenance"
                  description="Texte visible par les médecins qui tentent de se connecter"
                  value={params.message_maintenance} onChange={v => set("message_maintenance", v)}
                  placeholder="Ex : La plateforme est en maintenance…" />
              </SectionCard>

              <SectionCard dark={dark} icon={Database} accent="#8b5cf6" titre="Limites & quotas"
                description="Contraintes techniques appliquées à la plateforme">
                <NumberRow dark={dark} label="Taille max des fichiers uploadés"
                  description="Limite pour les documents soumis lors des inscriptions"
                  value={params.taille_max_fichier_mb} onChange={v => set("taille_max_fichier_mb", v)}
                  min={1} max={50} unit="Mo" />
                <NumberRow dark={dark} label="Tentatives OTP max"
                  description="Nombre d'essais avant blocage du compte médecin (corbeille automatique)"
                  value={params.otp_max_tentatives} onChange={v => set("otp_max_tentatives", v)}
                  min={1} max={10} unit="essais" />
                <NumberRow dark={dark} label="Durée de session"
                  description="Déconnexion automatique après cette durée d'inactivité"
                  value={params.duree_session_heures} onChange={v => set("duree_session_heures", v)}
                  min={1} max={24} unit="heures" />
              </SectionCard>
            </div>
          )}

          {/* ══ SÉCURITÉ ══ */}
          {onglet === "securite" && (
            <div className="flex flex-col gap-4">
              <SectionCard dark={dark} icon={Shield} accent="#2563eb" titre="Authentification"
                description="Paramètres d'accès et de vérification d'identité">
                <ToggleRow dark={dark} label="Double authentification (2FA)"
                  description="OTP par SMS Twilio — obligatoire pour l'administrateur"
                  checked={params.double_auth} onChange={v => set("double_auth", v)} />
                <ToggleRow dark={dark} label="Session max"
                  description={`Déconnexion automatique après ${params.duree_session_heures ?? DEFAULTS.duree_session_heures}h d'inactivité`}
                  checked={params.session_max} onChange={v => set("session_max", v)} />
              </SectionCard>

              <SectionCard dark={dark} icon={FileText} accent="#059669" titre="Traçabilité"
                description="Journalisation des actions dans la plateforme">
                <ToggleRow dark={dark} label="Journal d'audit complet"
                  description="Enregistrer toutes les actions administratives dans le journal d'audit"
                  checked={params.audit_complet} onChange={v => set("audit_complet", v)} />
              </SectionCard>

              <div className={`rounded-2xl border px-5 py-4 ${dark ? "bg-amber-900/10 border-amber-700/30" : "bg-amber-50 border-amber-200"}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${dark ? "text-amber-400" : "text-amber-600"}`} />
                  <div>
                    <p className={`text-[14px] font-bold ${dark ? "text-amber-300" : "text-amber-800"}`}>Recommandations de sécurité</p>
                    <ul className={`text-[13px] mt-2 space-y-1 list-disc list-inside ${dark ? "text-amber-400/80" : "text-amber-700"}`}>
                      <li>Gardez la 2FA activée en permanence</li>
                      <li>Ne dépassez pas 3 tentatives OTP pour éviter les abus</li>
                      <li>Le journal d'audit complet est recommandé en production</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ NOTIFICATIONS ══ */}
          {onglet === "notifications" && (
            <SectionCard dark={dark} icon={Bell} accent="#f59e0b" titre="Alertes administrateur"
              description="Notifications reçues dans la cloche 🔔 en temps réel">
              <ToggleRow dark={dark} label="Nouvelle demande d'inscription"
                description="Alerte quand un médecin soumet un nouveau dossier"
                checked={params.notif_nouvelle_demande} onChange={v => set("notif_nouvelle_demande", v)} />
              <ToggleRow dark={dark} label="Nouveau commentaire publié"
                description="Alerte quand un médecin publie un avis sur la landing page"
                checked={params.notif_nouveau_commentaire} onChange={v => set("notif_nouveau_commentaire", v)} />
              <ToggleRow dark={dark} label="Nouvelle question FAQ"
                description="Alerte quand un médecin pose une question dans la FAQ"
                checked={params.notif_nouvelle_faq} onChange={v => set("notif_nouvelle_faq", v)} />
              <ToggleRow dark={dark} label="Expiration imminente corbeille"
                description="Alerte 3 jours avant la suppression définitive d'un compte"
                checked={params.notif_expiration_corbeille} onChange={v => set("notif_expiration_corbeille", v)} />
              <ToggleRow dark={dark} label="Médecin inactif détecté"
                description={`Alerte quand un médecin dépasse ${params.delai_inactivite_jours} jours sans connexion`}
                checked={params.notif_medecin_inactif} onChange={v => set("notif_medecin_inactif", v)} />
            </SectionCard>
          )}

          {/* ══ COMMUNICATIONS ══ */}
          {onglet === "communications" && (
            <div className="flex flex-col gap-4">
              <SectionCard dark={dark} icon={Mail} titre="E-mails automatiques (Brevo)"
                description="Notifications envoyées aux médecins via Brevo SMTP">
                <ToggleRow dark={dark} label="E-mail de bienvenue à l'activation"
                  description="Envoyé au médecin lorsque son compte est activé"
                  checked={params.email_bienvenue} onChange={v => set("email_bienvenue", v)} />
                <ToggleRow dark={dark} label="Notification de refus avec motif"
                  description="E-mail envoyé au médecin refusé avec le motif détaillé"
                  checked={params.notif_refus} onChange={v => set("notif_refus", v)} />
                <ToggleRow dark={dark} label="Notification de suspension avec raison"
                  description="E-mail envoyé au médecin suspendu avec la raison et la durée"
                  checked={params.notif_suspension} onChange={v => set("notif_suspension", v)} />
              </SectionCard>
            </div>
          )}

          {/* ══ PRÉFÉRENCES ══ */}
          {onglet === "preferences" && (
            <div className="flex flex-col gap-4">
              <SectionCard dark={dark} icon={Clock} titre="Heure & Date"
                description="Format d'affichage des dates et heures dans l'interface admin">
                <SelectRow dark={dark} label="Fuseau horaire"
                  description="Heure locale utilisée pour afficher les dates"
                  value={params.fuseau_horaire} onChange={v => set("fuseau_horaire", v)}
                  options={[
                    { value: "Africa/Douala", label: "Africa/Douala (UTC+1) — Cameroun" },
                    { value: "Africa/Lagos",  label: "Africa/Lagos (UTC+1) — Nigeria"   },
                    { value: "Europe/Paris",  label: "Europe/Paris (UTC+2)"              },
                    { value: "UTC",           label: "UTC"                               },
                  ]} />
                <SelectRow dark={dark} label="Format de date"
                  description="Ordre d'affichage jour / mois / année"
                  value={params.format_date} onChange={v => set("format_date", v)}
                  options={[
                    { value: "DD/MM/YYYY", label: "DD/MM/YYYY — ex : 09/06/2026" },
                    { value: "MM/DD/YYYY", label: "MM/DD/YYYY — ex : 06/09/2026" },
                    { value: "YYYY-MM-DD", label: "YYYY-MM-DD — ex : 2026-06-09" },
                  ]} />
                <SelectRow dark={dark} label="Format d'heure"
                  description="Affichage 24h ou 12h avec AM/PM"
                  value={params.format_heure} onChange={v => set("format_heure", v)}
                  options={[
                    { value: "24h", label: "24h — ex : 14:30"    },
                    { value: "12h", label: "12h — ex : 02:30 PM" },
                  ]} />
              </SectionCard>

              <SectionCard dark={dark} icon={Globe} titre="Langue"
                description="Langue de l'interface d'administration">
                <SelectRow dark={dark} label="Langue de l'interface"
                  description="Langue utilisée dans le panneau admin"
                  value={params.langue} onChange={v => set("langue", v)}
                  options={[
                    { value: "fr", label: "Français"              },
                    { value: "en", label: "English (à venir)"     },
                  ]} />
              </SectionCard>
            </div>
          )}

          {/* ══ PUBLICATIONS ══ */}
          {onglet === "publications" && <OngletPublications dark={dark} />}
        </>
      }

      {/* ── Bandeau modifications non sauvegardées ── */}
      {hasChanges && onglet !== "publications" && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-5 py-3 rounded-2xl shadow-xl border text-[14px] ${dark ? "bg-[#161b22] border-[#21262d] text-white" : "bg-white border-gray-200 text-gray-700"}`}>
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shrink-0" />
          Modifications non sauvegardées
          <button onClick={handleReset}
            className={`text-[13px] px-3 py-1.5 rounded-lg border transition-colors ${dark ? "border-[#21262d] hover:bg-[#21262d]" : "border-gray-300 hover:bg-gray-50"}`}>
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving}
            className="text-[13px] px-3 py-1.5 rounded-lg text-white font-semibold" style={{ background: brand.DEFAULT }}>
            {saving ? "…" : "Sauvegarder"}
          </button>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[14px] font-semibold text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
