import { motion } from 'framer-motion';
import { User, Calendar, History, Bookmark, Settings, Bell, FileText, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import LoginModal from '../../../components/modals/LoginModal';

export default function EspaceMedecin() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const isAuthenticated = localStorage.getItem('token') !== null;

  const handleAccess = () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
    }
  };

  return (
    <>
      <section className="py-12 px-4 bg-(--sf2) border-b border-(--ln)">
        <div className="max-w-7xl mx-auto">
          
          {/* En-tête de section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <User className="w-4 h-4" />
              <span>04 — Espace personnel</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-4">
              Votre tableau de bord personnalisé
            </h2>
            <div className="w-12 h-0.5 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Colonne gauche - Texte */}
            <div className="space-y-6">
              <p className="text-(--t2) leading-relaxed">
                Un espace dédié pour centraliser votre activité, suivre vos patients et accéder 
                rapidement à vos outils favoris.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <History className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Historique des consultations</p>
                    <p className="text-sm text-(--t3)">Retrouvez tous vos diagnostics et analyses passées</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bookmark className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Cas favoris</p>
                    <p className="text-sm text-(--t3)">Sauvegardez les cas cliniques les plus pertinents</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Notifications personnalisées</p>
                    <p className="text-sm text-(--t3)">Alertes sur les nouveaux cas, commentaires, et mises à jour</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Paramètres avancés</p>
                    <p className="text-sm text-(--t3)">Préférences d'affichage, notifications, et confidentialité</p>
                  </div>
                </div>
              </div>
              
              {!isAuthenticated ? (
                <button 
                  onClick={handleAccess}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  Accéder à mon espace <User className="w-4 h-4" />
                </button>
              ) : (
                <Link 
                  to="/espace-medecin"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  Accéder à mon espace <User className="w-4 h-4" />
                </Link>
              )}
            </div>
            
            {/* Colonne droite - Aperçu du tableau de bord */}
            <div className="bg-(--sf) rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-800">Aperçu du tableau de bord</h3>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-(--t3)" />
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-xs text-(--t3)">Diagnostics</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">8</p>
                  <p className="text-xs text-(--t3)">Cas favoris</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">3</p>
                  <p className="text-xs text-(--t3)">Notifications</p>
                </div>
              </div>
              
              {/* Derniers cas */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Derniers cas consultés</p>
                <div className="space-y-2">
                  {[
                    "Pneumonie - Patient 58 ans",
                    "Tuberculose - Patient 45 ans",
                    "BPCO - Patient 65 ans"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-(--t2)">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Link 
                  to="/espace-medecin"
                  className="text-blue-600 text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Voir mon activité <Activity className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modale de connexion */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}