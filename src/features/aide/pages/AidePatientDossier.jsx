import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, Droplets,
  Heart, Syringe, ClipboardList, Edit3, Save, X,
  Stethoscope, CheckCircle2, AlertTriangle, Loader2, Lock,
  Briefcase, Globe,
} from 'lucide-react';
import { getPatientAide, updatePatientAide } from '../../../services/patientsApi';

const RED = '#DC2626';

function calculerAge(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const age  = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(age) || age < 0 ? null : age;
}

function InfoRow({ icon: Icon, label, value, color = 'text-(--t3)' }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-(--ln) last:border-0">
      <Icon size={14} className={`${color} shrink-0 mt-0.5`} />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-(--t4) uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-(--t1) font-medium">{value}</p>
      </div>
    </div>
  );
}

const inp = "w-full px-3 py-2.5 border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition-all placeholder:text-(--t4)";
const GROUPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function AidePatientDossier() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const perms = (() => { try { return JSON.parse(localStorage.getItem('aide_permissions') || '{}'); } catch { return {}; } })();

  const [patient,  setPatient]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [form,     setForm]     = useState({});

  useEffect(() => {
    getPatientAide(id)
      .then(p => { setPatient(p); setForm(p); })
      .catch(e => setError(e.message || 'Erreur'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePatientAide(id, {
        civilite:             form.civilite             || null,
        nom:                  form.nom,
        prenom:               form.prenom,
        date_naissance:       form.date_naissance       || null,
        groupe_sanguin:       form.groupe_sanguin       || null,
        telephone:            form.telephone            || null,
        email:                form.email                || null,
        adresse:              form.adresse              || null,
        profession:           form.profession           || null,
        religion:             form.religion             || null,
        personne_a_contacter: form.personne_a_contacter || null,
        telephone_urgence:    form.telephone_urgence    || null,
        allergies:            form.allergies            || [],
        antecedents:          form.antecedents          || {},
      });
      setPatient(form);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: RED }} />
    </div>
  );

  if (error && !patient) return (
    <div className="flex flex-col items-center py-20 text-center">
      <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
      <p className="font-bold text-(--t1)">{error}</p>
      <button onClick={() => navigate('/aide/patients')}
        className="mt-4 text-sm text-red-600 hover:underline">← Retour aux patients</button>
    </div>
  );

  const age = calculerAge(patient?.date_naissance);
  const initials = `${patient?.prenom?.[0]||''}${patient?.nom?.[0]||''}`.toUpperCase();
  const canEdit    = perms.peut_modifier_patient;
  const canConsult = perms.peut_saisir_symptomes || perms.peut_voir_diagnostic;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">

      {/* Nav */}
      <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between gap-3">
        <Link to="/aide/patients"
          className="flex items-center gap-2 text-sm text-(--t3) hover:text-(--t1) transition-colors">
          <ArrowLeft size={16} /> Retour aux patients
        </Link>
        <div className="flex items-center gap-2">
          {saved && (
            <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} /> Sauvegardé
            </motion.span>
          )}
          {canEdit && !editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white rounded-xl transition-all"
              style={{ backgroundColor: RED }}>
              <Edit3 size={14} /> Modifier
            </button>
          )}
          {editing && (
            <>
              <button onClick={() => { setEditing(false); setForm(patient); }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold border border-(--ln) text-(--t2) rounded-xl hover:bg-(--sf2) transition-all">
                <X size={14} /> Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-white rounded-xl disabled:opacity-40 transition-all"
                style={{ backgroundColor: RED }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Sauvegarder
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Header patient */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
        className="bg-(--sf) border border-(--ln) rounded-2xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl text-white text-xl font-black flex items-center justify-center shrink-0 shadow-lg"
          style={{ background:`linear-gradient(135deg,${RED},#991B1B)` }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-black text-(--t1)">
            {patient?.civilite && <span className="text-(--t3) font-medium mr-1">{patient.civilite}.</span>}
            {patient?.prenom} {patient?.nom}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {age !== null && <span className="text-sm text-(--t3)">{age} ans</span>}
            {patient?.groupe_sanguin && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300">
                {patient.groupe_sanguin}
              </span>
            )}
            <span className="text-xs font-mono text-(--t4)">{patient?.id}</span>
          </div>
        </div>
        {canConsult && (
          <button onClick={() => navigate(`/aide/consultation?patient_id=${patient.id}`)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all shrink-0"
            style={{ backgroundColor: RED }}>
            <Stethoscope size={15} /> Consultation
          </button>
        )}
      </motion.div>

      {/* Erreur sauvegarde */}
      <AnimatePresence>
        {error && patient && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-700 dark:text-red-300">
            <AlertTriangle size={14} className="shrink-0" /> {error}
            <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Identité */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
          className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-(--ln) bg-(--sf2)">
            <User size={14} className="text-red-500" />
            <span className="text-xs font-black uppercase tracking-widest text-red-500">Identité</span>
          </div>
          <div className="p-5">
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[{val:'M',label:'M.'},{val:'Mme',label:'Mme'}].map(opt => (
                    <label key={opt.val}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                        form.civilite === opt.val ? 'border-red-500 bg-red-50 dark:bg-red-500/10' : 'border-(--ln) hover:border-red-300'
                      }`}>
                      <input type="radio" name="civ" className="sr-only" value={opt.val}
                        checked={form.civilite === opt.val} onChange={() => set('civilite', opt.val)} />
                      <div className={`w-3.5 h-3.5 rounded-full border-2 ${form.civilite === opt.val ? 'border-red-500 bg-red-500' : 'border-(--t4)'}`} />
                      <span className="text-sm font-semibold text-(--t1)">{opt.label}</span>
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-(--t4) uppercase mb-1 block">Prénom</label>
                    <input className={inp} value={form.prenom||''} onChange={e => set('prenom', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-(--t4) uppercase mb-1 block">Nom</label>
                    <input className={inp} value={form.nom||''} onChange={e => set('nom', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-(--t4) uppercase mb-1 block">Date de naissance</label>
                    <input type="date" className={inp} value={form.date_naissance||''} onChange={e => set('date_naissance', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-(--t4) uppercase mb-1 block">Groupe sanguin</label>
                    <select className={`${inp} cursor-pointer`} value={form.groupe_sanguin||''} onChange={e => set('groupe_sanguin', e.target.value)}>
                      <option value="">—</option>
                      {GROUPES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-(--t4) uppercase mb-1 block">Profession</label>
                    <input className={inp} value={form.profession||''} onChange={e => set('profession', e.target.value)} placeholder="Enseignant…" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-(--t4) uppercase mb-1 block">Religion</label>
                    <select className={`${inp} cursor-pointer`} value={form.religion||''} onChange={e => set('religion', e.target.value)}>
                      <option value="">—</option>
                      <option value="catholique">Catholique</option>
                      <option value="protestant">Protestant</option>
                      <option value="temoin_jehovah">Témoin de Jéhovah</option>
                      <option value="musulman">Musulman</option>
                      <option value="autres">Autres</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <InfoRow icon={Calendar}  label="Date de naissance" value={patient?.date_naissance ? new Date(patient.date_naissance).toLocaleDateString('fr-FR') : null} />
                <InfoRow icon={Droplets}  label="Groupe sanguin"    value={patient?.groupe_sanguin} color="text-red-500" />
                <InfoRow icon={Briefcase} label="Profession"        value={patient?.profession} />
                <InfoRow icon={Globe}     label="Religion"          value={patient?.religion ? ({ catholique:'Catholique', protestant:'Protestant', temoin_jehovah:'Témoin de Jéhovah', musulman:'Musulman', autres:'Autres' }[patient.religion] || patient.religion) : null} />
                {!patient?.date_naissance && !patient?.groupe_sanguin && !patient?.profession && !patient?.religion && (
                  <p className="text-sm text-(--t4) italic py-2">Aucune donnée d'identité</p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
          className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-(--ln) bg-(--sf2)">
            <Phone size={14} className="text-blue-500" />
            <span className="text-xs font-black uppercase tracking-widest text-blue-500">Contact</span>
          </div>
          <div className="p-5">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-(--t4) uppercase mb-1 block">Téléphone</label>
                  <input className={inp} value={form.telephone||''} onChange={e => set('telephone', e.target.value)} placeholder="+237 6XX XXX XXX" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-(--t4) uppercase mb-1 block">Email</label>
                  <input type="email" className={inp} value={form.email||''} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-(--t4) uppercase mb-1 block">Adresse</label>
                  <input className={inp} value={form.adresse||''} onChange={e => set('adresse', e.target.value)} />
                </div>
              </div>
            ) : (
              <div>
                <InfoRow icon={Phone} label="Téléphone" value={patient?.telephone} />
                <InfoRow icon={Mail}  label="Email"     value={patient?.email} />
                <InfoRow icon={MapPin} label="Adresse"  value={patient?.adresse} />
                {!patient?.telephone && !patient?.email && !patient?.adresse && (
                  <p className="text-sm text-(--t4) italic py-2">Aucun contact renseigné</p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Urgence */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.11 }}
          className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-(--ln) bg-(--sf2)">
            <Heart size={14} className="text-amber-500" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-500">Contact d'urgence</span>
          </div>
          <div className="p-5">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-(--t4) uppercase mb-1 block">Personne à contacter</label>
                  <input className={inp} value={form.personne_a_contacter||''} onChange={e => set('personne_a_contacter', e.target.value)} placeholder="Nom (lien)" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-(--t4) uppercase mb-1 block">Téléphone d'urgence</label>
                  <input type="tel" className={inp} value={form.telephone_urgence||''} onChange={e => set('telephone_urgence', e.target.value)} />
                </div>
              </div>
            ) : (
              <div>
                <InfoRow icon={User}  label="Personne à contacter" value={patient?.personne_a_contacter} />
                <InfoRow icon={Phone} label="Téléphone urgence"    value={patient?.telephone_urgence} />
                {!patient?.personne_a_contacter && !patient?.telephone_urgence && (
                  <p className="text-sm text-(--t4) italic py-2">Aucun contact d'urgence</p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Médical */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14 }}
          className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-(--ln) bg-(--sf2)">
            <ClipboardList size={14} className="text-purple-500" />
            <span className="text-xs font-black uppercase tracking-widest text-purple-500">Informations médicales</span>
          </div>
          <div className="p-5">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-(--t4) uppercase mb-1 block">Allergies (séparées par virgule)</label>
                  <input className={inp}
                    value={Array.isArray(form.allergies) ? form.allergies.join(', ') : (form.allergies||'')}
                    onChange={e => set('allergies', e.target.value.split(',').map(a => a.trim()).filter(Boolean))}
                    placeholder="Pénicilline, latex…" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-(--t4) uppercase mb-1 block">Antécédents</label>
                  <textarea className={`${inp} resize-none`} rows={3}
                    value={form.antecedents?.notes || ''}
                    onChange={e => set('antecedents', { notes: e.target.value })}
                    placeholder="Diabète, HTA…" />
                </div>
              </div>
            ) : (
              <div>
                {(patient?.allergies || []).length > 0 ? (
                  <div className="mb-3">
                    <p className="text-[10px] font-semibold text-(--t4) uppercase tracking-wide mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.allergies.map((a, i) => (
                        <span key={i} className="text-xs font-semibold px-2.5 py-1 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20 rounded-full flex items-center gap-1">
                          <Syringe size={10} /> {a}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {patient?.antecedents?.notes ? (
                  <div>
                    <p className="text-[10px] font-semibold text-(--t4) uppercase tracking-wide mb-1">Antécédents</p>
                    <p className="text-sm text-(--t2)">{patient.antecedents.notes}</p>
                  </div>
                ) : null}
                {(!patient?.allergies?.length && !patient?.antecedents?.notes) && (
                  <p className="text-sm text-(--t4) italic py-2">Aucune donnée médicale</p>
                )}
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Accès restreint */}
      {!canEdit && !canConsult && (
        <div className="flex items-center gap-3 p-4 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t3)">
          <Lock size={15} className="shrink-0 text-(--t4)" />
          Vos permissions actuelles permettent uniquement la lecture de ce dossier.
        </div>
      )}
    </div>
  );
}
