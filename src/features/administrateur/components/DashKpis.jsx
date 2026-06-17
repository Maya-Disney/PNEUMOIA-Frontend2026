import { useState, useEffect } from "react";
import { Users, Clock, Activity, Brain } from "lucide-react";
import KpiCard from "./KpiCard";
import { getKpis } from "../api/adminapi";

const KPIS_CONFIG = [
  { icon: Users,    label: "Médecins actifs",        val: "—", trend: "", urgent: false, ibg: "bg-blue-50 dark:bg-blue-900/20",     ic: "text-blue-600"   },
  { icon: Clock,    label: "Inscriptions en attente", val: "—", trend: "", urgent: false, ibg: "bg-orange-50 dark:bg-orange-900/20",  ic: "text-orange-500" },
  { icon: Activity, label: "Consultations totales",   val: "—", trend: "", urgent: false, ibg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600" },
  { icon: Brain,    label: "Précision modèle IA",     val: "—", trend: "", urgent: false, ibg: "bg-purple-50 dark:bg-purple-900/20",   ic: "text-purple-600"  },
];

export default function DashKpis({ dark }) {
  const [kpis, setKpis] = useState(KPIS_CONFIG);

  useEffect(() => {
    getKpis()
      .then(data => {
        setKpis([
          { ...KPIS_CONFIG[0], val: String(data.medecins_actifs     ?? "—") },
          { ...KPIS_CONFIG[1], val: String(data.demandes_en_attente  ?? "—") },
          { ...KPIS_CONFIG[2], val: data.consultations_total != null ? Number(data.consultations_total).toLocaleString("fr-FR") : "—" },
          { ...KPIS_CONFIG[3], val: data.precision_ia != null ? `${data.precision_ia}%` : "—" },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map(kpi => (
        <KpiCard key={kpi.label} dark={dark} {...kpi} />
      ))}
    </div>
  );
}
