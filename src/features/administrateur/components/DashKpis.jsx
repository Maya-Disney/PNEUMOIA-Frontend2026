import { useState, useEffect } from "react";
import { Users, Clock, Activity, Brain } from "lucide-react";
import KpiCard from "./KPiCard";
import { getKpis } from "../api/adminapi";

const KPIS_CONFIG = [
  {
    icon: Users,    label: "Médecins actifs",        val: "—",
    gradient: "from-[#009e82] to-[#007a64]",
    tintLight: "#e6f7f4", tintDark: "rgba(0,158,130,0.12)",
  },
  {
    icon: Clock,    label: "Inscriptions en attente", val: "—",
    gradient: "from-amber-500 to-amber-600",
    tintLight: "#fffbeb", tintDark: "rgba(180,83,9,0.12)",
  },
  {
    icon: Activity, label: "Consultations totales",   val: "—",
    gradient: "from-emerald-600 to-emerald-700",
    tintLight: "#ecfdf5", tintDark: "rgba(6,95,70,0.12)",
  },
  {
    icon: Brain,    label: "Précision modèle IA",     val: "—",
    gradient: "from-blue-600 to-blue-700",
    tintLight: "#eff6ff", tintDark: "rgba(29,78,216,0.12)",
  },
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
