import { useState } from "react";
import logo from "../../../assets/images/logo.png";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, UserPlus, UserCheck, UserX,
  Stethoscope, UserMinus, LineChart, BarChart2,
  Brain, MapPin, FileSearch, Settings, LogOut,
  ChevronDown, ChevronRight, Menu, X
} from "lucide-react";

const BRAND = "#0f766e";

const NAV = [
  {
    section: null,
    items: [{ to: "/administrateur/dashboard", icon: LayoutDashboard, label: "Tableau de bord" }]
  },
  {
    section: "Inscriptions",
    items: [
      { to: "/administrateur/demandes",  icon: UserPlus,   label: "Nouvelles demandes", badge: 4,  badgeColor: "orange" },
      { to: "/administrateur/validees",  icon: UserCheck,  label: "Validées ce mois",   badge: 12, badgeColor: "teal"   },
      { to: "/administrateur/refusees",  icon: UserX,      label: "Refusées",            badge: 3,  badgeColor: "red"    },
    ]
  },
  {
    section: "Médecins",
    items: [
      { to: "/administrateur/medecins",  icon: Stethoscope, label: "Médecins actifs", badge: 38, badgeColor: "teal" },
      { to: "/administrateur/suspendus", icon: UserMinus,   label: "Suspendus",       badge: 2,  badgeColor: "red"  },
    ]
  },
  {
    section: "Analyse",
    items: [
      { to: "/administrateur/activite",     icon: LineChart, label: "Courbe d'activité"   },
      { to: "/administrateur/stats",        icon: BarChart2, label: "Stats consultations" },
      { to: "/administrateur/performances", icon: Brain,     label: "Performances IA"     },
      { to: "/administrateur/geo",          icon: MapPin,    label: "Répartition géo"     },
    ]
  },
  {
    section: "Système",
    items: [
      { to: "/administrateur/audit",      icon: FileSearch, label: "Journal d'audit" },
      { to: "/administrateur/parametres", icon: Settings,   label: "Paramètres"      },
    ]
  },
];

const BADGE_CLS = {
  teal:   "bg-teal-100   dark:bg-teal-900/30  text-teal-700   dark:text-teal-400",
  red:    "bg-red-100    dark:bg-red-900/30   text-red-600    dark:text-red-400",
  orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
};

export default function Sidebar({ dark }) {
  const [open, setOpen] = useState(false);

  const inner = (
    <aside className={`
      h-full flex flex-col bg-white dark:bg-[#0d1117]
      border-r border-gray-100 dark:border-[#21262d]
      w-56 shrink-0 overflow-y-auto
    `}>
      {/* Brand */}
      <div className="h-20 flex items-center justify-center px-4 border-b border-gray-100 dark:border-[#21262d] shrink-0 relative">
        <img
          src={logo}
          alt="PneumoIA"
          style={{
            height: 64,
            width: "auto",
            objectFit: "contain",
            maxWidth: 200,
            filter: dark ? "brightness(1.15)" : "none",
            transition: "filter .25s",
          }}
        />
        {/* Fermer sur mobile */}
        <button onClick={() => setOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 lg:hidden text-gray-400">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2">
        {NAV.map(({ section, items }, gi) => (
          <div key={gi} className="mb-2">
            {section && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#484f58] px-3 py-1.5">
                {section}
              </p>
            )}
            {items.map(({ to, icon: Icon, label, badge, badgeColor }) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-semibold transition-all mb-0.5 ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#161b22] hover:text-gray-800 dark:hover:text-white"
                  }`
                }
                style={({ isActive }) => isActive ? { background: BRAND } : {}}
              >
                <Icon size={15} className="shrink-0" />
                <span className="truncate flex-1">{label}</span>
                {badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${BADGE_CLS[badgeColor]}`}>
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-3 py-3 border-t border-gray-100 dark:border-[#21262d]">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0" style={{ background: BRAND }}>
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold text-gray-800 dark:text-white truncate">Administrateur</p>
            <p className="text-[10px] text-gray-400 dark:text-[#484f58] truncate">admin@pneumoia.cm</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[9px] text-gray-400 dark:text-[#484f58]">En ligne</span>
            </div>
          </div>
          <button className="text-gray-300 dark:text-[#484f58] hover:text-red-400 transition-colors p-1">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex">{inner}</div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-50">{inner}</div>
        </div>
      )}

      {/* Mobile toggle button — exposé via context */}
      <button
        id="sidebar-toggle"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-30 w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-gray-300 shadow-sm"
      >
        <Menu size={16} />
      </button>
    </>
  );
}