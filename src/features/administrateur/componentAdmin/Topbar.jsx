import { useState } from "react";
import { Search, Bell, Sun, Moon, Menu } from "lucide-react";

const BRAND = "#0f766e";

// Blanc cassé chaud pour la topbar
const TOPBAR_LIGHT = "#f0f7f5";
const TOPBAR_DARK  = "#0d1117";

export default function Topbar({ dark, setDark }) {
  const [query, setQuery] = useState("");

  return (
    <header
      className="h-14 flex items-center justify-between px-4 md:px-6 shrink-0 border-b"
      style={{
        background:   dark ? TOPBAR_DARK : TOPBAR_LIGHT,
        borderColor:  dark ? "#1e2a28" : "#e2ebe6",
      }}
    >
      {/* Mobile menu btn */}
      <button
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg mr-2"
        style={{ color: dark ? "#8b949e" : "#6b7280" }}
        onClick={() => document.getElementById("sidebar-toggle")?.click()}
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div
        className="flex items-center gap-2 h-9 px-3 rounded-xl border w-full max-w-xs"
        style={{
          background:  dark ? "#161b22" : "#f0f4f2",
          borderColor: dark ? "#21262d" : "#d4e0da",
        }}
      >
        <Search size={14} style={{ color: dark ? "#484f58" : "#9ca3af", flexShrink: 0 }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher un médecin…"
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            fontSize: 13, color: dark ? "#e6edf3" : "#1f2937",
          }}
        />
      </div>

      <div className="flex items-center gap-2 ml-3">

        {/* Toggle dark / light */}
        <div
          className="flex gap-0.5 p-1 rounded-xl border"
          style={{
            background:  dark ? "#161b22" : "#edf2ef",
            borderColor: dark ? "#21262d" : "#d4e0da",
          }}
        >
          {[
            { mode: false, icon: <Sun  size={13} />, label: "Clair"  },
            { mode: true,  icon: <Moon size={13} />, label: "Sombre" },
          ].map(({ mode, icon, label }) => {
            const isActive = dark === mode;
            return (
              <button
                key={label}
                onClick={() => setDark(mode)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                style={{
                  background: isActive ? (dark ? BRAND : "#ffffff") : "transparent",
                  color:      isActive ? (dark ? "#ffffff" : "#0f766e") : (dark ? "#484f58" : "#6b7280"),
                  boxShadow:  isActive ? "0 1px 3px rgba(0,0,0,.1)" : "none",
                }}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-xl border transition-colors"
          style={{
            borderColor: dark ? "#21262d" : "#d4e0da",
            color:       dark ? "#8b949e" : "#6b7280",
            background:  "transparent",
          }}
          onMouseEnter={e => e.currentTarget.style.background = dark ? "#161b22" : "#edf2ef"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <Bell size={16} />
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[7px] font-black"
            style={{ border: `2px solid ${dark ? TOPBAR_DARK : TOPBAR_LIGHT}` }}
          >
            4
          </span>
        </button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-black"
          style={{ background: BRAND }}
        >
          AD
        </div>
      </div>
    </header>
  );
}