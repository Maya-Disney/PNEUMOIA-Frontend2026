import { useNavigate } from "react-router-dom";
import Card from "./Card";
import CardHeader from "./CardHeader";
import { brand, getSurface, getText } from "../theme";

const VILLES = [
  { v: "Douala",    c: 2240 },
  { v: "Yaoundé",  c: 1540 },
  { v: "Bafoussam",c: 580  },
  { v: "Garoua",   c: 320  },
  { v: "Bertoua",  c: 141  },
];

const REGIONS = [
  { r: "Littoral",   md: 18, cov: 94 },
  { r: "Centre",     md: 12, cov: 88 },
  { r: "Ouest",      md: 4,  cov: 52 },
  { r: "Nord",       md: 3,  cov: 31 },
  { r: "Est",        md: 1,  cov: 18 },
  { r: "Sud",        md: 0,  cov: 0  },
  { r: "Adamaoua",   md: 0,  cov: 0  },
  { r: "Extrême-N",  md: 0,  cov: 0  },
  { r: "N-Ouest",    md: 0,  cov: 0  },
  { r: "S-Ouest",    md: 0,  cov: 0  },
];

const TOTAL_MD  = REGIONS.reduce((s, r) => s + r.md, 0);
const TOTAL_C   = VILLES.reduce((s, v) => s + v.c, 0);
const TOTAL_P   = 1163;
const COUVERTES = REGIONS.filter(r => r.md > 0).length;
const MAX_C     = Math.max(...VILLES.map(v => v.c));

export default function DashGeo({ dark }) {
  const navigate = useNavigate();
  const surface  = getSurface(dark);
  const txt      = getText(dark);

  function covColor(cov) {
    if (cov === 0) return dark ? "#30363d" : "#e5e7eb";
    if (cov >= 70) return brand.DEFAULT;
    if (cov >= 40) return "#f59e0b";
    return "#ef4444";
  }

  return (
    <Card dark={dark} className="p-5">
      <CardHeader
        dark={dark}
        title="Répartition géographique"
        sub="Distribution des médecins au Cameroun"
        action="Gérer"
        onAction={() => navigate("/administrateur/geo")}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { l: "Médecins",          v: TOTAL_MD },
          { l: "Consultations",     v: TOTAL_C.toLocaleString("fr-FR") },
          { l: "Patients",          v: TOTAL_P.toLocaleString("fr-FR") },
          { l: "Régions couvertes", v: `${COUVERTES}/10`, red: true },
        ].map(({ l, v, red }) => (
          <div key={l} className="rounded-xl px-3 py-2.5 text-center" style={{ background: surface.bg }}>
            <p className="text-[15px] font-black" style={{ color: red ? "#ea580c" : txt.primary }}>{v}</p>
            <p className="text-[11px] mt-0.5" style={{ color: txt.subtle }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Mini bar chart — consultations par ville */}
      <p className="text-[12px] font-bold mb-2" style={{ color: txt.muted }}>Consultations par ville</p>
      <div className="flex flex-col gap-1.5 mb-4">
        {VILLES.map(v => (
          <div key={v.v} className="flex items-center gap-2">
            <span className="text-[11px] w-20 shrink-0 truncate" style={{ color: txt.muted }}>{v.v}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: surface.borderSoft }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.round((v.c / MAX_C) * 100)}%`, background: brand.DEFAULT }}
              />
            </div>
            <span className="text-[11px] w-12 text-right shrink-0" style={{ color: txt.muted }}>
              {v.c.toLocaleString("fr-FR")}
            </span>
          </div>
        ))}
      </div>

      {/* Couverture par région */}
      <p className="text-[12px] font-bold mb-2" style={{ color: txt.muted }}>Couverture par région</p>
      <div className="flex flex-col gap-1.5">
        {REGIONS.map(r => (
          <div key={r.r} className="flex items-center gap-2">
            <span className="text-[11px] w-20 shrink-0 truncate" style={{ color: txt.muted }}>{r.r}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: surface.borderSoft }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${r.cov}%`, background: r.cov === 0 ? "transparent" : covColor(r.cov) }}
              />
            </div>
            {r.md > 0
              ? <span className="text-[11px] w-10 text-right shrink-0 font-semibold" style={{ color: txt.subtle }}>{r.md} md</span>
              : <span className="text-[11px] w-10 text-right shrink-0 text-red-400 font-semibold">—</span>
            }
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t flex-wrap" style={{ borderColor: surface.borderSoft }}>
        {[
          { color: brand.DEFAULT,                            label: "≥ 70%" },
          { color: "#f59e0b",                                label: "40–70%" },
          { color: "#ef4444",                                label: "< 40%" },
          { color: dark ? "#30363d" : "#e5e7eb",            label: "Non couvert" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-[11px]" style={{ color: txt.subtle }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Alerte */}
      <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl border"
        style={{ background: dark ? "rgba(234,88,12,0.08)" : "#fff7ed", borderColor: dark ? "rgba(234,88,12,0.25)" : "#fed7aa" }}>
        <svg width="12" height="12" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p className="text-[12px] font-semibold" style={{ color: "#f97316" }}>
          {10 - COUVERTES} régions non couvertes
        </p>
      </div>
    </Card>
  );
}
