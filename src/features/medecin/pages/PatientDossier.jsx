// src/features/medecin/pages/PatientDossier.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Calendar, Droplets, Heart, AlertTriangle,
  ShieldAlert, Stethoscope, Brain, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, Pill, FileText, Activity,
  Loader2, RefreshCw, Send, MessageSquare, Clock, Syringe,
  Wind, Cigarette, Wine, Microscope, ClipboardList,
  CheckCircle, Info, Star, AlertCircle, ChevronRight,
  Thermometer, Zap, TrendingUp, Lock
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
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

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};
const fmtDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// ── Config état patient IA ─────────────────────────────────────────
const ETAT_CFG = {
  stable:    { label: 'Stable',    bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  surveille: { label: 'Surveillé', bg: 'bg-amber-50 dark:bg-amber-900/20',    text: 'text-amber-700 dark:text-amber-400',    border: 'border-amber-200 dark:border-amber-800',    dot: 'bg-amber-500' },
  urgent:    { label: 'Urgent',    bg: 'bg-orange-50 dark:bg-orange-900/20',  text: 'text-orange-700 dark:text-orange-400',  border: 'border-orange-200 dark:border-orange-800',  dot: 'bg-orange-500' },
  critique:  { label: 'Critique',  bg: 'bg-red-50 dark:bg-red-900/20',        text: 'text-red-700 dark:text-red-400',        border: 'border-red-200 dark:border-red-800',        dot: 'bg-red-500' },
};

// ── Section card générique ─────────────────────────────────────────
function SectionCard({ title, icon: Icon, color = 'blue', children }) {
  const colorMap = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    red:    'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    amber:  'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    emerald:'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    rose:   'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
  };
  return (
    <div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-(--ln)">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-(--t1) text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Card info simple ───────────────────────────────────────────────
function InfoRow({ label, value, highlight }) {
  return (
    <div className={`flex items-center justify-between py-2 border-b border-(--ln) last:border-0 ${highlight ? 'bg-amber-50 dark:bg-amber-900/10 -mx-2 px-2 rounded-lg' : ''}`}>
      <span className="text-xs text-(--t4) font-medium">{label}</span>
      <span className={`text-sm font-semibold text-right max-w-[60%] ${highlight ? 'text-amber-700 dark:text-amber-400' : 'text-(--t1)'}`}>{value || '—'}</span>
    </div>
  );
}

// ── Badge maladie IA ───────────────────────────────────────────────
function MaladieBadge({ maladie, rank }) {
  const raw = maladie.pct ?? maladie.probabilite ?? maladie.probability ?? maladie.score ?? maladie.prob ?? maladie.confidence ?? 0;
  const pct = Math.round(raw > 1 ? raw : raw * 100);
  const colors = ['bg-blue-600', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500'];
  const bg = colors[rank] || colors[3];
  return (
    <div className="flex items-center gap-2 p-2.5 bg-(--sf2) rounded-xl border border-(--ln)">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
        {pct}%
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-(--t1) truncate">{maladie.nom || maladie.name}</p>
        {maladie.code_cim && <p className="text-[10px] text-(--t4) font-mono">{maladie.code_cim}</p>}
      </div>
    </div>
  );
}

// ── Consultation accordéon ─────────────────────────────────────────
function ConsultationCard({ consultation, index }) {
  const [open, setOpen] = useState(index === 0);
  const diag = consultation.diagnostic;
  const feedback = consultation.feedback;
  const etat = diag?.etat_patient;
  const cfg = ETAT_CFG[etat] || ETAT_CFG.stable;

  const symptomes = consultation.symptomes || {};
  const symptomesActifs = Object.entries(symptomes).filter(([, v]) => v === true || v === 1 || v === 'oui');

  return (
    <div className={`bg-(--sf) border rounded-2xl overflow-hidden transition-all ${open ? 'border-blue-200 dark:border-blue-800 shadow-md' : 'border-(--ln)'}`}>
      {/* En-tête accordéon */}
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-(--sf2) transition-colors text-left">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
          <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-(--t1) text-sm">Consultation #{index + 1}</span>
            {etat && (
              <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            )}
            {feedback?.concordance !== null && feedback?.concordance !== undefined && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${feedback.concordance ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {feedback.concordance ? '✓ Concordant' : '✗ Non concordant'}
              </span>
            )}
          </div>
          <p className="text-xs text-(--t3) mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {fmtDateTime(consultation.created_at)}
            {consultation.medecin && <><span className="mx-1">·</span><span>Dr. {consultation.medecin.prenom} {consultation.medecin.nom}</span></>}
          </p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-(--t3) shrink-0" /> : <ChevronDown className="w-4 h-4 text-(--t3) shrink-0" />}
      </button>

      {/* Contenu accordéon */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4 border-t border-(--ln)">

              {/* Symptômes */}
              {symptomesActifs.length > 0 && (
                <div className="pt-4">
                  <p className="text-xs font-semibold text-(--t3) uppercase tracking-widest mb-2">Symptômes rapportés</p>
                  <div className="flex flex-wrap gap-1.5">
                    {symptomesActifs.map(([k]) => (
                      <span key={k} className="text-xs px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-full font-medium">
                        {k.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Observations du médecin */}
              {consultation.observations && (
                <div>
                  <p className="text-xs font-semibold text-(--t3) uppercase tracking-widest mb-2">Observations</p>
                  <p className="text-sm text-(--t2) leading-relaxed bg-(--sf2) rounded-xl p-3">{consultation.observations}</p>
                </div>
              )}

              {/* Diagnostic IA */}
              {diag && (
                <div className="rounded-xl border border-(--ln) bg-(--sf2) p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Brain className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Diagnostic IA</span>
                    {diag.version_modele && <span className="ml-auto text-[10px] text-(--t4) font-mono">{diag.version_modele}</span>}
                    {etat && (
                      <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 mb-3">
                    {(diag.maladies || []).slice(0, 3).map((m, i) => (
                      <MaladieBadge key={i} maladie={m} rank={i} />
                    ))}
                    {(!diag.maladies || diag.maladies.length === 0) && (
                      <p className="text-xs text-(--t4) italic">Aucune maladie détectée par le modèle</p>
                    )}
                  </div>
                  {diag.recommandations?.length > 0 && (
                    <div className="border-t border-(--ln) pt-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 text-(--t3)">Recommandations IA</p>
                      <ul className="space-y-1">
                        {diag.recommandations.map((r, i) => (
                          <li key={i} className="text-xs text-(--t2) flex items-start gap-1.5">
                            <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-(--t4)" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {diag.alertes?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {diag.alertes.map((a, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full font-medium border border-red-200 dark:border-red-800">
                          ⚠ {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Avis médecin — toujours visible */}
              <div className={`rounded-xl p-4 border ${
                feedback?.diagnostic_final || consultation.avis_medecin
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                  : 'bg-(--sf2) border-(--ln)'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {feedback?.diagnostic_final || consultation.avis_medecin
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    : <Clock className="w-4 h-4 text-(--t4)" />
                  }
                  <span className={`text-xs font-bold uppercase tracking-widest ${
                    feedback?.diagnostic_final || consultation.avis_medecin
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-(--t4)'
                  }`}>
                    Avis du médecin traitant
                  </span>
                  {feedback?.concordance !== null && feedback?.concordance !== undefined && (
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      feedback.concordance
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                    }`}>
                      {feedback.concordance ? '✓ Concordant avec l\'IA' : '✗ Non concordant'}
                    </span>
                  )}
                </div>
                {feedback?.diagnostic_final && (
                  <p className="text-sm font-semibold text-(--t1) mb-1">
                    Diagnostic retenu : <span className="text-emerald-700 dark:text-emerald-400">{feedback.diagnostic_final}</span>
                  </p>
                )}
                {consultation.avis_medecin && (
                  <p className="text-sm text-(--t2) leading-relaxed">{consultation.avis_medecin}</p>
                )}
                {feedback?.commentaire && (
                  <p className="text-sm text-(--t2) leading-relaxed italic mt-1">« {feedback.commentaire} »</p>
                )}
                {!feedback?.diagnostic_final && !consultation.avis_medecin && !feedback?.commentaire && (
                  <p className="text-xs text-(--t4) italic">L'avis du médecin n'a pas encore été soumis pour cette consultation.</p>
                )}
              </div>

              {/* Prescriptions — c.prescriptions est un objet JSONB, pas un tableau */}
              {(() => {
                const presc = consultation.prescriptions;
                const medicaments = Array.isArray(presc)
                  ? presc.filter(Boolean).join('\n')          // ancien format tableau
                  : presc?.medicaments || null;               // nouveau format objet
                if (!medicaments) return null;
                return (
                  <div className="rounded-xl border border-(--ln) bg-(--sf2) p-3.5 space-y-2">
                    <p className="text-xs font-semibold text-(--t3) uppercase tracking-widest flex items-center gap-1">
                      <Pill className="w-3 h-3" /> Prescriptions médicamenteuses
                    </p>
                    <p className="text-sm text-(--t2) whitespace-pre-wrap leading-relaxed">{medicaments}</p>
                    {presc?.conseils_maison && (
                      <div className="pt-1 border-t border-(--ln)">
                        <p className="text-xs text-(--t4) font-semibold uppercase tracking-widest mb-1">Conseils à domicile</p>
                        <p className="text-sm text-(--t2)">{presc.conseils_maison}</p>
                      </div>
                    )}
                    {(presc?.arret_travail || presc?.duree_arret) && (
                      <div className="flex items-center gap-2 pt-1 border-t border-(--ln) text-xs text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        Arrêt de travail{presc.duree_arret ? ` — ${presc.duree_arret} jours` : ''}
                      </div>
                    )}
                    {presc?.hospitalisation && (
                      <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        Hospitalisation requise{presc.motif_hospitalisation ? ` — ${presc.motif_hospitalisation}` : ''}
                      </div>
                    )}
                    {presc?.suivi && presc.suivi !== '7 jours' && (
                      <p className="text-xs text-(--t4) pt-1 border-t border-(--ln)">
                        Suivi prévu : <span className="font-semibold text-(--t2)">{presc.suivi}</span>
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Recommandations médecin */}
              {consultation.recommandations && (
                <div>
                  <p className="text-xs font-semibold text-(--t3) uppercase tracking-widest mb-2 flex items-center gap-1">
                    <ClipboardList className="w-3 h-3" /> Recommandations du médecin
                  </p>
                  <p className="text-sm text-(--t2) leading-relaxed bg-(--sf2) rounded-xl p-3">
                    {typeof consultation.recommandations === 'string'
                      ? consultation.recommandations
                      : consultation.recommandations.join('\n')}
                  </p>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────
export default function PatientDossier() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient,      setPatient]      = useState(null);
  const [consultations,setConsultations]= useState([]);
  const [avis,         setAvis]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [avisText,     setAvisText]     = useState('');
  const [sendingAvis,  setSendingAvis]  = useState(false);
  const [avisOk,       setAvisOk]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [pat, conss, aviss] = await Promise.allSettled([
        apiFetch(`/patients/${patientId}`),
        apiFetch(`/patients/${patientId}/consultations`),
        apiFetch(`/patients/${patientId}/avis`),
      ]);
      if (pat.status === 'fulfilled') setPatient(pat.value);
      else throw new Error(pat.reason?.message || 'Patient introuvable');
      if (conss.status === 'fulfilled') setConsultations(Array.isArray(conss.value) ? conss.value : []);
      if (aviss.status === 'fulfilled') setAvis(Array.isArray(aviss.value) ? aviss.value : []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const handleAvis = async () => {
    if (!avisText.trim()) return;
    setSendingAvis(true);
    try {
      await apiFetch(`/patients/${patientId}/avis`, {
        method: 'POST',
        body: JSON.stringify({ contenu: avisText.trim() }),
      });
      setAvisOk(true);
      setAvisText('');
      setTimeout(() => setAvisOk(false), 4000);
      // Recharger les avis
      const fresh = await apiFetch(`/patients/${patientId}/avis`);
      setAvis(Array.isArray(fresh) ? fresh : []);
    } catch (e) { setError(e.message); }
    finally { setSendingAvis(false); }
  };

  // ── Calculs patient ──────────────────────────────────────────────
  const age = patient?.date_naissance ? (() => {
    const today = new Date();
    const dob   = new Date(patient.date_naissance);
    return today.getFullYear() - dob.getFullYear() - ((today.getMonth(), today.getDate()) < (dob.getMonth(), dob.getDate()) ? 1 : 0);
  })() : null;

  const antecedents = patient?.antecedents || {};

  // patient.allergies + allergie_medicaments depuis les antécédents (stockage backend)
  const allergies = [
    ...(patient?.allergies || []),
    ...(antecedents.allergie_medicaments ? [antecedents.allergie_medicaments] : []),
  ];

  const ANTECEDENT_LABELS = {
    diabete: 'Diabète', hypertension: 'Hypertension', asthme: 'Asthme',
    bpco: 'BPCO', tuberculose: 'Tuberculose', vih: 'VIH/SIDA',
    // snake_case — format réel du backend (Pydantic model_dump)
    hepatite_b: 'Hépatite B', hepatite_c: 'Hépatite C',
    cancer_poumon: 'Cancer pulmonaire', tabagisme: 'Tabagisme',
    alcool: 'Alcoolisme', profession_risque: 'Profession à risque',
    traitement_en_cours: 'Traitement en cours',
    typhoide: 'Typhoïde', paludisme: 'Paludisme', covid19: 'Covid-19',
  };

  const SKIP_KEYS = new Set([
    'allergie_medicaments', 'cigarettes_par_jour', 'duree_tabagisme',
    'exposition_professionnelle', 'expositionProfessionnelle',
    'tabagisme', 'traitement_en_cours', 'traitementEnCours',
  ]);

  const antecedentsActifs = Object.entries(antecedents).filter(([k, v]) => {
    if (SKIP_KEYS.has(k)) return false;
    if (typeof v === 'boolean') return v === true;
    if (typeof v === 'number') return v > 0;
    if (typeof v === 'string') {
      const lower = v.toLowerCase();
      return !['false', 'non', '0', 'non-fumeur', ''].includes(lower);
    }
    return false;
  });

  const derniereDiag = consultations[0]?.diagnostic?.etat_patient;
  const dernierEtat  = ETAT_CFG[derniereDiag] || null;

  // ── Chargement ───────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      <p className="text-sm text-(--t3)">Chargement du dossier…</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <ShieldAlert className="w-14 h-14 text-red-400" />
      <p className="font-bold text-(--t1) text-lg">Accès impossible</p>
      <p className="text-sm text-(--t3) max-w-sm">{error}</p>
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>
    </div>
  );

  return (
    <div className="w-full space-y-6 pb-12">

      {/* ── Breadcrumb + en-tête ───────────────────────────────────── */}
      <div>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-(--t3) hover:text-(--t1) transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="flex flex-wrap items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0">
            {patient?.prenom?.[0]}{patient?.nom?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-(--t1)">
                {patient?.civilite} {patient?.prenom} {patient?.nom}
              </h1>
              {dernierEtat && (
                <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold border ${dernierEtat.bg} ${dernierEtat.text} ${dernierEtat.border}`}>
                  <span className={`w-2 h-2 rounded-full ${dernierEtat.dot}`} />
                  {dernierEtat.label}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-(--t4) bg-(--sf2) px-2 py-0.5 rounded-lg border border-(--ln)">
                <Lock className="w-3 h-3" /> Accès partagé
              </span>
            </div>
            <p className="text-sm text-(--t3) mt-0.5">
              {age ? `${age} ans` : '—'} · {patient?.sexe === 'M' ? 'Homme' : patient?.sexe === 'F' ? 'Femme' : '—'}
              {patient?.date_naissance && ` · Né(e) le ${fmtDate(patient.date_naissance)}`}
            </p>
            <p className="text-xs font-mono text-(--t4) mt-0.5">{patientId}</p>
          </div>
          <button onClick={load}
            className="p-2.5 text-(--t3) hover:text-(--t1) bg-(--sf2) border border-(--ln) rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Grille principale ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Colonne gauche : infos patient ──────────────────────── */}
        <div className="space-y-4">

          {/* Identité */}
          <SectionCard title="Identité" icon={User} color="blue">
            <div className="space-y-0">
              <InfoRow label="Groupe sanguin" value={patient?.groupe_sanguin} />
              <InfoRow label="Profession" value={patient?.profession} />
              <InfoRow label="Adresse" value={patient?.adresse} />
              <InfoRow label="Téléphone" value={patient?.telephone} />
              <InfoRow label="Email" value={patient?.email} />
            </div>
          </SectionCard>

          {/* Urgence */}
          <SectionCard title="Contact urgence" icon={AlertTriangle} color="amber">
            <div className="space-y-0">
              <InfoRow label="Personne à contacter" value={patient?.personne_a_contacter} />
              <InfoRow label="Téléphone urgence" value={patient?.telephone_urgence} />
            </div>
          </SectionCard>

          {/* Restrictions / Religion */}
          {patient?.religion && (
            <SectionCard title="Restrictions médicales" icon={ShieldAlert} color="red">
              {/temoin|jehovah/i.test(patient.religion) ? (
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Témoin de Jéhovah</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Transfusion sanguine et tous dérivés refusés. Chirurgie sans sang possible.</p>
                  </div>
                </div>
              ) : (
                <InfoRow label="Religion" value={patient.religion} />
              )}
            </SectionCard>
          )}

          {/* Allergies */}
          <SectionCard title="Allergies" icon={Zap} color="rose">
            {allergies.length === 0 ? (
              <p className="text-sm text-(--t4) text-center py-2">Aucune allergie connue</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {allergies.map((a, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-full font-medium">
                    {typeof a === 'string' ? a : a.nom || JSON.stringify(a)}
                  </span>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Antécédents */}
          <SectionCard title="Antécédents médicaux" icon={ClipboardList} color="purple">
            {(() => {
              const hasExtra = (antecedents.tabagisme === 'fumeur-actif' || antecedents.tabagisme === 'ex-fumeur' || antecedents.cigarettes_par_jour > 0)
                || !!(antecedents.exposition_professionnelle || antecedents.expositionProfessionnelle)
                || !!(antecedents.traitement_en_cours || antecedents.traitementEnCours);
              if (antecedentsActifs.length === 0 && !hasExtra) return (
                <p className="text-sm text-(--t4) text-center py-2">Aucun antécédent significatif</p>
              );
              return (
              <div className="space-y-2">
                {antecedentsActifs.map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 p-2 bg-(--sf2) rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    <span className="text-sm text-(--t2) font-medium">
                      {ANTECEDENT_LABELS[k] || k.replace(/_/g, ' ')}
                    </span>
                    {typeof v !== 'boolean' && v !== 'oui' && (
                      <span className="ml-auto text-xs text-(--t4)">{v}</span>
                    )}
                  </div>
                ))}
                {(antecedents.tabagisme === 'fumeur-actif' || antecedents.tabagisme === 'ex-fumeur' || antecedents.cigarettes_par_jour > 0) && (
                  <div className="flex items-center gap-2 p-2 bg-(--sf2) rounded-lg">
                    <Cigarette className="w-3.5 h-3.5 text-(--t4) shrink-0" />
                    <span className="text-xs text-(--t3)">
                      {antecedents.tabagisme === 'ex-fumeur' ? 'Ex-fumeur' : 'Tabagisme actif'}
                      {antecedents.cigarettes_par_jour > 0 && ` · ${antecedents.cigarettes_par_jour} cig/j`}
                      {antecedents.duree_tabagisme > 0 && ` · ${antecedents.duree_tabagisme} ans`}
                    </span>
                  </div>
                )}
                {(antecedents.exposition_professionnelle || antecedents.expositionProfessionnelle) && (
                  <div className="flex items-center gap-2 p-2 bg-(--sf2) rounded-lg">
                    <Wind className="w-3.5 h-3.5 text-(--t4) shrink-0" />
                    <span className="text-xs text-(--t3)">{antecedents.exposition_professionnelle || antecedents.expositionProfessionnelle}</span>
                  </div>
                )}
                {(antecedents.traitement_en_cours || antecedents.traitementEnCours) && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Pill className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="text-xs text-blue-700 dark:text-blue-300">{antecedents.traitement_en_cours || antecedents.traitementEnCours}</span>
                  </div>
                )}
              </div>
            );
            })()}
          </SectionCard>

        </div>

        {/* ── Colonne droite : consultations + avis ───────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-(--sf) border border-(--ln) rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-(--t1)">{consultations.length}</p>
              <p className="text-xs text-(--t3)">Consultation{consultations.length > 1 ? 's' : ''}</p>
            </div>
            <div className="bg-(--sf) border border-(--ln) rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-(--t1)">
                {consultations.filter(c => c.diagnostic).length}
              </p>
              <p className="text-xs text-(--t3)">Diag. IA</p>
            </div>
            <div className="bg-(--sf) border border-(--ln) rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-(--t1)">
                {consultations.filter(c => c.feedback?.concordance).length}
              </p>
              <p className="text-xs text-(--t3)">Concordants</p>
            </div>
          </div>

          {/* Consultations */}
          <div>
            <h2 className="text-base font-bold text-(--t1) mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-500" />
              Consultations
            </h2>
            {consultations.length === 0 ? (
              <div className="bg-(--sf) border border-(--ln) rounded-2xl p-10 text-center">
                <Stethoscope className="w-10 h-10 text-(--t4) mx-auto mb-3" />
                <p className="text-sm text-(--t3)">Aucune consultation enregistrée</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consultations.map((c, i) => (
                  <ConsultationCard key={c.id} consultation={c} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* ── Avis collaboratifs ── */}
          <div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-(--ln) bg-(--sf2)">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-(--t1) text-sm">Avis collaboratifs</h3>
              {avis.length > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full font-semibold">
                  {avis.length}
                </span>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Liste des avis existants */}
              {avis.length > 0 && (
                <div className="space-y-3">
                  {avis.map((a) => (
                    <div key={a.id} className="p-3.5 bg-(--sf2) rounded-xl border border-(--ln)">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          {a.medecin_nom?.charAt(4) || 'D'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-(--t1)">{a.medecin_nom}</p>
                          {a.medecin_specialite && <p className="text-[10px] text-(--t4)">{a.medecin_specialite}</p>}
                        </div>
                        <span className="ml-auto text-[10px] text-(--t4)">{fmtDateTime(a.created_at)}</span>
                      </div>
                      <p className="text-sm text-(--t2) leading-relaxed">{a.contenu}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulaire nouvel avis */}
              <div>
                <p className="text-xs font-semibold text-(--t3) uppercase tracking-widest mb-2">Laisser un avis médical</p>
                <textarea
                  value={avisText}
                  onChange={e => setAvisText(e.target.value)}
                  placeholder="Partagez votre avis clinique, observations complémentaires ou recommandations concernant ce patient…"
                  rows={4}
                  className="w-full px-4 py-3 text-sm border-2 border-(--ln) focus:border-indigo-400 rounded-xl bg-(--sf2) text-(--t1) placeholder:text-(--t4) focus:outline-none resize-none transition-colors"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-(--t4)">
                    Votre avis sera notifié au médecin traitant.
                  </p>
                  <button onClick={handleAvis} disabled={sendingAvis || !avisText.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {sendingAvis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Envoyer l'avis
                  </button>
                </div>

                <AnimatePresence>
                  {avisOk && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-2 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Avis envoyé — le médecin traitant a été notifié.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
