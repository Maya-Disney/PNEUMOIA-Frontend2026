import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth]   = useState(window.innerWidth);

  useEffect(() => {
    fetch(`${API_BASE}/medecins/public/temoignages`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setTestimonials(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsPerPage = windowWidth >= 1024 ? 2 : 1;

  const groupedTestimonials = [];
  for (let i = 0; i < testimonials.length; i += itemsPerPage) {
    groupedTestimonials.push(testimonials.slice(i, i + itemsPerPage));
  }

  useEffect(() => {
    if (groupedTestimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % groupedTestimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [groupedTestimonials.length]);

  const next = () => setCurrentIndex(prev => (prev + 1) % groupedTestimonials.length);
  const prev = () => setCurrentIndex(prev => (prev - 1 + groupedTestimonials.length) % groupedTestimonials.length);

  return (
    <section className="py-20 px-4 bg-(--sf2)">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-(--t1) mb-3">Témoignages</h2>
          <h3 className="text-3xl md:text-4xl font-semibold text-blue-600 mb-6">
            Ce que les Docteurs pensent de notre plateforme
          </h3>
          <p className="text-(--t2) max-w-3xl mx-auto text-lg leading-relaxed">
            Derrière chaque diagnostic, il y a des médecins passionnés, engagés et expérimentés.
            Notre équipe regroupe des spécialistes en pneumologie qui allient savoir médical et
            intelligence artificielle pour vous offrir un accompagnement fiable, humain et personnalisé.
          </p>
        </div>

        {/* Contenu : carrousel ou état vide */}
        {testimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-(--t4)">
            <Quote className="w-12 h-12 opacity-30" />
            <p className="text-lg font-medium text-center">Les témoignages des médecins seront bientôt disponibles.</p>
            <p className="text-sm text-center opacity-70">
              Connectez-vous et partagez votre expérience via l'onglet "Mon témoignage".
            </p>
          </div>
        ) : (
          <>
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {(groupedTestimonials[currentIndex] ?? []).map((t, i) => {
                    const initials = `${(t.prenom || '')[0] || ''}${(t.nom || '')[0] || ''}`.toUpperCase();
                    return (
                      <div
                        key={i}
                        className="bg-(--sf) rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all"
                      >
                        {/* Avatar + nom */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-blue-100 shadow-md shrink-0">
                            {t.photo_url ? (
                              <img src={t.photo_url} alt={`${t.prenom} ${t.nom}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                                {initials || '?'}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-(--t1)">
                              Dr. {t.prenom} {t.nom}
                            </h3>
                            <p className="text-blue-600 font-medium">{t.specialite || 'Pneumologue'}</p>
                          </div>
                        </div>

                        {/* Étoiles */}
                        {t.note > 0 && (
                          <div className="flex gap-0.5 mb-3">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${s <= t.note ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                        )}

                        {/* Texte */}
                        <p className="text-(--t2) leading-relaxed mb-6 italic">
                          &ldquo;{t.texte}&rdquo;
                        </p>

                        {/* Localisation et date */}
                        <div className="flex items-center gap-4 text-(--t2) text-sm">
                          {(t.ville || t.hopital) && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{t.ville || t.hopital}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{t.date}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              {groupedTestimonials.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 lg:-ml-8 p-2 bg-(--sf) rounded-full shadow-lg hover:bg-(--sf3) transition-all border border-(--ln)"
                  >
                    <ChevronLeft className="w-5 h-5 text-(--t2)" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 lg:-mr-8 p-2 bg-(--sf) rounded-full shadow-lg hover:bg-(--sf3) transition-all border border-(--ln)"
                  >
                    <ChevronRight className="w-5 h-5 text-(--t2)" />
                  </button>
                </>
              )}
            </div>

            {/* Indicateurs */}
            {groupedTestimonials.length > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {groupedTestimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      currentIndex === idx ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
