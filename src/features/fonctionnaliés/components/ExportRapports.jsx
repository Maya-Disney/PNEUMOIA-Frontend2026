import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../../../components/modals/LoginModal';

export default function ExportRapports() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  const handleAccess = (destination) => {
    if (!token) {
      setIsLoginOpen(true);
      return;
    }
    // Redirection selon le rôle
    if (role === 'medecin') {
      navigate(destination.medecin);
    } else if (role === 'aide_soignant') {
      navigate(destination.aide);
    } else {
      setIsLoginOpen(true);
    }
  };

  const reportTypes = [
    {
      title: "Rapport d'activité",
      description: "Synthèse de vos diagnostics, cas partagés et statistiques. Accessible depuis votre historique de consultations.",
      icon: FileText,
      formats: ["PDF", "Excel", "CSV"],
      destination: { medecin: '/medecin/historique', aide: '/aide/patients' },
      cta: "Accéder à l'historique",
    },
    {
      title: "Dossier patient",
      description: "Historique complet des diagnostics pour un patient. Les exports sont disponibles directement dans le dossier.",
      icon: FileText,
      formats: ["PDF"],
      destination: { medecin: '/medecin/patients', aide: '/aide/patients' },
      cta: "Accéder aux patients",
    },
    {
      title: "Cas cliniques",
      description: "Tous vos cas favoris consultables et exportables depuis votre espace cas cliniques.",
      icon: FileSpreadsheet,
      formats: ["Excel", "CSV"],
      destination: { medecin: '/medecin/cas-cliniques', aide: '/aide/patients' },
      cta: "Accéder aux cas cliniques",
    },
  ];

  return (
    <>
      <section className="py-12 px-4 bg-(--sf) border-b border-(--ln)">
        <div className="max-w-7xl mx-auto">

          {/* En-tête */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Download className="w-4 h-4" />
              <span>07 — Export et reporting</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-4">
              Vos données, à votre disposition
            </h2>
            <div className="w-12 h-0.5 bg-blue-600 mx-auto"></div>
            <p className="text-(--t2) max-w-2xl mx-auto mt-4">
              Les rapports et exports sont générés depuis le dossier du patient et votre espace personnel — les données médicales restent sécurisées dans l'application.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {reportTypes.map((report, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-(--sf) rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-(--ln) flex flex-col"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <report.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-(--t1) mb-2">{report.title}</h3>
                <p className="text-(--t3) text-sm mb-4 flex-1">{report.description}</p>

                {/* Formats disponibles — affichage informatif uniquement */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {report.formats.map((format, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-(--sf2) text-(--t3) rounded-lg text-xs font-medium border border-(--ln)"
                    >
                      {format}
                    </span>
                  ))}
                </div>

                {/* Bouton de redirection vers le vrai dossier */}
                <button
                  onClick={() => handleAccess(report.destination)}
                  className="group w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-sm font-semibold"
                >
                  {!token && <Lock className="w-4 h-4" />}
                  {report.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Badge conformité */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Conforme RGPD • Données anonymisées • Hébergement sécurisé France</span>
            </div>
          </div>
        </div>
      </section>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
