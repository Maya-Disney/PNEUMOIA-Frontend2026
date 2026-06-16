import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  Users, UserPlus, FolderOpen, Activity, Shield, CheckCircle,
  Bell, ChevronRight, Stethoscope, AlertTriangle,
  MessageSquare, Zap, Calendar, ArrowUpRight,
  Heart, Phone, Lock
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const PERM_META = {
  peut_creer_patient:    { label: 'Créer patients',    icon: UserPlus,      },
  peut_lire_dossier:     { label: 'Lire dossiers',     icon: FolderOpen,    },
  peut_modifier_patient: { label: 'Modifier patients', icon: Users,         },
  peut_saisir_symptomes: { label: 'Saisir symptômes',  icon: Activity,      },
  peut_voir_diagnostic:  { label: 'Diagnostics IA',    icon: Stethoscope,   },
  peut_supprimer:        { label: 'Supprimer données', icon: AlertTriangle, },
  peut_prescrire:        { label: 'Prescrire',         icon: Shield,        },
};

const STATUS_BADGE = {
  actif:   { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', dot: 'bg-emerald-500', label: 'Actif'    },
  urgent:  { cls: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',                dot: 'bg-red-500',     label: 'Urgent'   },
  attente: { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',        dot: 'bg-amber-500',   label: 'Attente'  },
  cloture: { cls: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',        dot: 'bg-slate-400',   label: 'Clôturé'  },
};

const AVATAR_GRADIENTS = [
  'from-teal-500 to-cyan-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
];

function initials(prenom, nom) {
  return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase() || '??';
}

function makeWeeklyData(total) {
  const base = Math.max(1, Math.floor((total || 5) / 7));
  const r    = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
  return {
    soins:    [r(base,base+3), r(base-1,base+4), r(base,base+5), r(base+1,base+4), r(base,base+3), r(base-1,base+2), r(base,base+3)],
    dossiers: [r(0,2), r(0,2), r(1,3), r(0,2), r(1,2), r(0,1), r(0,2)],
  };
}

export default function AideDashboard() {
  const [info,      setInfo]      = useState(null);
  const [perms,     setPerms]     = useState({});
  const [patients,  setPatients]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [time,      setTime]      = useState('');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const hdrs = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_URL}/aides/me`,       { headers: hdrs }).then(r => r.ok ? r.json() : null),
      fetch(`${API_URL}/aides/patients`, { headers: hdrs }).then(r => r.ok ? r.json() : []),
    ]).then(([me, pts]) => {
      if (me) {
        const nom  = `${me.prenom} ${me.nom}`;
        const parts = nom.trim().split(' ');
        setInfo({ nom, id: me.id, initials: parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : nom.slice(0,2).toUpperCase() });
        setPerms(me.permissions || {});
        localStorage.setItem('aide_nom', nom);
      } else {
        const nom   = localStorage.getItem('aide_nom') || 'Aide soignant';
        const parts = nom.trim().split(' ');
        setInfo({ nom, id: localStorage.getItem('aide_id') || '', initials: parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : nom.slice(0,2).toUpperCase() });
        try { setPerms(JSON.parse(localStorage.getItem('aide_permissions') || '{}')); } catch {}
      }
      const list = Array.isArray(pts) ? pts : (pts?.patients || []);
      setPatients(list);
      setChartData(makeWeeklyData(list.length));
    }).catch(() => {
      const nom   = localStorage.getItem('aide_nom') || 'Aide soignant';
      const parts = nom.trim().split(' ');
      setInfo({ nom, id: localStorage.getItem('aide_id') || '', initials: parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : nom.slice(0,2).toUpperCase() });
      try { setPerms(JSON.parse(localStorage.getItem('aide_permissions') || '{}')); } catch {}
      setChartData(makeWeeklyData(5));
    }).finally(() => setLoading(false));
  }, []);

  if (!info) return null;

  const hour      = new Date().getHours();
  const greet     = hour < 5 ? 'Bonne nuit' : hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const today     = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const activeList   = Object.entries(perms).filter(([, v]) =>  v).map(([k]) => k);
  const inactiveList = Object.entries(perms).filter(([, v]) => !v).map(([k]) => k);
  const totalPerms   = Object.keys(perms).length || 7;
  const permPct      = Math.round((activeList.length / totalPerms) * 100);
  const recentPts    = patients.slice(0, 5);
  const countByStatus = patients.reduce((acc, p) => { acc[p.statut || 'actif'] = (acc[p.statut || 'actif'] || 0) + 1; return acc; }, {});
  const urgents = countByStatus.urgent || 0;
  const actifs  = countByStatus.actif  || 0;

  const QUICK = [
    { label: 'Dossiers patients',  icon: FolderOpen,    to: '/aide/patients',         show: perms.peut_lire_dossier,  gradient: 'from-emerald-600 to-teal-600'   },
    { label: 'Ajouter un patient', icon: UserPlus,      to: '/aide/patients/nouveau', show: perms.peut_creer_patient, gradient: 'from-emerald-500 to-cyan-600'   },
    { label: 'Messagerie',         icon: MessageSquare, to: '/aide/commentaires',     show: true,                     gradient: 'from-violet-500 to-purple-600'  },
    { label: 'Notifications',      icon: Bell,          to: '/aide/notifications',    show: true,                     gradient: 'from-amber-500 to-orange-500'   },
  ].filter(q => q.show);

  const now  = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  });

  const lineData = chartData ? {
    labels: days,
    datasets: [
      {
        label: 'Soins administrés',
        data: chartData.soins,
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37,99,235,0.10)',
        fill: true, tension: 0.4,
        pointRadius: 4, pointHoverRadius: 6,
        pointBackgroundColor: '#2563EB',
        borderWidth: 2.5,
      },
      {
        label: 'Nouveaux dossiers',
        data: chartData.dossiers,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        fill: true, tension: 0.4,
        pointRadius: 4, pointHoverRadius: 6,
        pointBackgroundColor: '#10b981',
        borderWidth: 2.5,
      },
    ],
  } : null;

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#0f172a',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 1 } },
    },
  };

  const KPI = [
    { value: loading ? '…' : patients.length, label: 'Total patients',  sub: 'sous votre suivi',      gradient: 'from-emerald-500 to-teal-600',   tint: 'rgba(5,150,105,0.06)',   icon: Users         },
    { value: loading ? '…' : actifs,           label: 'Patients actifs', sub: 'en cours de suivi',     gradient: 'from-emerald-500 to-teal-600',    tint: 'rgba(16,185,129,0.06)', icon: CheckCircle   },
    { value: loading ? '…' : urgents,          label: 'Cas urgents',     sub: 'nécessitent attention', gradient: 'from-red-500 to-rose-600',        tint: 'rgba(239,68,68,0.06)',  icon: AlertTriangle },
    { value: `${activeList.length}/${totalPerms}`, label: 'Permissions',  sub: `${permPct}% configurées`, gradient: 'from-violet-500 to-purple-600', tint: 'rgba(139,92,246,0.06)', icon: Shield        },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="rounded-2xl overflow-hidden shadow-xl"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="relative p-6 pb-5 overflow-hidden">
          <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }} />
          <div className="absolute left-1/3 -bottom-16 w-72 h-72 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
          <div className="absolute -left-10 top-0 w-48 h-48 rounded-full opacity-8 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0 border border-white/10"
                style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
                {info.initials}
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">{greet} </p>
                <h1 className="text-2xl font-bold text-white leading-tight">{info.nom}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
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

          <div className="relative mt-4 pt-4 border-t border-white/8">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400">Niveau d'accès configuré</span>
              <span className="text-xs font-black text-white">{permPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${permPct}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #60a5fa, #2563EB)' }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.32 }}
              className="bg-(--sf) border border-(--ln) rounded-xl overflow-hidden">
              <div className="px-4 pt-4 pb-3" style={{ backgroundColor: card.tint }}>
                <p className="text-3xl font-black text-(--t1)">{card.value}</p>
                <p className="text-sm font-semibold text-(--t2) mt-1">{card.label}</p>
              </div>
              <div className="h-px bg-(--ln)" />
              <div className="px-4 py-3 flex items-center gap-3 bg-(--sf)">
                <div className={`w-8 h-8 rounded-lg bg-linear-to-br ${card.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-(--t4)">{card.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── GRILLE PRINCIPALE ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── COL GAUCHE 2/3 ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Graphique activité */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}
            className="bg-(--sf) rounded-2xl border border-(--ln) p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-(--t1)">Activité des 7 derniers jours</h2>
                <p className="text-xs text-(--t4) mt-0.5">Soins administrés · Nouveaux dossiers</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-(--t3)">
                  <span className="w-3 h-0.5 rounded-full bg-emerald-500 inline-block" /> Soins
                </span>
                <span className="flex items-center gap-1.5 text-xs text-(--t3)">
                  <span className="w-3 h-0.5 rounded-full bg-emerald-500 inline-block" /> Dossiers
                </span>
              </div>
            </div>
            <div style={{ height: 220 }}>
              {lineData && <Line data={lineData} options={chartOpts} />}
            </div>
          </motion.div>

          {/* Patients récents */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.35 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--ln) bg-(--sf2)">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-(--t1)">Patients récents</h2>
              </div>
              <Link to="/aide/patients"
                className="flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:text-emerald-600 transition-colors">
                Voir tout <ArrowUpRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-(--sf2)" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-(--sf2) rounded-full w-1/3" />
                      <div className="h-2.5 bg-(--sf2) rounded-full w-1/4" />
                    </div>
                    <div className="h-5 w-14 bg-(--sf2) rounded-full" />
                  </div>
                ))}
              </div>
            ) : recentPts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-(--sf2) flex items-center justify-center">
                  <Users className="w-6 h-6 text-(--t4)" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-(--t2)">Aucun patient</p>
                  <p className="text-xs text-(--t4) mt-0.5">Commencez par créer un dossier patient</p>
                </div>
                {perms.peut_creer_patient && (
                  <Link to="/aide/patients/nouveau"
                    className="text-xs font-bold text-white px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-colors">
                    + Nouveau patient
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-(--ln)">
                {recentPts.map((p, idx) => {
                  const ini   = initials(p.prenom, p.nom);
                  const stCfg = STATUS_BADGE[p.statut] || STATUS_BADGE.actif;
                  const grad  = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                  return (
                    <Link key={p.id} to={`/aide/patients/${p.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-(--sf2) transition-colors group">
                      <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${grad} flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm`}>
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
                        <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${stCfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stCfg.dot}`} />
                          {stCfg.label}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-(--t4) group-hover:text-emerald-500 shrink-0 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── COL DROITE 1/3 ── */}
        <div className="space-y-4">

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13, duration: 0.35 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-(--ln) bg-(--sf2)">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-(--t1)">Actions rapides</h2>
            </div>
            <div className="p-3 space-y-1">
              {QUICK.map(q => {
                const Icon = q.icon;
                return (
                  <Link key={q.to} to={q.to}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-(--sf2) transition-colors group">
                    <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${q.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-(--t2) group-hover:text-(--t1) flex-1 transition-colors">
                      {q.label}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-(--t4) group-hover:text-emerald-500 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Mes permissions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21, duration: 0.35 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--ln) bg-(--sf2)">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-500" />
                <h2 className="text-sm font-bold text-(--t1)">Mes permissions</h2>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-100 dark:border-violet-500/20">
                {activeList.length}/{totalPerms}
              </span>
            </div>
            <div className="p-3 space-y-1">
              {activeList.map(k => {
                const m = PERM_META[k]; if (!m) return null;
                const Icon = m.icon;
                return (
                  <div key={k} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-100 dark:border-emerald-500/15">
                    <Icon size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 truncate flex-1">{m.label}</span>
                    <CheckCircle size={11} className="text-emerald-500 shrink-0" />
                  </div>
                );
              })}
              {inactiveList.length > 0 && activeList.length > 0 && <div className="h-px bg-(--ln) my-1" />}
              {inactiveList.map(k => {
                const m = PERM_META[k]; if (!m) return null;
                return (
                  <div key={k} className="flex items-center gap-2.5 px-3 py-2 text-(--t4)">
                    <span className="w-1.5 h-1.5 rounded-full bg-(--sf3) border border-(--ln) shrink-0" />
                    <span className="text-xs line-through truncate">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Rappel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.29, duration: 0.35 }}
            className="rounded-2xl border border-emerald-100 dark:border-emerald-500/20 p-4"
            style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.06) 0%, rgba(16,185,129,0.06) 100%)' }}>
            <div className="flex items-start gap-2.5">
              <Heart className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">Rappel</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 leading-relaxed">
                  Permissions attribuées par votre médecin référent. Contactez-le via la messagerie pour toute modification.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
