import { useNavigate } from "react-router-dom";
import Card from "./Card";
import CardHeader from "./CardHeader";

const BRAND       = "#0f766e";
const BRAND_LIGHT = "#f0fdfa";

const DEMANDES = [
  { id: 1, initials: "DK", nom: "Dr. Kamga Denis",  spec: "Pneumologue · Yaoundé",   depuis: "2h", bg: "bg-amber-100 text-amber-700" },
  { id: 2, initials: "AN", nom: "Dr. Abena Nkolo",  spec: "Pneumologue · Douala",    depuis: "5h", bg: "bg-violet-100 text-violet-700" },
  { id: 3, initials: "MB", nom: "Dr. Mbala Berthe", spec: "Pneumologue · Bafoussam", depuis: "1j", bg: "bg-pink-100 text-pink-700" },
];

export default function DashDemandes({ dark }) {
  const navigate = useNavigate();

  return (
    <Card dark={dark} className="p-5">
      <CardHeader
        dark={dark}
        title="Demandes en attente"
        sub="Validation documents"
        action="Tout voir"
        onAction={() => navigate("/administrateur/demandes")}
      />
      <div className="flex flex-col gap-2">
        {DEMANDES.map(d => (
          <div key={d.id} className={`flex items-center gap-3 p-3 rounded-xl ${dark ? "bg-[#0d1117]" : "bg-gray-50"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${d.bg}`}>
              {d.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[11px] font-bold truncate ${dark ? "text-white" : "text-gray-800"}`}>{d.nom}</p>
              <p className={`text-[10px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{d.spec}</p>
              <div className="flex gap-1.5 mt-1.5">
                <button className="text-[9px] font-bold px-2 py-0.5 rounded-lg transition-opacity hover:opacity-75"
                  style={{ background: BRAND_LIGHT, color: BRAND }}>
                  ✓ Valider
                </button>
                <button className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 transition-opacity hover:opacity-75">
                  ✗ Refuser
                </button>
              </div>
            </div>
            <span className={`text-[10px] shrink-0 ${dark ? "text-[#484f58]" : "text-gray-300"}`}>{d.depuis}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/administrateur/demandes")}
        className="mt-3 w-full py-2 rounded-xl text-[11px] font-bold border transition-colors"
        style={{ borderColor: BRAND, color: BRAND }}
        onMouseEnter={e => { e.currentTarget.style.background = BRAND; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = BRAND; }}>
        Gérer les demandes →
      </button>
    </Card>
  );
}