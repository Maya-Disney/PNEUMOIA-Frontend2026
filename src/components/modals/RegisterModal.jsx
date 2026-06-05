// src/components/modals/RegisterModal.jsx
import { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, Camera, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from './ConfirmationModal';
import { useToast } from '../../contexts/ToastContext';

const API_URL = 'http://localhost:8000/api/v1';

const DOCUMENTS_REQUIS = [
  { id: 'diplome_specialisation', label: 'Diplôme de spécialisation en pneumologie',       accept: '.pdf,.jpg,.jpeg,.png,.docx' },
  { id: 'diplome_medecine',       label: 'Diplôme de docteur en médecine',                  accept: '.pdf,.jpg,.jpeg,.png,.docx' },
  { id: 'inscription_ordre',      label: "Inscription à l'ordre / registre des médecins",   accept: '.pdf,.jpg,.jpeg,.png,.docx' },
  { id: 'autorisation_exercice',  label: "Autorisation d'exercice en pneumologie",          accept: '.pdf,.jpg,.jpeg,.png,.docx' },
  { id: 'carte_professionnelle',  label: 'Carte professionnelle de médecin',                accept: '.pdf,.jpg,.jpeg,.png,.docx' },
  { id: 'cni',                    label: "Carte nationale d'identité (CNI)",                accept: '.pdf,.jpg,.jpeg,.png,.docx' },
];

const MAX_MB = 5;

// ── Calcul force du mot de passe ───────────────────────────────────────────────
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)                          score++;
  if (pwd.length >= 12)                         score++;
  if (/[A-Z]/.test(pwd))                        score++;
  if (/[a-z]/.test(pwd))                        score++;
  if (/[0-9]/.test(pwd))                        score++;
  if (/[^A-Za-z0-9]/.test(pwd))                score++;

  if (score <= 2) return { score, label: 'Faible',    color: 'bg-red-500',    text: 'text-red-500'    };
  if (score <= 4) return { score, label: 'Moyen',     color: 'bg-amber-500',  text: 'text-amber-500'  };
  if (score <= 5) return { score, label: 'Fort',      color: 'bg-blue-500',   text: 'text-blue-500'   };
  return             { score, label: 'Très fort',  color: 'bg-emerald-500',text: 'text-emerald-500' };
}

export default function RegisterModal({ isOpen, onClose }) {
  const toast                                   = useToast();
  const [step, setStep]                         = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [photoPreview, setPhotoPreview]         = useState(null);
  const [documents, setDocuments]               = useState({});
  const [errors, setErrors]                     = useState({});
  const [loading, setLoading]                   = useState(false);
  const [apiError, setApiError]                 = useState('');
  const [inputKeys, setInputKeys]               = useState({});
  const photoRef                                = useRef(null);

  const [form, setForm] = useState({
    civilite: '', nom: '', prenom: '',
    specialite: 'Pneumologie', numeroRPPS: '', etablissement: '',
    telephone: '', adresse: '', bio: '', linkedin: '', website: '',
    photoProfil: null,
    emailPro: '', motDePasse: '', confirmationMdp: '',
    cgu: false, confidentialite: false, donnees: false,
  });

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const reset = () => {
    setStep(1); setPhotoPreview(null); setDocuments({}); setErrors({});
    setApiError(''); setLoading(false);
    setForm({
      civilite:'', nom:'', prenom:'', specialite:'Pneumologie', numeroRPPS:'',
      etablissement:'', telephone:'', adresse:'', bio:'', linkedin:'', website:'',
      photoProfil:null, emailPro:'', motDePasse:'',
      confirmationMdp:'', cgu:false, confidentialite:false, donnees:false
    });
  };

  // ── Photo ────────────────────────────────────────────────────────────────
  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setErrors(p => ({ ...p, photo: 'Photo trop lourde (max 2 Mo)' }));
      return;
    }
    setErrors(p => { const n = { ...p }; delete n.photo; return n; });
    upd('photoProfil', f);
    const r = new FileReader();
    r.onloadend = () => setPhotoPreview(r.result);
    r.readAsDataURL(f);
  };

  // ── Document ─────────────────────────────────────────────────────────────
  const handleDoc = (docId, e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setErrors(p => ({ ...p, [docId]: `Fichier trop lourd (max ${MAX_MB} Mo)` }));
      e.target.value = '';
      return;
    }
    setErrors(p => { const n = { ...p }; delete n[docId]; return n; });
    setDocuments(p => ({ ...p, [docId]: f }));
  };

  const removeDoc = (docId) => {
    setDocuments(p => { const n = { ...p }; delete n[docId]; return n; });
    setInputKeys(p => ({ ...p, [docId]: (p[docId] || 0) + 1 }));
  };

  const docsOk        = DOCUMENTS_REQUIS.every(d => documents[d.id]);
  const uploadedCount = Object.keys(documents).length;

  // ── Validation par étape avant de passer à la suivante ───────────────────
  const validateStep = (n) => {
    switch (n) {
      case 1:
        if (!form.photoProfil)    { toast.error('Ajoutez une photo de profil avant de continuer.');          return false; }
        if (!form.civilite)       { toast.error('Sélectionnez votre civilité.');                              return false; }
        if (!form.nom.trim())     { toast.error('Le nom est requis.');                                        return false; }
        if (!form.prenom.trim())  { toast.error('Le prénom est requis.');                                     return false; }
        return true;
      case 2:
        if (!form.specialite.trim())  { toast.error('La spécialité est requise.');                           return false; }
        if (!form.numeroRPPS.trim())  { toast.error('Le numéro RPPS est requis.');                           return false; }
        return true;
      case 3:
        if (!docsOk) { toast.error(`Il manque encore ${DOCUMENTS_REQUIS.length - uploadedCount} document(s).`); return false; }
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  // ── Soumission au backend ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    setApiError('');

    if (form.motDePasse !== form.confirmationMdp) {
      setApiError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.motDePasse.length < 8) {
      setApiError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(form.motDePasse)) {
      setApiError('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.');
      return;
    }
    if (!form.photoProfil) {
      setApiError('Veuillez ajouter une photo de profil.');
      return;
    }

    setLoading(true);

    // Timeout 60 s — l'upload de 7 fichiers peut être long
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 60000);

    try {
      const formData = new FormData();
      formData.append('civilite',      form.civilite);
      formData.append('nom',           form.nom);
      formData.append('prenom',        form.prenom);
      formData.append('specialite',    form.specialite);
      formData.append('numero_rpps',   form.numeroRPPS);
      formData.append('etablissement', form.etablissement);
      formData.append('telephone',     form.telephone);
      formData.append('adresse',       form.adresse);
      formData.append('bio',           form.bio);
      formData.append('linkedin',      form.linkedin);
      formData.append('website',       form.website);
      formData.append('email',         form.emailPro);
      formData.append('password',      form.motDePasse);
      formData.append('photo_profil',  form.photoProfil);
      DOCUMENTS_REQUIS.forEach(doc => {
        formData.append(doc.id, documents[doc.id]);
      });

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        body:   formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Erreur lors de la soumission.');
      }

      toast.success('Dossier soumis ! Vous serez contacté sous 24-48h.', { title: 'Inscription envoyée ✅' });
      setShowConfirmation(true);

    } catch (err) {
      clearTimeout(timeoutId);
      const msg = err.name === 'AbortError'
        ? 'Délai dépassé (60 s) — réessayez avec des fichiers plus légers (< 2 Mo chacun).'
        : err.message || 'Erreur réseau. Réessayez.';
      setApiError(msg);
      toast.error(msg, { title: 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { n: 1, label: 'ID'        },
    { n: 2, label: 'PRATIQUE'  },
    { n: 3, label: 'DOCUMENTS' },
    { n: 4, label: 'ACCÈS'     },
  ];

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <>
      <AnimatePresence>
        {isOpen && !showConfirmation && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

            <motion.div
              initial={{opacity:0, scale:0.95, y:20}} animate={{opacity:1, scale:1, y:0}}
              exit={{opacity:0, scale:0.95, y:20}} transition={{duration:0.2}}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                         w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* ── Header ── */}
              <div className="px-6 pt-5 pb-3">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-6" />
                  <h2 className="text-lg font-bold text-blue-700 dark:text-blue-400">Inscription médecin</h2>
                  <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Stepper */}
                <div className="flex items-center">
                  {steps.map((s, i) => (
                    <div key={s.n} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          step > s.n  ? 'bg-emerald-500 text-white'
                          : step === s.n ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                        }`}>
                          {step > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
                        </div>
                        <span className={`text-[10px] mt-1 font-semibold ${step >= s.n ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                          {s.label}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2 mb-4">
                          <div className={`h-full bg-blue-600 transition-all duration-300 ${step > s.n ? 'w-full' : 'w-0'}`} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Erreur API ── */}
              {apiError && (
                <div className="mx-6 mb-2 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {apiError}
                </div>
              )}

              {/* ── Contenu ── */}
              <div className="px-6 pb-2 max-h-[56vh] overflow-y-auto">
                <AnimatePresence>
                  <motion.div key={step}
                    initial={{opacity:0, x:12}} animate={{opacity:1, x:0}}
                    exit={{opacity:0, x:-12}} transition={{duration:0.15}}
                    className="space-y-4 py-2"
                  >
                    {/* ── ÉTAPE 1 : Identité ── */}
                    {step === 1 && (
                      <>
                        {/* Photo de profil */}
                        <div className="flex flex-col items-center gap-3 pb-2">
                          <div
                            onClick={() => photoRef.current?.click()}
                            className="w-24 h-24 rounded-full border-2 border-dashed border-blue-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden bg-gray-50 dark:bg-gray-800"
                          >
                            {photoPreview
                              ? <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                              : <Camera className="w-8 h-8 text-blue-300" />
                            }
                          </div>
                          <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} className="hidden" />
                          <p className="text-xs text-gray-400">Photo de profil * (JPG/PNG, max 2 Mo)</p>
                          {errors.photo && <p className="text-xs text-red-500">{errors.photo}</p>}
                        </div>

                        <div>
                          <label className={labelClass}>Civilité *</label>
                          <select value={form.civilite} onChange={e => upd('civilite', e.target.value)} className={inputClass}>
                            <option value="">Sélectionnez</option>
                            <option value="Dr">Dr</option>
                            <option value="Pr">Pr</option>
                            <option value="M.">M.</option>
                            <option value="Mme">Mme</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelClass}>Nom *</label>
                            <input type="text" value={form.nom} onChange={e => upd('nom', e.target.value)} placeholder="Dupont" className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>Prénom *</label>
                            <input type="text" value={form.prenom} onChange={e => upd('prenom', e.target.value)} placeholder="Jean" className={inputClass} />
                          </div>
                        </div>
                      </>
                    )}

                    {/* ── ÉTAPE 2 : Pratique ── */}
                    {step === 2 && (
                      <>
                        <div>
                          <label className={labelClass}>Spécialité *</label>
                          <input type="text" value={form.specialite} onChange={e => upd('specialite', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Numéro RPPS *</label>
                          <input type="text" value={form.numeroRPPS} onChange={e => upd('numeroRPPS', e.target.value)} placeholder="11 chiffres" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Établissement</label>
                          <input type="text" value={form.etablissement} onChange={e => upd('etablissement', e.target.value)} placeholder="CHU de Douala..." className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelClass}>Téléphone</label>
                            <input type="tel" value={form.telephone} onChange={e => upd('telephone', e.target.value)} placeholder="+237 6XX XXX XXX" className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>Adresse</label>
                            <input type="text" value={form.adresse} onChange={e => upd('adresse', e.target.value)} placeholder="Douala, Cameroun" className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Biographie courte</label>
                          <textarea value={form.bio} onChange={e => upd('bio', e.target.value)}
                            placeholder="Décrivez votre expérience en quelques lignes…"
                            rows={3} className={`${inputClass} resize-none`} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelClass}>LinkedIn</label>
                            <input type="text" value={form.linkedin} onChange={e => upd('linkedin', e.target.value)} placeholder="linkedin.com/in/..." className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>Site web</label>
                            <input type="text" value={form.website} onChange={e => upd('website', e.target.value)} placeholder="monsite.com" className={inputClass} />
                          </div>
                        </div>
                      </>
                    )}

                    {/* ── ÉTAPE 3 : Documents ── */}
                    {step === 3 && (
                      <>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {uploadedCount}/{DOCUMENTS_REQUIS.length} documents · PDF, JPG, PNG, DOCX · max {MAX_MB} Mo
                        </p>
                        <div className="space-y-2">
                          {DOCUMENTS_REQUIS.map(doc => {
                            const uploaded  = documents[doc.id];
                            const hasErr    = errors[doc.id];
                            const inputId   = `doc-${doc.id}-${inputKeys[doc.id] || 0}`;
                            return (
                              <div key={doc.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                                hasErr    ? 'border-red-200 bg-red-50 dark:bg-red-900/10'
                                : uploaded ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10'
                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                              }`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                  uploaded ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}>
                                  {uploaded
                                    ? <CheckCircle className="w-3 h-3 text-white" />
                                    : <span className="text-[10px] text-white font-bold">?</span>
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">{doc.label}</p>
                                  {hasErr && <p className="text-[10px] text-red-500 mt-0.5">{hasErr}</p>}
                                  {uploaded && (
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                                      ✓ {uploaded.name} ({(uploaded.size/1024/1024).toFixed(1)} Mo)
                                    </p>
                                  )}
                                </div>
                                <label htmlFor={inputId} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                  uploaded ? 'border border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}>
                                  <Upload className="w-3 h-3" />
                                  {uploaded ? 'Remplacer' : 'Choisir'}
                                </label>
                                <input
                                  key={inputId} id={inputId} type="file"
                                  accept={doc.accept} onChange={e => handleDoc(doc.id, e)}
                                  className="hidden"
                                />
                                {uploaded && (
                                  <button type="button" onClick={() => removeDoc(doc.id)}
                                    className="p-1 text-red-400 hover:text-red-600 transition-colors shrink-0">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {docsOk && (
                          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                              Tous les documents sont prêts. Cliquez sur Suivant.
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* ── ÉTAPE 4 : Accès ── */}
                    {step === 4 && (
                      <>
                        <div>
                          <label className={labelClass}>Email professionnel *</label>
                          <input type="email" value={form.emailPro} onChange={e => upd('emailPro', e.target.value)}
                            placeholder="nom@hopital.cm" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Mot de passe *</label>
                          <input type="password" value={form.motDePasse} onChange={e => upd('motDePasse', e.target.value)}
                            placeholder="••••••••" className={inputClass} />
                          {/* Indicateur force */}
                          {form.motDePasse && (() => {
                            const s = getPasswordStrength(form.motDePasse);
                            const bars = 6;
                            return (
                              <div className="mt-2 space-y-1.5">
                                <div className="flex gap-1">
                                  {Array.from({ length: bars }).map((_, i) => (
                                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < s.score ? s.color : 'bg-gray-200 dark:bg-gray-700'}`} />
                                  ))}
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
                                  <span className="text-[10px] text-gray-400">
                                    {!(/[A-Z]/.test(form.motDePasse)) && '• 1 majuscule '}
                                    {!(/[a-z]/.test(form.motDePasse)) && '• 1 minuscule '}
                                    {!(/[0-9]/.test(form.motDePasse)) && '• 1 chiffre '}
                                    {form.motDePasse.length < 8 && `• ${8 - form.motDePasse.length} car. restants`}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        <div>
                          <label className={labelClass}>Confirmation du mot de passe *</label>
                          <input type="password" value={form.confirmationMdp} onChange={e => upd('confirmationMdp', e.target.value)}
                            placeholder="••••••••" className={inputClass} />
                          {form.confirmationMdp && (
                            <p className={`text-xs mt-1 ${form.motDePasse === form.confirmationMdp ? 'text-emerald-600' : 'text-red-500'}`}>
                              {form.motDePasse === form.confirmationMdp ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                            </p>
                          )}
                        </div>
                        <div className="space-y-3 pt-1">
                          {[
                            { k: 'cgu',            label: "J'accepte les Conditions Générales d'Utilisation" },
                            { k: 'confidentialite', label: "J'accepte la Politique de confidentialité" },
                            { k: 'donnees',         label: "J'accepte le traitement des données de santé" },
                          ].map(({ k, label }) => (
                            <label key={k} className="flex items-start gap-3 cursor-pointer group">
                              <input type="checkbox" checked={form[k]} onChange={e => upd(k, e.target.checked)}
                                className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 shrink-0" />
                              <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors leading-relaxed">{label}</span>
                            </label>
                          ))}
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900">
                          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                            <strong>ℹ️</strong> Un administrateur examinera vos documents sous <strong>24–48h</strong>.
                            Vous recevrez un email avec votre lien de connexion si votre dossier est validé.
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ── Footer ── */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  {step > 1 ? (
                    <button onClick={() => setStep(s => s - 1)}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors">
                      <ChevronLeft className="w-4 h-4" /> Précédent
                    </button>
                  ) : <div />}

                  {step < 4 ? (
                    <button onClick={goNext}
                      className="flex items-center gap-1 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 ml-auto text-sm transition-colors">
                      Suivant <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!form.cgu || !form.confidentialite || !form.donnees || loading}
                      className="px-5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed ml-auto text-sm transition-colors flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                          </svg>
                          Envoi en cours...
                        </>
                      ) : 'Soumettre ma demande'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => { setShowConfirmation(false); onClose(); reset(); }}
      />
    </>
  );
}