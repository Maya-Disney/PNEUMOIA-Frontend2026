import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AccueilAbout from '../../../assets/images/AccueilAbout.jpeg';

export default function AboutSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-20 px-4 bg-(--sf) overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Côté gauche - Texte */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className='md:mt-20 lg:-mt-35'>
              <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-4">
                Qui sommes nous ?
              </h2>
              <p className="text-(--t2) leading-relaxed">
                Nous sommes une équipe passionnée par l'innovation médicale, spécialisée dans la création 
                de solutions intelligentes pour faciliter le diagnostic en pneumologie. Notre mission est 
                simple : vous aider à trouver la solution adaptée à vos besoins de santé grâce à la technologie.
              </p>
              <a 
                href="/apropos"
                className="inline-flex items-center gap-1 mt-4 text-blue-600 font-medium hover:gap-2 transition-all"
              >
                Lire plus <ChevronRight className="w-4 h-4" />
              </a>
            </div>
           
          </motion.div>

          {/* Côté droit - Image avec texte superposé flottant */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={AccueilAbout}
                // src="../../../assets/images/AccueilAbout.jpeg"
                alt="Qui sommes nous"
                className="w-180 h-130 object-cover"
                onError={(e) => {
                  e.target.src = "https://placehold.co/600x500/blue/white?text=PneumoDiag";
                }}
              />
            </div>
            
            {/* Texte superposé flottant - animation constante */}
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -left-4 md:-left-40 bottom-8 md:bottom-12 bg-(--sf)/95 backdrop-blur-sm rounded-xl p-4 md:p-5 shadow-xl max-w-[80%] md:max-w-[75%] border-l-4 border-blue-500"
            >
              {/* <p className="text-gray-800 text-base md:text-lg font-semibold leading-relaxed">
                "La technologie au service d'une médecine plus humaine et plus précise"
              </p> */}

               <div>
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                À la recherche de soulagement ?
              </h3>
              <p className="text-(--t2) leading-relaxed">
                Nous mettons la technologie au service de votre santé pour vous offrir un accompagnement 
                fiable, humain et précis.
              </p>
            </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}