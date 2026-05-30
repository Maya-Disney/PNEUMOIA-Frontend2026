
import { useState } from 'react';
import { motion } from 'framer-motion'; // Animations fluides
import { ArrowRight, Play, X } from 'lucide-react'; // Icônes
import heroDoctor from '../../../assets/images/AccueilImg.png'; // Image du docteur
import demoVideo from '../../../assets/video/demo.mp4'; // Vidéo de démonstration
import RegisterModal from '../../../components/modals/RegisterModal'; // Modal d'inscription

export default function Hero() {
  // État pour contrôler l'affichage de la modal vidéo
  const [showVideo, setShowVideo] = useState(false);
  // État pour contrôler l'affichage de la modal d'inscription
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      {/* Section héros principale - pleine hauteur */}
      <section className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Fond thème */}
        <div className="absolute inset-0 bg-[var(--sf)]"></div>

        {/* Éléments décoratifs avec gradient blur - responsive */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Cercle bleu en haut à gauche */}
          <div className="absolute top-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-blue-400 rounded-full blur-3xl"></div>
          {/* Cercle indigo en bas à droite */}
          <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-indigo-400 rounded-full blur-3xl"></div>
          {/* Cercle violet au centre */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-purple-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            
            {/* Côté gauche - Contenu texte avec animations */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left order-2 lg:order-1 space-y-4 sm:space-y-6"
            >
              {/* Titre principal avec animation d'apparition */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--t1)] leading-tight"
              >
                Respirez l'avenir du{' '}
                <span className="text-blue-600 block sm:inline">diagnostic médical</span>
              </motion.h1>
              
              {/* Paragraphe descriptif */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-base sm:text-lg text-[var(--t2)] leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                Bienvenue sur notre plateforme innovante d'aide au diagnostic pulmonaire. Grâce à l'intelligence artificielle,
                nous accompagnons les professionnels de santé dans une prise de décision rapide,
                fiable et optimisée. Ensemble, améliorons la qualité des soins.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4"
              >
                {/* Bouton primaire "Inscrire maintenant" - ouvre le modal d'inscription */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRegister(true)}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  Inscrire maintenant
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
                
                {/* Bouton secondaire "Voir la démo" - avec texte blanc au hover */}
                <motion.button
                          whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowVideo(true)}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-transparent border-2 border-blue-500 text-blue-500 dark:text-blue-400 dark:border-blue-400 rounded-xl hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  Voir la démo
                  <Play className="w-5 h-4 sm:w-6 sm:h-5" />
                </motion.button>
              </motion.div>
            </motion.div>
            
            {/* Côté droit - Image du médecin avec animations */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative order-1 lg:order-2 w-full max-w-md sm:max-w-lg lg:max-w-none mx-auto lg:max-h-[75vh]"
            >
              {/* Image principale avec animation d'apparition */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative z-10"
              >
                <img
                  src={heroDoctor}
                  alt="Médecin utilisant un outil de diagnostic pneumologique"
                  className="w-full h-auto object-cover lg:max-h-[70vh] object-top"
                />
              </motion.div>
              
              {/* Éléments décoratifs animés - responsive */}
              {/* Cercle animé 1 - bleu, haut droit, pulse continu */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-20 sm:w-32 h-20 sm:h-32 bg-blue-300 rounded-full blur-3xl"
              />
              
              {/* Cercle animé 2 - indigo, bas gauche, pulse en décalage */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -bottom-4 sm:-bottom-8 -left-4 sm:-left-8 w-28 sm:w-40 h-28 sm:h-40 bg-indigo-300 rounded-full blur-3xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modal d'inscription - affichée au clic sur "Inscrire maintenant" */}
      <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} />

      {/* Modal Vidéo - affichée au clic sur "Voir la démo" - responsive */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop noir semi-transparent avec blur */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowVideo(false)} />
          
          {/* Conteneur de la vidéo avec animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 w-full max-w-[95%] sm:max-w-3xl md:max-w-4xl bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Bouton fermer en haut à droite */}
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-1.5 sm:p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </button>
            {/* Conteneur vidéo avec ratio 16:9 */}
            <div className="aspect-video">
              {/* Lecteur vidéo embarqué */}
              <iframe
                width="100%"
                height="100%"
                src={demoVideo}
                title="Démo PneumoDiag"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}