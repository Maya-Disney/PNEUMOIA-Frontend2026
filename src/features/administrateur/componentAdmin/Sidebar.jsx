import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, UserPlus, UserCheck, UserX,
  Stethoscope, UserMinus, LineChart, BarChart2,
  Brain, MapPin, FileSearch, Settings, LogOut
} from "lucide-react";

const NAV = [
  {
    section: null,
    items: [
      { to: "/administrateur/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    ]
  },
  {
    section: "Inscriptions",
    items: [
      { to: "/administrateur/demandes",  icon: UserPlus,    label: "Nouvelles demandes", badge: 4,  badgeColor: "orange" },
      { to: "/administrateur/validees",  icon: UserCheck,   label: "Validées ce mois",   badge: 12, badgeColor: "green"  },
      { to: "/administrateur/refusees",  icon: UserX,       label: "Refusées",            badge: 3,  badgeColor: "red"    },
    ]
  },
  {
    section: "Médecins",
    items: [
      { to: "/administrateur/medecins",  icon: Stethoscope, label: "Médecins actifs", badge: 38, badgeColor: "green" },
      { to: "/administrateur/suspendus", icon: UserMinus,   label: "Suspendus",       badge: 2,  badgeColor: "red"   },
    ]
  },
  {
    section: "Analyse",
    items: [
      { to: "/administrateur/activite",      icon: LineChart,  label: "Courbe d'activité"   },
      { to: "/administrateur/stats",         icon: BarChart2,  label: "Stats consultations" },
      { to: "/administrateur/performances",  icon: Brain,      label: "Performances IA"     },
      { to: "/administrateur/geo",           icon: MapPin,     label: "Répartition géo"     },
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

const BADGE = {
  green:  "bg-green-100  dark:bg-[#0d2818] text-green-700  dark:text-[#22c55e]",
  red:    "bg-red-100    dark:bg-[#3b0f0f] text-red-600    dark:text-[#f87171]",
  orange: "bg-orange-100 dark:bg-[#1f1208] text-orange-600 dark:text-[#fb923c]",
};

function Badge({ count, color }) {
  return (
    <span className={`ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded-full ${BADGE[color]}`}>
      {count}
    </span>
  );
}

export default function Sidebar({ dark }) {
  return (
    <aside className="w-52 shrink-0 h-full flex flex-col bg-white dark:bg-[#0d1117] border-r border-gray-200 dark:border-[#21262d] overflow-y-auto">

      <div className="h-11 flex items-center gap-2 px-4 border-b border-gray-100 dark:border-[#21262d] shrink-0">
        <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-[#22c55e]" />
        <span className="text-[13px] font-bold text-gray-900 dark:text-[#e6edf3]">
          Pneumo<span className="text-green-600 dark:text-[#22c55e]">IA</span>
        </span>
      </div>

      <nav className="flex-1 py-2">
        {NAV.map(({ section, items }, gi) => (
          <div key={gi} className="mb-1">
            {section && (
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#484f58] px-4 py-1.5">
                {section}
              </p>
            )}
            {items.map(({ to, icon: Icon, label, badge, badgeColor }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-[11.5px] font-semibold transition-all duration-100 ${
                    isActive
                      ? "bg-green-50 dark:bg-[#0d2818] text-green-700 dark:text-[#22c55e]"
                      : "text-gray-500 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#161b22] hover:text-gray-800 dark:hover:text-[#e6edf3]"
                  }`
                }
              >
                <Icon size={14} className="shrink-0" />
                <span className="truncate">{label}</span>
                {badge && <Badge count={badge} color={badgeColor} />}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="shrink-0 px-3 py-3 border-t border-gray-100 dark:border-[#21262d]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-green-600 dark:bg-[#22c55e] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-gray-800 dark:text-[#e6edf3] truncate">Administrateur</p>
            <p className="text-[9px] text-gray-400 dark:text-[#484f58] truncate">admin@pneumoia.cm</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[8px] text-gray-400 dark:text-[#484f58]">En ligne</span>
            </div>
          </div>
          <button className="text-gray-300 dark:text-[#484f58] hover:text-red-400 transition-colors">
            <LogOut size={13} />
          </button>
        </div>
      </div>

    </aside>
  );
}