import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, UserPlus, User, Phone, Calendar,
  Droplets, Mail, MapPin, Syringe,
  AlertTriangle, CheckCircle2, ClipboardList, Heart,
  Briefcase, Globe,
} from 'lucide-react';
import { createPatientAide } from '../../../services/patientsApi';

const RED = '#DC2626';

function calculerAge(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const age  = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(age) || age < 0 ? null : age;
}

function SectionCard({ icon: Icon, label, color = 'red', children, delay = 0 }) {
  const palette = {
    red:   { bg: 'bg-red-50 dark:bg-red-500/10',     text: 'text-red-600 dark:text-red-400'   },
    blue:  { bg: 'bg-blue-50 dark:bg-blue-500/10',   text: 'text-blue-600 dark:text-blue-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  };
  const c = palette[color] || palette.red;
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay, duration:0.3 }}
      className="bg-(--sf) rounded-2xl border border-(--ln) shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-(--ln) bg-(--sf2)">
        <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
          <Icon size={15} className={c.text} />
        </div>
        <span className={`text-xs font-black uppercase tracking-[0.15em] ${c.text}`}>{label}</span>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function Field({ label, required, color = 'red', children }) {
  const star = color === 'red' ? 'text-red-500' : 'text-blue-500';
  return (
    <div>
      <label className="block text-xs font-semibold text-(--t3) mb-1.5 uppercase tracking-wide">
        {label}{required && <span className={`${star} ml-0.5`}>*</span>}
      </label>
      {children}
    </div>
  );
}

const GROUPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function AideNouveauPatient() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    civilite:'', nom:'', prenom:'', date_naissance:'',
    groupe_sanguin:'', telephone:'', email:'', adresse:'',
    profession:'', religion:'',
    personne_a_contacter:'', telephone_urgence:'',
    allergies_text:'', antecedents_text:'',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.civilite) { setError('La civilité est obligatoire.'); return; }
    setLoading(true); setError(null);
    try {
      await createPatientAide({
        civilite:             form.civilite,
        nom:                  form.nom.toUpperCase().trim(),
        prenom:               form.prenom.trim(),
        date_naissance:       form.date_naissance       || null,
        groupe_sanguin:       form.groupe_sanguin       || null,
        telephone:            form.telephone            || null,
        email:                form.email                || null,
        adresse:              form.adresse              || null,
        profession:           form.profession           || null,
        religion:             form.religion             || null,
        personne_a_contacter: form.personne_a_contacter || null,
        telephone_urgence:    form.telephone_urgence    || null,
        allergies:            form.allergies_text
          ? form.allergies_text.split(',').map(a => a.trim()).filter(Boolean)
          : [],
        antecedents: form.antecedents_text.trim()
          ? { notes: form.antecedents_text.trim() }
          : {},
      });
      setSuccess(true);
      setTimeout(() => navigate('/aide/patients'), 1200);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du patient.');
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full px-3 py-2.5 border border-(--ln) rounded-xl bg-(--sf) text-(--t1) text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all placeholder:text-(--t4)";
  const sel = `${inp} cursor-pointer`;

  const age      = calculerAge(form.date_naissance);
  const initials = `${form.prenom?.[0] || ''}${form.nom?.[0] || ''}`.toUpperCase();
  const canSubmit = form.civilite && form.nom.trim() && form.prenom.trim() && !loading;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5">

      {/* ── En-tête ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex items-center gap-4">
        <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:0.95 }}
          type="button" onClick={() => navigate('/aide/patients')}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-(--ln) bg-(--sf) text-(--t2) hover:text-(--t1) transition-all shrink-0">
          <ArrowLeft size={17} />
        </motion.button>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: RED }} />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: RED }}>
              Nouveau patient
            </span>
          </div>
          <h1 className="text-xl font-bold text-(--t1) leading-tight">Créer un dossier patient</h1>
        </div>
      </motion.div>

      {/* ── Corps ───────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Colonne gauche — formulaire (2/3) */}
            <div className="lg:col-span-2 space-y-5">

              <AnimatePresence>
                {error && (
                  <motion.div key="err" initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    className="flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-700 dark:text-red-300">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Identité */}
              <SectionCard icon={User} label="Identité" color="red" delay={0.05}>
                <div className="space-y-4">
                  <Field label="Civilité" required>
                    <div className="grid grid-cols-2 gap-3">
                      {[{val:'M',label:'M.',sub:'Monsieur'},{val:'Mme',label:'Mme',sub:'Madame'}].map(opt => (
                        <motion.label key={opt.val} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                            form.civilite === opt.val
                              ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                              : 'border-(--ln) hover:border-red-300 hover:bg-(--sf2)'
                          }`}>
                          <input type="radio" name="civilite" value={opt.val}
                            checked={form.civilite === opt.val} onChange={() => set('civilite', opt.val)} className="sr-only" />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            form.civilite === opt.val ? 'border-red-500' : 'border-(--ln)'
                          }`}>
                            {form.civilite === opt.val && <div className="w-2 h-2 rounded-full bg-red-500" />}
                          </div>
                          <div>
                            <div className={`text-sm font-bold ${form.civilite === opt.val ? 'text-red-700 dark:text-red-300' : 'text-(--t1)'}`}>{opt.label}</div>
                            <div className="text-xs text-(--t4)">{opt.sub}</div>
                          </div>
                        </motion.label>
                      ))}
                    </div>
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nom" required>
                      <input className={inp} value={form.nom} onChange={e => set('nom', e.target.value)} required />
                    </Field>
                    <Field label="Prénom" required>
                      <input className={inp} value={form.prenom} onChange={e => set('prenom', e.target.value)} required />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Date de naissance">
                      <input type="date" className={inp} value={form.date_naissance} onChange={e => set('date_naissance', e.target.value)} />
                    </Field>
                    <Field label="Âge">
                      <input type="text" readOnly value={age !== null ? `${age} ans` : ''}
                        placeholder="Calculé automatiquement"
                        className={`${inp} bg-(--sf2) cursor-default text-(--t3)`} />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Téléphone">
                      <input type="tel" className={inp} value={form.telephone}
                        onChange={e => set('telephone', e.target.value)} placeholder="+237 6XX XXX XXX" />
                    </Field>
                    <Field label="Email">
                      <input type="email" className={inp} value={form.email}
                        onChange={e => set('email', e.target.value)} placeholder="patient@email.com" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Adresse / Ville">
                      <input className={inp} value={form.adresse}
                        onChange={e => set('adresse', e.target.value)} placeholder="Yaoundé, Bastos…" />
                    </Field>
                    <Field label="Profession">
                      <div className="relative">
                        <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--t4)" />
                        <input className={`${inp} pl-9`} value={form.profession}
                          onChange={e => set('profession', e.target.value)} placeholder="Enseignant, médecin…" />
                      </div>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Religion">
                      <div className="relative">
                        <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--t4)" />
                        <select className={`${sel} pl-9`} value={form.religion} onChange={e => set('religion', e.target.value)}>
                          <option value="">— Non renseignée</option>
                          <option value="catholique">Catholique</option>
                          <option value="protestant">Protestant</option>
                          <option value="temoin_jehovah">Témoin de Jéhovah</option>
                          <option value="musulman">Musulman</option>
                          <option value="autres">Autres</option>
                        </select>
                      </div>
                    </Field>
                    <Field label="Groupe sanguin">
                      <select className={sel} value={form.groupe_sanguin} onChange={e => set('groupe_sanguin', e.target.value)}>
                        <option value="">— Non renseigné</option>
                        {GROUPES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </Field>
                  </div>

                  {form.religion === 'temoin_jehovah' && (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl">
                      <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-200">Patient Témoin de Jéhovah</p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">Ne peut pas recevoir de transfusion sanguine. Cette information sera visible sur le dossier et prise en compte par l'IA.</p>
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Antécédents */}
              <SectionCard icon={ClipboardList} label="Antécédents médicaux" color="amber" delay={0.1}>
                <div className="space-y-4">
                  <Field label="Allergies connues">
                    <input className={inp} value={form.allergies_text}
                      onChange={e => set('allergies_text', e.target.value)}
                      placeholder="Pénicilline, latex… (séparées par virgule)" />
                    <p className="text-[11px] text-(--t4) mt-1">Séparez plusieurs allergies par une virgule.</p>
                  </Field>
                  <Field label="Antécédents">
                    <textarea className={`${inp} resize-none`} rows={3}
                      value={form.antecedents_text} onChange={e => set('antecedents_text', e.target.value)}
                      placeholder="Hypertension, diabète type 2, chirurgies passées…" />
                  </Field>
                </div>
              </SectionCard>

              {/* Urgence */}
              <SectionCard icon={Heart} label="Contact d'urgence" color="blue" delay={0.2}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Personne à contacter">
                    <input className={inp} value={form.personne_a_contacter}
                      onChange={e => set('personne_a_contacter', e.target.value)}
                      placeholder="Nom (lien de parenté)" />
                  </Field>
                  <Field label="Téléphone d'urgence">
                    <input type="tel" className={inp} value={form.telephone_urgence}
                      onChange={e => set('telephone_urgence', e.target.value)} placeholder="+237 6XX XXX XXX" />
                  </Field>
                </div>
              </SectionCard>
            </div>

            {/* Colonne droite — aperçu + actions (1/3) */}
            <div className="space-y-5">
              <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}
                className="bg-(--sf) rounded-2xl border border-(--ln) shadow-sm overflow-hidden sticky top-20">

                <div className="px-5 py-4 border-b border-(--ln) bg-(--sf2)">
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-(--t4)">Aperçu du dossier</span>
                </div>

                <div className="p-5">
                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-5">
                    <motion.div key={initials} initial={{ scale:0.85 }} animate={{ scale:1 }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg mb-3"
                      style={{ background:`linear-gradient(135deg, ${RED}, #991B1B)`, boxShadow:`0 8px 24px ${RED}33` }}>
                      {initials || <User size={24} className="opacity-60" />}
                    </motion.div>
                    <div className="text-center">
                      <motion.p key={`${form.civilite}${form.prenom}${form.nom}`}
                        initial={{ opacity:0 }} animate={{ opacity:1 }}
                        className="text-base font-bold text-(--t1)">
                        {form.civilite && `${form.civilite}. `}
                        {form.prenom || <span className="text-(--t4) font-normal italic">Prénom</span>}
                        {' '}
                        {form.nom ? form.nom.toUpperCase() : <span className="text-(--t4) font-normal italic">Nom</span>}
                      </motion.p>
                      {age !== null && (
                        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-xs text-(--t3) mt-0.5">
                          {age} ans
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="space-y-2">
                    {[
                      { icon: Calendar,  val: form.date_naissance ? new Date(form.date_naissance).toLocaleDateString('fr-FR') : null, placeholder: 'Date de naissance' },
                      { icon: Droplets,  val: form.groupe_sanguin, placeholder: 'Groupe sanguin' },
                      { icon: Phone,     val: form.telephone,      placeholder: 'Téléphone' },
                      { icon: Mail,      val: form.email,          placeholder: 'Email' },
                      { icon: MapPin,    val: form.adresse,        placeholder: 'Ville' },
                      { icon: Briefcase, val: form.profession,     placeholder: 'Profession' },
                      { icon: Globe,     val: form.religion ? ({ catholique:'Catholique', protestant:'Protestant', temoin_jehovah:'Témoin de Jéhovah', musulman:'Musulman', autres:'Autres' }[form.religion] || form.religion) : null, placeholder: 'Religion' },
                    ].map(({ icon: Icon, val, placeholder }, i) => (
                      <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-(--ln) last:border-0">
                        <Icon size={12} className="text-(--t4) shrink-0" />
                        <span className={`text-xs ${val ? 'text-(--t2) font-medium' : 'text-(--t4) italic'}`}>
                          {val || placeholder}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Badge allergies */}
                  {form.allergies_text.trim() && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                      className="mt-3 flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                      <Syringe size={12} className="text-red-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-red-800 dark:text-red-300 font-semibold leading-relaxed">
                        Allergies : {form.allergies_text}
                      </span>
                    </motion.div>
                  )}

                  {/* Badge groupe sanguin spécial */}
                  {(form.groupe_sanguin === 'O-' || form.groupe_sanguin === 'AB+') && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                      className="mt-2 flex items-center gap-2 p-2.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                      <Droplets size={12} className="text-blue-500 shrink-0" />
                      <span className="text-[11px] text-blue-800 dark:text-blue-300 font-semibold">
                        {form.groupe_sanguin === 'O-' ? 'Donneur universel' : 'Receveur universel'}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 space-y-2.5">
                  <AnimatePresence>
                    {success && (
                      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                        className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
                        <CheckCircle2 size={15} /> Dossier créé !
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button whileHover={canSubmit ? { scale:1.02 } : {}} whileTap={canSubmit ? { scale:0.98 } : {}}
                    type="submit" disabled={!canSubmit}
                    className="w-full flex items-center justify-center gap-2 py-3 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                    style={{ backgroundColor: RED, boxShadow: canSubmit ? `0 4px 14px ${RED}44` : 'none' }}>
                    {loading
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <UserPlus size={15} />}
                    {loading ? 'Création en cours...' : 'Créer le dossier'}
                  </motion.button>

                  <button type="button" onClick={() => navigate('/aide/patients')}
                    className="w-full py-2.5 border border-(--ln) text-(--t2) text-sm font-medium rounded-xl hover:bg-(--sf2) transition-colors">
                    Annuler
                  </button>

                  {/* Checklist */}
                  <div className="pt-2 space-y-1.5">
                    {[
                      { label: 'Civilité',          ok: !!form.civilite          },
                      { label: 'Nom',               ok: !!form.nom.trim()        },
                      { label: 'Prénom',            ok: !!form.prenom.trim()     },
                      { label: 'Date de naissance', ok: !!form.date_naissance    },
                      { label: 'Téléphone',         ok: !!form.telephone         },
                    ].map(({ label, ok }) => (
                      <div key={label} className="flex items-center gap-2">
                        <motion.div animate={{ scale: ok ? [1,1.2,1] : 1 }} transition={{ duration:0.25 }}
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            ok ? 'bg-emerald-500' : 'bg-(--sf2) border border-(--ln)'
                          }`}>
                          {ok && <CheckCircle2 size={10} className="text-white" strokeWidth={3} />}
                        </motion.div>
                        <span className={`text-xs ${ok ? 'text-(--t2) font-medium' : 'text-(--t4)'}`}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
      </form>
    </div>
  );
}
