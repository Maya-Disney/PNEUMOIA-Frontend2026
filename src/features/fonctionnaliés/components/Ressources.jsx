import { motion } from 'framer-motion';
import { GraduationCap, Video, FileText, BookOpen, Award, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Ressources() {
  const resources = [
    {
      type: "Webinaire",
      title: "Pneumonie atypique : cas cliniques complexes",
      duration: "45 min",
      level: "Intermédiaire",
      icon: Video,
    },
    {
      type: "Article",
      title: "BPCO : nouvelles recommandations 2026",
      duration: "15 min",
      level: "Avancé",
      icon: FileText,
    },
    {
      type: "Cas pratique",
      title: "Diagnostic différentiel tuberculose / cancer",
      duration: "30 min",
      level: "Expert",
      icon: BookOpen,
    }
  ];

  return (
    <section className="py-12 px-4 bg-(--sf) border-b border-(--ln)">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <GraduationCap className="w-4 h-4" />
            <span>06 — Formation continue</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-4">
            Ressources pédagogiques
          </h2>
          <div className="w-12 h-0.5 bg-blue-600 mx-auto"></div>
          <p className="text-(--t2) max-w-2xl mx-auto mt-4">
            Webinaires, articles, cas pratiques : formez-vous à votre rythme
          </p>
        </div>

        {/* Cartes ressources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {resources.map((res, idx) => (
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
                <res.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-blue-600 font-medium">{res.type}</span>
                <span className="text-xs text-(--t4)">•</span>
                <span className="text-xs text-(--t3)">{res.duration}</span>
              </div>
              <h3 className="text-lg font-bold text-(--t1) mb-2">{res.title}</h3>
              <p className="text-sm text-(--t3) mb-4">Niveau : {res.level}</p>
              <button className="text-blue-600 text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                Consulter <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Formations à venir - style simple */}
        <div className="bg-(--sf2) rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-(--t1)">Formations à venir</h3>
            <Link to="/formations" className="text-blue-600 text-sm hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { title: "IA en pneumologie : principes et applications", date: "15 Avril 2026" },
              { title: "Cas cliniques interactifs : radiologie thoracique", date: "22 Avril 2026" },
              { title: "Atelier pratique : utilisation de PneumoIA", date: "29 Avril 2026" }
            ].map((formation, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-(--ln) last:border-0">
                <span className="text-(--t2)">{formation.title}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-(--t3)">{formation.date}</span>
                  <button className="px-3 py-1 text-sm bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                    S'inscrire
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}