import { useState, useEffect, useRef, useCallback } from "react";
import {
  ResponsiveContainer, LineChart, BarChart,
  Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Cell,
} from "recharts";

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTH_LABELS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

function getLast7Days() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const base = isWeekend ? 420 : 680;
    const noise = Math.round((Math.random() - 0.5) * 200);
    return {
      date: new Date(d),
      dayLabel: DAY_LABELS[dow],
      dayNum: d.getDate(),
      month: MONTH_LABELS[d.getMonth()],
      year: d.getFullYear(),
      count: Math.max(200, base + noise),
      name: `${DAY_LABELS[dow]} ${d.getDate()}`,
    };
  });
}

function getPrevWeekCounts() {
  return Array.from({ length: 7 }, (_, i) => {
    const isWeekend = i === 0 || i === 6;
    const base = isWeekend ? 390 : 640;
    return Math.max(150, base + Math.round((Math.random() - 0.5) * 180));
  });
}

function CustomTooltip({ active, payload, label, displayData }) {
  if (!active || !payload?.length) return null;
  const d = displayData.find(x => x.name === label);
  const dateStr = d
    ? d.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : label;
  return (
    <div style={{ background: "#0f172a", color: "#fff", padding: "10px 14px", borderRadius: 8, fontSize: 12 }}>
      <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{dateStr}</p>
      <p>{Math.round(payload[0].value).toLocaleString("fr-FR")} consultations</p>
    </div>
  );
}

export default function ActivityChart({ darkMode }) {
  const dataRef = useRef(getLast7Days());
  const prevRef = useRef(getPrevWeekCounts());

  const [displayData, setDisplayData] = useState(dataRef.current);
  const [type, setType]               = useState("line");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [dotVisible, setDotVisible]   = useState(true);

  const gridCol = darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
  const textCol = darkMode ? "rgba(255,255,255,0.5)"  : "rgba(0,0,0,0.45)";

  const firstDay = displayData[0];
  const lastDay  = displayData[displayData.length - 1];
  const periodLabel =
    firstDay.month === lastDay.month
      ? `${firstDay.dayNum} – ${lastDay.dayNum} ${lastDay.month} ${lastDay.year}`
      : `${firstDay.dayNum} ${firstDay.month} – ${lastDay.dayNum} ${lastDay.month} ${lastDay.year}`;

  const simulateTick = useCallback(() => {
    const data = [...dataRef.current];
    const todayIdx = data.length - 1;
    const newConsults = Math.round(Math.random() * 40);
    const corrections = Math.round((Math.random() - 0.5) * 8);
    data[todayIdx] = { ...data[todayIdx], count: Math.max(200, data[todayIdx].count + newConsults + corrections) };
    if (Math.random() < 0.2) {
      const pastIdx = Math.floor(Math.random() * (data.length - 1));
      data[pastIdx] = { ...data[pastIdx], count: Math.max(200, data[pastIdx].count + Math.round((Math.random() - 0.5) * 8)) };
    }
    dataRef.current = data;
    setDisplayData(data);
    setLastUpdated(new Date());
    setDotVisible(false);
    setTimeout(() => setDotVisible(true), 300);
  }, []);

  useEffect(() => {
    const id = setInterval(simulateTick, 4000);
    return () => clearInterval(id);
  }, [simulateTick]);

  const total   = displayData.reduce((a, d) => a + d.count, 0);
  const prevTot = prevRef.current.reduce((a, b) => a + b, 0);
  const peak    = displayData.reduce((a, d) => d.count > a.count ? d : a);
  const pct     = prevTot > 0 ? Math.round(((total - prevTot) / prevTot) * 100) : 0;

  const chartData = displayData.map(d => ({ name: d.name, count: d.count }));
  const vals      = displayData.map(d => d.count);
  const minY      = Math.max(0, Math.min(...vals) - 80);

  const cardCls = `rounded-xl p-3 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`;
  const btnCls  = (active) =>
    `text-xs px-3 py-1 rounded-lg border transition-colors ${
      active
        ? "bg-teal-600 text-white border-teal-600"
        : darkMode ? "border-gray-600 text-gray-300" : "border-gray-200 text-gray-600"
    }`;

  return (
    <div className={`rounded-2xl border p-5 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>

      {/* Métriques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {[
          { label: "Total semaine",              value: total.toLocaleString("fr-FR"), color: "text-teal-500" },
          { label: "Moy. / jour",                value: Math.round(total / displayData.length).toLocaleString("fr-FR") },
          { label: `Pic · ${peak.dayLabel} ${peak.dayNum}`, value: peak.count.toLocaleString("fr-FR") },
          { label: "Variation S-1",              value: `${pct > 0 ? "+" : ""}${pct}%`, color: pct >= 0 ? "text-teal-500" : "text-red-500" },
        ].map((m, i) => (
          <div key={i} className={cardCls}>
            <p className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{m.label}</p>
            <p className={`text-lg font-medium ${m.color ?? (darkMode ? "text-white" : "text-gray-900")}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>Activité consultations</p>
          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{periodLabel} · temps réel</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
            darkMode ? "bg-teal-900/30 text-teal-400 border-teal-800" : "bg-teal-50 text-teal-700 border-teal-200"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-teal-500 transition-opacity duration-300 ${dotVisible ? "opacity-100" : "opacity-20"}`} />
            En direct
          </span>
          <button className={btnCls(type === "bar")}  onClick={() => setType("bar")}>Barres</button>
          <button className={btnCls(type === "line")} onClick={() => setType("line")}>Courbe</button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={gridCol} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: textCol, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[minY, "auto"]} tick={{ fill: textCol, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => Math.round(v).toLocaleString("fr-FR")} />
              <Tooltip content={<CustomTooltip displayData={displayData} />} />
              <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2.5} activeDot={{ r: 8 }}
                dot={(props) => {
                  const isLast = props.index === chartData.length - 1;
                  return <circle key={props.index} cx={props.cx} cy={props.cy} r={isLast ? 7 : 5}
                    fill={isLast ? "#14b8a6" : "#0d9488"} stroke="none" />;
                }}>
                <LabelList dataKey="count" position="top"
                  formatter={v => Math.round(v).toLocaleString("fr-FR")}
                  style={{ fill: textCol, fontSize: 11 }} />
              </Line>
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={gridCol} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: textCol, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[minY, "auto"]} tick={{ fill: textCol, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => Math.round(v).toLocaleString("fr-FR")} />
              <Tooltip content={<CustomTooltip displayData={displayData} />} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === chartData.length - 1 ? "#14b8a6" : "#0d9488"} />
                ))}
                <LabelList dataKey="count" position="top"
                  formatter={v => Math.round(v).toLocaleString("fr-FR")}
                  style={{ fill: textCol, fontSize: 11 }} />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Légende + timestamp */}
      <div className={`mt-3 pt-3 border-t flex items-center justify-between ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" />
          <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Consultations / jour</span>
        </div>
        <span className={`text-xs ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
          Mis à jour {lastUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
