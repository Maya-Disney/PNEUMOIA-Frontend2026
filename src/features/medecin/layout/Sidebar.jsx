// src/features/medecin/layout/Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Stethoscope, Users, Share2,
  FolderOpen, MessageCircle, Bell, Search,
  User, Settings, LogOut, History, Menu, X,
  ChevronLeft, Activity, MessageSquare
} from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from '../../../assets/images/logo.png';

export default function Sidebar({ sidebarOpen, setSidebarOpen, onCollapsedChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const isDashboardActive = location.pathname === '/medecin' || location.pathname === '/medecin/';
  
  // Détecter la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      
      // Réinitialiser le collapse sur mobile
      if (!desktop) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, [isCollapsed, onCollapsedChange]);

  // Sur desktop, la sidebar est toujours visible (fixed)
  // Sur mobile, elle est en overlay
  const sidebarWidth = isDesktop 
    ? (isCollapsed ? 'w-[100px]' : 'w-[260px]')
    : 'w-[230px]';

  const navItems = [
    { path: '/medecin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/medecin/consultation', icon: Stethoscope, label: 'Consultation' },
    { path: '/medecin/patients', icon: Users, label: 'Patients' },
    { path: '/medecin/partage', icon: Share2, label: 'Partage', badge: 3 },
  ];

  const communityItems = [
    { path: '/medecin/cas-cliniques', icon: FolderOpen, label: 'Cas cliniques' },
    { path: '/medecin/messagerie', icon: MessageCircle, label: 'Messagerie', badge: 2 },
    { path: '/medecin/commentaires', icon: MessageSquare, label: 'Commentaires' },
    { path: '/medecin/monitoring', icon: Activity, label: 'Monitoring' },
  ];

  const accountItems = [
    { path: '/medecin/historique', icon: History, label: 'Historique' },
    { path: '/medecin/notifications', icon: Bell, label: 'Notifications', badge: 5 },
    { path: '/medecin/recherche', icon: Search, label: 'Recherche' },
    { path: '/medecin/profil', icon: User, label: 'Mon profil' },
    { path: '/medecin/parametres', icon: Settings, label: 'Paramètres' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative transition-all duration-500 bg-(--sf) text-(--t1)">
      {/* Bouton collapse - visible uniquement sur desktop */}
      {isDesktop && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-12 z-50 bg-(--sf) border border-(--ln) rounded-l-full p-2 shadow-sm hover:bg-(--sf2) transition-all group"
        >
          <ChevronLeft 
            className={`h-4 w-4 text-slate-400 dark:text-slate-300 group-hover:text-blue-600 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} 
          />
        </button>
      )}

      {/* Bouton fermeture mobile */}
      {!isDesktop && sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-4 z-50 bg-(--sf) border border-(--ln) rounded-full p-2 shadow-sm hover:bg-(--sf2) transition-all group"
        >
          <X className="h-4 w-4 text-slate-400 dark:text-slate-300" />
        </button>
      )}

      {/* Logo */}
      <div className={`p-8 pb-4 ${!isDesktop && sidebarOpen ? 'pt-16' : ''}`}>
        <div className="flex items-center gap-3 whitespace-nowrap">
          <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-[18px] flex items-center justify-center shadow-2xl shrink-0">
            <img src={logo} alt="PneumoIA" className="w-10 h-10 object-contain filter brightness-0 invert" />
          </div>
          {(!isCollapsed || !isDesktop) && (
            <div className="transition-all duration-300">
              <h1 className="text-xl font-black tracking-tighter leading-none">PneumoIA</h1>
              <p className="text-[8px] font-black text-blue-600 uppercase tracking-[0.4em] mt-1">Médecin</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - scrollable sans scrollbar visible */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1"
        style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
        }}>
        {/* Section principale */}
        <div className="space-y-1">
          {(!isCollapsed || !isDesktop) && (
            <p className="px-4 text-[10px] font-black text-(--t4) uppercase tracking-widest mb-2 mt-2">
              Menu principal
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => !isDesktop && setSidebarOpen(false)}
                className={({ isActive }) => {
                  const active = isActive || (item.path === '/medecin/dashboard' && isDashboardActive);
                  return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-l-4 ${isCollapsed && isDesktop ? 'justify-center' : ''} ${active ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-transparent' : 'border-transparent text-(--t3) hover:text-(--t1)'}`
                }}
              >
                 {({ isActive }) => {
                  const active = isActive || (item.path === '/medecin/dashboard' && isDashboardActive);
                  return (
                    <>
                      <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-blue-500 dark:text-blue-400' : 'text-blue-400 dark:text-blue-500'}`} />
                      {(!isCollapsed || !isDesktop) && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </div>

        {/* Communauté */}
        <div className="space-y-1">
          {(!isCollapsed || !isDesktop) && (
            <p className="px-4 text-[10px] font-black text-(--t4) uppercase tracking-widest mb-2 mt-2">
              Communauté
            </p>
          )}
          {communityItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => !isDesktop && setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-l-4
                  ${isCollapsed && isDesktop ? 'justify-center' : ''}
                  ${isActive 
                    ? 'border-blue-500 text-blue-600 bg-transparent dark:text-blue-300' 
                    : 'border-transparent text-(--t3) hover:text-(--t1)'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-blue-400 dark:text-blue-500'}`} />
                    {(!isCollapsed || !isDesktop) && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Mon compte */}
        <div className="space-y-1">
          {(!isCollapsed || !isDesktop) && (
            <p className="px-4 text-[10px] font-black text-(--t4) uppercase tracking-widest mb-2 mt-2">
              Mon compte
            </p>
          )}
          {accountItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => !isDesktop && setSidebarOpen(false)}
                className={({ isActive }) => {
                  const active = isActive;
                  return `flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-l-4 ${isCollapsed && isDesktop ? 'justify-center' : ''} ${active ? 'border-blue-500 text-blue-600 bg-transparent dark:text-blue-300' : 'border-transparent text-(--t3) hover:text-(--t1)'}`
                }}
              >
                {({ isActive }) => {
                  const active = isActive;
                  return (
                    <>
                      <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-blue-500 dark:text-blue-400' : 'text-blue-400 dark:text-blue-500'}`} />
                      {(!isCollapsed || !isDesktop) && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </div>
      </nav>

    </div>
  );

  return (
    <>
      {/* Overlay pour mobile */}
      {!isDesktop && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar desktop - fixed */}
      <aside 
        className={`
          hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-30
          bg-(--sf) border-r border-(--ln) shadow-xl
          transition-all duration-500 ${sidebarWidth}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar mobile - coulissante */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full bg-(--sf) border-r border-(--ln) shadow-2xl
          transition-transform duration-300 ease-in-out lg:hidden
          ${sidebarWidth}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
}