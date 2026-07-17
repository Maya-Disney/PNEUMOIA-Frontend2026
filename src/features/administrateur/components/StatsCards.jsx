import React from "react";

const CARD_CONFIG = [
  {
    key: "medecinsActifs",
    label: "Médecins actifs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    iconColor: "text-teal-600 dark:text-teal-400",
    urgent: false,
  },
  {
    key: "inscriptionsEnAttente",
    label: "Inscriptions en attente",
    trend: "Action requise",
    trendAlert: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-500",
    urgent: true,
  },
  {
    key: "consultationsTotales",
    label: "Consultations totales",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    urgent: false,
  },
];

function SkeletonCard({ darkMode }) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-4 animate-pulse ${
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
    }`}>
      <div className={`w-10 h-10 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
      <div className="space-y-2">
        <div className={`h-8 w-16 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
        <div className={`h-3 w-28 rounded ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
      </div>
      <div className={`h-3 w-20 rounded ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
    </div>
  );
}

export default function StatsCards({ darkMode, stats, loading }) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CARD_CONFIG.map((c) => <SkeletonCard key={c.key} darkMode={darkMode} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {CARD_CONFIG.map((cfg) => {
        const data  = stats[cfg.key] ?? {};
        const value = data.value ?? "—";
        const trend = cfg.trendAlert ? cfg.trend : data.delta;
        const trendUp = data.hausse ?? false;

        const displayValue = typeof value === "number"
          ? value.toLocaleString("fr-FR")
          : value;

        return (
          <div
            key={cfg.key}
            className={`
              rounded-2xl border p-5 flex flex-col gap-4
              transition-all duration-200 hover:shadow-md cursor-pointer
              ${cfg.urgent
                ? darkMode
                  ? "bg-orange-900/20 border-orange-700/40"
                  : "bg-orange-50 border-orange-200"
                : darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.iconBg} ${cfg.iconColor}`}>
                {cfg.icon}
              </div>
              {cfg.urgent && (
                <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Urgent
                </span>
              )}
            </div>

            <div>
              <p className={`text-3xl font-bold tracking-tight ${
                cfg.urgent
                  ? "text-orange-500"
                  : darkMode ? "text-white" : "text-gray-900"
              }`}>
                {displayValue}
              </p>
              <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {cfg.label}
              </p>
            </div>

            {trend && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                cfg.trendAlert
                  ? "text-orange-500"
                  : trendUp
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-red-500"
              }`}>
                {!cfg.trendAlert && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {trendUp
                      ? <polyline points="18 15 12 9 6 15"/>
                      : <polyline points="6 9 12 15 18 9"/>
                    }
                  </svg>
                )}
                {trend}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
