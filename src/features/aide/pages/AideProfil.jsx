import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircle, Mail, Phone, Shield, Edit3, CheckCircle,
  Loader2, AlertCircle, Save, X, Eye, EyeOff, Lock,
  Star, Key, CheckCircle2
} from 'lucide-react';

const P  = '#2563eb';
const P2 = '#1d4ed8';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const PERM_LABELS = {
  peut_creer_patient:    { label:'Créer des patients',    chip:'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-500/15'   },
  peut_lire_dossier:     { label:'Lire les dossiers',     chip:'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-500/15' },
  peut_modifier_patient: { label:'Modifier les patients', chip:'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-500/15' },
  peut_saisir_symptomes: { label:'Saisir des symptômes',  chip:'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-100 dark:border-cyan-500/15'   },
  peut_voir_diagnostic:  { label:'Voir diagnostics IA',   chip:'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-500/15' },
  peut_supprimer:        { label:'Supprimer des données', chip:'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-500/15' },
  peut_prescrire:        { label:'Prescrire',             chip:'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-100 dark:border-red-500/15'         },
};

const inp = 'w-full px-3.5 py-2.5 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:border-blue-400 transition-all';

function hdrs() {
  return { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('token')}` };
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-(--ln) last:border-0">
      <div className="w-8 h-8 rounded-lg bg-(--sf2) border border-(--ln) flex items-center justify-center shrink-0">
        <Icon size={13} className="text-(--t4)" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-(--t4)">{label}</p>
        <p className="text-sm font-medium text-(--t1) mt-0.5 break-all">{value}</p>
      </div>
    </div>
  );
}

export default function AideProfil() {
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [loadErr,  setLoadErr]  = useState('');
  const [toast,    setToast]    = useState(null);
  const [error,    setError]    = useState('');
  const [pwMode,   setPwMode]   = useState(false);
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError,  setPwError]  = useState('');
  const [pw,       setPw]       = useState({ ancien:'', nouveau:'' });

  const aideId = localStorage.getItem('aide_id') || '';
  const [profile, setProfile] = useState({ id:'', prenom:'', nom:'', email:'', telephone:'' });
  const [draft,   setDraft]   = useState({ id:'', prenom:'', nom:'', email:'', telephone:'' });
  const [perms,   setPerms]   = useState((() => { try { return JSON.parse(localStorage.getItem('aide_permissions')||'{}'); } catch { return {}; } })());

  const fullName    = profile.prenom || profile.nom ? `${profile.prenom} ${profile.nom}`.trim() : localStorage.getItem('aide_nom') || 'Aide soignant';
  const initials    = (() => { const p=profile.prenom?.trim()||''; const n=profile.nom?.trim()||''; if(p&&n) return `${p[0]}${n[0]}`.toUpperCase(); if(p) return p.slice(0,2).toUpperCase(); return (localStorage.getItem('aide_nom')||'').slice(0,2).toUpperCase(); })();
  const activePerms = Object.entries(perms).filter(([,v])=>v).map(([k])=>k);
  const permPct     = Math.round((activePerms.length / Object.keys(PERM_LABELS).length) * 100);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/aides/me`, { headers: hdrs() })
      .then(r => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.json(); })
      .then(d => {
        const u = { id:d.id||'', prenom:d.prenom||'', nom:d.nom||'', email:d.email||'', telephone:d.telephone||'' };
        setProfile(u); setDraft(u);
        localStorage.setItem('aide_nom', `${d.prenom} ${d.nom}`.trim());
        localStorage.setItem('aide_id', d.id || aideId);
        if (d.permissions) { setPerms(d.permissions); localStorage.setItem('aide_permissions', JSON.stringify(d.permissions)); }
        window.dispatchEvent(new Event('aide-profile-updated'));
      })
      .catch(e => setLoadErr(e.message || 'Impossible de charger le profil.'))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const handleSave = async () => {
    if (!draft.prenom.trim() || !draft.nom.trim()) { setError('Le prénom et le nom sont obligatoires.'); return; }
    setSaving(true); setError('');
    try {
      const res  = await fetch(`${API_URL}/aides/me`, { method:'PATCH', headers:hdrs(), body:JSON.stringify({ prenom:draft.prenom.trim(), nom:draft.nom.trim(), telephone:draft.telephone.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');
      const u = { prenom:data.prenom||draft.prenom, nom:data.nom||draft.nom, email:data.email||profile.email, telephone:data.telephone||'' };
      setProfile(u); setDraft(u);
      localStorage.setItem('aide_nom', `${u.prenom} ${u.nom}`.trim());
      window.dispatchEvent(new Event('aide-profile-updated'));
      setEditing(false); showToast('Profil mis à jour avec succès.');
    } catch (e) { setError(e.message || 'Erreur réseau.'); } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!pw.ancien || !pw.nouveau) { setPwError('Remplissez les deux champs.'); return; }
    if (pw.nouveau.length < 8) { setPwError('Minimum 8 caractères.'); return; }
    setPwSaving(true); setPwError('');
    try {
      const res  = await fetch(`${API_URL}/aides/me/password`, { method:'PATCH', headers:hdrs(), body:JSON.stringify({ ancien_password:pw.ancien, nouveau_password:pw.nouveau }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');
      setPwMode(false); setPw({ ancien:'', nouveau:'' }); showToast('Mot de passe modifié.');
    } catch (e) { setPwError(e.message || 'Erreur réseau.'); } finally { setPwSaving(false); }
  };

  if (loading) return <div className="flex justify-center items-center py-24"><Loader2 className="w-7 h-7 animate-spin" style={{ color:P }} /></div>;

  if (loadErr) return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <p className="font-bold text-lg text-(--t1)">Impossible de charger le profil</p>
        <p className="text-sm text-(--t3) mt-1">{loadErr}</p>
      </div>
      <button onClick={() => window.location.reload()} className="px-5 py-2.5 text-white text-sm font-bold rounded-xl" style={{ background:P }}>Réessayer</button>
    </div>
  );

  return (
    <div className="space-y-5 w-full max-w-5xl mx-auto">

      {/* ── Profile hero card ─── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}
        className="relative rounded-2xl overflow-hidden"
        style={{ background:`linear-gradient(135deg,${P2} 0%,${P} 55%,#3b82f6 100%)`, boxShadow:`0 8px 32px rgba(37,99,235,0.25)` }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-15"
          style={{ background:'radial-gradient(circle,#bfdbfe,transparent)' }} />
        <div style={{ position:'absolute', inset:0, opacity:0.06, backgroundImage:'radial-gradient(circle at 2px 2px,#fff 1px,transparent 0)', backgroundSize:'18px 18px' }} />
        <div className="relative px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            {/* Avatar avec anneau */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 rounded-2xl p-[2.5px]"
                style={{ background:'linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0.2))' }}>
                <div className="w-full h-full rounded-[14px] flex items-center justify-center text-2xl font-black text-white"
                  style={{ background:`linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.08))`, border:'1.5px solid rgba(255,255,255,0.30)' }}>
                  {initials}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white leading-tight">{fullName}</h1>
              <p className="text-blue-200/70 text-xs font-mono mt-1">{profile.id || aideId}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-white">
                  <UserCircle size={10} /> Aide soignant
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                  <CheckCircle2 size={11} /> Compte actif
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/70">
                  <Star size={10} /> {activePerms.length}/{Object.keys(PERM_LABELS).length} permissions
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => { setEditing(e => !e); setDraft({ ...profile }); setError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all active:scale-95"
            style={{ background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.28)', color:'white' }}>
            {editing ? <><X size={14}/> Annuler</> : <><Edit3 size={14}/> Modifier le profil</>}
          </button>
        </div>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm border font-medium ${
              toast.type==='success'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300'
            }`}>
            <CheckCircle size={15} className="shrink-0" /> {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">

          {/* Informations personnelles */}
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-(--ln)">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <UserCircle size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-bold text-(--t1)">Informations personnelles</span>
            </div>
            <div className="p-5">
              {!editing ? (
                <div>
                  <InfoRow icon={UserCircle} label="Prénom"    value={profile.prenom}    />
                  <InfoRow icon={UserCircle} label="Nom"       value={profile.nom}       />
                  <InfoRow icon={Mail}       label="Email"     value={profile.email}     />
                  <InfoRow icon={Phone}      label="Téléphone" value={profile.telephone} />
                  {!profile.prenom && !profile.nom && !profile.email && !profile.telephone && (
                    <p className="text-sm text-(--t4) italic py-4 text-center">Aucune donnée de profil</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-300 text-sm">
                      <AlertCircle size={14} className="shrink-0" /> {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key:'prenom',    label:'Prénom',    type:'text',  ph:'Prénom'          },
                      { key:'nom',       label:'Nom',       type:'text',  ph:'Nom de famille'  },
                      { key:'telephone', label:'Téléphone', type:'tel',   ph:'+237 6XX XXX XXX' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-(--t4) mb-1.5">{f.label}</label>
                        <input type={f.type} className={inp} value={draft[f.key]} onChange={e => setDraft(d=>({...d,[f.key]:e.target.value}))} placeholder={f.ph} />
                      </div>
                    ))}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-(--t4) mb-1.5">Email</label>
                      <input type="email" className={`${inp} opacity-50 cursor-not-allowed`} value={profile.email} readOnly />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-all active:scale-95"
                      style={{ background:`linear-gradient(135deg,${P2},${P})`, boxShadow:`0 4px 16px rgba(37,99,235,0.30)` }}>
                      {saving ? <Loader2 size={15} className="animate-spin"/> : <Save size={15}/>}
                      {saving ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Mot de passe */}
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm">
            <button onClick={() => { setPwMode(m=>!m); setPwError(''); setPw({ ancien:'', nouveau:'' }); }}
              className="w-full flex items-center gap-3 px-5 py-4 border-b border-(--ln) hover:bg-(--sf2) transition-colors">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-500/10 flex items-center justify-center">
                <Key size={14} className="text-slate-600 dark:text-slate-400" />
              </div>
              <span className="text-sm font-bold text-(--t1) flex-1 text-left">Changer le mot de passe</span>
              <span className="text-[10px] font-semibold text-(--t4)">{pwMode ? '▲ Masquer' : '▼ Modifier'}</span>
            </button>
            <AnimatePresence>
              {pwMode && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden">
                  <div className="p-5 space-y-4">
                    {pwError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-300 text-sm">
                        <AlertCircle size={14} className="shrink-0" /> {pwError}
                      </div>
                    )}
                    {[
                      { key:'ancien', label:'Mot de passe actuel', show:showOld, toggle:()=>setShowOld(s=>!s) },
                      { key:'nouveau', label:'Nouveau mot de passe', show:showNew, toggle:()=>setShowNew(s=>!s) },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-(--t4) mb-1.5">{f.label}</label>
                        <div className="relative">
                          <input type={f.show?'text':'password'} className={`${inp} pr-10`} value={pw[f.key]}
                            onChange={e => setPw(p=>({...p,[f.key]:e.target.value}))} placeholder="••••••••" />
                          <button type="button" onClick={f.toggle}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--t4) hover:text-(--t2) transition-colors">
                            {f.show ? <EyeOff size={15}/> : <Eye size={15}/>}
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <button onClick={handleChangePassword} disabled={pwSaving}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-all active:scale-95"
                        style={{ background:`linear-gradient(135deg,${P2},${P})`, boxShadow:`0 4px 14px rgba(37,99,235,0.28)` }}>
                        {pwSaving ? <Loader2 size={15} className="animate-spin"/> : <Lock size={15}/>}
                        {pwSaving ? 'Modification…' : 'Modifier'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Permissions */}
        <motion.div initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.14 }}
          className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm h-fit">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-(--ln)">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Shield size={14} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-sm font-bold text-(--t1)">Mes permissions</span>
            <span className="ml-auto text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20">
              {activePerms.length}/{Object.keys(PERM_LABELS).length}
            </span>
          </div>

          {/* Progress */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-(--t4) font-semibold">Couverture</span>
              <span className="text-[11px] font-black" style={{ color:P }}>{permPct}%</span>
            </div>
            <div className="h-2 bg-(--sf2) rounded-full overflow-hidden">
              <motion.div initial={{ width:0 }} animate={{ width:`${permPct}%` }} transition={{ duration:0.9, delay:0.5, ease:'easeOut' }}
                className="h-full rounded-full" style={{ background:`linear-gradient(90deg,${P2},${P})` }} />
            </div>
          </div>

          <div className="p-3 space-y-1.5">
            {Object.entries(PERM_LABELS).map(([k, meta]) => {
              const active = !!perms[k];
              return (
                <div key={k}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    active ? `${meta.chip} border` : 'text-(--t4) bg-(--sf2) border-(--ln) opacity-40'
                  }`}>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-current' : 'bg-(--t4)'}`} />
                  <span className="flex-1 truncate">{meta.label}</span>
                  {active && <CheckCircle size={11} className="shrink-0 text-emerald-500" />}
                </div>
              );
            })}
            <p className="text-[10px] text-(--t4) pt-2 px-1">Attribuées par votre médecin référent.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
