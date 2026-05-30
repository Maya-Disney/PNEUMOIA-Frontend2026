// src/features/medecin/pages/CasCliniques.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Brain, CheckCircle, XCircle, AlertCircle, ChevronRight,
  ChevronLeft, Heart, MessageCircle, Share2, BookOpen, Users,
  Star, TrendingUp, Award, Sparkles, Eye, FileText, Clock,
  Calendar, Search, Filter, ThumbsUp, Zap, ShieldCheck,
  User, Hospital, MapPin, Tag, ArrowRight, BarChart4
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ==================== COMPOSANTS ====================

const Toast = ({ message, type, onClose }) => {
  useState(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    warning: 'bg-amber-500',
    info: 'bg-blue-600'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-xl ${bgColors[type]}`}>
      {type === 'success' && <CheckCircle className="w-5 h-5" />}
      {type === 'warning' && <AlertCircle className="w-5 h-5" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-3 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-(--sf) rounded-xl border border-(--ln) p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg ${color === 'blue' ? 'bg-blue-50' : color === 'emerald' ? 'bg-emerald-50' : color === 'purple' ? 'bg-purple-50' : 'bg-amber-50'} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color === 'blue' ? 'text-blue-600' : color === 'emerald' ? 'text-emerald-600' : color === 'purple' ? 'text-purple-600' : 'text-amber-600'}`} />
      </div>
      <span className="text-2xl font-bold text-(--t1)">{value}</span>
    </div>
    <p className="text-sm text-(--t3)">{label}</p>
  </div>
);

const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-sm' 
        : 'bg-(--sf) border border-(--ln) text-(--t2) hover:bg-(--sf2)'

    }`}
  >
    {label}
  </button>
);

const CasCard = ({ cas, onVote }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-(--sf) rounded-xl border border-(--ln) shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* En-tête avec catégorie */}
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            cas.categorie === 'Pneumonie' ? 'bg-blue-100 text-blue-700' :
            cas.categorie === 'BPCO' ? 'bg-emerald-100 text-emerald-700' :
            cas.categorie === 'Néoplasie' ? 'bg-purple-100 text-purple-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {cas.categorie}
          </span>
          <span className="text-xs text-(--t4) flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {cas.date}
          </span>
          <span className="text-xs text-(--t4) flex items-center gap-1">
            <Eye className="w-3 h-3" /> {cas.vues} vues
          </span>
        </div>
        <h3 className="text-lg font-bold text-(--t1) leading-tight">{cas.titre}</h3>
        <p className="text-sm text-(--t3) mt-2 line-clamp-2">{cas.description}</p>
      </div>

      {/* Badge IA Confidence */}
      <div className="px-6 py-3 bg-(--sf2) border-y border-(--ln)">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-(--t2)">IA Confidence</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-1.5 bg-(--sf3) rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${cas.confidence}%` }}
              />
            </div>
            <span className="text-sm font-bold text-blue-600">{cas.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Votes */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-6 mb-4">
          <button 
            onClick={() => onVote(cas.id, 'concordant')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              cas.userVote === 'concordant' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-(--sf2) text-(--t2) hover:bg-(--sf2)'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            Concordant ({cas.concordant})
          </button>
          <button 
            onClick={() => onVote(cas.id, 'nonConcordant')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              cas.userVote === 'nonConcordant' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-(--sf2) text-(--t2) hover:bg-(--sf2)'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Non-Concordant ({cas.nonConcordant})
          </button>
        </div>

        {/* Auteur */}
        <div className="flex items-center justify-between pt-3 border-t border-(--ln)">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {cas.auteur.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-(--t1)">{cas.auteur}</p>
              <p className="text-xs text-(--t4)">{cas.hopital}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              {isExpanded ? 'Voir moins' : 'Lire l\'analyse'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Analyse détaillée (expansible) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-(--ln)"
            >
              <div className="bg-(--sf2) rounded-lg p-4">
                <h4 className="text-sm font-semibold text-(--t1) mb-2">Analyse détaillée</h4>
                <p className="text-sm text-(--t2) leading-relaxed">{cas.analyse}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {cas.tags?.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-(--sf) border border-(--ln) text-(--t2)">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ==================== PAGE PRINCIPALE ====================

export default function CasCliniques() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [filtre, setFiltre] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Données des cas cliniques
  const [cas, setCas] = useState([
    {
      id: 1,
      titre: "Opacité basale gauche suspecte chez patient de 64 ans",
      description: "Patient tabagique avec toux productive et fièvre évoluant depuis 10 jours. L'imagerie montre une opacité parenchymateuse basale gauche avec bronchogramme aérien.",
      analyse: "L'opacité alvéolaire avec bronchogramme aérien est évocatrice d'une pneumonie lobaire. Le contexte de tabagisme actif (45 paquets-années) ajoute un risque de cancer sous-jacent. Une fibroscopie bronchique est recommandée en l'absence d'amélioration à J7. La biopsie per-bronchique permettra d'éliminer une néoplasie associée.",
      categorie: "Pneumonie",
      date: "15/03/2026",
      vues: 1240,
      confidence: 94,
      concordant: 1284,
      nonConcordant: 842,
      auteur: "Dr. Elena Volkov",
      hopital: "CHU de Douala",
      tags: ["Tabagisme", "Opacité alvéolaire", "Bronchogramme aérien"],
      userVote: null
    },
    {
      id: 2,
      titre: "Exacerbation sévère – Discordance Radio-Clinique",
      description: "Patient de 71 ans, BPCO connu, admis pour exacerbation sévère. Signes d'emphysème centro-lobulaire diffus à l'imagerie. L'IA suggère une embolie pulmonaire.",
      analyse: "La discordance radio-clinique est frappante : absence d'éléments en faveur d'une embolie pulmonaire à l'angioscanner. Le diagnostic retenu est une exacerbation de BPCO compliquée d'aspergillose pulmonaire chronique. Un traitement par corticostéroïdes et antifongiques a été initié avec réponse favorable à J7.",
      categorie: "BPCO",
      date: "12/03/2026",
      vues: 982,
      confidence: 62,
      concordant: 856,
      nonConcordant: 423,
      auteur: "Dr. Marc Lévêque",
      hopital: "Hôpital Central, Yaoundé",
      tags: ["BPCO", "Emphysème", "Discordance IA"],
      userVote: null
    },
    {
      id: 3,
      titre: "Infiltration interstitielle bilatérale – Suivi J+15",
      description: "Patient de 52 ans, immunodéprimé, présentant une infiltration interstitielle bilatérale. Évolution favorable sous antibiothérapie ciblée.",
      analyse: "L'évolution radiologique sous traitement antifongique (voriconazole) est spectaculaire avec régression de plus de 60% des infiltrats à J+15. Le diagnostic d'aspergillose pulmonaire chronique a été confirmé par sérologie et PCR.",
      categorie: "Pneumonie",
      date: "10/03/2026",
      vues: 756,
      confidence: 88,
      concordant: 1024,
      nonConcordant: 312,
      auteur: "Dr. Sophie Kameni",
      hopital: "CHU de Yaoundé",
      tags: ["Immunodéprimé", "Infiltration interstitielle", "Aspergillose"],
      userVote: null
    },
    {
      id: 4,
      titre: "Nodule spiculé du lobe supérieur droit (12mm)",
      description: "Découverte fortuite lors d'un bilan pré-opératoire chez un patient de 58 ans, tabagique sevré. Nodule spiculé de 12mm au LSD.",
      analyse: "Le caractère spiculé du nodule, associé à un antécédent de tabagisme (30 paquets-années), impose une prise en charge spécialisée. Une TEP-scan et une biopsie per-endoscopique sont indiquées. Le diagnostic différentiel inclut carcinome bronchique primitif ou métastase.",
      categorie: "Néoplasie",
      date: "08/03/2026",
      vues: 2150,
      confidence: 91,
      concordant: 1678,
      nonConcordant: 234,
      auteur: "Pr. Jean-Luc Ngassa",
      hopital: "Hôpital Laquintinie, Douala",
      tags: ["Nodule spiculé", "Tabagisme", "TEP-scan"],
      userVote: null
    },
    {
      id: 5,
      titre: "Pneumothorax récidivant chez patient jeune",
      description: "Patient de 24 ans, sans antécédent, troisième épisode de pneumothorax spontané en 6 mois. Scanner thoracique montre des bulles d'emphysème apical.",
      analyse: "La récidive du pneumothorax malgré le drainage thoracique impose un traitement définitif. La pleurodèse chimique ou la résection chirurgicale des bulles d'emphysème sont à discuter en réunion de concertation pluridisciplinaire.",
      categorie: "Pneumothorax",
      date: "05/03/2026",
      vues: 543,
      confidence: 78,
      concordant: 567,
      nonConcordant: 189,
      auteur: "Dr. Thomas Eyenga",
      hopital: "Hôpital Général, Douala",
      tags: ["Pneumothorax récidivant", "Bulles d'emphysème", "Pleurodèse"],
      userVote: null
    }
  ]);

  const stats = [
    { label: "Cas partagés", value: "127", icon: FileText, color: "blue" },
    { label: "Médecins contributeurs", value: "43", icon: Users, color: "emerald" },
    { label: "Taux de concordance IA", value: "84%", icon: Brain, color: "purple" },
    { label: "Vues totales", value: "8.2k", icon: Eye, color: "amber" }
  ];

  const filtres = ['tous', 'Pneumonie', 'BPCO', 'Néoplasie', 'Pneumothorax'];

  const handleVote = (id, voteType) => {
    setCas(cas.map(c => {
      if (c.id === id) {
        // Annuler le vote si même type
        if (c.userVote === voteType) {
          return {
            ...c,
            concordant: voteType === 'concordant' ? c.concordant - 1 : c.concordant,
            nonConcordant: voteType === 'nonConcordant' ? c.nonConcordant - 1 : c.nonConcordant,
            userVote: null
          };
        }
        // Changer de vote
        return {
          ...c,
          concordant: voteType === 'concordant' ? c.concordant + 1 : (c.userVote === 'concordant' ? c.concordant - 1 : c.concordant),
          nonConcordant: voteType === 'nonConcordant' ? c.nonConcordant + 1 : (c.userVote === 'nonConcordant' ? c.nonConcordant - 1 : c.nonConcordant),
          userVote: voteType
        };
      }
      return c;
    }));
    addToast(`Vote ${voteType === 'concordant' ? 'concordant' : 'non-concordant'} enregistré`, 'success');
  };

  const addToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const casFiltres = cas.filter(c => {
    if (filtre !== 'tous' && c.categorie !== filtre) return false;
    if (searchTerm && !c.titre.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !c.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Top contributeurs
  const topContributors = [
    { nom: "Dr. Elena Volkov", casPartages: 42, score: 98, hopital: "CHU de Douala" },
    { nom: "Dr. Marc Lévêque", casPartages: 38, score: 95, hopital: "Hôpital Central, Yaoundé" },
    { nom: "Dr. Jean Tagne", casPartages: 29, score: 92, hopital: "Clinique des Anges" }
  ];

  return (
    <div className="min-h-screen bg-(--bg)">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-(--t1)">Cas cliniques</h1>
          </div>
          <p className="text-(--t3)">Analysez, votez et contribuez aux cas cliniques partagés par la communauté médicale CEMAC.</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* TOP CONTRIBUTEURS */}
        <div className="bg-(--sf) rounded-xl border border-(--ln) p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-(--t1)">Top Contributeurs</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {topContributors.map((contrib, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-(--sf2) rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {contrib.nom.charAt(0)}{contrib.nom.split(' ')[1]?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-(--t1) text-sm">{contrib.nom}</p>
                  <p className="text-xs text-(--t4)">{contrib.hopital}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{contrib.score}%</p>
                  <p className="text-xs text-(--t4)">{contrib.casPartages} cas</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FILTRES ET RECHERCHE */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {filtres.map(f => (
              <FilterChip 
                key={f} 
                label={f === 'tous' ? 'Tous les cas' : f} 
                active={filtre === f}
                onClick={() => setFiltre(f)}
              />
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
            <input
              type="text"
              placeholder="Rechercher un cas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 border border-(--ln) rounded-lg text-sm bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* GRILLE DES CAS */}
        <div className="space-y-5">
          {casFiltres.length === 0 ? (
            <div className="bg-(--sf) rounded-xl p-12 text-center border border-(--ln)">
              <FileText className="w-12 h-12 text-(--ln2) mx-auto mb-4" />
              <p className="text-(--t3)">Aucun cas clinique ne correspond à vos critères.</p>
            </div>
          ) : (
            casFiltres.map(c => (
              <CasCard key={c.id} cas={c} onVote={handleVote} />
            ))
          )}
        </div>

        {/* CTA - PARTAGER UN CAS */}
        <div className="mt-10 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-(--sf)/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Partagez votre expertise</h3>
                <p className="text-blue-100 text-sm">Soumettez un cas clinique à la communauté</p>
              </div>
            </div>
            <button onClick={() => navigate('/medecin/consultation')} className="px-6 py-3 bg-(--sf) text-blue-600 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Nouveau cas clinique
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TOAST */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}