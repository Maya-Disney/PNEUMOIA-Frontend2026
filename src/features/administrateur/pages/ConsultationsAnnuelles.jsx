import { useState, useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import { ArrowLeft } from "lucide-react";
import { getConsultationsAnnee } from "../api/adminApi";

const BRAND = "#1e40af";
const BRAND_PALE = "#93c5fd";
const NOW        = new Date();
const CUR_YEAR   = NOW.getFullYear();
const START_YEAR = 2026;

const MOIS_COURT = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
const MOIS_LONG  = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function genMockYear(year) {
  const maxMonth = year === CUR_YEAR ? NOW.getMonth() : 11;
  return Array.from({ length: maxMonth + 1 }, (_, i) => ({
    mois:  MOIS_COURT[i],
    label: MOIS_LONG[i],
    val:   Math.round(4000 + Math.random() * 6000),
  }));
}

function CustomTip({ active, payload, dark, selectedMois }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  const isSelected = d.payload?.mois === selectedMois;
  return (
    <div style={{
      background: dark ? "#161b22" : "#fff",
      border: `1px solid ${isSelected ? BRAND : dark ? "#21262d" : "#e5e7eb"}`,
      borderRadius: 12, padding: "10px 16px",
      boxShadow: "0 8px 24px rgba(0,0,0,.12)",
    }}>
      <p style={{ fontSize: 12, color: dark ? "#8b949e" : "#6b7280", marginBottom: 4 }}>
        {d.payload?.label}
      </p>
      <p style={{ fontSize: 15, fontWeight: 700, color: BRAND }}>
        {d.value?.toLocaleString("fr-FR")} consultations
      </p>
    </div>
  );
}

export default function ConsultationsAnnuelles() {
  const { dark }  = useOutletContext() || {};
  const navigate  = useNavigate();

  const [year, setYear]         = useState(CUR_YEAR);
  const [selectedMois, setMois] = useState(null);   // null = vue annuelle
  const [yearData, setYearData] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    setMois(null);
    getConsultationsAnnee(year)
      .then(res => {
        if (Array.isArray(res) && res.length) {
          setYearData(res.map((v, i) => ({
            mois:  MOIS_COURT[i] || `M${i+1}`,
            label: MOIS_LONG[i]  || `Mois ${i+1}`,
            val:   v,
          })));
        } else {
          setYearData(genMockYear(year));
        }
      })
      .catch(() => setYearData(genMockYear(year)))
      .finally(() => setLoading(false));
  }, [year]);

  // Données filtrées : si un mois est sélectionné → 1 ligne, sinon toutes
  const data = useMemo(() =>
    selectedMois ? yearData.filter(d => d.mois === selectedMois) : yearData,
    [yearData, selectedMois]
  );

  const total  = yearData.reduce((s, d) => s + d.val, 0);
  const moy    = yearData.length ? Math.round(total / yearData.length) : 0;
  const picIdx = yearData.reduce((mi, d, i) => d.val > (yearData[mi]?.val || 0) ? i : mi, 0);
  const pic    = yearData[picIdx];
  const selRow = selectedMois ? yearData.find(d => d.mois === selectedMois) : null;

  const maxVal = yearData.reduce((m, d) => d.val > m ? d.val : m, 0);

  const card    = `rounded-2xl border ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`;
  const ax      = dark ? "#484f58" : "#cbd5e1";
  const selStyle = {
    background:  dark ? "#161b22" : "#fff",
    border:      `1px solid ${dark ? "#21262d" : "#e5e7eb"}`,
    color:       dark ? "#e6edf3" : "#111827",
    borderRadius: 10,
    padding:     "8px 32px 8px 12px",
    fontSize:    13,
    fontWeight:  600,
    outline:     "none",
    cursor:      "pointer",
    appearance:  "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat:   "no-repeat",
    backgroundPosition: "right 10px center",
  };

  // Années disponibles : 2026 → infini (on génère jusqu'à CUR_YEAR + 10)
  const yearOptions = Array.from({ length: (CUR_YEAR + 10) - START_YEAR + 1 }, (_, i) => START_YEAR + i);

  // Mois disponibles selon l'année
  const maxMonth = year === CUR_YEAR ? NOW.getMonth() : 11;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/administrateur/activite")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold border transition-all
              ${dark ? "bg-[#161b22] border-[#21262d] text-[#8b949e] hover:text-white" : "bg-white border-gray-200 text-gray-500 hover:text-gray-800"}`}
          >
            <ArrowLeft size={15} /> Retour
          </button>
          <div>
            <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
              Consultations annuelles
            </h1>
            <p className={`text-[14px] mt-0.5 ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>
              {selectedMois
                ? `${MOIS_LONG[MOIS_COURT.indexOf(selectedMois)]} ${year}`
                : `Vue complète — ${year}`}
            </p>
          </div>
        </div>

        {/* ── Dropdowns Mois + Année ── */}
        <div className="flex items-center gap-2">
          {/* Mois */}
          <select
            value={selectedMois ?? ""}
            onChange={e => setMois(e.target.value || null)}
            style={selStyle}
          >
            <option value="">Tous les mois</option>
            {MOIS_LONG.map((label, idx) => (
              <option
                key={idx}
                value={MOIS_COURT[idx]}
                disabled={idx > maxMonth}
              >
                {label}
              </option>
            ))}
          </select>

          {/* Année */}
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={selStyle}
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(selRow ? [
          { label: "Consultations",  value: selRow.val.toLocaleString("fr-FR"),                                                                                   sub: `${selRow.label} ${year}`,                            color: "text-blue-700" },
          { label: "vs Moyenne",     value: `${moy > 0 ? (selRow.val >= moy ? "+" : "") + Math.round((selRow.val - moy) / moy * 100) : 0}%`,                      sub: `Moy. annuelle : ${moy.toLocaleString("fr-FR")}`,     color: selRow.val >= moy ? "text-blue-700" : "text-red-500" },
          { label: "Mois record",    value: pic?.label || "—",                                                                                                    sub: pic ? `${pic.val.toLocaleString("fr-FR")} consult.` : "—", color: dark ? "text-white" : "text-gray-700" },
          { label: "Total annuel",   value: total.toLocaleString("fr-FR"),                                                                                        sub: `${yearData.length} mois`,                            color: dark ? "text-[#8b949e]" : "text-gray-500" },
        ] : [
          { label: "Total annuel",   value: total.toLocaleString("fr-FR"),  sub: `${yearData.length} mois enregistrés`,                          color: "text-blue-700" },
          { label: "Moyenne / mois", value: moy.toLocaleString("fr-FR"),    sub: "Consultations moyennes",                                       color: dark ? "text-white" : "text-gray-900" },
          { label: "Mois record",    value: pic?.label || "—",              sub: pic ? `${pic.val.toLocaleString("fr-FR")} consultations` : "—", color: "text-blue-700" },
          { label: "Année",          value: String(year),                   sub: "Période affichée",                                             color: dark ? "text-[#8b949e]" : "text-gray-500" },
        ]).map(({ label, value, sub, color }) => (
          <div key={label} className={`${card} px-5 py-4`}>
            <p className={`text-[12px] font-semibold mb-1.5 uppercase tracking-wide ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{label}</p>
            <p className={`text-2xl font-black truncate ${color}`}>{value}</p>
            <p className={`text-[12px] mt-1 font-medium ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Courbe ── */}
      <div className={`${card} p-6`}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <p className={`text-[15px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>
              {selectedMois
                ? `${MOIS_LONG[MOIS_COURT.indexOf(selectedMois)]} ${year}`
                : `Évolution mensuelle — ${year}`}
            </p>
            <p className={`text-[12px] mt-0.5 ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>
              {selectedMois
                ? "Mois sélectionné — position dans l'année"
                : `Ligne pointillée = moyenne mensuelle (${moy.toLocaleString("fr-FR")})`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 20, height: 3, borderRadius: 99, background: BRAND }} />
            <span className={`text-[12px] font-medium ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>Consultations</span>
          </div>
        </div>

        {loading ? (
          <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p className={`text-[14px] ${dark ? "text-[#484f58]" : "text-gray-300"}`}>Chargement…</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={yearData} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradConsult" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={BRAND} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={dark ? "#1e2836" : "#f8fafc"} />
              <XAxis dataKey="mois" tick={{ fontSize: 12, fill: ax }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: ax }} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                content={<CustomTip dark={dark} selectedMois={selectedMois} />}
                cursor={{ stroke: dark ? "#21262d" : "#e5e7eb", strokeWidth: 2 }}
              />
              {!selectedMois && (
                <ReferenceLine y={moy} stroke={BRAND} strokeDasharray="6 4" strokeOpacity={0.4} strokeWidth={1.5} />
              )}
              {selectedMois && (
                <ReferenceLine x={selectedMois} stroke={BRAND} strokeWidth={2} strokeOpacity={0.6} />
              )}
              <Area
                type="monotone"
                dataKey="val"
                stroke={BRAND}
                strokeWidth={2.5}
                fill="url(#gradConsult)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const isActive = payload.mois === selectedMois;
                  return (
                    <circle
                      key={payload.mois}
                      cx={cx} cy={cy}
                      r={isActive ? 7 : 4}
                      fill={isActive ? BRAND : dark ? "#161b22" : "#fff"}
                      stroke={BRAND}
                      strokeWidth={isActive ? 0 : 2}
                    />
                  );
                }}
                activeDot={{ r: 6, fill: BRAND, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Tableau ── */}
      <div className={`${card} overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${dark ? "border-[#21262d]" : "border-gray-100"} flex items-center justify-between`}>
          <p className={`text-[15px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>
            {selectedMois ? `Détail — ${MOIS_LONG[MOIS_COURT.indexOf(selectedMois)]} ${year}` : `Détail par mois — ${year}`}
          </p>
          {selectedMois && (
            <button
              onClick={() => setMois(null)}
              className={`text-[12px] font-semibold px-3 py-1 rounded-lg border transition-all
                ${dark ? "border-[#21262d] text-[#8b949e] hover:text-white" : "border-gray-200 text-gray-400 hover:text-gray-700"}`}
            >
              Voir tous les mois
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "30%" }} />
            </colgroup>
            <thead>
              <tr className={`border-b ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
                {["Mois", "Consultations", "Part annuelle", "vs Moyenne", "Progression"].map(h => (
                  <th key={h} className={`px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide ${dark ? "text-[#484f58]" : "text-gray-400"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(selectedMois ? yearData.filter(d => d.mois === selectedMois) : yearData).map((row, i) => {
                const part  = total > 0 ? (row.val / total * 100).toFixed(1) : "0.0";
                const diff  = moy > 0 ? Math.round((row.val - moy) / moy * 100) : 0;
                const isPic = row.mois === pic?.mois;
                const barW  = maxVal > 0 ? (row.val / maxVal) * 100 : 0;
                const isSel = row.mois === selectedMois;
                return (
                  <tr
                    key={i}
                    onClick={() => setMois(row.mois === selectedMois ? null : row.mois)}
                    className={`border-b last:border-0 cursor-pointer transition-colors
                      ${isSel
                        ? dark ? "bg-[#0d2926]" : "bg-blue-50/60"
                        : dark ? "border-[#21262d] hover:bg-[#0d1117]/40" : "border-gray-50 hover:bg-gray-50/50"}`}
                  >
                    <td className={`px-6 py-3.5 text-[14px] font-bold ${isPic ? "" : dark ? "text-white" : "text-gray-800"}`}
                        style={isPic ? { color: BRAND } : {}}>
                      {row.label}
                      {isSel && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: BRAND, color: "#fff" }}>sélectionné</span>}
                    </td>
                    <td className={`px-6 py-3.5 text-[14px] font-bold tabular-nums ${isPic || isSel ? "" : dark ? "text-[#8b949e]" : "text-gray-600"}`}
                        style={isPic || isSel ? { color: BRAND } : {}}>
                      {row.val.toLocaleString("fr-FR")}
                    </td>
                    <td className={`px-6 py-3.5 text-[13px] tabular-nums ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>
                      {part}%
                    </td>
                    <td className={`px-6 py-3.5 text-[13px] font-bold tabular-nums ${diff >= 0 ? "text-blue-700" : "text-red-500"}`}>
                      {diff >= 0 ? "+" : ""}{diff}%
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`h-[6px] rounded-full flex-1 overflow-hidden ${dark ? "bg-[#21262d]" : "bg-gray-100"}`}>
                          <div style={{
                            width: `${barW}%`,
                            height: "100%",
                            borderRadius: 99,
                            background: isPic || isSel ? BRAND : BRAND_PALE,
                            transition: "width .5s ease",
                          }} />
                        </div>
                        <span className={`text-[11px] font-semibold w-8 text-right tabular-nums ${dark ? "text-[#484f58]" : "text-gray-400"}`}>
                          {Math.round(barW)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
