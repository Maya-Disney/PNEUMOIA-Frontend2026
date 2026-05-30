import { ChevronRight } from "lucide-react";

const COLORS = [
  "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
  "bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400",
  "bg-pink-100   dark:bg-pink-900/20   text-pink-700   dark:text-pink-400",
  "bg-blue-100   dark:bg-blue-900/20   text-blue-700   dark:text-blue-400",
];

export default function PendingRequests({ demandes }) {
  return (
    <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Demandes en attente</p>
          <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">Validation documents</p>
        </div>
        <button className="text-[10px] font-bold text-green-600 dark:text-[#22c55e] flex items-center gap-0.5 hover:underline">
          Tout voir <ChevronRight size={11} />
        </button>
      </div>

      <div className="flex flex-col gap-0.5">
        {demandes.map((d, i) => (
          <div key={d.id} className="flex items-center gap-2.5 py-2 border-b border-gray-50 dark:border-[#21262d] last:border-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${COLORS[i % COLORS.length]}`}>
              {d.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-800 dark:text-[#e6edf3] truncate">{d.nom}</p>
              <p className="text-[9px] text-gray-400 dark:text-[#484f58]">{d.spec}</p>
              <div className="flex gap-1.5 mt-1">
                <button className="text-[8px] font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-[#0d2818] text-green-700 dark:text-[#22c55e]">
                  ✓ Valider
                </button>
                <button className="text-[8px] font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  ✗ Refuser
                </button>
              </div>
            </div>
            <span className="text-[9px] text-gray-300 dark:text-[#484f58] shrink-0">{d.depuis}</span>
          </div>
        ))}
      </div>
    </div>
  );
}