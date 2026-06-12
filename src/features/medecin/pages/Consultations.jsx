// src/features/medecin/pages/Consultation.jsx
import { useState, useEffect } from 'react';

import {
  creerPatient, creerConsultation,
  sauvegarderAntecedents, sauvegarderSymptomes,
  sauvegarderOpinion, lancerDiagnostic,
  envoyerFeedback, rechercherPatient,
} from '../services/api';

import {
  UserPlus, Stethoscope, CheckCircle, AlertCircle,
  Brain, Pill, Activity, ClipboardList, AlertTriangle, Info, Zap, Target, LineChart,
  Search, X, XCircle, Circle, User, Phone, Calendar as CalendarIcon,
  Briefcase, Loader2, Globe, MapPin, Unlock, Users, FileText,
  TrendingUp, Award, Sparkles, Eye, MessageSquare, Clock, Heart, Droplet,
  Thermometer, Wind, HeartPulse, Syringe, Microscope, Hospital, WifiOff, Lock
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sauvegarderAction, isNetworkError, genLocalId, synchroniserAvecServeur } from '../../../services/offlineManager';

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
      {type === 'error'   && <AlertCircle  className="w-5 h-5" />}
      {type === 'info'    && <Info         className="w-5 h-5" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-3 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </motion.div>
  );
};

const StepIndicator = ({ currentStep, steps, patientInfo }) => (
  <div className="mb-8">
    {patientInfo.nom && (
      <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
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
        const isActive    = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        return (
          <div key={step.number} className="flex-1 relative">
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                ${isCompleted ? 'bg-emerald-600 text-white shadow-md' :
                  isActive    ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100' :
                                'bg-(--sf2) text-(--t4) border-2 border-(--ln)'}
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
    <div className="p-5">{children}</div>
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
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
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
      data-gramm="false"
      data-gramm_editor="false"
      data-enable-grammarly="false"
      className="w-full px-3 py-2 text-sm border border-(--ln) bg-(--sf) text-(--t1) placeholder:text-(--t4) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
    />
  </div>
);

// ==================== PAGE PRINCIPALE ====================
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('pneumoia_token')
             || localStorage.getItem('access_token')
             || localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `Erreur ${res.status}` }));
    throw new Error(err.detail || `Erreur ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};


export default function Consultation() {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();

  const isAide    = localStorage.getItem('role') === 'aide_soignant';
  const aidePerms = (() => { try { return JSON.parse(localStorage.getItem('aide_permissions') || '{}'); } catch { return {}; } })();
  const maxStep   = isAide
    ? (aidePerms.peut_voir_diagnostic ? 4 : aidePerms.peut_saisir_symptomes ? 3 : 1)
    : 4;
  const aideRetour = '/aide/patients';

  const [currentStep, setCurrentStep] = useState(1);
  const [toast, setToast]             = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSearch, setShowSearch]   = useState(false);
  const [searchTerm, setSearchTerm]   = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [patientId, setPatientId]           = useState(null);
  const [consultationId, setConsultationId] = useState(null);
  const [diagnosticIaId, setDiagnosticIaId] = useState(null);
  const [isSaving, setIsSaving]             = useState(false);


  const [patientLocalId,      setPatientLocalId]      = useState(null);
  const [consultationLocalId, setConsultationLocalId] = useState(null);
  const [modeOffline,         setModeOffline]         = useState(false);

  // ==================== ÉTAPE 1: PATIENT ====================
  const [patientInfo, setPatientInfo] = useState({
    civilite: '', nom: '', prenom: '', dateNaissance: '', telephone: '', email: '',
    adresse: '', profession: '', religion: '', groupeSanguin: '',
    personneAContacter: '', telephoneUrgence: ''
  });

  const calculateAge = () => {
    if (!patientInfo.dateNaissance) return '';
    const birthDate = new Date(patientInfo.dateNaissance);
    const diff      = Date.now() - birthDate.getTime();
    const ageDate   = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970) + ' ans';
  };

  // ==================== ÉTAPE 2: ANTÉCÉDENTS MÉDICAUX ====================
  const [antecedents, setAntecedents] = useState({
    diabete: false, hypertension: false, asthme: false, bpco: false,
    insuffisanceCardiaque: false, insuffisanceRenale: false,
    hepatite: false, cirrhose: false, epilepsie: false,
    tuberculose: false, vih: false, typhoide: false, paludisme: false,
    covid19: false, hepatiteB: false, hepatiteC: false,
    cancerPoumon: false, cancerSein: false, cancerColon: false,
    anemie: false, hemophilie: false, lupus: false,
    traitementEnCours: '', allergieMedicaments: '',
    tabagisme: 'non-fumeur', cigarettesParJour: 0, dureeTabagisme: 0,
    alcool: false, toxicomanie: false,
    professionRisque: false, expositionProfessionnelle: ''
  });

  // ==================== ÉTAPE 3: CONSULTATION ACTUELLE ====================
  const [consultation, setConsultation] = useState({
    motif: '', debutSymptomes: '', evolution: '', traitementDejaPris: '',
    temperature: '', saturationO2: '', frequenceCardiaque: '', frequenceRespiratoire: '',
    fvc:       '',
    fec1:      '',
    peakFlow:  '',
    abg_po2_anormal:  false,
    abg_co2_anormal:  false,
    abg_ph_anormal:   false,
    tensionSystolique: '', tensionDiastolique: '',
    fievre: false, fievreTemperature: '', fievreDuree: '',
    toux: false, touxType: 'seche', touxProductive: false, touxCouleur: '', touxSang: false,
    dyspnee: false, dyspneeStade: 1, dyspneeRepos: false, dyspneeEffort: false,
    douleurThoracique: false, douleurType: 'angineux',
    expectorations: false, expectorationsCouleur: '',
    wheezing: false, hemoptysie: false, cyanose: false, fatigue: false,
    pertePoids: false, sueursNocturnes: false, anorexie: false,
    mauxDeTete: false, courbatures: false, rhinorrhee: false,
    auscultation: '', crepitants: false, sibilants: false, ronchi: false,
    radiographie: false, scanner: false, priseDeSang: false,
    gazDuSang: false, efr: false, rechercheBK: false
  });

  // ==================== RÉSULTATS IA ====================
  const [aiResult, setAiResult] = useState({
    principal: '', confidence: 0,
    differentials: [],
    riskLevel: 'low',
    typeConsultation: '',
    recommendations: [], criteria: [], examensRecommandes: [], alertes: [],
    donneesManquantes: [], messagePrecision: null,
  });

  // ==================== PRESCRIPTION ====================
  const [prescription, setPrescription] = useState({
    medicaments: '', conseilsMaison: '', recommandations: '',
    arretTravail: false, dureeArret: '7', hospitalisation: false,
    motifHospitalisation: '', suivi: '7 jours', observations: '',

    diagnosticFinal: '', diagnosticAutre: '', concordanceIA: null,
  });

  const steps = [
    { number: 1, label: 'Patient' },
    { number: 2, label: 'Antécédents' },
    { number: 3, label: 'Symptômes' },
    { number: 4, label: 'Diagnostic & Traitement' }
  ].filter(s => s.number <= maxStep);

  const addToast = (message, type) => setToast({ message, type });

  // Reprendre une consultation existante via ?consultation_id=XXX (médecin continue après aide)
  useEffect(() => {
    const cid = searchParams.get('consultation_id');
    const pid = searchParams.get('patient_id');
    if (!cid || isAide) return;
    (async () => {
      try {
        const c = await apiFetch(`/consultations/${cid}`);
        if (!c) return;
        setConsultationId(c.id);
        if (pid) setPatientId(pid);

        // Charger infos patient
        if (c.patient) {
          const p = c.patient;
          setPatientInfo(prev => ({
            ...prev,
            civilite:           p.civilite      || '',
            nom:                p.nom           || '',
            prenom:             p.prenom        || '',
            dateNaissance:      p.date_naissance || '',
            groupeSanguin:      p.groupe_sanguin || '',
            telephone:          p.telephone     || '',
            email:              p.email         || '',
            adresse:            p.adresse       || '',
            profession:         p.profession    || '',
            religion:           p.religion      || '',
            personneAContacter: p.personne_a_contacter || '',
            telephoneUrgence:   p.telephone_urgence    || '',
          }));
        }

        // Charger antécédents s'ils existent
        const ant = c.antecedents || {};
        if (Object.keys(ant).length > 0) {
          setAntecedents(prev => ({
            ...prev,
            diabete:              ant.diabete              || false,
            hypertension:         ant.hypertension         || false,
            asthme:               ant.asthme               || false,
            bpco:                 ant.bpco                 || false,
            tuberculose:          ant.tuberculose           || false,
            vih:                  ant.vih                  || false,
            typhoide:             ant.typhoide             || false,
            paludisme:            ant.paludisme            || false,
            covid19:              ant.covid19              || false,
            hepatiteB:            ant.hepatite_b           || false,
            hepatiteC:            ant.hepatite_c           || false,
            cancerPoumon:         ant.cancer_poumon        || false,
            traitementEnCours:    ant.traitement_en_cours  || '',
            allergieMedicaments:  ant.allergie_medicaments || '',
            tabagisme:            ant.tabagisme            || 'non-fumeur',
            cigarettesParJour:    ant.cigarettes_par_jour  || 0,
            dureeTabagisme:       ant.duree_tabagisme      || 0,
            alcool:               ant.alcool               || false,
            professionRisque:     ant.profession_risque    || false,
            expositionProfessionnelle: ant.exposition_professionnelle || '',
          }));
        }

        // Charger symptômes s'ils existent
        const sym = c.symptomes || {};
        if (Object.keys(sym).length > 0) {
          setConsultation(prev => ({
            ...prev,
            motif:                sym.motif                || '',
            debutSymptomes:       sym.debut_symptomes      || '',
            evolution:            sym.evolution            || '',
            traitementDejaPris:   sym.traitement_deja_pris || '',
            temperature:          sym.temperature          != null ? String(sym.temperature) : '',
            saturationO2:         sym.saturation_o2        != null ? String(sym.saturation_o2) : '',
            frequenceCardiaque:   sym.frequence_cardiaque  != null ? String(sym.frequence_cardiaque) : '',
            frequenceRespiratoire:sym.frequence_respiratoire != null ? String(sym.frequence_respiratoire) : '',
            tensionSystolique:    sym.tension_systolique   != null ? String(sym.tension_systolique) : '',
            tensionDiastolique:   sym.tension_diastolique  != null ? String(sym.tension_diastolique) : '',
            fvc:                  sym.fvc                  != null ? String(sym.fvc) : '',
            fec1:                 sym.fec1                 != null ? String(sym.fec1) : '',
            peakFlow:             sym.peak_flow            != null ? String(sym.peak_flow) : '',
            fievre:               sym.fievre               || false,
            fievreTemperature:    sym.fievre_temperature   != null ? String(sym.fievre_temperature) : '',
            fievreDuree:          sym.fievre_duree         || '',
            toux:                 sym.toux                 || false,
            touxType:             sym.toux_type            || 'seche',
            touxSang:             sym.toux_sang            || false,
            dyspnee:              sym.dyspnee              || false,
            dyspneeStade:         sym.dyspnee_stade        || 1,
            dyspneeRepos:         sym.dyspnee_repos        || false,
            dyspneeEffort:        sym.dyspnee_effort       || false,
            douleurThoracique:    sym.douleur_thoracique   || false,
            douleurType:          sym.douleur_type         || 'angineux',
            wheezing:             sym.wheezing             || false,
            hemoptysie:           sym.hemoptysie           || false,
            fatigue:              sym.fatigue              || false,
            pertePoids:           sym.perte_poids          || false,
            sueursNocturnes:      sym.sueurs_nocturnes     || false,
            courbatures:          sym.courbatures          || false,
            mauxDeTete:           sym.maux_de_tete         || false,
            rhinorrhee:           sym.rhinorrhee           || false,
            crepitants:           sym.crepitants           || false,
            sibilants:            sym.sibilants            || false,
            scanner:              sym.scanner              || false,
            abg_po2_anormal:      sym.abg_po2_anormal      || false,
            abg_co2_anormal:      sym.abg_co2_anormal      || false,
            abg_ph_anormal:       sym.abg_ph_anormal       || false,
          }));
        }

        // Déterminer l'étape de reprise
        const hasSymptomes   = Object.keys(sym).length > 0;
        const hasAntecedents = Object.keys(ant).length > 0;
        const stepToGo = hasSymptomes ? 3 : hasAntecedents ? 3 : 2;
        setCurrentStep(stepToGo);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        // Consultation introuvable ou accès refusé — démarrer normalement
        const pid2 = searchParams.get('patient_id');
        if (pid2) setPatientId(pid2);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pré-charger un patient existant depuis ?patient_id=XXX (aide soignant)
  useEffect(() => {
    const pid = searchParams.get('patient_id');
    if (!pid || !isAide) return;
    (async () => {
      try {
        const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const token = localStorage.getItem('pneumoia_token') || localStorage.getItem('access_token') || localStorage.getItem('token');
        const res = await fetch(`${BASE}/aides/patients/${pid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const p = await res.json();
        setPatientId(p.id);
        setPatientInfo(prev => ({
          ...prev,
          civilite: p.civilite || '',
          nom: p.nom || '',
          prenom: p.prenom || '',
          dateNaissance: p.date_naissance || '',
          groupeSanguin: p.groupe_sanguin || '',
          telephone: p.telephone || '',
          email: p.email || '',
          adresse: p.adresse || '',
          profession: p.profession || '',
          religion: p.religion || '',
          personneAContacter: p.personne_a_contacter || '',
          telephoneUrgence: p.telephone_urgence || '',
        }));
        if (maxStep > 1) {
          // Créer la consultation côté serveur
          const BASE2 = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
          const consultPath = isAide ? '/aides/consultations' : '/consultations';
          const cRes = await fetch(`${BASE2}${consultPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ patient_id: p.id }),
          });
          if (cRes.ok) {
            const cons = await cRes.json();
            setConsultationId(cons.id);
          }
          setCurrentStep(2);
        }
      } catch { /* silently ignore */ }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pré-charger un patient existant depuis ?patient_id=XXX (médecin, sans consultation_id)
  useEffect(() => {
    const pid = searchParams.get('patient_id');
    const cid = searchParams.get('consultation_id');
    if (!pid || isAide || cid) return; // géré ailleurs si cid existe ou si c'est une aide
    (async () => {
      try {
        const p = await apiFetch(`/patients/${pid}`);
        setPatientId(p.id);
        setPatientInfo(prev => ({
          ...prev,
          civilite:           p.civilite      || '',
          nom:                p.nom           || '',
          prenom:             p.prenom        || '',
          dateNaissance:      p.date_naissance || '',
          groupeSanguin:      p.groupe_sanguin || '',
          telephone:          p.telephone     || '',
          email:              p.email         || '',
          adresse:            p.adresse       || '',
          profession:         p.profession    || '',
          religion:           p.religion      || '',
          personneAContacter: p.personne_a_contacter || '',
          telephoneUrgence:   p.telephone_urgence    || '',
        }));
      } catch { /* silently ignore */ }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isTemoinJehovah = patientInfo.religion === 'temoin_jehovah';

  useEffect(() => {
    const handleOnline = async () => {
      addToast('Connexion rétablie — synchronisation en cours...', 'info');
      await synchroniserAvecServeur();
      addToast('Données synchronisées avec le serveur !', 'success');
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // ==================== FONCTIONS DE NAVIGATION ====================
 // ============================================================
// REMPLACER entièrement la fonction createAndContinue()
// dans Consultation.jsx
// ============================================================

const createAndContinue = async () => {
  if (!patientInfo.nom || !patientInfo.prenom) {
    addToast('Veuillez remplir au moins le nom et prénom', 'warning');
    return;
  }
  setIsSaving(true);

  const patientData = {
    civilite:             patientInfo.civilite,
    nom:                  patientInfo.nom,
    prenom:               patientInfo.prenom,
    date_naissance:       patientInfo.dateNaissance || null,
    groupe_sanguin:       patientInfo.groupeSanguin || null,
    religion:             patientInfo.religion      || null,
    telephone:            patientInfo.telephone     || null,
    email:                patientInfo.email         || null,
    adresse:              patientInfo.adresse       || null,
    profession:           patientInfo.profession    || null,
    personne_a_contacter: patientInfo.personneAContacter || null,
    telephone_urgence:    patientInfo.telephoneUrgence   || null,
    allergies:   [],
    antecedents: {},
  };

  try {
    // ── CAS 1 : Patient déjà créé → UPDATE uniquement, pas de nouvelle consultation ──
    if (patientId) {
      // Si c'est un ID local (offline), on met à jour l'action en attente
      if (String(patientId).startsWith('local-')) {
        await sauvegarderAction('UPDATE_PATIENT', {
          local_id: patientId,
          data: patientData,
        });
        addToast('Informations patient mises à jour (mode hors ligne)', 'success');
      } else {
        // ID serveur réel → PATCH direct
        await apiFetch(`/patients/${patientId}`, {
          method: 'PATCH',
          body: JSON.stringify(patientData),
        });
        addToast('Informations patient mises à jour', 'success');
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSaving(false);
      return;
    }

    // ── CAS 2 : Nouveau patient → POST + création consultation ──
    const patientEndpoint = isAide ? '/aides/patients' : '/patients';
    const patient = await apiFetch(patientEndpoint, {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
    setPatientId(patient.id);

    if (isAide && maxStep === 1) {
      addToast(`Patient ${patient.prenom} ${patient.nom} créé`, 'success');
      setTimeout(() => navigate(aideRetour), 1500);
      setIsSaving(false);
      return;
    }

    const consultEndpoint = isAide ? '/aides/consultations' : '/consultations';
    const cons = await apiFetch(consultEndpoint, {
      method: 'POST',
      body: JSON.stringify({ patient_id: patient.id }),
    });
    setConsultationId(cons.id);
    setModeOffline(false);
    addToast(`Patient ${patient.prenom} ${patient.nom} créé`, 'success');

  } catch (err) {
    if (!isNetworkError(err)) {
      addToast(err.message, 'error');
      setIsSaving(false);
      return;
    }

    // ── Mode offline ──
    setModeOffline(true);

    if (patientId) {
      // Patient existe déjà en local → juste mettre à jour
      await sauvegarderAction('UPDATE_PATIENT', {
        local_id: patientId,
        data: patientData,
      });
      addToast('Informations patient mises à jour (hors ligne)', 'warning');
    } else {
      // Nouveau patient offline
      const pLocalId = genLocalId();
      const cLocalId = genLocalId();
      await sauvegarderAction('CREATE_PATIENT',      { local_id: pLocalId, data: patientData });
      await sauvegarderAction('CREATE_CONSULTATION', {
        local_id:         cLocalId,
        patient_local_id: pLocalId,
        patient_id:       null,
      });
      setPatientId(pLocalId);
      setConsultationId(cLocalId);
      setPatientLocalId(pLocalId);
      setConsultationLocalId(cLocalId);
      addToast('Mode hors ligne — données sauvegardées localement', 'warning');
    }
  }

  setCurrentStep(2);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setIsSaving(false);
};
  const selectAndContinue = async (patientData) => {
    // Mapper les champs snake_case → camelCase si nécessaire
    setPatientId(patientData.id || null);
    setPatientInfo({
      civilite:           patientData.civilite            || patientData.civilite        || '',
      nom:                patientData.nom                 || '',
      prenom:             patientData.prenom              || '',
      dateNaissance:      patientData.dateNaissance       || patientData.date_naissance  || '',
      groupeSanguin:      patientData.groupeSanguin       || patientData.groupe_sanguin  || '',
      telephone:          patientData.telephone           || '',
      email:              patientData.email               || '',
      adresse:            patientData.adresse             || '',
      profession:         patientData.profession          || '',
      religion:           patientData.religion            || '',
      personneAContacter: patientData.personneAContacter  || patientData.personne_a_contacter || '',
      telephoneUrgence:   patientData.telephoneUrgence    || patientData.telephone_urgence    || '',
    });
    setShowSearch(false);
    addToast(`Patient ${patientData.nom} ${patientData.prenom} sélectionné`, 'success');
    if (isAide && maxStep === 1) {
      navigate(aideRetour);
      return;
    }
    // Créer la consultation pour ce patient existant
    if (patientData.id) {
      try {
        const consultEndpoint = isAide ? '/aides/consultations' : '/consultations';
        const cons = await apiFetch(consultEndpoint, {
          method: 'POST',
          body: JSON.stringify({ patient_id: patientData.id }),
        });
        setConsultationId(cons.id);
      } catch { /* patient sera créé/lié au step 1 */ }
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAntecedents = async () => {
    setIsSaving(true);

    const antecedentsData = {
      diabete:       antecedents.diabete,
      hypertension:  antecedents.hypertension,
      asthme:        antecedents.asthme,
      bpco:          antecedents.bpco,
      tuberculose:   antecedents.tuberculose,
      vih:           antecedents.vih,
      typhoide:      antecedents.typhoide,
      paludisme:     antecedents.paludisme,
      covid19:       antecedents.covid19,
      hepatite_b:    antecedents.hepatiteB,
      hepatite_c:    antecedents.hepatiteC,
      cancer_poumon: antecedents.cancerPoumon,
      traitement_en_cours:        antecedents.traitementEnCours,
      allergie_medicaments:       antecedents.allergieMedicaments,
      tabagisme:                  antecedents.tabagisme,
      cigarettes_par_jour:        antecedents.cigarettesParJour,
      duree_tabagisme:            antecedents.dureeTabagisme,
      alcool:                     antecedents.alcool,
      profession_risque:          antecedents.professionRisque,
      exposition_professionnelle: antecedents.expositionProfessionnelle,
    };

    try {
      if (modeOffline) throw new Error('offline');
      const antPath = isAide ? `/aides/consultations/${consultationId}/antecedents` : `/consultations/${consultationId}/antecedents`;
      await apiFetch(antPath, {
        method: 'PATCH',
        body: JSON.stringify(antecedentsData),
      });
    } catch (err) {
      if (isNetworkError(err) || err.message === 'offline') {
        setModeOffline(true);
        await sauvegarderAction('SAVE_ANTECEDENTS', {
          consultation_local_id: consultationLocalId || consultationId,
          consultation_id:       consultationId,
          data: antecedentsData,
        });
      } else {
        addToast(err.message, 'error');
        setIsSaving(false);
        return;
      }
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSaving(false);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = async () => {
    // L'aide soignant ne peut pas donner d'avis médical — juste terminer et retourner
    if (isAide) {
      addToast('Consultation enregistrée avec succès !', 'success');
      setTimeout(() => navigate(aideRetour), 1500);
      return;
    }

    setIsSaving(true);

    const diagnosticRetenu = prescription.diagnosticFinal === 'autre'
      ? prescription.diagnosticAutre
      : prescription.diagnosticFinal;

    let recommandationsFinales = prescription.recommandations;
    if (diagnosticRetenu && diagnosticRetenu !== aiResult.principal) {
      const diff = aiResult.differentials.find(d => d.name === diagnosticRetenu);
      if (diff?.recommandations?.length > 0) {
        recommandationsFinales = diff.recommandations.join('\n');
      }
    }

    const opinionData = {
      diagnostic_ia_id:      diagnosticIaId,
      medicaments:           prescription.medicaments,
      conseils_maison:       prescription.conseilsMaison,
      recommandations:       recommandationsFinales,
      arret_travail:         prescription.arretTravail,
      duree_arret:           prescription.arretTravail ? parseInt(prescription.dureeArret) : null,
      hospitalisation:       prescription.hospitalisation,
      motif_hospitalisation: prescription.motifHospitalisation || null,
      suivi:                 prescription.suivi,
      observations:          prescription.observations,
    };

    try {
      if (modeOffline) throw new Error('offline');

      await sauvegarderOpinion(consultationId, opinionData);

      if (diagnosticIaId && prescription.diagnosticFinal) {
        await envoyerFeedback(diagnosticIaId, {
          diagnostic_final: diagnosticRetenu,
          concordance:      prescription.concordanceIA,
          commentaire:      prescription.observations,
        });
      }

      addToast('Consultation enregistrée avec succès !', 'success');
      setTimeout(() => navigate(isAide ? aideRetour : '/medecin/dashboard'), 2000);
    } catch (err) {
      if (isNetworkError(err) || err.message === 'offline') {
        setModeOffline(true);

        await sauvegarderAction('SAVE_OPINION', {
          consultation_local_id: consultationLocalId,
          consultation_id:       consultationId,
          data: opinionData,
        });

        // ── NOUVEAU : sauvegarder le feedback (concordance médecin) ──
        if (diagnosticIaId && prescription.diagnosticFinal) {
          const diagnosticRetenu = prescription.diagnosticFinal === 'autre'
            ? prescription.diagnosticAutre
            : prescription.diagnosticFinal;

          await sauvegarderAction('SAVE_FEEDBACK', {
            local_diagnostic_id: diagnosticIaId, // "offline-xxxxx" ou vrai UUID
            diagnostic_id:       String(diagnosticIaId).startsWith('offline-') ? null : diagnosticIaId,
            data: {
              diagnostic_final: diagnosticRetenu,
              concordance:      prescription.concordanceIA,
              commentaire:      prescription.observations,
            },
          });
        }

        addToast('Consultation sauvegardée localement — sera synchronisée à la reconnexion', 'warning');
        setTimeout(() => navigate(isAide ? aideRetour : '/medecin/dashboard'), 2000);
      } else {
        addToast(err.message, 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Recherche patient — appel API réel
  const handleSearchPatient = async () => {
    if (searchTerm.length < 2) {
      addToast('Veuillez entrer au moins 2 caractères', 'warning');
      return;
    }
    try {
      const endpoint = isAide
        ? `/aides/patients`
        : `/patients/search?q=${encodeURIComponent(searchTerm)}`;
      const results = await apiFetch(endpoint);
      const list = Array.isArray(results) ? results : [];
      const filtered = isAide
        ? list.filter(p =>
            p.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.telephone?.includes(searchTerm)
          )
        : list;
      setSearchResults(filtered.map(p => ({
        id:            p.id,
        nom:           p.nom,
        prenom:        p.prenom,
        dateNaissance: p.date_naissance,
        telephone:     p.telephone,
        adresse:       p.adresse,
        profession:    p.profession,
        religion:      p.religion,
        groupeSanguin: p.groupe_sanguin,
        personneAContacter: p.personne_a_contacter,
        telephoneUrgence:   p.telephone_urgence,
      })));
      if (!filtered.length) addToast('Aucun patient trouvé', 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // ==================== IA - DIAGNOSTIC BASÉ SUR LE DATASET ====================
  const runAIAnalysis = async () => {
    // ── Validation des champs obligatoires ──
    const missingFields = [];
    if (!consultation.saturationO2 || consultation.saturationO2 === '')
      missingFields.push('Saturation O₂ (SpO₂)');
    if (!consultation.frequenceCardiaque || consultation.frequenceCardiaque === '')
      missingFields.push('Fréquence cardiaque (FC)');
    if (!consultation.tensionSystolique || consultation.tensionSystolique === '')
      missingFields.push('Tension artérielle systolique');
    if (!consultation.tensionDiastolique || consultation.tensionDiastolique === '')
      missingFields.push('Tension artérielle diastolique');

    const hasSymptome = consultation.toux || consultation.dyspnee ||
      consultation.douleurThoracique || consultation.wheezing ||
      consultation.hemoptysie || consultation.fatigue ||
      consultation.fievre || consultation.motif;

    if (!hasSymptome)
      missingFields.push('Au moins un symptôme ou motif de consultation');

    if (missingFields.length > 0) {
      addToast(
        `Champs requis manquants : ${missingFields.join(', ')}`,
        'error'
      );
      return;
    }

    const spo2     = parseFloat(consultation.saturationO2) || 97;
    const fvc      = consultation.fvc      && consultation.fvc !== ''      ? parseFloat(consultation.fvc)      : null;
    const fec1     = consultation.fec1     && consultation.fec1 !== ''     ? parseFloat(consultation.fec1)     : null;
    const peakFlow = consultation.peakFlow && consultation.peakFlow !== '' ? parseFloat(consultation.peakFlow) : null;
    const ratio    = fvc && fec1 ? parseFloat((fec1 / fvc).toFixed(3)) : null;

    setIsAnalyzing(true);

    // ── Étape A : symptômes — offline-first ──────────────────
    const symptomesData = {
      motif:                  consultation.motif,
      debut_symptomes:        consultation.debutSymptomes,
      evolution:              consultation.evolution,
      traitement_deja_pris:   consultation.traitementDejaPris,
      temperature:            parseFloat(consultation.temperature)           || null,
      saturation_o2:          parseFloat(consultation.saturationO2)          || null,
      frequence_cardiaque:    parseFloat(consultation.frequenceCardiaque)    || null,
      frequence_respiratoire: parseFloat(consultation.frequenceRespiratoire) || null,
      tension_systolique:     parseFloat(consultation.tensionSystolique)     || null,
      tension_diastolique:    parseFloat(consultation.tensionDiastolique)    || null,
      fievre:             consultation.fievre,
      fievre_temperature: parseFloat(consultation.fievreTemperature) || null,
      fievre_duree:       consultation.fievreDuree,
      toux:               consultation.toux,
      toux_type:          consultation.touxType,
      toux_sang:          consultation.touxSang,
      toux_couleur:       consultation.touxCouleur,
      dyspnee:            consultation.dyspnee,
      dyspnee_stade:      consultation.dyspneeStade,
      dyspnee_repos:      consultation.dyspneeRepos,
      dyspnee_effort:     consultation.dyspneeEffort,
      douleur_thoracique: consultation.douleurThoracique,
      douleur_type:       consultation.douleurType,
      wheezing:           consultation.wheezing,
      hemoptysie:         consultation.hemoptysie,
      fatigue:            consultation.fatigue,
      perte_poids:        consultation.pertePoids,
      sueurs_nocturnes:   consultation.sueursNocturnes,
      courbatures:        consultation.courbatures,
      maux_de_tete:       consultation.mauxDeTete,
      rhinorrhee:         consultation.rhinorrhee,
      crepitants:         consultation.crepitants,
      sibilants:          consultation.sibilants,
      scanner:            consultation.scanner,
      efr:                consultation.efr,
      recherche_bk:       consultation.rechercheBK,
      fvc,
      fec1,
      peak_flow:          peakFlow,
      pefr_anormal:       consultation.pefr_anormal     || false,
      abg_po2_anormal:    consultation.abg_po2_anormal   || false,
      abg_co2_anormal:    consultation.abg_co2_anormal   || false,
      abg_ph_anormal:     consultation.abg_ph_anormal    || false,
    };

    try {
      if (modeOffline) throw new Error('offline');
      const sympPath = isAide ? `/aides/consultations/${consultationId}/symptomes` : `/consultations/${consultationId}/symptomes`;
      await apiFetch(sympPath, {
        method: 'PATCH',
        body: JSON.stringify(symptomesData),
      });
    } catch (symptomErr) {
      if (isNetworkError(symptomErr) || symptomErr.message === 'offline') {
        setModeOffline(true);
        await sauvegarderAction('SAVE_SYMPTOMES', {
          consultation_local_id: consultationLocalId || consultationId,
          consultation_id:       consultationId,
          data: symptomesData,
        });
      }
      // On continue vers le diagnostic dans tous les cas
    }

    // ── Aide soignant sans droit voir_diagnostic : enregistrer les symptômes et partir ──
    if (isAide && !aidePerms.peut_voir_diagnostic) {
      addToast('Symptômes enregistrés avec succès', 'success');
      setIsAnalyzing(false);
      setTimeout(() => navigate(aideRetour), 1500);
      return;
    }

    // ── Étape B : diagnostic avec bascule offline ─────────────
    let age = 50;
      if (patientInfo.dateNaissance) {
        const diff = Date.now() - new Date(patientInfo.dateNaissance).getTime();
        age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      }

      const DIAG_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '');
      const token    = localStorage.getItem('pneumoia_token')
                    || localStorage.getItem('access_token')
                    || localStorage.getItem('token');

      const diagPayload = {
        consultation_id: consultationId,
        age,
        gender:         patientInfo.civilite === 'M' ? 1 : 0,
        smoke:          antecedents.tabagisme === 'fumeur' ? 1 : 0,
        asthma:         antecedents.asthme ? 1 : 0,
        other_diseases: (antecedents.diabete || antecedents.hypertension || antecedents.vih) ? 1 : 0,
        religion:       patientInfo.religion || null,
        o2:             spo2 < 94 ? 1 : 0,
        scan:           consultation.scanner ? 1 : 0,
        pefr:           consultation.pefr_anormal ? 1 : 0,
        fvc,
        fec1,
        fev1_fvc_ratio: ratio,
        peak_flow:      peakFlow,
        abg_po2:        spo2 < 94 ? 1 : 0,
        abg_pco2:       consultation.abg_co2_anormal ? 1 : 0,
        abg_ph:         consultation.abg_ph_anormal  ? 1 : 0,
      };

      let result;
      try {
        const diagRes = await fetch(`${DIAG_URL}/api/v1/diagnostic/predict-and-save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(diagPayload),
          signal: AbortSignal.timeout(10000),
        });

        if (!diagRes.ok) {
          const err = await diagRes.json().catch(() => ({}));
          throw new Error(err.detail || 'Erreur modèle IA');
        }

        result = await diagRes.json();
      } catch (err) {
        if (!isNetworkError(err)) {
          addToast(`Erreur IA : ${err.message}`, 'error');
          setIsAnalyzing(false);
          return;
        }

        console.log('🔄 Diagnostic offline', err.message);
        try {
          const { diagnosticOffline } = await import('../../../services/offlineDiagnostic');
          result = await diagnosticOffline({
            age:            diagPayload.age,
            gender:         diagPayload.gender,
            smoke:          diagPayload.smoke,
            asthma:         diagPayload.asthma,
            other_diseases: diagPayload.other_diseases,
            o2:             diagPayload.o2,
            scan:           diagPayload.scan,
            pefr:           diagPayload.pefr,
            fvc:            diagPayload.fvc,
            fec1:           diagPayload.fec1,
            fev1_fvc_ratio: diagPayload.fev1_fvc_ratio,
            peak_flow:      diagPayload.peak_flow,
            abg_po2:        diagPayload.abg_po2,
            abg_pco2:       diagPayload.abg_pco2,
            abg_ph:         diagPayload.abg_ph,
          });

          // ── NOUVEAU : sauvegarder le diagnostic offline pour sync ──
          const localDiagId = result.diagnostic_id; // "offline-xxxxx"
          await sauvegarderAction('SAVE_DIAGNOSTIC', {
            consultation_local_id: consultationLocalId,
            consultation_id:       consultationId,
            local_diagnostic_id:   localDiagId,
            data: {
              // payload identique à ce qu'on envoie au serveur en ligne
              ...diagPayload,
              consultation_id: consultationId, // sera remplacé par le vrai ID à la sync
            },
          });

          addToast('Mode hors ligne — diagnostic local (sera synchronisé à la reconnexion)', 'warning');
        } catch {
          addToast('Mode hors ligne — modèles IA en cours de chargement, réessayez dans quelques secondes', 'warning');
          setIsAnalyzing(false);
          return;
        }
      }
      console.log('Résultat IA:', JSON.stringify(result, null, 2));

      setDiagnosticIaId(result.diagnostic_id || null);

      const principale = result.maladies?.[0] || {};
      setAiResult({
        principal:          principale.nom       || result.principal || 'Indéterminé',
        confidence:         principale.pct       || result.confidence || 0,
        etat:               principale.etat      || 'stable',
        differentials: (result.maladies || []).slice(1).map(m => ({
          name:             m.nom,
          score:            m.pct,
          criteres_valides: m.criteres_valides || [],
          recommandations:  m.recommandations  || [],
          examens_suggeres: m.examens_suggeres || [],
        })),
        riskLevel:          result.risque_eleve ? 'high' : (principale.pct || 0) > 50 ? 'medium' : 'low',
        recommendations:    result.recommandations          || [],
        criteria:           principale.criteres_valides     || [],
        examensRecommandes: result.examens_recommandes      || [],
        versionModele:      result.precision_modele         || '',
        typeConsultation:   result.type_consultation        || '',
        fiabiliteLabel:     result.fiabilite_label          || '',
        donneesManquantes:  result.donnees_manquantes       || [],
        messagePrecision:   result.message_precision        || null,
        alertes:            result.alertes                  || [],
      });

      setPrescription(prev => ({
        ...prev,
        recommandations: (result.recommandations || []).join('\n'),
      }));

      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsAnalyzing(false);
  };


  const getRiskColor = (level) => {
    const colors = { low: 'emerald', medium: 'amber', high: 'red' };
    return colors[level] || 'slate';
  };

  const getRiskText = (level) => {
    const texts = {
      low:    'Risque faible — Suivi ambulatoire possible',
      medium: 'Risque modéré — Surveillance rapprochée nécessaire',
      high:   'Risque élevé — Hospitalisation recommandée'
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
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Patient Témoin de Jéhovah</p>
                <p className="text-[10px] text-amber-700 dark:text-amber-300">Ne peut pas recevoir de transfusion sanguine. Cette information sera visible sur le dossier.</p>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex justify-end">
        <button onClick={createAndContinue} disabled={isSaving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
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
            <RadioOption label="Non-fumeur"   name="tabagisme" checked={antecedents.tabagisme === 'non-fumeur'} onChange={() => setAntecedents({...antecedents, tabagisme: 'non-fumeur'})} />
            <RadioOption label="Fumeur"       name="tabagisme" checked={antecedents.tabagisme === 'fumeur'}     onChange={() => setAntecedents({...antecedents, tabagisme: 'fumeur'})} />
            <RadioOption label="Ancien fumeur" name="tabagisme" checked={antecedents.tabagisme === 'ancien'}   onChange={() => setAntecedents({...antecedents, tabagisme: 'ancien'})} />
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
          <CheckboxField label="Diabète"         checked={antecedents.diabete}      onChange={(c) => setAntecedents({...antecedents, diabete: c})} />
          <CheckboxField label="Hypertension"    checked={antecedents.hypertension} onChange={(c) => setAntecedents({...antecedents, hypertension: c})} />
          <CheckboxField label="Asthme"          checked={antecedents.asthme}       onChange={(c) => setAntecedents({...antecedents, asthme: c})} />
          <CheckboxField label="BPCO"            checked={antecedents.bpco}         onChange={(c) => setAntecedents({...antecedents, bpco: c})} />
          <CheckboxField label="Tuberculose"     checked={antecedents.tuberculose}  onChange={(c) => setAntecedents({...antecedents, tuberculose: c})} />
          <CheckboxField label="VIH/SIDA"        checked={antecedents.vih}          onChange={(c) => setAntecedents({...antecedents, vih: c})} />
          <CheckboxField label="Typhoïde"        checked={antecedents.typhoide}     onChange={(c) => setAntecedents({...antecedents, typhoide: c})} />
          <CheckboxField label="Paludisme"       checked={antecedents.paludisme}    onChange={(c) => setAntecedents({...antecedents, paludisme: c})} />
          <CheckboxField label="COVID-19"        checked={antecedents.covid19}      onChange={(c) => setAntecedents({...antecedents, covid19: c})} />
          <CheckboxField label="Hépatite B"      checked={antecedents.hepatiteB}    onChange={(c) => setAntecedents({...antecedents, hepatiteB: c})} />
          <CheckboxField label="Hépatite C"      checked={antecedents.hepatiteC}    onChange={(c) => setAntecedents({...antecedents, hepatiteC: c})} />
          <CheckboxField label="Cancer du poumon" checked={antecedents.cancerPoumon} onChange={(c) => setAntecedents({...antecedents, cancerPoumon: c})} />
          <CheckboxField label="Autre cancer"    checked={antecedents.cancerSein || antecedents.cancerColon} onChange={(c) => setAntecedents({...antecedents, cancerSein: c, cancerColon: c})} />
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
        <button onClick={handleSaveAntecedents} disabled={isSaving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Continuer →
        </button>
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

      <FormCard title="Explorations fonctionnelles respiratoires (EFR)" icon={<Wind className="w-4 h-4" />}>
        <p className="text-xs text-(--t4) mb-3">
          Si disponibles, ces valeurs activent le modèle IA haute précision (96.8%).
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <InputField label="FVC — Capacité vitale forcée (L)" type="number" step="0.01" value={consultation.fvc} onChange={(e) => setConsultation({...consultation, fvc: e.target.value})} placeholder="ex: 3.20" />
          <InputField label="VEMS / FEV1 (L)" type="number" step="0.01" value={consultation.fec1} onChange={(e) => setConsultation({...consultation, fec1: e.target.value})} placeholder="ex: 2.50" />
          <InputField label="Peak Flow (L/min)" type="number" value={consultation.peakFlow} onChange={(e) => setConsultation({...consultation, peakFlow: e.target.value})} placeholder="ex: 350" />
        </div>

        {consultation.fvc && consultation.fec1 && (
          <div className="mt-2 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-xs text-blue-700">
            Ratio VEMS/CVF calculé : <strong>
              {(parseFloat(consultation.fec1) / parseFloat(consultation.fvc)).toFixed(2)}
            </strong>
            {(parseFloat(consultation.fec1) / parseFloat(consultation.fvc)) < 0.7 && (
              <span className="ml-2 text-red-600 font-semibold inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Obstruction (&lt; 0.70)
              </span>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-(--ln)">
          <p className="text-xs font-medium text-(--t2) mb-2">Gaz du sang (ABG)</p>
          <div className="grid grid-cols-3 gap-2">
            <CheckboxField label="Hypoxémie ABG PO₂"    checked={consultation.abg_po2_anormal || false} onChange={(c) => setConsultation({...consultation, abg_po2_anormal: c})} />
            <CheckboxField label="Hypercapnie ABG PCO₂"  checked={consultation.abg_co2_anormal || false} onChange={(c) => setConsultation({...consultation, abg_co2_anormal: c})} />
            <CheckboxField label="Trouble pH"             checked={consultation.abg_ph_anormal  || false} onChange={(c) => setConsultation({...consultation, abg_ph_anormal: c})} />
          </div>
        </div>

        <div className="mt-3 p-2 rounded-lg text-xs text-center">
          {consultation.fvc && consultation.fec1
            ? <span className="text-emerald-600 font-medium inline-flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Modèle haute précision activé (96.8%)</span>
            : <span className="text-(--t4) inline-flex items-center gap-1"><Circle className="w-3.5 h-3.5" /> Modèle de base (53.2%) — remplissez FVC et FEV1 pour améliorer</span>
          }
        </div>
      </FormCard>

      <FormCard title="Signes vitaux" icon={<HeartPulse className="w-4 h-4" />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <InputField label="Température (°C)" type="number" step="0.1" value={consultation.temperature} onChange={(e) => setConsultation({...consultation, temperature: e.target.value})} icon={Thermometer} />
          <InputField label="SpO₂ (%)" required type="number" min="0" max="100" value={consultation.saturationO2} onChange={(e) => setConsultation({...consultation, saturationO2: e.target.value})} icon={Droplet} />
          <InputField label="FC (bpm)" required type="number" value={consultation.frequenceCardiaque} onChange={(e) => setConsultation({...consultation, frequenceCardiaque: e.target.value})} icon={Heart} />
<InputField label="FR (/min)" type="number" value={consultation.frequenceRespiratoire} onChange={(e) => setConsultation({...consultation, frequenceRespiratoire: e.target.value})} icon={Wind} />
          <InputField label="TA systolique" required type="number" value={consultation.tensionSystolique} onChange={(e) => setConsultation({...consultation, tensionSystolique: e.target.value})} icon={Activity} />
          <InputField label="TA diastolique" required type="number" value={consultation.tensionDiastolique} onChange={(e) => setConsultation({...consultation, tensionDiastolique: e.target.value})} icon={Activity} />
        </div>
      </FormCard>

      <FormCard title="Symptômes respiratoires" icon={<Wind className="w-4 h-4" />}>
        <div className="space-y-3">
          <div className="p-3 bg-[var(--sf2)] rounded-lg">
            <CheckboxField label="Fièvre" checked={consultation.fievre} onChange={(c) => setConsultation({...consultation, fievre: c})} />
            {consultation.fievre && (
              <div className="grid grid-cols-2 gap-3 mt-2 ml-5">
                <InputField label="Température max (°C)" type="number" step="0.1" value={consultation.fievreTemperature} onChange={(e) => setConsultation({...consultation, fievreTemperature: e.target.value})} />
                <InputField label="Durée (jours)" value={consultation.fievreDuree} onChange={(e) => setConsultation({...consultation, fievreDuree: e.target.value})} />
              </div>
            )}
          </div>

          <div className="p-3 bg-[var(--sf2)] rounded-lg">
            <CheckboxField label="Toux" checked={consultation.toux} onChange={(c) => setConsultation({...consultation, toux: c})} />
            {consultation.toux && (
              <div className="ml-5 mt-2 space-y-2">
                <div className="flex gap-3">
                  <RadioOption label="Sèche"  name="touxType" checked={consultation.touxType === 'seche'}  onChange={() => setConsultation({...consultation, touxType: 'seche'})} />
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

          <div className="p-3 bg-[var(--sf2)] rounded-lg">
            <CheckboxField label="Dyspnée (essoufflement)" checked={consultation.dyspnee} onChange={(c) => setConsultation({...consultation, dyspnee: c})} />
            {consultation.dyspnee && (
              <div className="ml-5 mt-2 space-y-2">
                <SelectField label="Stade" value={consultation.dyspneeStade} onChange={(e) => setConsultation({...consultation, dyspneeStade: parseInt(e.target.value)})} options={[
                  {value: 1, label: "Stade 1: À l'effort intense"},
                  {value: 2, label: "Stade 2: À l'effort modéré"},
                  {value: 3, label: "Stade 3: À l'effort minime"},
                  {value: 4, label: "Stade 4: Au repos"}
                ]} />
                <div className="flex gap-3">
                  <CheckboxField label="À l'effort" checked={consultation.dyspneeEffort} onChange={(c) => setConsultation({...consultation, dyspneeEffort: c})} />
                  <CheckboxField label="Au repos"   checked={consultation.dyspneeRepos}  onChange={(c) => setConsultation({...consultation, dyspneeRepos: c})} />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-[var(--sf2)] rounded-lg">
            <CheckboxField label="Douleur thoracique" checked={consultation.douleurThoracique} onChange={(c) => setConsultation({...consultation, douleurThoracique: c})} />
            {consultation.douleurThoracique && (
              <div className="ml-5 mt-2">
                <SelectField label="Type" value={consultation.douleurType} onChange={(e) => setConsultation({...consultation, douleurType: e.target.value})} options={[
                  {value: 'angineux',    label: 'Angineux (oppression)'},
                  {value: 'pleuritique', label: 'Pleuritique (inspiration)'},
                  {value: 'perforation', label: 'Perforation'}
                ]} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <CheckboxField label="Wheezing (sifflements)" checked={consultation.wheezing}       onChange={(c) => setConsultation({...consultation, wheezing: c})} />
            <CheckboxField label="Hémoptysie"             checked={consultation.hemoptysie}     onChange={(c) => setConsultation({...consultation, hemoptysie: c})} />
            <CheckboxField label="Fatigue"                checked={consultation.fatigue}        onChange={(c) => setConsultation({...consultation, fatigue: c})} />
            <CheckboxField label="Perte de poids"         checked={consultation.pertePoids}     onChange={(c) => setConsultation({...consultation, pertePoids: c})} />
            <CheckboxField label="Sueurs nocturnes"       checked={consultation.sueursNocturnes} onChange={(c) => setConsultation({...consultation, sueursNocturnes: c})} />
            <CheckboxField label="Courbatures"            checked={consultation.courbatures}    onChange={(c) => setConsultation({...consultation, courbatures: c})} />
            <CheckboxField label="Maux de tête"           checked={consultation.mauxDeTete}     onChange={(c) => setConsultation({...consultation, mauxDeTete: c})} />
            <CheckboxField label="Rhinorrhée"             checked={consultation.rhinorrhee}     onChange={(c) => setConsultation({...consultation, rhinorrhee: c})} />
          </div>
        </div>
      </FormCard>

      <FormCard title="Examen clinique" icon={<Stethoscope className="w-4 h-4" />}>
        <TextAreaField label="Auscultation pulmonaire" value={consultation.auscultation} onChange={(e) => setConsultation({...consultation, auscultation: e.target.value})} placeholder="Crépitants, sibilances, râles, MV..." rows={2} />
        <div className="grid grid-cols-3 gap-2 mt-3">
          <CheckboxField label="Crépitants" checked={consultation.crepitants} onChange={(c) => setConsultation({...consultation, crepitants: c})} />
          <CheckboxField label="Sibilants"  checked={consultation.sibilants}  onChange={(c) => setConsultation({...consultation, sibilants: c})} />
          <CheckboxField label="Ronchi"     checked={consultation.ronchi}     onChange={(c) => setConsultation({...consultation, ronchi: c})} />
        </div>
      </FormCard>

      <div className="flex justify-between">
        <button onClick={handlePrev} className="px-5 py-2.5 border rounded-lg text-sm">← Retour</button>
        {(() => {
          const needsIA = !(isAide && !aidePerms.peut_voir_diagnostic);
          const hasRequiredFields = needsIA
            ? (consultation.saturationO2 && consultation.frequenceCardiaque &&
               consultation.tensionSystolique && consultation.tensionDiastolique &&
               (consultation.toux || consultation.dyspnee || consultation.douleurThoracique ||
                consultation.wheezing || consultation.hemoptysie || consultation.fatigue ||
                consultation.fievre || consultation.motif))
            : true;
          const isDisabled = isAnalyzing || (needsIA && !hasRequiredFields);
          return (
        <button onClick={runAIAnalysis} disabled={isDisabled}
          title={needsIA && !hasRequiredFields ? 'Remplissez SpO₂, FC, TA et au moins un symptôme' : ''}
          className={`px-6 py-2.5 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            isDisabled
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : isAide && !aidePerms.peut_voir_diagnostic
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          }`}>
          {isAnalyzing
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : isAide && !aidePerms.peut_voir_diagnostic
              ? <CheckCircle className="w-4 h-4" />
              : <Brain className="w-4 h-4" />}
          {isAnalyzing
            ? 'Enregistrement...'
            : isAide && !aidePerms.peut_voir_diagnostic
              ? 'Enregistrer'
              : "Lancer l'analyse IA"}
        </button>
          );
        })()}
      </div>
    </div>
  );

  // Étape 4: Diagnostic IA et Prescription
  const renderStepDiagnostic = () => (
    <div className="space-y-4">

      {/* Alertes religion / groupe sanguin / urgence */}
      {(aiResult.alertes || []).map((alerte, i) => (
        <div key={i} className={`rounded-xl p-4 flex items-start gap-3 border ${
          alerte.type === 'religious'      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30' :
          alerte.type === 'urgence'        ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30' :
          alerte.type === 'groupe_sanguin' ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' :
                                             'bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-gray-500/30'
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
            alerte.type === 'religious'      ? 'text-amber-600' :
            alerte.type === 'urgence'        ? 'text-red-600' :
            alerte.type === 'groupe_sanguin' ? 'text-blue-600' : 'text-gray-600'
          }`} />
          <div className="flex-1">
            <p className={`text-sm font-bold mb-1 ${
              alerte.type === 'religious'      ? 'text-amber-800 dark:text-amber-200' :
              alerte.type === 'urgence'        ? 'text-red-800 dark:text-red-200' :
              alerte.type === 'groupe_sanguin' ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800 dark:text-gray-200'
            }`}>{alerte.titre}</p>

            {alerte.restrictions?.map((r, j) => (
              <p key={j} className="text-xs text-red-700 mt-1 flex items-start gap-1">
                <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {r}
              </p>
            ))}

            {alerte.recommandations_speciales?.map((r, j) => (
              <p key={j} className="text-xs text-emerald-700 mt-1 flex items-start gap-1">
                <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {r}
              </p>
            ))}

            {alerte.infos?.map((r, j) => (
              <p key={j} className="text-xs text-blue-700 mt-1 flex items-start gap-1">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {r}
              </p>
            ))}

            {alerte.message && (
              <p className="text-xs text-red-700 mt-1 font-medium">{alerte.message}</p>
            )}
          </div>
        </div>
      ))}

      {/* Alerte données insuffisantes */}
      {aiResult.donneesManquantes?.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-300 dark:border-orange-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-orange-800 dark:text-orange-200 mb-1">
                Résultat indicatif — données cliniques insuffisantes
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mb-2">{aiResult.messagePrecision}</p>
              <p className="text-xs font-medium text-orange-800 dark:text-orange-200 mb-1">
                Données manquantes pour le modèle haute précision (96.8%) :
              </p>
              <ul className="space-y-1">
                {aiResult.donneesManquantes.map((d, i) => (
                  <li key={i} className="text-xs text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 italic">
                Retournez à l'étape 3 et remplissez ces valeurs pour un diagnostic plus précis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bandeau diagnostic + indicateur modèle */}
      <div className={`bg-linear-to-r from-${getRiskColor(aiResult.riskLevel)}-500 to-${getRiskColor(aiResult.riskLevel)}-600 rounded-xl p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            <div>
              <h2 className="text-base font-bold">Analyse IA — Résultats</h2>
              <p className="text-xs opacity-90">{getRiskText(aiResult.riskLevel)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xs px-2 py-1 rounded-full font-medium inline-flex items-center gap-1 ${
              aiResult.typeConsultation === 'equipe' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80'
            }`}>
              {aiResult.typeConsultation === 'equipe'
                ? <><Zap className="w-3 h-3" /> Modèle équipé • {aiResult.versionModele}</>
                : <><Circle className="w-3 h-3" /> Modèle de base • {aiResult.versionModele}</>
              }
            </div>
            {aiResult.typeConsultation !== 'equipe' && (
              <p className="text-[10px] opacity-70 mt-0.5">Remplissez FVC + FEV1 pour 96.8%</p>
            )}
          </div>
        </div>
      </div>

      {/* Diagnostic principal + différentiels */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[var(--sf)] rounded-xl border border-(--ln) p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-(--t1)">
            <Target className="w-4 h-4 text-blue-600" /> Diagnostic principal
          </h3>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{aiResult.principal || 'En attente'}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-500/20 rounded-full text-xs">
              <Brain className="w-3 h-3" /> Confiance patient : {aiResult.confidence}%
            </div>
            {aiResult.versionModele && (
              <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 rounded-full text-xs ml-1">
                <Sparkles className="w-3 h-3" /> Fiabilité modèle : {aiResult.versionModele}
              </div>
            )}
          </div>
          <div className="mt-3">
            <div className="h-1.5 bg-(--sf2) rounded-full">
              <div className={`h-full bg-${getRiskColor(aiResult.riskLevel)}-500 rounded-full`} style={{ width: `${aiResult.confidence}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-[var(--sf)] rounded-xl border border-(--ln) p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-(--t1)">
            <LineChart className="w-4 h-4 text-emerald-600" /> Diagnostics différentiels
          </h3>
          {aiResult.differentials.map((d, i) => (
            <div key={i} className="mb-3 pb-3 border-b border-(--ln) last:border-0">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-(--t1)">{d.name}</span>
                <span className="font-bold text-blue-600">{d.score}%</span>
              </div>
              <div className="h-1 bg-(--sf2) rounded-full mb-2">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${d.score}%` }} />
              </div>
              {d.criteres_valides?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {d.criteres_valides.map((c, j) => (
                    <span key={j} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]">{c}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Critères validés */}
      {aiResult.criteria.length > 0 && (
        <div className="bg-[var(--sf)] rounded-xl border border-(--ln) p-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2 text-(--t1)">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Critères validés ({aiResult.criteria.length})
          </h3>
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
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2 text-(--t1)">
            <Microscope className="w-4 h-4 text-purple-600" /> Examens recommandés
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {aiResult.examensRecommandes.map((e, i) => (
              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{e}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recommandations */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h3 className="font-bold text-sm text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Recommandations
        </h3>
        <div className="space-y-1.5">
          {aiResult.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-1.5 p-1.5 bg-[var(--sf)] rounded-lg text-xs">
              <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-(--t2)">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Validation diagnostic par le médecin — masquée pour les aides */}
      {!isAide ? (
        <FormCard title="Avis du médecin sur le diagnostic IA" icon={<Stethoscope className="w-4 h-4" />}>
          <p className="text-xs text-(--t4) mb-3">Sélectionnez le diagnostic que vous retenez cliniquement.</p>
          <div className="space-y-2">
            {[aiResult.principal, ...(aiResult.differentials || []).map(d => d.name)]
              .filter(Boolean)
              .map((maladie, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-(--ln) hover:bg-(--sf2) transition-colors">
                  <input
                    type="radio"
                    name="diagnosticFinal"
                    value={maladie}
                    checked={prescription.diagnosticFinal === maladie}
                    onChange={() => {
                      if (maladie !== aiResult.principal) {
                        const diff = aiResult.differentials.find(d => d.name === maladie);
                        setPrescription(prev => ({
                          ...prev,
                          diagnosticFinal: maladie,
                          recommandations: diff?.recommandations?.length > 0
                            ? diff.recommandations.join('\n')
                            : prev.recommandations,
                        }));
                      } else {
                        setPrescription(prev => ({
                          ...prev,
                          diagnosticFinal: maladie,
                          recommandations: (aiResult.recommendations || []).join('\n'),
                        }));
                      }
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-(--t1) flex-1">{maladie}</span>
                  {i === 0 && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Suggestion IA</span>
                  )}
                </label>
              ))
            }
            <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-(--ln) hover:bg-(--sf2) transition-colors">
              <input
                type="radio"
                name="diagnosticFinal"
                value="autre"
                checked={prescription.diagnosticFinal === 'autre'}
                onChange={() => setPrescription({...prescription, diagnosticFinal: 'autre'})}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-(--t1)">Autre diagnostic</span>
            </label>
          </div>
          {prescription.diagnosticFinal === 'autre' && (
            <div className="mt-3">
              <InputField
                label="Précisez le diagnostic retenu"
                value={prescription.diagnosticAutre || ''}
                onChange={(e) => setPrescription({...prescription, diagnosticAutre: e.target.value})}
                placeholder="Ex: Bronchite aiguë, Pleurésie..."
              />
            </div>
          )}
          <div className="mt-3 flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="concordance" value="oui"
                checked={prescription.concordanceIA === true}
                onChange={() => setPrescription({...prescription, concordanceIA: true})}
                className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Je confirme le diagnostic IA
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="concordance" value="non"
                checked={prescription.concordanceIA === false}
                onChange={() => setPrescription({...prescription, concordanceIA: false})}
                className="w-3.5 h-3.5 text-red-600" />
              <span className="text-xs text-red-700 font-medium inline-flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Je diverge du diagnostic IA
              </span>
            </label>
          </div>
        </FormCard>
      ) : (
        <div className="rounded-xl p-5 border-2 border-dashed border-(--ln) flex items-center gap-4 text-(--t3)">
          <Lock className="w-6 h-6 shrink-0 text-(--t4)" />
          <div>
            <p className="font-semibold text-sm text-(--t2)">Avis du médecin</p>
            <p className="text-xs mt-0.5">L'avis clinique sera complété par le médecin superviseur après votre saisie.</p>
          </div>
        </div>
      )}

      {/* Recommandations adaptées au choix du médecin */}
      {!isAide && prescription.diagnosticFinal && prescription.diagnosticFinal !== 'autre' && prescription.diagnosticFinal !== aiResult.principal && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-medium text-amber-800 mb-2">
            Vous avez choisi <strong>{prescription.diagnosticFinal}</strong> — recommandations adaptées :
          </p>
          {(aiResult.differentials.find(d => d.name === prescription.diagnosticFinal)?.recommandations || [])
            .map((r, i) => (
              <p key={i} className="text-xs text-amber-700">• {r}</p>
            ))
          }
        </div>
      )}

      {/* Prescription médicale — masquée si aide sans droit prescrire */}
      {(!isAide || aidePerms.peut_prescrire) ? (
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
        </FormCard>
      ) : (
        <div className="rounded-xl p-5 border-2 border-dashed border-(--ln) flex items-center gap-4 text-(--t3)">
          <Lock className="w-6 h-6 shrink-0 text-(--t4)" />
          <div>
            <p className="font-semibold text-sm text-(--t2)">Prescription médicale</p>
            <p className="text-xs mt-0.5">Vous n'avez pas les droits pour établir une prescription. Le médecin supervisera cette étape.</p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={handlePrev} className="px-5 py-2.5 border rounded-lg text-sm">← Retour</button>
        <button onClick={handleFinish} disabled={isSaving} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-emerald-700 transition-all">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Terminer la consultation
        </button>
      </div>
    </div>
  );

  // Rendu principal
  return (
    <div className="w-full py-4" translate="no">
      <StepIndicator currentStep={currentStep} steps={steps} patientInfo={{
        nom: patientInfo.nom, prenom: patientInfo.prenom, civilite: patientInfo.civilite,
        age: calculateAge(), telephone: patientInfo.telephone, adresse: patientInfo.adresse,
        profession: patientInfo.profession, religion: patientInfo.religion
      }} />

      {modeOffline && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl dark:bg-amber-500/10 dark:border-amber-500/30">
          <WifiOff size={15} className="text-amber-600 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Mode hors ligne actif</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              Toutes vos données sont sauvegardées localement et seront synchronisées à la reconnexion.
            </p>
          </div>
        </div>
      )}

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