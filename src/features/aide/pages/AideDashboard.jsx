import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, FolderOpen, Activity, Shield, CheckCircle,
  Bell, ChevronRight, Stethoscope, AlertTriangle,
  MessageSquare, Calendar, Phone, ArrowUpRight,
  Lock, TrendingUp, Star
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Filler, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const P  = '#2563eb';
const P2 = '#1d4ed8';
const P3 = '#3b82f6';

const card = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' },
};
const stagger = i => ({ ...card, transition: { ...card.transition, delay: i * 0.07 } });

function KpiCard({ icon: Icon, label, value, sub, iconBg, iconColor, delay = 0, trend }) {
  return (
    <motion.div {...stagger(delay)}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-(--sf) border border-(--ln) rounded-2xl p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-widest text-(--t4)">{label}</p>
        <p className="text-2xl font-black text-(--t1) leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-xs text-(--t4) mt-0.5">{sub}</p>}
      </div>
      {trend !== undefined && (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}
        </span>
      )}
    </motion.div>
  );
}

function initials(prenom, nom) {
  return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase() || '??';
}

const AVATAR_GRADIENTS = [
  `linear-gradient(135deg, ${P2}, ${P})`,
  'linear-gradient(135deg, #4f46e5, #7c3aed)',
  'linear-gradient(135deg, #0891b2, #0284c7)',
  'linear-gradient(135deg, #7c3aed, #2563eb)',
  'linear-gradient(135deg, #059669, #0284c7)',
];
function avatarGrad(id) {
  const n = (id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[n % AVATAR_GRADIENTS.length];
}

const STATUS_CFG = {
  actif:   { label: 'Actif',      cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  urgent:  { label: 'Urgent',     cls: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' },
  attente: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  cloture: { label: 'Clôturé',    cls: 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400' },
};

const PERM_LABELS = {
  peut_creer_patient:    'Créer patients',
  peut_lire_dossier:     'Lire dossiers',
  peut_modifier_patient: 'Modifier patients',
  peut_saisir_symptomes: 'Saisir symptômes',
  peut_voir_diagnostic:  'Diagnostics IA',
  peut_supprimer:        'Supprimer données',
  peut_prescrire:        'Prescrire',
};

export default function AideDashboard() {
  const [info,     setInfo]     = useState(null);
  const [perms,    setPerms]    = useState({});
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [time,     setTime]     = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }));
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
        const prts = nom.trim().split(' ');
        setInfo({ nom, prenom: me.prenom, id: me.id, initials: prts.length >= 2 ? `${prts[0][0]}${prts[1][0]}`.toUpperCase() : nom.slice(0,2).toUpperCase() });
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
      setInfo({ nom, prenom: prts[0], id: '', initials: prts.length >= 2 ? `${prts[0][0]}${prts[1][0]}`.toUpperCase() : nom.slice(0,2).toUpperCase() });
      try { setPerms(JSON.parse(localStorage.getItem('aide_permissions') || '{}')); } catch {}
    }).finally(() => setLoading(false));
  }, []);

  if (!info) return null;

  const hour       = new Date().getHours();
  const greet      = hour < 5 ? 'Bonne nuit' : hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const today      = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' });
  const activePerms  = Object.entries(perms).filter(([,v]) =>  v).map(([k]) => k);
  const totalPerms   = Object.keys(PERM_LABELS).length;
  const permPct      = totalPerms > 0 ? Math.round((activePerms.length / totalPerms) * 100) : 0;
  const urgentCount  = patients.filter(p => p.statut === 'urgent').length;
  const activeCount  = patients.filter(p => p.statut === 'actif' || !p.statut).length;
  const recentPts    = patients.slice(0, 5);

  const QUICK = [
    { label:'Dossiers patients',  icon:FolderOpen,    to:'/aide/patients',         show: perms.peut_lire_dossier,  g1:'#1d4ed8', g2:'#2563eb', shadow:'rgba(29,78,216,0.35)' },
    { label:'Ajouter un patient', icon:UserPlus,      to:'/aide/patients/nouveau', show: perms.peut_creer_patient, g1:'#0891b2', g2:'#0284c7', shadow:'rgba(8,145,178,0.35)' },
    { label:'Messagerie',         icon:MessageSquare, to:'/aide/commentaires',     show: true,                     g1:'#7c3aed', g2:'#6d28d9', shadow:'rgba(124,58,237,0.35)' },
    { label:'Notifications',      icon:Bell,          to:'/aide/notifications',    show: true,                     g1:'#d97706', g2:'#b45309', shadow:'rgba(217,119,6,0.35)'   },
  ].filter(q => q.show);

  /* ─── Chart: activité hebdo (patients créés par jour sur les 7 derniers jours) ─── */
  const weekActivity = (() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Lun→Dim
    const now = new Date();
    patients.forEach(p => {
      if (!p.created_at) return;
      const d = new Date(p.created_at);
      const diffDays = Math.floor((now - d) / 86400000);
      if (diffDays < 0 || diffDays >= 7) return;
      // jour de la semaine 0=Lun … 6=Dim (JS: 0=Dim 1=Lun … 6=Sam)
      const dow = (d.getDay() + 6) % 7;
      counts[dow]++;
    });
    return counts;
  })();
  const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const lineData = {
    labels: days,
    datasets: [{
      label: 'Patients créés',
      data: weekActivity,
      fill: true,
      tension: 0.45,
      borderColor: P,
      borderWidth: 2.5,
      backgroundColor: 'rgba(37,99,235,0.10)',
      pointBackgroundColor: P,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }],
  };
  const lineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1d2333', titleColor:'#fff', bodyColor:'rgba(255,255,255,0.75)', padding:10, cornerRadius:10 } },
    scales: {
      x: { grid: { display: false }, ticks: { color:'#94a3b8', font:{ size:11 } }, border:{ display:false } },
      y: { beginAtZero:true, grid:{ color:'rgba(226,232,240,0.6)' }, ticks: { color:'#94a3b8', font:{ size:11 }, stepSize:2 }, border:{ display:false } },
    },
  };

  /* ─── Chart: permissions doughnut ─── */
  const doughnutData = {
    labels: ['Actives', 'Inactives'],
    datasets: [{
      data: [activePerms.length, totalPerms - activePerms.length],
      backgroundColor: [P, '#e2e8f0'],
      hoverBackgroundColor: [P2, '#cbd5e1'],
      borderWidth: 0,
    }],
  };
  const doughnutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor:'#1d2333', titleColor:'#fff', bodyColor:'rgba(255,255,255,0.75)', padding:10, cornerRadius:10 } },
    cutout: '72%',
  };

  return (
    <div className="w-full space-y-6">

      {/* ══ WELCOME BANNER ═════════════════════════════════════ */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        className="relative rounded-2xl overflow-hidden"
        style={{ background:`linear-gradient(135deg, ${P2} 0%, ${P} 55%, ${P3} 100%)`, boxShadow:`0 8px 40px rgba(37,99,235,0.30)` }}>
        {/* Decorative */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-15"
          style={{ background:'radial-gradient(circle,#93c5fd,transparent)' }} />
        <div className="absolute left-1/3 -bottom-20 w-72 h-72 rounded-full opacity-10"
          style={{ background:'radial-gradient(circle,#dbeafe,transparent)' }} />
        <div style={{ position:'absolute', inset:0, opacity:0.06, backgroundImage:'radial-gradient(circle at 2px 2px,#fff 1px,transparent 0)', backgroundSize:'20px 20px' }} />

        <div className="relative px-6 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0"
              style={{ background:'rgba(255,255,255,0.20)', border:'2px solid rgba(255,255,255,0.30)', boxShadow:'0 4px 16px rgba(0,0,0,0.15)' }}>
              {info.initials}
            </div>
            <div>
              <p className="text-blue-100/80 text-xs font-bold uppercase tracking-widest">{greet} 👋</p>
              <h1 className="text-2xl font-black text-white leading-tight">{info.nom}</h1>
              <p className="text-blue-200/70 text-xs mt-1 capitalize">{today}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 flex-wrap">
            {[
              { val: loading ? '…' : patients.length, lbl: 'Patients',    color:'bg-white/10 border-white/20' },
              { val: activePerms.length,               lbl: 'Permissions', color:'bg-white/10 border-white/20' },
              { val: urgentCount || 0,                 lbl: 'Urgents',     color: urgentCount > 0 ? 'bg-red-500/30 border-red-400/40' : 'bg-white/10 border-white/20' },
            ].map(s => (
              <div key={s.lbl} className={`text-center px-4 py-2.5 rounded-xl border ${s.color}`}>
                <p className="text-2xl font-black text-white leading-none">{s.val}</p>
                <p className="text-[10px] text-white/60 font-bold mt-0.5">{s.lbl}</p>
              </div>
            ))}
            <div className="text-right hidden lg:block">
              <p className="text-4xl font-black text-white tabular-nums">{time}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══ KPI CARDS ════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard delay={0} icon={Users}        label="Patients suivis" value={loading ? '…' : patients.length} sub="sous votre suivi" iconBg="bg-blue-50 dark:bg-blue-500/10" iconColor="text-blue-600 dark:text-blue-400" />
        <KpiCard delay={1} icon={Shield}       label="Permissions"     value={`${activePerms.length}/${totalPerms}`} sub={`${permPct}% configurés`} iconBg="bg-indigo-50 dark:bg-indigo-500/10" iconColor="text-indigo-600 dark:text-indigo-400" />
        <KpiCard delay={2} icon={Activity}     label="Actifs"          value={loading ? '…' : activeCount} sub="patients actifs" iconBg="bg-emerald-50 dark:bg-emerald-500/10" iconColor="text-emerald-600 dark:text-emerald-400" />
        <KpiCard delay={3} icon={AlertTriangle} label="Urgents"        value={loading ? '…' : urgentCount} sub="nécessitent suivi" iconBg="bg-red-50 dark:bg-red-500/10" iconColor="text-red-600 dark:text-red-400" trend={urgentCount > 0 ? urgentCount : undefined} />
      </div>

      {/* ══ ACCÈS RAPIDE ══════════════════════════════════════ */}
      <motion.div {...stagger(4)}>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-(--t4) mb-3">Accès rapide</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK.map(q => {
            const Icon = q.icon;
            return (
              <Link key={q.to} to={q.to}
                className="group relative rounded-2xl p-4 overflow-hidden text-white transition-all hover:scale-[1.02] active:scale-97"
                style={{ background:`linear-gradient(135deg,${q.g1},${q.g2})`, boxShadow:`0 4px 18px ${q.shadow}` }}>
                <div style={{ position:'absolute', inset:0, opacity:0.10, backgroundImage:'radial-gradient(circle at 2px 2px,#fff 1px,transparent 0)', backgroundSize:'14px 14px' }} />
                <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full opacity-20" style={{ background:'radial-gradient(circle,#fff,transparent)' }} />
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center mb-3 shadow-sm">
                    <Icon size={16} className="text-white" />
                  </div>
                  <p className="text-sm font-bold text-white leading-tight">{q.label}</p>
                  <ArrowUpRight size={13} className="absolute -top-0.5 right-0 text-white/50 group-hover:text-white transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* ══ GRILLE PRINCIPALE ═════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Patients récents — 2/3 */}
        <motion.div {...stagger(5)} className="lg:col-span-2 bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-(--ln)">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Users size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-sm font-bold text-(--t1)">Patients récents</h2>
              {!loading && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300">
                  {patients.length}
                </span>
              )}
            </div>
            <Link to="/aide/patients"
              className="flex items-center gap-1 text-xs font-bold hover:underline"
              style={{ color: P }}>
              Voir tout <ArrowUpRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-(--sf2)" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-(--sf2) rounded-lg w-1/3" />
                    <div className="h-2.5 bg-(--sf2) rounded-lg w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentPts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center gap-3 px-6">
              <div className="w-14 h-14 rounded-2xl bg-(--sf2) flex items-center justify-center">
                <Users className="w-7 h-7 text-(--t4)" />
              </div>
              <p className="font-semibold text-(--t2)">Aucun patient enregistré</p>
              {perms.peut_creer_patient && (
                <Link to="/aide/patients/nouveau"
                  className="text-xs font-bold text-white px-4 py-2 rounded-xl transition-colors"
                  style={{ background: P }}>
                  + Nouveau patient
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-(--ln)">
              {recentPts.map((p, i) => {
                const ini   = initials(p.prenom, p.nom);
                const stCfg = STATUS_CFG[p.statut] || STATUS_CFG.actif;
                return (
                  <motion.div key={p.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/aide/patients/${p.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-(--sf2) transition-colors group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                        style={{ background: avatarGrad(p.id || p.nom), boxShadow:'0 2px 8px rgba(37,99,235,0.25)' }}>
                        {ini}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-(--t1) truncate">{p.prenom} {p.nom}</p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {p.date_naissance && (
                            <span className="text-xs text-(--t4) flex items-center gap-1">
                              <Calendar size={10} /> {new Date(p.date_naissance).toLocaleDateString('fr-FR')}
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
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${stCfg.cls}`}>{stCfg.label}</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-(--t4) group-hover:text-blue-500 shrink-0 transition-colors" />
                    </Link>
                  </motion.div>
                );
              })}
              {patients.length > 5 && (
                <div className="px-5 py-3 bg-(--sf2)">
                  <Link to="/aide/patients" className="text-xs font-bold hover:underline" style={{ color:P }}>
                    + {patients.length - 5} autres patients →
                  </Link>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Colonne droite */}
        <div className="space-y-5">

          {/* Activité chart */}
          <motion.div {...stagger(6)} className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-(--ln)">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <TrendingUp size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-(--t1)">Activité hebdo</h3>
            </div>
            <div className="p-4" style={{ height: 160 }}>
              <Line data={lineData} options={lineOpts} />
            </div>
          </motion.div>

          {/* Permissions */}
          <motion.div {...stagger(7)} className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-(--ln)">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                  <Lock size={14} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold text-(--t1)">Permissions</h3>
              </div>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300">
                {activePerms.length}/{totalPerms}
              </span>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div style={{ width: 80, height: 80, flexShrink: 0 }} className="relative">
                <Doughnut data={doughnutData} options={doughnutOpts} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black" style={{ color: P }}>{permPct}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                {Object.entries(PERM_LABELS).slice(0, 4).map(([k, label]) => {
                  const active = !!perms[k];
                  return (
                    <div key={k} className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      <span className={`truncate ${active ? 'text-(--t2) font-medium' : 'text-(--t4)'}`}>{label}</span>
                      {active && <CheckCircle size={10} className="shrink-0 text-emerald-500 ml-auto" />}
                    </div>
                  );
                })}
                {totalPerms > 4 && (
                  <Link to="/aide/profil" className="text-[10px] font-bold" style={{ color:P }}>
                    Voir tout →
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
