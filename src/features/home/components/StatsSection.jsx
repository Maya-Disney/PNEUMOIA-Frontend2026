import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Users, Stethoscope, Brain, Star } from 'lucide-react';

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const stats = [
    {
      icon: Users,
      value: "5k+",
      label: "Médecins"
    },
    {
      icon: Stethoscope,
      value: "25k+",
      label: "Consultations"
    },
    {
      icon: Brain,
      value: "90%",
      label: "précision IA"
    },
    {
      icon: Star,
      value: "90%",
      label: "Trustpilot"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section ref={ref} className="py-16 px-4 bg-linear-to-r from-blue-600 to-indigo-600">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="text-center text-white"
            >
              <div className="flex justify-center mb-3">
                <stat.icon className="w-10 h-10 opacity-80" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}