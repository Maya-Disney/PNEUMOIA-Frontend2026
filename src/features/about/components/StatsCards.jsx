import { motion } from 'framer-motion';
import { Zap, Target, AlertTriangle } from 'lucide-react';

export default function StatsCards() {
  const stats = [
    {
      icon: Zap,
      title: "Vitesse Record",
      description: "Analyse complète et segmentation en moins de 3 secondes par examen.",
      value: "< 3s",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Target,
      title: "Précision Clinique",
      description: "Taux de concordance prouvé de 99.2% avec les experts seniors.",
      value: "99.2%",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: AlertTriangle,
      title: "Aide au Triage",
      description: "Prioritisation automatique des cas critiques pour les urgences.",
      value: "Niveau 1",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section className="py-20 px-4 bg-[var(--sf)]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-[var(--sf2)] rounded-2xl p-6 shadow-lg border border-[var(--ln)] hover:shadow-xl transition-all"
            >
              {/* Icône */}
              <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center mb-5 shadow-md`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              
              {/* Titre */}
              <h3 className="text-xl font-bold text-[var(--t1)] mb-2">{stat.title}</h3>
              
              {/* Description */}
              <p className="text-[var(--t2)] text-sm leading-relaxed mb-4">
                {stat.description}
              </p>
              
              {/* Valeur */}
              <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}