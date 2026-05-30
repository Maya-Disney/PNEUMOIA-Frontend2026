// src/features/medecin/pages/Consultation.jsx
import { useState, useEffect } from 'react';
import { 
  UserPlus, Stethoscope, CheckCircle, AlertCircle,
  Brain, Pill, Activity, ClipboardList, AlertTriangle, Info, Zap, Target, LineChart,
  Search, X, User, Phone, Calendar as CalendarIcon,
  Briefcase, Loader2, Globe, MapPin, Lock, Unlock, Users, Share2, FileText,
  TrendingUp, Award, Sparkles, Eye, MessageSquare, Clock, Heart, Droplet,
  Thermometer, Wind, HeartPulse, Syringe, Microscope, Hospital
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== COMPOSANTS UI ====================

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
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
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-xl ${bgColors[type]}`}
    >
      {type === 'success' && <CheckCircle className="w-5 h-5" />}
      {type === 'warning' && <AlertTriangle className="w-5 h-5" />}
      {type === 'error' && <AlertCircle className="w-5 h-5" />}
      {type === 'info' && <Info className="w-5 h-5" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-3 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </motion.div>
  );
};

const StepIndicator = ({ currentStep, steps, patientInfo }) => (
  <div className="mb-8">
    {patientInfo.nom && (
      <div className="mb-6 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 dark:border-blue-500/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              {patientInfo.prenom?.[0]}{patientInfo.nom?.[0]}
            </div>
            <div>
              <p className="font-semibold text-(--t1)">{patientInfo.civilite} {patientInfo.prenom} {patientInfo.nom}</p>
              <p className="text-xs text-(--t3)">{patientInfo.age} • {patientInfo.telephone || 'Tél. non renseigné'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-(--t3)">
            <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{patientInfo.adresse || 'Adresse non renseignée'}</div>
            <div className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{patientInfo.profession || 'Profession non renseignée'}</div>
          </div>
        </div>
      </div>
    )}
    
    <div className="flex items-center">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        return (
          <div key={step.number} className="flex-1 relative">
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                ${isCompleted ? 'bg-emerald-600 text-white shadow-md' : 
                  isActive ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100' : 
                  'bg-[var(--sf2)] text-(--t4) border-2 border-(--ln)'}
              `}>
                {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.number}
              </div>
              <p className={`text-[10px] font-medium mt-1.5 ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-(--t4)'}`}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 transition-all duration-300 ${isCompleted ? 'bg-emerald-600' : 'bg-(--ln)'}`} />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const FormCard = ({ title, icon, children, className = "" }) => (
  <div className={`bg-(--sf) rounded-xl border border-(--ln) overflow-hidden shadow-sm hover:shadow-md transition-all ${className}`}>
    <div className="px-5 py-3 bg-(--sf2) border-b border-(--ln)">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-300">
          {icon}
        </div>
        <h3 className="font-semibold text-(--t1) text-sm">{title}</h3>
      </div>
    </div>
    <div className="p-5">
      {children}
    </div>
  </div>
);

const InputField = ({ label, type = "text", value, onChange, placeholder, required = false, icon: Icon, disabled = false }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-(--t2) mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--t4)" />}
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${Icon ? 'pl-9' : ''} ${disabled ? 'bg-(--sf2) text-(--t3)' : 'bg-(--sf) text-(--t1) placeholder:text-(--t4)'}`}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false, icon: Icon }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-(--t2) mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--t4)" />}
      <select
        value={value || ''}
        onChange={onChange}
        className={`w-full px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) ${Icon ? 'pl-9' : ''}`}
      >
        <option value="">Sélectionnez</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  </div>
);

const RadioOption = ({ label, checked, onChange, name }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="radio"
      name={name}
      checked={checked}
      onChange={onChange}
      className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
    />
    <span className="text-xs text-(--t2)">{label}</span>
  </label>
);

const CheckboxField = ({ label, checked, onChange, description }) => (
  <label className="flex items-start gap-2 cursor-pointer p-1 rounded hover:bg-(--sf2) transition-colors">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 w-3.5 h-3.5 rounded border-(--ln) text-blue-600 focus:ring-blue-500"
    />
    <div>
      <span className="text-xs text-(--t2)">{label}</span>
      {description && <p className="text-[10px] text-(--t4)">{description}</p>}
    </div>
  </label>
);

const TextAreaField = ({ label, value, onChange, placeholder, rows = 2 }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-(--t2) mb-1">{label}</label>
    <textarea
      rows={rows}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm border border-(--ln) bg-(--sf) text-(--t1) placeholder:text-(--t4) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
    />
  </div>
);

// ==================== PAGE PRINCIPALE ====================

export default function Consultation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [toast, setToast] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // ==================== ÉTAPE 1: PATIENT ====================
  const [patientInfo, setPatientInfo] = useState({
    civilite: '', nom: '', prenom: '', dateNaissance: '', telephone: '', email: '',
    adresse: '', profession: '', religion: '', groupeSanguin: '',
    personneAContacter: '', telephoneUrgence: ''
  });
  
  const calculateAge = () => {
    if (!patientInfo.dateNaissance) return '';
    const birthDate = new Date(patientInfo.dateNaissance);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970) + ' ans';
  };
  
  // ==================== ÉTAPE 2: ANTÉCÉDENTS MÉDICAUX ====================
  const [antecedents, setAntecedents] = useState({
    // Maladies chroniques
    diabete: false, hypertension: false, asthme: false, bpco: false,
    insuffisanceCardiaque: false, insuffisanceRenale: false,
    hepatite: false, cirrhose: false, epilepsie: false,
    // Maladies infectieuses
    tuberculose: false, vih: false, typhoide: false, paludisme: false,
    covid19: false, hepatiteB: false, hepatiteC: false,
    // Oncologiques
    cancerPoumon: false, cancerSein: false, cancerColon: false,
    // Autres
    anemie: false, hemophilie: false, lupus: false,
    // Traitements
    traitementEnCours: '', allergieMedicaments: '',
    // Mode de vie
    tabagisme: 'non-fumeur', cigarettesParJour: 0, dureeTabagisme: 0,
    alcool: false, toxicomanie: false,
    professionRisque: false, expositionProfessionnelle: ''
  });
  
  // ==================== ÉTAPE 3: CONSULTATION ACTUELLE ====================
  const [consultation, setConsultation] = useState({
    motif: '', debutSymptomes: '', evolution: '', traitementDejaPris: '',
    // Signes vitaux
    temperature: '', saturationO2: '', frequenceCardiaque: '', frequenceRespiratoire: '',
    tensionSystolique: '', tensionDiastolique: '',
    // Fièvre
    fievre: false, fievreTemperature: '', fievreDuree: '',
    // Toux
    toux: false, touxType: 'seche', touxProductive: false, touxCouleur: '', touxSang: false,
    // Dyspnée
    dyspnee: false, dyspneeStade: 1, dyspneeRepos: false, dyspneeEffort: false,
    // Douleur thoracique
    douleurThoracique: false, douleurType: 'angineux',
    // Expectorations
    expectorations: false, expectorationsCouleur: '',
    // Autres symptômes
    wheezing: false, hemoptysie: false, cyanose: false, fatigue: false,
    pertePoids: false, sueursNocturnes: false, anorexie: false,
    mauxDeTete: false, courbatures: false, rhinorrhee: false,
    // Examen clinique
    auscultation: '', crepitants: false, sibilants: false, ronchi: false,
    // Examens prescrits
    radiographie: false, scanner: false, priseDeSang: false,
    gazDuSang: false, efr: false, rechercheBK: false
  });
  
  // ==================== RÉSULTATS IA ====================
  const [aiResult, setAiResult] = useState({
    principal: '', confidence: 0, differentials: [], riskLevel: 'low',
    recommendations: [], criteria: [], examensRecommandes: []
  });
  
  // ==================== PRESCRIPTION ====================
  const [prescription, setPrescription] = useState({
    medicaments: '', conseilsMaison: '', recommandations: '',
    arretTravail: false, dureeArret: '7', hospitalisation: false,
    motifHospitalisation: '', suivi: '7 jours', observations: '',
    partageCommunaute: false, anonymiser: true
  });
  
  const steps = [
    { number: 1, label: 'Patient' },
    { number: 2, label: 'Antécédents' },
    { number: 3, label: 'Symptômes' },
    { number: 4, label: 'Diagnostic & Traitement' }
  ];
  
  const addToast = (message, type) => setToast({ message, type });
  
  // Vérification Témoin de Jéhovah
  const isTemoinJehovah = patientInfo.religion === 'temoin_jehovah';
  
  // ==================== FONCTIONS DE NAVIGATION ====================
  const createAndContinue = () => {
    if (!patientInfo.nom || !patientInfo.prenom) {
      addToast('Veuillez remplir au moins le nom et prénom', 'warning');
      return;
    }
    addToast(`Patient ${patientInfo.nom} ${patientInfo.prenom} créé avec succès`, 'success');
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const selectAndContinue = (patientData) => {
    setPatientInfo({ ...patientInfo, ...patientData });
    setShowSearch(false);
    addToast(`Patient ${patientData.nom} ${patientData.prenom} sélectionné`, 'success');
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleNext = () => { if (currentStep < 4) setCurrentStep(currentStep + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handlePrev = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleFinish = () => {
    addToast('Consultation terminée avec succès !', 'success');
    setTimeout(() => navigate('/medecin/dashboard'), 2000);
  };
  
  // Recherche patient
  const handleSearchPatient = () => {
    if (searchTerm.length < 2) {
      addToast('Veuillez entrer au moins 2 caractères', 'warning');
      return;
    }
    const mockResults = [
      { id: 1, nom: 'Tagne', prenom: 'Jean', dateNaissance: '1975-03-15', telephone: '+237 6XX XXX XXX', adresse: 'Douala', profession: 'Enseignant' },
      { id: 2, nom: 'FOUDA', prenom: 'Marie', dateNaissance: '1972-08-22', telephone: '+237 6XX XXX XXX', adresse: 'Yaoundé', profession: 'Infirmière' }
    ].filter(p => p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || p.prenom.toLowerCase().includes(searchTerm.toLowerCase()));
    setSearchResults(mockResults);
    if (mockResults.length === 0) addToast('Aucun patient trouvé', 'info');
  };
  
  // ==================== IA - DIAGNOSTIC BASÉ SUR LE DATASET ====================
  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      let scores = {
        pneumonie: 0, asthme: 0, bpco: 0, tuberculose: 0,
        covid19: 0, grippe: 0, bronchite: 0, cancerPoumon: 0
      };
      let criteria = [];
      let examensRecommandes = [];
      
      // ========== PNEUMONIE ==========
      if (consultation.fievre && consultation.fievreTemperature > 38.5) {
        scores.pneumonie += 25; criteria.push("Fièvre > 38.5°C");
      }
      if (consultation.touxProductive && consultation.touxCouleur === 'rouille') {
        scores.pneumonie += 30; criteria.push("Expectorations couleur rouille (pathognomonique)");
      }
      if (consultation.touxProductive && consultation.touxCouleur === 'jaune') {
        scores.pneumonie += 15; criteria.push("Expectorations purulentes");
      }
      if (consultation.douleurThoracique && consultation.douleurType === 'pleuritique') {
        scores.pneumonie += 15; criteria.push("Douleur thoracique pleuritique");
      }
      if (consultation.saturationO2 && consultation.saturationO2 < 94) {
        scores.pneumonie += 15; criteria.push(`Hypoxémie (SpO₂: ${consultation.saturationO2}%)`);
      }
      if (consultation.crepitants) {
        scores.pneumonie += 15; criteria.push("Crépitants à l'auscultation");
      }
      
      // ========== ASTHME ==========
      if (consultation.wheezing) {
        scores.asthme += 35; criteria.push("Wheezing / sifflements respiratoires");
      }
      if (antecedents.asthme) {
        scores.asthme += 25; criteria.push("Antécédent d'asthme");
      }
      if (consultation.touxType === 'seche') {
        scores.asthme += 15; criteria.push("Toux sèche");
      }
      if (consultation.dyspnee && consultation.dyspneeEffort) {
        scores.asthme += 10; criteria.push("Dyspnée à l'effort");
      }
      
      // ========== BPCO ==========
      if (antecedents.tabagisme === 'fumeur' && antecedents.cigarettesParJour > 10) {
        scores.bpco += 25; criteria.push(`Tabagisme actif (${antecedents.cigarettesParJour} cigarettes/jour)`);
      }
      if (antecedents.bpco) {
        scores.bpco += 30; criteria.push("Antécédent de BPCO");
      }
      if (consultation.dyspnee && consultation.dyspneeStade >= 2) {
        scores.bpco += 20; criteria.push(`Dyspnée stade ${consultation.dyspneeStade}/4`);
      }
      if (consultation.sibilants) {
        scores.bpco += 10; criteria.push("Sibilants à l'auscultation");
      }
      
      // ========== TUBERCULOSE ==========
      if (consultation.hemoptysie || consultation.touxSang) {
        scores.tuberculose += 40; criteria.push("Hémoptysie - signe d'alarme");
      }
      if (consultation.sueursNocturnes) {
        scores.tuberculose += 20; criteria.push("Sueurs nocturnes");
      }
      if (consultation.pertePoids) {
        scores.tuberculose += 15; criteria.push("Perte de poids involontaire");
      }
      if (antecedents.tuberculose) {
        scores.tuberculose += 20; criteria.push("Antécédent de tuberculose");
      }
      
      // ========== COVID-19 ==========
      if (consultation.fievre) scores.covid19 += 15;
      if (consultation.touxType === 'seche') scores.covid19 += 15;
      if (consultation.fatigue) scores.covid19 += 10;
      if (consultation.courbatures) scores.covid19 += 10;
      if (consultation.pertePoids) scores.covid19 += 5;
      
      // ========== GRIPPE ==========
      if (consultation.fievre) scores.grippe += 15;
      if (consultation.courbatures) scores.grippe += 20;
      if (consultation.mauxDeTete) scores.grippe += 10;
      if (consultation.rhinorrhee) scores.grippe += 10;
      
      // ========== BRONCHITE ==========
      if (consultation.touxProductive) scores.bronchite += 25;
      if (!consultation.crepitants && consultation.toux) scores.bronchite += 15;
      if (consultation.expectorations) scores.bronchite += 15;
      
      // ========== CANCER DU POUMON ==========
      if (antecedents.tabagisme === 'fumeur' && antecedents.cigarettesParJour > 20) {
        scores.cancerPoumon += 30; criteria.push("Tabagisme lourd (>20 cigarettes/jour)");
      }
      if (consultation.hemoptysie) scores.cancerPoumon += 25;
      if (consultation.pertePoids && consultation.pertePoids) scores.cancerPoumon += 20;
      if (antecedents.cancerPoumon) scores.cancerPoumon += 20;
      
      // Normalisation
      const maxScore = Math.max(...Object.values(scores), 1);
      Object.keys(scores).forEach(key => {
        scores[key] = Math.min(Math.round((scores[key] / maxScore) * 100), 100);
      });
      
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const principal = sorted[0];
      
      const principalName = {
        pneumonie: 'Pneumonie aiguë',
        asthme: 'Asthme bronchique',
        bpco: 'BPCO',
        tuberculose: 'Tuberculose pulmonaire',
        covid19: 'COVID-19',
        grippe: 'Grippe saisonnière',
        bronchite: 'Bronchite aiguë',
        cancerPoumon: 'Cancer du poumon'
      }[principal[0]] || principal[0];
      
      // Recommandations
      let recommendations = [];
      if (principal[0] === 'pneumonie') {
        recommendations.push("Amoxicilline-acide clavulanique 1g × 2/j pendant 7 jours");
        recommendations.push(" Paracétamol 1g × 3/j si fièvre > 38.5°C");
        recommendations.push(" Hydratation: 2-3L d'eau par jour");
        recommendations.push(" Kinésithérapie respiratoire");
        examensRecommandes.push("Radiographie thoracique", "NFS, CRP", "Hémocultures");
      } else if (principal[0] === 'asthme') {
        recommendations.push(" Budesonide 200-400µg × 2/j (corticoïde inhalé)");
        recommendations.push(" Salbutamol 2 bouffées en cas de crise");
        recommendations.push(" Plan d'action personnalisé");
        examensRecommandes.push("EFR", "Test de réversibilité", "Dosage IgE");
      } else if (principal[0] === 'tuberculose') {
        recommendations.push(" DÉCLARATION OBLIGATOIRE au programme national TB");
        recommendations.push(" Quadrithérapie RHZE");
        recommendations.push(" Hospitalisation initiale recommandée");
        examensRecommandes.push("Recherche BK (3 crachats)", "Radiographie thoracique", "IDR ou IGRA");
      }
      recommendations.push(" Consultation de contrôle dans 7-15 jours");
      
      const riskLevel = principal[1] > 70 ? 'high' : principal[1] > 40 ? 'medium' : 'low';
      
      setAiResult({
        principal: principalName,
        confidence: principal[1],
        differentials: sorted.slice(1, 4).map(([k, v]) => ({ 
          name: { pneumonie: 'Pneumonie', asthme: 'Asthme', bpco: 'BPCO', tuberculose: 'Tuberculose', covid19: 'COVID-19', grippe: 'Grippe', bronchite: 'Bronchite', cancerPoumon: 'Cancer du poumon' }[k] || k, 
          score: v 
        })),
        riskLevel,
        recommendations,
        criteria: criteria.slice(0, 8),
        examensRecommandes
      });
      
      setIsAnalyzing(false);
      setCurrentStep(4);
    }, 2000);
  };
  
  const getRiskColor = (level) => {
    const colors = { low: 'emerald', medium: 'amber', high: 'red' };
    return colors[level] || 'slate';
  };
  
  const getRiskText = (level) => {
    const texts = { 
      low: '🟢 Risque faible - Suivi ambulatoire possible', 
      medium: '🟡 Risque modéré - Surveillance rapprochée nécessaire', 
      high: '🔴 Risque élevé - Hospitalisation recommandée' 
    };
    return texts[level] || '';
  };
  
  // ==================== RENDU DES ÉTAPES ====================
  
  // Étape 1: Patient
  const renderStepPatient = () => (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button onClick={() => setShowSearch(false)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${!showSearch ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--sf)] border border-(--ln) text-(--t2) hover:bg-(--sf2)'}`}>
          <UserPlus className="w-4 h-4 inline mr-1.5" /> Nouveau patient
        </button>
        <button onClick={() => setShowSearch(true)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${showSearch ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--sf)] border border-(--ln) text-(--t2) hover:bg-(--sf2)'}`}>
          <Search className="w-4 h-4 inline mr-1.5" /> Patient existant
        </button>
      </div>
      
      {showSearch && (
        <div className="bg-[var(--sf)] rounded-lg border border-(--ln) p-4">
          <h3 className="font-medium text-sm mb-3">Rechercher un patient</h3>
          <div className="flex gap-2">
            <input type="text" placeholder="Nom, prénom..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-3 py-1.5 text-sm border rounded-lg" />
            <button onClick={handleSearchPatient} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Rechercher</button>
          </div>
          {searchResults.length > 0 && searchResults.map(p => (
            <div key={p.id} className="flex justify-between items-center p-2 bg-[var(--sf2)] rounded-lg mt-2">
              <div><p className="font-medium text-sm text-(--t1)">{p.nom} {p.prenom}</p><p className="text-xs text-(--t3)">{p.telephone}</p></div>
              <button onClick={() => selectAndContinue(p)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs">Sélectionner</button>
            </div>
          ))}
        </div>
      )}
      
      {!showSearch && (
        <>
          <FormCard title="Identité du patient" icon={<User className="w-4 h-4" />}>
            <div className="grid md:grid-cols-2 gap-3">
              <SelectField label="Civilité" value={patientInfo.civilite} onChange={(e) => setPatientInfo({...patientInfo, civilite: e.target.value})} options={[{value: 'M', label: 'Monsieur'}, {value: 'Mme', label: 'Madame'}]} />
              <div></div>
              <InputField label="Nom *" value={patientInfo.nom} onChange={(e) => setPatientInfo({...patientInfo, nom: e.target.value.toUpperCase()})} required icon={User} />
              <InputField label="Prénom *" value={patientInfo.prenom} onChange={(e) => setPatientInfo({...patientInfo, prenom: e.target.value})} required icon={User} />
              <InputField label="Date de naissance" type="date" value={patientInfo.dateNaissance} onChange={(e) => setPatientInfo({...patientInfo, dateNaissance: e.target.value})} icon={CalendarIcon} />
              <InputField label="Âge" value={calculateAge()} disabled icon={CalendarIcon} />
              <InputField label="Téléphone" type="tel" value={patientInfo.telephone} onChange={(e) => setPatientInfo({...patientInfo, telephone: e.target.value})} icon={Phone} />
              <InputField label="Adresse" value={patientInfo.adresse} onChange={(e) => setPatientInfo({...patientInfo, adresse: e.target.value})} icon={MapPin} />
              <InputField label="Profession" value={patientInfo.profession} onChange={(e) => setPatientInfo({...patientInfo, profession: e.target.value})} icon={Briefcase} />
              <SelectField label="Religion *" value={patientInfo.religion} onChange={(e) => setPatientInfo({...patientInfo, religion: e.target.value})} options={[
                {value: 'catholique', label: 'Catholique'}, {value: 'protestant', label: 'Protestant'},
                {value: 'temoin_jehovah', label: 'Témoin de Jéhovah'}, {value: 'musulman', label: 'Musulman'},
                {value: 'autres', label: 'Autres'}
              ]} required icon={Globe} />
              <SelectField label="Groupe sanguin" value={patientInfo.groupeSanguin} onChange={(e) => setPatientInfo({...patientInfo, groupeSanguin: e.target.value})} options={[
                {value: 'A+', label: 'A+'}, {value: 'A-', label: 'A-'},
                {value: 'B+', label: 'B+'}, {value: 'B-', label: 'B-'},
                {value: 'AB+', label: 'AB+'}, {value: 'AB-', label: 'AB-'},
                {value: 'O+', label: 'O+'}, {value: 'O-', label: 'O-'}
              ]} icon={Droplet} />
            </div>
          </FormCard>
          
          <FormCard title="Personne à contacter en cas d'urgence" icon={<Phone className="w-4 h-4" />}>
            <div className="grid md:grid-cols-2 gap-3">
              <InputField label="Nom" value={patientInfo.personneAContacter} onChange={(e) => setPatientInfo({...patientInfo, personneAContacter: e.target.value})} />
              <InputField label="Téléphone" type="tel" value={patientInfo.telephoneUrgence} onChange={(e) => setPatientInfo({...patientInfo, telephoneUrgence: e.target.value})} icon={Phone} />
            </div>
          </FormCard>
          
          {isTemoinJehovah && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-800">⚠️ Patient Témoin de Jéhovah</p>
                <p className="text-[10px] text-amber-700">Ne peut pas recevoir de transfusion sanguine. Cette information sera visible sur le dossier.</p>
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="flex justify-end">
        <button onClick={createAndContinue} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">
          Continuer →
        </button>
      </div>
    </div>
  );
  
  // Étape 2: Antécédents médicaux
  const renderStepAntecedents = () => (
    <div className="space-y-4">
      <FormCard title="Mode de vie" icon={<Activity className="w-4 h-4" />}>
        <div className="mb-3">
          <label className="block text-xs font-medium text-(--t2) mb-2">Tabagisme</label>
          <div className="flex gap-4">
            <RadioOption label="Non-fumeur" name="tabagisme" checked={antecedents.tabagisme === 'non-fumeur'} onChange={() => setAntecedents({...antecedents, tabagisme: 'non-fumeur'})} />
            <RadioOption label="Fumeur" name="tabagisme" checked={antecedents.tabagisme === 'fumeur'} onChange={() => setAntecedents({...antecedents, tabagisme: 'fumeur'})} />
            <RadioOption label="Ancien fumeur" name="tabagisme" checked={antecedents.tabagisme === 'ancien'} onChange={() => setAntecedents({...antecedents, tabagisme: 'ancien'})} />
          </div>
        </div>
        {antecedents.tabagisme === 'fumeur' && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <InputField label="Cigarettes/jour" type="number" value={antecedents.cigarettesParJour} onChange={(e) => setAntecedents({...antecedents, cigarettesParJour: parseInt(e.target.value) || 0})} />
            <InputField label="Années de tabagisme" type="number" value={antecedents.dureeTabagisme} onChange={(e) => setAntecedents({...antecedents, dureeTabagisme: parseInt(e.target.value) || 0})} />
          </div>
        )}
        <div className="mt-3">
          <CheckboxField label="Consommation d'alcool" checked={antecedents.alcool} onChange={(c) => setAntecedents({...antecedents, alcool: c})} />
        </div>
      </FormCard>
      
      <FormCard title="Antécédents médicaux" icon={<ClipboardList className="w-4 h-4" />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <CheckboxField label="Diabète" checked={antecedents.diabete} onChange={(c) => setAntecedents({...antecedents, diabete: c})} />
          <CheckboxField label="Hypertension" checked={antecedents.hypertension} onChange={(c) => setAntecedents({...antecedents, hypertension: c})} />
          <CheckboxField label="Asthme" checked={antecedents.asthme} onChange={(c) => setAntecedents({...antecedents, asthme: c})} />
          <CheckboxField label="BPCO" checked={antecedents.bpco} onChange={(c) => setAntecedents({...antecedents, bpco: c})} />
          <CheckboxField label="Tuberculose" checked={antecedents.tuberculose} onChange={(c) => setAntecedents({...antecedents, tuberculose: c})} />
          <CheckboxField label="VIH/SIDA" checked={antecedents.vih} onChange={(c) => setAntecedents({...antecedents, vih: c})} />
          <CheckboxField label="Typhoïde" checked={antecedents.typhoide} onChange={(c) => setAntecedents({...antecedents, typhoide: c})} />
          <CheckboxField label="Paludisme" checked={antecedents.paludisme} onChange={(c) => setAntecedents({...antecedents, paludisme: c})} />
          <CheckboxField label="COVID-19" checked={antecedents.covid19} onChange={(c) => setAntecedents({...antecedents, covid19: c})} />
          <CheckboxField label="Hépatite B" checked={antecedents.hepatiteB} onChange={(c) => setAntecedents({...antecedents, hepatiteB: c})} />
          <CheckboxField label="Hépatite C" checked={antecedents.hepatiteC} onChange={(c) => setAntecedents({...antecedents, hepatiteC: c})} />
          <CheckboxField label="Cancer du poumon" checked={antecedents.cancerPoumon} onChange={(c) => setAntecedents({...antecedents, cancerPoumon: c})} />
          <CheckboxField label="Autre cancer" checked={antecedents.cancerSein || antecedents.cancerColon} onChange={(c) => setAntecedents({...antecedents, cancerSein: c, cancerColon: c})} />
        </div>
        
        <div className="mt-3">
          <InputField label="Traitements en cours" value={antecedents.traitementEnCours} onChange={(e) => setAntecedents({...antecedents, traitementEnCours: e.target.value})} placeholder="Médicaments, posologies..." />
        </div>
        <div className="mt-2">
          <InputField label="Allergies médicamenteuses" value={antecedents.allergieMedicaments} onChange={(e) => setAntecedents({...antecedents, allergieMedicaments: e.target.value})} placeholder="Pénicilline, aspirine..." />
        </div>
      </FormCard>
      
      <FormCard title="Expositions professionnelles" icon={<Briefcase className="w-4 h-4" />}>
        <div className="space-y-3">
          <CheckboxField label="Profession à risque (amiante, mines, silice...)" checked={antecedents.professionRisque} onChange={(c) => setAntecedents({...antecedents, professionRisque: c})} />
          {antecedents.professionRisque && (
            <InputField label="Précisez l'exposition" value={antecedents.expositionProfessionnelle} onChange={(e) => setAntecedents({...antecedents, expositionProfessionnelle: e.target.value})} />
          )}
        </div>
      </FormCard>
      
      <div className="flex justify-between">
        <button onClick={handlePrev} className="px-5 py-2.5 border rounded-lg text-sm">← Retour</button>
        <button onClick={handleNext} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium">Continuer →</button>
      </div>
    </div>
  );
  
  // Étape 3: Consultation actuelle (symptômes)
  const renderStepSymptomes = () => (
    <div className="space-y-4">
      <FormCard title="Motif et historique" icon={<Stethoscope className="w-4 h-4" />}>
        <TextAreaField label="Motif de la consultation" value={consultation.motif} onChange={(e) => setConsultation({...consultation, motif: e.target.value})} placeholder="Ce qui amène le patient aujourd'hui..." rows={2} />
        <div className="grid grid-cols-2 gap-3 mt-2">
          <InputField label="Début des symptômes" type="date" value={consultation.debutSymptomes} onChange={(e) => setConsultation({...consultation, debutSymptomes: e.target.value})} />
          <SelectField label="Évolution" value={consultation.evolution} onChange={(e) => setConsultation({...consultation, evolution: e.target.value})} options={[
            {value: 'stable', label: 'Stable'}, {value: 'aggravation', label: 'Aggravation'},
            {value: 'amelioration', label: 'Amélioration'}, {value: 'fluctuant', label: 'Fluctuant'}
          ]} />
        </div>
        <div className="mt-2">
          <InputField label="Traitements déjà pris" value={consultation.traitementDejaPris} onChange={(e) => setConsultation({...consultation, traitementDejaPris: e.target.value})} placeholder="Médicaments, automédication..." />
        </div>
      </FormCard>
      
      <FormCard title="Signes vitaux" icon={<HeartPulse className="w-4 h-4" />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <InputField label="Température (°C)" type="number" step="0.1" value={consultation.temperature} onChange={(e) => setConsultation({...consultation, temperature: e.target.value})} icon={Thermometer} />
          <InputField label="SpO₂ (%)" type="number" min="0" max="100" value={consultation.saturationO2} onChange={(e) => setConsultation({...consultation, saturationO2: e.target.value})} icon={Droplet} />
          <InputField label="FC (bpm)" type="number" value={consultation.frequenceCardiaque} onChange={(e) => setConsultation({...consultation, frequenceCardiaque: e.target.value})} icon={Heart} />
          <InputField label="FR (/min)" type="number" value={consultation.frequenceRespiratoire} onChange={(e) => setConsultation({...consultation, frequenceRespiratoire: e.target.value})} icon={Wind} />
          <InputField label="TA systolique" type="number" value={consultation.tensionSystolique} onChange={(e) => setConsultation({...consultation, tensionSystolique: e.target.value})} icon={Activity} />
          <InputField label="TA diastolique" type="number" value={consultation.tensionDiastolique} onChange={(e) => setConsultation({...consultation, tensionDiastolique: e.target.value})} icon={Activity} />
        </div>
      </FormCard>
      
      <FormCard title="Symptômes respiratoires" icon={<Wind className="w-4 h-4" />}>
        <div className="space-y-3">
          {/* Fièvre */}
          <div className="p-3 bg-[var(--sf2)] rounded-lg">
            <CheckboxField label="Fièvre" checked={consultation.fievre} onChange={(c) => setConsultation({...consultation, fievre: c})} />
            {consultation.fievre && (
              <div className="grid grid-cols-2 gap-3 mt-2 ml-5">
                <InputField label="Température max (°C)" type="number" step="0.1" value={consultation.fievreTemperature} onChange={(e) => setConsultation({...consultation, fievreTemperature: e.target.value})} />
                <InputField label="Durée (jours)" value={consultation.fievreDuree} onChange={(e) => setConsultation({...consultation, fievreDuree: e.target.value})} />
              </div>
            )}
          </div>
          
          {/* Toux */}
          <div className="p-3 bg-[var(--sf2)] rounded-lg">
            <CheckboxField label="Toux" checked={consultation.toux} onChange={(c) => setConsultation({...consultation, toux: c})} />
            {consultation.toux && (
              <div className="ml-5 mt-2 space-y-2">
                <div className="flex gap-3">
                  <RadioOption label="Sèche" name="touxType" checked={consultation.touxType === 'seche'} onChange={() => setConsultation({...consultation, touxType: 'seche'})} />
                  <RadioOption label="Grasse" name="touxType" checked={consultation.touxType === 'grasse'} onChange={() => setConsultation({...consultation, touxType: 'grasse'})} />
                </div>
                {consultation.touxType === 'grasse' && (
                  <div className="space-y-2">
                    <SelectField label="Couleur" value={consultation.touxCouleur} onChange={(e) => setConsultation({...consultation, touxCouleur: e.target.value})} options={[
                      {value: 'blanche', label: 'Blanche'}, {value: 'jaune', label: 'Jaune/Verte'},
                      {value: 'rouille', label: 'Rouille (Pneumonie)'}, {value: 'sanglante', label: 'Sanglante'}
                    ]} />
                    <CheckboxField label="Expectorations" checked={consultation.expectorations} onChange={(c) => setConsultation({...consultation, expectorations: c})} />
                    <CheckboxField label="Crachats sanglants" checked={consultation.touxSang} onChange={(c) => setConsultation({...consultation, touxSang: c})} />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Dyspnée */}
          <div className="p-3 bg-[var(--sf2)] rounded-lg">
            <CheckboxField label="Dyspnée (essoufflement)" checked={consultation.dyspnee} onChange={(c) => setConsultation({...consultation, dyspnee: c})} />
            {consultation.dyspnee && (
              <div className="ml-5 mt-2 space-y-2">
                <SelectField label="Stade" value={consultation.dyspneeStade} onChange={(e) => setConsultation({...consultation, dyspneeStade: parseInt(e.target.value)})} options={[
                  {value: 1, label: 'Stade 1: À l\'effort intense'},
                  {value: 2, label: 'Stade 2: À l\'effort modéré'},
                  {value: 3, label: 'Stade 3: À l\'effort minime'},
                  {value: 4, label: 'Stade 4: Au repos'}
                ]} />
                <div className="flex gap-3">
                  <CheckboxField label="À l'effort" checked={consultation.dyspneeEffort} onChange={(c) => setConsultation({...consultation, dyspneeEffort: c})} />
                  <CheckboxField label="Au repos" checked={consultation.dyspneeRepos} onChange={(c) => setConsultation({...consultation, dyspneeRepos: c})} />
                </div>
              </div>
            )}
          </div>
          
          {/* Douleur thoracique */}
          <div className="p-3 bg-[var(--sf2)] rounded-lg">
            <CheckboxField label="Douleur thoracique" checked={consultation.douleurThoracique} onChange={(c) => setConsultation({...consultation, douleurThoracique: c})} />
            {consultation.douleurThoracique && (
              <div className="ml-5 mt-2">
                <SelectField label="Type" value={consultation.douleurType} onChange={(e) => setConsultation({...consultation, douleurType: e.target.value})} options={[
                  {value: 'angineux', label: 'Angineux (oppression)'},
                  {value: 'pleuritique', label: 'Pleuritique (inspiration)'},
                  {value: 'perforation', label: 'Perforation'}
                ]} />
              </div>
            )}
          </div>
          
          {/* Autres symptômes */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <CheckboxField label="Wheezing (sifflements)" checked={consultation.wheezing} onChange={(c) => setConsultation({...consultation, wheezing: c})} />
            <CheckboxField label="Hémoptysie" checked={consultation.hemoptysie} onChange={(c) => setConsultation({...consultation, hemoptysie: c})} />
            <CheckboxField label="Fatigue" checked={consultation.fatigue} onChange={(c) => setConsultation({...consultation, fatigue: c})} />
            <CheckboxField label="Perte de poids" checked={consultation.pertePoids} onChange={(c) => setConsultation({...consultation, pertePoids: c})} />
            <CheckboxField label="Sueurs nocturnes" checked={consultation.sueursNocturnes} onChange={(c) => setConsultation({...consultation, sueursNocturnes: c})} />
            <CheckboxField label="Courbatures" checked={consultation.courbatures} onChange={(c) => setConsultation({...consultation, courbatures: c})} />
            <CheckboxField label="Maux de tête" checked={consultation.mauxDeTete} onChange={(c) => setConsultation({...consultation, mauxDeTete: c})} />
            <CheckboxField label="Rhinorrhée" checked={consultation.rhinorrhee} onChange={(c) => setConsultation({...consultation, rhinorrhee: c})} />
          </div>
        </div>
      </FormCard>
      
      <FormCard title="Examen clinique" icon={<Stethoscope className="w-4 h-4" />}>
        <TextAreaField label="Auscultation pulmonaire" value={consultation.auscultation} onChange={(e) => setConsultation({...consultation, auscultation: e.target.value})} placeholder="Crépitants, sibilances, râles, MV..." rows={2} />
        <div className="grid grid-cols-3 gap-2 mt-3">
          <CheckboxField label="Crépitants" checked={consultation.crepitants} onChange={(c) => setConsultation({...consultation, crepitants: c})} />
          <CheckboxField label="Sibilants" checked={consultation.sibilants} onChange={(c) => setConsultation({...consultation, sibilants: c})} />
          <CheckboxField label="Ronchi" checked={consultation.ronchi} onChange={(c) => setConsultation({...consultation, ronchi: c})} />
        </div>
      </FormCard>
      
      <div key="settings-content" className="flex justify-between">
        <button onClick={handlePrev} className="px-5 py-2.5 border rounded-lg text-sm">← Retour</button>
        <button onClick={runAIAnalysis} disabled={isAnalyzing} className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          {isAnalyzing ? 'Analyse en cours...' : 'Lancer l\'analyse IA'}
        </button>
      </div>
    </div>
  );
  
  // Étape 4: Diagnostic IA et Prescription
  const renderStepDiagnostic = () => (
    <div className="space-y-4">
      {/* Bannière risque */}
      <div className={`bg-linear-to-r from-${getRiskColor(aiResult.riskLevel)}-500 to-${getRiskColor(aiResult.riskLevel)}-600 rounded-xl p-4 text-white`}>
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          <div>
            <h2 className="text-base font-bold">Analyse IA - Résultats</h2>
            <p className="text-xs opacity-90">{getRiskText(aiResult.riskLevel)}</p>
          </div>
        </div>
      </div>
      
      {/* Diagnostic principal et différentiels */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[var(--sf)] rounded-xl border border-(--ln) p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-(--t1)"><Target className="w-4 h-4 text-blue-600" /> Diagnostic principal</h3>
          <div className="text-center p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-xl font-bold text-blue-700">{aiResult.principal || 'En attente'}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full text-xs">
              <Brain className="w-3 h-3" /> Confiance: {aiResult.confidence}%
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1.5 bg-(--sf2) rounded-full">
              <div className={`h-full bg-${getRiskColor(aiResult.riskLevel)}-500 rounded-full`} style={{ width: `${aiResult.confidence}%` }} />
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--sf)] rounded-xl border border-(--ln) p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-(--t1)"><LineChart className="w-4 h-4 text-emerald-600" /> Diagnostics différentiels</h3>
          {aiResult.differentials.map((d, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between text-xs mb-0.5">
                <span>{d.name}</span>
                <span className="font-bold text-blue-600">{d.score}%</span>
              </div>
              <div className="h-1 bg-(--sf2) rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${d.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Critères validés */}
      {aiResult.criteria.length > 0 && (
        <div className="bg-[var(--sf)] rounded-xl border border-(--ln) p-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2 text-(--t1)"><CheckCircle className="w-4 h-4 text-emerald-600" /> Critères validés ({aiResult.criteria.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {aiResult.criteria.map((c, i) => (
              <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs">{c}</span>
            ))}
          </div>
        </div>
      )}
      
      {/* Examens recommandés */}
      {aiResult.examensRecommandes.length > 0 && (
        <div className="bg-[var(--sf)] rounded-xl border border-(--ln) p-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2 text-(--t1)"><Microscope className="w-4 h-4 text-purple-600" /> Examens recommandés</h3>
          <div className="flex flex-wrap gap-1.5">
            {aiResult.examensRecommandes.map((e, i) => (
              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{e}</span>
            ))}
          </div>
        </div>
      )}
      
      {/* Recommandations */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-4 dark:from-blue-500/10 dark:to-blue-500/5">
        <h3 className="font-bold text-sm text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> Recommandations</h3>
        <div className="space-y-1.5">
          {aiResult.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-1.5 p-1.5 bg-[var(--sf)] rounded-lg text-xs">
              <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-(--t2)">{rec}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Prescription médicale */}
      <FormCard title="Prescription médicale" icon={<Pill className="w-4 h-4" />}>
        <TextAreaField label="Médicaments" value={prescription.medicaments} onChange={(e) => setPrescription({...prescription, medicaments: e.target.value})} placeholder="Amoxicilline 1g × 3/j pendant 7 jours" rows={3} />
        <TextAreaField label="Conseils à domicile" value={prescription.conseilsMaison} onChange={(e) => setPrescription({...prescription, conseilsMaison: e.target.value})} placeholder="Hydratation, repos, kinésithérapie..." rows={2} />
        <TextAreaField label="Recommandations" value={prescription.recommandations} onChange={(e) => setPrescription({...prescription, recommandations: e.target.value})} placeholder="Consultation de contrôle, surveillance..." rows={2} />
        
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <CheckboxField label="Arrêt de travail" checked={prescription.arretTravail} onChange={(c) => setPrescription({...prescription, arretTravail: c})} />
            {prescription.arretTravail && <InputField label="Durée (jours)" type="number" value={prescription.dureeArret} onChange={(e) => setPrescription({...prescription, dureeArret: e.target.value})} className="mt-2" />}
          </div>
          <div>
            <CheckboxField label="Hospitalisation" checked={prescription.hospitalisation} onChange={(c) => setPrescription({...prescription, hospitalisation: c})} />
            {prescription.hospitalisation && <InputField label="Motif" value={prescription.motifHospitalisation} onChange={(e) => setPrescription({...prescription, motifHospitalisation: e.target.value})} className="mt-2" />}
          </div>
        </div>
        
        <SelectField label="Suivi" value={prescription.suivi} onChange={(e) => setPrescription({...prescription, suivi: e.target.value})} options={[
          {value: '7 jours', label: '7 jours'}, {value: '15 jours', label: '15 jours'},
          {value: '1 mois', label: '1 mois'}, {value: '3 mois', label: '3 mois'}
        ]} />
        
        <TextAreaField label="Observations du médecin" value={prescription.observations} onChange={(e) => setPrescription({...prescription, observations: e.target.value})} placeholder="Notes complémentaires, contexte particulier..." rows={2} />
        
        <div className="mt-3 pt-3 border-t border-(--ln)">
          <div className="flex items-start gap-3">
            <input type="checkbox" id="shareCase" checked={prescription.partageCommunaute} onChange={(e) => setPrescription({...prescription, partageCommunaute: e.target.checked})} className="mt-0.5" />
            <div>
              <label htmlFor="shareCase" className="text-sm font-medium text-(--t2) cursor-pointer">Partager ce cas avec la communauté médicale</label>
              <p className="text-xs text-(--t4)">Les données personnelles seront anonymisées (nom, date, lieu). Ce cas aidera à former l'IA pour les générations futures.</p>
            </div>
          </div>
          {prescription.partageCommunaute && (
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg">
              <Lock className="w-3 h-3" />
              <span>Anonymisation active - Seuls les symptômes et le diagnostic seront partagés</span>
            </div>
          )}
        </div>
      </FormCard>
      
      <div className="flex justify-between">
        <button onClick={handlePrev} className="px-5 py-2.5 border rounded-lg text-sm">← Retour</button>
        <button onClick={handleFinish} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Terminer la consultation
        </button>
      </div>
    </div>
  );
  
  // Rendu principal
  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <StepIndicator currentStep={currentStep} steps={steps} patientInfo={{
        nom: patientInfo.nom, prenom: patientInfo.prenom, civilite: patientInfo.civilite,
        age: calculateAge(), telephone: patientInfo.telephone, adresse: patientInfo.adresse,
        profession: patientInfo.profession, religion: patientInfo.religion
      }} />
      
      {currentStep === 1 && renderStepPatient()}
      {currentStep === 2 && renderStepAntecedents()}
      {currentStep === 3 && renderStepSymptomes()}
      {currentStep === 4 && renderStepDiagnostic()}
      
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
