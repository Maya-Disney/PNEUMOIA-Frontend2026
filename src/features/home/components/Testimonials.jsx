import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function DoctorImg({ src, initials }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return <img src={src} alt={initials} className="w-full h-full object-cover" onError={() => setErr(true)} />;
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
      <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{initials}</span>
    </div>
  );
}

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth,  setWindowWidth]  = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [testimonials, setTestimonials] = useState([]);
  const [empty,        setEmpty]        = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/medecins/public/temoignages`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          setEmpty(true);
          return;
        }
        setTestimonials(data.map((t, i) => ({
          id:       i,
          name:     `Dr. ${t.prenom} ${t.nom}`,
          role:     t.specialite || 'Pneumologue',
          location: t.hopital || 'Cameroun',
          date:     t.date,
          text:     t.texte,
          photo:    t.photo_url,
          initials: `${(t.prenom || '').charAt(0)}${(t.nom || '').charAt(0)}`.toUpperCase(),
        })));
      })
      .catch(() => setEmpty(true));
  }, []);

  const itemsPerPage = windowWidth >= 1024 ? 2 : 1;
  const grouped      = [];
  for (let i = 0; i < testimonials.length; i += itemsPerPage) {
    grouped.push(testimonials.slice(i, i + itemsPerPage));
  }

  useEffect(() => {
    if (grouped.length <= 1) return;
    const id = setInterval(() => setCurrentIndex(p => (p + 1) % grouped.length), 5000);
    return () => clearInterval(id);
  }, [grouped.length]);

  const prev = () => setCurrentIndex(p => (p - 1 + grouped.length) % grouped.length);
  const next = () => setCurrentIndex(p => (p + 1) % grouped.length);

  if (empty) return null;
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-(--sf2)">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-(--t1) mb-3">Témoignages</h2>
          <h3 className="text-3xl md:text-4xl font-semibold text-blue-600 mb-6">
            Ce que les Docteurs pensent de notre plateforme
          </h3>
          <p className="text-(--t2) max-w-3xl mx-auto text-lg leading-relaxed">
            Ils utilisent PneumoIA au quotidien et partagent leur retour sur l'intelligence artificielle
            dans la pratique de la pneumologie.
          </p>
        </div>

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
              {(grouped[currentIndex] ?? []).map(t => (
                <div key={t.id} className="bg-(--sf) rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-blue-100 shadow-md shrink-0">
                      <DoctorImg src={t.photo} initials={t.initials} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-(--t1)">{t.name}</h3>
                      <p className="text-blue-600 font-medium">{t.role}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                    <p className="text-(--t2) leading-relaxed italic">"{t.text}"</p>
                  </div>

                  <div className="flex items-center gap-4 text-(--t3) text-sm">
                    {t.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{t.location}</span>
                      </div>
                    )}
                    {t.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{t.date}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {grouped.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 lg:-ml-8 p-2 bg-(--sf) rounded-full shadow-lg hover:bg-(--sf3) transition-all border border-(--ln)">
                <ChevronLeft className="w-5 h-5 text-(--t2)" />
              </button>
              <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 lg:-mr-8 p-2 bg-(--sf) rounded-full shadow-lg hover:bg-(--sf3) transition-all border border-(--ln)">
                <ChevronRight className="w-5 h-5 text-(--t2)" />
              </button>
            </>
          )}
        </div>

        {grouped.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {grouped.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${currentIndex === idx ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
