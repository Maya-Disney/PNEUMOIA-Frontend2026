import { motion } from 'framer-motion';
import {
  Activity, Bug, AlertTriangle, Droplets, Wind, Heart,
  Cloud, CircleDot, BarChart3, Shield, Thermometer, Moon,
  AlertCircle, Flower2
} from 'lucide-react';

export default function DetectionSpectrum() {
  const pathologies = [
    { name: "Pneumonie",            description: "Infection bactérienne",        icon: Activity },
    { name: "Asthme",               description: "Obstruction bronchique",        icon: Wind },
    { name: "BPCO",                 description: "Obstruction chronique",         icon: BarChart3 },
    { name: "Tuberculose",          description: "Infection mycobactérienne",     icon: Bug },
    { name: "COVID-19",             description: "Coronavirus SARS-CoV-2",       icon: Shield },
    { name: "Grippe",               description: "Infection virale saisonnière",  icon: Thermometer },
    { name: "Bronchite",            description: "Inflammation bronchique",       icon: Cloud },
    { name: "Cancer Pulmonaire",    description: "Tumeur maligne",               icon: AlertTriangle },
    { name: "Rhinite Allergique",   description: "Réaction immunitaire",          icon: Flower2 },
    { name: "Sinusite",             description: "Inflammation sinusienne",       icon: CircleDot },
    { name: "Mucoviscidose",        description: "Maladie génétique rare",        icon: Heart },
    { name: "Apnée du Sommeil",     description: "Obstruction nocturne",          icon: Moon },
    { name: "Pneumothorax",         description: "Urgence vitale",               icon: AlertCircle },
    { name: "Rhume",                description: "Infection virale légère",       icon: Droplets },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section className="py-20 px-4 bg-(--sf2)">
      <div className="max-w-7xl mx-auto">
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
            <div className="w-16 h-1 bg-blue-600 rounded-full" />
          </div>
          <p className="text-(--t2) max-w-2xl mx-auto">
            Notre algorithme est entraîné pour identifier <strong>14 pathologies</strong> pulmonaires
            et respiratoires avec une fiabilité clinique élevée.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4"
        >
          {pathologies.map((pathology, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-(--sf) rounded-xl p-4 shadow-md border border-(--ln) hover:shadow-lg transition-all hover:border-blue-200 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-3">
                <pathology.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-(--t1) text-xs mb-0.5 leading-tight">
                {pathology.name}
              </h3>
              <p className="text-(--t3) text-[11px] leading-tight">
                {pathology.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
