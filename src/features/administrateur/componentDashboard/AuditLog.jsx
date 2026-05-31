import { ChevronRight } from "lucide-react";

const DOT = {
  success: "bg-teal-500",
  danger:  "bg-red-500",
  info:    "bg-blue-400",
};

export default function AuditLog({ audit }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[12px] font-bold text-gray-800 dark:text-white">Journal d'audit</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Dernières actions</p>
        </div>
        <button className="text-[10px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5 hover:underline">
          Voir tout <ChevronRight size={11} />
        </button>
      </div>

      <div className="flex flex-col">
        {audit.map(a => (
          <div key={a.id} className="flex gap-2.5 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${DOT[a.type]}`} />
            <div>
              <p className="text-[10px] text-gray-700 dark:text-gray-200 leading-snug">{a.msg}</p>
              <p className="text-[9px] text-gray-300 dark:text-gray-600 mt-0.5">Il y a {a.temps}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
