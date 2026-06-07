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
    if (path.includes('/messagerie')) return 'Messagerie';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/recherche')) return 'Recherche';
    if (path.includes('/profil')) return 'Mon profil';
    if (path.includes('/parametres')) return 'Paramètres';
    if (path.includes('/historique')) return 'Historique';
    if (path.includes('/corbeille')) return 'Corbeille';
    return 'Dashboard';
  };

  // Calculer la marge gauche
  const getMarginLeft = () => {
    if (!isDesktop) return '0px';
    return isCollapsed ? '100px' : '260px';
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)] transition-colors duration-300">
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
        
        <main className="p-6 md:p-8 overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}