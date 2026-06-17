import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import CardHeader from "./CardHeader";
import { getAuditLogs } from "../api/adminapi";

const DOT = {
  success: "bg-emerald-400",
  warn:    "bg-orange-400",
  error:   "bg-red-400",
  info:    "bg-blue-400",
};

function elapsed(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)   return `Il y a ${m} min`;
  if (m < 1440) return `Il y a ${Math.floor(m / 60)}h`;
  return `Il y a ${Math.floor(m / 1440)}j`;
}

function typeFromStatut(statut) {
  if (statut === "success") return "success";
  if (statut === "warning") return "warn";
  if (statut === "danger")  return "error";
  return "info";
}

export default function DashAudit({ dark }) {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getAuditLogs()
      .then(data => {
        const entries = Array.isArray(data) ? data : (data?.logs ?? []);
        setLogs(
          entries.slice(0, 4).map(l => ({
            id:     l.id,
            action: l.action,
            user:   l.acteur,
            time:   elapsed(l.date),
            type:   typeFromStatut(l.statut),
          }))
        );
      })
      .catch(() => {});
  }, []);

  return (
    <Card dark={dark} className="p-4">
      <CardHeader
        dark={dark}
        title="Journal d'audit"
        sub="Dernières actions"
        action="Voir tout"
        onAction={() => navigate("/administrateur/audit")}
      />
      <div className="flex flex-col gap-1.5">
        {logs.map(l => (
          <div key={l.id} className={`flex items-start gap-2.5 p-2 rounded-xl ${dark ? "bg-[#0d1117]" : "bg-gray-50"}`}>
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
