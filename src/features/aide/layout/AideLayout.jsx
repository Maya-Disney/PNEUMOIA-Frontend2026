import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserCircle, LogOut, ChevronLeft,
  Menu, Bell, ChevronDown, Moon, Sun, UserPlus,
  Settings, MessageSquare, RefreshCw, Stethoscope, X,
  Activity
} from 'lucide-react';
import { useTheme } from '../../medecin/contexts/ThemeContext';
import logo from '../../../assets/images/logo.png';

const P = '#2563eb';
const P2 = '#1d4ed8';
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

const PAGE_META = {
  '/aide/dashboard':        { title: 'Tableau de bord',  icon: LayoutDashboard },
  '/aide/patients':         { title: 'Patients',          icon: Users           },
  '/aide/patients/nouveau': { title: 'Nouveau patient',   icon: UserPlus        },
  '/aide/commentaires':     { title: 'Messagerie',        icon: MessageSquare   },
  '/aide/notifications':    { title: 'Notifications',     icon: Bell            },
  '/aide/profil':           { title: 'Mon profil',        icon: UserCircle      },
  '/aide/parametres':       { title: 'Paramètres',        icon: Settings        },
};

export default function AideLayout() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop,  setIsDesktop]  = useState(window.innerWidth >= 1024);
  const [userMenu,   setUserMenu]   = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const userMenuRef = useRef(null);
  const navigate    = useNavigate();
  const location    = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

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
        setInfo({ nom, id: d.id, initials: prts.length >= 2 ? `${prts[0][0]}${prts[1][0]}`.toUpperCase() : nom.slice(0,2).toUpperCase() });
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
    const refresh = () => setInfo(getInfo());
    window.addEventListener('aide-profile-updated', refresh);
    return () => window.removeEventListener('aide-profile-updated', refresh);
  }, []);

  useEffect(() => {
    const fn = e => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const fetchNotifCount = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/notifications/count`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setNotifCount(d.count || 0))
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifCount();
    setTimeout(() => window.location.reload(), 200);
  };

  const logout = () => {
    ['token','token_type','role','aide_id','aide_nom','aide_permissions'].forEach(k => localStorage.removeItem(k));
    navigate('/');
  };

  const canPatients = perms.peut_lire_dossier || perms.peut_creer_patient || perms.peut_modifier_patient;

  const NAV = [
    { path: '/aide/dashboard',        icon: LayoutDashboard, label: 'Tableau de bord', show: true             },
    { path: '/aide/patients',         icon: Users,           label: 'Patients',        show: canPatients      },
    { path: '/aide/patients/nouveau', icon: UserPlus,        label: 'Nouveau patient', show: perms.peut_creer_patient },
    { path: '/aide/commentaires',     icon: MessageSquare,   label: 'Messagerie',      show: true             },
    { path: '/aide/notifications',    icon: Bell,            label: 'Notifications',   show: true             },
    { path: '/aide/profil',           icon: UserCircle,      label: 'Mon profil',      show: true             },
    { path: '/aide/parametres',       icon: Settings,        label: 'Paramètres',      show: true             },
  ].filter(n => n.show);

  const pageMeta = PAGE_META[location.pathname]
    || (location.pathname.startsWith('/aide/patients/') && location.pathname !== '/aide/patients/nouveau'
        ? { title: 'Dossier patient', icon: Users }
        : { title: 'Espace aide soignant', icon: Stethoscope });

  const expanded = !collapsed || !isDesktop;
  const sw = isDesktop ? (collapsed ? 'w-[68px]' : 'w-[240px]') : 'w-[240px]';
  const ml = !isDesktop ? '0px' : collapsed ? '68px' : '240px';

  const sidebarBg   = isDark ? '#0d1117' : '#ffffff';
  const sidebarBord = isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb';
  const itemText    = isDark ? 'rgba(255,255,255,0.55)' : '#6b7280';
  const sectionTx   = isDark ? 'rgba(255,255,255,0.20)' : '#9ca3af';

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Collapse button (desktop) */}
      {isDesktop && (
        <button onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-14 z-50 w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white"
          style={{ background: P }}>
          <ChevronLeft size={11} className={`text-white transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Mobile close */}
      {!isDesktop && mobileOpen && (
        <button onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 z-50 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
          <X size={15} className="text-slate-600 dark:text-white/70" />
        </button>
      )}

      {/* Logo */}
      <div className={`flex items-center px-4 py-4 ${!isDesktop && mobileOpen ? 'pt-14' : ''}`}
        style={{ borderBottom: `1px solid ${sidebarBord}`, minHeight: 70 }}>
        {expanded ? (
          <div className="flex items-center gap-2.5 w-full overflow-hidden">
            <img src={logo} alt="PneumoIA" style={{ height: 30, width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: P }}>Aide</p>
              <p className="text-[12px] font-black leading-none" style={{ color: isDark ? '#93c5fd' : P2 }}>Soignant</p>
            </div>
          </div>
        ) : (
          <img src={logo} alt="PneumoIA" style={{ height: 24, width: 'auto', margin: '0 auto' }} />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5">
        {expanded && (
          <p className="px-3 mb-2.5 text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: sectionTx }}>
            Navigation
          </p>
        )}
        {NAV.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/aide/patients'}
              onClick={() => !isDesktop && setMobileOpen(false)}
              className={`relative flex items-center gap-3 text-[13px] font-medium rounded-xl transition-all duration-150 ${
                expanded ? 'px-3 py-2.5' : 'justify-center px-0 py-2.5 w-10 h-10 mx-auto'
              }`}
              style={({ isActive }) => ({
                background: isActive
                  ? isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff'
                  : 'transparent',
                color: isActive
                  ? isDark ? '#93c5fd' : P2
                  : itemText,
                fontWeight: isActive ? 700 : 500,
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 inset-y-1 w-0.75 rounded-r-full"
                      style={{ background: P }} />
                  )}
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 1.75} />
                  {expanded && <span className="flex-1 truncate">{item.label}</span>}
                  {item.path === '/aide/notifications' && notifCount > 0 && expanded && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-white bg-red-500 leading-none">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                  {item.path === '/aide/notifications' && notifCount > 0 && !expanded && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${P2} 0%, ${P} 55%, #3b82f6 100%)`,
          borderTop: `1px solid ${P2}`,
          padding: collapsed && isDesktop ? '12px 8px' : '14px 12px',
        }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.08,
          backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)',
          backgroundSize: '14px 14px',
        }} />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0"
            style={{ background: 'rgba(255,255,255,0.20)', border: '1.5px solid rgba(255,255,255,0.35)' }}>
            {info.initials}
          </div>
          {expanded && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-white truncate leading-tight">{info.nom}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="text-[10px] text-white/60">En ligne</span>
                </div>
              </div>
              <button onClick={logout} title="Déconnexion"
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/15 transition-all">
                <LogOut size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-(--bg) text-(--t1) transition-colors duration-300">

      {!isDesktop && mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar desktop */}
      <aside className={`hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ${sw}`}
        style={{ background: sidebarBg, borderRight: `1px solid ${sidebarBord}`, boxShadow: '4px 0 20px rgba(0,0,0,0.04)' }}>
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      <aside className={`fixed top-0 left-0 z-50 h-full lg:hidden transition-transform duration-300 ${sw} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: sidebarBg, borderRight: `1px solid ${sidebarBord}` }}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="transition-all duration-300 min-h-screen flex flex-col" style={{ marginLeft: ml }}>

        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-(--ln)"
          style={{ background: isDark ? 'rgba(13,17,23,0.96)' : 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between px-5" style={{ height: 56 }}>

            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(o => !o)}
                className="lg:hidden p-2 rounded-xl hover:bg-(--sf2) transition-colors">
                <Menu className="w-5 h-5 text-(--t2)" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex w-7 h-7 rounded-lg items-center justify-center shrink-0"
                  style={{ background: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff' }}>
                  <pageMeta.icon size={13} style={{ color: P }} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: P }}>
                    Espace aide soignant
                  </p>
                  <p className="text-[13px] font-bold text-(--t1) leading-tight">{pageMeta.title}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button onClick={toggleTheme}
                className="p-2 rounded-xl bg-(--sf2) border border-(--ln) hover:bg-(--sf3) transition-colors">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-(--t3)" /> : <Moon className="w-4 h-4 text-(--t3)" />}
              </button>

              <button onClick={handleRefresh} disabled={refreshing} title="Actualiser"
                className="p-2 rounded-xl bg-(--sf2) border border-(--ln) hover:bg-(--sf3) transition-colors disabled:opacity-60">
                <RefreshCw className={`w-4 h-4 text-(--t3) ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              <NavLink to="/aide/notifications"
                className="relative p-2 rounded-xl bg-(--sf2) border border-(--ln) hover:bg-(--sf3) transition-colors">
                <Bell className="w-4 h-4 text-(--t3)" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none">
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </NavLink>

              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenu(u => !u)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-(--sf2) border border-(--ln) hover:bg-(--sf3) transition-all">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0"
                    style={{ background: `linear-gradient(135deg, ${P2}, ${P})` }}>
                    {info.initials}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold text-(--t1) truncate max-w-28">{info.nom}</span>
                  <ChevronDown className={`hidden sm:block w-3 h-3 text-(--t4) transition-transform duration-200 ${userMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenu && (
                    <motion.div
                      initial={{ opacity:0, y:-6, scale:0.97 }}
                      animate={{ opacity:1, y:0,  scale:1 }}
                      exit={{    opacity:0, y:-6, scale:0.97 }}
                      transition={{ duration:0.14 }}
                      className="absolute right-0 mt-2 w-52 bg-(--sf) rounded-2xl border border-(--ln) shadow-xl overflow-hidden z-50">
                      <div className="relative p-4 overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${P2}, ${P})` }}>
                        <div style={{ position:'absolute', inset:0, opacity:0.08, backgroundImage:'radial-gradient(circle at 2px 2px,#fff 1px,transparent 0)', backgroundSize:'10px 10px' }} />
                        <div className="relative flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                            style={{ background:'rgba(255,255,255,0.20)', border:'1.5px solid rgba(255,255,255,0.30)' }}>
                            {info.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{info.nom}</p>
                            <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold bg-white/15 text-white/90 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                              Aide soignant
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <NavLink to="/aide/profil" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-(--sf2) transition-colors text-sm text-(--t2)">
                          <UserCircle size={14} /> Mon profil
                        </NavLink>
                        <NavLink to="/aide/parametres" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-(--sf2) transition-colors text-sm text-(--t2)">
                          <Settings size={14} /> Paramètres
                        </NavLink>
                        <div className="border-t border-(--ln) my-1" />
                        <button onClick={logout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-sm text-red-600 dark:text-red-400 transition-colors">
                          <LogOut size={14} /> Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
