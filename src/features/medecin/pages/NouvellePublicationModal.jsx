import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Tag, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const PATHOLOGIES = [
  'Pneumonie', 'Tuberculose', 'Asthme', 'BPCO',
  'Cancer pulmonaire', 'Bronchite', 'COVID-19',
  'Pneumothorax', 'Fibrose pulmonaire', 'Autre',
];

const NIVEAUX = [
  '3ème année', '4ème année', '5ème année',
  '6ème année', 'Interne', 'Résident', 'Spécialiste',
];

const MAX_PDF = 20 * 1024 * 1024;

export default function NouvellePublicationModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    titre: '',
    resume: '',
    contenu: '',
    pathologie: '',
    niveau: '3ème année',
    tags: [],
    publier: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t) && form.tags.length < 8) {
      set('tags', [...form.tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (t) => set('tags', form.tags.filter(x => x !== t));

  const handleTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
  };

  const handlePdf = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setPdfError('Seuls les fichiers PDF sont acceptés');
      return;
    }
    if (file.size > MAX_PDF) {
      setPdfError('Le fichier dépasse la limite de 20 Mo');
      return;
    }
    setPdfError('');
    setPdfFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim())      { setError('Le titre est requis'); return; }
    if (!form.resume.trim())     { setError('Le résumé est requis'); return; }
    if (!form.pathologie)        { setError('La pathologie est requise'); return; }

    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('titre',      form.titre.trim());
    fd.append('resume',     form.resume.trim());
    fd.append('contenu',    form.contenu.trim());
    fd.append('pathologie', form.pathologie);
    fd.append('niveau',     form.niveau);
    fd.append('tags',       JSON.stringify(form.tags));
    fd.append('publier',    form.publier ? 'true' : 'false');
    if (pdfFile) fd.append('pdf', pdfFile);

    try {
      const res = await fetch(`${API_URL}/ressources/medecin/creer`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Erreur ${res.status}`);
      onCreated?.(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-(--sf) rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-(--ln) bg-(--sf)">
            <div>
              <h2 className="text-lg font-bold text-(--t1)">Nouvelle publication</h2>
              <p className="text-xs text-(--t3) mt-0.5">Partagez vos connaissances avec la communauté médicale</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-(--sf2) hover:bg-(--sf3) flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-(--t2)" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Titre */}
            <div>
              <label className="block text-xs font-bold text-(--t3) uppercase tracking-wide mb-1.5">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.titre}
                onChange={e => set('titre', e.target.value)}
                placeholder="Ex: Pneumonie communautaire chez un patient jeune…"
                className="w-full px-4 py-2.5 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Résumé */}
            <div>
              <label className="block text-xs font-bold text-(--t3) uppercase tracking-wide mb-1.5">
                Résumé <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.resume}
                onChange={e => set('resume', e.target.value)}
                rows={3}
                placeholder="Brève description du cas clinique ou de la ressource…"
                className="w-full px-4 py-2.5 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
              />
            </div>

            {/* Pathologie + Niveau */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-(--t3) uppercase tracking-wide mb-1.5">
                  Pathologie <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.pathologie}
                  onChange={e => set('pathologie', e.target.value)}
                  className="w-full px-4 py-2.5 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t1) focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                >
                  <option value="">Sélectionner…</option>
                  {PATHOLOGIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-(--t3) uppercase tracking-wide mb-1.5">
                  Niveau cible
                </label>
                <select
                  value={form.niveau}
                  onChange={e => set('niveau', e.target.value)}
                  className="w-full px-4 py-2.5 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t1) focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                >
                  {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-(--t3) uppercase tracking-wide mb-1.5">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--t4)" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKey}
                    placeholder="Ajouter un tag (Entrée pour valider)…"
                    className="w-full pl-9 pr-4 py-2.5 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
                <button type="button" onClick={addTag}
                  className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-(--sf2) border border-(--ln) rounded-full text-xs text-(--t2)">
                      {t}
                      <button type="button" onClick={() => removeTag(t)} className="text-(--t4) hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Contenu */}
            <div>
              <label className="block text-xs font-bold text-(--t3) uppercase tracking-wide mb-1.5">
                Contenu (Markdown)
              </label>
              <textarea
                value={form.contenu}
                onChange={e => set('contenu', e.target.value)}
                rows={8}
                placeholder="Rédigez votre cas clinique en Markdown…&#10;&#10;## Présentation clinique&#10;…&#10;## Diagnostic&#10;…&#10;## Traitement&#10;…"
                className="w-full px-4 py-2.5 bg-(--sf2) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-mono resize-y"
              />
            </div>

            {/* PDF upload */}
            <div>
              <label className="block text-xs font-bold text-(--t3) uppercase tracking-wide mb-1.5">
                Document PDF (optionnel · max 20 Mo)
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-3 px-4 py-3 bg-(--sf2) border-2 border-dashed border-(--ln) hover:border-blue-400 rounded-xl cursor-pointer transition-colors group"
              >
                {pdfFile ? (
                  <>
                    <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-(--t1) truncate">{pdfFile.name}</p>
                      <p className="text-xs text-(--t4)">{(pdfFile.size / 1024 / 1024).toFixed(2)} Mo</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setPdfFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                      className="text-(--t4) hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-(--t4) group-hover:text-blue-500 transition-colors shrink-0" />
                    <p className="text-sm text-(--t3) group-hover:text-blue-500 transition-colors">
                      Cliquez pour choisir un fichier PDF
                    </p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handlePdf} />
              {pdfError && <p className="text-xs text-red-500 mt-1">{pdfError}</p>}
            </div>

            {/* Publier immédiatement */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => set('publier', !form.publier)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.publier ? 'bg-blue-600' : 'bg-(--sf3)'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.publier ? 'translate-x-5' : ''}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-(--t1)">Publier immédiatement</p>
                <p className="text-xs text-(--t4)">Si désactivé, la ressource sera sauvegardée comme brouillon</p>
              </div>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-(--ln)">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-semibold transition-all"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Création…</>
                ) : (
                  <><CheckCircle className="w-4 h-4" />{form.publier ? 'Publier' : 'Enregistrer le brouillon'}</>
                )}
              </button>
              <button type="button" onClick={onClose}
                className="px-5 py-2.5 border border-(--ln) text-(--t2) rounded-xl font-medium hover:bg-(--sf2) transition-all">
                Annuler
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
