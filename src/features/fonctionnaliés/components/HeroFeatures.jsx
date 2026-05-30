import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Cpu, Brain } from 'lucide-react';
import heroFeaturesImg from '../../../assets/images/doctor1.jpeg';

export default function HeroFeatures() {
  const scrollToFeatures = () => {
    const element = document.getElementById('diagnostic-ia');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-32 pb-12 px-4 bg-linear-to-br from-(--sf) via-(--bg) to-(--sf2)">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Texte à gauche */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>Plateforme complète</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-(--t1) mb-4"
            >
              Tout ce dont vous avez besoin{' '}
              <span className="text-blue-600">en un seul endroit</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-(--t2) leading-relaxed mb-8"
            >
              Diagnostic assisté par IA, bibliothèque de cas cliniques, communauté médicale, 
              espace personnel, statistiques, ressources pédagogiques et rapports automatisés.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={scrollToFeatures}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:shadow-lg"
              >
                Découvrir les fonctionnalités
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-(--ln)"
            >
              <div className="flex items-center gap-2 text-sm text-(--t3)">
                <Cpu className="w-4 h-4 text-blue-500" />
                <span>IA 99.2% précision</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-(--t3)">
                <Brain className="w-4 h-4 text-blue-500" />
                <span>10 pathologies</span>
              </div>
            </motion.div>
          </div>
          
          {/* Image à droite */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="w-4/5 max-w-md">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={heroFeaturesImg}
                  alt="Fonctionnalités PneumoIA"
                  className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
