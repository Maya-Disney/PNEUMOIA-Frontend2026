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

const BLUE = '#2563EB';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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

  const isDark = theme === 'dark';

  // ── Palette sidebar ────────────────────────────────────────────
  const SIDEBAR_BG  = isDark ? '#0a1525' : '#EEF3FF';
  const BORDER_C    = isDark ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.18)';
  const ACTIVE_BG   = isDark ? 'rgba(37,99,235,0.22)' : 'rgba(255,255,255,0.95)';
  const ACTIVE_TX   = isDark ? '#93C5FD'               : '#1D4ED8';
  const ACTIVE_SH   = isDark ? 'none'                  : '0 1px 6px rgba(37,99,235,0.14)';
  const ITEM_TX     = isDark ? 'rgba(255,255,255,0.65)' : '#1e3a6e';
  const SEC_TX      = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(10,50,120,0.48)';
  const FOOT_TX     = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(10,50,120,0.28)';

  const perms = getPerms();
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
  const expanded = !collapsed || !isDesktop;
  const sw       = isDesktop ? (collapsed ? 'w-[68px]' : 'w-[240px]') : 'w-[240px]';
  const ml       = !isDesktop ? '0px' : collapsed ? '68px' : '240px';

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Toggle collapse (desktop) */}
      {isDesktop && (
        <button onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-14 z-50 w-6 h-6 bg-white rounded-full border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition">
          <ChevronLeft size={12} className={`text-slate-400 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Fermeture mobile */}
      {!isDesktop && mobileOpen && (
        <button onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 z-50 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(37,99,235,0.10)' }}>
          <X size={15} style={{ color: isDark ? 'rgba(255,255,255,0.7)' : BLUE }} />
        </button>
      )}

      {/* Logo */}
      <div className={`flex items-center justify-center px-4 py-4 ${!isDesktop && mobileOpen ? 'pt-14' : ''}`}
        style={{ borderBottom: `1px solid ${BORDER_C}`, minHeight: 80 }}>
        <img
          src={logo}
          alt="PneumoIA"
          style={{
            height:    expanded ? 54 : 30,
            width:     'auto',
            objectFit: 'contain',
            maxWidth:  175,
            filter:    isDark ? 'brightness(1.1)' : 'none',
            transition:'height 0.3s ease',
          }}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {expanded && (
          <p className="px-2 mb-2 mt-1 text-[10px] font-black uppercase tracking-[0.28em]"
            style={{ color: SEC_TX }}>Navigation</p>
        )}
        {NAV.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/aide/patients'}
              onClick={() => !isDesktop && setMobileOpen(false)}
              className={[
                'flex items-center gap-3 text-[13.5px] font-semibold transition-all duration-150 rounded-xl',
                expanded ? 'px-3 py-2.5' : 'justify-center px-0 py-2.5 mx-auto w-11 h-11',
              ].join(' ')}
              style={({ isActive }) => ({
                background: isActive ? ACTIVE_BG : 'transparent',
                color:      isActive ? ACTIVE_TX : ITEM_TX,
                boxShadow:  isActive ? ACTIVE_SH : 'none',
              })}
            >
              {({ isActive }) => (
                <>
                  <div className="relative shrink-0">
                    <Icon size={18} strokeWidth={2.8} style={{ color: isActive ? ACTIVE_TX : ITEM_TX }} />
                    {isActive && expanded && (
                      <span
                        className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                        style={{ backgroundColor: BLUE }}
                      />
                    )}
                  </div>
                  {expanded && (
                    <span className="flex-1 truncate" style={{ fontWeight: isActive ? 700 : 500 }}>
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 shrink-0">
        <p className="text-center text-[9px] select-none" style={{ color: FOOT_TX }}>
          PneumoIA v2.0 · 2026
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-(--bg) text-(--t1) transition-colors duration-300">

      {/* Overlay mobile */}
      {!isDesktop && mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar desktop */}
      <aside className={`hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ${sw}`}
        style={{
          background:   SIDEBAR_BG,
          borderRight:  `1px solid ${BORDER_C}`,
          boxShadow:    isDark ? '2px 0 20px rgba(0,0,0,0.25)' : '2px 0 20px rgba(37,99,235,0.08)',
        }}>
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      <aside className={`fixed top-0 left-0 z-50 h-full lg:hidden transition-transform duration-300 ${sw} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: SIDEBAR_BG, borderRight: `1px solid ${BORDER_C}` }}>
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
                <p className="text-[9px] font-black uppercase tracking-[0.2em]"
                  style={{ color: BLUE }}>Espace aide soignant</p>
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
                    style={{ backgroundColor: BLUE }}>
                    {info.initials}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold text-(--t1) truncate max-w-30">{info.nom}</span>
                  <ChevronDown className={`hidden sm:block w-3 h-3 text-(--t4) transition-transform duration-200 ${userMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenu && (
                    <motion.div
                      initial={{ opacity:0, y:-6, scale:0.97 }}
                      animate={{ opacity:1, y:0,  scale:1   }}
                      exit={{    opacity:0, y:-6, scale:0.97 }}
                      transition={{ duration:0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-(--sf) rounded-xl border border-(--ln) shadow-xl overflow-hidden z-50">
                      <div className="p-3 border-b border-(--ln) bg-(--sf2)">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: BLUE }}>
                            {info.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-(--t1) truncate">{info.nom}</p>
                            <p className="text-[10px] font-mono text-(--t4) truncate">{info.id}</p>
                            <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Actif
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
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
