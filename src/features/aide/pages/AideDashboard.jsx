import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, FolderOpen, Activity, Shield, CheckCircle,
  Bell, ChevronRight, Stethoscope, AlertTriangle,
  MessageSquare, Zap, Clock, Calendar, ArrowUpRight,
  Heart, Phone, TrendingUp, Lock
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const RED     = '#DC2626';

const PERM_META = {
  peut_creer_patient:    { label: 'Créer patients',    icon: UserPlus,      color: 'blue'   },
  peut_lire_dossier:     { label: 'Lire dossiers',     icon: FolderOpen,    color: 'indigo' },
  peut_modifier_patient: { label: 'Modifier patients', icon: Users,         color: 'violet' },
  peut_saisir_symptomes: { label: 'Saisir symptômes',  icon: Activity,      color: 'teal'   },
  peut_voir_diagnostic:  { label: 'Diagnostics IA',    icon: Stethoscope,   color: 'purple' },
  peut_supprimer:        { label: 'Supprimer données', icon: AlertTriangle, color: 'orange' },
  peut_prescrire:        { label: 'Prescrire',         icon: Shield,        color: 'red'    },
};

const COLOR_CHIP = {
  blue:   'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
  indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20',
  violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-500/20',
  teal:   'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-500/20',
  purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20',
  orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-100 dark:border-orange-500/20',
  red:    'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20',
};

function initials(prenom, nom) {
  return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase() || '??';
}

const STATUS_BADGE = {
  actif:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  urgent:  'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  attente: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  cloture: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
};

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay },
});

export default function AideDashboard() {
  const [info,     setInfo]     = useState(null);
  const [perms,    setPerms]    = useState({});
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [time,     setTime]     = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const hdrs  = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_URL}/aides/me`,       { headers: hdrs }).then(r => r.ok ? r.json() : null),
      fetch(`${API_URL}/aides/patients`, { headers: hdrs }).then(r => r.ok ? r.json() : []),
    ]).then(([me, pts]) => {
      if (me) {
        const nom  = `${me.prenom} ${me.nom}`;
        const prts = nom.trim().split(' ');
        setInfo({
          nom,
          prenom:   me.prenom,
          id:       me.id,
          initials: prts.length >= 2 ? `${prts[0][0]}${prts[1][0]}`.toUpperCase() : nom.slice(0,2).toUpperCase(),
        });
        setPerms(me.permissions || {});
        localStorage.setItem('aide_nom', nom);
      } else {
        const nom = localStorage.getItem('aide_nom') || 'Aide soignant';
        const prts = nom.trim().split(' ');
        setInfo({ nom, prenom: prts[0], id: localStorage.getItem('aide_id') || '', initials: prts.length >= 2 ? `${prts[0][0]}${prts[1][0]}`.toUpperCase() : nom.slice(0,2).toUpperCase() });
        try { setPerms(JSON.parse(localStorage.getItem('aide_permissions') || '{}')); } catch {}
      }
      setPatients(Array.isArray(pts) ? pts : (pts?.patients || []));
    }).catch(() => {
      const nom = localStorage.getItem('aide_nom') || 'Aide soignant';
      const prts = nom.trim().split(' ');
      setInfo({ nom, prenom: prts[0], id: localStorage.getItem('aide_id') || '', initials: prts.length >= 2 ? `${prts[0][0]}${prts[1][0]}`.toUpperCase() : nom.slice(0,2).toUpperCase() });
      try { setPerms(JSON.parse(localStorage.getItem('aide_permissions') || '{}')); } catch {}
    }).finally(() => setLoading(false));
  }, []);

  if (!info) return null;

  const hour         = new Date().getHours();
  const greet        = hour < 5 ? 'Bonne nuit' : hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const today        = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const activeList   = Object.entries(perms).filter(([, v]) =>  v).map(([k]) => k);
  const inactiveList = Object.entries(perms).filter(([, v]) => !v).map(([k]) => k);
  const totalPerms   = Object.keys(perms).length || 7;
  const permPct      = Math.round((activeList.length / totalPerms) * 100);
  const recentPts    = patients.slice(0, 5);

  const QUICK = [
    { label: 'Dossiers patients',  icon: FolderOpen, to: '/aide/patients',         show: perms.peut_lire_dossier,  color: 'text-indigo-500' },
    { label: 'Ajouter un patient', icon: UserPlus,   to: '/aide/patients/nouveau', show: perms.peut_creer_patient, color: 'text-blue-500'   },
    { label: 'Messagerie',         icon: MessageSquare, to: '/aide/commentaires',  show: true,                     color: 'text-purple-500' },
    { label: 'Notifications',      icon: Bell,        to: '/aide/notifications',   show: true,                     color: 'text-amber-500'  },
  ].filter(q => q.show);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <motion.div {...fade(0)} className="rounded-2xl overflow-hidden shadow-xl"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>

        {/* Decorative glow */}
        <div className="relative p-6 pb-5 overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${RED}, transparent)` }} />
          <div className="absolute left-1/3 -bottom-12 w-56 h-56 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, #3b82f6, transparent)` }} />

          {/* Top row */}
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0 border border-white/10"
                style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)' }}>
                {info.initials}
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">{greet} 👋</p>
                <h1 className="text-2xl font-black text-white leading-tight">{info.nom}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-red-500/30 text-red-300 bg-red-500/10">
                    <Stethoscope size={9} /> Aide soignant
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{info.id}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Actif
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-4xl font-black text-white tabular-nums leading-none">{time}</p>
              <p className="text-sm text-slate-400 mt-1 capitalize">{today}</p>
            </div>
          </div>

          {/* Embedded stats */}
          <div className="relative grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Patients suivis',  value: loading ? '…' : patients.length,           icon: Users,        sub: 'sous votre suivi',   accent: 'border-blue-500/20 bg-blue-500/8'    },
              { label: 'Permissions',      value: `${activeList.length} / ${totalPerms}`,    icon: Shield,       sub: `${permPct}% configurés`, accent: 'border-red-500/20 bg-red-500/8'  },
              { label: 'Statut du compte', value: 'Actif',                                   icon: CheckCircle,  sub: 'accès complet',       accent: 'border-emerald-500/20 bg-emerald-500/8' },
            ].map(({ label, value, icon: Icon, sub, accent }) => (
              <div key={label} className={`rounded-xl p-3.5 border ${accent}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={12} className="text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{label}</span>
                </div>
                <p className="text-xl font-black text-white leading-none">{value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── GRILLE PRINCIPALE ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── COL GAUCHE 2/3 ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Patients récents */}
          <motion.div {...fade(0.08)} className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-(--ln) bg-(--sf2)">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold text-(--t1)">Patients récents</h2>
              </div>
              <Link to="/aide/patients"
                className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors">
                Voir tout <ArrowUpRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-(--sf2)" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-(--sf2) rounded w-1/3" />
                      <div className="h-2.5 bg-(--sf2) rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentPts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-(--sf2) flex items-center justify-center">
                  <Users className="w-6 h-6 text-(--t4)" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-(--t2)">Aucun patient</p>
                  <p className="text-xs text-(--t4) mt-0.5">Commencez par créer un dossier patient</p>
                </div>
                {perms.peut_creer_patient && (
                  <Link to="/aide/patients/nouveau"
                    className="text-xs font-bold text-white px-4 py-2 rounded-xl transition-colors"
                    style={{ backgroundColor: RED }}>
                    + Nouveau patient
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-(--ln)">
                {recentPts.map(p => {
                  const ini  = initials(p.prenom, p.nom);
                  const stCls = STATUS_BADGE[p.statut] || STATUS_BADGE.actif;
                  return (
                    <Link key={p.id} to={`/aide/patients/${p.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-(--sf2) transition-colors group">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ backgroundColor: RED }}>
                        {ini}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-(--t1) truncate">{p.prenom} {p.nom}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {p.date_naissance && (
                            <span className="text-xs text-(--t4) flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(p.date_naissance).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                          {p.telephone && (
                            <span className="text-xs text-(--t4) flex items-center gap-1">
                              <Phone size={10} /> {p.telephone}
                            </span>
                          )}
                        </div>
                      </div>
                      {p.statut && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${stCls}`}>
                          {p.statut === 'actif' ? 'Actif' : p.statut === 'urgent' ? 'Urgent' : p.statut === 'attente' ? 'En attente' : 'Clôturé'}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-(--t4) group-hover:text-red-500 shrink-0 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Permissions */}
          <motion.div {...fade(0.14)} className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-(--ln) bg-(--sf2)">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold text-(--t1)">Mes permissions</h2>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 border border-red-100 dark:border-red-500/20">
                {activeList.length} / {totalPerms} actives
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Barre de progression */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-(--t3) font-medium">Taux d'accès configuré</span>
                  <span className="text-xs font-black text-(--t1)">{permPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-(--sf2) overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${permPct}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: RED }}
                  />
                </div>
              </div>

              {/* Grille permissions actives */}
              {activeList.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeList.map(k => {
                    const m = PERM_META[k]; if (!m) return null;
                    const Icon = m.icon;
                    return (
                      <div key={k} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold ${COLOR_CHIP[m.color]}`}>
                        <Icon size={13} />
                        <span className="truncate">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Non activées */}
              {inactiveList.length > 0 && (
                <div className="pt-2 border-t border-(--ln)">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-(--t4) mb-2">Non activées</p>
                  <div className="flex flex-wrap gap-1.5">
                    {inactiveList.map(k => {
                      const m = PERM_META[k]; if (!m) return null;
                      return (
                        <span key={k} className="text-[11px] px-2.5 py-1 rounded-lg bg-(--sf2) border border-(--ln) text-(--t4) font-medium line-through">
                          {m.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── COL DROITE 1/3 ── */}
        <div className="space-y-4">

          {/* Actions rapides */}
          <motion.div {...fade(0.1)} className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-(--ln) bg-(--sf2)">
              <Zap className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold text-(--t1)">Actions rapides</h2>
            </div>
            <div className="p-3 space-y-1">
              {QUICK.map(q => {
                const Icon = q.icon;
                return (
                  <Link key={q.to} to={q.to}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-(--sf2) transition-colors group">
                    <div className="w-8 h-8 rounded-xl bg-(--sf2) flex items-center justify-center shrink-0">
                      <Icon className={`w-4 h-4 ${q.color}`} />
                    </div>
                    <span className="text-sm font-semibold text-(--t2) group-hover:text-(--t1) flex-1 transition-colors">
                      {q.label}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-(--t4) group-hover:text-red-500 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Indicateur activité */}
          <motion.div {...fade(0.16)} className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-(--ln) bg-(--sf2)">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold text-(--t1)">Vue d'ensemble</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'Patients total',     value: loading ? '…' : patients.length, icon: Users,       color: 'text-blue-500'   },
                { label: 'Permissions actives', value: activeList.length,               icon: Shield,      color: 'text-red-500'    },
                { label: 'Accès bloqués',       value: inactiveList.length,             icon: Lock,        color: 'text-slate-400'  },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-(--sf2) flex items-center justify-center">
                      <Icon size={13} className={color} />
                    </div>
                    <span className="text-xs font-medium text-(--t3)">{label}</span>
                  </div>
                  <span className="text-sm font-black text-(--t1)">{value}</span>
                </div>
              ))}

              <div className="pt-2 border-t border-(--ln)">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold leading-snug">
                    Compte opérationnel · Toutes les données sont à jour
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Note */}
          <motion.div {...fade(0.22)}
            className="rounded-2xl p-4 border border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/8">
            <div className="flex items-start gap-2.5">
              <Heart className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-1">Rappel important</p>
                <p className="text-[11px] text-red-600 dark:text-red-400 leading-relaxed">
                  Vos permissions sont attribuées par votre médecin référent. Contactez-le via la messagerie pour toute modification.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
