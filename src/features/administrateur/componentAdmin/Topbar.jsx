import { useState } from "react";
import { Search, Bell, Sun, Moon } from "lucide-react";

export default function Topbar({ dark, setDark }) {
  const [query, setQuery] = useState("");

  return (
    <header className="h-11 flex items-center justify-between px-5 shrink-0 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-[#21262d]">

      <div className="flex items-center gap-2 w-52 h-8 px-3 rounded-lg bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#21262d]">
        <Search size={13} className="text-gray-400 dark:text-[#484f58] shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher un médecin…"
          className="flex-1 bg-transparent text-[12px] text-gray-800 dark:text-[#e6edf3] placeholder-gray-300 dark:placeholder-[#484f58] outline-none"
        />
      </div>

      <div className="flex items-center gap-2">

        <div className="flex gap-0.5 p-0.5 rounded-full bg-gray-100 dark:bg-[#161b22] border border-gray-200 dark:border-[#21262d]">
          {[
            { mode: false, icon: <Sun size={12} />, label: "Clair" },
            { mode: true,  icon: <Moon size={12} />, label: "Sombre" },
          ].map(({ mode, icon, label }) => (
            <button
              key={label}
              onClick={() => setDark(mode)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-150
                ${dark === mode
                  ? "bg-white dark:bg-[#22c55e]/20 text-gray-800 dark:text-[#22c55e] border border-gray-200 dark:border-[#22c55e]/30"
                  : "text-gray-400 dark:text-[#484f58]"
                }`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 dark:border-[#21262d] text-gray-400 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors">
          <Bell size={15} />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[7px] font-bold border-2 border-white dark:border-[#0d1117]">
            4
          </span>
        </button>

        <div className="w-8 h-8 rounded-full bg-green-600 dark:bg-[#22c55e] flex items-center justify-center text-white text-[10px] font-bold">
          AD
        </div>

      </div>
    </header>
  );
}