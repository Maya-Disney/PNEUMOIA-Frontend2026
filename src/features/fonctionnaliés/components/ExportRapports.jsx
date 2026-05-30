import { motion } from 'framer-motion';
import { Download, FileText, Printer, Share2, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import LoginModal from '../../../components/modals/LoginModal';
import { useToast } from '../../../contexts/ToastContext';

export default function ExportRapports() {
  const toast = useToast();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const isAuthenticated = localStorage.getItem('token') !== null;
  const [exporting, setExporting] = useState(null);

  const handleExport = (format) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setExporting(format);
    setTimeout(() => {
      setExporting(null);
      toast.success(`Rapport exporté au format ${format}`);
    }, 1500);
  };

  const reportTypes = [
    {
      title: "Rapport d'activité mensuel",
      description: "Synthèse de vos diagnostics, cas partagés et statistiques",
      icon: FileText,
      formats: ["PDF", "Excel", "CSV"]
    },
    {
      title: "Rapport patient",
      description: "Historique complet des diagnostics pour un patient",
      icon: FileText,
      formats: ["PDF"]
    },
    {
      title: "Export des cas cliniques",
      description: "Tous vos cas favoris au format exploitable",
      icon: FileSpreadsheet,
      formats: ["Excel", "CSV"]
    }
  ];

  return (
    <>
      <section className="py-12 px-4 bg-(--sf) border-b border-(--ln)">
        <div className="max-w-7xl mx-auto">
          
          {/* En-tête */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Download className="w-4 h-4" />
              <span>07 — Export et reporting</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-4">
              Vos données, à votre disposition
            </h2>
            <div className="w-12 h-0.5 bg-blue-600 mx-auto"></div>
            <p className="text-(--t2) max-w-2xl mx-auto mt-4">
              Exportez vos rapports et analyses en quelques clics
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
                className="bg-(--sf) rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-(--ln)"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <report.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-(--t1) mb-2">{report.title}</h3>
                <p className="text-(--t3) text-sm mb-4">{report.description}</p>
                <div className="flex flex-wrap gap-2">
                  {report.formats.map((format, i) => (
                    <button
                      key={i}
                      onClick={() => handleExport(format)}
                      disabled={exporting === format}
                      className="px-3 py-1.5 bg-(--sf2) text-(--t2) rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                    >
                      {exporting === format ? "..." : format}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Badge conformité */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
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