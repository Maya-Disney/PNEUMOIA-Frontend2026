// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './features/medecin/contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import './App.css';
import HomePage from './features/home/HomePage';
import AboutPage from './features/about/AboutPage';
import CasCliniquePage from './features/casClinique/CascliniquePage';
import Fonctionnalité from './features/fonctionnaliés/FeaturesPage';
import MainLayout from './layouts/MainLayout';

//SECTION MEDECIN 

import MedecinLayout from './features/medecin/layout/MedecinLayout';
import Dashboard from './features/medecin/pages/Dashboard';
import Consultation from './features/medecin/pages/Consultations';
import Patients from './features/medecin/pages/Patients';
import Messagerie from './features/medecin/pages/Messagerie';
import Partage from './features/medecin/pages/Partage';
import CasCliniques from './features/medecin/pages/CasCliniques';
import Notification from './features/medecin/pages/Notifications';
import Profil from './features/medecin/pages/Profil';
import Historique from './features/medecin/pages/Historique';
import Parametres from './features/medecin/pages/Parametres';
import Recherche from './features/medecin/pages/Recherche';
import Monitoring from './features/medecin/pages/Monitoring';
import Commantaire from './features/medecin/pages/Commantaire';


import ActivationPage from './features/activation/ActivationPage';



function App() {
  return (
    <BrowserRouter>  {/* Un seul Router ici */}
      <Routes>
        <Route element={<ToastProvider><ThemeProvider><Outlet /></ThemeProvider></ToastProvider>}>
          <Route path="/" element={<MainLayout />}>
             <Route index element={<HomePage />} />
            <Route path="/apropos" element={<AboutPage />} />
            <Route path="/cas-cliniques" element={<CasCliniquePage />} />
            <Route path="/fonctionnalites" element={<Fonctionnalité />} />
          </Route>

          {/* ROUTE CONCERNANT LA SECTION MEDECIN */}
          <Route path="/medecin" element={<MedecinLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="consultation" element={<Consultation />} />
            <Route path="patients" element={<Patients />} />
            <Route path="partage" element={<Partage/>} />
            <Route path="cas-cliniques" element={<CasCliniques/>} />
            <Route path="messagerie" element={<Messagerie/>} />
            <Route path="notifications" element={<Notification/>} />
            <Route path="recherche" element={<Recherche />} />
            <Route path="profil" element={ <Profil/>} />
            <Route path="parametres" element={<Parametres/>} />
            <Route path="historique" element={<Historique/>} />
            <Route path="monitoring" element={<Monitoring/>} />
            <Route path="commentaires" element={<Commantaire/>} />
          </Route>
        </Route>

        {/* PAGE D'ACTIVATION — lien reçu par email après validation admin */}
       <Route path="/activation" element={<ActivationPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;




