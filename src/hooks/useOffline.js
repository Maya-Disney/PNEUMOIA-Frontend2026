// ================================================================
// src/hooks/useOffline.js
// Hook React pour détecter l'état réseau et gérer l'offline
// ================================================================


import { useState, useEffect } from 'react';
import { chargerModeles } from '../services/offlineDiagnostic';
import { synchroniserAvecServeur } from '../services/offlineManager';

export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [modelesChargees, setModelesChargees] = useState(false);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline  = async () => {
      setIsOffline(false);
      // Synchroniser les données en attente
      await synchroniserAvecServeur();
    };

    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);

    // Précharger les modèles dès le démarrage (en arrière-plan)
    chargerModeles().then(ok => setModelesChargees(ok));

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, []);

  return { isOffline, modelesChargees };
}
