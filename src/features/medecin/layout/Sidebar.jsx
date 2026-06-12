// src/features/medecin/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Stethoscope, Users, Share2,
  FolderOpen, MessageCircle, Bell, Search,
  User, Settings, History, X,
  ChevronLeft, Activity, MessageSquare,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from '../../../assets/images/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function fetchPartageBadge() {
  const token = localStorage.getItem('token');
  if (!token) return 0;
  const headers = { Authorization: `Bearer ${token}` };
  let total = 0;
  try {
    const r = await fetch(`${API_URL}/patients/access-requests/recues`, { headers });
    if (r.ok) { const d = await r.json(); total += Array.isArray(d) ? d.length : 0; }
  } catch {}
  try {
    const r = await fetch(`${API_URL}/patients/mes-partages`, { headers });
    if (r.ok) { const d = await r.json(); total += Array.isArray(d) ? d.length : 0; }
  } catch {}
  return total;
}

const NAV_MAIN = [
  { path: '/medecin/dashboard',    icon: LayoutDashboard, label: 'Tableau de bord' },
  { path: '/medecin/consultation', icon: Stethoscope,     label: 'Consultation'    },
  { path: '/medecin/patients',     icon: Users,           label: 'Patients'        },
  { path: '/medecin/partage',      icon: Share2,          label: 'Partage'         },
];
const NAV_COMMUNITY = [
  { path: '/medecin/cas-cliniques', icon: FolderOpen,    label: 'Cas cliniques' },
  { path: '/medecin/messagerie',    icon: MessageCircle, label: 'Messagerie',   badge: 2 },
  { path: '/medecin/commentaires',  icon: MessageSquare, label: 'Commentaires' },
  { path: '/medecin/monitoring',    icon: Activity,      label: 'Monitoring'   },
];
const NAV_ACCOUNT = [
  { path: '/medecin/historique',    icon: History,  label: 'Historique'     },
  { path: '/medecin/notifications', icon: Bell,     label: 'Notifications', badge: 5 },
  { path: '/medecin/recherche',     icon: Search,   label: 'Recherche'      },
  { path: '/medecin/profil',        icon: User,     label: 'Mon profil'     },
  { path: '/medecin/parametres',    icon: Settings, label: 'Paramètres'     },
];

const GROUPS = [
  { label: 'Menu principal', items: NAV_MAIN      },
  { label: 'Communauté',     items: NAV_COMMUNITY },
  { label: 'Mon compte',     items: NAV_ACCOUNT   },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, onCollapsedChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop,   setIsDesktop]   = useState(window.innerWidth >= 1024);
  const [badge,       setBadge]       = useState(0);

  useEffect(() => {
    fetchPartageBadge().then(setBadge);
    const t = setInterval(() => fetchPartageBadge().then(setBadge), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) setIsCollapsed(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { onCollapsedChange?.(isCollapsed); }, [isCollapsed, onCollapsedChange]);

  const sidebarWidth = isDesktop
    ? (isCollapsed ? 'w-[68px]' : 'w-[260px]')
    : 'w-[260px]';

  const expanded = !isCollapsed || !isDesktop;

  /* ─── Classe nav item ─────────────────────────────────────────── */
  const itemCls = (active) => [
    'relative flex items-center gap-3 rounded-xl text-[13.5px] font-semibold',
    'transition-all duration-200 border-l-[3px]',
    expanded ? 'px-3 py-2.5' : 'justify-center px-0 py-3 mx-auto w-11 h-11',
    active
      ? 'border-white text-white'
      : 'border-transparent text-white/70 hover:text-white',
  ].join(' ');

  /* ─── Contenu interne ─────────────────────────────────────────── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Bouton collapse desktop */}
      {isDesktop && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-15 z-50 w-6 h-6 bg-white rounded-full border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft
            size={13}
            className={`text-slate-400 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {/* Bouton fermeture mobile */}
      {!isDesktop && sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-3 top-3 z-50 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        >
          <X size={15} className="text-white/80" />
        </button>
      )}

      {/* ── Logo / Brand ──────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-3 px-4 py-5 ${!isDesktop && sidebarOpen ? 'pt-14' : ''} ${!expanded ? 'justify-center px-2' : ''}`}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-black/20">
          <img src={logo} alt="PneumoIA" className="w-9 h-9 object-contain" />
        </div>
        {expanded && (
          <div>
            <h1 className="text-[16px] font-black text-white leading-tight tracking-tight">
              PneumoIA
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Espace Médecin
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 sb-scroll">
        {GROUPS.map(({ label, items }) => (
          <div key={label} className="mt-5 first:mt-2">

            {/* Label de section */}
            {expanded && (
              <p
                className="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                {label}
              </p>
            )}
            {!expanded && (
              <div className="h-px mx-2 mb-2" style={{ background: 'rgba(255,255,255,0.15)' }} />
            )}

            {/* Items */}
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const itemBadge = item.path === '/medecin/partage' ? badge || null : item.badge;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={!expanded ? item.label : undefined}
                    onClick={() => !isDesktop && setSidebarOpen(false)}
                    className={({ isActive }) => itemCls(isActive)}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={18}
                          strokeWidth={3}
                          style={{ color: '#fff', flexShrink: 0 }}
                        />

                        {expanded && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {itemBadge && (
                              <span className="min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center bg-red-500 text-white">
                                {itemBadge}
                              </span>
                            )}
                          </>
                        )}
                        {!expanded && itemBadge && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white/20" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Pied ───────────────────────────────────────────────────── */}
      {expanded && (
        <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <p className="text-[10px] font-medium select-none" style={{ color: 'rgba(255,255,255,0.35)' }}>
            PneumoIA v2.0 · 2026
          </p>
        </div>
      )}
    </div>
  );

  /* ─── Rendu ───────────────────────────────────────────────────── */
  return (
    <>
      {!isDesktop && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ${sidebarWidth}`}
        style={{ background: 'var(--sb-bg)', boxShadow: '2px 0 24px var(--sb-glow)' }}
      >
        <SidebarContent />
      </aside>

      <aside
        className={`fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out lg:hidden ${sidebarWidth} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--sb-bg)', boxShadow: '4px 0 24px rgba(0,0,0,0.4)' }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
