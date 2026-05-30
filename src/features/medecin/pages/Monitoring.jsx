// src/features/medecin/pages/Monitoring.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, CheckCircle, Clock, TrendingUp,
  TrendingDown, Heart, Wind, Thermometer, Droplets,
  User, Bell, Eye, RefreshCw, Filter, Download,
  AlertCircle, ChevronRight, Zap, Shield, BarChart2,
  Cpu, Radio, Wifi
} from 'lucide-react';

// ─── Données mock ──────────────────────────────────────────────────────────────
const ALERTS = [
  { id: 1, patient: 'KAMGA Jean', avatar: 'KJ', level: 'critical', message: 'SpO₂ critique : 82% — intervention requise', time: '09:14', metric: 'SpO₂', value: '82%', threshold: '< 90%' },
  { id: 2, patient: 'TAMO Bernard', avatar: 'TB', level: 'warning', message: 'Fréquence cardiaque élevée : 118 bpm', time: '08:52', metric: 'FC', value: '118 bpm', threshold: '> 100 bpm' },
  { id: 3, patient: 'FOUDA Marie', avatar: 'FM', level: 'warning', message: 'Température : 39.2°C — fièvre importante', time: '08:30', metric: 'Temp', value: '39.2°C', threshold: '> 38.5°C' },
  { id: 4, patient: 'NGUEMA Paul', avatar: 'NP', level: 'info', message: 'Suivi J+7 : réévaluation recommandée', time: '08:00', metric: 'Suivi', value: 'J+7', threshold: '—' },
  { id: 5, patient: 'MVONDO Alain', avatar: 'MA', level: 'resolved', message: 'Normalisation SpO₂ après traitement', time: '07:45', metric: 'SpO₂', value: '96%', threshold: '> 95%' },
  { id: 6, patient: 'BIYA Christine', avatar: 'BC', level: 'info', message: "Résultats d'imagerie disponibles", time: '07:20', metric: 'Imagerie', value: 'Disponible', threshold: '—' },
];

const PATIENTS_VITALS = [
  { id: 1, name: 'KAMGA Jean', avatar: 'KJ', spo2: 82, fc: 102, temp: 37.8, fr: 26, status: 'critical', diag: 'Tuberculose' },
  { id: 2, name: 'TAMO Bernard', avatar: 'TB', spo2: 94, fc: 118, temp: 38.7, fr: 22, status: 'warning', diag: 'Pneumonie bactérienne' },
  { id: 3, name: 'FOUDA Marie', avatar: 'FM', spo2: 92, fc: 88, temp: 39.2, fr: 24, status: 'warning', diag: 'BPCO stade II' },
  { id: 4, name: 'NGUEMA Paul', avatar: 'NP', spo2: 96, fc: 78, temp: 37.1, fr: 18, status: 'stable', diag: 'Asthme sévère' },
  { id: 5, name: 'MVONDO Alain', avatar: 'MA', spo2: 97, fc: 72, temp: 36.8, fr: 16, status: 'stable', diag: 'Bronchite chronique' },
  { id: 6, name: 'BIYA Christine', avatar: 'BC', spo2: 95, fc: 80, temp: 37.4, fr: 17, status: 'stable', diag: 'Pneumonie' },
];

const IA_METRICS = [
  { label: 'Diagnostics générés', value: 248, change: '+12%', up: true, icon: Cpu },
  { label: 'Concordance IA/Médecin', value: '94.2%', change: '+2.1%', up: true, icon: Shield },
  { label: 'Temps moyen analyse', value: '1.8s', change: '-0.3s', up: true, icon: Zap },
  { label: 'Alertes déclenchées', value: 14, change: '+3', up: false, icon: Radio },
];

// ─── Composants ────────────────────────────────────────────────────────────────
const levelConfig = {
  critical: { label: 'Critique',  bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-600 dark:text-red-400',    border: 'border-l-red-500',    dot: 'bg-red-500',    badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  warning:  { label: 'Attention', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-l-amber-500',  dot: 'bg-amber-500',  badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  info:     { label: 'Info',      bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-600 dark:text-blue-400',   border: 'border-l-blue-500',   dot: 'bg-blue-500',   badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  resolved: { label: 'Résolu',    bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-l-emerald-500', dot: 'bg-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
};

const statusConfig = {
  critical: { label: 'Critique', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  warning:  { label: 'Attention', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  stable:   { label: 'Stable',    color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
};

function VitalBadge({ value, label, icon: Icon, ok }) {
  return (
    <div className={`flex flex-col items-center px-2 py-1 rounded-lg ${ok ? 'bg-(--sf3)' : 'bg-red-50 dark:bg-red-900/20'}`}>
      <span className={`text-xs font-bold ${ok ? 'text-(--t1)' : 'text-red-600 dark:text-red-400'}`}>{value}</span>
      <span className="text-[10px] text-(--t4)">{label}</span>
    </div>
  );
}

export default function Monitoring() {
  const [alertFilter, setAlertFilter] = useState('all');
  const [lastRefresh] = useState(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));

  const criticalCount = ALERTS.filter(a => a.level === 'critical').length;
  const warningCount  = ALERTS.filter(a => a.level === 'warning').length;
  const resolvedCount = ALERTS.filter(a => a.level === 'resolved').length;
  const stableCount   = PATIENTS_VITALS.filter(p => p.status === 'stable').length;

  const filteredAlerts = alertFilter === 'all'
    ? ALERTS
    : ALERTS.filter(a => a.level === alertFilter);

  const kpis = [
    { label: 'Patients suivis', value: PATIENTS_VITALS.length, icon: User, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', sub: 'En cours de monitoring' },
    { label: 'Alertes actives', value: criticalCount + warningCount, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', sub: `${criticalCount} critique(s)` },
    { label: 'Patients stables', value: stableCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', sub: `${resolvedCount} alerte(s) résolue(s)` },
    { label: 'Mises à jour', value: ALERTS.length, icon: RefreshCw, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', sub: `Dernière : ${lastRefresh}` },
  ];

  return (
    <div className="space-y-6">

      {/* ── En-tête ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--t1)">Monitoring</h1>
          <p className="text-sm text-(--t3) mt-1 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-500" />
            Surveillance en temps réel de vos patients
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-(--t3) border border-(--ln) bg-(--sf) rounded-xl hover:bg-(--sf2) transition-colors">
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-(--sf) border border-(--ln) rounded-xl p-4 hover:shadow-sm transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg} mb-3`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold text-(--t1)">{kpi.value}</p>
              <p className="text-sm font-medium text-(--t2) mt-0.5">{kpi.label}</p>
              <p className="text-xs text-(--t4) mt-1">{kpi.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ── Contenu principal ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Alertes ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-(--ln)">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-(--t1)">Alertes récentes</h2>
              {(criticalCount + warningCount) > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-full animate-pulse">
                  {criticalCount + warningCount} actives
                </span>
              )}
            </div>
            <div className="flex gap-1">
              {['all', 'critical', 'warning', 'info', 'resolved'].map(f => (
                <button
                  key={f}
                  onClick={() => setAlertFilter(f)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    alertFilter === f
                      ? 'bg-blue-600 text-white'
                      : 'text-(--t3) hover:bg-(--sf2)'
                  }`}
                >
                  {f === 'all' ? 'Toutes' : f === 'critical' ? 'Critiques' : f === 'warning' ? 'Alertes' : f === 'info' ? 'Info' : 'Résolues'}
                </button>
              ))}
            </div>
          </div>

          {/* Liste alertes */}
          <div className="divide-y divide-(--ln)">
            {filteredAlerts.map((alert, i) => {
              const cfg = levelConfig[alert.level];
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-start gap-4 p-4 border-l-4 ${cfg.border} hover:bg-(--sf2) transition-colors cursor-pointer`}
                >
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold bg-linear-to-br from-blue-500 to-indigo-600`}>
                    {alert.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-(--t1)">{alert.patient}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-(--t2) truncate">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-(--t4) flex items-center gap-1">
                        <Clock className="w-3 h-3" />{alert.time}
                      </span>
                      <span className="text-xs text-(--t4)">{alert.metric} : <strong className={cfg.text}>{alert.value}</strong></span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-(--t4) shrink-0 mt-1" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Métriques IA ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 p-5 border-b border-(--ln)">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <h2 className="font-semibold text-(--t1)">Performance IA</h2>
            </div>
            <div className="p-5 space-y-4">
              {IA_METRICS.map((m, i) => {
                const Icon = m.icon;
                return (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-(--t3)">{m.label}</p>
                      <p className="text-base font-bold text-(--t1)">{m.value}</p>
                    </div>
                    <span className={`flex items-center gap-0.5 text-xs font-semibold ${m.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {m.change}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Résumé statut */}
          <div className="bg-(--sf) border border-(--ln) rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold text-(--t1)">Statut global</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Stables', count: stableCount, total: PATIENTS_VITALS.length, color: 'bg-emerald-500' },
                { label: 'Alertes', count: warningCount, total: PATIENTS_VITALS.length, color: 'bg-amber-500' },
                { label: 'Critiques', count: criticalCount, total: PATIENTS_VITALS.length, color: 'bg-red-500' },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-(--t3)">{s.label}</span>
                    <span className="font-semibold text-(--t2)">{s.count}/{s.total}</span>
                  </div>
                  <div className="w-full h-2 bg-(--sf3) rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${s.color}`}
                      style={{ width: `${(s.count / s.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tableau signes vitaux ────────────────────────────────────────── */}
      <div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-(--ln)">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-(--t1)">Signes vitaux — vue d'ensemble</h2>
          </div>
          <button className="flex items-center gap-1 text-xs text-(--t3) hover:text-(--t1) transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filtrer
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-(--sf2) border-b border-(--ln)">
              <tr>
                {['Patient', 'Diagnostic', 'SpO₂', 'FC (bpm)', 'Temp (°C)', 'FR (/min)', 'Statut', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-(--t3) uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--ln)">
              {PATIENTS_VITALS.map((p, i) => {
                const sc = statusConfig[p.status];
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-(--sf2) transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {p.avatar}
                        </div>
                        <span className="text-sm font-medium text-(--t1) whitespace-nowrap">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-(--t3) whitespace-nowrap">{p.diag}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-semibold ${p.spo2 < 90 ? 'text-red-500' : p.spo2 < 95 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {p.spo2}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-semibold ${p.fc > 100 ? 'text-amber-500' : 'text-(--t2)'}`}>{p.fc}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-semibold ${p.temp >= 38.5 ? 'text-red-500' : p.temp >= 37.5 ? 'text-amber-500' : 'text-(--t2)'}`}>
                        {p.temp}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-semibold ${p.fr > 25 ? 'text-amber-500' : 'text-(--t2)'}`}>{p.fr}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${sc.bg}`}>{sc.label}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="p-1.5 rounded-lg hover:bg-(--sf3) transition-colors">
                        <Eye className="w-4 h-4 text-(--t3)" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
