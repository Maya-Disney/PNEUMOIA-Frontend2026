// src/features/medecin/pages/Dashboard.jsx
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, AlertTriangle, Stethoscope, Award,
  MessageCircle, Bell, ChevronRight, Eye,
  FileText, Calendar, Clock, TrendingUp,
  Activity, CheckCircle, Clock as ClockIcon,
  Star, TrendingDown, MoreHorizontal, PlusCircle,
  RefreshCw, Info, ArrowUpRight, UserPlus,
  Zap, Shield, Sparkles, Crown, HeartHandshake,
  Target, Rocket, Send, Phone, Mail, MapPin, 
  Briefcase, GraduationCap, Building2, 
  Globe, BookOpen, Trophy,
  Heart, Brain, Microscope, ClipboardList, Pill,
  Calendar as CalendarIcon  
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useProfil } from '../hooks/useAuth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profil } = useProfil();
  const [period, setPeriod] = useState('weekly');
  const [statsLoading, setStatsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    chartData: [],
    recentConsultations: [],
    recentMessages: [],
    recentPatients: [],
    notifications: [],
    diagnostics: [],
    ranking: { position: 2, total: 20, score: 94.2, cases: 124 }
  });

  // Données mockées
  const mockMessages = [
    { id: 1, sender: "Dr. Merlin", message: "Pouvez-vous m'envoyer le résultat de Tamo ?", time: "14:30", unread: true, avatar: "DM" },
    { id: 2, sender: "Dr Kamto Jordan", message: "Merci pour le partage du cas #124", time: "11:20", unread: false, avatar: "KJ" },
    { id: 3, sender: "Dr. Nkoa", message: "Questions sur la prise en charge BPCO", time: "Hier", unread: true, avatar: "DN" },
    { id: 4, sender: "Dr. Fouda", message: "Cas clinique intéressant à partager", time: "25/03", unread: false, avatar: "DF" }
  ];

  const mockNotifications = [
    { id: 1, text: "Suivi dépassé — KAMGA Jean depuis 9 jours", time: "Il y a 2h", type: "warning", icon: ClockIcon },
    { id: 2, text: "Dr. Martin demande accès au dossier de TAMO Bernard", time: "Il y a 3h", type: "info", icon: Users },
    { id: 3, text: "Votre cas #124 a reçu 3 nouveaux commentaires", time: "Hier", type: "success", icon: MessageCircle }
  ];

  const calculateStats = () => {
    const today = new Date();
    const patients = JSON.parse(localStorage.getItem('medecin_patients') || '[]');
    const consultations = JSON.parse(localStorage.getItem('medecin_consultations') || '[]');
    
    const patientsThisMonth = patients.filter(p => {
      const lastVisit = new Date(p.lastVisit);
      return lastVisit.getMonth() === today.getMonth();
    }).length;
    
    const patientsLastMonth = patients.filter(p => {
      const lastVisit = new Date(p.lastVisit);
      return lastVisit.getMonth() === today.getMonth() - 1;
    }).length;
    
    const patientGrowth = patientsLastMonth ? ((patientsThisMonth - patientsLastMonth) / patientsLastMonth * 100).toFixed(1) : 12;
    
    const consultationsThisMonth = consultations.filter(c => {
      const date = new Date(c.date);
      return date.getMonth() === today.getMonth();
    }).length;
    
    const consultationsLastMonth = consultations.filter(c => {
      const date = new Date(c.date);
      return date.getMonth() === today.getMonth() - 1;
    }).length;
    
    const consultationGrowth = consultationsLastMonth ? ((consultationsThisMonth - consultationsLastMonth) / consultationsLastMonth * 100).toFixed(1) : 8;
    
    const urgentCases = patients.filter(p => p.status === 'critique').length;
    
    return {
      stats: [
        { 
          title: "Patients totaux", 
          value: patients.length || 247, 
          icon: Users, 
          increase: `+${patientGrowth}%`, 
          trend: "up",
          gradient: "from-blue-500 to-blue-600",
          subtitle: `${patientsThisMonth} nouveaux ce mois-ci`,
          link: "/medecin/patients"
        },
        { 
          title: "Cas urgents", 
          value: urgentCases || 18, 
          icon: AlertTriangle, 
          increase: "+5%", 
          trend: "up",
          gradient: "from-orange-500 to-orange-600",
          subtitle: `${urgentCases} patients nécessitent une attention immédiate`,
          link: "/medecin/patients?status=critique"
        },
        { 
          title: "Consultations", 
          value: consultations.length || 1247, 
          icon: Stethoscope, 
          increase: `+${consultationGrowth}%`, 
          trend: "up",
          gradient: "from-emerald-500 to-emerald-600",
          subtitle: `${consultationsThisMonth} consultations ce mois-ci`,
          link: "/medecin/historique-consultations"
        },
        { 
          title: "Communauté", 
          value: "128", 
          icon: Award, 
          increase: "+15%", 
          trend: "up",
          gradient: "from-blue-500 to-blue-600",
          subtitle: "124 cas partagés, 5 nouveaux membres",
          link: "/medecin/cas-cliniques"
        }
      ]
    };
  };

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

  const loadDashboardData = () => {
    setStatsLoading(true);
    setTimeout(() => {
      const { stats } = calculateStats();
      const chartData = generateChartData(period);
      
      const consultations = JSON.parse(localStorage.getItem('medecin_consultations') || '[]');
      const patients = JSON.parse(localStorage.getItem('medecin_patients') || '[]');
      
      const formattedConsultations = consultations.slice(0, 5).map((c, idx) => ({
        id: c.id || idx,
        name: typeof c.patient === 'string' ? c.patient : c.patient?.name || 'Patient',
        pathology: c.pathology,
        percentage: Math.floor(Math.random() * 40) + 60,
        date: new Date(c.date).toLocaleDateString('fr-FR'),
        time: c.time,
        status: c.status,
        avatar: (typeof c.patient === 'string' ? c.patient.charAt(0) : (c.patient?.name?.charAt(0) || 'P'))
      }));
      
      const recentConsultations = formattedConsultations.length > 0 ? formattedConsultations : [
        { id: 1, name: "Tamo Bernard", pathology: "Pneumonie bactérienne", percentage: 85, date: "Aujourd'hui", time: "14:30", status: "completed", avatar: "TB" },
        { id: 2, name: "Fouda Marie", pathology: "BPCO stade 3", percentage: 72, date: "Aujourd'hui", time: "11:20", status: "in-progress", avatar: "FM" },
        { id: 3, name: "Nguema Paul", pathology: "Asthme sévère", percentage: 91, date: "Hier", time: "09:15", status: "completed", avatar: "NP" },
        { id: 4, name: "Mboma Éric", pathology: "Bronchite aiguë", percentage: 68, date: "Hier", time: "16:45", status: "pending", avatar: "MÉ" }
      ];
      
      const formattedPatients = patients.slice(0, 4).map(p => ({
        name: p.name,
        age: p.age,
        pathology: p.pathology,
        status: p.status === 'actif' ? 'Stable' : p.status === 'critique' ? 'Urgent' : 'Suivi 7j',
        lastVisit: new Date(p.lastVisit).toLocaleDateString('fr-FR')
      }));
      
      const recentPatients = formattedPatients.length > 0 ? formattedPatients : [
        { name: "Tamo Bernard", age: "47 ans", pathology: "Pneumonie", status: "Suivi 7j", lastVisit: "Aujourd'hui" },
        { name: "Fouda Marie", age: "52 ans", pathology: "BPCO", status: "Stable", lastVisit: "Hier" },
        { name: "Kamga Jean", age: "71 ans", pathology: "Tuberculose", status: "Urgent", lastVisit: "Il y a 2j" },
        { name: "Nguema Paul", age: "63 ans", pathology: "Asthme", status: "Stable", lastVisit: "Il y a 3j" }
      ];
      
      setDashboardData({
        stats,
        chartData,
        recentConsultations,
        recentMessages: mockMessages,
        recentPatients,
        notifications: mockNotifications,
        diagnostics: [
          { name: "Pneumonie", value: 97, patients: 42, color: "from-blue-500 to-blue-600" },
          { name: "BPCO", value: 69, patients: 28, color: "from-blue-500 to-blue-600" },
          { name: "Asthme", value: 57, patients: 23, color: "from-blue-500 to-blue-600" },
          { name: "Tuberculose", value: 43, patients: 18, color: "from-blue-500 to-blue-600" },
          { name: "Bronchite", value: 38, patients: 15, color: "from-blue-500 to-blue-600" }
        ],
        ranking: { position: 2, total: 20, score: 94.2, cases: 124 }
      });
      setStatsLoading(false);
    }, 500);
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-(--sf) rounded-lg shadow-lg border border-(--ln) p-3">
          <p className="text-xs font-semibold text-(--t1)">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-xs text-(--t2) mt-1">
              {p.name}: <span className="font-bold text-blue-600">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* En-tête - version bleue */}
      <div className="relative overflow-hidden bg-linear-to-br from-blue-600 to-blue-800 rounded-2xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              {/* Photo de profil */}
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm overflow-hidden shrink-0 shadow-lg border-2 border-white/30 flex items-center justify-center">
                {profil?.photo_url && (
                  <img src={profil.photo_url} alt="Profil" className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex'; }} />
                )}
                <div className="w-full h-full items-center justify-center text-xl font-bold text-white"
                  style={{ display: profil?.photo_url ? 'none' : 'flex' }}>
                  {profil?.prenom?.[0]}{profil?.nom?.[0]}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-8 bg-blue-300 rounded-full"></div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Tableau de bord</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Bienvenue, <span className="text-blue-200">
                    {profil ? `${profil.civilite || 'Dr'}. ${profil.prenom} ${profil.nom}` : 'Dr.'}
                  </span>
                </h1>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <p className="text-blue-100">
                    {profil?.specialite && <span className="font-medium">{profil.specialite} · </span>}
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/medecin/historique')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-medium text-white hover:bg-white/20 transition-all"
              >
                <CalendarIcon className="w-4 h-4" />
                Cette semaine
              </button>
              <button 
                onClick={() => navigate('/medecin/consultation')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition-all shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                Nouvelle consultation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes stats - toutes en bleu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(card.link)}
              className="group relative overflow-hidden bg-(--sf) rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${card.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    <TrendingUp className="w-3 h-3" />
                    {card.increase}
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-(--t1)">{card.value}</p>
                  <p className="text-sm text-(--t3) mt-1">{card.title}</p>
                  <p className="text-xs text-(--t4) mt-1">{card.subtitle}</p>
                </div>
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
            
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dashboardData.chartData}>
                <defs>
                  <linearGradient id="colorConsultations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="consultations" 
                  name="Consultations"
                  stroke="#3b82f6" 
                  fill="url(#colorConsultations)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="patients" 
                  name="Nouveaux patients"
                  stroke="#10b981" 
                  fill="url(#colorPatients)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
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

          {/* Messages récents */}
          <div className="bg-(--sf) rounded-2xl border border-(--ln) overflow-hidden shadow-md">
            <div className="p-5 border-b border-(--ln)">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-(--t4)">Communication</span>
                  </div>
                  <h3 className="text-lg font-bold text-(--t1)">Messages récents</h3>
                </div>
                <Link to="/medecin/messagerie" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Nouveau message →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-(--ln)">
              {dashboardData.recentMessages.map((msg, i) => (
                <Link key={i} to="/medecin/messagerie" className="block p-4 hover:bg-(--sf2) transition-all">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                        {msg.avatar}
                      </div>
                      {msg.unread && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-(--sf)"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-(--t1)">{msg.sender}</p>
                        <span className="text-xs text-(--t4)">{msg.time}</span>
                      </div>
                      <p className="text-sm text-(--t3)">{msg.message}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite (1/3) */}
        <div className="space-y-8">

          {/* Classement - tout en bleu */}
          <div 
            onClick={() => navigate('/medecin/classement')}
            className="relative overflow-hidden bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-md cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="relative text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-yellow-300" />
              </div>
              <h3 className="text-3xl font-bold">{dashboardData.ranking.position}e / {dashboardData.ranking.total}</h3>
              <p className="text-sm text-blue-100 mt-1">Médecins</p>
              <div className="flex justify-center gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-300 fill-yellow-300' : 'text-white/30'}`} />
                ))}
              </div>
              <p className="text-xs text-blue-100 mt-3">
                <Trophy className="w-3 h-3 inline mr-1" />
                Top contributeur • {dashboardData.ranking.cases} cas partagés
              </p>
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

          {/* Notifications */}
          <div className="bg-(--sf) rounded-2xl border border-(--ln) overflow-hidden shadow-md">
            <div className="p-5 border-b border-(--ln)">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-(--t1)">Alertes</h3>
                  <p className="text-xs text-(--t4)">Notifications importantes</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-(--ln)">
              {dashboardData.notifications.map((notif, i) => {
                const IconComponent = notif.icon;
                const notifColors = {
                  warning: 'bg-amber-500',
                  info: 'bg-blue-500',
                  success: 'bg-emerald-500'
                };
                return (
                  <div key={i} className="p-4 hover:bg-(--sf2) transition-all">
                    <div className="flex gap-3">
                      <div className={`shrink-0 w-8 h-8 rounded-lg ${notifColors[notif.type]} flex items-center justify-center`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-(--t2)">{notif.text}</p>
                        <p className="text-xs text-(--t4) mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 bg-(--sf2) text-center border-t border-(--ln)">
              <Link to="/medecin/notifications" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Voir toutes →
              </Link>
            </div>
          </div>

          {/* Diagnostics - tout en bleu */}
          <div className="bg-(--sf) rounded-2xl p-5 border border-(--ln) shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-(--t4)">Analyse</span>
            </div>
            <h3 className="text-lg font-bold text-(--t1) mb-4">Top diagnostics — Mars 2026</h3>
            <div className="space-y-4">
              {dashboardData.diagnostics.map((diag, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-(--t2)">{diag.name}</span>
                    <span className="font-bold text-(--t1)">{diag.value}%</span>
                  </div>
                  <div className="h-2 bg-(--sf3) rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${diag.value}%` }}
                    />
                  </div>
                  <p className="text-xs text-(--t4) mt-1">{diag.patients} patients</p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}