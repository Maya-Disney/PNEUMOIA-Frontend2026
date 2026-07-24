import React from "react";

const concordanceItems = [
  { label: "Asthme sévère", value: 88, color: "bg-teal-500" },
  { label: "Pneumonie bactérienne", value: 85, color: "bg-teal-500" },
  { label: "BPCO", value: 83, color: "bg-teal-500" },
  { label: "Tuberculose", value: 82, color: "bg-blue-500" },
  { label: "Épanchement pleural", value: 76, color: "bg-orange-400" },
  { label: "Normal (pas de pathologie)", value: 57, color: "bg-red-400" },
];

const activityItems = [
  { color: "bg-teal-500", time: "Auj, 11:30", text: "Dr. Sow - inscription validée" },
  { color: "bg-blue-500", time: "Auj, 09:15", text: "Mise à jour IA v2.4.1 déployée" },
  { color: "bg-orange-400", time: "Hier, 16:30", text: "Dr. Mbang - accès suspendu" },
  { color: "bg-red-500", time: "14 mars", text: "Dr. Tabi - inscription refusée (CNOM invalide)" },
];

export default function ConcordanceIA({ darkMode }) {
  const visibleActivity = activityItems.slice(0, 3);

  const textMain = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div className="flex flex-col gap-3">

      {/* TOP 5 CONCORDANCES */}
      <div
        className={`rounded-2xl border p-4 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className={`font-semibold text-sm ${textMain}`}>
            Top 5 des concordances IA
          </h2>

          <span className="text-xs font-bold text-teal-500 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
            v2.4.1
          </span>
        </div>

        <div className="space-y-2.5">
          {concordanceItems.map((item) => {
            const safeValue = Math.min(item.value, 100);

            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${textMuted}`}>
                    {item.label}
                  </span>
                  <span className={`text-xs font-semibold ${textMain}`}>
                    {item.value}%
                  </span>
                </div>

                <div
                  className={`h-1.5 rounded-full overflow-hidden ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-700`}
                    style={{ width: `${safeValue}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIVITÉ RÉCENTE */}
      <div
        className={`rounded-2xl border p-4 max-h-[300px] overflow-y-auto ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}
      >
        <h2 className={`font-semibold text-sm mb-3 ${textMain}`}>
          Activité récente
        </h2>

        <div className="space-y-3">
          {visibleActivity.map((item, i) => (
            <div key={i} className="flex gap-3">

              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full mt-1 ${item.color}`} />

                {i < visibleActivity.length - 1 && (
                  <div
                    className={`w-px flex-1 mt-1 ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                    style={{ minHeight: "20px" }}
                  />
                )}
              </div>

              <div className="pb-2">
                <p className={`text-[10px] font-medium uppercase tracking-wide ${textMuted}`}>
                  {item.time}
                </p>

                <p className={`text-xs mt-0.5 leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {item.text}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}