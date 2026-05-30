import { useState } from 'react';
import { ArrowRight, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RegisterModal from '../../../components/modals/RegisterModal';
import demoVideo from '../../../assets/video/demo.mp4'; // Ajoute ta vidéo dans assets/videos/

export default function CtaSection() {
  const [showVideo, setShowVideo] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <section className="py-20 bg-linear-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          >
            Prêt à révolutionner votre pratique médicale ?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-blue-100"
          >
            Rejoignez la communauté des médecins qui utilisent PneumoIA pour des diagnostics plus précis, rapides et collaboratifs.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {/* Bouton Inscription */}
            <button 
              onClick={() => setShowRegister(true)}
              className="group relative px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <span className="relative z-10">Inscription</span>
              <div className="absolute inset-0 bg-linear-to-r from-gray-100 to-gray-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            
            {/* Bouton Voir la démo */}
            <button 
              onClick={() => setShowVideo(true)}
              className="group relative px-8 py-3 border-2 border-white text-white rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                Voir la démo 
                <Play className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Modal Inscription */}
      <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} />

      {/* Modal Vidéo */}
      <AnimatePresence>
        {showVideo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVideo(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl mx-4"
            >
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                <button
                  onClick={() => setShowVideo(false)}
                  className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                <video 
                  src={demoVideo}
                  className="w-full h-auto"
                  controls
                  autoPlay
                  controlsList="nodownload"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}