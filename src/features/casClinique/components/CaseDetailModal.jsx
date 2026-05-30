import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ArrowRight, CheckCircle, Activity, Thermometer,
  Droplets, Heart, User, MapPin, Calendar, Download, Loader2
} from 'lucide-react';

export default function CaseDetailModal({ caseItem, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!caseItem) return null;

  const handleDownload = async () => {
    setDownloading(true);
    // Simulation d'un téléchargement (remplacer par l'appel API réel)
    // GET /api/v1/cas-cliniques/{caseItem.id}/telecharger
    await new Promise(r => setTimeout(r, 1500));
    setDownloading(false);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);

    // Déclenchement réel du téléchargement quand le backend est prêt :
    // const res = await fetch(`/api/v1/cas-cliniques/${caseItem.id}/telecharger`);
    // const blob = await res.blob();
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a'); a.href = url;
    // a.download = `cas-clinique-${caseItem.id}.pdf`; a.click();
    // URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-(--sf) rounded-2xl shadow-2xl"
        >
          {/* ── Header gradient ── */}
          <div className="sticky top-0 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs opacity-80">Cas clinique</p>
                <h3 className="font-semibold">{caseItem.badge}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Bouton téléchargement */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Téléchargement…
                  </>
                ) : downloaded ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-300" />
                    Téléchargé !
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Titre principal */}
            <h2 className="text-2xl md:text-3xl font-bold text-(--t1) mb-4">
              {caseItem.title}
            </h2>

            {/* Informations patient */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-(--sf2) rounded-xl">
              <div className="flex items-center gap-2 text-sm text-(--t2)">
                <User className="w-4 h-4 text-blue-500" />
                <span>{caseItem.patient.gender} • {caseItem.patient.age}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-(--t2)">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>{caseItem.patient.condition}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-(--t2)">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{caseItem.patient.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-(--t2)">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>{caseItem.patient.date}</span>
              </div>
            </div>

            {/* PRÉSENTATION CLINIQUE */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-(--t1) mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                PRÉSENTATION CLINIQUE
              </h3>
              <div className="bg-(--sf2) rounded-xl p-5">
                <p className="text-(--t2) leading-relaxed">
                  Fièvre à 39.2°C, toux productive purulente, SaO₂ 91%. Diabétique type 2.
                  Crépitants base droite. CRP 142 mg/L. Séroconversion pneumocoque positive.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-(--ln)">
                  {[
                    { icon: Thermometer, color: 'text-red-500',  label: 'Température', value: '39.2°C' },
                    { icon: Droplets,    color: 'text-blue-500', label: 'SaO₂',        value: '91%'   },
                    { icon: Heart,       color: 'text-pink-500', label: 'CRP',         value: '142 mg/L' },
                    { icon: Activity,    color: 'text-green-500',label: 'Toux',        value: 'Productive' },
                  ].map(({ icon: Icon, color, label, value }) => (
                    <div key={label} className="text-center">
                      <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                      <p className="text-xs text-(--t4)">{label}</p>
                      <p className="font-semibold text-(--t1)">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CRITÈRES À VALIDER */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-(--t1) mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-green-500 rounded-full" />
                CRITÈRES À VALIDER
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Syndrome infectieux (fièvre + CRP élevée)',
                  'Opacité alvéolaire segmentaire à la radio',
                  'Désaturation oxymétrique (SaO₂ < 94%)',
                  'Séroconversion pneumocoque positive',
                ].map((criteria, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm text-(--t2)">{criteria}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DIAGNOSTIC IA */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider opacity-90">
                  Diagnostic IA Principal
                </h3>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{caseItem.confidence}%</div>
                  <p className="text-sm opacity-80">Confiance</p>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                    <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${caseItem.confidence}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-(--sf2) rounded-xl p-5">
                <h3 className="font-semibold text-(--t1) mb-3 text-sm uppercase tracking-wider">
                  Diagnostics Différentiels
                </h3>
                <ul className="space-y-2">
                  {['Bronchite aiguë', 'Tuberculose', 'Pneumonie virale'].map((d, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-(--t2)">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* MÉTHODES DE TRAITEMENT */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-(--t1) mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-500 rounded-full" />
                MÉTHODES DE TRAITEMENT
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Antibiothérapie', 'Oxygénothérapie', 'Surveillance glycémique', 'Repos'].map((t, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/30 text-sm rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Médecin référent */}
            <div className="flex items-center justify-between p-4 bg-(--sf2) rounded-xl">
              <div>
                <p className="text-xs text-(--t4)">Médecin référent</p>
                <p className="font-semibold text-(--t1)">{caseItem.doctor}</p>
                <p className="text-sm text-(--t3)">{caseItem.hospital}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-(--t4)">Expérience</p>
                <p className="font-semibold text-(--t1)">{caseItem.experience}</p>
              </div>
            </div>

            {/* ── Boutons d'action ── */}
            <div className="flex flex-wrap gap-3 pt-6 mt-4 border-t border-(--ln)">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-medium transition-all"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : downloaded ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {downloading ? 'Téléchargement…' : downloaded ? 'Téléchargé !' : 'Télécharger PDF'}
              </button>

              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all">
                Cas similaires
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-(--ln) text-(--t2) rounded-xl font-medium hover:bg-(--sf3) transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
