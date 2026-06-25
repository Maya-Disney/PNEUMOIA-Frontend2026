import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Précharger les modèles ONNX en arrière-plan après le rendu initial
setTimeout(() => {
  import('./services/offlineDiagnostic').then(({ chargerModeles }) => {
    chargerModeles().then(ok => {
      if (ok) console.log('✅ Modèles ONNX prêts pour le mode offline');
    });
  }).catch(() => {});
}, 2000);
