import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, Activity, Calendar, Download, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import LoginModal from '../../../components/modals/LoginModal';

export default function Statistiques() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const isAuthenticated = localStorage.getItem('token') !== null;

  const handleAccess = () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
    }
  };

  return (
    <>
      <section className="py-12 px-4 bg-(--sf) border-b border-(--ln)">
        <div className="max-w-7xl mx-auto">
          
          {/* En-tête de section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <BarChart3 className="w-4 h-4" />
              <span>05 — Analyse et performance</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-4">
              Visualisez votre activité en un coup d'œil
            </h2>
            <div className="w-12 h-0.5 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Colonne gauche - Texte */}
            <div className="space-y-6">
              <p className="text-(--t2) leading-relaxed">
                Des indicateurs clairs pour suivre votre pratique, mesurer votre impact 
                et identifier les axes d'amélioration.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-(--t1)">Évolution mensuelle</p>
                    <p className="text-sm text-(--t2)">Suivez le nombre de diagnostics par mois</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <PieChart className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-(--t1)">Répartition par pathologie</p>
                    <p className="text-sm text-(--t3)">Visualisez les pathologies les plus fréquentes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-(--t1)">Performance IA</p>
                    <p className="text-sm text-(--t3)">Taux de concordance entre vos diagnostics et l'IA</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-(--t1)">Historique détaillé</p>
                    <p className="text-sm text-(--t3)">Exportez vos données pour analyse externe</p>
                  </div>
                </div>
              </div>
              
              {!isAuthenticated ? (
                <button 
                  onClick={handleAccess}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  Accéder à mes statistiques <BarChart3 className="w-4 h-4" />
                </button>
              ) : (
                <Link 
                  to="/statistiques"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  Accéder à mes statistiques <BarChart3 className="w-4 h-4" />
                </Link>
              )}
            </div>
            
            {/* Colonne droite - Aperçu graphique */}
            <div className="bg-(--sf2) rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-(--t1)">Aperçu mensuel</h3>
                <select className="text-sm border border-(--ln) rounded-lg px-2 py-1 bg-(--sf)">
                  <option>Mars 2026</option>
                  <option>Février 2026</option>
                  <option>Janvier 2026</option>
                </select>
              </div>
              
              {/* Barres de statistiques */}
              <div className="space-y-4">
                {[
                  { label: "Diagnostics réalisés", value: 24, max: 30, color: "bg-teal-500" },
                  { label: "Cas partagés", value: 8, max: 30, color: "bg-blue-500" },
                  { label: "Concordance IA", value: 92, max: 100, color: "bg-green-500" },
                  { label: "Temps moyen (sec)", value: 2.8, max: 10, color: "bg-orange-500" }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-(--t2)">{item.label}</span>
                      <span className="font-medium text-(--t1)">{item.value}{item.label === "Concordance IA" ? "%" : item.label === "Temps moyen (sec)" ? "s" : ""}</span>
                    </div>
                    <div className="w-full bg-(--ln) rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${(item.value / item.max) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pathologies fréquentes */}
                <div className="mt-6 pt-6 border-t border-(--ln)">
                <p className="text-sm font-medium text-(--t1) mb-3">Pathologies les plus fréquentes</p>
                <div className="space-y-2">
                  {[
                    { name: "Pneumonie", count: 8, percent: 33 },
                    { name: "BPCO", count: 6, percent: 25 },
                    { name: "Asthme", count: 5, percent: 21 }
                  ].map((path, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-(--t2)">{path.name}</span>
                        <span className="text-(--t3)">{path.count} cas ({path.percent}%)</span>
                      </div>
                      <div className="w-full bg-(--ln) rounded-full h-1.5">
                        <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${path.percent}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-(--ln) flex justify-between items-center">
                <Link 
                  to="/statistiques"
                  className="text-blue-600 text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Voir tous les indicateurs <Eye className="w-3 h-3 text-blue-600" />
                </Link>
                <button className="text-blue-600 text-sm inline-flex items-center gap-1 hover:text-blue-700 transition-all">
                  <Download className="w-3 h-3 text-blue-600" /> Exporter
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}