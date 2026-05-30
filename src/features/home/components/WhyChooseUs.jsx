import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import doctorImage from '../../../assets/images/AccueilWhy.png';

export default function WhyChooseUsSection() {
  const features = [
    { text: "Diagnostic assisté par IA" },
    { text: "Suivi médical expert" },
    { text: "Gain de temps" },
    { text: "Sécurité des données" },
    { text: "Interface simple & intuitive" }
  ];

  return (
    <section className="py-20 px-4 bg-linear-to-br ml-5 mr-5 from-blue-50 to-(--sf)">
      <div className="max-w-7xl mx-auto">
        {/* Deux cards alignées horizontalement */}
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Card 1 : Image + grand texte + description (alignés verticalement) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            // className="bg-white rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Image */}
            <div className="overflow-hidden">
              <img 
                src={doctorImage}
                alt="Docteur Pneumologue"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Texte en dessous de l'image */}
            <div className="p-6">
              <h3 className="text-2xl md:text-3xl font-bold text-(--t1) mb-4">
                Choisissez le meilleur, choisissez PneumoIA.
              </h3>
              <p className="text-(--t2) leading-relaxed">
                Notre application allie intelligence artificielle et expertise médicale pour offrir un diagnostic 
                rapide, fiable et personnalisé en pneumologie. En nous choisissant, vous optez pour la précision, 
                la réactivité et la qualité. Parce que votre santé respiratoire mérite ce qu'il y a de mieux, 
                faites confiance à une plateforme pensée par et pour les professionnels de la santé.
              </p>
            </div>
          </motion.div>

          {/* Card 2 : "Choisissez nous" + "Pourquoi nous choisir ?" + 5 avantages + bouton */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            // className="bg-white rounded-2xl p-8 shadow-xl flex flex-col justify-center"
          >
            <div className="mb-2">
              <span className="text-blue-600 font-semibold">Choisissez nous</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-6">
              Pourquoi nous choisir ?
            </h2>
            
            {/* Liste des avantages */}
            <div className="space-y-4 mb-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-(--t2)">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Bouton */}
            <button className="group flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:shadow-lg w-full md:w-auto">
              Trouver un spécialiste
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}