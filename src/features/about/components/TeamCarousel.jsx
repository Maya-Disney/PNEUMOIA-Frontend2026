import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TeamCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  const teamMembers = [
    { id: 1, name: "Pouqoum Paule", role: "Backend Dev", description: "15 ans à l'hôpital Général de Douala. Il voulait que son expérience serve au-delà de son cabinet." },
    { id: 2, name: "Jean Dupont", role: "Pneumologue", description: "Expert en pathologies respiratoires chroniques." },
    { id: 3, name: "Marie Camara", role: "Chef de service", description: "Spécialiste en imagerie pulmonaire." },
    { id: 4, name: "Paul Ngassa", role: "Data Scientist", description: "Expert en IA médicale." },
    { id: 5, name: "Sophie Laurent", role: "Chercheur", description: "Doctorante en pneumologie." },
    { id: 6, name: "Alain Mbarga", role: "Backend Dev", description: "Passionné par la technologie médicale." },
    { id: 7, name: "Claire Ngo", role: "UX Designer", description: "Conçoit des interfaces intuitives." },
    { id: 8, name: "David Fouda", role: "Pneumologue", description: "Expert en pathologies respiratoires." },
    { id: 9, name: "Elise Tchinda", role: "Chef de projet", description: "Coordinatrice de l'équipe." }
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(teamMembers.length / itemsPerPage);
  const currentMembers = teamMembers.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('');

  const next = () => setCurrentIndex((prev) => (prev + 1) % totalPages);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);

  return (
    <section className="py-20 px-4 bg-(--sf2)">
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-4">Equipe de Travail</h2>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
          </div>
          <p className="text-(--t2) max-w-2xl mx-auto">
            Notre équipe regroupe des experts passionnés, engagés à mettre la technologie au service de la santé.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative px-8 md:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {currentMembers.map((member) => (
                <div key={member.id} className="bg-(--sf) rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all flex flex-col h-full">
                  {/* Abréviation + Nom + Rôle alignés à gauche */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-white">
                        {getInitials(member.name)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-(--t1)">{member.name}</h3>
                      <p className="text-blue-600 font-medium text-sm">{member.role}</p>
                    </div>
                  </div>
                  
                  {/* Description en bas */}
                  <p className="text-(--t3) text-sm leading-relaxed mt-auto">
                    {member.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {totalPages > 1 && (
            <>
              <button 
                onClick={prev} 
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-(--sf) rounded-full shadow-lg hover:bg-(--sf2) transition-all border border-(--ln)"
              >
                <ChevronLeft className="w-6 h-6 text-(--t2)" />
              </button>
              <button 
                onClick={next} 
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-(--sf) rounded-full shadow-lg hover:bg-(--sf2) transition-all border border-(--ln)"
              >
                <ChevronRight className="w-6 h-6 text-(--t2)" />
              </button>
            </>
          )}
        </div>

        {/* Points */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentIndex(idx)} 
                className={`w-2 h-2 rounded-full transition-all ${currentIndex === idx ? 'w-6 bg-blue-600' : 'bg-(--ln)'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}