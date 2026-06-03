import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import CardHeader from "./CardHeader";

const BRAND = "#0f766e";

// ── Base des régions (structure fixe) ────────────────────────────────────────
const BASE_REGIONS = [
  { region: "Littoral",     ville: "Douala"      },
  { region: "Centre",       ville: "Yaoundé"     },
  { region: "Ouest",        ville: "Bafoussam"   },
  { region: "Nord",         ville: "Garoua"      },
  { region: "Est",          ville: "Bertoua"     },
  { region: "Sud",          ville: "Ebolowa"     },
  { region: "Adamaoua",     ville: "Ngaoundéré"  },
  { region: "Extrême-Nord", ville: "Maroua"      },
  { region: "Nord-Ouest",   ville: "Bamenda"     },
  { region: "Sud-Ouest",    ville: "Buea"        },
];

// ── Génère des données mock variées à chaque chargement ──────────────────────
function genMockRegions() {
  // Littoral et Centre ont toujours plus de médecins
  return BASE_REGIONS.map((r, i) => {
    let md;
    if (i === 0) md = Math.round(14 + Math.random() * 8);       // Littoral 14-22
    else if (i === 1) md = Math.round(9 + Math.random() * 6);   // Centre 9-15
    else if (i === 2) md = Math.round(2 + Math.random() * 4);   // Ouest 2-6
    else if (i === 3) md = Math.round(1 + Math.random() * 3);   // Nord 1-4
    else if (i === 4) md = Math.random() > 0.4 ? Math.round(1 + Math.random() * 2) : 0; // Est
    else md = Math.random() > 0.7 ? 1 : 0;                      // Autres — rare

    const cov = md === 0 ? 0 : Math.min(100, Math.round((md / 20) * 100 + Math.random() * 15));
    return { ...r, md, cov };
  });
}

// Endpoint à décommenter quand le backend est prêt :
// GET /api/admin/stats/repartition-geo
// → [{ region, ville, md, cov }]

function covColor(cov) {
  if (cov === 0)   return "#e5e7eb";
  if (cov >= 70)   return BRAND;
  if (cov >= 40)   return "#f59e0b";
  return "#ef4444";
}

export default function DashGeo({ dark }) {
  const navigate = useNavigate();
  const [regions, setRegions] = useState(() => genMockRegions());

  useEffect(() => {
    // ── Décommenter quand le backend est prêt ──
    // fetch("/api/admin/stats/repartition-geo")
    //   .then(r => r.json())
    //   .then(data => setRegions(data))
    //   .catch(() => setRegions(genMockRegions()));

    // Rafraîchit les données mock toutes les 30 secondes pour simuler le temps réel
    const t = setInterval(() => setRegions(genMockRegions()), 30000);
    return () => clearInterval(t);
  }, []);

  const MAX_MD    = Math.max(...regions.map(r => r.md));
  const COUVERTES = regions.filter(r => r.md > 0).length;
  const TOTAL_MD  = regions.reduce((s, r) => s + r.md, 0);

  return (
    <Card dark={dark} className="p-5">
      <CardHeader
        dark={dark}
        title="Répartition géographique"
        sub="10 régions du Cameroun"
        action="Gérer"
        onAction={() => navigate("/administrateur/geo")}
      />

      {/* KPIs rapides */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { l: "Médecins",  v: TOTAL_MD },
          { l: "Couvertes", v: `${COUVERTES}/10` },
          { l: "Non couverts", v: `${10 - COUVERTES}`, red: true },
        ].map(({ l, v, red }) => (
          <div key={l} className={`rounded-xl px-3 py-2 text-center ${dark ? "bg-[#0d1117]" : "bg-gray-50"}`}>
            <p className={`text-[14px] font-black ${red ? "text-red-500" : dark ? "text-white" : "text-gray-900"}`}>{v}</p>
            <p className={`text-[9px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{l}</p>
          </div>
        ))}
      </div>

      {/* Barres par région */}
      <div className="flex flex-col gap-2">
        {regions.map(r => (
          <div key={r.region} className="flex items-center gap-2">
            <span className={`text-[10px] w-24 shrink-0 truncate ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>
              {r.region}
            </span>
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${dark ? "bg-[#21262d]" : "bg-gray-100"}`}>
              <div className="h-full rounded-full transition-all"
                style={{ width: MAX_MD > 0 ? `${Math.round((r.md / MAX_MD) * 100)}%` : "0%", background: covColor(r.cov) }} />
            </div>
            {r.md > 0
              ? <span className={`text-[9px] font-bold w-8 text-right shrink-0 ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>{r.md} md</span>
              : <span className="text-[9px] font-bold w-8 text-right shrink-0 text-red-400">—</span>
            }
          </div>
        ))}
      </div>

      {/* Légende couleurs */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 dark:border-[#21262d] flex-wrap">
        {[
          { color: BRAND,     label: "≥ 70%" },
          { color: "#f59e0b", label: "40–70%" },
          { color: "#ef4444", label: "< 40%" },
          { color: "#e5e7eb", label: "Non couvert" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
            <span className={`text-[9px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Alerte */}
      <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-700/30">
        <svg width="11" height="11" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">
          {10 - COUVERTES} régions non couvertes
        </p>
      </div>
    </Card>
  );
}