import { TrendingUp, AlertTriangle } from "lucide-react";

export default function KpiCard({ icon: Icon, label, val, trend, urgent, ibg, ic, dark }) {
  return (
    <div className={`relative rounded-2xl border p-5 transition-all ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}>
      {urgent && (
        <span className="absolute top-3 right-3 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase">
          Urgent
        </span>
      )}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${ibg}`}>
        <Icon size={18} className={ic} />
      </div>
      <p className={`text-2xl font-black tracking-tight ${urgent ? "text-orange-500" : dark ? "text-white" : "text-gray-900"}`}>{val}</p>
      <p className={`text-[11px] mt-1 mb-2 ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>{label}</p>
      <div className={`flex items-center gap-1 text-[10px] font-bold ${urgent ? "text-orange-500" : "text-teal-600 dark:text-teal-400"}`}>
        {urgent ? <AlertTriangle size={10} /> : <TrendingUp size={10} />} {trend}
      </div>
    </div>
  );
}