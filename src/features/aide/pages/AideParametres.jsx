import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Moon, Sun, Bell, Globe,
  Shield, LogOut, Lock, Check, AlertTriangle,
  Eye, EyeOff, Loader2, AlertCircle
} from 'lucide-react';
import { useTheme } from '../../medecin/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const RED = '#DC2626';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const inp = 'w-full px-3 py-2.5 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-red-300 transition pr-10';

function hdrs() {
  return { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('token')}` };
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${value ? 'bg-emerald-500' : 'bg-(--sf3)'}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function Section({ icon: Icon, title, delay=0, children }) {
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay }}
      className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-(--ln) bg-(--sf2)">
        <Icon className="w-4 h-4" style={{ color:RED }} />
        <span className="text-xs font-black uppercase tracking-[0.15em] text-(--t2)">{title}</span>
      </div>
      <div className="divide-y divide-(--ln)">{children}</div>
    </motion.div>
  );
}

function Row({ label, description, right }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-(--t1)">{label}</p>
        {description && <p className="text-xs text-(--t4) mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

export default function AideParametres() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const aideId   = localStorage.getItem('aide_id') || '';

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSys,   setNotifSys]   = useState(true);
  const [notifCode,  setNotifCode]  = useState(true);
  const [saved,      setSaved]      = useState(false);

  const [pw, setPw]         = useState({ ancien:'', nouveau:'' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError,  setPwError]  = useState('');
  const [pwOk,     setPwOk]     = useState(false);

  const handleSaveNotifs = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangePassword = async () => {
    if (!pw.ancien || !pw.nouveau) { setPwError('Remplissez les deux champs.'); return; }
    if (pw.nouveau.length < 6) { setPwError('Minimum 6 caractères.'); return; }
    setPwSaving(true); setPwError('');
    try {
      const res = await fetch(`${API_URL}/aides/me/password`, {
        method:  'PATCH',
        headers: hdrs(),
        body:    JSON.stringify({ ancien_password: pw.ancien, nouveau_password: pw.nouveau }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');
      setPwOk(true);
      setPw({ ancien:'', nouveau:'' });
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
    <div className="space-y-4 w-full max-w-6xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}>
        <p className="text-[10px] font-black uppercase tracking-widest text-(--t3) flex items-center gap-1.5 mb-0.5">
          <Settings className="w-3 h-3" style={{ color:RED }} /> Configuration
        </p>
        <h1 className="text-xl font-black text-(--t1)">Paramètres</h1>
      </motion.div>

      {saved && (
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm">
          <Check className="w-4 h-4 shrink-0" /> Paramètres enregistrés.
        </motion.div>
      )}

      {/* Apparence */}
      <Section icon={Sun} title="Apparence" delay={0.05}>
        <Row label="Thème"
          description={theme === 'dark' ? 'Mode sombre activé' : 'Mode clair activé'}
          right={
            <button onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-(--ln) hover:bg-(--sf2) transition-colors text-sm font-semibold text-(--t2)">
              {theme === 'dark' ? <><Sun className="w-4 h-4" /> Mode clair</> : <><Moon className="w-4 h-4" /> Mode sombre</>}
            </button>
          }
        />
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications" delay={0.1}>
        <Row label="Notifications email"
          description="Recevoir les alertes de la plateforme par email"
          right={<Toggle value={notifEmail} onChange={setNotifEmail} />}
        />
        <Row label="Notifications système"
          description="Alertes dans l'interface PneumoIA"
          right={<Toggle value={notifSys} onChange={setNotifSys} />}
        />
        <Row label="Alerte code référent"
          description="Notifié lors d'un changement de code référent"
          right={<Toggle value={notifCode} onChange={setNotifCode} />}
        />
        <div className="px-5 py-3">
          <button onClick={handleSaveNotifs}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl transition-all"
            style={{ backgroundColor:RED }}>
            <Check className="w-4 h-4" /> Enregistrer
          </button>
        </div>
      </Section>

      {/* Sécurité — mot de passe */}
      <Section icon={Lock} title="Sécurité" delay={0.15}>
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm font-semibold text-(--t1)">Changer le mot de passe</p>
          <p className="text-xs text-(--t4)">Utilisez un mot de passe d'au moins 6 caractères.</p>

          <AnimatePresence>
            {pwOk && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm">
                <Check className="w-4 h-4 shrink-0" /> Mot de passe modifié avec succès.
              </motion.div>
            )}
            {pwError && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {pwError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-(--t3) mb-1">Mot de passe actuel</label>
              <div className="relative">
                <input type={showOld ? 'text' : 'password'} className={inp} value={pw.ancien}
                  onChange={e => setPw(p => ({ ...p, ancien: e.target.value }))} placeholder="••••••••" />
                <button type="button" onClick={() => setShowOld(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--t4) hover:text-(--t2) transition-colors">
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-(--t3) mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} className={inp} value={pw.nouveau}
                  onChange={e => setPw(p => ({ ...p, nouveau: e.target.value }))} placeholder="Minimum 6 caractères" />
                <button type="button" onClick={() => setShowNew(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--t4) hover:text-(--t2) transition-colors">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex">
            <button onClick={handleChangePassword} disabled={pwSaving}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-all"
              style={{ backgroundColor:RED }}>
              {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {pwSaving ? 'Modification…' : 'Modifier le mot de passe'}
            </button>
          </div>
        </div>
      </Section>

      {/* Compte */}
      <Section icon={Shield} title="Compte" delay={0.2}>
        <Row label="Identifiant"
          description={aideId}
          right={<span className="text-xs text-(--t4) font-mono px-2 py-1 bg-(--sf2) rounded-lg border border-(--ln)">{aideId}</span>}
        />
        <Row label="Rôle"
          right={
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/15">
              Aide soignant
            </span>
          }
        />
      </Section>

      {/* Danger */}
      <Section icon={AlertTriangle} title="Zone de danger" delay={0.25}>
        <Row label="Déconnexion"
          description="Fermer votre session sur cet appareil"
          right={
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 dark:border-red-500/25 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Déconnexion
            </button>
          }
        />
      </Section>

      <p className="text-center text-[10px] text-(--t4) pb-4">PneumoIA v2.0 · 2026</p>
    </div>
  );
}
