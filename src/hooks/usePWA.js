// src/hooks/usePWA.js
import { useState, useEffect, useRef } from 'react';

export function usePWA() {
  const [installPrompt, setInstallPrompt]   = useState(null);
  const [isInstallable, setIsInstallable]   = useState(false);
  const [isInstalled,   setIsInstalled]     = useState(false);
  const [swUpdateReady, setSwUpdateReady]   = useState(false);
  const swReg = useRef(null);

  useEffect(() => {
    // Détecter si déjà installée (standalone ou display-mode)
    const mq = window.matchMedia('(display-mode: standalone)');
    setIsInstalled(mq.matches || window.navigator.standalone === true);
    mq.addEventListener('change', e => setIsInstalled(e.matches));

    // Capturer le prompt d'installation
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // Détecter l'installation réussie
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        swReg.current = reg;

        // Vérifier si une mise à jour est disponible
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setSwUpdateReady(true);
            }
          });
        });

        // Écouter les messages du SW (Background Sync)
        navigator.serviceWorker.addEventListener('message', async (event) => {
          if (event.data?.type === 'BACKGROUND_SYNC') {
            try {
              const { synchroniserAvecServeur } = await import('../services/offlineManager.js');
              await synchroniserAvecServeur();
            } catch { /* silencieux */ }
          }
        });

      } catch (err) {
        console.warn('[PWA] Enregistrement SW échoué:', err);
      }
    };

    registerSW();

    // Synchroniser au retour de la connexion réseau
    const onOnline = async () => {
      try {
        const { synchroniserAvecServeur } = await import('../services/offlineManager.js');
        await synchroniserAvecServeur();
      } catch { /* silencieux */ }

      // Enregistrer un Background Sync si le navigateur le supporte
      if (swReg.current && 'sync' in swReg.current) {
        swReg.current.sync.register('pneumoia-sync').catch(() => {});
      }
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return false;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setInstallPrompt(null);
    }
    return outcome === 'accepted';
  };

  const applyUpdate = async () => {
    // Chercher le SW en attente via le ref ET via l'API (fallback si ref périmé)
    let waiting = swReg.current?.waiting;
    if (!waiting) {
      const reg = await navigator.serviceWorker.getRegistration('/');
      waiting = reg?.waiting;
    }
    if (waiting) {
      waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setSwUpdateReady(false);
    window.location.reload();
  };

  return { isInstallable, isInstalled, swUpdateReady, promptInstall, applyUpdate };
}
