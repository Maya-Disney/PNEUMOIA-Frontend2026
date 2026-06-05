import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { chargerModeles } from './services/offlineDiagnostic'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)



// Enregistrer le Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log(' Service Worker enregistré:', reg.scope))
      .catch(err => console.error(' SW échec:', err));
  });
}

// Précharger les modèles ONNX en arrière-plan dès le démarrage
chargerModeles().then(ok => {
  if (ok) console.log('✅ Modèles ONNX prêts pour le mode offline');
});