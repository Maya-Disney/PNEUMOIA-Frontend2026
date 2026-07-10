import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Activity, Award,
  Stethoscope, Loader2, AlertCircle, Eye,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const ITEMS_PER_PAGE = 6;

function mapRessource(r) {
  return {
    id: r.id,
    badge: r.pathologie || 'Général',
    pathology: r.pathologie || 'Général',
    title: r.titre,
    symptoms: r.resume || '',
    patient: {
      gender: '—',
      age: '—',
      condition: Array.isArray(r.tags) && r.tags.length ? r.tags.join(', ') : '—',
      location: '—',
      date: (r.created_at || r.time) ? new Date(r.created_at || r.time).toLocaleDateString('fr-FR') : '—',
    },
    doctor: r.medecin_id || '—',
    hospital: null,
    experience: null,
    confidence: null,
    has_pdf: r.has_pdf,
    nb_vues: r.nb_vues ?? 0,
    nb_telechargements: r.nb_telechargements ?? 0,
    niveau: r.niveau,
    tags: r.tags,
  };
}

export default function CasesGrid({ filter = 'Toute', searchTerm = '', onCaseClick }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { setCurrentPage(1); }, [filter, searchTerm]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: currentPage, limite: ITEMS_PER_PAGE });
    if (filter && filter !== 'Toute') params.set('pathologie', filter);
    if (searchTerm) params.set('recherche', searchTerm);

    fetch(`${API_URL}/ressources?${params}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.json(); })
      .then(data => {
        setCases((data.data || []).map(mapRessource));
        setTotalPages(data.pages || 1);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Erreur de chargement');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [filter, searchTerm, currentPage]);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-linear-to-b from-(--sf2) to-(--sf)">
        <div className="max-w-7xl mx-auto flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-linear-to-b from-(--sf2) to-(--sf)">
        <div className="max-w-7xl mx-auto flex flex-col items-center py-16 gap-3 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="font-semibold text-(--t2)">Impossible de charger les ressources</p>
          <p className="text-xs text-(--t4)">{error}</p>
        </div>
      </section>
    );
  }

  if (cases.length === 0) {
    return (
      <section className="py-16 px-4 bg-linear-to-b from-(--sf2) to-(--sf)">
        <div className="max-w-7xl mx-auto py-20 text-center text-(--t3)">
          Aucune ressource trouvée
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-linear-to-b from-(--sf2) to-(--sf)">
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {cases.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => onCaseClick?.(c)}
                  className="group bg-(--sf2) rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-(--ln)"
                >
                  <div className="h-1 bg-linear-to-r from-blue-500 to-indigo-600" />

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                        {c.badge}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <Stethoscope className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <h3 className="font-bold text-lg text-(--t1) mb-2 leading-tight line-clamp-2">
                      {c.title}
                    </h3>

                    <p className="text-(--t2) text-xs leading-relaxed mb-4 line-clamp-2">
                      {c.symptoms}
                    </p>

                    <div className="space-y-1.5 mb-4">
                      {c.niveau && (
                        <div className="flex items-center gap-2 text-xs text-(--t2)">
                          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                            <Award className="w-3 h-3 text-blue-600" />
                          </div>
                          <span>{c.niveau}</span>
                        </div>
                      )}
                      {Array.isArray(c.tags) && c.tags.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-(--t2)">
                          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                            <Activity className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="line-clamp-1">{c.tags.join(', ')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-(--t2)">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                          <Eye className="w-3 h-3 text-blue-600" />
                        </div>
                        <span>{c.nb_vues} vue{c.nb_vues !== 1 ? 's' : ''} · {c.patient.date}</span>
                      </div>
                    </div>

                    <div className="border-t border-(--ln) my-4" />

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-(--t4)">Publié le</p>
                        <p className="font-medium text-sm text-(--t1) mt-0.5">{c.patient.date}</p>
                      </div>
                      {c.has_pdf && (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          PDF disponible
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {totalPages > 1 && (
            <>
              <button onClick={prevPage} disabled={currentPage === 1}
                className="absolute -top-13 right-25 p-2 bg-(--sf) rounded-full shadow-lg border border-(--ln) disabled:opacity-50 hover:bg-(--sf2)">
                <ChevronLeft className="w-5 h-5 text-(--t2)" />
              </button>
              <button onClick={nextPage} disabled={currentPage === totalPages}
                className="absolute -top-13 right-12 p-2 bg-(--sf) rounded-full shadow-lg border border-(--ln) disabled:opacity-50 hover:bg-(--sf2)">
                <ChevronRight className="w-5 h-5 text-(--t2)" />
              </button>
            </>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === 1 ? 'bg-blue-600 text-white' : 'bg-(--sf) border border-(--ln) hover:bg-(--sf2) text-(--t2)'}`}>
              1
            </button>
            {currentPage > 2 && <span className="text-(--t4)">...</span>}
            {currentPage > 1 && currentPage < totalPages && (
              <button className="w-8 h-8 rounded-lg text-sm font-medium bg-blue-600 text-white">
                {currentPage}
              </button>
            )}
            {currentPage < totalPages - 2 && <span className="text-(--t4)">...</span>}
            {totalPages > 1 && (
              <button onClick={() => setCurrentPage(totalPages)}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'bg-(--sf) border border-(--ln) hover:bg-(--sf2) text-(--t2)'}`}>
                {totalPages}
              </button>
            )}
          </div>
        )}

        <div className="text-center mt-4 text-xs text-(--t4)">
          {total} ressource{total > 1 ? 's' : ''} · Page {currentPage} / {totalPages}
        </div>
      </div>
    </section>
  );
}
