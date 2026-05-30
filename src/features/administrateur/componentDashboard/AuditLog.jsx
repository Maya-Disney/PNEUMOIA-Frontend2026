import { ChevronRight } from "lucide-react";

const DOT = {
  success: "bg-green-500",
  danger:  "bg-red-500",
  info:    "bg-blue-400",
};

export default function AuditLog({ audit }) {
  return (
    <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Journal d'audit</p>
          <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">Dernières actions</p>
        </div>
        <button className="text-[10px] font-bold text-green-600 dark:text-[#22c55e] flex items-center gap-0.5 hover:underline">
          Voir tout <ChevronRight size={11} />
        </button>
      </div>

      <div className="flex flex-col">
        {audit.map(a => (
          <div key={a.id} className="flex gap-2.5 py-2 border-b border-gray-50 dark:border-[#21262d] last:border-0">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${DOT[a.type]}`} />
            <div>
              <p className="text-[10px] text-gray-700 dark:text-[#e6edf3] leading-snug">{a.msg}</p>
              <p className="text-[9px] text-gray-300 dark:text-[#484f58] mt-0.5">Il y a {a.temps}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}