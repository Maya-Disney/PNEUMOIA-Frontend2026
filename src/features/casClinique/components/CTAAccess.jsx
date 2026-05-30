import { useState } from 'react';
import { motion } from 'framer-motion';
import LoginModal from '../../../components/modals/LoginModal';
import RegisterModal from '../../../components/modals/RegisterModal';

export default function CTAAccess() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <>
      <section className="py-16 px-4 bg-linear-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Accédez à 238 cas supplémentaires
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Connectez-vous avec votre compte médecin pour accéder à la bibliothèque complète, 
            filtrer par sous-type, commentaires des confrères, et partager vos propres cas anonymisés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              Se connecter
            </button>
            <button 
              onClick={() => setIsRegisterOpen(true)}
              className="px-6 py-2 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
            >
              Demande d'accès
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </>
  );
}