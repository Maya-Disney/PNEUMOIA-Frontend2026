// src/components/pwa/InstallBanner.jsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, RefreshCw } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export default function InstallBanner() {
  const { isInstallable, swUpdateReady, promptInstall, applyUpdate } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const { pathname } = useLocation();

  const isAdminRoute = pathname.startsWith('/administrateur') || pathname.startsWith('/pneumo-admin');

  const showInstall = isInstallable && !dismissed && !isAdminRoute;
  const showUpdate  = swUpdateReady && !isAdminRoute;

  if (!showInstall && !showUpdate) return null;

  return (
    <AnimatePresence>
      {/* Bannière mise à jour SW */}
      {showUpdate && (
        <motion.div
          key="update"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{   y: 80, opacity: 0 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="flex items-center gap-3 bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-xl">
            <RefreshCw className="w-5 h-5 shrink-0" />
            <p className="flex-1 text-sm font-medium">Nouvelle version disponible</p>
            <button
              onClick={applyUpdate}
              className="text-xs font-bold bg-white text-indigo-700 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Mettre à jour
            </button>
          </div>
        </motion.div>
      )}

      {/* Bannière installation */}
      {showInstall && !showUpdate && (
        <motion.div
          key="install"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{   y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="flex items-center gap-3 bg-white border border-violet-100 shadow-xl px-4 py-3.5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
              <img src="/icon-192.png" alt="PneumoIA" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight">Installer PneumoIA</p>
              <p className="text-xs text-gray-500 mt-0.5">Accès rapide depuis l'écran d'accueil</p>
            </div>
            <button
              onClick={promptInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Installer
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
