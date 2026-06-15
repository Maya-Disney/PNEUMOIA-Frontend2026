import { useState, useEffect } from "react";
import { Users, Clock, Activity, Brain } from "lucide-react";
import KpiCard from "./KpiCard";
import { getKpis } from "../api/adminapi";

const MOCK = [
  { icon: Users,    label: "Médecins actifs",        val: "38",    trend: "+3 ce mois",   urgent: false, ibg: "bg-blue-50 dark:bg-blue-900/20",    ic: "text-blue-600"   },
  { icon: Clock,    label: "Inscriptions en attente", val: "4",     trend: "Action requise", urgent: true, ibg: "bg-orange-50 dark:bg-orange-900/20", ic: "text-orange-500" },
  { icon: Activity, label: "Consultations totales",   val: "4 821", trend: "+247 ce mois", urgent: false, ibg: "bg-emerald-50 dark:bg-emerald-900/20", ic: "text-emerald-600" },
  { icon: Brain,    label: "Précision modèle IA",     val: "94%",   trend: "+1.2% ce mois", urgent: false, ibg: "bg-purple-50 dark:bg-purple-900/20",  ic: "text-purple-600"  },
];

export default function DashKpis({ dark }) {
  const [kpis, setKpis] = useState(MOCK);

  useEffect(() => {
    getKpis()
      .then(data => {
        setKpis([
          { ...MOCK[0], val: String(data.medecins_actifs    ?? MOCK[0].val) },
          { ...MOCK[1], val: String(data.demandes_en_attente ?? MOCK[1].val) },
          { ...MOCK[2], val: (data.consultations_total ?? 4821).toLocaleString("fr-FR") },
          { ...MOCK[3], val: `${data.precision_ia ?? 94}%` },
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
