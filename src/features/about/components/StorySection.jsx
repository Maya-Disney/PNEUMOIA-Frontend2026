import { motion } from 'framer-motion';
import doctorStory from '../../../assets/images/tools.png'; // Ajoute ton image

export default function StorySection() {
  const stats = [
    { value: "807", label: "CONSULTATION DE VALIDATION" },
    { value: "80%", label: "CONCORDANCE MÉDICINAIRE" },
    { value: "+25", label: "PRÉUMOLOGUE ACTIF" }
  ];

  return (
    <section className="py-20 px-4 bg-[var(--sf)]">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Côté gauche - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-2xl shadow-2xl">
              <img 
                src={doctorStory}
                alt="Docteur consultant un patient"
                className="w-full h-auto object-cover"
              /> 
            </div>
          </motion.div>

          {/* Côté droit - Texte */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* ORIGINE */}
            <div className="mb-2">
              <span className="text-blue-600 font-semibold text-sm tracking-wider">ORIGINE</span>
            </div>
            
            {/* Titre */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--t1)] mb-2">
              Un même patient.
            </h2>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-blue-600 dark:text-blue-300 mb-6">
              Deux diagnostics différents.
            </h3>
            
            {/* Description */}
            <p className="text-[var(--t2)] leading-relaxed mb-8">
              En 2024, un pneumologue de Douala reçoit un patient en détresse respiratoire. Son confrère 
              l'avait examiné la veille et posé une conclusion différente. Ni l'un ni l'autre n'avait tort 
              – il n'existait simplement pas de cadre commun.
              <br /><br />
              En mars 2025, trois pneumologues commencent à écrire. Pas du code – des questions cliniques. 
              Pendant des mois, ils mettent en forme leur expérience collective jusqu'à ce que deux médecins 
              différents, face au même patient, arrivent à la même conclusion.
            </p>

            {/* Statistiques */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--ln)]">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-300">{stat.value}</div>
                  <div className="text-xs text-[var(--t3)] mt-1 leading-tight">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
