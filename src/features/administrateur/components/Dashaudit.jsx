import { useNavigate } from "react-router-dom";
import Card from "./Card";
import CardHeader from "./CardHeader";

const BRAND = "#0f766e";

const LOGS = [
  { id: 1, action: "Inscription validée", user: "Dr. Aminata Sow",   time: "Il y a 2h",  type: "success" },
  { id: 2, action: "Compte suspendu",     user: "Dr. Mbang Denis",   time: "Il y a 5h",  type: "warn"    },
  { id: 3, action: "Inscription refusée", user: "Dr. Tabi Jonas",    time: "Il y a 1j",  type: "error"   },
  { id: 4, action: "Connexion admin",     user: "Super Admin",       time: "Il y a 1j",  type: "info"    },
];

const DOT = {
  success: "bg-emerald-400",
  warn:    "bg-orange-400",
  error:   "bg-red-400",
  info:    "bg-blue-400",
};

export default function DashAudit({ dark }) {
  const navigate = useNavigate();

  return (
    <Card dark={dark} className="p-5">
      <CardHeader
        dark={dark}
        title="Journal d'audit"
        sub="Dernières actions"
        action="Voir tout"
        onAction={() => navigate("/administrateur/audit")}
      />
      <div className="flex flex-col gap-2">
        {LOGS.map(l => (
          <div key={l.id} className={`flex items-start gap-3 p-3 rounded-xl ${dark ? "bg-[#0d1117]" : "bg-gray-50"}`}>
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${DOT[l.type]}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-[11px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{l.action}</p>
              <p className={`text-[10px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{l.user}</p>
            </div>
            <span className={`text-[10px] shrink-0 ${dark ? "text-[#484f58]" : "text-gray-300"}`}>{l.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
