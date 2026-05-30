export default function ActivityChart({ activite }) {
  const max = Math.max(...activite.courbe.map(c => c.val));

  return (
    <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-4">
      <div className="mb-3">
        <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Activité consultations</p>
        <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">7 derniers jours · temps réel</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { val: activite.total_semaine.toLocaleString(), lbl: "Total semaine"                       },
          { val: activite.moy_jour,                       lbl: "Moy. / jour"                        },
          { val: activite.pic.val,                        lbl: `Pic · ${activite.pic.jour}`          },
          { val: activite.variation,                      lbl: "Variation S-1", green: true          },
        ].map(({ val, lbl, green }) => (
          <div key={lbl} className="bg-gray-50 dark:bg-[#1c2128] rounded-lg px-2.5 py-2">
            <p className={`text-[15px] font-black ${green ? "text-green-600 dark:text-[#22c55e]" : "text-gray-800 dark:text-[#e6edf3]"}`}>
              {val}
            </p>
            <p className="text-[9px] text-gray-400 dark:text-[#484f58]">{lbl}</p>
          </div>
        ))}
      </div>

      <div className="flex items-end gap-1 h-16">
        {activite.courbe.map((c, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className={`w-full rounded-t transition-all ${
                i === activite.courbe.length - 1
                  ? "bg-green-500 dark:bg-[#22c55e]"
                  : "bg-green-100 dark:bg-[#0d2818] hover:bg-green-400 dark:hover:bg-[#22c55e]/60"
              }`}
              style={{ height: `${Math.round((c.val / max) * 100)}%` }}
            />
            <span className="text-[7px] text-gray-300 dark:text-[#484f58]">
              {c.jour.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}