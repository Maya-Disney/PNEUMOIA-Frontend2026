import { useState, useCallback, useEffect } from "react";
import { Wind, PauseCircle, AlertCircle, CheckCircle } from "lucide-react";
import { useOutletContext } from "react-router-dom";

const BRAND = "#0f766e";

const DEFAULTS = {
  inscriptions_ouvertes: true,
  validation_manuelle:   true,
  verification_cnom:     false,
  partage_dossiers:      true,
  double_auth:           true,
  session_max:           true,
  audit_complet:         true,
  email_bienvenue:       true,
  notif_refus:           true,
  notif_suspension:      true,
  rapport_mensuel:       false,
};

const MOCK_PUBLICATIONS = [
  { id:235, titre:"Cas #235 — BPCO exacerbation sévère",       auteur:"Dr. Nkoa",   meta:"H64, Bafoussam · Publié il y a 5j · 19 vues · 4 commentaires", resume:"Exacerbation aiguë BPCO stade III. Corticothérapie + bronchodilatateur. Évolution favorable.",              statut:"publie",   raison:null },
  { id:241, titre:"Cas #241 — Pneumonie atypique résistante",  auteur:"Dr. Dupont", meta:"H47, Douala · Publié il y a 1j · 12 vues · 3 commentaires",    resume:"Pneumonie bactérienne atypique résistante à l'amoxicilline. Évolution favorable sous azithromycine.",    statut:"publie",   raison:null },
  { id:229, titre:"Cas #229 — Pneumopathie virale sévère",     auteur:"Dr. Barry",  meta:"F29, Garoua · Suspendu le 14/03/2026",                          resume:null,                                                                                                          statut:"suspendu", raison:"Erreur dans les données biologiques signalée par 2 confrères." },
  { id:218, titre:"Cas #218 — Tuberculose pulmonaire active",  auteur:"Dr. Fouda",  meta:"H52, Yaoundé · Signalé il y a 2j · 8 vues · 1 commentaire",    resume:"Cas signalé pour données patient non anonymisées dans les images jointes.",                                  statut:"signale",  raison:"Données patient non anonymisées signalées par 3 confrères." },
];

const ONGLETS = [
  { key:"general",        label:"Général" },
  { key:"publications",   label:"Publications communauté" },
  { key:"securite",       label:"Sécurité" },
  { key:"communications", label:"Communications" },
];

// ── Toggle ─────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      style={{ background: checked ? BRAND : "#d1d5db" }}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

// ── Ligne toggle ───────────────────────────────────────────────────────────────
function ToggleRow({ label, description, checked, onChange, dark, disabled }) {
  return (
    <div className={`flex items-center justify-between py-4 border-b last:border-b-0 ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
      <div className="pr-6">
        <p className={`text-[12px] font-semibold ${dark ? "text-white" : "text-gray-800"}`}>{label}</p>
        {description && <p className={`text-[11px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ── Section card ───────────────────────────────────────────────────────────────
function SectionCard({ titre, description, dark, children, headerRight }) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}>
      <div className={`flex items-start justify-between gap-4 px-5 py-4 border-b ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
        <div>
          <p className={`text-[13px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{titre}</p>
          {description && <p className={`text-[11px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{description}</p>}
        </div>
        {headerRight}
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

// ── Onglet Publications ────────────────────────────────────────────────────────
function OngletPublications({ dark }) {
  const [filtre, setFiltre] = useState("Tous les cas");
  const [pubs,   setPubs]   = useState(MOCK_PUBLICATIONS);

  const suspendre = (id) => setPubs(p => p.map(x => x.id===id ? {...x, statut:"suspendu"} : x));
  const reactiver = (id) => setPubs(p => p.map(x => x.id===id ? {...x, statut:"publie", raison:null} : x));
  const supprimer = (id) => setPubs(p => p.filter(x => x.id!==id));

  const filtrees = pubs.filter(p =>
    filtre==="Actifs"    ? p.statut==="publie"   :
    filtre==="Suspendus" ? p.statut==="suspendu" :
    filtre==="Signalés"  ? p.statut==="signale"  : true
  );

  return (
    <SectionCard dark={dark} titre="Publications — Cas cliniques communauté" description="Gérez les cas publiés sur la plateforme"
      headerRight={
        <select value={filtre} onChange={e => setFiltre(e.target.value)}
          className={`text-[12px] rounded-xl border px-3 py-1.5 outline-none cursor-pointer ${dark ? "bg-[#0d1117] border-[#21262d] text-white" : "bg-white border-gray-200 text-gray-800"}`}>
          {["Tous les cas","Actifs","Suspendus","Signalés"].map(f => <option key={f}>{f}</option>)}
        </select>
      }>
      {/* Bandeau info */}
      <div className={`flex items-start gap-2 my-4 px-4 py-3 rounded-xl text-[11px] ${dark ? "bg-blue-900/20 text-blue-300 border border-blue-800/40" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Vous pouvez suspendre ou supprimer un cas clinique publié si son contenu ne respecte pas les règles de la plateforme (données non anonymisées, contenu inadapté, erreur médicale grave).
      </div>

      {/* Liste */}
      <div className="flex flex-col gap-3 pb-4">
        {filtrees.length === 0
          ? <p className={`text-[12px] text-center py-8 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>Aucune publication dans cette catégorie</p>
          : filtrees.map(pub => {
            const isS = pub.statut==="suspendu", isR = pub.statut==="signale";
            const bg  = isS ? (dark?"bg-orange-950/20 border-orange-800/30":"bg-orange-50 border-orange-100")
                       : isR ? (dark?"bg-red-950/20 border-red-800/30":"bg-red-50 border-red-100")
                       : (dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-50 border-gray-200");
            const iconBg = isS ? (dark?"bg-orange-900/30":"bg-orange-100") : isR ? (dark?"bg-red-900/30":"bg-red-100") : (dark?"bg-teal-900/30":"bg-teal-50");
            return (
              <div key={pub.id} className={`rounded-xl border p-4 ${bg}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    {isS ? <PauseCircle size={20} color="#f97316" />
                         : isR ? <AlertCircle size={20} color="#ef4444" />
                         : <Wind size={20} color={BRAND} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-[12px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{pub.titre}</p>
                        <p className={`text-[10px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{pub.auteur} · {pub.meta}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[10px] font-bold ${isS?"text-orange-500":isR?"text-red-500":"text-teal-600"}`}>
                          {isS?"Suspendu":isR?"Signalé":"Actif"}
                        </span>
                        <div className="flex gap-1.5">
                          {pub.statut==="publie"   && <><button onClick={()=>suspendre(pub.id)} className="text-[10px] px-2.5 py-1 rounded-lg border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 transition-colors">Suspendre</button><button className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-300 text-gray-600 hover:bg-gray-100"}`}>Voir</button></>}
                          {pub.statut==="signale"  && <><button onClick={()=>suspendre(pub.id)} className="text-[10px] px-2.5 py-1 rounded-lg border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 transition-colors">Suspendre</button><button onClick={()=>reactiver(pub.id)} className="text-[10px] px-2.5 py-1 rounded-lg border border-teal-400 dark:border-teal-700 text-teal-600 dark:text-teal-400 hover:bg-teal-50 transition-colors">Ignorer</button></>}
                          {pub.statut==="suspendu" && <><button onClick={()=>reactiver(pub.id)} className="text-[10px] px-2.5 py-1 rounded-lg border border-teal-400 dark:border-teal-700 text-teal-600 dark:text-teal-400 hover:bg-teal-50 transition-colors">Réactiver</button><button onClick={()=>supprimer(pub.id)} className="text-[10px] px-2.5 py-1 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 transition-colors">Supprimer</button></>}
                        </div>
                      </div>
                    </div>
                    {pub.resume && <p className={`text-[11px] mt-2 ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>{pub.resume}</p>}
                    {pub.raison && <p className="text-[11px] mt-2 text-orange-500 font-medium">Raison : {pub.raison}</p>}
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

// ── Composant principal ────────────────────────────────────────────────────────
export default function ParametresPlateforme() {
  const { dark } = useOutletContext() || {};
  const [onglet,   setOnglet]   = useState("general");
  const [params,   setParams]   = useState(DEFAULTS);
  const [original, setOriginal] = useState(DEFAULTS);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);

  // Chargement
  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/parametres")
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setParams({...DEFAULTS,...data}); setOriginal({...DEFAULTS,...data}); })
      .catch(()  => { setParams(DEFAULTS); setOriginal(DEFAULTS); })
      .finally(()=> setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const set = useCallback((k, v) => setParams(p => ({...p, [k]: v})), []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/parametres", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(params) });
      if (!res.ok) throw new Error();
      setOriginal(params);
      setToast({ msg:"Paramètres sauvegardés avec succès", type:"success" });
    } catch {
      setOriginal(params);
      setToast({ msg:"Paramètres sauvegardés (mode démo)", type:"success" });
    } finally { setSaving(false); }
  }

  const handleReset = () => setParams(original);
  const hasChanges  = JSON.stringify(params) !== JSON.stringify(original);

  const tabBase = "px-4 py-3 text-[12px] font-semibold border-b-2 whitespace-nowrap transition-colors";

  return (
    <div className="flex flex-col gap-5 max-w-[1100px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
            Paramètres de la plateforme
          </h1>
          <p className={`text-[12px] mt-1 ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>
            Configuration globale de PneumoIA
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button onClick={handleReset}
              className={`px-4 py-2 rounded-xl border text-[12px] font-semibold transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              Annuler
            </button>
          )}
          <button onClick={handleSave} disabled={!hasChanges || saving}
            className="px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: hasChanges ? BRAND : "#9ca3af" }}>
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className={`flex border-b overflow-x-auto ${dark ? "border-[#21262d]" : "border-gray-200"}`}>
        {ONGLETS.map(o => (
          <button key={o.key} onClick={() => setOnglet(o.key)}
            className={`${tabBase} ${dark ? "hover:text-white" : "hover:text-gray-700"}`}
            style={onglet===o.key
              ? { borderBottomColor: BRAND, color: BRAND }
              : { borderBottomColor: "transparent", color: dark ? "#484f58" : "#9ca3af" }}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1,2].map(i => (
            <div key={i} className={`rounded-2xl border h-40 animate-pulse ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100"}`} />
          ))}
        </div>
      ) : (
        <>
          {onglet==="general" && (
            <SectionCard dark={dark} titre="Inscriptions & accès" description="Contrôle des nouvelles demandes médecins">
              <ToggleRow dark={dark} label="Nouvelles inscriptions ouvertes"    description="Accepter de nouvelles demandes sur la plateforme"              checked={params.inscriptions_ouvertes} onChange={v=>set("inscriptions_ouvertes",v)}/>
              <ToggleRow dark={dark} label="Validation manuelle obligatoire"     description="Chaque inscription validée manuellement par le super admin"    checked={params.validation_manuelle}   onChange={v=>set("validation_manuelle",v)}/>
              <ToggleRow dark={dark} label="Vérification CNOM en ligne"          description="Appel API Ordre National des Médecins du Cameroun"             checked={params.verification_cnom}     onChange={v=>set("verification_cnom",v)}/>
              <ToggleRow dark={dark} label="Partage de dossiers entre médecins"  description="Autoriser les demandes de partage de dossiers patients"        checked={params.partage_dossiers}      onChange={v=>set("partage_dossiers",v)}/>
            </SectionCard>
          )}
          {onglet==="publications"   && <OngletPublications dark={dark} />}
          {onglet==="securite"       && (
            <SectionCard dark={dark} titre="Sécurité & authentification" description="Paramètres d'accès admin">
              <ToggleRow dark={dark} label="Double authentification (2FA)" description="Obligatoire pour le super admin"                   checked={params.double_auth}   onChange={v=>set("double_auth",v)}/>
              <ToggleRow dark={dark} label="Session max 8h"                description="Déconnexion automatique après inactivité"          checked={params.session_max}   onChange={v=>set("session_max",v)}/>
              <ToggleRow dark={dark} label="Journal d'audit complet"       description="Enregistrer toutes les actions administratives"    checked={params.audit_complet} onChange={v=>set("audit_complet",v)}/>
            </SectionCard>
          )}
          {onglet==="communications" && (
            <SectionCard dark={dark} titre="E-mails automatiques" description="Notifications envoyées aux médecins">
              <ToggleRow dark={dark} label="E-mail de bienvenue à l'activation"      checked={params.email_bienvenue}  onChange={v=>set("email_bienvenue",v)}/>
              <ToggleRow dark={dark} label="Notification de refus avec motif"        checked={params.notif_refus}      onChange={v=>set("notif_refus",v)}/>
              <ToggleRow dark={dark} label="Notification de suspension avec raison"  checked={params.notif_suspension} onChange={v=>set("notif_suspension",v)}/>
              <ToggleRow dark={dark} label="Rapport mensuel aux médecins"            checked={params.rapport_mensuel}  onChange={v=>set("rapport_mensuel",v)}/>
            </SectionCard>
          )}
        </>
      )}

      {/* Bandeau modifications non sauvegardées */}
      {hasChanges && onglet!=="publications" && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-5 py-3 rounded-2xl shadow-xl border text-[12px] ${dark ? "bg-[#161b22] border-[#21262d] text-white" : "bg-white border-gray-200 text-gray-700"}`}>
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shrink-0" />
          Modifications non sauvegardées
          <button onClick={handleReset} className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors ${dark ? "border-[#21262d] hover:bg-[#21262d]" : "border-gray-300 hover:bg-gray-50"}`}>Annuler</button>
          <button onClick={handleSave} disabled={saving} className="text-[11px] px-3 py-1.5 rounded-lg text-white transition-colors" style={{background:BRAND}}>{saving ? "…" : "Sauvegarder"}</button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white ${toast.type==="success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}