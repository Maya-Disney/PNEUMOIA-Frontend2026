// SYSTEME DE FILTRE  CAS-CLINIQUE PATHOLOGIE ET BARRE DE RECHERCHE
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';

export default function SearchFilter() {
  const filters = ["Toute", "Tuberculose", "Asthme", "BPCO", "Pneumonie", "Cancer"];

  return (
    <section className="py-16 px-4 bg-[var(--sf2)]">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-blue-600 font-medium text-sm uppercase tracking-wider mb-2">Bibliothèque</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--t1)] mb-4">
            Explorer les cas cliniques
          </h2>
          <p className="text-[var(--t2)] max-w-2xl mx-auto">
            Cliquez sur un cas pour voir la démarche IA complète. Connectez-vous pour accéder à tous les détails.
          </p>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          <span className="text-sm font-medium text-[var(--t2)]">Filtrer:</span>
          {filters.map((filter, idx) => (
            <button
              key={idx}
              className="px-4 py-2 text-sm rounded-full border border-[var(--ln)] bg-[var(--sf)] text-[var(--t2)] hover:border-blue-400 hover:text-blue-600 transition-all"
            >
              {filter}
            </button>
          ))}
        </motion.div>

        {/* Barre de recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--t4)]" />
            <input
              type="text"
              placeholder="Rechercher un cas clinique..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--ln)] bg-[var(--sf)] text-[var(--t1)] placeholder:text-[var(--t4)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
