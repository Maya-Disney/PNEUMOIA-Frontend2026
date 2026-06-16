import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Search, ChevronRight, AlertTriangle,
  Loader2, Calendar, Phone, Lock, CheckCircle,
  Clock, Shield, Activity, RefreshCw,
} from 'lucide-react';
import { getMesPatientsAide } from '../../../services/patientsApi';

const STATUS_CFG = {
  actif:   { label: 'Actif',      pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', bar: 'bg-emerald-500', glow: 'rgba(16,185,129,0.15)',  pulse: false },
  urgent:  { label: 'Urgent',     pill: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',                bar: 'bg-red-500',     glow: 'rgba(239,68,68,0.2)',    pulse: true  },
  attente: { label: 'En attente', pill: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',        bar: 'bg-amber-400',   glow: 'rgba(245,158,11,0.15)', pulse: false },
  cloture: { label: 'Clôturé',    pill: 'bg-slate-100 text-slate-500 dark:bg-slate-500/15 dark:text-slate-400',        bar: 'bg-slate-300',   glow: 'rgba(148,163,184,0.1)', pulse: false },
};

const AVATAR_GRADS = [
  'from-emerald-600 to-teal-700',
  'from-violet-500 to-purple-700',
  'from-teal-500 to-emerald-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-teal-500 to-cyan-600',
  'from-fuchsia-500 to-pink-600',
  'from-emerald-500 to-teal-600',
];

function initials(nom, prenom) {
  return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase() || '??';
}

function calcAge(dateStr) {
  if (!dateStr) return null;
  const y = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(y) || y < 0 ? null : y;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show:   (i) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.055, duration: 0.3, ease: 'easeOut' } }),
};

export default function AidePatients() {
  const navigate = useNavigate();
  const [patients,   setPatients]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState('');
  const [view,       setView]       = useState('grid'); // 'grid' | 'list'
  const intervalRef = useRef(null);

  const perms = (() => { try { return JSON.parse(localStorage.getItem('aide_permissions') || '{}'); } catch { return {}; } })();

  const load = useCallback(async (silent = false) => {
    if (!perms.peut_lire_dossier && !perms.peut_creer_patient && !perms.peut_modifier_patient) {
      setError('access'); if (!silent) setLoading(false); return;
    }
    if (!silent) setLoading(true);
    try {
      const d = await getMesPatientsAide();
      setPatients(Array.isArray(d) ? d : (d?.patients || []));
    } catch (e) {
      if (!silent) setError(e.message || 'Erreur');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
    intervalRef.current = setInterval(() => load(true), 30_000);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  const filtered = patients.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${p.prenom || ''} ${p.nom || ''} ${p.email || ''}`.toLowerCase().includes(q);
  });

  const countBy = patients.reduce((acc, p) => { const s = p.statut || 'actif'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});

  const KPI = [
    { value: patients.length,     label: 'Total',      icon: Users,         gradient: 'from-emerald-500 to-teal-600', tint: 'rgba(5,150,105,0.07)'   },
    { value: countBy.actif || 0,  label: 'Actifs',     icon: CheckCircle,   gradient: 'from-emerald-500 to-teal-600', tint: 'rgba(16,185,129,0.07)'  },
    { value: countBy.urgent || 0, label: 'Urgents',    icon: AlertTriangle, gradient: 'from-red-500 to-rose-600',     tint: 'rgba(239,68,68,0.07)'   },
    { value: countBy.attente || 0,label: 'En attente', icon: Clock,         gradient: 'from-amber-500 to-orange-500', tint: 'rgba(245,158,11,0.07)'  },
  ];

  if (error === 'access') return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
        <Lock className="w-8 h-8 text-emerald-500" />
      </div>
      <h2 className="font-bold text-lg text-(--t1)">Accès restreint</h2>
      <p className="text-sm text-(--t3) max-w-xs">Vous n'avez pas les permissions pour accéder aux dossiers patients.</p>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}
        className="rounded-2xl overflow-hidden shadow-xl"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
        <div className="relative p-6 overflow-hidden">
          <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #059669, transparent)' }} />
          <div className="absolute left-1/4 bottom-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />

          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shrink-0 border border-white/10">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Patients</h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  {loading ? 'Chargement…' : `${patients.length} patient${patients.length !== 1 ? 's' : ''} sous votre suivi`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleRefresh} disabled={refreshing}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white/80 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              {perms.peut_creer_patient && (
                <Link to="/aide/patients/nouveau"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md">
                  <UserPlus className="w-4 h-4" /> Nouveau patient
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── KPI ──────────────────────────────────────────────────── */}
      {!loading && patients.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {KPI.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                className="bg-(--sf) border border-(--ln) rounded-xl overflow-hidden">
                <div className="px-4 pt-4 pb-3" style={{ backgroundColor: card.tint }}>
                  <p className="text-3xl font-black text-(--t1)">{card.value}</p>
                  <p className="text-sm font-semibold text-(--t2) mt-0.5">{card.label}</p>
                </div>
                <div className="h-px bg-(--ln)" />
                <div className="px-4 py-3 flex items-center gap-3 bg-(--sf)">
                  <div className={`w-8 h-8 rounded-lg bg-linear-to-br ${card.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs text-(--t4)">patients</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── BARRE RECHERCHE + TOGGLE ─────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
        className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, prénom, email…"
            className="w-full pl-10 pr-4 py-2.5 bg-(--sf) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-emerald-400/25 focus:border-emerald-400 transition-all" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-(--t4) hover:text-(--t2) transition-colors">
              ✕
            </button>
          )}
        </div>
        {/* Vue toggle */}
        <div className="flex gap-1 bg-(--sf2) rounded-xl p-1 border border-(--ln) shrink-0">
          {[
            { k: 'grid', icon: '⊞' },
            { k: 'list', icon: '☰' },
          ].map(v => (
            <button key={v.k} onClick={() => setView(v.k)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === v.k ? 'bg-(--sf) text-(--t1) shadow-sm' : 'text-(--t4) hover:text-(--t2)'}`}>
              {v.icon}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── CONTENU ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
          <p className="font-semibold text-(--t2)">Impossible de charger les patients</p>
          <p className="text-xs text-(--t4)">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-(--sf2) border border-(--ln) flex items-center justify-center">
            <Users className="w-8 h-8 text-(--t4)" />
          </div>
          <p className="font-semibold text-(--t2)">{search ? 'Aucun résultat' : 'Aucun patient'}</p>
          <p className="text-xs text-(--t4)">
            {search ? `Aucun patient correspondant à "${search}"` : 'Commencez par créer un dossier patient'}
          </p>
          {!search && perms.peut_creer_patient && (
            <Link to="/aide/patients/nouveau"
              className="mt-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-colors">
              + Nouveau patient
            </Link>
          )}
        </motion.div>
      ) : view === 'grid' ? (

        /* ── GRILLE CARTES ──────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p, idx) => {
            const ini   = initials(p.nom, p.prenom);
            const st    = STATUS_CFG[p.statut] || STATUS_CFG.actif;
            const grad  = AVATAR_GRADS[idx % AVATAR_GRADS.length];
            const age   = calcAge(p.date_naissance);
            return (
              <motion.div key={p.id}
                custom={idx} variants={cardVariants} initial="hidden" animate="show"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => navigate(`/aide/patients/${p.id}`)}
                className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all group">

                {/* Barre de statut en haut */}
                <div className={`h-1 w-full ${st.bar}`} />

                <div className="p-4">
                  {/* Header: avatar + badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${grad} flex items-center justify-center text-xl font-black text-white shadow-md`}>
                        {ini}
                      </div>
                      {/* Point statut */}
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-(--sf) ${st.bar} ${st.pulse ? 'animate-pulse' : ''}`} />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${st.pill}`}>
                      {st.label}
                    </span>
                  </div>

                  {/* Nom */}
                  <p className="font-bold text-(--t1) truncate text-base leading-tight">
                    {p.prenom} {p.nom}
                  </p>
                  {age !== null && (
                    <p className="text-xs text-(--t4) mt-0.5">{age} ans</p>
                  )}

                  {/* Infos */}
                  <div className="mt-3 space-y-1.5">
                    {p.date_naissance && (
                      <div className="flex items-center gap-2 text-xs text-(--t3)">
                        <Calendar className="w-3.5 h-3.5 text-(--t4) shrink-0" />
                        {new Date(p.date_naissance).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                    {p.telephone && (
                      <div className="flex items-center gap-2 text-xs text-(--t3)">
                        <Phone className="w-3.5 h-3.5 text-(--t4) shrink-0" />
                        {p.telephone}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {perms.peut_lire_dossier && (
                    <div className="mt-4 pt-3 border-t border-(--ln) flex items-center justify-between">
                      <span className="text-xs text-(--t4)">Voir le dossier</span>
                      <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      ) : (

        /* ── VUE LISTE ──────────────────────────────────────────── */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-(--ln) bg-(--sf2)">
            <span className="text-xs font-semibold text-(--t3)">{filtered.length} patient{filtered.length > 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y divide-(--ln)">
            {filtered.map((p, idx) => {
              const ini  = initials(p.nom, p.prenom);
              const st   = STATUS_CFG[p.statut] || STATUS_CFG.actif;
              const grad = AVATAR_GRADS[idx % AVATAR_GRADS.length];
              return (
                <motion.div key={p.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => navigate(`/aide/patients/${p.id}`)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-(--sf2) transition-colors cursor-pointer group">
                  <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${grad} flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm`}>
                    {ini}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-(--t1)">{p.prenom} {p.nom}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.pill}`}>{st.label}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-0.5">
                      {p.date_naissance && <span className="text-xs text-(--t4) flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.date_naissance).toLocaleDateString('fr-FR')}</span>}
                      {p.telephone && <span className="text-xs text-(--t4) flex items-center gap-1"><Phone className="w-3 h-3" />{p.telephone}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-(--t4) group-hover:text-emerald-500 shrink-0 transition-colors" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
