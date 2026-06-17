import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Moon, Sun, Bell, Shield, LogOut,
  Lock, Check, AlertCircle, Eye, EyeOff,
  Loader2, Palette, User
} from 'lucide-react';
import { useTheme } from '../../medecin/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const P  = '#2563eb';
const P2 = '#1d4ed8';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const inp = 'w-full px-3.5 py-2.5 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:border-blue-400 transition-all pr-10';

function hdrs() {
  return { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('token')}` };
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
      style={{ background: value ? P : 'var(--sf3)' }}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SectionCard({ icon: Icon, iconCls, title, delay = 0, children }) {
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay, duration:0.3 }}
      className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm">
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

  const [pw, setPw]             = useState({ ancien:'', nouveau:'' });
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError,  setPwError]  = useState('');
  const [pwOk,     setPwOk]     = useState(false);

  const handleSaveNotifs = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const handleChangePassword = async () => {
    if (!pw.ancien || !pw.nouveau) { setPwError('Remplissez les deux champs.'); return; }
    if (pw.nouveau.length < 6)    { setPwError('Minimum 6 caractères.'); return; }
    setPwSaving(true); setPwError('');
    try {
      const res  = await fetch(`${API_URL}/aides/me/password`, { method:'PATCH', headers:hdrs(), body:JSON.stringify({ ancien_password:pw.ancien, nouveau_password:pw.nouveau }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');
      setPwOk(true); setPw({ ancien:'', nouveau:'' });
      setTimeout(() => setPwOk(false), 3500);
    } catch (err) { setPwError(err.message || 'Erreur réseau.'); }
    finally { setPwSaving(false); }
  };

  const logout = () => {
    ['token','token_type','role','aide_id','aide_nom','aide_permissions'].forEach(k => localStorage.removeItem(k));
    navigate('/');
  };

  return (
    <div className="space-y-5 w-full max-w-3xl mx-auto">

      {/* ── Header ─── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="relative rounded-2xl overflow-hidden"
        style={{ background:`linear-gradient(135deg,${P2} 0%,${P} 55%,#3b82f6 100%)`, boxShadow:`0 8px 32px rgba(37,99,235,0.25)` }}>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-15"
          style={{ background:'radial-gradient(circle,#bfdbfe,transparent)' }} />
        <div style={{ position:'absolute', inset:0, opacity:0.06, backgroundImage:'radial-gradient(circle at 2px 2px,#fff 1px,transparent 0)', backgroundSize:'18px 18px' }} />
        <div className="relative px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.28)' }}>
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <p className="text-blue-200/80 text-[10px] font-black uppercase tracking-widest">Configuration</p>
            <h1 className="text-xl font-black text-white">Paramètres</h1>
          </div>
        </div>
      </motion.div>

      {/* Saved toast */}
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="flex items-center gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium">
            <Check size={15} className="shrink-0" /> Préférences enregistrées.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apparence */}
      <SectionCard icon={Palette} iconCls="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400" title="Apparence" delay={0.06}>
        <Row label="Thème d'interface"
          description={theme === 'dark' ? 'Mode sombre activé' : 'Mode clair activé'}
          right={
            <button onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-(--ln) hover:bg-(--sf2) transition-colors text-sm font-bold text-(--t2)">
              {theme === 'dark' ? <><Sun size={14}/> Mode clair</> : <><Moon size={14}/> Mode sombre</>}
            </button>
          }
        />
      </SectionCard>

      {/* Notifications */}
      <SectionCard icon={Bell} iconCls="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" title="Notifications" delay={0.10}>
        <Row label="Notifications email" description="Recevoir les alertes par email" right={<Toggle value={notifEmail} onChange={setNotifEmail} />} />
        <Row label="Notifications système" description="Alertes dans l'interface PneumoIA" right={<Toggle value={notifSys} onChange={setNotifSys} />} />
        <Row label="Alerte code référent" description="Notifié lors d'un changement de code" right={<Toggle value={notifCode} onChange={setNotifCode} />} />
        <div className="px-5 py-4">
          <button onClick={handleSaveNotifs}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all active:scale-95"
            style={{ background:`linear-gradient(135deg,${P2},${P})`, boxShadow:`0 4px 14px rgba(37,99,235,0.28)` }}>
            <Check size={14} /> Enregistrer
          </button>
        </div>
      </SectionCard>

      {/* Sécurité */}
      <SectionCard icon={Lock} iconCls="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" title="Sécurité — Mot de passe" delay={0.14}>
        <div className="px-5 py-5 space-y-4">
          <AnimatePresence>
            {pwOk && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                <Check size={14} className="shrink-0" /> Mot de passe modifié avec succès.
              </motion.div>
            )}
            {pwError && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-300 text-sm">
                <AlertCircle size={14} className="shrink-0" /> {pwError}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key:'ancien',  label:'Mot de passe actuel',  show:showOld, toggle:()=>setShowOld(s=>!s) },
              { key:'nouveau', label:'Nouveau mot de passe', show:showNew, toggle:()=>setShowNew(s=>!s) },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-(--t4) mb-1.5">{f.label}</label>
                <div className="relative">
                  <input type={f.show?'text':'password'} className={inp} value={pw[f.key]}
                    onChange={e => setPw(p=>({...p,[f.key]:e.target.value}))} placeholder="••••••••" />
                  <button type="button" onClick={f.toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--t4) hover:text-(--t2) transition-colors">
                    {f.show ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleChangePassword} disabled={pwSaving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-all active:scale-95"
            style={{ background:`linear-gradient(135deg,${P2},${P})`, boxShadow:`0 4px 14px rgba(37,99,235,0.28)` }}>
            {pwSaving ? <Loader2 size={14} className="animate-spin"/> : <Lock size={14}/>}
            {pwSaving ? 'Modification…' : 'Modifier le mot de passe'}
          </button>
        </div>
      </SectionCard>

      {/* Compte */}
      <SectionCard icon={User} iconCls="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" title="Mon compte" delay={0.18}>
        <Row label="Identifiant" description="Votre identifiant unique"
          right={<span className="text-xs text-(--t3) font-mono px-2.5 py-1.5 bg-(--sf2) rounded-lg border border-(--ln)">{aideId || '—'}</span>} />
        <Row label="Rôle" description="Niveau d'accès sur la plateforme"
          right={
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border"
              style={{ background:'rgba(37,99,235,0.06)', color:P, borderColor:'rgba(37,99,235,0.18)' }}>
              <Shield size={10}/> Aide soignant
            </span>
          }
        />
      </SectionCard>

      {/* Danger zone */}
      <SectionCard icon={AlertCircle} iconCls="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" title="Zone de danger" delay={0.22}>
        <Row label="Déconnexion" description="Fermer votre session sur cet appareil"
          right={
            <button onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 bg-(--sf) border border-red-100 dark:border-red-500/20 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <LogOut size={13}/> Déconnexion
            </button>
          }
        />
      </SectionCard>

      <p className="text-center text-[10px] text-(--t4) pb-4">PneumoIA v2.0 · 2026</p>
    </div>
  );
}
