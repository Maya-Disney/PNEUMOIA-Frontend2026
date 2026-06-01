import { useState } from "react";
import { Search, Bell, Sun, Moon, Menu } from "lucide-react";

const BRAND = "#0f766e";

export default function Topbar({ dark, setDark }) {
  const [query, setQuery] = useState("");

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 shrink-0 bg-white dark:bg-[#0d1117] border-b border-gray-100 dark:border-[#21262d]">

      {/* Mobile menu btn */}
      <button
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 mr-2"
        onClick={() => document.getElementById("sidebar-toggle")?.click()}
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#21262d] w-full max-w-xs">
        <Search size={14} className="text-gray-400 dark:text-[#484f58] shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher un médecin…"
          className="flex-1 bg-transparent text-[13px] text-gray-800 dark:text-white placeholder-gray-300 dark:placeholder-[#484f58] outline-none"
        />
      </div>

      <div className="flex items-center gap-2 ml-3">

        {/* Toggle dark/light */}
        <div className="flex gap-0.5 p-1 rounded-xl bg-gray-100 dark:bg-[#161b22] border border-gray-200 dark:border-[#21262d]">
          {[
            { mode: false, icon: <Sun size={13} />,  label: "Clair"  },
            { mode: true,  icon: <Moon size={13} />, label: "Sombre" },
          ].map(({ mode, icon, label }) => (
            <button
              key={label}
              onClick={() => setDark(mode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                dark === mode
                  ? "bg-white dark:text-white shadow-sm text-gray-800"
                  : "text-gray-400 dark:text-[#484f58]"
              }`}
              style={dark === mode && dark ? { background: BRAND } : {}}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-gray-100 dark:border-[#21262d] text-gray-400 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors">
          <Bell size={16} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[7px] font-black border-2 border-white dark:border-[#0d1117]">4</span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-black" style={{ background: BRAND }}>
          AD
        </div>
      </div>
    </header>
  );
}