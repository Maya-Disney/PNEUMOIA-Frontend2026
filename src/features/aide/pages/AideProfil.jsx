import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircle, Mail, Phone, Shield,
  Edit3, CheckCircle, Loader2, AlertCircle, Save, X,
  Eye, EyeOff, Lock
} from 'lucide-react';

const RED = '#DC2626';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const PERM_LABELS = {
  peut_creer_patient:    'Créer des patients',
  peut_lire_dossier:     'Lire les dossiers',
  peut_modifier_patient: 'Modifier les patients',
  peut_saisir_symptomes: 'Saisir des symptômes',
  peut_voir_diagnostic:  'Voir les diagnostics IA',
  peut_supprimer:        'Supprimer des données',
  peut_prescrire:        'Prescrire',
};

const inp = 'w-full px-3 py-2.5 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-red-300 transition';

function hdrs() {
  return { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('token')}` };
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-8 h-8 rounded-lg bg-(--sf2) border border-(--ln) flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-(--t3)" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-(--t4)">{label}</p>
        <p className="text-sm font-semibold text-(--t1) mt-0.5 break-all">
          {value || <span className="text-(--t4) italic font-normal">Non renseigné</span>}
        </p>
      </div>
    </div>
  );
}

export default function AideProfil() {
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);
  const [error,    setError]    = useState('');
  const [pwMode,   setPwMode]   = useState(false);
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError,  setPwError]  = useState('');
  const [pw, setPw] = useState({ ancien:'', nouveau:'' });

  const aideId  = localStorage.getItem('aide_id')  || '';
  const aideNom = localStorage.getItem('aide_nom')  || '';
  const perms   = (() => { try { return JSON.parse(localStorage.getItem('aide_permissions') || '{}'); } catch { return {}; } })();
  const activePerms = Object.entries(perms).filter(([,v]) => v).map(([k]) => k);

  const nameParts = aideNom.trim().split(' ');
  const initials  = nameParts.length >= 2
    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    : aideNom.slice(0,2).toUpperCase();

  const [profile, setProfile] = useState({
    prenom:    nameParts[0] || '',
    nom:       nameParts.slice(1).join(' ') || '',
    email:     '',
    telephone: '',
  });
  const [draft, setDraft] = useState({ ...profile });

  // Charger profil depuis l'API au montage
  useEffect(() => {
    fetch(`${API_URL}/aides/me`, { headers: hdrs() })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const updated = {
          prenom:    d.prenom    || '',
          nom:       d.nom       || '',
          email:     d.email     || '',
          telephone: d.telephone || '',
        };
        setProfile(updated);
        setDraft(updated);
        localStorage.setItem('aide_nom', `${d.prenom} ${d.nom}`);
        if (d.telephone) localStorage.setItem('aide_telephone', d.telephone);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    if (!draft.prenom.trim() || !draft.nom.trim()) {
      setError('Le prénom et le nom sont obligatoires.'); return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API_URL}/aides/me`, {
        method: 'PATCH',
        headers: hdrs(),
        body: JSON.stringify({
          prenom:    draft.prenom.trim(),
          nom:       draft.nom.trim(),
          telephone: draft.telephone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur lors de la mise à jour');
      const updated = { prenom: data.prenom, nom: data.nom, email: data.email, telephone: data.telephone || '' };
      setProfile(updated);
      setDraft(updated);
      localStorage.setItem('aide_nom', `${data.prenom} ${data.nom}`);
      if (data.telephone) localStorage.setItem('aide_telephone', data.telephone);
      setEditing(false);
      showToast('Profil mis à jour avec succès.');
    } catch (err) {
      setError(err.message || 'Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pw.ancien || !pw.nouveau) { setPwError('Remplissez les deux champs.'); return; }
    if (pw.nouveau.length < 8) { setPwError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (pw.nouveau === pw.ancien) { setPwError('Le nouveau mot de passe doit être différent de l\'ancien.'); return; }
    setPwSaving(true); setPwError('');
    try {
      const res = await fetch(`${API_URL}/aides/me/password`, {
        method:  'PATCH',
        headers: hdrs(),
        body:    JSON.stringify({ ancien_password: pw.ancien, nouveau_password: pw.nouveau }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur lors du changement de mot de passe');
      setPwMode(false);
      setPw({ ancien:'', nouveau:'' });
      showToast('Mot de passe modifié avec succès.');
    } catch (err) {
      setPwError(err.message || 'Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-6xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}>
        <p className="text-[10px] font-black uppercase tracking-widest text-(--t3) flex items-center gap-1.5 mb-0.5">
          <UserCircle className="w-3 h-3" style={{ color:RED }} /> Mon compte
        </p>
        <h1 className="text-xl font-black text-(--t1)">Mon profil</h1>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className={`flex items-center gap-2 p-3 rounded-xl text-sm border ${
              toast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300'
            }`}>
            <CheckCircle className="w-4 h-4 shrink-0" /> {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar card */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="bg-(--sf) border border-(--ln) rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl text-white text-2xl font-black flex items-center justify-center shrink-0 shadow-lg"
          style={{ background:`linear-gradient(135deg,${RED},#991B1B)` }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black text-(--t1) truncate">{aideNom || 'Aide soignant'}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-(--t4) font-mono">{aideId}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/15">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Aide soignant
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/15">
              <CheckCircle className="w-3 h-3" /> Compte actif
            </span>
          </div>
        </div>
        <button onClick={() => { setEditing(e => !e); setDraft({ ...profile }); setError(''); }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-(--ln) rounded-xl hover:bg-(--sf2) transition-colors text-(--t2) shrink-0">
          {editing ? <><X className="w-3.5 h-3.5" /> Annuler</> : <><Edit3 className="w-3.5 h-3.5" /> Modifier</>}
        </button>
      </motion.div>

      {/* Info / Edit card */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-(--ln) bg-(--sf2)">
          <UserCircle className="w-4 h-4" style={{ color:RED }} />
          <span className="text-xs font-black uppercase tracking-[0.15em] text-(--t2)">Informations personnelles</span>
        </div>
        <div className="p-5">
          {!editing ? (
            <div className="divide-y divide-(--ln)">
              <InfoRow icon={UserCircle} label="Prénom"    value={profile.prenom}    />
              <InfoRow icon={UserCircle} label="Nom"       value={profile.nom}       />
              <InfoRow icon={Mail}       label="Email"     value={profile.email}     />
              <InfoRow icon={Phone}      label="Téléphone" value={profile.telephone} />
            </div>
          ) : (
            <div className="space-y-3">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key:'prenom',    label:'Prénom',    type:'text', ph:'Prénom'          },
                  { key:'nom',       label:'Nom',       type:'text', ph:'Nom de famille'  },
                  { key:'telephone', label:'Téléphone', type:'tel',  ph:'+237 6XX XXX XXX'},
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-(--t3) mb-1">{f.label}</label>
                    <input type={f.type} className={inp} value={draft[f.key]}
                      onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))} placeholder={f.ph} />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-(--t3) mb-1">Email</label>
                  <input type="email" className={`${inp} opacity-60 cursor-not-allowed`} value={profile.email} readOnly
                    title="L'email ne peut pas être modifié ici" />
                  <p className="text-[10px] text-(--t4) mt-0.5">L'email ne peut pas être modifié.</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-all"
                  style={{ backgroundColor:RED }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mot de passe */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
        className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
        <button onClick={() => { setPwMode(m => !m); setPwError(''); setPw({ ancien:'', nouveau:'' }); }}
          className="w-full flex items-center gap-2 px-5 py-4 border-b border-(--ln) bg-(--sf2) hover:bg-(--sf3) transition-colors">
          <Lock className="w-4 h-4" style={{ color:RED }} />
          <span className="text-xs font-black uppercase tracking-[0.15em] text-(--t2) flex-1 text-left">Changer le mot de passe</span>
          <span className="text-[10px] font-semibold text-(--t4)">{pwMode ? 'Masquer' : 'Modifier'}</span>
        </button>
        <AnimatePresence>
          {pwMode && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
              className="overflow-hidden">
              <div className="p-5 space-y-3">
                {pwError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-300 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {pwError}
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-(--t3) mb-1">Mot de passe actuel</label>
                  <div className="relative">
                    <input type={showOld ? 'text' : 'password'} className={inp + ' pr-10'} value={pw.ancien}
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
                    <input type={showNew ? 'text' : 'password'} className={inp + ' pr-10'} value={pw.nouveau}
                      onChange={e => setPw(p => ({ ...p, nouveau: e.target.value }))} placeholder="Minimum 6 caractères" />
                    <button type="button" onClick={() => setShowNew(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--t4) hover:text-(--t2) transition-colors">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleChangePassword} disabled={pwSaving}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-all"
                    style={{ backgroundColor:RED }}>
                    {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    {pwSaving ? 'Modification…' : 'Modifier le mot de passe'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Permissions card */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
        className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-(--ln) bg-(--sf2)">
          <Shield className="w-4 h-4" style={{ color:RED }} />
          <span className="text-xs font-black uppercase tracking-[0.15em] text-(--t2)">Mes permissions</span>
          <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/15">
            {activePerms.length}/{Object.keys(PERM_LABELS).length} actifs
          </span>
        </div>
        <div className="p-5 space-y-2">
          {Object.entries(PERM_LABELS).map(([k, label], i) => {
            const active = !!perms[k];
            return (
              <div key={k}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  active
                    ? 'bg-emerald-50 dark:bg-emerald-500/8 border-emerald-100 dark:border-emerald-500/15'
                    : 'bg-(--sf2) border-(--ln) opacity-55'
                }`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-emerald-500' : 'bg-(--t4)'}`} />
                <span className={`text-sm font-semibold flex-1 ${active ? 'text-emerald-800 dark:text-emerald-200' : 'text-(--t3)'}`}>
                  {label}
                </span>
                {active && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
              </div>
            );
          })}
          <p className="text-[11px] text-(--t4) pt-2">
            Les permissions sont attribuées par votre médecin référent.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
