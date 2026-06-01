import { Users, Clock, Activity, Brain } from "lucide-react";
import KpiCard from "./KpiCard";

const KPIS = [
  { icon: Users,    label: "Médecins actifs",         val: "38",    trend: "+3 ce mois",    urgent: false, ibg: "bg-teal-50 dark:bg-teal-900/20",    ic: "text-teal-600" },
  { icon: Clock,    label: "Inscriptions en attente", val: "4",     trend: "Action requise", urgent: true,  ibg: "bg-orange-50 dark:bg-orange-900/20", ic: "text-orange-500" },
  { icon: Activity, label: "Consultations totales",   val: "4 821", trend: "+247 ce mois",  urgent: false, ibg: "bg-blue-50 dark:bg-blue-900/20",     ic: "text-blue-500" },
  { icon: Brain,    label: "Précision modèle IA",     val: "94%",   trend: "+1.2% ce mois", urgent: false, ibg: "bg-purple-50 dark:bg-purple-900/20", ic: "text-purple-500" },
];

export default function DashKpis({ dark }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {KPIS.map(kpi => (
        <KpiCard key={kpi.label} dark={dark} {...kpi} />
      ))}
    </div>
  );
}