// src/features/medecin/pages/Dashboard.jsx
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, AlertTriangle, Stethoscope, Award,
  ChevronRight, Eye,
  FileText, Calendar, Clock, TrendingUp,
  Activity, CheckCircle,
  Star, PlusCircle,
  RefreshCw, UserPlus,
  Zap, Crown, Trophy,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  Filler, Tooltip as ChartTooltip, Legend as ChartLegend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, ChartTooltip, ChartLegend);
import { useProfil } from '../hooks/useAuth';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function apiFetch(ep) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}${ep}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { profil } = useProfil();
  const [period, setPeriod] = useState('weekly');
  const [statsLoading, setStatsLoading] = useState(false);
  const [rankData, setRankData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    chartData: [],
    recentConsultations: [],
    recentPatients: [],
    diagnostics: [],
    ranking: { position: '—', total: '—', score: '—', cases: '—' }
  });



  const generateChartData = (period) => {
    if (period === 'weekly') {
      return [
        { day: "Lun", consultations: 12, patients: 8 },
        { day: "Mar", consultations: 18, patients: 14 },
        { day: "Mer", consultations: 14, patients: 11 },
        { day: "Jeu", consultations: 22, patients: 18 },
        { day: "Ven", consultations: 26, patients: 22 },
        { day: "Sam", consultations: 20, patients: 16 },
        { day: "Dim", consultations: 16, patients: 13 }
      ];
    } else if (period === 'monthly') {
      return [
        { day: "Sem 1", consultations: 45, patients: 38 },
        { day: "Sem 2", consultations: 52, patients: 44 },
        { day: "Sem 3", consultations: 48, patients: 41 },
        { day: "Sem 4", consultations: 62, patients: 55 }
      ];
    } else {
      return [
        { day: "Jan", consultations: 180, patients: 145 },
        { day: "Fév", consultations: 195, patients: 160 },
        { day: "Mar", consultations: 210, patients: 178 },
        { day: "Avr", consultations: 225, patients: 190 },
        { day: "Mai", consultations: 240, patients: 205 },
        { day: "Juin", consultations: 235, patients: 200 }
      ];
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    setStatsLoading(true);
    const chartData = generateChartData(period);

    try {
      // Appels parallèles : patients, consultations historique, cas graves, rang, IA métriques
      const [patients, consultations, casGraves, rang, iaMetrics] = await Promise.allSettled([
        apiFetch('/patients/mes-patients'),
        apiFetch('/consultations/historique'),
        apiFetch('/consultations/cas-graves'),
        apiFetch('/medecins/mon-rang'),
        apiFetch('/monitoring/ia-metrics'),
      ]);

      const pts   = patients.status      === 'fulfilled' ? (patients.value      || []) : [];
      const conss = consultations.status === 'fulfilled' ? (consultations.value || []) : [];
      const grv   = casGraves.status     === 'fulfilled' ? (casGraves.value     || []) : [];
      const rg    = rang.status          === 'fulfilled' ?  rang.value                 : null;
      const ia    = iaMetrics.status     === 'fulfilled' ?  iaMetrics.value            : null;

      // grv contient déjà uniquement les cas graves (filtrage fait côté backend)
      const urgents = grv;

      // Consultations récentes depuis l'historique réel
      const fmtDate = (d) => {
        if (!d) return '—';
        const dt = new Date(d);
        const today = new Date();
        const diff = Math.floor((today - dt) / 86400000);
        if (diff === 0) return "Aujourd'hui";
        if (diff === 1) return 'Hier';
        return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      };

      const recentConsultations = conss.slice(0, 5).map(c => ({
        id:         c.id,
        name:       c.patient ? `${c.patient.prenom} ${c.patient.nom}` : '—',
        pathology:  c.diagnostic?.maladies?.[0]?.nom || 'Pas de diagnostic',
        percentage: c.diagnostic?.maladies?.[0]?.pct || 0,
        date:       fmtDate(c.created_at),
        time:       new Date(c.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        status:     c.statut === 'terminee' ? 'completed' : c.statut === 'en_attente' ? 'pending' : 'in-progress',
        avatar:     `${c.patient?.prenom?.[0] || ''}${c.patient?.nom?.[0] || ''}`.toUpperCase() || '?',
      }));

      // Patients récents
      const recentPatients = pts.slice(0, 5).map(p => {
        const age = p.date_naissance ? Math.floor((Date.now() - new Date(p.date_naissance)) / 31557600000) : null;
        return {
          name:      `${p.prenom} ${p.nom}`,
          age:       age ? `${age} ans` : '—',
          pathology: '—',
          status:    'Stable',
          lastVisit: fmtDate(p.updated_at || p.created_at),
          id:        p.id,
        };
      });

      // KPI stats
      const stats = [
        {
          title:    'Patients totaux',
          value:    pts.length,
          icon:     Users,
          increase: `${pts.length} au total`,
          trend:    'up',
          gradient: 'from-blue-500 to-blue-600',
          subtitle: `${pts.length} patient${pts.length > 1 ? 's' : ''} enregistré${pts.length > 1 ? 's' : ''}`,
          link:     '/medecin/patients',
        },
        {
          title:    'Cas urgents',
          value:    urgents.length,
          icon:     AlertTriangle,
          increase: urgents.length > 0 ? `${urgents.length} à surveiller` : 'Aucun',
          trend:    urgents.length > 0 ? 'up' : 'down',
          gradient: 'from-orange-500 to-orange-600',
          subtitle: `${urgents.length} patient${urgents.length > 1 ? 's' : ''} nécessitent une attention`,
          link:     '/medecin/monitoring',
        },
        {
          title:    'Consultations',
          value:    conss.length,
          icon:     Stethoscope,
          increase: `${conss.filter(c => c.statut === 'terminee').length} terminées`,
          trend:    'up',
          gradient: 'from-emerald-500 to-emerald-600',
          subtitle: `${conss.filter(c => c.statut === 'en_attente').length} en attente`,
          link:     '/medecin/historique',
        },
        {
          title:    'Score IA',
          value:    ia ? `${ia.concordance_rate}%` : '—',
          icon:     Award,
          increase: rg ? `${rg.nb_partages} partagés` : '',
          trend:    'up',
          gradient: 'from-blue-500 to-blue-600',
          subtitle: ia ? `${ia.total_diagnostics} diagnostics générés` : 'En attente de données',
          link:     '/medecin/monitoring',
        },
      ];

      if (rg) {
        setRankData({
          position: rg.position,
          total:    rg.total,
          score:    rg.score_ia,
          cases:    rg.nb_partages,
        });
      }

      // Compute top diagnostics from real consultation data
      const pathCounts = {};
      conss.forEach(c => {
        const nom = c.diagnostic?.maladies?.[0]?.nom;
        if (nom) pathCounts[nom] = (pathCounts[nom] || 0) + 1;
      });
      const topDiagnostics = Object.entries(pathCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({
          name,
          patients: count,
          value: Math.round((count / Math.max(conss.length, 1)) * 100),
        }));

      setDashboardData(prev => ({
        ...prev,
        stats,
        chartData,
        recentConsultations: recentConsultations.length ? recentConsultations : prev.recentConsultations,
        recentPatients:   recentPatients.length ? recentPatients : prev.recentPatients,
        diagnostics:      topDiagnostics.length ? topDiagnostics : prev.diagnostics,
        ranking: rg
          ? { position: rg.position, total: rg.total, score: rg.score_ia, cases: rg.nb_partages }
          : prev.ranking,
      }));
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'completed': { label: 'Terminé', className: 'bg-emerald-500 text-white' },
      'in-progress': { label: 'En cours', className: 'bg-blue-500 text-white' },
      'pending': { label: 'En attente', className: 'bg-amber-500 text-white' }
    };
    return badges[status] || badges.completed;
  };

  const getStatusColor = (status) => {
    const colors = {
      "Suivi 7j": "bg-blue-500 text-white",
      "Stable": "bg-emerald-500 text-white",
      "Urgent": "bg-red-500 text-white"
    };
    return colors[status] || "bg-slate-100 text-slate-600";
  };

  const getNotifColor = (type) => {
    const colors = {
      warning: 'bg-amber-500',
      info: 'bg-blue-500',
      success: 'bg-emerald-500'
    };
    return colors[type] || colors.info;
  };


  return (
    <div className="space-y-8">
      {/* En-tête — carte blanche avec accents bleus */}
      <div className="relative overflow-hidden bg-[var(--sf)] border border-[var(--ln)] rounded-2xl p-8 shadow-sm">
        {/* Bande de couleur en haut */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0066CC] via-blue-400 to-blue-300 rounded-t-2xl" />
        {/* Blob décoratif subtil */}
        <div className="absolute top-0 right-0 w-72 h-44 bg-blue-50 dark:bg-blue-950/20 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              {/* Photo de profil */}
              <div className="relative shrink-0">
                <div className="relative w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-br from-[#0066CC] to-blue-400 shadow-lg">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[var(--sf2)] flex items-center justify-center">
                    {profil?.photo_url
                      ? <img src={profil.photo_url} alt="Profil" className="w-full h-full object-cover" />
                      : <span className="text-xl font-black text-[#0066CC] tracking-tight select-none">
                          {profil?.prenom?.[0]}{profil?.nom?.[0]}
                        </span>
                    }
                  </div>
                </div>
                {/* Indicateur de présence */}
                <div className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full bg-emerald-400 border-[2.5px] border-[var(--sf)] shadow-md">
                  <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-6 bg-[#0066CC] rounded-full" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0066CC]">
                    Tableau de bord
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--t1)]">
                  Bienvenue,{' '}
                  <span className="text-[#0066CC]">
                    {profil ? `${profil.civilite || 'Dr'}. ${profil.prenom} ${profil.nom}` : 'Dr.'}
                  </span>
                </h1>
                <div className="flex items-center gap-2 mt-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[var(--t3)] text-sm">
                    {profil?.specialite && <span className="font-medium text-[var(--t2)]">{profil.specialite} · </span>}
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/medecin/historique')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--sf2)] border border-[var(--ln)] rounded-xl text-sm font-medium text-[var(--t2)] hover:bg-[var(--sf3)] transition-all"
              >
                <CalendarIcon className="w-4 h-4" />
                Cette semaine
              </button>
              <button
                onClick={() => navigate('/medecin/consultation')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0066CC] text-white rounded-xl text-sm font-medium hover:bg-[#0052A3] transition-all shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                Nouvelle consultation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes stats — 2 zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardData.stats.map((card, i) => {
          const Icon = card.icon;
          const tintVar = {
            'from-blue-500 to-blue-600':       'var(--tint-blue)',
            'from-orange-500 to-orange-600':   'var(--tint-orange)',
            'from-emerald-500 to-emerald-600': 'var(--tint-green)',
          }[card.gradient] ?? 'var(--tint-default)';

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.32 }}
              onClick={() => navigate(card.link)}
              className="group overflow-hidden bg-(--sf) border border-(--ln) rounded-2xl cursor-pointer hover:shadow-lg transition-all duration-300"
            >
              {/* Zone haute — fond teinté via variable CSS (s'adapte light/dark) */}
              <div className="px-5 pt-5 pb-5" style={{ backgroundColor: tintVar }}>
                <p className="text-4xl font-black text-(--t1) tracking-tight leading-none tabular-nums">
                  {card.value}
                </p>
                <p className="text-sm font-semibold text-(--t2) mt-2">{card.title}</p>
              </div>

              {/* Séparateur */}
              <div className="h-px bg-(--ln)" />

              {/* Zone basse */}
              <div className="px-5 py-3.5 flex items-center gap-3 bg-(--sf)">
                <div className={`w-8 h-8 rounded-lg bg-linear-to-br ${card.gradient} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-(--t4) flex-1 leading-snug truncate">{card.subtitle}</p>
                <span className="text-[11px] font-bold shrink-0 tabular-nums" style={{ color: 'var(--ok)' }}>
                  {card.increase}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Graphique + Contenu principal */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Colonne gauche (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Graphique d'activité */}
          <div className="bg-(--sf) rounded-2xl border border-(--ln) p-6 shadow-md">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-(--t4)">Statistiques</span>
                </div>
                <h3 className="text-lg font-bold text-(--t1)">Consultations — 7 derniers jours</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('weekly')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${period === 'weekly' ? 'bg-blue-600 text-white shadow-sm' : 'text-(--t3) hover:bg-(--sf2)'}`}
                >
                  Hebdo
                </button>
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${period === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-(--t3) hover:bg-(--sf2)'}`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setPeriod('yearly')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${period === 'yearly' ? 'bg-blue-600 text-white shadow-sm' : 'text-(--t3) hover:bg-(--sf2)'}`}
                >
                  Annuel
                </button>
                <button
                  onClick={loadDashboardData}
                  className="p-1.5 text-(--t4) hover:text-blue-600 transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            <div key={period} style={{ height: 280 }}>
              <Line
                data={{
                  labels: dashboardData.chartData.map(d => d.day),
                  datasets: [
                    {
                      label: 'Consultations',
                      data: dashboardData.chartData.map(d => d.consultations),
                      borderColor: '#0066CC',
                      backgroundColor: 'rgba(0,102,204,0.12)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                      pointBackgroundColor: '#0066CC',
                      borderWidth: 2.5,
                    },
                    {
                      label: 'Nouveaux patients',
                      data: dashboardData.chartData.map(d => d.patients),
                      borderColor: '#10b981',
                      backgroundColor: 'rgba(16,185,129,0.08)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                      pointBackgroundColor: '#10b981',
                      borderWidth: 2.5,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { mode: 'index', intersect: false },
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { font: { size: 12 }, usePointStyle: true, padding: 16 },
                    },
                    tooltip: {
                      backgroundColor: '#fff',
                      titleColor: '#0f172a',
                      bodyColor: '#475569',
                      borderColor: '#e2e8f0',
                      borderWidth: 1,
                      padding: 10,
                      boxPadding: 4,
                    },
                  },
                  scales: {
                    x: {
                      grid: { color: 'rgba(226,232,240,0.6)', drawBorder: false },
                      ticks: { font: { size: 12 }, color: '#94a3b8' },
                    },
                    y: {
                      grid: { color: 'rgba(226,232,240,0.6)', drawBorder: false },
                      ticks: { font: { size: 12 }, color: '#94a3b8' },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Consultations récentes */}
          <div className="bg-(--sf) rounded-2xl border border-(--ln) overflow-hidden shadow-md">
            <div className="p-5 border-b border-(--ln)">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Stethoscope className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-(--t4)">Activité récente</span>
                  </div>
                  <h3 className="text-lg font-bold text-(--t1)">Dernières consultations</h3>
                </div>
                <button 
                  onClick={() => navigate('/medecin/consultation')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  Nouvelle
                </button>
              </div>
            </div>
            <div className="divide-y divide-(--ln)">
              {dashboardData.recentConsultations.map((consult, i) => {
                const statusBadge = getStatusBadge(consult.status);
                return (
                  <div
                    key={consult.id || i}
                    onClick={() => navigate(`/medecin/consultation/${consult.id}`)}
                    className="p-4 hover:bg-(--sf2) transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                          {consult.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-(--t1)">{consult.name}</p>
                          <p className="text-sm text-(--t3)">{consult.pathology}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge.className}`}>
                              {statusBadge.label}
                            </span>
                            <span className="text-xs text-(--t4)">{consult.date} • {consult.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-blue-600">{consult.percentage}%</span>
                          <div className="w-16 h-1.5 bg-(--sf3) rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${consult.percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 bg-(--sf2) text-center border-t border-(--ln)">
              <Link to="/medecin/historique" className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                Voir toutes les consultations <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Colonne droite (1/3) */}
        <div className="space-y-8">

          {/* Classement — dark navy + or */}
          <div
            onClick={() => navigate('/medecin/classement')}
            className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 group"
            style={{ background: 'linear-gradient(135deg, #0F2644 0%, #1A3A5C 60%, #0D1F36 100%)' }}
          >
            {/* Halo doré en haut à droite */}
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
            {/* Cercle décoratif */}
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative text-center">
              {/* Couronne */}
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-400/25 to-yellow-600/15 border border-amber-400/25 flex items-center justify-center mx-auto mb-4 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Crown className="w-8 h-8 text-amber-400 drop-shadow-sm" />
              </div>

              {/* Rang */}
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-4xl font-black text-white tabular-nums">
                  {dashboardData.ranking.position}e
                </span>
                <span className="text-lg text-white/50 font-medium">/ {dashboardData.ranking.total}</span>
              </div>
              <p className="text-sm text-blue-200/70 font-medium">Classement médecins</p>

              {/* Score */}
              <div className="mt-3 mb-3 px-4 py-1.5 bg-white/8 rounded-full inline-flex items-center gap-1.5 border border-white/10">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-sm font-bold text-amber-300">{dashboardData.ranking.score}%</span>
                <span className="text-xs text-white/50">score IA</span>
              </div>

              {/* Étoiles */}
              <div className="flex justify-center gap-1.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-white/20 fill-transparent'}`}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-white/50 flex items-center justify-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400/70" />
                  Top contributeur · {dashboardData.ranking.cases} cas partagés
                </p>
              </div>
            </div>
          </div>
          
          {/* Patients récents */}
          <div className="bg-(--sf) rounded-2xl border border-(--ln) overflow-hidden shadow-md">
            <div className="p-5 border-b border-(--ln)">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-(--t4)">Annuaire</span>
                  </div>
                  <h3 className="text-lg font-bold text-(--t1)">Nouveaux patients</h3>
                </div>
                <Link to="/medecin/patients" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Voir tout →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-(--ln)">
              {dashboardData.recentPatients.map((patient, i) => (
                <div key={i} className="p-4 hover:bg-(--sf2) transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-(--t1)">{patient.name}</p>
                      <p className="text-sm text-(--t3)">{patient.age} • {patient.pathology}</p>
                      <p className="text-xs text-(--t4) mt-1">Dernière visite: {patient.lastVisit}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostics — depuis les vraies consultations */}
          {dashboardData.diagnostics.length > 0 && (
            <div className="bg-(--sf) rounded-2xl p-5 border border-(--ln) shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-(--t4)">Analyse</span>
                  <h3 className="text-lg font-bold text-(--t1)">Top diagnostics IA</h3>
                </div>
              </div>
              <div className="space-y-4">
                {dashboardData.diagnostics.map((diag, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-(--t2)">{diag.name}</span>
                      <span className="font-bold text-(--t1)">{diag.value}%</span>
                    </div>
                    <div className="h-2 bg-(--sf3) rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${diag.value}%` }} />
                    </div>
                    <p className="text-xs text-(--t4) mt-1">{diag.patients} consultation{diag.patients > 1 ? 's' : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}