import { ChevronRight } from "lucide-react";

const AVATAR_COLORS = [
  "bg-green-100  dark:bg-green-900/20  text-green-700  dark:text-green-400",
  "bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400",
  "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
  "bg-red-100    dark:bg-red-900/20    text-red-700    dark:text-red-400",
];

const STATUT = {
  Actif:    "bg-green-100  dark:bg-green-900/20  text-green-700  dark:text-green-400",
  Attente:  "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  Suspendu: "bg-red-100    dark:bg-red-900/20    text-red-600    dark:text-red-400",
};

export default function DoctorsTable({ medecins }) {
  return (
    <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Médecins récents</p>
          <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">Activité & statut</p>
        </div>
        <button className="text-[10px] font-bold text-green-600 dark:text-[#22c55e] flex items-center gap-0.5 hover:underline">
          Gérer <ChevronRight size={11} />
        </button>
      </div>

      <table className="w-full" style={{ tableLayout: "fixed" }}>
        <thead>
          <tr>
            {["Médecin", "Consultations", "Dernière connexion", "Statut"].map(h => (
              <th key={h} className="text-left text-[9px] font-bold uppercase tracking-wider text-gray-300 dark:text-[#484f58] pb-2 border-b border-gray-50 dark:border-[#21262d]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {medecins.map((m, i) => (
            <tr key={m.id} className="border-b border-gray-50 dark:border-[#21262d] last:border-0">
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {m.initials}
                  </div>
                  <span className="text-[11px] font-bold text-gray-800 dark:text-[#e6edf3] truncate">{m.nom}</span>
                </div>
              </td>
              <td className="text-[11px] text-gray-500 dark:text-[#8b949e] py-2.5">{m.consult}</td>
              <td className="text-[10px] text-gray-400 dark:text-[#484f58] py-2.5">{m.derniere_co}</td>
              <td className="py-2.5">
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${STATUT[m.statut]}`}>
                  {m.statut}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}