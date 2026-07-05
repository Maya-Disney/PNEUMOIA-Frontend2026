import { useState, useEffect, useMemo } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, LineElement, BarElement, PointElement,
  LinearScale, CategoryScale, Tooltip, Filler,
} from "chart.js";
import Card from "./Card";
import { brand, getSurface, getText } from "../theme";
import {
  getConsultationsSemaine,
  getConsultationsAnnee,
  getConsultationsTotal,
} from "../api/adminApi";

ChartJS.register(LineElement, BarElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

const MOIS_FR    = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MOIS_COURT = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];

function genMockWeek() {
  return ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(j => ({
    j, c: Math.round(400 + Math.random() * 350)
  }));
}

function genMockMonths(year) {
  const now = new Date();
  const currentMonth = now.getFullYear() === year ? now.getMonth() : 11;
  return Array.from({ length: currentMonth + 1 }, (_, i) => ({
    m: MOIS_COURT[i],
    v: Math.round(2 + Math.random() * 8),
  }));
}

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function endOfToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashActivite({ dark }) {
  const now      = new Date();
  const yearList = Array.from(
    { length: Math.max(1, now.getFullYear() - 2025) },
    (_, i) => now.getFullYear() - i
  );
  const surface  = getSurface(dark);
  const txt      = getText(dark);

  const [periode,   setPeriode]   = useState("semaine");
  const [annee,     setAnnee]     = useState(now.getFullYear());
  const [loading,   setLoading]   = useState(false);

  const [weekData,  setWeekData]  = useState(genMockWeek());
  const [monthData, setMonthData] = useState(genMockMonths(now.getFullYear()));

  const [totalMois, setTotalMois] = useState(null);
  const [moyMois,   setMoyMois]   = useState(null);
  const [picMois,   setPicMois]   = useState(null);
  const [varMois,   setVarMois]   = useState(null);

  // ── Données semaine ──────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    getConsultationsSemaine()
      .then(data => {
        if (Array.isArray(data?.jours) && data.jours.length) {
          setWeekData(data.jours);
        } else {
          setWeekData(genMockWeek());
        }
      })
      .catch(() => setWeekData(genMockWeek()))
      .finally(() => setLoading(false));
  }, []);

  // ── Données mois par année ───────────────────────────────────────────────
  useEffect(() => {
    getConsultationsAnnee(annee)
      .then(data => {
        if (Array.isArray(data?.mois) && data.mois.length) {
          setMonthData(data.mois);
        } else if (Array.isArray(data) && data.length) {
          setMonthData(data.map((v, i) => ({ m: MOIS_COURT[i], v })));
        } else {
          setMonthData(genMockMonths(annee));
        }
      })
      .catch(() => setMonthData(genMockMonths(annee)));
  }, [annee]);

  // ── Totaux mois courant ──────────────────────────────────────────────────
  useEffect(() => {
    const debut = startOfMonth();
    const fin   = endOfToday();
    getConsultationsTotal(debut, fin)
      .then(data => {
        setTotalMois(data.total            ?? null);
        setMoyMois(data.moyenne_par_jour   ?? null);
        setPicMois(data.pic                ?? null);
        setVarMois(data.variation_vs_mois_precedent ?? null);
      })
      .catch(() => {
        const mockTotal = Math.round(3800 + Math.random() * 1200);
        const jours     = now.getDate();
        setTotalMois(mockTotal);
        setMoyMois(Math.round(mockTotal / jours));
        setPicMois(Math.round(mockTotal / jours * 1.4));
        setVarMois(Math.round((Math.random() * 20) - 5));
      });
  }, []);

  const axisColor = dark ? "#484f58" : "#9ca3af";
  const gridColor = dark ? "#21262d" : "#f3f4f6";
  const nomMois   = MOIS_FR[now.getMonth()];

  const tooltipBase = useMemo(() => ({
    backgroundColor: dark ? "#161b22" : "#ffffff",
    borderColor: dark ? "#21262d" : "#e5e7eb",
    borderWidth: 1,
    titleColor: dark ? "#e6edf3" : "#111827",
    bodyColor: dark ? "#8b949e" : "#6b7280",
    padding: 10,
    cornerRadius: 10,
    titleFont: { size: 12, weight: "bold" },
    bodyFont: { size: 12 },
  }), [dark]);

  const weekChartData = useMemo(() => ({
    labels: weekData.map(d => d.j),
    datasets: [{
      label: "Consultations",
      data: weekData.map(d => d.c),
      borderColor: brand.DEFAULT,
      borderWidth: 2.5,
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 180);
        g.addColorStop(0, `${brand.DEFAULT}33`);
        g.addColorStop(1, `${brand.DEFAULT}00`);
        return g;
      },
      fill: true,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: brand.DEFAULT,
      pointHoverBorderColor: "#fff",
      pointHoverBorderWidth: 2,
    }],
  }), [weekData]);

  const weekChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: tooltipBase,
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: axisColor, font: { size: 11 } }, border: { display: false } },
      y: { grid: { color: gridColor }, ticks: { color: axisColor, font: { size: 11 } }, border: { display: false } },
    },
  }), [tooltipBase, axisColor, gridColor]);

  const monthChartData = useMemo(() => ({
    labels: monthData.map(d => d.m),
    datasets: [{
      label: "Validations",
      data: monthData.map(d => d.v),
      backgroundColor: brand.DEFAULT,
      borderRadius: 6,
      maxBarThickness: 28,
    }],
  }), [monthData]);

  const monthChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: tooltipBase,
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: axisColor, font: { size: 11 } }, border: { display: false } },
      y: { grid: { color: gridColor }, ticks: { color: axisColor, font: { size: 11 } }, border: { display: false } },
    },
  }), [tooltipBase, axisColor, gridColor]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">

      {/* ── Graphique principal ── */}
      <Card dark={dark} className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <p className="text-[15px] font-bold" style={{ color: txt.primary }}>
              Activité consultations
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: txt.subtle }}>
              {periode === "semaine" ? "7 derniers jours" : `Mois par mois — ${annee}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 p-0.5 rounded-lg border" style={{ background: surface.bg, borderColor: surface.border }}>
              {[{k:"semaine",l:"7j"},{k:"mois",l:"Mois"}].map(({k,l}) => (
                <button key={k} onClick={() => setPeriode(k)}
                  className="px-3 py-1.5 rounded-md text-[12px] font-bold transition-colors"
                  style={periode===k ? {background:brand.DEFAULT,color:"#fff"} : {color:txt.subtle}}>
                  {l}
                </button>
              ))}
            </div>

            {periode === "mois" && (
              <select value={annee} onChange={e => setAnnee(Number(e.target.value))}
                className="text-[13px] px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer"
                style={{ background: surface.card, borderColor: surface.border, color: txt.secondary }}>
                {yearList.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="h-[180px] rounded-xl animate-pulse" style={{ background: surface.bg }} />
        ) : (
          <div style={{ height: 180 }}>
            {periode === "semaine"
              ? <Line data={weekChartData} options={weekChartOptions}/>
              : <Bar data={monthChartData} options={monthChartOptions}/>
            }
          </div>
        )}
      </Card>

      {/* ── Panneau droit ── */}
      <div className="flex flex-col gap-4">

        {/* Totaux mois courant */}
        <Card dark={dark} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[15px] font-bold" style={{ color: txt.primary }}>
              {nomMois} {now.getFullYear()}
            </p>
            <span className="text-[12px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: brand.light, color: brand.dark }}>
              Mois courant
            </span>
          </div>

          {totalMois === null ? (
            <div className="flex flex-col gap-2">
              {[1,2,3,4].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: surface.bg }}/>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { l:"Total",      v: totalMois.toLocaleString("fr-FR"), c: txt.primary },
                { l:"Moy./jour",  v: moyMois?.toLocaleString("fr-FR"),  c: txt.primary },
                { l:"Pic/jour",   v: picMois?.toLocaleString("fr-FR"),  c: brand.DEFAULT },
                { l:"vs mois -1", v: varMois !== null ? `${varMois > 0 ? "+" : ""}${varMois}%` : "—", c: varMois >= 0 ? brand.DEFAULT : "#ef4444" },
              ].map(({ l, v, c }) => (
                <div key={l} className="rounded-xl p-3.5" style={{ background: surface.bg }}>
                  <p className="text-xl font-black" style={{ color: c }}>{v ?? "—"}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: txt.subtle }}>{l}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
