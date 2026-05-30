// src/features/medecin/components/CommunauteCreateModal.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Users, Lock, Globe, Tag, FileText,
  CheckCircle, ChevronRight, Stethoscope, Image
} from 'lucide-react';

const SPECIALITES = [
  'Pneumologie', 'Cardiologie', 'Pédiatrie', 'Médecine générale',
  'Neurologie', 'Oncologie', 'Radiologie', 'Urgences', 'Autre',
];

const TAGS_SUGGERES = [
  'Tuberculose', 'BPCO', 'Asthme', 'Pneumonie', 'Bronchite',
  'Fibrose pulmonaire', 'Sarcoïdose', 'Cancer du poumon', 'COVID-19',
];

export default function CommunauteCreateModal({ isOpen, onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const [form, setForm] = useState({
    nom: '',
    description: '',
    type: 'publique',       // 'publique' | 'privee'
    specialite: '',
    tags: [],
    reglesMembres: '',
    avatarUrl: '',
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleTag = (tag) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(next);
    update('tags', next);
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Remplacer par : POST /api/v1/communautes
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
    if (onCreate) onCreate({ ...form, id: crypto.randomUUID(), nb_membres: 1, nb_cas: 0 });
    setTimeout(() => {
      setSuccess(false);
      setStep(1);
      setSelectedTags([]);
      setForm({ nom: '', description: '', type: 'publique', specialite: '', tags: [], reglesMembres: '', avatarUrl: '' });
      onClose();
    }, 1800);
  };

  const canNext1 = form.nom.trim().length >= 3 && form.specialite;
  const canNext2 = form.description.trim().length >= 20;
  const canSubmit = canNext1 && canNext2;

  const steps = [
    { n: 1, label: 'Identité' },
    { n: 2, label: 'Détails' },
    { n: 3, label: 'Paramètres' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panneau */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                       w-full max-w-lg bg-(--sf) rounded-2xl shadow-2xl overflow-hidden"
          >
            {success ? (
              /* ── Écran de succès ── */
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </motion.div>
                <h3 className="text-xl font-bold text-(--t1) mb-2">Communauté créée !</h3>
                <p className="text-sm text-(--t3)">
                  <strong className="text-(--t1)">{form.nom}</strong> est maintenant disponible.
                  Invitez vos confrères à la rejoindre.
                </p>
              </div>
            ) : (
              <>
                {/* ── Header ── */}
                <div className="px-6 pt-5 pb-4 border-b border-(--ln)">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-base font-bold text-(--t1)">Nouvelle communauté</h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-1.5 hover:bg-(--sf2) rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-(--t3)" />
                    </button>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center gap-2">
                    {steps.map((s, i) => (
                      <div key={s.n} className="flex items-center gap-2 flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          step > s.n  ? 'bg-emerald-500 text-white'
                          : step === s.n ? 'bg-blue-600 text-white'
                          : 'bg-(--sf3) text-(--t4)'
                        }`}>
                          {step > s.n ? <CheckCircle className="w-3.5 h-3.5" /> : s.n}
                        </div>
                        <span className={`text-xs font-medium hidden sm:block ${
                          step >= s.n ? 'text-(--t2)' : 'text-(--t4)'
                        }`}>{s.label}</span>
                        {i < steps.length - 1 && (
                          <div className="flex-1 h-px bg-(--ln)">
                            <div className={`h-full bg-blue-500 transition-all duration-300 ${step > s.n ? 'w-full' : 'w-0'}`} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Contenu ── */}
                <div className="px-6 py-5 max-h-[54vh] overflow-y-auto no-scrollbar">
                  <AnimatePresence>
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-5"
                    >

                      {/* ── Étape 1 : Identité ── */}
                      {step === 1 && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-(--t2) mb-1.5">
                              Nom de la communauté *
                            </label>
                            <input
                              type="text"
                              value={form.nom}
                              onChange={e => update('nom', e.target.value)}
                              placeholder="ex : Pneumologues CEMAC"
                              maxLength={80}
                              className="w-full px-3 py-2.5 border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) text-sm placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                            <p className="text-xs text-(--t4) mt-1 text-right">{form.nom.length}/80</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-(--t2) mb-1.5">
                              Spécialité *
                            </label>
                            <select
                              value={form.specialite}
                              onChange={e => update('specialite', e.target.value)}
                              className="w-full px-3 py-2.5 border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            >
                              <option value="">Sélectionner une spécialité</option>
                              {SPECIALITES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>

                          {/* Type : Publique / Privée */}
                          <div>
                            <label className="block text-sm font-medium text-(--t2) mb-2">
                              Type d'accès *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                {
                                  value: 'publique',
                                  icon: Globe,
                                  label: 'Publique',
                                  desc: 'Tout médecin peut rejoindre',
                                  color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
                                },
                                {
                                  value: 'privee',
                                  icon: Lock,
                                  label: 'Privée',
                                  desc: 'Sur invitation uniquement',
                                  color: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
                                },
                              ].map(opt => {
                                const Icon = opt.icon;
                                const active = form.type === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => update('type', opt.value)}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                                      active ? opt.color : 'border-(--ln) hover:border-(--ln2) bg-(--sf2)'
                                    }`}
                                  >
                                    <Icon className={`w-5 h-5 mb-1.5 ${active ? (opt.value === 'publique' ? 'text-blue-600' : 'text-purple-600') : 'text-(--t4)'}`} />
                                    <p className={`text-sm font-semibold ${active ? 'text-(--t1)' : 'text-(--t2)'}`}>{opt.label}</p>
                                    <p className="text-xs text-(--t4) mt-0.5">{opt.desc}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}

                      {/* ── Étape 2 : Description & Tags ── */}
                      {step === 2 && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-(--t2) mb-1.5">
                              Description *
                              <span className="text-(--t4) font-normal ml-1">(min. 20 caractères)</span>
                            </label>
                            <textarea
                              value={form.description}
                              onChange={e => update('description', e.target.value)}
                              rows={4}
                              maxLength={500}
                              placeholder="Décrivez l'objectif de cette communauté, son audience cible, les types de cas discutés…"
                              className="w-full px-3 py-2.5 border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) text-sm placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                            />
                            <p className={`text-xs mt-1 text-right ${form.description.length < 20 ? 'text-amber-500' : 'text-(--t4)'}`}>
                              {form.description.length}/500
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-(--t2) mb-2">
                              <Tag className="w-3.5 h-3.5 inline mr-1.5" />
                              Pathologies couvertes
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {TAGS_SUGGERES.map(tag => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => toggleTag(tag)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    selectedTags.includes(tag)
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'border-(--ln) text-(--t3) hover:border-blue-400 hover:text-blue-600 bg-(--sf2)'
                                  }`}
                                >
                                  {selectedTags.includes(tag) && <CheckCircle className="w-3 h-3 inline mr-1" />}
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* ── Étape 3 : Règles & Aperçu ── */}
                      {step === 3 && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-(--t2) mb-1.5">
                              Règles de la communauté
                              <span className="text-(--t4) font-normal ml-1">(optionnel)</span>
                            </label>
                            <textarea
                              value={form.reglesMembres}
                              onChange={e => update('reglesMembres', e.target.value)}
                              rows={3}
                              maxLength={400}
                              placeholder="ex : Les cas doivent être anonymisés. Respecter la déontologie médicale…"
                              className="w-full px-3 py-2.5 border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) text-sm placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                            />
                          </div>

                          {/* Aperçu de la carte communauté */}
                          <div>
                            <p className="text-xs font-semibold text-(--t4) uppercase tracking-wider mb-2">Aperçu</p>
                            <div className="p-4 bg-(--sf2) border border-(--ln) rounded-xl">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow">
                                  <Stethoscope className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-(--t1) truncate">
                                      {form.nom || 'Nom de la communauté'}
                                    </h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      form.type === 'privee'
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                      {form.type === 'privee' ? '🔒 Privée' : '🌐 Publique'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-(--t3) mt-0.5">
                                    {form.specialite || 'Spécialité'} • 1 membre
                                  </p>
                                  <p className="text-xs text-(--t4) mt-1.5 line-clamp-2">
                                    {form.description || 'Description de la communauté…'}
                                  </p>
                                  {selectedTags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {selectedTags.slice(0, 3).map(t => (
                                        <span key={t} className="text-[10px] px-2 py-0.5 bg-(--sf3) text-(--t3) rounded-full">
                                          {t}
                                        </span>
                                      ))}
                                      {selectedTags.length > 3 && (
                                        <span className="text-[10px] px-2 py-0.5 bg-(--sf3) text-(--t3) rounded-full">
                                          +{selectedTags.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                              <strong>ℹ️ Vous serez créateur</strong> de cette communauté.
                              Vous pourrez nommer des administrateurs, modérer les publications et inviter des confrères.
                            </p>
                          </div>
                        </>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 border-t border-(--ln) flex items-center justify-between gap-3">
                  <button
                    onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
                    className="px-4 py-2 border border-(--ln) text-(--t2) rounded-xl text-sm hover:bg-(--sf2) transition-colors"
                  >
                    {step === 1 ? 'Annuler' : '← Précédent'}
                  </button>

                  <div className="flex items-center gap-1">
                    {steps.map(s => (
                      <div key={s.n} className={`h-1.5 rounded-full transition-all ${
                        step === s.n ? 'w-6 bg-blue-600' : 'w-1.5 bg-(--sf3)'
                      }`} />
                    ))}
                  </div>

                  {step < 3 ? (
                    <button
                      onClick={() => setStep(s => s + 1)}
                      disabled={step === 1 ? !canNext1 : !canNext2}
                      className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Suivant <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit || loading}
                      className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      {loading ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Création…</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" />Créer la communauté</>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
