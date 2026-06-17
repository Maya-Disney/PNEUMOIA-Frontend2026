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

const P  = '#2563eb';
const P2 = '#1d4ed8';

function calculerAge(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const age  = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(age) || age < 0 ? null : age;
}

const inp = 'w-full px-3 py-2.5 border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) text-sm focus:outline-none focus:ring-2 focus:border-blue-400 transition-all placeholder:text-(--t4)';
const GROUPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

function InfoRow({ icon: Icon, label, value, accent = 'text-(--t4)' }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-(--ln) last:border-0">
      <div className="w-7 h-7 rounded-lg bg-(--sf2) border border-(--ln) flex items-center justify-center shrink-0">
        <Icon size={12} className={accent} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-(--t4) uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-(--t1) font-medium">{value}</p>
      </div>
    </div>
  );
}

function Block({ icon: Icon, label, iconCls, delay = 0, children }) {
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay }}
      className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-(--ln)">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconCls}`}>
          <Icon size={13} />
        </div>
        <span className="text-xs font-bold text-(--t2) uppercase tracking-widest">{label}</span>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

export default function AidePatientDossier() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const perms    = (() => { try { return JSON.parse(localStorage.getItem('aide_permissions')||'{}'); } catch { return {}; } })();

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
      setPatient(form); setSaved(true); setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e.message || 'Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color:P }} />
      <p className="text-sm text-(--t4)">Chargement du dossier…</p>
    </div>
  );

  if (error && !patient) return (
    <div className="flex flex-col items-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
      </div>
      <div>
        <p className="font-bold text-lg text-(--t1)">Dossier introuvable</p>
        <p className="text-sm text-(--t3) mt-1">{error}</p>
      </div>
      <Link to="/aide/patients" className="text-sm font-bold text-white px-5 py-2.5 rounded-xl" style={{ background:P }}>
        ← Retour aux patients
      </Link>
    </div>
  );

  const age        = calculerAge(patient?.date_naissance);
  const initials   = `${patient?.prenom?.[0]||''}${patient?.nom?.[0]||''}`.toUpperCase();
  const canEdit    = perms.peut_modifier_patient;
  const canConsult = perms.peut_saisir_symptomes || perms.peut_voir_diagnostic;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">

      {/* ── Patient hero ─── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="relative rounded-2xl overflow-hidden"
        style={{ background:`linear-gradient(135deg,${P2} 0%,${P} 55%,#3b82f6 100%)`, boxShadow:`0 8px 32px rgba(37,99,235,0.25)` }}>
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-15"
          style={{ background:'radial-gradient(circle,#bfdbfe,transparent)' }} />
        <div style={{ position:'absolute', inset:0, opacity:0.06, backgroundImage:'radial-gradient(circle at 2px 2px,#fff 1px,transparent 0)', backgroundSize:'18px 18px' }} />
        <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link to="/aide/patients"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/25 shrink-0"
              style={{ background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.25)' }}>
              <ArrowLeft size={15} className="text-white" />
            </Link>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0"
              style={{ background:'rgba(255,255,255,0.20)', border:'2px solid rgba(255,255,255,0.30)' }}>
              {initials}
            </div>
            <div>
              <p className="text-blue-200/80 text-[10px] font-black uppercase tracking-widest">Dossier patient</p>
              <h1 className="text-xl font-black text-white leading-tight">
                {patient?.civilite && <span className="font-medium text-white/70 mr-1">{patient.civilite}.</span>}
                {patient?.prenom} {patient?.nom}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {age !== null && <span className="text-[11px] text-blue-200">{age} ans</span>}
                {patient?.groupe_sanguin && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-200">
                    {patient.groupe_sanguin}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-300 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/25">
                <CheckCircle2 size={13} /> Sauvegardé
              </span>
            )}
            {canConsult && !editing && (
              <button onClick={() => navigate(`/aide/consultation?patient_id=${patient.id}`)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl transition-all hover:bg-white/25 active:scale-95"
                style={{ background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.28)' }}>
                <Stethoscope size={14} /> Consultation
              </button>
            )}
            {canEdit && !editing && (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl transition-all hover:bg-white/25 active:scale-95"
                style={{ background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.28)' }}>
                <Edit3 size={14} /> Modifier
              </button>
            )}
            {editing && (
              <>
                <button onClick={() => { setEditing(false); setForm(patient); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white/80 border border-white/25 rounded-xl hover:bg-white/10 transition-all">
                  <X size={13}/> Annuler
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-all active:scale-95"
                  style={{ background:'rgba(255,255,255,0.22)', border:'1.5px solid rgba(255,255,255,0.35)' }}>
                  {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
                  Sauvegarder
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Erreur sauvegarde */}
      <AnimatePresence>
        {error && patient && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="flex items-center gap-3 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-sm text-red-700 dark:text-red-300">
            <AlertTriangle size={14} className="shrink-0" /> {error}
            <button onClick={() => setError(null)} className="ml-auto"><X size={13}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Identité */}
        <Block icon={User} label="Identité" iconCls="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" delay={0.06}>
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[{val:'M',label:'M.'},{val:'Mme',label:'Mme'}].map(opt => (
                  <label key={opt.val}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${form.civilite===opt.val ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-(--ln) hover:border-blue-300'}`}>
                    <input type="radio" name="civ" className="sr-only" value={opt.val} checked={form.civilite===opt.val} onChange={() => set('civilite',opt.val)} />
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${form.civilite===opt.val ? 'border-blue-500' : 'border-(--t4)'}`}>
                      {form.civilite===opt.val && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                    <span className={`text-sm font-semibold ${form.civilite===opt.val ? 'text-blue-700 dark:text-blue-300' : 'text-(--t1)'}`}>{opt.label}</span>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{k:'prenom',l:'Prénom'},{k:'nom',l:'Nom'}].map(f => (
                  <div key={f.k}>
                    <label className="text-[10px] font-bold text-(--t4) uppercase mb-1 block">{f.l}</label>
                    <input className={inp} value={form[f.k]||''} onChange={e => set(f.k,e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-(--t4) uppercase mb-1 block">Date de naissance</label>
                  <input type="date" className={inp} value={form.date_naissance||''} onChange={e => set('date_naissance',e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-(--t4) uppercase mb-1 block">Groupe sanguin</label>
                  <select className={`${inp} cursor-pointer`} value={form.groupe_sanguin||''} onChange={e => set('groupe_sanguin',e.target.value)}>
                    <option value="">—</option>
                    {GROUPES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-(--t4) uppercase mb-1 block">Profession</label>
                  <input className={inp} value={form.profession||''} onChange={e => set('profession',e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-(--t4) uppercase mb-1 block">Religion</label>
                  <select className={`${inp} cursor-pointer`} value={form.religion||''} onChange={e => set('religion',e.target.value)}>
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
              <InfoRow icon={Droplets}  label="Groupe sanguin"    value={patient?.groupe_sanguin} accent="text-red-500" />
              <InfoRow icon={Briefcase} label="Profession"        value={patient?.profession} />
              <InfoRow icon={Globe}     label="Religion"          value={patient?.religion ? ({catholique:'Catholique',protestant:'Protestant',temoin_jehovah:'Témoin de Jéhovah',musulman:'Musulman',autres:'Autres'}[patient.religion]||patient.religion) : null} />
              {!patient?.date_naissance && !patient?.groupe_sanguin && !patient?.profession && !patient?.religion && (
                <p className="text-sm text-(--t4) italic py-2">Aucune donnée d'identité</p>
              )}
            </div>
          )}
        </Block>

        {/* Contact */}
        <Block icon={Phone} label="Contact" iconCls="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" delay={0.09}>
          {editing ? (
            <div className="space-y-3">
              {[{k:'telephone',l:'Téléphone',t:'tel',ph:'+237 6XX XXX XXX'},{k:'email',l:'Email',t:'email',ph:'patient@mail.com'},{k:'adresse',l:'Adresse',t:'text',ph:'Yaoundé…'}].map(f => (
                <div key={f.k}>
                  <label className="text-[10px] font-bold text-(--t4) uppercase mb-1 block">{f.l}</label>
                  <input type={f.t} className={inp} value={form[f.k]||''} onChange={e => set(f.k,e.target.value)} placeholder={f.ph} />
                </div>
              ))}
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
        </Block>

        {/* Urgence */}
        <Block icon={Heart} label="Contact d'urgence" iconCls="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" delay={0.12}>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-(--t4) uppercase mb-1 block">Personne à contacter</label>
                <input className={inp} value={form.personne_a_contacter||''} onChange={e => set('personne_a_contacter',e.target.value)} placeholder="Nom (lien)" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-(--t4) uppercase mb-1 block">Téléphone d'urgence</label>
                <input type="tel" className={inp} value={form.telephone_urgence||''} onChange={e => set('telephone_urgence',e.target.value)} />
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
        </Block>

        {/* Médical */}
        <Block icon={ClipboardList} label="Informations médicales" iconCls="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400" delay={0.15}>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-(--t4) uppercase mb-1 block">Allergies (séparées par virgule)</label>
                <input className={inp}
                  value={Array.isArray(form.allergies) ? form.allergies.join(', ') : (form.allergies||'')}
                  onChange={e => set('allergies', e.target.value.split(',').map(a=>a.trim()).filter(Boolean))}
                  placeholder="Pénicilline, latex…" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-(--t4) uppercase mb-1 block">Antécédents</label>
                <textarea className={`${inp} resize-none`} rows={4}
                  value={form.antecedents?.notes||''}
                  onChange={e => set('antecedents',{notes:e.target.value})}
                  placeholder="Diabète, HTA…" />
              </div>
            </div>
          ) : (
            <div>
              {(patient?.allergies||[]).length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-(--t4) uppercase mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map((a, i) => (
                      <span key={i} className="text-xs font-medium px-2.5 py-1 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-500/15 rounded-full flex items-center gap-1">
                        <Syringe size={9}/> {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {patient?.antecedents?.notes && (
                <div>
                  <p className="text-[10px] font-bold text-(--t4) uppercase mb-1">Antécédents</p>
                  <p className="text-sm text-(--t2) leading-relaxed">{patient.antecedents.notes}</p>
                </div>
              )}
              {!patient?.allergies?.length && !patient?.antecedents?.notes && (
                <p className="text-sm text-(--t4) italic py-2">Aucune donnée médicale</p>
              )}
            </div>
          )}
        </Block>
      </div>

      {!canEdit && !canConsult && (
        <div className="flex items-center gap-3 p-4 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t3)">
          <Lock size={14} className="shrink-0" />
          Vos permissions permettent uniquement la lecture de ce dossier.
        </div>
      )}
    </div>
  );
}
