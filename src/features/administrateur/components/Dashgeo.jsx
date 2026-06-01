import { useNavigate } from "react-router-dom";
import Card from "./Card";
import CardHeader from "./CardHeader";

const BRAND = "#0f766e";

const VILLES = [
  { ville: "Douala",     nb: 14, pct: 37 },
  { ville: "Yaoundé",   nb: 11, pct: 29 },
  { ville: "Bafoussam", nb:  6, pct: 16 },
  { ville: "Garoua",    nb:  4, pct: 11 },
  { ville: "Autres",    nb:  3, pct:  7 },
];

export default function DashGeo({ dark }) {
  const navigate = useNavigate();

  return (
    <Card dark={dark} className="p-5">
      <CardHeader
        dark={dark}
        title="Répartition géographique"
        sub="Médecins par ville"
        action="Détails"
        onAction={() => navigate("/administrateur/geo")}
      />
      <div className="flex flex-col gap-2.5">
        {VILLES.map(v => (
          <div key={v.ville} className="flex items-center gap-3">
            <span className={`text-[11px] w-20 shrink-0 ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>{v.ville}</span>
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${dark ? "bg-[#21262d]" : "bg-gray-100"}`}>
              <div className="h-full rounded-full" style={{ width: `${v.pct}%`, background: BRAND }} />
            </div>
            <span className={`text-[10px] font-bold w-6 text-right ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{v.nb}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
