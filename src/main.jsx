import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Les modèles ONNX sont chargés à la demande (première consultation offline)
// Pas de préchargement au démarrage pour éviter les erreurs mémoire WebAssembly
