// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { synchroniserAvecServeur } from './services/offlineManager';
import { ThemeProvider } from './features/medecin/contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import InstallBanner from './components/pwa/InstallBanner';
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
import MonEquipe from './features/medecin/pages/MonEquipe';
import Partage from './features/medecin/pages/Partage';
import CasCliniques from './features/medecin/pages/CasCliniques';
import Notification from './features/medecin/pages/Notifications';
import Profil from './features/medecin/pages/Profil';
import Historique from './features/medecin/pages/Historique';
import ParametresMedecin from './features/medecin/pages/Parametres';
import Recherche from './features/medecin/pages/Recherche';
import Monitoring from './features/medecin/pages/Monitoring';
import Commantaire from './features/medecin/pages/Commantaire';
import CorbeilleMedecin      from './features/medecin/pages/Corbeille';
import PatientDossier  from './features/medecin/pages/PatientDossier';
import NouveauPatient  from './features/medecin/pages/NouveauPatient';
import MesPublications from './features/medecin/pages/MesPublications';
import RequetesMedecin  from './features/medecin/pages/Requetes';

import AideLayout          from './features/aide/layout/AideLayout';
import AideDashboard       from './features/aide/pages/AideDashboard';
import AidePatients        from './features/aide/pages/AidePatients';
import AideNouveauPatient  from './features/aide/pages/AideNouveauPatient';
import AidePatientDossier  from './features/aide/pages/AidePatientDossier';
import AideCommentaires    from './features/aide/pages/AideCommentaires';
import AideNotifications   from './features/aide/pages/AideNotifications';
import AideProfil          from './features/aide/pages/AideProfil';
import AideParametres      from './features/aide/pages/AideParametres';
import ActivationPage from './features/activation/ActivationPage';

// SECTION ADMINISTRATEUR
import AdminLogin          from './features/administrateur/authAdmin/loginPage';
import AdminLayout         from './features/administrateur/layouts/AdminLayout';
import AdminDashboard      from './features/administrateur/pages/Dashboard';
import ValidesCeMois       from './features/administrateur/pages/ValidesCeMois';
import Refusees            from './features/administrateur/pages/Refuses';
import MedecinsSuspendus   from './features/administrateur/pages/MedecinsSuspendus';
import MedecinsActifs      from './features/administrateur/pages/Medecinsactifs';
import JournalAudit        from './features/administrateur/pages/JournalAudit';
import Statistiques        from './features/administrateur/pages/Statistiques';
import RepartitionGeo      from './features/administrateur/pages/RepartitionGeographique';
import CourbeActivite      from './features/administrateur/pages/Courbesactives';
import PerformancesIA      from './features/administrateur/pages/PerformanceIA';
import Parametres          from './features/administrateur/pages/Parametres';
import NouvellesDemandes   from './features/administrateur/pages/NouvellesDemandes';
import ProfilMedecin       from './features/administrateur/pages/ProfilMedecin';
import CorbeilleAdmin      from './features/administrateur/pages/Corbeille';
import FAQ                 from './features/administrateur/pages/FAQ';
import Commentaires        from './features/administrateur/pages/Commentaires';
import ConsultationsAnnuelles from './features/administrateur/pages/ConsultationsAnnuelles';
import RequetesMedecins    from './features/administrateur/pages/RequetesMedecins';



function RequireAdminAuth() {
  const token = localStorage.getItem("pneumo_admin_token");
  return token ? <Outlet /> : <Navigate to="/pneumo-admin-secure" replace />;
}

function RequireMedecinAuth() {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  if (!token || role !== "medecin") return <Navigate to="/" replace />;
  return <Outlet />;
}

function RequireAideAuth() {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  if (!token || role !== "aide_soignant") return <Navigate to="/" replace />;
  return <Outlet />;
}

function App() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const handleOnline = async () => {
        console.log('🌐 Réseau rétabli — synchronisation...');
        await synchroniserAvecServeur();
      };
      window.addEventListener('online', handleOnline);
      return () => window.removeEventListener('online', handleOnline);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      {/* 🟢 ENVELOPPE GLOBALE : Tout le monde a maintenant accès au Theme et au Toast */}
      <ToastProvider>
        <ThemeProvider>
          <InstallBanner />
          <Routes>
            
            {/* SITES VITRINE / COMMUN */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/apropos" element={<AboutPage />} />
              <Route path="/cas-cliniques" element={<CasCliniquePage />} />
              <Route path="/fonctionnalites" element={<Fonctionnalité />} />
            </Route>

            {/* ROUTE CONCERNANT LA SECTION MEDECIN */}
            <Route element={<RequireMedecinAuth />}>
              <Route path="/medecin" element={<MedecinLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="consultation" element={<Consultation />} />
                <Route path="patients" element={<Patients />} />
                <Route path="partage" element={<Partage/>} />
                <Route path="cas-cliniques" element={<CasCliniques/>} />
                <Route path="mon-equipe" element={<MonEquipe/>} />
                <Route path="notifications" element={<Notification/>} />
                <Route path="recherche" element={<Recherche />} />
                <Route path="profil" element={<Profil/>} />
                <Route path="parametres" element={<ParametresMedecin/>} />
                <Route path="historique" element={<Historique/>} />
                <Route path="monitoring" element={<Monitoring/>} />
                <Route path="commentaires" element={<Commantaire/>} />
                <Route path="corbeille"            element={<CorbeilleMedecin />} />
                <Route path="mes-publications"     element={<MesPublications />} />
                <Route path="patients/nouveau"     element={<NouveauPatient />} />
                <Route path="patients/:patientId"  element={<PatientDossier />} />
                <Route path="requetes"             element={<RequetesMedecin />} />
              </Route>
            </Route>

            {/* SECTION AIDE SOIGNANT */}
            <Route element={<RequireAideAuth />}>
              <Route path="/aide" element={<AideLayout />}>
                <Route index element={<AideDashboard />} />
                <Route path="dashboard"        element={<AideDashboard />} />
                <Route path="patients"         element={<AidePatients />} />
                <Route path="patients/nouveau" element={<AideNouveauPatient />} />
                <Route path="patients/:id"     element={<AidePatientDossier />} />
                <Route path="consultation"     element={<Consultation />} />
                <Route path="commentaires"     element={<AideCommentaires />} />
                <Route path="notifications"    element={<AideNotifications />} />
                <Route path="profil"           element={<AideProfil />} />
                <Route path="parametres"       element={<AideParametres />} />
              </Route>
            </Route>

        {/* ROUTES CONCERNANT LA SECTION ADMINISTRATEUR */}
        <Route path="/pneumo-admin-secure" element={<AdminLogin />} />
        <Route element={<RequireAdminAuth />}>
        <Route path="/administrateur" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard"      element={<AdminDashboard />} />
          <Route path="demandes"       element={<NouvellesDemandes />} />
          <Route path="validees"       element={<ValidesCeMois />} />
          <Route path="refusees"       element={<Refusees />} />
          <Route path="medecins"       element={<MedecinsActifs />} />
          <Route path="suspendus"      element={<MedecinsSuspendus />} />
          <Route path="activite"       element={<CourbeActivite />} />
          <Route path="stats"          element={<Statistiques />} />
          <Route path="performances"   element={<PerformancesIA />} />
          <Route path="geo"            element={<RepartitionGeo />} />
          <Route path="audit"          element={<JournalAudit />} />
          <Route path="parametres"     element={<Parametres />} />
          <Route path="medecins/:id"   element={<ProfilMedecin />} />
          <Route path="corbeille"           element={<CorbeilleAdmin />} />
          <Route path="faq"                 element={<FAQ />} />
          <Route path="commentaires"        element={<Commentaires />} />
          <Route path="consultations-annuelles" element={<ConsultationsAnnuelles />} />
          <Route path="requetes"            element={<RequetesMedecins />} />
        </Route>
        </Route>
            {/* PAGE D'ACTIVATION */}
            <Route path="/activation" element={<ActivationPage />} />

            {/* ROUTES CONCERNANT LA SECTION ADMINISTRATEUR */}
            <Route path="/administrateur/login" element={<AdminLogin />} />
            <Route path="/administrateur" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard"      element={<AdminDashboard />} />
              <Route path="demandes"       element={<NouvellesDemandes />} />
              <Route path="validees"       element={<ValidesCeMois />} />
              <Route path="refusees"       element={<Refusees />} />
              <Route path="medecins"       element={<MedecinsActifs />} />
              <Route path="suspendus"      element={<MedecinsSuspendus />} />
              <Route path="activite"       element={<CourbeActivite />} />
              <Route path="stats"          element={<Statistiques />} />
              <Route path="performances"   element={<PerformancesIA />} />
              <Route path="geo"            element={<RepartitionGeo />} />
              <Route path="audit"          element={<JournalAudit />} />
              <Route path="parametres"     element={<Parametres />} />
              <Route path="medecins/:id"   element={<ProfilMedecin />} />
              <Route path="corbeille"          element={<CorbeilleAdmin />} />
              <Route path="faq"                element={<FAQ />} />
              <Route path="commentaires"       element={<Commentaires />} />
              <Route path="requetes"           element={<RequetesMedecins />} />
            </Route>

          </Routes>
        </ThemeProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;