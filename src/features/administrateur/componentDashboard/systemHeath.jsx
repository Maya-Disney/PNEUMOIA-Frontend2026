const BARS = [
  { key: "modele_ia",       label: "Modèle IA",        color: "#0d9488", tcolor: "text-teal-600 dark:text-teal-400"    },
  { key: "serveur",         label: "Serveur API",       color: "#0d9488", tcolor: "text-teal-600 dark:text-teal-400"    },
  { key: "base_de_donnees", label: "Base de données",   color: "#3b82f6", tcolor: "text-blue-500 dark:text-blue-400"    },
  { key: "stockage",        label: "Stockage fichiers", color: "#f97316", tcolor: "text-orange-500 dark:text-orange-400"},
];

export default function SystemHealth({ systeme }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
      <div className="mb-3">
        <p className="text-[12px] font-bold text-gray-800 dark:text-white">Santé du système</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Temps réel</p>
      </div>

      <div className="flex flex-col gap-3">
        {BARS.map(({ key, label, color, tcolor }) => (
          <div key={key}>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">{label}</span>
              <span className={`text-[10px] font-bold ${tcolor}`}>{systeme[key]}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${systeme[key]}%`, background: color }} />
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-gray-50 dark:border-gray-700">
          <p className="text-[8px] font-bold uppercase tracking-wider text-gray-300 dark:text-gray-600 mb-2">
            Uptime 30 jours
          </p>
          <div className="flex gap-0.5">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className="flex-1 h-4 rounded-sm"
                style={{ background: Math.random() > 0.05 ? "#0d9488" : "#ef4444" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
