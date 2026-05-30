import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "D'où naît l'idée de créer une telle application ?",
      answer: "L'idée est née du constat que plusieurs pneumologues pouvaient poser des diagnostics différents pour un même patient, faute de cadre commun. En mars 2025, trois pneumologues ont commencé à formaliser leur expérience collective pour créer une plateforme d'aide au diagnostic."
    },
    {
      question: "Comment fonctionne l'intelligence artificielle ?",
      answer: "Notre IA est entraînée sur plus de 2 millions de clichés radiologiques. Elle analyse les images pulmonaires et identifie les pathologies avec une précision de 99.2%, en se basant sur des critères cliniques validés par des experts."
    },
    {
      question: "Les données des patients sont-elles sécurisées ?",
      answer: "Oui, toutes les données sont anonymisées et hébergées en France. Notre plateforme est conforme au RGPD et aux normes de sécurité médicale. Seuls les professionnels de santé autorisés y ont accès."
    },
    {
      question: "L'application est-elle accessible à tous les médecins ?",
      answer: "Oui, elle est accessible à tous les pneumologues et médecins généralistes après validation de leurs justificatifs professionnels. L'inscription est gratuite et un compte est activé sous 72h après vérification."
    },
    {
      question: "Quelles pathologies sont détectées par l'application ?",
      answer: "L'application détecte 10 pathologies pulmonaires : Pneumonie, Tuberculose, Pneumothorax, COVID-19, Effusion, Atélectasie, Infiltration, Masse, Nodule et Fibrose."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 bg-(--sf)">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-4">
            Questions Fréquentes
          </h2>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
          </div>
          <p className="text-(--t2) max-w-2xl mx-auto">
            Retrouvez les réponses aux questions les plus courantes sur notre plateforme.
          </p>
        </div>

        {/* FAQ Accordéon */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="border border-(--ln) rounded-xl overflow-hidden bg-(--sf) hover:border-blue-200 transition-colors"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex justify-between items-center text-left bg-(--sf) hover:bg-(--sf2) transition-colors"
              >
                <span className="font-semibold text-(--t1) text-lg">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-blue-600" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 pt-0 text-(--t2) leading-relaxed border-t border-(--ln)">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}