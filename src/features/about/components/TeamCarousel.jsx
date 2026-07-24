import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TeamCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  const teamMembers = [
    { id: 1, name: "Mayang Marc Arthur", role: "Chef de projet", description: "Il orchestre chaque étape du projet avec rigueur et vision. Son leadership assure la cohérence entre toutes les équipes techniques." },
    { id: 2, name: "Maya Disney Olive", role: "Développeuse Backend", description: "Elle conçoit une architecture robuste et sécurisée pour toute la plateforme. Passionnée par la fiabilité des systèmes, elle veille à la performance des APIs." },
    { id: 3, name: "Pougoum Kiepouo Paule R.", role: "Développeuse Backend", description: "Elle construit les fondations logiques qui font tourner PneumoIA au quotidien. Rigoureuse et méthodique, elle transforme chaque besoin métier en code fiable." },
    { id: 4, name: "Doungmo Lagoung Valdes", role: "Développeur Frontend", description: "Il donne vie aux interfaces avec fluidité et précision. Son souci du détail rend chaque écran agréable à utiliser." },
    { id: 5, name: "Bete Owatta Junior C.", role: "Développeur Frontend", description: "Il traduit les maquettes en expériences interactives et réactives. Toujours à l'écoute des utilisateurs, il peaufine chaque interaction." },
    { id: 6, name: "Djeuha Jumeli Alex T.", role: "Analyste de données", description: "Il transforme les données brutes en informations exploitables pour l'équipe médicale. Son regard analytique éclaire les décisions stratégiques du projet." },
    { id: 7, name: "Bechem Laura Antonia F.", role: "Designeuse UI/UX", description: "Elle imagine des parcours utilisateurs simples et intuitifs. Son sens esthétique donne à PneumoIA une identité visuelle chaleureuse et professionnelle." },
    { id: 8, name: "Nsenga Nana Megane Larissa", role: "Designeuse UI/UX", description: "Elle place l'utilisateur au centre de chaque interface qu'elle conçoit. Créative et attentive, elle veille à l'accessibilité de chaque écran." },
    { id: 9, name: "Faith Ekei", role: "Testeuse", description: "Elle traque la moindre anomalie avant qu'elle n'atteigne les utilisateurs. Sa rigueur garantit la stabilité de chaque nouvelle fonctionnalité." },
    { id: 10, name: "Ngwa Alan Ferry", role: "Testeur", description: "Il s'assure que chaque parcours fonctionne sans accroc, sur tous les scénarios possibles. Sa patience et sa précision renforcent la qualité globale du produit." }
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