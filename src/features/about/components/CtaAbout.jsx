import { useState } from 'react';
import { motion } from 'framer-motion';
import RegisterModal from '../../../components/modals/RegisterModal';

export default function CTAAccess() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <>
      <section className="py-16 px-4 bg-linear-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Prêt à prendre soin de vôtre santé pulmonaire avec PneumoDiag ?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Rejoignez des milliers de professionnels de santé qui utilisent PneumoDiag pour améliorer le diagnostic et
             la prise en charge des maladies pulmonaires. Connectez-vous pour accéder à vos cas 
             cliniques ou demandez un accès si vous êtes nouveau !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            
            <button 
              onClick={() => setIsRegisterOpen(true)}
              className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              Inscrivez-vous
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </>
  );
}