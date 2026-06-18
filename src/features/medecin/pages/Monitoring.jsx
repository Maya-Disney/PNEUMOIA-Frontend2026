// src/features/medecin/pages/Monitoring.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, CheckCircle, Clock, TrendingUp,
  TrendingDown, User, Bell, Eye, RefreshCw, Download,
  AlertCircle, ChevronRight, Zap, Shield, BarChart2,
  Cpu, Radio, Wifi, X, Calendar, Hospital, Stethoscope,
} from 'lucide-react';
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { TablePagination } from '../../../components/ui/TablePagination';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const REFRESH_INTERVAL = 30;

async function apiFetch(endpoint) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Erreur ${res.status}`);
  return data;
}

/* ─── Couleurs graphiques ─────────────────────────────────────────── */
const PIE_COLORS = ['#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#64748b', '#8b5cf6'];

/* ─── Config niveaux alertes ──────────────────────────────────────── */
const levelConfig = {
  critical: { label: 'Critique',  badgeBg: 'bg-red-50 dark:bg-red-500/10',     badgeTx: 'text-red-600 dark:text-red-400',     border: 'border-l-red-400'     },
  warning:  { label: 'Attention', badgeBg: 'bg-amber-50 dark:bg-amber-500/10',  badgeTx: 'text-amber-600 dark:text-amber-400',  border: 'border-l-amber-400'   },
  info:     { label: 'Info',      badgeBg: 'bg-blue-50 dark:bg-blue-500/10',    badgeTx: 'text-blue-600 dark:text-blue-400',    border: 'border-l-blue-400'    },
  resolved: { label: 'Résolu',    badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10', badgeTx: 'text-emerald-600 dark:text-emerald-400', border: 'border-l-emerald-400' },
};
const statusConfig = {
  critique:  { label: 'Critique',  bg: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'       },
  urgent:    { label: 'Urgent',    bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  stable:    { label: 'Stable',    bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  surveille: { label: 'Surveillé', bg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'    },
};

/* ─── Carte graphique ─────────────────────────────────────────────── */
function ChartCard({ title, subtitle, loading, empty, error, children }) {
  return (
    <div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
      <div className="px-5 pt-4 pb-2">
        <p className="text-sm font-bold text-(--t1)">{title}</p>
        {subtitle && <p className="text-[11px] text-(--t4) mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-2 pb-4">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-(--t4) animate-spin" />
          </div>
        ) : error ? (
          <div className="h-40 flex flex-col items-center justify-center gap-2 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <p className="text-xs text-center px-4">{error}</p>
          </div>
        ) : empty ? (
          <div className="h-40 flex flex-col items-center justify-center gap-2 text-(--t4)">
            <BarChart2 className="w-6 h-6" />
            <p className="text-xs">Aucune donnée sur cette période</p>
          </div>
        ) : children}
      </div>
    </div>
  );
}

/* ─── Modal détail patient ───────────────────────────────────────── */
function PatientModal({ cas, onClose }) {
  const navigate = useNavigate();
  if (!cas) return null;
  const sv = cas.signes_vitaux || {};
  const sc = statusConfig[cas.statut_clinique] || statusConfig.stable;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative z-10 bg-(--sf) border border-(--ln) rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-start justify-between p-5 border-b border-(--ln)">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {`${cas.patient_prenom?.[0] || ''}${cas.patient_nom?.[0] || ''}`.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-(--t1)">{cas.patient_prenom} {cas.patient_nom}</p>
              <p className="text-xs text-(--t3)">{cas.diagnostic?.pathologie || '—'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-(--sf2) rounded-lg transition-colors">
            <X className="w-4 h-4 text-(--t3)" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${sc.bg}`}>{sc.label}</span>
            {cas.hospitalisation && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">Hospitalisé</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Âge',         value: cas.patient_age ? `${cas.patient_age} ans` : '—' },
              { label: 'Sexe',        value: cas.patient_sexe === 'M' ? 'Homme' : cas.patient_sexe === 'F' ? 'Femme' : '—' },
              { label: 'Gr. sanguin', value: cas.patient_groupe_sanguin || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-(--sf2) rounded-xl py-2">
                <p className="text-sm font-bold text-(--t1)">{value}</p>
                <p className="text-[10px] text-(--t4)">{label}</p>
              </div>
            ))}
          </div>
          {cas.motif && (
            <div className="bg-(--sf2) rounded-xl px-3 py-2.5">
              <p className="text-[10px] font-semibold text-(--t4) uppercase tracking-wide mb-1">Motif</p>
              <p className="text-sm text-(--t2) italic">{cas.motif}</p>
            </div>
          )}
          {Object.keys(sv).length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-(--t4) uppercase tracking-wide mb-2">Signes vitaux</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'SpO₂',  value: sv.saturation_o2,         unit: '%',    alert: sv.saturation_o2 < 94 },
                  { label: 'Temp.', value: sv.temperature,            unit: '°C',   alert: sv.temperature >= 38.5 },
                  { label: 'FC',    value: sv.frequence_cardiaque,    unit: ' bpm', alert: sv.frequence_cardiaque > 100 || sv.frequence_cardiaque < 50 },
                  { label: 'FR',    value: sv.frequence_respiratoire, unit: '/min', alert: false },
                ].filter(v => v.value !== null && v.value !== undefined).map(v => (
                  <div key={v.label} className={`flex items-center justify-between px-3 py-2 rounded-xl ${v.alert ? 'bg-red-50 dark:bg-red-500/10' : 'bg-(--sf2)'}`}>
                    <span className="text-xs text-(--t3)">{v.label}</span>
                    <span className={`text-sm font-bold ${v.alert ? 'text-red-500' : 'text-(--t1)'}`}>{v.value}{v.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {cas.diagnostic && (
            <div className="bg-(--sf2) rounded-xl p-3">
              <p className="text-[10px] font-semibold text-(--t4) uppercase tracking-wide mb-1">Diagnostic IA</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-(--t1)">{cas.diagnostic.pathologie}</p>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{Math.round(cas.diagnostic.confidence || 0)}%</span>
              </div>
            </div>
          )}
          <button
            onClick={() => { onClose(); navigate(`/medecin/patients/${cas.patient_id}`); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Stethoscope className="w-4 h-4" />Voir le dossier complet
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Skel({ h = 'h-4', w = 'w-full' }) {
  return <div className={`${h} ${w} bg-(--sf2) animate-pulse rounded-lg`} />;
}

/* ─── Périodes ────────────────────────────────────────────────────── */
const PERIODES = [
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week',  label: '7 derniers jours' },
  { key: 'month', label: 'Ce mois' },
];

/* ─── Page principale ─────────────────────────────────────────────── */
export default function Monitoring() {
  /* ── State ── */
  const [periode,       setPeriode]       = useState('week');
  const [alertFilter,   setAlertFilter]   = useState('all');
  const [countdown,     setCountdown]     = useState(REFRESH_INTERVAL);
  const [loading,       setLoading]       = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [error,         setError]         = useState(null);
  const [chartError,    setChartError]    = useState(null);
  const [casGraves,     setCasGraves]     = useState([]);
  const [chartData,     setChartData]     = useState(null);
  const [iaMetrics,     setIaMetrics]     = useState(null);
  const [selectedCas,   setSelectedCas]   = useState(null);
  const [vitalsPage,    setVitalsPage]    = useState(1);
  const [vitalsPageSz,  setVitalsPageSz]  = useState(10);
  const isFetching = useRef(false);

  /* ── Fetch cas graves + métriques IA ── */
  const charger = useCallback(async (quiet = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const [graves, metrics] = await Promise.all([
        apiFetch('/consultations/cas-graves'),
        apiFetch('/monitoring/ia-metrics'),
      ]);
      setCasGraves(Array.isArray(graves) ? graves : []);
      setIaMetrics(metrics);
    } catch (e) {
      setError(e.message);
    } finally {
      isFetching.current = false;
      setLoading(false);
      setCountdown(REFRESH_INTERVAL);
    }
  }, []);

  /* ── Fetch données graphiques (selon période) ── */
  const chargerStats = useCallback(async (p) => {
    setLoadingCharts(true);
    setChartError(null);
    try {
      const data = await apiFetch(`/monitoring/stats?periode=${p}`);
      setChartData(data);
    } catch (e) {
      setChartError(e.message || 'Erreur de chargement des graphiques');
      setChartData(null);
    } finally {
      setLoadingCharts(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);
  useEffect(() => { chargerStats(periode); }, [chargerStats, periode]);

  /* ── Countdown ── */
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { charger(true); chargerStats(periode); return REFRESH_INTERVAL; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [charger, chargerStats, periode]);

  /* ── Dérivations cas graves ── */
  const critiques = casGraves.filter(c => c.statut_clinique === 'critique' || c.diagnostic?.etat_patient === 'critique');
  const urgents   = casGraves.filter(c =>
    !critiques.find(x => x.consultation_id === c.consultation_id) &&
    (c.statut_clinique === 'urgent' || c.diagnostic?.etat_patient === 'urgent')
  );
  const hospit  = casGraves.filter(c => c.hospitalisation);
  const stables = casGraves.filter(c =>
    !critiques.find(x => x.consultation_id === c.consultation_id) &&
    !urgents.find(x => x.consultation_id === c.consultation_id)
  );

  /* ── Alertes construites depuis les signes vitaux réels ── */
  const alertesReelles = casGraves.flatMap(c => {
    const sv = c.signes_vitaux || {};
    const nm = `${c.patient_prenom} ${c.patient_nom}`;
    const av = `${c.patient_prenom?.[0] || ''}${c.patient_nom?.[0] || ''}`.toUpperCase();
    const t  = new Date(c.updated_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const out = [];
    if (sv.saturation_o2 && sv.saturation_o2 < 94)
      out.push({ id: `${c.consultation_id}-spo2`, patient: nm, avatar: av, level: 'critical', message: `SpO₂ critique : ${sv.saturation_o2}%`, time: t, metric: 'SpO₂', value: `${sv.saturation_o2}%` });
    if (sv.frequence_cardiaque && (sv.frequence_cardiaque > 100 || sv.frequence_cardiaque < 50))
      out.push({ id: `${c.consultation_id}-fc`, patient: nm, avatar: av, level: 'warning', message: `FC anormale : ${sv.frequence_cardiaque} bpm`, time: t, metric: 'FC', value: `${sv.frequence_cardiaque} bpm` });
    if (sv.temperature && sv.temperature >= 38.5)
      out.push({ id: `${c.consultation_id}-temp`, patient: nm, avatar: av, level: 'warning', message: `Fièvre : ${sv.temperature}°C`, time: t, metric: 'Temp', value: `${sv.temperature}°C` });
    return out;
  });

  const allAlerts     = alertesReelles;
  const filteredAlerts = alertFilter === 'all' ? allAlerts : allAlerts.filter(a => a.level === alertFilter);
  const critAlerts    = allAlerts.filter(a => a.level === 'critical').length;
  const warnAlerts    = allAlerts.filter(a => a.level === 'warning').length;

  /* ── Pagination ── */
  const from     = (vitalsPage - 1) * vitalsPageSz;
  const pagedCas = casGraves.slice(from, from + vitalsPageSz);

  /* ── Export CSV ── */
  function exportCSV() {
    const header = 'Patient,Pathologie,SpO2(%),Temp(°C),FC(bpm),FR(/min),Statut\n';
    const rows = casGraves.map(c => {
      const sv = c.signes_vitaux || {};
      return [`${c.patient_prenom} ${c.patient_nom}`, c.diagnostic?.pathologie || '', sv.saturation_o2 || '', sv.temperature || '', sv.frequence_cardiaque || '', sv.frequence_respiratoire || '', c.statut_clinique || ''].join(',');
    });
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `monitoring_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  /* ── Données graphiques (réelles ou vides) ── */
  const spo2Data        = chartData?.spo2_par_jour    || [];
  const consultData     = chartData?.consult_par_jour || [];
  const pathoData       = chartData?.patho_data       || [];
  const concordanceData = chartData?.concordance_data || [];
  const equipeData      = chartData?.equipe_data      || [];

  /* ── Métriques IA réelles ── */
  const iaTotal       = iaMetrics?.total_diagnostics ?? '—';
  const iaConcordance = iaMetrics?.concordance_rate  != null ? `${iaMetrics.concordance_rate}%` : '—';
  const iaTemps       = iaMetrics?.avg_inference_s   != null ? `${iaMetrics.avg_inference_s}s`  : '—';
  const iaAlertes     = iaMetrics?.alertes_today     ?? '—';
  const iaDelta       = iaMetrics?.delta_diags_7j;

  const subtitlePeriode = periode === 'today' ? "Aujourd'hui" : periode === 'week' ? '7 derniers jours' : 'Ce mois';

  /* ─── Rendu ──────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">

      {/* ── En-tête ── */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-(--t4) mb-0.5">Temps réel</p>
          <h1 className="text-xl font-black text-(--t1)">Monitoring</h1>
          <p className="text-sm text-(--t3) mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Surveillance active · Actualisation dans <span className="font-bold text-(--t1) tabular-nums ml-1">{countdown}s</span>
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-0.5 p-1 bg-(--sf2) border border-(--ln) rounded-xl">
            {PERIODES.map(p => (
              <button key={p.key} onClick={() => setPeriode(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${periode === p.key ? 'bg-(--sf) text-(--t1) shadow-sm' : 'text-(--t3) hover:text-(--t2)'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-(--t2) border border-(--ln) bg-(--sf) rounded-xl hover:bg-(--sf2) transition-colors">
            <Download className="w-4 h-4" />CSV
          </button>
          <button onClick={() => { charger(); chargerStats(periode); }} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Actualiser
          </button>
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? [1,2,3,4].map(i => (
          <div key={i} className="bg-(--sf) border border-(--ln) rounded-2xl p-4 animate-pulse space-y-2">
            <div className="w-10 h-10 bg-(--sf2) rounded-xl" />
            <Skel h="h-7" w="w-1/2" /><Skel h="h-3" />
          </div>
        )) : [
          { label: 'Cas surveillés',    value: casGraves.length,  sub: `${stables.length} stable(s)`,                                                   icon: User,          bg: 'bg-(--sf2)',                               tx: 'text-(--t1)'  },
          { label: 'Alertes critiques', value: critiques.length,  sub: `${critAlerts} alerte(s) vitale(s)`,                                              icon: AlertTriangle, bg: 'bg-red-50 dark:bg-red-500/10',            tx: 'text-red-600 dark:text-red-400'    },
          { label: 'Cas urgents',       value: urgents.length,    sub: `${warnAlerts} avertissement(s)`,                                                  icon: Bell,          bg: 'bg-amber-50 dark:bg-amber-500/10',        tx: 'text-amber-600 dark:text-amber-400' },
          { label: 'Hospitalisés',      value: hospit.length,     sub: `${Math.round((hospit.length / Math.max(casGraves.length, 1)) * 100)}% des cas`, icon: Hospital,      bg: 'bg-purple-50 dark:bg-purple-500/10',      tx: 'text-purple-600 dark:text-purple-400' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-(--sf) border border-(--ln) rounded-2xl p-4 hover:shadow-sm transition-all">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.bg} mb-3`}>
                <Icon className={`w-4 h-4 ${kpi.tx}`} />
              </div>
              <p className={`text-2xl font-black ${kpi.tx}`}>{kpi.value}</p>
              <p className="text-sm font-semibold text-(--t1) mt-0.5">{kpi.label}</p>
              <p className="text-[11px] text-(--t4) mt-0.5">{kpi.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ── Graphiques ── */}
      <div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <BarChart2 className="w-4 h-4 text-(--t3)" />
          <h2 className="text-sm font-bold text-(--t1)">Analyses & tendances</h2>
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200/50 dark:border-blue-500/20">
            {subtitlePeriode}
          </span>
          {chartError && (
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{chartError}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* 1. SpO₂ par jour */}
          <ChartCard
            title="Évolution SpO₂ (%)"
            subtitle={`${subtitlePeriode} — moyenne & minimum`}
            loading={loadingCharts}
            empty={spo2Data.length === 0}
          >
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={spo2Data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="jour" tick={{ fontSize: 10 }} />
                <YAxis domain={[75, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2} dot={false} name="Moy." />
                <Line type="monotone" dataKey="min" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Min." />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 2. Consultations par jour */}
          <ChartCard
            title="Consultations / jour"
            subtitle={subtitlePeriode}
            loading={loadingCharts}
            empty={consultData.length === 0}
          >
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={consultData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="jour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Consultations" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 3. Répartition pathologies */}
          <ChartCard
            title="Répartition pathologies"
            subtitle="Diagnostics IA — toutes périodes"
            loading={loadingCharts}
            empty={pathoData.length === 0}
          >
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pathoData} cx="50%" cy="50%" innerRadius={42} outerRadius={68}
                     paddingAngle={3} dataKey="value" nameKey="name">
                  {pathoData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v}%`, n]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 4. Concordance IA/Médecin */}
          <ChartCard
            title="Concordance IA / Médecin (%)"
            subtitle="7 dernières semaines"
            loading={loadingCharts}
            empty={concordanceData.length === 0}
          >
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={concordanceData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gConc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Concordance']} />
                <Area type="monotone" dataKey="val" name="Concordance" stroke="#6366f1" fill="url(#gConc)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 5. Base vs Équipe */}
          <ChartCard
            title="Base vs Équipe"
            subtitle="Consultations partagées — 6 mois"
            loading={loadingCharts}
            empty={equipeData.length === 0}
          >
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={equipeData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="mois" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="base"   name="Base"   fill="#6366f1" radius={[3, 3, 0, 0]} stackId="a" />
                <Bar dataKey="equipe" name="Équipe" fill="#0ea5e9" radius={[3, 3, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 6. Performance IA — données réelles */}
          <div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-(--ln)">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-(--t1)">Performance IA</h2>
            </div>
            <div className="p-4 space-y-3.5">
              {[
                { label: 'Diagnostics générés',   value: iaTotal,       delta: iaDelta != null ? (iaDelta >= 0 ? `+${iaDelta}` : `${iaDelta}`) : null, up: (iaDelta ?? 0) >= 0, icon: Cpu    },
                { label: 'Concordance IA/Médecin', value: iaConcordance, delta: null,                                                                    up: true,               icon: Shield },
                { label: 'Temps moyen analyse',    value: iaTemps,       delta: null,                                                                    up: true,               icon: Zap    },
                { label: 'Alertes aujourd\'hui',   value: iaAlertes,     delta: null,                                                                    up: false,              icon: Radio  },
              ].map(m => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-(--t4) leading-none">{m.label}</p>
                      <p className="text-sm font-bold text-(--t1)">{m.value}</p>
                    </div>
                    {m.delta != null && (
                      <span className={`flex items-center gap-0.5 text-xs font-semibold ${m.up ? 'text-emerald-600' : 'text-red-500'}`}>
                        {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {m.delta}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Alertes + Statut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-(--ln) flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-(--t1)">Alertes cliniques</h2>
              {(critAlerts + warnAlerts) > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full animate-pulse">
                  {critAlerts + warnAlerts} actives
                </span>
              )}
            </div>
            <div className="flex gap-1 flex-wrap">
              {[
                { key: 'all',      label: 'Toutes'   },
                { key: 'critical', label: 'Critiques' },
                { key: 'warning',  label: 'Alertes'  },
                { key: 'info',     label: 'Info'     },
                { key: 'resolved', label: 'Résolues' },
              ].map(f => (
                <button key={f.key} onClick={() => setAlertFilter(f.key)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${alertFilter === f.key ? 'bg-blue-600 text-white' : 'text-(--t3) hover:bg-(--sf2)'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-(--ln)">
            {filteredAlerts.length === 0 ? (
              <div className="py-10 text-center text-sm text-(--t4)">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                {allAlerts.length === 0 ? 'Aucun signe vital anormal détecté' : 'Aucune alerte dans cette catégorie'}
              </div>
            ) : filteredAlerts.slice(0, 6).map((alert, i) => {
              const cfg = levelConfig[alert.level] || levelConfig.info;
              return (
                <motion.div key={alert.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className={`flex items-start gap-3.5 p-4 border-l-[3px] ${cfg.border} hover:bg-(--sf2) transition-colors cursor-pointer`}>
                  <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold bg-linear-to-br from-blue-500 to-indigo-600">
                    {alert.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-semibold text-sm text-(--t1)">{alert.patient}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${cfg.badgeBg} ${cfg.badgeTx}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-(--t2) truncate">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-(--t4) flex items-center gap-1"><Clock className="w-3 h-3" />{alert.time}</span>
                      <span className="text-xs text-(--t4)">{alert.metric} : <strong className={cfg.badgeTx}>{alert.value}</strong></span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-(--t4) shrink-0 mt-1" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Statut global */}
        <div className="bg-(--sf) border border-(--ln) rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-(--ln) pb-3">
            <Activity className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-(--t1)">Statut global</h2>
          </div>
          {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="space-y-1.5"><Skel h="h-3" /><Skel h="h-2" /></div>)}</div> : (
            <div className="space-y-4">
              {[
                { label: 'Stables',   count: stables.length,   color: 'bg-emerald-500' },
                { label: 'Urgents',   count: urgents.length,   color: 'bg-amber-500'   },
                { label: 'Critiques', count: critiques.length, color: 'bg-red-500'     },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-(--t3)">{s.label}</span>
                    <span className="font-bold text-(--t2)">{s.count}/{casGraves.length || 1}</span>
                  </div>
                  <div className="w-full h-2 bg-(--sf2) rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.count / Math.max(casGraves.length, 1)) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-2 rounded-full ${s.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="pt-3 border-t border-(--ln)">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-(--t3)" />
              <p className="text-xs font-bold text-(--t2)">Suivis en attente</p>
            </div>
            {casGraves.filter(c => c.statut !== 'terminee').length === 0 ? (
              <p className="text-xs text-(--t4) italic">Aucun suivi en attente</p>
            ) : (
              <div className="space-y-2">
                {casGraves.filter(c => c.statut !== 'terminee').slice(0, 3).map(c => (
                  <div key={c.consultation_id} className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-(--t2) truncate">{c.patient_prenom} {c.patient_nom}</p>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold whitespace-nowrap ml-2">En attente</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tableau signes vitaux ── */}
      <div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-(--ln)">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-(--t1)">Signes vitaux — cas graves</h2>
          </div>
          {!loading && <span className="text-xs text-(--t4)">{casGraves.length} patient(s)</span>}
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="flex gap-4"><Skel h="h-8" w="w-8" /><div className="flex-1 space-y-1.5"><Skel h="h-4" /><Skel h="h-3" w="w-2/3" /></div></div>)}
          </div>
        ) : error ? (
          <div className="py-10 text-center text-sm text-(--t4)">
            <AlertCircle className="w-7 h-7 mx-auto mb-2 text-red-400" />{error}
          </div>
        ) : casGraves.length === 0 ? (
          <div className="py-10 text-center text-sm text-(--t4)">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />Aucun cas grave à surveiller
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-(--sf2) border-b border-(--ln)">
                  <tr>
                    {['Patient', 'Diagnostic', 'SpO₂', 'FC (bpm)', 'Temp (°C)', 'FR (/min)', 'Statut', 'Dossier'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-(--t3) uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--ln)">
                  {pagedCas.map((c, i) => {
                    const sv = c.signes_vitaux || {};
                    const sc = statusConfig[c.statut_clinique] || statusConfig.stable;
                    const initials = `${c.patient_prenom?.[0] || ''}${c.patient_nom?.[0] || ''}`.toUpperCase();
                    return (
                      <motion.tr key={c.consultation_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="hover:bg-(--sf2) transition-colors cursor-pointer" onClick={() => setSelectedCas(c)}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
                            <span className="text-sm font-semibold text-(--t1) whitespace-nowrap">{c.patient_prenom} {c.patient_nom}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4"><span className="text-xs text-(--t3) whitespace-nowrap">{c.diagnostic?.pathologie || '—'}</span></td>
                        <td className="py-3 px-4">
                          <span className={`text-sm font-bold ${sv.saturation_o2 < 90 ? 'text-red-500' : sv.saturation_o2 < 94 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {sv.saturation_o2 != null ? `${sv.saturation_o2}%` : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-sm font-bold ${(sv.frequence_cardiaque > 100 || sv.frequence_cardiaque < 50) ? 'text-amber-500' : 'text-(--t2)'}`}>
                            {sv.frequence_cardiaque ?? '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-sm font-bold ${sv.temperature >= 38.5 ? 'text-red-500' : sv.temperature >= 37.5 ? 'text-amber-500' : 'text-(--t2)'}`}>
                            {sv.temperature ?? '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-sm font-bold ${sv.frequence_respiratoire > 25 ? 'text-amber-500' : 'text-(--t2)'}`}>
                            {sv.frequence_respiratoire ?? '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${sc.bg}`}>{sc.label}</span></td>
                        <td className="py-3 px-4">
                          <button className="p-1.5 rounded-lg hover:bg-(--sf3) transition-colors" onClick={e => { e.stopPropagation(); setSelectedCas(c); }}>
                            <Eye className="w-4 h-4 text-(--t3)" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <TablePagination
              total={casGraves.length} page={vitalsPage} pageSize={vitalsPageSz}
              onPageChange={setVitalsPage}
              onPageSizeChange={s => { setVitalsPageSz(s); setVitalsPage(1); }}
            />
          </>
        )}
      </div>

      {/* ── Modal patient ── */}
      <AnimatePresence>
        {selectedCas && <PatientModal cas={selectedCas} onClose={() => setSelectedCas(null)} />}
      </AnimatePresence>
    </div>
  );
}
