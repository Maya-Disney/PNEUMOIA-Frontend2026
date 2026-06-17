import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCircle, LogOut, ChevronLeft,
  Menu, X, Bell, ChevronDown, Moon, Sun, UserPlus,
  Settings, MessageSquare, Leaf,
} from 'lucide-react';
import { useTheme } from '../../medecin/contexts/ThemeContext';
import logo from '../../../assets/images/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ── Palette aide soignant : vert forêt profond ───────────────────
// Volontairement DISTINCT du médecin (bleu #0066CC/#080F1A)
const SB = {
  bgLight:      '#ecfdf5',            // fond clair : vert très pâle
  bgDark:       '#052e16',            // fond sombre : forêt profonde
  borderLight:  'rgba(6,78,59,0.12)',
  borderDark:   'rgba(52,211,153,0.10)',
  activeLight:  'rgba(5,150,105,0.12)',
  activeDark:   'rgba(52,211,153,0.15)',
  activeTxLight:'#065f46',
  activeTxDark: '#6ee7b7',
  activeDot:    '#10b981',
  itemTxLight:  '#374151',
  itemTxDark:   'rgba(255,255,255,0.65)',
  secTxLight:   'rgba(6,78,59,0.50)',
  secTxDark:    'rgba(52,211,153,0.45)',
  footTxLight:  'rgba(6,78,59,0.35)',
  footTxDark:   'rgba(52,211,153,0.25)',
};

function getPerms() {
  try { return JSON.parse(localStorage.getItem('aide_permissions') || '{}'); } catch { return {}; }
}
function getInfo() {
  const nom  = localStorage.getItem('aide_nom') || 'Aide soignant';
  const prts = nom.trim().split(' ');
  return {
    nom,
    id:       localStorage.getItem('aide_id') || '',
    initials: prts.length >= 2 ? `${prts[0][0]}${prts[1][0]}`.toUpperCase() : nom.slice(0, 2).toUpperCase(),
  };
}

const PAGE_TITLES = {
  '/aide/dashboard':        'Tableau de bord',
  '/aide/patients':         'Patients',
  '/aide/patients/nouveau': 'Nouveau patient',
  '/aide/commentaires':     'Commentaires',
  '/aide/notifications':    'Notifications',
  '/aide/profil':           'Mon profil',
  '/aide/parametres':       'Paramètres',
};

/* ═══════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════ */
function AideSidebar({ sidebarOpen, setSidebarOpen, onCollapsedChange, isDark }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop,   setIsDesktop]   = useState(window.innerWidth >= 1024);
  const perms = getPerms();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fn = () => {
      const d = window.innerWidth >= 1024;
      setIsDesktop(d);
      if (!d) setIsCollapsed(false);
    };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => {
    const fetchCount = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const r = await fetch(`${API_URL}/notifications/count`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) { const d = await r.json(); setNotifCount(d.count || 0); }
      } catch {}
    };
    fetchCount();
    const t = setInterval(fetchCount, 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { onCollapsedChange?.(isCollapsed); }, [isCollapsed, onCollapsedChange]);

  const canPatients = perms.peut_lire_dossier || perms.peut_creer_patient || perms.peut_modifier_patient;

  const NAV_MAIN = [
    { path: '/aide/dashboard',        icon: LayoutDashboard, label: 'Tableau de bord', show: true },
    { path: '/aide/patients',         icon: Users,           label: 'Patients',        show: canPatients },
    { path: '/aide/patients/nouveau', icon: UserPlus,        label: 'Nouveau patient', show: perms.peut_creer_patient },
  ].filter(n => n.show);

  const NAV_ACCOUNT = [
    { path: '/aide/commentaires',  icon: MessageSquare, label: 'Commentaires',  show: true },
    { path: '/aide/notifications', icon: Bell,          label: 'Notifications', show: true, badge: notifCount || null },
    { path: '/aide/profil',        icon: UserCircle,    label: 'Mon profil',    show: true },
    { path: '/aide/parametres',    icon: Settings,      label: 'Paramètres',    show: true },
  ].filter(n => n.show);

  const GROUPS = [
    { label: 'Soins & patients', items: NAV_MAIN    },
    { label: 'Mon espace',       items: NAV_ACCOUNT },
  ];

  const sw       = isDesktop ? (isCollapsed ? 'w-[68px]' : 'w-[240px]') : 'w-[240px]';
  const expanded = !isCollapsed || !isDesktop;

  const sbBg     = isDark ? SB.bgDark     : SB.bgLight;
  const sbBorder = isDark ? SB.borderDark : SB.borderLight;
  const itemTx   = isDark ? SB.itemTxDark  : SB.itemTxLight;
  const secTx    = isDark ? SB.secTxDark   : SB.secTxLight;
  const activeBg = isDark ? SB.activeDark  : SB.activeLight;
  const activeTx = isDark ? SB.activeTxDark: SB.activeTxLight;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Collapse button */}
      {isDesktop && (
        <button onClick={() => setIsCollapsed(c => !c)}
          className="absolute -right-3 top-15 z-50 w-6 h-6 rounded-full border shadow-md flex items-center justify-center transition-colors"
          style={{ background: isDark ? '#134e4a' : '#fff', borderColor: isDark ? '#0d9488' : '#d1d5db' }}>
          <ChevronLeft size={13} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            style={{ color: isDark ? '#5eead4' : '#6b7280' }} />
        </button>
      )}

      {/* Mobile close */}
      {!isDesktop && sidebarOpen && (
        <button onClick={() => setSidebarOpen(false)}
          className="absolute right-3 top-3 z-50 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: isDark ? 'rgba(52,211,153,0.12)' : 'rgba(6,78,59,0.08)' }}>
          <X size={15} style={{ color: isDark ? '#6ee7b7' : '#065f46' }} />
        </button>
      )}

      {/* Logo zone — accent vert */}
      <div className={`flex flex-col items-center justify-center px-4 py-4 gap-1 ${!isDesktop && sidebarOpen ? 'pt-14' : ''}`}
        style={{ borderBottom: `1px solid ${sbBorder}`, minHeight: 90 }}>
        <img src={logo} alt="PneumoIA"
          style={{
            height:    expanded ? 44 : 28,
            width:     'auto',
            objectFit: 'contain',
            maxWidth:  160,
            filter:    isDark ? 'brightness(0) invert(1)' : 'none',
            transition:'height 0.3s ease',
          }}
        />
        {expanded && (
          <span className="text-[9px] font-black uppercase tracking-[0.25em] mt-1"
            style={{ color: isDark ? '#6ee7b7' : '#059669' }}>
            Espace aide soignant
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
        {GROUPS.map(({ label, items }) => (
          <div key={label}>
            {expanded && (
              <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: secTx }}>
                {label}
              </p>
            )}
            {!expanded && (
              <div className="h-px mx-2 mb-2" style={{ background: sbBorder }} />
            )}
            <div className="space-y-0.5">
              {items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path}
                    end={item.path === '/aide/patients'}
                    title={!expanded ? item.label : undefined}
                    onClick={() => !isDesktop && setSidebarOpen(false)}>
                    {({ isActive }) => (
                      <div className={[
                        'flex items-center gap-2.5 rounded-xl transition-all duration-150',
                        expanded ? 'px-3 py-2.5' : 'justify-center w-10 h-10 mx-auto py-0',
                        isActive ? 'font-bold' : 'font-medium',
                      ].join(' ')}
                        style={{
                          background: isActive ? activeBg : 'transparent',
                          color:      isActive ? activeTx : itemTx,
                          // Pill border gauche subtil sur item actif
                          boxShadow:  isActive && expanded ? `inset 3px 0 0 ${SB.activeDot}` : 'none',
                        }}>
                        <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background: isActive
                              ? (isDark ? 'rgba(16,185,129,0.20)' : 'rgba(5,150,105,0.12)')
                              : 'transparent',
                          }}>
                          <Icon size={16} strokeWidth={isActive ? 2.5 : 2}
                            style={{ color: isActive ? SB.activeDot : itemTx }} />
                        </div>
                        {expanded && (
                          <>
                            <span className="flex-1 truncate text-[13px]">{item.label}</span>
                            {item.badge ? (
                              <span className="min-w-4.5 h-4.5 px-1 text-[9px] font-bold rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                {item.badge > 99 ? '99+' : item.badge}
                              </span>
                            ) : isActive ? (
                              <span className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: SB.activeDot }} />
                            ) : null}
                          </>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {expanded && (
        <div className="px-4 py-3" style={{ borderTop: `1px solid ${sbBorder}` }}>
          <div className="flex items-center gap-1.5">
            <Leaf size={10} style={{ color: isDark ? '#6ee7b7' : '#059669' }} />
            <p className="text-[10px] font-medium select-none"
              style={{ color: isDark ? SB.footTxDark : SB.footTxLight }}>
              PneumoIA v2.0 · 2026
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {!isDesktop && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ${sw}`}
        style={{
          background: sbBg,
          borderRight: `1px solid ${sbBorder}`,
          boxShadow: isDark
            ? '2px 0 20px rgba(0,0,0,0.35)'
            : '2px 0 16px rgba(6,78,59,0.06)',
        }}>
        <SidebarContent />
      </aside>
      <aside className={`fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out lg:hidden ${sw} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: sbBg, borderRight: `1px solid ${sbBorder}` }}>
        <SidebarContent />
      </aside>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   TOPBAR
═══════════════════════════════════════════════════════ */
function AideTopbar({ sidebarOpen, setSidebarOpen, pageTitle, isDark }) {
  const [userMenu, setUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate    = useNavigate();
  const { toggleTheme } = useTheme();
  const [info,       setInfo]       = useState(getInfo());
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const r = await fetch(`${API_URL}/notifications/count`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) { const d = await r.json(); setNotifCount(d.count || 0); }
      } catch {}
    };
    fetchCount();
    const t = setInterval(fetchCount, 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/aides/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const nom  = `${d.prenom} ${d.nom}`;
        const prts = nom.trim().split(' ');
        const upd  = { nom, id: d.id, initials: prts.length >= 2 ? `${prts[0][0]}${prts[1][0]}`.toUpperCase() : nom.slice(0,2).toUpperCase() };
        setInfo(upd);
        localStorage.setItem('aide_nom', nom);
        localStorage.setItem('aide_id',  d.id);
      })
      .catch(() => {});
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

  const menuItems = [
    { icon: UserCircle, label: 'Mon profil',   path: '/aide/profil'     },
    { icon: Settings,   label: 'Paramètres',   path: '/aide/parametres' },
    { divider: true },
    {
      icon:    isDark ? Sun : Moon,
      label:   isDark ? 'Mode clair' : 'Mode sombre',
      onClick: () => { toggleTheme(); setUserMenu(false); },
    },
    { divider: true },
    { icon: LogOut, label: 'Déconnexion', onClick: logout, danger: true },
  ];

  return (
    <header className="sticky top-0 z-20 border-b shadow-sm w-full transition-colors duration-300"
      style={{ background: 'var(--sf)', borderColor: 'var(--ln)' }}>
      <div className="flex items-center justify-between px-6 h-14">

        {/* Gauche */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(o => !o)}
            className="lg:hidden p-2 rounded-xl transition-all"
            style={{ background: 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--sf2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Menu className="w-5 h-5" style={{ color: 'var(--t2)' }} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: 'var(--t4)' }}>
                Aide soignant
              </p>
            </div>
            <h1 className="text-[15px] font-bold leading-tight" style={{ color: 'var(--t1)' }}>
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Droite */}
        <div className="flex items-center gap-2">
          <Link to="/aide/notifications"
            className="relative p-2 rounded-xl border transition-all group"
            style={{ background: 'var(--sf2)', borderColor: 'var(--ln)' }}>
            <Bell className="w-4 h-4 group-hover:text-emerald-600 transition-colors"
              style={{ color: 'var(--t3)' }} />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-(--sf)">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </Link>

          {/* Avatar + menu */}
          <div className="relative" ref={userMenuRef}>
            <button onClick={() => setUserMenu(u => !u)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all"
              style={{ background: 'var(--sf2)', borderColor: 'var(--ln)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                {info.initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[12px] font-semibold leading-tight" style={{ color: 'var(--t1)' }}>{info.nom}</p>
                <p className="text-[10px]" style={{ color: 'var(--t4)' }}>Aide soignant</p>
              </div>
              <ChevronDown className={`hidden sm:block w-3.5 h-3.5 transition-transform duration-200 ${userMenu ? 'rotate-180' : ''}`}
                style={{ color: 'var(--t4)' }} />
            </button>

            {userMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border shadow-xl overflow-hidden z-50 animate-aide-in"
                style={{ background: 'var(--sf)', borderColor: 'var(--ln)' }}>
                {/* Header profil */}
                <div className="p-3.5 border-b" style={{ background: 'var(--sf2)', borderColor: 'var(--ln)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                      {info.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--t1)' }}>{info.nom}</p>
                      <p className="text-[10px] font-mono" style={{ color: 'var(--t4)' }}>{info.id}</p>
                      <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> En ligne
                      </span>
                    </div>
                  </div>
                </div>
                {/* Items */}
                <div className="p-1.5">
                  {menuItems.map((item, idx) =>
                    item.divider ? (
                      <div key={idx} className="h-px my-1" style={{ background: 'var(--ln)' }} />
                    ) : item.path ? (
                      <Link key={idx} to={item.path} onClick={() => setUserMenu(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${item.danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10' : ''}`}
                        style={!item.danger ? { color: 'var(--t2)' } : {}}
                        onMouseEnter={e => { if (!item.danger) e.currentTarget.style.background = 'var(--sf2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                        <item.icon className={`w-4 h-4 shrink-0 ${item.danger ? 'text-red-500' : 'text-emerald-600'}`} />
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    ) : (
                      <button key={idx} onClick={item.onClick}
                        className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${item.danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10' : ''}`}
                        style={!item.danger ? { color: 'var(--t2)' } : {}}
                        onMouseEnter={e => { if (!item.danger) e.currentTarget.style.background = 'var(--sf2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                        <item.icon className={`w-4 h-4 shrink-0 ${item.danger ? 'text-red-500' : 'text-emerald-600'}`} />
                        <span className="flex-1">{item.label}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes aide-fade-in { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .animate-aide-in { animation: aide-fade-in 0.18s ease-out; }
      `}</style>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════════════════ */
export default function AideLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop,   setIsDesktop]   = useState(window.innerWidth >= 1024);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { theme } = useTheme();
  const isDark    = theme === 'dark';

  useEffect(() => {
    if (localStorage.getItem('role') !== 'aide_soignant') navigate('/');
  }, [navigate]);

  useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const pageTitle  = PAGE_TITLES[location.pathname]
    || (location.pathname.startsWith('/aide/patients/') && location.pathname !== '/aide/patients/nouveau'
      ? 'Dossier patient' : 'Espace aide soignant');
  const marginLeft = !isDesktop ? '0px' : isCollapsed ? '68px' : '240px';

  return (
    <div className="min-h-screen transition-colors duration-300"
      style={{ background: 'var(--bg)', color: 'var(--t1)' }}>
      <AideSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onCollapsedChange={setIsCollapsed}
        isDark={isDark}
      />
      <div className="transition-all duration-300" style={{ marginLeft }}>
        <AideTopbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          pageTitle={pageTitle}
          isDark={isDark}
        />
        <main className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
