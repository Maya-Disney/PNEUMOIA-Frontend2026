import { useMemo, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, BarElement, LinearScale, CategoryScale, Tooltip,
} from "chart.js";
import { brand, getSurface, getText } from "../theme";
import { getRepartitionGeo } from "../api/adminapi";

ChartJS.register(BarElement, LinearScale, CategoryScale, Tooltip);

const MOIS_LABELS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

const ANNEES = [2024, 2025, 2026];

const REGIONS_BASE = [
  { r: "Littoral",     cov: 94 },
  { r: "Centre",       cov: 88 },
  { r: "Ouest",        cov: 52 },
  { r: "Nord",         cov: 31 },
  { r: "Est",          cov: 18 },
  { r: "Sud",          cov: 0  },
  { r: "Adamaoua",     cov: 0  },
  { r: "Extrême-Nord", cov: 0  },
  { r: "Nord-Ouest",   cov: 0  },
  { r: "Sud-Ouest",    cov: 0  },
];

function getVillesMock(annee, mois) {
  const base = [
    { v:"Douala",    r:"Littoral", mdBase:15, cBase:180, pBase:42  },
    { v:"Yaoundé",   r:"Centre",   mdBase:10, cBase:125, pBase:30  },
    { v:"Bafoussam", r:"Ouest",    mdBase:3,  cBase:47,  pBase:11  },
    { v:"Garoua",    r:"Nord",     mdBase:2,  cBase:26,  pBase:7   },
    { v:"Bertoua",   r:"Est",      mdBase:1,  cBase:11,  pBase:3   },
  ];
  const yearBoost    = (annee - 2024) * 0.08;
  const seasonFactor = [0.85,0.90,0.95,1.05,1.10,1.00,0.92,0.88,0.98,1.08,1.12,1.15][mois - 1];
  const factor = (1 + yearBoost) * seasonFactor;
  return base.map(({ v, r, mdBase, cBase, pBase }) => ({
    v, r,
    md: mdBase + (annee - 2024),
    c:  Math.round(cBase * factor),
    p:  Math.round(pBase * factor),
  }));
}

export default function RepartitionGeo() {
  const { dark } = useOutletContext() || {};
  const surface  = getSurface(dark);
  const txt      = getText(dark);

  const now = new Date();
  const [mois,  setMois]  = useState(now.getMonth() + 1);
  const [annee, setAnnee] = useState(now.getFullYear() <= 2026 ? now.getFullYear() : 2026);
  const [loading, setLoading] = useState(false);

  const [VILLES,  setVilles]  = useState(() => getVillesMock(now.getFullYear() <= 2026 ? now.getFullYear() : 2026, now.getMonth() + 1));
  const [REGIONS, setRegions] = useState(() =>
    REGIONS_BASE.map(reg => {
      const mock = getVillesMock(now.getFullYear() <= 2026 ? now.getFullYear() : 2026, now.getMonth() + 1);
      const match = mock.find(v => v.r === reg.r);
      return { ...reg, md: match ? match.md : 0 };
    })
  );

  useEffect(() => {
    setLoading(true);
    getRepartitionGeo(mois, annee)
      .then(data => {
        if (data?.villes?.length) {
          const apiVilles = data.villes.map(v => ({
            v: v.ville,
            r: v.region || "",
            md: v.medecins  ?? 0,
            c:  v.consultations ?? 0,
            p:  v.patients  ?? 0,
          }));
          setVilles(apiVilles);

          if (data?.regions?.length) {
            setRegions(data.regions.map(r => ({
              r:   r.region,
              cov: r.couverture ?? 0,
              md:  r.medecins   ?? 0,
            })));
          } else {
            setRegions(REGIONS_BASE.map(reg => {
              const match = apiVilles.find(v => v.r === reg.r);
              return { ...reg, md: match ? match.md : 0 };
            }));
          }
        } else {
          const mock = getVillesMock(annee, mois);
          setVilles(mock);
          setRegions(REGIONS_BASE.map(reg => {
            const match = mock.find(v => v.r === reg.r);
            return { ...reg, md: match ? match.md : 0 };
          }));
        }
      })
      .catch(() => {
        const mock = getVillesMock(annee, mois);
        setVilles(mock);
        setRegions(REGIONS_BASE.map(reg => {
          const match = mock.find(v => v.r === reg.r);
          return { ...reg, md: match ? match.md : 0 };
        }));
      })
      .finally(() => setLoading(false));
  }, [mois, annee]);

  const TOTAL_MD  = VILLES.reduce((s, v) => s + v.md, 0);
  const TOTAL_C   = VILLES.reduce((s, v) => s + v.c, 0);
  const TOTAL_P   = VILLES.reduce((s, v) => s + v.p, 0);
  const COUVERTES = REGIONS.filter(r => r.md > 0).length;

  const axisColor = dark ? "#484f58" : "#9ca3af";
  const gridColor = dark ? "#21262d" : "#f3f4f6";

  function covColor(cov) {
    if (cov === 0)   return dark ? "#30363d" : "#e5e7eb";
    if (cov >= 70)   return brand.DEFAULT;
    if (cov >= 40)   return "#f59e0b";
    return "#ef4444";
  }

  const chartData = useMemo(() => ({
    labels: VILLES.map(v => v.v),
    datasets: [{
      label: "Consultations",
      data: VILLES.map(v => v.c),
      backgroundColor: brand.DEFAULT,
      borderRadius: 8,
      maxBarThickness: 48,
    }],
  }), [VILLES]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: dark ? "#161b22" : "#ffffff",
        borderColor:     dark ? "#21262d" : "#e5e7eb",
        borderWidth: 1,
        titleColor: dark ? "#e6edf3" : "#111827",
        bodyColor:  dark ? "#8b949e" : "#6b7280",
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 13, weight: "bold" },
        bodyFont:  { size: 13 },
        callbacks: {
          label: (item) => ` ${item.parsed.y.toLocaleString("fr-FR")} consultations`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: axisColor, font: { size: 12 } }, border: { display: false } },
      y: { grid: { color: gridColor }, ticks: { color: axisColor, font: { size: 12 } }, border: { display: false } },
    },
  }), [dark, axisColor, gridColor]);

  const cardStyle   = { background: surface.card, borderColor: surface.border };
  const selectStyle = {
    background: surface.card,
    color: txt.primary,
    border: `1px solid ${surface.border}`,
    borderRadius: 10,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 600,
    outline: "none",
    cursor: "pointer",
    appearance: "auto",
  };

  const periodLabel = `${MOIS_LABELS[mois - 1]} ${annee}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* Header + filtres */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: txt.primary }}>
            Répartition géographique
          </h1>
          <p className="text-[15px] mt-1" style={{ color: txt.muted }}>
            Distribution des médecins au Cameroun — 10 régions
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold" style={{ color: txt.muted }}>Mois</span>
            <select value={mois} onChange={e => setMois(Number(e.target.value))} style={selectStyle}>
              {MOIS_LABELS.map((label, i) => (
                <option key={i + 1} value={i + 1}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold" style={{ color: txt.muted }}>Année</span>
            <select value={annee} onChange={e => setAnnee(Number(e.target.value))} style={selectStyle}>
              {ANNEES.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerte régions non couvertes */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
        style={{ background: dark ? "rgba(234,88,12,0.08)" : "#fff7ed", borderColor: dark ? "rgba(234,88,12,0.25)" : "#fed7aa" }}
      >
        <svg width="16" height="16" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p className="text-[14px] font-semibold" style={{ color: "#f97316" }}>
          {10 - COUVERTES} régions non couvertes — aucun médecin enregistré dans ces zones
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Médecins actifs",   v: TOTAL_MD },
          { l: "Consultations",     v: TOTAL_C.toLocaleString("fr-FR") },
          { l: "Patients",          v: TOTAL_P.toLocaleString("fr-FR") },
          { l: "Régions couvertes", v: `${COUVERTES}/10`, red: true },
        ].map(({ l, v, red }) => (
          <div key={l} className="rounded-2xl border px-5 py-4" style={cardStyle}>
            <p className="text-3xl font-black" style={{ color: red ? "#ea580c" : txt.primary }}>{v}</p>
            <p className="text-[13px] mt-1" style={{ color: txt.subtle }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Graphique + couverture */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">

        {/* Consultations par ville */}
        <div className="rounded-2xl border p-6" style={cardStyle}>
          <p className="text-[15px] font-bold mb-1" style={{ color: txt.primary }}>Consultations par ville</p>
          <p className="text-[13px] mb-5" style={{ color: txt.subtle }}>
            {periodLabel} — {VILLES.length} villes actives
          </p>
          {loading ? (
            <div className="h-[220px] rounded-xl animate-pulse" style={{ background: surface.bg }} />
          ) : (
            <div style={{ height: 220 }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Couverture par région */}
        <div className="rounded-2xl border p-6" style={cardStyle}>
          <p className="text-[15px] font-bold mb-1" style={{ color: txt.primary }}>Couverture par région</p>
          <p className="text-[13px] mb-4" style={{ color: txt.subtle }}>10 régions du Cameroun — {periodLabel}</p>
          <div className="flex flex-col gap-3">
            {REGIONS.map(r => (
              <div key={r.r} className="flex items-center gap-3">
                <span className="text-[13px] font-semibold w-28 shrink-0" style={{ color: txt.muted }}>{r.r}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: surface.borderSoft }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${r.cov}%`, background: r.cov === 0 ? "transparent" : covColor(r.cov) }}
                  />
                </div>
                {r.md > 0
                  ? <span className="text-[12px] w-16 text-right shrink-0 font-semibold" style={{ color: txt.subtle }}>{r.md} md</span>
                  : <span className="text-[12px] w-16 text-right shrink-0 text-red-400 font-semibold">Non couvert</span>
                }
              </div>
            ))}
          </div>

          {/* Légende */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t flex-wrap" style={{ borderColor: surface.borderSoft }}>
            {[
              { color: brand.DEFAULT,                label: "≥ 70%" },
              { color: "#f59e0b",                    label: "40–70%" },
              { color: "#ef4444",                    label: "< 40%" },
              { color: dark ? "#30363d" : "#e5e7eb", label: "Non couvert" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[12px]" style={{ color: txt.subtle }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="rounded-2xl border overflow-hidden" style={cardStyle}>
        <div className="px-6 py-4 border-b" style={{ borderColor: surface.border }}>
          <p className="text-[15px] font-bold" style={{ color: txt.primary }}>Détail par ville</p>
          <p className="text-[13px] mt-0.5" style={{ color: txt.subtle }}>
            Médecins, consultations et patients — {periodLabel}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: surface.bg }}>
                {["Ville","Région","Médecins","Consultations","Patients"].map(h => (
                  <th key={h} className="text-left px-6 py-3 font-semibold" style={{ color: txt.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VILLES.map((v, i) => (
                <tr
                  key={v.v}
                  className="border-t"
                  style={{
                    borderColor: surface.borderSoft,
                    background: i % 2 === 0 ? "transparent" : (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"),
                  }}
                >
                  <td className="px-6 py-3 font-bold"      style={{ color: txt.primary }}>{v.v}</td>
                  <td className="px-6 py-3"                style={{ color: txt.muted }}>{v.r}</td>
                  <td className="px-6 py-3 font-semibold"  style={{ color: brand.DEFAULT }}>{v.md}</td>
                  <td className="px-6 py-3"                style={{ color: txt.muted }}>{v.c.toLocaleString("fr-FR")}</td>
                  <td className="px-6 py-3"                style={{ color: txt.muted }}>{v.p.toLocaleString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
