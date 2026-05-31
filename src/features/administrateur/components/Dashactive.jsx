import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Card from "./Card";
import CardHeader from "./CardHeader";
import ChartTooltip from "./ChartTooltip";

const BRAND = "#0f766e";

const WEEK = [
  { j: "Lun", c: 420 }, { j: "Mar", c: 510 }, { j: "Mer", c: 480 },
  { j: "Jeu", c: 590 }, { j: "Ven", c: 735 }, { j: "Sam", c: 620 },
  { j: "Dim", c: 680 },
];

const MONTHS = [
  { m: "Jan", v: 2 }, { m: "Fév", v: 4 }, { m: "Mar", v: 3 },
  { m: "Avr", v: 6 }, { m: "Mai", v: 8 }, { m: "Juin", v: 5 },
];

export default function DashActivite({ dark }) {
  const ax = dark ? "#484f58" : "#9ca3af";
  const gr = dark ? "#21262d" : "#f3f4f6";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">

      {/* Courbe consultations */}
      <Card dark={dark} className="p-5">
        <CardHeader dark={dark} title="Activité consultations" sub="7 derniers jours · temps réel" />
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={WEEK}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BRAND} stopOpacity={0.2} />
                <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={gr} />
            <XAxis dataKey="j" tick={{ fontSize: 10, fill: ax }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: ax }} axisLine={false} tickLine={false} width={32} />
            <Tooltip content={<ChartTooltip dark={dark} />} />
            <Area type="monotone" dataKey="c" name="Consultations" stroke={BRAND} strokeWidth={2.5} fill="url(#g1)" dot={false} activeDot={{ r: 5, fill: BRAND }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Résumé + inscriptions */}
      <div className="flex flex-col gap-3">
        <Card dark={dark} className="p-5">
          <CardHeader dark={dark} title="Résumé semaine" />
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: "Total",    v: "4 254", c: dark ? "text-white" : "text-gray-900" },
              { l: "Moy./j",  v: "608",   c: dark ? "text-white" : "text-gray-900" },
              { l: "Pic",     v: "735",   c: "text-teal-600 dark:text-teal-400" },
              { l: "Variation",v: "+7%",  c: "text-teal-600 dark:text-teal-400" },
            ].map(({ l, v, c }) => (
              <div key={l} className={`rounded-xl p-3 ${dark ? "bg-[#0d1117]" : "bg-gray-50"}`}>
                <p className={`text-xl font-black ${c}`}>{v}</p>
                <p className={`text-[10px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{l}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card dark={dark} className="p-5">
          <CardHeader dark={dark} title="Inscriptions validées" sub="Par mois · 2026" />
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={MONTHS} barSize={16}>
              <CartesianGrid vertical={false} stroke={gr} />
              <XAxis dataKey="m" tick={{ fontSize: 9, fill: ax }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: ax }} axisLine={false} tickLine={false} width={18} />
              <Tooltip content={<ChartTooltip dark={dark} />} cursor={{ fill: dark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)" }} />
              <Bar dataKey="v" name="Validations" fill={BRAND} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}