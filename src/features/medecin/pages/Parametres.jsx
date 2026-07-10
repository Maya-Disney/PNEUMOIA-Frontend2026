import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Bell, Lock, Shield,
  Eye, EyeOff, CheckCircle, AlertCircle,
  Save, Sun, Moon, Download, Loader2,
  ChevronRight, Trash2, Globe, Settings,
  Smartphone, Check, KeyRound,Share2
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const P  = '#2563eb';
const P2 = '#1d4ed8';

const hdrs = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const DEFAULT_PREFS = {
  emailNotifications:          true,
  smsNotifications:            false,
  newsletter:                  true,
  rappelsConsultations:        true,
  rappelsSuivi:                true,
  notifNouvellesConsultations: true,
  notifMessagesRecus:          true,
  notifCommentairesCas:        true,
  notifPartagesRecus:          true,
  notifRappelsSysteme:         true,
  notifMisesAJour:             true,
  notifEvenements:             false,
  langue:                      'fr',
  timezone:                    'Africa/Douala',
  compactView:                 false,
  showThumbnails:              true,
  defaultView:                 'cards',
  itemsPerPage:                10,
  sortBy:                      'date',
  sortOrder:                   'desc',
  profilPublic:                true,
  visibleDansAnnuaire:         true,
  anonymisationCas:            true,
  accepteDemandes:             true,
};

function SectionCard({ icon: Icon, iconCls, title, delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-(--ln)">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconCls}`}>
          <Icon size={15} />
        </div>
        <span className="text-sm font-bold text-(--t1)">{title}</span>
      </div>
      <div className="divide-y divide-(--ln)">{children}</div>
    </motion.div>
  );
}

function ToggleRow({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-(--t1)">{label}</p>
        {description && <p className="text-xs text-(--t4) mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0"
        style={{ background: value ? P : 'var(--sf3)' }}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function SelectRow({ label, value, onChange, options }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4 flex-wrap">
      <p className="text-sm font-semibold text-(--t1)">{label}</p>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        className="px-3 py-1.5 text-sm border border-(--ln) rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1)"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

const TABS = [
  { id: 'compte',          label: 'Compte',           icon: User    },
  { id: 'notifications',   label: 'Notifications',    icon: Bell    },
  { id: 'confidentialite', label: 'Confidentialité',  icon: Shield  },
  { id: 'affichage',       label: 'Affichage',        icon: Eye     },
  { id: 'securite',        label: 'Sécurité',         icon: Lock    },
];

export default function Parametres() {
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();
  const [activeTab,   setActiveTab]   = useState('compte');
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [saveErr,     setSaveErr]     = useState(false);

  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const setPref = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  // Mot de passe
  const [pwOpen,    setPwOpen]    = useState(false);
  const [pwData,    setPwData]    = useState({ current: '', next: '', confirm: '' });
  const [pwErrors,  setPwErrors]  = useState({});
  const [pwOk,      setPwOk]      = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [showCur,   setShowCur]   = useState(false);
  const [showNxt,   setShowNxt]   = useState(false);
  const [showCfm,   setShowCfm]   = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/medecins/me/preferences`, { headers: hdrs() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setPrefs({ ...DEFAULT_PREFS, ...d }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaveErr(false);
    try {
      const res  = await fetch(`${API_URL}/medecins/me/preferences`, {
        method: 'PATCH', headers: hdrs(), body: JSON.stringify(prefs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');
      setPrefs(data);
      localStorage.setItem('medecin_prefs', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('pneumoia-prefs-updated', { detail: data }));
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveErr(true); setTimeout(() => setSaveErr(false), 3000);
    } finally { setSaving(false); }
  };

  const handleUpdatePassword = async () => {
    const errs = {};
    if (!pwData.current) errs.current = 'Requis';
    if (!pwData.next) errs.next = 'Requis';
    else if (pwData.next.length < 8) errs.next = 'Minimum 8 caractères';
    if (pwData.next !== pwData.confirm) errs.confirm = 'Ne correspond pas';
    setPwErrors(errs);
    if (Object.keys(errs).length) return;

    setPwLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PATCH', headers: hdrs(),
        body: JSON.stringify({ current_password: pwData.current, new_password: pwData.next }),
      });
      if (!res.ok) {
        const d = await res.json();
        setPwErrors({ general: d.detail || 'Erreur' });
        return;
      }
      setPwOk(true);
      setTimeout(() => { setPwOpen(false); setPwData({ current:'',next:'',confirm:'' }); setPwOk(false); }, 2000);
    } catch { setPwErrors({ general: 'Erreur réseau' }); }
    finally { setPwLoading(false); }
  };

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify({ preferences: prefs, exportDate: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `pneumoia_export_${new Date().toISOString().split('T')[0]}.json` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const inp = (hasErr) =>
    `w-full px-3.5 py-2.5 bg-(--sf2) border rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:border-blue-400 transition-all pr-10 ${hasErr ? 'border-red-400' : 'border-(--ln)'}`;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: P }} />
    </div>
  );

  return (
    <div className="space-y-5 w-full">

      {/* ── Bannière ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(135deg,${P2} 0%,${P} 55%,#3b82f6 100%)`, boxShadow: `0 8px 32px rgba(37,99,235,0.25)` }}
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle,#bfdbfe,transparent)' }} />
        <div style={{ position:'absolute', inset:0, opacity:0.06, backgroundImage:'radial-gradient(circle at 2px 2px,#fff 1px,transparent 0)', backgroundSize:'18px 18px' }} />
        <div className="relative px-6 py-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.28)' }}>
              <Settings size={20} className="text-white" />
            </div>
            <div>
              <p className="text-blue-200/80 text-[10px] font-black uppercase tracking-widest">Configuration</p>
              <h1 className="text-xl font-black text-white">Paramètres</h1>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-60"
            style={{ background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.28)', color:'white' }}>
            {saving ? <Loader2 size={15} className="animate-spin"/> : <Save size={15}/>}
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>
      </motion.div>

      {/* ── Feedback ──────────────────────────────────────── */}
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="flex items-center gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium">
            <Check size={15} className="shrink-0"/> Paramètres sauvegardés avec succès.
          </motion.div>
        )}
        {saveErr && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium">
            <AlertCircle size={15} className="shrink-0"/> Erreur lors de la sauvegarde.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 border-b border-(--ln) min-w-max">
          {TABS.map(tab => {
            const Icon     = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all relative whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-(--t3) hover:text-(--t1)'}`}>
                <Icon size={14} />
                {tab.label}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ COMPTE ═══════════════════════════════════════════ */}
      {activeTab === 'compte' && (
        <div className="space-y-4">
          <SectionCard icon={Globe} iconCls="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400" title="Préférences générales" delay={0.05}>
            <SelectRow label="Langue" value={prefs.langue} onChange={v => setPref('langue', v)}
              options={[{ value:'fr', label:'Français' }, { value:'en', label:'English' }]} />
            <SelectRow label="Fuseau horaire" value={prefs.timezone} onChange={v => setPref('timezone', v)}
              options={[{ value:'Africa/Douala', label:'Afrique/Douala (GMT+1)' }, { value:'Europe/Paris', label:'Europe/Paris (GMT+1/+2)' }]} />
          </SectionCard>

          <SectionCard icon={Bell} iconCls="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" title="Communications email" delay={0.10}>
            <ToggleRow label="Notifications par email" description="Recevoir les alertes non-critiques par email (hors OTP de connexion)" value={prefs.emailNotifications} onChange={v => setPref('emailNotifications', v)} />
            <ToggleRow label="Newsletter mensuelle" description="Recevoir la newsletter PneumoIA chaque mois" value={prefs.newsletter} onChange={v => setPref('newsletter', v)} />
            <ToggleRow label="Rappels de consultations" description="Emails de rappel avant vos consultations planifiées" value={prefs.rappelsConsultations} onChange={v => setPref('rappelsConsultations', v)} />
            <ToggleRow label="Rappels de suivi patients" description="Emails de rappel pour le suivi de vos patients" value={prefs.rappelsSuivi} onChange={v => setPref('rappelsSuivi', v)} />
          </SectionCard>
        </div>
      )}

      {/* ══ NOTIFICATIONS ════════════════════════════════════ */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <SectionCard icon={Bell} iconCls="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" title="Notifications plateforme" delay={0.05}>
            <ToggleRow
              label="Notifications plateforme (global)"
              description="Désactiver pour ne plus recevoir aucune notification dans l'interface PneumoIA"
              value={prefs.notifRappelsSysteme}
              onChange={v => setPref('notifRappelsSysteme', v)}
            />
            <ToggleRow label="Nouvelles consultations" description="Notification lors d'une nouvelle consultation ajoutée" value={prefs.notifNouvellesConsultations} onChange={v => setPref('notifNouvellesConsultations', v)} />
            <ToggleRow label="Messages reçus" description="Notification pour les nouveaux messages dans le canal équipe" value={prefs.notifMessagesRecus} onChange={v => setPref('notifMessagesRecus', v)} />
            <ToggleRow label="Commentaires sur cas" description="Notification quand quelqu'un commente vos cas cliniques" value={prefs.notifCommentairesCas} onChange={v => setPref('notifCommentairesCas', v)} />
            <ToggleRow label="Partages reçus" description="Notification quand vos contenus sont partagés" value={prefs.notifPartagesRecus} onChange={v => setPref('notifPartagesRecus', v)} />
            <ToggleRow label="Mises à jour" description="Notifications pour les nouvelles fonctionnalités PneumoIA" value={prefs.notifMisesAJour} onChange={v => setPref('notifMisesAJour', v)} />
            <ToggleRow label="Événements communauté" description="Notifications pour les événements médicaux" value={prefs.notifEvenements} onChange={v => setPref('notifEvenements', v)} />
          </SectionCard>
        </div>
      )}

      {/* ══ CONFIDENTIALITÉ ══════════════════════════════════ */}
      {activeTab === 'confidentialite' && (
        <div className="space-y-4">
          <SectionCard icon={Shield} iconCls="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" title="Visibilité" delay={0.05}>
            <ToggleRow label="Profil public" description="Votre profil est visible par les autres médecins de la plateforme" value={prefs.profilPublic} onChange={v => setPref('profilPublic', v)} />
            <ToggleRow label="Visible dans l'annuaire" description="Apparaître dans l'annuaire des médecins PneumoIA" value={prefs.visibleDansAnnuaire} onChange={v => setPref('visibleDansAnnuaire', v)} />
          </SectionCard>

          <SectionCard icon={Share2} iconCls="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" title="Cas cliniques & Partage" delay={0.10}>
            <ToggleRow label="Anonymisation des cas" description="Anonymiser automatiquement les données patients dans les cas partagés" value={prefs.anonymisationCas} onChange={v => setPref('anonymisationCas', v)} />
            <ToggleRow label="Accepter les demandes de collaboration" description="Recevoir des demandes de collaboration d'autres médecins" value={prefs.accepteDemandes} onChange={v => setPref('accepteDemandes', v)} />
            <ToggleRow label="Notification de partage" description="Être notifié quand vos publications sont partagées" value={prefs.notifPartagesRecus} onChange={v => setPref('notifPartagesRecus', v)} />
          </SectionCard>
        </div>
      )}

      {/* ══ AFFICHAGE ════════════════════════════════════════ */}
      {activeTab === 'affichage' && (
        <div className="space-y-4">
          <SectionCard icon={Sun} iconCls="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400" title="Thème de l'interface" delay={0.05}>
            <div className="flex items-center justify-between px-5 py-4 gap-4">
              <div>
                <p className="text-sm font-semibold text-(--t1)">Thème d'interface</p>
                <p className="text-xs text-(--t4) mt-0.5">{theme === 'dark' ? 'Mode sombre activé' : 'Mode clair activé'}</p>
              </div>
              <button onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-(--ln) hover:bg-(--sf2) transition-colors text-sm font-bold text-(--t2)">
                {theme === 'dark' ? <><Sun size={14}/> Mode clair</> : <><Moon size={14}/> Mode sombre</>}
              </button>
            </div>
          </SectionCard>

          <SectionCard icon={Eye} iconCls="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" title="Préférences d'affichage" delay={0.10}>
            <ToggleRow label="Vue compacte" description="Afficher plus d'informations par écran" value={prefs.compactView} onChange={v => setPref('compactView', v)} />
            <ToggleRow label="Afficher les miniatures" description="Afficher les aperçus d'images dans les cas cliniques" value={prefs.showThumbnails} onChange={v => setPref('showThumbnails', v)} />
            <SelectRow label="Vue par défaut" value={prefs.defaultView} onChange={v => setPref('defaultView', v)}
              options={[{ value:'cards', label:'Cartes' }, { value:'list', label:'Liste' }]} />
            <SelectRow label="Éléments par page" value={prefs.itemsPerPage} onChange={v => setPref('itemsPerPage', Number(v))}
              options={[{ value:10, label:'10' }, { value:20, label:'20' }, { value:50, label:'50' }]} />
            <SelectRow label="Trier par" value={prefs.sortBy} onChange={v => setPref('sortBy', v)}
              options={[{ value:'date', label:'Date' }, { value:'name', label:'Nom' }, { value:'status', label:'Statut' }]} />
            <SelectRow label="Ordre" value={prefs.sortOrder} onChange={v => setPref('sortOrder', v)}
              options={[{ value:'desc', label:'Décroissant' }, { value:'asc', label:'Croissant' }]} />
          </SectionCard>
        </div>
      )}

      {/* ══ SÉCURITÉ ═════════════════════════════════════════ */}
      {activeTab === 'securite' && (
        <div className="space-y-4">

          {/* Mot de passe */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05, duration:0.3 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm">
            <button onClick={() => { setPwOpen(o => !o); setPwErrors({}); }}
              className="w-full flex items-center gap-3 px-5 py-4 border-b border-(--ln) hover:bg-(--sf2) transition-colors">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <KeyRound size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-bold text-(--t1) flex-1 text-left">Changer le mot de passe</span>
              <span className="text-[10px] font-semibold text-(--t4)">{pwOpen ? '▲ Masquer' : '▼ Modifier'}</span>
            </button>
            <AnimatePresence>
              {pwOpen && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden">
                  <div className="p-5 space-y-4">
                    <AnimatePresence>
                      {pwOk && (
                        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          className="flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                          <Check size={14} className="shrink-0"/> Mot de passe modifié avec succès !
                        </motion.div>
                      )}
                      {pwErrors.general && (
                        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-300 text-sm">
                          <AlertCircle size={14} className="shrink-0"/> {pwErrors.general}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {[
                      { key:'current',  label:'Mot de passe actuel',             show:showCur, toggle:()=>setShowCur(s=>!s) },
                      { key:'next',     label:'Nouveau mot de passe',            show:showNxt, toggle:()=>setShowNxt(s=>!s) },
                      { key:'confirm',  label:'Confirmer le nouveau mot de passe', show:showCfm, toggle:()=>setShowCfm(s=>!s) },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-(--t4) mb-1.5">{f.label}</label>
                        <div className="relative">
                          <input type={f.show?'text':'password'}
                            className={inp(!!pwErrors[f.key])}
                            value={pwData[f.key]}
                            onChange={e => { setPwData(p=>({...p,[f.key]:e.target.value})); setPwErrors(p=>({...p,[f.key]:''})); }}
                            placeholder="••••••••" />
                          <button type="button" onClick={f.toggle}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--t4) hover:text-(--t2) transition-colors">
                            {f.show ? <EyeOff size={15}/> : <Eye size={15}/>}
                          </button>
                        </div>
                        {pwErrors[f.key] && <p className="text-xs text-red-500 mt-1">{pwErrors[f.key]}</p>}
                      </div>
                    ))}
                    <div className="flex gap-3 pt-1">
                      <button onClick={handleUpdatePassword} disabled={pwLoading}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-all active:scale-95"
                        style={{ background:`linear-gradient(135deg,${P2},${P})`, boxShadow:`0 4px 14px rgba(37,99,235,0.28)` }}>
                        {pwLoading ? <Loader2 size={14} className="animate-spin"/> : <Lock size={14}/>}
                        {pwLoading ? 'Mise à jour…' : 'Mettre à jour'}
                      </button>
                      <button onClick={() => { setPwOpen(false); setPwErrors({}); setPwData({ current:'',next:'',confirm:'' }); }}
                        className="px-4 py-2.5 text-sm font-semibold text-(--t2) border border-(--ln) rounded-xl hover:bg-(--sf2) transition-colors">
                        Annuler
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Données */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.10, duration:0.3 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-(--ln)">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-500/10 flex items-center justify-center">
                <Smartphone size={14} className="text-slate-600 dark:text-slate-400" />
              </div>
              <span className="text-sm font-bold text-(--t1)">Données & Compte</span>
            </div>
            <div className="divide-y divide-(--ln)">
              <button onClick={handleExportData}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-(--sf2) transition-colors text-left">
                <div className="flex items-center gap-3">
                  <Download size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-(--t1)">Exporter mes données</p>
                    <p className="text-xs text-(--t4)">Télécharger vos préférences en JSON</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-(--t4)" />
              </button>
              <button onClick={() => toast.error('Pour supprimer votre compte, contactez le support à contact@pneumoia.cm', { duration: 6000 })}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <Trash2 size={15} className="text-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">Supprimer le compte</p>
                    <p className="text-xs text-red-400">Cette action est irréversible</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-red-400" />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <p className="text-center text-[10px] text-(--t4) pb-4">PneumoIA v2.0 · 2026</p>
    </div>
  );
}
