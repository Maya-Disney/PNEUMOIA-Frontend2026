// src/features/medecin/pages/Partage.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, FileText, Clock, CheckCircle, XCircle, Share2, UserPlus,
  BookOpen, MessageCircle, Users as UsersIcon, Calendar, ChevronRight,
  Globe, Lock, Bell, Activity, TrendingUp, AlertCircle, Star,
  Sparkles, Eye, Heart, MessageSquare, Send, ArrowRight, Zap,
  ShieldCheck, Crown, Award, Coffee, Briefcase, MapPin, Calendar as CalendarIcon,
  MoreHorizontal, ExternalLink, ThumbsUp, Tag, FolderOpen, Download,
  X, ChevronLeft, Shield, User, Hospital, Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ==================== COMPOSANTS ====================

const GlassCard = ({ children, className = "" }) => (
  <div className={`relative bg-(--sf) rounded-2xl border border-(--ln) shadow-md ${className}`}>
    {children}
  </div>
);

const AnimatedCounter = ({ value, suffix = "", duration = 1 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const incrementTime = (duration * 1000) / (end || 1);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count}{suffix}</span>;
};

const StatusBadge = ({ children, variant = "default" }) => {
  const variants = {
    urgent: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    default: "bg-(--sf2) text-(--t2)"
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Bell };
  const Icon = icons[type] || Bell;
  const bgColors = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    warning: "bg-amber-500",
    info: "bg-blue-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-xl ${bgColors[type]}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-3 opacity-70 hover:opacity-100 transition-opacity">
        <XCircle className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    urgent: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
    default: "bg-(--sf2) text-(--t2) border-(--ln)"
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    pages.push(i);
  }
  if (totalPages > 5 && currentPage < totalPages - 2) {
    pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 rounded-lg border border-(--ln) flex items-center justify-center hover:bg-(--sf2) disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
            currentPage === page
              ? 'bg-blue-600 text-white shadow-sm'
              : page === '...'
              ? 'cursor-default'
              : 'border border-(--ln) hover:bg-(--sf2)'
          }`}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 rounded-lg border border-(--ln) flex items-center justify-center hover:bg-(--sf2) disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ==================== PAGE PRINCIPALE ====================

export default function Partage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('demandes');

  // Pagination
  const [demandesPage, setDemandesPage] = useState(1);
  const [dossiersPage, setDossiersPage] = useState(1);
  const itemsPerPage = 3;

  // Données - Demandes avec plusieurs médecins par patient
  const [demandes, setDemandes] = useState([
    {
      id: 1,
      patient: "Jean-Pierre Nkoumou",
      patientAge: 67,
      patientSexe: "M",
      diagnostic: "BPCO Stade III - Suspicion exacerbation",
      urgent: true,
      date: "15/03/2026",
      medecins: [
        { id: 1, nom: "Dr. Amadou Bakary", hopital: "Hôpital Général, Yaoundé", avatar: "AB" },
        { id: 2, nom: "Dr. Sarah Mboua", hopital: "CHU Yaoundé", avatar: "SM" }
      ]
    },
    {
      id: 2,
      patient: "Marie-Claire Etoundi",
      patientAge: 52,
      patientSexe: "F",
      diagnostic: "Analyse imagerie scanographique - Masse suspecte",
      urgent: false,
      date: "14/03/2026",
      medecins: [
        { id: 1, nom: "Dr. Sophie Ngosso", hopital: "Clinique des Anges, Douala", avatar: "SN" }
      ]
    },
    {
      id: 3,
      patient: "Paul Mvondo",
      patientAge: 71,
      patientSexe: "M",
      diagnostic: "Tuberculose pulmonaire - Suivi traitement",
      urgent: true,
      date: "12/03/2026",
      medecins: [
        { id: 1, nom: "Dr. Thomas Eyenga", hopital: "Hôpital Laquintinie, Douala", avatar: "TE" },
        { id: 2, nom: "Dr. Beatrice Ngo", hopital: "Polyclinique Bonanjo", avatar: "BN" },
        { id: 3, nom: "Dr. Alain Mbarga", hopital: "Hôpital Central, Yaoundé", avatar: "AM" }
      ]
    },
    {
      id: 4,
      patient: "François Nguea",
      patientAge: 45,
      patientSexe: "M",
      diagnostic: "Asthme sévère - Crise",
      urgent: false,
      date: "10/03/2026",
      medecins: [
        { id: 1, nom: "Dr. Pierre Mendo", hopital: "Hôpital de District, Douala", avatar: "PM" }
      ]
    }
  ]);

  // Dossiers partagés avec plusieurs médecins
  const [dossiersPartages, setDossiersPartages] = useState([
    {
      id: 1,
      patient: "Moussa Souleyman",
      idPatient: "#PN-4492",
      date: "12 Oct 2023",
      medecins: [
        { nom: "Dr. Elias", hopital: "Hôpital Général, Douala" },
        { nom: "Dr. Kameni", hopital: "CHU Yaoundé" }
      ]
    },
    {
      id: 2,
      patient: "Fatima Zahra",
      idPatient: "#PN-4493",
      date: "08 Oct 2023",
      medecins: [
        { nom: "Dr. Obiang", hopital: "Hôpital Central, Libreville" }
      ]
    },
    {
      id: 3,
      patient: "Omar Bongo",
      idPatient: "#PN-4494",
      date: "05 Oct 2023",
      medecins: [
        { nom: "Dr. Ndinga", hopital: "CHU Brazzaville" },
        { nom: "Dr. Mbemba", hopital: "Hôpital de Makélékélé" }
      ]
    },
    {
      id: 4,
      patient: "Henriette Ndom",
      idPatient: "#PN-4495",
      date: "01 Oct 2023",
      medecins: [
        { nom: "Dr. Tsala", hopital: "Hôpital de Soa" }
      ]
    }
  ]);

  // Cas communautaires
  const [casCommunautaires, setCasCommunautaires] = useState([
    { id: 1, titre: "Complications post-COVID en milieu tropical", auteur: "Pr. Jean-Luc N.", hopital: "CHU Douala", date: "14/10/2023", likes: 124, commentaires: 18, tags: ["COVID-19", "Post-COVID"], liked: false },
    { id: 2, titre: "Résistance multi-drogues : Analyse de cas à Maroua", auteur: "Dr. Moussa Ali", hopital: "Hôpital régional de Maroua", date: "12/10/2023", likes: 56, commentaires: 8, tags: ["Tuberculose", "Résistance"], liked: false },
    { id: 3, titre: "Efficacité des bronchodilatateurs longue durée", auteur: "Dr. Issa M.", hopital: "CHU N'Djamena", date: "10/10/2023", likes: 89, commentaires: 12, tags: ["Asthme", "Bronchodilatateurs"], liked: true },
    { id: 4, titre: "Prise en charge des pneumonies atypiques", auteur: "Pr. Sophie K.", hopital: "Hôpital Laquintinie", date: "08/10/2023", likes: 45, commentaires: 6, tags: ["Pneumonie", "Atypique"], liked: false }
  ]);

  // Groupes
  const [groupes, setGroupes] = useState([
    { id: 1, nom: "Pneumologues Douala", membres: 24, nouveauxCas: 3, derniereActivite: "Mise à jour du protocole de prise en charge TB Multirésistante" },
    { id: 2, nom: "TB CEMAC Collaboration", membres: 112, description: "Réseau régional de lutte contre la tuberculose" },
    { id: 3, nom: "BPCO Experts Africa", membres: 42, description: "Forum scientifique sur la BPCO" }
  ]);

  const addToast = (message, type) => setToast({ message, type });

  const accepterDemande = (demandeId, medecinNom) => {
    addToast(`Demande de ${medecinNom} acceptée. Le dossier est maintenant partagé.`, "success");
  };

  const refuserDemande = (demandeId, medecinNom) => {
    addToast(`Demande de ${medecinNom} refusée.`, "error");
  };

  const revoquerPartage = (dossierId, medecinNom) => {
    addToast(`Accès révoqué pour ${medecinNom}.`, "success");
  };

  const likeCas = (id) => {
    setCasCommunautaires(casCommunautaires.map(c =>
      c.id === id ? { ...c, likes: c.liked ? c.likes - 1 : c.likes + 1, liked: !c.liked } : c
    ));
  };

  // Pagination
  const demandesPaginated = demandes.slice((demandesPage - 1) * itemsPerPage, demandesPage * itemsPerPage);
  const totalDemandesPages = Math.ceil(demandes.length / itemsPerPage);

  const dossiersPaginated = dossiersPartages.slice((dossiersPage - 1) * itemsPerPage, dossiersPage * itemsPerPage);
  const totalDossiersPages = Math.ceil(dossiersPartages.length / itemsPerPage);

  const stats = [
    { label: "Demandes en attente", value: demandes.length, icon: Clock, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Dossiers partagés", value: dossiersPartages.length, icon: FolderOpen, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Cas communautaires", value: casCommunautaires.length, icon: Globe, bg: "bg-purple-50", color: "text-purple-600" },
    { label: "Groupes actifs", value: groupes.length, icon: Users, bg: "bg-amber-50", color: "text-amber-600" }
  ];

  const tabs = [
    { id: 'demandes', label: 'Demandes de partage', icon: Clock, count: demandes.length },
    { id: 'dossiers', label: 'Mes partages', icon: FolderOpen, count: dossiersPartages.length },
    { id: 'communaute', label: 'Communauté CEMAC', icon: Globe, count: casCommunautaires.length },
    { id: 'groupes', label: 'Groupes', icon: UsersIcon, count: groupes.length }
  ];

  return (
    <div className="min-h-screen bg-(--bg)">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Plateforme collaborative</span>
                  <h1 className="text-3xl md:text-4xl font-bold text-(--t1)">
                    Partage & Communauté
                  </h1>
                </div>
              </div>
              <p className="text-(--t3) max-w-xl">
                Échangez des dossiers médicaux sécurisés, collaborez avec vos confrères et contribuez à la base de connaissances régionale.
              </p>
            </div>
            
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Nouveau partage
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {stats.map((stat, idx) => (
            <div key={stat.label} className="relative">
              <div className="relative bg-(--sf) rounded-2xl p-5 shadow-sm border border-(--ln)">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-(--t1)">
                      <AnimatedCounter value={stat.value} duration={0.8} />
                    </div>
                    <div className="text-xs text-(--t4) mt-0.5">{stat.label}</div>
                  </div>
                </div>
                <div className="h-1 w-full bg-(--sf2) rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${Math.min(stat.value * 10, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 border-b border-(--ln) mb-8">
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setDemandesPage(1);
                  setDossiersPage(1);
                }}
                className={`relative flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-(--t3) hover:text-(--t2) hover:bg-(--sf2)'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className={`ml-1.5 text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-(--sf)/20 text-white' : 'bg-(--sf2) text-(--t3)'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* CONTENU DES ONGLETS */}
        <AnimatePresence mode="wait">
          {/* 1. DEMANDES EN ATTENTE */}
          {activeTab === 'demandes' && (
            <motion.div
              key="demandes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {demandesPaginated.length === 0 ? (
                <div className="bg-(--sf) rounded-2xl p-12 text-center border border-(--ln)">
                  <Bell className="w-12 h-12 text-(--ln2) mx-auto mb-4" />
                  <p className="text-(--t3)">Aucune demande en attente.</p>
                </div>
              ) : (
                demandesPaginated.map((demande) => (
                  <div key={demande.id} className="relative bg-(--sf) rounded-2xl border border-(--ln) shadow-sm overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${demande.urgent ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div className="p-6">
                      {/* En-tête patient */}
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-(--ln)">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                            {demande.patient.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-(--t1) text-lg">{demande.patient}</span>
                              <Badge variant="info">
                                <CalendarIcon className="w-3 h-3" /> {demande.date}
                              </Badge>
                              {demande.urgent && (
                                <StatusBadge variant="urgent">
                                  <AlertCircle className="w-3 h-3" /> URGENT
                                </StatusBadge>
                              )}
                            </div>
                            <p className="text-sm text-(--t3)">{demande.patientAge} ans · {demande.patientSexe === 'M' ? 'Homme' : 'Femme'}</p>
                          </div>
                        </div>
                        <div className="text-sm text-(--t2) bg-(--sf2) px-3 py-1.5 rounded-lg">
                          <span className="font-medium">Diagnostic :</span> {demande.diagnostic}
                        </div>
                      </div>

                      {/* Liste des médecins demandeurs */}
                      <div>
                        <p className="text-xs font-medium text-(--t4) uppercase tracking-wide mb-3">Médecins demandeurs</p>
                        <div className="space-y-3">
                          {demande.medecins.map((medecin, medIdx) => (
                            <div
                              key={medecin.id}
                              className="flex flex-wrap items-center justify-between gap-3 p-3 bg-(--sf2) rounded-xl"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                  {medecin.avatar}
                                </div>
                                <div>
                                  <p className="font-semibold text-(--t1) text-sm">{medecin.nom}</p>
                                  <p className="text-xs text-(--t4)">{medecin.hopital}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => refuserDemande(demande.id, medecin.nom)}
                                  className="px-4 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-all"
                                >
                                  Refuser
                                </button>
                                <button
                                  onClick={() => accepterDemande(demande.id, medecin.nom)}
                                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 transition-all"
                                >
                                  Accepter
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <Pagination
                currentPage={demandesPage}
                totalPages={totalDemandesPages}
                onPageChange={setDemandesPage}
              />
            </motion.div>
          )}

          {/* 2. DOSSIERS PARTAGÉS */}
          {activeTab === 'dossiers' && (
            <motion.div
              key="dossiers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {dossiersPaginated.map((dossier) => (
                <div key={dossier.id} className="bg-(--sf) rounded-2xl border border-(--ln) shadow-sm">
                  <div className="p-6">
                    {/* En-tête patient */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-(--ln)">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {dossier.patient.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-(--t1) text-lg">{dossier.patient}</div>
                          <div className="text-xs text-(--t4) font-mono">{dossier.idPatient}</div>
                        </div>
                      </div>
                      <div className="text-xs text-(--t4)">Partagé le {dossier.date}</div>
                    </div>

                    {/* Accès partagés */}
                    <div>
                      <p className="text-xs font-medium text-(--t4) uppercase tracking-wide mb-3">Accès partagés</p>
                      <div className="space-y-2">
                        {dossier.medecins.map((medecin, medIdx) => (
                          <div
                            key={medIdx}
                            className="flex flex-wrap items-center justify-between gap-3 p-2.5 hover:bg-(--sf2) rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-(--sf3) flex items-center justify-center text-(--t2) text-xs font-bold">
                                {medecin.nom.charAt(0)}{medecin.nom.split(' ')[1]?.charAt(0) || ''}
                              </div>
                              <div>
                                <p className="font-medium text-(--t2) text-sm">{medecin.nom}</p>
                                <p className="text-xs text-(--t4)">{medecin.hopital}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => revoquerPartage(dossier.id, medecin.nom)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                            >
                              <Lock className="w-3 h-3" /> Révoquer
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Pagination
                currentPage={dossiersPage}
                totalPages={totalDossiersPages}
                onPageChange={setDossiersPage}
              />
            </motion.div>
          )}

          {/* 3. COMMUNAUTÉ CEMAC */}
          {activeTab === 'communaute' && (
            <motion.div
              key="communaute"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {casCommunautaires.map((cas) => (
                <div key={cas.id} className="bg-(--sf) rounded-2xl border border-(--ln) shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex gap-1.5 mb-3 flex-wrap">
                          {cas.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-(--sf2) text-(--t2) font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-xl font-bold text-(--t1) mb-2 leading-tight">{cas.titre}</h3>
                        <div className="flex items-center gap-2 text-sm text-(--t3)">
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                            {cas.auteur.charAt(0)}
                          </div>
                          <span className="font-medium text-(--t2)">{cas.auteur}</span>
                          <span className="w-1 h-1 rounded-full bg-(--t4)" />
                          <span>{cas.hopital}</span>
                        </div>
                        <p className="text-xs text-(--t4) mt-2">{cas.date}</p>
                      </div>
                      <button
                        onClick={() => likeCas(cas.id)}
                        className="flex flex-col items-center px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        <Heart className={`w-6 h-6 ${cas.liked ? 'fill-red-500 text-red-500' : 'text-(--t4)'}`} />
                        <span className="text-xs font-bold text-(--t2) mt-1">{cas.likes}</span>
                      </button>
                    </div>
                    <div className="mt-5 flex justify-between items-center pt-4 border-t border-(--ln)">
                      <div className="flex gap-4 text-xs text-(--t4)">
                        <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {cas.commentaires}</span>
                        <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {Math.floor(cas.likes * 1.5)}</span>
                      </div>
                      <button className="text-blue-600 text-sm font-semibold flex items-center gap-1.5 hover:gap-2 transition-all">
                        Lire l'analyse <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* CTA - Publier un cas */}
              <div className="col-span-full">
                <div className="relative overflow-hidden bg-blue-600 p-8 rounded-2xl">
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-(--sf)/20 backdrop-blur flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-xl text-white">Partagez votre expertise</p>
                        <p className="text-blue-100 text-sm">Contribuez à la base de données régionale et gagnez en visibilité</p>
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-(--sf) text-blue-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                      <Send className="w-4 h-4" /> Publier un cas clinique
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. GROUPES */}
          {activeTab === 'groupes' && (
            <motion.div
              key="groupes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {groupes.map((groupe) => (
                <div key={groupe.id} className="bg-(--sf) rounded-2xl border border-(--ln) shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                          <UsersIcon className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-(--t1) text-xl">{groupe.nom}</h3>
                          <p className="text-xs text-(--t3)">{groupe.membres} membres actifs</p>
                        </div>
                      </div>
                      {groupe.nouveauxCas && (
                        <StatusBadge variant="warning">
                          <Zap className="w-3 h-3" /> {groupe.nouveauxCas} nouveaux
                        </StatusBadge>
                      )}
                    </div>

                    <div className="mt-4">
                      {groupe.derniereActivite && (
                        <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-700 border border-amber-100">
                          <span className="font-semibold flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" /> Dernière activité :
                          </span>
                          <span className="mt-1 block">{groupe.derniereActivite}</span>
                        </div>
                      )}
                      {groupe.description && (
                        <p className="text-sm text-(--t2)">{groupe.description}</p>
                      )}
                    </div>

                    <div className="mt-5 flex gap-3 pt-4 border-t border-(--ln)">
                      <button className="flex-1 py-2.5 bg-(--sf2) text-(--t2) rounded-xl text-sm font-semibold hover:bg-(--sf3) transition-all flex items-center justify-center gap-2">
                        <MessageCircle className="w-4 h-4" /> Accéder au groupe
                      </button>
                      <button className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" /> Partager
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Bouton rejoindre un groupe */}
              <div className="flex justify-center col-span-full mt-4">
                <button className="px-8 py-3.5 bg-(--t1) text-(--sf) rounded-xl font-semibold shadow-md hover:opacity-90 transition-all flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Explorer d'autres groupes
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOAST */}
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}