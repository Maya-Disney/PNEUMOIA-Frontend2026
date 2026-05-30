// src/features/medecin/components/StatsCards.jsx
import { motion } from 'framer-motion';
import {
  Users, Stethoscope, AlertCircle, Share2
} from 'lucide-react';
 
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};
 
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};
 
export function StatsCards({ stats, totalPatients }) {
  const cards = [
    {
      label: 'Total patients',
      value: totalPatients,
      trend: '+12 ce trimestre',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Consultés ce mois',
      value: stats.consultationsMonth,
      trend: '+5 vs février',
      icon: Stethoscope,
      color: 'emerald',
    },
    {
      label: 'Suivis urgents',
      value: stats.urgent,
      trend: 'Action requise',
      icon: AlertCircle,
      color: 'rose',
    },
    {
      label: 'Dossiers partagés',
      value: stats.shared,
      trend: 'Actifs',
      icon: Share2,
      color: 'indigo',
    },
  ];
 
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const colorMap = {
          blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
          emerald:
            'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
          rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
          indigo:
            'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
        };
 
        return (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-(--sf) rounded-xl border border-(--ln) shadow-sm p-5"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${colorMap[card.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {card.trend}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold text-(--t1)">
                {card.value}
              </p>
              <p className="text-sm text-(--t3) mt-1">
                {card.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
