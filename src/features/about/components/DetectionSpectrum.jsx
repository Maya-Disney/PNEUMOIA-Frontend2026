import { motion } from 'framer-motion';
import { Activity, Bug, AlertTriangle, Droplets, Wind, Heart, Cloud, CircleDot, Circle, BarChart3 } from 'lucide-react';

export default function DetectionSpectrum() {
  const pathologies = [
    { name: "Pneumonie", description: "Infection aiguë", icon: Activity },
    { name: "Tuberculose", description: "Déplissage précoce", icon: Bug },
    { name: "Pneumothorax", description: "Urgence vitale", icon: AlertTriangle },
    { name: "COVID-19", description: "Signes radiologiques", icon: Heart },
    { name: "Effusion", description: "Liquide pleural", icon: Droplets },
    { name: "Atélectasie", description: "Collapsus alvéolaire", icon: Wind },
    { name: "Infiltration", description: "Opacités diffuses", icon: Cloud },
    { name: "Masse", description: "Lésions > 3cm", icon: CircleDot },
    { name: "Nodule", description: "Lésions < 3cm", icon: Circle },
    { name: "Fibrose", description: "Cicatrisation", icon: BarChart3 }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <section className="py-20 px-4 bg-(--sf2)">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-4">
            Spectre de détection
          </h2>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
          </div>
          <p className="text-(--t2) max-w-2xl mx-auto">
            Notre algorithme est entraîné sur plus de 2 millions de clichés pour identifier 10 pathologies 
            pulmonaires avec une fiabilité inégalée.
          </p>
        </motion.div>

        {/* Grille des pathologies */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5"
        >
          {pathologies.map((pathology, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-(--sf) rounded-xl p-5 shadow-md border border-(--ln) hover:shadow-lg transition-all hover:border-blue-200"
            >
              {/* Icône uniforme en bleu */}
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                  <pathology.icon className="w-7 h-7 text-blue-600" />
                </div>
              </div>
              
              {/* Titre */}
              <h3 className="font-bold text-(--t1) text-center text-sm mb-1">
                {pathology.name}
              </h3>
              
              {/* Description */}
              <p className="text-(--t3) text-center text-xs">
                {pathology.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}