import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Moon, Sun, Bell, Lock,
  Check, AlertTriangle, Eye, EyeOff, Loader2, AlertCircle, IdCard, LogOut,
} from 'lucide-react';
import { useTheme } from '../../medecin/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const hdrs    = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });
const inputCls = 'w-full px-3 py-2 text-sm border border-(--ln) rounded-lg bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-emerald-500 transition pr-10';
const labelCls = 'block text-xs font-medium text-(--t3) mb-1';

function Toggle({ value, onChange, disabled }) {
  return (
    <button onClick={() => !disabled && onChange(!value)} disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-40 ${value ? 'bg-emerald-600' : 'bg-(--sf3) border border-(--ln)'}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function Card({ icon: Icon, iconColor = 'text-emerald-600', title, delay = 0, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}
      className="bg-(--sf) border border-(--ln) rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-(--ln) bg-(--sf2)">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-sm font-semibold text-(--t1)">{title}</span>
      </div>
      <div className="divide-y divide-(--ln)">{children}</div>
    </motion.div>
  );
}

function Row({ label, description, right }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-(--t1)">{label}</p>
        {description && <p className="text-xs text-(--t4) mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

const DEFAULT_PREFS = {
  notif_email:         true,
  notif_systeme:       true,
  notif_code_referent: true,
  theme:               'light',
};

export default function AideParametres() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const aideId = localStorage.getItem('aide_id') || '';

  // ── Préférences ──────────────────────────────────────────────────
  const [prefs,      setPrefs]      = useState(DEFAULT_PREFS);
  const [prefsLoad,  setPrefsLoad]  = useState(true);
  const [prefsSaving,setPrefsSaving]= useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [prefsError, setPrefsError] = useState('');

  // ── Mot de passe ─────────────────────────────────────────────────
  const [pw,       setPw]       = useState({ ancien: '', nouveau: '' });
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError,  setPwError]  = useState('');
  const [pwOk,     setPwOk]     = useState(false);

  // ── Charger les préférences depuis le backend ────────────────────
  useEffect(() => {
    fetch(`${API_URL}/aides/me/preferences`, { headers: hdrs() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setPrefs(prev => ({ ...prev, ...d })); })
      .catch(() => {})
      .finally(() => setPrefsLoad(false));
  }, []);

  // ── Sauvegarder les préférences ───────────────────────────────────
  const savePrefs = async () => {
    setPrefsSaving(true); setPrefsError('');
    try {
      const toSend = { ...prefs, theme };   // Sync theme depuis useTheme
      const res  = await fetch(`${API_URL}/aides/me/preferences`, {
        method: 'PATCH', headers: hdrs(), body: JSON.stringify(toSend),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');
      setPrefs(data);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2500);
    } catch (err) {
      setPrefsError(err.message || 'Erreur réseau');
    } finally {
      setPrefsSaving(false);
    }
  };

  const setPref = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  // ── Changer mot de passe ─────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!pw.ancien || !pw.nouveau) { setPwError('Remplissez les deux champs.'); return; }
    if (pw.nouveau.length < 6)     { setPwError('Minimum 6 caractères.'); return; }
    setPwSaving(true); setPwError('');
    try {
      const res  = await fetch(`${API_URL}/aides/me/password`, {
        method: 'PATCH', headers: hdrs(),
        body: JSON.stringify({ ancien_password: pw.ancien, nouveau_password: pw.nouveau }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');
      setPwOk(true);
      setPw({ ancien: '', nouveau: '' });
      setTimeout(() => setPwOk(false), 3500);
    } catch (err) {
      setPwError(err.message || 'Erreur réseau.');
    } finally {
      setPwSaving(false);
    }
  };

  const logout = () => {
    ['token','token_type','role','aide_id','aide_nom','aide_permissions'].forEach(k => localStorage.removeItem(k));
    navigate('/');
  };

  return (
    <div className="w-full space-y-5">

      {/* En-tête */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold text-(--t1)">Paramètres</h1>
        <p className="text-sm text-(--t3) mt-1">Configuration de votre espace aide soignant</p>
      </motion.div>

      {/* Banner succès global */}
      <AnimatePresence>
        {prefsSaved && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm">
            <Check className="w-4 h-4 shrink-0" /> Préférences enregistrées sur le serveur.
          </motion.div>
        )}
        {prefsError && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {prefsError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Apparence ───────────────────────────────────────────── */}
      <Card icon={Sun} title="Apparence" delay={0.05}>
        <Row label="Thème de l'interface"
          description={theme === 'dark' ? 'Mode sombre activé' : 'Mode clair activé'}
          right={
            <button onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-(--ln) hover:bg-(--sf2) transition-colors text-sm font-medium text-(--t2)">
              {theme === 'dark' ? <><Sun className="w-4 h-4" /> Mode clair</> : <><Moon className="w-4 h-4" /> Mode sombre</>}
            </button>
          }
        />
      </Card>

      {/* ── Notifications ────────────────────────────────────────── */}
      <Card icon={Bell} title="Notifications" delay={0.1}>
        {prefsLoad ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>
        ) : (
          <>
            <Row label="Notifications par email"
              description="Recevoir les alertes importantes par email"
              right={<Toggle value={prefs.notif_email} onChange={v => setPref('notif_email', v)} />} />
            <Row label="Notifications système"
              description="Alertes dans l'interface PneumoIA"
              right={<Toggle value={prefs.notif_systeme} onChange={v => setPref('notif_systeme', v)} />} />
            <Row label="Alerte code référent"
              description="Notifié lors d'un changement de code référent"
              right={<Toggle value={prefs.notif_code_referent} onChange={v => setPref('notif_code_referent', v)} />} />
            <div className="px-5 py-3 flex items-center gap-3">
              <button onClick={savePrefs} disabled={prefsSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {prefsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {prefsSaving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <span className="text-xs text-(--t4)">Synchronisé avec le serveur</span>
            </div>
          </>
        )}
      </Card>

      {/* ── Sécurité ─────────────────────────────────────────────── */}
      <Card icon={Lock} title="Sécurité" delay={0.15}>
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-(--t1)">Changer le mot de passe</p>
            <p className="text-xs text-(--t4) mt-0.5">Utilisez un mot de passe d'au moins 6 caractères.</p>
          </div>

          <AnimatePresence>
            {pwOk && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm">
                <Check className="w-4 h-4 shrink-0" /> Mot de passe modifié avec succès.
              </motion.div>
            )}
            {pwError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 rounded-xl text-red-700 dark:text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {pwError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Mot de passe actuel</label>
              <div className="relative">
                <input type={showOld ? 'text' : 'password'} className={inputCls} value={pw.ancien}
                  onChange={e => setPw(p => ({ ...p, ancien: e.target.value }))} placeholder="••••••••" />
                <button type="button" onClick={() => setShowOld(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--t4) hover:text-(--t2) transition-colors">
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Nouveau mot de passe</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} className={inputCls} value={pw.nouveau}
                  onChange={e => setPw(p => ({ ...p, nouveau: e.target.value }))} placeholder="Minimum 6 caractères" />
                <button type="button" onClick={() => setShowNew(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--t4) hover:text-(--t2) transition-colors">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <button onClick={handleChangePassword} disabled={pwSaving}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors">
            {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {pwSaving ? 'Modification…' : 'Modifier le mot de passe'}
          </button>
        </div>
      </Card>

      {/* ── Compte ───────────────────────────────────────────────── */}
      <Card icon={IdCard} title="Mon compte" delay={0.2}>
        <Row label="Identifiant"
          description="Votre identifiant unique sur la plateforme"
          right={<span className="text-xs text-(--t3) font-mono px-2.5 py-1 bg-(--sf2) rounded-lg border border-(--ln)">{aideId}</span>}
        />
        <Row label="Rôle"
          description="Votre niveau d'accès sur PneumoIA"
          right={
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
              Aide soignant
            </span>
          }
        />
      </Card>

      {/* ── Danger ───────────────────────────────────────────────── */}
      <Card icon={AlertTriangle} iconColor="text-red-500" title="Zone de danger" delay={0.25}>
        <Row label="Déconnexion"
          description="Fermer votre session sur cet appareil"
          right={
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 dark:border-red-500/25 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Déconnexion
            </button>
          }
        />
      </Card>

      <p className="text-center text-xs text-(--t4) pb-2">PneumoIA v2.0 · 2026</p>
    </div>
  );
}
