import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Card from "./Card";
import CardHeader from "./CardHeader";
import ChartTooltip from "./ChartTooltip";

const BRAND = "#0f766e";

const MOIS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MOIS_COURT = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];

// ── Données de fallback (mock) utilisées tant que l'API n'est pas connectée ──
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

// ── Helpers ────────────────────────────────────────────────────────────────────
function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function endOfToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashActivite({ dark }) {
  const now       = new Date();
  const yearList  = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  const [periode,   setPeriode]   = useState("semaine"); // "semaine" | "mois"
  const [annee,     setAnnee]     = useState(now.getFullYear());
  const [loading,   setLoading]   = useState(false);

  // Données graphiques
  const [weekData,   setWeekData]   = useState(genMockWeek());
  const [monthData,  setMonthData]  = useState(genMockMonths(now.getFullYear()));

  // Totaux mois courant
  const [totalMois,   setTotalMois]   = useState(null);
  const [moyMois,     setMoyMois]     = useState(null);
  const [picMois,     setPicMois]     = useState(null);
  const [varMois,     setVarMois]     = useState(null);

  // ── Chargement données semaine ──────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    // ── Décommenter quand le backend est prêt ──
    // fetch("/api/admin/stats/consultations/semaine")
    //   .then(r => r.json())
    //   .then(data => setWeekData(data.jours))   // [{ j:"Lun", c:420 }, ...]
    //   .catch(() => setWeekData(genMockWeek()))
    //   .finally(() => setLoading(false));

    // Mode mock
    setTimeout(() => { setWeekData(genMockWeek()); setLoading(false); }, 600);
  }, []);

  // ── Chargement données mois par année ───────────────────────────────────────
  useEffect(() => {
    // ── Décommenter quand le backend est prêt ──
    // fetch(`/api/admin/stats/consultations/annee?year=${annee}`)
    //   .then(r => r.json())
    //   .then(data => setMonthData(data.mois))   // [{ m:"Jan", v:5 }, ...]
    //   .catch(() => setMonthData(genMockMonths(annee)));

    setMonthData(genMockMonths(annee));
  }, [annee]);

  // ── Chargement totaux mois courant ──────────────────────────────────────────
  useEffect(() => {
    const debut = startOfMonth();
    const fin   = endOfToday();

    // ── Décommenter quand le backend est prêt ──
    // fetch(`/api/admin/stats/consultations/total?from=${debut}&to=${fin}`)
    //   .then(r => r.json())
    //   .then(data => {
    //     setTotalMois(data.total);
    //     setMoyMois(data.moyenne_par_jour);
    //     setPicMois(data.pic);
    //     setVarMois(data.variation_vs_mois_precedent);
    //   })
    //   .catch(() => {
    //     setTotalMois(null);
    //   });

    // Mode mock — simule les données du mois courant
    const mockTotal = Math.round(3800 + Math.random() * 1200);
    const jours     = now.getDate();
    setTotalMois(mockTotal);
    setMoyMois(Math.round(mockTotal / jours));
    setPicMois(Math.round(mockTotal / jours * 1.4));
    setVarMois(Math.round((Math.random() * 20) - 5));
  }, []);

  const ax = dark ? "#484f58" : "#9ca3af";
  const gr = dark ? "#21262d" : "#f3f4f6";

  const nomMois = MOIS_FR[now.getMonth()];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">

      {/* ── Graphique principal ── */}
      <Card dark={dark} className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-[13px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>
              Activité consultations
            </p>
            <p className={`text-[11px] mt-0.5 ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>
              {periode === "semaine" ? "7 derniers jours" : `Mois par mois — ${annee}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle semaine / mois */}
            <div className="flex gap-0.5 p-0.5 rounded-lg bg-gray-100 dark:bg-[#0d1117] border border-gray-200 dark:border-[#21262d]">
              {[{k:"semaine",l:"7j"},{k:"mois",l:"Mois"}].map(({k,l}) => (
                <button key={k} onClick={() => setPeriode(k)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors"
                  style={periode===k ? {background:BRAND,color:"#fff"} : {color:dark?"#484f58":"#9ca3af"}}>
                  {l}
                </button>
              ))}
            </div>

            {/* Sélecteur année — visible uniquement en mode "mois" */}
            {periode === "mois" && (
              <select value={annee} onChange={e => setAnnee(Number(e.target.value))}
                className={`text-[11px] px-2 py-1 rounded-lg border outline-none cursor-pointer ${dark ? "bg-[#0d1117] border-[#21262d] text-white" : "bg-white border-gray-200 text-gray-700"}`}>
                {yearList.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className={`h-[180px] rounded-xl animate-pulse ${dark ? "bg-[#0d1117]" : "bg-gray-100"}`} />
        ) : periode === "semaine" ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={BRAND} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={gr} />
              <XAxis dataKey="j" tick={{ fontSize:10, fill:ax }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:ax }} axisLine={false} tickLine={false} width={32} />
              <Tooltip content={<ChartTooltip dark={dark} />} />
              <Area type="monotone" dataKey="c" name="Consultations" stroke={BRAND} strokeWidth={2.5} fill="url(#g1)" dot={false} activeDot={{ r:5, fill:BRAND }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthData} barSize={22}>
              <CartesianGrid vertical={false} stroke={gr} />
              <XAxis dataKey="m" tick={{ fontSize:10, fill:ax }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:ax }} axisLine={false} tickLine={false} width={20} />
              <Tooltip content={<ChartTooltip dark={dark} />} cursor={{ fill: dark?"rgba(255,255,255,.02)":"rgba(0,0,0,.02)" }} />
              <Bar dataKey="v" name="Validations" fill={BRAND} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── Panneau droit ── */}
      <div className="flex flex-col gap-3">

        {/* Totaux mois courant */}
        <Card dark={dark} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className={`text-[13px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>
              {nomMois} {now.getFullYear()}
            </p>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${dark ? "bg-teal-900/20 text-teal-400" : "bg-teal-50 text-teal-700"}`}>
              Mois courant
            </span>
          </div>

          {totalMois === null ? (
            <div className="flex flex-col gap-2">
              {[1,2,3,4].map(i => <div key={i} className={`h-10 rounded-xl animate-pulse ${dark?"bg-[#0d1117]":"bg-gray-100"}`}/>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {[
                { l:"Total",     v: totalMois.toLocaleString("fr-FR"), c: dark?"text-white":"text-gray-900" },
                { l:"Moy./jour", v: moyMois?.toLocaleString("fr-FR"),  c: dark?"text-white":"text-gray-900" },
                { l:"Pic/jour",  v: picMois?.toLocaleString("fr-FR"),  c: "text-teal-600 dark:text-teal-400" },
                { l:"vs mois -1",v: varMois !== null ? `${varMois > 0 ? "+" : ""}${varMois}%` : "—", c: varMois >= 0 ? "text-teal-600 dark:text-teal-400" : "text-red-500" },
              ].map(({ l, v, c }) => (
                <div key={l} className={`rounded-xl p-3 ${dark ? "bg-[#0d1117]" : "bg-gray-50"}`}>
                  <p className={`text-xl font-black ${c}`}>{v ?? "—"}</p>
                  <p className={`text-[10px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{l}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Inscriptions validées */}
        <Card dark={dark} className="p-5">
          <CardHeader dark={dark} title="Inscriptions validées" sub={`Par mois · ${annee}`} />
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={monthData} barSize={16}>
              <CartesianGrid vertical={false} stroke={gr} />
              <XAxis dataKey="m" tick={{ fontSize:9, fill:ax }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:9, fill:ax }} axisLine={false} tickLine={false} width={18} />
              <Tooltip content={<ChartTooltip dark={dark} />} cursor={{ fill: dark?"rgba(255,255,255,.02)":"rgba(0,0,0,.02)" }} />
              <Bar dataKey="v" name="Validations" fill={BRAND} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}