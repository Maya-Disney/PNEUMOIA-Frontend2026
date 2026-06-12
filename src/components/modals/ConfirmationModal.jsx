// src/components/modals/ConfirmationModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

export default function ConfirmationModal({ isOpen, onClose, role = 'medecin' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 text-center">
              {/* Bouton fermeture */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Icône de succès */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              {/* Titre */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {role === 'aide' ? 'Demande envoyée !' : 'Inscription envoyée'}
              </h3>

              {/* Message */}
              <p className="text-gray-600 text-sm mb-4">
                {role === 'aide'
                  ? 'Votre demande a été transmise au médecin référent.'
                  : "Votre dossier est en cours de traitement par l'administrateur."}
              </p>

              <p className="text-gray-500 text-xs">
                {role === 'aide'
                  ? 'Vous recevrez un email dès que le médecin aura validé ou refusé votre compte.'
                  : 'Sous 72h, vous recevrez un lien de confirmation de validation de compte ou de refus par boîte mail.'}
              </p>

              {/* Bouton de fermeture */}
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}