import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import doctor1 from '../../../assets/images/doctor1.jpeg';
import doctor2 from '../../../assets/images/doctor2.jpeg';
import doctor3 from '../../../assets/images/doctor3.jpeg';
import doctor4 from '../../../assets/images/doctor4.jpeg';
import doctor5 from '../../../assets/images/doctor3.jpeg';
import doctor6 from '../../../assets/images/doctor2.jpeg';

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const testimonials = [
    {
      id: 1,
      name: "Laticia Pablo Roys",
      role: "Pneumologue",
      location: "Nord Cameroun",
      date: "2026.04.06",
      text: "Grâce à cette application, je gagne plus de temps et je me rends compte que l'association IA et Medecin est très efficace.",
      image: doctor1
    },
    {
      id: 2,
      name: "Laticia Pablo Roys",
      role: "Pneumologue",
      location: "Nord Cameroun",
      date: "2026.04.06",
      text: "Grâce à cette application, je gagne plus de temps et je me rends compte que l'association IA et Medecin est très efficace.",
      image: doctor2
    },
    {
      id: 3,
      name: "Dr. Marie Lambert",
      role: "Pneumologue",
      location: "Paris, France",
      date: "2026.03.15",
      text: "Une plateforme révolutionnaire qui change notre pratique quotidienne. L'intelligence artificielle est d'une précision remarquable.",
      image: doctor3
    },
    {
      id: 4,
      name: "Dr. Thomas Bernard",
      role: "Chef de service",
      location: "Lyon, France",
      date: "2026.02.28",
      text: "La fiabilité des résultats et la fluidité de l'interface en font un outil indispensable pour notre équipe.",
      image: doctor4
    },
    {
      id: 5,
      name: "Dr. Sarah Kone",
      role: "Pneumologue",
      location: "Abidjan, Côte d'Ivoire",
      date: "2026.04.10",
      text: "L'association IA et expertise médicale est un véritable gain de temps. Mes patients bénéficient de diagnostics plus rapides.",
      image: doctor5
    },
    {
      id: 6,
      name: "Dr. Jean Dupont",
      role: "Pneumologue",
      location: "Dakar, Sénégal",
      date: "2026.03.20",
      text: "PneumoDiag a transformé ma pratique quotidienne. Un outil indispensable pour tout pneumologue moderne.",
      image: doctor6
    }
  ];

  // Nombre de témoignages à afficher selon la taille d'écran
  const itemsPerPage = windowWidth >= 1024 ? 2 : 1;
  
  // Grouper les témoignages par pages
  const groupedTestimonials = [];
  for (let i = 0; i < testimonials.length; i += itemsPerPage) {
    groupedTestimonials.push(testimonials.slice(i, i + itemsPerPage));
  }

  // Auto-défilement toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % groupedTestimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [groupedTestimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % groupedTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + groupedTestimonials.length) % groupedTestimonials.length);
  };

  return (
    <section className="py-20 px-4 bg-[var(--sf2)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--t1)] mb-3">Témoignages</h2>
          <h3 className="text-3xl md:text-4xl font-semibold text-blue-600 mb-6">
            Ce que les Docteurs pensent de notre plateforme
          </h3>
          <p className="text-[var(--t2)] max-w-3xl mx-auto text-lg leading-relaxed">
            Derrière chaque diagnostic, il y a des médecins passionnés, engagés et expérimentés. 
            Notre équipe regroupe des spécialistes en pneumologie qui allient savoir médical et 
            intelligence artificielle pour vous offrir un accompagnement fiable, humain et personnalisé.
          </p>
        </div>

        {/* Carrousel */}
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
              {(groupedTestimonials[currentIndex] ?? []).map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-[var(--sf)] rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all"
                >
                  {/* Image et nom */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-blue-100 shadow-md shrink-0">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--t1)]">{testimonial.name}</h3>
                      <p className="text-blue-600 font-medium">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  {/* Texte */}
                  <p className="text-[var(--t2)] leading-relaxed mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  
                  {/* Localisation et date */}
                  <div className="flex items-center gap-4 text-[var(--t2)] text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{testimonial.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{testimonial.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Boutons de navigation */}
          {groupedTestimonials.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 lg:-ml-8 p-2 bg-[var(--sf)] rounded-full shadow-lg hover:bg-[var(--sf3)] transition-all border border-[var(--ln)]"
              >
                <ChevronLeft className="w-5 h-5 text-(--t2)" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 lg:-mr-8 p-2 bg-[var(--sf)] rounded-full shadow-lg hover:bg-[var(--sf3)] transition-all border border-[var(--ln)]"
              >
                <ChevronRight className="w-5 h-5 text-[var(--t2)]" />
              </button>
            </>
          )}
        </div>

        {/* Points indicateurs */}
        {groupedTestimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {groupedTestimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-6 bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}