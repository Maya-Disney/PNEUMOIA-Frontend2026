import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, BarElement, LineElement, PointElement,
  LinearScale, CategoryScale, Tooltip, Filler,
} from "chart.js";
import { Users, Activity, Brain, TrendingUp } from "lucide-react";
import { brand, getSurface, getText } from "../theme";

ChartJS.register(BarElement, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

const MOIS_FR    = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MOIS_COURT = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];

const VILLES = [
  {v:"Douala",c:2240,md:18},{v:"Yaoundé",c:1540,md:12},
  {v:"Bafoussam",c:580,md:4},{v:"Garoua",c:320,md:3},{v:"Bertoua",c:141,md:1},
];
const TOP = [
  {ini:"DK", nom:"Dr. Kamto Diane", c:3201, ia:92, bg:"bg-blue-100 text-blue-700"},
  {ini:"JD", nom:"Dr. Jean Dupont", c:4821, ia:88, bg:"bg-teal-100 text-teal-700"},
  {ini:"AS", nom:"Dr. Aminata Sow", c:1243, ia:82, bg:"bg-purple-100 text-purple-700"},
  {ini:"DM", nom:"Dr. Mbang",       c:987,  ia:74, bg:"bg-amber-100 text-amber-700"},
];
const maxV = Math.max(...VILLES.map(v => v.c));

function genDayData(year, month) {
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => ({
    label: String(i + 1),
    v: Math.round(300 + Math.random() * 500),
  }));
}

function genMonthData(year) {
  const now = new Date();
  const max = now.getFullYear() === year ? now.getMonth() : 11;
  return Array.from({ length: max + 1 }, (_, i) => ({
    label: MOIS_COURT[i],
    v: Math.round(5000 + Math.random() * 5000),
  }));
}

function genYearData() {
  const cur   = Math.max(new Date().getFullYear(), 2026);
  const count = cur - 2025;
  return Array.from({ length: count }, (_, i) => ({
    label: String(2026 + i),
    v: Math.round(40000 + Math.random() * 30000),
  }));
}

const VUES = [
  { k: "jours",  l: "Jours"  },
  { k: "mois",   l: "Mois"   },
  { k: "annees", l: "Années" },
];

export default function Statistiques() {
  const { dark } = useOutletContext() || {};
  const surface  = getSurface(dark);
  const txt      = getText(dark);

  const now      = new Date();
  const curYear  = Math.max(now.getFullYear(), 2026);
  const yearList = Array.from({ length: curYear - 2025 }, (_, i) => 2026 + i);

  const [vue,   setVue]   = useState("mois");
  const [annee, setAnnee] = useState(curYear);
  const [mois,  setMois]  = useState(now.getMonth());

  const axisColor = dark ? "#484f58" : "#9ca3af";
  const gridColor = dark ? "#21262d" : "#f3f4f6";

  const tooltipBase = useMemo(() => ({
    backgroundColor: dark ? "#161b22" : "#ffffff",
    borderColor:     dark ? "#21262d" : "#e5e7eb",
    borderWidth: 1,
    titleColor:  dark ? "#e6edf3" : "#111827",
    bodyColor:   dark ? "#8b949e" : "#6b7280",
    padding: 12, cornerRadius: 12,
    titleFont: { size: 13, weight: "bold" },
    bodyFont:  { size: 13 },
  }), [dark]);

  const rawData = useMemo(() => {
    if (vue === "jours")  return genDayData(annee, mois);
    if (vue === "mois")   return genMonthData(annee);
    return genYearData();
  }, [vue, annee, mois]);

  const chartLabels = rawData.map(d => d.label);
  const chartValues = rawData.map(d => d.v);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: tooltipBase },
    scales: {
      x: { grid: { display: false }, ticks: { color: axisColor, font: { size: 11 } }, border: { display: false } },
      y: { grid: { color: gridColor }, ticks: { color: axisColor, font: { size: 11 } }, border: { display: false } },
    },
  }), [tooltipBase, axisColor, gridColor]);

  const cardStyle = { background: surface.card, borderColor: surface.border };

  const chartTitle =
    vue === "jours"  ? `Consultations — ${MOIS_FR[mois]} ${annee}` :
    vue === "mois"   ? `Consultations par mois — ${annee}` :
                       "Consultations par année";

  const chartSub =
    vue === "jours"  ? `Jours 1 – ${rawData.length}` :
    vue === "mois"   ? `Janvier → ${rawData[rawData.length - 1]?.label ?? "—"}` :
                       "Depuis 2026";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: txt.primary }}>
          Statistiques
        </h1>
        <p className="text-[15px] mt-1" style={{ color: txt.muted }}>
          Vue globale de l'activité PneumoIA CEMAC
        </p>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon:Users,      l:"Médecins actifs",  v:"38",    s:"+3 ce mois",     ibg:"bg-teal-50 dark:bg-teal-900/20",    ic:"text-teal-600"   },
          { icon:Activity,   l:"Consultations",    v:"4 821", s:"+247 ce mois",   ibg:"bg-blue-50 dark:bg-blue-900/20",     ic:"text-blue-500"   },
          { icon:Brain,      l:"Précision IA",     v:"94%",   s:"+1.2% ce mois",  ibg:"bg-purple-50 dark:bg-purple-900/20", ic:"text-purple-500" },
          { icon:TrendingUp, l:"Concordance moy.", v:"84%",   s:"Médecins actifs", ibg:"bg-amber-50 dark:bg-amber-900/20",  ic:"text-amber-500"  },
        ].map(({ icon: Icon, l, v, s, ibg, ic }) => (
          <div key={l} className="rounded-2xl border px-5 py-4" style={cardStyle}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${ibg}`}>
              <Icon size={20} className={ic} />
            </div>
            <p className="text-3xl font-black" style={{ color: txt.primary }}>{v}</p>
            <p className="text-[13px] mt-1" style={{ color: txt.subtle }}>{l}</p>
            <p className="text-[13px] mt-1.5 font-semibold" style={{ color: brand.DEFAULT }}>{s}</p>
          </div>
        ))}
      </div>

      {/* ── Graphique consultations ── */}
      <div className="rounded-2xl border p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <p className="text-[15px] font-bold" style={{ color: txt.primary }}>{chartTitle}</p>
            <p className="text-[13px] mt-0.5" style={{ color: txt.subtle }}>{chartSub}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Jours / Mois / Années */}
            <div className="flex gap-0.5 p-0.5 rounded-lg border"
              style={{ background: surface.bg, borderColor: surface.border }}>
              {VUES.map(({ k, l }) => (
                <button key={k} onClick={() => setVue(k)}
                  className="px-3 py-1.5 rounded-md text-[12px] font-bold transition-colors"
                  style={vue === k
                    ? { background: brand.DEFAULT, color: "#fff" }
                    : { color: txt.subtle }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Sélecteur mois (vue Jours uniquement) */}
            {vue === "jours" && (
              <select value={mois} onChange={e => setMois(Number(e.target.value))}
                className="text-[13px] px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer"
                style={{ background: surface.card, borderColor: surface.border, color: txt.subtle }}>
                {MOIS_FR.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            )}

            {/* Sélecteur année (vues Jours et Mois) */}
            {vue !== "annees" && (
              <select value={annee} onChange={e => setAnnee(Number(e.target.value))}
                className="text-[13px] px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer"
                style={{ background: surface.card, borderColor: surface.border, color: txt.subtle }}>
                {yearList.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
          </div>
        </div>

        <div style={{ height: 240 }}>
          {vue === "mois" ? (
            <Line
              data={{
                labels: chartLabels,
                datasets: [{
                  label: "Consultations",
                  data: chartValues,
                  borderColor: brand.DEFAULT,
                  borderWidth: 2.5,
                  backgroundColor: (ctx) => {
                    const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
                    g.addColorStop(0, `${brand.DEFAULT}33`);
                    g.addColorStop(1, `${brand.DEFAULT}00`);
                    return g;
                  },
                  fill: true,
                  tension: 0.4,
                  pointRadius: 4,
                  pointBackgroundColor: brand.DEFAULT,
                  pointHoverRadius: 6,
                  pointHoverBorderColor: "#fff",
                  pointHoverBorderWidth: 2,
                }],
              }}
              options={chartOptions}
            />
          ) : (
            <Bar
              data={{
                labels: chartLabels,
                datasets: [{
                  label: "Consultations",
                  data: chartValues,
                  backgroundColor: brand.DEFAULT,
                  borderRadius: 6,
                  maxBarThickness: vue === "annees" ? 60 : 28,
                }],
              }}
              options={chartOptions}
            />
          )}
        </div>
      </div>

      {/* ── Répartition géo + Top médecins ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Répartition géographique */}
        <div className="rounded-2xl border p-6" style={cardStyle}>
          <p className="text-[15px] font-bold mb-5" style={{ color: txt.primary }}>Répartition géographique</p>
          <div className="flex flex-col gap-4">
            {VILLES.map(v => (
              <div key={v.v}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[14px] font-semibold" style={{ color: txt.muted }}>{v.v}</span>
                  <div className="flex items-center gap-3 text-[13px]">
                    <span style={{ color: txt.subtle }}>{v.md} md</span>
                    <span className="font-bold" style={{ color: txt.primary }}>{v.c.toLocaleString("fr-FR")}</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: surface.borderSoft }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.round((v.c / maxV) * 100)}%`, background: brand.DEFAULT }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top médecins */}
        <div className="rounded-2xl border p-6" style={cardStyle}>
          <p className="text-[15px] font-bold mb-5" style={{ color: txt.primary }}>Top médecins — Concordance IA</p>
          <div className="flex flex-col gap-3">
            {[...TOP].sort((a, b) => b.ia - a.ia).map((m, i) => (
              <div key={m.nom} className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: surface.bg }}>
                <span className="text-[13px] font-black w-5" style={{ color: txt.subtle }}>#{i + 1}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 ${m.bg}`}>{m.ini}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold truncate" style={{ color: txt.primary }}>{m.nom}</p>
                  <div className="mt-1.5 h-2 rounded-full overflow-hidden" style={{ background: surface.borderSoft }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${m.ia}%`, background: m.ia >= 85 ? brand.DEFAULT : m.ia >= 75 ? "#f59e0b" : "#ef4444" }} />
                  </div>
                </div>
                <span className="text-[15px] font-black shrink-0"
                  style={{ color: m.ia >= 85 ? brand.DEFAULT : m.ia >= 75 ? "#f59e0b" : "#ef4444" }}>
                  {m.ia}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
