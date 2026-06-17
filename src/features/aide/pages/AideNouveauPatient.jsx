import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, UserPlus, User, Phone, Calendar,
  Mail, MapPin, AlertCircle, CheckCircle2, Loader2,
  Heart, Globe, Briefcase, ChevronRight, ChevronLeft,
} from 'lucide-react';
import { createPatientAide } from '../../../services/patientsApi';

const P  = '#2563eb';
const P2 = '#1d4ed8';

const inp = 'w-full px-3.5 py-2.5 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:border-blue-400 transition-all';

const STEPS = ['Identité', 'Contact', 'Médical'];
const GROUPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const RELIGIONS = [
  { val:'catholique',     label:'Catholique'          },
  { val:'protestant',     label:'Protestant'          },
  { val:'temoin_jehovah', label:'Témoin de Jéhovah'   },
  { val:'musulman',       label:'Musulman'            },
  { val:'autres',         label:'Autres'              },
];

function Label({ children, required }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-(--t4) mb-1.5">
      {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

export default function AideNouveauPatient() {
  const navigate = useNavigate();
  const perms    = (() => { try { return JSON.parse(localStorage.getItem('aide_permissions')||'{}'); } catch { return {}; } })();
  const [step,  setStep]  = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const [form, setForm] = useState({
    civilite:'', prenom:'', nom:'', date_naissance:'',
    telephone:'', email:'', adresse:'',
    groupe_sanguin:'', religion:'', profession:'',
    personne_a_contacter:'', telephone_urgence:'',
    allergies:'', antecedents:'',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.prenom.trim()) { setError('Le prénom est obligatoire.'); return false; }
      if (!form.nom.trim())    { setError('Le nom est obligatoire.');    return false; }
    }
    setError(''); return true;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const prev = () => { setError(''); setStep(s => Math.max(s - 1, 0)); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true); setError('');
    try {
      const payload = {
        civilite:             form.civilite             || null,
        prenom:               form.prenom.trim(),
        nom:                  form.nom.trim(),
        date_naissance:       form.date_naissance       || null,
        telephone:            form.telephone.trim()     || null,
        email:                form.email.trim()         || null,
        adresse:              form.adresse.trim()       || null,
        groupe_sanguin:       form.groupe_sanguin        || null,
        religion:             form.religion              || null,
        profession:           form.profession.trim()    || null,
        personne_a_contacter: form.personne_a_contacter.trim() || null,
        telephone_urgence:    form.telephone_urgence.trim()    || null,
        allergies:            form.allergies ? form.allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
        antecedents:          form.antecedents ? { notes: form.antecedents.trim() } : {},
      };
      await createPatientAide(payload);
      setDone(true);
    } catch (e) { setError(e.message || 'Erreur lors de la création.'); }
    finally { setLoading(false); }
  };

  if (!perms.peut_creer_patient) return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
        <UserPlus className="w-8 h-8 text-blue-400" />
      </div>
      <div>
        <p className="font-bold text-lg text-(--t1)">Permission requise</p>
        <p className="text-sm text-(--t3) mt-1">Vous n'avez pas la permission de créer des patients.</p>
      </div>
    </div>
  );

  if (done) return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
      <motion.div initial={{ scale:0.5, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ type:'spring', stiffness:200, damping:15 }}
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background:`linear-gradient(135deg,${P2},${P})`, boxShadow:`0 8px 32px rgba(37,99,235,0.35)` }}>
        <CheckCircle2 className="w-10 h-10 text-white" />
      </motion.div>
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}>
        <p className="text-2xl font-black text-(--t1)">Patient créé !</p>
        <p className="text-sm text-(--t3) mt-2">
          <span className="font-bold text-(--t1)">{form.prenom} {form.nom}</span> a été ajouté avec succès.
        </p>
      </motion.div>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }} className="flex items-center gap-3">
        <button onClick={() => navigate('/aide/patients')}
          className="px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all active:scale-95"
          style={{ background:`linear-gradient(135deg,${P2},${P})`, boxShadow:`0 4px 16px rgba(37,99,235,0.30)` }}>
          Voir les patients
        </button>
        <button onClick={() => { setDone(false); setStep(0); setForm({ civilite:'', prenom:'', nom:'', date_naissance:'', telephone:'', email:'', adresse:'', groupe_sanguin:'', religion:'', profession:'', personne_a_contacter:'', telephone_urgence:'', allergies:'', antecedents:'' }); }}
          className="px-5 py-2.5 text-sm font-bold text-(--t2) bg-(--sf) border border-(--ln) rounded-xl hover:bg-(--sf2) transition-all">
          Nouveau patient
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5">

      {/* ── Header ─── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="relative rounded-2xl overflow-hidden"
        style={{ background:`linear-gradient(135deg,${P2} 0%,${P} 55%,#3b82f6 100%)`, boxShadow:`0 8px 32px rgba(37,99,235,0.25)` }}>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-15"
          style={{ background:'radial-gradient(circle,#bfdbfe,transparent)' }} />
        <div style={{ position:'absolute', inset:0, opacity:0.06, backgroundImage:'radial-gradient(circle at 2px 2px,#fff 1px,transparent 0)', backgroundSize:'18px 18px' }} />
        <div className="relative px-6 py-5 flex items-center gap-4">
          <button onClick={() => navigate('/aide/patients')}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 hover:bg-white/25 transition-all"
            style={{ background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.25)' }}>
            <ArrowLeft size={15} className="text-white" />
          </button>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.28)' }}>
            <UserPlus size={18} className="text-white" />
          </div>
          <div>
            <p className="text-blue-200/80 text-[10px] font-black uppercase tracking-widest">Nouveau patient</p>
            <h1 className="text-xl font-black text-white">Ajouter un patient</h1>
          </div>
        </div>
      </motion.div>

      {/* ── Stepper ─── */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 shrink-0 ${i <= step ? 'text-(--t1)' : 'text-(--t4)'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                i < step  ? 'text-white' :
                i === step ? 'text-white' :
                'bg-(--sf2) border border-(--ln)'
              }`} style={ i <= step ? { background: i < step ? '#22c55e' : P, boxShadow: i === step ? `0 0 0 4px rgba(37,99,235,0.15)` : 'none' } : {}}>
                {i < step ? <CheckCircle2 size={14}/> : i + 1}
              </div>
              <span className="text-xs font-bold hidden sm:block">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 rounded-full transition-colors ${i < step ? 'bg-green-400' : 'bg-(--ln)'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Formulaire ─── */}
      <motion.div key={step} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}
        className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-(--ln)">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/10">
            {step === 0 ? <User size={14} className="text-blue-600 dark:text-blue-400" />
             : step === 1 ? <Phone size={14} className="text-indigo-600 dark:text-indigo-400" />
             : <Heart size={14} className="text-rose-600 dark:text-rose-400" />}
          </div>
          <span className="text-sm font-bold text-(--t1)">{STEPS[step]}</span>
          <span className="ml-auto text-xs text-(--t4)">{step + 1} / {STEPS.length}</span>
        </div>

        <div className="p-5 space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="flex items-center gap-2.5 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-sm text-red-700 dark:text-red-300">
                <AlertCircle size={14} className="shrink-0" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {step === 0 && (
            <>
              {/* Civilité */}
              <Field label="Civilité">
                <div className="grid grid-cols-2 gap-2">
                  {[{val:'M',label:'Monsieur'},{val:'Mme',label:'Madame'}].map(opt => (
                    <label key={opt.val}
                      className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 cursor-pointer transition-all ${form.civilite===opt.val ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-(--ln) hover:border-blue-200'}`}>
                      <input type="radio" name="civilite" className="sr-only" value={opt.val} checked={form.civilite===opt.val} onChange={() => set('civilite',opt.val)} />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.civilite===opt.val ? 'border-blue-500' : 'border-(--t4)'}`}>
                        {form.civilite===opt.val && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                      </div>
                      <span className={`text-sm font-semibold ${form.civilite===opt.val ? 'text-blue-700 dark:text-blue-300' : 'text-(--t2)'}`}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prénom" required><input className={inp} value={form.prenom} onChange={e => set('prenom',e.target.value)} placeholder="Jean" /></Field>
                <Field label="Nom" required><input className={inp} value={form.nom} onChange={e => set('nom',e.target.value)} placeholder="Dupont" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date de naissance"><input type="date" className={inp} value={form.date_naissance} onChange={e => set('date_naissance',e.target.value)} /></Field>
                <Field label="Groupe sanguin">
                  <select className={`${inp} cursor-pointer`} value={form.groupe_sanguin} onChange={e => set('groupe_sanguin',e.target.value)}>
                    <option value="">—</option>
                    {GROUPES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Profession"><input className={inp} value={form.profession} onChange={e => set('profession',e.target.value)} placeholder="Médecin…" /></Field>
                <Field label="Religion">
                  <select className={`${inp} cursor-pointer`} value={form.religion} onChange={e => set('religion',e.target.value)}>
                    <option value="">—</option>
                    {RELIGIONS.map(r => <option key={r.val} value={r.val}>{r.label}</option>)}
                  </select>
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="Téléphone"><input type="tel" className={inp} value={form.telephone} onChange={e => set('telephone',e.target.value)} placeholder="+237 6XX XXX XXX" /></Field>
              <Field label="Email"><input type="email" className={inp} value={form.email} onChange={e => set('email',e.target.value)} placeholder="patient@example.com" /></Field>
              <Field label="Adresse"><input className={inp} value={form.adresse} onChange={e => set('adresse',e.target.value)} placeholder="Yaoundé, Cameroun" /></Field>
              <div className="pt-2 border-t border-(--ln)">
                <p className="text-[10px] font-black uppercase tracking-widest text-(--t4) mb-3">Contact d'urgence</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nom / Lien de parenté"><input className={inp} value={form.personne_a_contacter} onChange={e => set('personne_a_contacter',e.target.value)} placeholder="Mère – Marie Dupont" /></Field>
                  <Field label="Téléphone d'urgence"><input type="tel" className={inp} value={form.telephone_urgence} onChange={e => set('telephone_urgence',e.target.value)} /></Field>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Allergies (séparées par virgule)">
                <input className={inp} value={form.allergies} onChange={e => set('allergies',e.target.value)} placeholder="Pénicilline, latex, arachides…" />
              </Field>
              <Field label="Antécédents médicaux">
                <textarea className={`${inp} resize-none`} rows={5}
                  value={form.antecedents} onChange={e => set('antecedents',e.target.value)}
                  placeholder="Diabète de type 2, hypertension artérielle…" />
              </Field>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-(--ln) bg-(--sf2)">
          <button onClick={prev} disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-(--t2) rounded-xl border border-(--ln) hover:bg-(--sf) transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={14} /> Précédent
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all active:scale-95"
              style={{ background:`linear-gradient(135deg,${P2},${P})`, boxShadow:`0 4px 14px rgba(37,99,235,0.28)` }}>
              Suivant <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-all active:scale-95"
              style={{ background:`linear-gradient(135deg,${P2},${P})`, boxShadow:`0 4px 14px rgba(37,99,235,0.28)` }}>
              {loading ? <Loader2 size={15} className="animate-spin"/> : <CheckCircle2 size={15}/>}
              {loading ? 'Création…' : 'Créer le patient'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
