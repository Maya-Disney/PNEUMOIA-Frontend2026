import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Shield,
  Edit2, Save, CheckCircle, Loader2, AlertCircle, X,
  Eye, EyeOff, Lock, KeyRound,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const hdrs    = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

const PERM_LABELS = {
  peut_creer_patient:    'Créer des patients',
  peut_lire_dossier:     'Lire les dossiers',
  peut_modifier_patient: 'Modifier les patients',
  peut_saisir_symptomes: 'Saisir des symptômes',
  peut_voir_diagnostic:  'Voir les diagnostics IA',
  peut_supprimer:        'Supprimer des données',
  peut_prescrire:        'Prescrire',
};

const inputCls = 'w-full px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-(--sf) text-(--t1) placeholder:text-(--t4)';
const labelCls = 'block text-xs font-medium text-(--t3) mb-1';

export default function AideProfil() {
  const aideId  = localStorage.getItem('aide_id')  || '';
  const [perms, setPerms] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aide_permissions') || '{}'); } catch { return {}; }
  });
  const activePerms = Object.entries(perms).filter(([, v]) => v).map(([k]) => k);

  const [isEditing,         setIsEditing]         = useState(false);
  const [isChangingPassword,setIsChangingPassword] = useState(false);
  const [saveLoading,       setSaveLoading]        = useState(false);
  const [saveError,         setSaveError]          = useState('');
  const [pwdLoading,        setPwdLoading]         = useState(false);
  const [pwdError,          setPwdError]           = useState('');
  const [pwdSuccess,        setPwdSuccess]         = useState(false);
  const [showOld,           setShowOld]            = useState(false);
  const [showNew,           setShowNew]            = useState(false);

  const [formData, setFormData] = useState({ prenom: '', nom: '', email: '', telephone: '' });
  const [draft,    setDraft]    = useState({ prenom: '', nom: '', email: '', telephone: '' });
  const [pwData,   setPwData]   = useState({ ancien: '', nouveau: '' });

  useEffect(() => {
    fetch(`${API_URL}/aides/me`, { headers: hdrs() })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const data = { prenom: d.prenom || '', nom: d.nom || '', email: d.email || '', telephone: d.telephone || '' };
        setFormData(data);
        setDraft(data);
        localStorage.setItem('aide_nom', `${d.prenom} ${d.nom}`);
        if (d.permissions) {
          setPerms(d.permissions);
          localStorage.setItem('aide_permissions', JSON.stringify(d.permissions));
        }
      })
      .catch(() => {});
  }, []);

  const initials = (() => {
    const parts = `${formData.prenom} ${formData.nom}`.trim().split(' ').filter(Boolean);
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : (parts[0]?.[0] || '?').toUpperCase();
  })();

  const startEditing = () => { setSaveError(''); setDraft({ ...formData }); setIsEditing(true); };
  const handleCancel = () => { setDraft({ ...formData }); setSaveError(''); setIsEditing(false); };

  const handleSave = async () => {
    if (!draft.prenom.trim() || !draft.nom.trim()) { setSaveError('Le prénom et le nom sont obligatoires.'); return; }
    setSaveLoading(true); setSaveError('');
    try {
      const res = await fetch(`${API_URL}/aides/me`, {
        method: 'PATCH', headers: hdrs(),
        body: JSON.stringify({ prenom: draft.prenom.trim(), nom: draft.nom.trim(), telephone: draft.telephone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur lors de la mise à jour');
      const updated = { prenom: data.prenom, nom: data.nom, email: data.email, telephone: data.telephone || '' };
      setFormData(updated); setDraft(updated);
      localStorage.setItem('aide_nom', `${data.prenom} ${data.nom}`);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message || 'Erreur réseau.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwData.ancien || !pwData.nouveau) { setPwdError('Remplissez les deux champs.'); return; }
    if (pwData.nouveau.length < 8) { setPwdError('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return; }
    if (pwData.nouveau === pwData.ancien) { setPwdError('Le nouveau mot de passe doit être différent de l\'ancien.'); return; }
    setPwdLoading(true); setPwdError('');
    try {
      const res = await fetch(`${API_URL}/aides/me/password`, {
        method: 'PATCH', headers: hdrs(),
        body: JSON.stringify({ ancien_password: pwData.ancien, nouveau_password: pwData.nouveau }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur lors du changement de mot de passe');
      setPwdSuccess(true);
      setTimeout(() => {
        setIsChangingPassword(false);
        setPwData({ ancien: '', nouveau: '' });
        setPwdSuccess(false);
      }, 2000);
    } catch (err) {
      setPwdError(err.message || 'Erreur réseau.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">

      {/* ── HERO BANNER ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="rounded-2xl overflow-hidden shadow-xl"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="relative p-6 overflow-hidden">
          <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #f43f5e, transparent)' }} />
          <div className="absolute -left-10 bottom-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }} />

          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg border border-white/10 shrink-0">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-medium mb-0.5">Mon profil</p>
                <h1 className="text-2xl font-bold text-white leading-tight">{formData.prenom} {formData.nom}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-500/30 text-rose-300 bg-rose-500/10">
                    <User size={9} /> Aide soignant
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{aideId}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Actif
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {!isEditing && !isChangingPassword && (
                <button onClick={() => { setIsChangingPassword(true); setPwdError(''); setPwdSuccess(false); setPwData({ ancien: '', nouveau: '' }); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/15 text-white/80 hover:bg-white/10 transition-all">
                  <KeyRound className="w-4 h-4" />Mot de passe
                </button>
              )}
              {isEditing && (
                <button onClick={handleCancel} disabled={saveLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/15 text-white/80 hover:bg-white/10 transition-all disabled:opacity-60">
                  <X className="w-4 h-4" />Annuler
                </button>
              )}
              {!isChangingPassword && (
                <button onClick={() => isEditing ? handleSave() : startEditing()} disabled={saveLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60
                    ${isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                  {isEditing
                    ? saveLoading
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sauvegarde…</>
                      : <><Save className="w-4 h-4" />Sauvegarder</>
                    : <><Edit2 className="w-4 h-4" />Modifier</>}
                </button>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/8">
            {[
              { label: 'Permissions actives', value: activePerms.length },
              { label: 'Total permissions',   value: Object.keys(PERM_LABELS).length },
              { label: 'Accès bloqués',       value: Object.keys(PERM_LABELS).length - activePerms.length },
            ].map(s => (
              <div key={s.label} className="rounded-xl px-3 py-2.5 bg-white/5 border border-white/8 text-center">
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Changement de mot de passe */}
      <AnimatePresence>
        {isChangingPassword && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">
            <div className="p-5 border-b border-(--ln) bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                  <h3 className="font-semibold text-(--t1)">Changer le mot de passe</h3>
                </div>
                <button onClick={() => { setIsChangingPassword(false); setPwdError(''); setPwData({ ancien: '', nouveau: '' }); }}
                  className="text-sm text-(--t3) hover:text-(--t1)">Annuler</button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {pwdError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />{pwdError}
                </div>
              )}
              {pwdSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm">
                  <CheckCircle className="w-4 h-4" />Mot de passe modifié avec succès !
                </div>
              )}
              <div>
                <label className={labelCls}>Mot de passe actuel</label>
                <div className="relative">
                  <input type={showOld ? 'text' : 'password'} value={pwData.ancien}
                    onChange={e => setPwData(p => ({ ...p, ancien: e.target.value }))}
                    className={`${inputCls} pr-10`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowOld(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--t4) hover:text-(--t2)">
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Nouveau mot de passe</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} value={pwData.nouveau}
                    onChange={e => setPwData(p => ({ ...p, nouveau: e.target.value }))}
                    className={`${inputCls} pr-10`} placeholder="8 caractères minimum" />
                  <button type="button" onClick={() => setShowNew(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--t4) hover:text-(--t2)">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-(--t4) mt-1">Doit contenir au moins 8 caractères</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleChangePassword} disabled={pwdLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all disabled:opacity-60">
                  {pwdLoading
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Modification…</>
                    : 'Mettre à jour le mot de passe'}
                </button>
                <button onClick={() => { setIsChangingPassword(false); setPwdError(''); setPwData({ ancien: '', nouveau: '' }); }}
                  className="px-4 py-2 border border-(--ln) rounded-lg text-sm font-medium text-(--t2) hover:bg-(--sf2) transition-all">
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {saveError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />{saveError}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">

        {/* Colonne gauche */}
        <div className="space-y-5">
          {/* Compte */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-(--sf) border border-(--ln) rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-(--ln) bg-(--sf2)">
              <p className="text-sm font-semibold text-(--t1)">Informations du compte</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-(--t4)">Rôle</p>
                  <p className="text-sm font-semibold text-(--t1)">Aide soignant</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-(--t4)">Statut</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Compte actif</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-(--sf2) flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-(--t3)" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-(--t4)">Email</p>
                  <p className="text-sm font-medium text-(--t1) truncate">{formData.email || '—'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Permission progress */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-(--sf) border border-(--ln) rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-(--t1)">Accès configuré</p>
              <span className="text-sm font-black text-(--t1)">{Math.round((activePerms.length / Object.keys(PERM_LABELS).length) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-(--sf2) overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${Math.round((activePerms.length / Object.keys(PERM_LABELS).length) * 100)}%` }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                className="h-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-600" />
            </div>
            <div className="flex justify-between text-xs text-(--t4)">
              <span>{activePerms.length} actives</span>
              <span>{Object.keys(PERM_LABELS).length - activePerms.length} bloquées</span>
            </div>
          </motion.div>
        </div>

        {/* Colonne droite */}
        <div className="lg:col-span-2 space-y-5">

          {/* Informations personnelles */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">
            <div className="px-5 py-3.5 border-b border-(--ln) bg-(--sf2) flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-(--t1)">Informations personnelles</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Prénom</label>
                  {isEditing
                    ? <input type="text" value={draft.prenom} onChange={e => setDraft(d => ({ ...d, prenom: e.target.value }))} className={inputCls} placeholder="Prénom" />
                    : <p className="text-sm text-(--t1)">{formData.prenom || <span className="text-(--t4) italic">Non renseigné</span>}</p>}
                </div>
                <div>
                  <label className={labelCls}>Nom</label>
                  {isEditing
                    ? <input type="text" value={draft.nom} onChange={e => setDraft(d => ({ ...d, nom: e.target.value }))} className={inputCls} placeholder="Nom de famille" />
                    : <p className="text-sm text-(--t1)">{formData.nom || <span className="text-(--t4) italic">Non renseigné</span>}</p>}
                </div>
              </div>
              <div>
                <label className={labelCls}>Email <span className="text-(--t4) font-normal normal-case">(non modifiable)</span></label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-(--t4)" />
                  <p className="text-sm text-(--t1)">{formData.email || <span className="text-(--t4) italic">Non renseigné</span>}</p>
                </div>
              </div>
              <div>
                <label className={labelCls}>Téléphone</label>
                {isEditing
                  ? <input type="tel" value={draft.telephone} onChange={e => setDraft(d => ({ ...d, telephone: e.target.value }))} className={inputCls} placeholder="+237 6XX XXX XXX" />
                  : <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-(--t4)" />
                      <p className="text-sm text-(--t1)">{formData.telephone || <span className="text-(--t4) italic">Non renseigné</span>}</p>
                    </div>}
              </div>
            </div>
          </motion.div>

          {/* Permissions */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">
            <div className="px-5 py-3.5 border-b border-(--ln) bg-(--sf2) flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-500" />
                <h3 className="font-semibold text-(--t1)">Mes permissions</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
                {activePerms.length}/{Object.keys(PERM_LABELS).length} actives
              </span>
            </div>
            <div className="p-5 space-y-2">
              {Object.entries(PERM_LABELS).map(([k, label]) => {
                const active = !!perms[k];
                return (
                  <div key={k} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-500/8 border-emerald-100 dark:border-emerald-500/20'
                      : 'bg-(--sf2) border-(--ln) opacity-55'
                  }`}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-emerald-500' : 'bg-(--t4)'}`} />
                    <span className={`text-sm flex-1 ${active ? 'font-medium text-emerald-800 dark:text-emerald-200' : 'text-(--t3)'}`}>
                      {label}
                    </span>
                    {active && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </div>
                );
              })}
              <p className="text-xs text-(--t4) pt-2">
                Les permissions sont attribuées par votre médecin référent.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
