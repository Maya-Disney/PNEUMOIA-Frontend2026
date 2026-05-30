import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

const pad = (n) => String(n).padStart(2, "0");
const MOIS = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];

function genData() {
  const now = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now.getTime() - (29 - i) * 24 * 3600 * 1000);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const base = isWeekend ? 320 : 580;
    const val = Math.round(base + (Math.random() - 0.5) * 200);
    return {
      date: `${pad(d.getDate())} ${MOIS[d.getMonth()]}`,
      val: Math.max(100, val),
      isToday: i === 29,
    };
  });
}

const DATA = genData();
const total     = DATA.reduce((s, d) => s + d.val, 0);
const moyenne   = Math.round(total / DATA.length);
const pic       = DATA.reduce((m, d) => d.val > m.val ? d : m, DATA[0]);
const variation = Math.round(((DATA.slice(15).reduce((s,d)=>s+d.val,0)/15) - (DATA.slice(0,15).reduce((s,d)=>s+d.val,0)/15)) / (DATA.slice(0,15).reduce((s,d)=>s+d.val,0)/15) * 100);

function CustomTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2 rounded-lg border text-[11px] shadow-md ${dark ? "bg-[#161b22] border-[#21262d] text-[#e6edf3]" : "bg-white border-gray-200 text-gray-800"}`}>
      <p className="font-bold mb-0.5">{label}</p>
      <p className={dark ? "text-[#22c55e]" : "text-green-600"}>{payload[0].value.toLocaleString("fr-FR")} consultations</p>
    </div>
  );
}

export default function CourbeActivite() {
  const { dark } = useOutletContext();
  const [zoom, setZoom] = useState("30j");

  const displayed = zoom === "7j" ? DATA.slice(-7) : zoom === "14j" ? DATA.slice(-14) : DATA;

  const axisColor = dark ? "#484f58" : "#9ca3af";
  const gridColor = dark ? "#21262d" : "#f3f4f6";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">Courbe d'activité</h1>
        <p className="text-[12px] mt-1 text-gray-400 dark:text-[#484f58]">Consultations enregistrées par jour sur les 30 derniers jours</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total 30 jours",    val: total.toLocaleString("fr-FR"),      color: "text-gray-800 dark:text-[#e6edf3]" },
          { label: "Moyenne / jour",    val: moyenne.toLocaleString("fr-FR"),     color: "text-gray-800 dark:text-[#e6edf3]" },
          { label: `Pic — ${pic.date}`, val: pic.val.toLocaleString("fr-FR"),     color: "text-green-600 dark:text-[#22c55e]" },
          { label: "Variation 15j",     val: `${variation > 0 ? "+" : ""}${variation}%`, color: variation >= 0 ? "text-green-600 dark:text-[#22c55e]" : "text-red-500" },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl px-4 py-3">
            <p className={`text-xl font-black ${color}`}>{val}</p>
            <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Graphique principal */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Consultations par jour</p>
            <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">Ligne de référence = moyenne journalière</p>
          </div>
          <div className="flex gap-1">
            {["7j","14j","30j"].map(z => (
              <button key={z} onClick={() => setZoom(z)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  zoom === z
                    ? "bg-green-600 dark:bg-green-700 border-green-600 text-white"
                    : "border-gray-200 dark:border-[#21262d] text-gray-400 dark:text-[#484f58] hover:text-gray-700 dark:hover:text-[#e6edf3]"
                }`}>{z}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={displayed} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: axisColor }} axisLine={false} tickLine={false}
              interval={zoom === "30j" ? 4 : zoom === "14j" ? 1 : 0} />
            <YAxis tick={{ fontSize: 9, fill: axisColor }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<CustomTooltip dark={dark} />} cursor={{ stroke: gridColor, strokeWidth: 1 }} />
            <ReferenceLine y={moyenne} stroke={dark ? "#484f58" : "#d1d5db"} strokeDasharray="4 3" />
            <Line type="monotone" dataKey="val" stroke="#16a34a" strokeWidth={2}
              dot={(props) => {
                if (!props.payload.isToday) return <circle key={props.key} cx={props.cx} cy={props.cy} r={0} />;
                return <circle key={props.key} cx={props.cx} cy={props.cy} r={4} fill="#16a34a" stroke="#fff" strokeWidth={2} />;
              }}
              activeDot={{ r: 5, fill: "#16a34a", stroke: "#fff", strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 dark:border-[#21262d]">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-green-600 dark:bg-[#22c55e]" />
            <span className="text-[9px] text-gray-400 dark:text-[#484f58]">Consultations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 border-t border-dashed border-gray-400 dark:border-[#484f58]" />
            <span className="text-[9px] text-gray-400 dark:text-[#484f58]">Moyenne ({moyenne}/jour)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-600 dark:bg-[#22c55e] border-2 border-white dark:border-[#161b22]" />
            <span className="text-[9px] text-gray-400 dark:text-[#484f58]">Aujourd'hui</span>
          </div>
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-[#21262d]">
          <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Détail jour par jour</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Date","Consultations","vs moyenne","Barre"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider border-b border-gray-100 dark:border-[#21262d] bg-gray-50 dark:bg-[#161b22] text-gray-400 dark:text-[#484f58]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...DATA].reverse().slice(0, 10).map((d, i) => {
                const diff = d.val - moyenne;
                const pct  = Math.round((d.val / pic.val) * 100);
                return (
                  <tr key={i} className="hover:bg-gray-50/80 dark:hover:bg-[#0d1117]/60 transition-colors">
                    <td className="px-4 py-2.5 border-b border-gray-50 dark:border-[#21262d]">
                      <span className={`text-[11px] font-semibold ${d.isToday ? "text-green-600 dark:text-[#22c55e]" : "text-gray-700 dark:text-[#8b949e]"}`}>
                        {d.date}{d.isToday ? " — Aujourd'hui" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 border-b border-gray-50 dark:border-[#21262d] text-[12px] font-black text-gray-800 dark:text-[#e6edf3]">
                      {d.val.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-2.5 border-b border-gray-50 dark:border-[#21262d]">
                      <span className={`text-[10px] font-bold ${diff >= 0 ? "text-green-600 dark:text-[#22c55e]" : "text-red-500"}`}>
                        {diff >= 0 ? "+" : ""}{diff.toLocaleString("fr-FR")}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 border-b border-gray-50 dark:border-[#21262d]">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden w-28">
                          <div className="h-full rounded-full bg-green-500 dark:bg-[#22c55e]" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] text-gray-400 dark:text-[#484f58]">{pct}%</span>
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