import { ChevronRight } from "lucide-react";

const AVATAR_COLORS = [
  "bg-teal-100   dark:bg-teal-900/20   text-teal-700   dark:text-teal-400",
  "bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400",
  "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
  "bg-red-100    dark:bg-red-900/20    text-red-700    dark:text-red-400",
];

const STATUT = {
  Actif:    "bg-teal-100   dark:bg-teal-900/20   text-teal-700   dark:text-teal-400",
  Attente:  "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  Suspendu: "bg-red-100    dark:bg-red-900/20    text-red-600    dark:text-red-400",
};

export default function DoctorsTable({ medecins }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[12px] font-bold text-gray-800 dark:text-white">Médecins récents</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Activité &amp; statut</p>
        </div>
        <button className="text-[10px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5 hover:underline">
          Gérer <ChevronRight size={11} />
        </button>
      </div>

      <table className="w-full" style={{ tableLayout: "fixed" }}>
        <thead>
          <tr>
            {["Médecin", "Consultations", "Dernière connexion", "Statut"].map(h => (
              <th key={h} className="text-left text-[9px] font-bold uppercase tracking-wider text-gray-300 dark:text-gray-600 pb-2 border-b border-gray-50 dark:border-gray-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {medecins.map((m, i) => (
            <tr key={m.id} className="border-b border-gray-50 dark:border-gray-700 last:border-0">
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {m.initials}
                  </div>
                  <span className="text-[11px] font-bold text-gray-800 dark:text-white truncate">{m.nom}</span>
                </div>
              </td>
              <td className="text-[11px] text-gray-500 dark:text-gray-400 py-2.5">{m.consult}</td>
              <td className="text-[10px] text-gray-400 dark:text-gray-500 py-2.5">{m.derniere_co}</td>
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
