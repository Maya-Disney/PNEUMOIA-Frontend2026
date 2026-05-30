// src/features/casClinique/components/StatsCards.jsx
import { motion } from 'framer-motion';

export default function StatsCards() {
  const stats = [
    { value: "247", label: "Cas partagés" },
    { value: "80%", label: "Concordance" },
    { value: "+25", label: "Pneumologues" },
    { value: "15min", label: "Décision rapide" }
  ];

  return (
    <div className="w-full bg-(--sf)">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ 
              backgroundColor: "#E6F2FF",
              transition: { duration: 0.08 }
            }}
            className="py-8 text-center border-r border-(--ln) last:border-r-0 cursor-pointer transition-all duration-200"
          >
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1 group-hover:text-blue-700">
              {stat.value}
            </div>
            <div className="text-sm text-(--t3)">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}