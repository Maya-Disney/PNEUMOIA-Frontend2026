import { Stethoscope, Clock, Activity, Brain, TrendingUp, AlertTriangle } from "lucide-react";

const CONFIG = [
  { key: "medecins_actifs",     icon: Stethoscope, label: "Médecins actifs",       ibg: "bg-green-50  dark:bg-[#0d2818]", icolor: "text-green-600 dark:text-[#22c55e]" },
  { key: "inscriptions_attente",icon: Clock,       label: "Inscriptions en attente",ibg: "bg-orange-50 dark:bg-[#1f1208]", icolor: "text-orange-500" },
  { key: "consultations_total", icon: Activity,    label: "Consultations totales",  ibg: "bg-blue-50   dark:bg-[#0c1a2e]", icolor: "text-blue-500 dark:text-blue-400" },
  { key: "precision_ia",        icon: Brain,       label: "Précision modèle IA",    ibg: "bg-purple-50 dark:bg-[#1a0f2e]", icolor: "text-purple-500 dark:text-purple-400" },
];

export default function KpiGrid({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {CONFIG.map(({ key, icon: Icon, label, ibg, icolor }) => {
        const { val, trend, urgent } = stats[key];
        return (
          <div key={key} className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-4">
            {urgent && (
              <span className="float-right text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase">
                Urgent
              </span>
            )}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${ibg}`}>
              <Icon size={15} className={icolor} />
            </div>
            <p className={`text-xl font-black tracking-tight ${urgent ? "text-orange-500" : "text-gray-900 dark:text-[#e6edf3]"}`}>
              {val.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-[#8b949e] mt-0.5">{label}</p>
            <div className={`flex items-center gap-1 mt-2 text-[9px] font-bold ${urgent ? "text-orange-500" : "text-green-600 dark:text-[#22c55e]"}`}>
              {urgent ? <AlertTriangle size={9} /> : <TrendingUp size={9} />}
              {trend}
            </div>
          </div>
        );
      })}
    </div>
  );
}