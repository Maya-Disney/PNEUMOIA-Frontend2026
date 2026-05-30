import { motion } from 'framer-motion';
import { Users, MessageCircle, Share2, Award, TrendingUp, ChevronRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import LoginModal from '../../../components/modals/LoginModal';
import RegisterModal from '../../../components/modals/RegisterModal';

export default function Communaute() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = localStorage.getItem('token') !== null; // À adapter selon ton auth

  const handleJoinCommunity = () => {
    if (isAuthenticated) {
      // Rediriger vers l'espace communauté
      window.location.href = '/communaute';
    } else {
      // Ouvrir la modale de connexion
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
              <Users className="w-4 h-4" />
              <span>03 — Communauté médicale</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-4">
              Échangez et collaborez avec vos pairs
            </h2>
            <div className="w-12 h-0.5 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Colonne gauche - Texte */}
            <div className="space-y-6">
              <p className="text-(--t2) leading-relaxed">
                Une communauté active de <span className="font-semibold text-(--t1)">+25 pneumologues</span> qui partagent 
                leur expérience et enrichissent la pratique collective.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-(--t1)">Messagerie intégrée</p>
                    <p className="text-sm text-(--t3)">Échangez en privé avec vos confrères sur des cas complexes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-(--t1)">Partage de cas anonymisés</p>
                    <p className="text-sm text-(--t3)">Soumettez vos cas à la communauté pour avis collégial</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-(--t1)">Système de réputation</p>
                    <p className="text-sm text-(--t3)">Valorisez votre expertise et gagnez en visibilité</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-5 mt-6">
                <p className="text-sm text-blue-800 leading-relaxed">
                  <span className="font-semibold">À venir :</span> Espaces de discussion thématiques, webinaires exclusifs, 
                  et groupes de travail par pathologie.
                </p>
              </div>
              
              <button 
                onClick={handleJoinCommunity}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all hover:gap-3"
              >
                Rejoindre la communauté <UserPlus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Colonne droite - Statistiques communauté */}
            <div className="bg-(--sf2) rounded-2xl p-8">
              <h3 className="font-semibold text-(--t1) mb-6 text-center">La communauté en chiffres</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">+25</p>
                  <p className="text-sm text-(--t3)">Pneumologues actifs</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">247</p>
                  <p className="text-sm text-(--t3)">Cas partagés</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">80%</p>
                  <p className="text-sm text-(--t3)">Taux de réponse</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">4.8/5</p>
                  <p className="text-sm text-(--t3)">Satisfaction</p>
                </div>
              </div>
              
              {/* Top contributeurs */}
              <div className="mt-8 pt-6 border-t border-(--ln)">
                <p className="text-sm font-medium text-(--t2) mb-4">Top contributeurs</p>
                <div className="space-y-3">
                  {[
                    { name: "Dr Jean Dupont", score: "91%", rank: 1 },
                    { name: "Dr Marie Camara", score: "81%", rank: 2 },
                    { name: "Dr Paul Ngassa", score: "70%", rank: 3 }
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-(--t4) w-5">#{doc.rank}</span>
                        <span className="text-sm text-(--t2)">{doc.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">{doc.score}</span>
                    </div>
                  ))}
                </div>
                <Link 
                  to="/cas-cliniques#ranking-records"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 mt-4 hover:gap-2 transition-all"
                >
                  Voir tout le classement <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </>
  );
}