import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, UserPlus, UserCheck, UserX,
  Stethoscope, UserMinus, LineChart, BarChart2,
  Brain, MapPin, FileSearch, Settings, LogOut, X
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
      { to: "/administrateur/validees",  icon: UserCheck,   label: "Validées ce mois",   badge: 12, badgeColor: "teal"   },
      { to: "/administrateur/refusees",  icon: UserX,       label: "Refusées",            badge: 3,  badgeColor: "red"    },
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
      { to: "/administrateur/activite",     icon: LineChart,  label: "Courbe d'activité"   },
      { to: "/administrateur/stats",        icon: BarChart2,  label: "Stats consultations" },
      { to: "/administrateur/performances", icon: Brain,      label: "Performances IA"     },
      { to: "/administrateur/geo",          icon: MapPin,     label: "Répartition géo"     },
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

function Badge({ count, color, dark }) {
  const styles = {
    teal:   { bg: dark ? "rgba(13,148,136,.15)" : "#ccfbf1", text: dark ? "#2dd4bf" : "#0f766e" },
    red:    { bg: dark ? "rgba(239,68,68,.15)"  : "#fee2e2", text: dark ? "#f87171" : "#dc2626" },
    orange: { bg: dark ? "rgba(249,115,22,.15)" : "#ffedd5", text: dark ? "#fb923c" : "#ea580c" },
  };
  const s = styles[color] ?? styles.teal;
  return (
    <span
      className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.text }}
    >
      {count}
    </span>
  );
}

export default function Sidebar({ dark, mobileOpen, setMobileOpen }) {
  const border = dark ? "border-gray-700" : "border-gray-100";

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-52
        lg:relative lg:inset-auto lg:z-auto
        flex flex-col border-r transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}
      `}>

        {/* En-tête logo */}
        <div className={`h-12 flex items-center justify-between px-4 border-b shrink-0 ${border}`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span className={`text-[13px] font-bold ${dark ? "text-white" : "text-gray-900"}`}>
              Pneumo<span className="text-teal-600">IA</span>
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className={`lg:hidden p-1 rounded ${dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
          >
            <X size={15} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV.map(({ section, items }, gi) => (
            <div key={gi} className="mb-1">
              {section && (
                <p className={`text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>
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
                        ? dark
                          ? "bg-teal-900/20 text-teal-400"
                          : "bg-teal-50 text-teal-700"
                        : dark
                          ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`
                  }
                >
                  <Icon size={14} className="shrink-0" />
                  <span className="truncate">{label}</span>
                  {badge && <Badge count={badge} color={badgeColor} dark={dark} />}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Pied — profil admin */}
        <div className={`shrink-0 px-3 py-3 border-t ${border}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-[11px] font-bold truncate ${dark ? "text-white" : "text-gray-800"}`}>
                Administrateur
              </p>
              <p className={`text-[9px] truncate ${dark ? "text-gray-500" : "text-gray-400"}`}>
                admin@pneumoia.cm
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className={`text-[8px] ${dark ? "text-gray-500" : "text-gray-400"}`}>En ligne</span>
              </div>
            </div>
            <button className={`transition-colors ${dark ? "text-gray-600 hover:text-red-400" : "text-gray-300 hover:text-red-400"}`}>
              <LogOut size={13} />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
