// src/features/medecin/layout/MedecinLayout.jsx
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet, useLocation } from 'react-router-dom';

export default function MedecinLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Tableau de bord';
    if (path.includes('/consultation')) return 'Consultation';
    if (path.includes('/patients')) return 'Patients';
    if (path.includes('/partage')) return 'Partage';
    if (path.includes('/cas-cliniques')) return 'Cas cliniques';
    if (path.includes('/mes-publications')) return 'Mes publications';
    if (path.includes('/mon-equipe')) return 'Mon équipe';
    if (path.includes('/commentaires')) return 'Commentaires';
    if (path.includes('/monitoring')) return 'Monitoring';
    if (path.includes('/messagerie')) return 'Messagerie';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/recherche')) return 'Recherche';
    if (path.includes('/profil')) return 'Mon profil';
    if (path.includes('/parametres')) return 'Paramètres';
    if (path.includes('/historique')) return 'Historique';
    if (path.includes('/corbeille')) return 'Corbeille';
    return 'Tableau de bord';
  };

  // Calculer la marge gauche
  const getMarginLeft = () => {
    if (!isDesktop) return '0px';
    return isCollapsed ? '86px' : '260px';
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--t1) transition-colors duration-300">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        onCollapsedChange={setIsCollapsed}
      />
      
      {/* Contenu principal avec style inline pour la marge */}
      <div 
        className="transition-all duration-500"
        style={{ marginLeft: getMarginLeft() }}
      >
        <Topbar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          pageTitle={getPageTitle()}
        />
        
        <main className="px-8 py-6 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}