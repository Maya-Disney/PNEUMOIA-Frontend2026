import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserCircle, LogOut, ChevronLeft,
  Menu, X, Bell, ChevronDown, Moon, Sun, UserPlus,
  Settings, MessageSquare
} from 'lucide-react';
import { useTheme } from '../../medecin/contexts/ThemeContext';
import logo from '../../../assets/images/logo.png';

const RED      = '#DC2626';
const RED_DARK = '#991B1B';
const API_URL  = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function getPerms() {
  try { return JSON.parse(localStorage.getItem('aide_permissions') || '{}'); } catch { return {}; }
}
function getInfo() {
  const nom  = localStorage.getItem('aide_nom') || 'Aide soignant';
  const prts = nom.trim().split(' ');
  return {
    nom,
    id:       localStorage.getItem('aide_id') || '',
    initials: prts.length >= 2 ? `${prts[0][0]}${prts[1][0]}`.toUpperCase() : nom.slice(0,2).toUpperCase(),
  };
}

const PAGE_TITLES = {
  '/aide/dashboard':        'Tableau de bord',
  '/aide/patients':         'Patients',
  '/aide/patients/nouveau': 'Nouveau patient',
  '/aide/consultation':     'Consultation',
  '/aide/commentaires':     'Commentaires',
  '/aide/notifications':    'Notifications',
  '/aide/profil':           'Mon profil',
  '/aide/parametres':       'Paramètres',
};

export default function AideLayout() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop,  setIsDesktop]  = useState(window.innerWidth >= 1024);
  const [userMenu,   setUserMenu]   = useState(false);
  const userMenuRef = useRef(null);
  const navigate    = useNavigate();
  const location    = useLocation();
  const { theme, toggleTheme } = useTheme();

  const perms        = getPerms();
  const [info, setInfo] = useState(getInfo());

  useEffect(() => {
    if (localStorage.getItem('role') !== 'aide_soignant') { navigate('/'); return; }
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/aides/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const nom  = `${d.prenom} ${d.nom}`;
        const prts = nom.trim().split(' ');
        const updated = {
          nom,
          id:       d.id,
          initials: prts.length >= 2 ? `${prts[0][0]}${prts[1][0]}`.toUpperCase() : nom.slice(0,2).toUpperCase(),
        };
        setInfo(updated);
        localStorage.setItem('aide_nom', nom);
        localStorage.setItem('aide_id',  d.id);
      })
      .catch(() => {});
  }, [navigate]);

  useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const logout = () => {
    ['token','token_type','role','aide_id','aide_nom','aide_permissions'].forEach(k => localStorage.removeItem(k));
    navigate('/');
  };

  const canPatients = perms.peut_lire_dossier || perms.peut_creer_patient || perms.peut_modifier_patient;

  const NAV = [
    { path: '/aide/dashboard',        icon: LayoutDashboard, label: 'Tableau de bord', show: true  },
    { path: '/aide/patients',         icon: Users,           label: 'Patients',        show: canPatients },
    { path: '/aide/patients/nouveau', icon: UserPlus,        label: 'Nouveau patient', show: perms.peut_creer_patient },
    { path: '/aide/commentaires',     icon: MessageSquare,   label: 'Commentaires',    show: true  },
    { path: '/aide/notifications',    icon: Bell,            label: 'Notifications',   show: true  },
    { path: '/aide/profil',           icon: UserCircle,      label: 'Mon profil',      show: true  },
    { path: '/aide/parametres',       icon: Settings,        label: 'Paramètres',      show: true  },
  ].filter(n => n.show);

  const pageTitle = PAGE_TITLES[location.pathname]
    || (location.pathname.startsWith('/aide/patients/') && location.pathname !== '/aide/patients/nouveau' ? 'Dossier patient' : null)
    || 'Espace aide soignant';
  const expanded  = !collapsed || !isDesktop;
  const sw        = isDesktop ? (collapsed ? 'w-[68px]' : 'w-[240px]') : 'w-[240px]';
  const ml        = !isDesktop ? '0px' : collapsed ? '68px' : '240px';

  const itemCls = (active) => [
    'flex items-center gap-3 text-[14px] font-bold transition-all duration-150 rounded-xl',
    expanded ? 'px-3 py-2.5' : 'justify-center px-0 py-2.5 mx-auto w-11 h-11',
    active ? 'text-white' : 'text-white/80 hover:text-white',
  ].join(' ');

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {isDesktop && (
        <button onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-14 z-50 w-6 h-6 bg-white rounded-full border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition">
          <ChevronLeft size={12} className={`text-slate-400 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      )}
      {!isDesktop && mobileOpen && (
        <button onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 z-50 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)' }}>
          <X size={15} className="text-white/80" />
        </button>
      )}

      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 ${!isDesktop && mobileOpen ? 'pt-14' : ''} ${!expanded ? 'justify-center px-2' : ''}`}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
          <img src={logo} alt="PneumoIA" className="w-7 h-7 object-contain" />
        </div>
        {expanded && (
          <div>
            <h1 className="text-[14px] font-black text-white leading-tight">PneumoIA</h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] mt-0.5 text-white/45">Aide soignant</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {expanded && (
          <p className="px-2 mb-2 mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-white/50">Navigation</p>
        )}
        {NAV.map(item => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path}
              end={item.path === '/aide/patients'}
              onClick={() => !isDesktop && setMobileOpen(false)}
              className={({ isActive }) => itemCls(isActive)}>
              {({ isActive }) => (
                <>
                  <div className="relative shrink-0">
                    <Icon size={18} strokeWidth={2.8} className={isActive ? 'text-white' : 'text-white/80'} />
                    {isActive && (
                      <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                    )}
                  </div>
                  {expanded && <span className={`flex-1 truncate ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer - version minimale, topbar gère thème/logout/profil */}
      <div className="px-3 pb-4 shrink-0">
        <p className="text-center text-[9px] text-white/20 select-none">PneumoIA v2.0 · 2026</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-(--bg) text-(--t1) transition-colors duration-300">

      {/* Mobile overlay */}
      {!isDesktop && mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar desktop */}
      <aside className={`hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ${sw}`}
        style={{
          background: `linear-gradient(170deg, ${RED} 0%, ${RED_DARK} 100%)`,
          boxShadow: '2px 0 20px rgba(220,38,38,0.3)',
        }}>
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      <aside className={`fixed top-0 left-0 z-50 h-full lg:hidden transition-transform duration-300 ${sw} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: `linear-gradient(170deg, ${RED} 0%, ${RED_DARK} 100%)` }}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="transition-all duration-300 min-h-screen" style={{ marginLeft: ml }}>

        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-(--sf) border-b border-(--ln) shadow-sm">
          <div className="flex items-center justify-between px-5 h-14">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(o => !o)}
                className="lg:hidden p-2 rounded-lg hover:bg-(--sf2) transition-colors">
                <Menu className="w-5 h-5 text-(--t2)" />
              </button>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-(--t4)">Espace aide soignant</p>
                <p className="text-sm font-bold text-(--t1) leading-tight">{pageTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleTheme}
                className="p-2 rounded-lg bg-(--sf2) border border-(--ln) hover:bg-(--sf3) transition-colors">
                {theme === 'dark'
                  ? <Sun className="w-4 h-4 text-(--t3)" />
                  : <Moon className="w-4 h-4 text-(--t3)" />}
              </button>

              <NavLink to="/aide/notifications"
                className="relative p-2 rounded-lg bg-(--sf2) border border-(--ln) hover:bg-(--sf3) transition-colors">
                <Bell className="w-4 h-4 text-(--t3)" />
              </NavLink>

              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenu(u => !u)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-(--sf2) border border-(--ln) hover:bg-(--sf3) transition-all">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                    style={{ backgroundColor: RED }}>
                    {info.initials}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold text-(--t1) truncate max-w-30">{info.nom}</span>
                  <ChevronDown className={`hidden sm:block w-3 h-3 text-(--t4) transition-transform duration-200 ${userMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenu && (
                    <motion.div initial={{ opacity:0, y:-6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-6, scale:0.97 }}
                      transition={{ duration:0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-(--sf) rounded-xl border border-(--ln) shadow-xl overflow-hidden z-50">
                      <div className="p-3 border-b border-(--ln) bg-(--sf2)">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: RED }}>
                            {info.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-(--t1) truncate">{info.nom}</p>
                            <p className="text-[10px] font-mono text-(--t4) truncate">{info.id}</p>
                            <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Actif
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        {[
                          { to: '/aide/profil',     icon: UserCircle, label: 'Mon profil'  },
                          { to: '/aide/parametres', icon: Settings,   label: 'Paramètres' },
                        ].map(item => (
                          <NavLink key={item.to} to={item.to} onClick={() => setUserMenu(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-(--t2) hover:bg-(--sf2) transition-colors">
                            <item.icon className="w-3.5 h-3.5 text-(--t3)" /> {item.label}
                          </NavLink>
                        ))}
                        <div className="h-px bg-(--ln) my-1" />
                        <button onClick={toggleTheme}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-(--t2) hover:bg-(--sf2) transition-colors">
                          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-(--t3)" /> : <Moon className="w-3.5 h-3.5 text-(--t3)" />}
                          {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                        </button>
                        <div className="h-px bg-(--ln) my-1" />
                        <button onClick={logout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                          <LogOut className="w-3.5 h-3.5" /> Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 py-6" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
