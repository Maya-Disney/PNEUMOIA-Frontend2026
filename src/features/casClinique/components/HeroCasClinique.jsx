import { motion } from 'framer-motion';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import heroImage from '../../../assets/images/cible.webp';
import RegisterModal from '../../../components/modals/RegisterModal';

export default function HeroCasClinique() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const pathologies = [
    { name: "Tuberculose", color: "bg-purple-500" },
    { name: "Asthme", color: "bg-green-500" },
    { name: "BPCO", color: "bg-orange-500" },
    { name: "Pneumonie", color: "bg-red-500" },
    { name: "+6 Autres", color: "bg-gray-500" }
  ];

  return (
    <>
      <section className="pt-32 pb-16 px-4 bg-linear-to-br from-blue-50 via-(--sf) to-indigo-50 dark:from-(--sf) dark:via-(--bg) dark:to-(--sf2)">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Côté gauche - Texte */}
            <div className="text-center lg:text-left">
              {/* Petit indicateur */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm mb-6"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Cas clinique</span>
              </motion.div>

              {/* Titre principal */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-(--t1) mb-4"
              >
                Cas cliniques
              </motion.h1>

              {/* Sous-titre */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-2xl md:text-3xl lg:text-4xl font-semibold text-(--t1) mb-2"
              >
                247 cas réels.
              </motion.h2>
              <motion.h3
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-xl md:text-2xl lg:text-3xl text-blue-600 dark:text-blue-300 mb-6"
              >
                Anonymisés. Enrichis par des experts.
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base md:text-lg text-(--t2) leading-relaxed mb-6"
              >
                Une bibliothèque vivante de cas cliniques pulmonaires partagés par les pneumologues de la région CEMAC.
                Chaque cas illustre la démarche IA et la validation médicale finale.
              </motion.p>

              {/* Liste des pathologies avec cercles colorés */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-8"
              >
                {pathologies.map((patho, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-(--sf)/80 backdrop-blur-sm rounded-full text-sm text-(--t2) border border-(--ln) shadow-sm"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${patho.color}`}></span>
                    {patho.name}
                  </span>
                ))}
              </motion.div>

              {/* Boutons d'action */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:shadow-lg">
                  Parcourir les cas
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setIsRegisterOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-(--ln2) text-(--t2) rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-300 transition-all"
                >
                  Accès médecin
                </button>
              </motion.div>
            </div>

            {/* Côté droit - Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage}
                  alt="Cas cliniques"
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modale d'inscription */}
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
      />
    </>
  );
}
