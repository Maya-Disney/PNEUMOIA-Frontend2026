import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Zap, Brain, Clock, FolderKanban } from 'lucide-react';

export default function StateSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const stats = [
    {
      id: 1,
      icon: Zap,
      title: "Diagnostic express",
      description: "L'IA permet une détection plus rapide des maladies pulmonaires avec une grande fiabilité.",
      bgColor: "bg-(--sf)/90",
      iconBg: "bg-linear-to-br from-blue-500 to-blue-600",
      textColor: "text-(--t1)",
      descColor: "text-(--t2)"
    },
    {
      id: 2,
      icon: Brain,
      title: "Intelligence médicale",
      description: "Elle accompagne les professionnels dans l'interprétation des données cliniques pour des choix éclairés.",
      bgColor: "bg-blue-600",
      iconBg: "bg-white/20",
      textColor: "text-white",
      descColor: "text-blue-100"
    },
    {
      id: 3,
      icon: Clock,
      title: "Gain de temps",
      description: "Automatisation de certaines analyses pour alléger la charge de travail et se concentrer sur l'essentiel.",
      bgColor: "bg-white/70",
      iconBg: "bg-blue-600",
      textColor: "text-(--t1)",
      descColor: "text-(--t2)"
    },
    {
      id: 4,
      icon: FolderKanban,
      title: "Suivi centralisé",
      description: "Gestion simplifiée des dossiers patients, avec un historique consultable à tout moment.",
      bgColor: "bg-white/70",
      iconBg: "bg-blue-600",
      textColor: "text-(--t1)",
      descColor: "text-(--t2)"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              className={`
                relative overflow-hidden rounded-2xl p-6 backdrop-blur-md transition-all duration-300 shadow-lg
                ${stat.bgColor} hover:shadow-2xl
              `}
            >
              {/* Icône */}
              <div className="flex justify-center mb-4">
                <div className={`
                  w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
                  ${stat.iconBg}
                `}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              
              {/* Titre */}
              <div className="text-center">
                <h3 className={`text-lg font-semibold mb-2 ${stat.textColor}`}>
                  {stat.title}
                </h3>
                <p className={`text-sm ${stat.descColor} leading-relaxed`}>
                  {stat.description}
                </p>
              </div>
              
              {/* Effet de brillance au hover */}
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-full hover:translate-x-[-200%] transition-transform duration-1000"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}